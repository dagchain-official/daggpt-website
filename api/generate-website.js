/**
 * Vercel Serverless Function - Claude Website Generation
 * This proxies requests to Claude API to avoid CORS issues
 */

export const config = {
  maxDuration: 60, // 60 seconds for complete website generation
};

export default async function handler(req, res) {
  // Enable CORS and streaming
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Website generation request received (streaming mode)');

  try {
    const { prompt, mode, url, systemPrompt: customSystemPrompt, conversationHistory, messages } = req.body;
    console.log('Mode:', mode, 'Prompt length:', prompt?.length, 'URL:', url);
    const apiKey = process.env.REACT_APP_CLAUDE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Claude API key not configured' });
    }

    const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
    const CLAUDE_MODEL = 'claude-sonnet-4-20250514'; // Claude Sonnet 4.5 - Latest model

    let systemPrompt, userPrompt;

    if (mode === 'webapp-builder') {
      // Web App Builder mode - Bolt.new style
      console.log('Web App Builder mode: Streaming artifact generation');
      
      systemPrompt = `You are Bolt, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.

<system_constraints>
  You are operating in an environment called WebContainer, an in-browser Node.js runtime that emulates a Linux system to some degree. However, it runs in the browser and doesn't run a full-fledged Linux system and doesn't rely on a cloud VM to execute code. All code is executed in the browser.

  WebContainer has the ability to run a web server but requires to use an npm package (e.g., Vite, servor, serve, http-server) or use the Node.js APIs to implement a web server.

  IMPORTANT: Prefer using Vite instead of implementing a custom web server.
  IMPORTANT: Git is NOT available.
  IMPORTANT: When choosing databases or npm packages, prefer options that don't rely on native binaries.
</system_constraints>

<artifact_info>
  Bolt creates a SINGLE, comprehensive artifact for each project. The artifact contains all necessary steps and components.

  Wrap the content in opening and closing \`<boltArtifact>\` tags with \`<boltAction>\` elements inside.

  For each \`<boltAction>\`, add a type attribute:
    - shell: For running shell commands
    - file: For writing files (add filePath attribute)

  Example:
  <boltArtifact id="todo-app" title="Todo App">
    <boltAction type="file" filePath="package.json">
    {
      "name": "todo-app",
      "scripts": { "dev": "vite" },
      "dependencies": { "react": "^18.2.0", "react-dom": "^18.2.0" },
      "devDependencies": { "vite": "^4.0.0", "@vitejs/plugin-react": "^3.0.0" }
    }
    </boltAction>
    <boltAction type="shell">
    npm install && npm run dev
    </boltAction>
  </boltArtifact>

  CRITICAL: Always provide FULL file contents. NO placeholders or "rest of code" comments.
</artifact_info>

ULTRA IMPORTANT: Think first and reply with the artifact that contains all necessary steps to set up the project.`;

      // Use messages array if provided, otherwise create from prompt
      const claudeMessages = messages || [{ role: 'user', content: prompt }];
      
      const claudeResponse = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 16000,
          temperature: 0.7,
          stream: true,
          system: systemPrompt,
          messages: claudeMessages
        })
      });

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error('Claude API error:', errorText);
        res.write(`data: ${JSON.stringify({ error: `Claude API error: ${claudeResponse.status}` })}\n\n`);
        res.end();
        return;
      }

      // Stream the response
      const reader = claudeResponse.body;
      let buffer = '';

      for await (const chunk of reader) {
        buffer += new TextDecoder().decode(chunk);
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                res.write(`data: ${JSON.stringify({ chunk: parsed.delta.text })}\n\n`);
              } else if (parsed.type === 'message_stop') {
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                res.end();
                return;
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
      
    } else if (mode === 'bolt-builder') {
      // Bolt.new builder mode - use custom system prompt
      console.log('Bolt builder mode: Generating multi-file project');
      systemPrompt = customSystemPrompt || `You are an expert full-stack web developer assistant.`;
      userPrompt = prompt;
      
    } else if (mode === 'section') {
      // Section-by-section generation mode
      console.log('Section mode: Generating individual section');
      
      systemPrompt = `You are an expert web developer. Generate beautiful, professional HTML sections using Tailwind CSS.

RULES:
- Use Tailwind CSS for ALL styling
- Use real Unsplash images: https://images.unsplash.com/photo-[id]?w=800
- Modern design with gradients, shadows, hover effects
- Fully responsive
- Real, compelling content (NO Lorem Ipsum)
- Follow the exact instructions provided

Return ONLY the HTML code requested. Make it stunning!`;

      userPrompt = prompt;
      
    } else if (mode === 'clone') {
      console.log('Clone mode: Creating website inspired by', url);

      systemPrompt = `You are an expert full-stack web developer specializing in creating stunning, production-ready websites. Create a beautiful, modern website inspired by ${url}.

CRITICAL REQUIREMENTS:
1. **Visual Excellence:** Use Unsplash images (https://source.unsplash.com/1600x900/?[keyword]), stunning gradients, shadows, smooth animations (fade-in, slide-up, parallax), modern color palettes, icons from Lucide/Heroicons (CDN)

2. **Complete Sections:** Hero (full-screen with parallax), Features (6 cards with icons), About (2-column with image), Services (grid layout), Gallery (8+ images with lightbox), Testimonials (3 reviews with photos), Contact (working form), Footer (comprehensive)

3. **Interactivity:** Alpine.js for dropdowns, modals, tabs, accordions, image galleries. AOS library for scroll animations. Smooth scrolling navigation.

4. **Design:** Modern UI/UX, effective whitespace, micro-interactions, transitions, fully responsive (mobile-first), accessible (ARIA, semantic HTML)

5. **Production Quality:** SEO meta tags, Open Graph tags, performance optimized, smooth scrolling, lazy loading

Return ONLY the complete HTML code with all CDN links included. Make it absolutely stunning!`;

      userPrompt = `Create a production-level website inspired by ${url}. Make it visually stunning with beautiful images, smooth animations, and modern design. Include all necessary sections and make it look like a professional agency built it.`;
      
    } else {
      // Create new website - Lovable/Bolt quality
      systemPrompt = `You are an elite full-stack developer and UI/UX designer who creates world-class, production-ready websites. Your websites rival those built by top agencies like Vercel, Stripe, and Linear.

🎨 DESIGN PHILOSOPHY:
- Modern, clean, minimalist aesthetic with bold typography
- Sophisticated color palettes (gradients, complementary colors)
- Generous whitespace and perfect spacing
- Micro-interactions and delightful animations
- Glass-morphism, neumorphism, or modern flat design
- Professional photography from Unsplash (real, high-quality images)

🏗️ TECHNICAL EXCELLENCE:
- Tailwind CSS 3.4+ (CDN) for ALL styling - NO custom CSS
- Alpine.js 3.x for interactivity (dropdowns, modals, tabs, carousels)
- AOS (Animate On Scroll) for scroll animations
- Lucide Icons or Heroicons for beautiful icons
- Fully responsive (mobile-first approach)
- Semantic HTML5 with proper ARIA labels
- SEO optimized with meta tags

📐 REQUIRED SECTIONS (ALL MANDATORY):
1. **Hero Section**: Full-screen with stunning background (gradient or image), bold headline, subheadline, 2 CTA buttons, scroll indicator
2. **Features/Benefits**: 6-8 feature cards with icons, hover effects, and compelling copy
3. **About/Story**: 2-column layout with image, storytelling copy, stats/metrics
4. **Services/Products**: Grid layout (3-4 items) with images, descriptions, pricing if applicable
5. **Testimonials**: 3+ customer reviews with photos, names, companies, star ratings
6. **Gallery/Portfolio**: Masonry or grid layout with 8+ images, lightbox functionality
7. **Pricing** (if applicable): 3 pricing tiers with feature comparison
8. **FAQ**: Accordion-style with 6+ questions
9. **Contact/CTA**: Working form (name, email, message), contact info, map embed option
10. **Footer**: Multi-column with links, social media, newsletter signup, copyright

✨ INTERACTIVITY & ANIMATIONS:
- Smooth scroll navigation with active state
- Fade-in, slide-up, scale animations on scroll (AOS)
- Hover effects on all interactive elements
- Mobile hamburger menu with smooth transitions
- Modal/lightbox for images
- Form validation with visual feedback
- Loading states and success messages
- Parallax effects where appropriate

🎯 CONTENT QUALITY:
- NO Lorem Ipsum - write real, compelling, persuasive copy
- Professional tone matching the business type
- Clear value propositions and CTAs
- Real company names, testimonials, and data
- Engaging headlines and subheadlines

🔧 CODE QUALITY:
- Clean, well-structured HTML
- Proper indentation and formatting
- Comments for major sections
- All CDN links included in <head>
- Optimized for performance
- Cross-browser compatible

📱 RESPONSIVE DESIGN:
- Mobile: Single column, stacked layout, hamburger menu
- Tablet: 2-column grids, adjusted spacing
- Desktop: Full multi-column layouts, larger typography

Return ONLY the complete HTML code from <!DOCTYPE html> to </html>. Make it absolutely stunning - something that would make designers jealous!`;

      userPrompt = `${prompt}

Create a world-class, production-ready website that looks like it was built by a top agency. Use beautiful images from Unsplash, smooth animations, and modern design patterns. Make every section visually stunning with proper spacing, typography, and color harmony. Include all required sections and make it fully functional with Alpine.js interactivity.`;
    }

    console.log('Calling Claude API with streaming...');

    // Call Claude API with streaming enabled
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55 second timeout (leave 5s buffer)

    try {
      const claudeResponse = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: mode === 'section' ? 4096 : 8192, // 8K tokens for full websites (Lovable quality)
          temperature: 0.7,
          stream: true, // Enable streaming
          system: systemPrompt,
          messages: mode === 'bolt-builder' && conversationHistory 
            ? [...conversationHistory, { role: 'user', content: userPrompt }]
            : [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      console.log('Claude API streaming response status:', claudeResponse.status);

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error('Claude API error:', errorText);
        res.write(`data: ${JSON.stringify({ error: `Claude API error: ${claudeResponse.status}` })}\n\n`);
        res.end();
        return;
      }

      // Stream the response
      let fullHtml = '';
      const reader = claudeResponse.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              
              // Log all event types for debugging
              console.log('Event type:', parsed.type, 'Stop reason:', parsed.delta?.stop_reason);
              
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                fullHtml += parsed.delta.text;
                // Send progress update
                res.write(`data: ${JSON.stringify({ 
                  type: 'progress', 
                  content: parsed.delta.text,
                  length: fullHtml.length 
                })}\n\n`);
              } else if (parsed.type === 'message_delta' && parsed.delta?.stop_reason) {
                console.log('Claude stopped with reason:', parsed.delta.stop_reason);
                if (parsed.delta.stop_reason === 'max_tokens') {
                  console.warn('WARNING: Hit max_tokens limit! Increase max_tokens.');
                }
              }
            } catch (e) {
              // Skip invalid JSON
              console.log('JSON parse error:', e.message);
            }
          }
        }
      }

      // Clean up markdown code blocks
      if (fullHtml.startsWith('```html')) {
        fullHtml = fullHtml.replace(/^```html\n/, '').replace(/\n```$/, '');
      } else if (fullHtml.startsWith('```')) {
        fullHtml = fullHtml.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      console.log('Streaming complete, total length:', fullHtml.length);
      
      // Send final result
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        success: true,
        html: fullHtml,
        model: CLAUDE_MODEL
      })}\n\n`);
      res.end();

    } catch (fetchError) {
      clearTimeout(timeout);
      console.error('Streaming error:', fetchError);
      if (fetchError.name === 'AbortError') {
        res.write(`data: ${JSON.stringify({ error: 'Request timeout - please try a simpler prompt' })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ error: fetchError.message })}\n\n`);
      }
      res.end();
    }

  } catch (error) {
    console.error('Website generation error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}

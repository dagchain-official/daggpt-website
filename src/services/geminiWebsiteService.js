// Google AI Studio (Gemini) Website Generation Service

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export const generateWebsiteWithGemini = async (prompt, websiteType, colorScheme) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Google AI Studio API Key is not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file');
  }

  const systemPrompt = `You are an expert full-stack web developer and UI/UX designer specializing in creating stunning, production-ready websites with exceptional visual design.

CRITICAL REQUIREMENTS:
1. Generate a COMPLETE, FULLY FUNCTIONAL single HTML file
2. Include ALL sections with rich, detailed content
3. Use Tailwind CSS CDN for styling
4. Create visually stunning, modern designs with:
   - Beautiful gradients and color transitions
   - Smooth animations and micro-interactions
   - Professional typography and spacing
   - Eye-catching hero sections
   - Engaging visual elements
5. Make it fully responsive (mobile, tablet, desktop)
6. Include interactive elements (hover effects, smooth scrolling)
7. Use modern design patterns (glassmorphism, neumorphism, gradients)
8. Ensure proper semantic HTML5 structure
9. Add meta tags for SEO
10. Include Font Awesome or Lucide icons

Website Type: ${websiteType}
Color Scheme: ${colorScheme}

CONTENT REQUIREMENTS:
- For Portfolio: Hero with animated background, About with photo, Projects grid (4-6 projects with images), Skills with progress bars, Experience timeline with animations, Contact form with validation, Footer
- For Landing Page: Hero with CTA, Features (4-6 cards), Benefits section, Testimonials carousel, Pricing tables (3 tiers), FAQ accordion, Final CTA, Footer
- For Blog: Header with search, Featured post hero, Blog grid (6-9 posts with images), Categories sidebar, Newsletter signup, Footer
- For E-Commerce: Header with cart, Hero banner, Product grid (8-12 products with images), Categories filter, Featured products carousel, Footer
- For Dashboard: Sidebar navigation, Top nav with user menu, Stats cards with icons, Charts (use Chart.js CDN), Data tables, User profile section
- For SaaS: Hero with demo video, Features with icons, How it works (3-4 steps), Pricing comparison, Testimonials, FAQ, CTA, Footer

DESIGN REQUIREMENTS:
- Use ${colorScheme} color scheme with beautiful gradients
- Add smooth animations (fade-in, slide-up, etc.)
- Use modern card designs with shadows and hover effects
- Include backdrop-blur effects for glassmorphism
- Add gradient backgrounds and overlays
- Ensure proper spacing (py-16 to py-24 for sections)
- Use container mx-auto px-4 for proper containment
- Add transition effects on all interactive elements
- Use proper z-index management
- Include loading states and animations

TECHNICAL REQUIREMENTS:
- Single HTML file with inline CSS and JavaScript
- Include Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- Include Font Awesome: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
- All navigation links use href="#section-id" format
- Smooth scroll behavior enabled
- Responsive breakpoints: mobile (< 768px), tablet (768px-1024px), desktop (> 1024px)
- Minimum 2000 lines of code for complete, detailed website

Return ONLY the complete HTML code. No explanations, no markdown code blocks, just pure HTML starting with <!DOCTYPE html>.`;

  const userPrompt = `Create a COMPLETE, VISUALLY STUNNING ${websiteType} website with these specifications:

USER REQUIREMENTS:
${prompt}

DESIGN SPECIFICATIONS:
- Website Type: ${websiteType}
- Color Scheme: ${colorScheme}
- Must be a single, complete HTML file
- Include Tailwind CSS CDN
- Add ALL necessary sections for a ${websiteType}
- Make it fully responsive and interactive
- Include beautiful animations and modern design
- Add proper navigation with smooth scrolling
- Use gradients, shadows, and modern effects
- Ensure all content is detailed and professional

Generate the COMPLETE, PRODUCTION-READY HTML code now. Include ALL sections with full content. Make it visually stunning and modern.`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          stopSequences: []
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    let htmlCode = data.candidates[0].content.parts[0].text;
    
    // Clean up the response - remove markdown code blocks if present
    htmlCode = htmlCode.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Ensure it starts with <!DOCTYPE html> or <html>
    if (!htmlCode.toLowerCase().startsWith('<!doctype') && !htmlCode.toLowerCase().startsWith('<html')) {
      htmlCode = `<!DOCTYPE html>\n${htmlCode}`;
    }

    // Check if HTML is complete
    const hasClosingHtml = htmlCode.toLowerCase().includes('</html>');
    const hasClosingBody = htmlCode.toLowerCase().includes('</body>');
    const lineCount = htmlCode.split('\n').length;
    
    // Warn if content might be truncated
    if (!hasClosingHtml || !hasClosingBody || lineCount < 100) {
      console.warn('Warning: Generated HTML may be incomplete or truncated');
      console.log('Lines:', lineCount, 'Has </html>:', hasClosingHtml, 'Has </body>:', hasClosingBody);
    }

    return {
      success: true,
      html: htmlCode,
      metadata: {
        model: 'gemini-2.0-flash-exp',
        lineCount: lineCount,
        isComplete: hasClosingHtml && hasClosingBody,
        tokensUsed: data.usageMetadata
      }
    };
  } catch (error) {
    console.error('Gemini website generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

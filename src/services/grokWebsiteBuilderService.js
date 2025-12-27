/**
 * Grok Website Builder Service
 * Uses Grok Code Fast 1 model for beautiful website generation
 */

const GROK_API_KEY = process.env.REACT_APP_GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

/**
 * Generate complete website with Grok Code Fast 1
 */
export const generateFullWebsite = async (userPrompt, onProgress) => {
  try {
    onProgress({ type: 'stage', content: 'Initializing' });
    onProgress({ type: 'log', content: '🚀 Starting website generation with Grok...' });
    
    if (!GROK_API_KEY) {
      throw new Error('Grok API key is not configured. Please add REACT_APP_GROK_API_KEY to your .env file.');
    }
    
    onProgress({ type: 'stage', content: 'Connecting to Grok API' });
    onProgress({ type: 'log', content: '🤖 Connecting to Grok Code Fast 1...' });
    
    console.log('🔍 Initializing Grok Code Fast 1...');
    console.log('🔑 API Key:', GROK_API_KEY ? `${GROK_API_KEY.substring(0, 8)}...` : 'NOT SET');

    onProgress({ type: 'stage', content: 'Planning Website Structure' });
    onProgress({ type: 'log', content: '🧠 Analyzing requirements and planning content...' });

    // Step 1: Enhance the prompt with detailed content planning
    const contentPlanningPrompt = `You are a professional content strategist and copywriter. Based on this website request: "${userPrompt}"

Create a DETAILED content plan with actual content for each section. Be specific, creative, and professional.

Generate:

1. **HERO SECTION:**
   - Main headline (powerful, attention-grabbing)
   - Subheadline (compelling value proposition)
   - 2-3 CTA button texts
   - Background image description (specific Unsplash search terms)

2. **FEATURES SECTION (6 features):**
   For each feature:
   - Feature name
   - Icon suggestion (Font Awesome class)
   - 2-3 sentence description
   - Benefit statement

3. **ABOUT SECTION:**
   - Section headline
   - 3-4 paragraphs of compelling story/description
   - Key statistics or achievements (3-4 numbers with labels)
   - Image description for visual

4. **SERVICES/PRODUCTS (if applicable):**
   - 3-6 service/product cards
   - Each with: name, description, price/details, icon

5. **GALLERY:**
   - 8-12 specific image descriptions
   - Actual Unsplash photo IDs or search terms

6. **TESTIMONIALS (3-4):**
   - Customer name
   - Role/Company
   - Detailed testimonial (2-3 sentences)
   - Rating (5 stars)

7. **PRICING (if applicable):**
   - 3 pricing tiers
   - Each with: name, price, features list (5-7 items), CTA

8. **CONTACT SECTION:**
   - Headline
   - Subtext
   - Contact information (email, phone, address)
   - Social media links

9. **FOOTER:**
   - Company tagline
   - Quick links (5-7)
   - Contact info
   - Social media

10. **DESIGN THEME:**
    - Primary color scheme (3-4 colors with hex codes)
    - Font pairing suggestions
    - Design style (modern, minimalist, bold, elegant, etc.)
    - Mood/feeling to convey

Provide REAL, specific content - not placeholders or generic text. Make it professional and compelling.`;

    console.log('🧠 Step 1: Generating detailed content plan...');
    
    // Generate detailed content plan first
    const contentResponse = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-code-fast-1',
        messages: [
          {
            role: 'system',
            content: 'You are a professional content strategist and copywriter who creates detailed, compelling content plans for websites.'
          },
          {
            role: 'user',
            content: contentPlanningPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 8000
      })
    });

    if (!contentResponse.ok) {
      throw new Error(`Content planning failed: ${contentResponse.status}`);
    }

    const contentData = await contentResponse.json();
    const detailedContent = contentData.choices[0].message.content;
    
    console.log('✅ Content plan generated!');
    onProgress({ type: 'log', content: '✅ Content plan created with detailed copy!' });

    onProgress({ type: 'stage', content: 'Generating Code' });
    onProgress({ type: 'log', content: '🏗️ Building your beautiful website with Grok...' });

    const systemPrompt = `You are an expert full-stack web developer specializing in creating stunning, production-ready websites. You excel at generating complete, beautiful HTML/CSS/JS code that looks professional and modern. You create websites that look like they cost $10,000+.`;

    const fullPrompt = `Create a complete, production-ready website using this DETAILED CONTENT PLAN:

${detailedContent}

Original Request: "${userPrompt}"

CRITICAL REQUIREMENTS - MAKE IT LOOK LIKE A $10,000+ PROFESSIONAL WEBSITE:

1. **Visual Excellence** (MANDATORY - THIS IS CRITICAL):
   - Use the EXACT content from the content plan above
   - Use REAL Unsplash images with proper IDs: https://images.unsplash.com/photo-[ID]?w=1920&q=80
   - Search Unsplash for relevant images based on the content plan
   - Create stunning gradients using the color scheme from the content plan
   - Add smooth animations: transition-all duration-500 ease-in-out, hover:scale-105, hover:-translate-y-2
   - Use modern shadows: shadow-2xl, shadow-[color]/50, hover:shadow-3xl
   - Implement glassmorphism: backdrop-blur-lg bg-white/10 border border-white/20
   - Add parallax effects on scroll
   - Include subtle background patterns or textures
   - Use gradient overlays on images for better text readability

2. **Advanced Design Elements**:
   - Animated counters for statistics (using Alpine.js)
   - Smooth scroll animations (fade-in, slide-in on scroll)
   - Hover effects on all interactive elements
   - Loading animations for images
   - Gradient backgrounds for sections
   - Custom shaped dividers between sections (waves, curves, angles)
   - Floating elements with subtle animations
   - Interactive cards that tilt on hover
   - Progress bars or skill meters (if applicable)
   - Timeline designs (if applicable)
   - Pricing comparison tables with hover effects
   - Image galleries with lightbox effect
   - Video backgrounds or embedded videos (if applicable)

3. **Technical Stack** (MUST INCLUDE ALL):
   - Tailwind CSS v3.4+ CDN: <script src="https://cdn.tailwindcss.com"></script>
   - Alpine.js for interactivity: <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
   - Font pairing from content plan (use Google Fonts)
   - Font Awesome icons: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
   - AOS (Animate On Scroll): <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
   - AOS JS: <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>

4. **Required Sections** (USE ALL CONTENT FROM THE PLAN):
   a) NAVIGATION: Sticky navbar with logo, menu items, CTA button, mobile hamburger menu
   b) HERO: Full-screen with parallax background, animated headline, subheadline, multiple CTAs, scroll indicator
   c) FEATURES: 6 feature cards with icons, hover effects, animations (use content from plan)
   d) ABOUT: 2-column layout with image, statistics counters, timeline or milestones
   e) SERVICES/PRODUCTS: Cards with pricing, features, hover effects (if in content plan)
   f) GALLERY: Masonry or grid layout with 8-12 images, hover zoom effects, lightbox
   g) TESTIMONIALS: Carousel or grid with 3-4 reviews, avatars, ratings, company logos
   h) PRICING: 3-tier pricing table with feature comparison, popular badge (if applicable)
   i) STATS/ACHIEVEMENTS: Animated counters with icons
   j) CTA SECTION: Bold call-to-action with gradient background
   k) CONTACT: Form with validation, map embed, contact info cards
   l) FOOTER: Multi-column with links, social media, newsletter signup, copyright

5. **Design Principles** (MAKE IT AWARD-WINNING):
   - Follow the design theme and color scheme from the content plan EXACTLY
   - Dribbble/Awwwards/Apple/Stripe quality aesthetics
   - Generous whitespace (py-20, py-32 for sections, never cramped)
   - Micro-interactions everywhere (hover:, focus:, group-hover:, active:)
   - Mobile-first responsive (sm:, md:, lg:, xl:, 2xl:)
   - Consistent color palette throughout (from content plan)
   - Professional typography hierarchy with proper font weights
   - Visual hierarchy with size, color, and spacing
   - Use of negative space effectively
   - Asymmetric layouts for visual interest
   - Depth with shadows and layering
   - Motion design with purposeful animations

6. **Content Quality** (USE THE DETAILED CONTENT PLAN):
   - Use ALL the specific content from the content plan above
   - NO Lorem Ipsum or placeholder text
   - Include ALL details: prices, names, testimonials, statistics
   - Make it feel like a real, established business
   - Add realistic contact information
   - Include specific achievements and numbers
   - Write compelling CTAs that drive action

7. **Code Quality & Performance**:
   - Clean, semantic HTML5 (header, main, section, article, footer)
   - Proper heading hierarchy (h1 → h6, only one h1)
   - Alt text for ALL images (descriptive, not generic)
   - ARIA labels for accessibility
   - Commented sections for clarity
   - SEO meta tags (title, description, keywords, og tags)
   - Lazy loading for images
   - Optimized for performance
   - Valid HTML5 markup

STRUCTURE TEMPLATE:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Professional website description">
    <title>Business Name - Tagline</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3 { font-family: 'Playfair Display', serif; }
        .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body class="bg-white">

<!-- Navigation -->
<nav class="fixed w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
    <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold gradient-text">Brand Name</h1>
        <div class="hidden md:flex space-x-8">
            <a href="#home" class="hover:text-purple-600 transition">Home</a>
            <a href="#features" class="hover:text-purple-600 transition">Features</a>
            <a href="#about" class="hover:text-purple-600 transition">About</a>
            <a href="#contact" class="hover:text-purple-600 transition">Contact</a>
        </div>
    </div>
</nav>

<!-- HERO SECTION -->
<section id="home" class="relative h-screen flex items-center justify-center text-white" style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920') center/cover;">
    <div class="text-center z-10 px-4">
        <h1 class="text-6xl md:text-8xl font-bold mb-6">Business Name</h1>
        <p class="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">Compelling tagline</p>
        <button class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition transform hover:scale-105 shadow-2xl">
            Get Started <i class="fas fa-arrow-right ml-2"></i>
        </button>
    </div>
</section>

<!-- Add all other sections here -->

<script>
// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
</script>

</body>
</html>

FINAL INSTRUCTIONS:
1. Generate a COMPLETE, FULL-LENGTH website with ALL 7 sections
2. Customize EVERYTHING for "${userPrompt}" - colors, fonts, content, images must match the business theme
3. Use REAL Unsplash image URLs (not placeholders)
4. Write compelling, realistic content (NO generic text or Lorem Ipsum)
5. Make it look like a professional $10,000 website
6. Ensure the HTML is COMPLETE from <!DOCTYPE html> to </html>
7. Include ALL CDN links (Tailwind, Alpine.js, Font Awesome, Google Fonts)

OUTPUT FORMAT:
Return ONLY the complete HTML code. Start with <!DOCTYPE html> and end with </html>. 
Make sure the code is COMPLETE and includes ALL 7 sections with real content!`;

    onProgress({ type: 'log', content: '📝 Generating HTML structure with Grok Code Fast 1...' });
    
    console.log('🔍 Sending request to Grok API...');
    console.log('📏 Prompt length:', fullPrompt.length);
    
    // Call Grok API
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-code-fast-1',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 16000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Grok API error:', errorData);
      throw new Error(`Grok API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    console.log('✅ Received response from Grok');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from Grok API');
    }

    let htmlCode = data.choices[0].message.content;
    
    console.log('✅ Generation successful!');
    onProgress({ type: 'log', content: '✅ Website generated successfully with Grok Code Fast 1!' });

    onProgress({ type: 'log', content: '🎨 Applying beautiful styles and animations...' });
    onProgress({ type: 'log', content: '⚡ Adding smooth interactivity...' });
    
    // Clean up markdown code blocks if any
    htmlCode = htmlCode.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Ensure proper HTML structure
    if (!htmlCode.includes('<!DOCTYPE')) {
      htmlCode = '<!DOCTYPE html>\n' + htmlCode;
    }
    
    console.log('Generated HTML length:', htmlCode.length);
    console.log('HTML preview:', htmlCode.substring(0, 200));
    
    if (!htmlCode || htmlCode.length < 100) {
      onProgress({ type: 'log', content: '❌ No content generated!' });
      throw new Error('No HTML content was generated. Please try again.');
    }
    
    onProgress({ type: 'stage', content: 'Finalizing' });
    onProgress({ type: 'log', content: '🔍 Validating HTML structure...' });
    onProgress({ type: 'log', content: '✅ Website generated successfully!' });
    onProgress({ type: 'log', content: `📊 Total size: ${Math.round(htmlCode.length / 1024)}KB` });
    onProgress({ type: 'log', content: '🎉 Website is ready!' });
    onProgress({ type: 'stage', content: 'Complete' });
    
    // Extract inline CSS and JS to separate files
    const cssMatch = htmlCode.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    const jsMatch = htmlCode.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    
    const cssContent = cssMatch ? cssMatch[1].trim() : `/* Styles */
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}`;

    const jsContent = jsMatch ? jsMatch[1].trim() : `// JavaScript
console.log('Website loaded');`;

    // Create complete project structure
    return {
      success: true,
      files: {
        'index.html': htmlCode,
        'css/styles.css': cssContent,
        'css/animations.css': `/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}`,
        'js/main.js': jsContent,
        'js/animations.js': `// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});`,
        'assets/images/.gitkeep': '# Images folder',
        'assets/fonts/.gitkeep': '# Fonts folder',
        'README.md': `# ${userPrompt.split(' ').slice(0, 5).join(' ')}

## 🚀 Generated with DAG GPT Website Builder (Grok Powered)

### Project Structure
\`\`\`
├── index.html          # Main HTML file
├── css/
│   ├── styles.css      # Main styles
│   └── animations.css  # Animation styles
├── js/
│   ├── main.js         # Main JavaScript
│   └── animations.js   # Animation scripts
├── assets/
│   ├── images/         # Image assets
│   └── fonts/          # Font files
└── README.md           # This file
\`\`\`

### 🎯 Features
- Responsive design
- Smooth animations
- Modern UI/UX
- Optimized performance
- Generated with Grok Code Fast 1

### 🛠️ Technologies
- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (ES6+)
- Alpine.js
- Unsplash Images
- Font Awesome Icons

### 📝 Prompt
"${userPrompt}"

### 🚀 Getting Started
1. Open \`index.html\` in your browser
2. Or use a local server: \`npx serve .\`

### 📦 Deployment
Deploy to:
- Vercel: \`vercel --prod\`
- Netlify: Drag & drop the folder
- GitHub Pages: Push to \`gh-pages\` branch

---
Built with ❤️ by DAG GPT using Grok Code Fast 1`,
        'package.json': `{
  "name": "${userPrompt.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)}",
  "version": "1.0.0",
  "description": "${userPrompt}",
  "main": "index.html",
  "scripts": {
    "start": "npx serve .",
    "deploy": "vercel --prod"
  },
  "keywords": ["website", "landing-page", "ai-generated", "grok"],
  "author": "DAG GPT",
  "license": "MIT"
}`,
        '.gitignore': `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*`,
        'vercel.json': `{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ]
}`
      },
      mainFile: 'index.html',
      html: htmlCode
    };
  } catch (error) {
    console.error('Website generation error:', error);
    onProgress({ type: 'log', content: `❌ Error: ${error.message}` });
    return {
      success: false,
      error: error.message
    };
  }
};

// Export utilities
export const downloadHTML = (html, filename = 'website.html') => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadAllFiles = async (files, projectName = 'website') => {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    Object.entries(files).forEach(([path, content]) => {
      zip.file(path, content);
    });
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating zip:', error);
    throw error;
  }
};

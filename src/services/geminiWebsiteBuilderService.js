/**
 * Gemini Website Builder Service
 * Uses Google Gemini Pro for beautiful website generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set!');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate complete website with Gemini Pro
 */
export const generateFullWebsite = async (userPrompt, onProgress) => {
  try {
    onProgress({ type: 'stage', content: 'Initializing' });
    onProgress({ type: 'log', content: '🚀 Starting website generation with Gemini...' });
    
    onProgress({ type: 'stage', content: 'Connecting to Gemini API' });
    onProgress({ type: 'log', content: '🤖 Connecting to Gemini API...' });
    
    // Try Gemini 3 Pro models in order: stable first, then preview
    let modelName;
    let model;
    
    console.log('🔍 Attempting to initialize Gemini 3 Pro...');
    console.log('🔑 API Key:', GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 8)}...` : 'NOT SET');
    
    // Try stable version first (if available)
    const modelsToTry = ['gemini-3-pro', 'gemini-3-pro-preview'];
    
    for (const tryModel of modelsToTry) {
      try {
        console.log(`🔄 Trying model: ${tryModel}...`);
        model = genAI.getGenerativeModel({ 
          model: tryModel,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
          }
        });
        modelName = tryModel;
        onProgress({ type: 'log', content: `✅ Connected to ${tryModel}!` });
        console.log(`✅ Successfully initialized ${tryModel}`);
        break;
      } catch (initError) {
        console.log(`⚠️ ${tryModel} not available, trying next...`);
        if (tryModel === modelsToTry[modelsToTry.length - 1]) {
          throw new Error('No Gemini 3 Pro models available. Please check your API access.');
        }
      }
    }

    onProgress({ type: 'stage', content: 'Generating Code' });
    onProgress({ type: 'log', content: '🏗️ Building your beautiful website...' });

    const fullPrompt = `You are an expert full-stack web developer specializing in creating stunning, production-ready websites.

User Request: "${userPrompt}"

CRITICAL REQUIREMENTS:

1. **Visual Excellence** (MANDATORY):
   - Use REAL Unsplash images: https://images.unsplash.com/photo-[ID]?w=1920&q=80
   - Example IDs: photo-1495474472287-4d71bcdd2085 (coffee), photo-1442512595331-e89e73853f31 (cafe)
   - Stunning gradients: bg-gradient-to-br from-purple-600 via-pink-500 to-red-500
   - Smooth animations: transition-all duration-500 ease-in-out, hover:scale-105
   - Modern shadows: shadow-2xl, shadow-[color]/50
   - Glassmorphism effects: backdrop-blur-lg bg-white/10

2. **Technical Stack** (MUST INCLUDE):
   - Tailwind CSS v3.4+ CDN: <script src="https://cdn.tailwindcss.com"></script>
   - Alpine.js for interactivity: <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
   - Google Fonts: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet">
   - Font Awesome icons: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

3. **Required Sections** (ALL MANDATORY - 7 sections minimum):
   a) HERO: Full-screen (h-screen) with background image, large heading (text-6xl md:text-8xl), subheading, CTA button
   b) FEATURES: 6 cards with icons, titles, descriptions in grid-cols-3
   c) ABOUT: 2-column layout with image and 3-4 paragraphs
   d) GALLERY: 8-12 images in masonry/grid layout with hover effects
   e) TESTIMONIALS: 3-4 customer reviews with avatars (use https://i.pravatar.cc/150?img=[1-70])
   f) CONTACT: Working form with name, email, message fields
   g) FOOTER: Social links, navigation, copyright

4. **Design Principles**:
   - Dribbble/Awwwards quality aesthetics
   - Generous whitespace (py-20, py-32 for sections)
   - Micro-interactions (hover:, focus:, group-hover:)
   - Mobile-first responsive (sm:, md:, lg:, xl:)
   - Consistent color palette throughout
   - Professional typography hierarchy

5. **Content Quality**:
   - Write REAL, compelling content (NO Lorem Ipsum)
   - Include specific details, prices, names, testimonials
   - Make it feel like a professional $10,000 website
   - Add realistic business information

6. **Code Quality**:
   - Clean, semantic HTML5
   - Proper heading hierarchy (h1 → h6)
   - Alt text for ALL images
   - ARIA labels for accessibility
   - Commented sections
   - SEO meta tags

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

<!-- HERO SECTION - Full screen with background image -->
<section id="home" class="relative h-screen flex items-center justify-center text-white" style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920') center/cover;">
    <div class="text-center z-10 px-4">
        <h1 class="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">Business Name</h1>
        <p class="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">Compelling tagline that describes your unique value proposition</p>
        <button class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition transform hover:scale-105 shadow-2xl">
            Get Started <i class="fas fa-arrow-right ml-2"></i>
        </button>
    </div>
</section>

<!-- FEATURES SECTION - 6 cards with icons -->
<section id="features" class="py-20 px-4 bg-gray-50">
    <div class="max-w-7xl mx-auto">
        <h2 class="text-5xl font-bold text-center mb-4 text-gray-900">Amazing Features</h2>
        <p class="text-center text-gray-600 mb-16 text-lg">Everything you need to succeed</p>
        <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition group">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                    <i class="fas fa-rocket text-white text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold mb-3 text-gray-900">Fast Performance</h3>
                <p class="text-gray-600">Lightning-fast load times and optimized performance for the best user experience.</p>
            </div>
            <!-- Add 5 more feature cards with different icons and content -->
        </div>
    </div>
</section>

<!-- ABOUT SECTION - 2 columns with image -->
<section id="about" class="py-20 px-4">
    <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-2 gap-12 items-center">
            <img src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800" alt="About Us" class="rounded-2xl shadow-2xl">
            <div>
                <h2 class="text-5xl font-bold mb-6 text-gray-900">Our Story</h2>
                <p class="text-lg text-gray-700 mb-4">Write a compelling story about the business, its mission, and values. Make it personal and authentic.</p>
                <p class="text-lg text-gray-700 mb-4">Add more details about what makes this business unique and why customers should choose you.</p>
                <p class="text-lg text-gray-700">Include specific achievements, milestones, or unique selling points.</p>
            </div>
        </div>
    </div>
</section>

<!-- GALLERY SECTION - Grid of images -->
<section id="gallery" class="py-20 px-4 bg-gray-50">
    <div class="max-w-7xl mx-auto">
        <h2 class="text-5xl font-bold text-center mb-16 text-gray-900">Gallery</h2>
        <div class="grid md:grid-cols-4 gap-4">
            <img src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600" alt="Gallery 1" class="rounded-lg hover:scale-105 transition shadow-lg">
            <!-- Add 7 more images with different Unsplash URLs -->
        </div>
    </div>
</section>

<!-- TESTIMONIALS SECTION -->
<section id="testimonials" class="py-20 px-4">
    <div class="max-w-7xl mx-auto">
        <h2 class="text-5xl font-bold text-center mb-16 text-gray-900">What Our Customers Say</h2>
        <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-2xl shadow-lg">
                <div class="flex items-center mb-4">
                    <img src="https://i.pravatar.cc/100?img=1" alt="Customer" class="w-16 h-16 rounded-full mr-4">
                    <div>
                        <p class="font-bold text-gray-900">John Doe</p>
                        <p class="text-yellow-500">★★★★★</p>
                    </div>
                </div>
                <p class="text-gray-700">"Write a detailed, realistic testimonial that sounds authentic and specific."</p>
            </div>
            <!-- Add 2 more testimonials -->
        </div>
    </div>
</section>

<!-- CONTACT SECTION -->
<section id="contact" class="py-20 px-4 bg-gray-50">
    <div class="max-w-3xl mx-auto">
        <h2 class="text-5xl font-bold text-center mb-12 text-gray-900">Get In Touch</h2>
        <form class="space-y-6">
            <input type="text" placeholder="Your Name" class="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <input type="email" placeholder="Your Email" class="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <textarea placeholder="Your Message" rows="6" class="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
            <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg">
                Send Message <i class="fas fa-paper-plane ml-2"></i>
            </button>
        </form>
    </div>
</section>

<!-- FOOTER -->
<footer class="bg-gray-900 text-white py-12 px-4">
    <div class="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
            <h3 class="text-2xl font-bold mb-4 gradient-text">Brand Name</h3>
            <p class="text-gray-400">Your tagline here</p>
        </div>
        <div>
            <h4 class="font-bold mb-4">Quick Links</h4>
            <ul class="space-y-2 text-gray-400">
                <li><a href="#home" class="hover:text-white transition">Home</a></li>
                <li><a href="#features" class="hover:text-white transition">Features</a></li>
                <li><a href="#about" class="hover:text-white transition">About</a></li>
            </ul>
        </div>
        <div>
            <h4 class="font-bold mb-4">Contact</h4>
            <ul class="space-y-2 text-gray-400">
                <li><i class="fas fa-envelope mr-2"></i> email@example.com</li>
                <li><i class="fas fa-phone mr-2"></i> (123) 456-7890</li>
            </ul>
        </div>
        <div>
            <h4 class="font-bold mb-4">Follow Us</h4>
            <div class="flex space-x-4">
                <a href="#" class="text-2xl hover:text-purple-500 transition"><i class="fab fa-facebook"></i></a>
                <a href="#" class="text-2xl hover:text-purple-500 transition"><i class="fab fa-twitter"></i></a>
                <a href="#" class="text-2xl hover:text-purple-500 transition"><i class="fab fa-instagram"></i></a>
            </div>
        </div>
    </div>
    <div class="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
        <p>&copy; 2024 Business Name. All rights reserved.</p>
    </div>
</footer>

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

    onProgress({ type: 'log', content: '📝 Generating HTML structure with Gemini 3 Pro Preview...' });
    
    // Generate content with Gemini 3 Pro Preview
    let htmlCode;
    try {
      console.log('🔍 Attempting generation with', modelName);
      console.log('🔑 API Key present:', !!GEMINI_API_KEY);
      console.log('📏 Prompt length:', fullPrompt.length);
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      htmlCode = response.text();
      
      console.log('✅ Generation successful!');
      onProgress({ type: 'log', content: `✅ Website generated successfully with ${modelName}!` });
    } catch (genError) {
      console.error('❌ Generation error:', genError);
      console.error('Error details:', {
        message: genError.message,
        status: genError.status,
        statusText: genError.statusText
      });
      
      onProgress({ type: 'log', content: `❌ Error: ${genError.message}` });
      
      // Provide helpful error message
      if (genError.message && genError.message.includes('429')) {
        throw new Error(`Gemini 3 Pro Preview quota exceeded. Error: ${genError.message}\n\nPlease:\n1. Wait a few minutes and try again\n2. Check your quota at https://aistudio.google.com\n3. Verify the model is enabled for your API key`);
      } else if (genError.message && genError.message.includes('403')) {
        throw new Error(`Access denied to Gemini 3 Pro Preview. Error: ${genError.message}\n\nPlease ensure:\n1. The model is enabled in Google AI Studio\n2. Your API key has proper permissions\n3. Visit: https://aistudio.google.com`);
      } else if (genError.message && genError.message.includes('404')) {
        throw new Error(`Gemini 3 Pro Preview not found. Error: ${genError.message}\n\nThe model may not be available yet. Please:\n1. Check if you have access to preview models\n2. Verify at: https://aistudio.google.com`);
      } else {
        throw new Error(`Generation failed: ${genError.message}`);
      }
    }

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

## 🚀 Generated with DAG GPT Website Builder (Gemini Powered)

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
- Generated with Google Gemini 2.0 Flash Thinking Experimental

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
Built with ❤️ by DAG GPT using Google Gemini 3 Pro`,
        'package.json': `{
  "name": "${userPrompt.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)}",
  "version": "1.0.0",
  "description": "${userPrompt}",
  "main": "index.html",
  "scripts": {
    "start": "npx serve .",
    "deploy": "vercel --prod"
  },
  "keywords": ["website", "landing-page", "ai-generated", "gemini"],
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
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Add all files to the ZIP
    Object.entries(files).forEach(([filename, content]) => {
      // Create folder structure
      if (filename.includes('/')) {
        const parts = filename.split('/');
        const folder = parts.slice(0, -1).join('/');
        const file = parts[parts.length - 1];
        zip.folder(folder).file(file, content);
      } else {
        zip.file(filename, content);
      }
    });
    
    // Generate ZIP file
    const blob = await zip.generateAsync({ type: 'blob' });
    
    // Download ZIP
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Downloaded ${Object.keys(files).length} files as ${projectName}.zip`);
  } catch (error) {
    console.error('Error creating ZIP:', error);
    // Fallback to downloading just HTML
    downloadHTML(files['index.html'], `${projectName}.html`);
  }
};

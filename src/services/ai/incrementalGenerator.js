/**
 * Incremental Website Generator
 * Generates websites step-by-step with Claude Sonnet 4.5
 * WITH AUTOMATIC ERROR DETECTION AND FIXING!
 */

// Error detector temporarily disabled due to build issues
// Will be re-implemented in next version

const CLAUDE_API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/generate-website'
  : 'http://localhost:3001/api/generate-website';

/**
 * Build library usage instructions for prompts
 */
function buildLibraryInstructions() {
  return `
🎨 ULTRA-PREMIUM DESIGN REQUIREMENTS - WORLD-CLASS QUALITY!

You are a SENIOR UI/UX DESIGNER creating a $50,000 website. This must look like:
- Apple.com (clean, modern, premium)
- Stripe.com (gradients, animations, professional)
- Linear.app (sleek, fast, beautiful)
- Vercel.com (cutting-edge, stunning)

⚠️ ABSOLUTE REQUIREMENTS:
1. STUNNING visual design that makes people say "WOW!"
2. SMOOTH animations that feel expensive
3. LARGE, BOLD typography (text-6xl, text-7xl for headings)
4. VIBRANT gradients and glass morphism everywhere
5. PROFESSIONAL spacing and layout
6. NO generic content - everything must be real and meaningful
7. INTERACTIVE elements with delightful hover effects
8. MODERN color palette (purples, blues, cyans, pinks)

📚 LIBRARY USAGE (ALREADY INSTALLED):

1. FRAMER MOTION (✅ USE EXTENSIVELY!):
   - Import: import { motion } from 'framer-motion';
   - Fade in on load: <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
   - Stagger children: 
     const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
     const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
   - Hover effects: <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring" }}>
   - Scroll animations: <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>

2. 🎨 UIVERSE COMPONENTS (✅ USE styled-components!):
   - UIverse uses styled-components for animations
   - Install: styled-components is ALREADY in package.json
   - Create inline styled components with animations
   
   Example Loader (UIverse style):
   import styled from 'styled-components';
   
   const StyledWrapper = styled.div\`
     .loader {
       position: relative;
       display: flex;
       justify-content: center;
       width: 100px;
       height: 100px;
     }
     .loader-letter {
       position: absolute;
       font-size: 24px;
       color: #6c63ff;
       animation: rotate 2.4s infinite;
     }
     @keyframes rotate {
       0%, 100% { transform: rotate(0deg) translateY(-20px); }
       50% { transform: rotate(180deg) translateY(20px); }
     }
   \`;
   
   const Loader = () => (
     <StyledWrapper>
       <div className="loader">
         <span className="loader-letter">L</span>
         <span className="loader-letter">O</span>
         <span className="loader-letter">A</span>
         <span className="loader-letter">D</span>
       </div>
     </StyledWrapper>
   );
   
   Example Button (UIverse style):
   const StyledButton = styled.button\`
     position: relative;
     padding: 12px 35px;
     background: linear-gradient(45deg, #6c63ff, #ff6584);
     font-size: 17px;
     font-weight: 500;
     color: #fff;
     border: none;
     border-radius: 12px;
     cursor: pointer;
     overflow: hidden;
     transition: all 0.3s ease;
     
     &:hover {
       transform: scale(1.05);
       box-shadow: 0 10px 30px rgba(108, 99, 255, 0.5);
     }
     
     &::before {
       content: '';
       position: absolute;
       inset: 0;
       background: linear-gradient(45deg, #ff6584, #6c63ff);
       opacity: 0;
       transition: opacity 0.3s;
     }
     
     &:hover::before {
       opacity: 1;
     }
     
     span {
       position: relative;
       z-index: 1;
     }
   \`;
   
   <StyledButton><span>Get Started</span></StyledButton>

3. 🚀 REACTBITS-INSPIRED ANIMATIONS (✅ CREATE SMOOTH ANIMATIONS!):
   - ReactBits.dev has beautiful text and component animations - RECREATE THEM!
   - Text reveal animations with Framer Motion
   - Stagger animations for lists
   - Scroll-triggered animations
   - Parallax effects
   - Magnetic hover effects
   
   Example Text Animation (ReactBits style):
   <motion.h1
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.8, ease: "easeOut" }}
     className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
   >
     Amazing Title
   </motion.h1>
   
   Example Stagger Animation (ReactBits style):
   <motion.div
     variants={{
       hidden: { opacity: 0 },
       show: {
         opacity: 1,
         transition: { staggerChildren: 0.1 }
       }
     }}
     initial="hidden"
     animate="show"
   >
     {items.map(item => (
       <motion.div
         key={item.id}
         variants={{
           hidden: { opacity: 0, y: 20 },
           show: { opacity: 1, y: 0 }
         }}
       >
         {item.content}
       </motion.div>
     ))}
   </motion.div>

4. TAILWIND CSS COMPONENTS (✅ BUILD YOUR OWN!):
   - Buttons: <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform">
   - Cards: <div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
   - Badges: <span className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium">

5. LUCIDE REACT (✅ USE FOR ICONS!):
   - Import: import { Sparkles, Rocket, Zap, Star, ArrowRight, Github, Linkedin, Mail } from 'lucide-react';
   - Large icons: <Sparkles className="w-12 h-12 text-blue-500" />
   - Animated icons: <motion.div whileHover={{ rotate: 360 }}><Rocket className="w-8 h-8" /></motion.div>

4. TAILWIND CSS (✅ USE EXTENSIVELY!):
   - Gradients: bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500
   - Text gradients: bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent
   - Shadows: shadow-2xl shadow-purple-500/50
   - Blur effects: backdrop-blur-xl bg-white/10
   - Dark backgrounds: bg-gray-900 text-white
   - Animations: animate-pulse animate-bounce hover:scale-110 transition-all duration-300
   
6. 🖼️ IMAGES (✅ USE UNSPLASH FOR STUNNING VISUALS!):
   - ALWAYS use Unsplash for product images, backgrounds, and visuals
   - Format: https://images.unsplash.com/photo-[id]?w=800&q=80
   - Example product: <img src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80" alt="Lego Game" />
   - Example background: <div className="bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80)'}}>
   - Search keywords: lego, toys, games, gaming, colorful, kids, playful
   - EVERY product card MUST have an image!
   - Hero sections MUST have background images or product images!

⚠️ CRITICAL RULES - FOLLOW EXACTLY OR CODE WILL BREAK:
- 🚫 ABSOLUTELY NO SVG or base64 encoded URLs IN THE CODE!
  ❌ FORBIDDEN: Any bg-url patterns with encoded images
  ❌ FORBIDDEN: Any background-image with encoded content
  ✅ USE INSTEAD: Unsplash URLs for images (https://images.unsplash.com/...)
  ✅ USE INSTEAD: bg-gradient-to-br from-gray-900 to-gray-800 for solid backgrounds
- 🚫 NO custom Tailwind classes (border-border, bg-background, etc.)
  ❌ WRONG: className="border-border bg-background"
  ✅ RIGHT: className="border-gray-200 bg-white"
- 🚫 NO Flowbite imports or components
- ✅ MUST use UIverse and ReactBits components for premium look
- ✅ MUST include images for every product/feature
- ✅ Make it look EXPENSIVE and PROFESSIONAL

IF YOU USE SVG DATA URLs, THE ENTIRE WEBSITE WILL FAIL TO BUILD!

🎯 DESIGN PATTERNS TO USE:

Hero Section:
- Full viewport height (min-h-screen)
- Gradient background with animated mesh
- Large heading (text-6xl font-bold)
- Animated text with gradient
- CTA buttons with hover effects
- Floating elements with motion

Cards:
- Glass morphism (backdrop-blur-lg bg-white/10)
- Hover lift effect (hover:-translate-y-2)
- Gradient borders
- Shadow on hover
- Icon + title + description layout

Sections:
- Alternating backgrounds (dark/light)
- Scroll animations (fade in, slide up)
- Grid layouts (grid grid-cols-3 gap-8)
- Proper spacing (py-20 px-8)

❌ NEVER DO:
- Plain white backgrounds everywhere
- Generic "Component content goes here" text
- No animations or hover effects
- Boring, flat design
- Small, hard-to-read text
- Use @/ imports (NOT INSTALLED)

✅ ALWAYS DO:
- Use vibrant colors and gradients
- Add smooth animations with Framer Motion
- Make text large and bold
- Add hover effects to everything interactive
- Use proper spacing and padding
- Create visual hierarchy
- Make it look EXPENSIVE and PROFESSIONAL
`;
}

/**
 * Generate project structure first (package.json, configs)
 */
async function generateProjectStructure(projectPlan, onProgress) {
  onProgress({
    type: 'info',
    message: '📦 Step 1/5: Generating project structure...'
  });

  const libraryInstructions = buildLibraryInstructions();
  
  const structurePrompt = `${libraryInstructions}

Generate the base project structure files for a ${projectPlan.projectType} project.

Project Details:
- Name: ${projectPlan.name}
- Type: ${projectPlan.projectType}
- Framework: React + Vite
- Styling: Tailwind CSS
- Libraries: framer-motion, lucide-react, react-router-dom (NO Flowbite!)

Generate ONLY these files:
1. package.json - Complete with ALL dependencies
2. vite.config.js - Vite configuration
3. tailwind.config.js - Tailwind configuration
4. postcss.config.js - PostCSS configuration
5. index.html - HTML entry point
6. src/main.jsx - React entry point (NO BrowserRouter here!)
7. src/index.css - Tailwind directives

CRITICAL: Include ALL required dependencies in package.json:
- react, react-dom
- react-router-dom
- framer-motion
- lucide-react
- vite, @vitejs/plugin-react
- tailwindcss, autoprefixer, postcss

⚠️ DO NOT include flowbite or flowbite-react - use pure Tailwind instead!

⚠️ IMPORTANT FOR src/main.jsx:
- Import React, ReactDOM, App, and index.css
- Use ReactDOM.createRoot
- Render ONLY <App /> (NO BrowserRouter!)
- BrowserRouter will be in App.jsx, NOT main.jsx

Example main.jsx:
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

⚠️ CRITICAL FOR tailwind.config.js:
Use this EXACT configuration (NO Flowbite!):

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

⚠️ CRITICAL FOR src/index.css:
Use ONLY these Tailwind directives and basic resets:

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-gray-200;
  }
  body {
    @apply bg-white text-gray-900;
  }
}

Format each file as:
<file path="package.json">
{...}
</file>

Generate complete, production-ready configuration files.`;

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: structurePrompt,
      mode: 'bolt-builder'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate project structure');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let content = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          console.log('Stream data:', data.type, 'length:', data.content?.length || 0);
          // Server sends 'progress' type, not 'content'
          if (data.type === 'progress' || data.type === 'content') {
            content += data.content;
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }
  
  console.log('Final content length:', content.length);

  onProgress({
    type: 'success',
    message: '✅ Project structure generated'
  });

  return parseFiles(content);
}

/**
 * Generate App.jsx with routing setup
 */
async function generateAppFile(projectPlan, onProgress) {
  onProgress({
    type: 'info',
    message: '📄 Step 5/5: Generating App.jsx with routing...'
  });

  // Create default pages based on project type
  const defaultPages = [
    { name: 'Home', path: '/', description: 'Main landing page' },
    { name: 'About', path: '/about', description: 'About page' },
    { name: 'Contact', path: '/contact', description: 'Contact page' }
  ];
  
  const pages = projectPlan.pages || defaultPages;
  const pagesImports = pages.map(p => `import ${p.name} from './pages/${p.name}';`).join('\n');
  const routes = pages.map(p => `<Route path="${p.path}" element={<${p.name} />} />`).join('\n          ');

  const libraryInstructions = buildLibraryInstructions();
  
  const appPrompt = `${libraryInstructions}

Generate App.jsx for a ${projectPlan.projectType} project with React Router.

Pages to include:
${pages.map(p => `- ${p.name} (${p.path}): ${p.description}`).join('\n')}

Components needed:
- Header (navigation)
- Footer

Requirements:
1. Import React Router (BrowserRouter, Routes, Route) from 'react-router-dom'
2. Import ALL pages: ${pages.map(p => p.name).join(', ')}
3. Import Header and Footer components
4. Set up routes for all pages
5. Wrap EVERYTHING with BrowserRouter (this is the ONLY BrowserRouter in the app!)
6. Include Header and Footer in layout
7. Add proper React imports

⚠️ CRITICAL STRUCTURE:
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

Generate ONLY App.jsx file in this format:
<file path="src/App.jsx">
...complete code...
</file>

Make it production-ready with proper routing and layout.`;

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: appPrompt,
      mode: 'bolt-builder'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate App.jsx');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let content = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'progress' || data.type === 'content') {
            content += data.content;
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  }

  onProgress({
    type: 'success',
    message: '✅ App.jsx generated'
  });

  return parseFiles(content);
}

/**
 * Generate pages one by one
 */
async function generatePages(projectPlan, onProgress) {
  // Create default pages if not provided - but make them context-aware!
  const projectContext = projectPlan.name || projectPlan.description || 'website';
  const defaultPages = [
    { name: 'Home', path: '/', description: `Main landing page for: ${projectContext}` },
    { name: 'About', path: '/about', description: `About page for: ${projectContext}` },
    { name: 'Contact', path: '/contact', description: `Contact page for: ${projectContext}` }
  ];
  
  const pages = projectPlan.pages || defaultPages;
  
  onProgress({
    type: 'info',
    message: `📄 Step 3/5: Generating ${pages.length} pages...`
  });

  const allFiles = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    onProgress({
      type: 'info',
      message: `  ⏳ Generating ${page.name}.jsx (${i + 1}/${pages.length})...`
    });

    const libraryInstructions = buildLibraryInstructions();
    
    const pagePrompt = `${libraryInstructions}

🎯 Generate a STUNNING, PROFESSIONAL React page component.

🚨 CRITICAL - PROJECT CONTEXT:
User's Request: "${projectPlan.name || projectPlan.description}"
Project Type: ${projectPlan.projectType}

⚠️ CREATE CONTENT THAT MATCHES THE USER'S REQUEST ABOVE!
Do NOT create generic developer portfolio content unless that's what the user asked for!

🚨 JSX STRUCTURE RULES (CRITICAL - BUILD WILL FAIL IF NOT FOLLOWED):
1. ✅ Every component MUST return EXACTLY ONE root element
2. ✅ Wrap multiple sections in a SINGLE <div> or <> fragment
3. ❌ NEVER EVER return adjacent elements without a wrapper
4. ✅ CORRECT: return ( <div> <section>...</section> <section>...</section> </div> );
5. ❌ WRONG: return ( <section>...</section> <section>...</section> );
6. ✅ Count your opening and closing tags - they MUST match!
7. ✅ Every <section> needs a </section>, every <div> needs a </div>

Page Details:
- Name: ${page.name}
- Route: ${page.path}
- Description: ${page.description}

${page.name === 'Home' ? `
🏠 HOME PAGE - MAKE IT LOOK LIKE A $50K WEBSITE!

Reference: Stripe.com, Linear.app, Vercel.com hero sections

1. Hero Section (MUST BE STUNNING):
   - Full viewport (min-h-screen flex items-center justify-center)
   - Dark gradient background: bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900
   - MASSIVE heading: text-7xl md:text-8xl font-black
   - Gradient text: bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent
   - Animated with Framer Motion (fade in + slide up)
   - Subheading: text-xl md:text-2xl text-gray-300 max-w-3xl
   - 2 large CTA buttons: <Button gradientDuoTone="purpleToPink" size="xl">
   - Floating particles/orbs with motion.div (absolute positioning, animate)
   - Subtle grid pattern overlay

2. Features/Services Section:
   - Grid of 3-4 cards with glass morphism
   - Icons from Lucide React (large, colorful)
   - Hover animations (lift effect)
   - Stagger animation on scroll

3. Stats/Numbers Section:
   - Dark background with gradient
   - Animated counters
   - 4 key metrics in grid

4. CTA Section:
   - Gradient background
   - Large heading
   - Button with arrow icon
` : page.name === 'About' ? `
👤 ABOUT PAGE REQUIREMENTS:
1. Hero Banner:
   - Gradient background
   - Large heading with gradient text
   - Brief intro paragraph

2. Story Section:
   - Two-column layout
   - Image placeholder on left
   - Content on right
   - Timeline or milestones

3. Skills/Expertise:
   - Grid of skill cards
   - Progress bars or badges
   - Icons for each skill

4. Team/Values (if applicable):
   - Card grid with avatars
   - Hover effects
` : page.name === 'Contact' ? `
📧 CONTACT PAGE REQUIREMENTS:
1. Hero Section:
   - Gradient background
   - Heading and description

2. Contact Form:
   - Glass morphism card
   - Custom input fields with Tailwind
   - <input className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg">
   - Name, Email, Message fields
   - Gradient submit button
   - Form validation states

3. Contact Info:
   - Email, phone, location
   - Social media links with icons
   - Animated on hover

4. Map/Location (optional):
   - Placeholder with gradient
` : `
📄 ${page.name.toUpperCase()} PAGE REQUIREMENTS:
- Stunning hero section with gradient
- Relevant content sections
- Cards with glass morphism
- Smooth animations
- Call-to-action elements
`}

✅ MANDATORY:
- Import React, useState if needed
- Import motion from 'framer-motion'
- Import Lucide icons (relevant to content)
- Build UI with pure Tailwind CSS (NO Flowbite!)
${page.name === 'Home' ? `- Import and USE components: Hero, Projects, Skills from '../components/'` : ''}
${page.name === 'About' ? `- Import and USE components: About from '../components/'` : ''}
${page.name === 'Contact' ? `- Import and USE components: Contact from '../components/'` : ''}
- Use Tailwind extensively (gradients, shadows, hover effects)
- Add Framer Motion animations (fade in, slide up, stagger)
- NO placeholders - real, meaningful content
- Make it look EXPENSIVE and PROFESSIONAL

${page.name === 'Home' ? `
⚠️ CRITICAL FOR HOME PAGE:
The page structure should be:
function Home() {
  return (
    <div>
      <Hero />
      <Projects />
      <Skills />
    </div>
  );
}

Import these components from '../components/' and let THEM handle the content!
` : page.name === 'About' ? `
⚠️ CRITICAL FOR ABOUT PAGE:
Import and use the About component:
import About from '../components/About';

function AboutPage() {
  return <About />;
}
` : page.name === 'Contact' ? `
⚠️ CRITICAL FOR CONTACT PAGE:
Import and use the Contact component:
import Contact from '../components/Contact';

function ContactPage() {
  return <Contact />;
}
` : ''}

Generate ONLY this file:
<file path="src/pages/${page.name}.jsx">
...complete, stunning, production-ready code...
</file>

Create a BEAUTIFUL page that looks like it cost $10,000 to design!`;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: pagePrompt,
        mode: 'bolt-builder'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate ${page.name}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let content = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'progress' || data.type === 'content') {
              content += data.content;
            }
          } catch (e) {
            // Ignore
          }
        }
      }
    }

    const files = parseFiles(content);
    allFiles.push(...files);

    onProgress({
      type: 'success',
      message: `  ✅ ${page.name}.jsx generated`
    });

    // Small delay between pages to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  onProgress({
    type: 'success',
    message: `✅ All ${pages.length} pages generated`
  });

  return allFiles;
}

/**
 * Generate components one by one
 */
async function generateComponents(projectPlan, onProgress) {
  // Default components needed by pages
  const defaultComponents = [
    { name: 'Header', description: 'Navigation header with logo and menu' },
    { name: 'Footer', description: 'Footer with links and copyright' },
    { name: 'Hero', description: 'Hero section with large heading, description, and CTA buttons' },
    { name: 'Projects', description: 'Projects showcase grid with cards' },
    { name: 'Skills', description: 'Skills display with icons and descriptions' },
    { name: 'About', description: 'About section with story and timeline' },
    { name: 'Contact', description: 'Contact form with input fields' }
  ];
  
  const components = projectPlan.components || defaultComponents;

  onProgress({
    type: 'info',
    message: `🧩 Step 3/5: Generating ${components.length} components...`
  });

  const allFiles = [];

  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    
    onProgress({
      type: 'info',
      message: `  ⏳ Generating ${component.name}.jsx (${i + 1}/${components.length})...`
    });

    const libraryInstructions = buildLibraryInstructions();
    
    const componentPrompt = `${libraryInstructions}

Generate a complete, production-ready React component.

PROJECT CONTEXT:
- Project Name: ${projectPlan.name}
- Project Type: ${projectPlan.projectType}
- User's Original Request: "${projectPlan.description || projectPlan.name}"

Component Details:
- Name: ${component.name}
- Description: ${component.description}

IMPORTANT: Create content that matches the project context above, NOT generic placeholder content!

🎨 VISUAL REQUIREMENTS (MANDATORY):
${component.name.includes('Card') || component.name.includes('Product') || component.name.includes('Game') ? `
- ✅ MUST include Unsplash images for EVERY item
- ✅ Use high-quality product photos
- ✅ Add hover effects on images (scale, brightness)
- ✅ Include price, rating, and "Add to Cart" button
- Example: <img src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80" className="w-full h-48 object-cover rounded-lg" />
` : ''}
${component.name.includes('Hero') ? `
- ✅ MUST include a stunning background image or product showcase
- ✅ Use large, bold typography (text-6xl or larger)
- ✅ Add animated elements with Framer Motion
- ✅ Include CTA buttons with UIverse components
` : ''}
- ✅ Create UIverse-style animated buttons with glow effects
- ✅ Create ReactBits-style smooth animations
- ✅ Add Framer Motion for all interactions
- ✅ Make it look PREMIUM and EXPENSIVE

🚨 CRITICAL JSX RULES - YOUR CODE WILL NOT COMPILE IF YOU BREAK THESE:

1. ✅ EVERY COMPONENT MUST RETURN EXACTLY ONE ROOT ELEMENT!
   
   ❌ WRONG (WILL BREAK):
   return (
     <motion.div>...</motion.div>
     <Footer />
   );
   
   ✅ CORRECT:
   return (
     <div>
       <motion.div>...</motion.div>
       <Footer />
     </div>
   );
   
   ✅ OR USE FRAGMENT:
   return (
     <>
       <motion.div>...</motion.div>
       <Footer />
     </>
   );
   
   - COUNT YOUR TAGS! Every <motion.div> needs </motion.div>
   - Every <section> needs </section>
   - NO extra closing tags!
   - NO missing closing tags!
   - NO adjacent elements without a wrapper!

2. ❌ ABSOLUTELY NO FLOWBITE! DO NOT IMPORT FROM 'flowbite-react'!
   - NO: import { Card } from 'flowbite-react'
   - YES: Create UIverse-inspired components inline
   
2. ✅ Use styled-components for UIverse-style animations
   - Import: import styled from 'styled-components';
   - Create StyledWrapper components with @keyframes animations
   - Add hover effects, transforms, gradients
   - Use CSS animations for loaders, buttons, cards
   - styled-components is ALREADY installed!
   
3. ✅ Use Framer Motion for ReactBits-style animations
   - Import: import { motion } from 'framer-motion';
   - Text reveal, stagger, scroll-triggered animations
   - Smooth transitions and spring physics
   - framer-motion is ALREADY installed!
   
🚨 CRITICAL: EVERY COMPONENT MUST RETURN ONE ROOT ELEMENT!

❌ WRONG (WILL BREAK BUILD):
function ${component.name}() {
  return (
    <motion.div>...</motion.div>
    <div>...</div>
  );
}

✅ CORRECT:
function ${component.name}() {
  return (
    <div>
      <motion.div>...</motion.div>
      <div>...</div>
    </div>
  );
}

RULES:
1. ✅ Count your tags! Every opening tag needs a closing tag
2. ✅ NO adjacent elements at root level
3. ✅ Use pure Tailwind CSS (NO Flowbite!)
4. ✅ Use Framer Motion for animations
5. ✅ Use Lucide React for icons
6. ✅ Export as default

⚠️ IF YOU BREAK JSX RULES OR IMPORT FLOWBITE, THE BUILD WILL FAIL!

Generate ONLY this file:
<file path="src/components/${component.name}.jsx">
...complete, production-ready code...
</file>

Make it beautiful and functional - NOT a placeholder!`;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: componentPrompt,
        mode: 'bolt-builder'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate ${component.name}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let content = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'progress' || data.type === 'content') {
              content += data.content;
            }
          } catch (e) {
            // Ignore
          }
        }
      }
    }

    const files = parseFiles(content);
    allFiles.push(...files);

    onProgress({
      type: 'success',
      message: `  ✅ ${component.name}.jsx generated`
    });

    // Small delay between components
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  onProgress({
    type: 'success',
    message: `✅ All ${components.length} components generated`
  });

  return allFiles;
}

/**
 * Parse files from AI response
 */
function parseFiles(content) {
  const files = [];
  const fileRegex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
  
  // Debug: Log content length
  console.log('Parsing content, length:', content?.length || 0);
  
  let match;
  while ((match = fileRegex.exec(content)) !== null) {
    const [, path, fileContent] = match;
    console.log('Found file:', path);
    files.push({
      path: path.trim(),
      content: fileContent.trim()
    });
  }
  
  console.log('Parsed files count:', files.length);
  return files;
}

/**
 * Convert flat file list to tree structure
 */
function filesToTree(files) {
  const tree = [];
  let idCounter = 0;
  
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = tree;
    let currentPath = '';
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      currentPath += (currentPath ? '/' : '') + part;
      
      if (isFile) {
        current.push({
          id: `file-${idCounter++}`,
          type: 'file',
          name: part,
          path: currentPath,
          content: file.content
        });
      } else {
        let folder = current.find(n => n.type === 'folder' && n.name === part);
        if (!folder) {
          folder = {
            id: `folder-${idCounter++}`,
            type: 'folder',
            name: part,
            path: currentPath,
            children: []
          };
          current.push(folder);
        }
        current = folder.children;
      }
    }
  });
  
  return tree;
}

/**
 * Main incremental generation function
 */
export async function generateIncremental(projectPlan, onProgress) {
  try {
    onProgress({
      type: 'info',
      message: '🚀 Starting incremental generation with Claude Sonnet 4.5...'
    });

    // Step 1: Generate project structure
    const structureFiles = await generateProjectStructure(projectPlan, onProgress);
    
    // Small delay to ensure files are written
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Generate components first (they're imported by pages)
    const componentFiles = await generateComponents(projectPlan, onProgress);
    
    // Small delay to ensure components are written before pages try to import them
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 3: Generate pages (they're imported by App.jsx)
    const pageFiles = await generatePages(projectPlan, onProgress);
    
    // Small delay to ensure pages are written before App tries to import them
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 4: Generate App.jsx last (it imports pages and components)
    const appFiles = await generateAppFile(projectPlan, onProgress);
    
    // Combine all files in correct order
    console.log('Structure files:', structureFiles?.length || 0);
    console.log('Component files:', componentFiles?.length || 0);
    console.log('Page files:', pageFiles?.length || 0);
    console.log('App files:', appFiles?.length || 0);
    
    const allFiles = [
      ...structureFiles,
      ...componentFiles,
      ...pageFiles,
      ...appFiles
    ];

    console.log('Total files:', allFiles.length);

    onProgress({
      type: 'success',
      message: `🎉 Generation complete! Created ${allFiles.length} files`
    });

    // Convert to tree structure
    const fileTree = filesToTree(allFiles);
    
    return {
      success: true,
      files: fileTree,
      fileCount: allFiles.length
    };
    
  } catch (error) {
    onProgress({
      type: 'error',
      message: `❌ Generation failed: ${error.message}`
    });
    
    throw error;
  }
}

/**
 * Intelligent Project Planner
 * Analyzes prompts like a real developer and creates complete file structure
 */

/**
 * Analyze prompt and extract project requirements
 */
export function analyzePrompt(userPrompt) {
  const analysis = {
    projectType: detectProjectType(userPrompt),
    features: extractFeatures(userPrompt),
    pages: extractPages(userPrompt),
    components: extractComponents(userPrompt),
    routing: needsRouting(userPrompt),
    stateManagement: needsStateManagement(userPrompt),
    api: needsAPI(userPrompt),
    userDetails: extractUserDetails(userPrompt)
  };
  
  return analysis;
}

/**
 * Detect project type from prompt
 */
function detectProjectType(prompt) {
  const lower = prompt.toLowerCase();
  
  if (lower.includes('e-commerce') || lower.includes('shop') || lower.includes('store') || lower.includes('product')) {
    return 'ecommerce';
  }
  if (lower.includes('portfolio') || lower.includes('personal website')) {
    return 'portfolio';
  }
  if (lower.includes('blog')) {
    return 'blog';
  }
  if (lower.includes('dashboard') || lower.includes('admin')) {
    return 'dashboard';
  }
  if (lower.includes('landing page')) {
    return 'landing';
  }
  
  return 'website';
}

/**
 * Extract features from prompt
 */
function extractFeatures(prompt) {
  const features = [];
  const lower = prompt.toLowerCase();
  
  if (lower.includes('cart') || lower.includes('shopping')) features.push('shopping-cart');
  if (lower.includes('auth') || lower.includes('login')) features.push('authentication');
  if (lower.includes('search')) features.push('search');
  if (lower.includes('filter')) features.push('filtering');
  if (lower.includes('payment')) features.push('payment');
  if (lower.includes('contact')) features.push('contact-form');
  if (lower.includes('newsletter')) features.push('newsletter');
  
  return features;
}

/**
 * Extract pages from prompt
 */
function extractPages(prompt) {
  const pages = [];
  const lower = prompt.toLowerCase();
  
  // E-commerce pages
  if (lower.includes('e-commerce') || lower.includes('shop') || lower.includes('store')) {
    pages.push(
      { name: 'Home', path: '/', description: 'Homepage with featured products' },
      { name: 'Shop', path: '/shop', description: 'Product listing page' },
      { name: 'ProductDetail', path: '/product/:id', description: 'Individual product page' },
      { name: 'Cart', path: '/cart', description: 'Shopping cart page' },
      { name: 'Checkout', path: '/checkout', description: 'Checkout page' }
    );
  }
  // Portfolio pages
  else if (lower.includes('portfolio')) {
    pages.push(
      { name: 'Home', path: '/', description: 'Homepage with hero section' }
    );
  }
  // Blog pages
  else if (lower.includes('blog')) {
    pages.push(
      { name: 'Home', path: '/', description: 'Blog homepage' },
      { name: 'BlogPost', path: '/post/:id', description: 'Individual blog post' },
      { name: 'Archive', path: '/archive', description: 'Blog archive' }
    );
  }
  // Default pages
  else {
    pages.push(
      { name: 'Home', path: '/', description: 'Homepage' }
    );
  }
  
  // Add common pages
  if (lower.includes('about')) {
    pages.push({ name: 'About', path: '/about', description: 'About page' });
  }
  if (lower.includes('contact')) {
    pages.push({ name: 'Contact', path: '/contact', description: 'Contact page' });
  }
  
  return pages;
}

/**
 * Extract components from prompt and project type
 */
function extractComponents(prompt) {
  const components = [];
  const lower = prompt.toLowerCase();
  
  // Always include base components
  components.push(
    { name: 'Header', description: 'Navigation header' },
    { name: 'Footer', description: 'Site footer' }
  );
  
  // E-commerce components
  if (lower.includes('e-commerce') || lower.includes('shop') || lower.includes('product')) {
    components.push(
      { name: 'ProductCard', description: 'Product display card' },
      { name: 'ProductGrid', description: 'Grid of products' },
      { name: 'CartItem', description: 'Shopping cart item' },
      { name: 'SearchBar', description: 'Product search' }
    );
  }
  
  // Portfolio components
  if (lower.includes('portfolio')) {
    components.push(
      { name: 'Hero', description: 'Hero section' },
      { name: 'ProjectCard', description: 'Project showcase card' },
      { name: 'SkillBar', description: 'Skills display' }
    );
  }
  
  // Blog components
  if (lower.includes('blog')) {
    components.push(
      { name: 'BlogCard', description: 'Blog post card' },
      { name: 'BlogContent', description: 'Blog post content' }
    );
  }
  
  return components;
}

/**
 * Check if routing is needed
 */
function needsRouting(prompt) {
  const lower = prompt.toLowerCase();
  return lower.includes('page') || 
         lower.includes('shop') || 
         lower.includes('blog') ||
         lower.includes('about') ||
         lower.includes('contact');
}

/**
 * Check if state management is needed
 */
function needsStateManagement(prompt) {
  const lower = prompt.toLowerCase();
  return lower.includes('cart') || 
         lower.includes('auth') || 
         lower.includes('user');
}

/**
 * Check if API is needed
 */
function needsAPI(prompt) {
  const lower = prompt.toLowerCase();
  return lower.includes('api') || 
         lower.includes('backend') || 
         lower.includes('database');
}

/**
 * Extract user details from prompt
 */
function extractUserDetails(prompt) {
  const details = {
    name: null,
    profession: null,
    description: null
  };
  
  // Extract name (look for "for [Name]" or "named [Name]")
  const nameMatch = prompt.match(/(?:for|named|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (nameMatch) {
    details.name = nameMatch[1];
  }
  
  // Extract profession
  const professionMatch = prompt.match(/(?:blockchain developer|web developer|designer|engineer|developer|freelancer)/i);
  if (professionMatch) {
    details.profession = professionMatch[0];
  }
  
  return details;
}

/**
 * Create complete file structure plan
 */
export function createCompleteFileStructure(analysis) {
  const structure = {
    pages: [],
    components: [],
    utils: [],
    config: [],
    routing: null
  };
  
  // Create page files
  analysis.pages.forEach(page => {
    structure.pages.push({
      name: `${page.name}.jsx`,
      path: `src/pages/${page.name}.jsx`,
      type: 'page',
      route: page.path,
      description: page.description
    });
  });
  
  // Create component files
  analysis.components.forEach(component => {
    structure.components.push({
      name: `${component.name}.jsx`,
      path: `src/components/${component.name}.jsx`,
      type: 'component',
      description: component.description
    });
  });
  
  // Add routing if needed
  if (analysis.routing) {
    structure.routing = {
      name: 'router.jsx',
      path: 'src/router.jsx',
      type: 'config',
      description: 'React Router configuration'
    };
  }
  
  // Add state management if needed
  if (analysis.stateManagement) {
    structure.utils.push({
      name: 'store.js',
      path: 'src/store/store.js',
      type: 'state',
      description: 'State management store'
    });
  }
  
  // Add base config files
  structure.config.push(
    { name: 'App.jsx', path: 'src/App.jsx', type: 'main' },
    { name: 'main.jsx', path: 'src/main.jsx', type: 'entry' },
    { name: 'index.css', path: 'src/index.css', type: 'style' }
  );
  
  return structure;
}

/**
 * Generate enhanced prompt for AI with complete file list
 */
export function generateIntelligentPrompt(userPrompt, analysis, structure) {
  const allFiles = [
    ...structure.pages,
    ...structure.components,
    ...structure.utils,
    ...structure.config
  ];
  
  if (structure.routing) {
    allFiles.push(structure.routing);
  }
  
  return `
${userPrompt}

🧠 INTELLIGENT PROJECT ANALYSIS:

**Project Type:** ${analysis.projectType}
**Features:** ${analysis.features.join(', ') || 'Basic website'}
**Routing:** ${analysis.routing ? 'Yes (React Router)' : 'No'}
**State Management:** ${analysis.stateManagement ? 'Yes (Context/Zustand)' : 'No'}

📋 COMPLETE FILE STRUCTURE TO GENERATE:

${allFiles.map((file, i) => `${i + 1}. ${file.path} - ${file.description || file.type}`).join('\n')}

🚨 CRITICAL REQUIREMENTS:

1. **GENERATE ALL ${allFiles.length} FILES** - No exceptions, no placeholders
2. **EACH FILE MUST BE COMPLETE** - Full working code, not stubs
3. **ALL IMPORTS MUST WORK** - Every import must have a corresponding file
4. **USE REAL LIBRARIES** - framer-motion, flowbite-react, lucide-react
5. **ROUTING MUST WORK** - If multi-page, use React Router properly
6. **NO "UNDER CONSTRUCTION"** - Every component must be fully functional

📦 REQUIRED DEPENDENCIES (ALREADY ADDED):
- react, react-dom
- react-router-dom (if routing needed)
- framer-motion
- flowbite, flowbite-react
- lucide-react
- tailwindcss

🎨 DESIGN REQUIREMENTS:
- Modern, professional UI
- Smooth animations
- Responsive design
- Consistent color scheme
- Real content (not Lorem Ipsum)

${analysis.userDetails.name ? `\n👤 PERSONALIZATION:\n- Name: ${analysis.userDetails.name}\n- Profession: ${analysis.userDetails.profession || 'Professional'}\n` : ''}

⚠️ IF YOU SKIP ANY FILE, THE PROJECT WILL FAIL!
⚠️ GENERATE COMPLETE, WORKING CODE FOR EVERY FILE!
`;
}

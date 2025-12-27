/**
 * Project Planner Service
 * Analyzes user requests and plans the entire project structure
 * This is what makes us smarter than Bolt and Lovable!
 * NOW WITH INTELLIGENT EXTERNAL LIBRARY INTEGRATION!
 */

import { analyzeAndRecommendLibraries } from '../libraries/libraryAnalyzer';
import { generateLibraryPrompt, addLibraryDependencies } from '../libraries/externalLibraries';
import { extractUserDetails, generatePersonalizedPrompt, validateUserDetails } from './contentExtractor';
import { generateExamplesPrompt } from '../libraries/componentExamples';

/**
 * Project types we can detect
 */
const PROJECT_TYPES = {
  PORTFOLIO: 'portfolio',
  LANDING_PAGE: 'landing-page',
  BLOG: 'blog',
  DASHBOARD: 'dashboard',
  ECOMMERCE: 'ecommerce',
  SAAS: 'saas',
  CORPORATE: 'corporate',
  CUSTOM: 'custom'
};

/**
 * Analyze user request and determine project type
 */
export function analyzeProjectType(userRequest) {
  const request = userRequest.toLowerCase();
  
  // Portfolio indicators
  if (request.includes('portfolio') || request.includes('resume') || 
      request.includes('cv') || request.includes('personal website')) {
    return PROJECT_TYPES.PORTFOLIO;
  }
  
  // Landing page indicators
  if (request.includes('landing') || request.includes('product page') ||
      request.includes('marketing') || request.includes('sales page')) {
    return PROJECT_TYPES.LANDING_PAGE;
  }
  
  // Blog indicators
  if (request.includes('blog') || request.includes('article') ||
      request.includes('post') || request.includes('news')) {
    return PROJECT_TYPES.BLOG;
  }
  
  // Dashboard indicators
  if (request.includes('dashboard') || request.includes('admin') ||
      request.includes('analytics') || request.includes('crm')) {
    return PROJECT_TYPES.DASHBOARD;
  }
  
  // E-commerce indicators
  if (request.includes('shop') || request.includes('store') ||
      request.includes('ecommerce') || request.includes('e-commerce') ||
      request.includes('product') || request.includes('cart')) {
    return PROJECT_TYPES.ECOMMERCE;
  }
  
  // SaaS indicators
  if (request.includes('saas') || request.includes('app') ||
      request.includes('platform') || request.includes('service')) {
    return PROJECT_TYPES.SAAS;
  }
  
  // Corporate indicators
  if (request.includes('corporate') || request.includes('business') ||
      request.includes('company') || request.includes('enterprise')) {
    return PROJECT_TYPES.CORPORATE;
  }
  
  return PROJECT_TYPES.CUSTOM;
}

/**
 * Get required components for each project type
 */
export function getRequiredComponents(projectType) {
  const componentMap = {
    [PROJECT_TYPES.PORTFOLIO]: [
      { name: 'Header', path: 'src/components/Header.jsx', priority: 'high' },
      { name: 'Hero', path: 'src/components/Hero.jsx', priority: 'high' },
      { name: 'About', path: 'src/components/About.jsx', priority: 'high' },
      { name: 'Projects', path: 'src/components/Projects.jsx', priority: 'high' },
      { name: 'ProjectCard', path: 'src/components/ProjectCard.jsx', priority: 'medium' },
      { name: 'Skills', path: 'src/components/Skills.jsx', priority: 'medium' },
      { name: 'Contact', path: 'src/components/Contact.jsx', priority: 'high' },
      { name: 'Footer', path: 'src/components/Footer.jsx', priority: 'medium' }
    ],
    
    [PROJECT_TYPES.LANDING_PAGE]: [
      { name: 'Header', path: 'src/components/Header.jsx', priority: 'high' },
      { name: 'Hero', path: 'src/components/Hero.jsx', priority: 'high' },
      { name: 'Features', path: 'src/components/Features.jsx', priority: 'high' },
      { name: 'FeatureCard', path: 'src/components/FeatureCard.jsx', priority: 'medium' },
      { name: 'Pricing', path: 'src/components/Pricing.jsx', priority: 'high' },
      { name: 'PricingCard', path: 'src/components/PricingCard.jsx', priority: 'medium' },
      { name: 'Testimonials', path: 'src/components/Testimonials.jsx', priority: 'medium' },
      { name: 'CTA', path: 'src/components/CTA.jsx', priority: 'high' },
      { name: 'Footer', path: 'src/components/Footer.jsx', priority: 'medium' }
    ],
    
    [PROJECT_TYPES.BLOG]: [
      { name: 'Header', path: 'src/components/Header.jsx', priority: 'high' },
      { name: 'Hero', path: 'src/components/Hero.jsx', priority: 'high' },
      { name: 'PostList', path: 'src/components/PostList.jsx', priority: 'high' },
      { name: 'PostCard', path: 'src/components/PostCard.jsx', priority: 'high' },
      { name: 'Sidebar', path: 'src/components/Sidebar.jsx', priority: 'medium' },
      { name: 'Categories', path: 'src/components/Categories.jsx', priority: 'medium' },
      { name: 'Newsletter', path: 'src/components/Newsletter.jsx', priority: 'medium' },
      { name: 'Footer', path: 'src/components/Footer.jsx', priority: 'medium' }
    ],
    
    [PROJECT_TYPES.DASHBOARD]: [
      { name: 'Sidebar', path: 'src/components/Sidebar.jsx', priority: 'high' },
      { name: 'Header', path: 'src/components/Header.jsx', priority: 'high' },
      { name: 'StatsCard', path: 'src/components/StatsCard.jsx', priority: 'high' },
      { name: 'Chart', path: 'src/components/Chart.jsx', priority: 'high' },
      { name: 'Table', path: 'src/components/Table.jsx', priority: 'high' },
      { name: 'UserProfile', path: 'src/components/UserProfile.jsx', priority: 'medium' }
    ],
    
    [PROJECT_TYPES.ECOMMERCE]: [
      { name: 'Header', path: 'src/components/Header.jsx', priority: 'high' },
      { name: 'ProductGrid', path: 'src/components/ProductGrid.jsx', priority: 'high' },
      { name: 'ProductCard', path: 'src/components/ProductCard.jsx', priority: 'high' },
      { name: 'Cart', path: 'src/components/Cart.jsx', priority: 'high' },
      { name: 'Filters', path: 'src/components/Filters.jsx', priority: 'medium' },
      { name: 'Footer', path: 'src/components/Footer.jsx', priority: 'medium' }
    ],
    
    [PROJECT_TYPES.SAAS]: [
      { name: 'Header', path: 'src/components/Header.jsx', priority: 'high' },
      { name: 'Hero', path: 'src/components/Hero.jsx', priority: 'high' },
      { name: 'Features', path: 'src/components/Features.jsx', priority: 'high' },
      { name: 'Demo', path: 'src/components/Demo.jsx', priority: 'high' },
      { name: 'Pricing', path: 'src/components/Pricing.jsx', priority: 'high' },
      { name: 'FAQ', path: 'src/components/FAQ.jsx', priority: 'medium' },
      { name: 'CTA', path: 'src/components/CTA.jsx', priority: 'high' },
      { name: 'Footer', path: 'src/components/Footer.jsx', priority: 'medium' }
    ],
    
    [PROJECT_TYPES.CORPORATE]: [
      { name: 'Header', path: 'src/components/Header.jsx', priority: 'high' },
      { name: 'Hero', path: 'src/components/Hero.jsx', priority: 'high' },
      { name: 'Services', path: 'src/components/Services.jsx', priority: 'high' },
      { name: 'About', path: 'src/components/About.jsx', priority: 'high' },
      { name: 'Team', path: 'src/components/Team.jsx', priority: 'medium' },
      { name: 'Contact', path: 'src/components/Contact.jsx', priority: 'high' },
      { name: 'Footer', path: 'src/components/Footer.jsx', priority: 'medium' }
    ]
  };
  
  return componentMap[projectType] || [];
}

/**
 * Get required dependencies for project type
 */
export function getRequiredDependencies(projectType) {
  const baseDeps = {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.294.0",
    "styled-components": "^6.1.8"
  };
  
  const baseDevDeps = {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  };
  
  // Additional deps based on project type
  const typeDeps = {
    [PROJECT_TYPES.DASHBOARD]: {
      "recharts": "^2.10.3",
      "lucide-react": "^0.294.0"
    },
    [PROJECT_TYPES.BLOG]: {
      "react-markdown": "^9.0.1",
      "date-fns": "^3.0.0"
    },
    [PROJECT_TYPES.ECOMMERCE]: {
      "lucide-react": "^0.294.0"
    }
  };
  
  return {
    dependencies: { ...baseDeps, ...(typeDeps[projectType] || {}) },
    devDependencies: baseDevDeps
  };
}

/**
 * Generate file structure for project
 */
export function generateFileStructure(projectType, components) {
  return {
    type: 'folder',
    name: 'root',
    children: [
      {
        type: 'file',
        name: 'package.json',
        required: true
      },
      {
        type: 'file',
        name: 'index.html',
        required: true
      },
      {
        type: 'file',
        name: 'vite.config.js',
        required: true
      },
      {
        type: 'file',
        name: 'tailwind.config.js',
        required: true
      },
      {
        type: 'file',
        name: 'postcss.config.js',
        required: true
      },
      {
        type: 'folder',
        name: 'public',
        children: []
      },
      {
        type: 'folder',
        name: 'src',
        children: [
          {
            type: 'file',
            name: 'main.jsx',
            required: true
          },
          {
            type: 'file',
            name: 'App.jsx',
            required: true
          },
          {
            type: 'file',
            name: 'index.css',
            required: true
          },
          {
            type: 'folder',
            name: 'components',
            children: components.map(comp => ({
              type: 'file',
              name: comp.name + '.jsx',
              required: comp.priority === 'high'
            }))
          }
        ]
      }
    ]
  };
}

/**
 * Create a complete project plan (WITH LIBRARY INTEGRATION!)
 */
export async function createProjectPlan(userRequest) {
  // Step 1: Analyze project type
  const projectType = analyzeProjectType(userRequest);
  
  // Step 2: Use AI to analyze what components are ACTUALLY needed (NEW!)
  // Import dynamically to avoid circular dependencies
  const { analyzeRequiredComponents, formatComponentsForPlan } = await import('./smartComponentAnalyzer.js');
  const analyzedComponents = await analyzeRequiredComponents(userRequest);
  const components = formatComponentsForPlan(analyzedComponents);
  
  // Step 3: Get dependencies
  const dependencies = getRequiredDependencies(projectType);
  
  // Step 4: Generate file structure
  const fileStructure = generateFileStructure(projectType, components);
  
  // Step 5: Estimate complexity and time
  const complexity = components.length > 8 ? 'high' : components.length > 5 ? 'medium' : 'low';
  const estimatedTime = complexity === 'high' ? '45-60s' : complexity === 'medium' ? '30-45s' : '15-30s';
  
  // Step 6: ANALYZE AND RECOMMEND EXTERNAL LIBRARIES
  const basePlan = {
    projectType,
    components,
    dependencies,
    fileStructure,
    complexity,
    estimatedTime
  };
  
  const libraryAnalysis = analyzeAndRecommendLibraries(basePlan, userRequest);
  
  // Step 7: ADD LIBRARY DEPENDENCIES TO PACKAGE.JSON
  const enhancedDependencies = libraryAnalysis.recommendations.length > 0
    ? addLibraryDependencies(dependencies, libraryAnalysis.recommendations)
    : dependencies;
  
  // Step 8: EXTRACT USER DETAILS (NO MORE JOHN DOE!)
  const userDetails = extractUserDetails(userRequest);
  const validation = validateUserDetails(userDetails);
  
  return {
    name: userRequest, // CRITICAL: Store the original user request!
    description: userRequest, // Store it as description too
    projectType,
    components,
    dependencies: enhancedDependencies, // Now includes library dependencies!
    fileStructure,
    complexity,
    estimatedTime,
    libraries: libraryAnalysis,
    userDetails,
    summary: {
      totalComponents: components.length,
      highPriority: components.filter(c => c.priority === 'high').length,
      totalDependencies: Object.keys(enhancedDependencies.dependencies).length + Object.keys(enhancedDependencies.devDependencies).length,
      recommendedLibraries: libraryAnalysis.recommendations.length,
      hasPersonalization: userDetails.hasRealData
    }
  };
}

/**
 * Generate enhanced AI prompt with project plan (WITH LIBRARIES AND PERSONALIZATION!)
 */
export function generateEnhancedPrompt(userRequest, projectPlan) {
  const { projectType, components, dependencies, libraries, userDetails } = projectPlan;
  
  const componentList = components.map(c => `- ${c.name} (${c.path})`).join('\n');
  
  // Generate library-specific prompt
  const libraryPrompt = libraries && libraries.recommendations.length > 0
    ? generateLibraryPrompt(projectType, libraries.recommendations)
    : '';
  
  // Generate ACTUAL CODE EXAMPLES (NEW!)
  const examplesPrompt = libraries && libraries.recommendations.length > 0
    ? generateExamplesPrompt(libraries.recommendations)
    : '';
  
  // Generate personalization prompt (CRITICAL!)
  const personalizationPrompt = userDetails && userDetails.hasRealData
    ? generatePersonalizedPrompt(userDetails)
    : '';
  
  return `${userRequest}

PROJECT PLAN:
Type: ${projectType}
Components Required (YOU MUST CREATE ALL OF THESE):
${componentList}

CRITICAL INSTRUCTIONS:
1. Create EVERY component listed above - no exceptions!
2. Each component must be FULLY FUNCTIONAL with COMPLETE content
3. Use the exact file paths specified
4. Include all necessary imports
5. Make components responsive and accessible
6. Use modern React hooks and best practices

🚨 ABSOLUTELY FORBIDDEN:
❌ NO "This component is under construction"
❌ NO "Coming soon" placeholders
❌ NO empty/stub components
❌ NO TODO comments instead of real code

✅ REQUIRED FOR EACH COMPONENT:
- Projects → Real project cards with images, titles, descriptions, links
- Contact → Working form with name, email, message fields + validation
- Footer → Complete footer with social links, copyright, navigation
- About → Full bio, skills list, experience timeline
- ALL components must have REAL, WORKING content!

Dependencies to include:
${JSON.stringify(dependencies, null, 2)}

${libraryPrompt}

${examplesPrompt}

${personalizationPrompt}

Remember: Generate complete, production-ready code for ALL components with EXACT user details and REAL library imports!`;
}

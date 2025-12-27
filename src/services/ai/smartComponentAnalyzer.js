/**
 * Smart Component Analyzer
 * Uses AI to analyze user prompts and determine exactly what components are needed
 * NO MORE COOKIE-CUTTER TEMPLATES!
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Analyze user prompt and determine required components
 */
export async function analyzeRequiredComponents(userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const analysisPrompt = `You are a web development expert. Analyze this user request and determine EXACTLY what components are needed.

User Request: "${userPrompt}"

CRITICAL RULES:
1. ONLY include components that are ACTUALLY needed for this specific request
2. DO NOT include generic components like "Testimonials" or "Pricing" unless explicitly mentioned
3. Think about what the user is REALLY asking for
4. Be specific - if it's an e-commerce site, include ProductGrid, Cart, Checkout, etc.
5. If it's a game store, include GameCatalog, GameCard, ShoppingCart, etc.
6. If it's a portfolio, include Projects, Skills, etc.

Return a JSON array of components in this EXACT format:
[
  {
    "name": "ComponentName",
    "description": "What this component does",
    "priority": "high|medium|low",
    "reason": "Why this component is needed for THIS specific request"
  }
]

ALWAYS include:
- Header (navigation)
- Footer (footer)
- Hero (main landing section)

Then add ONLY the components that make sense for THIS specific request.

Examples:

Request: "Build a Lego game store"
Response: [
  {"name": "Header", "description": "Navigation with logo and cart", "priority": "high", "reason": "Every website needs navigation"},
  {"name": "Hero", "description": "Main banner showcasing featured Lego games", "priority": "high", "reason": "Landing page needs hero section"},
  {"name": "GameCatalog", "description": "Grid of Lego games for sale", "priority": "high", "reason": "Core feature - displaying games"},
  {"name": "GameCard", "description": "Individual game card with image, price, add to cart", "priority": "high", "reason": "Display individual games"},
  {"name": "ShoppingCart", "description": "Shopping cart with items and checkout", "priority": "high", "reason": "E-commerce site needs cart"},
  {"name": "Categories", "description": "Game categories filter", "priority": "medium", "reason": "Help users find games"},
  {"name": "Footer", "description": "Footer with links and info", "priority": "medium", "reason": "Every website needs footer"}
]

Request: "Build a personal blog"
Response: [
  {"name": "Header", "description": "Navigation", "priority": "high", "reason": "Every website needs navigation"},
  {"name": "Hero", "description": "Blog intro and author info", "priority": "high", "reason": "Introduce the blog"},
  {"name": "PostList", "description": "List of blog posts", "priority": "high", "reason": "Core feature - displaying posts"},
  {"name": "PostCard", "description": "Individual post preview", "priority": "high", "reason": "Display individual posts"},
  {"name": "Categories", "description": "Post categories", "priority": "medium", "reason": "Organize posts"},
  {"name": "Footer", "description": "Footer", "priority": "medium", "reason": "Every website needs footer"}
]

Now analyze this request and return ONLY the JSON array:`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse component analysis');
    }
    
    const components = JSON.parse(jsonMatch[0]);
    
    console.log('🧠 Smart Component Analysis:', components);
    
    return components;
    
  } catch (error) {
    console.error('Component analysis failed:', error);
    
    // Fallback to basic components
    return [
      { name: 'Header', description: 'Navigation header', priority: 'high', reason: 'Standard component' },
      { name: 'Hero', description: 'Hero section', priority: 'high', reason: 'Standard component' },
      { name: 'Features', description: 'Features section', priority: 'high', reason: 'Standard component' },
      { name: 'Footer', description: 'Footer', priority: 'medium', reason: 'Standard component' }
    ];
  }
}

/**
 * Convert analyzed components to the format expected by projectPlanner
 */
export function formatComponentsForPlan(analyzedComponents) {
  return analyzedComponents.map(comp => ({
    name: comp.name,
    path: `src/components/${comp.name}.jsx`,
    priority: comp.priority,
    description: comp.description
  }));
}

/**
 * Template Selector Service
 * Intelligently selects the best template based on user request
 */

import { portfolioTemplate } from './portfolioTemplate';
import { perfectTemplate } from './perfectTemplate';

// Template registry
const templates = {
  portfolio: portfolioTemplate,
  perfect: perfectTemplate,
};

/**
 * NO TEMPLATES - AI GENERATES EVERYTHING!
 * Just like Lovable, bolt.new, and Cursor
 */
export function selectTemplate(userRequest, projectType) {
  // NO TEMPLATES! AI generates unique designs
  // Claude Sonnet 4 is smart enough to create perfect code
  console.log('✅ No template - AI will generate unique design');
  return null;
}

/**
 * Check if template is available for project type
 */
export function hasTemplate(projectType) {
  return templates[projectType] !== undefined;
}

/**
 * Get all available templates
 */
export function getAllTemplates() {
  return Object.values(templates);
}

/**
 * Get template by ID
 */
export function getTemplateById(id) {
  return Object.values(templates).find(t => t.id === id);
}

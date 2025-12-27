/**
 * Template Customizer Service
 * Customizes templates with user-specific content
 * USES CONTENT EXTRACTOR - NO MORE JOHN DOE!
 */

import { extractUserDetails } from '../ai/contentExtractor';

/**
 * Extract user information from request using SMART EXTRACTION
 */
export function extractUserInfo(userRequest) {
  // Use the smart content extractor
  const extracted = extractUserDetails(userRequest);
  
  const info = {
    name: extracted.name || 'Your Name',
    title: extracted.profession || 'Professional',
    bio: extracted.description || 'Building amazing things',
    email: extracted.contact.email || 'contact@example.com',
    phone: extracted.contact.phone || '+1 (555) 123-4567',
    location: 'Your Location',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    aboutText: extracted.description || 'Passionate professional dedicated to excellence.',
    project1Title: 'Project One',
    project1Description: 'An amazing project showcasing skills',
    project2Title: 'Project Two',
    project2Description: 'Another great project',
    project3Title: 'Project Three',
    project3Description: 'A fantastic project'
  };
  
  return info;
}

/**
 * Replace template variables with actual values
 */
export function replaceVariables(content, variables) {
  let result = content;
  
  // Replace all {{variable}} placeholders
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key]);
  });
  
  return result;
}

/**
 * Customize template files with user information
 */
export function customizeTemplate(template, userInfo) {
  // Merge template variables with user info
  const variables = {
    ...template.variables,
    ...userInfo
  };
  
  // Deep clone the template files
  const customizedFiles = JSON.parse(JSON.stringify(template.files));
  
  // Recursively replace variables in all files
  function processNode(node) {
    if (node.type === 'file' && node.content) {
      node.content = replaceVariables(node.content, variables);
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => processNode(child));
    }
  }
  
  customizedFiles.forEach(node => processNode(node));
  
  return customizedFiles;
}

/**
 * Full template customization pipeline
 */
export function customizeTemplateForUser(template, userRequest) {
  // Step 1: Extract user information from request
  const userInfo = extractUserInfo(userRequest);
  
  // Step 2: Customize template with user info
  const customizedFiles = customizeTemplate(template, userInfo);
  
  return {
    files: customizedFiles,
    userInfo,
    templateId: template.id,
    templateName: template.name
  };
}

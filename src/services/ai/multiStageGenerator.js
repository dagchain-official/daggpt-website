/**
 * Multi-Stage Generation Service
 * Generates code in multiple stages for better quality
 * Stage 1: Plan → Stage 2: Generate → Stage 3: Validate → Stage 4: Optimize
 */

import { generateCode } from '../boltAI';

/**
 * Stage 1: Planning Stage
 * AI plans the entire project structure
 */
async function planningStage(userRequest, projectPlan) {
  const planningPrompt = `You are a senior software architect. Plan a ${projectPlan.projectType} project.

User Request: ${userRequest}

Create a detailed plan including:
1. Component hierarchy and relationships
2. Data flow between components
3. State management approach
4. Props for each component
5. Styling approach

Required Components:
${projectPlan.components.map(c => `- ${c.name} (${c.path})`).join('\n')}

Return ONLY a JSON object with this structure:
{
  "components": [
    {
      "name": "Header",
      "path": "src/components/Header.jsx",
      "props": ["logo", "menuItems"],
      "state": ["isMenuOpen"],
      "children": ["Navigation", "Logo"],
      "purpose": "Main navigation header"
    }
  ],
  "dataFlow": "Top-down with props, no global state needed",
  "styling": "Tailwind CSS with responsive design"
}`;

  try {
    // This would call AI to get the plan
    // For now, return a structured plan based on project type
    return {
      components: projectPlan.components.map(comp => ({
        name: comp.name,
        path: comp.path,
        props: [],
        state: [],
        children: [],
        purpose: `${comp.name} component`
      })),
      dataFlow: "Props-based component communication",
      styling: "Tailwind CSS with modern design"
    };
  } catch (error) {
    console.error('[Planning] Failed:', error);
    return null;
  }
}

/**
 * Stage 2: Generation Stage
 * Generate code based on the plan
 */
async function generationStage(userRequest, projectPlan, detailedPlan) {
  // Enhanced prompt with detailed plan
  const enhancedPrompt = `${userRequest}

DETAILED ARCHITECTURE PLAN:
${JSON.stringify(detailedPlan, null, 2)}

PROJECT REQUIREMENTS:
- Type: ${projectPlan.projectType}
- Components: ${projectPlan.summary.totalComponents}
- Complexity: ${projectPlan.complexity}

CRITICAL INSTRUCTIONS:
1. Generate EVERY component listed in the plan
2. Use the exact props and state defined
3. Follow the data flow architecture
4. Implement responsive Tailwind design
5. Add proper TypeScript-style JSDoc comments
6. Include error boundaries where needed
7. Make components accessible (ARIA labels)
8. Add loading states for async operations

⚠️ ABSOLUTELY FORBIDDEN - WILL CAUSE FAILURE:
❌ NO "under construction" text
❌ NO "coming soon" placeholders
❌ NO "TODO" comments in place of real code
❌ NO empty components
❌ NO stub implementations
❌ NO placeholder content like "Lorem ipsum"

✅ EVERY COMPONENT MUST BE FULLY FUNCTIONAL:
- Projects component → Show real project cards with images, titles, descriptions
- Contact component → Working contact form with validation
- Footer component → Complete footer with links, social icons, copyright
- About component → Full bio, skills, experience sections
- ALL components must have REAL, COMPLETE content

QUALITY REQUIREMENTS:
- Production-ready code
- COMPLETE functionality (NO placeholders!)
- Real content in every component
- Proper error handling
- Responsive design
- Accessibility compliant

🚨 IF YOU GENERATE "This component is under construction" YOU HAVE FAILED!
Generate complete, working code for ALL components with REAL content!`;

  return enhancedPrompt;
}

/**
 * Stage 3: Validation Stage
 * Validate generated code for completeness
 */
function validationStage(fileTree, projectPlan) {
  const issues = [];
  
  // Check 1: All required components exist
  const requiredComponents = projectPlan.components.map(c => c.path);
  const generatedFiles = getAllFilePaths(fileTree);
  
  requiredComponents.forEach(required => {
    if (!generatedFiles.includes(required)) {
      issues.push({
        type: 'missing_component',
        severity: 'high',
        message: `Missing required component: ${required}`,
        file: required
      });
    }
  });
  
  // Check 2: package.json exists
  if (!generatedFiles.includes('package.json')) {
    issues.push({
      type: 'missing_file',
      severity: 'critical',
      message: 'Missing package.json',
      file: 'package.json'
    });
  }
  
  // Check 3: Tailwind config exists
  if (!generatedFiles.includes('tailwind.config.js')) {
    issues.push({
      type: 'missing_config',
      severity: 'medium',
      message: 'Missing Tailwind config',
      file: 'tailwind.config.js'
    });
  }
  
  // Check 4: Main entry point exists
  const hasMainEntry = generatedFiles.some(f => 
    f.includes('main.jsx') || f.includes('main.tsx') || f.includes('index.jsx')
  );
  
  if (!hasMainEntry) {
    issues.push({
      type: 'missing_entry',
      severity: 'critical',
      message: 'Missing main entry point',
      file: 'src/main.jsx'
    });
  }
  
  // Check 5: NO "under construction" placeholders (NEW!)
  const placeholderPatterns = [
    'under construction',
    'coming soon',
    'TODO:',
    'placeholder',
    'lorem ipsum',
    'stub implementation'
  ];
  
  fileTree.forEach(node => {
    checkNodeForPlaceholders(node, placeholderPatterns, issues);
  });
  
  return {
    valid: issues.filter(i => i.severity === 'critical').length === 0,
    issues,
    score: calculateQualityScore(issues)
  };
}

/**
 * Helper: Check node for placeholder content
 */
function checkNodeForPlaceholders(node, patterns, issues) {
  if (node.type === 'file' && node.content) {
    const lowerContent = node.content.toLowerCase();
    
    patterns.forEach(pattern => {
      if (lowerContent.includes(pattern.toLowerCase())) {
        issues.push({
          type: 'placeholder_content',
          severity: 'high',
          message: `Found placeholder "${pattern}" in ${node.name}`,
          file: node.name
        });
      }
    });
  } else if (node.type === 'folder' && node.children) {
    node.children.forEach(child => checkNodeForPlaceholders(child, patterns, issues));
  }
}

/**
 * Stage 4: Optimization Stage
 * Optimize generated code
 */
function optimizationStage(fileTree) {
  const optimizations = [];
  
  // Optimization 1: Remove duplicate imports
  // Optimization 2: Consolidate CSS
  // Optimization 3: Extract common components
  // Optimization 4: Add code splitting hints
  
  return {
    optimizedFiles: fileTree,
    optimizations
  };
}

/**
 * Helper: Get all file paths from tree
 */
function getAllFilePaths(files, basePath = '') {
  const paths = [];
  
  for (const file of files) {
    const currentPath = basePath ? `${basePath}/${file.name}` : file.name;
    
    if (file.type === 'file') {
      paths.push(currentPath);
    } else if (file.type === 'folder' && file.children) {
      paths.push(...getAllFilePaths(file.children, currentPath));
    }
  }
  
  return paths;
}

/**
 * Helper: Calculate quality score
 */
function calculateQualityScore(issues) {
  const weights = {
    critical: -30,
    high: -15,
    medium: -5,
    low: -2
  };
  
  let score = 100;
  
  issues.forEach(issue => {
    score += weights[issue.severity] || 0;
  });
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Main multi-stage generation function
 */
export async function generateWithMultiStage(userRequest, projectPlan, options = {}) {
  const stages = [];
  
  try {
    // Stage 1: Planning
    stages.push({ name: 'Planning', status: 'in_progress' });
    const detailedPlan = await planningStage(userRequest, projectPlan);
    stages[0].status = 'complete';
    stages[0].result = detailedPlan;
    
    // Stage 2: Generation
    stages.push({ name: 'Generation', status: 'in_progress' });
    const enhancedPrompt = await generationStage(userRequest, projectPlan, detailedPlan);
    stages[1].status = 'complete';
    stages[1].result = { prompt: enhancedPrompt };
    
    return {
      enhancedPrompt,
      detailedPlan,
      stages
    };
  } catch (error) {
    console.error('[MultiStage] Error:', error);
    throw error;
  }
}

/**
 * Validate generated files
 */
export function validateGeneratedCode(fileTree, projectPlan) {
  return validationStage(fileTree, projectPlan);
}

/**
 * Optimize generated files
 */
export function optimizeGeneratedCode(fileTree) {
  return optimizationStage(fileTree);
}

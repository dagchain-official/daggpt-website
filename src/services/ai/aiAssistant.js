/**
 * AI Assistant Service
 * Helps users debug, optimize, and improve their generated code
 */

import { generateCode } from '../boltAI';

/**
 * AI Assistant for code help
 */
export async function getAIHelp(userQuestion, currentFiles, conversationHistory = []) {
  const systemPrompt = `You are an expert coding assistant helping users with their web projects.

CONTEXT:
The user has generated a web project and needs help with it.

YOUR ROLE:
- Answer questions about the code
- Help debug issues
- Suggest improvements
- Explain how things work
- Provide code snippets

GUIDELINES:
- Be concise and helpful
- Provide working code examples
- Explain your reasoning
- Focus on best practices
- Be encouraging and supportive

Current Project Files:
${formatFilesForContext(currentFiles)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userQuestion }
  ];

  try {
    const response = await generateCode(userQuestion, messages, {
      temperature: 0.7,
      maxTokens: 2000
    });

    return response;
  } catch (error) {
    console.error('[AI Assistant] Error:', error);
    throw error;
  }
}

/**
 * Analyze code for issues
 */
export function analyzeCode(files) {
  const issues = [];
  const suggestions = [];

  // Analyze each file
  files.forEach(file => {
    if (file.type === 'file' && file.content) {
      const fileIssues = analyzeFile(file);
      issues.push(...fileIssues.issues);
      suggestions.push(...fileIssues.suggestions);
    } else if (file.type === 'folder' && file.children) {
      const folderAnalysis = analyzeCode(file.children);
      issues.push(...folderAnalysis.issues);
      suggestions.push(...folderAnalysis.suggestions);
    }
  });

  return { issues, suggestions };
}

/**
 * Analyze single file
 */
function analyzeFile(file) {
  const issues = [];
  const suggestions = [];
  const content = file.content;

  // Check for common issues
  if (content.includes('console.log')) {
    suggestions.push({
      file: file.name,
      type: 'cleanup',
      message: 'Remove console.log statements before production'
    });
  }

  if (content.includes('TODO') || content.includes('FIXME')) {
    issues.push({
      file: file.name,
      type: 'incomplete',
      severity: 'medium',
      message: 'Contains TODO/FIXME comments'
    });
  }

  if (file.name.endsWith('.jsx') && !content.includes('export')) {
    issues.push({
      file: file.name,
      type: 'missing_export',
      severity: 'high',
      message: 'Component missing export statement'
    });
  }

  return { issues, suggestions };
}

/**
 * Format files for AI context
 */
function formatFilesForContext(files, maxFiles = 10) {
  let fileList = [];
  
  function collectFiles(nodes, path = '') {
    nodes.forEach(node => {
      const currentPath = path ? `${path}/${node.name}` : node.name;
      
      if (node.type === 'file') {
        fileList.push({
          path: currentPath,
          content: node.content?.substring(0, 500) // First 500 chars
        });
      } else if (node.type === 'folder' && node.children) {
        collectFiles(node.children, currentPath);
      }
    });
  }

  collectFiles(files);

  // Limit to most important files
  const importantFiles = fileList
    .filter(f => 
      f.path.includes('App.jsx') || 
      f.path.includes('main.jsx') ||
      f.path.includes('package.json')
    )
    .slice(0, maxFiles);

  return importantFiles
    .map(f => `File: ${f.path}\n${f.content}...\n`)
    .join('\n');
}

/**
 * Suggest optimizations
 */
export function suggestOptimizations(files) {
  const optimizations = [];

  // Check for optimization opportunities
  files.forEach(file => {
    if (file.type === 'file' && file.content) {
      const content = file.content;

      // Suggest React.memo
      if (content.includes('map(') && !content.includes('React.memo')) {
        optimizations.push({
          file: file.name,
          type: 'performance',
          title: 'Use React.memo',
          description: 'Wrap list components with React.memo to prevent unnecessary re-renders',
          code: 'export default React.memo(ComponentName);'
        });
      }

      // Suggest lazy loading
      if (content.includes('<img') && !content.includes('loading="lazy"')) {
        optimizations.push({
          file: file.name,
          type: 'performance',
          title: 'Lazy load images',
          description: 'Add loading="lazy" to images for better performance',
          code: '<img src="..." alt="..." loading="lazy" />'
        });
      }

      // Suggest code splitting
      if (content.includes('import') && content.includes('Component') && !content.includes('lazy')) {
        optimizations.push({
          file: file.name,
          type: 'performance',
          title: 'Code splitting',
          description: 'Use React.lazy for code splitting',
          code: 'const Component = React.lazy(() => import("./Component"));'
        });
      }
    } else if (file.type === 'folder' && file.children) {
      optimizations.push(...suggestOptimizations(file.children));
    }
  });

  return optimizations;
}

/**
 * Generate improvement suggestions
 */
export function generateImprovements(files, projectType) {
  const improvements = [];

  // SEO improvements
  improvements.push({
    category: 'SEO',
    title: 'Add meta tags',
    description: 'Improve SEO with proper meta tags',
    priority: 'high',
    code: `<meta name="description" content="..." />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />`
  });

  // Accessibility improvements
  improvements.push({
    category: 'Accessibility',
    title: 'Add ARIA labels',
    description: 'Improve accessibility with ARIA attributes',
    priority: 'high',
    code: `<button aria-label="Close menu">X</button>
<nav aria-label="Main navigation">...</nav>`
  });

  // Performance improvements
  improvements.push({
    category: 'Performance',
    title: 'Add loading states',
    description: 'Show loading indicators for better UX',
    priority: 'medium',
    code: `const [loading, setLoading] = useState(false);
{loading ? <Spinner /> : <Content />}`
  });

  // Security improvements
  improvements.push({
    category: 'Security',
    title: 'Sanitize user input',
    description: 'Prevent XSS attacks by sanitizing input',
    priority: 'high',
    code: `import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);`
  });

  return improvements;
}

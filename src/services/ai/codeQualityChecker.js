/**
 * Code Quality Checker Service
 * Validates generated code for quality, best practices, and completeness
 */

/**
 * Check code quality for a single file
 */
export function checkFileQuality(fileName, content) {
  const issues = [];
  const suggestions = [];
  
  // Check 1: React component best practices
  if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
    issues.push(...checkReactComponent(content));
  }
  
  // Check 2: Import organization
  issues.push(...checkImports(content));
  
  // Check 3: Code style
  issues.push(...checkCodeStyle(content));
  
  // Check 4: Accessibility
  issues.push(...checkAccessibility(content));
  
  // Check 5: Performance
  suggestions.push(...checkPerformance(content));
  
  return {
    fileName,
    issues,
    suggestions,
    score: calculateFileScore(issues, suggestions)
  };
}

/**
 * Check React component quality
 */
function checkReactComponent(content) {
  const issues = [];
  
  // Check: Component has export
  if (!content.includes('export default') && !content.includes('export function') && !content.includes('export const')) {
    issues.push({
      type: 'missing_export',
      severity: 'high',
      message: 'Component missing export statement',
      line: null
    });
  }
  
  // Check: Component has proper name
  const componentMatch = content.match(/function\s+([A-Z][a-zA-Z0-9]*)/);
  if (!componentMatch) {
    issues.push({
      type: 'naming',
      severity: 'medium',
      message: 'Component should start with capital letter',
      line: null
    });
  }
  
  // Check: Has React import
  if (!content.includes("import React") && !content.includes("import { ")) {
    issues.push({
      type: 'missing_import',
      severity: 'medium',
      message: 'Missing React import',
      line: 1
    });
  }
  
  // Check: Avoid inline functions in JSX
  const inlineFunctionCount = (content.match(/onClick=\{.*=>/g) || []).length;
  if (inlineFunctionCount > 3) {
    issues.push({
      type: 'performance',
      severity: 'low',
      message: `Too many inline functions (${inlineFunctionCount}). Consider extracting to methods.`,
      line: null
    });
  }
  
  // Check: PropTypes or TypeScript
  if (!content.includes('PropTypes') && !content.includes(': FC') && !content.includes('interface')) {
    issues.push({
      type: 'missing_types',
      severity: 'low',
      message: 'Consider adding PropTypes or TypeScript types',
      line: null
    });
  }
  
  return issues;
}

/**
 * Check import organization
 */
function checkImports(content) {
  const issues = [];
  const lines = content.split('\n');
  
  let lastImportLine = -1;
  let hasNonImportBetween = false;
  
  lines.forEach((line, index) => {
    if (line.trim().startsWith('import ')) {
      if (hasNonImportBetween) {
        issues.push({
          type: 'import_organization',
          severity: 'low',
          message: 'Imports should be grouped at the top',
          line: index + 1
        });
      }
      lastImportLine = index;
    } else if (line.trim() && !line.trim().startsWith('//') && lastImportLine >= 0) {
      hasNonImportBetween = true;
    }
  });
  
  return issues;
}

/**
 * Check code style
 */
function checkCodeStyle(content) {
  const issues = [];
  
  // Check: Consistent quotes
  const singleQuotes = (content.match(/'/g) || []).length;
  const doubleQuotes = (content.match(/"/g) || []).length;
  
  if (singleQuotes > 10 && doubleQuotes > 10) {
    issues.push({
      type: 'inconsistent_quotes',
      severity: 'low',
      message: 'Mix of single and double quotes. Be consistent.',
      line: null
    });
  }
  
  // Check: Console logs (should be removed in production)
  const consoleCount = (content.match(/console\.(log|warn|error)/g) || []).length;
  if (consoleCount > 0) {
    issues.push({
      type: 'debug_code',
      severity: 'low',
      message: `Found ${consoleCount} console statements. Remove for production.`,
      line: null
    });
  }
  
  // Check: TODO comments
  const todoCount = (content.match(/\/\/\s*TODO/gi) || []).length;
  if (todoCount > 0) {
    issues.push({
      type: 'incomplete',
      severity: 'medium',
      message: `Found ${todoCount} TODO comments. Code may be incomplete.`,
      line: null
    });
  }
  
  return issues;
}

/**
 * Check accessibility
 */
function checkAccessibility(content) {
  const issues = [];
  
  // Check: Images have alt text
  const imgWithoutAlt = (content.match(/<img(?![^>]*alt=)/g) || []).length;
  if (imgWithoutAlt > 0) {
    issues.push({
      type: 'accessibility',
      severity: 'medium',
      message: `${imgWithoutAlt} images missing alt text`,
      line: null
    });
  }
  
  // Check: Buttons have accessible text
  const emptyButtons = (content.match(/<button[^>]*>\s*<\/button>/g) || []).length;
  if (emptyButtons > 0) {
    issues.push({
      type: 'accessibility',
      severity: 'high',
      message: `${emptyButtons} empty buttons found`,
      line: null
    });
  }
  
  // Check: Form inputs have labels
  const inputsWithoutLabel = (content.match(/<input(?![^>]*aria-label)(?![^>]*id=)/g) || []).length;
  if (inputsWithoutLabel > 0) {
    issues.push({
      type: 'accessibility',
      severity: 'medium',
      message: `${inputsWithoutLabel} inputs may be missing labels`,
      line: null
    });
  }
  
  return issues;
}

/**
 * Check performance
 */
function checkPerformance(content) {
  const suggestions = [];
  
  // Suggestion: Use React.memo for expensive components
  if (content.includes('map(') && !content.includes('React.memo')) {
    suggestions.push({
      type: 'performance',
      message: 'Consider using React.memo for list components',
      line: null
    });
  }
  
  // Suggestion: Lazy load images
  if (content.includes('<img') && !content.includes('loading="lazy"')) {
    suggestions.push({
      type: 'performance',
      message: 'Add loading="lazy" to images for better performance',
      line: null
    });
  }
  
  return suggestions;
}

/**
 * Calculate file quality score
 */
function calculateFileScore(issues, suggestions) {
  let score = 100;
  
  const weights = {
    critical: -30,
    high: -15,
    medium: -5,
    low: -2
  };
  
  issues.forEach(issue => {
    score += weights[issue.severity] || 0;
  });
  
  // Suggestions don't reduce score, just provide guidance
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Check entire project quality
 */
export function checkProjectQuality(fileTree) {
  const results = [];
  
  function processNode(node, path = '') {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    
    if (node.type === 'file' && node.content) {
      const quality = checkFileQuality(currentPath, node.content);
      results.push(quality);
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => processNode(child, currentPath));
    }
  }
  
  fileTree.forEach(node => processNode(node));
  
  // Calculate overall score
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const avgScore = results.length > 0 ? totalScore / results.length : 0;
  
  // Collect all issues
  const allIssues = results.flatMap(r => r.issues);
  const criticalIssues = allIssues.filter(i => i.severity === 'critical' || i.severity === 'high');
  
  return {
    overallScore: Math.round(avgScore),
    filesChecked: results.length,
    totalIssues: allIssues.length,
    criticalIssues: criticalIssues.length,
    fileResults: results,
    summary: {
      excellent: avgScore >= 90,
      good: avgScore >= 75 && avgScore < 90,
      needsWork: avgScore < 75
    }
  };
}

/**
 * Generate quality report
 */
export function generateQualityReport(qualityCheck) {
  const { overallScore, filesChecked, totalIssues, criticalIssues, summary } = qualityCheck;
  
  let grade = 'F';
  if (overallScore >= 90) grade = 'A';
  else if (overallScore >= 80) grade = 'B';
  else if (overallScore >= 70) grade = 'C';
  else if (overallScore >= 60) grade = 'D';
  
  return {
    grade,
    score: overallScore,
    filesChecked,
    totalIssues,
    criticalIssues,
    status: summary.excellent ? 'Production Ready' : 
            summary.good ? 'Good Quality' : 
            'Needs Improvement',
    recommendation: summary.excellent ? 
      'Code quality is excellent! Ready for deployment.' :
      summary.good ?
      'Good code quality. Review and fix critical issues before deployment.' :
      'Code needs improvement. Address issues before deployment.'
  };
}

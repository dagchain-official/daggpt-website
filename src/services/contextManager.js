/**
 * Context Manager - Intelligent file selection for Claude
 * Following Bolt.new's approach: Select only relevant files to stay within context limits
 */

/**
 * Calculate token estimate for text (rough approximation)
 */
function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Get file priority based on type and name
 */
function getFilePriority(path) {
  // Higher priority = more important
  const priorities = {
    // Core files (highest priority)
    'package.json': 100,
    'vite.config.js': 90,
    'tailwind.config.js': 85,
    'postcss.config.js': 80,
    'index.html': 95,
    
    // Main app files
    'src/App.jsx': 90,
    'src/main.jsx': 85,
    'src/index.css': 70,
    
    // Component files
    'src/components/': 60,
    'src/pages/': 65,
    
    // Config files
    '.config.': 50,
    'README.md': 30,
    '.gitignore': 20,
    '.env': 10
  };
  
  // Check exact matches first
  for (const [pattern, priority] of Object.entries(priorities)) {
    if (path === pattern || path.endsWith(pattern)) {
      return priority;
    }
  }
  
  // Check partial matches
  for (const [pattern, priority] of Object.entries(priorities)) {
    if (path.includes(pattern)) {
      return priority;
    }
  }
  
  // Default priority
  return 40;
}

/**
 * Extract keywords from user prompt
 */
function extractKeywords(prompt) {
  const keywords = new Set();
  
  // Common component/feature keywords
  const patterns = [
    /\b(header|footer|nav|navigation|sidebar|menu)\b/gi,
    /\b(hero|banner|carousel|slider)\b/gi,
    /\b(form|input|button|modal|dialog)\b/gi,
    /\b(card|grid|list|table)\b/gi,
    /\b(pricing|testimonial|feature|cta)\b/gi,
    /\b(auth|login|signup|profile)\b/gi,
    /\b(dashboard|admin|settings)\b/gi,
    /\b(blog|post|article|comment)\b/gi,
    /\b(product|shop|cart|checkout)\b/gi,
    /\b(contact|about|home|landing)\b/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = prompt.match(pattern);
    if (matches) {
      matches.forEach(match => keywords.add(match.toLowerCase()));
    }
  });
  
  return Array.from(keywords);
}

/**
 * Calculate relevance score for a file based on prompt
 */
function calculateRelevance(path, content, keywords) {
  let score = 0;
  
  const pathLower = path.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Check if file path matches keywords
  keywords.forEach(keyword => {
    if (pathLower.includes(keyword)) {
      score += 20;
    }
    
    // Check if content contains keywords
    const occurrences = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
    score += occurrences * 5;
  });
  
  return score;
}

/**
 * Select relevant files for Claude context
 * @param {Object} files - All project files
 * @param {string} prompt - User prompt
 * @param {number} maxTokens - Maximum tokens for context (default: 50000)
 * @returns {Object} - Selected files with metadata
 */
export function selectRelevantFiles(files, prompt, maxTokens = 50000) {
  const keywords = extractKeywords(prompt);
  const fileScores = [];
  
  // Score all files
  for (const [path, content] of Object.entries(files)) {
    const priority = getFilePriority(path);
    const relevance = calculateRelevance(path, content, keywords);
    const tokens = estimateTokens(content);
    const score = priority + relevance;
    
    fileScores.push({
      path,
      content,
      priority,
      relevance,
      tokens,
      score
    });
  }
  
  // Sort by score (highest first)
  fileScores.sort((a, b) => b.score - a.score);
  
  // Select files within token limit
  const selectedFiles = {};
  const selectedPaths = [];
  let totalTokens = 0;
  
  for (const file of fileScores) {
    if (totalTokens + file.tokens <= maxTokens) {
      selectedFiles[file.path] = file.content;
      selectedPaths.push(file.path);
      totalTokens += file.tokens;
    } else {
      break;
    }
  }
  
  console.log(`[Context] Selected ${selectedPaths.length}/${Object.keys(files).length} files (${totalTokens} tokens)`);
  console.log('[Context] Selected files:', selectedPaths);
  
  return {
    files: selectedFiles,
    paths: selectedPaths,
    totalTokens,
    keywords,
    omittedCount: Object.keys(files).length - selectedPaths.length
  };
}

/**
 * Build context message for Claude
 */
export function buildContextMessage(prompt, selectedContext) {
  let message = `${prompt}\n\n`;
  
  if (selectedContext.keywords.length > 0) {
    message += `**Detected Keywords:** ${selectedContext.keywords.join(', ')}\n\n`;
  }
  
  message += `**Project Files (${selectedContext.paths.length} files, ~${selectedContext.totalTokens} tokens):**\n`;
  
  selectedContext.paths.forEach(path => {
    message += `- ${path}\n`;
  });
  
  if (selectedContext.omittedCount > 0) {
    message += `\n*Note: ${selectedContext.omittedCount} files omitted to stay within context limits*\n`;
  }
  
  return message;
}

/**
 * Smart file selection for refinement
 * Focuses on files likely to be affected by the change
 */
export function selectFilesForRefinement(files, userRequest, maxTokens = 30000) {
  const keywords = extractKeywords(userRequest);
  
  // If specific files are mentioned, prioritize them
  const mentionedFiles = [];
  Object.keys(files).forEach(path => {
    const fileName = path.split('/').pop().toLowerCase();
    if (userRequest.toLowerCase().includes(fileName)) {
      mentionedFiles.push(path);
    }
  });
  
  // Always include core files
  const coreFiles = [
    'package.json',
    'src/App.jsx',
    'src/main.jsx',
    'vite.config.js',
    'tailwind.config.js'
  ];
  
  const fileScores = [];
  
  for (const [path, content] of Object.entries(files)) {
    let score = getFilePriority(path);
    
    // Boost score for mentioned files
    if (mentionedFiles.includes(path)) {
      score += 100;
    }
    
    // Boost score for core files
    if (coreFiles.includes(path)) {
      score += 50;
    }
    
    // Calculate relevance
    score += calculateRelevance(path, content, keywords);
    
    const tokens = estimateTokens(content);
    
    fileScores.push({
      path,
      content,
      tokens,
      score
    });
  }
  
  // Sort by score
  fileScores.sort((a, b) => b.score - a.score);
  
  // Select files within token limit
  const selectedFiles = {};
  const selectedPaths = [];
  let totalTokens = 0;
  
  for (const file of fileScores) {
    if (totalTokens + file.tokens <= maxTokens) {
      selectedFiles[file.path] = file.content;
      selectedPaths.push(file.path);
      totalTokens += file.tokens;
    } else {
      break;
    }
  }
  
  console.log(`[Context] Refinement: Selected ${selectedPaths.length}/${Object.keys(files).length} files`);
  
  return {
    files: selectedFiles,
    paths: selectedPaths,
    totalTokens,
    keywords
  };
}

/**
 * BABEL-BASED JSX FIXER
 * Uses the same parser as Vite to detect and fix JSX errors
 */

/**
 * Simple but effective JSX fixer using string manipulation
 * This is more reliable than trying to parse with Babel
 */
export function fixJSXStructure(content, fileName) {
  if (!content) return { content, fixed: false };
  
  // Only process JSX files
  if (!fileName.endsWith('.jsx') && !fileName.endsWith('.tsx')) {
    return { content, fixed: false };
  }
  
  console.log(`🔍 Checking JSX structure in ${fileName}`);
  
  let fixed = content;
  let changesMade = false;
  
  // Strategy 1: Remove duplicate closing tags on consecutive lines
  const lines = fixed.split('\n');
  const linesToRemove = new Set();
  
  for (let i = 0; i < lines.length - 1; i++) {
    const currentTrimmed = lines[i].trim();
    const nextTrimmed = lines[i + 1].trim();
    
    // Check for duplicate closing tags
    const closingTagMatch = currentTrimmed.match(/^<\/(\w+(?:\.\w+)?)>$/);
    if (closingTagMatch) {
      const tag = closingTagMatch[1];
      const nextClosingMatch = nextTrimmed.match(/^<\/(\w+(?:\.\w+)?)>$/);
      
      if (nextClosingMatch && nextClosingMatch[1] === tag) {
        console.log(`⚠️ Found duplicate </${tag}> on lines ${i + 1} and ${i + 2}`);
        linesToRemove.add(i + 1); // Remove second occurrence (0-indexed, so i+1)
        changesMade = true;
      }
    }
  }
  
  if (linesToRemove.size > 0) {
    fixed = lines.filter((_, index) => !linesToRemove.has(index)).join('\n');
    console.log(`✅ Removed ${linesToRemove.size} duplicate closing tag(s)`);
  }
  
  // Strategy 2: Ensure single root element
  // Find the return statement
  const returnMatch = fixed.match(/return\s*\(/);
  if (returnMatch) {
    const returnStart = returnMatch.index + returnMatch[0].length;
    
    // Find matching closing paren
    let depth = 0;
    let returnEnd = -1;
    for (let i = returnStart; i < fixed.length; i++) {
      if (fixed[i] === '(') depth++;
      if (fixed[i] === ')') {
        if (depth === 0) {
          returnEnd = i;
          break;
        }
        depth--;
      }
    }
    
    if (returnEnd > returnStart) {
      const jsxContent = fixed.slice(returnStart, returnEnd).trim();
      
      // Check if already wrapped
      if (!jsxContent.startsWith('<>') && !jsxContent.startsWith('</')) {
        // Count root-level elements by finding top-level closing tags
        const jsxLines = jsxContent.split('\n');
        let minIndent = Infinity;
        let rootClosingTags = 0;
        
        for (const line of jsxLines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('</') && trimmed.endsWith('>')) {
            const indent = line.length - line.trimStart().length;
            if (indent < minIndent) {
              minIndent = indent;
              rootClosingTags = 1;
            } else if (indent === minIndent) {
              rootClosingTags++;
            }
          }
        }
        
        // If more than 1 root element, wrap in fragment
        if (rootClosingTags > 1) {
          console.log(`⚠️ Found ${rootClosingTags} root elements, wrapping in fragment`);
          const indent = '      ';
          const wrapped = `\n${indent}<>\n${indent}${jsxContent.split('\n').map(l => l ? '  ' + l : l).join('\n')}\n${indent}</>\n    `;
          fixed = fixed.slice(0, returnStart) + wrapped + fixed.slice(returnEnd);
          changesMade = true;
          console.log(`✅ Wrapped in fragment`);
        }
      }
    }
  }
  
  return { content: fixed, fixed: changesMade };
}

/**
 * Fix all JSX files in the tree
 */
export function fixAllJSXFiles(files) {
  let totalFixed = 0;
  const fixedFiles = [];
  
  function processNode(node) {
    if (node.type === 'file' && node.content) {
      if (node.name.endsWith('.jsx') || node.name.endsWith('.tsx')) {
        const result = fixJSXStructure(node.content, node.name);
        
        if (result.fixed) {
          node.content = result.content;
          totalFixed++;
          fixedFiles.push(node.name);
          console.log(`✅ Fixed JSX in ${node.name}`);
        }
      }
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => processNode(child));
    }
  }
  
  files.forEach(node => processNode(node));
  
  return {
    files,
    fixedCount: totalFixed,
    fixedFiles
  };
}

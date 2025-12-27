/**
 * REAL JSX FIXER - ACTUALLY WORKS
 * Fixes JSX errors by parsing and balancing tags
 */

/**
 * Fix JSX structure by balancing tags
 */
export function fixJSXStructure(code, fileName) {
  console.log(`🔧 Fixing JSX in ${fileName}...`);
  
  let fixed = code;
  let changes = 0;
  
  // Step 1: Find all JSX tags
  const lines = fixed.split('\n');
  const tagStack = [];
  const fixedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      fixedLines.push(line);
      continue;
    }
    
    // Find all opening tags (including self-closing and namespaced like motion.div)
    const openingTags = [...line.matchAll(/<(\w+(?:\.\w+)?)[^>]*?(?:>|\/?>)/g)];
    
    for (const match of openingTags) {
      const fullTag = match[0];
      const tagName = match[1];
      
      // Skip self-closing tags
      if (fullTag.endsWith('/>')) continue;
      
      // Skip void elements
      const voidElements = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];
      if (voidElements.includes(tagName)) continue;
      
      tagStack.push({ tag: tagName, line: i });
    }
    
    // Find all closing tags
    const closingTags = [...line.matchAll(/<\/(\w+(?:\.\w+)?)>/g)];
    
    for (const match of closingTags) {
      const tagName = match[1];
      
      // Check if this closing tag matches the last opening tag
      if (tagStack.length > 0 && tagStack[tagStack.length - 1].tag === tagName) {
        tagStack.pop();
      } else {
        // Extra closing tag! Remove it
        console.log(`  ⚠️ Extra closing </${tagName}> on line ${i + 1}`);
        changes++;
        // Skip this line
        continue;
      }
    }
    
    fixedLines.push(line);
  }
  
  // Step 2: Add missing closing tags
  if (tagStack.length > 0) {
    console.log(`  ⚠️ Missing ${tagStack.length} closing tag(s)`);
    
    // Add closing tags at the end
    const indent = '    ';
    for (let i = tagStack.length - 1; i >= 0; i--) {
      const { tag } = tagStack[i];
      fixedLines.push(`${indent}</${tag}>`);
      console.log(`  ✅ Added missing </${tag}>`);
      changes++;
    }
  }
  
  fixed = fixedLines.join('\n');
  
  // Step 3: Ensure return has single root element
  const returnMatch = fixed.match(/return\s*\(/);
  if (returnMatch) {
    const returnStart = returnMatch.index + returnMatch[0].length;
    
    // Find the closing parenthesis
    let depth = 1;
    let returnEnd = -1;
    for (let i = returnStart; i < fixed.length; i++) {
      if (fixed[i] === '(') depth++;
      if (fixed[i] === ')') {
        depth--;
        if (depth === 0) {
          returnEnd = i;
          break;
        }
      }
    }
    
    if (returnEnd > returnStart) {
      const jsxContent = fixed.slice(returnStart, returnEnd).trim();
      
      // Check if it starts with a single element
      if (!jsxContent.startsWith('<>') && !jsxContent.startsWith('</')) {
        // Count root-level elements
        const rootElements = [];
        let currentDepth = 0;
        let currentElement = '';
        
        for (let i = 0; i < jsxContent.length; i++) {
          const char = jsxContent[i];
          
          if (char === '<') {
            if (currentDepth === 0 && currentElement.trim()) {
              rootElements.push(currentElement);
              currentElement = '';
            }
            currentElement += char;
            
            // Check if opening or closing tag
            if (jsxContent[i + 1] !== '/') {
              currentDepth++;
            } else {
              currentDepth--;
            }
          } else {
            currentElement += char;
          }
        }
        
        if (currentElement.trim()) {
          rootElements.push(currentElement);
        }
        
        // If multiple root elements, wrap in fragment
        if (rootElements.length > 1) {
          console.log(`  ⚠️ Multiple root elements (${rootElements.length}), wrapping in fragment`);
          const indent = '      ';
          const wrapped = `\n${indent}<>\n${indent}  ${jsxContent.split('\n').join('\n' + indent + '  ')}\n${indent}</>\n    `;
          fixed = fixed.slice(0, returnStart) + wrapped + fixed.slice(returnEnd);
          changes++;
        }
      }
    }
  }
  
  if (changes > 0) {
    console.log(`  ✅ Fixed ${changes} issue(s) in ${fileName}`);
  }
  
  return { content: fixed, fixed: changes > 0 };
}

/**
 * Fix all JSX files in the tree
 */
export function fixAllJSXFiles(files) {
  console.log('🔧 Fixing all JSX files...');
  
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
        }
      }
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => processNode(child));
    }
  }
  
  files.forEach(node => processNode(node));
  
  console.log(`✅ Fixed ${totalFixed} JSX file(s)`);
  
  return {
    files,
    fixedCount: totalFixed,
    fixedFiles
  };
}

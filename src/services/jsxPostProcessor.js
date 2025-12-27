/**
 * POST-PROCESSOR FOR AI-GENERATED JSX
 * Ensures all JSX is valid before sending to WebContainer
 */

/**
 * Aggressively fix JSX to ensure it's valid
 */
export function aggressivelyFixJSX(content, fileName) {
  if (!content || (!fileName.endsWith('.jsx') && !fileName.endsWith('.tsx'))) {
    return content;
  }
  
  console.log(`🔧 Post-processing ${fileName}`);
  
  let fixed = content;
  let iterations = 0;
  const maxIterations = 5;
  
  while (iterations < maxIterations) {
    iterations++;
    let changed = false;
    
    // Fix 1: Remove duplicate closing tags
    const lines = fixed.split('\n');
    const newLines = [];
    let lastClosingTag = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Is this a standalone closing tag? (including namespaced like motion.div)
      const closingMatch = trimmed.match(/^<\/(\w+(?:\.\w+)?)>$/);
      
      if (closingMatch) {
        const tag = closingMatch[1];
        
        // Same as last line?
        if (lastClosingTag === tag) {
          console.log(`  ⚠️ Removing duplicate </${tag}> on line ${i + 1}`);
          changed = true;
          continue; // Skip this line
        }
        
        // Check if this closing tag has a matching opening tag
        const openingPattern = new RegExp(`<${tag.replace('.', '\\.')}[\\s>]`, 'g');
        const closingPattern = new RegExp(`</${tag.replace('.', '\\.')}>`, 'g');
        
        const contentSoFar = newLines.join('\n');
        const openCount = (contentSoFar.match(openingPattern) || []).length;
        const closeCount = (contentSoFar.match(closingPattern) || []).length + 1; // +1 for current line
        
        if (closeCount > openCount) {
          console.log(`  ⚠️ Extra closing </${tag}> on line ${i + 1} (${closeCount} close vs ${openCount} open)`);
          changed = true;
          continue; // Skip this line
        }
        
        lastClosingTag = tag;
      } else if (trimmed !== '') {
        lastClosingTag = null;
      }
      
      newLines.push(line);
    }
    
    if (changed) {
      fixed = newLines.join('\n');
      console.log(`  ✅ Removed duplicate tags (iteration ${iterations})`);
      continue;
    }
    
    // Fix 2: Ensure single root element
    const returnMatch = fixed.match(/return\s*\(\s*\n/);
    if (returnMatch) {
      const returnStart = returnMatch.index + returnMatch[0].length;
      
      // Find the closing paren
      let depth = 1; // We're already inside the first (
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
        const jsxBlock = fixed.slice(returnStart, returnEnd);
        const jsxLines = jsxBlock.split('\n');
        
        // Find all root-level elements (elements at the minimum indentation)
        let minIndent = Infinity;
        const rootElements = [];
        
        for (let i = 0; i < jsxLines.length; i++) {
          const line = jsxLines[i];
          const trimmed = line.trim();
          
          if (trimmed.startsWith('<') && !trimmed.startsWith('</')) {
            const indent = line.length - line.trimStart().length;
            
            if (indent < minIndent) {
              minIndent = indent;
              rootElements.length = 0;
              rootElements.push(i);
            } else if (indent === minIndent) {
              rootElements.push(i);
            }
          }
        }
        
        // If more than one root element, wrap in fragment
        if (rootElements.length > 1 && !jsxBlock.trim().startsWith('<>')) {
          console.log(`  ⚠️ Found ${rootElements.length} root elements, wrapping in fragment`);
          
          const indent = ' '.repeat(minIndent);
          const wrappedJsx = `${indent}<>\n${jsxBlock}\n${indent}</>`;
          
          fixed = fixed.slice(0, returnStart) + wrappedJsx + '\n    ' + fixed.slice(returnEnd);
          changed = true;
          console.log(`  ✅ Wrapped in fragment (iteration ${iterations})`);
          continue;
        }
      }
    }
    
    // No changes made, we're done
    if (!changed) {
      break;
    }
  }
  
  if (iterations > 1) {
    console.log(`✅ Fixed ${fileName} after ${iterations} iteration(s)`);
  }
  
  return fixed;
}

/**
 * Post-process all JSX files
 */
export function postProcessAllJSX(files) {
  let totalFixed = 0;
  
  function processNode(node) {
    if (node.type === 'file' && node.content) {
      if (node.name.endsWith('.jsx') || node.name.endsWith('.tsx')) {
        const original = node.content;
        node.content = aggressivelyFixJSX(node.content, node.name);
        
        if (node.content !== original) {
          totalFixed++;
        }
      }
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => processNode(child));
    }
  }
  
  files.forEach(node => processNode(node));
  
  console.log(`📊 Post-processed ${totalFixed} JSX file(s)`);
  
  return files;
}

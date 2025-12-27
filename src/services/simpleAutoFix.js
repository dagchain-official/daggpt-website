/**
 * SIMPLE BUT EFFECTIVE AUTO-FIX
 * Applies all fixes BEFORE sending to WebContainer
 */

import { fixAllSyntaxErrors } from './syntaxErrorFixer';
import { fixAllJSXFiles } from './babelJsxFixer';
import { postProcessAllJSX } from './jsxPostProcessor';

/**
 * Apply ALL fixes to files multiple times until no more changes
 */
export function applyAllFixesIteratively(files, maxIterations = 3) {
  console.log(`🔧 Starting iterative auto-fix (max ${maxIterations} iterations)...`);
  
  let currentFiles = files;
  let totalChanges = 0;
  
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    console.log(`🔄 Iteration ${iteration}/${maxIterations}...`);
    
    let iterationChanges = 0;
    
    // Step 1: Fix syntax errors (SVG URLs, quotes, etc.)
    const syntaxResult = fixAllSyntaxErrors(currentFiles);
    if (syntaxResult.fixedCount > 0) {
      console.log(`  ✅ Fixed syntax in ${syntaxResult.fixedCount} file(s)`);
      currentFiles = syntaxResult.files;
      iterationChanges += syntaxResult.fixedCount;
    }
    
    // Step 2: Fix JSX structure (duplicate tags, fragments)
    const jsxResult = fixAllJSXFiles(currentFiles);
    if (jsxResult.fixedCount > 0) {
      console.log(`  ✅ Fixed JSX structure in ${jsxResult.fixedCount} file(s)`);
      currentFiles = jsxResult.files;
      iterationChanges += jsxResult.fixedCount;
    }
    
    // Step 3: Aggressive post-processing
    const beforePostProcess = JSON.stringify(currentFiles);
    currentFiles = postProcessAllJSX(currentFiles);
    const afterPostProcess = JSON.stringify(currentFiles);
    
    if (beforePostProcess !== afterPostProcess) {
      console.log(`  ✅ Post-processed all JSX files`);
      iterationChanges++;
    }
    
    totalChanges += iterationChanges;
    
    // If no changes in this iteration, we're done
    if (iterationChanges === 0) {
      console.log(`✅ No more changes needed after ${iteration} iteration(s)`);
      break;
    }
  }
  
  console.log(`✅ Total fixes applied: ${totalChanges}`);
  return currentFiles;
}

/**
 * Deep scan for JSX errors and fix them
 */
export function deepScanAndFix(files) {
  console.log(`🔍 Deep scanning for JSX errors...`);
  console.log(`📊 Files to scan: ${files.length}`);
  
  let fixedFiles = files;
  let totalFixed = 0;
  
  function scanNode(node, path = '') {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    
    if (node.type === 'file' && node.content && (node.name.endsWith('.jsx') || node.name.endsWith('.tsx'))) {
      console.log(`  📄 Scanning ${currentPath}...`);
      
      // Check for common JSX errors
      const content = node.content;
      let fixed = content;
      let changes = false;
      
      // Fix 1: Remove extra closing tags by counting
      const lines = fixed.split('\n');
      const tagCounts = {};
      const linesToRemove = new Set();
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Match opening tags (including namespaced like motion.div)
        const openingMatch = trimmed.match(/<(\w+(?:\.\w+)?)[>\s]/g);
        if (openingMatch) {
          openingMatch.forEach(tag => {
            const tagName = tag.match(/<(\w+(?:\.\w+)?)/)[1];
            tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
          });
        }
        
        // Match closing tags
        const closingMatch = trimmed.match(/^<\/(\w+(?:\.\w+)?)>$/);
        if (closingMatch) {
          const tagName = closingMatch[1];
          tagCounts[tagName] = (tagCounts[tagName] || 0) - 1;
          
          // If count goes negative, this is an extra closing tag
          if (tagCounts[tagName] < 0) {
            console.log(`    ⚠️ Extra closing </${tagName}> on line ${i + 1}`);
            linesToRemove.add(i);
            changes = true;
            tagCounts[tagName] = 0; // Reset to prevent cascade
          }
        }
      }
      
      if (linesToRemove.size > 0) {
        fixed = lines.filter((_, index) => !linesToRemove.has(index)).join('\n');
        console.log(`    ✅ Removed ${linesToRemove.size} extra closing tag(s)`);
      }
      
      // Fix 2: Ensure return has single root element
      const returnMatch = fixed.match(/return\s*\(/);
      if (returnMatch) {
        const returnStart = returnMatch.index + returnMatch[0].length;
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
          
          // Count root-level closing tags
          if (!jsxContent.startsWith('<>') && !jsxContent.startsWith('</')) {
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
            
            if (rootClosingTags > 1) {
              console.log(`    ⚠️ Multiple root elements (${rootClosingTags}), wrapping in fragment`);
              const indent = '      ';
              const wrapped = `\n${indent}<>\n${indent}${jsxContent.split('\n').map(l => l ? '  ' + l : l).join('\n')}\n${indent}</>\n    `;
              fixed = fixed.slice(0, returnStart) + wrapped + fixed.slice(returnEnd);
              changes = true;
            }
          }
        }
      }
      
      if (changes) {
        node.content = fixed;
        totalFixed++;
        console.log(`    ✅ Fixed ${node.name}`);
      }
    } else if (node.type === 'folder' && node.children) {
      console.log(`  📁 Scanning folder ${currentPath}...`);
      node.children.forEach(child => scanNode(child, currentPath));
    }
  }
  
  fixedFiles.forEach(node => scanNode(node));
  
  console.log(`✅ Deep scan complete. Fixed ${totalFixed} file(s).`);
  return fixedFiles;
}

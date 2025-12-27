/**
 * React Import Fixer
 * Automatically adds missing React imports to JSX/TSX files
 */

/**
 * Check if file needs React import
 */
function needsReactImport(content) {
  // Check if file uses JSX
  const hasJSX = /<[A-Z]/.test(content) || /<[a-z]+/.test(content);
  
  // Check if React is already imported (more thorough check)
  const hasReactImport = /import\s+React/.test(content);
  
  return hasJSX && !hasReactImport;
}

/**
 * Add React import to file
 */
function addReactImport(content) {
  // Check if there are already imports
  const hasImports = /^import\s/.test(content);
  
  if (hasImports) {
    // Add React import at the top, before other imports
    return `import React from 'react';\n${content}`;
  } else {
    // No imports yet, add React import at the very top
    return `import React from 'react';\n\n${content}`;
  }
}

/**
 * Fix React imports in all JSX/TSX files
 */
export function fixReactImports(fileTree) {
  let fixedCount = 0;
  const fixedFiles = [];
  
  function processNode(node) {
    if (node.type === 'file' && (node.name.endsWith('.jsx') || node.name.endsWith('.tsx'))) {
      if (node.content && needsReactImport(node.content)) {
        node.content = addReactImport(node.content);
        fixedCount++;
        fixedFiles.push(node.name);
      }
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => processNode(child));
    }
  }
  
  fileTree.forEach(node => processNode(node));
  
  return {
    files: fileTree,
    fixedCount,
    fixedFiles
  };
}

/**
 * Fix useState, useEffect imports
 */
export function fixReactHooksImports(fileTree) {
  let fixedCount = 0;
  const fixedFiles = [];
  
  function processNode(node) {
    if (node.type === 'file' && (node.name.endsWith('.jsx') || node.name.endsWith('.tsx'))) {
      if (!node.content) return;
      
      // Skip if already has React import (avoid duplicates)
      if (/import\s+React/.test(node.content)) {
        return;
      }
      
      const hooks = [];
      
      // Check for useState
      if (/useState\s*\(/.test(node.content)) {
        hooks.push('useState');
      }
      
      // Check for useEffect
      if (/useEffect\s*\(/.test(node.content)) {
        hooks.push('useEffect');
      }
      
      // Check for useContext
      if (/useContext\s*\(/.test(node.content)) {
        hooks.push('useContext');
      }
      
      // Check for useRef
      if (/useRef\s*\(/.test(node.content)) {
        hooks.push('useRef');
      }
      
      // Check for useMemo
      if (/useMemo\s*\(/.test(node.content)) {
        hooks.push('useMemo');
      }
      
      // Check for useCallback
      if (/useCallback\s*\(/.test(node.content)) {
        hooks.push('useCallback');
      }
      
      // Check for createContext
      if (/createContext\s*\(/.test(node.content)) {
        hooks.push('createContext');
      }
      
      if (hooks.length > 0) {
        // Add new React import with hooks
        const newImport = `import React, { ${hooks.join(', ')} } from 'react';\n`;
        node.content = newImport + node.content;
        
        fixedCount++;
        fixedFiles.push(node.name);
      }
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => processNode(child));
    }
  }
  
  fileTree.forEach(node => processNode(node));
  
  return {
    files: fileTree,
    fixedCount,
    fixedFiles
  };
}

/**
 * Complete React import fix - both React and hooks
 */
export function fixAllReactImports(fileTree) {
  // First fix React imports
  const { files: step1, fixedCount: count1, fixedFiles: files1 } = fixReactImports(fileTree);
  
  // Then fix hooks imports
  const { files: step2, fixedCount: count2, fixedFiles: files2 } = fixReactHooksImports(step1);
  
  return {
    files: step2,
    fixedCount: count1 + count2,
    fixedFiles: [...new Set([...files1, ...files2])]
  };
}

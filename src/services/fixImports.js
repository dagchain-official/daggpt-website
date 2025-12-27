/**
 * Fix Import Paths Service
 * Fixes common import path issues in generated code
 */

/**
 * Fix imports in a file's content
 */
export function fixImportPaths(content, fileName) {
  if (!content) return content;
  
  // Fix absolute imports to relative imports
  // Example: import App from '/src/App' -> import App from './App'
  let fixed = content;
  
  // Fix /src/ imports in main/index files
  if (fileName === 'main.jsx' || fileName === 'index.jsx' || fileName === 'main.js' || fileName === 'index.js') {
    // import App from '/src/App' -> import App from './App'
    fixed = fixed.replace(/import\s+(\w+)\s+from\s+['"]\/src\/(\w+)['"]/g, "import $1 from './$2'");
    
    // import { Component } from '/src/components/Component' -> import { Component } from './components/Component'
    fixed = fixed.replace(/import\s+\{([^}]+)\}\s+from\s+['"]\/src\/([^'"]+)['"]/g, "import {$1} from './$2'");
    
    // import './src/index.css' -> import './index.css'
    fixed = fixed.replace(/import\s+['"]\/src\/([^'"]+)['"]/g, "import './$1'");
  }
  
  // Fix missing .jsx extensions
  // import App from './App' -> import App from './App.jsx'
  fixed = fixed.replace(/import\s+(\w+)\s+from\s+['"]\.\/(\w+)['"]/g, (match, name, path) => {
    // Don't add extension if it already has one
    if (path.includes('.')) return match;
    // Add .jsx for component imports
    return `import ${name} from './${path}.jsx'`;
  });
  
  // Fix component imports from './components/X' to './components/X.jsx'
  fixed = fixed.replace(/import\s+\{([^}]+)\}\s+from\s+['"]\.\/components\/(\w+)['"]/g, (match, imports, component) => {
    return `import {${imports}} from './components/${component}.jsx'`;
  });
  
  return fixed;
}

/**
 * Fix all imports in file tree
 */
export function fixAllImports(files) {
  function processNode(node) {
    if (node.type === 'file' && node.content) {
      // Fix imports in JS/JSX files
      if (node.name.endsWith('.js') || node.name.endsWith('.jsx') || node.name.endsWith('.ts') || node.name.endsWith('.tsx')) {
        node.content = fixImportPaths(node.content, node.name);
      }
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => processNode(child));
    }
  }
  
  files.forEach(node => processNode(node));
  return files;
}

/**
 * Component Validation Service
 * Ensures all imported components exist
 */

/**
 * Extract imports from a file's content
 */
function extractImports(content) {
  const imports = [];
  
  // Match: import ComponentName from './path/to/Component'
  const defaultImportRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = defaultImportRegex.exec(content)) !== null) {
    const [, componentName, importPath] = match;
    imports.push({
      name: componentName,
      path: importPath,
      isDefault: true
    });
  }
  
  // Match: import { Component1, Component2 } from './path'
  const namedImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  
  while ((match = namedImportRegex.exec(content)) !== null) {
    const [, names, importPath] = match;
    const componentNames = names.split(',').map(n => n.trim());
    
    componentNames.forEach(name => {
      imports.push({
        name,
        path: importPath,
        isDefault: false
      });
    });
  }
  
  return imports;
}

/**
 * Find a file in the file tree
 */
function findFile(files, fileName) {
  for (const file of files) {
    if (file.type === 'file' && file.name === fileName) {
      return file;
    }
    if (file.type === 'folder' && file.children) {
      const found = findFile(file.children, fileName);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get all files from tree
 */
function getAllFiles(files) {
  const result = [];
  for (const file of files) {
    if (file.type === 'file') {
      result.push(file);
    }
    if (file.type === 'folder' && file.children) {
      result.push(...getAllFiles(file.children));
    }
  }
  return result;
}

/**
 * Create a stub component
 */
function createStubComponent(componentName) {
  return `import React from 'react';

function ${componentName}() {
  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800">${componentName}</h2>
      <p className="text-gray-600 mt-2">This component is under construction.</p>
    </div>
  );
}

export default ${componentName};
`;
}

/**
 * Validate and fix missing components
 */
export function validateAndFixComponents(files) {
  const allFiles = getAllFiles(files);
  const missingComponents = new Set();
  
  // Check all JS/JSX files for imports
  allFiles.forEach(file => {
    if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
      const imports = extractImports(file.content);
      
      imports.forEach(imp => {
        // Skip non-component imports (CSS, images, etc.)
        if (imp.path.startsWith('.') && !imp.path.endsWith('.css') && !imp.path.endsWith('.svg')) {
          // Convert import path to file name
          const pathParts = imp.path.split('/');
          const fileName = pathParts[pathParts.length - 1];
          
          // Check if file exists (with or without extension)
          const possibleNames = [
            `${fileName}.jsx`,
            `${fileName}.js`,
            fileName.endsWith('.jsx') ? fileName : null,
            fileName.endsWith('.js') ? fileName : null
          ].filter(Boolean);
          
          const exists = possibleNames.some(name => findFile(files, name));
          
          if (!exists) {
            missingComponents.add({
              name: imp.name,
              fileName: `${fileName}.jsx`,
              path: imp.path
            });
          }
        }
      });
    }
  });
  
  // Create stub components for missing ones
  if (missingComponents.size > 0) {
    console.log('🔧 Creating stub components for:', Array.from(missingComponents).map(c => c.name));
    
    // Find or create components folder
    let componentsFolder = files.find(f => f.type === 'folder' && f.name === 'components');
    
    if (!componentsFolder) {
      // Look in src folder
      const srcFolder = files.find(f => f.type === 'folder' && f.name === 'src');
      if (srcFolder) {
        componentsFolder = srcFolder.children?.find(f => f.type === 'folder' && f.name === 'components');
        
        if (!componentsFolder) {
          // Create components folder in src
          componentsFolder = {
            type: 'folder',
            name: 'components',
            children: []
          };
          srcFolder.children = srcFolder.children || [];
          srcFolder.children.push(componentsFolder);
        }
      }
    }
    
    // Add stub components
    if (componentsFolder) {
      missingComponents.forEach(comp => {
        componentsFolder.children.push({
          type: 'file',
          name: comp.fileName,
          content: createStubComponent(comp.name)
        });
      });
    }
  }
  
  return {
    files,
    missingCount: missingComponents.size,
    missingComponents: Array.from(missingComponents)
  };
}

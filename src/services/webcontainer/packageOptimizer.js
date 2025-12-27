/**
 * Package Optimizer Service
 * Optimizes package.json to minimize install time
 */

/**
 * Optimize package.json for faster installation
 */
export function optimizePackageJson(packageJsonContent) {
  try {
    const pkg = JSON.parse(packageJsonContent);
    
    // Remove unnecessary fields
    delete pkg.description;
    delete pkg.keywords;
    delete pkg.author;
    delete pkg.license;
    delete pkg.repository;
    delete pkg.bugs;
    delete pkg.homepage;
    
    // Optimize scripts - only keep essential ones
    if (pkg.scripts) {
      pkg.scripts = {
        dev: pkg.scripts.dev || 'vite',
        build: pkg.scripts.build || 'vite build',
        preview: pkg.scripts.preview || 'vite preview'
      };
    }
    
    // Use exact versions for faster resolution
    if (pkg.dependencies) {
      pkg.dependencies = optimizeVersions(pkg.dependencies);
    }
    
    if (pkg.devDependencies) {
      pkg.devDependencies = optimizeVersions(pkg.devDependencies);
    }
    
    return JSON.stringify(pkg, null, 2);
  } catch (error) {
    console.error('[Optimizer] Failed to optimize package.json:', error);
    return packageJsonContent;
  }
}

/**
 * Convert version ranges to exact versions for faster resolution
 */
function optimizeVersions(dependencies) {
  const optimized = {};
  
  for (const [name, version] of Object.entries(dependencies)) {
    // Remove ^ and ~ for exact versions
    optimized[name] = version.replace(/^[\^~]/, '');
  }
  
  return optimized;
}

/**
 * Remove unnecessary dependencies
 */
export function removeUnnecessaryDeps(dependencies) {
  const unnecessary = [
    '@types/node', // Not needed in browser
    'typescript', // If not using TS
    'eslint', // Not needed for preview
    'prettier', // Not needed for preview
  ];
  
  const filtered = { ...dependencies };
  
  unnecessary.forEach(dep => {
    delete filtered[dep];
  });
  
  return filtered;
}

/**
 * Get minimal dependency set for project type
 */
export function getMinimalDeps(projectType) {
  const base = {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  };
  
  const devBase = {
    "@vitejs/plugin-react": "4.2.1",
    "vite": "5.0.8",
    "tailwindcss": "3.4.1",
    "autoprefixer": "10.4.17",
    "postcss": "8.4.33"
  };
  
  // Add project-specific deps
  const extras = {
    dashboard: {
      "recharts": "2.10.3",
      "lucide-react": "0.294.0"
    },
    blog: {
      "react-markdown": "9.0.1",
      "date-fns": "3.0.0"
    },
    ecommerce: {
      "lucide-react": "0.294.0"
    }
  };
  
  return {
    dependencies: { ...base, ...(extras[projectType] || {}) },
    devDependencies: devBase
  };
}

/**
 * Optimize entire file tree's package.json
 */
export function optimizeProjectDependencies(files) {
  return files.map(file => {
    if (file.type === 'file' && file.name === 'package.json') {
      return {
        ...file,
        content: optimizePackageJson(file.content)
      };
    } else if (file.type === 'folder' && file.children) {
      return {
        ...file,
        children: optimizeProjectDependencies(file.children)
      };
    }
    return file;
  });
}

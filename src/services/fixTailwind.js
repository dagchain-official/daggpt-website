/**
 * Tailwind CSS Fix Service
 * Ensures Tailwind is properly configured in generated projects
 */

/**
 * Find file in tree
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
 * Ensure Tailwind config exists
 */
function ensureTailwindConfig(files) {
  let tailwindConfig = findFile(files, 'tailwind.config.js');
  
  if (!tailwindConfig) {
    // Create tailwind.config.js
    const config = {
      type: 'file',
      name: 'tailwind.config.js',
      content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`
    };
    
    files.push(config);
    return true;
  }
  
  return false;
}

/**
 * Ensure PostCSS config exists
 */
function ensurePostCSSConfig(files) {
  let postcssConfig = findFile(files, 'postcss.config.js');
  
  if (!postcssConfig) {
    // Create postcss.config.js
    const config = {
      type: 'file',
      name: 'postcss.config.js',
      content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
    };
    
    files.push(config);
    return true;
  }
  
  return false;
}

/**
 * Ensure index.css has Tailwind directives
 */
function ensureTailwindDirectives(files) {
  let indexCss = findFile(files, 'index.css');
  
  if (!indexCss) {
    // Look in src folder
    const srcFolder = files.find(f => f.type === 'folder' && f.name === 'src');
    if (srcFolder) {
      indexCss = findFile(srcFolder.children || [], 'index.css');
    }
  }
  
  if (indexCss) {
    // Check if Tailwind directives exist
    if (!indexCss.content.includes('@tailwind')) {
      // Add Tailwind directives at the top
      indexCss.content = `@tailwind base;
@tailwind components;
@tailwind utilities;

${indexCss.content}`;
      return true;
    }
  } else {
    // Create index.css in src folder
    const srcFolder = files.find(f => f.type === 'folder' && f.name === 'src');
    if (srcFolder) {
      const newIndexCss = {
        type: 'file',
        name: 'index.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`
      };
      
      srcFolder.children = srcFolder.children || [];
      srcFolder.children.push(newIndexCss);
      return true;
    }
  }
  
  return false;
}

/**
 * Ensure main.jsx imports index.css
 */
function ensureCSSImport(files) {
  const mainFiles = ['main.jsx', 'index.jsx', 'main.js', 'index.js'];
  
  for (const fileName of mainFiles) {
    const mainFile = findFile(files, fileName);
    
    if (mainFile && mainFile.content) {
      // Check if it imports index.css
      if (!mainFile.content.includes("import './index.css'") && 
          !mainFile.content.includes('import "./index.css"')) {
        // Add import at the top
        mainFile.content = `import './index.css'\n${mainFile.content}`;
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Ensure package.json has Tailwind dependencies
 */
function ensureTailwindDependencies(files) {
  const packageJson = findFile(files, 'package.json');
  
  if (packageJson && packageJson.content) {
    try {
      const pkg = JSON.parse(packageJson.content);
      
      let modified = false;
      
      // Ensure devDependencies exist
      pkg.devDependencies = pkg.devDependencies || {};
      
      // Add Tailwind if missing
      if (!pkg.devDependencies.tailwindcss) {
        pkg.devDependencies.tailwindcss = '^3.4.1';
        modified = true;
      }
      
      if (!pkg.devDependencies.autoprefixer) {
        pkg.devDependencies.autoprefixer = '^10.4.17';
        modified = true;
      }
      
      if (!pkg.devDependencies.postcss) {
        pkg.devDependencies.postcss = '^8.4.33';
        modified = true;
      }
      
      if (modified) {
        packageJson.content = JSON.stringify(pkg, null, 2);
        return true;
      }
    } catch (error) {
      console.error('Failed to parse package.json:', error);
    }
  }
  
  return false;
}

/**
 * Fix all Tailwind configuration issues
 */
export function fixTailwindSetup(files) {
  const fixes = [];
  
  if (ensureTailwindConfig(files)) {
    fixes.push('Created tailwind.config.js');
  }
  
  if (ensurePostCSSConfig(files)) {
    fixes.push('Created postcss.config.js');
  }
  
  if (ensureTailwindDirectives(files)) {
    fixes.push('Added Tailwind directives to CSS');
  }
  
  if (ensureCSSImport(files)) {
    fixes.push('Added CSS import to main file');
  }
  
  if (ensureTailwindDependencies(files)) {
    fixes.push('Added Tailwind to dependencies');
  }
  
  return {
    files,
    fixCount: fixes.length,
    fixes
  };
}

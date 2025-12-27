/**
 * Dependency Fixer
 * Fixes common dependency version conflicts
 */

/**
 * Known compatible dependency versions
 */
const COMPATIBLE_VERSIONS = {
  // React ecosystem
  'react': '^18.2.0',
  'react-dom': '^18.2.0',
  
  // Vite ecosystem
  'vite': '^5.0.0',
  '@vitejs/plugin-react': '^4.2.0', // Compatible with Vite 5
  
  // Tailwind
  'tailwindcss': '^3.4.0',
  'postcss': '^8.4.32',
  'autoprefixer': '^10.4.16',
  
  // Flowbite
  'flowbite': '^2.2.0',
  'flowbite-react': '^0.7.0',
  
  // Framer Motion
  'framer-motion': '^10.16.0',
  
  // Lucide Icons
  'lucide-react': '^0.294.0'
};

/**
 * Required dependencies for component libraries
 * These should ALWAYS be present
 */
const REQUIRED_DEPENDENCIES = {
  'framer-motion': '^10.16.0',
  'flowbite': '^2.2.0',
  'flowbite-react': '^0.7.0',
  'lucide-react': '^0.294.0',
  'react-router-dom': '^6.20.0'
};

/**
 * Version conflict rules
 */
const CONFLICT_RULES = [
  {
    // Vite 5 requires @vitejs/plugin-react >= 4.2.0
    check: (deps) => {
      const viteVersion = deps.vite;
      const pluginVersion = deps['@vitejs/plugin-react'];
      
      if (viteVersion && pluginVersion) {
        const viteMajor = parseInt(viteVersion.replace(/[^\d]/g, '').charAt(0));
        const pluginMinor = parseInt(pluginVersion.replace(/[^\d.]/g, '').split('.')[1] || '0');
        
        if (viteMajor >= 5 && pluginMinor < 2) {
          return true;
        }
      }
      return false;
    },
    fix: (deps) => {
      deps['@vitejs/plugin-react'] = '^4.2.0';
      return deps;
    },
    message: 'Fixed Vite/React plugin version conflict'
  },
  {
    // React 18 compatibility
    check: (deps) => {
      const reactVersion = deps.react;
      const reactDomVersion = deps['react-dom'];
      
      if (reactVersion && reactDomVersion && reactVersion !== reactDomVersion) {
        return true;
      }
      return false;
    },
    fix: (deps) => {
      deps.react = '^18.2.0';
      deps['react-dom'] = '^18.2.0';
      return deps;
    },
    message: 'Synced React and ReactDOM versions'
  },
  {
    // Flowbite React requires Flowbite
    check: (deps) => {
      return deps['flowbite-react'] && !deps['flowbite'];
    },
    fix: (deps) => {
      deps['flowbite'] = '^2.2.0';
      return deps;
    },
    message: 'Added missing Flowbite dependency'
  }
];

/**
 * Fix dependency versions in package.json
 */
export function fixDependencyVersions(fileTree) {
  let fixed = false;
  const fixes = [];
  
  function processNode(node) {
    if (node.type === 'file' && node.name === 'package.json') {
      try {
        const packageJson = JSON.parse(node.content);
        
        // Ensure dependencies object exists
        if (!packageJson.dependencies) {
          packageJson.dependencies = {};
        }
        
        // Combine all dependencies
        const allDeps = {
          ...(packageJson.dependencies || {}),
          ...(packageJson.devDependencies || {})
        };
        
        // Add required dependencies if missing
        let addedRequired = false;
        Object.keys(REQUIRED_DEPENDENCIES).forEach(dep => {
          if (!allDeps[dep]) {
            allDeps[dep] = REQUIRED_DEPENDENCIES[dep];
            packageJson.dependencies[dep] = REQUIRED_DEPENDENCIES[dep];
            addedRequired = true;
          }
        });
        
        if (addedRequired) {
          fixes.push('Added missing component library dependencies');
          fixed = true;
        }
        
        // Check for conflicts
        let modified = false;
        CONFLICT_RULES.forEach(rule => {
          if (rule.check(allDeps)) {
            rule.fix(allDeps);
            fixes.push(rule.message);
            modified = true;
          }
        });
        
        // Apply known compatible versions
        Object.keys(allDeps).forEach(dep => {
          if (COMPATIBLE_VERSIONS[dep]) {
            const currentVersion = allDeps[dep];
            const compatibleVersion = COMPATIBLE_VERSIONS[dep];
            
            // Only update if versions are significantly different
            if (currentVersion !== compatibleVersion) {
              allDeps[dep] = compatibleVersion;
              modified = true;
            }
          }
        });
        
        if (modified) {
          // Split back into dependencies and devDependencies
          const newDeps = {};
          const newDevDeps = {};
          
          Object.keys(allDeps).forEach(dep => {
            if (packageJson.dependencies && packageJson.dependencies[dep]) {
              newDeps[dep] = allDeps[dep];
            } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
              newDevDeps[dep] = allDeps[dep];
            }
          });
          
          packageJson.dependencies = newDeps;
          packageJson.devDependencies = newDevDeps;
          
          node.content = JSON.stringify(packageJson, null, 2);
          fixed = true;
        }
      } catch (error) {
        console.error('Error fixing dependencies:', error);
      }
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => processNode(child));
    }
  }
  
  fileTree.forEach(node => processNode(node));
  
  return {
    files: fileTree,
    fixed,
    fixes
  };
}

/**
 * Add --legacy-peer-deps flag to npm install commands
 */
export function addLegacyPeerDepsFlag(packageJson) {
  try {
    const pkg = typeof packageJson === 'string' ? JSON.parse(packageJson) : packageJson;
    
    // Add .npmrc configuration
    if (!pkg.scripts) {
      pkg.scripts = {};
    }
    
    // Ensure install uses legacy peer deps
    pkg.scripts.preinstall = 'echo "Using legacy peer deps for compatibility"';
    
    return typeof packageJson === 'string' ? JSON.stringify(pkg, null, 2) : pkg;
  } catch (error) {
    console.error('Error adding legacy peer deps flag:', error);
    return packageJson;
  }
}

/**
 * Create .npmrc file with legacy peer deps
 */
export function createNpmrcFile() {
  return {
    type: 'file',
    name: '.npmrc',
    content: 'legacy-peer-deps=true\n'
  };
}

/**
 * External Component Libraries Service
 * Intelligently integrates open-source React component libraries
 * Based on project type and requirements
 */

/**
 * Available external libraries with their strengths
 */
export const externalLibraries = {
  reactbits: {
    name: 'React Bits',
    url: 'https://www.reactbits.dev',
    npm: 'react-bits-ui',
    strengths: ['modern', 'animations', 'interactive', 'premium'],
    bestFor: ['landing', 'saas', 'marketing', 'portfolio'],
    components: {
      hero: true,
      navbar: true,
      cards: true,
      buttons: true,
      forms: true,
      animations: true
    },
    setup: {
      install: 'npm install react-bits-ui framer-motion',
      import: "import { Button, Card, Hero } from 'react-bits-ui';"
    }
  },

  uiverse: {
    name: 'Uiverse',
    url: 'https://uiverse.io',
    npm: null, // Copy-paste components
    strengths: ['creative', 'unique', 'animations', 'modern'],
    bestFor: ['portfolio', 'creative', 'showcase', 'landing'],
    components: {
      buttons: true,
      cards: true,
      loaders: true,
      inputs: true,
      checkboxes: true,
      switches: true
    },
    setup: {
      install: null,
      import: '// Copy component code directly'
    }
  },

  flowbite: {
    name: 'Flowbite',
    url: 'https://flowbite.com',
    npm: 'flowbite flowbite-react',
    strengths: ['tailwind', 'comprehensive', 'professional', 'accessible'],
    bestFor: ['dashboard', 'admin', 'saas', 'business'],
    components: {
      navbar: true,
      sidebar: true,
      cards: true,
      tables: true,
      forms: true,
      modals: true,
      dropdowns: true,
      alerts: true,
      badges: true,
      breadcrumbs: true
    },
    setup: {
      install: 'npm install flowbite flowbite-react',
      import: "import { Button, Card, Navbar } from 'flowbite-react';"
    }
  },

  tailgrids: {
    name: 'TailGrids',
    url: 'https://tailgrids.com',
    npm: null, // Copy-paste components
    strengths: ['tailwind', 'responsive', 'clean', 'professional'],
    bestFor: ['landing', 'marketing', 'business', 'blog'],
    components: {
      hero: true,
      features: true,
      pricing: true,
      testimonials: true,
      team: true,
      cta: true,
      footer: true,
      navbar: true
    },
    setup: {
      install: null,
      import: '// Copy component code directly'
    }
  }
};

/**
 * Intelligent library selector based on project type
 */
export function selectLibrariesForProject(projectType, requirements = []) {
  const recommendations = [];

  // Analyze project type and recommend libraries
  switch (projectType.toLowerCase()) {
    case 'portfolio':
      recommendations.push({
        library: 'uiverse',
        reason: 'Creative, unique components perfect for standing out',
        priority: 'high',
        components: ['buttons', 'cards', 'animations']
      });
      recommendations.push({
        library: 'reactbits',
        reason: 'Modern animations and interactive elements',
        priority: 'medium',
        components: ['hero', 'navbar', 'animations']
      });
      break;

    case 'landing':
    case 'saas':
    case 'marketing':
      recommendations.push({
        library: 'tailgrids',
        reason: 'Professional landing page sections',
        priority: 'high',
        components: ['hero', 'features', 'pricing', 'testimonials']
      });
      recommendations.push({
        library: 'reactbits',
        reason: 'Premium feel with smooth animations',
        priority: 'high',
        components: ['hero', 'cta', 'animations']
      });
      break;

    case 'dashboard':
    case 'admin':
      recommendations.push({
        library: 'flowbite',
        reason: 'Comprehensive dashboard components',
        priority: 'high',
        components: ['sidebar', 'tables', 'cards', 'modals', 'forms']
      });
      break;

    case 'blog':
    case 'content':
      recommendations.push({
        library: 'tailgrids',
        reason: 'Clean, readable content layouts',
        priority: 'high',
        components: ['navbar', 'cards', 'footer']
      });
      recommendations.push({
        library: 'flowbite',
        reason: 'Professional blog components',
        priority: 'medium',
        components: ['cards', 'breadcrumbs', 'badges']
      });
      break;

    case 'ecommerce':
    case 'shop':
      recommendations.push({
        library: 'flowbite',
        reason: 'Complete e-commerce UI components',
        priority: 'high',
        components: ['cards', 'modals', 'forms', 'badges']
      });
      recommendations.push({
        library: 'tailgrids',
        reason: 'Product showcases and pricing',
        priority: 'medium',
        components: ['pricing', 'features', 'testimonials']
      });
      break;

    default:
      // General purpose - use Flowbite as safe choice
      recommendations.push({
        library: 'flowbite',
        reason: 'Comprehensive, professional components',
        priority: 'medium',
        components: ['navbar', 'cards', 'buttons', 'forms']
      });
  }

  // Check for specific requirements
  if (requirements.includes('animations')) {
    recommendations.push({
      library: 'reactbits',
      reason: 'Best-in-class animations',
      priority: 'high',
      components: ['animations']
    });
  }

  if (requirements.includes('creative')) {
    recommendations.push({
      library: 'uiverse',
      reason: 'Unique, creative components',
      priority: 'high',
      components: ['buttons', 'cards', 'loaders']
    });
  }

  // Remove duplicates and sort by priority
  const unique = recommendations.reduce((acc, rec) => {
    const existing = acc.find(r => r.library === rec.library);
    if (!existing) {
      acc.push(rec);
    } else if (rec.priority === 'high' && existing.priority !== 'high') {
      existing.priority = 'high';
      existing.components = [...new Set([...existing.components, ...rec.components])];
    }
    return acc;
  }, []);

  return unique.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate installation instructions
 */
export function generateInstallInstructions(libraries) {
  const instructions = [];
  const npmLibraries = [];

  libraries.forEach(lib => {
    const libData = externalLibraries[lib.library];
    
    if (libData.npm) {
      npmLibraries.push(libData.npm);
      instructions.push({
        library: libData.name,
        command: `npm install ${libData.npm}`,
        import: libData.setup.import
      });
    } else {
      instructions.push({
        library: libData.name,
        command: null,
        note: `Visit ${libData.url} and copy components directly`,
        import: libData.setup.import
      });
    }
  });

  // Combine npm installs
  if (npmLibraries.length > 0) {
    const combinedInstall = `npm install ${npmLibraries.join(' ')}`;
    return {
      combined: combinedInstall,
      individual: instructions
    };
  }

  return {
    combined: null,
    individual: instructions
  };
}

/**
 * Generate enhanced prompt with library recommendations
 */
export function generateLibraryPrompt(projectType, selectedLibraries) {
  if (!selectedLibraries || selectedLibraries.length === 0) {
    return '';
  }

  const libraryInstructions = selectedLibraries.map(lib => {
    const libData = externalLibraries[lib.library];
    return `
**${libData.name}** (${lib.priority} priority):
- Use for: ${lib.components.join(', ')}
- Reason: ${lib.reason}
- Components available: ${Object.keys(libData.components).filter(k => libData.components[k]).join(', ')}
${libData.npm ? `- Import: ${libData.setup.import}` : '- Copy components from: ' + libData.url}
`;
  }).join('\n');

  return `
🎨 COMPONENT LIBRARY INTEGRATION - CREATE JAW-DROPPING DESIGNS!

You MUST use these professional component libraries to create WORLD-CLASS UI/UX:

${libraryInstructions}

🚀 CRITICAL DESIGN REQUIREMENTS:
1. **Use Libraries for Complex Components** - Tables, modals, forms, navigation
2. **Create UNIQUE Designs** - No generic templates, every site should be different
3. **Modern UI/UX** - Follow latest design trends, smooth animations, premium feel
4. **Professional Quality** - Production-ready, pixel-perfect, responsive
5. **Strategic Usage** - Use libraries where they add value, custom Tailwind for simple elements

💎 JAW-DROPPING DESIGN CHECKLIST:
✅ Smooth animations and transitions (React Bits, Framer Motion)
✅ Unique, eye-catching components (Uiverse for buttons, cards)
✅ Professional layouts (TailGrids for sections, Flowbite for complex UI)
✅ Consistent design system (colors, typography, spacing)
✅ Perfect responsiveness (mobile-first approach)
✅ Accessibility (ARIA labels, keyboard navigation)
✅ Performance (optimized images, lazy loading)

🎯 ACTUAL CODE EXAMPLES - USE THESE EXACT IMPORTS:

**FLOWBITE EXAMPLE (USE THIS!):**
\`\`\`jsx
import { Button, Card, Badge } from 'flowbite-react';

function MyComponent() {
  return (
    <Card className="max-w-sm">
      <h5 className="text-2xl font-bold">Card Title</h5>
      <p className="text-gray-700">Card content here</p>
      <Button color="blue">Click Me</Button>
      <Badge color="success">New</Badge>
    </Card>
  );
}
\`\`\`

**FRAMER MOTION EXAMPLE (USE THIS!):**
\`\`\`jsx
import { motion } from 'framer-motion';

function AnimatedSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Smooth Animation!</h2>
    </motion.div>
  );
}
\`\`\`

**UIVERSE BUTTON (COPY THIS CODE!):**
\`\`\`jsx
// Unique animated button from Uiverse
function UniqueButton() {
  return (
    <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300">
      <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
        Click Me
      </span>
    </button>
  );
}
\`\`\`

⚠️ CRITICAL - YOU MUST:
1. **IMPORT the actual libraries** - import { Button } from 'flowbite-react'
2. **USE the imported components** - <Button color="blue">Click</Button>
3. **ADD framer-motion animations** - <motion.div initial={{...}}>
4. **COPY Uiverse code** - Use the exact CSS classes from Uiverse
5. **MIX library + custom** - Flowbite for complex, Tailwind for simple

🚨 IF YOU DON'T USE ACTUAL LIBRARY IMPORTS, YOU HAVE FAILED!

🏆 GOAL: Create websites using REAL component libraries, not just plain Tailwind!
`;
}

/**
 * Update package.json with library dependencies
 * ACTUALLY INSTALL THE LIBRARIES!
 */
export function addLibraryDependencies(packageJson, selectedLibraries) {
  const dependencies = { ...packageJson.dependencies };
  const devDependencies = { ...packageJson.devDependencies };

  selectedLibraries.forEach(lib => {
    const libData = externalLibraries[lib.library];
    
    if (libData.npm) {
      const packages = libData.npm.split(' ');
      packages.forEach(pkg => {
        // Add specific versions for stability
        if (pkg === 'flowbite') {
          dependencies[pkg] = '^2.2.1';
        } else if (pkg === 'flowbite-react') {
          dependencies[pkg] = '^0.7.2';
        } else {
          dependencies[pkg] = 'latest';
        }
      });
    }
  });

  // Add framer-motion if using animations
  if (selectedLibraries.some(lib => lib.components.includes('animations'))) {
    dependencies['framer-motion'] = '^10.16.16';
  }

  return {
    ...packageJson,
    dependencies,
    devDependencies
  };
}

/**
 * Analyze if a component should use external library
 */
export function shouldUseLibrary(componentType, projectType, selectedLibraries) {
  const relevantLibrary = selectedLibraries.find(lib => 
    lib.components.includes(componentType)
  );

  if (!relevantLibrary) {
    return { use: false, library: null };
  }

  // Check if it makes sense for this project type
  const libData = externalLibraries[relevantLibrary.library];
  const isGoodFit = libData.bestFor.includes(projectType.toLowerCase());

  return {
    use: isGoodFit,
    library: relevantLibrary.library,
    reason: relevantLibrary.reason,
    priority: relevantLibrary.priority
  };
}

/**
 * Get component example from library
 */
export function getLibraryComponentExample(library, componentType) {
  const examples = {
    flowbite: {
      button: `import { Button } from 'flowbite-react';

function MyButton() {
  return (
    <Button color="blue" size="lg">
      Click me
    </Button>
  );
}`,
      card: `import { Card } from 'flowbite-react';

function MyCard() {
  return (
    <Card className="max-w-sm">
      <h5 className="text-2xl font-bold">Card Title</h5>
      <p className="text-gray-700">Card content goes here</p>
    </Card>
  );
}`,
      navbar: `import { Navbar } from 'flowbite-react';

function MyNavbar() {
  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="/">
        <span className="text-xl font-semibold">Brand</span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link href="/">Home</Navbar.Link>
        <Navbar.Link href="/about">About</Navbar.Link>
        <Navbar.Link href="/contact">Contact</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}`
    },
    
    reactbits: {
      hero: `import { Hero } from 'react-bits-ui';
import { motion } from 'framer-motion';

function MyHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center"
    >
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-6">Welcome</h1>
        <p className="text-xl mb-8">Build amazing things</p>
      </div>
    </motion.div>
  );
}`
    }
  };

  return examples[library]?.[componentType] || null;
}

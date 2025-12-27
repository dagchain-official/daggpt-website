/**
 * Library Analyzer Service
 * Intelligently analyzes project requirements and recommends libraries
 */

import { selectLibrariesForProject, externalLibraries } from './externalLibraries';

/**
 * Analyze project and get smart library recommendations
 */
export function analyzeAndRecommendLibraries(projectPlan, userRequest) {
  const analysis = {
    projectType: projectPlan.projectType,
    requirements: extractRequirements(userRequest, projectPlan),
    complexity: projectPlan.complexity,
    components: projectPlan.components
  };

  // Get base recommendations
  const recommendations = selectLibrariesForProject(
    analysis.projectType,
    analysis.requirements
  );

  // Refine based on complexity
  const refined = refineByComplexity(recommendations, analysis.complexity);

  // Add component-specific recommendations
  const final = addComponentRecommendations(refined, analysis.components);

  return {
    recommendations: final,
    reasoning: generateReasoning(final, analysis),
    usage: generateUsageGuidelines(final, analysis)
  };
}

/**
 * Extract requirements from user request
 */
function extractRequirements(userRequest, projectPlan) {
  const requirements = [];
  const lowerRequest = userRequest.toLowerCase();

  // Check for animation keywords
  if (lowerRequest.includes('animation') || 
      lowerRequest.includes('animated') || 
      lowerRequest.includes('smooth') ||
      lowerRequest.includes('interactive')) {
    requirements.push('animations');
  }

  // Check for creative keywords
  if (lowerRequest.includes('creative') || 
      lowerRequest.includes('unique') || 
      lowerRequest.includes('modern') ||
      lowerRequest.includes('stunning')) {
    requirements.push('creative');
  }

  // Check for professional keywords
  if (lowerRequest.includes('professional') || 
      lowerRequest.includes('business') || 
      lowerRequest.includes('corporate')) {
    requirements.push('professional');
  }

  // Check for dashboard keywords
  if (lowerRequest.includes('dashboard') || 
      lowerRequest.includes('admin') || 
      lowerRequest.includes('analytics')) {
    requirements.push('dashboard');
  }

  // Check for e-commerce keywords
  if (lowerRequest.includes('shop') || 
      lowerRequest.includes('store') || 
      lowerRequest.includes('ecommerce') ||
      lowerRequest.includes('product')) {
    requirements.push('ecommerce');
  }

  return requirements;
}

/**
 * Refine recommendations based on complexity
 */
function refineByComplexity(recommendations, complexity) {
  if (complexity === 'simple') {
    // For simple projects, limit to 1-2 libraries
    return recommendations.slice(0, 2);
  } else if (complexity === 'medium') {
    // For medium projects, use 2-3 libraries
    return recommendations.slice(0, 3);
  } else {
    // For complex projects, can use all recommended libraries
    return recommendations;
  }
}

/**
 * Add component-specific recommendations
 */
function addComponentRecommendations(recommendations, components) {
  const componentTypes = components.map(c => {
    const name = c.name.toLowerCase();
    if (name.includes('hero')) return 'hero';
    if (name.includes('nav')) return 'navbar';
    if (name.includes('card')) return 'cards';
    if (name.includes('button')) return 'buttons';
    if (name.includes('form')) return 'forms';
    if (name.includes('table')) return 'tables';
    if (name.includes('modal')) return 'modals';
    if (name.includes('sidebar')) return 'sidebar';
    return null;
  }).filter(Boolean);

  // Add libraries that have these specific components
  const enhanced = [...recommendations];

  componentTypes.forEach(type => {
    Object.keys(externalLibraries).forEach(libKey => {
      const lib = externalLibraries[libKey];
      if (lib.components[type] && !enhanced.find(r => r.library === libKey)) {
        enhanced.push({
          library: libKey,
          reason: `Has excellent ${type} components`,
          priority: 'low',
          components: [type]
        });
      }
    });
  });

  return enhanced;
}

/**
 * Generate reasoning for recommendations
 */
function generateReasoning(recommendations, analysis) {
  const reasoning = [];

  reasoning.push(`Project Type: ${analysis.projectType}`);
  reasoning.push(`Complexity: ${analysis.complexity}`);
  
  if (analysis.requirements.length > 0) {
    reasoning.push(`Requirements: ${analysis.requirements.join(', ')}`);
  }

  reasoning.push('\nRecommended Libraries:');
  
  recommendations.forEach((rec, index) => {
    const lib = externalLibraries[rec.library];
    reasoning.push(
      `${index + 1}. ${lib.name} (${rec.priority} priority) - ${rec.reason}`
    );
  });

  return reasoning.join('\n');
}

/**
 * Generate usage guidelines
 */
function generateUsageGuidelines(recommendations, analysis) {
  const guidelines = [];

  guidelines.push('INTELLIGENT USAGE GUIDELINES:');
  guidelines.push('');

  recommendations.forEach(rec => {
    const lib = externalLibraries[rec.library];
    
    guidelines.push(`${lib.name}:`);
    guidelines.push(`  ✅ Use for: ${rec.components.join(', ')}`);
    guidelines.push(`  ✅ Best when: ${rec.reason}`);
    guidelines.push(`  ❌ Don't use for: Everything - be selective!`);
    guidelines.push('');
  });

  guidelines.push('SMART MIXING:');
  guidelines.push('  • Use libraries for complex components (tables, modals, forms)');
  guidelines.push('  • Use custom Tailwind for simple components (divs, text)');
  guidelines.push('  • Mix library components with custom styling');
  guidelines.push('  • Prioritize consistency over variety');

  return guidelines.join('\n');
}

/**
 * Determine if component should use library
 */
export function shouldComponentUseLibrary(componentName, recommendations) {
  const componentType = detectComponentType(componentName);
  
  if (!componentType) {
    return { shouldUse: false, library: null };
  }

  // Find library that handles this component type
  const matchingLib = recommendations.find(rec => 
    rec.components.includes(componentType) && 
    rec.priority !== 'low'
  );

  if (!matchingLib) {
    return { shouldUse: false, library: null };
  }

  return {
    shouldUse: true,
    library: matchingLib.library,
    componentType,
    priority: matchingLib.priority,
    reason: matchingLib.reason
  };
}

/**
 * Detect component type from name
 */
function detectComponentType(componentName) {
  const name = componentName.toLowerCase();
  
  const typeMap = {
    hero: ['hero', 'banner', 'header'],
    navbar: ['nav', 'navigation', 'menu', 'header'],
    cards: ['card', 'item', 'product'],
    buttons: ['button', 'btn', 'cta'],
    forms: ['form', 'input', 'contact'],
    tables: ['table', 'data', 'grid'],
    modals: ['modal', 'dialog', 'popup'],
    sidebar: ['sidebar', 'aside', 'drawer'],
    footer: ['footer'],
    pricing: ['pricing', 'price', 'plan'],
    testimonials: ['testimonial', 'review'],
    features: ['feature', 'benefit']
  };

  for (const [type, keywords] of Object.entries(typeMap)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return type;
    }
  }

  return null;
}

/**
 * Generate component code with library
 */
export function generateLibraryComponentCode(componentName, library, componentType) {
  const lib = externalLibraries[library];
  
  if (!lib) {
    return null;
  }

  // Generate appropriate code based on library and component type
  const templates = {
    flowbite: {
      navbar: `import { Navbar } from 'flowbite-react';

function ${componentName}() {
  return (
    <Navbar fluid rounded className="bg-white shadow-md">
      <Navbar.Brand href="/">
        <span className="text-2xl font-bold text-indigo-600">Logo</span>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link href="/" active>Home</Navbar.Link>
        <Navbar.Link href="/about">About</Navbar.Link>
        <Navbar.Link href="/services">Services</Navbar.Link>
        <Navbar.Link href="/contact">Contact</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default ${componentName};`,

      cards: `import { Card } from 'flowbite-react';

function ${componentName}({ title, description, image }) {
  return (
    <Card
      className="max-w-sm"
      imgAlt={title}
      imgSrc={image || 'https://via.placeholder.com/400x300'}
    >
      <h5 className="text-2xl font-bold tracking-tight text-gray-900">
        {title}
      </h5>
      <p className="font-normal text-gray-700">
        {description}
      </p>
    </Card>
  );
}

export default ${componentName};`,

      buttons: `import { Button } from 'flowbite-react';

function ${componentName}({ children, onClick, variant = 'primary' }) {
  const colors = {
    primary: 'blue',
    secondary: 'gray',
    success: 'green',
    danger: 'red'
  };

  return (
    <Button color={colors[variant]} onClick={onClick} size="lg">
      {children}
    </Button>
  );
}

export default ${componentName};`
    },

    tailgrids: {
      hero: `function ${componentName}() {
  return (
    <section className="relative z-10 overflow-hidden bg-white pb-16 pt-[120px] md:pb-[120px] md:pt-[150px] xl:pb-[160px] xl:pt-[180px] 2xl:pb-[200px] 2xl:pt-[210px]">
      <div className="container mx-auto">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto max-w-[800px] text-center">
              <h1 className="mb-5 text-3xl font-bold leading-tight text-black sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
                Welcome to Our Platform
              </h1>
              <p className="mb-12 text-base !leading-relaxed text-body-color sm:text-lg md:text-xl">
                Build amazing things with our powerful tools and services
              </p>
              <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <a
                  href="#"
                  className="rounded-sm bg-primary px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-primary/80"
                >
                  Get Started
                </a>
                <a
                  href="#"
                  className="inline-block rounded-sm bg-black px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-black/90"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ${componentName};`,

      features: `function ${componentName}() {
  const features = [
    {
      icon: '⚡',
      title: 'Fast Performance',
      description: 'Lightning-fast load times and smooth interactions'
    },
    {
      icon: '🎨',
      title: 'Beautiful Design',
      description: 'Modern, clean interface that users love'
    },
    {
      icon: '🔒',
      title: 'Secure',
      description: 'Enterprise-grade security for your data'
    }
  ];

  return (
    <section className="pb-12 pt-20 lg:pb-[90px] lg:pt-[120px]">
      <div className="container mx-auto">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto mb-12 max-w-[510px] text-center lg:mb-20">
              <h2 className="mb-3 text-3xl font-bold leading-[1.2] text-dark sm:text-4xl md:text-[40px]">
                Our Features
              </h2>
              <p className="text-base text-body-color">
                Everything you need to build amazing products
              </p>
            </div>
          </div>
        </div>
        <div className="-mx-4 flex flex-wrap">
          {features.map((feature, index) => (
            <div key={index} className="w-full px-4 md:w-1/2 lg:w-1/3">
              <div className="mb-9 rounded-[20px] bg-white p-10 shadow-2 hover:shadow-lg md:px-7 xl:px-10">
                <div className="mb-8 flex h-[70px] w-[70px] items-center justify-center rounded-2xl bg-primary text-4xl">
                  {feature.icon}
                </div>
                <h4 className="mb-[14px] text-2xl font-semibold text-dark">
                  {feature.title}
                </h4>
                <p className="text-body-color">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ${componentName};`
    }
  };

  return templates[library]?.[componentType] || null;
}

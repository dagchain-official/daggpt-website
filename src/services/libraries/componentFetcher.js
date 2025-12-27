/**
 * Component Fetcher Service
 * Dynamically fetches and converts components from Reactbits and Uiverse
 */

/**
 * Fetch Uiverse component from GitHub
 */
export async function fetchUniverseComponent(category, componentName) {
  try {
    const url = `https://raw.githubusercontent.com/uiverse-io/galaxy/main/${category}/${componentName}.html`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Component not found: ${componentName}`);
    }
    
    const htmlContent = await response.text();
    return convertUniverseToReact(htmlContent, componentName);
  } catch (error) {
    console.error('Error fetching Uiverse component:', error);
    return null;
  }
}

/**
 * Convert Uiverse HTML to React component
 */
function convertUniverseToReact(htmlContent, componentName) {
  // Extract HTML and CSS
  const htmlMatch = htmlContent.match(/<([^>]+)>([\s\S]*?)<\/\1>/);
  const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
  
  if (!htmlMatch || !styleMatch) {
    return null;
  }
  
  let html = htmlMatch[0];
  let css = styleMatch[1];
  
  // Convert HTML to JSX
  html = html.replace(/class=/g, 'className=');
  html = html.replace(/for=/g, 'htmlFor=');
  html = html.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments
  
  // Generate component name
  const componentNamePascal = componentName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  // Create React component
  const reactComponent = `import React from 'react';
import './${componentNamePascal}.css';

export default function ${componentNamePascal}({ children, ...props }) {
  return (
    ${html}
  );
}`;
  
  return {
    jsx: reactComponent,
    css: css,
    name: componentNamePascal
  };
}

/**
 * Fetch all Uiverse components from a category
 */
export async function fetchUniverseCategory(category) {
  try {
    const url = `https://api.github.com/repos/uiverse-io/galaxy/contents/${category}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Category not found: ${category}`);
    }
    
    const files = await response.json();
    return files
      .filter(file => file.name.endsWith('.html'))
      .map(file => ({
        name: file.name.replace('.html', ''),
        downloadUrl: file.download_url
      }));
  } catch (error) {
    console.error('Error fetching Uiverse category:', error);
    return [];
  }
}

/**
 * Reactbits component fetcher
 * Note: Reactbits uses shadcn, so we'll create wrapper functions
 */
export function getReactbitsInstallCommand(componentName, format = 'JS-TW') {
  return `npx shadcn@latest add https://reactbits.dev/r/${componentName}-${format}`;
}

/**
 * Get list of popular Reactbits components
 */
export function getPopularReactbitsComponents() {
  return {
    backgrounds: [
      'Dither',
      'GridPattern',
      'DotPattern',
      'Noise',
      'Gradient'
    ],
    animations: [
      'FadeContent',
      'SplitText',
      'RevealText',
      'TypeWriter',
      'ScrollProgress',
      'AnimatedText',
      'TextReveal'
    ],
    effects: [
      'Spotlight',
      'Particles',
      'Ripple',
      'Glow',
      'Blur',
      'ShimmerButton',
      'MagneticButton'
    ],
    layouts: [
      'BentoGrid',
      'Marquee',
      'InfiniteScroll',
      'Masonry',
      'AnimatedGrid'
    ]
  };
}

/**
 * Get list of Uiverse categories
 */
export function getUniverseCategories() {
  return [
    'Buttons',
    'Cards',
    'Checkboxes',
    'Forms',
    'Inputs',
    'loaders',
    'Notifications',
    'Patterns',
    'Radio-buttons',
    'Toggle-switches',
    'Tooltips'
  ];
}

/**
 * Build component library manifest
 */
export async function buildComponentManifest() {
  const manifest = {
    reactbits: getPopularReactbitsComponents(),
    uiverse: {},
    timestamp: new Date().toISOString()
  };
  
  // Fetch Uiverse component counts
  const categories = getUniverseCategories();
  for (const category of categories) {
    const components = await fetchUniverseCategory(category);
    manifest.uiverse[category] = components.map(c => c.name);
  }
  
  return manifest;
}

/**
 * Generate component import code
 */
export function generateComponentImport(library, componentName, category = null) {
  if (library === 'reactbits') {
    // Reactbits uses shadcn pattern
    const kebabCase = componentName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
    return `import { ${componentName} } from '@/components/ui/${kebabCase}';`;
  }
  
  if (library === 'uiverse') {
    // Uiverse components are custom
    return `import ${componentName} from '@/components/uiverse/${category}/${componentName}';`;
  }
  
  if (library === 'flowbite') {
    return `import { ${componentName} } from 'flowbite-react';`;
  }
  
  return '';
}

/**
 * Check if component exists in library
 */
export function isComponentAvailable(library, componentName, manifest) {
  if (library === 'reactbits') {
    const allComponents = Object.values(manifest.reactbits).flat();
    return allComponents.includes(componentName);
  }
  
  if (library === 'uiverse') {
    const allComponents = Object.values(manifest.uiverse).flat();
    return allComponents.includes(componentName);
  }
  
  return false;
}

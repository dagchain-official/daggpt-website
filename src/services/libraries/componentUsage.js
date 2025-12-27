/**
 * Component Library Usage Patterns
 * Exact documentation and usage examples for each library
 */

/**
 * ============================================
 * REACTBITS COMPONENTS
 * ============================================
 * Open-source collection of creative UI components
 * NOT generic buttons/inputs - unique, visually striking components
 * 
 * IMPORTANT RULES:
 * - Use MAX 2-3 components per page (performance/UX)
 * - These are statement pieces, not basic UI elements
 * - Components are installed via shadcn CLI
 */
export const REACTBITS = {
  // Installation method
  installation: {
    method: 'shadcn-cli',
    command: 'npx shadcn@latest add https://reactbits.dev/r/<Component>-<LANG>-<STYLE>',
    
    // Language + Style combinations
    formats: {
      'JS-CSS': 'JavaScript + Plain CSS',
      'JS-TW': 'JavaScript + Tailwind',
      'TS-CSS': 'TypeScript + Plain CSS',
      'TS-TW': 'TypeScript + Tailwind'
    },
    
    // Recommended format for our stack
    recommended: 'JS-TW', // JavaScript + Tailwind
    
    // Registry setup (for MCP)
    registry: {
      name: '@react-bits',
      url: 'https://reactbits.dev/r/{name}.json'
    }
  },
  
  // Available component categories
  categories: {
    backgrounds: [
      'Dither', 'GridPattern', 'DotPattern', 'Noise', 'Gradient'
    ],
    animations: [
      'FadeContent', 'SplitText', 'RevealText', 'TypeWriter', 'ScrollProgress'
    ],
    effects: [
      'Spotlight', 'Particles', 'Ripple', 'Glow', 'Blur'
    ],
    layouts: [
      'BentoGrid', 'Marquee', 'InfiniteScroll', 'Masonry'
    ]
  },
  
  // Component usage patterns
  components: {
    // Example: SplitText component
    SplitText: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/SplitText-JS-TW',
      import: "import { SplitText } from '@/components/ui/split-text'",
      usage: `<SplitText 
  text="Your amazing text here"
  className="text-4xl font-bold"
  delay={0.1}
/>`,
      props: {
        text: 'string - Text to animate',
        delay: 'number - Delay between characters',
        className: 'string - Tailwind classes'
      }
    },
    
    // Example: FadeContent component
    FadeContent: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/FadeContent-JS-TW',
      import: "import { FadeContent } from '@/components/ui/fade-content'",
      usage: `<FadeContent>
  <div>Content that fades in on scroll</div>
</FadeContent>`,
      props: {
        children: 'ReactNode - Content to fade in',
        threshold: 'number - Scroll threshold (0-1)',
        duration: 'number - Animation duration'
      }
    },
    
    // Example: Dither Background
    DitherBackground: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/Dither-JS-TW',
      import: "import { Dither } from '@/components/ui/dither'",
      usage: `<Dither 
  className="fixed inset-0 -z-10"
  color="purple"
/>`,
      props: {
        color: 'string - Background color',
        className: 'string - Tailwind classes'
      }
    },
    
    // Example: Spotlight effect
    Spotlight: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/Spotlight-JS-TW',
      import: "import { Spotlight } from '@/components/ui/spotlight'",
      usage: `<Spotlight 
  className="absolute top-0 left-0"
  fill="blue"
/>`,
      props: {
        fill: 'string - Spotlight color',
        className: 'string - Positioning classes'
      }
    }
  },
  
  // Best practices
  bestPractices: {
    maxPerPage: 3,
    purpose: 'Visual statements, not basic UI',
    performance: 'Limit animations to avoid overload',
    integration: 'Modify code after installation as needed'
  },
  
  // Example combinations for different page types
  recommendations: {
    hero: ['SplitText', 'Spotlight', 'DitherBackground'],
    features: ['FadeContent', 'BentoGrid'],
    testimonials: ['Marquee', 'FadeContent'],
    cta: ['Glow', 'RevealText']
  },
  
  // Full page examples
  examples: {
    heroSection: `import { SplitText } from '@/components/ui/split-text';
import { Spotlight } from '@/components/ui/spotlight';
import { Dither } from '@/components/ui/dither';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background */}
      <Dither className="fixed inset-0 -z-10" color="purple" />
      
      {/* Spotlight effect */}
      <Spotlight className="absolute top-0 left-0" fill="blue" />
      
      {/* Animated heading */}
      <SplitText 
        text="Welcome to the Future"
        className="text-6xl font-bold text-white"
        delay={0.1}
      />
    </section>
  );
}`,

    fadeInSection: `import { FadeContent } from '@/components/ui/fade-content';

export default function Features() {
  return (
    <section className="py-20">
      <FadeContent>
        <h2 className="text-4xl font-bold mb-8">Amazing Features</h2>
        <div className="grid grid-cols-3 gap-8">
          {/* Feature cards */}
        </div>
      </FadeContent>
    </section>
  );
}`
  }
};

/**
 * ============================================
 * FLOWBITE REACT COMPONENTS
 * ============================================
 * Official React components built for Flowbite and Tailwind CSS
 * Production-ready, fully interactive, TypeScript-ready
 * 
 * Documentation: https://flowbite-react.com
 * GitHub: https://github.com/themesberg/flowbite-react
 */
export const FLOWBITE = {
  // Installation
  installation: {
    // Method 1: Create new project
    createNew: 'npx create-flowbite-react@latest',
    
    // Method 2: Add to existing project
    addToExisting: 'npx flowbite-react@latest init',
    
    // Method 3: Manual installation
    manual: 'npm install flowbite flowbite-react',
    
    dependencies: ['flowbite', 'flowbite-react', 'tailwindcss'],
    
    // Tailwind config required
    tailwindConfig: {
      content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "node_modules/flowbite-react/lib/esm/**/*.js"
      ],
      plugins: [
        "require('flowbite/plugin')"
      ]
    }
  },
  
  // Component categories
  categories: {
    navigation: ['Navbar', 'Breadcrumb', 'Tabs', 'Sidebar', 'Pagination'],
    forms: ['TextInput', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Toggle', 'FileInput', 'Label'],
    dataDisplay: ['Table', 'Card', 'List', 'Timeline', 'Rating', 'Badge', 'Avatar'],
    feedback: ['Alert', 'Modal', 'Toast', 'Progress', 'Spinner'],
    layout: ['Accordion', 'Footer', 'Dropdown', 'Carousel'],
    buttons: ['Button', 'ButtonGroup'],
    overlays: ['Tooltip', 'Popover', 'Drawer']
  },
  
  // Component usage patterns
  components: {
    Button: {
      import: "import { Button } from 'flowbite-react';",
      basic: `<Button>Default</Button>`,
      withColor: `<Button color="blue">Blue Button</Button>
<Button color="green">Green Button</Button>
<Button color="red">Red Button</Button>`,
      withSize: `<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>`,
      pill: `<Button pill>Rounded Button</Button>`,
      outline: `<Button outline>Outline Button</Button>`,
      withIcon: `import { HiShoppingCart } from 'react-icons/hi';

<Button>
  <HiShoppingCart className="mr-2 h-5 w-5" />
  Buy now
</Button>`,
      props: {
        color: 'blue | green | red | yellow | purple | dark | light | alternative',
        size: 'xs | sm | md | lg | xl',
        pill: 'boolean - Rounded corners',
        outline: 'boolean - Outline style',
        disabled: 'boolean',
        onClick: 'function'
      }
    },
    
    Card: {
      import: "import { Card } from 'flowbite-react';",
      basic: `<Card>
  <h5 className="text-2xl font-bold">Card Title</h5>
  <p className="text-gray-700">Card content goes here</p>
</Card>`,
      withImage: `<Card imgSrc="/images/blog/image-1.jpg" imgAlt="Image">
  <h5 className="text-2xl font-bold">Card with Image</h5>
  <p>Content below image</p>
</Card>`,
      horizontal: `<Card horizontal imgSrc="/image.jpg">
  <h5>Horizontal Card</h5>
  <p>Image on the side</p>
</Card>`
    },
    
    Modal: {
      import: "import { Modal, Button } from 'flowbite-react';",
      usage: `import { useState } from 'react';
import { Modal, Button } from 'flowbite-react';

export default function ModalExample() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <Button onClick={() => setOpenModal(true)}>Open Modal</Button>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Modal Title</Modal.Header>
        <Modal.Body>
          <p>Modal content goes here</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setOpenModal(false)}>Accept</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}`
    },
    
    Navbar: {
      import: "import { Navbar } from 'flowbite-react';",
      usage: `<Navbar fluid rounded>
  <Navbar.Brand href="/">
    <img src="/logo.svg" className="mr-3 h-6 sm:h-9" alt="Logo" />
    <span className="self-center text-xl font-semibold">Brand</span>
  </Navbar.Brand>
  <Navbar.Toggle />
  <Navbar.Collapse>
    <Navbar.Link href="/" active>Home</Navbar.Link>
    <Navbar.Link href="/about">About</Navbar.Link>
    <Navbar.Link href="/services">Services</Navbar.Link>
    <Navbar.Link href="/contact">Contact</Navbar.Link>
  </Navbar.Collapse>
</Navbar>`
    },
    
    TextInput: {
      import: "import { TextInput, Label } from 'flowbite-react';",
      usage: `<div>
  <Label htmlFor="email" value="Your email" />
  <TextInput
    id="email"
    type="email"
    placeholder="name@example.com"
    required
  />
</div>`,
      withIcon: `import { HiMail } from 'react-icons/hi';

<TextInput
  icon={HiMail}
  placeholder="name@example.com"
  type="email"
/>`
    },
    
    Alert: {
      import: "import { Alert } from 'flowbite-react';",
      usage: `<Alert color="info">
  <span className="font-medium">Info alert!</span> Change a few things up and try submitting again.
</Alert>
<Alert color="success">
  <span className="font-medium">Success!</span> Your changes have been saved.
</Alert>
<Alert color="warning">
  <span className="font-medium">Warning!</span> Please review your information.
</Alert>
<Alert color="failure">
  <span className="font-medium">Error!</span> Something went wrong.
</Alert>`
    },
    
    Dropdown: {
      import: "import { Dropdown } from 'flowbite-react';",
      usage: `<Dropdown label="Dropdown button">
  <Dropdown.Item>Dashboard</Dropdown.Item>
  <Dropdown.Item>Settings</Dropdown.Item>
  <Dropdown.Item>Earnings</Dropdown.Item>
  <Dropdown.Divider />
  <Dropdown.Item>Sign out</Dropdown.Item>
</Dropdown>`
    },
    
    Table: {
      import: "import { Table } from 'flowbite-react';",
      usage: `<Table>
  <Table.Head>
    <Table.HeadCell>Product name</Table.HeadCell>
    <Table.HeadCell>Color</Table.HeadCell>
    <Table.HeadCell>Price</Table.HeadCell>
  </Table.Head>
  <Table.Body>
    <Table.Row>
      <Table.Cell>Apple MacBook Pro</Table.Cell>
      <Table.Cell>Silver</Table.Cell>
      <Table.Cell>$2999</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>`
    }
  },
  
  // Best practices
  bestPractices: {
    imports: 'Import only components you need',
    tailwind: 'Always configure Tailwind content paths',
    typescript: 'Use TypeScript for better type safety',
    customization: 'Use theme prop for global customization',
    accessibility: 'Components have built-in ARIA support'
  },
  
  // Theme customization
  theming: {
    example: `import { Flowbite } from 'flowbite-react';

const customTheme = {
  button: {
    color: {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  }
};

export default function App() {
  return (
    <Flowbite theme={{ theme: customTheme }}>
      <Button color="primary">Custom Button</Button>
    </Flowbite>
  );
}`
  },
  
  // Full examples
  examples: {
    loginForm: `import { Button, Card, Label, TextInput } from 'flowbite-react';

export default function LoginForm() {
  return (
    <Card className="max-w-sm">
      <form className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email" value="Your email" />
          <TextInput
            id="email"
            type="email"
            placeholder="name@example.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="password" value="Your password" />
          <TextInput id="password" type="password" required />
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Card>
  );
}`,

    productCard: `import { Button, Card } from 'flowbite-react';

export default function ProductCard() {
  return (
    <Card
      imgAlt="Product image"
      imgSrc="/images/products/apple-watch.png"
    >
      <h5 className="text-xl font-semibold tracking-tight text-gray-900">
        Apple Watch Series 7 GPS
      </h5>
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-gray-900">$599</span>
        <Button>Add to cart</Button>
      </div>
    </Card>
  );
}`,

    navbar: `import { Navbar, Button } from 'flowbite-react';

export default function Navigation() {
  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="/">
        <img src="/logo.svg" className="mr-3 h-6 sm:h-9" alt="Logo" />
        <span className="self-center whitespace-nowrap text-xl font-semibold">
          Flowbite React
        </span>
      </Navbar.Brand>
      <div className="flex md:order-2">
        <Button>Get started</Button>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link href="/" active>Home</Navbar.Link>
        <Navbar.Link href="/about">About</Navbar.Link>
        <Navbar.Link href="/services">Services</Navbar.Link>
        <Navbar.Link href="/pricing">Pricing</Navbar.Link>
        <Navbar.Link href="/contact">Contact</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}`
  }
};

/**
 * ============================================
 * UIVERSE.IO COMPONENTS
 * ============================================
 * Community-made open-source UI library
 * 3000+ unique components with CSS or Tailwind
 * 
 * IMPORTANT:
 * - Components are HTML + CSS (not React components)
 * - Need to be converted to React JSX
 * - Copy HTML structure and CSS styles
 * - Available on GitHub: https://github.com/uiverse-io/galaxy
 */
export const UIVERSE = {
  // Installation method
  installation: {
    method: 'copy-paste',
    source: 'https://uiverse.io or GitHub repo',
    repository: 'https://github.com/uiverse-io/galaxy',
    license: 'MIT License',
    
    // How to use
    steps: [
      '1. Browse components on uiverse.io',
      '2. Copy HTML and CSS code',
      '3. Convert HTML to JSX syntax',
      '4. Add CSS to component or CSS module',
      '5. Customize as needed'
    ]
  },
  
  // Available component categories
  categories: {
    Buttons: '3000+ button variations',
    Cards: 'Card components',
    Checkboxes: 'Custom checkboxes',
    Forms: 'Form components',
    Inputs: 'Input fields',
    Loaders: 'Loading animations',
    Notifications: 'Toast/alert components',
    Patterns: 'Background patterns',
    RadioButtons: 'Custom radio buttons',
    ToggleSwitches: 'Toggle switches',
    Tooltips: 'Tooltip components'
  },
  
  // Component structure
  structure: {
    format: 'HTML + CSS in single file',
    example: `<button class="btn">
  <span class="btn-text-one">Hover me</span>
  <span class="btn-text-two">Great!</span>
</button>
<style>
.btn {
  width: 140px;
  height: 50px;
  background: linear-gradient(to top, #00154c, #12376e, #23487f);
  color: #fff;
  border-radius: 50px;
  border: none;
  outline: none;
  cursor: pointer;
  position: relative;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
</style>`
  },
  
  // Conversion to React
  reactConversion: {
    steps: [
      'Replace class with className',
      'Convert inline styles to camelCase',
      'Use CSS modules or styled-components',
      'Add proper React event handlers'
    ],
    
    example: `// Original Uiverse HTML
<button class="btn">
  <span class="btn-text-one">Hover me</span>
</button>

// Converted to React JSX
export default function AnimatedButton() {
  return (
    <button className="btn">
      <span className="btn-text-one">Hover me</span>
      <span className="btn-text-two">Great!</span>
    </button>
  );
}

// CSS (in separate file or CSS module)
.btn {
  width: 140px;
  height: 50px;
  background: linear-gradient(to top, #00154c, #12376e, #23487f);
  /* ... rest of styles */
}`
  },
  
  // Usage patterns for different component types
  components: {
    Button: {
      source: 'https://github.com/uiverse-io/galaxy/tree/main/Buttons',
      count: '3000+',
      usage: `import './Button.css';

export default function CustomButton({ children, onClick }) {
  return (
    <button className="uiverse-btn" onClick={onClick}>
      <span className="btn-text">{children}</span>
    </button>
  );
}`,
      styles: `/* Copy from Uiverse.io */
.uiverse-btn {
  /* Paste styles here */
}`
    },
    
    Card: {
      source: 'https://github.com/uiverse-io/galaxy/tree/main/Cards',
      usage: `export default function CustomCard({ title, content }) {
  return (
    <div className="uiverse-card">
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
}`
    },
    
    Loader: {
      source: 'https://github.com/uiverse-io/galaxy/tree/main/loaders',
      usage: `export default function CustomLoader() {
  return (
    <div className="uiverse-loader">
      <div className="spinner"></div>
    </div>
  );
}`
    },
    
    Input: {
      source: 'https://github.com/uiverse-io/galaxy/tree/main/Inputs',
      usage: `export default function CustomInput({ placeholder, value, onChange }) {
  return (
    <input 
      className="uiverse-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}`
    }
  },
  
  // Best practices
  bestPractices: {
    naming: 'Prefix classes to avoid conflicts (e.g., uiverse-btn)',
    css: 'Use CSS modules or scoped styles',
    customization: 'Modify colors, sizes to match your design',
    accessibility: 'Add ARIA labels and keyboard support',
    performance: 'Optimize animations for 60fps'
  },
  
  // Integration with our stack
  integration: {
    withTailwind: 'Can combine Uiverse CSS with Tailwind utility classes',
    withReact: 'Convert HTML to JSX, add React state/props',
    withFramerMotion: 'Can enhance Uiverse animations with Framer Motion',
    
    example: `// Combining Uiverse with Tailwind
export default function HybridButton() {
  return (
    <button className="uiverse-btn mt-4 mx-auto">
      {/* Uiverse styles + Tailwind utilities */}
      <span className="btn-text">Click me</span>
    </button>
  );
}`
  },
  
  // Full example
  examples: {
    animatedButton: `// Component: AnimatedButton.jsx
import React from 'react';
import './AnimatedButton.css';

export default function AnimatedButton({ children, onClick }) {
  return (
    <button className="animated-btn" onClick={onClick}>
      <span className="btn-text-one">{children}</span>
      <span className="btn-text-two">Great!</span>
    </button>
  );
}

// Styles: AnimatedButton.css
.animated-btn {
  width: 140px;
  height: 50px;
  background: linear-gradient(to top, #00154c, #12376e, #23487f);
  color: #fff;
  border-radius: 50px;
  border: none;
  outline: none;
  cursor: pointer;
  position: relative;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.animated-btn span {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: top 0.5s;
}

.btn-text-one {
  position: absolute;
  width: 100%;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.btn-text-two {
  position: absolute;
  width: 100%;
  top: 150%;
  left: 0;
  transform: translateY(-50%);
}

.animated-btn:hover .btn-text-one {
  top: -100%;
}

.animated-btn:hover .btn-text-two {
  top: 50%;
}`,

    glowingCard: `// From Uiverse.io Cards category
import React from 'react';
import './GlowingCard.css';

export default function GlowingCard({ title, description }) {
  return (
    <div className="glowing-card">
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
    </div>
  );
}

// CSS with glow effect
.glowing-card {
  width: 300px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.glowing-card:hover {
  box-shadow: 0 8px 32px rgba(100, 100, 255, 0.4);
  transform: translateY(-5px);
}`
  }
};

/**
 * ============================================
 * TAILGRIDS COMPONENTS
 * ============================================
 */
export const TAILGRIDS = {
  installation: {
    // Will be filled
  },
  
  components: {
    // Will be filled
  },
  
  examples: {
    // Will be filled
  }
};

/**
 * ============================================
 * FRAMER MOTION PATTERNS
 * ============================================
 */
export const FRAMER_MOTION = {
  installation: {
    command: 'npm install framer-motion',
    dependencies: ['framer-motion']
  },
  
  patterns: {
    // Will be filled with animation patterns
  },
  
  examples: {
    // Will be filled
  }
};

/**
 * Get component usage for a specific library
 */
export function getLibraryUsage(libraryName) {
  const libraries = {
    'reactbits': REACTBITS,
    'flowbite': FLOWBITE,
    'uiverse': UIVERSE,
    'tailgrids': TAILGRIDS,
    'framer-motion': FRAMER_MOTION
  };
  
  return libraries[libraryName.toLowerCase()] || null;
}

/**
 * Get all available libraries
 */
export function getAllLibraries() {
  return {
    REACTBITS,
    FLOWBITE,
    UIVERSE,
    TAILGRIDS,
    FRAMER_MOTION
  };
}

/**
 * Generate component code using library patterns
 */
export function generateComponentWithLibrary(componentName, libraryName, componentType) {
  const library = getLibraryUsage(libraryName);
  
  if (!library) {
    throw new Error(`Library ${libraryName} not found`);
  }
  
  // Will implement based on documentation
  return {
    imports: [],
    code: '',
    dependencies: library.installation.dependencies
  };
}

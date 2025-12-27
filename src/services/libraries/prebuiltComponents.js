/**
 * Pre-built Component Library
 * Ready-to-use React components from Reactbits and Uiverse
 */

/**
 * REACTBITS COMPONENTS (Most Popular)
 * These will be installed via shadcn during project setup
 */
export const REACTBITS_PREBUILT = {
  // Background Components
  backgrounds: {
    Dither: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/Dither-JS-TW',
      usage: `<Dither className="fixed inset-0 -z-10" color="purple" />`,
      import: "import { Dither } from '@/components/ui/dither';"
    },
    GridPattern: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/GridPattern-JS-TW',
      usage: `<GridPattern className="fixed inset-0 -z-10" />`,
      import: "import { GridPattern } from '@/components/ui/grid-pattern';"
    },
    DotPattern: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/DotPattern-JS-TW',
      usage: `<DotPattern className="fixed inset-0 -z-10" />`,
      import: "import { DotPattern } from '@/components/ui/dot-pattern';"
    }
  },
  
  // Animation Components
  animations: {
    SplitText: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/SplitText-JS-TW',
      usage: `<SplitText text="Welcome" className="text-6xl font-bold" delay={0.1} />`,
      import: "import { SplitText } from '@/components/ui/split-text';"
    },
    FadeContent: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/FadeContent-JS-TW',
      usage: `<FadeContent><div>Content</div></FadeContent>`,
      import: "import { FadeContent } from '@/components/ui/fade-content';"
    },
    RevealText: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/RevealText-JS-TW',
      usage: `<RevealText text="Reveal on scroll" />`,
      import: "import { RevealText } from '@/components/ui/reveal-text';"
    },
    TypeWriter: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/TypeWriter-JS-TW',
      usage: `<TypeWriter text="Typing effect..." speed={50} />`,
      import: "import { TypeWriter } from '@/components/ui/type-writer';"
    }
  },
  
  // Effect Components
  effects: {
    Spotlight: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/Spotlight-JS-TW',
      usage: `<Spotlight className="absolute top-0 left-0" fill="blue" />`,
      import: "import { Spotlight } from '@/components/ui/spotlight';"
    },
    Particles: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/Particles-JS-TW',
      usage: `<Particles className="fixed inset-0 -z-10" />`,
      import: "import { Particles } from '@/components/ui/particles';"
    },
    Glow: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/Glow-JS-TW',
      usage: `<Glow className="absolute" color="purple" />`,
      import: "import { Glow } from '@/components/ui/glow';"
    }
  },
  
  // Layout Components
  layouts: {
    BentoGrid: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/BentoGrid-JS-TW',
      usage: `<BentoGrid><div>Item 1</div><div>Item 2</div></BentoGrid>`,
      import: "import { BentoGrid } from '@/components/ui/bento-grid';"
    },
    Marquee: {
      install: 'npx shadcn@latest add https://reactbits.dev/r/Marquee-JS-TW',
      usage: `<Marquee><div>Scrolling content</div></Marquee>`,
      import: "import { Marquee } from '@/components/ui/marquee';"
    }
  }
};

/**
 * UIVERSE PRE-BUILT COMPONENTS (Most Popular)
 * These are converted to React and ready to use
 */
export const UIVERSE_PREBUILT = {
  // Animated Buttons
  buttons: {
    AnimatedButton1: {
      jsx: `import React from 'react';
import './AnimatedButton1.css';

export default function AnimatedButton1({ children, onClick }) {
  return (
    <button className="animated-btn-1" onClick={onClick}>
      <span className="btn-text-one">{children}</span>
      <span className="btn-text-two">Great!</span>
    </button>
  );
}`,
      css: `.animated-btn-1 {
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

.animated-btn-1 span {
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

.animated-btn-1:hover .btn-text-one {
  top: -100%;
}

.animated-btn-1:hover .btn-text-two {
  top: 50%;
}`
    },
    
    GlowButton: {
      jsx: `import React from 'react';
import './GlowButton.css';

export default function GlowButton({ children, onClick }) {
  return (
    <button className="glow-btn" onClick={onClick}>
      {children}
    </button>
  );
}`,
      css: `.glow-btn {
  padding: 15px 30px;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.glow-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.glow-btn:hover::before {
  left: 100%;
}

.glow-btn:hover {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.6);
  transform: translateY(-2px);
}`
    }
  },
  
  // Glowing Cards
  cards: {
    GlowingCard: {
      jsx: `import React from 'react';
import './GlowingCard.css';

export default function GlowingCard({ title, description, children }) {
  return (
    <div className="glowing-card">
      {title && <h3 className="card-title">{title}</h3>}
      {description && <p className="card-description">{description}</p>}
      {children}
    </div>
  );
}`,
      css: `.glowing-card {
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
}

.card-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #fff;
}

.card-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}`
    }
  },
  
  // Loaders
  loaders: {
    SpinnerLoader: {
      jsx: `import React from 'react';
import './SpinnerLoader.css';

export default function SpinnerLoader() {
  return (
    <div className="spinner-loader">
      <div className="spinner"></div>
    </div>
  );
}`,
      css: `.spinner-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}`
    }
  }
};

/**
 * Get all available components
 */
export function getAllPrebuiltComponents() {
  return {
    reactbits: REACTBITS_PREBUILT,
    uiverse: UIVERSE_PREBUILT
  };
}

/**
 * Get component by name
 */
export function getComponent(library, category, name) {
  if (library === 'reactbits') {
    return REACTBITS_PREBUILT[category]?.[name];
  }
  if (library === 'uiverse') {
    return UIVERSE_PREBUILT[category]?.[name];
  }
  return null;
}

/**
 * Get all components in a category
 */
export function getComponentsByCategory(library, category) {
  if (library === 'reactbits') {
    return REACTBITS_PREBUILT[category] || {};
  }
  if (library === 'uiverse') {
    return UIVERSE_PREBUILT[category] || {};
  }
  return {};
}

/**
 * Generate installation script for all Reactbits components
 */
export function generateReactbitsInstallScript() {
  const commands = [];
  
  Object.values(REACTBITS_PREBUILT).forEach(category => {
    Object.values(category).forEach(component => {
      commands.push(component.install);
    });
  });
  
  return commands.join(' && ');
}

/**
 * Count total components
 */
export function getComponentCount() {
  let reactbitsCount = 0;
  let uiverseCount = 0;
  
  Object.values(REACTBITS_PREBUILT).forEach(category => {
    reactbitsCount += Object.keys(category).length;
  });
  
  Object.values(UIVERSE_PREBUILT).forEach(category => {
    uiverseCount += Object.keys(category).length;
  });
  
  return {
    reactbits: reactbitsCount,
    uiverse: uiverseCount,
    total: reactbitsCount + uiverseCount
  };
}

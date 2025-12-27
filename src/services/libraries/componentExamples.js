/**
 * Real Component Examples from Libraries
 * ACTUAL CODE that AI should use!
 */

export const componentExamples = {
  flowbite: {
    button: `import { Button } from 'flowbite-react';

<Button color="blue" size="lg">
  Click Me
</Button>

<Button color="purple" pill>
  Pill Button
</Button>

<Button gradientDuoTone="purpleToBlue">
  Gradient Button
</Button>`,

    card: `import { Card } from 'flowbite-react';

<Card className="max-w-sm">
  <h5 className="text-2xl font-bold tracking-tight text-gray-900">
    Noteworthy technology acquisitions 2021
  </h5>
  <p className="font-normal text-gray-700">
    Here are the biggest enterprise technology acquisitions of 2021.
  </p>
</Card>`,

    badge: `import { Badge } from 'flowbite-react';

<Badge color="info">Default</Badge>
<Badge color="success">Success</Badge>
<Badge color="failure">Failure</Badge>
<Badge color="warning">Warning</Badge>`,

    navbar: `import { Navbar } from 'flowbite-react';

<Navbar fluid rounded>
  <Navbar.Brand href="/">
    <span className="self-center whitespace-nowrap text-xl font-semibold">
      Flowbite React
    </span>
  </Navbar.Brand>
  <Navbar.Toggle />
  <Navbar.Collapse>
    <Navbar.Link href="/" active>
      Home
    </Navbar.Link>
    <Navbar.Link href="/about">About</Navbar.Link>
    <Navbar.Link href="/services">Services</Navbar.Link>
    <Navbar.Link href="/contact">Contact</Navbar.Link>
  </Navbar.Collapse>
</Navbar>`,

    modal: `import { Button, Modal } from 'flowbite-react';
import { useState } from 'react';

function Component() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <Button onClick={() => setOpenModal(true)}>Toggle modal</Button>
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Terms of Service</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500">
              Modal content goes here
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setOpenModal(false)}>I accept</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Decline
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}`
  },

  framerMotion: {
    fadeIn: `import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content fades in
</motion.div>`,

    slideUp: `import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content slides up
</motion.div>`,

    stagger: `import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  <motion.div variants={item}>Item 1</motion.div>
  <motion.div variants={item}>Item 2</motion.div>
  <motion.div variants={item}>Item 3</motion.div>
</motion.div>`,

    hover: `import { motion } from 'framer-motion';

<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-6 py-3 bg-blue-500 text-white rounded-lg"
>
  Hover Me
</motion.button>`
  },

  uiverse: {
    gradientButton: `// Uiverse Gradient Button
<button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300">
  <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
    Purple to blue
  </span>
</button>`,

    glowButton: `// Uiverse Glow Button
<button className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-bold text-white rounded-md shadow-2xl group">
  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out opacity-0 bg-gradient-to-br from-pink-600 via-purple-700 to-blue-400 group-hover:opacity-100"></span>
  <span className="absolute top-0 left-0 w-full bg-gradient-to-b from-white to-transparent opacity-5 h-1/3"></span>
  <span className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent opacity-5"></span>
  <span className="absolute bottom-0 left-0 w-4 h-full bg-gradient-to-r from-white to-transparent opacity-5"></span>
  <span className="absolute bottom-0 right-0 w-4 h-full bg-gradient-to-l from-white to-transparent opacity-5"></span>
  <span className="absolute inset-0 w-full h-full border border-white rounded-md opacity-10"></span>
  <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-5"></span>
  <span className="relative">Glow Button</span>
</button>`,

    animatedCard: `// Uiverse Animated Card
<div className="relative group">
  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
  <div className="relative px-7 py-4 bg-white ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
    <div className="space-y-2">
      <p className="text-slate-800">Animated Card</p>
      <p className="text-slate-400">Hover for effect</p>
    </div>
  </div>
</div>`,

    neonButton: `// Uiverse Neon Button
<button className="relative px-8 py-3 font-bold text-white group">
  <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-purple-500 group-hover:bg-purple-700 group-hover:skew-x-12"></span>
  <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform skew-x-12 bg-purple-700 group-hover:bg-purple-500 group-hover:-skew-x-12"></span>
  <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 bg-purple-900"></span>
  <span className="relative">Neon Button</span>
</button>`
  },

  tailgrids: {
    hero: `// TailGrids Hero Section
<section className="relative z-10 overflow-hidden bg-white pb-16 pt-[120px] md:pb-[120px] md:pt-[150px] xl:pb-[160px] xl:pt-[180px] 2xl:pb-[200px] 2xl:pt-[210px]">
  <div className="container mx-auto">
    <div className="-mx-4 flex flex-wrap">
      <div className="w-full px-4">
        <div className="mx-auto max-w-[800px] text-center">
          <h1 className="mb-5 text-3xl font-bold leading-tight text-black sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
            Creative Digital Agency
          </h1>
          <p className="mb-12 text-base !leading-relaxed text-body-color sm:text-lg md:text-xl">
            We help businesses grow with creative digital solutions
          </p>
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <a href="#" className="rounded-sm bg-primary px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-primary/80">
              Get Started
            </a>
            <a href="#" className="inline-block rounded-sm bg-black px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-black/90">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,

    features: `// TailGrids Features Section
<section className="pb-12 pt-20 lg:pb-[90px] lg:pt-[120px]">
  <div className="container mx-auto">
    <div className="-mx-4 flex flex-wrap">
      <div className="w-full px-4">
        <div className="mx-auto mb-12 max-w-[510px] text-center lg:mb-20">
          <h2 className="mb-3 text-3xl font-bold leading-[1.2] text-dark sm:text-4xl md:text-[40px]">
            Our Features
          </h2>
          <p className="text-base text-body-color">
            Everything you need to succeed
          </p>
        </div>
      </div>
    </div>
    <div className="-mx-4 flex flex-wrap">
      <div className="w-full px-4 md:w-1/2 lg:w-1/3">
        <div className="mb-9 rounded-[20px] bg-white p-10 shadow-2 hover:shadow-lg md:px-7 xl:px-10">
          <div className="mb-8 flex h-[70px] w-[70px] items-center justify-center rounded-2xl bg-primary">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              {/* Icon SVG */}
            </svg>
          </div>
          <h4 className="mb-[14px] text-2xl font-semibold text-dark">
            Feature Title
          </h4>
          <p className="text-body-color">
            Feature description goes here
          </p>
        </div>
      </div>
    </div>
  </div>
</section>`,

    pricing: `// TailGrids Pricing Section
<section className="relative z-10 overflow-hidden bg-white pb-12 pt-20 lg:pb-[90px] lg:pt-[120px]">
  <div className="container mx-auto">
    <div className="-mx-4 flex flex-wrap">
      <div className="w-full px-4">
        <div className="mx-auto mb-[60px] max-w-[510px] text-center">
          <h2 className="mb-3 text-3xl font-bold leading-[1.208] text-dark sm:text-4xl md:text-[40px]">
            Our Pricing Plan
          </h2>
          <p className="text-base text-body-color">
            Choose the perfect plan for your needs
          </p>
        </div>
      </div>
    </div>
    <div className="-mx-4 flex flex-wrap justify-center">
      <div className="w-full px-4 md:w-1/2 lg:w-1/3">
        <div className="relative z-10 mb-10 overflow-hidden rounded-xl border border-primary border-opacity-20 bg-white px-8 py-10 shadow-pricing sm:p-12 lg:px-6 lg:py-10 xl:p-12">
          <span className="mb-4 block text-lg font-semibold text-primary">
            Personal
          </span>
          <h2 className="mb-5 text-[42px] font-bold text-dark">
            $59
            <span className="text-base font-medium text-body-color">
              / year
            </span>
          </h2>
          <p className="mb-8 border-b border-stroke pb-8 text-base text-body-color">
            Perfect for using in a personal website or a client project.
          </p>
          <div className="mb-9 flex flex-col gap-[14px]">
            <p className="text-base text-body-color">1 User</p>
            <p className="text-base text-body-color">All UI components</p>
            <p className="text-base text-body-color">Lifetime access</p>
          </div>
          <a href="#" className="block w-full rounded-md border border-primary bg-primary p-3 text-center text-base font-medium text-white transition hover:bg-opacity-90">
            Choose Personal
          </a>
        </div>
      </div>
    </div>
  </div>
</section>`
  }
};

/**
 * Get example code for specific component type
 */
export function getComponentExample(library, componentType) {
  return componentExamples[library]?.[componentType] || null;
}

/**
 * Generate comprehensive examples prompt
 */
export function generateExamplesPrompt(selectedLibraries) {
  if (!selectedLibraries || selectedLibraries.length === 0) {
    return '';
  }

  let prompt = '\n\n📚 REAL COMPONENT EXAMPLES - USE THESE EXACT PATTERNS:\n\n';

  selectedLibraries.forEach(lib => {
    const examples = componentExamples[lib.library];
    if (examples) {
      prompt += `**${lib.library.toUpperCase()} EXAMPLES:**\n\n`;
      
      Object.keys(examples).forEach(key => {
        prompt += `${key}:\n${examples[key]}\n\n`;
      });
    }
  });

  prompt += `
🚨 CRITICAL REQUIREMENTS:
1. **COPY these exact import statements** - import { Button } from 'flowbite-react'
2. **USE the library components** - Don't recreate them with plain Tailwind
3. **FOLLOW the patterns shown** - Same props, same structure
4. **MIX libraries strategically** - Flowbite for complex, Uiverse for unique, Framer for animations

⚠️ IF YOU CREATE <button className="..."> INSTEAD OF <Button>, YOU FAILED!
⚠️ IF YOU DON'T IMPORT FROM LIBRARIES, YOU FAILED!

✅ CORRECT: import { Button } from 'flowbite-react'; <Button color="blue">Click</Button>
❌ WRONG: <button className="bg-blue-500...">Click</button>
`;

  return prompt;
}

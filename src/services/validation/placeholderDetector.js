/**
 * Placeholder Detector and Fixer
 * Detects "under construction" components and regenerates them
 */

/**
 * Placeholder patterns to detect
 */
const PLACEHOLDER_PATTERNS = [
  /this component is under construction/i,
  /coming soon/i,
  /todo:/i,
  /placeholder/i,
  /lorem ipsum/i,
  /stub implementation/i,
  /work in progress/i,
  /to be implemented/i
];

/**
 * Check if content contains placeholder text
 */
function isPlaceholder(content) {
  if (!content) return false;
  
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(content));
}

/**
 * Detect placeholder components in file tree
 */
export function detectPlaceholderComponents(fileTree) {
  const placeholders = [];
  
  function checkNode(node, path = '') {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    
    if (node.type === 'file' && node.content) {
      // Check if this is a component file
      if (node.name.endsWith('.jsx') || node.name.endsWith('.tsx')) {
        if (isPlaceholder(node.content)) {
          placeholders.push({
            path: currentPath,
            name: node.name,
            type: 'component'
          });
        }
      }
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => checkNode(child, currentPath));
    }
  }
  
  fileTree.forEach(node => checkNode(node));
  
  return placeholders;
}

/**
 * Generate component templates based on type
 */
function generateComponentTemplate(componentName, userDetails) {
  const name = userDetails?.name || 'Your Name';
  const profession = userDetails?.profession || 'Professional';
  const description = userDetails?.description || 'Passionate about creating amazing things';
  
  // Determine component type from name
  const lowerName = componentName.toLowerCase();
  
  if (lowerName.includes('about')) {
    return `import { motion } from 'framer-motion';
import { Card } from 'flowbite-react';

function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-12 text-center">About Me</h2>
          
          <div className="max-w-4xl mx-auto">
            <Card>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Who I Am</h3>
                  <p className="text-gray-600 mb-4">
                    I'm ${name}, a ${profession} with a passion for excellence.
                  </p>
                  <p className="text-gray-600">
                    ${description}
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">What I Do</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                      Professional Development
                    </li>
                    <li className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                      Creative Solutions
                    </li>
                    <li className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                      Quality Results
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default About;`;
  }
  
  if (lowerName.includes('project')) {
    return `import { motion } from 'framer-motion';
import { Card, Button, Badge } from 'flowbite-react';

function Projects() {
  const projects = [
    {
      title: "Featured Project 1",
      description: "A comprehensive project showcasing advanced skills and expertise",
      tech: ["React", "Node.js", "MongoDB"],
      image: "https://via.placeholder.com/400x300"
    },
    {
      title: "Featured Project 2",
      description: "Innovative solution built with modern technologies",
      tech: ["TypeScript", "Next.js", "PostgreSQL"],
      image: "https://via.placeholder.com/400x300"
    },
    {
      title: "Featured Project 3",
      description: "Full-stack application with real-time features",
      tech: ["React", "Express", "WebSocket"],
      image: "https://via.placeholder.com/400x300"
    }
  ];

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-12 text-center">Projects</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-48 object-cover rounded-t-lg mb-4"
                  />
                  <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, i) => (
                      <Badge key={i} color="indigo">{tech}</Badge>
                    ))}
                  </div>
                  <Button color="blue" className="w-full">
                    View Project
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Projects;`;
  }
  
  if (lowerName.includes('skill')) {
    return `import { motion } from 'framer-motion';
import { Card } from 'flowbite-react';

function Skills() {
  const skillCategories = [
    {
      category: "Technical Skills",
      skills: [
        { name: "JavaScript/TypeScript", level: 90 },
        { name: "React/Next.js", level: 85 },
        { name: "Node.js/Express", level: 80 },
        { name: "Database Design", level: 75 }
      ]
    },
    {
      category: "Professional Skills",
      skills: [
        { name: "Problem Solving", level: 95 },
        { name: "Team Collaboration", level: 90 },
        { name: "Project Management", level: 85 },
        { name: "Communication", level: 88 }
      ]
    }
  ];

  return (
    <section id="skills" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-12 text-center">Skills</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {skillCategories.map((category, catIndex) => (
              <Card key={catIndex}>
                <h3 className="text-2xl font-bold mb-6">{category.category}</h3>
                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-gray-600">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: \`\${skill.level}%\` }}
                          transition={{ delay: catIndex * 0.2 + skillIndex * 0.1, duration: 0.8 }}
                          className="bg-indigo-600 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Skills;`;
  }
  
  if (lowerName.includes('contact')) {
    return `import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from 'flowbite-react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.message) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      alert('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-12 text-center">Get In Touch</h2>
          
          <div className="max-w-2xl mx-auto">
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows="5"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>
                
                <button
                  type="submit"
                  className="w-full relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white"
                >
                  <span className="w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                    Send Message
                  </span>
                </button>
              </form>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Contact;`;
  }
  
  if (lowerName.includes('footer')) {
    return `import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">${userDetails?.name || 'Your Name'}</h3>
            <p className="text-gray-400">${userDetails?.profession || 'Professional'}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-400 hover:text-white transition">Home</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition">About</a></li>
              <li><a href="#projects" className="text-gray-400 hover:text-white transition">Projects</a></li>
              <li><a href="#skills" className="text-gray-400 hover:text-white transition">Skills</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-gray-400 hover:text-white transition">
                <Github size={24} />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-white transition">
                <Linkedin size={24} />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white transition">
                <Twitter size={24} />
              </a>
              <a href="mailto:contact@example.com" className="text-gray-400 hover:text-white transition">
                <Mail size={24} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ${userDetails?.name || 'Your Name'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;`;
  }
  
  // Default template
  return `function ${componentName.replace('.jsx', '').replace('.tsx', '')}() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">${componentName.replace('.jsx', '').replace('.tsx', '')}</h2>
      <p>Component content goes here</p>
    </div>
  );
}

export default ${componentName.replace('.jsx', '').replace('.tsx', '')};`;
}

/**
 * Scan App.jsx for all imports and extract component/page names
 */
function scanAppJsxImports(fileTree) {
  const components = [];
  const pages = [];
  
  // Find App.jsx
  function findAppJsx(node) {
    if (node.type === 'file' && node.name === 'App.jsx') {
      return node;
    } else if (node.type === 'folder' && node.children) {
      for (const child of node.children) {
        const found = findAppJsx(child);
        if (found) return found;
      }
    }
    return null;
  }
  
  const appJsx = findAppJsx(fileTree[0]) || findAppJsx(fileTree.find(n => n.name === 'src'));
  
  if (appJsx && appJsx.content) {
    // Extract all imports
    const importRegex = /import\s+(\w+)\s+from\s+['"](\.\/(?:components|pages)\/(\w+))['"]/g;
    let match;
    
    while ((match = importRegex.exec(appJsx.content)) !== null) {
      const componentName = match[1];
      const importPath = match[2];
      
      if (importPath.includes('/components/')) {
        components.push(componentName);
      } else if (importPath.includes('/pages/')) {
        pages.push(componentName);
      }
    }
  }
  
  // Fallback to common components/pages if nothing found
  if (components.length === 0) {
    components.push('Header', 'Footer');
  }
  if (pages.length === 0) {
    pages.push('Home');
  }
  
  return { components, pages };
}

/**
 * Check if a component file exists in the tree
 */
function componentExists(fileTree, componentName) {
  function checkNode(node) {
    if (node.type === 'file' && node.name === componentName) {
      return true;
    } else if (node.type === 'folder' && node.children) {
      return node.children.some(child => checkNode(child));
    }
    return false;
  }
  
  return fileTree.some(node => checkNode(node));
}

/**
 * Find or create components folder
 */
function findOrCreateComponentsFolder(fileTree) {
  // Look for src folder first
  let srcFolder = fileTree.find(node => node.type === 'folder' && node.name === 'src');
  
  if (!srcFolder) {
    // Create src folder
    srcFolder = {
      type: 'folder',
      name: 'src',
      children: []
    };
    fileTree.push(srcFolder);
  }
  
  // Look for components folder in src
  let componentsFolder = srcFolder.children.find(node => node.type === 'folder' && node.name === 'components');
  
  if (!componentsFolder) {
    // Create components folder
    componentsFolder = {
      type: 'folder',
      name: 'components',
      children: []
    };
    srcFolder.children.push(componentsFolder);
  }
  
  return componentsFolder;
}

/**
 * Fix placeholder components by replacing with real templates
 * Also creates missing components that are imported but don't exist
 */
export function fixPlaceholderComponents(fileTree, userDetails = null) {
  const placeholders = detectPlaceholderComponents(fileTree);
  
  let fixedCount = 0;
  const fixedComponents = [];
  const createdComponents = [];
  
  // Step 1: Fix existing placeholder components
  function fixNode(node) {
    if (node.type === 'file' && (node.name.endsWith('.jsx') || node.name.endsWith('.tsx'))) {
      if (isPlaceholder(node.content)) {
        const componentName = node.name.replace(/\.(jsx|tsx)$/, '');
        node.content = generateComponentTemplate(componentName, userDetails);
        fixedCount++;
        fixedComponents.push(componentName);
      }
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => fixNode(child));
    }
  }
  
  fileTree.forEach(node => fixNode(node));
  
  // Step 2: Scan App.jsx for ALL imports and create missing files dynamically
  const { components: requiredComponents, pages: requiredPages } = scanAppJsxImports(fileTree);
  
  const componentsFolder = findOrCreateComponentsFolder(fileTree);
  
  // Also create pages folder
  let srcFolder = fileTree.find(node => node.type === 'folder' && node.name === 'src');
  if (!srcFolder) {
    srcFolder = {
      type: 'folder',
      name: 'src',
      children: []
    };
    fileTree.push(srcFolder);
  }
  
  let pagesFolder = srcFolder.children.find(node => node.type === 'folder' && node.name === 'pages');
  if (!pagesFolder) {
    pagesFolder = {
      type: 'folder',
      name: 'pages',
      children: []
    };
    srcFolder.children.push(pagesFolder);
  }
  
  // Create missing components
  requiredComponents.forEach(componentName => {
    const fileName = `${componentName}.jsx`;
    
    if (!componentExists(fileTree, fileName)) {
      const newComponent = {
        type: 'file',
        name: fileName,
        content: generateComponentTemplate(componentName, userDetails)
      };
      
      componentsFolder.children.push(newComponent);
      fixedCount++;
      createdComponents.push(componentName);
    }
  });
  
  // Create missing pages
  requiredPages.forEach(pageName => {
    const fileName = `${pageName}.jsx`;
    
    if (!componentExists(fileTree, fileName)) {
      const newPage = {
        type: 'file',
        name: fileName,
        content: generatePageTemplate(pageName, userDetails)
      };
      
      pagesFolder.children.push(newPage);
      fixedCount++;
      createdComponents.push(`pages/${pageName}`);
    }
  });
  
  return {
    files: fileTree,
    fixedCount,
    fixedComponents,
    createdComponents
  };
}

/**
 * Generate page templates
 */
function generatePageTemplate(pageName, userDetails) {
  const name = userDetails?.name || 'Your Name';
  
  if (pageName === 'Home') {
    return `import { motion } from 'framer-motion';
import { Button } from 'flowbite-react';
import { ArrowRight } from 'lucide-react';

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50"
      >
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-bold mb-6"
          >
            Welcome to Our Store
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl text-gray-600 mb-8"
          >
            Discover amazing products
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button size="lg" color="blue">
              Shop Now <ArrowRight className="ml-2" size={20} />
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

export default Home;`;
  }
  
  if (pageName === 'Shop') {
    return `import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Badge } from 'flowbite-react';

function Shop() {
  const products = [
    {
      id: 1,
      name: "Premium Product 1",
      price: 99.99,
      image: "https://via.placeholder.com/300",
      category: "Electronics"
    },
    {
      id: 2,
      name: "Premium Product 2",
      price: 149.99,
      image: "https://via.placeholder.com/300",
      category: "Fashion"
    },
    {
      id: 3,
      name: "Premium Product 3",
      price: 79.99,
      image: "https://via.placeholder.com/300",
      category: "Home"
    }
  ];

  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-12 text-center">Shop</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded" />
                <Badge color="indigo">{product.category}</Badge>
                <h3 className="text-2xl font-bold mt-2">{product.name}</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">\${product.price}</p>
                <Button color="blue" className="w-full mt-4">
                  Add to Cart
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Shop;`;
  }
  
  if (pageName === 'ProductDetail') {
    return `import { motion } from 'framer-motion';
import { Button, Badge } from 'flowbite-react';
import { ShoppingCart, Heart } from 'lucide-react';

function ProductDetail() {
  const product = {
    name: "Premium Product",
    price: 99.99,
    description: "High-quality product with amazing features",
    image: "https://via.placeholder.com/600",
    category: "Electronics",
    inStock: true
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <img src={product.image} alt={product.name} className="w-full rounded-lg shadow-xl" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Badge color="indigo" className="mb-4">{product.category}</Badge>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-5xl font-bold text-indigo-600 mb-6">\${product.price}</p>
            <p className="text-gray-600 mb-8">{product.description}</p>
            
            <div className="flex gap-4">
              <Button size="lg" color="blue" className="flex-1">
                <ShoppingCart className="mr-2" size={20} />
                Add to Cart
              </Button>
              <Button size="lg" color="light">
                <Heart size={20} />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;`;
  }
  
  if (pageName === 'Cart') {
    return `import { motion } from 'framer-motion';
import { Button, Card } from 'flowbite-react';
import { Trash2 } from 'lucide-react';

function Cart() {
  const cartItems = [
    { id: 1, name: "Product 1", price: 99.99, quantity: 1, image: "https://via.placeholder.com/100" },
    { id: 2, name: "Product 2", price: 149.99, quantity: 2, image: "https://via.placeholder.com/100" }
  ];
  
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-12">Shopping Cart</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-4"
              >
                <Card>
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{item.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">\${(item.price * item.quantity).toFixed(2)}</p>
                      <Button size="sm" color="light" className="mt-2">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div>
            <Card>
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>\${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-xl">
                  <span>Total:</span>
                  <span className="text-indigo-600">\${total.toFixed(2)}</span>
                </div>
              </div>
              <Button color="blue" size="lg" className="w-full">
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;`;
  }
  
  if (pageName === 'Login') {
    return `import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from 'flowbite-react';
import { Mail, Lock } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-6"
      >
        <Card>
          <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" color="blue" size="lg" className="w-full">
              Login
            </Button>
          </form>
          
          <p className="text-center mt-4 text-gray-600">
            Don't have an account? <a href="/signup" className="text-indigo-600 hover:underline">Sign up</a>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

export default Login;`;
  }
  
  if (pageName === 'Signup') {
    return `import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from 'flowbite-react';
import { Mail, Lock, User } from 'lucide-react';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup:', { name, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-6"
      >
        <Card>
          <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" color="blue" size="lg" className="w-full">
              Sign Up
            </Button>
          </form>
          
          <p className="text-center mt-4 text-gray-600">
            Already have an account? <a href="/login" className="text-indigo-600 hover:underline">Login</a>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

export default Signup;`;
  }
  
  if (pageName === 'Account') {
    return `import { motion } from 'framer-motion';
import { Card, Button } from 'flowbite-react';
import { User, Mail, MapPin, Phone } from 'lucide-react';

function Account() {
  const user = {
    name: "${name}",
    email: "user@example.com",
    phone: "+1 234 567 8900",
    address: "123 Main St, City, Country"
  };

  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-12">My Account</h1>
          
          <Card className="mb-6">
            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{user.address}</p>
                </div>
              </div>
            </div>
            
            <Button color="blue" className="mt-6">
              Edit Profile
            </Button>
          </Card>
          
          <Card>
            <h2 className="text-2xl font-bold mb-4">Order History</h2>
            <p className="text-gray-600">No orders yet</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default Account;`;
  }
  
  // Default page template
  return `import { motion } from 'framer-motion';

function ${pageName}() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-20"
    >
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">${pageName}</h1>
        <p className="text-gray-600">Welcome to the ${pageName} page.</p>
      </div>
    </motion.div>
  );
}

export default ${pageName};`;
}

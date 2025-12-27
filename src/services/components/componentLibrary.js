/**
 * Component Library Service
 * Pre-built components that users can add to their projects
 */

/**
 * Component categories
 */
export const componentCategories = [
  { id: 'hero', name: 'Hero Sections', icon: '🎯' },
  { id: 'navbar', name: 'Navigation', icon: '🧭' },
  { id: 'footer', name: 'Footers', icon: '📄' },
  { id: 'card', name: 'Cards', icon: '🎴' },
  { id: 'form', name: 'Forms', icon: '📝' },
  { id: 'button', name: 'Buttons', icon: '🔘' },
  { id: 'feature', name: 'Features', icon: '⭐' },
  { id: 'testimonial', name: 'Testimonials', icon: '💬' },
  { id: 'pricing', name: 'Pricing', icon: '💰' },
  { id: 'cta', name: 'Call to Action', icon: '📢' }
];

/**
 * Pre-built components library
 */
export const componentLibrary = {
  hero: [
    {
      id: 'hero-centered',
      name: 'Centered Hero',
      category: 'hero',
      preview: 'https://via.placeholder.com/400x300',
      code: `function Hero() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="text-center text-white px-6">
        <h1 className="text-6xl font-bold mb-6">
          Welcome to Our Platform
        </h1>
        <p className="text-xl mb-8 text-indigo-100">
          Build amazing things with our powerful tools
        </p>
        <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Hero;`,
      dependencies: []
    },
    {
      id: 'hero-split',
      name: 'Split Hero',
      category: 'hero',
      preview: 'https://via.placeholder.com/400x300',
      code: `function Hero() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 gap-12 items-center px-6 py-20">
      <div>
        <h1 className="text-5xl font-bold mb-6 text-gray-900">
          Build Faster with AI
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Generate production-ready code in seconds
        </p>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Start Free
          </button>
          <button className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-indigo-600">
            Learn More
          </button>
        </div>
      </div>
      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl h-96"></div>
    </div>
  );
}

export default Hero;`,
      dependencies: []
    }
  ],

  navbar: [
    {
      id: 'navbar-simple',
      name: 'Simple Navbar',
      category: 'navbar',
      preview: 'https://via.placeholder.com/400x100',
      code: `function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-indigo-600">
          Logo
        </div>
        <div className="hidden md:flex gap-8">
          <a href="#" className="text-gray-700 hover:text-indigo-600">Home</a>
          <a href="#" className="text-gray-700 hover:text-indigo-600">About</a>
          <a href="#" className="text-gray-700 hover:text-indigo-600">Services</a>
          <a href="#" className="text-gray-700 hover:text-indigo-600">Contact</a>
        </div>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Sign In
        </button>
      </div>
    </nav>
  );
}

export default Navbar;`,
      dependencies: []
    }
  ],

  card: [
    {
      id: 'card-feature',
      name: 'Feature Card',
      category: 'card',
      preview: 'https://via.placeholder.com/300x400',
      code: `function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default FeatureCard;`,
      dependencies: []
    }
  ],

  button: [
    {
      id: 'button-primary',
      name: 'Primary Button',
      category: 'button',
      preview: 'https://via.placeholder.com/200x100',
      code: `function Button({ children, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
    >
      {children}
    </button>
  );
}

export default Button;`,
      dependencies: []
    }
  ],

  form: [
    {
      id: 'form-contact',
      name: 'Contact Form',
      category: 'form',
      preview: 'https://via.placeholder.com/400x500',
      code: `import { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Contact Us</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-medium">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2 font-medium">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2 font-medium">Message</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          rows="4"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
      >
        Send Message
      </button>
    </form>
  );
}

export default ContactForm;`,
      dependencies: ['react']
    }
  ],

  footer: [
    {
      id: 'footer-simple',
      name: 'Simple Footer',
      category: 'footer',
      preview: 'https://via.placeholder.com/400x200',
      code: `function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Security</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Guides</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">License</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;`,
      dependencies: []
    }
  ]
};

/**
 * Get all components
 */
export function getAllComponents() {
  const all = [];
  
  Object.keys(componentLibrary).forEach(category => {
    all.push(...componentLibrary[category]);
  });

  return all;
}

/**
 * Get components by category
 */
export function getComponentsByCategory(categoryId) {
  return componentLibrary[categoryId] || [];
}

/**
 * Get single component
 */
export function getComponent(componentId) {
  const all = getAllComponents();
  return all.find(c => c.id === componentId);
}

/**
 * Search components
 */
export function searchComponents(query) {
  const all = getAllComponents();
  const lowerQuery = query.toLowerCase();

  return all.filter(component =>
    component.name.toLowerCase().includes(lowerQuery) ||
    component.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Add component to project
 */
export function addComponentToProject(componentId, files) {
  const component = getComponent(componentId);
  
  if (!component) {
    return files;
  }

  // Create component file
  const componentFile = {
    name: `${component.name.replace(/\s+/g, '')}.jsx`,
    type: 'file',
    content: component.code
  };

  // Find or create components folder
  let componentsFolder = files.find(f => f.name === 'src')
    ?.children?.find(f => f.name === 'components');

  if (!componentsFolder) {
    // Create components folder
    const srcFolder = files.find(f => f.name === 'src');
    if (srcFolder && srcFolder.children) {
      componentsFolder = {
        name: 'components',
        type: 'folder',
        children: []
      };
      srcFolder.children.push(componentsFolder);
    }
  }

  // Add component to folder
  if (componentsFolder && componentsFolder.children) {
    componentsFolder.children.push(componentFile);
  }

  return files;
}

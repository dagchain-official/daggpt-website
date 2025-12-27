/**
 * Portfolio Template
 * Pre-built, optimized portfolio website template
 */

export const portfolioTemplate = {
  id: 'portfolio-developer',
  name: 'Developer Portfolio',
  description: 'Modern portfolio for developers with projects showcase',
  category: 'portfolio',
  
  files: [
    {
      type: 'file',
      name: 'package.json',
      content: JSON.stringify({
        "name": "portfolio",
        "private": true,
        "version": "1.0.0",
        "type": "module",
        "scripts": {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview"
        },
        "dependencies": {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "lucide-react": "^0.294.0"
        },
        "devDependencies": {
          "@types/react": "^18.2.43",
          "@types/react-dom": "^18.2.17",
          "@vitejs/plugin-react": "^4.2.1",
          "autoprefixer": "^10.4.17",
          "postcss": "^8.4.33",
          "tailwindcss": "^3.4.1",
          "vite": "^5.0.8"
        }
      }, null, 2)
    },
    
    {
      type: 'file',
      name: 'index.html',
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{name}} - Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
    },
    
    {
      type: 'file',
      name: 'vite.config.js',
      content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
    },
    
    {
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
}`
    },
    
    {
      type: 'file',
      name: 'postcss.config.js',
      content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
    },
    
    {
      type: 'folder',
      name: 'src',
      children: [
        {
          type: 'file',
          name: 'main.jsx',
          content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
        },
        
        {
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
}`
        },
        
        {
          type: 'file',
          name: 'App.jsx',
          content: `import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;`
        },
        
        {
          type: 'folder',
          name: 'components',
          children: [
            {
              type: 'file',
              name: 'Header.jsx',
              content: `import React from 'react';
import { Menu, X } from 'lucide-react';

function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-800">
            {{name}}
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-600 hover:text-gray-900 transition">Home</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition">About</a>
            <a href="#projects" className="text-gray-600 hover:text-gray-900 transition">Projects</a>
            <a href="#skills" className="text-gray-600 hover:text-gray-900 transition">Skills</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">Contact</a>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <a href="#home" className="block text-gray-600 hover:text-gray-900">Home</a>
            <a href="#about" className="block text-gray-600 hover:text-gray-900">About</a>
            <a href="#projects" className="block text-gray-600 hover:text-gray-900">Projects</a>
            <a href="#skills" className="block text-gray-600 hover:text-gray-900">Skills</a>
            <a href="#contact" className="block text-gray-600 hover:text-gray-900">Contact</a>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;`
            },
            
            {
              type: 'file',
              name: 'Hero.jsx',
              content: `import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

function Hero() {
  return (
    <section id="home" className="pt-32 pb-20 px-6">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
          Hi, I'm <span className="text-blue-600">{{name}}</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          {{title}}
        </p>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
          {{bio}}
        </p>
        
        <div className="flex justify-center space-x-6 mb-12">
          <a href="{{github}}" className="p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition">
            <Github size={24} />
          </a>
          <a href="{{linkedin}}" className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition">
            <Linkedin size={24} />
          </a>
          <a href="mailto:{{email}}" className="p-3 bg-red-600 text-white rounded-full hover:bg-red-500 transition">
            <Mail size={24} />
          </a>
        </div>
        
        <div className="flex justify-center space-x-4">
          <a href="#projects" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            View Projects
          </a>
          <a href="#contact" className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
            Contact Me
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;`
            },
            
            {
              type: 'file',
              name: 'About.jsx',
              content: `import React from 'react';

function About() {
  return (
    <section id="about" className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">About Me</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=400&h=400&fit=crop" 
              alt="Profile"
              className="rounded-lg shadow-xl"
            />
          </div>
          <div>
            <p className="text-lg text-gray-600 mb-6">
              {{aboutText}}
            </p>
            <p className="text-lg text-gray-600">
              I specialize in building modern web applications using React, Node.js, and cloud technologies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;`
            },
            
            {
              type: 'file',
              name: 'Projects.jsx',
              content: `import React from 'react';
import { ExternalLink, Github } from 'lucide-react';

function Projects() {
  const projects = [
    {
      title: "{{project1Title}}",
      description: "{{project1Description}}",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      tags: ["React", "Node.js", "MongoDB"],
      github: "#",
      demo: "#"
    },
    {
      title: "{{project2Title}}",
      description: "{{project2Description}}",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
      tags: ["React", "TypeScript", "Tailwind"],
      github: "#",
      demo: "#"
    },
    {
      title: "{{project3Title}}",
      description: "{{project3Description}}",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
      tags: ["Next.js", "PostgreSQL", "AWS"],
      github: "#",
      demo: "#"
    }
  ];

  return (
    <section id="projects" className="py-20 px-6">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Featured Projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-4">
                  <a href={project.github} className="flex items-center text-gray-600 hover:text-gray-900">
                    <Github size={20} className="mr-2" /> Code
                  </a>
                  <a href={project.demo} className="flex items-center text-blue-600 hover:text-blue-700">
                    <ExternalLink size={20} className="mr-2" /> Demo
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;`
            },
            
            {
              type: 'file',
              name: 'Skills.jsx',
              content: `import React from 'react';

function Skills() {
  const skills = [
    { category: "Frontend", items: ["React", "TypeScript", "Tailwind CSS", "Next.js"] },
    { category: "Backend", items: ["Node.js", "Express", "PostgreSQL", "MongoDB"] },
    { category: "Tools", items: ["Git", "Docker", "AWS", "Vercel"] },
    { category: "Other", items: ["REST APIs", "GraphQL", "Testing", "CI/CD"] }
  ];

  return (
    <section id="skills" className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Skills & Technologies</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skillGroup, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{skillGroup.category}</h3>
              <ul className="space-y-2">
                {skillGroup.items.map((skill, i) => (
                  <li key={i} className="text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;`
            },
            
            {
              type: 'file',
              name: 'Contact.jsx',
              content: `import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

function Contact() {
  return (
    <section id="contact" className="py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Get In Touch</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="text-blue-600 mr-4" size={24} />
                <span className="text-gray-600">{{email}}</span>
              </div>
              <div className="flex items-center">
                <Phone className="text-blue-600 mr-4" size={24} />
                <span className="text-gray-600">{{phone}}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="text-blue-600 mr-4" size={24} />
                <span className="text-gray-600">{{location}}</span>
              </div>
            </div>
          </div>
          
          <form className="space-y-4">
            <input 
              type="text" 
              placeholder="Your Name" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
            <input 
              type="email" 
              placeholder="Your Email" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
            <textarea 
              placeholder="Your Message" 
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            ></textarea>
            <button 
              type="submit"
              className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;`
            },
            
            {
              type: 'file',
              name: 'Footer.jsx',
              content: `import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-6">
      <div className="container mx-auto text-center">
        <div className="flex justify-center space-x-6 mb-6">
          <a href="{{github}}" className="hover:text-blue-400 transition">
            <Github size={24} />
          </a>
          <a href="{{linkedin}}" className="hover:text-blue-400 transition">
            <Linkedin size={24} />
          </a>
          <a href="mailto:{{email}}" className="hover:text-blue-400 transition">
            <Mail size={24} />
          </a>
        </div>
        <p className="text-gray-400">
          © 2024 {{name}}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;`
            }
          ]
        }
      ]
    }
  ],
  
  // Variables that can be customized
  variables: {
    name: 'John Doe',
    title: 'Full Stack Developer',
    bio: 'I build modern web applications with passion and precision',
    aboutText: 'I am a passionate developer with 5+ years of experience building web applications.',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    github: 'https://github.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    project1Title: 'E-commerce Platform',
    project1Description: 'A full-stack e-commerce solution with payment integration',
    project2Title: 'Task Management App',
    project2Description: 'Collaborative task management with real-time updates',
    project3Title: 'Analytics Dashboard',
    project3Description: 'Data visualization dashboard for business metrics'
  }
};

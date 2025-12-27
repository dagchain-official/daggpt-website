/**
 * Export Project Service
 * Allows users to download their generated projects
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Export project as ZIP file
 */
export async function exportAsZip(files, projectName = 'my-project') {
  const zip = new JSZip();

  // Add all files to ZIP
  addFilesToZip(zip, files);

  // Add README
  const readme = generateReadme(projectName);
  zip.file('README.md', readme);

  // Generate ZIP
  const blob = await zip.generateAsync({ type: 'blob' });

  // Download
  saveAs(blob, `${projectName}.zip`);

  return true;
}

/**
 * Add files to ZIP recursively
 */
function addFilesToZip(zip, files, basePath = '') {
  files.forEach(file => {
    const currentPath = basePath ? `${basePath}/${file.name}` : file.name;

    if (file.type === 'file') {
      zip.file(currentPath, file.content || '');
    } else if (file.type === 'folder' && file.children) {
      addFilesToZip(zip, file.children, currentPath);
    }
  });
}

/**
 * Generate README file
 */
function generateReadme(projectName) {
  return `# ${projectName}

Generated with DAGGPT - The AI Website Builder

## 🚀 Quick Start

### Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### Build for Production
\`\`\`bash
npm run build
\`\`\`

## 📁 Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── components/     # React components
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles
├── public/            # Static assets
├── index.html         # HTML template
├── package.json       # Dependencies
├── vite.config.js     # Vite configuration
└── tailwind.config.js # Tailwind configuration
\`\`\`

## 🎨 Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Modern JavaScript** - ES6+

## 📝 Features

- ✅ Modern React with hooks
- ✅ Tailwind CSS for styling
- ✅ Responsive design
- ✅ Fast development with Vite
- ✅ Production-ready build

## 🌐 Deployment

### Vercel
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Netlify
\`\`\`bash
npm install -g netlify-cli
netlify deploy
\`\`\`

### GitHub Pages
\`\`\`bash
npm run build
# Deploy the dist/ folder
\`\`\`

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## 🤝 Support

Need help? Visit [DAGGPT](https://daggpt.com) for more information.

---

**Generated with ❤️ by DAGGPT**
`;
}

/**
 * Export as GitHub repository
 */
export function generateGitHubInstructions(projectName) {
  return `# Deploy to GitHub

## Step 1: Create Repository
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
\`\`\`

## Step 2: Push to GitHub
\`\`\`bash
git remote add origin https://github.com/yourusername/${projectName}.git
git branch -M main
git push -u origin main
\`\`\`

## Step 3: Deploy to GitHub Pages
\`\`\`bash
npm run build
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
\`\`\`

Your site will be live at:
https://yourusername.github.io/${projectName}
`;
}

/**
 * Generate deployment config for Vercel
 */
export function generateVercelConfig() {
  return {
    'vercel.json': JSON.stringify({
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      framework: 'vite',
      rewrites: [
        { source: '/(.*)', destination: '/' }
      ]
    }, null, 2)
  };
}

/**
 * Generate deployment config for Netlify
 */
export function generateNetlifyConfig() {
  return {
    'netlify.toml': `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`
  };
}

/**
 * Export project structure as JSON
 */
export function exportAsJSON(files) {
  const json = JSON.stringify(files, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, 'project-structure.json');
  return true;
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

/**
 * Share project
 */
export function generateShareableLink(projectId) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/project/${projectId}`;
}

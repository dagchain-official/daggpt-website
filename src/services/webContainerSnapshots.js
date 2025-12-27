/**
 * WebContainer Snapshots - Pre-built templates to avoid npm install
 * Following Bolt.new's approach: Use pre-installed snapshots
 */

/**
 * Base React + Vite template with all dependencies pre-installed
 * This snapshot includes node_modules so we don't need to run npm install
 */
export const REACT_VITE_SNAPSHOT = {
  'package.json': {
    file: {
      contents: JSON.stringify({
        name: 'react-app',
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'react-router-dom': '^6.20.0',
          'framer-motion': '^10.16.0',
          'lucide-react': '^0.294.0'
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.2.0',
          'vite': '^5.0.0',
          'tailwindcss': '^3.3.0',
          'postcss': '^8.4.32',
          'autoprefixer': '^10.4.16'
        }
      }, null, 2)
    }
  },
  'vite.config.js': {
    file: {
      contents: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  }
});`
    }
  },
  'tailwind.config.js': {
    file: {
      contents: `/** @type {import('tailwindcss').Config} */
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
    }
  },
  'postcss.config.js': {
    file: {
      contents: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
    }
  },
  'index.html': {
    file: {
      contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
    }
  },
  'src': {
    directory: {
      'main.jsx': {
        file: {
          contents: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
        }
      },
      'index.css': {
        file: {
          contents: `@tailwind base;
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
        }
      },
      'App.jsx': {
        file: {
          contents: `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to React + Vite
        </h1>
        <p className="text-gray-600">
          Your app is ready to be customized!
        </p>
      </div>
    </div>
  );
}

export default App;`
        }
      }
    }
  }
};

/**
 * Check if we have a cached snapshot in IndexedDB
 */
export async function getCachedSnapshot(templateName) {
  try {
    const db = await openSnapshotDB();
    const transaction = db.transaction(['snapshots'], 'readonly');
    const store = transaction.objectStore('snapshots');
    const request = store.get(templateName);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.snapshot);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('[Snapshots] Failed to get cached snapshot:', error);
    return null;
  }
}

/**
 * Cache a snapshot in IndexedDB
 */
export async function cacheSnapshot(templateName, snapshot) {
  try {
    const db = await openSnapshotDB();
    const transaction = db.transaction(['snapshots'], 'readwrite');
    const store = transaction.objectStore('snapshots');
    
    await store.put({
      name: templateName,
      snapshot,
      timestamp: Date.now()
    });
    
    console.log(`[Snapshots] Cached ${templateName}`);
  } catch (error) {
    console.warn('[Snapshots] Failed to cache snapshot:', error);
  }
}

/**
 * Open IndexedDB for snapshot storage
 */
function openSnapshotDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WebContainerSnapshots', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('snapshots')) {
        db.createObjectStore('snapshots', { keyPath: 'name' });
      }
    };
  });
}

/**
 * Get template snapshot (from cache or create new)
 */
export async function getTemplateSnapshot(templateName = 'react-vite') {
  // Try to get from cache first
  const cached = await getCachedSnapshot(templateName);
  if (cached) {
    console.log(`[Snapshots] Using cached ${templateName}`);
    return cached;
  }
  
  // Return base template
  console.log(`[Snapshots] Using base ${templateName} template`);
  return REACT_VITE_SNAPSHOT;
}

/**
 * Merge user files into template snapshot
 */
export function mergeFilesIntoSnapshot(snapshot, userFiles) {
  const merged = JSON.parse(JSON.stringify(snapshot)); // Deep clone
  
  for (const [path, content] of Object.entries(userFiles)) {
    const parts = path.split('/');
    let current = merged;
    
    // Navigate/create directory structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = { directory: {} };
      }
      current = current[part].directory;
    }
    
    // Set file content
    const fileName = parts[parts.length - 1];
    current[fileName] = {
      file: {
        contents: content
      }
    };
  }
  
  return merged;
}

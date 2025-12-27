/**
 * Instant Preview Service
 * Generates instant previews using CDN imports (no npm install needed)
 * Similar to Bolt/Lovable for simple projects
 */

/**
 * Analyze project complexity to decide preview method
 */
export function analyzeProjectComplexity(files) {
  const packageJson = files.find(f => f.name === 'package.json');
  
  if (!packageJson || !packageJson.content) {
    return { isSimple: true, reason: 'No package.json found' };
  }
  
  try {
    const pkg = JSON.parse(packageJson.content);
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };
    
    const depCount = Object.keys(allDeps || {}).length;
    
    // Simple project criteria
    const isSimple = (
      depCount <= 5 && // Few dependencies
      !allDeps['typescript'] && // No TypeScript
      !allDeps['webpack'] && // No custom bundler
      !allDeps['vite'] && // Vite is fine but we'll use CDN
      !pkg.scripts?.build?.includes('tsc') // No TypeScript build
    );
    
    return {
      isSimple,
      depCount,
      reason: isSimple 
        ? `Simple project (${depCount} deps)` 
        : `Complex project (${depCount} deps or build tools)`
    };
  } catch (error) {
    return { isSimple: true, reason: 'Invalid package.json, treating as simple' };
  }
}

/**
 * Find file by name (recursive search in file tree)
 */
function findFileByName(files, names) {
  for (const file of files) {
    if (file.type === 'file' && names.some(name => file.name === name)) {
      return file;
    }
    if (file.type === 'folder' && file.children) {
      const found = findFileByName(file.children, names);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get all files recursively
 */
function getAllFiles(files) {
  const result = [];
  for (const file of files) {
    if (file.type === 'file') {
      result.push(file);
    }
    if (file.type === 'folder' && file.children) {
      result.push(...getAllFiles(file.children));
    }
  }
  return result;
}

/**
 * Generate instant preview HTML using CDN imports
 */
export function generateInstantPreviewHTML(files) {
  // Find main files (search recursively)
  const indexHtml = findFileByName(files, ['index.html']);
  const mainJs = findFileByName(files, ['App.jsx', 'App.js', 'main.jsx', 'index.jsx']);
  const mainCss = findFileByName(files, ['App.css', 'index.css', 'styles.css']);
  
  // If there's already an index.html, use it with CDN enhancements
  if (indexHtml && indexHtml.content) {
    return enhanceHTMLWithCDN(indexHtml.content, files);
  }
  
  // Generate HTML from React components
  if (mainJs && mainJs.content) {
    return generateReactPreviewHTML(mainJs.content, mainCss?.content, files);
  }
  
  // Fallback: generate basic HTML
  return generateBasicHTML(files);
}

/**
 * Enhance existing HTML with CDN imports
 */
function enhanceHTMLWithCDN(html, files) {
  // If HTML already has script tags, return as-is
  if (html.includes('<script') && html.includes('</script>')) {
    return html;
  }
  
  // Add CDN scripts if missing
  let enhanced = html;
  
  if (!html.includes('tailwindcss')) {
    enhanced = enhanced.replace(
      '</head>',
      '  <script src="https://cdn.tailwindcss.com"></script>\n  </head>'
    );
  }
  
  return enhanced;
}

/**
 * Generate React preview HTML with CDN imports
 */
function generateReactPreviewHTML(jsCode, cssCode, files) {
  // Extract component code (remove imports)
  const cleanCode = jsCode
    .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+/g, '');
  
  // Find all CSS files
  const allFiles = getAllFiles(files);
  const allCss = allFiles
    .filter(f => f.name.endsWith('.css'))
    .map(f => f.content)
    .join('\n');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    ${allCss || cssCode || ''}
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="module">
    try {
      const React = await import('https://esm.sh/react@18.2.0');
      const ReactDOM = await import('https://esm.sh/react-dom@18.2.0/client');
      
      // Polyfill for common imports
      const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } = React;
      
      // User code
      ${cleanCode}
      
      // Find the component (try different names)
      const Component = typeof App !== 'undefined' ? App :
                       typeof LandingPage !== 'undefined' ? LandingPage :
                       typeof Home !== 'undefined' ? Home :
                       typeof Main !== 'undefined' ? Main :
                       function() { 
                         return React.createElement('div', { 
                           style: { padding: '20px', fontFamily: 'sans-serif' } 
                         }, 'Component not found. Check console for errors.'); 
                       };
      
      // Render the app
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(Component));
    } catch (error) {
      console.error('Preview error:', error);
      document.getElementById('root').innerHTML = \`
        <div style="padding: 20px; font-family: sans-serif; color: #dc2626;">
          <h2>Preview Error</h2>
          <p>\${error.message}</p>
          <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow: auto;">\${error.stack}</pre>
        </div>
      \`;
    }
  </script>
</body>
</html>`;
  
  return html;
}

/**
 * Generate basic HTML from files
 */
function generateBasicHTML(files) {
  const allFiles = getAllFiles(files);
  const htmlFile = allFiles.find(f => f.name.endsWith('.html'));
  const jsFiles = allFiles.filter(f => f.name.endsWith('.js') || f.name.endsWith('.jsx'));
  const cssFiles = allFiles.filter(f => f.name.endsWith('.css'));
  
  if (htmlFile) {
    return htmlFile.content;
  }
  
  // Generate simple HTML
  const allCss = cssFiles.map(f => f.content).join('\n');
  const allJs = jsFiles.map(f => f.content).join('\n');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${allCss}
  </style>
</head>
<body>
  <div id="root">
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Generated Project</h1>
      <p>Preview ready!</p>
    </div>
  </div>
  <script>
    ${allJs}
  </script>
</body>
</html>`;
}

/**
 * Create instant preview (returns HTML string for iframe srcdoc)
 */
export function createInstantPreview(files) {
  const analysis = analyzeProjectComplexity(files);
  
  if (!analysis.isSimple) {
    return null; // Use WebContainer for complex projects
  }
  
  const html = generateInstantPreviewHTML(files);
  
  return {
    html,
    mode: 'instant',
    analysis
  };
}

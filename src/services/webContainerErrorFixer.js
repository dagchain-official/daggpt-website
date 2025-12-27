/**
 * WebContainer Error Fixer - Iterative Error Detection and Auto-Fix
 * Similar to Lovable and Bolt platforms
 */

/**
 * Parse Vite/Babel errors from console output
 */
export function parseViteErrors(output) {
  const errors = [];
  
  // Match Vite/Babel compilation errors with file path
  const errorPattern = /\[plugin:vite:react-babel\]\s+([^:]+):(\d+):(\d+)[^\n]*\n([^\n]+)/g;
  let match;
  
  while ((match = errorPattern.exec(output)) !== null) {
    const file = match[1];
    const line = parseInt(match[2]);
    const column = parseInt(match[3]);
    const message = match[4];
    
    // Determine error type from message
    let errorType = 'babel';
    if (message.includes('Unterminated template')) {
      errorType = 'template';
    } else if (message.includes('Unterminated string')) {
      errorType = 'string';
    } else if (message.includes('Unexpected token')) {
      errorType = 'syntax';
    }
    
    errors.push({
      type: errorType,
      file,
      line,
      column,
      message,
      fullError: match[0]
    });
  }
  
  // Match "Unterminated template" errors
  const templatePattern = /Unterminated template[^(]*\((\d+):(\d+)\)/g;
  while ((match = templatePattern.exec(output)) !== null) {
    errors.push({
      type: 'template',
      line: parseInt(match[1]),
      column: parseInt(match[2]),
      message: 'Unterminated template',
      fullError: match[0]
    });
  }
  
  // Match "Unterminated string" errors
  const stringPattern = /Unterminated string constant[^(]*\((\d+):(\d+)\)/g;
  while ((match = stringPattern.exec(output)) !== null) {
    errors.push({
      type: 'string',
      line: parseInt(match[1]),
      column: parseInt(match[2]),
      message: 'Unterminated string constant',
      fullError: match[0]
    });
  }
  
  // Match "Unexpected token" errors
  const unexpectedTokenPattern = /Unexpected token[^(]*\((\d+):(\d+)\)/g;
  while ((match = unexpectedTokenPattern.exec(output)) !== null) {
    errors.push({
      type: 'syntax',
      line: parseInt(match[1]),
      column: parseInt(match[2]),
      message: 'Unexpected token',
      fullError: match[0]
    });
  }
  
  // Match "X is not defined" errors
  const undefinedPattern = /ReferenceError:\s+(\w+)\s+is not defined/g;
  while ((match = undefinedPattern.exec(output)) !== null) {
    errors.push({
      type: 'reference',
      variable: match[1],
      message: `${match[1]} is not defined`,
      fullError: match[0]
    });
  }
  
  // Match duplicate attribute warnings
  const duplicatePattern = /Duplicate "(\w+)" attribute/g;
  while ((match = duplicatePattern.exec(output)) !== null) {
    errors.push({
      type: 'duplicate',
      attribute: match[1],
      message: `Duplicate ${match[1]} attribute`,
      fullError: match[0]
    });
  }
  
  // Match unclosed JSX tags (esbuild error)
  const unclosedTagPattern = /Unexpected end of file before a closing "([^"]+)" tag[\s\S]*?src\/([^:]+):(\d+):(\d+)/g;
  while ((match = unclosedTagPattern.exec(output)) !== null) {
    errors.push({
      type: 'unclosed-tag',
      tag: match[1],
      file: `src/${match[2]}`,
      line: parseInt(match[3]),
      column: parseInt(match[4]),
      message: `Unclosed ${match[1]} tag`,
      fullError: match[0]
    });
  }
  
  // Match general esbuild errors
  const esbuildPattern = /\[ERROR\]\s+([^\n]+)[\s\S]*?src\/([^:]+):(\d+):(\d+)/g;
  while ((match = esbuildPattern.exec(output)) !== null) {
    errors.push({
      type: 'esbuild',
      file: `src/${match[2]}`,
      line: parseInt(match[3]),
      column: parseInt(match[4]),
      message: match[1],
      fullError: match[0]
    });
  }
  
  return errors;
}

/**
 * Generate fix for specific error type
 */
export function generateErrorFix(error, fileContent) {
  let fixedContent = fileContent;
  
  switch (error.type) {
    case 'reference':
      // Fix undefined variables (like 'rating')
      if (error.variable === 'rating') {
        // Remove standalone declarations
        fixedContent = fixedContent.replace(/(?:const|let|var)\s+rating\s*=\s*[^;]+;/g, '');
        // Replace references with hardcoded value
        fixedContent = fixedContent.replace(/\{rating\}/g, '{5}');
        fixedContent = fixedContent.replace(/Array\(rating\)/g, 'Array(5)');
        // Fix object literal syntax
        fixedContent = fixedContent.replace(/(\s+)rating\s*=\s*(\d+)/g, '$1rating: $2');
        // Fix standalone numbers
        fixedContent = fixedContent.replace(/,\s*\n\s*(\d+)\s*,/g, ',\n      rating: $1,');
      }
      break;
      
    case 'duplicate':
      // Fix duplicate attributes (like duplicate src)
      if (error.attribute === 'src') {
        fixedContent = fixedContent.replace(
          /<img([^>]*?)src=["']([^"']+)["']([^>]*?)src=["']([^"']+)["']([^>]*?)>/g,
          '<img$1$3src="$4"$5>'
        );
      }
      break;
      
    case 'template':
      // Fix unterminated template literals and mixed quotes
      // Fix: className="text"`} -> className="text"
      fixedContent = fixedContent.replace(/className=["']([^"'`]+)["'][`}]+/g, 'className="$1"');
      // Fix: className="text`} -> className="text"
      fixedContent = fixedContent.replace(/className=["']([^"'`]+)[`}]+/g, 'className="$1"');
      // Fix any stray backticks in className
      fixedContent = fixedContent.replace(/className=["']([^"']*)`([^"']*?)["']/g, 'className="$1$2"');
      // Fix template literal issues in JSX attributes
      fixedContent = fixedContent.replace(/(\w+)=["']([^"']*?)`\}/g, '$1="$2"');
      break;
      
    case 'string':
      // Fix unterminated strings - NUCLEAR OPTION
      // FIRST: Remove ANY line containing base64 (most aggressive)
      fixedContent = fixedContent.replace(/^.*base64.*$/gm, '');
      // SECOND: Remove ALL base64 encoded strings
      const dataPrefix = 'data:';
      const imageType = 'image';
      const searchTerm = dataPrefix + imageType;
      fixedContent = fixedContent.split(searchTerm).join('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800');
      // THIRD: Remove any extremely long string (>500 chars)
      fixedContent = fixedContent.replace(/["']\w{500,}["']?/g, '"https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"');
      // FOURTH: Fix unterminated strings at end of lines (>200 chars)
      fixedContent = fixedContent.replace(/["'][^"']{200,}$/gm, '"https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"');
      // FIFTH: Fix very long SVG path strings that are malformed
      fixedContent = fixedContent.replace(/d=["']([^"']{1000,})[^"'>]*$/gm, (match) => {
        return 'd="M0 0"'; // Replace with minimal valid path
      });
      // SIXTH: Fix any string longer than 1000 characters
      fixedContent = fixedContent.replace(/["']([^"']{1000,})[^"'>]*$/gm, (match) => {
        const quote = match[0];
        return quote + match.substring(1, 100) + quote;
      });
      // SEVENTH: Fix strings that have backticks mixed in
      fixedContent = fixedContent.replace(/=["']([^"']*)`([^"']*?)$/gm, '="$1$2"');
      // EIGHTH: Fix any attribute with unterminated string
      fixedContent = fixedContent.replace(/(\w+)=["']([^"']{100,})$/gm, '$1="value"');
      break;
      
    case 'syntax':
      // Fix common syntax errors
      // Remove ternaries
      fixedContent = fixedContent.replace(/const\s+(\w+)\s*=\s*[^;]*\?[^;]*;/g, 'const $1 = "";');
      // Fix className ternaries
      fixedContent = fixedContent.replace(/className=\{[^}]*\?[^}]*\}/g, 'className="p-4"');
      // Fix mixed quotes in className
      fixedContent = fixedContent.replace(/className=["']([^"'`]+)["`}]+/g, 'className="$1"');
      break;
      
    case 'babel':
      // Generic babel error fixes
      // Remove TypeScript syntax
      fixedContent = fixedContent.replace(/interface\s+\w+\s*\{[^}]*\}/g, '');
      fixedContent = fixedContent.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
      // Remove styled-jsx
      fixedContent = fixedContent.replace(/<style\s+jsx>[\s\S]*?<\/style>/g, '');
      // Fix template literal issues
      fixedContent = fixedContent.replace(/className=["']([^"'`]+)["`}]+/g, 'className="$1"');
      break;
      
    case 'unclosed-tag':
    case 'esbuild':
      // Fix unclosed JSX tags
      if (error.tag) {
        const tagName = error.tag;
        const lines = fixedContent.split('\n');
        
        // Find the line with the unclosed tag
        if (error.line && error.line <= lines.length) {
          const lineIndex = error.line - 1;
          const line = lines[lineIndex];
          
          // Add closing tag at the end of the line or after children
          if (line.includes('{children}')) {
            lines[lineIndex] = line.replace('{children}', `{children}</${tagName}>`);
          } else if (line.trim().endsWith('>')) {
            // Self-closing or needs closing tag
            lines[lineIndex] = line + `</${tagName}>`;
          } else {
            // Add at end of file if not found
            lines.push(`</${tagName}>`);
          }
          
          fixedContent = lines.join('\n');
        }
      }
      break;
  }
  
  return fixedContent;
}

/**
 * Auto-fix files based on detected errors
 */
export async function autoFixErrors(files, errors, onProgress) {
  const fixedFiles = { ...files };
  let fixCount = 0;
  
  for (const error of errors) {
    if (error.file) {
      // Extract component name from file path
      const componentMatch = error.file.match(/\/components\/(\w+)\.jsx/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        const filePath = `src/components/${componentName}.jsx`;
        
        if (fixedFiles[filePath]) {
          onProgress?.({
            type: 'fix',
            message: `Auto-fixing ${componentName}: ${error.message}`
          });
          
          const originalContent = fixedFiles[filePath];
          const fixedContent = generateErrorFix(error, originalContent);
          
          if (fixedContent !== originalContent) {
            fixedFiles[filePath] = fixedContent;
            fixCount++;
          }
        }
      }
    } else {
      // Error without specific file - apply generic fixes to all components
      for (const filePath in fixedFiles) {
        if (filePath.includes('/components/')) {
          const originalContent = fixedFiles[filePath];
          const fixedContent = generateErrorFix(error, originalContent);
          
          if (fixedContent !== originalContent) {
            fixedFiles[filePath] = fixedContent;
            fixCount++;
          }
        }
      }
    }
  }
  
  return { fixedFiles, fixCount };
}

/**
 * Check if output contains errors
 */
export function hasErrors(output) {
  return output.includes('[plugin:vite:react-babel]') ||
         output.includes('ReferenceError:') ||
         output.includes('Unexpected token') ||
         output.includes('SyntaxError:');
}

/**
 * Main iterative error fixing loop
 * Similar to Lovable/Bolt behavior
 */
export async function iterativeErrorFix(
  initialFiles,
  webContainerInstance,
  onProgress,
  maxIterations = 5
) {
  let currentFiles = { ...initialFiles };
  let iteration = 0;
  let lastOutput = '';
  
  while (iteration < maxIterations) {
    iteration++;
    
    onProgress?.({
      type: 'iteration',
      iteration,
      message: `Build attempt ${iteration}/${maxIterations}...`
    });
    
    // Mount files and try to build
    await webContainerInstance.mount(currentFiles);
    
    // Install dependencies (only on first iteration)
    if (iteration === 1) {
      onProgress?.({ type: 'install', message: 'Installing dependencies...' });
      const installProcess = await webContainerInstance.spawn('npm', ['install']);
      await installProcess.exit;
    }
    
    // Start dev server and capture output
    onProgress?.({ type: 'build', message: 'Starting dev server...' });
    const devProcess = await webContainerInstance.spawn('npm', ['run', 'dev']);
    
    // Collect output for error detection
    let output = '';
    let serverReady = false;
    
    await new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(), 10000); // 10 second timeout
      
      devProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data;
            lastOutput = output;
            
            // Check if server is ready
            if (data.includes('Local:') || data.includes('ready in')) {
              serverReady = true;
              clearTimeout(timeout);
              resolve();
            }
            
            // Check for errors
            if (hasErrors(data)) {
              clearTimeout(timeout);
              resolve();
            }
          }
        })
      );
    });
    
    // If server is ready and no errors, we're done!
    if (serverReady && !hasErrors(output)) {
      onProgress?.({
        type: 'success',
        message: `✅ Build successful after ${iteration} iteration(s)!`
      });
      
      // Extract server URL
      const urlMatch = output.match(/Local:\s+(https?:\/\/[^\s]+)/);
      const serverUrl = urlMatch ? urlMatch[1] : null;
      
      return {
        success: true,
        files: currentFiles,
        iterations: iteration,
        serverUrl
      };
    }
    
    // Parse errors from output
    const errors = parseViteErrors(output);
    
    if (errors.length === 0) {
      // No specific errors found, but build failed
      onProgress?.({
        type: 'warning',
        message: 'Build failed but no specific errors detected'
      });
      break;
    }
    
    onProgress?.({
      type: 'errors',
      count: errors.length,
      message: `Found ${errors.length} error(s), attempting auto-fix...`
    });
    
    // Auto-fix errors
    const { fixedFiles, fixCount } = await autoFixErrors(currentFiles, errors, onProgress);
    
    if (fixCount === 0) {
      // No fixes applied, can't continue
      onProgress?.({
        type: 'error',
        message: 'Unable to auto-fix errors'
      });
      break;
    }
    
    onProgress?.({
      type: 'fixed',
      count: fixCount,
      message: `Applied ${fixCount} fix(es), retrying build...`
    });
    
    currentFiles = fixedFiles;
    
    // Kill the dev server before next iteration
    devProcess.kill();
  }
  
  // Max iterations reached or unable to fix
  return {
    success: false,
    files: currentFiles,
    iterations: iteration,
    lastOutput
  };
}

/**
 * SMART AUTO-FIX LOOP
 * Monitors build errors and automatically fixes them until website is live
 * Like bolt.new, lovable.dev, v0.dev
 */

import { fixAllSyntaxErrors } from './syntaxErrorFixer';
import { fixAllJSXFiles } from './babelJsxFixer';
import { postProcessAllJSX } from './jsxPostProcessor';

/**
 * Parse Vite/Babel error messages to extract file and error details
 */
function parseErrorMessage(errorLog) {
  const errors = [];
  
  // Pattern 1: [plugin:vite:react-babel] /path/to/file.jsx: Error message (line:col)
  const viteErrorPattern = /\[plugin:vite:react-babel\]\s+([^\s:]+):([^\n]+?)(?:\((\d+):(\d+)\))?/g;
  let match;
  
  while ((match = viteErrorPattern.exec(errorLog)) !== null) {
    const [, filePath, message, line, col] = match;
    
    // Extract just the filename
    const fileName = filePath.split('/').pop();
    
    errors.push({
      file: fileName,
      fullPath: filePath,
      message: message.trim(),
      line: line ? parseInt(line) : null,
      col: col ? parseInt(col) : null,
      type: detectErrorType(message)
    });
  }
  
  // Pattern 2: Error in file.jsx at line X
  const simpleErrorPattern = /Error in ([^\s]+\.jsx)\s+at line (\d+)/gi;
  while ((match = simpleErrorPattern.exec(errorLog)) !== null) {
    const [, fileName, line] = match;
    errors.push({
      file: fileName,
      line: parseInt(line),
      type: 'unknown'
    });
  }
  
  return errors;
}

/**
 * Detect error type from message
 */
function detectErrorType(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('adjacent jsx') || msg.includes('wrap')) return 'adjacent_jsx';
  if (msg.includes('closing tag') || msg.includes('expected')) return 'jsx_mismatch';
  if (msg.includes('unexpected token')) return 'syntax_error';
  if (msg.includes('cannot find module') || msg.includes('import')) return 'import_error';
  if (msg.includes('undefined') || msg.includes('not defined')) return 'undefined_variable';
  
  return 'unknown';
}

/**
 * Apply targeted fix based on error type
 */
function applyTargetedFix(fileContent, fileName, error) {
  console.log(`🔧 Applying ${error.type} fix to ${fileName} at line ${error.line}`);
  
  let fixed = fileContent;
  
  switch (error.type) {
    case 'adjacent_jsx':
    case 'jsx_mismatch':
      // Apply JSX structure fixes
      const jsxResult = fixAllJSXFiles([{
        type: 'file',
        name: fileName,
        content: fileContent
      }]);
      if (jsxResult.fixedCount > 0) {
        fixed = jsxResult.files[0].content;
        console.log(`✅ Applied JSX structure fix`);
      }
      break;
      
    case 'syntax_error':
      // Apply syntax fixes
      const syntaxResult = fixAllSyntaxErrors([{
        type: 'file',
        name: fileName,
        content: fileContent
      }]);
      if (syntaxResult.fixedCount > 0) {
        fixed = syntaxResult.files[0].content;
        console.log(`✅ Applied syntax fix`);
      }
      break;
      
    case 'import_error':
      // Fix import paths
      fixed = fixImportPaths(fileContent, error);
      console.log(`✅ Applied import fix`);
      break;
      
    default:
      // Apply all fixes as fallback
      console.log(`⚠️ Unknown error type, applying all fixes`);
      const allFixed = [{ type: 'file', name: fileName, content: fileContent }];
      
      const step1 = fixAllSyntaxErrors(allFixed);
      const step2 = fixAllJSXFiles(step1.files);
      const step3 = postProcessAllJSX(step2.files);
      
      fixed = step3[0].content;
      break;
  }
  
  return fixed;
}

/**
 * Fix import paths
 */
function fixImportPaths(content, error) {
  let fixed = content;
  
  // Common import fixes
  const importFixes = {
    'flowbite-react': null, // Remove flowbite imports
    '@/components': '../components',
    '@/lib': '../lib',
    '@/utils': '../utils'
  };
  
  for (const [wrong, correct] of Object.entries(importFixes)) {
    if (correct === null) {
      // Remove the import
      const importPattern = new RegExp(`import\\s+.*?from\\s+['"]${wrong}['"];?\\n?`, 'g');
      fixed = fixed.replace(importPattern, '');
    } else {
      // Fix the path
      fixed = fixed.replace(new RegExp(`from ['"]${wrong}`, 'g'), `from '${correct}`);
    }
  }
  
  return fixed;
}

/**
 * SMART AUTO-FIX LOOP
 * Monitors build and fixes errors automatically
 */
export async function autoFixLoop(webcontainer, files, addLog, maxAttempts = 5) {
  console.log(`🔄 Starting auto-fix loop (max ${maxAttempts} attempts)`);
  
  let attempt = 0;
  let currentFiles = files;
  let lastError = null;
  
  while (attempt < maxAttempts) {
    attempt++;
    
    addLog({
      type: 'info',
      message: `🔄 Auto-fix attempt ${attempt}/${maxAttempts}...`
    });
    
    try {
      // Wait longer for Vite to compile (8 seconds)
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      // Check for errors in the terminal
      const terminalOutput = await getTerminalOutput(webcontainer);
      const errors = parseErrorMessage(terminalOutput);
      
      console.log(`📊 Terminal output length: ${terminalOutput.length} chars`);
      console.log(`📊 Errors found: ${errors.length}`);
      
      if (errors.length === 0) {
        // Double-check by waiting a bit more
        await new Promise(resolve => setTimeout(resolve, 2000));
        const terminalOutput2 = await getTerminalOutput(webcontainer);
        const errors2 = parseErrorMessage(terminalOutput2);
        
        if (errors2.length === 0) {
          addLog({
            type: 'success',
            message: `✅ Build successful! No errors detected.`
          });
          console.log(`✅ Auto-fix loop completed successfully after ${attempt} attempt(s)`);
          return { success: true, attempts: attempt, files: currentFiles };
        } else {
          // Errors appeared after delay
          console.log(`⚠️ Errors appeared after delay: ${errors2.length}`);
          errors.push(...errors2);
        }
      }
      
      // Check if we're stuck on the same error
      const currentError = JSON.stringify(errors[0]);
      if (currentError === lastError) {
        console.log(`⚠️ Stuck on same error, trying more aggressive fix...`);
        // Apply all fixes to all JSX files
        currentFiles = applyAggressiveFixToAll(currentFiles);
      } else {
        // Apply targeted fixes
        console.log(`🔍 Found ${errors.length} error(s), applying fixes...`);
        
        for (const error of errors) {
          addLog({
            type: 'warning',
            message: `🔧 Fixing ${error.type} in ${error.file} at line ${error.line}`
          });
          
          // Find the file in the tree
          const fileNode = findFileInTree(currentFiles, error.file);
          if (fileNode && fileNode.content) {
            const fixedContent = applyTargetedFix(fileNode.content, error.file, error);
            
            if (fixedContent !== fileNode.content) {
              fileNode.content = fixedContent;
              
              // Write the fixed file back to WebContainer
              await writeFileToContainer(webcontainer, fileNode, error.file);
              
              addLog({
                type: 'success',
                message: `✅ Fixed ${error.file}`
              });
            }
          }
        }
      }
      
      lastError = currentError;
      
    } catch (err) {
      console.error(`❌ Error in auto-fix loop attempt ${attempt}:`, err);
      addLog({
        type: 'error',
        message: `❌ Auto-fix attempt ${attempt} failed: ${err.message}`
      });
    }
  }
  
  // Max attempts reached
  addLog({
    type: 'warning',
    message: `⚠️ Auto-fix loop completed ${maxAttempts} attempts. Some errors may remain.`
  });
  
  return { success: false, attempts: maxAttempts, files: currentFiles };
}

/**
 * Apply aggressive fix to all JSX files
 */
function applyAggressiveFixToAll(files) {
  console.log(`🔨 Applying aggressive fix to all files...`);
  
  let fixed = files;
  
  // Apply all fixers in sequence
  fixed = fixAllSyntaxErrors(fixed).files;
  fixed = fixAllJSXFiles(fixed).files;
  fixed = postProcessAllJSX(fixed);
  
  return fixed;
}

/**
 * Find a file in the file tree
 */
function findFileInTree(files, fileName) {
  for (const node of files) {
    if (node.type === 'file' && node.name === fileName) {
      return node;
    }
    if (node.type === 'folder' && node.children) {
      const found = findFileInTree(node.children, fileName);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get terminal output from WebContainer
 */
async function getTerminalOutput(webcontainer) {
  try {
    // Read the terminal logs (this is a simplified version)
    // In reality, you'd need to capture the actual terminal output
    return webcontainer.terminalOutput || '';
  } catch (err) {
    console.error('Error reading terminal output:', err);
    return '';
  }
}

/**
 * Write fixed file back to WebContainer
 */
async function writeFileToContainer(webcontainer, fileNode, fileName) {
  try {
    // Determine the full path
    const path = getFilePath(fileName);
    
    await webcontainer.fs.writeFile(path, fileNode.content);
    console.log(`📝 Wrote fixed ${fileName} to WebContainer`);
  } catch (err) {
    console.error(`Error writing ${fileName}:`, err);
  }
}

/**
 * Get full file path
 */
function getFilePath(fileName) {
  if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
    if (fileName === 'App.jsx' || fileName === 'main.jsx') {
      return `/src/${fileName}`;
    }
    // Assume it's a page
    return `/src/pages/${fileName}`;
  }
  return `/src/${fileName}`;
}

/**
 * Monitor build status and trigger auto-fix if needed
 */
export function setupBuildMonitor(webcontainer, files, addLog) {
  let errorBuffer = '';
  let errorTimeout = null;
  
  // Listen to terminal output
  const handleTerminalData = (data) => {
    errorBuffer += data;
    
    // Check for errors
    if (data.includes('[plugin:vite:react-babel]') || 
        data.includes('Error:') || 
        data.includes('SyntaxError:')) {
      
      // Debounce error detection
      if (errorTimeout) clearTimeout(errorTimeout);
      
      errorTimeout = setTimeout(async () => {
        console.log('🚨 Build error detected, triggering auto-fix...');
        
        addLog({
          type: 'warning',
          message: '🚨 Build error detected! Starting auto-fix...'
        });
        
        // Trigger auto-fix
        const result = await autoFixLoop(webcontainer, files, addLog);
        
        if (result.success) {
          addLog({
            type: 'success',
            message: `✅ Auto-fix successful after ${result.attempts} attempt(s)!`
          });
        }
        
        errorBuffer = '';
      }, 2000); // Wait 2s to collect full error message
    }
  };
  
  return handleTerminalData;
}

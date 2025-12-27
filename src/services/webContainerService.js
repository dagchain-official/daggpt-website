import { WebContainer } from '@webcontainer/api';
import { 
  parseViteErrors, 
  autoFixErrors 
} from './webContainerErrorFixer';
import {
  getTemplateSnapshot,
  mergeFilesIntoSnapshot,
  cacheSnapshot
} from './webContainerSnapshots';

let webcontainerInstance = null;

/**
 * Check if WebContainer is supported
 */
export const isWebContainerSupported = () => {
  // Check for SharedArrayBuffer support
  if (typeof SharedArrayBuffer === 'undefined') {
    console.error('[WebContainer] SharedArrayBuffer not available. COEP/COOP headers may not be set correctly.');
    return false;
  }
  
  // Check for required browser features
  if (!('serviceWorker' in navigator)) {
    console.error('[WebContainer] Service Workers not supported');
    return false;
  }
  
  return true;
};

/**
 * Initialize WebContainer instance (singleton)
 */
export const getWebContainer = async () => {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  // Check support first
  if (!isWebContainerSupported()) {
    throw new Error('WebContainer is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser with proper COEP/COOP headers.');
  }

  console.log('[WebContainer] Booting...');
  try {
    webcontainerInstance = await WebContainer.boot();
    console.log('[WebContainer] Ready!');
    return webcontainerInstance;
  } catch (error) {
    console.error('[WebContainer] Boot failed:', error);
    throw new Error(`Failed to boot WebContainer: ${error.message}`);
  }
};

/**
 * Convert flat file structure to WebContainer file tree format
 * @param {Object} files - Flat file structure { 'src/App.jsx': 'content', ... }
 * @returns {Object} - Nested file tree for WebContainer
 */
const convertToFileTree = (files) => {
  const tree = {};

  for (const [path, content] of Object.entries(files)) {
    const parts = path.split('/');
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        current[part] = {
          file: {
            contents: content
          }
        };
      } else {
        if (!current[part]) {
          current[part] = {
            directory: {}
          };
        }
        current = current[part].directory;
      }
    }
  }

  return tree;
};

/**
 * Load generated files into WebContainer and start dev server
 * @param {Object} files - Generated files { 'src/App.jsx': 'content', ... }
 * @returns {Promise<string>} - Dev server URL
 */
export const runInWebContainer = async (files) => {
  try {
    console.log('[WebContainer] Loading files...');
    const webcontainer = await getWebContainer();

    // Convert flat structure to tree
    const fileTree = convertToFileTree(files);
    console.log('[WebContainer] File tree created:', Object.keys(fileTree));

    // Mount files
    await webcontainer.mount(fileTree);
    console.log('[WebContainer] Files mounted');

    // Install dependencies
    console.log('[WebContainer] Installing dependencies...');
    const installProcess = await webcontainer.spawn('npm', ['install']);
    
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log('[npm install]', data);
        }
      })
    );

    const installExitCode = await installProcess.exit;
    if (installExitCode !== 0) {
      throw new Error('npm install failed');
    }

    console.log('[WebContainer] Dependencies installed');

    // Start dev server
    console.log('[WebContainer] Starting dev server...');
    const devProcess = await webcontainer.spawn('npm', ['run', 'dev']);

    let hasError = false;
    devProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log('[npm run dev]', data);
          // Check for errors
          if (data.toLowerCase().includes('error') || data.toLowerCase().includes('✘')) {
            hasError = true;
            console.error('[npm run dev] ERROR DETECTED:', data);
          }
        }
      })
    );

    // Wait for server to be ready
    const serverUrl = await new Promise((resolve, reject) => {
      webcontainer.on('server-ready', (port, url) => {
        console.log('[WebContainer] Server ready at:', url);
        resolve(url);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 30000);
    });

    return serverUrl;
  } catch (error) {
    console.error('[WebContainer] Error:', error);
    throw error;
  }
};

/**
 * Run in WebContainer with iterative error fixing (like Lovable/Bolt)
 * @param {Object} files - Generated files
 * @param {Function} onProgress - Progress callback
 * @param {number} maxIterations - Maximum fix iterations
 * @returns {Promise<Object>} - Result with success status and server URL
 */
export const runInWebContainerWithAutoFix = async (files, onProgress, maxIterations = 5) => {
  try {
    const webcontainer = await getWebContainer();
    let currentFiles = { ...files };
    let iteration = 0;
    
    while (iteration < maxIterations) {
      iteration++;
      
      onProgress?.({
        type: 'iteration',
        iteration,
        maxIterations,
        message: `🔄 Build attempt ${iteration}/${maxIterations}...`
      });
      
      // Convert and mount files
      const fileTree = convertToFileTree(currentFiles);
      await webcontainer.mount(fileTree);
      
      // Install dependencies (only on first iteration)
      if (iteration === 1) {
        onProgress?.({ type: 'install', message: '📦 Installing dependencies...' });
        const installProcess = await webcontainer.spawn('npm', ['install']);
        
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log('[npm install]', data);
            }
          })
        );
        
        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error('npm install failed');
        }
      }
      
      // Start dev server
      onProgress?.({ type: 'build', message: '🚀 Starting dev server...' });
      const devProcess = await webcontainer.spawn('npm', ['run', 'dev']);
      
      // Collect output for error detection
      let output = '';
      let serverUrl = null;
      let buildComplete = false;
      let hasErrorsDetected = false;
      
      await new Promise((resolve) => {
        // Wait longer to catch errors that appear after server-ready
        const timeout = setTimeout(() => {
          buildComplete = true;
          resolve();
        }, 20000); // 20 second timeout to catch late errors
        
        webcontainer.on('server-ready', (port, url) => {
          serverUrl = url;
          // DON'T resolve immediately - wait for potential errors
          setTimeout(() => {
            if (!hasErrorsDetected) {
              clearTimeout(timeout);
              buildComplete = true;
              resolve();
            }
          }, 3000); // Wait 3 more seconds after server-ready to catch errors
        });
        
        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              output += data;
              console.log('[npm run dev]', data);
              
              // Check for errors in real-time
              if (data.includes('[plugin:vite:react-babel]') || 
                  data.includes('ReferenceError:') ||
                  data.includes('Unexpected token') ||
                  data.includes('Unterminated') ||
                  data.includes('[ERROR]') ||
                  data.includes('Internal server error')) {
                hasErrorsDetected = true;
                // Give it a moment to collect full error, then resolve
                setTimeout(() => {
                  clearTimeout(timeout);
                  buildComplete = true;
                  resolve();
                }, 2000);
              }
              
              // Check if server is ready
              if (data.includes('Local:') || data.includes('ready in')) {
                if (!serverUrl) {
                  const urlMatch = data.match(/Local:\s+(https?:\/\/[^\s]+)/);
                  if (urlMatch) {
                    serverUrl = urlMatch[1];
                  }
                }
              }
            }
          })
        );
      });
      
      // Parse errors FIRST
      const errors = parseViteErrors(output);
      
      // Check if build was successful (server ready AND no errors)
      if (serverUrl && errors.length === 0) {
        // Kill the dev server before returning
        try {
          devProcess.kill();
        } catch (e) {
          console.warn('[WebContainer] Failed to kill dev process:', e);
        }
        
        onProgress?.({
          type: 'success',
          iteration,
          message: `✅ Build successful after ${iteration} iteration(s)!`
        });
        
        return {
          success: true,
          serverUrl,
          iterations: iteration,
          files: currentFiles
        };
      }
      
      // If there are errors, try to fix them and continue loop
      if (errors.length > 0) {
        onProgress?.({
          type: 'errors',
          count: errors.length,
          errors: errors.map(e => e.message),
          message: `🔍 Found ${errors.length} error(s), attempting auto-fix...`
        });
        
        // Auto-fix errors
        const { fixedFiles, fixCount } = await autoFixErrors(
          currentFiles,
          errors,
          (progress) => onProgress?.(progress)
        );
        
        if (fixCount === 0) {
          // Can't fix errors, but don't give up yet - try next iteration
          onProgress?.({
            type: 'warning',
            message: `⚠️ Unable to auto-fix ${errors.length} error(s), will retry...`
          });
          
          // Kill the dev server before next iteration
          try {
            devProcess.kill();
          } catch (e) {
            console.warn('[WebContainer] Failed to kill dev process:', e);
          }
          
          // Small delay before next iteration
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Continue to next iteration (don't return)
          continue;
        }
        
        onProgress?.({
          type: 'fixed',
          count: fixCount,
          message: `🔧 Applied ${fixCount} fix(es), retrying build...`
        });
        
        currentFiles = fixedFiles;
        
        // Kill the dev server before next iteration
        try {
          devProcess.kill();
        } catch (e) {
          console.warn('[WebContainer] Failed to kill dev process:', e);
        }
        
        // Small delay before next iteration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Continue to next iteration
        continue;
      }
      
      // No errors detected but also no server URL - continue trying
      if (!serverUrl) {
        onProgress?.({
          type: 'warning',
          message: '⚠️ Server not ready, retrying...'
        });
        
        // Kill the dev server before next iteration
        try {
          devProcess.kill();
        } catch (e) {
          console.warn('[WebContainer] Failed to kill dev process:', e);
        }
        
        // Small delay before next iteration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Continue to next iteration
        continue;
      }
    }
    
    // Max iterations reached
    onProgress?.({
      type: 'error',
      message: `❌ Max iterations (${maxIterations}) reached without successful build`
    });
    
    return {
      success: false,
      serverUrl: null,
      iterations: maxIterations,
      files: currentFiles,
      error: 'Max iterations reached'
    };
    
  } catch (error) {
    console.error('[WebContainer] Error:', error);
    onProgress?.({
      type: 'error',
      message: `❌ Fatal error: ${error.message}`
    });
    
    return {
      success: false,
      serverUrl: null,
      error: error.message
    };
  }
};

/**
 * Stop the WebContainer instance
 */
export const stopWebContainer = async () => {
  if (webcontainerInstance) {
    console.log('[WebContainer] Tearing down...');
    await webcontainerInstance.teardown();
    webcontainerInstance = null;
    console.log('[WebContainer] Stopped');
  }
};

/**
 * Bolt WebContainer Service
 * Handles in-browser code execution using WebContainers
 * OPTIMIZED for speed with caching and parallel processing
 */

import { WebContainer } from '@webcontainer/api';
import { getWebContainer as getCachedContainer, clearCache } from './webcontainer/dependencyCache';
import { optimizeProjectDependencies } from './webcontainer/packageOptimizer';
import { writeFilesInParallel } from './webcontainer/parallelProcessor';

let webcontainerInstance = null;

/**
 * Boot WebContainer instance (with caching)
 */
export async function bootWebContainer() {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  try {
    console.log('🚀 Booting WebContainer...');
    
    // Use cached container if available
    webcontainerInstance = await getCachedContainer();
    
    console.log('✅ WebContainer ready!');
    return webcontainerInstance;
  } catch (error) {
    console.error('❌ Failed to boot WebContainer:', error);
    throw error;
  }
}

/**
 * Get WebContainer instance
 */
export function getWebContainer() {
  return webcontainerInstance;
}

/**
 * Write files to WebContainer
 */
export async function writeFiles(files) {
  const container = await bootWebContainer();
  
  try {
    // Convert file tree to WebContainer format
    const fileTree = buildWebContainerFileTree(files);
    
    // Mount files
    await container.mount(fileTree);
    
    console.log('✅ Files written to WebContainer');
    return true;
  } catch (error) {
    console.error('❌ Failed to write files:', error);
    throw error;
  }
}

/**
 * Convert our file structure to WebContainer format
 */
function buildWebContainerFileTree(files) {
  const tree = {};
  
  function processNode(node, currentPath = '') {
    if (node.type === 'file') {
      return {
        file: {
          contents: node.content || ''
        }
      };
    } else if (node.type === 'folder' && node.children) {
      const directory = {};
      node.children.forEach(child => {
        directory[child.name] = processNode(child, `${currentPath}/${child.name}`);
      });
      return {
        directory
      };
    }
  }
  
  files.forEach(node => {
    tree[node.name] = processNode(node);
  });
  
  return tree;
}

/**
 * Install dependencies (OPTIMIZED)
 */
export async function installDependencies(onOutput) {
  const container = await bootWebContainer();
  
  try {
    console.log('📦 Installing dependencies...');
    
    // Use optimized npm install flags for speed
    const installPromise = new Promise(async (resolve, reject) => {
      try {
        // Use --prefer-offline and --no-audit for faster installs
        // Add --legacy-peer-deps to handle version conflicts
        const installProcess = await container.spawn('npm', [
          'install',
          '--prefer-offline',
          '--no-audit',
          '--no-fund',
          '--legacy-peer-deps',
          '--loglevel=error'
        ]);
        
        let hasOutput = false;
        let lastProgressTime = Date.now();
        
        // Show progress every 10 seconds if no output
        const progressInterval = setInterval(() => {
          if (!hasOutput && onOutput) {
            const elapsed = Math.floor((Date.now() - lastProgressTime) / 1000);
            onOutput(`⏳ Installing packages... (${elapsed}s elapsed)`);
          }
        }, 10000);
        
        // Stream output - show real npm install progress
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              hasOutput = true;
              const text = data.toString();
              
              // Log raw output for debugging
              console.log('[npm output]:', text);
              
              // Send all output in real-time (like real terminal)
              if (onOutput && text.trim()) {
                // Send every line that has content
                const lines = text.split('\n');
                lines.forEach(line => {
                  const trimmed = line.trim();
                  if (trimmed && !trimmed.startsWith('npm WARN deprecated')) {
                    onOutput(trimmed);
                  }
                });
              }
            }
          })
        );
        
        const exitCode = await installProcess.exit;
        clearInterval(progressInterval);
        
        if (exitCode !== 0) {
          reject(new Error(`npm install failed with exit code ${exitCode}`));
        } else {
          resolve(true);
        }
      } catch (error) {
        reject(error);
      }
    });
    
    // Wait for install to complete (no timeout)
    await installPromise;
    
    console.log('✅ Dependencies installed');
    return true;
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error);
    throw error;
  }
}

/**
 * Start dev server with error monitoring
 */
export async function startDevServer(onReady, onOutput, onError) {
  const container = await bootWebContainer();
  
  try {
    console.log('🚀 Starting dev server...');
    
    // Start the dev server
    const serverProcess = await container.spawn('npm', ['run', 'dev']);
    
    let outputBuffer = '';
    let errorBuffer = '';
    let lastLogTime = Date.now();
    
    // Store terminal output for error detection
    container.terminalOutput = '';
    
    // Stream output with throttling and error detection
    serverProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          outputBuffer += data;
          container.terminalOutput += data;
          
          // Detect errors
          if (data.includes('[plugin:vite:react-babel]') || 
              data.includes('Error:') || 
              data.includes('SyntaxError:') ||
              data.includes('Unexpected token')) {
            errorBuffer += data;
            
            // Trigger error callback
            if (onError) {
              onError(data);
            }
          }
          
          // Only log important messages
          const now = Date.now();
          if (now - lastLogTime > 1000 || 
              data.includes('Compiled') || 
              data.includes('webpack') ||
              data.includes('Local:') ||
              data.includes('ready')) {
            
            if (onOutput && outputBuffer.trim()) {
              // Send meaningful lines only
              const lines = outputBuffer.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed && 
                       (trimmed.includes('Compiled') || 
                        trimmed.includes('webpack') ||
                        trimmed.includes('Local:') ||
                        trimmed.includes('ready') ||
                        trimmed.includes('Starting'));
              });
              
              if (lines.length > 0) {
                onOutput(lines[lines.length - 1]);
              }
            }
            outputBuffer = '';
            lastLogTime = now;
          }
        }
      })
    );
    
    // Wait for server to be ready
    container.on('server-ready', (port, url) => {
      console.log(`✅ Dev server ready at ${url}`);
      if (onReady) onReady(url);
    });
    
    return serverProcess;
  } catch (error) {
    console.error('❌ Failed to start dev server:', error);
    throw error;
  }
}

/**
 * Run a command in WebContainer
 */
export async function runCommand(command, args = [], onOutput) {
  const container = await bootWebContainer();
  
  try {
    const process = await container.spawn(command, args);
    
    if (onOutput) {
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            onOutput(data);
          }
        })
      );
    }
    
    const exitCode = await process.exit;
    return exitCode;
  } catch (error) {
    console.error(`❌ Failed to run command: ${command}`, error);
    throw error;
  }
}

/**
 * Read a file from WebContainer
 */
export async function readFile(path) {
  const container = await bootWebContainer();
  
  try {
    const content = await container.fs.readFile(path, 'utf-8');
    return content;
  } catch (error) {
    console.error(`❌ Failed to read file: ${path}`, error);
    throw error;
  }
}

/**
 * Write a single file to WebContainer
 */
export async function writeFile(path, content) {
  const container = await bootWebContainer();
  
  try {
    await container.fs.writeFile(path, content);
    console.log(`✅ File written: ${path}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to write file: ${path}`, error);
    throw error;
  }
}

/**
 * Delete a file from WebContainer
 */
export async function deleteFile(path) {
  const container = await bootWebContainer();
  
  try {
    await container.fs.rm(path);
    console.log(`✅ File deleted: ${path}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete file: ${path}`, error);
    throw error;
  }
}

/**
 * Full project setup and run (OPTIMIZED with AUTO-FIX)
 */
export async function setupAndRunProject(files, onLog, onPreviewReady, onError) {
  try {
    // Step 1: Optimize dependencies
    onLog({ type: 'info', message: '⚡ Optimizing project...' });
    const optimizedFiles = optimizeProjectDependencies(files);
    
    // Step 2: Boot container (uses cache if available)
    await bootWebContainer();
    onLog({ type: 'info', message: '🚀 Initializing WebContainer...' });
    
    // Step 3: Write files in parallel
    await writeFiles(optimizedFiles);
    onLog({ type: 'success', message: '✅ Files loaded' });
    
    // Install dependencies
    onLog({ type: 'info', message: '📦 Installing dependencies (please wait, this may take a few minutes)...' });
    try {
      await installDependencies((output) => {
        onLog({ type: 'info', message: output });
      });
      onLog({ type: 'success', message: '✅ Dependencies installed' });
    } catch (installError) {
      onLog({ type: 'warning', message: `⚠️ Install failed: ${installError.message}` });
      
      // Check if it's a network/CORS issue
      if (installError.message.includes('exit code 1')) {
        onLog({ type: 'info', message: '💡 This might be a network issue. WebContainer needs internet access to download packages.' });
        onLog({ type: 'info', message: '💡 Try: 1) Check your internet connection, 2) Disable VPN/proxy, 3) Try again in a few minutes' });
      }
      
      onLog({ type: 'info', message: '📝 Files are ready for editing. You can view and download the code.' });
      // Don't throw - allow user to see the code even if install fails
      return;
    }
    
    // Start dev server with error monitoring
    onLog({ type: 'info', message: '🚀 Starting dev server...' });
    try {
      await startDevServer(
        (url) => {
          onLog({ type: 'success', message: `✅ Server ready at ${url}` });
          if (onPreviewReady) onPreviewReady(url);
        },
        (output) => {
          onLog({ type: 'info', message: output });
        },
        (errorData) => {
          // Pass errors to auto-fix loop
          if (onError) onError(errorData);
        }
      );
    } catch (serverError) {
      onLog({ type: 'error', message: `❌ Dev server failed: ${serverError.message}` });
      onLog({ type: 'info', message: '📝 You can still edit the code in the editor' });
    }
    
    // Return webcontainer for auto-fix loop
    return { webcontainer: webcontainerInstance };
    
  } catch (error) {
    onLog({ type: 'error', message: `❌ Setup failed: ${error.message}` });
    onLog({ type: 'info', message: '📝 Files are available in the editor' });
    throw error;
  }
}

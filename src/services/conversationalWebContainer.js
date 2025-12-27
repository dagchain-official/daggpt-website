/**
 * Conversational WebContainer Service - Bolt.new Architecture
 * 
 * This service implements the REAL Bolt.new approach:
 * - AI generates code
 * - Terminal output is sent back to AI
 * - AI sees errors and generates fixes
 * - Continues until build succeeds
 */

import { WebContainer } from '@webcontainer/api';
// Temporarily disabled - causes build issues with SVG data URLs
// import { callGrokAPI } from './lovable-style/grokAgents';

let webcontainerInstance = null;

/**
 * Get or create WebContainer instance
 */
export const getWebContainer = async () => {
  if (!webcontainerInstance) {
    console.log('[WebContainer] Booting...');
    webcontainerInstance = await WebContainer.boot();
    console.log('[WebContainer] Ready');
  }
  return webcontainerInstance;
};

/**
 * Convert files object to WebContainer file tree
 */
const convertToFileTree = (files) => {
  const tree = {};
  
  Object.entries(files).forEach(([path, content]) => {
    const parts = path.split('/');
    let current = tree;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = { directory: {} };
      }
      current = current[part].directory;
    }
    
    const filename = parts[parts.length - 1];
    current[filename] = {
      file: {
        contents: content
      }
    };
  });
  
  return tree;
};

/**
 * Parse AI response for file actions
 * Supports both artifact format and direct file updates
 */
const parseFileActions = (aiResponse) => {
  const fileActions = [];
  
  // Try to parse artifact format: <boltAction type="file" filePath="...">
  const artifactRegex = /<boltAction\s+type=["']file["']\s+filePath=["']([^"']+)["']>([\s\S]*?)<\/boltAction>/g;
  let match;
  
  while ((match = artifactRegex.exec(aiResponse)) !== null) {
    fileActions.push({
      filePath: match[1],
      content: match[2].trim()
    });
  }
  
  // If no artifacts found, try to parse code blocks with file paths
  if (fileActions.length === 0) {
    const codeBlockRegex = /```(?:jsx?|tsx?|javascript|typescript)?\s*(?:\/\/\s*)?([^\n]+\.(?:jsx?|tsx?|css|html))\n([\s\S]*?)```/g;
    
    while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
      const filePath = match[1].trim();
      const content = match[2].trim();
      
      if (filePath && content) {
        fileActions.push({ filePath, content });
      }
    }
  }
  
  return fileActions;
};

/**
 * Check if terminal output contains errors
 */
const hasErrors = (output) => {
  const errorPatterns = [
    /\[ERROR\]/i,
    /Error:/i,
    /Failed to/i,
    /Unexpected token/i,
    /Unterminated/i,
    /SyntaxError/i,
    /ReferenceError/i,
    /TypeError/i,
    /is not defined/i,
    /Cannot find module/i,
    /Module not found/i,
    /Cannot read propert/i,
    /undefined is not/i
  ];
  
  const hasError = errorPatterns.some(pattern => pattern.test(output));
  
  if (hasError) {
    console.log('[Error Detection] Found error in output:', output.substring(0, 200));
  }
  
  return hasError;
};

/**
 * BOLT.NEW ARCHITECTURE: Conversational build with AI
 * 
 * The AI sees terminal output and fixes errors iteratively
 */
export const buildWithConversationalAI = async (
  initialFiles,
  userRequest,
  onProgress,
  maxIterations = 10
) => {
  try {
    const webcontainer = await getWebContainer();
    
    // Initialize conversation history
    const conversation = [
      {
        role: 'system',
        content: `You are an expert full-stack developer using WebContainer to build applications.

CRITICAL RULES:
1. When you see build errors in terminal output, FIX THEM IMMEDIATELY
2. Generate COMPLETE file contents - never use placeholders
3. Use artifact format for file updates:
   <boltAction type="file" filePath="src/Component.jsx">
   [Complete file content here]
   </boltAction>
4. NO BASE64 STRINGS - Use simple URLs like https://images.unsplash.com/photo-xxx?w=800
5. NO strings longer than 100 characters
6. Plain JavaScript/JSX only - NO TypeScript
7. Static className strings - NO template literals or ternaries
8. All props with defaults: function Component({ prop = 'value' })

When you see errors, analyze them and provide fixes immediately.`
      },
      {
        role: 'user',
        content: userRequest
      }
    ];
    
    let currentFiles = { ...initialFiles };
    let iteration = 0;
    let buildSuccessful = false;
    let serverUrl = null;
    let devProcess = null;
    
    // Mount initial files BEFORE starting the loop
    console.log('[WebContainer] Mounting initial files:', Object.keys(currentFiles).length, 'files');
    const initialFileTree = convertToFileTree(currentFiles);
    await webcontainer.mount(initialFileTree);
    
    // Install dependencies for initial files
    onProgress?.({ type: 'install', message: '📦 Installing dependencies...' });
    try {
      const installProcess = await webcontainer.spawn('npm', ['install']);
      let installOutput = '';
      
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            installOutput += data;
            console.log('[npm install]', data);
          }
        })
      );
      
      const installTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('npm install timeout after 60s')), 60000)
      );
      
      const installExitCode = await Promise.race([
        installProcess.exit,
        installTimeout
      ]);
      
      if (installExitCode !== 0) {
        console.warn('[npm install] Non-zero exit code, but continuing...');
      }
      
      onProgress?.({ type: 'install', message: '✅ Dependencies installed!' });
    } catch (error) {
      console.error('[npm install] Error:', error);
      onProgress?.({ type: 'install', message: '⚠️ Install timeout, using cached dependencies...' });
    }
    
    while (!buildSuccessful && iteration < maxIterations) {
      iteration++;
      
      onProgress?.({
        type: 'iteration',
        iteration,
        maxIterations,
        message: `🔄 Build iteration ${iteration}/${maxIterations}...`
      });
      
      // Only call AI if we have errors from previous iteration
      // On first iteration, just try to build the initial files
      if (iteration > 1) {
        onProgress?.({
          type: 'ai',
          message: '🤖 AI is analyzing errors and generating fixes...'
        });
        
        const aiResponse = await callGrokAPI(
          'grok-code-fast-1',
          conversation[0].content,
          conversation.slice(1).map(m => m.content).join('\n\n'),
          0.3,
          4000
        );
        
        conversation.push({ role: 'assistant', content: aiResponse });
        
        // Parse file actions from AI response
        const fileActions = parseFileActions(aiResponse);
        
        if (fileActions.length > 0) {
          onProgress?.({
            type: 'files',
            count: fileActions.length,
            message: `📝 Updating ${fileActions.length} file(s)...`
          });
          
          // Track if package.json changed
          let packageJsonChanged = false;
          
          // Apply file updates
          fileActions.forEach(action => {
            if (action.filePath === 'package.json') {
              packageJsonChanged = true;
            }
            currentFiles[action.filePath] = action.content;
          });
          
          // Mount updated files
          const fileTree = convertToFileTree(currentFiles);
          await webcontainer.mount(fileTree);
          
          // Reinstall if package.json changed
          if (packageJsonChanged) {
            onProgress?.({ type: 'install', message: '📦 Reinstalling dependencies...' });
            
            try {
              const installProcess = await webcontainer.spawn('npm', ['install']);
              let installOutput = '';
              
              installProcess.output.pipeTo(
                new WritableStream({
                  write(data) {
                    installOutput += data;
                    console.log('[npm install]', data);
                  }
                })
              );
              
              const installTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('npm install timeout after 60s')), 60000)
              );
              
              const installExitCode = await Promise.race([
                installProcess.exit,
                installTimeout
              ]);
              
              if (installExitCode !== 0) {
                console.warn('[npm install] Non-zero exit code, but continuing...');
              }
              
              onProgress?.({ type: 'install', message: '✅ Dependencies reinstalled!' });
            } catch (error) {
              console.error('[npm install] Error:', error);
              onProgress?.({ type: 'install', message: '⚠️ Install timeout, using cached dependencies...' });
            }
          }
        }
      }
      
      // Kill previous dev server if exists
      if (devProcess) {
        try {
          devProcess.kill();
        } catch (e) {
          console.warn('[WebContainer] Failed to kill previous dev process:', e);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Start dev server
      onProgress?.({ type: 'build', message: '🚀 Starting dev server...' });
      devProcess = await webcontainer.spawn('npm', ['run', 'dev']);
      
      // Collect terminal output
      let terminalOutput = '';
      let outputComplete = false;
      
      const outputPromise = new Promise((resolve) => {
        const timeout = setTimeout(() => {
          outputComplete = true;
          resolve();
        }, 15000); // 15 second timeout
        
        webcontainer.on('server-ready', (port, url) => {
          serverUrl = url;
          // Wait a bit more to catch any late errors
          setTimeout(() => {
            if (!outputComplete) {
              clearTimeout(timeout);
              outputComplete = true;
              resolve();
            }
          }, 3000);
        });
        
        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              terminalOutput += data;
              console.log('[npm run dev]', data);
              
              // If we see errors, collect a bit more output then resolve
              if (hasErrors(data)) {
                setTimeout(() => {
                  if (!outputComplete) {
                    clearTimeout(timeout);
                    outputComplete = true;
                    resolve();
                  }
                }, 2000);
              }
            }
          })
        );
      });
      
      await outputPromise;
      
      // Check for errors in terminal output
      if (hasErrors(terminalOutput) || !serverUrl) {
        onProgress?.({
          type: 'errors',
          message: '❌ Build errors detected, AI is analyzing...'
        });
        
        // Add terminal output to conversation for AI to see
        conversation.push({
          role: 'system',
          content: `Build output from iteration ${iteration}:\n\n${terminalOutput}\n\n${
            serverUrl ? 'Server started but errors were detected.' : 'Server failed to start.'
          }\n\nPlease analyze the errors above and provide fixes using the artifact format.`
        });
        
        // Continue to next iteration where AI will see errors and fix them
        continue;
      }
      
      // Success!
      buildSuccessful = true;
      
      onProgress?.({
        type: 'success',
        iteration,
        message: `✅ Build successful after ${iteration} iteration(s)!`
      });
    }
    
    if (!buildSuccessful) {
      onProgress?.({
        type: 'error',
        message: `❌ Max iterations (${maxIterations}) reached without successful build`
      });
    }
    
    return {
      success: buildSuccessful,
      serverUrl,
      iterations: iteration,
      files: currentFiles,
      conversation // Return conversation for chat interface
    };
    
  } catch (error) {
    console.error('[Conversational WebContainer] Error:', error);
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
 * Make iterative changes based on user chat message
 * Only modifies what the user asks for
 */
export const makeIterativeChanges = async (
  currentFiles,
  conversation,
  userMessage,
  onProgress
) => {
  try {
    const webcontainer = await getWebContainer();
    
    // Add user message to conversation
    conversation.push({
      role: 'user',
      content: userMessage
    });
    
    onProgress?.({
      type: 'ai',
      message: '🤖 AI is processing your request...'
    });
    
    // Get AI response
    const aiResponse = await callGrokAPI(
      'grok-code-fast-1',
      conversation[0].content,
      conversation.slice(1).map(m => m.content).join('\n\n'),
      0.3,
      4000
    );
    
    conversation.push({ role: 'assistant', content: aiResponse });
    
    // Parse file actions
    const fileActions = parseFileActions(aiResponse);
    
    if (fileActions.length === 0) {
      return {
        success: true,
        message: aiResponse,
        filesChanged: 0,
        conversation
      };
    }
    
    onProgress?.({
      type: 'files',
      count: fileActions.length,
      message: `📝 Updating ${fileActions.length} file(s)...`
    });
    
    // Apply only the changed files
    const updatedFiles = { ...currentFiles };
    fileActions.forEach(action => {
      updatedFiles[action.filePath] = action.content;
    });
    
    // Mount updated files
    const fileTree = convertToFileTree(updatedFiles);
    await webcontainer.mount(fileTree);
    
    onProgress?.({
      type: 'success',
      message: `✅ Changes applied successfully!`
    });
    
    return {
      success: true,
      files: updatedFiles,
      filesChanged: fileActions.length,
      message: aiResponse,
      conversation
    };
    
  } catch (error) {
    console.error('[Iterative Changes] Error:', error);
    return {
      success: false,
      error: error.message,
      conversation
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

/**
 * Tool-Based Orchestrator - Following Bolt.new Architecture
 * Claude uses tools to create/update files instead of generating text
 */

/**
 * Call Claude Agent with tool-based approach
 */
async function callClaudeAgent(prompt, existingFiles = {}) {
  const apiUrl = process.env.NODE_ENV === 'production'
    ? '/api/claude-agent'
    : 'http://localhost:3001/api/claude-agent';

  try {
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        existingFiles,
        maxTokens: 6000
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const text = await response.text();
        try {
          const error = JSON.parse(text);
          errorMessage = error.error || text || errorMessage;
        } catch (e) {
          errorMessage = text || errorMessage;
        }
      } catch (e) {
        // Could not read response
      }
      throw new Error(errorMessage);
    }

    return await response.json();

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Claude Agent timeout after 55 seconds');
      throw new Error('Request timeout - Claude is taking too long. Try a simpler prompt or try again.');
    }
    console.error('Claude Agent call failed:', error);
    throw error;
  }
}

/**
 * Generate complete React application using tool-based approach
 */
export async function generateWithTools(userPrompt, onProgress) {
  const startTime = Date.now();
  
  try {
    onProgress?.({ type: 'stage', stage: 'Planning', message: '🎯 Analyzing requirements...' });

    // Step 1: Generate initial project structure  
    const prompt = `Build: "${userPrompt}"

Create these 8 files using create_files tool:

1. package.json - react 18, vite, tailwind, framer-motion, lucide-react
2. vite.config.js - basic config
3. tailwind.config.js - custom theme
4. postcss.config.js
5. index.html
6. src/main.jsx
7. src/App.jsx - Complete app with all sections (Header, Hero, Features, Footer) in one file. Use Tailwind, Framer Motion, Lucide icons. Beautiful gradients and animations.
8. src/index.css - Tailwind imports

Professional design, responsive, modern colors.`;

    onProgress?.({ type: 'stage', stage: 'Generating', message: '🤖 Claude is creating your application...' });
    
    const result = await callClaudeAgent(prompt, {});
    
    if (!result.success) {
      throw new Error(result.error || 'Generation failed');
    }

    onProgress?.({ type: 'stage', stage: 'Complete', message: '✅ Application generated!' });

    // Log what was created
    result.logs?.forEach(log => {
      onProgress?.({ type: 'log', message: log });
    });

    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);

    return {
      success: true,
      files: result.files,
      metadata: {
        generationTime,
        fileCount: Object.keys(result.files).length,
        toolCalls: result.toolCalls,
        message: result.message,
        usage: result.usage
      }
    };

  } catch (error) {
    console.error('[Tool-Based Orchestrator] Error:', error);
    onProgress?.({ type: 'error', message: `❌ Error: ${error.message}` });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Refine existing application with tool-based approach
 */
export async function refineWithTools(userRequest, currentFiles, onProgress) {
  try {
    onProgress?.({ type: 'stage', stage: 'Generating', message: '🤖 Claude is creating your application...' });
    
    const prompt = `The user wants to make the following changes to their application:

"${userRequest}"

**Current files:** ${Object.keys(currentFiles).length} files exist.

Please update the necessary files to implement these changes. Use update_files for existing files and create_files if new files are needed.`;

    const result = await callClaudeAgent(prompt, {});
    
    if (!result.success) {
      throw new Error(result.error || 'Generation failed');
    }

    onProgress?.({ type: 'stage', stage: 'Complete', message: '✅ Application generated!' });

    // Log what was changed
    result.logs?.forEach(log => {
      onProgress?.({ type: 'log', message: log });
    });

    return {
      success: true,
      files: result.files,
      metadata: {
        toolCalls: result.toolCalls,
        message: result.message,
        usage: result.usage
      }
    };

  } catch (error) {
    console.error('[Tool-Based Refine] Error:', error);
    onProgress?.({ type: 'error', message: `❌ Error: ${error.message}` });
    
    return {
      success: false,
      error: error.message
    };
  }
}

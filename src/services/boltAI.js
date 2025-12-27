/**
 * Bolt AI Service
 * Handles AI code generation using Claude or OpenAI
 */

// Use existing Claude API key from your .env
const ANTHROPIC_API_KEY = process.env.REACT_APP_CLAUDE_API_KEY || process.env.REACT_APP_ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// System prompt for code generation
const SYSTEM_PROMPT = `You are an expert full-stack web developer assistant. You help users build modern web applications.

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. Generate complete, production-ready code
2. Use modern React with hooks and functional components
3. Use Tailwind CSS for styling (ALWAYS include proper Tailwind setup)
4. Include all necessary imports and dependencies
5. Create a proper file structure with multiple files
6. Always include package.json with all dependencies
7. Make the code immediately runnable

EXTREMELY IMPORTANT - COMPONENT GENERATION:
- If you import a component in App.jsx, YOU MUST create that component file
- NEVER import a component that you don't create
- If App.jsx has "import Header from './components/Header'", you MUST create src/components/Header.jsx
- Generate EVERY component you reference - no exceptions!
- Each component must be fully functional, not a placeholder

TAILWIND SETUP - ALWAYS INCLUDE:
1. tailwind.config.js with proper content paths
2. postcss.config.js with tailwindcss and autoprefixer
3. src/index.css with @tailwind directives
4. Tailwind dependencies in package.json devDependencies

When generating code, structure your response like this:

<file path="package.json">
{
  "name": "project-name",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  }
}
</file>

<file path="tailwind.config.js">
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
</file>

<file path="postcss.config.js">
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
</file>

<file path="src/index.css">
@tailwind base;
@tailwind components;
@tailwind utilities;
</file>

<file path="src/App.jsx">
import React from 'react';
import Header from './components/Header';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
    </div>
  );
}

export default App;
</file>

<file path="src/components/Header.jsx">
import React from 'react';

function Header() {
  return (
    <header className="bg-white shadow">
      <h1 className="text-2xl font-bold">My App</h1>
    </header>
  );
}

export default Header;
</file>

Always wrap each file in <file path="...">...</file> tags.
Generate complete, working code that can be immediately executed.
REMEMBER: Create EVERY component file that you import - no placeholders, no missing files!`;

/**
 * Generate code using Claude API (via your existing proxy)
 */
export async function generateWithClaude(userMessage, conversationHistory = []) {
  try {
    const messages = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    // Use your existing API proxy to avoid CORS issues
    const API_URL = process.env.NODE_ENV === 'production' 
      ? '/api/generate-website'
      : 'http://localhost:3001/api/generate-website';

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: userMessage,
        mode: 'bolt-builder',
        systemPrompt: SYSTEM_PROMPT,
        conversationHistory: conversationHistory
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

/**
 * Generate code using OpenAI API
 */
export async function generateWithOpenAI(userMessage, conversationHistory = []) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: messages,
        max_tokens: 4000,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

/**
 * Parse files from AI response
 * Extracts <file path="...">content</file> tags
 */
export function parseFilesFromResponse(content) {
  const files = [];
  const fileRegex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
  
  let match;
  while ((match = fileRegex.exec(content)) !== null) {
    const [, path, content] = match;
    files.push({
      id: generateFileId(),
      path: path.trim(),
      name: path.split('/').pop(),
      content: content.trim(),
      type: 'file'
    });
  }
  
  return files;
}

/**
 * Convert flat file list to tree structure
 */
export function buildFileTree(files) {
  const root = [];
  
  files.forEach(file => {
    const parts = file.path.split('/');
    let currentLevel = root;
    
    // Build folder structure
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      let folder = currentLevel.find(item => item.name === folderName && item.type === 'folder');
      
      if (!folder) {
        folder = {
          id: generateFileId(),
          name: folderName,
          type: 'folder',
          children: []
        };
        currentLevel.push(folder);
      }
      
      currentLevel = folder.children;
    }
    
    // Add file
    currentLevel.push({
      ...file,
      name: parts[parts.length - 1]
    });
  });
  
  return root;
}

/**
 * Generate unique file ID
 */
function generateFileId() {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Stream AI response and parse incrementally
 */
export async function streamAIResponse(response, onChunk, onComplete, onError) {
  try {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            
            // Handle your API's progress format
            if (parsed.type === 'progress' && parsed.content) {
              const text = parsed.content;
              fullContent += text;
              onChunk(text, fullContent);
            }
            
            // Handle your API's complete format
            if (parsed.type === 'complete' && parsed.html) {
              fullContent = parsed.html;
              onChunk('', fullContent);
            }
            
            // Handle Claude direct response (fallback)
            if (parsed.type === 'content_block_delta') {
              const text = parsed.delta?.text || '';
              fullContent += text;
              onChunk(text, fullContent);
            }
            
            // Handle OpenAI response (fallback)
            if (parsed.choices?.[0]?.delta?.content) {
              const text = parsed.choices[0].delta.content;
              fullContent += text;
              onChunk(text, fullContent);
            }
          } catch (e) {
            console.error('JSON parse error:', e);
          }
        }
      }
    }
    
    // Parse files from complete response
    const files = parseFilesFromResponse(fullContent);
    const fileTree = buildFileTree(files);
    
    onComplete(fullContent, fileTree);
    
  } catch (error) {
    console.error('Stream error:', error);
    onError(error);
  }
}

/**
 * Main function to generate code
 */
export async function generateCode(userMessage, options = {}) {
  const {
    provider = 'claude', // 'claude' or 'openai'
    conversationHistory = [],
    onChunk,
    onComplete,
    onError
  } = options;
  
  try {
    let response;
    
    if (provider === 'claude' && ANTHROPIC_API_KEY) {
      response = await generateWithClaude(userMessage, conversationHistory);
    } else if (provider === 'openai' && OPENAI_API_KEY) {
      response = await generateWithOpenAI(userMessage, conversationHistory);
    } else {
      throw new Error('No API key configured. Please add REACT_APP_ANTHROPIC_API_KEY or REACT_APP_OPENAI_API_KEY to your .env file');
    }
    
    await streamAIResponse(response, onChunk, onComplete, onError);
    
  } catch (error) {
    console.error('Code generation error:', error);
    if (onError) onError(error);
    throw error;
  }
}

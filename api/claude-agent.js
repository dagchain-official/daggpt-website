/**
 * Vercel Serverless Function - Claude Agent with Tool Calling
 * Implements Bolt.new-style architecture: Claude uses tools to manipulate files
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Legacy handler for world-class-builder
async function handleLegacyRequest(req, res, apiKey) {
  const { action, prompt, maxTokens = 4096 } = req.body;
  
  try {
    console.log(`[Claude Agent] Legacy action: ${action}`);
    
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Claude API error: ${response.status} - ${error}`);
      return res.status(response.status).json({ error: `Claude API error: ${error}` });
    }

    const data = await response.json();
    const text = data.content[0].text;

    return res.status(200).json({ 
      success: true, 
      text,
      action 
    });

  } catch (error) {
    console.error('Legacy request error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Tool definitions
const TOOLS = [
  {
    name: 'create_files',
    description: 'Create new files in the project. Use this to scaffold new components, pages, or configuration files.',
    input_schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          description: 'Array of files to create',
          items: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'File path relative to project root (e.g., "src/components/Header.jsx")'
              },
              content: {
                type: 'string',
                description: 'Complete file content'
              }
            },
            required: ['path', 'content']
          }
        }
      },
      required: ['files']
    }
  },
  {
    name: 'update_files',
    description: 'Update existing files in the project. Use this to modify components, fix bugs, or refine code.',
    input_schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          description: 'Array of files to update',
          items: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'File path relative to project root'
              },
              content: {
                type: 'string',
                description: 'New complete file content'
              }
            },
            required: ['path', 'content']
          }
        }
      },
      required: ['files']
    }
  }
];

// System prompt
const SYSTEM_PROMPT = `You are an expert full-stack developer AI assistant working in a WebContainer environment.

**Your Role:**
- You can create and update files using the provided tools
- You must use tools instead of outputting code as plain text
- Think step-by-step and plan your approach before acting

**Project Structure:**
- React 18 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Lucide React for icons

**Best Practices:**
1. Always create complete, production-ready code
2. Use modern React patterns (hooks, functional components)
3. Include proper imports and exports
4. Add responsive design with Tailwind
5. Use semantic HTML and accessibility features
6. Add smooth animations with Framer Motion
7. Follow component composition patterns

**File Organization:**
- src/App.jsx - Main app component with routing
- src/components/ - Reusable components
- package.json - Dependencies
- vite.config.js - Vite configuration
- tailwind.config.js - Tailwind configuration

Remember: Use tools, not plain text output!`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, prompt, existingFiles = {}, maxTokens = 6000 } = req.body;
  const apiKey = process.env.REACT_APP_CLAUDE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Claude API key not configured' });
  }

  // Handle legacy world-class-builder requests
  if (action && action !== 'tool-based') {
    return handleLegacyRequest(req, res, apiKey);
  }

  try {
    console.log(`[Claude Agent] Processing tool-based request with ${Object.keys(existingFiles).length} existing files`);
    
    // Build context from existing files
    let contextMessage = prompt;
    if (Object.keys(existingFiles).length > 0) {
      contextMessage += '\n\n**Current Project Files:**\n';
      Object.keys(existingFiles).forEach(path => {
        contextMessage += `- ${path}\n`;
      });
    }

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages: [
          {
            role: 'user',
            content: contextMessage
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Claude API error: ${response.status} - ${error}`);
      return res.status(response.status).json({ error: `Claude API error: ${error}` });
    }

    const data = await response.json();
    
    // Extract tool calls and text
    const toolCalls = [];
    let textResponse = '';
    
    for (const content of data.content) {
      if (content.type === 'tool_use') {
        toolCalls.push({
          name: content.name,
          input: content.input
        });
      } else if (content.type === 'text') {
        textResponse += content.text;
      }
    }

    // Execute tool calls to build file structure
    const files = { ...existingFiles };
    const logs = [];
    
    for (const toolCall of toolCalls) {
      if (toolCall.name === 'create_files' || toolCall.name === 'update_files') {
        toolCall.input.files.forEach(file => {
          files[file.path] = file.content;
          logs.push(`${toolCall.name === 'create_files' ? '✅ Created' : '✏️ Updated'}: ${file.path}`);
        });
      }
    }

    return res.status(200).json({ 
      success: true,
      files,
      logs,
      message: textResponse,
      toolCalls: toolCalls.length,
      usage: data.usage
    });

  } catch (error) {
    console.error('Claude Agent error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Claude Tool Definitions for File Operations
 * Following Bolt.new's architecture: Claude uses tools instead of generating raw text
 */

/**
 * Tool schema for Claude API
 */
export const CLAUDE_TOOLS = [
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
  },
  {
    name: 'read_files',
    description: 'Read contents of specific files to understand current code before making changes.',
    input_schema: {
      type: 'object',
      properties: {
        paths: {
          type: 'array',
          description: 'Array of file paths to read',
          items: {
            type: 'string'
          }
        }
      },
      required: ['paths']
    }
  },
  {
    name: 'list_files',
    description: 'List all files in the project to understand the structure.',
    input_schema: {
      type: 'object',
      properties: {}
    }
  }
];

/**
 * System prompt for Claude as a coding agent
 */
export const AGENT_SYSTEM_PROMPT = `You are an expert full-stack developer AI assistant working in a WebContainer environment.

**Your Role:**
- You can create, read, and update files using the provided tools
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
- src/pages/ - Page components
- package.json - Dependencies
- vite.config.js - Vite configuration
- tailwind.config.js - Tailwind configuration

**When creating a new project:**
1. Use list_files to see what exists
2. Use create_files to scaffold the project structure
3. Ensure all files are complete and ready to run

**When modifying existing code:**
1. Use read_files to understand current implementation
2. Use update_files to make targeted changes
3. Ensure changes are compatible with existing code

Remember: Use tools, not plain text output!`;

/**
 * Execute tool calls from Claude
 */
export function executeToolCall(toolName, toolInput, currentFiles) {
  const result = { files: { ...currentFiles }, logs: [] };

  switch (toolName) {
    case 'create_files':
      toolInput.files.forEach(file => {
        result.files[file.path] = file.content;
        result.logs.push(`✅ Created: ${file.path}`);
      });
      break;

    case 'update_files':
      toolInput.files.forEach(file => {
        if (result.files[file.path]) {
          result.files[file.path] = file.content;
          result.logs.push(`✏️ Updated: ${file.path}`);
        } else {
          result.files[file.path] = file.content;
          result.logs.push(`✅ Created: ${file.path} (was missing)`);
        }
      });
      break;

    case 'read_files':
      const contents = {};
      toolInput.paths.forEach(path => {
        if (result.files[path]) {
          contents[path] = result.files[path];
          result.logs.push(`📖 Read: ${path}`);
        } else {
          result.logs.push(`⚠️ File not found: ${path}`);
        }
      });
      result.readContents = contents;
      break;

    case 'list_files':
      result.fileList = Object.keys(result.files);
      result.logs.push(`📁 Listed ${result.fileList.length} files`);
      break;

    default:
      result.logs.push(`❌ Unknown tool: ${toolName}`);
  }

  return result;
}

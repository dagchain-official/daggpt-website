## End-to-End Development Steps

This document provides a comprehensive guide for building a bolt.new clone from scratch. Follow these steps to recreate or extend the platform.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Design System Implementation](#2-design-system-implementation)
3. [Core Layout Structure](#3-core-layout-structure)
4. [Component Development](#4-component-development)
5. [State Management](#5-state-management)
6. [Adding Real Functionality](#6-adding-real-functionality)
7. [Deployment](#7-deployment)

---

## 1. Project Setup

### Step 1.1: Initialize the Project

```bash
# Create a new Vite project with React and TypeScript
npm create vite@latest bolt-clone -- --template react-ts

# Navigate to project directory
cd bolt-clone

# Install dependencies
npm install
```

### Step 1.2: Install Required Dependencies

```bash
# UI Framework & Styling
npm install tailwindcss postcss autoprefixer
npm install tailwindcss-animate
npm install class-variance-authority clsx tailwind-merge

# UI Components (shadcn/ui prerequisites)
npm install @radix-ui/react-slot
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tooltip

# Icons
npm install lucide-react

# Fonts
npm install @fontsource/inter @fontsource/jetbrains-mono

# Routing
npm install react-router-dom

# State Management (optional - for complex state)
npm install @tanstack/react-query
npm install zustand

# For real code editor (Phase 2)
npm install @monaco-editor/react

# For real-time features (Phase 2)
npm install socket.io-client
```

### Step 1.3: Configure Tailwind CSS

```bash
npx tailwindcss init -p
```

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        syntax: {
          keyword: "hsl(var(--syntax-keyword))",
          string: "hsl(var(--syntax-string))",
          function: "hsl(var(--syntax-function))",
          comment: "hsl(var(--syntax-comment))",
          variable: "hsl(var(--syntax-variable))",
          number: "hsl(var(--syntax-number))",
        },
      },
      // Add animations, keyframes, etc.
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### Step 1.4: Project Structure

Create the following folder structure:

```
src/
├── components/
│   ├── bolt/                    # Application-specific components
│   │   ├── Header.tsx
│   │   ├── FileExplorer.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── CodeEditor.tsx
│   │   ├── PreviewPanel.tsx
│   │   ├── Terminal.tsx
│   │   └── TabBar.tsx
│   └── ui/                      # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       └── ...
├── hooks/
│   ├── useChat.ts
│   ├── useFileSystem.ts
│   └── useTerminal.ts
├── services/
│   ├── ai.ts                    # AI API integration
│   ├── fileSystem.ts            # File operations
│   └── preview.ts               # Preview iframe communication
├── stores/
│   └── appStore.ts              # Global state (Zustand)
├── types/
│   └── index.ts                 # TypeScript interfaces
├── lib/
│   └── utils.ts                 # Utility functions
├── pages/
│   └── Index.tsx
├── index.css
├── App.tsx
└── main.tsx
```

---

## 2. Design System Implementation

### Step 2.1: Define CSS Variables

In `src/index.css`:

```css
@import url('@fontsource/jetbrains-mono/400.css');
@import url('@fontsource/inter/400.css');
@import url('@fontsource/inter/500.css');
@import url('@fontsource/inter/600.css');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Dark theme (default for IDE) */
    --background: 220 20% 6%;
    --foreground: 210 40% 98%;
    --card: 220 18% 10%;
    --card-foreground: 210 40% 98%;
    --primary: 210 100% 50%;
    --primary-foreground: 210 40% 98%;
    --secondary: 220 16% 14%;
    --secondary-foreground: 210 40% 90%;
    --muted: 220 14% 18%;
    --muted-foreground: 215 20% 55%;
    --accent: 190 95% 50%;
    --accent-foreground: 220 20% 6%;
    --border: 220 14% 18%;
    --input: 220 14% 18%;
    --ring: 210 100% 50%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 210 40% 98%;

    /* Syntax highlighting */
    --syntax-keyword: 280 80% 65%;
    --syntax-string: 120 60% 55%;
    --syntax-function: 35 100% 65%;
    --syntax-comment: 220 10% 45%;
    --syntax-variable: 190 90% 60%;
    --syntax-number: 30 100% 60%;

    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
  .font-mono {
    font-family: 'JetBrains Mono', monospace;
  }
}

@layer components {
  .glass {
    @apply bg-card/80 backdrop-blur-xl border border-border/50;
  }
  .gradient-text {
    background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted)) transparent;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: hsl(var(--muted));
    border-radius: 3px;
  }
}
```

### Step 2.2: Create Button Component with Variants

In `src/components/ui/button.tsx`:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary",
        outline: "border border-border bg-transparent hover:bg-secondary",
        glow: "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
        xs: "h-8 px-2.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};
```

---

## 3. Core Layout Structure

### Step 3.1: Main Application Layout

The layout consists of:
- **Header** (fixed top bar)
- **Sidebar** (collapsible left panel)
- **Main Content** (split view with code editor and preview)
- **Terminal** (bottom panel)

```
┌─────────────────────────────────────────────────────┐
│                      Header                          │
├────┬──────────────┬─────────────────────────────────┤
│Icon│              │                                 │
│Bar │   Side       │         Main Content            │
│    │   Panel      │    (Code Editor / Preview)      │
│    │  (Chat or    │                                 │
│    │   Files)     ├─────────────────────────────────┤
│    │              │           Terminal              │
└────┴──────────────┴─────────────────────────────────┘
```

### Step 3.2: Implement Layout in Index.tsx

```tsx
import { useState } from "react";
import { Header } from "@/components/bolt/Header";
import { FileExplorer } from "@/components/bolt/FileExplorer";
import { ChatPanel } from "@/components/bolt/ChatPanel";
import { CodeEditor } from "@/components/bolt/CodeEditor";
import { PreviewPanel } from "@/components/bolt/PreviewPanel";
import { Terminal } from "@/components/bolt/Terminal";
import { TabBar } from "@/components/bolt/TabBar";

type ActiveView = "code" | "preview" | "split";
type SidePanel = "chat" | "files" | null;

const Index = () => {
  const [activeView, setActiveView] = useState<ActiveView>("split");
  const [sidePanel, setSidePanel] = useState<SidePanel>("chat");

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Icon Bar */}
        <div className="w-12 bg-sidebar border-r border-border">
          {/* Icon buttons for chat/files */}
        </div>

        {/* Side Panel */}
        <div className={`transition-all duration-300 ${sidePanel ? 'w-80' : 'w-0'}`}>
          {sidePanel === "chat" && <ChatPanel />}
          {sidePanel === "files" && <FileExplorer />}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TabBar activeView={activeView} onViewChange={setActiveView} />
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div className={activeView === "preview" ? "w-0" : "flex-1"}>
              <CodeEditor />
            </div>
            {/* Preview */}
            <div className={activeView === "code" ? "w-0" : "flex-1"}>
              <PreviewPanel />
            </div>
          </div>
          <Terminal />
        </div>
      </div>
    </div>
  );
};
```

---

## 4. Component Development

### Step 4.1: Header Component

Key features:
- Logo with gradient
- Project selector dropdown
- Action buttons (Save, GitHub, Deploy)
- User menu

```tsx
// src/components/bolt/Header.tsx
export const Header = () => {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold">
          <span className="gradient-text">bolt</span>.new
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">Save</Button>
        <Button variant="glow" size="sm">Deploy</Button>
      </div>
    </header>
  );
};
```

### Step 4.2: File Explorer Component

Key features:
- Recursive tree structure
- Expand/collapse folders
- File type icons with color coding
- Click to open files

```tsx
// src/components/bolt/FileExplorer.tsx
interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  extension?: string;
}

const FileItem = ({ node, depth, onSelect }: FileItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button
        onClick={() => node.type === "folder" ? setIsOpen(!isOpen) : onSelect(node.name)}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-sm hover:bg-secondary/50"
      >
        {node.type === "folder" ? (
          isOpen ? <FolderOpen /> : <Folder />
        ) : (
          <File />
        )}
        <span>{node.name}</span>
      </button>
      {isOpen && node.children?.map(child => (
        <FileItem key={child.name} node={child} depth={depth + 1} onSelect={onSelect} />
      ))}
    </div>
  );
};
```

### Step 4.3: Chat Panel Component

Key features:
- Message list with user/assistant roles
- Code block detection and formatting
- Input with send button
- Typing indicator

```tsx
// src/components/bolt/ChatPanel.tsx
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Call AI API (see Phase 2)
    const response = await sendToAI(input);
    
    // Add AI response
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: response }]);
    setIsTyping(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe what you want to build..."
          className="w-full bg-secondary/50 rounded-lg px-4 py-3"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
};
```

### Step 4.4: Code Editor Component

For the prototype, we use basic syntax highlighting. For production, use Monaco Editor.

**Prototype Version:**
```tsx
// Basic syntax highlighting with regex
const tokenize = (line: string) => {
  // Match keywords, strings, functions, comments, etc.
  // Return array of tokens with type and value
};

export const CodeEditor = () => {
  const [code, setCode] = useState(defaultCode);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex">
        {/* Line numbers */}
        <div className="py-4 px-2 text-right bg-muted/30">
          {code.split('\n').map((_, i) => (
            <div key={i} className="text-xs text-muted-foreground">{i + 1}</div>
          ))}
        </div>
        {/* Code content */}
        <pre className="flex-1 p-4 overflow-auto">
          {/* Render highlighted code */}
        </pre>
      </div>
    </div>
  );
};
```

**Production Version (Monaco Editor):**
```tsx
import Editor from '@monaco-editor/react';

export const CodeEditor = () => {
  const [code, setCode] = useState(defaultCode);
  
  return (
    <Editor
      height="100%"
      language="typescript"
      theme="vs-dark"
      value={code}
      onChange={(value) => setCode(value || '')}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: 'JetBrains Mono',
        lineNumbers: 'on',
        automaticLayout: true,
      }}
    />
  );
};
```

### Step 4.5: Preview Panel Component

Key features:
- Iframe for live preview
- Responsive viewport toggles (desktop/tablet/mobile)
- Refresh button
- URL bar

```tsx
export const PreviewPanel = () => {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const viewStyles = {
    desktop: "w-full",
    tablet: "w-[768px] mx-auto",
    mobile: "w-[375px] mx-auto",
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">localhost:5173</span>
        <div className="flex gap-1">
          {/* Viewport toggle buttons */}
        </div>
      </div>
      
      {/* Preview */}
      <div className="flex-1 overflow-auto p-4 bg-muted/20">
        <div className={`h-full bg-card rounded-lg ${viewStyles[viewMode]}`}>
          <iframe
            ref={iframeRef}
            src="about:blank"
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};
```

### Step 4.6: Terminal Component

Key features:
- Log history with timestamps
- Color-coded log types (info, success, warning, error)
- Command input
- Minimize/maximize toggle

```tsx
interface LogEntry {
  id: string;
  type: "info" | "success" | "warning" | "error" | "command";
  message: string;
  timestamp: Date;
}

export const Terminal = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [command, setCommand] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    // Execute command and add to logs
  };

  return (
    <div className={`flex flex-col border-t border-border ${isMinimized ? 'h-10' : 'h-48'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-card">
        <span className="text-sm font-medium">Terminal</span>
        <button onClick={() => setIsMinimized(!isMinimized)}>
          <Minus className="w-4 h-4" />
        </button>
      </div>
      
      {!isMinimized && (
        <>
          {/* Logs */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
            {logs.map(log => (
              <div key={log.id} className={getLogColor(log.type)}>
                [{formatTime(log.timestamp)}] {log.message}
              </div>
            ))}
          </div>
          
          {/* Input */}
          <form onSubmit={handleCommand} className="flex items-center gap-2 px-3 py-2 border-t border-border">
            <ChevronRight className="w-4 h-4 text-primary" />
            <input
              value={command}
              onChange={e => setCommand(e.target.value)}
              className="flex-1 bg-transparent text-xs font-mono"
              placeholder="Enter command..."
            />
          </form>
        </>
      )}
    </div>
  );
};
```

---

## 5. State Management

### Step 5.1: Create Zustand Store

```tsx
// src/stores/appStore.ts
import { create } from 'zustand';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AppState {
  // File system
  files: FileNode[];
  activeFile: string | null;
  setActiveFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  
  // Chat
  messages: Message[];
  addMessage: (message: Message) => void;
  
  // UI state
  sidePanel: 'chat' | 'files' | null;
  setSidePanel: (panel: 'chat' | 'files' | null) => void;
  activeView: 'code' | 'preview' | 'split';
  setActiveView: (view: 'code' | 'preview' | 'split') => void;
}

export const useAppStore = create<AppState>((set) => ({
  files: [],
  activeFile: null,
  setActiveFile: (id) => set({ activeFile: id }),
  updateFileContent: (id, content) => set((state) => ({
    files: updateNestedFile(state.files, id, content)
  })),
  
  messages: [],
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  sidePanel: 'chat',
  setSidePanel: (panel) => set({ sidePanel: panel }),
  activeView: 'split',
  setActiveView: (view) => set({ activeView: view }),
}));
```

### Step 5.2: Use Store in Components

```tsx
// In ChatPanel.tsx
import { useAppStore } from '@/stores/appStore';

export const ChatPanel = () => {
  const { messages, addMessage } = useAppStore();
  // ... use in component
};
```

---

## 6. Adding Real Functionality

### Step 6.1: AI Integration

**Option A: OpenAI API**

```tsx
// src/services/ai.ts
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

export const sendToAI = async (message: string, context: string = "") => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert web developer. Generate clean, modern React code with TypeScript and Tailwind CSS. Current project context: ${context}`
        },
        { role: 'user', content: message }
      ],
      stream: true, // For streaming responses
    }),
  });

  return response;
};
```

**Option B: Anthropic Claude API**

```tsx
export const sendToClaude = async (message: string) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: message }],
    }),
  });
  
  return response.json();
};
```

### Step 6.2: WebContainer Integration (Real Code Execution)

Use StackBlitz's WebContainers for in-browser Node.js runtime:

```tsx
// src/services/webcontainer.ts
import { WebContainer } from '@webcontainer/api';

let webcontainer: WebContainer;

export const bootWebContainer = async () => {
  webcontainer = await WebContainer.boot();
  return webcontainer;
};

export const writeFiles = async (files: Record<string, string>) => {
  for (const [path, content] of Object.entries(files)) {
    await webcontainer.fs.writeFile(path, content);
  }
};

export const runCommand = async (command: string, args: string[]) => {
  const process = await webcontainer.spawn(command, args);
  
  process.output.pipeTo(new WritableStream({
    write(data) {
      // Stream output to terminal
      console.log(data);
    }
  }));
  
  return process.exit;
};

export const startDevServer = async () => {
  await runCommand('npm', ['install']);
  await runCommand('npm', ['run', 'dev']);
  
  webcontainer.on('server-ready', (port, url) => {
    // Update preview iframe with URL
    console.log(`Dev server ready at ${url}`);
  });
};
```

### Step 6.3: Real-time Preview Updates

```tsx
// src/hooks/usePreview.ts
import { useEffect, useRef } from 'react';

export const usePreview = (code: string) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Method 1: Direct HTML injection (for simple previews)
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <div id="root"></div>
          <script type="module">
            import React from 'https://esm.sh/react@18';
            import ReactDOM from 'https://esm.sh/react-dom@18/client';
            
            ${code}
            
            ReactDOM.createRoot(document.getElementById('root')).render(
              React.createElement(App)
            );
          </script>
        </body>
      </html>
    `;
    
    iframe.srcdoc = html;
  }, [code]);

  return iframeRef;
};
```

### Step 6.4: File System with IndexedDB

```tsx
// src/services/fileSystem.ts
import { openDB, DBSchema } from 'idb';

interface ProjectDB extends DBSchema {
  files: {
    key: string;
    value: {
      id: string;
      name: string;
      path: string;
      content: string;
      type: 'file' | 'folder';
    };
  };
  projects: {
    key: string;
    value: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}

const dbPromise = openDB<ProjectDB>('bolt-clone', 1, {
  upgrade(db) {
    db.createObjectStore('files', { keyPath: 'id' });
    db.createObjectStore('projects', { keyPath: 'id' });
  },
});

export const saveFile = async (file: ProjectDB['files']['value']) => {
  const db = await dbPromise;
  await db.put('files', file);
};

export const getFile = async (id: string) => {
  const db = await dbPromise;
  return db.get('files', id);
};

export const getAllFiles = async () => {
  const db = await dbPromise;
  return db.getAll('files');
};
```

### Step 6.5: GitHub Integration

```tsx
// src/services/github.ts
import { Octokit } from '@octokit/rest';

export const createGitHubService = (token: string) => {
  const octokit = new Octokit({ auth: token });
  
  return {
    async createRepo(name: string, isPrivate: boolean = false) {
      const { data } = await octokit.repos.createForAuthenticatedUser({
        name,
        private: isPrivate,
        auto_init: true,
      });
      return data;
    },
    
    async pushFiles(owner: string, repo: string, files: Record<string, string>, message: string) {
      // Get current commit SHA
      const { data: ref } = await octokit.git.getRef({
        owner,
        repo,
        ref: 'heads/main',
      });
      
      // Create blobs for each file
      const blobs = await Promise.all(
        Object.entries(files).map(async ([path, content]) => {
          const { data } = await octokit.git.createBlob({
            owner,
            repo,
            content: Buffer.from(content).toString('base64'),
            encoding: 'base64',
          });
          return { path, sha: data.sha };
        })
      );
      
      // Create tree
      const { data: tree } = await octokit.git.createTree({
        owner,
        repo,
        base_tree: ref.object.sha,
        tree: blobs.map(({ path, sha }) => ({
          path,
          mode: '100644',
          type: 'blob',
          sha,
        })),
      });
      
      // Create commit
      const { data: commit } = await octokit.git.createCommit({
        owner,
        repo,
        message,
        tree: tree.sha,
        parents: [ref.object.sha],
      });
      
      // Update ref
      await octokit.git.updateRef({
        owner,
        repo,
        ref: 'heads/main',
        sha: commit.sha,
      });
    },
  };
};
```

### Step 6.6: Deployment Integration

**Vercel Deployment:**
```tsx
// src/services/deploy.ts
export const deployToVercel = async (files: Record<string, string>, token: string) => {
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'my-bolt-project',
      files: Object.entries(files).map(([file, data]) => ({
        file,
        data,
      })),
    }),
  });
  
  const deployment = await response.json();
  return deployment.url;
};
```

---

## 7. Deployment

### Step 7.1: Environment Variables

Create `.env` file:
```env
VITE_OPENAI_API_KEY=your_openai_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_GITHUB_CLIENT_ID=your_github_oauth_id
VITE_VERCEL_TOKEN=your_vercel_token
```

### Step 7.2: Build for Production

```bash
npm run build
```

### Step 7.3: Deploy Options

**Option A: Vercel**
```bash
npm i -g vercel
vercel
```

**Option B: Netlify**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

**Option C: Docker**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Summary Checklist

- [ ] Project initialized with Vite + React + TypeScript
- [ ] Tailwind CSS configured with design tokens
- [ ] Component library created (Button, Input, etc.)
- [ ] Layout structure implemented
- [ ] File Explorer component
- [ ] Chat Panel with message rendering
- [ ] Code Editor (Monaco integration)
- [ ] Preview Panel with iframe
- [ ] Terminal component
- [ ] State management (Zustand)
- [ ] AI API integration (OpenAI/Claude)
- [ ] WebContainer for code execution
- [ ] IndexedDB for persistence
- [ ] GitHub integration
- [ ] Deployment pipeline

---

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [WebContainers](https://webcontainers.io/)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
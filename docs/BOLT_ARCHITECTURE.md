# 🏗️ Bolt.new Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      BoltHeader                          │  │
│  │  [Logo] [Project Name] [Save] [GitHub] [Deploy]         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌────┬──────────────┬──────────────────────────────────────┐  │
│  │    │              │                                      │  │
│  │ S  │   Side       │         Main Content                │  │
│  │ i  │   Panel      │                                      │  │
│  │ d  │              │  ┌────────────────────────────────┐  │  │
│  │ e  │  ┌────────┐  │  │        BoltTabBar              │  │  │
│  │ b  │  │        │  │  │  [Code] [Split] [Preview]      │  │  │
│  │ a  │  │ Chat   │  │  └────────────────────────────────┘  │  │
│  │ r  │  │   or   │  │                                      │  │
│  │    │  │ Files  │  │  ┌──────────┬───────────────────┐   │  │
│  │ [💬]│  │        │  │  │          │                   │   │  │
│  │ [📁]│  │        │  │  │  Code    │     Preview       │   │  │
│  │    │  │        │  │  │  Editor  │     Panel         │   │  │
│  │    │  │        │  │  │          │                   │   │  │
│  │    │  └────────┘  │  └──────────┴───────────────────┘   │  │
│  │    │              │                                      │  │
│  │    │              │  ┌────────────────────────────────┐  │  │
│  │    │              │  │         Terminal               │  │  │
│  │    │              │  │  [Logs and Command Input]      │  │  │
│  │    │              │  └────────────────────────────────┘  │  │
│  └────┴──────────────┴──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
┌──────────────┐
│   User Input │
│  "Build app" │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│   BoltChatPanel      │
│  - Captures input    │
│  - Shows messages    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│    boltAI.js         │
│  - Calls Claude API  │
│  - Streams response  │
│  - Parses files      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   File Parser        │
│  - Extracts <file>   │
│  - Builds tree       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   boltStore          │
│  - Updates files     │
│  - Sets active file  │
└──────┬───────────────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│ FileExplorer │    │  boltWebContainer│
│ - Shows tree │    │  - Boots WC      │
│ - Navigate   │    │  - Writes files  │
└──────────────┘    │  - npm install   │
                    │  - Start server  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Preview URL     │
                    │  Generated       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  PreviewPanel    │
                    │  Shows iframe    │
                    └──────────────────┘
```

---

## Component Hierarchy

```
BoltWebsiteBuilder (Main Container)
│
├── BoltHeader
│   ├── Logo
│   ├── Project Name
│   └── Action Buttons
│
├── BoltSidebar
│   ├── Chat Icon
│   ├── Files Icon
│   └── Close Button
│
├── Side Panel (Conditional)
│   ├── BoltChatPanel
│   │   ├── Message List
│   │   ├── Streaming Content
│   │   ├── Typing Indicator
│   │   └── Input Form
│   │
│   └── BoltFileExplorer
│       └── FileTreeItem (Recursive)
│           ├── Folder Icon
│           ├── File Icon
│           └── Children
│
└── Main Content
    ├── BoltTabBar
    │   ├── Code Button
    │   ├── Split Button
    │   └── Preview Button
    │
    ├── Split View
    │   ├── BoltCodeEditor
    │   │   ├── File Name Bar
    │   │   └── Monaco Editor
    │   │
    │   └── BoltPreviewPanel
    │       ├── Toolbar
    │       │   ├── URL Bar
    │       │   └── Viewport Toggles
    │       └── Preview Iframe
    │
    └── BoltTerminal
        ├── Header
        ├── Logs Container
        └── Command Input
```

---

## State Management (Zustand)

```
boltStore
│
├── File System
│   ├── files: []
│   ├── activeFile: null
│   ├── setFiles()
│   ├── setActiveFile()
│   ├── updateFileContent()
│   ├── addFile()
│   └── deleteFile()
│
├── Chat
│   ├── messages: []
│   ├── isTyping: false
│   ├── addMessage()
│   ├── setIsTyping()
│   └── clearMessages()
│
├── Terminal
│   ├── logs: []
│   ├── isTerminalMinimized: false
│   ├── addLog()
│   ├── clearLogs()
│   └── setTerminalMinimized()
│
├── UI State
│   ├── sidePanel: 'chat'
│   ├── activeView: 'split'
│   ├── previewMode: 'desktop'
│   ├── setSidePanel()
│   ├── setActiveView()
│   └── setPreviewMode()
│
├── Project
│   ├── projectName: 'Untitled'
│   ├── projectId: null
│   ├── isGenerating: false
│   ├── setProjectName()
│   ├── setProjectId()
│   └── setIsGenerating()
│
└── Preview
    ├── previewUrl: null
    └── setPreviewUrl()
```

---

## AI Service Flow

```
generateCode(userMessage, options)
│
├── Build conversation history
│
├── Call AI API (Claude or OpenAI)
│   │
│   ├── Claude: anthropic.com/v1/messages
│   │   └── Stream: true
│   │
│   └── OpenAI: openai.com/v1/chat/completions
│       └── Stream: true
│
├── Stream Response
│   │
│   ├── onChunk(text, fullContent)
│   │   └── Update UI with streaming text
│   │
│   ├── Parse Files
│   │   └── Extract <file path="...">content</file>
│   │
│   └── Build File Tree
│       └── Convert flat list to nested structure
│
└── onComplete(fullContent, fileTree)
    └── Update store with files
```

---

## WebContainer Flow

```
setupAndRunProject(files, onLog, onPreviewReady)
│
├── 1. Boot WebContainer
│   └── WebContainer.boot()
│
├── 2. Write Files
│   └── container.mount(fileTree)
│
├── 3. Install Dependencies
│   ├── container.spawn('npm', ['install'])
│   └── Stream output to terminal
│
├── 4. Start Dev Server
│   ├── container.spawn('npm', ['run', 'dev'])
│   └── Listen for 'server-ready' event
│
└── 5. Preview Ready
    └── onPreviewReady(url)
        └── Update preview panel
```

---

## File Structure Format

```javascript
// AI generates this:
<file path="package.json">
{ "name": "app" }
</file>

<file path="src/App.jsx">
import React from 'react';
export default function App() {
  return <div>Hello</div>;
}
</file>

// Parsed into:
[
  {
    id: "file_123",
    name: "package.json",
    type: "file",
    content: "{ \"name\": \"app\" }"
  },
  {
    id: "folder_456",
    name: "src",
    type: "folder",
    children: [
      {
        id: "file_789",
        name: "App.jsx",
        type: "file",
        content: "import React..."
      }
    ]
  }
]

// Displayed as:
📁 project-root
  📄 package.json
  📁 src
    📄 App.jsx
```

---

## API Integration

```
┌─────────────────┐
│  User Prompt    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  REACT_APP_ANTHROPIC_API_KEY│
│  or                         │
│  REACT_APP_OPENAI_API_KEY   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  API Request                │
│  - Model: claude-3.5-sonnet │
│  - Stream: true             │
│  - System: SYSTEM_PROMPT    │
│  - Messages: history        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Streaming Response         │
│  data: {"type": "content.."}│
│  data: {"delta": {"text"..}}│
│  data: [DONE]               │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Parse & Display            │
│  - Show in chat             │
│  - Extract files            │
│  - Update file tree         │
└─────────────────────────────┘
```

---

## Technology Stack

```
Frontend Framework
└── React 18.2.0

State Management
└── Zustand

Code Editor
└── Monaco Editor (@monaco-editor/react)

Code Execution
└── WebContainers (@webcontainer/api)

AI Integration
├── Anthropic Claude API
└── OpenAI API

Styling
└── Tailwind CSS

Icons
└── Lucide React

Build Tool
└── Create React App

Deployment
└── Vercel
```

---

## Security Layers

```
1. Environment Variables
   └── API keys never in code

2. WebContainer Sandbox
   └── Isolated execution environment

3. Iframe Sandbox
   └── Preview runs in sandboxed iframe

4. API Rate Limiting
   └── Handled by provider

5. CORS Protection
   └── API calls from authorized domain
```

---

This architecture provides:
- ✅ **Separation of concerns**
- ✅ **Scalable state management**
- ✅ **Secure execution**
- ✅ **Real-time updates**
- ✅ **Professional UX**

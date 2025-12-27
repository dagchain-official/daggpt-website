# Bolt.new Website Builder - Rebuild Progress

## ✅ Completed Components

### 1. Core Structure
- ✅ **BoltWebsiteBuilder.js** - Main container with layout
- ✅ **boltStore.js** - Zustand state management
- ✅ **BoltHeader.js** - Top navigation bar with logo and actions
- ✅ **BoltSidebar.js** - Icon bar for panel switching
- ✅ **BoltChatPanel.js** - AI chat interface

### 2. Dependencies Installed
- ✅ zustand
- ✅ @radix-ui/react-slot
- ✅ @radix-ui/react-dialog
- ✅ @radix-ui/react-dropdown-menu
- ✅ @radix-ui/react-tooltip
- ✅ class-variance-authority

## 🚧 In Progress

### Components to Create:
- [ ] **BoltFileExplorer.js** - Tree view of project files
- [ ] **BoltCodeEditor.js** - Monaco editor integration
- [ ] **BoltPreviewPanel.js** - Live preview with iframe
- [ ] **BoltTerminal.js** - Terminal with logs
- [ ] **BoltTabBar.js** - View switcher (Code/Preview/Split)

### Features to Implement:
- [ ] AI Integration (Claude/OpenAI)
- [ ] WebContainer for code execution
- [ ] File system operations
- [ ] Real-time preview updates
- [ ] GitHub integration
- [ ] Deployment to Vercel/Netlify
- [ ] User-specific session storage

## 📋 Architecture

```
src/
├── components/
│   └── bolt/
│       ├── BoltWebsiteBuilder.js      ✅ Main container
│       ├── BoltHeader.js              ✅ Top bar
│       ├── BoltSidebar.js             ✅ Icon bar
│       ├── BoltChatPanel.js           ✅ AI chat
│       ├── BoltFileExplorer.js        🚧 File tree
│       ├── BoltCodeEditor.js          🚧 Monaco editor
│       ├── BoltPreviewPanel.js        🚧 Live preview
│       ├── BoltTerminal.js            🚧 Terminal
│       └── BoltTabBar.js              🚧 View switcher
├── stores/
│   └── boltStore.js                   ✅ Global state
└── services/
    ├── boltAI.js                      ⏳ AI integration
    ├── boltWebContainer.js            ⏳ Code execution
    └── boltFileSystem.js              ⏳ File operations
```

## 🎨 Design System

Following bolt.new's dark theme:
- Background: `#0d1117`
- Card: `#161b22`
- Border: `#30363d`
- Text: `#c9d1d9`
- Muted: `#8b949e`
- Primary: `#2188ff`
- Accent: `#58a6ff`

## 🔄 Next Steps

1. Create remaining UI components
2. Integrate Monaco Editor
3. Setup WebContainer
4. Connect AI API
5. Implement file operations
6. Add preview functionality
7. Setup deployment pipeline

## 📝 Notes

- Using React (not TypeScript) for compatibility with existing codebase
- Zustand for state management (simpler than Redux)
- Monaco Editor for code editing
- WebContainer for in-browser Node.js runtime
- Supabase for user-specific session storage

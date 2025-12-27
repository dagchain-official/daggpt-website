/**
 * Bolt Store - Global State Management with Zustand
 * Manages files, messages, UI state, and more
 */

import { create } from 'zustand';

export const useBoltStore = create((set, get) => ({
  // ==================== FILE SYSTEM ====================
  files: [],
  activeFile: null,
  
  setFiles: (files) => {
    set({ files });
    // Auto-select first file
    if (files.length > 0) {
      const firstFile = findFirstFile(files);
      if (firstFile) {
        set({ activeFile: firstFile.id });
      }
    }
  },
  
  setActiveFile: (fileId) => set({ activeFile: fileId }),
  
  updateFileContent: (fileId, content) => set((state) => ({
    files: updateNestedFile(state.files, fileId, content)
  })),
  
  addFile: (file) => set((state) => ({
    files: [...state.files, file]
  })),
  
  deleteFile: (fileId) => set((state) => ({
    files: state.files.filter(f => f.id !== fileId)
  })),
  
  // ==================== CHAT ====================
  messages: [],
  isTyping: false,
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...message
    }]
  })),
  
  setIsTyping: (isTyping) => set({ isTyping }),
  
  clearMessages: () => set({ messages: [] }),
  
  // ==================== TERMINAL ====================
  logs: [],
  isTerminalMinimized: false,
  
  addLog: (log) => set((state) => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...log
    };
    
    // Keep only last 50 logs to prevent memory issues
    const newLogs = [...state.logs, newLog];
    if (newLogs.length > 50) {
      newLogs.shift(); // Remove oldest log
    }
    
    return { logs: newLogs };
  }),
  
  clearLogs: () => set({ logs: [] }),
  
  setTerminalMinimized: (isMinimized) => set({ isTerminalMinimized: isMinimized }),
  
  // ==================== UI STATE ====================
  sidePanel: 'chat', // 'chat' | 'files' | null
  activeView: 'split', // 'code' | 'preview' | 'split'
  previewMode: 'desktop', // 'desktop' | 'tablet' | 'mobile'
  
  setSidePanel: (panel) => set({ sidePanel: panel }),
  
  setActiveView: (view) => set({ activeView: view }),
  
  setPreviewMode: (mode) => set({ previewMode: mode }),
  
  // ==================== PROJECT ====================
  projectName: 'Untitled Project',
  projectId: null,
  isGenerating: false,
  
  setProjectName: (name) => set({ projectName: name }),
  
  setProjectId: (id) => set({ projectId: id }),
  
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  
  // ==================== PREVIEW ====================
  previewUrl: null,
  
  setPreviewUrl: (url) => set({ previewUrl: url }),
}));

// Helper function to update nested file structure
function updateNestedFile(files, fileId, content) {
  return files.map(file => {
    if (file.id === fileId) {
      return { ...file, content };
    }
    if (file.children) {
      return {
        ...file,
        children: updateNestedFile(file.children, fileId, content)
      };
    }
    return file;
  });
}

// Helper function to find first file in tree
function findFirstFile(files) {
  for (const file of files) {
    if (file.type === 'file') return file;
    if (file.children) {
      const found = findFirstFile(file.children);
      if (found) return found;
    }
  }
  return null;
}

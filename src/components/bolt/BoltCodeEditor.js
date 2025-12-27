/**
 * Bolt Code Editor Component
 * Monaco Editor integration for code editing
 */

import React from 'react';
import Editor from '@monaco-editor/react';
import { useBoltStore } from '../../stores/boltStore';
import { Code } from 'lucide-react';

const BoltCodeEditor = () => {
  const { files, activeFile, updateFileContent } = useBoltStore();
  
  // Find the active file
  const currentFile = findFileById(files, activeFile);
  
  const handleEditorChange = (value) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile, value);
    }
  };
  
  if (!currentFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] text-center px-4">
        <Code className="w-16 h-16 text-[#8b949e] mb-4" />
        <h3 className="text-lg font-semibold text-[#c9d1d9] mb-2">
          No file selected
        </h3>
        <p className="text-sm text-[#8b949e]">
          Select a file from the explorer or start a chat to generate code
        </p>
      </div>
    );
  }
  
  // Determine language from file extension
  const getLanguage = (filename) => {
    const ext = filename.split('.').pop();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
    };
    return languageMap[ext] || 'plaintext';
  };
  
  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* File Name Bar */}
      <div className="h-10 px-4 flex items-center border-b border-[#30363d] bg-[#161b22]">
        <span className="text-sm text-[#c9d1d9]">{currentFile.name}</span>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(currentFile.name)}
          theme="vs-dark"
          value={currentFile.content || ''}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            lineNumbers: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
};

// Helper function to find file by ID in nested structure
function findFileById(files, id) {
  for (const file of files) {
    if (file.id === id) return file;
    if (file.children) {
      const found = findFileById(file.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default BoltCodeEditor;

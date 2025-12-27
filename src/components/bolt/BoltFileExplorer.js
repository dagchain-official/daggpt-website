/**
 * Bolt File Explorer Component
 * Tree view of project files and folders
 */

import React, { useState } from 'react';
import { Folder, FolderOpen, File, ChevronRight, ChevronDown } from 'lucide-react';
import { useBoltStore } from '../../stores/boltStore';

const BoltFileExplorer = () => {
  const { files, activeFile, setActiveFile } = useBoltStore();
  
  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#30363d]">
        <h2 className="text-sm font-semibold text-[#c9d1d9]">Files</h2>
      </div>
      
      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Folder className="w-12 h-12 text-[#8b949e] mb-3" />
            <p className="text-sm text-[#8b949e]">
              No files yet. Start a chat to generate your project!
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {files.map((file) => (
              <FileTreeItem
                key={file.id}
                file={file}
                depth={0}
                activeFile={activeFile}
                onSelect={setActiveFile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// File Tree Item Component
const FileTreeItem = ({ file, depth, activeFile, onSelect }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = file.type === 'folder';
  const isActive = !isFolder && activeFile === file.id;
  
  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) {
            setIsOpen(!isOpen);
          } else {
            onSelect(file.id);
          }
        }}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className={`w-full flex items-center gap-1.5 px-2 py-1 text-sm rounded transition-colors ${
          isActive
            ? 'bg-[#2188ff] text-white'
            : 'text-[#c9d1d9] hover:bg-[#21262d]'
        }`}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 flex-shrink-0 text-[#58a6ff]" />
            ) : (
              <Folder className="w-4 h-4 flex-shrink-0 text-[#58a6ff]" />
            )}
          </>
        ) : (
          <>
            <div className="w-3.5" />
            <File className="w-4 h-4 flex-shrink-0 text-[#8b949e]" />
          </>
        )}
        <span className="truncate">{file.name}</span>
      </button>
      
      {isFolder && isOpen && file.children && (
        <div>
          {file.children.map((child) => (
            <FileTreeItem
              key={child.id}
              file={child}
              depth={depth + 1}
              activeFile={activeFile}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BoltFileExplorer;

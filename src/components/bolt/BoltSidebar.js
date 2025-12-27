/**
 * Bolt Sidebar Component
 * Icon bar for switching between chat and file explorer
 */

import React from 'react';
import { MessageSquare, FolderTree, X } from 'lucide-react';

const BoltSidebar = ({ activePanel, onPanelChange }) => {
  const iconButtons = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'files', icon: FolderTree, label: 'Files' },
  ];
  
  return (
    <div className="w-12 bg-[#0d1117] border-r border-[#30363d] flex flex-col items-center py-2 gap-1">
      {iconButtons.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onPanelChange(activePanel === id ? null : id)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
            activePanel === id
              ? 'bg-[#2188ff] text-white shadow-lg shadow-[#2188ff]/30'
              : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
          }`}
          title={label}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
      
      {activePanel && (
        <button
          onClick={() => onPanelChange(null)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9] transition-all mt-auto"
          title="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default BoltSidebar;

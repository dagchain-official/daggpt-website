/**
 * Bolt Tab Bar Component
 * View switcher for Code / Preview / Split views
 */

import React from 'react';
import { Code, Eye, Columns } from 'lucide-react';

const BoltTabBar = ({ activeView, onViewChange }) => {
  const views = [
    { id: 'code', icon: Code, label: 'Code' },
    { id: 'split', icon: Columns, label: 'Split' },
    { id: 'preview', icon: Eye, label: 'Preview' },
  ];
  
  return (
    <div className="h-10 px-4 flex items-center gap-1 border-b border-[#30363d] bg-[#161b22]">
      {views.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          className={`h-7 px-3 flex items-center gap-2 text-xs font-medium rounded transition-colors ${
            activeView === id
              ? 'bg-[#2188ff] text-white'
              : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default BoltTabBar;

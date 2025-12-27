/**
 * DAGGPT AI Website Builder
 * Professional AI-powered website builder
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBoltStore } from '../../stores/boltStore';
import BoltHeader from './BoltHeader';
import BoltSidebar from './BoltSidebar';
import BoltChatPanel from './BoltChatPanel';
import BoltFileExplorer from './BoltFileExplorer';
import BoltCodeEditor from './BoltCodeEditor';
import BoltPreviewPanel from './BoltPreviewPanel';
import BoltTerminal from './BoltTerminal';
import BoltTabBar from './BoltTabBar';

const DAGGPTWebsiteBuilder = ({ isWebApp = false }) => {
  const { currentUser } = useAuth();
  const { sidePanel, setSidePanel, activeView, setActiveView } = useBoltStore();
  
  return (
    <div className="h-screen flex flex-col bg-[#0d1117] overflow-hidden">
      {/* Header */}
      <BoltHeader isWebApp={isWebApp} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Icon Sidebar */}
        <BoltSidebar 
          activePanel={sidePanel}
          onPanelChange={setSidePanel}
        />
        
        {/* Side Panel (Chat or Files) */}
        <div 
          className={`transition-all duration-300 ease-in-out ${
            sidePanel ? 'w-80' : 'w-0'
          } overflow-hidden border-r border-[#30363d]`}
        >
          {sidePanel === 'chat' && <BoltChatPanel isWebApp={isWebApp} />}
          {sidePanel === 'files' && <BoltFileExplorer />}
        </div>
        
        {/* Main Content (Code Editor + Preview) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <BoltTabBar 
            activeView={activeView}
            onViewChange={setActiveView}
          />
          
          {/* Editor + Preview Split View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            <div 
              className={`transition-all duration-300 ${
                activeView === 'preview' ? 'w-0' : activeView === 'split' ? 'w-1/2' : 'w-full'
              } overflow-hidden`}
            >
              <BoltCodeEditor />
            </div>
            
            {/* Preview Panel */}
            <div 
              className={`transition-all duration-300 ${
                activeView === 'code' ? 'w-0' : activeView === 'split' ? 'w-1/2' : 'w-full'
              } overflow-hidden border-l border-[#30363d]`}
            >
              <BoltPreviewPanel />
            </div>
          </div>
          
          {/* Terminal */}
          <BoltTerminal />
        </div>
      </div>
    </div>
  );
};

export default DAGGPTWebsiteBuilder;

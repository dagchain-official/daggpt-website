/**
 * DAGGPT Website Builder Header
 * Top navigation bar with logo and actions
 */

import React from 'react';
import { Sparkles, Save, Github, Rocket, Settings } from 'lucide-react';
import { useBoltStore } from '../../stores/boltStore';

const BoltHeader = ({ isWebApp = false }) => {
  const { projectName, isGenerating } = useBoltStore();
  
  const handleSave = () => {
    console.log('Save project');
    // TODO: Implement save functionality
  };
  
  const handleDeploy = () => {
    console.log('Deploy project');
    // TODO: Implement deployment
  };
  
  const handleGitHub = () => {
    console.log('Push to GitHub');
    // TODO: Implement GitHub integration
  };
  
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              DAGGPT
            </span>
          </span>
          <span className="text-sm text-gray-500 font-medium">
            {isWebApp ? 'AI Web App Builder' : 'AI Website Builder'}
          </span>
        </div>
      </div>
      
      {/* Project Name */}
      <div className="flex-1 flex items-center justify-center">
        <div className="px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
          <span className="text-sm text-gray-700 font-medium">{projectName}</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="h-9 px-3 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isGenerating}
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
        
        <button
          onClick={handleGitHub}
          className="h-9 px-3 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isGenerating}
        >
          <Github className="w-4 h-4" />
          <span>GitHub</span>
        </button>
        
        <button
          onClick={handleDeploy}
          className="h-9 px-4 flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:opacity-90 rounded-lg transition-all shadow-lg shadow-indigo-500/30"
          disabled={isGenerating}
        >
          <Rocket className="w-4 h-4" />
          <span>Deploy</span>
        </button>
        
        <button
          className="h-9 w-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default BoltHeader;

/**
 * Bolt Preview Panel Component
 * Live preview with responsive viewport toggles
 */

import React, { useRef, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, RotateCcw, ExternalLink } from 'lucide-react';
import { useBoltStore } from '../../stores/boltStore';

const BoltPreviewPanel = () => {
  const { previewMode, setPreviewMode, previewUrl } = useBoltStore();
  const iframeRef = useRef(null);
  
  const viewportSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };
  
  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };
  
  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Toolbar */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[#30363d] bg-[#161b22]">
        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-[#8b949e]">
            {previewUrl || 'localhost:5173'}
          </span>
        </div>
        
        {/* Viewport Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
              previewMode === 'desktop'
                ? 'bg-[#2188ff] text-white'
                : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
            }`}
            title="Desktop view"
          >
            <Monitor className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setPreviewMode('tablet')}
            className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
              previewMode === 'tablet'
                ? 'bg-[#2188ff] text-white'
                : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
            }`}
            title="Tablet view"
          >
            <Tablet className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
              previewMode === 'mobile'
                ? 'bg-[#2188ff] text-white'
                : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
            }`}
            title="Mobile view"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          
          <div className="w-px h-5 bg-[#30363d] mx-1" />
          
          <button
            onClick={handleRefresh}
            className="h-7 w-7 flex items-center justify-center rounded text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9] transition-colors"
            title="Refresh"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleOpenExternal}
            className="h-7 w-7 flex items-center justify-center rounded text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9] transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Preview */}
      <div className="flex-1 overflow-auto p-4 bg-[#161b22]">
        <div className={`h-full bg-white rounded-lg shadow-2xl mx-auto transition-all ${viewportSizes[previewMode]}`}>
          {previewUrl ? (
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full rounded-lg"
              sandbox="allow-scripts allow-same-origin allow-forms"
              title="Preview"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#0d1117] flex items-center justify-center mb-4">
                <Monitor className="w-8 h-8 text-[#8b949e]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0d1117] mb-2">
                Building Your Website
              </h3>
              <p className="text-sm text-[#6e7781]">
                DAGGPT is generating Code, Please wait for the magic to happen !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoltPreviewPanel;

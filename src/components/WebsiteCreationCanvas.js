import React, { useState } from 'react';
import MultiFileProjectViewer from './MultiFileProjectViewer';

const WebsiteCreationCanvas = ({ isGenerating, generatedWebsite }) => {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  // Check if it's a multi-file project
  if (generatedWebsite && generatedWebsite.isMultiFile) {
    return <MultiFileProjectViewer project={generatedWebsite} />;
  }

  // Process HTML to prevent navigation issues
  const getProcessedHTML = () => {
    if (!generatedWebsite) return '';
    
    // Handle legacy single HTML format
    const html = generatedWebsite.html || generatedWebsite;
    
    let processedHTML = html;
    
    // Add base tag to prevent navigation issues
    const baseTag = '<base target="_self">';
    
    // Insert base tag after <head> tag
    if (processedHTML.includes('<head>')) {
      processedHTML = processedHTML.replace('<head>', `<head>\n${baseTag}`);
    } else if (processedHTML.includes('<HEAD>')) {
      processedHTML = processedHTML.replace('<HEAD>', `<HEAD>\n${baseTag}`);
    } else {
      // If no head tag, add it
      processedHTML = `<!DOCTYPE html><html><head>${baseTag}</head><body>${processedHTML}</body></html>`;
    }
    
    // Add script to handle all link clicks within iframe and ensure full content display
    const navigationScript = `
    <style>
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: auto !important;
        min-height: 100vh !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
      }
      * {
        box-sizing: border-box;
      }
      
      /* Fix overlapping content issues */
      section, div[class*="section"], div[id*="section"] {
        position: relative !important;
        z-index: auto !important;
        clear: both !important;
      }
      
      /* Ensure proper spacing between sections */
      section {
        margin-bottom: 0 !important;
        padding-top: 4rem !important;
        padding-bottom: 4rem !important;
      }
      
      /* Fix fixed/absolute positioning that might cause overlaps */
      [style*="position: fixed"],
      [style*="position: absolute"] {
        z-index: 10 !important;
      }
      
      /* Ensure cards and containers don't overlap */
      .card, [class*="card"], [class*="container"] {
        position: relative !important;
        z-index: 1 !important;
      }
      
      /* Fix navigation bar */
      nav, header {
        position: relative !important;
        z-index: 100 !important;
      }
      
      /* Prevent background elements from overlapping content */
      [class*="bg-"], [class*="background"] {
        z-index: 0 !important;
      }
    </style>
    <script>
      (function() {
        // AGGRESSIVE navigation prevention
        
        // Prevent ALL navigation attempts
        window.addEventListener('beforeunload', function(e) {
          e.preventDefault();
          return false;
        });
        
        // Override window.location
        var originalLocation = window.location.href;
        Object.defineProperty(window, 'location', {
          get: function() {
            return {
              href: originalLocation,
              assign: function() { console.log('Navigation blocked'); },
              replace: function() { console.log('Navigation blocked'); },
              reload: function() { console.log('Reload blocked'); }
            };
          },
          set: function(val) {
            console.log('Navigation blocked:', val);
          }
        });
        
        // Intercept ALL clicks on the entire document
        document.addEventListener('click', function(e) {
          // Check if clicked element or any parent is a link
          let element = e.target;
          while (element && element !== document) {
            if (element.tagName === 'A' || element.tagName === 'a') {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              
              const href = element.getAttribute('href');
              console.log('Link clicked:', href);
              
              // Only allow hash/anchor navigation
              if (href && href.startsWith('#')) {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
              return false;
            }
            element = element.parentElement;
          }
        }, true); // Use capture phase
        
        // Also prevent form submissions that might navigate
        document.addEventListener('submit', function(e) {
          e.preventDefault();
          console.log('Form submission prevented');
          return false;
        }, true);
        
        // Ensure proper dimensions on load
        window.addEventListener('load', function() {
          document.documentElement.style.cssText = 'margin: 0; padding: 0; width: 100%; height: auto; min-height: 100vh; overflow-x: hidden;';
          document.body.style.cssText = 'margin: 0; padding: 0; width: 100%; height: auto; min-height: 100vh; overflow-x: hidden;';
          console.log('Content loaded. Height:', document.body.scrollHeight);
        });
      })();
    </script>
    `;
    
    // Insert script before closing body tag
    if (processedHTML.includes('</body>')) {
      processedHTML = processedHTML.replace('</body>', `${navigationScript}</body>`);
    } else if (processedHTML.includes('</BODY>')) {
      processedHTML = processedHTML.replace('</BODY>', `${navigationScript}</BODY>`);
    } else {
      processedHTML += navigationScript;
    }
    
    return processedHTML;
  };

  const handleDownload = () => {
    const html = generatedWebsite?.html || generatedWebsite;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    const html = generatedWebsite?.html || generatedWebsite;
    navigator.clipboard.writeText(html);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="flex-1 bg-black flex flex-col h-full">
      {!isGenerating && !generatedWebsite && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-6 animate-pulse">✨</div>
            <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-brand-purple to-pink-500 bg-clip-text text-transparent">
              This is where the Magic Happens
            </h2>
            <p className="text-gray-400 text-lg">with DAG GPT</p>
          </div>
        </div>
      )}

      {generatedWebsite && !isGenerating && (
        <div className="flex-1 flex flex-col p-4" style={{ minHeight: 0, height: '100%' }}>
          {/* Browser Controls */}
          <div className="bg-gray-900 rounded-t-xl border border-gray-800 flex-shrink-0">
            {/* Top Bar - Browser Buttons */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer"></div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={handleRefresh}
                    className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                    title="Refresh"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-brand-purple text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Preview</span>
                  </span>
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    viewMode === 'code'
                      ? 'bg-brand-purple text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>Code</span>
                  </span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                  title="Copy Code"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-brand-purple hover:bg-brand-purple-dark text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                  title="Download HTML"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Address Bar */}
            <div className="px-4 py-2 flex items-center space-x-2">
              <div className="flex-1 bg-gray-800 rounded-lg px-4 py-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs text-gray-400 font-mono">localhost:3000/preview</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-b-xl border-x border-b border-gray-800 overflow-auto" style={{ minHeight: 0, position: 'relative' }}>
            {viewMode === 'preview' ? (
              <iframe
                key={iframeKey}
                srcDoc={getProcessedHTML()}
                className="w-full h-full border-none"
                title="Website Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                style={{ 
                  pointerEvents: 'auto',
                  minHeight: '100%',
                  display: 'block',
                  border: 'none'
                }}
              />
            ) : (
              <div className="w-full h-full overflow-auto bg-gray-950 p-4">
                {/* File Structure */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <span className="text-xs font-bold text-gray-400">PROJECT STRUCTURE</span>
                  </div>
                  <div className="ml-4 space-y-1 text-xs">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <span>📁</span>
                      <span>website/</span>
                    </div>
                    <div className="ml-4 flex items-center space-x-2 text-blue-400">
                      <span>📄</span>
                      <span>index.html</span>
                      <span className="text-gray-600">(Main file)</span>
                    </div>
                  </div>
                </div>

                {/* Code Display */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                    <span className="text-xs font-mono text-gray-400">index.html</span>
                    <button
                      onClick={handleCopyCode}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 text-xs text-gray-300 overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                    <code>{generatedWebsite?.html || generatedWebsite}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteCreationCanvas;

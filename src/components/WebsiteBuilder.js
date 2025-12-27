import React, { useState, useRef, useEffect } from 'react';
import { generateFullWebsite, downloadAllFiles } from '../services/enhancedWebsiteBuilderService';

const WebsiteBuilder = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState(null);
  const [generatedHTML, setGeneratedHTML] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [logs, setLogs] = useState([]);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [selectedFile, setSelectedFile] = useState('index.html');
  const [isMobileView, setIsMobileView] = useState(false);
  const iframeRef = useRef(null);
  const logsEndRef = useRef(null);

  const examplePrompts = [
    "Build me a landing page for a Coffee brand named 'Strikefull'",
    "Create a portfolio website for a photographer with gallery",
    "Design a SaaS landing page with pricing tiers",
    "Make a restaurant website with menu and reservations"
  ];

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a website description');
      return;
    }

    setIsGenerating(true);
    setGeneratedHTML('');
    setGeneratedFiles(null);
    setLogs([]);
    setCurrentStage('Initializing');

    const result = await generateFullWebsite(prompt, (update) => {
      if (update.type === 'stage') {
        setCurrentStage(update.content);
      } else if (update.type === 'log') {
        setLogs(prev => [...prev, { text: update.content, timestamp: new Date().toLocaleTimeString() }]);
      }
    });

    setIsGenerating(false);

    if (result.success) {
      setGeneratedHTML(result.html);
      setGeneratedFiles(result.files);
      setCurrentStage('Complete');
      setLogs(prev => [...prev, { text: '🎉 Website is ready!', timestamp: new Date().toLocaleTimeString() }]);
    } else {
      setLogs(prev => [...prev, { text: `❌ Generation failed: ${result.error}`, timestamp: new Date().toLocaleTimeString() }]);
    }
  };

  const handleDownload = () => {
    if (generatedFiles) {
      downloadAllFiles(generatedFiles, 'my-website');
    }
  };

  const handleCopyCode = () => {
    if (generatedFiles && selectedFile) {
      navigator.clipboard.writeText(generatedFiles[selectedFile]);
      alert(`${selectedFile} copied to clipboard!`);
    }
  };

  const handleNewWebsite = () => {
    setGeneratedHTML('');
    setGeneratedFiles(null);
    setPrompt('');
    setLogs([]);
    setCurrentStage('');
    setViewMode('preview');
    setSelectedFile('index.html');
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      backgroundColor: '#0a0a0a',
      color: 'white'
    }}>
      {/* LEFT PANEL - Chat/Interaction (25%) */}
      <div style={{
        width: '25%',
        minWidth: '350px',
        maxWidth: '450px',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #2a2a2a',
        backgroundColor: '#0f0f0f'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #2a2a2a'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🌐 Website Builder
          </h2>
          <p style={{
            fontSize: '13px',
            color: '#666',
            margin: '5px 0 0 0'
          }}>
            Claude Sonnet 4.5 • Professional UI/UX
          </p>
        </div>

        {/* Chat Messages Area / Terminal Logs */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {!isGenerating && logs.length === 0 ? (
            <>
              {/* Prompt Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  color: '#888',
                  marginBottom: '10px',
                  fontWeight: '500'
                }}>
                  Describe your website
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Build me a landing page for a Coffee brand named 'Strikefull' with a hero section, menu showcase, and contact form..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '14px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !prompt.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: !prompt.trim() ? 0.5 : 1
                }}
              >
                ✨ Generate Website
              </button>

              {/* Example Prompts */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '13px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>
                  💡 Example prompts
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'transparent',
                        border: '1px solid #2a2a2a',
                        borderRadius: '6px',
                        color: '#888',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Terminal Logs */}
              <div style={{
                flex: 1,
                backgroundColor: '#0a0a0a',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'Monaco, Consolas, monospace',
                fontSize: '12px',
                overflowY: 'auto',
                border: '1px solid #2a2a2a'
              }}>
                {/* Stage Header */}
                {currentStage && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '8px 12px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '6px',
                    color: '#667eea',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {isGenerating && <span className="spinner">⚙️</span>}
                    <span>{currentStage}</span>
                  </div>
                )}

                {/* Logs */}
                {logs.map((log, index) => (
                  <div key={index} style={{
                    marginBottom: '4px',
                    color: '#aaa',
                    lineHeight: '1.6'
                  }}>
                    <span style={{ color: '#666', marginRight: '8px' }}>[{log.timestamp}]</span>
                    <span>{log.text}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>

              {/* New Website Button */}
              {!isGenerating && generatedHTML && (
                <button
                  onClick={handleNewWebsite}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  ✨ Create New Website
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - Preview (75%) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0a',
        overflow: 'hidden'
      }}>
        {/* Toolbar */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid #2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f0f0f'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setViewMode('preview')}
              style={{
                padding: '7px 16px',
                backgroundColor: viewMode === 'preview' ? '#667eea' : 'transparent',
                color: viewMode === 'preview' ? 'white' : '#888',
                border: '1px solid ' + (viewMode === 'preview' ? '#667eea' : '#333'),
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              👁️ Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              style={{
                padding: '7px 16px',
                backgroundColor: viewMode === 'code' ? '#667eea' : 'transparent',
                color: viewMode === 'code' ? 'white' : '#888',
                border: '1px solid ' + (viewMode === 'code' ? '#667eea' : '#333'),
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              💻 Code
            </button>
            {viewMode === 'preview' && (
              <button
                onClick={() => setIsMobileView(!isMobileView)}
                style={{
                  padding: '7px 16px',
                  backgroundColor: isMobileView ? '#667eea' : 'transparent',
                  color: isMobileView ? 'white' : '#888',
                  border: '1px solid ' + (isMobileView ? '#667eea' : '#333'),
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                📱 Mobile
              </button>
            )}
          </div>

          {generatedHTML && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCopyCode}
                style={{
                  padding: '7px 16px',
                  backgroundColor: 'transparent',
                  color: '#888',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                📋 Copy
              </button>
              <button
                onClick={handleDownload}
                style={{
                  padding: '7px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                💾 Download
              </button>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: '#0a0a0a',
          overflow: 'auto'
        }}>
          {!generatedHTML ? (
            <div style={{
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌐</div>
              <p style={{ fontSize: '16px', margin: 0 }}>Your website will appear here</p>
              <p style={{ fontSize: '13px', marginTop: '8px', color: '#555' }}>Enter a prompt to get started</p>
            </div>
          ) : viewMode === 'preview' ? (
            <iframe
              ref={iframeRef}
              title="Website Preview"
              style={{
                width: isMobileView ? '375px' : '100%',
                height: isMobileView ? '667px' : '100%',
                minHeight: '600px',
                border: isMobileView ? '8px solid #222' : 'none',
                borderRadius: isMobileView ? '20px' : '0',
                backgroundColor: 'white',
                boxShadow: isMobileView ? '0 20px 60px rgba(0,0,0,0.5)' : 'none'
              }}
              srcDoc={generatedHTML}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <pre style={{
              width: '100%',
              height: '100%',
              margin: 0,
              padding: '20px',
              backgroundColor: '#0f0f0f',
              color: '#e0e0e0',
              fontSize: '13px',
              fontFamily: 'Monaco, Consolas, monospace',
              lineHeight: '1.6',
              overflow: 'auto',
              borderRadius: '8px',
              border: '1px solid #2a2a2a'
            }}>
              {generatedHTML}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsiteBuilder;

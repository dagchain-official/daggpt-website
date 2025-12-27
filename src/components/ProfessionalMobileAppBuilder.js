import React, { useState } from 'react';

const ProfessionalMobileAppBuilder = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentStage, setCurrentStage] = useState('');
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [appCode, setAppCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setLogs([]);
    setCurrentStage('Initializing');
    setAppCode('');
    setPreviewUrl('');
    
    // Add initial log
    setLogs(prev => [...prev, '🚀 Starting mobile app generation...']);
    
    // Placeholder for future implementation
    setTimeout(() => {
      setLogs(prev => [...prev, '✅ Mobile app builder ready!']);
      setCurrentStage('Ready');
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Left Sidebar - Input & Logs */}
      <div style={{
        width: '320px',
        background: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}>
        {/* Header - Top Left */}
        <div style={{
          padding: '24px',
          background: '#f5f5f5'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Mobile App Builder
          </h2>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: '#666'
          }}>
            Build iOS & Android Apps with DAG GPT
          </p>
        </div>

        {/* Stage Indicator */}
        {currentStage && (
          <div style={{
            margin: '20px',
            padding: '12px 16px',
            background: '#f5f5f5',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#6366f1',
            boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              background: '#6366f1',
              borderRadius: '50%',
              animation: isGenerating ? 'pulse 1.5s ease-in-out infinite' : 'none'
            }}></span>
            {currentStage}
          </div>
        )}

        {/* Logs Section - Middle (flex-1) */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          background: '#f5f5f5'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Generation Logs
          </h3>
          <div style={{
            background: '#f5f5f5',
            borderRadius: '12px',
            padding: '16px',
            minHeight: '200px',
            boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)'
          }}>
            {logs.length === 0 ? (
              <p style={{
                margin: 0,
                color: '#9ca3af',
                fontSize: '14px',
                textAlign: 'center',
                padding: '40px 0'
              }}>
                No logs yet. Start generating to see progress...
              </p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '8px',
                    padding: '8px 12px',
                    background: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#374151',
                    borderLeft: '3px solid #6366f1',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.05)',
                    animation: 'slideIn 0.3s ease-out'
                  }}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Input Section - Bottom Left */}
        <div style={{ 
          padding: '20px',
          borderTop: '1px solid rgba(0,0,0,0.05)'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            Describe Your App
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Create a fitness tracking app with workout plans, progress charts, and social sharing..."
            disabled={isGenerating}
            style={{
              width: '100%',
              height: '120px',
              padding: '12px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              resize: 'none',
              fontFamily: 'inherit',
              transition: 'all 0.3s ease',
              background: '#ffffff',
              color: '#374151',
              boxShadow: isGenerating ? 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)' : 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)'
            }}
            onFocus={(e) => e.target.style.boxShadow = 'inset 4px 4px 8px rgba(255,64,23,0.2), inset -4px -4px 8px rgba(255,255,255,0.9)'}
            onBlur={(e) => e.target.style.boxShadow = 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)'}
          />
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '14px',
              background: isGenerating ? '#d1d5db' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isGenerating ? 'none' : '6px 6px 12px rgba(255,64,23,0.3), -2px -2px 6px rgba(255,140,66,0.2)'
            }}
            onMouseEnter={(e) => {
              if (!isGenerating && prompt.trim()) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '8px 8px 16px rgba(255,64,23,0.4), -2px -2px 6px rgba(255,140,66,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '6px 6px 12px rgba(255,64,23,0.3), -2px -2px 6px rgba(255,140,66,0.2)';
            }}
          >
            {isGenerating ? '⚙️ Generating...' : '🚀 Generate App'}
          </button>
        </div>
      </div>

      {/* Main Content Area - Preview/Code */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff'
      }}>
        {/* Top Bar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff'
        }}>
          {/* View Toggle */}
          <div style={{
            display: 'flex',
            gap: '8px',
            background: '#f5f5f5',
            padding: '6px',
            borderRadius: '12px',
            boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.1), inset -3px -3px 6px rgba(255,255,255,0.9)'
          }}>
            <button
              onClick={() => setViewMode('preview')}
              style={{
                padding: '10px 20px',
                background: viewMode === 'preview' ? '#f5f5f5' : 'transparent',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: viewMode === 'preview' ? '#6366f1' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: viewMode === 'preview' ? '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)' : 'none'
              }}
            >
              📱 Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              style={{
                padding: '10px 20px',
                background: viewMode === 'code' ? '#f5f5f5' : 'transparent',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: viewMode === 'code' ? '#6366f1' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: viewMode === 'code' ? '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)' : 'none'
              }}
            >
              💻 Code
            </button>
          </div>

          {/* Download Button */}
          {appCode && (
            <button
              style={{
                padding: '10px 16px',
                background: '#f5f5f5',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#6366f1';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '6px 6px 12px rgba(0,0,0,0.15), -4px -4px 8px rgba(255,255,255,0.9)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#374151';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Project
            </button>
          )}
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          background: '#f5f5f5'
        }}>
          {!appCode ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: '#f5f5f5',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                fontSize: '48px',
                boxShadow: '8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.9)'
              }}>
                📱
              </div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#374151'
              }}>
                No app generated yet
              </h3>
              <p style={{
                margin: 0,
                fontSize: '16px',
                textAlign: 'center',
                maxWidth: '400px'
              }}>
                Describe your mobile app idea and click "Generate App" to get started
              </p>
            </div>
          ) : (
            <div style={{
              background: '#f5f5f5',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.9)',
              minHeight: '500px'
            }}>
              {viewMode === 'preview' ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '500px'
                }}>
                  <p style={{ color: '#6b7280', fontSize: '16px' }}>
                    📱 Mobile app preview will appear here
                  </p>
                </div>
              ) : (
                <pre style={{
                  margin: 0,
                  padding: '20px',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  overflowX: 'auto',
                  fontFamily: '"Fira Code", "Courier New", monospace'
                }}>
                  {appCode || '// App code will appear here'}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalMobileAppBuilder;


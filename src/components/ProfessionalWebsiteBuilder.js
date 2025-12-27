import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { generateWithTools, refineWithTools } from '../services/worldClassWebsiteBuilder/toolBasedOrchestrator';
import { downloadAllFiles } from '../services/claudeWebsiteService';
import { deployToSupabase } from '../services/supabaseDeployment';
import { listenForRuntimeErrors, injectErrorDetector, parseRuntimeError } from '../services/runtimeErrorDetector';
import { 
  saveSession, 
  loadCurrentSession, 
  scheduleAutoSave,
  createNewSession,
  listSessions,
  setCurrentUser
} from '../services/sessionManager';
import ChatInterface from './ChatInterface';
import { useAuth } from '../contexts/AuthContext';

const ProfessionalWebsiteBuilder = () => {
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState('src/App.jsx');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [logs, setLogs] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [isMobileView, setIsMobileView] = useState(false);
  const [metadata, setMetadata] = useState(null); // Store agent outputs and QA report
  const [isRefining, setIsRefining] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const iframeRef = useRef(null);
  const logsEndRef = useRef(null);
  const chatEndRef = useRef(null);
  const hasBuiltRef = useRef(false); // Track if we've already built
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);

  const examplePrompts = [
    "Build a modern e-commerce website for a fashion brand with shopping cart and checkout",
    "Create a SaaS landing page with pricing tiers, testimonials, and feature comparison",
    "Design a portfolio website for a photographer with gallery and contact form",
    "Make a restaurant website with menu, reservations, and online ordering",
    "Build a blog platform with categories, search, and comment system"
  ];

  // Set current user for session management
  useEffect(() => {
    if (currentUser) {
      setCurrentUser(currentUser.uid);
      console.log('[WebsiteBuilder] User set:', currentUser.uid);
    }
  }, [currentUser]);

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      if (!currentUser) {
        console.log('[Session] Waiting for user authentication...');
        return;
      }

      try {
        const session = await loadCurrentSession();
        if (session) {
          setSessionId(session.id);
          setFiles(session.files || {});
          setChatHistory(session.chatHistory || []);
          setMetadata(session.metadata || null);
          console.log('[Session] Restored session:', session.id);
          
          setLogs(prev => [...prev, {
            text: `✅ Session restored: ${session.projectName}`,
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      } catch (error) {
        console.error('[Session] Failed to load:', error);
      }
    };
    
    loadSession();
  }, [currentUser]);

  // Auto-save session when files or chat changes
  useEffect(() => {
    if (sessionId && (Object.keys(files).length > 0 || chatHistory.length > 0)) {
      scheduleAutoSave(sessionId, {
        files,
        chatHistory,
        metadata
      });
    }
  }, [files, chatHistory, metadata, sessionId]);

  // Auto-scroll logs and chat
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Cleanup WebContainer on unmount
  useEffect(() => {
    return () => {
      // Cleanup preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Stop WebContainer
      import('../services/webContainerService').then(({ stopWebContainer }) => {
        stopWebContainer().catch(console.error);
      });
    };
  }, [previewUrl]);

  // Runtime error detection
  const handleRuntimeError = useCallback(async (errorMessage) => {
    console.log('[Runtime Error] Detected:', errorMessage);
    
    const parsedError = parseRuntimeError(errorMessage);
    
    setLogs(prev => [...prev, {
      text: `⚠️ Runtime Error: ${parsedError.message}`,
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Auto-fix runtime error using conversational AI
    if (conversation.length > 0 && files && Object.keys(files).length > 0) {
      setIsChatProcessing(true);
      setLogs(prev => [...prev, {
        text: '🤖 AI is fixing the runtime error...',
        timestamp: new Date().toLocaleTimeString()
      }]);

      try {
        const result = await refineWithTools(
          `There is a runtime error in the browser: ${errorMessage}. Please fix this error. The error type is ${parsedError.type}.`,
          files,
          (update) => {
            if (update.type === 'log' || update.type === 'stage') {
              setLogs(prev => [...prev, {
                text: update.message,
                timestamp: new Date().toLocaleTimeString()
              }]);
            }
          }
        );

        if (result.success && result.files) {
          setFiles(result.files);
          await loadPreview(result.files);
          setLogs(prev => [...prev, {
            text: '✅ Runtime error fixed! Preview reloaded.',
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      } catch (error) {
        console.error('[Runtime Error Fix] Failed:', error);
        setLogs(prev => [...prev, {
          text: `❌ Failed to fix runtime error: ${error.message}`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } finally {
        setIsChatProcessing(false);
      }
    }
  }, [conversation, files]);

  // Listen for runtime errors from iframe
  useEffect(() => {
    const cleanup = listenForRuntimeErrors(handleRuntimeError);
    return cleanup;
  }, [handleRuntimeError]);

  // Inject error detector into iframe when it loads
  useEffect(() => {
    if (iframeRef.current && previewUrl) {
      const iframe = iframeRef.current;
      
      const injectWhenReady = () => {
        try {
          if (iframe.contentWindow) {
            // Wait a bit for iframe to fully load
            setTimeout(() => {
              injectErrorDetector(iframe.contentWindow);
            }, 1000);
          }
        } catch (error) {
          console.warn('[Runtime Error Detector] Could not inject:', error);
        }
      };
      
      iframe.addEventListener('load', injectWhenReady);
      
      return () => {
        iframe.removeEventListener('load', injectWhenReady);
      };
    }
  }, [previewUrl]);

  // Fallback preview using CDN imports (when WebContainer fails)
  const loadFallbackPreview = async (generatedFiles) => {
    try {
      setCurrentStage('Creating Fallback Preview...');
      
      // Get App.jsx content and remove imports
      let appContent = generatedFiles['src/App.jsx'] || generatedFiles['App.jsx'] || '';
      
      // Remove all import statements
      appContent = appContent.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
      appContent = appContent.replace(/import\s+['"].*?['"];?\s*/g, '');
      
      // Create a complete HTML file with CDN imports
      const previewHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    body { 
      font-family: 'Inter', sans-serif; 
      margin: 0; 
      padding: 0; 
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import React from 'https://esm.sh/react@18.2.0';
    import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
    import { BrowserRouter } from 'https://esm.sh/react-router-dom@6.20.0';
    import { motion } from 'https://esm.sh/framer-motion@10.16.0';
    import * as LucideIcons from 'https://esm.sh/lucide-react@0.294.0';
    
    // Make libraries available globally
    window.React = React;
    window.motion = motion;
    
    // Destructure Lucide icons
    const { Menu, X, ArrowRight, Check, Star, ChevronRight } = LucideIcons;
    
    // App component (with imports removed)
    ${appContent}
    
    // Render
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      React.createElement(React.StrictMode, null,
        React.createElement(BrowserRouter, null,
          React.createElement(App)
        )
      )
    );
  </script>
</body>
</html>`;

      const blob = new Blob([previewHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      
      setLogs(prev => [...prev, { 
        text: '✅ Fallback preview ready!', 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      
      setIsLoadingPreview(false);
      setCurrentStage('Preview Ready (Fallback Mode)');
      
    } catch (error) {
      console.error('[Fallback Preview] Failed:', error);
      setLogs(prev => [...prev, { 
        text: `❌ Fallback preview failed: ${error.message}`, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      setIsLoadingPreview(false);
    }
  };

  // Load preview using WebContainer for full React environment
  const loadPreview = async (generatedFiles) => {
    try {
      setIsLoadingPreview(true);
      setCurrentStage('Booting WebContainer...');
      
      setLogs(prev => [...prev, { 
        text: '🚀 Initializing WebContainer...', 
        timestamp: new Date().toLocaleTimeString() 
      }]);

      // Import WebContainer service dynamically
      const { runInWebContainerWithAutoFix, isWebContainerSupported } = await import('../services/webContainerService');
      
      // Check if WebContainer is supported
      if (!isWebContainerSupported()) {
        setLogs(prev => [...prev, { 
          text: '⚠️ WebContainer not supported, using fallback preview...', 
          timestamp: new Date().toLocaleTimeString() 
        }]);
        
        // Use fallback preview
        await loadFallbackPreview(generatedFiles);
        return;
      }

      // Run in WebContainer with auto-fix
      const result = await runInWebContainerWithAutoFix(
        generatedFiles,
        (update) => {
          if (update.type === 'iteration') {
            setCurrentStage(`Build Attempt ${update.iteration}/${update.maxIterations}`);
            setLogs(prev => [...prev, { 
              text: update.message, 
              timestamp: new Date().toLocaleTimeString() 
            }]);
          } else if (update.type === 'install') {
            setCurrentStage('Installing Dependencies');
            setLogs(prev => [...prev, { 
              text: update.message, 
              timestamp: new Date().toLocaleTimeString() 
            }]);
          } else if (update.type === 'build') {
            setCurrentStage('Starting Dev Server');
            setLogs(prev => [...prev, { 
              text: update.message, 
              timestamp: new Date().toLocaleTimeString() 
            }]);
          } else if (update.type === 'errors') {
            setCurrentStage('Fixing Errors');
            setLogs(prev => [...prev, { 
              text: update.message, 
              timestamp: new Date().toLocaleTimeString() 
            }]);
            update.errors?.forEach(err => {
              setLogs(prev => [...prev, { 
                text: `  ⚠️ ${err}`, 
                timestamp: new Date().toLocaleTimeString() 
              }]);
            });
          } else if (update.type === 'fixed') {
            setLogs(prev => [...prev, { 
              text: update.message, 
              timestamp: new Date().toLocaleTimeString() 
            }]);
          } else if (update.type === 'success') {
            setCurrentStage('Preview Ready');
            setLogs(prev => [...prev, { 
              text: update.message, 
              timestamp: new Date().toLocaleTimeString() 
            }]);
          } else if (update.type === 'warning' || update.type === 'error') {
            setLogs(prev => [...prev, { 
              text: update.message, 
              timestamp: new Date().toLocaleTimeString() 
            }]);
          }
        },
        5 // Max 5 iterations
      );

      if (result.success) {
        setPreviewUrl(result.serverUrl);
        setFiles(result.files); // Update with fixed files
        
        setLogs(prev => [...prev, { 
          text: `✅ Preview ready! (${result.iterations} iteration${result.iterations > 1 ? 's' : ''})`, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      } else {
        throw new Error(result.error || 'Failed to start preview');
      }
      
      setIsLoadingPreview(false);
    } catch (error) {
      console.error('[Preview] WebContainer failed, trying fallback:', error);
      setLogs(prev => [...prev, { 
        text: `⚠️ WebContainer failed: ${error.message}`, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      
      // Try fallback preview
      try {
        await loadFallbackPreview(generatedFiles);
      } catch (fallbackError) {
        console.error('[Fallback Preview] Also failed:', fallbackError);
        setCurrentStage('Preview Failed');
        setLogs(prev => [...prev, { 
          text: `❌ All preview methods failed`, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
        setIsLoadingPreview(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a website description');
      return;
    }

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: prompt, timestamp: new Date().toLocaleTimeString() }]);

    setIsGenerating(true);
    setLogs([]);
    setCurrentStage('Initializing Multi-Agent System');
    setPreviewUrl(null);
    hasBuiltRef.current = false;

    const result = await generateWithTools(prompt, (update) => {
      if (update.type === 'stage') {
        setCurrentStage(update.stage + ': ' + update.message);
        setLogs(prev => [...prev, { 
          text: update.message, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      } else if (update.type === 'log') {
        setLogs(prev => [...prev, { 
          text: update.message, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      } else if (update.type === 'error') {
        setLogs(prev => [...prev, { 
          text: update.message, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      }
    });

    setIsGenerating(false);

    console.log('[World-Class Builder] Generation complete. Result:', result);

    if (result.success) {
      setFiles(result.files);
      setMetadata(result.metadata);
      setActiveFile('src/App.jsx');
      setCurrentStage('Loading Preview...');
      
      // Create or update session
      if (!sessionId) {
        const newSession = await createNewSession(prompt.substring(0, 50));
        setSessionId(newSession.id);
        await saveSession({
          ...newSession,
          files: result.files,
          metadata: result.metadata,
          chatHistory: [...chatHistory, { role: 'user', content: prompt, timestamp: new Date().toLocaleTimeString() }]
        });
      } else {
        await saveSession({
          id: sessionId,
          files: result.files,
          metadata: result.metadata,
          chatHistory
        });
      }
      
      const fileCount = Object.keys(result.files).length;
      const toolCalls = result.metadata?.toolCalls || 0;
      
      // Load preview
      await loadPreview(result.files);
      
      setCurrentStage('Complete');
      
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `✅ React application generated using AI tools!\n\n📁 Files: ${fileCount}\n🔧 Tool Calls: ${toolCalls}\n⏱️ Time: ${result.metadata?.generationTime}s\n\n${result.metadata?.message || ''}\n\n🎨 Features:\n- Modern React with hooks\n- Tailwind CSS styling\n- Framer Motion animations\n- React Router navigation\n- Lucide React icons\n- Fully responsive design\n\n💾 Session auto-saved!\n\nYou can now preview, edit, or deploy your website!`, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      setPrompt('');
    } else {
      console.error('[World-Class Builder] Generation failed:', result.error);
      setLogs(prev => [...prev, { 
        text: `❌ Error: ${result.error}`, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Generation failed: ${result.error}`, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    }
  };

  // Handle chat messages for iterative changes (Bolt.new style)
  const handleChatMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message to chat
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: message
    }]);

    setIsChatProcessing(true);

    try {
      // Use tool-based refinement
      const result = await refineWithTools(
        message,
        files,
        (update) => {
          if (update.type === 'log' || update.type === 'stage') {
            setLogs(prev => [...prev, {
              text: update.message,
              timestamp: new Date().toLocaleTimeString()
            }]);
          }
        }
      );

      if (result.success) {
        // Update files
        if (result.files) {
          setFiles(result.files);
          await loadPreview(result.files);
        }

        // Add AI response to chat
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: result.metadata?.message || '✅ Changes applied successfully!'
        }]);
      } else {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ Error: ${result.error}`
        }]);
      }
    } catch (error) {
      console.error('[Chat] Error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error: ${error.message}`
      }]);
    } finally {
      setIsChatProcessing(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!currentMessage.trim() || Object.keys(files).length === 0) {
      return;
    }

    // Add user message
    setChatHistory(prev => [...prev, { role: 'user', content: currentMessage, timestamp: new Date().toLocaleTimeString() }]);
    
    const userRequest = currentMessage;
    setCurrentMessage('');
    setIsRefining(true);
    setLogs([]);

    // Use tool-based refinement
    const result = await refineWithTools(userRequest, files, (update) => {
      if (update.type === 'stage') {
        setCurrentStage(update.stage + ': ' + update.message);
        setLogs(prev => [...prev, { text: update.message, timestamp: new Date().toLocaleTimeString() }]);
      } else if (update.type === 'log') {
        setLogs(prev => [...prev, { text: update.message, timestamp: new Date().toLocaleTimeString() }]);
      } else if (update.type === 'error') {
        setLogs(prev => [...prev, { text: update.message, timestamp: new Date().toLocaleTimeString() }]);
      }
    });

    setIsRefining(false);

    if (result.success) {
      setFiles(result.files);
      
      // Reload preview with updated files
      await loadPreview(result.files);
      
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `✅ Changes applied!\n\n${result.metadata?.message || ''}\n\n🔧 Tool Calls: ${result.metadata?.toolCalls || 0}\n\nLet me know if you need more changes!`, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    } else {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Refinement failed: ${result.error}`, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    }
  };

  const handleFileChange = async (value) => {
    const updatedFiles = {
      ...files,
      [activeFile]: value
    };
    setFiles(updatedFiles);

    // Hot reload: Update file in WebContainer if preview is active
    if (previewUrl && !isLoadingPreview) {
      try {
        const { getWebContainer } = await import('../services/webContainerService');
        const webcontainer = await getWebContainer();
        
        // Write the updated file
        await webcontainer.fs.writeFile(activeFile, value);
        
        setLogs(prev => [...prev, { 
          text: `🔄 Hot reload: ${activeFile}`, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      } catch (error) {
        console.error('[Hot Reload] Failed:', error);
      }
    }
  };

  const handleDownload = async () => {
    if (Object.keys(files).length > 0) {
      setLogs(prev => [...prev, { 
        text: '📦 Creating ZIP file...', 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      
      const result = await downloadAllFiles(files, 'my-website');
      
      if (result.success) {
        setLogs(prev => [...prev, { 
          text: '✅ Downloaded successfully!', 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      } else {
        setLogs(prev => [...prev, { 
          text: `❌ Download failed: ${result.error}`, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      }
    }
  };

  const handleDeploy = async () => {
    if (Object.keys(files).length === 0) {
      alert('No files to deploy');
      return;
    }

    setIsDeploying(true);
    
    try {
      // Get user ID (you can get this from your auth system)
      const userId = 'user_' + Date.now(); // Temporary - replace with actual user ID
      const projectName = prompt.substring(0, 50) || 'website';
      
      const result = await deployToSupabase(files, projectName, userId);
      
      if (result.success) {
        setDeployedUrl(result.websiteUrl);
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: `🚀 Website deployed successfully!\n\n🌐 Live URL: ${result.websiteUrl}\n📁 Files: ${result.fileCount}\n\nYou can share this URL with anyone!`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Deployment error:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `❌ Deployment failed: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopyCode = () => {
    if (files[activeFile]) {
      navigator.clipboard.writeText(files[activeFile]);
      alert(`${activeFile} copied to clipboard!`);
    }
  };

  const handleNewWebsite = () => {
    setFiles({});
    setPrompt('');
    setLogs([]);
    setCurrentStage('');
    setActiveFile('index.html');
  };

  const getLanguage = (filename) => {
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.json')) return 'json';
    return 'plaintext';
  };

  return (
    <div className="h-screen w-full relative">
      {/* Purple Radial Gradient Background from Bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
        }}
      />
      <div className="relative z-10 h-full" style={{
        display: 'flex',
        color: '#333',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
      {/* LEFT SIDEBAR - Prompt & Logs */}
      <div style={{
        width: '350px',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 'none',
        backgroundColor: '#ffffff',
        boxShadow: '8px 0 16px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: 'none',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: 'inset -2px -2px 4px rgba(255, 255, 255, 0.3), inset 2px 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            margin: 0,
            color: '#fff',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            Website Builder
          </h2>
          <p style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '6px 0 0 0',
            fontWeight: '500'
          }}>
            Powered by - DAG GPT
          </p>
        </div>

        {/* Chat History & Logs */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Initial Prompt or Chat History */}
          {chatHistory.length === 0 ? (
            <>
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '600' }}>
                  💡 Example Prompts
                </h3>
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#333',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '11px',
                      transition: 'all 0.3s',
                      boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9)',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.9)';
                      e.target.style.color = '#6366f1';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9)';
                      e.target.style.color = '#333';
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Chat Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {chatHistory.map((msg, index) => (
                  <div key={index} style={{
                    padding: '12px 14px',
                    backgroundColor: msg.role === 'user' ? '#fff5f0' : '#ffffff',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: msg.role === 'user' 
                      ? 'inset 2px 2px 4px rgba(255, 107, 53, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.9)'
                      : '3px 3px 6px rgba(0, 0, 0, 0.1), -3px -3px 6px rgba(255, 255, 255, 0.9)'
                  }}>
                    <div style={{
                      fontSize: '10px',
                      color: msg.role === 'user' ? '#6366f1' : '#666',
                      marginBottom: '4px',
                      fontWeight: '700'
                    }}>
                      {msg.role === 'user' ? '👤 You' : '🤖 Assistant'} • {msg.timestamp}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#333',
                      lineHeight: '1.6'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Terminal Logs during generation */}
              {isGenerating && logs.length > 0 && (
                <div style={{
                  backgroundColor: '#f8f8f8',
                  borderRadius: '12px',
                  padding: '12px',
                  fontFamily: '"Cascadia Code", Consolas, monospace',
                  fontSize: '10px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: 'none',
                  boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.9)'
                }}>
                  {currentStage && (
                    <div style={{
                      marginBottom: '8px',
                      padding: '6px 10px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: '700',
                      fontSize: '10px',
                      boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
                    }}>
                      ⚙️ {currentStage}
                    </div>
                  )}
                  {logs.slice(-5).map((log, index) => (
                    <div key={index} style={{
                      marginBottom: '2px',
                      color: '#333',
                      lineHeight: '1.4'
                    }}>
                      <span style={{ color: '#999', marginRight: '4px', fontSize: '9px' }}>[{log.timestamp}]</span>
                      <span>{log.text}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Chat Input at Bottom */}
        <div style={{
          padding: '16px',
          borderTop: 'none',
          backgroundColor: '#ffffff',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          {chatHistory.length === 0 ? (
            <>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="Describe your website..."
                disabled={isGenerating}
                style={{
                  width: '100%',
                  minHeight: '70px',
                  padding: '14px',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#333',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  marginBottom: '10px',
                  boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.9)'
                }}
                onFocus={(e) => e.target.style.boxShadow = 'inset 3px 3px 6px rgba(255, 107, 53, 0.2), inset -3px -3px 6px rgba(255, 255, 255, 0.9)'}
                onBlur={(e) => e.target.style.boxShadow = 'inset 3px 3px 6px rgba(0, 0, 0, 0.1), inset -3px -3px 6px rgba(255, 255, 255, 0.9)'}
              />
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: (!prompt.trim() || isGenerating) ? '#e0e0e0' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (!prompt.trim() || isGenerating) ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '700',
                  opacity: (!prompt.trim() || isGenerating) ? 0.5 : 1,
                  boxShadow: (!prompt.trim() || isGenerating) ? 'none' : '4px 4px 8px rgba(255, 107, 53, 0.3), -2px -2px 6px rgba(255, 255, 255, 0.5)',
                  transition: 'all 0.3s',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >
                {isGenerating ? '⏳ Generating...' : '✨ Generate Website'}
              </button>
            </>
          ) : (
            <>
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit();
                  }
                }}
                placeholder="Ask me to make changes... (e.g., 'Make the hero section darker' or 'Add more images')"
                disabled={isGenerating}
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '10px',
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #3c3c3c',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  marginBottom: '8px'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007acc'}
                onBlur={(e) => e.target.style.borderColor = '#3c3c3c'}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleChatSubmit}
                  disabled={!currentMessage.trim() || isGenerating}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: (!currentMessage.trim() || isGenerating) ? '#e0e0e0' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: (!currentMessage.trim() || isGenerating) ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    opacity: (!currentMessage.trim() || isGenerating) ? 0.5 : 1,
                    boxShadow: (!currentMessage.trim() || isGenerating) ? 'none' : '4px 4px 8px rgba(255, 107, 53, 0.3), -2px -2px 6px rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.3s',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {isGenerating ? '⏳ Updating...' : '💬 Send'}
                </button>
                <button
                  onClick={handleNewWebsite}
                  disabled={isGenerating}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    color: '#6366f1',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '700',
                    opacity: isGenerating ? 0.5 : 1,
                    boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.1), -3px -3px 6px rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.3s'
                  }}
                >
                  🔄 New
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT - Preview/Code Toggle (75% width) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff'
      }}>
        {/* Toolbar */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Toggle Switch & Download Button */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              backgroundColor: '#f5f5f5',
              padding: '4px',
              borderRadius: '10px',
              boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.9)'
            }}>
              <button
                onClick={() => setViewMode('preview')}
                style={{
                  padding: '8px 20px',
                  backgroundColor: viewMode === 'preview' ? '#ffffff' : 'transparent',
                  color: viewMode === 'preview' ? '#6366f1' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700',
                  transition: 'all 0.3s',
                  boxShadow: viewMode === 'preview' ? '2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.9)' : 'none'
                }}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                style={{
                  padding: '8px 20px',
                  backgroundColor: viewMode === 'code' ? '#ffffff' : 'transparent',
                  color: viewMode === 'code' ? '#6366f1' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700',
                  transition: 'all 0.3s',
                  boxShadow: viewMode === 'code' ? '2px 2px 4px rgba(0, 0, 0, 0.1), -2px -2px 4px rgba(255, 255, 255, 0.9)' : 'none'
                }}
              >
                Code
              </button>
            </div>

            {/* Action Buttons */}
            {Object.keys(files).length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Deploy Button */}
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  style={{
                    padding: '10px 16px',
                    background: isDeploying ? '#ccc' : '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: isDeploying ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '700',
                    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeploying) {
                      e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.15), inset -2px -2px 4px rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.transform = 'scale(0.98)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeploying) {
                      e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                  title="Deploy to Supabase"
                >
                  {isDeploying ? (
                    <>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                      </svg>
                      Deploy
                    </>
                  )}
                </button>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  style={{
                    padding: '10px 16px',
                    background: '#ffffff',
                    color: '#333',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: '900',
                    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.9)',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0, 0, 0, 0.15), inset -2px -2px 4px rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Download Project"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div style={{ fontSize: '11px', color: '#999', fontWeight: '500' }}>
            {Object.keys(files).length > 0 && `${Object.keys(files).length} files`}
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: '#f8f8f8',
          overflow: 'auto'
        }}>
          {isGenerating ? (
            // Loading Animation
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                border: '6px solid #f0f0f0',
                borderTop: '6px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <p style={{ fontSize: '16px', color: '#666', fontWeight: '600' }}>
                {currentStage || 'Generating your website...'}
              </p>
            </div>
          ) : Object.keys(files).length === 0 ? (
            // Empty State
            <div style={{ textAlign: 'center', color: '#999' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>🌐</div>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>No website generated yet</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>Enter a prompt to get started</p>
            </div>
          ) : viewMode === 'preview' ? (
            // Preview Mode - WebContainer iframe
            isLoadingPreview ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 20px',
                  border: '4px solid #f0f0f0',
                  borderTop: '4px solid #6366f1',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
                  Loading preview...
                </p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  Installing dependencies and starting dev server
                </p>
              </div>
            ) : previewUrl ? (
              <iframe
                ref={iframeRef}
                src={previewUrl}
                title="Website Preview"
                allow="cross-origin-isolated; clipboard-write"
                style={{
                  width: isMobileView ? '375px' : '100%',
                  height: isMobileView ? '667px' : '100%',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                maxWidth: '500px',
                padding: '40px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
                  Preview Loading...
                </h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  Your website will appear here in a moment
                </p>
              </div>
            )
          ) : (
            // Code Mode
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* File Tabs */}
              <div style={{
                display: 'flex',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e0e0e0',
                overflowX: 'auto',
                padding: '8px 8px 0 8px',
                gap: '4px'
              }}>
                {Object.keys(files).map((filename) => (
                  <button
                    key={filename}
                    onClick={() => setActiveFile(filename)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: activeFile === filename ? '#f8f8f8' : 'transparent',
                      color: activeFile === filename ? '#6366f1' : '#666',
                      border: 'none',
                      borderRadius: '8px 8px 0 0',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: activeFile === filename ? '700' : '500',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.3s'
                    }}
                  >
                    {filename}
                  </button>
                ))}
              </div>

              {/* Monaco Editor */}
              <div style={{ flex: 1 }}>
                <Editor
                  height="100%"
                  language={getLanguage(activeFile)}
                  value={files[activeFile]}
                  onChange={handleFileChange}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: true },
                    fontSize: 13,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                    formatOnPaste: true,
                    formatOnType: true
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface - Bolt.new Style */}
      {previewUrl && (
        <ChatInterface
          messages={chatMessages}
          isProcessing={isChatProcessing}
          isMinimized={isChatMinimized}
          onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
          onClose={() => setIsChatMinimized(true)}
          onSendMessage={handleChatMessage}
        />
      )}
      </div>
    </div>
  );
};

export default ProfessionalWebsiteBuilder;


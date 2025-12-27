/**
 * Web App Builder - Based on Bolt.new
 * Full-stack web app builder with AI, WebContainer, and live preview
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Terminal as TerminalIcon, Code, Eye } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { streamTextFromClaude, parseArtifact } from '../../services/webapp/aiStreamService';
import { 
  bootWebContainer, 
  writeFiles, 
  installDependencies, 
  startDevServer,
  getTerminalStream,
  writeFile
} from '../../services/webapp/webcontainerService';

const WebAppBuilder = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [view, setView] = useState('split'); // 'code', 'preview', 'split'
  
  const messagesEndRef = useRef(null);
  const terminalRef = useRef(null);
  const terminalInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Initialize terminal
  useEffect(() => {
    if (terminalRef.current && !terminalInstanceRef.current) {
      const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
        },
      });

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(terminalRef.current);
      fitAddon.fit();

      terminalInstanceRef.current = terminal;
      fitAddonRef.current = fitAddon;

      // Connect to WebContainer terminal
      initializeTerminal(terminal);
    }

    return () => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
        terminalInstanceRef.current = null;
      }
    };
  }, []);

  const initializeTerminal = async (terminal) => {
    try {
      const shellProcess = await getTerminalStream();
      
      shellProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            terminal.write(data);
          },
        })
      );

      const input = shellProcess.input.getWriter();
      terminal.onData((data) => {
        input.write(data);
      });
    } catch (error) {
      console.error('Terminal initialization error:', error);
      terminal.writeln('Failed to initialize terminal');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    try {
      let fullResponse = '';

      await streamTextFromClaude(
        [...messages, userMessage],
        (chunk) => {
          fullResponse += chunk;
          setStreamingContent(fullResponse);
        },
        async (finalText) => {
          setIsStreaming(false);
          setStreamingContent('');
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: finalText,
          }]);

          // Parse and execute artifact
          const artifact = parseArtifact(finalText);
          if (artifact) {
            await executeArtifact(artifact);
          }
        },
        (error) => {
          setIsStreaming(false);
          setStreamingContent('');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Error: ${error.message}`,
          }]);
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const executeArtifact = async (artifact) => {
    console.log('Executing artifact:', artifact);
    
    try {
      await bootWebContainer();
      
      const fileActions = artifact.actions.filter(a => a.type === 'file');
      const shellActions = artifact.actions.filter(a => a.type === 'shell');

      // Write files
      const fileNodes = fileActions.map(action => ({
        type: 'file',
        name: action.filePath.split('/').pop(),
        path: action.filePath,
        content: action.content,
      }));

      if (fileNodes.length > 0) {
        await writeFiles(fileNodes, (progress) => {
          console.log('File written:', progress.path);
        });
        
        setFiles(fileNodes);
        if (fileNodes.length > 0) {
          setSelectedFile(fileNodes[0]);
        }
      }

      // Execute shell commands
      for (const action of shellActions) {
        const commands = action.content.split('&&').map(c => c.trim());
        
        for (const cmd of commands) {
          const [command, ...args] = cmd.split(' ');
          
          console.log(`Running: ${cmd}`);
          
          if (command === 'npm' && args[0] === 'install') {
            await installDependencies((output) => {
              console.log(output);
            });
          } else if (cmd.includes('npm run dev') || cmd.includes('vite')) {
            await startDevServer(
              (url) => {
                console.log('Server ready:', url);
                setPreviewUrl(url);
              },
              (output) => {
                console.log(output);
              }
            );
          }
        }
      }
    } catch (error) {
      console.error('Artifact execution error:', error);
    }
  };

  const handleEditorChange = async (value) => {
    if (selectedFile && value !== undefined) {
      // Update file content
      const updatedFiles = files.map(f => 
        f.path === selectedFile.path ? { ...f, content: value } : f
      );
      setFiles(updatedFiles);
      
      // Write to WebContainer
      try {
        await writeFile(selectedFile.path, value);
      } catch (error) {
        console.error('File write error:', error);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="h-14 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h1 className="text-white font-semibold">DAGGPT Web App Builder</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('code')}
            className={`px-3 py-1.5 rounded text-sm ${view === 'code' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('split')}
            className={`px-3 py-1.5 rounded text-sm ${view === 'split' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Split
          </button>
          <button
            onClick={() => setView('preview')}
            className={`px-3 py-1.5 rounded text-sm ${view === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="w-80 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <p className="text-sm">Describe your web app and I'll build it for you</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[90%] px-3 py-2 rounded-lg text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-[#3e3e42] text-gray-200'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {streamingContent && (
                  <div className="text-left">
                    <div className="inline-block max-w-[90%] px-3 py-2 rounded-lg text-sm bg-[#3e3e42] text-gray-200">
                      {streamingContent}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-[#3e3e42]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your web app..."
                className="flex-1 px-3 py-2 bg-[#3e3e42] text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Code Editor */}
        {(view === 'code' || view === 'split') && (
          <div className={`${view === 'split' ? 'flex-1' : 'flex-1'} flex flex-col bg-[#1e1e1e]`}>
            {/* File Tabs */}
            {files.length > 0 && (
              <div className="h-10 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center px-2 overflow-x-auto">
                {files.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedFile(file)}
                    className={`px-3 py-1.5 text-sm whitespace-nowrap ${
                      selectedFile?.path === file.path
                        ? 'bg-[#1e1e1e] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
            )}

            {/* Editor */}
            <div className="flex-1">
              {selectedFile ? (
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={selectedFile.content}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No file selected
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview */}
        {(view === 'preview' || view === 'split') && (
          <div className={`${view === 'split' ? 'flex-1' : 'flex-1'} bg-white`}>
            {previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="Preview"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Preview will appear here
              </div>
            )}
          </div>
        )}
      </div>

      {/* Terminal */}
      <div className="h-48 bg-[#1e1e1e] border-t border-[#3e3e42]">
        <div className="h-8 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center px-4">
          <TerminalIcon className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-400">Terminal</span>
        </div>
        <div ref={terminalRef} className="h-40" />
      </div>
    </div>
  );
};

export default WebAppBuilder;

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VoiceInputButton from './VoiceInputButton';

const AIChatCanvas = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [researchMode, setResearchMode] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    console.log('🚀 handleSend called', { inputLength: input.length, attachedFilesCount: attachedFiles.length });
    
    if (!input.trim() && attachedFiles.length === 0) {
      console.log('⚠️ Blocked: No input or files');
      return;
    }

    console.log('📦 Starting file conversion...', attachedFiles);

    // Convert files to base64
    const fileData = await Promise.all(
      attachedFiles.map(async (file) => {
        return new Promise((resolve, reject) => {
          console.log('📖 Reading file:', file.name, file.type);
          const reader = new FileReader();
          
          reader.onloadend = () => {
            console.log('✅ FileReader onloadend triggered');
            const fileInfo = {
              type: file.type,
              name: file.name,
              data: reader.result // base64 string
            };
            console.log('📎 File prepared:', { name: fileInfo.name, type: fileInfo.type, dataLength: fileInfo.data?.length });
            resolve(fileInfo);
          };
          
          reader.onerror = (error) => {
            console.error('❌ FileReader error:', error);
            reject(error);
          };
          
          reader.onabort = () => {
            console.error('❌ FileReader aborted');
            reject(new Error('File reading aborted'));
          };
          
          console.log('📖 Starting readAsDataURL...');
          reader.readAsDataURL(file.file);
        });
      })
    );

    console.log('📤 Sending files:', fileData.map(f => ({ name: f.name, type: f.type })));

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      files: fileData.length > 0 ? fileData : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      console.log('Sending chat request:', { model: selectedModel, researchMode, filesCount: fileData.length });
      
      // Use localhost for development, relative path for production
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/chat'
        : '/api/chat';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel,
          researchMode: researchMode
        })
      });

      console.log('Response received:', response.status, response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error (${response.status}): ${errorText.substring(0, 100)}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        sources: []
      };

      setMessages(prev => [...prev, assistantMessage]);

      console.log('Starting to read stream...');
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream complete. Total chunks:', chunkCount);
          break;
        }

        chunkCount++;
        const chunk = decoder.decode(value);
        console.log(`Chunk ${chunkCount}:`, chunk.substring(0, 100));
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('Parsed data:', data);
              
              if (data.type === 'content') {
                assistantMessage.content += data.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
              } else if (data.type === 'sources') {
                assistantMessage.sources = data.sources;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
              } else if (data.type === 'error') {
                assistantMessage.content = `❌ ${data.error}`;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
                break; // Stop reading stream
              }
            } catch (e) {
              console.log('JSON parse error:', e.message, 'Line:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = '❌ Error: Failed to get response.';
      
      if (error.message.includes('Quota exceeded')) {
        errorMessage = '❌ Quota Exceeded: Your Gemini API key has hit its rate limit. Please try Claude or OpenAI instead, or wait and try again later.';
      } else if (error.message.includes('401')) {
        errorMessage = '❌ Authentication Error: Invalid API key. Please check your API keys in the .env file.';
      } else if (error.message.includes('429')) {
        errorMessage = '❌ Rate Limit: Too many requests. Please wait a moment and try again.';
      } else {
        errorMessage = `❌ Error: ${error.message}`;
      }
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const copyResponse = (messageId, content) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      type: file.type
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearChat = () => {
    setMessages([]);
    setAttachedFiles([]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">AI Chat</h2>
              <p className="text-sm text-gray-400 mt-1">
                {researchMode ? '🔍 Research Mode - Web search enabled' : '💬 Chat Mode'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Research Mode Toggle */}
              <button
                onClick={() => setResearchMode(!researchMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  researchMode
                    ? 'bg-brand-purple text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>🔍</span>
                  <span>Research</span>
                </span>
              </button>

              {/* Model Selector */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm border border-gray-700 focus:border-brand-purple focus:outline-none"
              >
                <option value="gemini">Gemini 2.0 Flash</option>
                <option value="claude">Claude Sonnet 4</option>
                <option value="openai">GPT-4o (OpenAI)</option>
              </select>

              {/* Clear Chat */}
              <button
                onClick={clearChat}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-purple to-pink-600 flex items-center justify-center mb-6">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Start a Conversation</h3>
            <p className="text-gray-400 max-w-md">
              Ask me anything! I can help with coding, writing, research, and more.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-8 max-w-2xl">
              <button
                onClick={() => setInput('Explain quantum computing in simple terms')}
                className="p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-left transition-colors"
              >
                <div className="text-sm font-medium text-white mb-1">Explain a concept</div>
                <div className="text-xs text-gray-500">Quantum computing basics</div>
              </button>
              <button
                onClick={() => setInput('Write a Python function to sort an array')}
                className="p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-left transition-colors"
              >
                <div className="text-sm font-medium text-white mb-1">Code assistance</div>
                <div className="text-xs text-gray-500">Python sorting function</div>
              </button>
              <button
                onClick={() => { setInput('Latest news about AI'); setResearchMode(true); }}
                className="p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-left transition-colors"
              >
                <div className="text-sm font-medium text-white mb-1">Research mode</div>
                <div className="text-xs text-gray-500">Latest AI news</div>
              </button>
              <button
                onClick={() => setInput('Create a marketing plan for a startup')}
                className="p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-left transition-colors"
              >
                <div className="text-sm font-medium text-white mb-1">Creative writing</div>
                <div className="text-xs text-gray-500">Marketing plan</div>
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-brand-purple'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    <span className="text-sm">{message.role === 'user' ? '👤' : '🤖'}</span>
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block rounded-2xl px-4 py-3 relative group ${
                      message.role === 'user'
                        ? 'bg-brand-purple text-white rounded-tr-sm'
                        : 'bg-gray-900 text-white border border-gray-800 rounded-tl-sm'
                    }`}>
                      {/* Copy Button for Assistant Messages */}
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => copyResponse(message.id, message.content)}
                          className="absolute top-2 right-2 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedMessageId === message.id ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      )}
                      {message.role === 'assistant' ? (
                        <div className="prose prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-gray-100 prose-p:leading-relaxed prose-p:my-4 prose-strong:text-white prose-strong:font-semibold prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-li:leading-relaxed prose-code:text-pink-400 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const language = match ? match[1] : '';
                                
                                return !inline ? (
                                  <div className="relative group my-5 rounded-lg overflow-hidden border border-gray-800">
                                    {/* Language Label & Copy Button */}
                                    <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b border-gray-800">
                                      <span className="text-xs font-mono text-gray-400 uppercase">{language || 'code'}</span>
                                      <button
                                        onClick={() => copyToClipboard(String(children))}
                                        className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy
                                      </button>
                                    </div>
                                    <pre className="bg-gray-950 p-4 overflow-x-auto">
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  </div>
                                ) : (
                                  <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-400" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              table({ children }) {
                                return (
                                  <div className="overflow-x-auto my-4">
                                    <table className="min-w-full border-collapse border border-gray-700">
                                      {children}
                                    </table>
                                  </div>
                                );
                              },
                              thead({ children }) {
                                return <thead className="bg-gray-800">{children}</thead>;
                              },
                              tbody({ children }) {
                                return <tbody className="bg-gray-900">{children}</tbody>;
                              },
                              tr({ children }) {
                                return <tr className="border-b border-gray-700">{children}</tr>;
                              },
                              th({ children }) {
                                return (
                                  <th className="px-4 py-2 text-left text-white font-semibold border border-gray-700">
                                    {children}
                                  </th>
                                );
                              },
                              td({ children }) {
                                return (
                                  <td className="px-4 py-2 text-gray-300 border border-gray-700">
                                    {children}
                                  </td>
                                );
                              },
                              p({ children }) {
                                return <p className="mb-4 last:mb-0 leading-relaxed text-[15px]">{children}</p>;
                              },
                              h1({ children }) {
                                return <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-white">{children}</h1>;
                              },
                              h2({ children }) {
                                return <h2 className="text-xl font-bold mb-3 mt-5 text-white">{children}</h2>;
                              },
                              h3({ children }) {
                                return <h3 className="text-lg font-semibold mb-3 mt-4 text-white">{children}</h3>;
                              },
                              ul({ children }) {
                                return <ul className="list-disc ml-5 mb-4 space-y-2">{children}</ul>;
                              },
                              ol({ children }) {
                                return <ol className="list-decimal ml-5 mb-4 space-y-2">{children}</ol>;
                              },
                              li({ children }) {
                                return <li className="leading-relaxed text-[15px] pl-1">{children}</li>;
                              },
                              blockquote({ children }) {
                                return <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 italic text-gray-300">{children}</blockquote>;
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div>
                          {message.files && message.files.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                              {message.files.map((file, idx) => (
                                file.type.startsWith('image/') ? (
                                  <img key={idx} src={file.data} alt={file.name} className="max-w-xs rounded-lg" />
                                ) : (
                                  <div key={idx} className="px-3 py-1 bg-gray-800 rounded text-xs">
                                    📄 {file.name}
                                  </div>
                                )
                              ))}
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Icons - Grok Style */}
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-800">
                        <button
                          onClick={() => copyResponse(message.id, message.content)}
                          className="p-1.5 hover:bg-gray-800 rounded transition-colors group"
                          title="Copy response"
                        >
                          <svg className="w-4 h-4 text-gray-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-800 rounded transition-colors group"
                          title="Regenerate"
                        >
                          <svg className="w-4 h-4 text-gray-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-800 rounded transition-colors group"
                          title="Share"
                        >
                          <svg className="w-4 h-4 text-gray-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                        <div className="flex-1"></div>
                        <span className="text-xs text-gray-600">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    )}

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sources:</div>
                        {message.sources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 bg-gray-900 border border-gray-800 rounded-lg hover:border-brand-purple transition-colors"
                          >
                            <div className="text-sm font-medium text-white">{source.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{source.url}</div>
                          </a>
                        ))}
                      </div>
                    )}

                    {message.role === 'user' && (
                      <div className="text-xs text-gray-600 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-brand-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  {file.preview ? (
                    <div className="relative">
                      <img src={file.preview} alt={file.name} className="w-20 h-20 object-cover rounded-lg border border-gray-700" />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
                      <span className="text-xs text-gray-300">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-gray-600 via-gray-700 to-gray-700">
            <div className="bg-black/50 rounded-2xl overflow-hidden">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything...✦˚"
                className="w-full bg-transparent border-none p-4 text-sm text-white placeholder-gray-400 resize-none outline-none"
                rows={3}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#888 transparent'
                }}
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center space-x-2">
                  {/* File Upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.txt,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white/20 hover:text-white transition-all hover:-translate-y-1"
                    title="Attach file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24">
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8" />
                    </svg>
                  </button>

                  {/* Voice Input */}
                  <VoiceInputButton 
                    onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)}
                    className="text-white/20 hover:text-white transition-all hover:-translate-y-1"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                  className="px-4 py-2 bg-brand-purple hover:bg-brand-purple-dark disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <span>Send</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatCanvas;

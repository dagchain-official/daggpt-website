import React, { useState, useRef, useEffect } from 'react';
import VoiceInputButton from './VoiceInputButton';
import WandSparkles from './WandSparkles';

const EnhancedAIChatInput = ({ 
  prompt, 
  setPrompt, 
  onSend, 
  onFileUpload,
  disabled = false,
  dropdownDirection = 'down' // 'down' or 'up'
}) => {
  const [selectedModel, setSelectedModel] = useState('grok-4-1');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const modelDropdownRef = useRef(null);

  // AI Chat models
  const aiModels = [
    { key: 'grok-4-1', name: 'Grok 4.1', provider: 'xAI' },
    { key: 'openai', name: 'OpenAI', provider: 'OpenAI' },
    { key: 'gemini', name: 'Gemini', provider: 'Google' },
    { key: 'deepseek', name: 'Deepseek', provider: 'Deepseek' }
  ];

  const selectedModelData = aiModels.find(m => m.key === selectedModel);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setShowModelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;

    setIsEnhancing(true);
    try {
      // Call generate-image API with enhancePrompt flag (reusing same endpoint)
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/generate-image'
        : '/api/generate-image';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          enhancePrompt: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.details || errorData.error || 'Failed to enhance prompt';
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const enhanced = data.enhancedPrompt || prompt;
      
      if (!enhanced || enhanced === prompt) {
        throw new Error('No enhancement received from AI');
      }
      
      setPrompt(enhanced);
    } catch (error) {
      console.error('Prompt enhancement error:', error);
      alert(`Failed to enhance prompt: ${error.message}\n\nPlease try again or continue with your original prompt.`);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSendClick = () => {
    if (!prompt.trim() || disabled) return;
    onSend({ 
      prompt, 
      model: selectedModel
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="relative bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
      {/* Main Input Area */}
      <div className="p-2 sm:p-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask DAG GPT anything..."
          className="w-full resize-none border-none focus:outline-none text-sm sm:text-base text-gray-800 placeholder-gray-400 overflow-y-auto"
          style={{
            minHeight: '36px',
            maxHeight: '80px',
            height: 'auto'
          }}
          rows={1}
          disabled={disabled}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
          }}
        />
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200">
        {/* Left Side - All Controls Together */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* File Upload */}
          <input
            id="ai-chat-file-upload"
            type="file"
            className="hidden"
            onChange={onFileUpload}
            accept="image/*,.pdf"
            multiple
          />
          <label
            htmlFor="ai-chat-file-upload"
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Attach file"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </label>

          {/* Voice Input */}
          <VoiceInputButton 
            onTranscript={(text) => setPrompt(prev => prev + (prev ? ' ' : '') + text)}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors [&>svg]:!w-4 [&>svg]:!h-4 sm:[&>svg]:!w-5 sm:[&>svg]:!h-5"
          />

          {/* Model Selector */}
          <div className="relative" ref={modelDropdownRef}>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Select AI Model"
            >
              <span className="text-[10px] sm:text-xs font-medium text-gray-700">{selectedModelData?.name}</span>
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showModelDropdown && (
              <div className={`absolute ${dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50`}>
                <div className="p-1">
                  <p className="text-[10px] font-semibold text-gray-400 px-2 py-1.5">AI MODEL</p>
                  {aiModels.map((model) => (
                    <button
                      key={model.key}
                      onClick={() => {
                        setSelectedModel(model.key);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-all text-left ${
                        selectedModel === model.key 
                          ? 'bg-[#ff4017] text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-xs font-medium ${selectedModel === model.key ? 'text-white' : 'text-gray-800'}`}>
                        {model.name}
                      </span>
                      {selectedModel === model.key && (
                        <svg className="w-3.5 h-3.5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Magic Wand - Prompt Enhancement */}
          <button
            onClick={handleEnhancePrompt}
            disabled={!prompt.trim() || isEnhancing}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Enhance prompt with AI"
          >
            {isEnhancing ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <WandSparkles width={20} height={20} className="sm:w-6 sm:h-6" stroke="#6b21a8" />
            )}
          </button>
        </div>

        {/* Right Side - Send Button Only */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Send Button */}
          <button
            onClick={handleSendClick}
            disabled={!prompt.trim() || disabled}
            className="p-2 sm:p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all flex-shrink-0"
            title="Send message"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIChatInput;

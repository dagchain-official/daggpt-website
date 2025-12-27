import React, { useState, useRef, useEffect } from 'react';
import VoiceInputButton from './VoiceInputButton';
import WandSparkles from './WandSparkles';
import { ReactComponent as MicIcon } from '../assets/model-icons/mic.svg';
import { VIDEO_MODELS, getModelCredits } from '../config/modelCredits';
import CreditIcon from './CreditIcon';

const EnhancedVideoChatInput = ({ 
  prompt, 
  setPrompt, 
  onSend, 
  onFileUpload,
  disabled = false,
  dropdownDirection = 'down' // 'down' or 'up'
}) => {
  const [selectedModel, setSelectedModel] = useState('veo3-fast');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
  const [selectedDuration, setSelectedDuration] = useState('00:10');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const modelDropdownRef = useRef(null);
  const aspectDropdownRef = useRef(null);
  const durationDropdownRef = useRef(null);

  // Video models with credits (duration is selected separately)
  const videoModels = [
    { key: 'veo3-fast', name: 'Veo 3.1 Fast', provider: 'Google', credits: 90, supportedDurations: [8] },
    { key: 'kling-2.6', name: 'Kling 2.6', provider: 'Kuaishou', credits: 165, supportedDurations: [5, 10] },
    { key: 'grok-imagine', name: 'Grok Imagine', provider: 'xAI', credits: 30, supportedDurations: [6] },
    { key: 'sora-2', name: 'Sora 2', provider: 'OpenAI', credits: 495, supportedDurations: [10, 15] },
    { key: 'wan-2.5', name: 'Wan 2.5', provider: 'Alibaba', credits: 150, supportedDurations: [5, 10] }
  ];

  // Aspect ratios
  const aspectRatios = [
    { key: '16:9', name: 'Landscape', ratio: '16:9' },
    { key: '9:16', name: 'Portrait', ratio: '9:16' },
    { key: '1:1', name: 'Square', ratio: '1:1' },
    { key: '2:3', name: 'Vertical', ratio: '2:3' }
  ];

  // Generate durations based on selected model's supported durations
  const generateDurations = () => {
    const model = videoModels.find(m => m.key === selectedModel);
    if (!model || !model.supportedDurations) {
      return [{ key: '00:10', label: '10 sec', seconds: 10 }];
    }
    
    return model.supportedDurations.map(seconds => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      return { key: formatted, label: `${seconds} sec`, seconds };
    });
  };

  const durations = generateDurations();
  
  // Auto-adjust duration when model changes
  useEffect(() => {
    const availableDurations = generateDurations();
    const currentDurationValid = availableDurations.some(d => d.key === selectedDuration);
    if (!currentDurationValid && availableDurations.length > 0) {
      setSelectedDuration(availableDurations[0].key);
    }
  }, [selectedModel]);

  const selectedModelData = videoModels.find(m => m.key === selectedModel);
  const selectedAspectData = aspectRatios.find(r => r.key === selectedAspectRatio);
  const selectedDurationData = durations.find(d => d.key === selectedDuration);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setShowModelDropdown(false);
      }
      if (aspectDropdownRef.current && !aspectDropdownRef.current.contains(event.target)) {
        setShowAspectDropdown(false);
      }
      if (durationDropdownRef.current && !durationDropdownRef.current.contains(event.target)) {
        setShowDurationDropdown(false);
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
      
      setEnhancedPrompt(enhanced);
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
      model: selectedModel, 
      aspectRatio: selectedAspectRatio,
      duration: selectedDurationData.seconds
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Main Input Area */}
      <div className="p-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe the video you want to create..."
          className="w-full resize-none border-none focus:outline-none text-gray-800 placeholder-gray-400 overflow-y-auto"
          style={{
            minHeight: '72px',
            maxHeight: '288px',
            height: 'auto'
          }}
          rows={1}
          disabled={disabled}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 288) + 'px';
          }}
        />
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        {/* Left Side - All Controls Together */}
        <div className="flex items-center gap-2">
          {/* File Upload */}
          <input
            id="video-file-upload"
            type="file"
            className="hidden"
            onChange={onFileUpload}
            accept="image/*,video/*"
          />
          <label
            htmlFor="video-file-upload"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Attach file"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </label>

          {/* Voice Input */}
          <VoiceInputButton 
            onTranscript={(text) => setPrompt(prev => prev + (prev ? ' ' : '') + text)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          />

          {/* Model, Aspect Ratio, Duration Selectors */}
          {/* Model Selector */}
          <div className="relative" ref={modelDropdownRef}>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Select Video Model"
            >
              <span className="text-xs font-medium text-gray-700">{selectedModelData?.name}</span>
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showModelDropdown && (
              <div className={`absolute ${dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50`}>
                <div className="p-1">
                  <p className="text-[10px] font-semibold text-gray-400 px-2 py-1.5">VIDEO MODEL</p>
                  {videoModels.map((model) => (
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

          {/* Aspect Ratio Selector */}
          <div className="relative" ref={aspectDropdownRef}>
            <button
              onClick={() => setShowAspectDropdown(!showAspectDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Select Aspect Ratio"
            >
              <span className="text-xs font-medium text-gray-700">{selectedAspectData?.name}</span>
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAspectDropdown && (
              <div className={`absolute ${dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-36 bg-white rounded-lg shadow-xl border border-gray-200 z-50`}>
                <div className="p-1">
                  <p className="text-[10px] font-semibold text-gray-400 px-2 py-1.5">ASPECT RATIO</p>
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio.key}
                      onClick={() => {
                        setSelectedAspectRatio(ratio.key);
                        setShowAspectDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-all text-left ${
                        selectedAspectRatio === ratio.key 
                          ? 'bg-[#ff4017] text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-xs font-medium ${selectedAspectRatio === ratio.key ? 'text-white' : 'text-gray-800'}`}>
                        {ratio.name}
                      </span>
                      {selectedAspectRatio === ratio.key && (
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

          {/* Duration Selector */}
          <div className="relative" ref={durationDropdownRef}>
            <button
              onClick={() => setShowDurationDropdown(!showDurationDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Select Duration"
            >
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-gray-700">{selectedDuration}</span>
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDurationDropdown && (
              <div className={`absolute ${dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-28 bg-white rounded-lg shadow-xl border border-gray-200 z-50`}>
                <div className="p-1">
                  <p className="text-[10px] font-semibold text-gray-400 px-2 py-1.5">DURATION</p>
                  <div className="max-h-48 overflow-y-auto">
                    {durations.map((duration) => (
                      <button
                        key={duration.key}
                        onClick={() => {
                          setSelectedDuration(duration.key);
                          setShowDurationDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-all text-left ${
                          selectedDuration === duration.key 
                            ? 'bg-[#ff4017] text-white' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className={`text-xs font-medium ${selectedDuration === duration.key ? 'text-white' : 'text-gray-800'}`}>
                          {duration.label}
                        </span>
                        {selectedDuration === duration.key && (
                          <svg className="w-3.5 h-3.5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Magic Wand - Prompt Enhancement */}
          <button
            onClick={handleEnhancePrompt}
            disabled={!prompt.trim() || isEnhancing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Enhance prompt with AI"
          >
            {isEnhancing ? (
              <svg className="w-6 h-6 text-purple-700 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <WandSparkles width={24} height={24} stroke="#6b21a8" />
            )}
          </button>
        </div>

        {/* Right Side - Credits & Send Button */}
        <div className="flex items-center gap-4">
          {/* Credit Cost Display */}
          {selectedModelData && selectedDurationData && (
            <div className="flex items-center gap-0.5">
              <CreditIcon size={64} />
              <span className="text-base font-semibold text-purple-700">
                {(() => {
                  // Calculate credits based on model and duration
                  const baseCredits = selectedModelData.credits;
                  const duration = selectedDurationData.seconds;
                  
                  // For models with multiple durations, adjust credits proportionally
                  if (selectedModel === 'kling-2.6') {
                    return duration === 5 ? 165 : 330;
                  } else if (selectedModel === 'sora-2') {
                    return duration === 10 ? 495 : 945;
                  } else if (selectedModel === 'wan-2.5') {
                    return duration === 5 ? 150 : 300;
                  }
                  
                  // For fixed duration models, return base credits
                  return baseCredits;
                })()}
              </span>
            </div>
          )}
          
          {/* Send Button */}
          <button
            onClick={handleSendClick}
            disabled={!prompt.trim() || disabled}
            className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
            title="Generate video"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoChatInput;

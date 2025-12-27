import React, { useState, useRef } from 'react';
import VoiceInputButton from './VoiceInputButton';
import { ReactComponent as FluxIcon } from '../assets/model-icons/flux.svg';
import { ReactComponent as NanaBananaIcon } from '../assets/model-icons/nano-banana-pro.svg';
import { ReactComponent as GrokIcon } from '../assets/model-icons/grok-imagine.svg';
import { ReactComponent as OpenAIIcon } from '../assets/model-icons/4o-image.svg';
import { ReactComponent as SeedreamIcon } from '../assets/model-icons/seedream-v4.svg';
import { ReactComponent as IdeogramIcon } from '../assets/model-icons/ideogram-v3.svg';
import { ReactComponent as MidjourneyIcon } from '../assets/model-icons/midjourney.svg';
import WandSparkles from './WandSparkles';
import { ReactComponent as MicIcon } from '../assets/model-icons/mic.svg';
import CreditIcon from './CreditIcon';

const EnhancedImageChatInput = ({ 
  prompt, 
  setPrompt, 
  onSend, 
  onFileUpload,
  disabled = false,
  dropdownDirection = 'down' // 'down' or 'up'
}) => {
  const [selectedModel, setSelectedModel] = useState('flux-kontext-pro');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16_9');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const modelDropdownRef = useRef(null);
  const aspectDropdownRef = useRef(null);

  const imageModels = [
    { 
      key: 'flux-kontext-pro', 
      name: 'Flux Kontext Pro', 
      provider: 'KIE.AI',
      credits: 21,
      icon: <FluxIcon className="w-5 h-5" />
    },
    { 
      key: 'flux-kontext-max', 
      name: 'Flux Kontext Max', 
      provider: 'KIE.AI',
      credits: 36,
      icon: <FluxIcon className="w-5 h-5" />
    },
    { 
      key: 'nano-banana-pro', 
      name: 'Nano Banana Pro', 
      provider: 'KIE.AI',
      credits: 27,
      icon: <NanaBananaIcon className="w-5 h-5" />
    },
    { 
      key: 'grok-imagine', 
      name: 'Grok Imagine', 
      provider: 'xAI via KIE.AI',
      credits: 6,
      icon: <GrokIcon className="w-5 h-5" />
    },
    { 
      key: 'seedream-4.5', 
      name: 'Seedream 4.5', 
      provider: 'ByteDance via KIE.AI',
      credits: 9.75,
      icon: <SeedreamIcon className="w-5 h-5" />
    },
    { 
      key: 'ideogram-v3', 
      name: 'Ideogram v3', 
      provider: 'KIE.AI',
      credits: 15,
      icon: <IdeogramIcon className="w-5 h-5" />
    },
    { 
      key: 'midjourney', 
      name: 'Midjourney', 
      provider: 'KIE.AI',
      credits: 24,
      icon: <MidjourneyIcon className="w-5 h-5" />
    }
  ];

  const aspectRatios = [
    { 
      key: '16_9', 
      name: '16:9', 
      description: 'Widescreen',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      key: '1_1', 
      name: '1:1', 
      description: 'Square',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      key: '9_16', 
      name: '9:16', 
      description: 'Portrait',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="6" y="2" width="12" height="20" rx="2" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      key: '4_3', 
      name: '4:3', 
      description: 'Standard',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      key: '3_4', 
      name: '3:4', 
      description: 'Portrait',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="5" y="3" width="14" height="18" rx="2" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      key: '21_9', 
      name: '21:9', 
      description: 'Ultra-wide',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="1" y="7" width="22" height="10" rx="2" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setShowModelDropdown(false);
      }
      if (aspectDropdownRef.current && !aspectDropdownRef.current.contains(event.target)) {
        setShowAspectDropdown(false);
      }
    };

    // Use capture phase to ensure we catch the event before other handlers
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, []);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;

    setIsEnhancing(true);
    try {
      // Call generate-image API with enhancePrompt flag
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
      aspectRatio: selectedAspectRatio 
    });
  };

  const selectedModelData = imageModels.find(m => m.key === selectedModel);
  const selectedAspectData = aspectRatios.find(r => r.key === selectedAspectRatio);

  return (
    <div className="relative bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-visible">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
          }
        }}
        placeholder="Describe the image you want to create..."
        className="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-sm sm:text-base resize-none focus:outline-none rounded-t-xl sm:rounded-t-2xl bg-transparent text-gray-800 placeholder-gray-400 overflow-y-auto"
        style={{
          minHeight: '32px',
          maxHeight: '64px',
          height: 'auto'
        }}
        rows="1"
        disabled={disabled}
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = Math.min(e.target.scrollHeight, 64) + 'px';
        }}
      />
      
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-t border-gray-200">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink min-w-0">
          {/* Attach Image Button */}
          <input
            type="file"
            id="file-upload-image"
            accept="image/*"
            onChange={onFileUpload}
            className="hidden"
          />
          <label
            htmlFor="file-upload-image"
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Attach image"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </label>

          {/* Voice Input Button */}
          <VoiceInputButton 
            onTranscript={(transcript) => setPrompt(transcript)}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors [&>svg]:!w-4 [&>svg]:!h-4 sm:[&>svg]:!w-5 sm:[&>svg]:!h-5"
          />

          {/* Model Selector Dropdown */}
          <div className="relative z-50" ref={modelDropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModelDropdown(prev => !prev);
                setShowAspectDropdown(false);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 relative z-50"
              title="Select AI Model"
            >
              <div className="hidden sm:flex items-center justify-center w-4 h-4">{selectedModelData?.icon}</div>
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 truncate max-w-[65px] sm:max-w-none">{selectedModelData?.name}</span>
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showModelDropdown && (
              <div
                className={`absolute ${dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-1">
                  <p className="text-[10px] font-semibold text-gray-400 px-2 py-1.5">AI MODEL</p>
                  {imageModels.map((model) => (
                    <button
                      key={model.key}
                      onClick={() => {
                        setSelectedModel(model.key);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-left ${
                        selectedModel === model.key 
                          ? 'bg-[#ff4017] text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">{model.icon}</div>
                      <p className={`flex-1 text-xs font-medium truncate ${selectedModel === model.key ? 'text-white' : 'text-gray-800'}`}>
                        {model.name}
                      </p>
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

          {/* Aspect Ratio Dropdown */}
          <div className="relative" ref={aspectDropdownRef}>
            <button
              onClick={() => setShowAspectDropdown(!showAspectDropdown)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Select Aspect Ratio"
            >
              <div className="text-gray-600 w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center">
                {selectedAspectData?.icon}
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-gray-700">{selectedAspectData?.name}</span>
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAspectDropdown && (
              <div className={`absolute ${dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-50`}>
                <div className="p-1">
                  <p className="text-[10px] font-semibold text-gray-400 px-2 py-1.5">ASPECT RATIO</p>
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio.key}
                      onClick={() => {
                        setSelectedAspectRatio(ratio.key);
                        setShowAspectDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-left ${
                        selectedAspectRatio === ratio.key 
                          ? 'bg-[#ff4017] text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-4 h-4 flex items-center justify-center flex-shrink-0 ${selectedAspectRatio === ratio.key ? 'text-white' : 'text-gray-600'}`}>
                        {ratio.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${selectedAspectRatio === ratio.key ? 'text-white' : 'text-gray-800'}`}>
                          {ratio.name}
                        </p>
                        <p className={`text-[10px] ${selectedAspectRatio === ratio.key ? 'text-white/80' : 'text-gray-500'}`}>
                          {ratio.description}
                        </p>
                      </div>
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

        {/* Credits & Send Button */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Credit Cost Display */}
          {selectedModelData && (
            <div className="flex items-center gap-0.5">
              <CreditIcon size={44} className="sm:w-16 sm:h-16" />
              <span className="text-xs sm:text-base font-semibold text-purple-700">{selectedModelData.credits}</span>
            </div>
          )}
          
          {/* Send Button */}
          <button
            onClick={handleSendClick}
            disabled={disabled || !prompt.trim()}
            className="p-2 sm:p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all flex-shrink-0"
            title="Generate image"
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

export default EnhancedImageChatInput;

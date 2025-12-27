import React from 'react';
import VoiceInputButton from './VoiceInputButton';

const ContentCreationSidebar = ({ 
  activeTab,
  onTabChange,
  prompt,
  onPromptChange,
  selectedStyle,
  onStyleChange,
  aspectRatio,
  onAspectRatioChange,
  quantity,
  onQuantityChange,
  duration,
  onDurationChange,
  onGenerate,
  canGenerate,
  isGenerating,
  uploadedFile,
  onFileUpload,
  analysisPrompt,
  onAnalysisPromptChange,
  onAnalyze,
  videoProvider,
  onVideoProviderChange,
  selectedVideoModel,
  onVideoModelChange,
  enableAudio,
  onEnableAudioChange,
  audioPrompt,
  onAudioPromptChange,
  videoModels
}) => {
  const tabs = [
    { id: 'image', name: 'Image', icon: '🖼️' },
    { id: 'video', name: 'Video', icon: '🎬' },
    { id: 'audio', name: 'Audio', icon: '🎵' }
  ];

  const imageStyles = [
    { id: 'cinematic', name: 'Cinematic', gradient: 'from-purple-500 to-pink-500' },
    { id: 'anime', name: 'Anime', gradient: 'from-pink-500 to-rose-500' },
    { id: 'realistic', name: 'Realistic', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'cartoon', name: 'Cartoon', gradient: 'from-yellow-500 to-orange-500' },
    { id: 'abstract', name: 'Abstract', gradient: 'from-purple-500 to-blue-500' },
    { id: '3d-render', name: '3D Render', gradient: 'from-cyan-500 to-blue-500' },
    { id: 'watercolor', name: 'Watercolor', gradient: 'from-green-500 to-teal-500' },
    { id: 'oil-painting', name: 'Oil Painting', gradient: 'from-amber-500 to-red-500' },
    { id: 'sci-fi', name: 'Sci-Fi', gradient: 'from-indigo-500 to-purple-500' },
    { id: 'fantasy', name: 'Fantasy', gradient: 'from-violet-500 to-fuchsia-500' }
  ];

  const aspectRatios = [
    { id: '16:9', name: '16:9', desc: 'Landscape' },
    { id: '9:16', name: '9:16', desc: 'Portrait' },
    { id: '1:1', name: '1:1', desc: 'Square' },
    { id: '4:3', name: '4:3', desc: 'Classic' }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Tabs */}
      <div className="p-5 border-b border-white/10">
        <div className="flex space-x-2 bg-gray-900 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-purple text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 space-y-6">
        {activeTab === 'image' && (
          <>
            {/* Prompt */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Image Description
              </label>
              <div className="relative">
                <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-gray-600 via-gray-700 to-gray-700">
                  <div className="bg-black/50 rounded-2xl overflow-hidden relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => onPromptChange(e.target.value)}
                      placeholder="Describe the image you want to create...✦˚"
                      className="w-full h-32 bg-transparent border-none p-4 text-sm text-white placeholder-gray-400 resize-none outline-none"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#888 transparent'
                      }}
                    />
                    <div className="flex items-center justify-between px-3 pb-3">
                      <div className="flex items-center space-x-2">
                        <button 
                          type="button"
                          className="text-white/20 hover:text-white transition-all hover:-translate-y-1"
                          title="Attach reference"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8" />
                          </svg>
                        </button>
                        <button 
                          type="button"
                          className="text-white/20 hover:text-white transition-all hover:-translate-y-1"
                          title="Enhance with AI"
                        >
                          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </button>
                        <VoiceInputButton 
                          onTranscript={(text) => onPromptChange(prompt + text)}
                          className=""
                        />
                      </div>
                      <div className="text-xs text-gray-600 font-mono">
                        {prompt.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Style Selection */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {imageStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => onStyleChange(style.id)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      selectedStyle === style.id
                        ? 'bg-gradient-to-r ' + style.gradient + ' text-white'
                        : 'bg-gray-900 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => onAspectRatioChange(ratio.id)}
                    className={`px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                      aspectRatio === ratio.id
                        ? 'bg-brand-purple text-white'
                        : 'bg-gray-900 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <div className="font-bold">{ratio.name}</div>
                    <div className="text-[10px] mt-1">{ratio.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Quantity: {quantity}
              </label>
              <input
                type="range"
                min="1"
                max="4"
                value={quantity}
                onChange={(e) => onQuantityChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-brand-purple"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1 image</span>
                <span>4 images</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={onGenerate}
              disabled={!canGenerate || isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                canGenerate && !isGenerating
                  ? 'bg-gradient-to-r from-brand-purple to-pink-500 hover:shadow-lg hover:shadow-brand-purple/50'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                '✨ Generate Images'
              )}
            </button>

            {/* AI Info */}
            <div className="glass-effect border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Powered by DAG GPT</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'video' && (
          <>
            {/* Video Type Selection */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Video Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onStyleChange('dialogue')}
                  className={`px-3 py-3 rounded-lg text-xs font-medium transition-all ${
                    selectedStyle === 'dialogue'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  <div className="text-lg mb-1">💬</div>
                  <div>Dialogue & SFX</div>
                </button>
                <button
                  onClick={() => onStyleChange('cinematic')}
                  className={`px-3 py-3 rounded-lg text-xs font-medium transition-all ${
                    selectedStyle === 'cinematic'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  <div className="text-lg mb-1">🎬</div>
                  <div>Cinematic</div>
                </button>
                <button
                  onClick={() => onStyleChange('animation')}
                  className={`px-3 py-3 rounded-lg text-xs font-medium transition-all ${
                    selectedStyle === 'animation'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  <div className="text-lg mb-1">✨</div>
                  <div>Animation</div>
                </button>
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Video Description
              </label>
              <div className="relative">
                <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-gray-600 via-gray-700 to-gray-700">
                  <div className="bg-black/50 rounded-2xl overflow-hidden relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => onPromptChange(e.target.value)}
                      placeholder={
                        selectedStyle === 'dialogue' 
                          ? 'Describe the video with dialogue and sound effects...✦˚'
                          : selectedStyle === 'cinematic'
                          ? 'Describe the cinematic video scene...✦˚'
                          : 'Describe the animation you want to create...✦˚'
                      }
                      className="w-full h-32 bg-transparent border-none p-4 text-sm text-white placeholder-gray-400 resize-none outline-none"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#888 transparent'
                      }}
                    />
                    <div className="flex items-center justify-between px-3 pb-3">
                      <div className="flex items-center space-x-2">
                        <button 
                          type="button"
                          className="text-white/20 hover:text-white transition-all hover:-translate-y-1"
                          title="Attach reference"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8" />
                          </svg>
                        </button>
                        <button 
                          type="button"
                          className="text-white/20 hover:text-white transition-all hover:-translate-y-1"
                          title="Enhance with AI"
                        >
                          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </button>
                        <VoiceInputButton 
                          onTranscript={(text) => onPromptChange(prompt + text)}
                          className=""
                        />
                      </div>
                      <div className="text-xs text-gray-600 font-mono">
                        {prompt.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {selectedStyle === 'dialogue' && '💡 Use quotes for dialogue. Describe sound effects explicitly.'}
                {selectedStyle === 'cinematic' && '💡 Include camera motion, composition, and lighting details.'}
                {selectedStyle === 'animation' && '💡 Specify animation style (cartoon, anime, 3D) and movement.'}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => onAspectRatioChange(ratio.id)}
                    className={`px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                      aspectRatio === ratio.id
                        ? 'bg-brand-purple text-white'
                        : 'bg-gray-900 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <div className="font-bold">{ratio.name}</div>
                    <div className="text-[10px] mt-1">{ratio.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Duration: {duration}s
              </label>
              <input
                type="range"
                min="4"
                max="141"
                step="1"
                value={duration}
                onChange={(e) => onDurationChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-brand-purple"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>4s</span>
                <span>141s</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {duration <= 8 ? (
                  `Single scene video (${duration}s)`
                ) : (
                  <>
                    <span className="text-green-400">✨ Multi-scene generation</span>
                    <br />
                    {duration}s video = {Math.ceil(duration / 8)} scene{Math.ceil(duration / 8) > 1 ? 's' : ''} (automatic sequencing)
                  </>
                )}
              </div>
            </div>

            {/* Video Provider Selection */}
            {videoProvider && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                  🎬 Video Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onVideoProviderChange('videogenapi')}
                    className={`px-4 py-3 rounded-lg text-xs font-medium transition-all ${
                      videoProvider === 'videogenapi'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-900 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <div className="text-lg mb-1">⚡</div>
                    <div>VideoGenAPI</div>
                    <div className="text-[10px] opacity-70 mt-1">Sora 2 + Audio</div>
                  </button>
                  <button
                    onClick={() => onVideoProviderChange('freepik')}
                    className={`px-4 py-3 rounded-lg text-xs font-medium transition-all ${
                      videoProvider === 'freepik'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-gray-900 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <div className="text-lg mb-1">🎨</div>
                    <div>Freepik</div>
                    <div className="text-[10px] opacity-70 mt-1">MiniMax</div>
                  </button>
                </div>
              </div>
            )}

            {/* AI Model Selection (VideoGenAPI only) */}
            {videoProvider === 'videogenapi' && videoModels && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                  🤖 AI Model
                </label>
                <select
                  value={selectedVideoModel}
                  onChange={(e) => onVideoModelChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-lg text-sm text-white focus:border-brand-purple focus:outline-none"
                >
                  <optgroup label="🆓 Free Models">
                    <option value="sora-2">⭐ Sora 2 - OpenAI (1080p, 10s)</option>
                    <option value="kling_25">Kling 2.5 - Kuaishou (1080p, 5-10s)</option>
                    <option value="higgsfield_v1">Higgsfield V1 (1080p, 5-15s)</option>
                    <option value="pixverse">Pixverse V5 (1080p, 5-8s)</option>
                    <option value="ltxv-2">🎬 LTV Video 2 (4K, 6-10s)</option>
                    <option value="seedance">Seedance (1080p, 5-10s)</option>
                    <option value="wan-25">Wan 2.5 (1080p, 5-10s)</option>
                    <option value="nanobanana-video">Nano Banana (720p, 5-10s)</option>
                    <option value="ltxv-13b">LTX-Video 13B (480p, 1-60s)</option>
                  </optgroup>
                  <optgroup label="💎 Premium Models">
                    <option value="veo_3">Veo 3 Fast - Google (1080p, 8s, Native Audio)</option>
                    <option value="veo-31">Veo 3.1 Fast - Google (1080p, 8s, Native Audio)</option>
                  </optgroup>
                </select>
                <div className="text-xs text-gray-500 mt-2">
                  {selectedVideoModel === 'sora-2' && '⭐ Sora 2: Best quality, fixed 10s clips, OpenAI'}
                  {selectedVideoModel === 'kling_25' && '🎬 Kling 2.5: Great quality, 5-10s flexible'}
                  {selectedVideoModel === 'higgsfield_v1' && '🚀 Higgsfield: Fast generation, 5-15s'}
                  {selectedVideoModel === 'pixverse' && '📹 Pixverse V5: Good quality, 5-8s'}
                  {selectedVideoModel === 'ltxv-2' && '🎬 LTV Video 2: 4K quality, 6-10s'}
                  {selectedVideoModel === 'seedance' && '💃 Seedance: Smooth motion, 5-10s'}
                  {selectedVideoModel === 'wan-25' && '🌊 Wan 2.5: Balanced quality, 5-10s'}
                  {selectedVideoModel === 'nanobanana-video' && '🍌 Nano Banana: Fast & efficient, 720p'}
                  {selectedVideoModel === 'ltxv-13b' && '⏱️ LTX-Video 13B: Flexible 1-60s duration!'}
                  {selectedVideoModel === 'veo_3' && '💎 Veo 3: Native audio, premium, 8s fixed'}
                  {selectedVideoModel === 'veo-31' && '💎 Veo 3.1: Latest Google, native audio, 8s'}
                </div>
              </div>
            )}

            {/* Audio Enhancement Toggle (VideoGenAPI only) */}
            {videoProvider === 'videogenapi' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                  🎵 Audio Enhancement
                </label>
                <div className="bg-gray-900 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white">Add AI Audio</span>
                      <span className="text-xs text-gray-500">(Mirelo SFX V1.5)</span>
                    </div>
                    <button
                      onClick={() => onEnableAudioChange(!enableAudio)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enableAudio ? 'bg-brand-purple' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enableAudio ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {enableAudio && (
                    <div>
                      <input
                        type="text"
                        value={audioPrompt}
                        onChange={(e) => onAudioPromptChange(e.target.value)}
                        placeholder="Custom audio prompt (optional)..."
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-brand-purple focus:outline-none"
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        💡 Leave empty for automatic audio detection, or describe specific sounds
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {enableAudio ? (
                    <span className="text-green-400">✅ Audio will be added automatically</span>
                  ) : (
                    <span className="text-gray-500">Silent video (no audio)</span>
                  )}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={onGenerate}
              disabled={!canGenerate || isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                canGenerate && !isGenerating
                  ? 'bg-gradient-to-r from-brand-purple to-pink-500 hover:shadow-lg hover:shadow-brand-purple/50'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                '🎬 Generate Video'
              )}
            </button>

            {/* AI Info */}
            <div className="glass-effect border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Powered by DAG GPT</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'audio' && (
          <>
            {/* File Upload */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Upload Audio File
              </label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-brand-purple/50 transition-colors">
                <input
                  type="file"
                  accept={activeTab === 'video' ? 'video/*' : 'audio/*'}
                  onChange={onFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-3">{activeTab === 'video' ? '🎬' : '🎵'}</div>
                  <p className="text-sm text-gray-400 mb-2">
                    {uploadedFile ? uploadedFile.name : `Click to upload ${activeTab}`}
                  </p>
                  <p className="text-xs text-gray-600">
                    {activeTab === 'video' ? 'MP4, MOV, AVI up to 100MB' : 'MP3, WAV, M4A up to 50MB'}
                  </p>
                </label>
              </div>
            </div>

            {/* Analysis Prompt */}
            {uploadedFile && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                    What would you like to know?
                  </label>
                  <div className="relative">
                    <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-gray-600 via-gray-700 to-gray-700">
                      <div className="bg-black/50 rounded-2xl overflow-hidden relative">
                        <textarea
                          value={analysisPrompt}
                          onChange={(e) => onAnalysisPromptChange(e.target.value)}
                          placeholder={`Ask questions about this ${activeTab}...✦˚`}
                          className="w-full h-32 bg-transparent border-none p-4 text-sm text-white placeholder-gray-400 resize-none outline-none"
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#888 transparent'
                          }}
                        />
                        <div className="flex items-center justify-between px-3 pb-3">
                          <div className="flex items-center space-x-2">
                            <button 
                              type="button"
                              className="text-white/20 hover:text-white transition-all hover:-translate-y-1"
                              title="Attach reference"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8" />
                              </svg>
                            </button>
                            <button 
                              type="button"
                              className="text-white/20 hover:text-white transition-all hover:-translate-y-1"
                              title="Enhance with AI"
                            >
                              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </button>
                            <VoiceInputButton 
                              onTranscript={(text) => onAnalysisPromptChange(analysisPrompt + text)}
                              className=""
                            />
                          </div>
                          <div className="text-xs text-gray-600 font-mono">
                            {analysisPrompt.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analyze Button */}
                <button
                  onClick={onAnalyze}
                  disabled={!analysisPrompt || isGenerating}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                    analysisPrompt && !isGenerating
                      ? 'bg-gradient-to-r from-brand-purple to-pink-500 hover:shadow-lg hover:shadow-brand-purple/50'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    `🔍 Analyze ${activeTab === 'video' ? 'Video' : 'Audio'}`
                  )}
                </button>

                {/* AI Info */}
                <div className="glass-effect border border-white/10 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Powered by DAG GPT</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContentCreationSidebar;

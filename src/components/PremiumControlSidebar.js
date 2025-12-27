import React from 'react';

const PremiumControlSidebar = ({ 
  contentTypes, 
  activeTab, 
  onTabChange,
  prompt,
  onPromptChange,
  videoStyles,
  imageStyles,
  audioTypes,
  musicGenres,
  selectedStyle,
  onStyleSelect,
  aspectRatios,
  aspectRatio,
  onAspectRatioChange,
  quantity,
  onQuantityChange,
  duration,
  onDurationChange,
  onGenerate,
  canGenerate
}) => {
  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Content Type Selector */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Content Type</div>
          
          <div className="flex gap-1.5">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onTabChange(type.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-lg border transition-all ${
                  activeTab === type.id
                    ? 'bg-brand-purple border-brand-purple text-white'
                    : 'border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-lg mb-0.5">{type.icon}</span>
                <span className="text-[10px] font-medium">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Video Controls */}
        {activeTab === 'video' && (
          <div className="flex-1 p-5 space-y-6">
            {/* Prompt */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Video Prompt
              </label>
              <div className="relative">
                {/* Chat-style input container */}
                <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-gray-600 via-gray-700 to-gray-700">
                  <div className="bg-black/50 rounded-2xl overflow-hidden">
                    <textarea
                      value={prompt}
                      onChange={(e) => onPromptChange(e.target.value)}
                      placeholder="Imagine Something...✦˚"
                      className="w-full h-28 bg-transparent border-none p-4 text-sm text-white placeholder-gray-400 resize-none outline-none"
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
                          title="Attach files"
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
                      </div>
                      <div className="text-xs text-gray-600 font-mono">
                        {prompt.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Styles */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Visual Style
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {videoStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => onStyleSelect(style.id)}
                    className="group relative"
                  >
                    {/* Card */}
                    <div className={`relative p-3 rounded-xl border transition-all ${
                      selectedStyle === style.id
                        ? 'bg-brand-purple/20 border-brand-purple'
                        : 'glass-effect border-white/10 hover:border-white/20'
                    }`}>
                      <div className="text-2xl mb-2">{style.preview}</div>
                      <div className="text-xs font-bold text-white">{style.name}</div>
                      
                      {selectedStyle === style.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Aspect Ratio
              </label>
              <div className="flex gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => onAspectRatioChange(ratio.id)}
                    className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-lg border transition-all ${
                      aspectRatio === ratio.id
                        ? 'bg-brand-purple border-brand-purple text-white'
                        : 'border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xl mb-1">{ratio.icon}</span>
                    <span className="text-[10px] font-medium mb-0.5">{ratio.name}</span>
                    <span className="text-[9px] text-gray-500">{ratio.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Duration</label>
                <span className="text-sm font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {formatDuration(duration)}
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="120"
                step="8"
                value={duration}
                onChange={(e) => onDurationChange(parseInt(e.target.value))}
                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[8, 16, 24, 32, 48].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onDurationChange(sec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      duration === sec
                        ? 'bg-brand-purple text-white'
                        : 'glass-effect border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {formatDuration(sec)}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={onGenerate}
              disabled={!canGenerate}
              className="relative w-full py-4 rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
            >
              {/* Button */}
              <div className="relative bg-brand-purple hover:bg-brand-purple-dark rounded-xl py-4 flex items-center justify-center space-x-2 text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Generate Video</span>
              </div>
            </button>

            {/* Pipeline */}
            <div className="glass-effect border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">AI Pipeline</span>
              </div>
              <div className="space-y-2">
                {[
                  'Prompt Enhancement',
                  'JSON Conversion',
                  'Image Generation',
                  `Video Chunks (${Math.ceil(duration / 8)})`,
                  'Audio Generation',
                  'Final Stitching'
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                      <span className="text-gray-400 font-bold text-[10px]">{idx + 1}</span>
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image Controls */}
        {activeTab === 'image' && (
          <div className="flex-1 p-5 space-y-6">
            {/* Prompt */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Image Prompt
              </label>
              <div className="relative">
                <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-gray-600 via-gray-700 to-gray-700">
                  <div className="bg-black/50 rounded-2xl overflow-hidden">
                    <textarea
                      value={prompt}
                      onChange={(e) => onPromptChange(e.target.value)}
                      placeholder="Describe your image...✦˚"
                      className="w-full h-28 bg-transparent border-none p-4 text-sm text-white placeholder-gray-400 resize-none outline-none"
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
                      </div>
                      <div className="text-xs text-gray-600 font-mono">
                        {prompt.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Styles */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Art Style
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {imageStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => onStyleSelect(style.id)}
                    className="group relative"
                  >
                    <div className={`relative p-3 rounded-xl border transition-all ${
                      selectedStyle === style.id
                        ? 'bg-brand-purple/20 border-brand-purple'
                        : 'glass-effect border-white/10 hover:border-white/20'
                    }`}>
                      <div className="text-2xl mb-2">{style.preview}</div>
                      <div className="text-xs font-bold text-white">{style.name}</div>
                      
                      {selectedStyle === style.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Aspect Ratio
              </label>
              <div className="flex gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => onAspectRatioChange(ratio.id)}
                    className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-lg border transition-all ${
                      aspectRatio === ratio.id
                        ? 'bg-brand-purple border-brand-purple text-white'
                        : 'border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xl mb-1">{ratio.icon}</span>
                    <span className="text-[10px] font-medium mb-0.5">{ratio.name}</span>
                    <span className="text-[9px] text-gray-500">{ratio.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Quantity
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => onQuantityChange(num)}
                    className={`flex-1 py-2.5 rounded-lg border transition-all ${
                      quantity === num
                        ? 'bg-brand-purple border-brand-purple text-white'
                        : 'border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-bold">{num}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={onGenerate}
              disabled={!canGenerate}
              className="relative w-full py-4 rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
            >
              <div className="relative bg-brand-purple hover:bg-brand-purple-dark rounded-xl py-4 flex items-center justify-center space-x-2 text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">Generate Image</span>
              </div>
            </button>

            {/* AI Pipeline */}
            <div className="glass-effect border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">AI Pipeline</span>
              </div>
              <div className="space-y-2">
                {[
                  'Prompt Enhancement',
                  'Style Application',
                  'Image Generation',
                  'Quality Enhancement'
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                      <span className="text-gray-400 font-bold text-[10px]">{idx + 1}</span>
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audio Controls */}
        {activeTab === 'audio' && (
          <div className="flex-1 p-5 space-y-6">
            {/* Prompt */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Audio Prompt
              </label>
              <div className="relative">
                <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-gray-600 via-gray-700 to-gray-700">
                  <div className="bg-black/50 rounded-2xl overflow-hidden">
                    <textarea
                      value={prompt}
                      onChange={(e) => onPromptChange(e.target.value)}
                      placeholder="Describe your audio...✦˚"
                      className="w-full h-28 bg-transparent border-none p-4 text-sm text-white placeholder-gray-400 resize-none outline-none"
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
                      </div>
                      <div className="text-xs text-gray-600 font-mono">
                        {prompt.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Type */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Audio Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {audioTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => onStyleSelect(type.id)}
                    className="group relative"
                  >
                    <div className={`relative p-3 rounded-xl border transition-all ${
                      selectedStyle === type.id
                        ? 'bg-brand-purple/20 border-brand-purple'
                        : 'glass-effect border-white/10 hover:border-white/20'
                    }`}>
                      <div className="text-2xl mb-2">{type.preview}</div>
                      <div className="text-xs font-bold text-white">{type.name}</div>
                      
                      {selectedStyle === type.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Music Genre (only show if music type selected) */}
            {selectedStyle === 'music' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                  Music Genre
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {musicGenres.map((genre) => (
                    <button
                      key={genre.id}
                      className="group relative"
                    >
                      <div className="relative p-3 rounded-xl border glass-effect border-white/10 hover:border-white/20 transition-all">
                        <div className="text-2xl mb-2">{genre.preview}</div>
                        <div className="text-xs font-bold text-white">{genre.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Quantity
              </label>
              <div className="flex gap-2">
                {[1, 2].map((num) => (
                  <button
                    key={num}
                    onClick={() => onQuantityChange(num)}
                    className={`flex-1 py-2.5 rounded-lg border transition-all ${
                      quantity === num
                        ? 'bg-brand-purple border-brand-purple text-white'
                        : 'border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-bold">{num}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Duration</label>
                <span className="text-sm font-semibold text-white">
                  {duration}s
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="180"
                step="5"
                value={duration}
                onChange={(e) => onDurationChange(parseInt(e.target.value))}
                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[15, 30, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onDurationChange(sec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      duration === sec
                        ? 'bg-brand-purple text-white'
                        : 'glass-effect border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={onGenerate}
              disabled={!canGenerate}
              className="relative w-full py-4 rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
            >
              <div className="relative bg-brand-purple hover:bg-brand-purple-dark rounded-xl py-4 flex items-center justify-center space-x-2 text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span className="font-semibold">Generate Audio</span>
              </div>
            </button>

            {/* AI Pipeline */}
            <div className="glass-effect border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">AI Pipeline</span>
              </div>
              <div className="space-y-2">
                {[
                  'Prompt Analysis',
                  'Audio Synthesis',
                  'Quality Enhancement',
                  'Format Conversion'
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                      <span className="text-gray-400 font-bold text-[10px]">{idx + 1}</span>
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default PremiumControlSidebar;

import React, { useState } from 'react';
import VoiceInputButton from './VoiceInputButton';

const WebsiteCreationSidebar = ({ 
  prompt, 
  onPromptChange, 
  websiteType,
  onWebsiteTypeChange,
  colorScheme,
  onColorSchemeChange,
  onGenerate,
  canGenerate,
  isGenerating,
  generationProgress,
  generatedWebsite,
  showControls,
  onNewWebsite,
  mode,
  onModeChange,
  cloneUrl,
  onCloneUrlChange
}) => {
  const [localMode, setLocalMode] = useState(mode || 'create');
  const websiteTypes = [
    { id: 'landing', name: 'Landing Page', icon: '🚀', description: 'Single page website' },
    { id: 'portfolio', name: 'Portfolio', icon: '💼', description: 'Showcase your work' },
    { id: 'blog', name: 'Blog', icon: '📝', description: 'Content-focused site' },
    { id: 'ecommerce', name: 'E-Commerce', icon: '🛒', description: 'Online store' },
    { id: 'dashboard', name: 'Dashboard', icon: '📊', description: 'Admin panel' },
    { id: 'saas', name: 'SaaS', icon: '☁️', description: 'Software service' }
  ];

  const colorSchemes = [
    { id: 'modern', name: 'Modern', colors: ['#3B82F6', '#8B5CF6', '#EC4899'] },
    { id: 'professional', name: 'Professional', colors: ['#1F2937', '#6B7280', '#3B82F6'] },
    { id: 'vibrant', name: 'Vibrant', colors: ['#F59E0B', '#EF4444', '#8B5CF6'] },
    { id: 'minimal', name: 'Minimal', colors: ['#000000', '#FFFFFF', '#6B7280'] },
    { id: 'nature', name: 'Nature', colors: ['#10B981', '#059669', '#34D399'] },
    { id: 'sunset', name: 'Sunset', colors: ['#F97316', '#EF4444', '#FCD34D'] }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {generatedWebsite && !isGenerating && !showControls ? (
        // Post-Generation View - Chat History with Edit Options
        <div className="flex-1 p-5 flex flex-col">
          {/* Back Button */}
          <button
            onClick={onNewWebsite}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">New Website</span>
          </button>

          <div className="flex-1 space-y-4 overflow-y-auto mb-4">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-brand-purple rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm text-white">{prompt}</p>
                <div className="text-[10px] text-white/60 mt-1">
                  {websiteType} • {colorScheme}
                </div>
              </div>
            </div>

            {/* AI Success Response */}
            <div className="flex justify-start">
              <div className="glass-effect border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-bold text-gray-400">DAG GPT</span>
                </div>
                <p className="text-sm text-white mb-2">✨ Website generated successfully!</p>
                <p className="text-xs text-gray-400">Your {websiteType} website is ready. You can view it in the preview or make further changes.</p>
              </div>
            </div>
          </div>

          {/* Edit Options */}
          <div className="space-y-3">
            <div className="glass-effect border border-white/10 rounded-xl p-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Quick Actions
              </div>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors text-left flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span>Change Colors</span>
                </button>
                <button className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors text-left flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Content</span>
                </button>
                <button className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors text-left flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Section</span>
                </button>
              </div>
            </div>

            {/* Website Info */}
            <div className="glass-effect border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400">GENERATED</span>
                <span className="text-xs text-green-500">● Active</span>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="text-white capitalize">{websiteType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Theme:</span>
                  <span className="text-white capitalize">{colorScheme}</span>
                </div>
                <div className="flex justify-between">
                  <span>Model:</span>
                  <span className="text-white">Gemini 2.0 Flash</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : isGenerating ? (
        // Chat Interface During Generation
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto mb-4">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-brand-purple rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm text-white">{prompt}</p>
                <div className="text-[10px] text-white/60 mt-1">
                  {websiteType} • {colorScheme}
                </div>
              </div>
            </div>

            {/* AI Response - Analyzing */}
            <div className="flex justify-start">
              <div className="glass-effect border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-gray-400">DAG GPT</span>
                </div>
                <p className="text-sm text-white">Analyzing your requirements...</p>
              </div>
            </div>

            {/* AI Response - Generating Structure */}
            {generationProgress >= 1 && (
              <div className="flex justify-start">
                <div className="glass-effect border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-white">Creating website structure...</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-purple rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                    <span className="text-xs text-gray-500">60%</span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Response - Applying Styles */}
            {generationProgress >= 2 && (
              <div className="flex justify-start">
                <div className="glass-effect border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-white">Applying {colorScheme} color scheme...</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-purple rounded-full animate-pulse" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-xs text-gray-500">85%</span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Response - Finalizing */}
            {generationProgress >= 3 && (
              <div className="flex justify-start">
                <div className="glass-effect border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-white">Finalizing your website...</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-purple rounded-full" style={{width: '100%'}}></div>
                    </div>
                    <span className="text-xs text-green-500">✓</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generation Info */}
          <div className="glass-effect border border-white/10 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-brand-purple rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-gray-400">GENERATING</span>
            </div>
            <p className="text-xs text-gray-500">
              Using Google Gemini 2.0 Flash to build your {websiteType} website
            </p>
          </div>
        </div>
      ) : (
        // Normal Controls
        <div className="flex-1 p-5 space-y-6">
        {/* Mode Selector */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
            Generation Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setLocalMode('create');
                onModeChange && onModeChange('create');
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                localMode === 'create'
                  ? 'border-brand-purple bg-brand-purple/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">✨</div>
              <div className="text-sm font-bold text-white">Create New</div>
              <div className="text-xs text-gray-400 mt-1">From description</div>
            </button>
            <button
              onClick={() => {
                setLocalMode('clone');
                onModeChange && onModeChange('clone');
              }}
              className={`p-4 rounded-xl border-2 transition-all ${
                localMode === 'clone'
                  ? 'border-brand-purple bg-brand-purple/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-bold text-white">Clone Website</div>
              <div className="text-xs text-gray-400 mt-1">Copy existing site</div>
            </button>
          </div>
        </div>

        {/* URL Input (Clone Mode) */}
        {localMode === 'clone' && (
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
              Website URL
            </label>
            <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-gray-600 via-gray-700 to-gray-700">
              <div className="bg-black/50 rounded-2xl overflow-hidden">
                <input
                  type="url"
                  value={cloneUrl || ''}
                  onChange={(e) => onCloneUrlChange && onCloneUrlChange(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-transparent border-none p-4 text-sm text-white placeholder-gray-400 outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Enter a URL to clone the actual website structure and design (e.g., https://apple.com)
            </p>
          </div>
        )}

        {/* Prompt (Create Mode) */}
        {localMode === 'create' && (
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
              Website Description
            </label>
          <div className="relative">
            <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-gray-600 via-gray-700 to-gray-700">
              <div className="bg-black/50 rounded-2xl overflow-hidden relative">
                <textarea
                  value={prompt}
                  onChange={(e) => onPromptChange(e.target.value)}
                  placeholder="Describe the website you want to create...✦˚"
                  className="w-full h-32 bg-transparent border-none p-4 pr-12 text-sm text-white placeholder-gray-400 resize-none outline-none"
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
        )}

        {/* Website Type (Create Mode Only) */}
        {localMode === 'create' && (
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
            Website Type
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
            {websiteTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onWebsiteTypeChange(type.id)}
                className="group relative"
              >
                <div className={`relative p-3 rounded-xl border transition-all ${
                  websiteType === type.id
                    ? 'bg-brand-purple/20 border-brand-purple'
                    : 'glass-effect border-white/10 hover:border-white/20'
                }`}>
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-xs font-bold text-white mb-1">{type.name}</div>
                  <div className="text-[10px] text-gray-500">{type.description}</div>
                  
                  {websiteType === type.id && (
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
        )}

        {/* Color Scheme (Create Mode Only) */}
        {localMode === 'create' && (
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
            Color Scheme
          </label>
          <div className="grid grid-cols-2 gap-2">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => onColorSchemeChange(scheme.id)}
                className="group relative"
              >
                <div className={`relative p-3 rounded-xl border transition-all ${
                  colorScheme === scheme.id
                    ? 'bg-brand-purple/20 border-brand-purple'
                    : 'glass-effect border-white/10 hover:border-white/20'
                }`}>
                  <div className="flex space-x-1 mb-2">
                    {scheme.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-md"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-bold text-white">{scheme.name}</div>
                  
                  {colorScheme === scheme.id && (
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
        )}

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="relative w-full py-4 rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
        >
          <div className="relative bg-brand-purple hover:bg-brand-purple-dark rounded-xl py-4 flex items-center justify-center space-x-2 text-white transition-colors">
            {isGenerating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-semibold">Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span className="font-semibold">Generate Website</span>
              </>
            )}
          </div>
        </button>

        {/* AI Info */}
        <div className="glass-effect border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Powered by DAG GPT</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Gemini 2.0 Flash Model</span>
            </div>
            <div className="text-[10px] text-gray-600">
              Advanced AI-powered website generation with stunning UI designs
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteCreationSidebar;

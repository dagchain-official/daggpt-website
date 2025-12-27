import React from 'react';

const NeumorphicChatCard = ({ typedText, staticLabel = "Ask Anything:", isFeatureSection = false, activeFeature = null, portraitMode = false, mobileActive = false, customHeight = null }) => {
  const featureButtons = [
    { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', label: 'Ai Chat', id: 'chat' },
    { icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Image', id: 'image' },
    { icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', label: 'Video', id: 'video' },
    { icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', label: 'Website Builder', id: 'website' },
    { icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', label: 'All', id: 'all' }
  ];

  // Determine active button: use activeFeature prop if provided, otherwise default based on section
  const activeButton = activeFeature || (isFeatureSection ? 'image' : 'chat');

  return (
    <div className={`relative w-full ${portraitMode ? 'max-w-[400px] mx-auto' : 'max-w-[700px]'}`}>
      {/* Main Card */}
      <div style={{ background: 'linear-gradient(145deg, #ffffff, #f0f0f0)', borderRadius: '32px', boxShadow: '0 0 1px rgba(0,0,0,0.1), 8px 8px 20px rgba(0,0,0,0.15), -8px -8px 20px rgba(255,255,255,0.9), inset 0 0 0 1px rgba(255,255,255,0.5)' }}>
        {/* Feature Buttons */}
        <div className="flex items-center justify-center gap-2 px-6 py-4 flex-wrap">
          {featureButtons.map((btn, i) => {
            const isActive = btn.id === activeButton;
            return (
              <button 
                key={i} 
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}
                style={{ 
                  background: isActive ? 'linear-gradient(145deg, #8b5cf6, #6366f1)' : 'linear-gradient(145deg, #ffffff, #e6e6e6)', 
                  borderRadius: '12px', 
                  boxShadow: isActive ? '3px 3px 6px rgba(99, 102, 241, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.1)' : '3px 3px 6px #d1d1d1, -3px -3px 6px #ffffff'
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={btn.icon} />
                </svg>
                <span>{btn.label}</span>
              </button>
            );
          })}
          <button className="p-1.5 ml-1" style={{ background: 'linear-gradient(145deg, #ffffff, #e6e6e6)', borderRadius: '8px', boxShadow: '2px 2px 4px #d1d1d1, -2px -2px 4px #ffffff' }}>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Header - Only show in hero section */}
        {!isFeatureSection && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900">Design systems consist of reusable components</p>
            <button className="p-1.5" style={{ background: 'linear-gradient(145deg, #ffffff, #e6e6e6)', borderRadius: '8px', boxShadow: '2px 2px 4px #d1d1d1, -2px -2px 4px #ffffff' }}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        )}

        {/* Input Area - Inset */}
        <div 
          className={`mx-6 my-4 px-6 py-8 ${customHeight ? '' : (portraitMode ? 'min-h-[280px]' : 'min-h-[120px]')}`} 
          style={{ 
            background: 'linear-gradient(145deg, #e6e6e6, #ffffff)', 
            borderRadius: '20px', 
            boxShadow: 'inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff',
            ...(customHeight && { minHeight: customHeight })
          }}
        >
          <p className="text-base text-gray-600">
            <span className="font-semibold">{staticLabel} </span>
            <span className="text-gray-700">{typedText}</span>
            <span className="text-[#6366f1] animate-pulse font-bold">▌</span>
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Mobile</span>
              <div className="w-10 h-5 relative cursor-pointer" style={{ 
                background: mobileActive ? 'linear-gradient(145deg, #8b5cf6, #6366f1)' : 'linear-gradient(145deg, #e6e6e6, #ffffff)', 
                borderRadius: '12px', 
                boxShadow: mobileActive ? 'inset 2px 2px 4px rgba(99, 102, 241, 0.3)' : 'inset 2px 2px 4px #d1d1d1, inset -2px -2px 4px #ffffff' 
              }}>
                <div className={`absolute ${mobileActive ? 'right-0.5' : 'left-0.5'} top-0.5 w-4 h-4`} style={{ 
                  background: 'linear-gradient(145deg, #ffffff, #e6e6e6)', 
                  borderRadius: '50%', 
                  boxShadow: mobileActive ? '2px 2px 4px rgba(0,0,0,0.2)' : '2px 2px 4px #d1d1d1, -2px -2px 4px #ffffff' 
                }}></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Web</span>
              <div className="w-10 h-5 relative cursor-pointer" style={{ 
                background: !mobileActive ? 'linear-gradient(145deg, #8b5cf6, #6366f1)' : 'linear-gradient(145deg, #e6e6e6, #ffffff)', 
                borderRadius: '12px', 
                boxShadow: !mobileActive ? 'inset 2px 2px 4px rgba(99, 102, 241, 0.3)' : 'inset 2px 2px 4px #d1d1d1, inset -2px -2px 4px #ffffff' 
              }}>
                <div className={`absolute ${!mobileActive ? 'right-0.5' : 'left-0.5'} top-0.5 w-4 h-4`} style={{ 
                  background: 'linear-gradient(145deg, #ffffff, #f0f0f0)', 
                  borderRadius: '50%', 
                  boxShadow: '2px 2px 4px rgba(0,0,0,0.2)' 
                }}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2" style={{ background: 'linear-gradient(145deg, #ffffff, #e6e6e6)', borderRadius: '10px', boxShadow: '3px 3px 6px #d1d1d1, -3px -3px 6px #ffffff' }}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <button className="p-2.5" style={{ background: 'linear-gradient(145deg, #8b5cf6, #6366f1)', borderRadius: '12px', boxShadow: '4px 4px 8px rgba(99, 102, 241, 0.3)' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeumorphicChatCard;

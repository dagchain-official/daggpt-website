import React from 'react';

const ContentCreators = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white">
      {/* Navigation - Neumorphic Style */}
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-gray-100 to-gray-50" style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 -2px 4px rgba(255,255,255,0.9)'
      }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-3 group">
              <div className="relative rounded-xl p-1" style={{
                boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -6px -6px 12px rgba(255,255,255,0.9)'
              }}>
                <img src="/images/logo8.jpg" alt="DAG GPT Logo" className="h-10 w-auto object-contain rounded-lg" />
              </div>
              <span className="text-xl font-bold text-[#251b18]" style={{ 
                fontFamily: 'Nasalization, sans-serif',
                textShadow: '2px 2px 4px rgba(255,255,255,0.9), -1px -1px 2px rgba(0,0,0,0.1)'
              }}>DAG GPT</span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm font-medium text-gray-700 hover:text-[#6366f1] transition-all px-4 py-2 rounded-xl" style={{
                boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.1), inset -3px -3px 6px rgba(255,255,255,0.9)'
              }}>
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section - Neumorphic */}
        <section className="py-20 bg-gradient-to-br from-gray-100 via-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-block px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-50 text-[#6366f1] rounded-full text-sm font-semibold mb-6" style={{
                boxShadow: '8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.9), inset 2px 2px 4px rgba(255,255,255,0.5)'
              }}>
                🎬 For Content Creators & Influencers
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#251b18] mb-6 leading-tight" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>
                Create <span className="text-[#6366f1]" style={{
                  textShadow: '2px 2px 4px rgba(99,102,241,0.3)'
                }}>10x More Content</span> in Half the Time
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Stop spending hours on content creation. Use AI to generate videos, images, scripts, and thumbnails instantly. 
                Focus on what matters - engaging with your audience.
              </p>
            </div>
          </div>
        </section>

        {/* Problems Section - Neumorphic */}
        <section className="py-20 bg-gradient-to-br from-gray-100 via-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#251b18] mb-4" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>The Creator's Dilemma</h2>
              <p className="text-xl text-gray-600">Sound familiar? You're not alone.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mb-4" style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)'
                }}>
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#251b18] mb-3">Time-Consuming Production</h3>
                <p className="text-gray-600">
                  Spending 8-12 hours editing a single video. Thumbnail design takes another 2 hours. Writing scripts and captions eats up your entire day.
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mb-4" style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)'
                }}>
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#251b18] mb-3">Inconsistent Posting</h3>
                <p className="text-gray-600">
                  Algorithms punish irregular uploads. You know you need to post daily, but creating quality content consistently feels impossible.
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mb-4" style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)'
                }}>
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#251b18] mb-3">High Production Costs</h3>
                <p className="text-gray-600">
                  Hiring editors ($500/video), designers ($100/thumbnail), and copywriters ($50/script) drains your budget before you see ROI.
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mb-4" style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)'
                }}>
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#251b18] mb-3">Creative Burnout</h3>
                <p className="text-gray-600">
                  Coming up with fresh ideas every day is exhausting. Writer's block hits when you're on a deadline. Creativity can't be forced.
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mb-4" style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)'
                }}>
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#251b18] mb-3">Slow Growth</h3>
                <p className="text-gray-600">
                  Posting once a week means slow subscriber growth. Competitors posting daily are eating your lunch. You're falling behind.
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mb-4" style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)'
                }}>
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#251b18] mb-3">Multi-Platform Struggle</h3>
                <p className="text-gray-600">
                  YouTube, TikTok, Instagram, Twitter - each needs different formats. Repurposing content manually takes hours you don't have.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section - Neumorphic */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#251b18] mb-4" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>Your AI-Powered Content Studio</h2>
              <p className="text-xl text-gray-600">Everything you need to create, edit, and publish - all in one place</p>
            </div>

            {/* Feature 1: AI Video Generation */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <div className="inline-block px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-50 text-[#8b5cf6] rounded-full text-sm font-semibold mb-4" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.9)'
                }}>
                  ⚡ Lightning Fast
                </div>
                <h3 className="text-3xl font-bold text-[#251b18] mb-4">AI Video Generation</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Type your idea, get a professional video in minutes. No editing skills required. Perfect for YouTube Shorts, TikTok, Instagram Reels, and full-length videos.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#8b5cf6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Text-to-Video:</strong> Describe your video, AI creates it</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#8b5cf6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Auto B-Roll:</strong> AI adds relevant footage automatically</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#8b5cf6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Voice Synthesis:</strong> Professional narration in any voice</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#8b5cf6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Auto Captions:</strong> Subtitles generated and synced perfectly</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-8 h-96 flex items-center justify-center" style={{
                boxShadow: '20px 20px 40px rgba(0,0,0,0.15), -20px -20px 40px rgba(255,255,255,0.9), inset 5px 5px 10px rgba(255,255,255,0.5)'
              }}>
                <div className="text-center">
                  <svg className="w-24 h-24 text-[#8b5cf6] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 font-medium">Video Demo</p>
                </div>
              </div>
            </div>

            {/* Feature 2: AI Image Generation */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div className="order-2 lg:order-1 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-8 h-96 flex items-center justify-center" style={{
                boxShadow: '20px 20px 40px rgba(0,0,0,0.15), -20px -20px 40px rgba(255,255,255,0.9), inset 5px 5px 10px rgba(255,255,255,0.5)'
              }}>
                <div className="text-center">
                  <svg className="w-24 h-24 text-[#8b5cf6] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 font-medium">Image Gallery</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-50 text-[#8b5cf6] rounded-full text-sm font-semibold mb-4" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.9)'
                }}>
                  🎨 Stunning Visuals
                </div>
                <h3 className="text-3xl font-bold text-[#251b18] mb-4">AI Image & Thumbnail Generator</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Create scroll-stopping thumbnails and social media graphics that get clicks. No design experience needed.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#8b5cf6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>YouTube Thumbnails:</strong> High-CTR designs in seconds</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#8b5cf6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Social Media Posts:</strong> Instagram, Twitter, Facebook ready</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#8b5cf6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Brand Consistency:</strong> Maintains your style across all images</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#8b5cf6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Variations:</strong> Generate 10 options, pick the best</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3: AI Script Writer */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-50 text-[#8b5cf6] rounded-full text-sm font-semibold mb-4" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.9)'
                }}>
                  ✍️ Perfect Copy
                </div>
                <h3 className="text-3xl font-bold text-[#251b18] mb-4">AI Script & Caption Writer</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Never stare at a blank page again. Get engaging scripts, captions, and descriptions that match your voice.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#8b5cf6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Video Scripts:</strong> Full scripts with hooks and CTAs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#8b5cf6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Captions:</strong> Engaging captions that drive engagement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#8b5cf6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Hashtag Research:</strong> Trending hashtags for maximum reach</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#8b5cf6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Voice Matching:</strong> Writes in your unique style</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-8 h-96 flex items-center justify-center" style={{
                boxShadow: '20px 20px 40px rgba(0,0,0,0.15), -20px -20px 40px rgba(255,255,255,0.9), inset 5px 5px 10px rgba(255,255,255,0.5)'
              }}>
                <div className="text-center">
                  <svg className="w-24 h-24 text-[#8b5cf6] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p className="text-gray-600 font-medium">Script Examples</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default ContentCreators;

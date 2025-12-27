import React, { useState, useEffect } from 'react';

/**
 * Professional Social Media Automation Tool
 * Complete redesign with competitor analysis and intelligent content generation
 */
const SocialMediaAutomationPro = () => {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  
  // Analysis data
  const [brandAnalysis, setBrandAnalysis] = useState(null);
  const [competitorReport, setCompetitorReport] = useState(null);
  const [contentStrategy, setContentStrategy] = useState(null);
  const [contentCalendar, setContentCalendar] = useState([]);
  
  // UI state
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [generatingMedia, setGeneratingMedia] = useState({});

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  // Step 1: Analyze Website
  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl.trim()) {
      addLog('Please enter a valid website URL', 'error');
      return;
    }

    setIsProcessing(true);
    addLog('🌐 Analyzing your website...', 'info');

    try {
      const apiUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001/api/social-media-automation'
        : '/api/social-media-automation';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_website',
          data: { websiteUrl, productImage }
        })
      });

      if (!response.ok) throw new Error('Website analysis failed');

      const result = await response.json();
      setBrandAnalysis(result.data);
      
      addLog(`✅ Website analyzed: ${result.data.brand_name}`, 'success');
      addLog(`📊 Industry: ${result.data.industry}`, 'info');
      addLog(`🎯 Target Audience: ${result.data.target_audience}`, 'info');
      addLog(`🛍️ Found ${result.data.key_products?.length || 0} products`, 'info');
      
      setCurrentStep(2);
      
      // Auto-start competitor analysis
      setTimeout(() => handleFindCompetitors(result.data), 1000);

    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Find Competitors
  const handleFindCompetitors = async (brandData = brandAnalysis) => {
    setIsProcessing(true);
    addLog('🔍 Discovering competitors...', 'info');

    try {
      const apiUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001/api/social-media-automation'
        : '/api/social-media-automation';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'find_competitors',
          data: { websiteUrl, brandAnalysis: brandData }
        })
      });

      if (!response.ok) throw new Error('Competitor analysis failed');

      const result = await response.json();
      setCompetitorReport(result.data);
      
      addLog(`✅ Found ${result.data.competitors.length} competitors`, 'success');
      result.data.competitors.forEach((comp, i) => {
        addLog(`   ${i + 1}. ${comp.name} - ${comp.market_position}`, 'info');
      });
      
      setCurrentStep(3);
      
      // Auto-start strategy generation
      setTimeout(() => handleGenerateStrategy(brandData, result.data), 1000);

    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Generate Strategy
  const handleGenerateStrategy = async (brandData = brandAnalysis, compReport = competitorReport) => {
    setIsProcessing(true);
    addLog('🎯 Creating content strategy...', 'info');

    try {
      const apiUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001/api/social-media-automation'
        : '/api/social-media-automation';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_strategy',
          data: { brandAnalysis: brandData, competitorReport: compReport }
        })
      });

      if (!response.ok) throw new Error('Strategy generation failed');

      const result = await response.json();
      setContentStrategy(result.data);
      
      addLog('✅ Content strategy created', 'success');
      addLog(`📝 Content Pillars: ${result.data.content_pillars?.length || 0}`, 'info');
      addLog(`📱 Platforms: Instagram, Facebook, Twitter, TikTok`, 'info');
      
      setCurrentStep(4);

    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 4: Generate Calendar
  const handleGenerateCalendar = async () => {
    setIsProcessing(true);
    addLog('📅 Generating 4-week content calendar...', 'info');

    try {
      const apiUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001/api/social-media-automation'
        : '/api/social-media-automation';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_calendar',
          data: { brandAnalysis, contentStrategy, competitorReport }
        })
      });

      if (!response.ok) throw new Error('Calendar generation failed');

      const result = await response.json();
      setContentCalendar(result.data);
      
      addLog(`✅ Generated ${result.data.length} days of content`, 'success');
      addLog('🎉 Ready to generate media!', 'success');
      
      setCurrentStep(5);

    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate media for a post
  const handleGenerateMedia = async (day, platform, mediaType) => {
    const key = `${day}-${platform}-${mediaType}`;
    setGeneratingMedia(prev => ({ ...prev, [key]: true }));
    addLog(`🎨 Generating ${mediaType} for Day ${day} - ${platform}...`, 'info');

    try {
      const postData = contentCalendar.find(p => p.day === day);
      
      const apiUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001/api/social-media-automation'
        : '/api/social-media-automation';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_post_media',
          data: { 
            postData, 
            mediaType, 
            platform,
            brandColors: brandAnalysis?.colors || [],
            brandName: brandAnalysis?.name || 'Brand'
          }
        })
      });

      if (!response.ok) throw new Error('Media generation failed');

      const result = await response.json();
      
      // Update calendar with generated media
      setContentCalendar(prev => prev.map(post => {
        if (post.day === day) {
          return {
            ...post,
            generated_media: {
              ...post.generated_media,
              [platform]: {
                ...post.generated_media?.[platform],
                [mediaType]: result.data
              }
            }
          };
        }
        return post;
      }));
      
      addLog(`✅ ${mediaType} generated for Day ${day} - ${platform}`, 'success');

    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setGeneratingMedia(prev => ({ ...prev, [key]: false }));
    }
  };

  // Platform icons
  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: '📷',
      facebook: '👥',
      twitter: '🐦',
      tiktok: '🎵'
    };
    return icons[platform] || '📱';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      instagram: 'from-purple-500 to-pink-500',
      facebook: 'from-blue-600 to-blue-700',
      twitter: 'from-gray-800 to-black',
      tiktok: 'from-black to-gray-900'
    };
    return colors[platform] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Social Media Automation
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                AI-powered competitor analysis & viral content generation
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: 'Website Analysis', icon: '🌐' },
              { num: 2, title: 'Competitor Research', icon: '🔍' },
              { num: 3, title: 'Content Strategy', icon: '🎯' },
              { num: 4, title: 'Calendar Generation', icon: '📅' },
              { num: 5, title: 'Media Creation', icon: '🎨' }
            ].map((step, index) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all
                    ${currentStep >= step.num 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-400'}
                  `}>
                    {currentStep > step.num ? '✓' : step.icon}
                  </div>
                  <div className={`mt-2 text-sm font-medium ${currentStep >= step.num ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {step.title}
                  </div>
                </div>
                {index < 4 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${currentStep > step.num ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input & Analysis */}
          <div className="lg:col-span-1 space-y-6">
            {/* Step 1: Website Input */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🌐</span> Your Brand
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website URL *
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    disabled={currentStep > 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductImage(e.target.files[0])}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    disabled={currentStep > 1}
                  />
                </div>

                <button
                  onClick={handleAnalyzeWebsite}
                  disabled={isProcessing || currentStep > 1}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing && currentStep === 1 ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : currentStep > 1 ? '✓ Analyzed' : '🚀 Start Analysis'}
                </button>
              </div>
            </div>

            {/* Brand Analysis Summary */}
            {brandAnalysis && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📊</span> Brand Profile
                </h3>
                <div className="space-y-3 text-sm">
                  {/* Brand Logo Display */}
                  {brandAnalysis.logo_url && (
                    <div className="flex items-center justify-center mb-4 p-4 bg-white rounded-lg">
                      <img 
                        src={brandAnalysis.logo_url}
                        alt={`${brandAnalysis.brand_name} logo`}
                        className="max-w-[120px] max-h-[80px] object-contain"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">{brandAnalysis.brand_name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Industry:</span>
                    <span className="ml-2 text-gray-900">{brandAnalysis.industry}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Audience:</span>
                    <span className="ml-2 text-gray-900">{brandAnalysis.target_audience}</span>
                  </div>
                  {brandAnalysis.brand_personality && (
                    <div>
                      <span className="font-semibold text-gray-700">Personality:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {brandAnalysis.brand_personality.map((trait, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-medium">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Competitor Summary */}
            {competitorReport && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🔍</span> Competitors Found
                </h3>
                <div className="space-y-3">
                  {competitorReport.competitors.map((comp, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="font-semibold text-gray-900">{comp.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{comp.market_position}</div>
                      
                      {/* Meta Ads Section */}
                      {comp.meta_ads && comp.meta_ads.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-purple-100">
                          <div className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                            <span>📢</span> Real Meta Ads ({comp.meta_ads.length})
                          </div>
                          <div className="space-y-3">
                            {comp.meta_ads.slice(0, 2).map((ad, adIdx) => (
                              <div key={adIdx} className="bg-purple-50 rounded p-3 text-xs border border-purple-200">
                                {/* Ad Creative Image/Video */}
                                {ad.image_url && (
                                  <div className="mb-3 rounded overflow-hidden bg-white">
                                    {ad.media_type === 'video' ? (
                                      <img 
                                        src={ad.image_url} 
                                        alt={ad.headline}
                                        className="w-full h-auto object-cover"
                                        onError={(e) => e.target.style.display = 'none'}
                                      />
                                    ) : (
                                      <img 
                                        src={ad.image_url} 
                                        alt={ad.headline}
                                        className="w-full h-auto object-cover"
                                        onError={(e) => e.target.style.display = 'none'}
                                      />
                                    )}
                                  </div>
                                )}
                                
                                <div className="font-semibold text-gray-800 mb-1">{ad.headline}</div>
                                <div className="text-gray-600 mb-2 line-clamp-3">{ad.description}</div>
                                
                                {/* Ad Snapshot Link */}
                                {ad.ad_snapshot_url && (
                                  <a 
                                    href={ad.ad_snapshot_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block mb-2 text-blue-600 hover:text-blue-800 underline"
                                  >
                                    🔗 View Full Ad
                                  </a>
                                )}
                                
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded">{ad.format}</span>
                                  <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded">{ad.platform}</span>
                                  {ad.estimated_impressions !== 'N/A' && (
                                    <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded">
                                      👁️ {ad.estimated_impressions}
                                    </span>
                                  )}
                                </div>
                                
                                {ad.page_name && (
                                  <div className="text-xs text-gray-500 mt-2">
                                    Page: {ad.page_name}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Log */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span> Activity Log
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      log.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                      log.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <span className="text-xs text-gray-500 mr-2">{log.timestamp}</span>
                    {log.message}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Content & Calendar */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep < 4 && (
              <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {currentStep === 1 && '🌐'}
                    {currentStep === 2 && '🔍'}
                    {currentStep === 3 && '🎯'}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentStep === 1 && 'Enter Your Website URL'}
                    {currentStep === 2 && 'Analyzing Competitors...'}
                    {currentStep === 3 && 'Creating Content Strategy...'}
                  </h3>
                  <p className="text-gray-600">
                    {currentStep === 1 && 'Start by entering your website URL to begin the analysis'}
                    {currentStep === 2 && 'Our AI is discovering and researching your competitors'}
                    {currentStep === 3 && 'Building a winning content strategy based on market insights'}
                  </p>
                  {isProcessing && (
                    <div className="mt-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && !contentCalendar.length && (
              <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Generate Content Calendar
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Generate 28 days of viral-worthy content optimized for all platforms
                  </p>
                  <button
                    onClick={handleGenerateCalendar}
                    disabled={isProcessing}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Generating...' : '🚀 Generate 4-Week Calendar'}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 5 && contentCalendar.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>📅</span> 4-Week Content Calendar
                  </h2>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(week => (
                      <button
                        key={week}
                        onClick={() => setSelectedWeek(week)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedWeek === week
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Week {week}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-3">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-bold text-gray-700 py-2 bg-gray-50 rounded-lg">
                      {day}
                    </div>
                  ))}
                  
                  {Array.from({ length: 7 }).map((_, index) => {
                    const dayNum = (selectedWeek - 1) * 7 + index + 1;
                    const post = contentCalendar.find(p => p.day === dayNum);
                    
                    return (
                      <div
                        key={index}
                        onClick={() => post && setSelectedDay(dayNum)}
                        className={`
                          min-h-32 p-3 rounded-xl border-2 cursor-pointer transition-all
                          ${post ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300 hover:shadow-lg hover:scale-105' : 'bg-gray-50 border-gray-200'}
                          ${selectedDay === dayNum ? 'ring-4 ring-indigo-500 ring-opacity-50' : ''}
                        `}
                      >
                        {post && (
                          <>
                            <div className="font-bold text-indigo-600 mb-2">Day {dayNum}</div>
                            <div className="text-xs text-gray-600 line-clamp-2">
                              {post.theme}
                            </div>
                            <div className="flex gap-1 mt-2">
                              {['instagram', 'facebook', 'twitter', 'tiktok'].map(platform => (
                                <span key={platform} className="text-xs">
                                  {getPlatformIcon(platform)}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Selected Day Details */}
                {selectedDay && contentCalendar.find(p => p.day === selectedDay) && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-indigo-500">
                    {(() => {
                      const post = contentCalendar.find(p => p.day === selectedDay);
                      return (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                              Day {selectedDay}: {post.theme}
                            </h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                              {post.content_type}
                            </span>
                          </div>

                          {/* Platform Content */}
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(post.platforms).map(([platform, content]) => (
                              <div key={platform} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-bold mb-3 bg-gradient-to-r ${getPlatformColor(platform)}`}>
                                  <span>{getPlatformIcon(platform)}</span>
                                  <span className="capitalize">{platform}</span>
                                </div>
                                
                                <div className="text-sm text-gray-700 mb-3 line-clamp-3">
                                  {content.caption || content.post || content.tweet}
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleGenerateMedia(selectedDay, platform, 'image')}
                                    disabled={generatingMedia[`${selectedDay}-${platform}-image`]}
                                    className="flex-1 px-3 py-2 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                  >
                                    {generatingMedia[`${selectedDay}-${platform}-image`] ? '⏳' : '🖼️'} Image
                                  </button>
                                  {platform === 'tiktok' && (
                                    <button
                                      onClick={() => handleGenerateMedia(selectedDay, platform, 'video')}
                                      disabled={generatingMedia[`${selectedDay}-${platform}-video`]}
                                      className="flex-1 px-3 py-2 bg-purple-500 text-white text-xs font-semibold rounded-lg hover:bg-purple-600 disabled:opacity-50"
                                    >
                                      {generatingMedia[`${selectedDay}-${platform}-video`] ? '⏳' : '🎬'} Video
                                    </button>
                                  )}
                                </div>

                                {/* Display generated media with logo overlay */}
                                {post.generated_media?.[platform]?.image && (
                                  <div className="mt-3 relative">
                                    <img 
                                      src={post.generated_media[platform].image} 
                                      alt={`${platform} post`}
                                      className="w-full rounded-lg"
                                    />
                                    {/* Logo overlay in top-left corner */}
                                    {brandAnalysis?.logo_url && (
                                      <img 
                                        src={brandAnalysis.logo_url}
                                        alt={`${brandAnalysis.brand_name} logo`}
                                        className="absolute top-4 left-4 w-16 h-16 object-contain bg-white/90 rounded-lg p-2 shadow-lg"
                                        onError={(e) => e.target.style.display = 'none'}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaAutomationPro;

import React, { useState, useEffect, useRef } from 'react';
import ProfessionalAdOverlay from './ProfessionalAdOverlay';

const SocialMediaAutomation = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [campaignData, setCampaignData] = useState(null);
  const [activeTab, setActiveTab] = useState('setup');
  const [logs, setLogs] = useState([]);
  const [contentCalendar, setContentCalendar] = useState([]);
  const [brandAnalysis, setBrandAnalysis] = useState(null);
  const [userUploadedImages, setUserUploadedImages] = useState({}); // Store user uploaded images per post
  const [selectedDate, setSelectedDate] = useState(1); // Currently selected day (1-14)
  const [currentView, setCurrentView] = useState('month'); // month, week, day
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [popupDate, setPopupDate] = useState(null);
  const [platformTimes, setPlatformTimes] = useState({});
  const [bulkTime, setBulkTime] = useState('');
  const [processingTextOverlays, setProcessingTextOverlays] = useState({});

  // Platform configuration with official branding and SVG icons
  const getPlatformConfig = (platform) => {
    const configs = {
      instagram: {
        name: 'Instagram',
        icon: (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        ),
        bgClass: 'bg-gradient-to-r from-purple-500 to-pink-500',
        textClass: 'text-white',
        buttonClass: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
      },
      facebook: {
        name: 'Facebook',
        icon: (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        ),
        bgClass: 'bg-blue-600',
        textClass: 'text-white',
        buttonClass: 'bg-blue-600 text-white hover:bg-blue-700'
      },
      twitter: {
        name: 'X (Twitter)',
        icon: (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        ),
        bgClass: 'bg-black',
        textClass: 'text-white',
        buttonClass: 'bg-black text-white hover:bg-gray-800'
      },
      x: {
        name: 'X (Twitter)',
        icon: (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        ),
        bgClass: 'bg-black',
        textClass: 'text-white',
        buttonClass: 'bg-black text-white hover:bg-gray-800'
      },
      tiktok: {
        name: 'TikTok',
        icon: (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        ),
        bgClass: 'bg-black',
        textClass: 'text-white',
        buttonClass: 'bg-black text-white hover:bg-gray-800'
      }
    };
    return configs[platform] || configs.instagram;
  };

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl.trim()) {
      addLog('Please enter a valid website URL', 'error');
      return;
    }

    setIsAnalyzing(true);
    addLog('🔍 Starting website analysis...', 'info');
    
    try {
      // Call the backend API to create campaign
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/social-media-create-campaign'
        : '/api/social-media-create-campaign';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      });

      if (!response.ok) throw new Error('Failed to create campaign');

      const data = await response.json();
      
      addLog('✅ Website analyzed successfully!', 'success');
      addLog(`🤖 AI Model: ${data.ai_model}`, 'info');
      addLog(`📊 Brand Analysis: ${data.brand_analysis?.brand_name || 'Brand analyzed'}`, 'info');
      addLog(`📅 Generated ${data.posts?.length || 0} days of content`, 'info');
      
      // Log scraped product information
      if (data.scraped_data) {
        addLog(`🛍️ Found ${data.scraped_data.products_found} real products on website`, 'success');
        addLog(`🖼️ Found ${data.scraped_data.product_images_found} product images`, 'success');
        if (data.scraped_data.products_found > 0) {
          data.scraped_data.products.forEach((product, index) => {
            if (index < 3) { // Show first 3 products
              addLog(`   • ${product.name}${product.price ? ` - ${product.price}` : ''}`, 'info');
            }
          });
        }
      }
      
      setCampaignData(data);
      setBrandAnalysis(data.brand_analysis || data.brand_profile);
      setContentCalendar(data.posts || []);
      setActiveTab('calendar');
      
      // Start generating images for posts with task IDs
      const postsWithImages = data.posts?.filter(p => p.image_task_id);
      if (postsWithImages && postsWithImages.length > 0) {
        addLog(`🎨 Generating ${postsWithImages.length} images...`, 'info');
        pollImageGeneration(postsWithImages);
      }
      
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (postIndex, file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserUploadedImages(prev => ({
          ...prev,
          [postIndex]: {
            file: file,
            url: e.target.result,
            name: file.name
          }
        }));
        addLog(`📸 Reference image uploaded for Day ${postIndex + 1}`, 'success');
      };
      reader.readAsDataURL(file);
    } else {
      addLog('Please upload a valid image file', 'error');
    }
  };

  const pollImageGeneration = async (posts) => {
    // Poll for image generation completion
    for (const post of posts) {
      if (!post.image_task_id) continue;
      
      let attempts = 0;
      const maxAttempts = 20; // 20 attempts * 3 seconds = 60 seconds max
      
      const checkStatus = async () => {
        try {
          const apiUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:3001/api/social-media-generate-image'
            : '/api/social-media-generate-image';
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id: post.image_task_id })
          });
          
          if (response.ok) {
            const result = await response.json();
            
            if (result.status === 'completed' && result.image_url) {
              // Update the post with the generated image URL
              setContentCalendar(prev => prev.map(p => 
                p.day === post.day ? { ...p, generated_image_url: result.image_url } : p
              ));
              addLog(`✅ Image generated for Day ${post.day}`, 'success');
              return true;
            } else if (result.status === 'failed') {
              addLog(`❌ Image generation failed for Day ${post.day}`, 'error');
              return true;
            }
          }
        } catch (error) {
          console.error('Error polling image:', error);
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000); // Check again in 3 seconds
        } else {
          addLog(`⏱️ Image generation timeout for Day ${post.day}`, 'error');
        }
      };
      
      checkStatus();
    }
  };

  const pollForImageCompletion = async (taskId, postDay) => {
    const maxAttempts = 30; // 30 attempts * 5 seconds = 2.5 minutes max
    let attempts = 0;

    const poll = async () => {
      attempts++;
      addLog(`🔄 Checking image progress... (${attempts * 5}s elapsed)`, 'info');

      try {
        const statusUrl = process.env.NODE_ENV === 'development' 
          ? `http://localhost:3001/api/freepik-mystic-status/${taskId}`
          : `/api/freepik-mystic-status/${taskId}`;

        const statusResponse = await fetch(statusUrl);
        
        if (!statusResponse.ok) {
          throw new Error('Failed to check status');
        }

        const statusData = await statusResponse.json();
        console.log('📊 Status check result:', statusData);

        if (statusData.data?.status === 'COMPLETED' && statusData.data?.generated?.length > 0) {
          const imageUrl = statusData.data.generated[0];
          
          const finalUpdatedPosts = contentCalendar.map(p => 
            p.day === postDay 
              ? { ...p, generated_image_url: imageUrl, image_status: 'completed', image_task_id: null }
              : p
          );
          
          setContentCalendar(finalUpdatedPosts);
          addLog(`✅ High-quality UGC ad generated for Day ${postDay}!`, 'success');
          return;
        }

        if (statusData.data?.status === 'FAILED') {
          throw new Error('Image generation failed');
        }

        // Continue polling if still in progress
        if (attempts < maxAttempts && statusData.data?.status === 'IN_PROGRESS') {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else if (attempts >= maxAttempts) {
          throw new Error('Image generation timed out');
        }

      } catch (error) {
        console.error('❌ Polling error:', error);
        addLog(`❌ Image generation failed: ${error.message}`, 'error');
        
        // Reset status on error
        const errorUpdatedPosts = contentCalendar.map(p => 
          p.day === postDay 
            ? { ...p, image_status: 'failed', image_task_id: null }
            : p
        );
        setContentCalendar(errorUpdatedPosts);
      }
    };

    // Start polling after 5 seconds
    setTimeout(poll, 5000);
  };

  const handleGenerateImagesForDay = async () => {
    const selectedPost = contentCalendar.find(post => post.day === selectedDate);
    
    if (!selectedPost) {
      addLog('No content found for selected day', 'error');
      return;
    }

    if (selectedPost.generated_images || selectedPost.image_status === 'generating') {
      addLog('Images already generated or in progress for this day', 'info');
      return;
    }

    addLog(`🎨 Generating images for Day ${selectedDate}...`, 'info');
    await handleGenerateImage(selectedPost);
  };

  // Handle saving schedule times
  const handleSaveSchedule = () => {
    const updatedCalendar = contentCalendar.map(post => {
      if (post.day === popupDate) {
        // Update with saved times or keep original
        const updatedTime = platformTimes[`${popupDate}-general`] || post.suggested_post_time;
        return {
          ...post,
          suggested_post_time: updatedTime,
          platformTimes: platformTimes
        };
      }
      return post;
    });
    
    setContentCalendar(updatedCalendar);
    setShowSchedulePopup(false);
    addLog(`✅ Schedule updated for Day ${popupDate}`, 'success');
  };

  // Handle bulk time setting
  const handleBulkTimeSet = () => {
    if (!bulkTime) return;
    
    const newPlatformTimes = { ...platformTimes };
    const popupPost = contentCalendar.find(p => p.day === popupDate);
    
    if (popupPost) {
      Object.keys(popupPost.platformVariants).forEach(platform => {
        newPlatformTimes[`${popupDate}-${platform}`] = bulkTime;
      });
      newPlatformTimes[`${popupDate}-general`] = bulkTime;
    }
    
    setPlatformTimes(newPlatformTimes);
    setBulkTime('');
  };

  // Get actual date for a campaign day
  const getCampaignDate = (day) => {
    const today = new Date();
    const campaignDate = new Date(today);
    campaignDate.setDate(today.getDate() + day - 1);
    return campaignDate;
  };

  const handleGenerateImage = async (post) => {
    if (!post.platformVariants?.instagram?.suggested_image_prompt) {
      addLog('No image prompt available', 'error');
      return;
    }

    const postIndex = contentCalendar.findIndex(p => p.day === post.day);
    const userImage = userUploadedImages[postIndex];

    addLog(`🎨 Creating multi-platform UGC ads for Day ${post.day}...`, 'info');
    
    // Update the post to show "generating" status
    const updatedPosts = contentCalendar.map(p => 
      p.day === post.day 
        ? { ...p, image_status: 'generating' }
        : p
    );
    setContentCalendar(updatedPosts);
    
    try {
      const platforms = ['instagram', 'facebook', 'twitter', 'tiktok'];
      const generatedImages = {};
      
      addLog(`🚀 Generating ${platforms.length} platform-specific UGC advertisements...`, 'info');
      
      // Check if user uploaded a reference image
      if (userImage) {
        addLog(`📸 Using your uploaded reference image: ${userImage.name}`, 'success');
      } else if (brandAnalysis?.productImages?.length > 0) {
        addLog(`📸 Using ${brandAnalysis.productImages.length} actual product images from website`, 'info');
        const selectedImage = brandAnalysis.productImages[post.day % brandAnalysis.productImages.length];
        if (selectedImage) {
          addLog(`🎯 Day ${post.day} using: ${selectedImage.alt || 'Product image'}`, 'info');
        }
      } else {
        addLog(`⚠️ No product images found - using generic product representation`, 'warning');
      }
      
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/social-media-generate-image'
        : '/api/social-media-generate-image';

      // Generate images for all platforms
      for (const platform of platforms) {
        addLog(`📱 Creating ${platform.toUpperCase()} format (1:1 Square)...`, 'info');
        
        const platformCaption = post.platformVariants[platform]?.caption || 
                               post.platformVariants[platform]?.post || 
                               post.platformVariants[platform]?.tweet || 
                               post.platformVariants.instagram.caption;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            caption: platformCaption,
            prompt: post.platformVariants.instagram.suggested_image_prompt,
            day: post.day,
            platform: platform,
            brandData: brandAnalysis,
            postData: post
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to generate ${platform} image: ${errorData.message}`);
        }

        const result = await response.json();
        console.log(`🎨 ${platform.toUpperCase()} result:`, result);

        if (result.status === 'completed' && result.image_url) {
          // Store base image and metadata for text overlay processing
          generatedImages[platform] = {
            baseImage: result.base_image || result.image_url,
            finalImage: result.image_url,
            caption: result.caption || platformCaption,
            brandData: result.brand_analysis || brandAnalysis,
            needsTextOverlay: result.needs_text_overlay || false
          };
          addLog(`✅ ${platform.toUpperCase()} format completed`, 'success');
        } else {
          throw new Error(`Failed to create ${platform} advertisement`);
        }
      }
      
      addLog(`🎉 All 4 platform formats completed for Day ${post.day}!`, 'success');
      
      const finalUpdatedPosts = contentCalendar.map(p => 
        p.day === post.day 
          ? { 
              ...p, 
              generated_images: generatedImages,
              generated_image_url: generatedImages.instagram, // Default display
              image_status: 'completed',
              generation_method: 'multi-platform',
              platforms_generated: platforms
            }
          : p
      );
      
      setContentCalendar(finalUpdatedPosts);
      
    } catch (error) {
      console.error('❌ Error generating images:', error);
      addLog(`❌ Failed to generate images: ${error.message}`, 'error');
      
      // Reset status on error
      const errorUpdatedPosts = contentCalendar.map(p => 
        p.day === post.day 
          ? { ...p, image_status: 'failed' }
          : p
      );
      setContentCalendar(errorUpdatedPosts);
    }
  };

  const handleConnectPlatform = (platform) => {
    addLog(`🔗 Connecting to ${platform}...`, 'info');
    // This would trigger OAuth flow for the platform
    window.open(`/api/social-media/auth/${platform.toLowerCase()}`, '_blank');
  };

  return (
    <div className="h-screen w-full relative">
      {/* Purple Radial Gradient Background from Bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
        }}
      />
      <div className="relative z-10 h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Social Media Automation
            </h1>
            <p className="text-gray-600 mt-1">AI-powered content creation & multi-platform posting</p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="flex gap-6">
          {['setup', 'calendar', 'analytics', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'text-indigo-600 border-b-2 border-indigo-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'setup' && (
          <div className="max-w-4xl mx-auto">
            {/* Website Input Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Analyze Your Brand</h2>
              <p className="text-gray-600 mb-6">Enter your website URL and our AI will learn your brand in minutes</p>
              
              <div className="flex gap-4">
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4017] focus:border-transparent text-gray-900 placeholder-gray-500"
                  disabled={isAnalyzing}
                />
                <button
                  onClick={handleAnalyzeWebsite}
                  disabled={isAnalyzing}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : 'Analyze Website'}
                </button>
              </div>

              {/* Example URLs */}
              <div className="mt-4 flex gap-2 flex-wrap">
                <span className="text-sm text-gray-500">Try:</span>
                {['https://apple.com', 'https://nike.com', 'https://airbnb.com'].map((url) => (
                  <button
                    key={url}
                    onClick={() => setWebsiteUrl(url)}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    {url}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Connections */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 2: Connect Platforms</h2>
              <p className="text-gray-600 mb-6">Connect your social media accounts to start posting</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['instagram', 'facebook', 'twitter', 'tiktok'].map((platformKey) => {
                  const platformConfig = getPlatformConfig(platformKey);
                  return (
                    <button
                      key={platformKey}
                      onClick={() => handleConnectPlatform(platformConfig.name)}
                      className="p-6 relative border-2 border-gray-200 rounded-xl hover:border-indigo-500 transition-all group flex flex-col items-center"
                    >
                      <div className="flex justify-center mb-3 text-gray-600 group-hover:text-indigo-600 transition-colors">
                        {platformConfig.icon}
                      </div>
                      <div className="font-semibold text-gray-900">{platformConfig.name}</div>
                      <div className="text-xs text-gray-500 mt-1">Not connected</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Activity Logs */}
            {logs.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Log</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        log.type === 'error' ? 'bg-red-50 text-red-700' :
                        log.type === 'success' ? 'bg-green-50 text-green-700' :
                        'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-xs text-gray-500 mr-2">{log.timestamp}</span>
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="w-full px-4">
            {contentCalendar.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
                  <p className="text-gray-600">Analyze your website first to generate content</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-8 min-h-screen w-full">
                {/* Left Side - Content for Selected Day */}
                <div className="w-[600px] bg-white rounded-2xl p-6 shadow-lg border border-gray-200 overflow-y-auto flex-shrink-0">
                  <div className="mb-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          Day {selectedDate} Content
                        </h2>
                        <div className="text-lg text-gray-600 mb-2">
                          {getCampaignDate(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            ⏰ {contentCalendar.find(p => p.day === selectedDate)?.suggested_post_time} UTC
                          </span>
                          <span className="flex items-center gap-2">
                            📝 {Object.keys(contentCalendar.find(p => p.day === selectedDate)?.platformVariants || {}).length} Platforms
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                      {(() => {
                        const selectedPost = contentCalendar.find(p => p.day === selectedDate);
                        if (!selectedPost?.generated_images && selectedPost?.image_status !== 'generating') {
                          return (
                            <button 
                              onClick={handleGenerateImagesForDay}
                              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                            >
                              🎨 Generate Images
                            </button>
                          );
                        } else if (selectedPost?.image_status === 'generating') {
                          return (
                            <div className="px-6 py-3 bg-gray-100 text-gray-600 font-semibold rounded-lg flex items-center gap-2">
                              ⏳ Generating Images...
                            </div>
                          );
                        } else if (selectedPost?.generated_images) {
                          return (
                            <div className="px-6 py-3 bg-green-100 text-green-600 font-semibold rounded-lg flex items-center gap-2">
                              ✅ Images Ready
                            </div>
                          );
                        }
                      })()}
                      </div>
                    </div>
                  </div>

                  {/* Content for Selected Day */}
                  {(() => {
                    const selectedPost = contentCalendar.find(p => p.day === selectedDate);
                    if (!selectedPost) return <div>No content for this day</div>;

                    return (
                      <div>
                        {/* Platform Variants - 2x2 Grid */}
                        <div className="mb-8">
                          <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Content</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(selectedPost.platformVariants)
                              .filter(([platform]) => ['instagram', 'facebook', 'x', 'tiktok'].includes(platform))
                              .slice(0, 4)
                              .map(([platform, content]) => {
                              const platformConfig = getPlatformConfig(platform);
                              // Get generated image for this platform - handle both 'x' and 'twitter' keys
                              const imagePlatformKey = platform === 'x' ? 'twitter' : platform;
                              const imageData = selectedPost.generated_images?.[imagePlatformKey];
                              const imageUrl = imageData ? (typeof imageData === 'string' ? imageData : imageData.finalImage) : null;
                              const baseImage = imageData && typeof imageData === 'object' ? imageData.baseImage : imageUrl;
                              const needsOverlay = imageData && typeof imageData === 'object' ? imageData.needsTextOverlay : false;
                              
                              return (
                                <div key={platform} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full ${platformConfig.bgClass} ${platformConfig.textClass} shadow-sm`}>
                                      <span className="text-sm">{platformConfig.icon}</span>
                                      <span>{platformConfig.name}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Generated Image */}
                                  {imageUrl && (
                                    <div className="relative mb-3">
                                      <img 
                                        src={imageUrl} 
                                        alt={`${platform} content`}
                                        className="w-full h-48 object-cover rounded-lg"
                                        id={`platform-image-${platform}-${selectedPost.day}`}
                                      />
                                      {needsOverlay && (
                                        <div style={{ position: 'absolute', inset: 0 }}>
                                          <ProfessionalAdOverlay
                                            baseImage={baseImage}
                                            caption={imageData.caption || content.caption}
                                            brandData={imageData.brandData || brandAnalysis}
                                            platform={platform}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="bg-white rounded-lg p-3 mb-3 border border-gray-100">
                                    <div className="text-sm text-gray-800 leading-relaxed line-clamp-4">
                                      {content.caption || content.post || content.tweet || 'No content available'}
                                    </div>
                                  </div>
                                  {content.hashtags && (
                                    <div className="flex flex-wrap gap-1">
                                      {content.hashtags.slice(0, 3).map((tag, index) => (
                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                          {tag}
                                        </span>
                                      ))}
                                      {content.hashtags.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                          +{content.hashtags.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    );
                  })()}
                </div>

                {/* Right Side - Calendar Scheduler */}
                <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  {/* Scheduler Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-8 py-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-3xl font-bold text-gray-900">Campaign Schedule</h3>
                      <div className="flex gap-3">
                        {['month', 'week', 'day'].map(view => (
                          <button
                            key={view}
                            onClick={() => setCurrentView(view)}
                            className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
                              currentView === view
                                ? 'bg-[#ff4017] text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {view.charAt(0).toUpperCase() + view.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xl text-gray-600 font-medium">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex gap-3">
                        <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors shadow-sm">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors shadow-sm">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Calendar Content */}
                  <div className="px-8 py-6">
                    {currentView === 'month' && (
                      <div>
                        {/* Days of Week Header */}
                        <div className="grid grid-cols-7 gap-3 mb-4">
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                            <div key={day} className="text-center text-sm font-bold text-gray-700 py-2 bg-gray-50 rounded-lg">
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-3">
                          {(() => {
                            const today = new Date();
                            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                            const startDate = new Date(firstDay);
                            startDate.setDate(startDate.getDate() - firstDay.getDay());
                            
                            const calendarDays = [];
                            
                            for (let i = 0; i < 35; i++) {
                              const currentDate = new Date(startDate);
                              currentDate.setDate(startDate.getDate() + i);
                              
                              const dateNum = currentDate.getDate();
                              const isCurrentMonth = currentDate.getMonth() === today.getMonth();
                              const isToday = currentDate.toDateString() === today.toDateString();
                              
                              const campaignDay = isCurrentMonth && dateNum >= today.getDate() && dateNum < today.getDate() + 14 
                                ? dateNum - today.getDate() + 1 
                                : null;
                              
                              const post = campaignDay ? contentCalendar.find(p => p.day === campaignDay) : null;
                              const isSelected = campaignDay === selectedDate;
                              const hasImages = post?.generated_images;
                              const isGenerating = post?.image_status === 'generating';
                              const isCampaignDay = campaignDay && campaignDay <= 14;
                              
                              calendarDays.push(
                                <div
                                  key={i}
                                  className={`
                                    min-h-[120px] p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer shadow-sm
                                    ${!isCurrentMonth ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-white border-gray-200'}
                                    ${isToday && !isCampaignDay ? 'border-blue-400 bg-blue-50 shadow-md' : ''}
                                    ${isCampaignDay && isSelected ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 shadow-xl transform scale-105' : ''}
                                    ${isCampaignDay && !isSelected ? 'border-orange-200 hover:border-orange-300 hover:shadow-lg' : ''}
                                    ${!isCampaignDay && isCurrentMonth ? 'hover:border-gray-300 hover:bg-gray-50 hover:shadow-md' : ''}
                                  `}
                                  onClick={() => {
                                    if (campaignDay) {
                                      setSelectedDate(campaignDay);
                                      setPopupDate(campaignDay);
                                      setShowSchedulePopup(true);
                                    }
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <span className={`
                                      text-lg font-bold
                                      ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
                                      ${isToday ? 'text-blue-700' : ''}
                                      ${isCampaignDay && isSelected ? 'text-orange-800' : ''}
                                    `}>
                                      {dateNum}
                                    </span>
                                    {isCampaignDay && (
                                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm px-3 py-1 rounded-full font-bold shadow-md">
                                        Day {campaignDay}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {isCampaignDay && post && (
                                    <div className="space-y-2">
                                      <div className={`
                                        text-sm px-3 py-2 rounded-lg font-semibold shadow-sm
                                        ${hasImages ? 'bg-green-200 text-green-800' : 
                                          isGenerating ? 'bg-yellow-200 text-yellow-800' : 
                                          'bg-gray-200 text-gray-700'}
                                      `}>
                                        {hasImages ? '✅ Ready' : isGenerating ? '⏳ Generating' : '📝 Draft'}
                                      </div>
                                      <div className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                                        {post.platformVariants?.instagram?.caption?.slice(0, 60) || 'Social media content'}...
                                      </div>
                                      <div className="text-sm text-gray-500 font-medium">
                                        📅 {post.suggested_post_time} UTC
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            
                            return calendarDays;
                          })()}
                        </div>
                      </div>
                    )}

                    {currentView === 'week' && (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4">📅</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Week View</h3>
                        <p className="text-gray-600">Coming soon...</p>
                      </div>
                    )}

                    {currentView === 'day' && (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Day View</h3>
                        <p className="text-gray-600">Coming soon...</p>
                      </div>
                    )}
                  </div>

                  {/* Calendar Footer */}
                  <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 px-8 py-6">
                    <div className="flex justify-center gap-8 text-base">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Campaign Day</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-200 rounded shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Images Ready</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-200 rounded shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Generating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-100 rounded shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Today</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Popup */}
                {showSchedulePopup && popupDate && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Day {popupDate} Schedule</h2>
                          <div className="text-lg text-gray-600 mt-1">
                            {getCampaignDate(popupDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowSchedulePopup(false)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {(() => {
                        const popupPost = contentCalendar.find(p => p.day === popupDate);
                        if (!popupPost) return <div>No content for this day</div>;

                        return (
                          <div className="space-y-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Details</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Current Time:</span>
                                  <span className="ml-2 font-medium">{popupPost.suggested_post_time} UTC</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Status:</span>
                                  <span className="ml-2 font-medium">
                                    {popupPost.generated_images ? '✅ Ready' : 
                                     popupPost.image_status === 'generating' ? '⏳ Generating' : '📝 Draft'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Bulk Time Setting */}
                            <div className="bg-blue-50 rounded-xl p-4 mb-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Set Time for All Platforms</h3>
                              <div className="flex gap-3">
                                <input 
                                  type="time" 
                                  value={bulkTime}
                                  onChange={(e) => setBulkTime(e.target.value)}
                                  className="px-4 py-2 border-2 border-gray-400 rounded-lg text-base flex-1 bg-white text-gray-900 font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                  placeholder="Select time for all platforms"
                                />
                                <button 
                                  onClick={handleBulkTimeSet}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                                >
                                  Apply to All
                                </button>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Platform Scheduling</h3>
                              <div className="space-y-4">
                                {Object.entries(popupPost.platformVariants)
                                  .filter(([platform]) => ['instagram', 'facebook', 'x', 'tiktok'].includes(platform))
                                  .slice(0, 4)
                                  .map(([platform, content]) => {
                                  const platformConfig = getPlatformConfig(platform);
                                  const currentTime = platformTimes[`${popupDate}-${platform}`] || 
                                                    platformTimes[`${popupDate}-general`] || 
                                                    popupPost.suggested_post_time;
                                  return (
                                    <div key={platform} className="border border-gray-200 rounded-xl p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-bold rounded-full ${platformConfig.bgClass} ${platformConfig.textClass}`}>
                                          <span>{platformConfig.icon}</span>
                                          <span>{platformConfig.name}</span>
                                        </div>
                                        <input 
                                          type="time" 
                                          value={currentTime}
                                          onChange={(e) => setPlatformTimes(prev => ({
                                            ...prev,
                                            [`${popupDate}-${platform}`]: e.target.value
                                          }))}
                                          className="px-3 py-2 border-2 border-gray-400 rounded-lg text-base bg-white text-gray-900 font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        />
                                      </div>
                                      <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                                        {content.caption || content.post || content.tweet || 'No content'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex justify-end pt-4">
                              <button 
                                onClick={handleSaveSchedule}
                                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all"
                              >
                                💾 Save & Close
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">Track engagement, reach, and performance across all platforms</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Posting Schedule</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4017]">
                    <option>Once per day (8:00 AM UTC)</option>
                    <option>Twice per day (8:00 AM & 6:00 PM UTC)</option>
                    <option>Three times per day</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Content Tone</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4017]">
                    <option>Professional</option>
                    <option>Casual & Friendly</option>
                    <option>Bold & Energetic</option>
                    <option>Minimalist & Clean</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Auto-post</label>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded" />
                    <span className="text-gray-700">Automatically post content without manual approval</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default SocialMediaAutomation;


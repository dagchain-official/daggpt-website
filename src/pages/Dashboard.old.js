import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import WebsiteCreationCanvas from '../components/WebsiteCreationCanvas';
import WebsiteCreationSidebar from '../components/WebsiteCreationSidebar';
import ContentCreationSidebar from '../components/ContentCreationSidebar';
import ContentCreationCanvas from '../components/ContentCreationCanvas';
import AIChatCanvas from '../components/AIChatCanvas';
import { generateWebsiteWithClaude, cloneWebsiteFromUrl } from '../services/claudeWebsiteService';
import { generateImageWithGemini } from '../services/geminiImageService';
import { generateMultiClipVideo, generateSceneBreakdown } from '../services/videoOrchestrationService';
import { generateMultipleClips as generateFreepikClips, generateVideoFromImage, generateVideoFromImageWithAudio, generateVideoWithKling25ProAudio } from '../services/freepikVideoService';
import { createSimpleSceneBreakdown } from '../services/simpleSceneBreakdown';
import { generateAISceneBreakdown } from '../services/aiSceneBreakdown';
import { generateAndWait } from '../services/freepikTextToVideo';
import { stitchVideos, downloadVideo } from '../services/videoStitcher';
import { generateMultipleClips as generateVideoGenClips, VIDEO_MODELS } from '../services/videoGenApiService';
import { uploadImageToImgbb } from '../services/imageUploadService';

const Dashboard = () => {
  const location = useLocation();
  
  // Initialize prompt from navigation state if available
  const [selectedModule, setSelectedModule] = useState('image-generation');
  const [isModuleSelectorOpen, setIsModuleSelectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('image');
  const [prompt, setPrompt] = useState(location.state?.prompt || '');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Website Creation states
  const [websiteType, setWebsiteType] = useState('landing');
  const [colorScheme, setColorScheme] = useState('modern');
  const [generatedWebsite, setGeneratedWebsite] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showWebsiteControls, setShowWebsiteControls] = useState(true);
  const [websiteMode, setWebsiteMode] = useState('create'); // 'create' or 'clone'
  const [cloneUrl, setCloneUrl] = useState('');
  
  // Content Creation states
  const [generatedImages, setGeneratedImages] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [videoClips, setVideoClips] = useState([]); // Individual clips
  const [videoPollingProgress, setVideoPollingProgress] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [isStitching, setIsStitching] = useState(false);
  const [stitchingProgress, setStitchingProgress] = useState(null);
  const [stitchedVideo, setStitchedVideo] = useState(null);
  const [useConsistentCharacter, setUseConsistentCharacter] = useState(false); // Disabled for testing
  const [characterImage, setCharacterImage] = useState(null);
  
  // Video provider states
  const [videoProvider, setVideoProvider] = useState('freepik'); // 'freepik' or 'videogenapi'
  const [selectedVideoModel, setSelectedVideoModel] = useState('wan-25'); // Default to Wan 2.5 (works!)
  const [enableAudio, setEnableAudio] = useState(true); // Enable audio by default
  const [audioPrompt, setAudioPrompt] = useState(''); // Custom audio prompt

  // Update prompt if navigation state changes
  useEffect(() => {
    if (location.state?.prompt) {
      setPrompt(location.state.prompt);
      // Clear the navigation state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const modules = [
    {
      id: 'ai-chat',
      title: 'AI Chat',
      description: 'Interactive AI conversations',
      icon: '💬',
      color: 'bg-blue-500',
      category: 'Text'
    },
    {
      id: 'document-tools',
      title: 'Document Tools',
      description: 'PDF & OCR text extraction',
      icon: '📄',
      color: 'bg-green-500',
      category: 'Text'
    },
    {
      id: 'image-generation',
      title: 'Image Generation',
      description: 'Create stunning AI images',
      icon: '🎨',
      color: 'bg-purple-500',
      category: 'Content'
    },
    {
      id: 'audio-generation',
      title: 'Audio Generation',
      description: 'Text to speech & music',
      icon: '🎵',
      color: 'bg-pink-500',
      category: 'Content'
    },
    {
      id: 'video-generation',
      title: 'Video Generation',
      description: 'Create cinematic videos',
      icon: '🎬',
      color: 'bg-red-500',
      category: 'Content'
    },
    {
      id: 'website-builder',
      title: 'Website Builder',
      description: 'Create & clone websites',
      icon: '🌐',
      color: 'bg-cyan-500',
      category: 'Development'
    },
    {
      id: 'app-builder',
      title: 'App Builder',
      description: 'Android & iOS apps',
      icon: '📱',
      color: 'bg-indigo-500',
      category: 'Development'
    },
    {
      id: 'voice-cloning',
      title: 'Voice Cloning',
      description: 'Clone any voice',
      icon: '🎙️',
      color: 'bg-orange-500',
      category: 'Advanced'
    },
    {
      id: 'avatar-creation',
      title: 'Avatar Creation',
      description: 'Image & video avatars',
      icon: '👤',
      color: 'bg-yellow-500',
      category: 'Advanced'
    },
    {
      id: 'social-media',
      title: 'Social Media',
      description: 'Management & automation',
      icon: '📊',
      color: 'bg-teal-500',
      category: 'Marketing'
    }
  ];


  const handleWebsiteGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Simulate progress updates
      setTimeout(() => setGenerationProgress(1), 1000);
      setTimeout(() => setGenerationProgress(2), 2500);
      setTimeout(() => setGenerationProgress(3), 4000);
      
      let result;
      
      if (websiteMode === 'clone') {
        // Clone existing website from URL
        if (!cloneUrl) {
          alert('Please enter a website URL to clone');
          setIsGenerating(false);
          return;
        }
        result = await cloneWebsiteFromUrl(cloneUrl);
      } else {
        // Create new website with Claude Sonnet 4
        if (!prompt) {
          alert('Please enter a website description');
          setIsGenerating(false);
          return;
        }
        const enhancedPrompt = `Create a ${websiteType} website with ${colorScheme} color scheme. ${prompt}`;
        result = await generateWebsiteWithClaude(enhancedPrompt);
      }
      
      if (result.success) {
        // Handle both single HTML and multi-file projects
        if (result.isMultiFile && result.files) {
          // Store the entire project structure
          setGeneratedWebsite({
            isMultiFile: true,
            files: result.files,
            preview: result.preview
          });
        } else {
          // Single HTML file (legacy)
          setGeneratedWebsite({
            isMultiFile: false,
            html: result.html
          });
        }
        setShowWebsiteControls(false);
      } else {
        alert(`Error generating website: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleNewWebsite = () => {
    setGeneratedWebsite(null);
    setShowWebsiteControls(true);
    setPrompt('');
    setIsGenerating(false);
  };

  const handleImageGenerate = async () => {
    if (!prompt || !selectedStyle) {
      alert('Please enter a description and select a style');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages(null);
    
    try {
      const result = await generateImageWithGemini(prompt, selectedStyle, aspectRatio, quantity);
      
      if (result.success) {
        setGeneratedImages(result.images);
      } else {
        alert(`Error generating images: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVideoGenAPIGeneration = async () => {
    try {
      // Step 1: Generate character image for consistency
      setVideoPollingProgress({
        stage: 'character',
        message: 'Generating character image for consistency...',
        progress: 5,
        totalScenes: 0
      });

      console.log('🎨 Generating character image first for consistency...');
      console.log('📝 Prompt:', prompt);
      console.log('🎨 Style:', selectedStyle);
      console.log('📐 Aspect Ratio:', aspectRatio);
      
      // Use Gemini for character image generation
      const imageResult = await generateImageWithGemini(prompt, selectedStyle, aspectRatio, 1);

      console.log('📦 Image Result:', JSON.stringify(imageResult, null, 2));

      if (!imageResult.success) {
        console.error('❌ Image generation failed:', imageResult.error);
        throw new Error('Failed to generate character image: ' + imageResult.error);
      }

      if (!imageResult.images || imageResult.images.length === 0) {
        console.error('❌ No images in result:', imageResult);
        throw new Error('Image generation succeeded but no images returned');
      }

      const characterImageObject = imageResult.images[0];
      console.log('✅ Character image generated:', characterImageObject);
      
      // Extract the base64 URL from the image object
      const characterImageBase64 = characterImageObject.url || characterImageObject;
      console.log('📦 Extracted base64 image');
      console.log('📦 Image data length:', characterImageBase64.length);
      
      setCharacterImage(characterImageBase64);

      // Upload image to get HTTP URL (Kling 2.5 Pro might need URL instead of base64)
      setVideoPollingProgress({
        stage: 'uploading',
        message: 'Uploading character image...',
        progress: 15,
        totalScenes: 0
      });

      console.log('📤 Uploading image to our server...');
      const uploadResult = await uploadImageToImgbb(characterImageBase64);

      if (!uploadResult.success) {
        console.error('❌ Image upload failed:', uploadResult.error);
        throw new Error('Failed to upload character image: ' + uploadResult.error);
      }

      const characterImageUrl = uploadResult.url;
      console.log('✅ Image uploaded to:', characterImageUrl);

      // Step 2: Create scene breakdown
      setVideoPollingProgress({
        stage: 'planning',
        message: 'Planning video scenes...',
        progress: 20,
        totalScenes: 0
      });

      // Use AI-powered scene breakdown for better consistency
      const breakdown = await generateAISceneBreakdown(prompt, duration, selectedStyle);
      const totalScenes = breakdown.scenes.length;
      
      console.log(`📋 Created ${totalScenes} scenes for ${selectedVideoModel}`);
      console.log(`🎲 Using SEED: ${breakdown.seed} for consistency`);

      // Prepare audio prompt if enabled
      const finalAudioPrompt = enableAudio ? (audioPrompt || `${selectedStyle} ambient sounds and effects`) : null;

      // Step 3: Generate clips with VideoGenAPI + AI Audio Enhancement!
      console.log(`🎬🎵 Using VideoGenAPI with ${selectedVideoModel} + AI Audio Enhancement!`);
      console.log('📸 Using imgbb URL:', characterImageUrl);
      console.log('🎵 Audio enabled:', enableAudio);
      console.log('🎯 Selected Model:', selectedVideoModel);
      
      // Generate all clips with VideoGenAPI
      const result = await generateVideoGenClips(
        breakdown.scenes,
        {
          model: selectedVideoModel, // Use the selected model from UI
          addAudio: enableAudio,
          audioPrompt: finalAudioPrompt,
          characterImageUrl: characterImageUrl,
          seed: breakdown.seed // Use same seed for all clips for consistency
        },
        (progress) => {
          setVideoPollingProgress({
            stage: progress.stage,
            message: progress.message,
            progress: 20 + (progress.progress * 0.75),
            currentScene: progress.currentScene,
            totalScenes: progress.totalScenes
          });
        }
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Video generation failed');
      }
      
      const clips = result.clips;

      if (result.success && clips.length > 0) {
        setVideoClips(result.clips);
        
        // Calculate total duration (use 10s default if duration is null)
        const totalDuration = result.clips.reduce((sum, clip) => sum + (clip.duration || 10), 0);
        
        // Get model info
        const modelInfo = Object.values(VIDEO_MODELS).find(m => m.key === selectedVideoModel);
        const modelName = modelInfo ? `${modelInfo.name} (${modelInfo.resolution})` : selectedVideoModel;
        
        // Create final video object
        const finalVideo = {
          uri: result.clips[0].uri,
          duration: totalDuration,
          scenes: totalScenes,
          model: `${modelName} + AI Audio`,
          status: 'completed',
          aspectRatio: '16:9',
          hasAudio: true,
          hasCharacterConsistency: true,
          characterImage: characterImageUrl,
          needsStitching: result.clips.length > 1,
          note: result.clips.length > 1 
            ? `✨ Video generated with character consistency! ${result.clips.length} clips created. Use "Stitch Videos" button to combine them.`
            : '✨ Video generated successfully with character consistency!'
        };

        setGeneratedVideo(finalVideo);
        
        setVideoPollingProgress({
          stage: 'complete',
          message: 'Video generation complete with audio!',
          progress: 100,
          totalScenes: totalScenes,
          clips: result.clips,
          characterImage: characterImageUrl
        });

        console.log('✅ VideoGenAPI generation complete with character consistency!');
      } else {
        throw new Error('No clips were generated successfully');
      }

    } catch (error) {
      console.error('❌ VideoGenAPI generation error:', error);
      alert(`Error generating video: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVideoGenerate = async () => {
    if (!prompt || !selectedStyle) {
      alert('Please enter a description and select a video type');
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);
    setVideoClips([]);
    setVideoPollingProgress(null);
    
    try {
      // Use Freepik Kling 2.5 Pro (with character consistency + audio)
      if (videoProvider === 'freepik' || videoProvider === 'videogenapi') {
        console.log(`🚀 Starting video generation with Freepik Kling 2.5 Turbo Pro (${selectedVideoModel})...`);
        await handleVideoGenAPIGeneration(); // This now uses Kling 2.5 Pro!
        return;
      }
      
      // Fallback (should not reach here)
      console.log('🚀 Starting fallback video generation...');
      
      // Step 1: Create scene breakdown
      setVideoPollingProgress({
        stage: 'planning',
        message: 'Planning video scenes...',
        progress: 5,
        totalScenes: 0
      });

      const breakdown = createSimpleSceneBreakdown(prompt, duration, selectedStyle);
      const totalScenes = breakdown.scenes.length;
      
      console.log(`📋 Created ${totalScenes} scenes`);

      setVideoPollingProgress({
        stage: 'planning',
        message: `Created ${totalScenes} scenes. Starting generation...`,
        progress: 10,
        totalScenes: totalScenes
      });

      // Step 2: Generate each clip directly from text (NO IMAGE GENERATION!)
      const clips = [];
      
      for (let i = 0; i < breakdown.scenes.length; i++) {
        const scene = breakdown.scenes[i];
        const sceneNumber = i + 1;

        setVideoPollingProgress({
          stage: 'generating',
          currentScene: sceneNumber,
          totalScenes: totalScenes,
          message: `Generating clip ${sceneNumber}/${totalScenes} with MiniMax...`,
          progress: 10 + (sceneNumber / totalScenes) * 80,
          clips: clips
        });

        console.log(`🎬 Generating clip ${sceneNumber}: ${scene.prompt}`);

        try {
          const result = await generateAndWait(
            scene.prompt,
            {
              duration: 6, // MiniMax supports 6 or 10 seconds
              resolution: '768p',
              promptOptimizer: true
            },
            (pollProgress) => {
              setVideoPollingProgress({
                stage: 'generating',
                currentScene: sceneNumber,
                totalScenes: totalScenes,
                message: `Clip ${sceneNumber}: ${pollProgress.message}`,
                progress: 10 + ((sceneNumber - 1) / totalScenes) * 80 + (pollProgress.attempts / pollProgress.maxAttempts) * (80 / totalScenes),
                clips: clips
              });
            }
          );

          if (result.success && result.video) {
            // Proxy the video URL to avoid CORS issues
            const proxiedUrl = `/api/video-proxy?url=${encodeURIComponent(result.video.uri)}`;
            
            clips.push({
              sceneNumber: sceneNumber,
              uri: proxiedUrl,
              originalUri: result.video.uri,
              prompt: scene.prompt,
              duration: result.video.duration,
              model: result.video.model,
              status: 'completed'
            });
            
            setVideoClips([...clips]);
            console.log(`✅ Clip ${sceneNumber} completed`);
            console.log(`Original URL: ${result.video.uri}`);
            console.log(`Proxied URL: ${proxiedUrl}`);
          } else {
            console.error(`❌ Clip ${sceneNumber} failed:`, result.error);
            // Don't add failed clips to the array
            console.log(`Skipping failed clip ${sceneNumber}`);
          }

        } catch (error) {
          console.error(`❌ Clip ${sceneNumber} error:`, error);
          clips.push({
            sceneNumber: sceneNumber,
            status: 'failed',
            error: error.message
          });
        }
      }

      // Step 3: Create final video
      const completedClips = clips.filter(c => c.status === 'completed');
      
      if (completedClips.length === 0) {
        throw new Error('No clips were successfully generated');
      }

      // Create final video object
      const finalVideo = {
        id: `video-${Date.now()}`,
        uri: completedClips[0].uri, // Use first clip as preview
        prompt: prompt,
        style: selectedStyle,
        aspectRatio: aspectRatio,
        duration: completedClips.reduce((sum, clip) => sum + clip.duration, 0),
        scenes: completedClips.length,
        clips: completedClips,
        status: 'completed',
        completedAt: new Date().toISOString(),
        model: 'minimax-hailuo-02',
        note: `✅ Generated ${completedClips.length} clips using MiniMax Hailuo-02! Download individual clips below.`,
        needsStitching: completedClips.length > 1
      };

      setGeneratedVideo(finalVideo);
      setVideoClips(completedClips);
      setVideoPollingProgress(null);
      
      console.log('🎉 Video generation complete!');

    } catch (error) {
      console.error('❌ Video generation error:', error);
      alert(`Error generating video: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setVideoPollingProgress(null);
    }
  };


  const handleStitchVideos = async () => {
    if (!videoClips || videoClips.length === 0) {
      alert('No clips to stitch');
      return;
    }

    if (videoClips.length === 1) {
      alert('Only one clip available. No stitching needed.');
      return;
    }

    setIsStitching(true);
    setStitchingProgress({ stage: 'starting', message: 'Preparing to stitch...', progress: 0 });

    try {
      console.log('🎬 Starting video stitching...');
      console.log(`Clips to stitch: ${videoClips.length}`);

      const result = await stitchVideos(videoClips, (progress) => {
        setStitchingProgress(progress);
      });

      if (result.success) {
        console.log('✅ Video stitched successfully!');
        setStitchedVideo({
          url: result.url,
          blob: result.blob,
          size: result.size,
          clipCount: videoClips.length,
          totalDuration: videoClips.reduce((sum, clip) => sum + clip.duration, 0)
        });
        setStitchingProgress({ stage: 'complete', message: 'Stitching complete!', progress: 100 });
        
        // Auto-download
        downloadVideo(result.blob, `stitched-video-${Date.now()}.mp4`);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('❌ Stitching error:', error);
      alert(`Error stitching videos: ${error.message}`);
      setStitchingProgress(null);
    } finally {
      setIsStitching(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    alert('Analysis feature coming soon!');
    // TODO: Implement analysis service
    /*
    if (!uploadedFile || !analysisPrompt) {
      alert('Please upload a file and enter your question');
      return;
    }

    setIsGenerating(true);
    setAnalysisResult(null);
    
    try {
      let result;
      if (activeTab === 'video') {
        result = await analyzeVideoWithGemini(uploadedFile, analysisPrompt);
      } else if (activeTab === 'audio') {
        result = await analyzeAudioWithGemini(uploadedFile, analysisPrompt);
      }
      
      if (result.success) {
        setAnalysisResult(result.analysis);
      } else {
        alert(`Error analyzing file: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
    */
  };

  const handleModuleSelect = (moduleId) => {
    setSelectedModule(moduleId);
    setIsModuleSelectorOpen(false); // Collapse after selection
    // Reset states when switching modules
    setPrompt('');
    setGeneratedWebsite(null);
    setIsGenerating(false);
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <nav className="h-24 bg-black/80 backdrop-blur-lg flex-shrink-0">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left - Logo */}
          <div className="flex items-center space-x-4">
            <img 
              src="/images/logo8.jpg" 
              alt="DAG GPT Logo" 
              className="h-20 w-auto object-contain rounded-lg"
              style={{ mixBlendMode: 'lighten' }}
            />
            <span className="text-4xl font-semibold" style={{ fontFamily: 'Nasalization, sans-serif' }}>DAG GPT</span>
          </div>

          {/* Right - User Actions */}
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
              Projects
            </button>
            <button className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
              History
            </button>
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors">
              <span className="text-sm font-semibold text-white">U</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout: Sidebar + Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Module Selector + Controls */}
        <div className="w-1/5 bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col h-full">
          {/* Module Selector - Collapsible */}
          <div className="px-4 py-6 border-b border-[#1A1A1A]">
            <div className="text-xs font-medium text-gray-500 mb-3">Module</div>
            
            {/* Selected Module Display */}
            <button
              onClick={() => setIsModuleSelectorOpen(!isModuleSelectorOpen)}
              className="w-full text-left px-3 py-2.5 rounded-lg bg-[#151515] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-md ${modules.find(m => m.id === selectedModule)?.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-base">{modules.find(m => m.id === selectedModule)?.icon}</span>
                </div>
                <span className="text-sm font-medium text-white">{modules.find(m => m.id === selectedModule)?.title}</span>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isModuleSelectorOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Options - Grouped by Category */}
            {isModuleSelectorOpen && (
              <div className="mt-2 max-h-[calc(100vh-300px)] overflow-y-auto space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 pr-1">
                {['Text', 'Content', 'Development', 'Advanced', 'Marketing'].map((category) => {
                  const categoryModules = modules.filter(m => m.category === category);
                  if (categoryModules.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 px-2">
                        {category}
                      </div>
                      <div className="space-y-1">
                        {categoryModules.map((module) => (
                          <button
                            key={module.id}
                            onClick={() => handleModuleSelect(module.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                              selectedModule === module.id
                                ? 'bg-[#151515] border border-[#2A2A2A]'
                                : 'hover:bg-[#0F0F0F] border border-transparent hover:border-[#2A2A2A]'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-md ${module.color} flex items-center justify-center flex-shrink-0`}>
                              <span className="text-base">{module.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white truncate">{module.title}</div>
                              <div className="text-[10px] text-gray-500 truncate">{module.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Image Generation Controls */}
          {selectedModule === 'image-generation' && (
            <ContentCreationSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              prompt={prompt}
              onPromptChange={setPrompt}
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              quantity={quantity}
              onQuantityChange={setQuantity}
              duration={duration}
              onDurationChange={setDuration}
              onGenerate={activeTab === 'image' ? handleImageGenerate : activeTab === 'video' ? handleVideoGenerate : handleAnalyze}
              canGenerate={activeTab === 'image' || activeTab === 'video' ? (!!prompt && !!selectedStyle) : !!uploadedFile}
              isGenerating={isGenerating}
              uploadedFile={uploadedFile}
              onFileUpload={handleFileUpload}
              analysisPrompt={analysisPrompt}
              onAnalysisPromptChange={setAnalysisPrompt}
              onAnalyze={handleAnalyze}
            />
          )}

          {/* Video Generation Controls */}
          {selectedModule === 'video-generation' && (
            <ContentCreationSidebar
              activeTab="video"
              onTabChange={setActiveTab}
              prompt={prompt}
              onPromptChange={setPrompt}
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              quantity={quantity}
              onQuantityChange={setQuantity}
              duration={duration}
              onDurationChange={setDuration}
              onGenerate={handleVideoGenerate}
              canGenerate={!!prompt && !!selectedStyle}
              isGenerating={isGenerating}
              uploadedFile={uploadedFile}
              onFileUpload={handleFileUpload}
              analysisPrompt={analysisPrompt}
              onAnalysisPromptChange={setAnalysisPrompt}
              onAnalyze={handleAnalyze}
              useConsistentCharacter={useConsistentCharacter}
              onConsistentCharacterChange={setUseConsistentCharacter}
              characterImage={characterImage}
              videoProvider={videoProvider}
              onVideoProviderChange={setVideoProvider}
              selectedVideoModel={selectedVideoModel}
              onVideoModelChange={setSelectedVideoModel}
              enableAudio={enableAudio}
              onEnableAudioChange={setEnableAudio}
              audioPrompt={audioPrompt}
              onAudioPromptChange={setAudioPrompt}
              videoModels={VIDEO_MODELS}
            />
          )}

          {/* Website Builder Controls */}
          {selectedModule === 'website-builder' && (
            <WebsiteCreationSidebar
              prompt={prompt}
              onPromptChange={setPrompt}
              websiteType={websiteType}
              onWebsiteTypeChange={setWebsiteType}
              colorScheme={colorScheme}
              onColorSchemeChange={setColorScheme}
              websiteMode={websiteMode}
              onWebsiteModeChange={setWebsiteMode}
              cloneUrl={cloneUrl}
              onCloneUrlChange={setCloneUrl}
              onGenerate={handleWebsiteGenerate}
              canGenerate={websiteMode === 'create' ? (!!prompt && !!websiteType) : !!cloneUrl}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
              showControls={showWebsiteControls}
              onNewWebsite={handleNewWebsite}
            />
          )}

          {/* Placeholders for Other New Modules */}
          {['ai-chat', 'document-tools', 'audio-generation', 'app-builder', 'voice-cloning', 'avatar-creation', 'social-media'].includes(selectedModule) && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-6xl mb-6">{modules.find(m => m.id === selectedModule)?.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{modules.find(m => m.id === selectedModule)?.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{modules.find(m => m.id === selectedModule)?.description}</p>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                  <span className="text-xs text-purple-300">Coming Soon</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Canvas - 80% */}
        <div className="flex-1 bg-black overflow-y-auto">
          {selectedModule === 'ai-chat' ? (
            <AIChatCanvas />
          ) : selectedModule === 'website-builder' ? (
            <WebsiteCreationCanvas
              isGenerating={isGenerating}
              generatedWebsite={generatedWebsite}
            />
          ) : (selectedModule === 'image-generation' || selectedModule === 'video-generation') ? (
            <ContentCreationCanvas
              activeTab={selectedModule === 'image-generation' ? 'image' : 'video'}
              isGenerating={isGenerating}
              generatedImages={generatedImages}
              generatedVideo={generatedVideo}
              videoClips={videoClips}
              videoPollingProgress={videoPollingProgress}
              analysisResult={analysisResult}
              uploadedFile={uploadedFile}
              isStitching={isStitching}
              stitchingProgress={stitchingProgress}
              stitchedVideo={stitchedVideo}
              onStitchVideos={handleStitchVideos}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-12">
              {!isGenerating ? (
                <div className="text-center max-w-2xl">
                  <div className="text-8xl mb-8 float-animation">
                    {selectedModule === 'content-creation' ? '🎬' : '📱'}
                  </div>
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Your Creative Canvas
                  </h2>
                  <p className="text-xl text-gray-400 mb-8">
                    Configure your settings in the left sidebar and start creating
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-12">
                    <div className="glass-effect p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all group">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⚡</div>
                      <div className="text-sm font-semibold mb-1">Fast Generation</div>
                      <div className="text-xs text-gray-400">AI-powered pipeline</div>
                    </div>
                    <div className="glass-effect p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all group">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎨</div>
                      <div className="text-sm font-semibold mb-1">10+ Styles</div>
                      <div className="text-xs text-gray-400">Choose your aesthetic</div>
                    </div>
                    <div className="glass-effect p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all group">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⏱️</div>
                      <div className="text-sm font-semibold mb-1">Up to 30 min</div>
                      <div className="text-xs text-gray-400">Long-form videos</div>
                    </div>
                    <div className="glass-effect p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all group">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎵</div>
                      <div className="text-sm font-semibold mb-1">Auto Audio</div>
                      <div className="text-xs text-gray-400">AI-generated soundtrack</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-6 animate-pulse">⚡</div>
                  <h2 className="text-3xl font-bold mb-4 text-white">
                    Generating Your Content...
                  </h2>
                <p className="text-gray-500">This may take a few moments</p>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

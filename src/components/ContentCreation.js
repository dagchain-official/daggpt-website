import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { stitchVideos, downloadBlob } from '../utils/videoStitcher';

const ContentCreation = () => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState('input'); // 'input', 'script-review', 'generating-images', 'selecting-images', 'generating-voiceover', 'animating', 'stitching', 'complete'
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('script');
  const [project, setProject] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [progress, setProgress] = useState('');
  const [stitchProgress, setStitchProgress] = useState(0);
  const [isStitching, setIsStitching] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState(null);
  const [failedScenes, setFailedScenes] = useState([]);

  /**
   * Step 1: Generate Script with Grok
   */
  const handleGenerateScript = async () => {
    if (!prompt.trim()) {
      setError('Please enter a video topic');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('generating');
    setProgress('Calling Grok AI to generate script...');

    try {
      const response = await fetch('/api/video-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'generate-script',
          prompt,
          userId: currentUser.uid
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate script');
      }

      const data = await response.json();
      setProject(data.project);
      setScenes(data.project.scenes);
      setStep('script-review');
      setLoading(false);
      setProgress('');

    } catch (err) {
      console.error('Script generation error:', err);
      setError(err.message);
      setStep('input');
      setLoading(false);
    }
  };

  /**
   * Step 2: User edits scene script
   */
  const handleEditScene = (sceneId, newText) => {
    setScenes(scenes.map(scene => 
      scene.id === sceneId ? { ...scene, script_text: newText } : scene
    ));
  };

  /**
   * Step 3: Generate images CLIENT-SIDE (2 per scene)
   * This avoids serverless timeout by calling KIE.AI from the browser
   */
  const handleProceedToImages = async () => {
    setLoading(true);
    setStep('generating-images');
    setProgress('Starting image generation...');

    const KIE_API_KEY = process.env.REACT_APP_KIE_API_KEY;

    try {
      // Generate images for each scene sequentially
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        setProgress(`Generating 2 images for scene ${i + 1}/${scenes.length}...`);
        
        console.log(`[handleProceedToImages] Scene ${i + 1}:`, scene.visual_prompt?.substring(0, 50));

        // Generate 2 images for this scene
        for (let imgIdx = 0; imgIdx < 2; imgIdx++) {
          try {
            setProgress(`Generating image ${imgIdx + 1}/2 for scene ${i + 1}/${scenes.length}...`);

            // Step 1: Create image generation task
            const generateResponse = await fetch('https://api.kie.ai/api/v1/flux/kontext/generate', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${KIE_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                prompt: scene.visual_prompt,
                aspectRatio: '16:9',
                enableTranslation: true,
                outputFormat: 'jpeg',
                promptUpsampling: false,
                model: 'flux-kontext-pro'
              })
            });

            if (!generateResponse.ok) {
              console.error(`Failed to create task for scene ${i + 1}, image ${imgIdx + 1}`);
              continue;
            }

            const taskData = await generateResponse.json();
            console.log(`[handleProceedToImages] Task created:`, taskData);

            if (taskData.code !== 200 || !taskData.data?.taskId) {
              console.error('Invalid task response:', taskData);
              continue;
            }

            const taskId = taskData.data.taskId;

            // Step 2: Poll for completion
            let imageUrl = null;
            const maxAttempts = 60; // 2 minutes
            
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

              const statusResponse = await fetch(`https://api.kie.ai/api/v1/flux/kontext/record-info?taskId=${taskId}`, {
                headers: {
                  'Authorization': `Bearer ${KIE_API_KEY}`
                }
              });

              if (!statusResponse.ok) {
                console.error('Status check failed');
                break;
              }

              const statusData = await statusResponse.json();
              
              // successFlag: 0 = Generating, 1 = Success, 2 = Failed
              const successFlag = statusData.data?.successFlag;
              const progress = statusData.data?.progress || '0.00';
              
              console.log(`[handleProceedToImages] Attempt ${attempt + 1}: Progress ${progress}, Flag ${successFlag}`);

              if (successFlag === 1) {
                // Success! Get the image URL
                imageUrl = statusData.data?.response?.resultImageUrl || statusData.data?.response?.originImageUrl;
                if (imageUrl) {
                  console.log(`[handleProceedToImages] ✅ Image ready:`, imageUrl);
                  break;
                }
              } else if (successFlag === 2) {
                console.error('Image generation failed:', statusData.data?.errorMessage);
                break;
              }
              // successFlag === 0 means still generating, continue polling
            }

            // Step 3: Save to Supabase
            if (imageUrl) {
              const saveResponse = await fetch('/api/video-generator', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  action: 'save-image',
                  sceneId: scene.id,
                  imageUrl: imageUrl
                })
              });

              if (saveResponse.ok) {
                console.log(`[handleProceedToImages] ✅ Saved to database`);
              }
            }

          } catch (imgErr) {
            console.error(`Error generating image ${imgIdx + 1} for scene ${i + 1}:`, imgErr);
          }
        }
      }

      // Refresh to show images
      setProgress('Loading images...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      pollForImages(project.id);

    } catch (err) {
      console.error('Image generation error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * Poll for image generation completion (2 images per scene)
   */
  const pollForImages = async (projectId) => {
    const maxAttempts = 60; // 5 minutes
    let attempts = 0;

    const poll = setInterval(async () => {
      try {
        const response = await fetch(`/api/video-generator?action=get-project&projectId=${projectId}`);
        const data = await response.json();

        console.log('[pollForImages] Response:', data);

        if (data.success) {
          // Log scene details
          data.project.scenes.forEach((scene, idx) => {
            console.log(`Scene ${idx + 1}: ${scene.image_options?.length || 0} images`);
          });

          // Check if at least 1 image per scene (flexible check)
          const allImagesGenerated = data.project.scenes.every(
            scene => scene.image_options && scene.image_options.length >= 1
          );

          if (allImagesGenerated) {
            console.log('[pollForImages] All scenes have images, moving to selection');
            setScenes(data.project.scenes);
            setStep('selecting-images');
            setLoading(false);
            setProgress('');
            clearInterval(poll);
          } else {
            const generated = data.project.scenes.filter(s => s.image_options && s.image_options.length >= 1).length;
            setProgress(`Generating images... (${generated}/${data.project.scenes.length} scenes complete)`);
            console.log(`[pollForImages] Progress: ${generated}/${data.project.scenes.length}`);
          }
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setError('Image generation timeout - some images may still be processing');
          setLoading(false);
          console.error('[pollForImages] Timeout after', attempts, 'attempts');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);
  };

  /**
   * Step 4: Select Image (1 per scene)
   */
  const handleSelectImage = async (sceneId, imageOptionId) => {
    try {
      const response = await fetch('/api/video-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'select-image',
          sceneId,
          imageOptionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to select image');
      }

      // Update local state
      setScenes(scenes.map(scene => {
        if (scene.id === sceneId) {
          return {
            ...scene,
            image_options: scene.image_options.map(opt => ({
              ...opt,
              is_selected: opt.id === imageOptionId
            }))
          };
        }
        return scene;
      }));

    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Step 5: Animate selected images (start tasks, then poll)
   */
  const handleAnimateImages = async () => {
    setLoading(true);
    setStep('animating');
    setProgress('Starting animations...');

    try {
      // Start animation tasks for all scenes
      const animationTasks = [];
      
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const selectedImage = scene.image_options?.find(opt => opt.is_selected);

        if (!selectedImage) {
          console.error(`No selected image for scene ${i + 1}`);
          continue;
        }

        setProgress(`Starting animation ${i + 1}/${scenes.length}...`);
        console.log(`[handleAnimateImages] Starting scene ${i + 1}:`, selectedImage.url);

        try {
          // Start animation task (returns immediately with taskId)
          const response = await fetch('/api/video-generator', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: 'start-animation',
              sceneId: scene.id,
              imageUrl: selectedImage.url,
              prompt: scene.script_text || 'Cinematic camera movement'
            })
          });

          const data = await response.json();

          if (data.success) {
            console.log(`[handleAnimateImages] ✅ Task started for scene ${i + 1}:`, data.taskId);
            animationTasks.push({
              sceneId: scene.id,
              taskId: data.taskId,
              sceneNumber: i + 1
            });
          } else {
            console.error(`[handleAnimateImages] ❌ Failed to start scene ${i + 1}:`, data.message);
          }

        } catch (sceneErr) {
          console.error(`Error starting animation for scene ${i + 1}:`, sceneErr);
        }
      }

      // Now poll for all animations to complete
      setProgress('Animations in progress...');
      await pollForAnimations(animationTasks);

    } catch (err) {
      console.error('Animation error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * Poll for animation completion
   */
  const pollForAnimations = async (tasks) => {
    const maxAttempts = 60; // 2 minutes per task
    const completedTasks = new Set();

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Check every 3 seconds

      // Check status of all incomplete tasks
      for (const task of tasks) {
        if (completedTasks.has(task.taskId)) continue;

        try {
          const response = await fetch('/api/video-generator', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: 'check-animation',
              taskId: task.taskId
            })
          });

          const data = await response.json();

          if (data.success && data.status === 'complete') {
            console.log(`[pollForAnimations] ✅ Scene ${task.sceneNumber} complete:`, data.videoUrl);
            console.log(`[pollForAnimations] Raw data:`, data.rawData);
            
            if (data.videoUrl) {
              // Save video URL to database
              await fetch('/api/video-generator', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  action: 'save-video',
                  sceneId: task.sceneId,
                  videoUrl: data.videoUrl
                })
              });
            } else {
              console.error(`[pollForAnimations] ❌ Scene ${task.sceneNumber} has no video URL!`);
            }

            completedTasks.add(task.taskId);
          } else if (data.success && data.status === 'failed') {
            console.error(`[pollForAnimations] ❌ Scene ${task.sceneNumber} failed:`, data.message);
            setFailedScenes(prev => [...prev, { sceneNumber: task.sceneNumber, message: data.message }]);
            completedTasks.add(task.taskId);
          } else {
            console.log(`[pollForAnimations] Scene ${task.sceneNumber}: ${data.progress || '0.00'}`);
          }
        } catch (err) {
          console.error(`Error checking task ${task.taskId}:`, err);
        }
      }

      // Update progress
      setProgress(`Animating... (${completedTasks.size}/${tasks.length} complete)`);

      // Check if all done
      if (completedTasks.size === tasks.length) {
        setProgress('All scenes animated!');
        setStep('stitching');
        setLoading(false);
        return;
      }
    }

    // Timeout
    setError(`Animation timeout - ${completedTasks.size}/${tasks.length} scenes completed`);
    setLoading(false);
  };

  /**
   * Step 6: Generate Voiceover for all scenes
   */
  const handleGenerateVoiceover = async () => {
    setLoading(true);
    setStep('generating-voiceover');
    setProgress('Generating voiceover for all scenes...');

    try {
      const response = await fetch('/api/video-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'generate-voiceover',
          projectId: project.id,
          scenes: scenes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate voiceover');
      }

      const data = await response.json();
      setScenes(data.scenes);
      setStep('animating');
      setProgress('');
      setLoading(false);

    } catch (err) {
      console.error('Voiceover generation error:', err);
      setError(err.message);
    }
  };

  /**
   * Poll for animation completion
   */
  const pollForAnimation = async (projectId) => {
    const maxAttempts = 120; // 10 minutes
    let attempts = 0;

    const poll = setInterval(async () => {
      try {
        const response = await fetch(`/api/video-generator?action=get-project&projectId=${projectId}`);
        const data = await response.json();

        if (data.success) {
          const allAnimated = data.project.scenes.every(scene => scene.video_clip_url);

          if (allAnimated) {
            setScenes(data.project.scenes);
            setStep('stitching');
            setLoading(false);
            setProgress('');
            clearInterval(poll);
            // Automatically start stitching
            handleStitchVideo();
          } else {
            const animated = data.project.scenes.filter(s => s.video_clip_url).length;
            setProgress(`Animating... (${animated}/${data.project.scenes.length} scenes complete)`);
          }
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setError('Animation timeout');
          setLoading(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);
  };

  /**
   * Step 7: Get all scene videos for download
   */
  const handleStitchVideo = async () => {
    setLoading(true);
    setProgress('Preparing videos for download...');

    try {
      const response = await fetch('/api/video-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'stitch-video',
          projectId: project.id,
          scenes: scenes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get videos');
      }

      const data = await response.json();
      console.log('[handleStitchVideo] Response:', data);
      
      if (data.success && data.scenes) {
        setScenes(data.scenes);
        setStep('complete');
      } else {
        throw new Error(data.message || 'Failed to get videos');
      }
      
      setLoading(false);
      setProgress('');

    } catch (err) {
      console.error('Stitching error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * Check if all scenes have selected images
   */
  const allImagesSelected = scenes.every(scene => 
    scene.image_options && scene.image_options.some(opt => opt.is_selected)
  );

  /**
   * Step 3: Generate Video
   */
  const handleGenerateVideo = () => {
    alert('Video generation coming soon! This will:\n1. Generate voiceovers\n2. Animate images\n3. Stitch final video');
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Video Studio</h2>
              <p className="text-xs text-gray-500">AI-Powered</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('script')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'script'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Script</span>
            </button>
            
            <button
              onClick={() => setActiveTab('library')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'library'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-medium">Library</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'settings'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </nav>

        {/* Credits */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Credits</span>
              <span className="text-lg font-bold text-indigo-500">50</span>
            </div>
            <button className="w-full bg-indigo-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-600 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Video Description</h1>
              <p className="text-sm text-gray-500 mt-1">Create your AI-powered video script</p>
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Save Draft
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Progress Bar */}
          {progress && (
            <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm font-medium text-indigo-900">{progress}</span>
              </div>
            </div>
          )}

          {/* Step Tabs */}
          <div className="flex gap-2 mb-6">
            <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium">
              Script
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
              Custom
            </button>
          </div>

          {/* Step 1: Input Form */}
          {step === 'input' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-4xl">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Upload my song about summer..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerateScript}
              disabled={loading || !prompt.trim()}
              className="w-full bg-indigo-500 text-white py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Generate Script
                </>
              )}
            </button>

            {/* Pro Tip */}
            <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Pro Tip</p>
                  <p className="text-sm text-gray-600">Be specific about movements, tempo, and moods for better results. Describe the visual style and pacing you want.</p>
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">💡 Try these examples:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Product launch video for a new smartphone',
                  'Educational video about climate change',
                  'Travel vlog about exploring Japan',
                  'Recipe tutorial for chocolate cake'
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="text-left px-3 py-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg text-xs text-gray-700 hover:text-indigo-700 transition-all"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Step 2: Generating */}
          {step === 'generating' && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Creating Your Video Script...</h2>
              <p className="text-gray-600">AI is analyzing your topic and crafting the perfect narrative</p>
            </div>
          )}

          {/* Step 3: Script Review & Edit */}
          {step === 'script-review' && scenes.length > 0 && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Review Your Script</h2>
                <p className="text-gray-600">Edit any scene before generating images</p>
              </div>

              <div className="space-y-4 mb-6">
                {scenes.map((scene, index) => (
                  <div key={scene.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Scene {index + 1}</h3>
                        {editingSceneId === scene.id ? (
                          <textarea
                            value={scene.script_text}
                            onChange={(e) => handleEditScene(scene.id, e.target.value)}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            rows={3}
                          />
                        ) : (
                          <p className="text-sm text-gray-700">{scene.script_text}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Duration: {scene.duration_seconds}s</p>
                      </div>
                      <button
                        onClick={() => setEditingSceneId(editingSceneId === scene.id ? null : scene.id)}
                        className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {editingSceneId === scene.id ? 'Done' : 'Edit'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleProceedToImages}
                disabled={loading}
                className="w-full bg-indigo-500 text-white py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Proceed to Generate Images (2 per scene)
              </button>
            </div>
          )}

          {/* Step 4: Generating Images */}
          {step === 'generating-images' && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Generating Images...</h2>
              <p className="text-gray-600">Creating 2 image options for each scene</p>
            </div>
          )}

          {/* Step 5: Image Selection */}
          {step === 'selecting-images' && scenes.length > 0 && (
            <div className="max-w-6xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Choose Your Visuals</h2>
                <p className="text-gray-600">Select one image for each scene</p>
              </div>

              <div className="space-y-6">
                {scenes.map((scene, index) => (
                  <div key={scene.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Scene {index + 1}</h3>
                        <p className="text-sm text-gray-700">{scene.script_text}</p>
                        <p className="text-xs text-gray-500 mt-1">Duration: {scene.duration_seconds}s</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {scene.image_options && scene.image_options.length > 0 ? (
                        scene.image_options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleSelectImage(scene.id, option.id)}
                            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                              option.is_selected
                                ? 'border-orange-500 ring-2 ring-orange-200'
                                : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <img
                              src={option.url}
                              alt={`Option ${option.id}`}
                              className="w-full h-full object-cover"
                            />
                            {option.is_selected && (
                              <div className="absolute inset-0 bg-indigo-500 bg-opacity-20 flex items-center justify-center">
                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-2 flex items-center justify-center py-8">
                          <svg className="w-6 h-6 text-indigo-500 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-gray-600 text-sm">Generating images...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Proceed to Voiceover Button */}
              <div className="mt-6">
                <button
                  onClick={handleAnimateImages}
                  disabled={!allImagesSelected || loading}
                  className="w-full bg-indigo-500 text-white py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Proceed to Animate & Generate Video
                </button>
                {!allImagesSelected && (
                  <p className="text-sm text-gray-500 text-center mt-2">Select one image for each scene to continue</p>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Animating */}
          {step === 'animating' && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Animating Videos...</h2>
              <p className="text-gray-600">Creating cinematic animations with Veo 3.1</p>
            </div>
          )}

          {/* Step 7: Stitching */}
          {step === 'stitching' && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {failedScenes.length > 0 ? 'Animation Complete (with issues)' : 'All Videos Animated!'}
              </h2>
              <p className="text-gray-600 mb-6">
                {failedScenes.length > 0 
                  ? `${scenes.length - failedScenes.length} of ${scenes.length} scenes animated successfully`
                  : 'Your scene videos are ready. Next step: stitch them together!'}
              </p>
              
              {failedScenes.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Some scenes failed:</h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {failedScenes.map((failed, idx) => (
                      <li key={idx}>
                        Scene {failed.sceneNumber}: {failed.message}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-yellow-700 mt-2">
                    These scenes were rejected by content policy. The final video will include only successful scenes.
                  </p>
                </div>
              )}
              
              <button
                onClick={handleStitchVideo}
                disabled={loading || (scenes.length - failedScenes.length) === 0}
                className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {(scenes.length - failedScenes.length) === 0 
                  ? 'No Videos to Stitch' 
                  : `Stitch ${scenes.length - failedScenes.length} Video${scenes.length - failedScenes.length > 1 ? 's' : ''}`}
              </button>
            </div>
          )}

          {/* Step 8: Complete */}
          {step === 'complete' && scenes && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">All Videos Ready!</h2>
                <p className="text-gray-600 mb-2">Your {scenes.length} scene videos have been generated</p>
                <p className="text-sm text-gray-500 mb-6">Download each scene individually or get all videos at once</p>
                
                <div className="flex gap-4 justify-center mb-8">
                  <button
                    onClick={async () => {
                      try {
                        setIsStitching(true);
                        setStitchProgress(0);
                        
                        console.log('[Stitch] Starting to stitch videos...');
                        const videoUrls = scenes.map(scene => scene.video_clip_url);
                        
                        const finalVideo = await stitchVideos(videoUrls, (progress) => {
                          setStitchProgress(progress);
                          console.log(`[Stitch] Progress: ${progress}%`);
                        });
                        
                        console.log('[Stitch] ✅ Stitching complete!');
                        
                        // Download the final video
                        downloadBlob(finalVideo, `final-video-${Date.now()}.mp4`);
                        
                        setIsStitching(false);
                        setStitchProgress(0);
                      } catch (err) {
                        console.error('[Stitch] Error:', err);
                        alert('Failed to stitch videos: ' + err.message);
                        setIsStitching(false);
                        setStitchProgress(0);
                      }
                    }}
                    disabled={isStitching}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStitching ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Stitching... {stitchProgress}%
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Download Complete Video
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setStep('input');
                      setScenes([]);
                      setProject(null);
                      setPrompt('');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Video
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {scenes.map((scene, index) => (
                  <div key={scene.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-indigo-600">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Scene {index + 1}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">{scene.script_text}</p>
                      </div>
                    </div>
                    <a
                      href={scene.video_clip_url}
                      download={`scene-${index + 1}.mp4`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Video
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCreation;


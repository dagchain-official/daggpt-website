import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { stitchVideos, downloadBlob } from '../utils/videoStitcher';

const GenerateVideo = () => {
  const { currentUser } = useAuth();
  
  // Step management
  const [step, setStep] = useState('input'); // 'input', 'script-review', 'generating', 'complete'
  
  // Form inputs
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState(16);
  
  // Project data
  const [project, setProject] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [editingSceneId, setEditingSceneId] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const [generationProgress, setGenerationProgress] = useState({ total: 0, complete: 0, generating: 0, failed: 0 });

  /**
   * Step 1: Create project and enhance script
   */
  const handleGenerateScript = async () => {
    if (!prompt.trim()) {
      setError('Please enter a video description');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress('Creating project...');

    try {
      // Step 1: Create project
      const createResponse = await fetch('/api/video-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-video-project',
          userId: currentUser.uid,
          prompt,
          aspectRatio,
          duration
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create project');
      }

      const createData = await createResponse.json();
      setProject(createData.project);

      console.log('[GenerateVideo] Project created:', createData.project.id);

      // Step 2: Enhance script with Grok
      setProgress('Enhancing script with AI...');

      const enhanceResponse = await fetch('/api/video-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enhance-video-script',
          projectId: createData.project.id,
          prompt,
          duration,
          aspectRatio
        })
      });

      if (!enhanceResponse.ok) {
        throw new Error('Failed to enhance script');
      }

      const enhanceData = await enhanceResponse.json();
      setScenes(enhanceData.scenes);
      setProject(prev => ({
        ...prev,
        title: enhanceData.title,
        enhanced_prompt: enhanceData.enhancedPrompt
      }));

      console.log('[GenerateVideo] Script enhanced, scenes:', enhanceData.scenes.length);

      setStep('script-review');
      setLoading(false);
      setProgress('');

    } catch (err) {
      console.error('[GenerateVideo] Error:', err);
      setError(err.message);
      setLoading(false);
      setProgress('');
    }
  };

  /**
   * Step 2: Start video generation with extensions
   */
  const handleStartGeneration = async () => {
    setLoading(true);
    setError(null);
    setProgress('Starting video generation...');
    setStep('generating');

    try {
      // Update scenes if edited
      if (editingSceneId) {
        await fetch('/api/video-generator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update-video-scenes',
            projectId: project.id,
            scenes
          })
        });
      }

      // Start base generation for all scenes
      const response = await fetch('/api/video-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start-video-generation',
          projectId: project.id,
          aspectRatio
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      const data = await response.json();
      console.log('[GenerateVideo] Base generation started:', data.taskIds.length, 'tasks');
      
      // Store seeds for each scene
      const sceneSeeds = {};
      data.taskIds.forEach(task => {
        sceneSeeds[task.sceneId] = task.seed;
      });
      console.log('[GenerateVideo] Scene seeds:', sceneSeeds);

      // Start polling for progress (includes extensions)
      pollProgress(sceneSeeds);

    } catch (err) {
      console.error('[GenerateVideo] Error:', err);
      setError(err.message);
      setLoading(false);
      setProgress('');
    }
  };

  /**
   * Poll for generation progress (includes extensions)
   */
  const pollProgress = async (sceneSeeds = {}) => {
    let extensionsStarted = new Set();
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/video-generator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'check-video-progress',
            projectId: project.id
          })
        });

        if (!response.ok) {
          throw new Error('Failed to check progress');
        }

        const data = await response.json();
        const prog = data.progress;

        setGenerationProgress(prog);
        
        // Count scenes that need extensions
        const scenesNeedingExtensions = scenes.filter(s => s.duration > 8).length;
        const totalSteps = prog.total + scenesNeedingExtensions;
        
        setProgress(`Generating... ${prog.complete}/${totalSteps} steps complete`);

        console.log('[GenerateVideo] Progress:', prog);

        // Update scenes with latest data
        setScenes(prev => {
          return prev.map(scene => {
            const updatedScene = prog.scenes.find(s => s.id === scene.id);
            if (updatedScene) {
              return {
                ...scene,
                base_status: updatedScene.status,
                base_video_url: updatedScene.videoUrl,
                error_message: updatedScene.error
              };
            }
            return scene;
          });
        });
        
        // Check extension progress and start next extensions when ready
        for (const scene of scenes) {
          if (extensionsStarted.has(scene.id) && scene.duration > 8) {
            const extensionsNeeded = Math.floor((scene.duration - 8) / 8);
            const sceneSeed = sceneSeeds[scene.id];
            
            // Check extension progress
            const extCheckResponse = await fetch('/api/video-generator', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'check-extension-progress',
                sceneId: scene.id
              })
            });
            
            if (extCheckResponse.ok) {
              const extProgress = await extCheckResponse.json();
              
              if (extProgress.success && extProgress.extensions) {
                const completedExtensions = extProgress.extensions.filter(e => e.status === 'complete');
                const currentExtensionCount = extProgress.extensions.length;
                
                console.log(`[GenerateVideo] Scene ${scene.scene_number}: ${completedExtensions.length}/${extensionsNeeded} extensions complete`);
                
                // If last extension completed and we need more, start the next one
                if (completedExtensions.length === currentExtensionCount && 
                    currentExtensionCount < extensionsNeeded) {
                  
                  const nextExtensionNumber = currentExtensionCount + 1;
                  const lastCompletedTaskId = completedExtensions[completedExtensions.length - 1].taskId;
                  
                  console.log(`[GenerateVideo] Starting extension ${nextExtensionNumber}/${extensionsNeeded} for scene ${scene.scene_number}`);
                  
                  // Use progressive segment prompts from Grok
                  const progressionSegments = scene.progression_segments || [];
                  const extPrompt = progressionSegments[nextExtensionNumber] || 
                    `Continue seamlessly from the previous scene: ${scene.visual_description}. The action flows naturally forward, maintaining consistent lighting, camera movement, and visual style.`;
                  
                  console.log(`[GenerateVideo] Extension ${nextExtensionNumber} prompt:`, extPrompt);
                  
                  const nextExtResponse = await fetch('/api/video-generator', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'start-video-extension',
                      sceneId: scene.id,
                      baseTaskId: lastCompletedTaskId, // Extend from last completed extension
                      prompt: extPrompt,
                      seeds: sceneSeed,
                      extensionNumber: nextExtensionNumber,
                      totalExtensions: extensionsNeeded
                    })
                  });
                  
                  if (nextExtResponse.ok) {
                    const nextExtData = await nextExtResponse.json();
                    if (nextExtData.success) {
                      console.log(`[GenerateVideo] Extension ${nextExtensionNumber}/${extensionsNeeded} started: ${nextExtData.extensionTaskId}`);
                    }
                  }
                }
              }
            }
          }
        }

        // Check for scenes that completed base generation and need extensions
        for (const updatedScene of prog.scenes) {
          const scene = scenes.find(s => s.id === updatedScene.id);
          
          if (!scene) continue;
          
          console.log(`[GenerateVideo] Checking scene ${scene.scene_number}: status=${updatedScene.status}, duration=${scene.duration}, extensionsStarted=${extensionsStarted.has(scene.id)}`);
          
          if (updatedScene && 
              updatedScene.status === 'complete' && 
              scene.duration > 8 && 
              !extensionsStarted.has(scene.id)) {
            
            console.log(`[GenerateVideo] Starting extension 1 for scene ${scene.scene_number}`);
            extensionsStarted.add(scene.id);
            
            // Calculate how many extensions needed (each adds 8s)
            const extensionsNeeded = Math.floor((scene.duration - 8) / 8);
            
            // Use the same seed from base generation (KIE.AI requires 10000-99999)
            const sceneSeed = sceneSeeds[scene.id] || (Math.floor(Math.random() * 90000) + 10000);
            
            console.log(`[GenerateVideo] Scene ${scene.scene_number} needs ${extensionsNeeded} extensions, using seed: ${sceneSeed}`);
            
            // Start ONLY the first extension
            // Subsequent extensions will be started after previous ones complete
            // Use progressive segment prompts from Grok for natural story flow
            const progressionSegments = scene.progression_segments || [];
            const extPrompt = progressionSegments[1] || 
              `Continue seamlessly from the previous scene: ${scene.visual_description}. The action flows naturally forward, maintaining consistent lighting, camera movement, and visual style.`;
            
            console.log(`[GenerateVideo] Extension 1 prompt:`, extPrompt);
            
            const extResponse = await fetch('/api/video-generator', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'start-video-extension',
                sceneId: scene.id,
                baseTaskId: updatedScene.taskId, // Extend from base video
                prompt: extPrompt,
                seeds: sceneSeed,
                extensionNumber: 1,
                totalExtensions: extensionsNeeded
              })
            });
            
            if (extResponse.ok) {
              const extData = await extResponse.json();
              if (extData.success) {
                console.log(`[GenerateVideo] Extension 1/${extensionsNeeded} started: ${extData.extensionTaskId} (seed: ${sceneSeed})`);
              }
            }
          }
        }

        // Check if all complete (base + extensions)
        const allComplete = prog.complete === prog.total;
        const allExtensionsStarted = extensionsStarted.size === scenesNeedingExtensions;
        
        console.log(`[GenerateVideo] Completion check: complete=${prog.complete}/${prog.total}, allComplete=${allComplete}, extensionsStarted=${allExtensionsStarted}/${scenesNeedingExtensions}`);
        
        // Stop polling when ALL scenes are complete (including extensions)
        // The backend marks scenes as complete only when base + all extensions are done
        if (allComplete) {
          console.log(`[GenerateVideo] ✅ All scenes complete! Stopping polling.`);
          clearInterval(pollInterval);
          setProgress('All scenes generated!');
          setStep('complete');
          setLoading(false);
        }

      } catch (err) {
        console.error('[GenerateVideo] Polling error:', err);
        clearInterval(pollInterval);
        setError('Failed to check progress');
        setLoading(false);
      }
    }, 5000); // Poll every 5 seconds
  };

  /**
   * Download final video
   * NOTE: KIE.AI extensions return CUMULATIVE videos, so the LAST extension URL
   * contains the complete video (base + all extensions). No stitching needed!
   */
  const handleDownloadVideo = async () => {
    try {
      setLoading(true);
      setProgress('Preparing download...');

      // Refresh scenes from database to get latest extension URLs
      console.log('[GenerateVideo] Refreshing scenes from database...');
      const refreshResponse = await fetch('/api/video-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-video-project',
          projectId: project.id
        })
      });

      let latestScenes = scenes;
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.success && refreshData.project.scenes) {
          latestScenes = refreshData.project.scenes;
          setScenes(latestScenes);
          console.log('[GenerateVideo] Scenes refreshed:', latestScenes.length);
        }
      }

      // For each scene, use the LAST extension URL if available (it's cumulative),
      // otherwise use the base video URL
      const videoUrls = [];
      
      for (const scene of latestScenes.sort((a, b) => a.scene_number - b.scene_number)) {
        console.log(`[GenerateVideo] Scene ${scene.scene_number} data:`, {
          duration: scene.duration,
          hasBase: !!scene.base_video_url,
          extensionCount: scene.extension_video_urls?.length || 0,
          extensionStatus: scene.extension_status
        });
        
        if (scene.extension_video_urls && scene.extension_video_urls.length > 0) {
          // Use LAST extension URL - it contains base + all extensions
          const lastExtensionUrl = scene.extension_video_urls[scene.extension_video_urls.length - 1];
          videoUrls.push(lastExtensionUrl);
          console.log(`[GenerateVideo] Scene ${scene.scene_number}: Using last extension URL (${scene.extension_video_urls.length} total):`, lastExtensionUrl);
        } else if (scene.base_video_url) {
          // No extensions, use base video
          videoUrls.push(scene.base_video_url);
          console.log(`[GenerateVideo] Scene ${scene.scene_number}: Using base URL (no extensions):`, scene.base_video_url);
        }
      }

      console.log('[GenerateVideo] Downloading', videoUrls.length, 'scene(s)');

      // If multiple scenes, stitch them together
      // If single scene, just download directly
      if (videoUrls.length === 1) {
        // Single scene - direct download
        const link = document.createElement('a');
        link.href = videoUrls[0];
        link.download = `${project.title || 'video'}-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Multiple scenes - stitch them
        setProgress('Stitching scenes...');
        const finalVideo = await stitchVideos(videoUrls, (stitchProgress) => {
          setProgress(`Stitching... ${stitchProgress}%`);
        });
        downloadBlob(finalVideo, `${project.title || 'video'}-${Date.now()}.mp4`);
      }

      setProgress('');
      setLoading(false);

    } catch (err) {
      console.error('[GenerateVideo] Download error:', err);
      setError('Failed to download video: ' + err.message);
      setLoading(false);
    }
  };

  /**
   * Edit scene
   */
  const handleEditScene = (sceneId, field, value) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId ? { ...scene, [field]: value } : scene
    ));
    setEditingSceneId(sceneId);
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Purple Radial Gradient Background from Bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
        }}
      />
      <div className="relative z-10 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Video</h1>
          <p className="text-gray-600">Create AI-powered videos from text descriptions</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Input */}
        {step === 'input' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Video Configuration</h2>

            {/* Prompt Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Description
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your video... (e.g., 'A cinematic journey through a futuristic city at sunset')"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Aspect Ratio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    aspectRatio === '16:9'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-full aspect-video bg-gray-200 rounded mb-2"></div>
                  <p className="font-medium text-gray-900">16:9 Landscape</p>
                  <p className="text-sm text-gray-600">YouTube, TV</p>
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    aspectRatio === '9:16'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-1/2 mx-auto aspect-[9/16] bg-gray-200 rounded mb-2"></div>
                  <p className="font-medium text-gray-900">9:16 Portrait</p>
                  <p className="text-sm text-gray-600">TikTok, Reels</p>
                </button>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration: {duration} seconds
              </label>
              <input
                type="range"
                min="8"
                max="64"
                step="8"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>8s</span>
                <span>16s</span>
                <span>24s</span>
                <span>32s</span>
                <span>40s</span>
                <span>48s</span>
                <span>56s</span>
                <span>64s</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {duration / 8} scene{duration / 8 > 1 ? 's' : ''} × 8 seconds each
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateScript}
              disabled={loading || !prompt.trim()}
              className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? progress : 'Generate Script'}
            </button>
          </div>
        )}

        {/* Step 2: Script Review */}
        {step === 'script-review' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{project?.title}</h2>
              <p className="text-gray-600">{project?.enhanced_prompt}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scene Breakdown</h3>
              <div className="space-y-4">
                {scenes.map((scene, index) => (
                  <div key={scene.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-indigo-600">{scene.scene_number}</span>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Script
                          </label>
                          <textarea
                            value={scene.script_text}
                            onChange={(e) => handleEditScene(scene.id, 'script_text', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Visual Description (Camera, Lighting, Movement)
                          </label>
                          <textarea
                            value={scene.visual_description}
                            onChange={(e) => handleEditScene(scene.id, 'visual_description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('input')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleStartGeneration}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                Start Generation
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generating */}
        {step === 'generating' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Videos...</h2>
              <p className="text-gray-600 mb-4">{progress}</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div
                  className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(generationProgress.complete / generationProgress.total) * 100}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-900">{generationProgress.generating}</p>
                  <p className="text-blue-700">Generating</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-semibold text-green-900">{generationProgress.complete}</p>
                  <p className="text-green-700">Complete</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="font-semibold text-red-900">{generationProgress.failed}</p>
                  <p className="text-red-700">Failed</p>
                </div>
              </div>
            </div>

            {/* Scene Status */}
            <div className="space-y-2">
              {scenes.map((scene) => (
                <div key={scene.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-indigo-600">{scene.scene_number}</span>
                  </div>
                  <p className="flex-1 text-sm text-gray-700 truncate">{scene.script_text}</p>
                  <div className="flex items-center gap-2">
                    {scene.base_status === 'complete' && (
                      <span className="text-green-600">✓</span>
                    )}
                    {scene.base_status === 'generating' && (
                      <span className="text-blue-600 animate-spin">⟳</span>
                    )}
                    {scene.base_status === 'failed' && (
                      <span className="text-red-600">✗</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Video Generated!</h2>
              <p className="text-gray-600 mb-6">
                {generationProgress.complete} of {generationProgress.total} scenes completed successfully
              </p>

              <button
                onClick={handleDownloadVideo}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {progress}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Complete Video
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setStep('input');
                  setProject(null);
                  setScenes([]);
                  setPrompt('');
                  setGenerationProgress({ total: 0, complete: 0, generating: 0, failed: 0 });
                }}
                className="ml-4 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Create New Video
              </button>
            </div>

            {/* Individual Scene Downloads */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Scenes</h3>
              <div className="space-y-2">
                {scenes.filter(s => s.base_video_url).map((scene) => (
                  <div key={scene.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600">{scene.scene_number}</span>
                      </div>
                      <p className="text-sm text-gray-700">{scene.script_text}</p>
                    </div>
                    <a
                      href={scene.base_video_url}
                      download={`scene-${scene.scene_number}.mp4`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default GenerateVideo;


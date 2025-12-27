/**
 * VIDEOGENAPI SERVICE
 * Integration with videogenapi.com for AI video generation
 * 
 * Features:
 * - 11 AI models (9 free + 2 premium)
 * - Sora 2 included in free tier!
 * - Text-to-video and image-to-video
 * - AI audio enhancement (Mirelo SFX V1.5)
 * - Veo 3.1 with native audio
 */

/**
 * Make authenticated request to VideoGenAPI via proxy
 * Uses serverless function to avoid CORS issues
 */
const makeVideoGenRequest = async (endpoint, method = 'GET', body = null) => {
  console.log(`VideoGenAPI ${method} ${endpoint}`);

  // Use relative path - works on Vercel, localhost, and custom domain
  const apiUrl = '/api/videogenapi-proxy';

  console.log('Using API URL:', apiUrl);
  console.log('Current hostname:', window.location.hostname);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint,
        method,
        body
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || `VideoGenAPI error: ${response.status}`);
    }

    return data;

  } catch (error) {
    console.error('VideoGenAPI request failed:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * AVAILABLE MODELS
 */
export const VIDEO_MODELS = {
  // FREE MODELS
  SORA_2: {
    key: 'sora-2',
    name: 'Sora 2',
    provider: 'OpenAI',
    resolution: '1080p',
    duration: '10-10s',
    audio: false, // Use add_audio parameter
    free: true
  },
  KLING_25: {
    key: 'kling_25',
    name: 'Kling 2.5',
    provider: 'Kuaishou',
    resolution: '1080p',
    duration: '5-10s',
    audio: false,
    free: true
  },
  HIGGSFIELD: {
    key: 'higgsfield_v1',
    name: 'Higgsfield',
    resolution: '1080p',
    duration: '5-15s',
    audio: false,
    free: true
  },
  PIXVERSE: {
    key: 'pixverse',
    name: 'Pixverse V5',
    resolution: '1080p',
    duration: '5-8s',
    audio: false,
    free: true
  },
  LTXV_2: {
    key: 'ltxv-2',
    name: 'LTV Video 2',
    resolution: '4K',
    duration: '6-10s',
    audio: false,
    free: true
  },
  SEEDANCE: {
    key: 'seedance',
    name: 'Seedance',
    resolution: '1080p',
    duration: '5-10s',
    audio: false,
    free: true
  },
  WAN_25: {
    key: 'wan-25',
    name: 'Wan 2.5',
    resolution: '1080p',
    duration: '5-10s',
    audio: false,
    free: true
  },
  NANOBANANA: {
    key: 'nanobanana-video',
    name: 'Nano Banana',
    resolution: '720p',
    duration: '5-10s',
    audio: false,
    free: true
  },
  LTXV_13B: {
    key: 'ltxv-13b',
    name: 'LTX-Video 13B',
    resolution: '480p',
    duration: '1-60s',
    audio: false,
    free: true,
    description: 'Flexible duration up to 60s'
  },
  
  // PREMIUM MODELS
  VEO_3: {
    key: 'veo_3',
    name: 'Veo 3 Fast',
    provider: 'Google',
    resolution: '1080p',
    duration: '8-8s',
    audio: true, // Native audio
    free: false
  },
  VEO_31: {
    key: 'veo-31',
    name: 'Veo 3.1 Fast',
    provider: 'Google',
    resolution: '1080p',
    duration: '8-8s',
    audio: true, // Native audio
    free: false
  }
};

/**
 * Generate video from text prompt
 */
export const generateTextToVideo = async (options) => {
  const {
    model = 'ltxv-2', // Default to LTV Video 2 (4K quality)
    prompt,
    duration = 10,
    resolution = null,
    aspectRatio = null,
    addAudio = false,
    audioPrompt = null,
    seed = null
  } = options;

  console.log('🎬 Generating video with VideoGenAPI...');
  console.log('Model:', model);
  console.log('Prompt:', prompt);
  console.log('Duration:', duration);

  // Build request body according to VideoGenAPI docs
  const requestBody = {
    model,
    prompt,
    duration,
    resolution: "1080p" // Required parameter
  };

  // Add seed if provided (optional)
  if (seed) {
    requestBody.seed = seed;
  }

  try {
    const response = await makeVideoGenRequest('/generate', 'POST', requestBody);
    
    console.log('📦 Full API Response:', JSON.stringify(response, null, 2));
    
    if (!response.generation_id) {
      console.error('❌ No generation_id in response:', response);
      throw new Error('Invalid API response: missing generation_id');
    }
    
    console.log('✅ Video generation started:', response.generation_id);
    
    return {
      success: true,
      generationId: response.generation_id,
      requestId: response.request_id,
      status: response.status,
      model: response.model,
      statusUrl: response.status_url,
      message: response.message
    };

  } catch (error) {
    console.error('❌ Video generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate video from image + prompt
 */
export const generateImageToVideo = async (options) => {
  const {
    model = 'kling_25',
    prompt,
    imageUrl,
    imageBase64, // NEW: Accept base64 image directly
    duration = 10,
    resolution = '1080p',
    cameraFixed = false,
    addAudio = false,
    audioPrompt = null,
    seed = null
  } = options;

  console.log('🎬 Generating image-to-video with VideoGenAPI...');
  console.log('Model:', model);
  console.log('Image type:', imageBase64 ? 'base64' : 'url');
  console.log('Prompt:', prompt);
  console.log('Duration requested:', duration);

  const requestBody = {
    model,
    prompt,
    duration,
    resolution,
    camera_fixed: cameraFixed,
  };

  // Use base64 image if provided, otherwise use URL
  if (imageBase64) {
    // Convert base64 to blob for file upload
    const base64Data = imageBase64.split('base64,')[1] || imageBase64;
    requestBody.image_base64 = base64Data;
    console.log('📦 Using base64 image upload');
  } else if (imageUrl) {
    requestBody.image_url = imageUrl;
    console.log('🔗 Using image URL');
  }

  // Add audio enhancement if requested
  if (addAudio) {
    requestBody.add_audio = true;
    if (audioPrompt) {
      requestBody.audio_prompt = audioPrompt;
    }
  }

  // Add seed if provided
  if (seed) {
    requestBody.seed = seed;
  }
  
  console.log('📤 Final request body:', JSON.stringify({...requestBody, image_base64: imageBase64 ? '[BASE64_DATA]' : undefined}, null, 2));

  try {
    const response = await makeVideoGenRequest('/generate', 'POST', requestBody);
    
    console.log('✅ Image-to-video generation started:', response.generation_id);
    
    return {
      success: true,
      generationId: response.generation_id,
      requestId: response.request_id,
      status: response.status,
      model: response.model,
      statusUrl: response.status_url,
      message: response.message
    };

  } catch (error) {
    console.error('❌ Image-to-video generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check video generation status
 */
export const checkVideoStatus = async (generationId) => {
  try {
    const response = await makeVideoGenRequest(`/status/${generationId}`, 'GET');
    
    console.log(`📊 Status Response for ${generationId}:`, JSON.stringify(response, null, 2));
    
    return {
      success: true,
      generationId: response.generation_id,
      status: response.status,
      videoUrl: response.video_url,
      model: response.model,
      prompt: response.prompt,
      duration: response.duration,
      resolution: response.resolution,
      processingTime: response.processing_time,
      completedAt: response.completed_at,
      seed: response.seed
    };

  } catch (error) {
    console.error('❌ Status check error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Poll for video completion
 */
export const pollVideoCompletion = async (generationId, maxAttempts = 120, interval = 5000) => {
  console.log('⏳ Polling video status:', generationId);

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, interval));

    const status = await checkVideoStatus(generationId);

    if (!status.success) {
      throw new Error(status.error);
    }

    console.log(`Poll ${i + 1}/${maxAttempts}: ${status.status}`);

    if (status.status === 'completed' && status.videoUrl) {
      console.log('✅ Video completed:', status.videoUrl);
      return status;
    }
    
    // If status is "completed" but no video_url, keep polling
    if (status.status === 'completed' && !status.videoUrl) {
      console.log('⚠️ Status is completed but video_url is missing, continuing to poll...');
      continue;
    }

    if (status.status === 'failed') {
      throw new Error('Video generation failed');
    }
  }

  throw new Error('Video generation timeout');
};

/**
 * Generate multiple video clips
 */
export const generateMultipleClips = async (scenes, options = {}, onProgress) => {
  const {
    model = 'sora-2',
    addAudio = false,
    audioPrompt = null, // Global audio prompt for all clips
    characterImageUrl = null, // For image-to-video consistency (URL)
    characterImageBase64 = null, // NEW: Base64 image for upload
    seed = null // SEED for visual consistency across all clips
  } = options;

  console.log('🚀 Generating multiple clips with VideoGenAPI...');
  console.log(`Model: ${model}`);
  console.log(`Scenes: ${scenes.length}`);
  console.log(`Audio: ${addAudio ? 'Yes' : 'No'}`);
  console.log(`Image type: ${characterImageBase64 ? 'base64' : characterImageUrl ? 'url' : 'none'}`);
  if (audioPrompt) console.log(`Audio Prompt: ${audioPrompt}`);

  const clips = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const sceneNumber = i + 1;

    if (onProgress) {
      onProgress({
        stage: 'generating',
        message: `Generating clip ${sceneNumber}/${scenes.length}...`,
        progress: (i / scenes.length) * 50,
        currentScene: sceneNumber,
        totalScenes: scenes.length
      });
    }

    console.log(`🎬 Generating clip ${sceneNumber}: ${scene.prompt}`);

    try {
      // Use image-to-video if character image provided (base64 or URL)
      const generateFn = (characterImageBase64 || characterImageUrl) ? generateImageToVideo : generateTextToVideo;
      
      const videoOptions = {
        model,
        prompt: scene.prompt,
        duration: scene.duration || 10,
        addAudio,
        audioPrompt: audioPrompt, // Use global audio prompt
        seed: seed // Use same seed for all clips for consistency
      };
      
      // Add image (prefer base64 over URL)
      if (characterImageBase64) {
        videoOptions.imageBase64 = characterImageBase64;
      } else if (characterImageUrl) {
        videoOptions.imageUrl = characterImageUrl;
      }

      const result = await generateFn(videoOptions);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Wait for completion
      if (onProgress) {
        onProgress({
          stage: 'processing',
          message: `Processing clip ${sceneNumber}...`,
          progress: (i / scenes.length) * 50 + 25,
          currentScene: sceneNumber,
          totalScenes: scenes.length
        });
      }

      const completed = await pollVideoCompletion(result.generationId);

      clips.push({
        sceneNumber,
        generationId: completed.generationId,
        uri: completed.videoUrl,
        originalUri: completed.videoUrl,
        imageUri: characterImageUrl || characterImageBase64 || null,
        prompt: scene.prompt,
        duration: completed.duration || 10, // Default to 10s if null
        model: completed.model?.name || completed.model || model,
        hasAudio: addAudio,
        status: 'completed',
        processingTime: completed.processingTime
      });

      console.log(`✅ Clip ${sceneNumber} completed`);

    } catch (error) {
      console.error(`❌ Clip ${sceneNumber} error:`, error);
      // Continue with other clips
    }
  }

  if (onProgress) {
    onProgress({
      stage: 'complete',
      message: 'All clips generated!',
      progress: 100,
      currentScene: scenes.length,
      totalScenes: scenes.length
    });
  }

  console.log(`✅ Generated ${clips.length}/${scenes.length} clips`);

  return {
    success: true,
    clips,
    totalClips: clips.length
  };
};

/**
 * Get user information and usage
 */
export const getUserInfo = async () => {
  try {
    const response = await makeVideoGenRequest('/user', 'GET');
    return {
      success: true,
      ...response
    };
  } catch (error) {
    console.error('❌ Get user info error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  VIDEO_MODELS,
  generateTextToVideo,
  generateImageToVideo,
  checkVideoStatus,
  pollVideoCompletion,
  generateMultipleClips,
  getUserInfo
};

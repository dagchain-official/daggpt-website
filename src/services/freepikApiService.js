/**
 * FREEPIK API SERVICE
 * Complete integration with Freepik API for:
 * - Image Generation (Mystic, Flux, Google Imagen 3)
 * - Video Generation (Kling v2, Kling Elements, MiniMax, PixVerse V5)
 * - Image Editing (Upscale, Relight, Style Transfer, Background Removal)
 * - Icon Generation
 * 
 * Premium Plan: 6000 RPD for Mystic, 600 RPD for Kling models
 * PixVerse V5: Image-to-video with AUDIO support!
 */

const FREEPIK_API_KEY = process.env.REACT_APP_FREEPIK_API_KEY;
const FREEPIK_BASE_URL = 'https://api.freepik.com/v1';
const USE_PROXY = true; // Use backend proxy to avoid CORS issues
const PROXY_URL = '/api/freepik-proxy';

/**
 * Helper function to make API requests through proxy
 */
const makeFreepikRequest = async (endpoint, method = 'POST', body = null) => {
  if (USE_PROXY) {
    // Use backend proxy
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: endpoint,
        method: method,
        body: body
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Freepik API error response:', error);
      const errorMessage = error.error || error.message || error.details?.message || `Freepik API error: ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } else {
    // Direct API call (will fail due to CORS in browser)
    const url = `${FREEPIK_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': FREEPIK_API_KEY
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API error: ${response.status}`);
    }

    return await response.json();
  }
};

/**
 * ========================================
 * IMAGE GENERATION
 * ========================================
 */

/**
 * Generate image using Mystic model (Premium: 6000 RPD)
 */
export const generateImageWithMystic = async (prompt, options = {}) => {
  const {
    negativePrompt = '',
    numImages = 1,
    guidanceScale = 7.5,
    numInferenceSteps = 50,
    seed = null,
    imageSize = '1024x1024', // Options: 512x512, 768x768, 1024x1024, 1024x1792, 1792x1024
    styling = {
      style: 'photo', // photo, digital-art, 3d, painting, etc.
      color: 'vibrant',
      lighting: 'studio'
    }
  } = options;

  console.log('🎨 Generating image with Freepik Mystic...');

  try {
    console.log('🎨 Generating image with Freepik Mystic (via proxy)...');
    
    // Mystic API requires webhook_url, but we'll poll instead
    const requestBody = {
      prompt: prompt,
      resolution: imageSize.includes('1792') || imageSize.includes('2048') ? '2k' : '1k',
      aspect_ratio: imageSize === '1024x1024' ? 'square_1_1' : 
                    imageSize === '1792x1024' ? 'landscape_16_9' : 
                    imageSize === '1024x1792' ? 'portrait_9_16' : 'square_1_1'
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));

    const data = await makeFreepikRequest('/ai/mystic', 'POST', requestBody);
    
    console.log('✅ Mystic image generation initiated:', data);

    return {
      success: true,
      taskId: data.data?.task_id || data.task_id || data.data?.id || data.id,
      status: 'processing',
      message: 'Image generation started'
    };

  } catch (error) {
    console.error('❌ Mystic generation error:', error);
    console.error('❌ Full error object:', JSON.stringify(error, null, 2));
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    return {
      success: false,
      error: error.message,
      fullError: error
    };
  }
};

/**
 * ========================================
 * VIDEO GENERATION
 * ========================================
 */

/**
 * Generate video from image using Kling v2 (Premium: 600 RPD)
 * Supports 5s and 10s durations
 */
export const generateVideoWithKlingV2 = async (imageUrl, prompt, options = {}) => {
  const {
    duration = 5, // 5 or 10 seconds
    negativePrompt = '',
    cfg_scale = 0.5, // 0-1, higher = more adherence to prompt
    webhookUrl = null
  } = options;

  console.log(`🎬 Generating ${duration}s video with Kling v2...`);

  try {
    const data = await makeFreepikRequest('/ai/image-to-video/kling-v2', 'POST', {
      image: imageUrl,
      duration: duration.toString(),
      prompt: prompt,
      negative_prompt: negativePrompt,
      cfg_scale: cfg_scale,
      webhook_url: webhookUrl
    });
    
    console.log('✅ Kling v2 video generation initiated:', data);

    return {
      success: true,
      taskId: data.task_id,
      status: data.status,
      message: `${duration}s video generation started`
    };

  } catch (error) {
    console.error('❌ Kling v2 generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate video using MiniMax Hailuo2 (768p or 1080p)
 */
export const generateVideoWithMiniMax = async (imageUrl, prompt, options = {}) => {
  const {
    resolution = '768p', // '768p' or '1080p'
    negativePrompt = '',
    webhookUrl = null
  } = options;

  console.log(`🎬 Generating video with MiniMax Hailuo2 (${resolution})...`);

  const endpoint = resolution === '1080p' 
    ? `${FREEPIK_BASE_URL}/ai/image-to-video/minimax-hailuo2-1080p`
    : `${FREEPIK_BASE_URL}/ai/image-to-video/minimax-hailuo2-768p`;

  try {
    const apiEndpoint = resolution === '1080p' 
      ? '/ai/image-to-video/minimax-hailuo2-1080p'
      : '/ai/image-to-video/minimax-hailuo2-768p';
    
    const data = await makeFreepikRequest(apiEndpoint, 'POST', {
      image: imageUrl,
      prompt: prompt,
      negative_prompt: negativePrompt,
      webhook_url: webhookUrl
    });
    
    console.log('✅ MiniMax video generation initiated:', data);

    return {
      success: true,
      taskId: data.task_id,
      status: data.status,
      resolution: resolution,
      message: `MiniMax ${resolution} video generation started`
    };

  } catch (error) {
    console.error('❌ MiniMax generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * ========================================
 * TASK STATUS POLLING
 * ========================================
 */

/**
 * Get status of Kling v2 video task
 */
export const getKlingV2TaskStatus = async (taskId) => {
  try {
    const data = await makeFreepikRequest(`/ai/image-to-video/kling-v2/${taskId}`, 'GET');
    
    return {
      success: true,
      status: data.status, // CREATED, PROCESSING, COMPLETED, FAILED
      data: data.data || null,
      videoUrl: data.data?.result?.url || null
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
 * Get status of MiniMax video task
 */
export const getMiniMaxTaskStatus = async (taskId, resolution = '768p') => {
  const endpoint = resolution === '1080p'
    ? `${FREEPIK_BASE_URL}/ai/image-to-video/minimax-hailuo2-1080p/${taskId}`
    : `${FREEPIK_BASE_URL}/ai/image-to-video/minimax-hailuo2-768p/${taskId}`;

  try {
    const apiEndpoint = resolution === '1080p'
      ? `/ai/image-to-video/minimax-hailuo2-1080p/${taskId}`
      : `/ai/image-to-video/minimax-hailuo2-768p/${taskId}`;
    
    const data = await makeFreepikRequest(apiEndpoint, 'GET');
    
    return {
      success: true,
      status: data.status,
      data: data.data || null,
      videoUrl: data.data?.result?.url || null
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
 * Get status of Mystic image task
 */
export const getMysticTaskStatus = async (taskId) => {
  try {
    const data = await makeFreepikRequest(`/ai/text-to-image/${taskId}`, 'GET');
    
    return {
      success: true,
      status: data.status,
      data: data.data || null,
      images: data.data?.result?.images || []
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
 * Poll task until completion
 */
export const pollTaskUntilComplete = async (taskId, taskType, onProgress, maxAttempts = 60) => {
  console.log(`⏳ Polling ${taskType} task: ${taskId}`);

  const getStatusFn = {
    'kling-v2': getKlingV2TaskStatus,
    'minimax-768p': (id) => getMiniMaxTaskStatus(id, '768p'),
    'minimax-1080p': (id) => getMiniMaxTaskStatus(id, '1080p'),
    'mystic': getMysticTaskStatus
  }[taskType];

  if (!getStatusFn) {
    throw new Error(`Unknown task type: ${taskType}`);
  }

  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s between polls
    attempts++;

    if (onProgress) {
      onProgress({
        attempts,
        maxAttempts,
        elapsed: attempts * 5,
        message: `Checking status... (${attempts * 5}s elapsed)`
      });
    }

    const statusResult = await getStatusFn(taskId);

    if (!statusResult.success) {
      throw new Error(statusResult.error);
    }

    console.log(`Poll ${attempts}: ${statusResult.status}`);

    if (statusResult.status === 'COMPLETED') {
      console.log('✅ Task completed!');
      return {
        success: true,
        ...statusResult
      };
    }

    if (statusResult.status === 'FAILED') {
      throw new Error('Task failed');
    }
  }

  throw new Error('Task timeout');
};

/**
 * ========================================
 * HELPER FUNCTIONS
 * ========================================
 */

/**
 * Get available models and their limits
 */
export const getFreepikModels = () => {
  return {
    image: {
      mystic: {
        name: 'Mystic (Freepik)',
        rpdLimit: 6000,
        features: ['text-to-image', 'high-quality', 'multiple-styles'],
        sizes: ['512x512', '768x768', '1024x1024', '1024x1792', '1792x1024']
      },
      fluxDev: {
        name: 'Flux Dev',
        rpdLimit: 3000,
        features: ['text-to-image', 'creative']
      },
      googleImagen3: {
        name: 'Google Imagen 3',
        rpdLimit: 10000,
        features: ['text-to-image', 'photorealistic']
      }
    },
    video: {
      klingV2: {
        name: 'Kling v2',
        rpdLimit: 600,
        durations: [5, 10],
        features: ['image-to-video', 'high-quality', 'motion-control']
      },
      klingElementsPro: {
        name: 'Kling Elements Pro',
        rpdLimit: 600,
        features: ['image-to-video', 'special-effects']
      },
      miniMax768p: {
        name: 'MiniMax Hailuo2 768p',
        rpdLimit: 288,
        resolution: '768p',
        features: ['image-to-video']
      },
      miniMax1080p: {
        name: 'MiniMax Hailuo2 1080p',
        rpdLimit: 288,
        resolution: '1080p',
        features: ['image-to-video', 'high-resolution']
      }
    }
  };
};

/**
 * Check API key validity
 */
export const validateFreepikApiKey = async () => {
  try {
    // Try a simple request to validate key
    const response = await fetch(`${FREEPIK_BASE_URL}/ai/text-to-image`, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': FREEPIK_API_KEY
      }
    });

    return response.status !== 401 && response.status !== 403;
  } catch (error) {
    return false;
  }
};

/**
 * Generate video from image using Kling 2.5 Turbo Pro (WITH AUDIO!)
 * Endpoint: POST /v1/ai/image-to-video/kling-v2-5-pro
 * Supports both base64 and URL images
 */
export const generateVideoWithKling25Pro = async (image, prompt, options = {}) => {
  const {
    duration = 5, // 5 or 10 seconds
    negativePrompt = '',
    cfgScale = 0.5 // 0-1, higher = stricter adherence to prompt
  } = options;

  console.log('🎬 Generating video with Kling 2.5 Turbo Pro (with audio)...');
  console.log('Image:', typeof image === 'string' && image.startsWith('http') ? image : 'base64');
  console.log('Prompt:', prompt);
  console.log('Duration:', duration);

  const requestBody = {
    image: image, // Supports both base64 and URL
    prompt: prompt,
    duration: duration.toString(), // Must be '5' or '10' as STRING
    cfg_scale: cfgScale
  };

  if (negativePrompt) {
    requestBody.negative_prompt = negativePrompt;
  }

  try {
    const response = await makeFreepikRequest('/ai/image-to-video/kling-v2-5-pro', 'POST', requestBody);
    
    console.log('✅ Kling 2.5 Pro task created:', response.data.task_id);
    
    return {
      success: true,
      taskId: response.data.task_id,
      status: response.data.status
    };
  } catch (error) {
    console.error('❌ Kling 2.5 Pro generation error:', error);
    console.error('❌ Full error object:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
};

/**
 * Get Kling 2.5 Turbo Pro task status
 * Endpoint: GET /v1/ai/image-to-video/kling-v2-5-pro/{task-id}
 */
export const getKling25ProTaskStatus = async (taskId) => {
  try {
    const response = await makeFreepikRequest(`/ai/image-to-video/kling-v2-5-pro/${taskId}`, 'GET');
    
    return {
      success: true,
      status: response.data.status,
      generated: response.data.generated || [],
      taskId: taskId
    };
  } catch (error) {
    console.error('❌ Kling 2.5 Pro status check error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate video from image using PixVerse V5 (WITH AUDIO!)
 * Endpoint: POST /v1/ai/image-to-video/pixverse-v5
 */
export const generateVideoWithPixVerseV5 = async (imageUrl, prompt, options = {}) => {
  const {
    resolution = '720p', // 360p, 540p, 720p, 1080p
    duration = 5, // 5 or 8 seconds (8s costs double, 1080p limited to 5s)
    style = 'anime', // anime, 3d_animation, clay, cyberpunk, comic
    negativePrompt = '',
    seed = null
  } = options;

  console.log('🎬 Generating video with PixVerse V5 (with audio)...');
  console.log('Image:', imageUrl);
  console.log('Prompt:', prompt);
  console.log('Resolution:', resolution);
  console.log('Duration:', duration);
  console.log('Style:', style);

  const requestBody = {
    image_url: imageUrl,
    prompt: prompt,
    resolution: resolution,
    duration: duration,
    style: style
  };

  if (negativePrompt) {
    requestBody.negative_prompt = negativePrompt;
  }

  if (seed) {
    requestBody.seed = seed;
  }

  try {
    const response = await makeFreepikRequest('/ai/image-to-video/pixverse-v5', 'POST', requestBody);
    
    console.log('✅ PixVerse V5 task created:', response.data.task_id);
    
    return {
      success: true,
      taskId: response.data.task_id,
      status: response.data.status
    };
  } catch (error) {
    console.error('❌ PixVerse V5 generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get PixVerse V5 task status
 * Endpoint: GET /v1/ai/image-to-video/pixverse-v5/{task-id}
 */
export const getPixVerseV5TaskStatus = async (taskId) => {
  try {
    const response = await makeFreepikRequest(`/ai/image-to-video/pixverse-v5/${taskId}`, 'GET');
    
    return {
      success: true,
      status: response.data.status,
      generated: response.data.generated || [],
      taskId: taskId
    };
  } catch (error) {
    console.error('❌ PixVerse V5 status check error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  // Image Generation
  generateImageWithMystic,
  getMysticTaskStatus,
  
  // Video Generation
  generateVideoWithKlingV2,
  generateVideoWithKling25Pro,
  generateVideoWithMiniMax,
  generateVideoWithPixVerseV5,
  getKlingV2TaskStatus,
  getKling25ProTaskStatus,
  getMiniMaxTaskStatus,
  getPixVerseV5TaskStatus,
  
  // Polling
  pollTaskUntilComplete,
  
  // Helpers
  getFreepikModels,
  validateFreepikApiKey
};

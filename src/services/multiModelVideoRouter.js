/**
 * MULTI-MODEL VIDEO ROUTER
 * Intelligently routes video generation to the best AI model
 * Handles rate limits by distributing load across multiple providers
 */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const VEO_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Model configurations and capabilities
 */
const MODEL_CONFIG = {
  'veo-3.1': {
    name: 'Google Veo 3.1',
    apiEndpoint: VEO_API_URL,
    maxDuration: 8,
    strengths: ['action', 'realistic', 'characters', 'detailed'],
    quality: 'excellent',
    speed: 'medium',
    available: true, // We have this
    rateLimitStrategy: 'queue' // Queue requests to avoid rate limits
  },
  'runway-gen3': {
    name: 'Runway Gen-3',
    apiEndpoint: null, // Would need API key
    maxDuration: 10,
    strengths: ['cinematic', 'smooth-motion', 'artistic'],
    quality: 'excellent',
    speed: 'fast',
    available: false, // Future integration
    rateLimitStrategy: 'parallel'
  },
  'pika-labs': {
    name: 'Pika Labs',
    apiEndpoint: null,
    maxDuration: 8,
    strengths: ['effects', 'transformations', 'abstract'],
    quality: 'good',
    speed: 'fast',
    available: false,
    rateLimitStrategy: 'parallel'
  },
  'luma-ai': {
    name: 'Luma AI Dream Machine',
    apiEndpoint: null,
    maxDuration: 5,
    strengths: ['camera-movement', 'environments', 'nature'],
    quality: 'excellent',
    speed: 'medium',
    available: false,
    rateLimitStrategy: 'parallel'
  }
};

/**
 * Rate limit manager - Intelligent queuing system
 */
class RateLimitManager {
  constructor() {
    this.queues = {
      'veo-3.1': [],
      'runway-gen3': [],
      'pika-labs': [],
      'luma-ai': []
    };
    this.processing = {
      'veo-3.1': false,
      'runway-gen3': false,
      'pika-labs': false,
      'luma-ai': false
    };
    this.delays = {
      'veo-3.1': 15000, // 15 seconds between Veo requests
      'runway-gen3': 5000,
      'pika-labs': 5000,
      'luma-ai': 5000
    };
    this.lastRequest = {
      'veo-3.1': 0,
      'runway-gen3': 0,
      'pika-labs': 0,
      'luma-ai': 0
    };
  }

  async queueRequest(model, requestFn) {
    return new Promise((resolve, reject) => {
      this.queues[model].push({ requestFn, resolve, reject });
      this.processQueue(model);
    });
  }

  async processQueue(model) {
    if (this.processing[model] || this.queues[model].length === 0) {
      return;
    }

    this.processing[model] = true;

    while (this.queues[model].length > 0) {
      const { requestFn, resolve, reject } = this.queues[model].shift();

      // Check if we need to wait due to rate limit
      const timeSinceLastRequest = Date.now() - this.lastRequest[model];
      const waitTime = Math.max(0, this.delays[model] - timeSinceLastRequest);

      if (waitTime > 0) {
        console.log(`⏳ Rate limit: Waiting ${waitTime}ms before next ${model} request`);
        await new Promise(r => setTimeout(r, waitTime));
      }

      try {
        this.lastRequest[model] = Date.now();
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processing[model] = false;
  }
}

const rateLimitManager = new RateLimitManager();

/**
 * Generate video with Veo 3.1 (with rate limit handling)
 */
export const generateWithVeo = async (prompt, aspectRatio, onProgress) => {
  console.log('🎬 Generating with Veo 3.1...');

  const requestFn = async () => {
    const requestBody = {
      instances: [{ prompt }],
      parameters: {
        aspectRatio: aspectRatio,
        durationSeconds: 8,
        resolution: "720p"
      }
    };

    const response = await fetch(VEO_API_URL, {
      method: 'POST',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Veo API error: ${response.status}`);
    }

    const operationData = await response.json();
    return operationData.name;
  };

  // Queue the request to handle rate limits
  const operationName = await rateLimitManager.queueRequest('veo-3.1', requestFn);

  // Poll for completion
  return await pollVideoOperation(operationName, onProgress);
};

/**
 * Poll video operation until complete
 */
const pollVideoOperation = async (operationName, onProgress) => {
  const maxPolls = 120; // 20 minutes max
  let pollCount = 0;

  while (pollCount < maxPolls) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
    pollCount++;

    if (onProgress) {
      onProgress({
        status: 'polling',
        pollCount,
        elapsed: pollCount * 10
      });
    }

    try {
      const response = await fetch(
        `${BASE_URL}/${operationName}?key=${GEMINI_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Poll error: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.done) {
        const videoData = result.response?.generateVideoResponse?.generatedSamples?.[0];
        
        if (videoData && videoData.video) {
          return {
            success: true,
            uri: videoData.video.uri,
            pollCount,
            timeElapsed: pollCount * 10
          };
        } else {
          throw new Error('No video data in response');
        }
      }
    } catch (error) {
      console.error('Poll error:', error);
      throw error;
    }
  }

  throw new Error('Video generation timeout');
};

/**
 * Fallback to alternative models (placeholder for future)
 */
const generateWithAlternative = async (model, prompt, aspectRatio) => {
  console.log(`⚠️ ${model} not available yet. Using Veo 3.1 as fallback.`);
  return await generateWithVeo(prompt, aspectRatio);
};

/**
 * Main router - Selects best available model and generates video
 */
export const routeVideoGeneration = async (scene, consistencyGuide, aspectRatio, onProgress) => {
  const requestedModel = scene.aiModel;
  const modelConfig = MODEL_CONFIG[requestedModel];

  console.log(`🎯 Routing scene ${scene.sceneNumber} to ${modelConfig.name}`);
  console.log(`📝 Reason: ${scene.modelReason}`);

  // Check if model is available
  if (!modelConfig.available) {
    console.log(`⚠️ ${modelConfig.name} not available. Using Veo 3.1 as fallback.`);
    return await generateWithVeo(scene.enhancedPrompt, aspectRatio, onProgress);
  }

  // Route to appropriate model
  switch (requestedModel) {
    case 'veo-3.1':
      return await generateWithVeo(scene.enhancedPrompt, aspectRatio, onProgress);
    
    case 'runway-gen3':
    case 'pika-labs':
    case 'luma-ai':
      return await generateWithAlternative(requestedModel, scene.enhancedPrompt, aspectRatio);
    
    default:
      return await generateWithVeo(scene.enhancedPrompt, aspectRatio, onProgress);
  }
};

/**
 * Generate multiple scenes in parallel (with intelligent rate limiting)
 */
export const generateMultipleScenes = async (scenes, consistencyGuide, aspectRatio, onProgress) => {
  console.log(`🎬 Generating ${scenes.length} scenes with intelligent routing...`);

  const results = [];
  
  // Generate scenes sequentially to respect rate limits
  // In future, we can parallelize across different models
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    
    if (onProgress) {
      onProgress({
        stage: 'generating',
        currentScene: i + 1,
        totalScenes: scenes.length,
        sceneInfo: {
          number: scene.sceneNumber,
          model: scene.aiModel
        }
      });
    }

    try {
      const result = await routeVideoGeneration(
        scene,
        consistencyGuide,
        aspectRatio,
        (progress) => {
          if (onProgress) {
            onProgress({
              stage: 'generating',
              currentScene: i + 1,
              totalScenes: scenes.length,
              sceneInfo: {
                number: scene.sceneNumber,
                model: scene.aiModel
              },
              progress: progress
            });
          }
        }
      );

      results.push({
        sceneNumber: scene.sceneNumber,
        ...result
      });

      console.log(`✅ Scene ${scene.sceneNumber} complete!`);

    } catch (error) {
      console.error(`❌ Scene ${scene.sceneNumber} failed:`, error);
      results.push({
        sceneNumber: scene.sceneNumber,
        success: false,
        error: error.message
      });
    }
  }

  return results;
};

/**
 * Get model statistics
 */
export const getModelStats = () => {
  return {
    available: Object.entries(MODEL_CONFIG)
      .filter(([_, config]) => config.available)
      .map(([model, config]) => ({
        model,
        name: config.name,
        strengths: config.strengths
      })),
    total: Object.keys(MODEL_CONFIG).length,
    rateLimitStatus: rateLimitManager.lastRequest
  };
};

export default {
  routeVideoGeneration,
  generateMultipleScenes,
  generateWithVeo,
  getModelStats,
  MODEL_CONFIG
};

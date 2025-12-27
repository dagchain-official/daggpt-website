/**
 * FREEPIK VIDEO GENERATION SERVICE
 * Integrates Freepik's video models into our video generation pipeline
 * Replaces Veo 3.1 to solve rate limit issues
 */

import { 
  generateImageWithMystic, 
  getMysticTaskStatus,
  generateVideoWithKlingV2,
  generateVideoWithKling25Pro,
  generateVideoWithMiniMax,
  generateVideoWithPixVerseV5,
  getKling25ProTaskStatus,
  getPixVerseV5TaskStatus,
  getMiniMaxTaskStatus,
  pollTaskUntilComplete 
} from './freepikApiService';

/**
 * Generate video from text prompt using Freepik pipeline
 * Step 1: Generate image with Mystic
 * Step 2: Convert image to video with Kling v2
 */
export const generateVideoFromText = async (prompt, style, aspectRatio, duration, onProgress) => {
  console.log('🎬 Starting Freepik video generation pipeline...');
  console.log(`Prompt: ${prompt}`);
  console.log(`Duration: ${duration}s`);
  console.log(`Style: ${style}`);

  try {
    // ==========================================
    // STEP 1: Generate Image with Mystic
    // ==========================================
    if (onProgress) {
      onProgress({
        stage: 'image-generation',
        message: 'Generating base image with Mystic AI...',
        progress: 10
      });
    }

    // Map aspect ratio to image size
    const imageSizeMap = {
      '16:9': '1792x1024',
      '9:16': '1024x1792',
      '1:1': '1024x1024',
      '4:3': '1024x768'
    };

    const imageSize = imageSizeMap[aspectRatio] || '1024x1024';

    // Map style to Mystic styling
    const stylingMap = {
      'cinematic': { style: 'photo', color: 'cinematic', lighting: 'dramatic' },
      'anime': { style: 'anime', color: 'vibrant', lighting: 'soft' },
      'realistic': { style: 'photo', color: 'natural', lighting: 'studio' },
      'cartoon': { style: 'digital-art', color: 'vibrant', lighting: 'bright' },
      'abstract': { style: 'digital-art', color: 'vibrant', lighting: 'artistic' },
      '3d-render': { style: '3d', color: 'vibrant', lighting: 'studio' }
    };

    const styling = stylingMap[style] || stylingMap['realistic'];

    // Enhanced prompt for better image quality
    const enhancedPrompt = `${prompt}. High quality, detailed, professional ${style} style.`;

    const imageResult = await generateImageWithMystic(enhancedPrompt, {
      imageSize,
      styling,
      numImages: 1,
      guidanceScale: 7.5
    });

    if (!imageResult.success) {
      throw new Error(`Image generation failed: ${imageResult.error}`);
    }

    console.log('✅ Image generation task created:', imageResult.taskId);

    // Poll for image completion
    if (onProgress) {
      onProgress({
        stage: 'image-generation',
        message: 'Waiting for image to be generated...',
        progress: 20
      });
    }

    const imageComplete = await pollTaskUntilComplete(
      imageResult.taskId,
      'mystic',
      (pollProgress) => {
        if (onProgress) {
          onProgress({
            stage: 'image-generation',
            message: `Generating image... (${pollProgress.elapsed}s)`,
            progress: 20 + (pollProgress.attempts / pollProgress.maxAttempts) * 30
          });
        }
      }
    );

    if (!imageComplete.success || !imageComplete.images || imageComplete.images.length === 0) {
      throw new Error('Image generation failed or no images returned');
    }

    const generatedImageUrl = imageComplete.images[0].url;
    console.log('✅ Image generated:', generatedImageUrl);

    // ==========================================
    // STEP 2: Convert Image to Video with Kling v2
    // ==========================================
    if (onProgress) {
      onProgress({
        stage: 'video-generation',
        message: 'Converting image to video with Kling v2...',
        progress: 50,
        imageUrl: generatedImageUrl
      });
    }

    // Determine video duration (Kling v2 supports 5s or 10s)
    const klingDuration = duration <= 5 ? 5 : 10;

    // Create motion prompt
    const motionPrompt = `${prompt}. Smooth, cinematic motion. Professional ${style} style video.`;

    const videoResult = await generateVideoWithKlingV2(
      generatedImageUrl,
      motionPrompt,
      {
        duration: klingDuration,
        cfg_scale: 0.7 // Good balance between prompt adherence and quality
      }
    );

    if (!videoResult.success) {
      throw new Error(`Video generation failed: ${videoResult.error}`);
    }

    console.log('✅ Video generation task created:', videoResult.taskId);

    // Poll for video completion
    if (onProgress) {
      onProgress({
        stage: 'video-generation',
        message: 'Generating video from image...',
        progress: 60
      });
    }

    const videoComplete = await pollTaskUntilComplete(
      videoResult.taskId,
      'kling-v2',
      (pollProgress) => {
        if (onProgress) {
          onProgress({
            stage: 'video-generation',
            message: `Processing video... (${pollProgress.elapsed}s)`,
            progress: 60 + (pollProgress.attempts / pollProgress.maxAttempts) * 35
          });
        }
      },
      120 // 10 minutes max
    );

    if (!videoComplete.success || !videoComplete.videoUrl) {
      throw new Error('Video generation failed or no video returned');
    }

    console.log('✅ Video generated:', videoComplete.videoUrl);

    // ==========================================
    // FINAL RESULT
    // ==========================================
    if (onProgress) {
      onProgress({
        stage: 'complete',
        message: 'Video generation complete!',
        progress: 100
      });
    }

    return {
      success: true,
      video: {
        uri: videoComplete.videoUrl,
        imageUri: generatedImageUrl,
        prompt: prompt,
        style: style,
        aspectRatio: aspectRatio,
        duration: klingDuration,
        model: 'freepik-kling-v2',
        taskId: videoResult.taskId,
        imageTaskId: imageResult.taskId
      }
    };

  } catch (error) {
    console.error('❌ Freepik video generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate video directly from image URL
 */
export const generateVideoFromImage = async (imageUrl, prompt, duration, onProgress) => {
  console.log('🎬 Generating video from image with Kling v2...');

  try {
    const klingDuration = duration <= 5 ? 5 : 10;

    const videoResult = await generateVideoWithKlingV2(
      imageUrl,
      prompt,
      { duration: klingDuration }
    );

    if (!videoResult.success) {
      throw new Error(`Video generation failed: ${videoResult.error}`);
    }

    const videoComplete = await pollTaskUntilComplete(
      videoResult.taskId,
      'kling-v2',
      onProgress,
      120
    );

    if (!videoComplete.success) {
      throw new Error('Video generation failed');
    }

    return {
      success: true,
      video: {
        uri: videoComplete.videoUrl,
        duration: klingDuration,
        model: 'freepik-kling-v2'
      }
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
 * Generate multiple video clips for long-form content
 */
export const generateMultipleClips = async (scenes, aspectRatio, style, onProgress) => {
  console.log(`🎬 Generating ${scenes.length} video clips with Freepik...`);

  const clips = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    
    if (onProgress) {
      onProgress({
        stage: 'generating',
        currentScene: i + 1,
        totalScenes: scenes.length,
        message: `Generating clip ${i + 1}/${scenes.length}...`,
        progress: (i / scenes.length) * 90,
        clips: clips // Pass current clips
      });
    }

    try {
      const result = await generateVideoFromText(
        scene.prompt,
        style || scene.style || 'cinematic',
        aspectRatio,
        scene.duration || 5,
        (sceneProgress) => {
          if (onProgress) {
            onProgress({
              stage: 'generating',
              currentScene: i + 1,
              totalScenes: scenes.length,
              sceneProgress: sceneProgress,
              message: `Clip ${i + 1}: ${sceneProgress.message}`,
              progress: (i / scenes.length) * 90 + (sceneProgress.progress / 100) * (90 / scenes.length),
              clips: clips // Pass current clips
            });
          }
        }
      );

      if (result.success && result.video) {
        clips.push({
          sceneNumber: i + 1,
          uri: result.video.uri,
          imageUri: result.video.imageUri,
          prompt: result.video.prompt,
          duration: result.video.duration,
          model: result.video.model,
          status: 'completed'
        });
        console.log(`✅ Clip ${i + 1} completed`);
        
        // Update progress with new clip
        if (onProgress) {
          onProgress({
            stage: 'generating',
            currentScene: i + 1,
            totalScenes: scenes.length,
            message: `Clip ${i + 1}/${scenes.length} completed!`,
            progress: ((i + 1) / scenes.length) * 90,
            clips: clips
          });
        }
      } else {
        console.error(`❌ Clip ${i + 1} failed:`, result.error);
        clips.push({
          sceneNumber: i + 1,
          status: 'failed',
          error: result.error || 'Unknown error'
        });
      }

    } catch (error) {
      console.error(`❌ Clip ${i + 1} error:`, error);
      clips.push({
        sceneNumber: i + 1,
        status: 'failed',
        error: error.message
      });
    }
  }

  return {
    success: true,
    clips: clips,
    totalClips: clips.length,
    successfulClips: clips.filter(c => c.status === 'completed').length
  };
};

/**
 * Poll PixVerse V5 task until complete
 */
const pollPixVerseV5UntilComplete = async (taskId, onProgress, maxAttempts = 60) => {
  console.log(`⏳ Polling PixVerse V5 task: ${taskId}`);

  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s between polls
    attempts++;

    if (onProgress) {
      onProgress({
        attempts,
        maxAttempts,
        elapsed: attempts * 5,
        message: `Checking status... (${attempts * 5}s elapsed)`,
        progress: (attempts / maxAttempts) * 100
      });
    }

    const statusResult = await getPixVerseV5TaskStatus(taskId);

    if (!statusResult.success) {
      throw new Error(statusResult.error);
    }

    console.log(`Poll ${attempts}: ${statusResult.status}`);

    if (statusResult.status === 'completed' || statusResult.status === 'COMPLETED') {
      console.log('✅ PixVerse V5 task completed!');
      return statusResult;
    }

    if (statusResult.status === 'failed' || statusResult.status === 'FAILED') {
      throw new Error('Video generation failed');
    }
  }

  throw new Error('Polling timeout - video generation took too long');
};

/**
 * Poll Kling 2.5 Pro task until complete
 */
const pollKling25ProUntilComplete = async (taskId, onProgress, maxAttempts = 60) => {
  console.log(`⏳ Polling Kling 2.5 Pro task: ${taskId}`);

  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s between polls
    attempts++;

    if (onProgress) {
      onProgress({
        attempts,
        maxAttempts,
        elapsed: attempts * 5,
        message: `Checking status... (${attempts * 5}s elapsed)`,
        progress: (attempts / maxAttempts) * 100
      });
    }

    const statusResult = await getKling25ProTaskStatus(taskId);

    if (!statusResult.success) {
      throw new Error(statusResult.error);
    }

    console.log(`Poll ${attempts}: ${statusResult.status}`);

    if (statusResult.status === 'completed' || statusResult.status === 'COMPLETED') {
      console.log('✅ Kling 2.5 Pro task completed!');
      return statusResult;
    }

    if (statusResult.status === 'failed' || statusResult.status === 'FAILED') {
      throw new Error('Video generation failed');
    }
  }

  throw new Error('Polling timeout - video generation took too long');
};

/**
 * Generate video from image using Kling 2.5 Turbo Pro (WITH AUDIO!)
 * Supports both base64 and URL images
 */
export const generateVideoWithKling25ProAudio = async (image, prompt, duration, onProgress) => {
  console.log('🎬🎵 Generating video from image with Kling 2.5 Turbo Pro (with audio)...');
  console.log('Image type:', typeof image === 'string' && image.startsWith('http') ? 'URL' : 'base64');
  console.log('Prompt:', prompt);

  try {
    // ==========================================
    // STEP 1: Start Kling 2.5 Pro Generation
    // ==========================================
    if (onProgress) {
      onProgress({
        stage: 'video-generation',
        message: 'Starting Kling 2.5 Pro video generation with audio...',
        progress: 10
      });
    }

    const result = await generateVideoWithKling25Pro(image, prompt, {
      duration: duration || 5,
      cfgScale: 0.5
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    // ==========================================
    // STEP 2: Poll for Completion
    // ==========================================
    if (onProgress) {
      onProgress({
        stage: 'processing',
        message: 'Processing video with audio (2-5 min)...',
        progress: 30
      });
    }

    const finalResult = await pollKling25ProUntilComplete(
      result.taskId,
      (pollProgress) => {
        if (onProgress) {
          onProgress({
            stage: 'processing',
            message: `Processing video with audio... ${pollProgress.message || 'Processing...'}`,
            progress: 30 + ((pollProgress.attempts || 0) * 1)
          });
        }
      }
    );

    if (!finalResult.success || !finalResult.generated || finalResult.generated.length === 0) {
      throw new Error('Video generation failed or no video URL returned');
    }

    const videoUrl = finalResult.generated[0];

    if (onProgress) {
      onProgress({
        stage: 'complete',
        message: 'Video with audio generated!',
        progress: 100
      });
    }

    console.log('✅ Kling 2.5 Pro video with audio generated:', videoUrl);

    return {
      success: true,
      video: {
        uri: videoUrl,
        imageUri: typeof image === 'string' && image.startsWith('http') ? image : 'base64',
        prompt: prompt,
        duration: duration || 5,
        model: 'Kling 2.5 Turbo Pro',
        hasAudio: true
      }
    };

  } catch (error) {
    console.error('❌ Kling 2.5 Pro generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate video from image using MiniMax (WITH AUDIO!)
 */
export const generateVideoWithMiniMaxAudio = async (imageUrl, prompt, duration, onProgress) => {
  console.log('🎬🎵 Generating video from image with MiniMax (with audio)...');
  console.log('Image:', imageUrl);
  console.log('Prompt:', prompt);

  try {
    // ==========================================
    // STEP 1: Start MiniMax Generation
    // ==========================================
    if (onProgress) {
      onProgress({
        stage: 'video-generation',
        message: 'Starting MiniMax video generation with audio...',
        progress: 10
      });
    }

    const result = await generateVideoWithMiniMax(imageUrl, prompt, {
      resolution: '768p', // 768p or 1080p
      duration: duration || 6
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    // ==========================================
    // STEP 2: Poll for Completion
    // ==========================================
    if (onProgress) {
      onProgress({
        stage: 'processing',
        message: 'Processing video with audio (3-5 min)...',
        progress: 30
      });
    }

    const finalResult = await pollMiniMaxUntilComplete(
      result.taskId,
      '768p',
      (pollProgress) => {
        if (onProgress) {
          onProgress({
            stage: 'processing',
            message: `Processing video with audio... ${pollProgress.message || 'Processing...'}`,
            progress: 30 + ((pollProgress.attempts || 0) * 1)
          });
        }
      }
    );

    if (!finalResult.success || !finalResult.generated || finalResult.generated.length === 0) {
      throw new Error('Video generation failed or no video URL returned');
    }

    const videoUrl = finalResult.generated[0];

    if (onProgress) {
      onProgress({
        stage: 'complete',
        message: 'Video with audio generated!',
        progress: 100
      });
    }

    console.log('✅ MiniMax video with audio generated:', videoUrl);

    return {
      success: true,
      video: {
        uri: videoUrl,
        imageUri: imageUrl,
        prompt: prompt,
        duration: duration || 6,
        model: 'MiniMax',
        hasAudio: true
      }
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
 * Poll MiniMax task until complete
 */
const pollMiniMaxUntilComplete = async (taskId, resolution, onProgress, maxAttempts = 60) => {
  console.log(`⏳ Polling MiniMax task: ${taskId}`);

  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s between polls
    attempts++;

    if (onProgress) {
      onProgress({
        attempts,
        maxAttempts,
        elapsed: attempts * 5,
        message: `Checking status... (${attempts * 5}s elapsed)`,
        progress: (attempts / maxAttempts) * 100
      });
    }

    const statusResult = await getMiniMaxTaskStatus(taskId, resolution);

    if (!statusResult.success) {
      throw new Error(statusResult.error);
    }

    console.log(`Poll ${attempts}: ${statusResult.status}`);

    if (statusResult.status === 'completed' || statusResult.status === 'COMPLETED') {
      console.log('✅ MiniMax task completed!');
      return statusResult;
    }

    if (statusResult.status === 'failed' || statusResult.status === 'FAILED') {
      throw new Error('Video generation failed');
    }
  }

  throw new Error('Polling timeout - video generation took too long');
};

/**
 * Generate video from image using PixVerse V5 (WITH AUDIO!)
 */
export const generateVideoFromImageWithAudio = async (imageUrl, prompt, duration, style, onProgress) => {
  console.log('🎬🎵 Generating video from image with PixVerse V5 (with audio)...');
  console.log('Image:', imageUrl);
  console.log('Prompt:', prompt);

  try {
    // ==========================================
    // STEP 1: Start PixVerse V5 Generation
    // ==========================================
    if (onProgress) {
      onProgress({
        stage: 'video-generation',
        message: 'Starting PixVerse V5 video generation with audio...',
        progress: 10
      });
    }

    // Map our styles to PixVerse valid styles
    const pixVerseStyleMap = {
      'cinematic': '3d_animation',
      'anime': 'anime',
      'realistic': '3d_animation',
      'cartoon': 'comic',
      'sci-fi': 'cyberpunk',
      'fantasy': '3d_animation'
    };
    
    const pixVerseStyle = pixVerseStyleMap[style] || '3d_animation';
    
    const result = await generateVideoWithPixVerseV5(imageUrl, prompt, {
      resolution: '720p',
      duration: duration || 5,
      style: pixVerseStyle
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    // ==========================================
    // STEP 2: Poll for Completion
    // ==========================================
    if (onProgress) {
      onProgress({
        stage: 'processing',
        message: 'Processing video with audio (2-5 min)...',
        progress: 30
      });
    }

    const finalResult = await pollPixVerseV5UntilComplete(
      result.taskId,
      (pollProgress) => {
        if (onProgress) {
          onProgress({
            stage: 'processing',
            message: `Processing video with audio... ${pollProgress.message || 'Processing...'}`,
            progress: 30 + ((pollProgress.attempts || 0) * 1)
          });
        }
      }
    );

    if (!finalResult.success || !finalResult.generated || finalResult.generated.length === 0) {
      throw new Error('Video generation failed or no video URL returned');
    }

    const videoUrl = finalResult.generated[0];

    if (onProgress) {
      onProgress({
        stage: 'complete',
        message: 'Video with audio generated!',
        progress: 100
      });
    }

    console.log('✅ PixVerse V5 video with audio generated:', videoUrl);

    return {
      success: true,
      video: {
        uri: videoUrl,
        imageUri: imageUrl,
        prompt: prompt,
        duration: duration || 5,
        model: 'PixVerse V5',
        hasAudio: true
      }
    };

  } catch (error) {
    console.error('❌ PixVerse V5 generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  generateVideoFromText,
  generateVideoFromImage,
  generateVideoFromImageWithAudio,
  generateVideoWithKling25ProAudio,
  generateMultipleClips
};

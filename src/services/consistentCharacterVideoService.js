/**
 * CONSISTENT CHARACTER VIDEO SERVICE
 * Generates videos with consistent characters using Image-to-Video pipeline
 * 
 * Pipeline:
 * 1. Generate character image from prompt
 * 2. Use same image for all video clips with motion prompts
 * 3. Ensures character consistency across all scenes
 */

import { makeFreepikRequest } from './freepikApiService';

/**
 * Generate character image using Mystic AI
 */
export const generateCharacterImage = async (prompt, options = {}) => {
  const {
    style = 'photo',
    imageSize = '1024x1024'
  } = options;

  console.log('🎨 Generating character image...');
  console.log('Prompt:', prompt);

  try {
    const requestBody = {
      prompt: prompt,
      num_images: 1,
      image: {
        size: imageSize
      },
      styling: {
        style: style,
        color: 'vibrant',
        lighting: 'natural'
      }
    };

    const response = await makeFreepikRequest('/ai/text-to-image', 'POST', requestBody);
    const taskData = response.data || response;

    console.log('✅ Character image generation initiated:', taskData.task_id);

    return {
      success: true,
      taskId: taskData.task_id,
      status: taskData.status
    };

  } catch (error) {
    console.error('❌ Character image generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Poll for character image completion
 */
export const pollCharacterImage = async (taskId, maxAttempts = 60) => {
  console.log('⏳ Polling character image task:', taskId);

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s

    try {
      const response = await makeFreepikRequest(`/ai/text-to-image/${taskId}`, 'GET');
      const taskData = response.data || response;

      console.log(`Poll ${i + 1}/${maxAttempts}: ${taskData.status}`);

      if (taskData.status === 'COMPLETED') {
        const imageUrl = taskData.result?.images?.[0] || taskData.generated?.[0];
        
        if (!imageUrl) {
          throw new Error('No image URL in completed task');
        }

        console.log('✅ Character image completed:', imageUrl);
        return {
          success: true,
          imageUrl: imageUrl
        };
      }

      if (taskData.status === 'FAILED') {
        throw new Error('Character image generation failed');
      }

    } catch (error) {
      console.error('❌ Poll error:', error);
      throw error;
    }
  }

  throw new Error('Character image generation timeout');
};

/**
 * Generate video from character image using Kling v2.5 Pro
 */
export const generateVideoFromCharacterImage = async (imageUrl, motionPrompt, options = {}) => {
  const {
    duration = 5, // 5 or 10 seconds
    cfg_scale = 0.5
  } = options;

  console.log('🎬 Generating video from character image...');
  console.log('Image URL:', imageUrl);
  console.log('Motion prompt:', motionPrompt);

  try {
    const requestBody = {
      image: imageUrl,
      prompt: motionPrompt,
      duration: duration.toString(),
      cfg_scale: cfg_scale
    };

    const response = await makeFreepikRequest('/ai/image-to-video/kling-v2-5-pro', 'POST', requestBody);
    const taskData = response.data || response;

    console.log('✅ Video generation initiated:', taskData.task_id);

    return {
      success: true,
      taskId: taskData.task_id,
      status: taskData.status
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
 * Poll for video completion
 */
export const pollVideoStatus = async (taskId, maxAttempts = 120) => {
  console.log('⏳ Polling video task:', taskId);

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s

    try {
      const response = await makeFreepikRequest(`/ai/image-to-video/kling-v2-5-pro/${taskId}`, 'GET');
      const taskData = response.data || response;

      console.log(`Poll ${i + 1}/${maxAttempts}: ${taskData.status}`);

      if (taskData.status === 'COMPLETED') {
        const videoUrl = taskData.result?.url || taskData.generated?.[0];
        
        if (!videoUrl) {
          throw new Error('No video URL in completed task');
        }

        console.log('✅ Video completed:', videoUrl);
        return {
          success: true,
          videoUrl: videoUrl
        };
      }

      if (taskData.status === 'FAILED') {
        throw new Error('Video generation failed');
      }

    } catch (error) {
      console.error('❌ Poll error:', error);
      throw error;
    }
  }

  throw new Error('Video generation timeout');
};

/**
 * Generate multiple clips with consistent character
 * Uses same character image for all clips
 */
export const generateConsistentCharacterVideo = async (characterPrompt, scenes, options = {}, onProgress) => {
  console.log('🚀 Starting consistent character video generation...');
  console.log(`Character: ${characterPrompt}`);
  console.log(`Scenes: ${scenes.length}`);

  try {
    // Step 1: Generate character image
    if (onProgress) {
      onProgress({
        stage: 'character',
        message: 'Creating character image...',
        progress: 5,
        currentScene: 0,
        totalScenes: scenes.length
      });
    }

    const imageResult = await generateCharacterImage(characterPrompt, options);
    if (!imageResult.success) {
      throw new Error(imageResult.error);
    }

    // Step 2: Wait for character image
    if (onProgress) {
      onProgress({
        stage: 'character',
        message: 'Waiting for character image...',
        progress: 10,
        currentScene: 0,
        totalScenes: scenes.length
      });
    }

    const imageStatus = await pollCharacterImage(imageResult.taskId);
    if (!imageStatus.success) {
      throw new Error('Character image generation failed');
    }

    console.log('✅ Character image ready:', imageStatus.imageUrl);

    // Step 3: Generate all video clips using the same character image
    const clips = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const sceneNumber = i + 1;

      if (onProgress) {
        onProgress({
          stage: 'video',
          message: `Generating clip ${sceneNumber}/${scenes.length}...`,
          progress: 15 + (i / scenes.length) * 70,
          currentScene: sceneNumber,
          totalScenes: scenes.length,
          characterImage: imageStatus.imageUrl
        });
      }

      console.log(`🎬 Generating clip ${sceneNumber}: ${scene.motionPrompt}`);

      try {
        // Generate video from character image
        const videoResult = await generateVideoFromCharacterImage(
          imageStatus.imageUrl,
          scene.motionPrompt,
          { duration: scene.duration || 5 }
        );

        if (!videoResult.success) {
          throw new Error(videoResult.error);
        }

        // Wait for video
        if (onProgress) {
          onProgress({
            stage: 'video',
            message: `Waiting for clip ${sceneNumber}...`,
            progress: 15 + ((i + 0.5) / scenes.length) * 70,
            currentScene: sceneNumber,
            totalScenes: scenes.length
          });
        }

        const videoStatus = await pollVideoStatus(videoResult.taskId);
        
        if (videoStatus.success) {
          clips.push({
            sceneNumber: sceneNumber,
            uri: videoStatus.videoUrl,
            originalUri: videoStatus.videoUrl,
            prompt: scene.motionPrompt,
            duration: scene.duration || 5,
            model: 'kling-v2.5-pro',
            status: 'completed',
            characterImage: imageStatus.imageUrl
          });
          
          console.log(`✅ Clip ${sceneNumber} completed`);
        } else {
          console.error(`❌ Clip ${sceneNumber} failed`);
        }

      } catch (error) {
        console.error(`❌ Clip ${sceneNumber} error:`, error);
      }
    }

    // Success!
    if (onProgress) {
      onProgress({
        stage: 'complete',
        message: 'All clips generated!',
        progress: 100,
        currentScene: scenes.length,
        totalScenes: scenes.length
      });
    }

    console.log(`✅ Generated ${clips.length}/${scenes.length} clips with consistent character`);

    return {
      success: true,
      clips: clips,
      characterImage: imageStatus.imageUrl,
      totalClips: clips.length
    };

  } catch (error) {
    console.error('❌ Consistent character video error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create motion prompts from scene descriptions
 * Extracts action/motion while keeping character consistent
 */
export const createMotionPrompts = (scenes, characterDescription) => {
  return scenes.map(scene => {
    // Extract action from scene prompt
    const action = scene.prompt
      .replace(characterDescription, '')
      .trim();
    
    return {
      ...scene,
      motionPrompt: action || 'camera slowly pans and zooms',
      characterDescription: characterDescription
    };
  });
};

export default {
  generateCharacterImage,
  generateVideoFromCharacterImage,
  generateConsistentCharacterVideo,
  createMotionPrompts
};

/**
 * FREEPIK IMAGE-TO-VIDEO PIPELINE
 * More reliable than text-to-video
 * Pipeline: Text → Mystic (Image) → Kling v2.5 Pro (Video)
 */

const PROXY_URL = '/api/freepik-proxy';

/**
 * Helper function to make API requests through proxy
 */
const makeFreepikRequest = async (endpoint, method = 'POST', body = null) => {
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
    throw new Error(error.error || `Proxy error: ${response.status}`);
  }

  return await response.json();
};

/**
 * Step 1: Generate image from text using Mystic
 */
export const generateImage = async (prompt, options = {}) => {
  const {
    style = 'photo',
    imageSize = '1024x1024'
  } = options;

  console.log('🎨 Generating image with Mystic...');
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

    console.log('✅ Image generation initiated:', taskData.task_id);

    return {
      success: true,
      taskId: taskData.task_id,
      status: taskData.status
    };

  } catch (error) {
    console.error('❌ Image generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Step 2: Poll for image completion
 */
export const pollImageStatus = async (taskId, maxAttempts = 60) => {
  console.log('⏳ Polling image task:', taskId);

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

        console.log('✅ Image completed:', imageUrl);
        return {
          success: true,
          imageUrl: imageUrl
        };
      }

      if (taskData.status === 'FAILED') {
        throw new Error('Image generation failed');
      }

    } catch (error) {
      console.error('❌ Poll error:', error);
      throw error;
    }
  }

  throw new Error('Image generation timeout');
};

/**
 * Step 3: Generate video from image using Kling v2.5 Pro
 */
export const generateVideoFromImage = async (imageUrl, prompt, options = {}) => {
  const {
    duration = 5, // 5 or 10 seconds
    cfg_scale = 0.5
  } = options;

  console.log('🎬 Generating video with Kling v2.5 Pro...');
  console.log('Image URL:', imageUrl);
  console.log('Prompt:', prompt);

  try {
    const requestBody = {
      image: imageUrl,
      prompt: prompt,
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
 * Step 4: Poll for video completion
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
 * Complete pipeline: Text → Image → Video
 */
export const generateVideoFromText = async (prompt, options = {}, onProgress) => {
  console.log('🚀 Starting Image-to-Video pipeline...');

  try {
    // Step 1: Generate image
    if (onProgress) {
      onProgress({
        stage: 'image',
        message: 'Generating image...',
        progress: 10
      });
    }

    const imageResult = await generateImage(prompt, options);
    if (!imageResult.success) {
      throw new Error(imageResult.error);
    }

    // Step 2: Wait for image
    if (onProgress) {
      onProgress({
        stage: 'image',
        message: 'Waiting for image...',
        progress: 20
      });
    }

    const imageStatus = await pollImageStatus(imageResult.taskId);
    if (!imageStatus.success) {
      throw new Error('Image generation failed');
    }

    // Step 3: Generate video from image
    if (onProgress) {
      onProgress({
        stage: 'video',
        message: 'Generating video from image...',
        progress: 50,
        imageUrl: imageStatus.imageUrl
      });
    }

    const videoResult = await generateVideoFromImage(
      imageStatus.imageUrl,
      prompt,
      options
    );

    if (!videoResult.success) {
      throw new Error(videoResult.error);
    }

    // Step 4: Wait for video
    if (onProgress) {
      onProgress({
        stage: 'video',
        message: 'Waiting for video...',
        progress: 60
      });
    }

    const videoStatus = await pollVideoStatus(videoResult.taskId);
    if (!videoStatus.success) {
      throw new Error('Video generation failed');
    }

    // Success!
    if (onProgress) {
      onProgress({
        stage: 'complete',
        message: 'Video ready!',
        progress: 100
      });
    }

    return {
      success: true,
      video: {
        uri: videoStatus.videoUrl,
        imageUri: imageStatus.imageUrl,
        prompt: prompt,
        duration: options.duration || 5,
        model: 'kling-v2.5-pro'
      }
    };

  } catch (error) {
    console.error('❌ Pipeline error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  generateVideoFromText,
  generateImage,
  generateVideoFromImage
};

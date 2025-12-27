/**
 * FREEPIK TEXT-TO-VIDEO SERVICE
 * Direct text-to-video generation using MiniMax Hailuo-02
 * NO IMAGE GENERATION NEEDED!
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
 * Generate video directly from text using MiniMax Hailuo-02
 * @param {string} prompt - Text description of the video
 * @param {object} options - Generation options
 * @returns {Promise} - Task ID and status
 */
export const generateVideoFromText = async (prompt, options = {}) => {
  const {
    duration = 6, // 6 or 10 seconds
    resolution = '768p', // '768p' or '1080p'
    promptOptimizer = true,
    webhookUrl = null
  } = options;

  console.log(`🎬 Generating ${duration}s video from text with MiniMax Hailuo-02 (${resolution})...`);
  console.log(`Prompt: ${prompt}`);

  try {
    const endpoint = resolution === '1080p'
      ? '/ai/image-to-video/minimax-hailuo-02-1080p'
      : '/ai/image-to-video/minimax-hailuo-02-768p';

    const requestBody = {
      prompt: prompt,
      duration: duration,
      prompt_optimizer: promptOptimizer
    };

    // Only add webhook_url if provided
    if (webhookUrl) {
      requestBody.webhook_url = webhookUrl;
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await makeFreepikRequest(endpoint, 'POST', requestBody);

    console.log('✅ Video generation initiated:', response);

    // Freepik returns: { data: { task_id: "...", status: "CREATED" } }
    const taskData = response.data || response;

    return {
      success: true,
      taskId: taskData.task_id,
      status: taskData.status,
      message: `${duration}s video generation started`,
      resolution: resolution
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
 * Get status of MiniMax video task
 */
export const getTaskStatus = async (taskId, resolution = '768p') => {
  try {
    const endpoint = resolution === '1080p'
      ? `/ai/image-to-video/minimax-hailuo-02-1080p/${taskId}`
      : `/ai/image-to-video/minimax-hailuo-02-768p/${taskId}`;

    const response = await makeFreepikRequest(endpoint, 'GET');

    console.log('Status response:', response);

    // Freepik returns: { data: { status: "...", result: { url: "..." } } }
    // OR: { data: { status: "...", generated: [{ url: "..." }] } }
    const taskData = response.data || response;

    // MiniMax returns video URL in "generated" array
    let videoUrl = null;
    if (taskData.generated && taskData.generated.length > 0) {
      // generated is an array of URLs (strings)
      videoUrl = taskData.generated[0];
    } else if (taskData.result?.url) {
      videoUrl = taskData.result.url;
    } else if (taskData.url) {
      videoUrl = taskData.url;
    } else if (taskData.uri) {
      videoUrl = taskData.uri;
    }
    
    console.log('Extracted video URL:', videoUrl);

    return {
      success: true,
      status: taskData.status,
      data: taskData,
      videoUrl: videoUrl
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
export const pollUntilComplete = async (taskId, resolution, onProgress, maxAttempts = 240) => {
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

    const statusResult = await getTaskStatus(taskId, resolution);

    if (!statusResult.success) {
      console.error('❌ Status check failed:', statusResult.error);
      throw new Error(statusResult.error);
    }

    console.log(`Poll ${attempts}/${maxAttempts}: ${statusResult.status}`);
    console.log('Full status:', JSON.stringify(statusResult, null, 2));

    if (statusResult.status === 'COMPLETED') {
      console.log('✅ Task completed!');
      console.log('Video URL:', statusResult.videoUrl);
      
      if (!statusResult.videoUrl) {
        console.warn('⚠️ Task completed but no video URL yet, waiting 5s and retrying...');
        console.log('Full response:', JSON.stringify(statusResult, null, 2));
        
        // Sometimes Freepik marks as COMPLETED before URL is ready
        // Wait a bit and try one more time
        if (attempts < maxAttempts) {
          continue; // Try again
        } else {
          console.error('❌ No video URL after max attempts!');
          throw new Error('No video URL in completed task');
        }
      }
      
      return {
        success: true,
        ...statusResult
      };
    }

    if (statusResult.status === 'FAILED') {
      console.error('❌ Task failed!');
      console.error('Failure details:', JSON.stringify(statusResult.data, null, 2));
      throw new Error(`Task failed: ${statusResult.data?.error || 'Unknown error'}`);
    }

    // Valid processing states: CREATED, IN_PROGRESS, PROCESSING
    const validProcessingStates = ['CREATED', 'IN_PROGRESS', 'PROCESSING'];
    if (!validProcessingStates.includes(statusResult.status)) {
      console.error('❌ Unknown status:', statusResult.status);
      console.error('Full response:', JSON.stringify(statusResult, null, 2));
      throw new Error(`Unknown task status: ${statusResult.status}`);
    }

    // Log progress for long-running tasks
    if (attempts % 12 === 0) { // Every minute
      console.log(`⏳ Still processing... (${attempts * 5}s elapsed, status: ${statusResult.status})`);
    }
  }

  console.error('❌ Task timeout after', maxAttempts * 5, 'seconds');
  throw new Error(`Task timeout after ${maxAttempts * 5} seconds`);
};

/**
 * Complete generation with polling
 */
export const generateAndWait = async (prompt, options = {}, onProgress) => {
  console.log('🚀 Starting complete video generation...');

  try {
    // Step 1: Start generation
    const initResult = await generateVideoFromText(prompt, options);

    if (!initResult.success) {
      throw new Error(initResult.error);
    }

    // Step 2: Poll until complete
    const result = await pollUntilComplete(
      initResult.taskId,
      options.resolution || '768p',
      onProgress
    );

    if (!result.success || !result.videoUrl) {
      throw new Error('Video generation failed');
    }

    return {
      success: true,
      video: {
        uri: result.videoUrl,
        taskId: initResult.taskId,
        duration: options.duration || 6,
        resolution: options.resolution || '768p',
        prompt: prompt,
        model: 'minimax-hailuo-02'
      }
    };

  } catch (error) {
    console.error('❌ Complete generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  generateVideoFromText,
  getTaskStatus,
  pollUntilComplete,
  generateAndWait
};

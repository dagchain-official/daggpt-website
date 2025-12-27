/**
 * Suno AI Music Generation Service via KIE.AI API
 * Documentation: https://docs.kie.ai/suno-api/quickstart
 */

const KIE_API_BASE_URL = 'https://api.kie.ai/api/v1';

/**
 * Generate music from text prompt
 * @param {Object} options - Generation options
 * @param {string} options.prompt - Music description
 * @param {boolean} options.customMode - Use custom mode (requires style and title)
 * @param {boolean} options.instrumental - Generate instrumental only
 * @param {string} options.model - AI model (V3_5, V4, V4_5, V4_5PLUS, V5)
 * @param {string} options.style - Music style (required in custom mode)
 * @param {string} options.title - Song title (required in custom mode)
 * @param {string} options.negativeTags - Tags to avoid
 * @returns {Promise<string>} - Task ID
 */
export const generateMusic = async (options) => {
  try {
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/suno/generate'
      : '/api/suno-api?action=generate';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...options, action: 'generate' })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Music generation failed');
    }

    const result = await response.json();
    return result.taskId;
  } catch (error) {
    console.error('❌ Suno music generation error:', error);
    throw error;
  }
};

/**
 * Extend existing music track
 * @param {Object} options - Extension options
 * @param {string} options.audioId - ID of audio to extend
 * @param {boolean} options.defaultParamFlag - Use default parameters
 * @param {string} options.model - AI model
 * @param {string} options.prompt - Extension description
 * @param {string} options.style - Music style
 * @param {string} options.title - Extended track title
 * @param {number} options.continueAt - Continue from timestamp (seconds)
 * @returns {Promise<string>} - Task ID
 */
export const extendMusic = async (options) => {
  try {
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/suno/extend'
      : '/api/suno/extend';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Music extension failed');
    }

    const result = await response.json();
    return result.taskId;
  } catch (error) {
    console.error('❌ Suno music extension error:', error);
    throw error;
  }
};

/**
 * Generate lyrics from prompt
 * @param {string} prompt - Lyrics description
 * @returns {Promise<string>} - Task ID
 */
export const generateLyrics = async (prompt) => {
  try {
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/suno/lyrics'
      : '/api/suno/lyrics';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Lyrics generation failed');
    }

    const result = await response.json();
    return result.taskId;
  } catch (error) {
    console.error('❌ Suno lyrics generation error:', error);
    throw error;
  }
};

/**
 * Check task status
 * @param {string} taskId - Task ID to check
 * @returns {Promise<Object>} - Task status and data
 */
export const checkStatus = async (taskId) => {
  try {
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:3001/api/suno/status/${taskId}`
      : `/api/suno-api?action=status&taskId=${taskId}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Status check failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Suno status check error:', error);
    throw error;
  }
};

/**
 * Wait for task completion with polling
 * @param {string} taskId - Task ID to wait for
 * @param {function} onProgress - Progress callback
 * @param {number} maxWaitTime - Maximum wait time in ms (default: 10 minutes)
 * @returns {Promise<Object>} - Completed task data
 */
export const waitForCompletion = async (taskId, onProgress, maxWaitTime = 600000) => {
  const startTime = Date.now();
  const pollInterval = 5000; // Poll every 5 seconds

  while (Date.now() - startTime < maxWaitTime) {
    const status = await checkStatus(taskId);

    // Call progress callback
    if (onProgress) {
      onProgress(status);
    }

    switch (status.status) {
      case 'SUCCESS':
        console.log('✅ All tracks generated successfully!');
        return status.response;

      case 'FIRST_SUCCESS':
        console.log('✅ First track generation completed!');
        return status.response;

      case 'TEXT_SUCCESS':
        console.log('✅ Lyrics/text generation successful!');
        return status.response;

      case 'PENDING':
        console.log('⏳ Task is pending...');
        break;

      case 'CREATE_TASK_FAILED':
        const createError = status.errorMessage || 'Task creation failed';
        console.error('❌ Error:', createError);
        throw new Error(createError);

      case 'GENERATE_AUDIO_FAILED':
        const audioError = status.errorMessage || 'Audio generation failed';
        console.error('❌ Error:', audioError);
        throw new Error(audioError);

      case 'CALLBACK_EXCEPTION':
        const callbackError = status.errorMessage || 'Callback process error';
        console.error('❌ Error:', callbackError);
        throw new Error(callbackError);

      case 'SENSITIVE_WORD_ERROR':
        const sensitiveError = status.errorMessage || 'Content filtered due to sensitive words';
        console.error('❌ Error:', sensitiveError);
        throw new Error(sensitiveError);

      default:
        console.log(`❓ Unknown status: ${status.status}`);
        if (status.errorMessage) {
          console.error('❌ Error message:', status.errorMessage);
        }
        break;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Generation timeout - exceeded maximum wait time');
};

/**
 * Boost/enhance music style (V4_5 models only)
 * @param {string} content - Style description to enhance
 * @returns {Promise<string>} - Enhanced style
 */
export const boostMusicStyle = async (content) => {
  try {
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/suno/boost-style'
      : '/api/suno/boost-style';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Style boost failed');
    }

    const result = await response.json();
    return result.enhancedStyle;
  } catch (error) {
    console.error('❌ Suno style boost error:', error);
    throw error;
  }
};

export default {
  generateMusic,
  extendMusic,
  generateLyrics,
  checkStatus,
  waitForCompletion,
  boostMusicStyle
};

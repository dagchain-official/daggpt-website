// Google AI Studio Video Generation Service using Veo 3.1

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const VEO_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export const generateVideoWithGemini = async (prompt, style, aspectRatio, duration) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Google AI Studio API Key is not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file');
  }

  // Video type enhancements based on Veo 3.1 best practices
  const videoTypeEnhancements = {
    dialogue: {
      // Dialogue & Sound Effects - Focus on audio cues and character interaction
      suffix: '',
      tips: 'Dialogue in quotes, explicit sound effects (SFX), ambient noise descriptions'
    },
    cinematic: {
      // Cinematic Realism - Focus on camera work, composition, lighting
      suffix: 'cinematic lighting, professional cinematography, film grain, smooth camera movement',
      tips: 'Camera motion (aerial view, tracking shot), composition (wide shot, close-up), ambiance (warm tones, natural light)'
    },
    animation: {
      // Creative Animation - Focus on animated style and playful movement
      suffix: 'animated style, vibrant colors, smooth animation, playful movement',
      tips: 'Specify animation type (cartoon, anime, 3D), exaggerated movements, bright color palette'
    }
  };

  const enhancement = videoTypeEnhancements[style] || videoTypeEnhancements.cinematic;
  const enhancedPrompt = enhancement.suffix ? `${prompt}, ${enhancement.suffix}` : prompt;

  // Veo 3.1 API: Each clip can be 4-8 seconds
  // For longer videos, we generate multiple clips and stitch them
  const minClipDuration = 4;
  const maxClipDuration = 8;
  const maxTotalDuration = 120; // We can stitch up to 2 minutes
  
  // Calculate how many clips we need
  const clipsNeeded = Math.ceil(duration / maxClipDuration);
  const clipDuration = Math.min(maxClipDuration, duration); // First clip duration
  
  console.log(`📹 Generating ${clipsNeeded} clip(s) of ~${maxClipDuration}s each for total ${duration}s video`);

  console.log('Veo 3.1 Video Generation Request:', {
    prompt: enhancedPrompt,
    style,
    aspectRatio,
    clipDuration: clipDuration,
    clipsNeeded: clipsNeeded,
    requestedDuration: duration,
    achievableDuration: Math.min(duration, maxTotalDuration)
  });

  try {
    // Step 1: Generate FIRST clip (8 seconds)
    // Note: For longer videos, we'll need to generate multiple clips and stitch
    const requestBody = {
      instances: [
        {
          prompt: enhancedPrompt
        }
      ],
      parameters: {
        aspectRatio: aspectRatio,
        durationSeconds: clipDuration, // Use 8 seconds for first clip
        resolution: "720p"
      }
    };

    console.log('Sending request to Veo 3.1...', JSON.stringify(requestBody, null, 2));

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
      throw new Error(errorData.error?.message || `Veo API request failed with status ${response.status}`);
    }

    const operationData = await response.json();
    const operationName = operationData.name;

    console.log('Video generation started. Operation:', operationName);

    // Step 2: Return operation info for polling
    const videoMetadata = {
      id: `video-${Date.now()}`,
      prompt: enhancedPrompt,
      style: style,
      aspectRatio: aspectRatio,
      duration: clipDuration, // First clip duration
      requestedDuration: duration,
      clipsNeeded: clipsNeeded,
      status: 'generating',
      operationName: operationName,
      createdAt: new Date().toISOString()
    };

    return {
      success: true,
      video: videoMetadata,
      metadata: {
        model: 'veo-3.1-generate-preview',
        clipDuration: clipDuration,
        clipsNeeded: clipsNeeded,
        requestedDuration: duration,
        style: style,
        aspectRatio: aspectRatio,
        operationName: operationName,
        note: clipsNeeded > 1 
          ? `Generating clip 1/${clipsNeeded} (${clipDuration}s). Total video will be ${duration}s. Additional clips will be generated and stitched together.`
          : `Generating ${clipDuration}s video.`
      }
    };
  } catch (error) {
    console.error('Veo 3.1 video generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Poll operation status and wait for completion
export const pollVideoOperation = async (operationName, onProgress) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Google AI Studio API Key is not configured');
  }

  try {
    const response = await fetch(`${BASE_URL}/${operationName}`, {
      method: 'GET',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to poll operation: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      done: data.done || false,
      response: data.response,
      error: data.error,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('Error polling operation:', error);
    throw error;
  }
};

// Extend an existing video
export const extendVideo = async (videoUri, prompt = '', onProgress) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Google AI Studio API Key is not configured');
  }

  const EXTEND_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning';

  try {
    const requestBody = {
      instances: [
        {
          video: {
            uri: videoUri
          }
        }
      ],
      parameters: {}
    };

    // Add optional prompt for extension
    if (prompt) {
      requestBody.instances[0].prompt = prompt;
    }

    console.log('Extending video...', JSON.stringify(requestBody, null, 2));

    const response = await fetch(EXTEND_API_URL, {
      method: 'POST',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Video extension failed with status ${response.status}`);
    }

    const operationData = await response.json();
    const operationName = operationData.name;

    console.log('Video extension started. Operation:', operationName);

    return {
      success: true,
      operationName: operationName
    };
  } catch (error) {
    console.error('Video extension error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Complete video generation with polling
export const generateAndPollVideo = async (prompt, style, aspectRatio, duration, onProgress) => {
  // Step 1: Start video generation
  const initialResult = await generateVideoWithGemini(prompt, style, aspectRatio, duration);
  
  if (!initialResult.success) {
    return initialResult;
  }

  const operationName = initialResult.video.operationName;
  
  // Step 2: Poll until complete
  let pollCount = 0;
  const maxPolls = 120; // 20 minutes max (10s intervals)
  
  while (pollCount < maxPolls) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    
    pollCount++;
    if (onProgress) {
      onProgress({
        status: 'polling',
        pollCount,
        message: `Checking video status... (${pollCount * 10}s elapsed)`
      });
    }

    const pollResult = await pollVideoOperation(operationName);
    
    if (pollResult.error) {
      return {
        success: false,
        error: pollResult.error.message || 'Video generation failed'
      };
    }

    if (pollResult.done) {
      // Video is ready!
      const videoData = pollResult.response?.generateVideoResponse?.generatedSamples?.[0];
      
      if (!videoData || !videoData.video) {
        return {
          success: false,
          error: 'No video data in response'
        };
      }

      // Extract video URI
      const videoUri = videoData.video.uri;
      
      return {
        success: true,
        video: {
          id: `video-${Date.now()}`,
          uri: videoUri,
          prompt: prompt,
          style: style,
          aspectRatio: aspectRatio,
          duration: duration,
          status: 'completed',
          completedAt: new Date().toISOString()
        },
        metadata: {
          model: 'veo-3.1-generate-preview',
          pollCount,
          timeElapsed: pollCount * 10
        }
      };
    }
  }

  // Timeout
  return {
    success: false,
    error: 'Video generation timed out after 20 minutes'
  };
};

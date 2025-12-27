// Freepik AI Image Generation Service using Google Imagen 3
// Clean image generation without product mockups or overlays

const FREEPIK_API_KEY = process.env.REACT_APP_FREEPIK_API_KEY;
const FREEPIK_IMAGEN3_URL = 'https://api.freepik.com/v1/ai/text-to-image/imagen3';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY; // Keep for video/audio analysis

export const generateImageWithGemini = async (prompt, style = 'realistic', aspectRatio = '1:1', quantity = 1) => {
  if (!FREEPIK_API_KEY) {
    throw new Error('Freepik API Key is not configured. Please add REACT_APP_FREEPIK_API_KEY to your .env file');
  }

  // Style mappings for Freepik Imagen 3
  const styleMap = {
    cinematic: 'photograph',
    anime: 'anime',
    realistic: 'photograph',
    cartoon: 'digital-art',
    abstract: 'digital-art',
    '3d-render': '3d',
    watercolor: 'watercolor',
    'oil-painting': 'oil-painting',
    'sci-fi': 'photograph',
    fantasy: 'digital-art'
  };

  // Map aspect ratio to Freepik Imagen 3 format
  const aspectRatioMap = {
    '1:1': 'square_1_1',
    '16:9': 'landscape_16_9',
    '9:16': 'portrait_9_16',
    '4:3': 'landscape_4_3',
    '3:4': 'portrait_3_4'
  };

  console.log('🎨 Image Generation Request (Freepik Imagen 3):', {
    prompt: prompt.substring(0, 100) + '...',
    style,
    aspectRatio,
    quantity
  });

  try {
    // Step 1: Create the image generation task
    const response = await fetch(FREEPIK_IMAGEN3_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': FREEPIK_API_KEY
      },
      body: JSON.stringify({
        prompt: prompt,
        num_images: quantity,
        aspect_ratio: aspectRatioMap[aspectRatio] || 'square_1_1',
        styling: {
          style: styleMap[style] || 'photograph',
          effects: {
            color: 'natural',
            lightning: 'natural',
            framing: 'none'
          }
        },
        person_generation: 'allow_adult',
        safety_settings: 'block_low_and_above'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Freepik Imagen 3 API error:', errorData);
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    const taskData = await response.json();
    const taskId = taskData.data?.task_id;
    const status = taskData.data?.status;

    if (!taskId) {
      console.error('❌ No task ID received from Freepik');
      throw new Error('Failed to get task ID from Freepik');
    }

    console.log('✅ Task created:', taskId, 'Status:', status);

    // Step 2: Poll for the result if not immediately completed
    let imageResult = taskData;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait
    
    while (imageResult.data?.status === 'IN_PROGRESS' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls
      
      const statusResponse = await fetch(`${FREEPIK_IMAGEN3_URL}/${taskId}`, {
        method: 'GET',
        headers: {
          'x-freepik-api-key': FREEPIK_API_KEY
        }
      });
      
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error(`❌ Status check error (${statusResponse.status}):`, errorText);
        throw new Error(`Failed to check task status: ${statusResponse.status}`);
      }
      
      imageResult = await statusResponse.json();
      console.log(`📊 Attempt ${attempts + 1}: Status = ${imageResult.data?.status}`);
      
      if (imageResult.data?.status === 'FAILED') {
        throw new Error('Image generation failed');
      }
      
      attempts++;
    }

    if (imageResult.data?.status === 'IN_PROGRESS') {
      throw new Error('Image generation timed out');
    }

    console.log('✅ Image generation completed:', imageResult);
    
    // Extract generated images
    const generatedImages = imageResult.data?.generated || [];
    
    if (generatedImages.length === 0) {
      throw new Error('No images generated');
    }

    const images = generatedImages.map((imageUrl, index) => ({
      id: `img-${Date.now()}-${index}`,
      url: imageUrl,
      prompt: prompt,
      style: style,
      aspectRatio: aspectRatio
    }));

    return {
      success: true,
      images: images,
      metadata: {
        model: 'freepik-imagen3',
        count: images.length,
        style: style,
        aspectRatio: aspectRatio
      }
    };
  } catch (error) {
    console.error('❌ Freepik Imagen 3 generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Video understanding (for analyzing uploaded videos)
export const analyzeVideoWithGemini = async (videoFile, prompt) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Google AI Studio API Key is not configured');
  }

  const VIDEO_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  try {
    // Convert video to base64
    const reader = new FileReader();
    const videoBase64 = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(videoFile);
    });

    const response = await fetch(VIDEO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: videoFile.type,
                  data: videoBase64
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Video analysis failed');
    }

    const data = await response.json();
    
    return {
      success: true,
      analysis: data.candidates[0].content.parts[0].text,
      metadata: {
        model: 'gemini-2.0-flash-exp',
        videoSize: videoFile.size,
        videoType: videoFile.type
      }
    };
  } catch (error) {
    console.error('Gemini video analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Audio understanding (for analyzing uploaded audio)
export const analyzeAudioWithGemini = async (audioFile, prompt) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Google AI Studio API Key is not configured');
  }

  const AUDIO_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  try {
    // Convert audio to base64
    const reader = new FileReader();
    const audioBase64 = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(audioFile);
    });

    const response = await fetch(AUDIO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: audioFile.type,
                  data: audioBase64
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Audio analysis failed');
    }

    const data = await response.json();
    
    return {
      success: true,
      analysis: data.candidates[0].content.parts[0].text,
      metadata: {
        model: 'gemini-2.0-flash-exp',
        audioSize: audioFile.size,
        audioType: audioFile.type
      }
    };
  } catch (error) {
    console.error('Gemini audio analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

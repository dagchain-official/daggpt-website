// Serverless function for image generation using KIE.AI Flux Kontext AI
// High-quality image generation with Flux Kontext Pro

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      prompt, 
      style = 'photograph', 
      aspectRatio = 'square_1_1', 
      quantity = 1,
      model = 'flux-kontext-pro',
      enhancePrompt = false  // NEW: Flag to enable prompt enhancement
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const kieApiKey = process.env.KIE_API_KEY || process.env.REACT_APP_KIE_API_KEY;
    const grokApiKey = process.env.GROK_API_KEY || process.env.REACT_APP_GROK_API_KEY;

    if (!kieApiKey) {
      console.error('❌ KIE API key not found');
      return res.status(500).json({ error: 'KIE API key not configured' });
    }
    
    let finalPrompt = prompt;
    
    // Enhance prompt with Grok 4.1 if requested (return early with enhanced prompt only)
    if (enhancePrompt) {
      try {
        console.log('🎨 Enhancing prompt with Grok 4.1 Fast Reasoning...');
        
        if (!grokApiKey) {
          throw new Error('Grok API key not configured');
        }
        
        const enhancedPrompt = await enhancePromptWithGrok(prompt, grokApiKey);
        console.log('✅ Prompt enhanced successfully');
        
        // Return enhanced prompt without generating image
        return res.status(200).json({
          success: true,
          enhancedPrompt: enhancedPrompt,
          originalPrompt: prompt
        });
      } catch (error) {
        console.error('⚠️ Prompt enhancement failed:', error.message);
        return res.status(500).json({
          error: 'Prompt enhancement failed',
          details: error.message
        });
      }
    }

    // Map aspect ratio to common size format used by KIE APIs
    // Supported: 21:9, 16:9, 4:3, 1:1, 3:4, 9:16
    const sizeMap = {
      'square_1_1': '1:1',
      '1_1': '1:1',
      '16_9': '16:9',
      '9_16': '9:16',
      '4_3': '4:3',
      '3_4': '3:4',
      '21_9': '21:9'
    };
    const size = sizeMap[aspectRatio] || '16:9'; // Default to 16:9

    const selectedModel = model || 'flux-kontext-pro';
    console.log('🎨 Selected KIE image model:', selectedModel);
    console.log('📝 Prompt:', prompt);
    console.log('📐 Aspect Ratio:', size);

    // Generic jobs-based models (Nano Banana Pro, Grok Imagine, Seedream 4.5, Ideogram v3, Midjourney)
    if (
      selectedModel === 'nano-banana-pro' ||
      selectedModel === 'grok-imagine' ||
      selectedModel === 'seedream-4.5' ||
      selectedModel === 'ideogram-v3' ||
      selectedModel === 'midjourney'
    ) {
      try {
        // Generate single image for jobs-based models
        const imageUrl = await generateJobsImage(prompt, size, selectedModel, kieApiKey);
        
        console.log('✅ Jobs-based image generated:', imageUrl);
        
        return res.status(200).json({
          success: true,
          image_url: imageUrl,
          images: [imageUrl], // Array with single image for consistency
          prompt,
          model: selectedModel
        });
      } catch (error) {
        console.error(`❌ Jobs image generation error (${selectedModel}):`, error);
        return res.status(500).json({
          error: error.message || `Image generation failed for model ${selectedModel}`
        });
      }
    }

    // Default: Flux Kontext Pro image generation (existing behavior)

    console.log('🎨 Starting Flux Kontext Image generation...');
    console.log('🎭 Style:', style);

    // Enhance prompt with style if provided
    const enhancedPrompt = style && style !== 'photograph' 
      ? `${prompt}, ${style} style` 
      : prompt;

    // Step 1: Create the image generation task (generate 2 images)
    // Use selectedModel for both flux-kontext-pro and flux-kontext-max
    const requestBody = {
      prompt: enhancedPrompt,
      aspectRatio: size,
      enableTranslation: true,
      outputFormat: "jpeg",
      promptUpsampling: false,
      model: selectedModel, // Dynamic model selection (flux-kontext-pro or flux-kontext-max)
      safetyTolerance: 2
    };

    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    // Step 1: Create the image generation task
    console.log('🎨 Starting image generation...');
    const response = await fetch('https://api.kie.ai/api/v1/flux/kontext/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Flux Kontext API error (${response.status}):`, errorText);
      throw new Error(`KIE.AI API error: ${response.status}`);
    }

    const taskData = await response.json();
    
    if (taskData.code !== 200) {
      console.error('❌ API returned error:', taskData);
      throw new Error(taskData.msg || 'Image generation failed');
    }

    const taskId = taskData.data?.taskId;
    if (!taskId) {
      throw new Error('Failed to get task ID');
    }

    console.log('✅ Task created:', taskId);

    // Step 2: Poll for result
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.kie.ai/api/v1/flux/kontext/record-info?taskId=${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${kieApiKey}`
        }
      });
      
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error(`❌ Status check error (${statusResponse.status}):`, errorText);
        throw new Error('Failed to check task status');
      }
      
      const imageResult = await statusResponse.json();
      
      if (imageResult.code !== 200) {
        throw new Error(imageResult.msg || 'Failed to check status');
      }
      
      const progress = imageResult.data?.progress || '0.00';
      const flag = imageResult.data?.successFlag;
      console.log(`📊 Attempt ${attempts + 1}/${maxAttempts}: Progress = ${progress}, Flag = ${flag}`);
      
      // Flag 2 = Failed
      if (flag === 2) {
        const errorMsg = imageResult.data?.errorMessage || 'Image generation failed';
        console.error('❌ Image failed with error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Flag 3 = Content moderation/rejected
      if (flag === 3) {
        if (attempts > 10) {
          console.error('❌ Image rejected by content moderation (Flag 3)');
          throw new Error('Image was rejected by content moderation. Please try a different prompt.');
        }
        // Continue polling for a bit in case it recovers
      }
      
      // Flag 1 = Success
      if (flag === 1) {
        const resultImageUrl = imageResult.data?.response?.resultImageUrl;
        if (!resultImageUrl) {
          throw new Error('No image URL received');
        }
        console.log('✅ Image completed:', resultImageUrl);
        
        return res.status(200).json({
          success: true,
          image_url: resultImageUrl,
          images: [resultImageUrl], // Array with single image for consistency
          prompt: prompt,
          model: selectedModel
        });
      }
      
      // Flag 0 = Processing, continue
      attempts++;
    }
    
    throw new Error('Image generation timed out');
  } catch (error) {
    console.error('❌ Image generation error:', error);
    return res.status(500).json({
      error: error.message || 'Image generation failed',
      details: error.toString()
    });
  }
}


// Helper: 4o Image (GPT-4o vision image generation)
async function generate4oImage(prompt, size, quantity, kieApiKey) {
  console.log('🎨 Starting 4o Image generation...');
  console.log('📝 Prompt:', prompt);
  console.log('📐 Size:', size);

  const requestBody = {
    prompt,
    size,
    nVariants: quantity || 1
  };

  console.log('📤 4o Image request body:', JSON.stringify(requestBody, null, 2));

  const createResponse = await fetch('https://api.kie.ai/api/v1/gpt4o-image/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${kieApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error(`❌ 4o Image API error (${createResponse.status}):`, errorText);
    throw new Error(`4o Image API error: ${createResponse.status}`);
  }

  const taskData = await createResponse.json();

  if (taskData.code !== 200) {
    console.error('❌ 4o Image createTask error:', taskData);
    throw new Error(taskData.msg || '4o Image task creation failed');
  }

  const taskId = taskData.data?.taskId;
  if (!taskId) {
    console.error('❌ 4o Image: no taskId in response');
    throw new Error('4o Image: missing taskId');
  }

  console.log('✅ 4o Image task created:', taskId);

  let attempts = 0;
  const maxAttempts = 60; // ~2 minutes
  let statusData = taskData;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const statusResponse = await fetch(`https://api.kie.ai/api/v1/gpt4o-image/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`
      }
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error(`❌ 4o Image status error (${statusResponse.status}):`, errorText);
      throw new Error(`Failed to check 4o Image status: ${statusResponse.status}`);
    }

    statusData = await statusResponse.json();

    const successFlag = statusData.data?.successFlag;
    const progress = statusData.data?.progress || '0.00';
    console.log(`📊 4o Image attempt ${attempts + 1}/${maxAttempts}: progress=${progress}, flag=${successFlag}`);

    if (successFlag === 1) {
      const urls = statusData.data?.response?.result_urls;
      if (Array.isArray(urls) && urls.length > 0) {
        console.log('✅ 4o Image generation completed');
        console.log('🖼️ 4o Image URL:', urls[0]);
        return urls[0];
      }
      console.error('❌ 4o Image: success but no result_urls');
      throw new Error('4o Image: no result_urls in response');
    }

    if (successFlag === 2) {
      const errorMsg = statusData.data?.errorMessage || '4o Image generation failed';
      console.error('❌ 4o Image generation failed:', errorMsg);
      throw new Error(errorMsg);
    }

    attempts++;
  }

  throw new Error('4o Image generation timed out');
}

// Helper: Generic jobs-based image models (Nano Banana Pro, Grok Imagine, Seedream 4.5, Ideogram v3, Midjourney)
async function generateJobsImage(prompt, size, model, kieApiKey) {
  console.log(`🎨 Starting jobs-based image generation for model: ${model}`);

  // Model-specific settings
  const resolution = model === 'nano-banana-pro' ? '1K' : '4K';
  
  // Special model format conversions
  let actualModel = model;
  if (model === 'grok-imagine') {
    actualModel = 'grok-imagine/text-to-image';
  } else if (model === 'seedream-4.5') {
    actualModel = 'seedream/4.5-text-to-image';
  }
  
  // Base input as per KIE.AI Jobs API documentation
  let input;
  
  if (model === 'grok-imagine') {
    // Grok Imagine: only prompt and aspect_ratio
    input = {
      prompt,
      aspect_ratio: size
    };
  } else if (model === 'seedream-4.5') {
    // Seedream 4.5: prompt, aspect_ratio, and quality
    input = {
      prompt,
      aspect_ratio: size,
      quality: 'basic' // Options: basic, standard, premium
    };
  } else {
    // Other models: full parameters
    input = {
      prompt,
      aspect_ratio: size,
      resolution: resolution,
      output_format: 'png'
    };
  }

  const requestBody = {
    model: actualModel,
    input
  };

  console.log('📤 Jobs createTask body:', JSON.stringify(requestBody, null, 2));

  const createResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${kieApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error(`❌ jobs/createTask error (${createResponse.status}) for model ${model}:`, errorText);
    throw new Error(`jobs/createTask error (${createResponse.status})`);
  }

  const taskData = await createResponse.json();

  if (taskData.code && taskData.code !== 200) {
    console.error('❌ jobs/createTask API error:', taskData);
    throw new Error(taskData.msg || `Image task creation failed for model ${model}`);
  }

  const taskId = taskData.data?.taskId || taskData.data?.task_id;
  if (!taskId) {
    console.error('❌ jobs/createTask: no taskId in response');
    throw new Error('jobs/createTask: missing taskId');
  }

  console.log('✅ Jobs task created:', taskId);

  let attempts = 0;
  const maxAttempts = 60;
  let statusData = taskData;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const statusResponse = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`
      }
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error(`❌ jobs/recordInfo error (${statusResponse.status}) for model ${model}:`, errorText);
      throw new Error(`Failed to check jobs status: ${statusResponse.status}`);
    }

    statusData = await statusResponse.json();

    const state = statusData.data?.state || statusData.data?.status;
    const successFlag = statusData.data?.successFlag;
    const progress = statusData.data?.progress || '0.00';
    console.log(`📊 Jobs attempt ${attempts + 1}/${maxAttempts} for ${model}: state=${state}, flag=${successFlag}, progress=${progress}`);

    // Success states
    if (state === 'success' || state === 'SUCCESS' || successFlag === 1) {
      const resultJsonStr = statusData.data?.resultJson || statusData.data?.result_json;
      let parsed = null;
      if (resultJsonStr) {
        try {
          parsed = JSON.parse(resultJsonStr);
        } catch (e) {
          console.error('❌ Failed to parse resultJson:', e, 'raw value:', resultJsonStr);
        }
      }

      const urls =
        parsed?.resultUrls ||
        parsed?.result_urls ||
        parsed?.imageUrls ||
        parsed?.image_urls ||
        parsed?.images;

      if (Array.isArray(urls) && urls.length > 0) {
        console.log('✅ Jobs-based image generation completed');
        console.log('🖼️ Jobs image URL:', urls[0]);
        return urls[0];
      }

      console.error('❌ Jobs image generation: success but no URLs found in resultJson');
      throw new Error('No image URLs found in jobs result');
    }

    // Failure states
    if (state === 'fail' || state === 'FAILED' || successFlag === 2) {
      const errorMsg = statusData.data?.errorMessage || `Image generation failed for model ${model}`;
      console.error('❌ Jobs image generation failed:', errorMsg);
      throw new Error(errorMsg);
    }

    attempts++;
  }

  throw new Error(`Image generation timed out for model ${model}`);
}

// Helper: Enhance prompt with Grok 4.1 Fast Reasoning
async function enhancePromptWithGrok(prompt, grokApiKey) {
  console.log('📝 Original prompt:', prompt);

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [
          {
            role: 'system',
            content: `You are an expert AI image prompt engineer. Your task is to enhance user prompts for AI image generation by adding:
1. Professional camera settings (aperture, ISO, focal length, shutter speed)
2. Lighting details (golden hour, studio lighting, natural light, etc.)
3. Camera angles and composition (wide shot, close-up, bird's eye view, etc.)
4. Artistic style and mood
5. Technical details for photorealism
6. Color grading and atmosphere

Keep the core subject intact but make it highly detailed and professional. Return ONLY the enhanced prompt, nothing else.`
          },
          {
            role: 'user',
            content: `Enhance this image prompt: "${prompt}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const responseText = await response.text();
    console.log('🔍 Grok API response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Grok API error response:', responseText);
      throw new Error(`Grok API error (${response.status}): ${responseText.substring(0, 200)}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse Grok response:', responseText);
      throw new Error('Invalid JSON response from Grok API');
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid Grok response structure:', data);
      throw new Error('Invalid response structure from Grok API');
    }

    const enhancedPrompt = data.choices[0].message.content.trim();
    console.log('✅ Enhanced prompt:', enhancedPrompt);
    
    return enhancedPrompt;
  } catch (error) {
    console.error('❌ Grok enhancement error:', error);
    throw error;
  }
}

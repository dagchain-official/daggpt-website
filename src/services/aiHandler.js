// AI Handler - Routes requests to appropriate AI service
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateImageWithGemini } from './geminiImageService';
import { generateVideoWithVideoGenAPI } from './videoGenApiService';
import { generateWebsite } from './websiteBuilderService';
import { generateMusic, waitForCompletion } from './sunoMusicService';
// Temporarily disabled - causes build issues with SVG data URLs
// import { callGrokAPI } from './lovable-style/grokAgents';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const handleAIChat = async (prompt, onUpdate, conversationHistory = []) => {
  try {
    onUpdate({ type: 'status', content: '🤖 Gemini is thinking...' });

    // Use Gemini directly for chat with conversation history
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // Build chat with history
    const chat = model.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    });
    
    const result = await chat.sendMessageStream(prompt);

    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onUpdate({ type: 'streaming', content: fullText });
    }

    return { success: true, content: fullText, type: 'text' };
  } catch (error) {
    console.error('AI Chat error:', error);
    return { success: false, error: error.message };
  }
};

/*
// BACKUP: Claude implementation (not working on Vercel)
export const handleAIChatWithClaude = async (prompt, onUpdate) => {
  try {
    onUpdate({ type: 'status', content: '🤖 Claude is thinking...' });

    // Determine API URL based on environment
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/chat'
      : '/api/chat';

    // Use the existing /api/chat endpoint with Claude
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'claude',
        researchMode: false
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'content') {
              fullText += data.content;
              onUpdate({ type: 'streaming', content: fullText });
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch (e) {
            if (!e.message.includes('Unexpected')) {
              throw e;
            }
          }
        }
      }
    }

    return { success: true, content: fullText, type: 'text' };
  } catch (error) {
    console.error('AI Chat error:', error);
    return { success: false, error: error.message };
  }
};
*/

export const handleImageGeneration = async (prompt, onUpdate, selectedModel = null, aspectRatio = null) => {
  try {
    // If both model and aspect ratio are provided, skip selection dialogs and generate directly
    if (selectedModel && aspectRatio) {
      onUpdate({ type: 'status', content: `🎨 Generating images with ${selectedModel}...` });
      
      // Proceed directly to generation
      const displayModelName = selectedModel || 'flux-kontext-pro';

      // Use serverless function to avoid CORS issues
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/generate-image'
        : '/api/generate-image';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          style: 'photograph',
          aspectRatio: aspectRatio,
          quantity: 1,
          model: displayModelName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Image generation failed');
      }

      const result = await response.json();

      if (!result.images || result.images.length === 0) {
        throw new Error('No images received');
      }

      return { 
        success: true, 
        content: result.images[0], // Primary image for backward compatibility
        images: result.images, // Array of all generated images
        type: 'image',
        prompt: prompt
      };
    }

    // Backwards compatibility: if aspect ratio is provided without a model, default to Flux Kontext Pro
    if (!selectedModel && aspectRatio) {
      selectedModel = 'flux-kontext-pro';
    }

    // Step 1: No model and no aspect ratio selected yet -> enhance prompt and show model selection
    if (!selectedModel && !aspectRatio) {
      onUpdate({ type: 'status', content: '✨ Enhancing your prompt with Grok...' });

      let enhancedPrompt = prompt;

      try {
        const systemPrompt = `You are an expert AI image prompt engineer. Your job is to take a short or messy user prompt and turn it into a detailed, concrete description suitable for state-of-the-art text-to-image models (KIE.AI, Midjourney, 4o Image, Flux, etc.).

Focus on:
- Subject, environment and composition
- Camera angle, focal length, depth of field
- Lighting, mood, time of day
- Style keywords (e.g. ultra realistic, cinematic, studio lighting, UGC smartphone shot, etc.)
- Important brand or text overlay details if mentioned

CRITICAL: Reply with ONLY the enhanced prompt text. Do not add quotes, labels, markdown, or explanations.`;

        // Grok API temporarily disabled - using original prompt
        enhancedPrompt = prompt;
      } catch (e) {
        console.error('Prompt enhancement failed, using original prompt:', e);
        enhancedPrompt = prompt;
      }

      const models = [
        {
          key: 'flux-kontext-pro',
          name: 'Flux Kontext Pro',
          provider: 'KIE.AI',
          description: 'Context-aware, high-quality text-to-image',
          enabled: true
        },
        {
          key: 'flux-kontext-max',
          name: 'Flux Kontext Max',
          provider: 'KIE.AI',
          description: 'Maximum quality context-aware generation',
          enabled: true
        },
        {
          key: 'nano-banana-pro',
          name: 'Nano Banana Pro',
          provider: 'KIE.AI',
          description: 'UGC-style, marketing-focused image generation',
          enabled: true
        },
        {
          key: 'grok-imagine',
          name: 'Grok Imagine',
          provider: 'xAI via KIE.AI',
          description: 'Cinematic, photorealistic image generation',
          enabled: true
        },
        {
          key: 'seedream-4.5',
          name: 'Seedream 4.5',
          provider: 'ByteDance via KIE.AI',
          description: 'High-fidelity text-to-image with quality control',
          enabled: true
        },
        {
          key: 'ideogram-v3',
          name: 'Ideogram v3',
          provider: 'KIE.AI',
          description: 'Text-heavy & logo-friendly design images',
          enabled: true
        },
        {
          key: 'midjourney',
          name: 'Midjourney',
          provider: 'KIE.AI',
          description: 'Artistic, stylized generations via Midjourney API',
          enabled: true
        }
      ];

      return {
        success: true,
        type: 'image-model-selection',
        content: 'Review and edit your enhanced prompt, then choose an image model.',
        prompt: enhancedPrompt,
        models
      };
    }

    // Step 2: Model selected, ask for aspect ratio
    if (selectedModel && !aspectRatio) {
      const ratios = [
        { key: '16_9', name: '16:9 Widescreen', description: 'HD video, desktop wallpapers', icon: '16:9' },
        { key: '1_1', name: '1:1 Square', description: 'Social media posts, profile pictures', icon: '1:1' },
        { key: '9_16', name: '9:16 Mobile Portrait', description: 'Smartphone wallpapers, stories', icon: '9:16' },
        { key: '21_9', name: '21:9 Ultra-wide', description: 'Cinematic displays, panoramic views', icon: '21:9' },
        { key: '4_3', name: '4:3 Standard', description: 'Traditional displays, presentations', icon: '4:3' },
        { key: '3_4', name: '3:4 Portrait', description: 'Magazine layouts, portrait photos', icon: '3:4' }
      ];

      return {
        success: true,
        type: 'aspect-ratio-selection',
        content: 'Please select an aspect ratio for your image:',
        ratios,
        prompt,
        model: selectedModel
      };
    }

    // Step 3: Aspect ratio selected - proceed with generation using the selected model
    const displayModelName = selectedModel || 'flux-kontext-pro';

    onUpdate({ type: 'status', content: `🎨 Generating image with ${displayModelName}...` });

    // Use serverless function to avoid CORS issues
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/generate-image'
      : '/api/generate-image';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        style: 'photograph',
        aspectRatio: aspectRatio,
        quantity: 1,
        model: displayModelName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Image generation failed');
    }

    const result = await response.json();

    if (!result.images || result.images.length === 0) {
      throw new Error('No images received');
    }

    return { 
      success: true, 
      content: result.images[0], // Primary image for backward compatibility
      images: result.images, // Array of all generated images
      type: 'image',
      prompt: prompt
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return { success: false, error: error.message };
  }
};

export const handleVideoGeneration = async (prompt, onUpdate, selectedModel = null, aspectRatio = null, duration = null) => {
  try {
    // If no model selected, show model selection first
    if (!selectedModel) {
      onUpdate({ type: 'status', content: '🎬 Preparing video models...' });
      
      const models = [
        {
          key: 'veo3-fast-8s',
          name: 'Veo 3.1 Fast (8s)',
          provider: 'Google',
          resolution: '1080p',
          duration: '8 seconds',
          audio: false,
          free: false
        },
        {
          key: 'kling-2.6-5s',
          name: 'Kling 2.6 (5s)',
          provider: 'Kuaishou',
          resolution: '1080p',
          duration: '5 seconds',
          audio: true,
          free: false
        },
        {
          key: 'kling-2.6-10s',
          name: 'Kling 2.6 (10s)',
          provider: 'Kuaishou',
          resolution: '1080p',
          duration: '10 seconds',
          audio: true,
          free: false
        },
        {
          key: 'grok-imagine-6s',
          name: 'Grok Imagine (6s)',
          provider: 'xAI',
          resolution: '720p',
          duration: '6 seconds',
          audio: false,
          free: true
        },
        {
          key: 'sora-2-10s',
          name: 'Sora 2 (10s)',
          provider: 'OpenAI',
          resolution: '1080p',
          duration: '10 seconds',
          audio: false,
          free: false
        },
        {
          key: 'sora-2-15s',
          name: 'Sora 2 (15s)',
          provider: 'OpenAI',
          resolution: '1080p',
          duration: '15 seconds',
          audio: false,
          free: false
        },
        {
          key: 'wan-2.5-5s',
          name: 'Wan 2.5 (5s)',
          provider: 'Alibaba',
          resolution: '1080p',
          duration: '5 seconds',
          audio: false,
          free: false
        },
        {
          key: 'wan-2.5-10s',
          name: 'Wan 2.5 (10s)',
          provider: 'Alibaba',
          resolution: '1080p',
          duration: '10 seconds',
          audio: false,
          free: false
        }
      ];

      return {
        success: true,
        type: 'model-selection',
        content: 'Choose a video generation model:',
        models,
        videoPrompt: prompt
      };
    }

    // Model selected - proceed with generation
    const modelName = selectedModel.includes('veo') ? 'Veo 3.1 Fast' : 
                      selectedModel.includes('kling') ? 'Kling 2.6' :
                      selectedModel.includes('wan') ? 'Wan 2.5' :
                      selectedModel.includes('sora') ? 'Sora 2' :
                      selectedModel.includes('grok') ? 'Grok Imagine' : selectedModel;

    onUpdate({ type: 'status', content: `🎬 Generating video with ${modelName}...` });

    console.log('Starting video generation with model:', selectedModel);
    console.log('Prompt:', prompt);
    console.log('Aspect Ratio:', aspectRatio);
    console.log('Duration:', duration);

    // Use video-generator endpoint
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api/video-generator?action=generate'
      : '/api/video-generator?action=generate';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        model: selectedModel,
        aspectRatio: aspectRatio || '16:9',
        duration: duration || '10'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Video generation failed');
    }

    const result = await response.json();

    if (result.status === 'processing') {
      // Video is being generated - poll for completion
      const taskId = result.task_id;
      console.log('Video generation started, task ID:', taskId);
      onUpdate({ type: 'status', content: '⏳ Video generation in progress... This takes 2-4 minutes...' });

      // Poll for completion
      const maxAttempts = 60; // 5 minutes max (5 seconds per attempt)
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const statusUrl = process.env.NODE_ENV === 'development' 
          ? `http://localhost:3001/api/video-generator?action=status&taskId=${taskId}`
          : `/api/video-generator?action=status&taskId=${taskId}`;
        
        const statusResponse = await fetch(statusUrl);
        const statusData = await statusResponse.json();
        
        console.log(`Poll attempt ${attempts + 1}/${maxAttempts}:`, statusData.status);
        
        if (statusData.status === 'completed' && statusData.video_url) {
          console.log('Video generation completed:', statusData);
          onUpdate({ type: 'status', content: '✅ Video generated successfully!' });
          
          return {
            success: true,
            content: statusData.video_url,
            type: 'video',
            prompt: prompt,
            resolution: statusData.resolution,
            model: result.model
          };
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Video generation failed');
        }
        
        // Update progress
        if (statusData.progress) {
          onUpdate({ type: 'status', content: `⏳ Generating video... ${Math.round(parseFloat(statusData.progress) * 100)}%` });
        }
        
        attempts++;
      }
      
      throw new Error('Video generation timed out after 5 minutes');
    } else if (result.video_url) {
      // Immediate success (unlikely but handle it)
      console.log('Video generation completed:', result);
      onUpdate({ type: 'status', content: '✅ Video generated successfully!' });
      
      return {
        success: true,
        content: result.video_url,
        type: 'video',
        prompt: prompt,
        resolution: result.resolution,
        model: result.model
      };
    } else {
      throw new Error('Unexpected response from video generation API');
    }
  } catch (error) {
    console.error('Video generation error:', error);
    return { success: false, error: error.message };
  }
};

export const handleWebsiteBuilder = async (prompt, onUpdate) => {
  try {
    onUpdate({ type: 'status', content: '🌐 Launching Website Builder with Claude Sonnet 4.5...' });
    
    const result = await generateWebsite(prompt, onUpdate);
    
    if (!result.success) {
      throw new Error(result.error || 'Website generation failed');
    }
    
    return {
      success: true,
      content: result.html,
      type: 'website',
      prompt: prompt,
      timestamp: result.timestamp,
      preview: true
    };
  } catch (error) {
    console.error('Website builder error:', error);
    return { success: false, error: error.message };
  }
};

export const handleCodeGeneration = async (prompt, onUpdate) => {
  try {
    onUpdate({ type: 'status', content: '💻 Generating code...' });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const codePrompt = `Generate clean, well-commented, production-ready code for: "${prompt}". 

Include:
1. Proper code structure
2. Comments explaining key parts
3. Best practices
4. Error handling if applicable

Return the code with proper formatting.`;

    const result = await model.generateContentStream(codePrompt);

    let fullCode = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullCode += chunkText;
      onUpdate({ type: 'streaming', content: fullCode });
    }

    return { 
      success: true, 
      content: fullCode, 
      type: 'code'
    };
  } catch (error) {
    console.error('Code generation error:', error);
    return { success: false, error: error.message };
  }
};

export const handleDeepResearch = async (prompt, onUpdate) => {
  try {
    onUpdate({ type: 'status', content: '🔍 Researching with Gemini...' });

    // Grok API temporarily disabled - using Gemini instead
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { 
      success: true, 
      content: text, 
      type: 'research'
    };
  } catch (error) {
    console.error('Research error:', error);
    return { success: false, error: error.message };
  }
};

// Music Generation Handler
export const handleMusicGeneration = async (prompt, onUpdate) => {
  try {
    onUpdate({ type: 'status', content: '🎵 Generating music...' });

    // Generate music with Suno AI
    const options = {
      prompt: prompt,
      customMode: false,
      instrumental: false,
      model: 'V4_5' // Fast and high quality
    };

    onUpdate({ type: 'status', content: '⏳ Creating music task...' });
    const taskId = await generateMusic(options);
    
    onUpdate({ type: 'status', content: '🎶 Composing your track...' });
    
    // Wait for completion with progress updates
    const result = await waitForCompletion(taskId, (status) => {
      switch (status.status) {
        case 'PENDING':
          onUpdate({ type: 'status', content: '⏳ Processing...' });
          break;
        case 'FIRST_SUCCESS':
          onUpdate({ type: 'status', content: '🎉 First track ready!' });
          break;
        case 'SUCCESS':
          onUpdate({ type: 'status', content: '✅ Music generated!' });
          break;
        default:
          onUpdate({ type: 'status', content: `⏳ ${status.status}...` });
      }
    });

    if (result.sunoData && result.sunoData.length > 0) {
      const track = result.sunoData[0]; // Use first track
      
      // Ensure URL has .mp3 extension
      const ensureMp3Extension = (url) => {
        if (!url) return url;
        return url.endsWith('.mp3') ? url : `${url}.mp3`;
      };
      
      const audioUrl = ensureMp3Extension(track.streamAudioUrl || track.audioUrl);
      
      return {
        success: true,
        content: audioUrl,
        type: 'music',
        metadata: {
          title: track.title || 'AI Generated Music',
          coverArt: track.imageUrl,
          lyrics: track.lyric || track.lyrics || 'Instrumental track',
          duration: track.duration,
          style: track.tags,
          model: 'Suno V4.5'
        }
      };
    }

    return { success: false, error: 'No music generated' };
  } catch (error) {
    console.error('Music generation error:', error);
    return { success: false, error: error.message };
  }
};

// Main router
export const handleAIRequest = async (tool, prompt, onUpdate, conversationHistory = [], selectedModel = null, aspectRatio = null, duration = null) => {
  switch (tool) {
    case 'chat':
      return await handleAIChat(prompt, onUpdate, conversationHistory);
    case 'image':
      return await handleImageGeneration(prompt, onUpdate, selectedModel, aspectRatio);
    case 'video':
      return await handleVideoGeneration(prompt, onUpdate, selectedModel, aspectRatio, duration);
    case 'music':
      return await handleMusicGeneration(prompt, onUpdate);
    case 'website':
      return await handleWebsiteBuilder(prompt, onUpdate);
    case 'code':
      return await handleCodeGeneration(prompt, onUpdate);
    case 'research':
      return await handleDeepResearch(prompt, onUpdate);
    default:
      return { success: false, error: 'Unknown tool' };
  }
};

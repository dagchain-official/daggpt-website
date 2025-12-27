/**
 * Unified Video Generator API
 * Handles script generation, image generation, and scene selection
 */

// Import fetch for Node.js
const fetch = require('node-fetch');

const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY || process.env.REACT_APP_GROK_API_KEY;
const KIE_API_KEY = process.env.REACT_APP_KIE_API_KEY || process.env.KIE_API_KEY;

// Log environment variable status
console.log('[Video Generator] Environment check:');
console.log('- SUPABASE_URL:', !!SUPABASE_URL);
console.log('- SUPABASE_SERVICE_KEY:', !!SUPABASE_SERVICE_KEY);
console.log('- GROK_API_KEY:', !!GROK_API_KEY, `(from ${process.env.GROK_API_KEY ? 'GROK_API_KEY' : 'REACT_APP_GROK_API_KEY'})`);
console.log('- KIE_API_KEY:', !!KIE_API_KEY);

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[Video Generator] Missing Supabase credentials');
  console.error('SUPABASE_URL:', !!SUPABASE_URL);
  console.error('SUPABASE_SERVICE_KEY:', !!SUPABASE_SERVICE_KEY);
}

// Initialize Supabase with SERVICE key to bypass RLS
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

module.exports = async (req, res) => {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Check if Supabase is initialized
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase not configured',
        message: 'Environment variables REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are required'
      });
    }

    const { action, projectId, sceneId, imageOptionId, prompt, userId, scenes } = { ...req.body, ...req.query };

    console.log('[Video Generator]', { action, prompt: prompt?.substring(0, 30), projectId });

    // Route handlers
    if (action === 'generate-script' && prompt && userId) {
      return await generateScript(req, res, prompt, userId);
    } else if (action === 'save-image' && req.body.sceneId && req.body.imageUrl) {
      return await saveImageToDatabase(req, res, req.body.sceneId, req.body.imageUrl);
    } else if (action === 'save-video' && req.body.sceneId && req.body.videoUrl) {
      return await saveVideoToDatabase(req, res, req.body.sceneId, req.body.videoUrl);
    } else if (action === 'start-animation' && req.body.sceneId && req.body.imageUrl && req.body.prompt) {
      return await startAnimation(req, res, req.body.sceneId, req.body.imageUrl, req.body.prompt);
    } else if (action === 'check-animation' && req.body.taskId) {
      return await checkAnimation(req, res, req.body.taskId);
    } else if (action === 'generate-images' && projectId && scenes) {
      return await generateImagesForScenes(req, res, projectId, scenes);
    } else if (action === 'get-project' && projectId) {
      return await getProject(req, res, projectId);
    } else if (action === 'select-image' && sceneId && imageOptionId) {
      return await selectImage(req, res, sceneId, imageOptionId);
    } else if (action === 'animate-images' && projectId && scenes) {
      return await animateImages(req, res, projectId, scenes);
    } else if (action === 'stitch-video' && projectId && scenes) {
      return await stitchVideo(req, res, projectId, scenes);
    }
    
    // Generate Video Tool actions
    else if (action === 'create-video-project') {
      return await createVideoProject(req, res);
    } else if (action === 'enhance-video-script') {
      return await enhanceVideoScript(req, res);
    } else if (action === 'update-video-scenes') {
      return await updateVideoScenes(req, res);
    } else if (action === 'start-video-generation') {
      return await startVideoGeneration(req, res);
    } else if (action === 'check-video-progress') {
      return await checkVideoProgress(req, res);
    } else if (action === 'get-video-project') {
      return await getVideoProject(req, res);
    }
    
    // Extension API actions
    else if (action === 'start-video-extension') {
      return await startVideoExtension(req, res);
    } else if (action === 'check-extension-progress') {
      return await checkExtensionProgress(req, res);
    }
    
    // Multi-model video generation (Kling 2.6, Grok, Sora, Wan, Veo)
    else if (action === 'generate') {
      const { prompt, model, aspectRatio, duration } = req.body;
      const kieApiKey = process.env.REACT_APP_KIE_API_KEY || process.env.KIE_API_KEY;
      return await generateMultiModelVideo(req, res, prompt, model, aspectRatio, duration, kieApiKey);
    } else if (action === 'status' && req.query.taskId) {
      const kieApiKey = process.env.REACT_APP_KIE_API_KEY || process.env.KIE_API_KEY;
      return await checkMultiModelVideoStatus(req, res, req.query.taskId, kieApiKey);
    }

    return res.status(400).json({ success: false, error: 'Invalid action or missing parameters', received: { action, projectId, sceneId, imageOptionId, hasPrompt: !!prompt, hasScenes: !!scenes } });

  } catch (error) {
    console.error('[Video Generator] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Generate Script with Grok
 */
async function generateScript(req, res, prompt, userId) {
  try {
    // Create project
    const { data: project, error: dbError } = await supabase
      .from('video_projects')
      .insert({ user_id: userId, prompt, status: 'scripting' })
      .select()
      .single();

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    console.log('[Video Generator] Project created:', project.id);

    // Call Grok
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content: `You are a video scriptwriter. Create a JSON script with 4-6 scenes.
Format: {"title": "...", "scenes": [{"narrator_script": "...", "image_generation_prompt": "...", "duration": 5}]}
Output ONLY valid JSON, no markdown.`
          },
          {
            role: 'user',
            content: `Create a 30-60 second video script for: "${prompt}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!grokResponse.ok) {
      throw new Error(`Grok API error: ${grokResponse.status}`);
    }

    const grokData = await grokResponse.json();
    const scriptContent = grokData.choices[0].message.content;
    const cleanContent = scriptContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const scriptData = JSON.parse(cleanContent);

    // Save scenes
    const scenesData = scriptData.scenes.map((scene, idx) => ({
      project_id: project.id,
      order_index: idx,
      script_text: scene.narrator_script,
      visual_prompt: scene.image_generation_prompt,
      duration_seconds: scene.duration || 5
    }));

    const { data: scenes, error: scenesError } = await supabase
      .from('video_scenes')
      .insert(scenesData)
      .select();

    if (scenesError) throw new Error(`Scenes error: ${scenesError.message}`);

    console.log(`[Video Generator] Created ${scenes.length} scenes`);

    // Don't auto-generate images - wait for user to review script
    // Update status
    await supabase
      .from('video_projects')
      .update({ status: 'script_review' })
      .eq('id', project.id);

    return res.status(200).json({
      success: true,
      project: {
        ...project,
        scenes: scenes.map(s => ({ ...s, image_options: [] }))
      }
    });

  } catch (error) {
    console.error('[generateScript] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Generate Images for ONE Scene (2 images)
 * This avoids serverless timeout by processing one scene at a time
 */
async function generateImagesForScenes(req, res, projectId, scenes) {
  try {
    console.log(`[generateImagesForScenes] Starting for project ${projectId}, ${scenes.length} scenes`);

    // Find the first scene that doesn't have 2 images yet
    const sceneToProcess = scenes.find(scene => {
      // We'll generate for this scene
      return true; // Process the first scene in the array
    });

    if (!sceneToProcess) {
      return res.status(200).json({
        success: true,
        message: 'No scenes to process'
      });
    }

    console.log(`[generateImagesForScenes] Processing scene ${sceneToProcess.id}`);

    // Generate 2 images for this ONE scene (synchronously to avoid timeout)
    await generateImagesForOneScene(sceneToProcess);

    return res.status(200).json({
      success: true,
      message: `Generated images for scene ${sceneToProcess.id}`
    });

  } catch (error) {
    console.error('[generateImagesForScenes] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Save Image to Database (called from frontend)
 */
async function saveImageToDatabase(req, res, sceneId, imageUrl) {
  try {
    console.log(`[saveImageToDatabase] Saving image for scene ${sceneId}`);
    console.log(`[saveImageToDatabase] URL:`, imageUrl);

    const { data: insertedImage, error: insertError } = await supabase
      .from('video_image_options')
      .insert({
        scene_id: sceneId,
        url: imageUrl,
        is_selected: false
      })
      .select();

    if (insertError) {
      console.error(`[saveImageToDatabase] DB error:`, insertError);
      return res.status(500).json({ success: false, message: insertError.message });
    }

    console.log(`[saveImageToDatabase] ✅ Saved successfully:`, insertedImage);

    return res.status(200).json({
      success: true,
      image: insertedImage[0]
    });

  } catch (error) {
    console.error('[saveImageToDatabase] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Start Animation (just creates the task, returns immediately)
 */
async function startAnimation(req, res, sceneId, imageUrl, prompt) {
  try {
    console.log(`[startAnimation] Starting for scene ${sceneId}`);
    console.log(`[startAnimation] Image URL:`, imageUrl);
    console.log(`[startAnimation] Prompt:`, prompt);

    const requestBody = {
      prompt: prompt,
      imageUrls: [imageUrl],
      model: 'veo3_fast',
      aspectRatio: '16:9',
      enableTranslation: true,
      enableFallback: true, // Enable fallback to avoid content policy rejections
      generationType: 'REFERENCE_2_VIDEO'
    };

    console.log(`[startAnimation] Request body:`, JSON.stringify(requestBody, null, 2));

    const generateResponse = await fetch('https://api.kie.ai/api/v1/veo/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`[startAnimation] Response status:`, generateResponse.status);

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error(`[startAnimation] API error (${generateResponse.status}):`, errorText);
      return res.status(200).json({ 
        success: false, 
        message: `Veo API error: ${errorText}` 
      });
    }

    const taskData = await generateResponse.json();
    console.log(`[startAnimation] Response data:`, JSON.stringify(taskData, null, 2));

    if (taskData.code !== 200) {
      console.error(`[startAnimation] Invalid response code:`, taskData.code, taskData.msg);
      return res.status(200).json({ 
        success: false, 
        message: `Veo API returned code ${taskData.code}: ${taskData.msg}`,
        details: taskData
      });
    }

    if (!taskData.data?.taskId) {
      console.error(`[startAnimation] No taskId in response:`, taskData);
      return res.status(200).json({ 
        success: false, 
        message: 'No taskId in Veo API response',
        details: taskData
      });
    }

    console.log(`[startAnimation] ✅ Success! Task ID:`, taskData.data.taskId);

    return res.status(200).json({
      success: true,
      taskId: taskData.data.taskId,
      sceneId: sceneId
    });

  } catch (error) {
    console.error('[startAnimation] Exception:', error);
    console.error('[startAnimation] Stack:', error.stack);
    return res.status(200).json({ 
      success: false, 
      message: error.message,
      stack: error.stack
    });
  }
}

/**
 * Check Animation Status (polls KIE.AI)
 */
async function checkAnimation(req, res, taskId) {
  try {
    const statusResponse = await fetch(`https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`
      }
    });

    if (!statusResponse.ok) {
      return res.status(200).json({ 
        success: false, 
        message: 'Status check failed' 
      });
    }

    const statusData = await statusResponse.json();
    
    const successFlag = statusData.data?.successFlag;
    const progress = statusData.data?.progress || '0.00';
    
    console.log(`[checkAnimation] Task ${taskId}: Progress ${progress}, Flag ${successFlag}`);

    if (successFlag === 1) {
      // Always log when complete to see structure
      console.log(`[checkAnimation] ✅ COMPLETE! Full response:`, JSON.stringify(statusData, null, 2));
      
      // Success! Video URLs are in arrays: resultUrls[0] or originUrls[0]
      const videoUrl = statusData.data?.response?.resultUrls?.[0]
                    || statusData.data?.response?.originUrls?.[0]
                    || statusData.data?.response?.videoUrl
                    || statusData.data?.response?.resultVideoUrl 
                    || statusData.data?.response?.originVideoUrl
                    || statusData.data?.videoUrl
                    || statusData.data?.resultVideoUrl
                    || statusData.data?.originVideoUrl;
      
      console.log(`[checkAnimation] Extracted video URL:`, videoUrl);
      
      if (!videoUrl) {
        console.error(`[checkAnimation] ❌ Success but no video URL found!`);
        console.error(`[checkAnimation] Available keys in data:`, Object.keys(statusData.data || {}));
        console.error(`[checkAnimation] Available keys in response:`, Object.keys(statusData.data?.response || {}));
        console.error(`[checkAnimation] resultUrls:`, statusData.data?.response?.resultUrls);
        console.error(`[checkAnimation] originUrls:`, statusData.data?.response?.originUrls);
      }
      
      return res.status(200).json({
        success: true,
        status: 'complete',
        videoUrl: videoUrl,
        progress: progress,
        rawData: statusData.data // Send full data for debugging
      });
    } else if (successFlag === 2) {
      return res.status(200).json({ 
        success: true,
        status: 'failed',
        message: statusData.data?.errorMessage || 'Animation failed' 
      });
    } else {
      // Still processing
      return res.status(200).json({
        success: true,
        status: 'processing',
        progress: progress
      });
    }

  } catch (error) {
    console.error('[checkAnimation] Error:', error);
    return res.status(200).json({ success: false, message: error.message });
  }
}

/**
 * Save Video URL to Database (called from frontend after animation)
 */
async function saveVideoToDatabase(req, res, sceneId, videoUrl) {
  try {
    console.log(`[saveVideoToDatabase] Saving video for scene ${sceneId}`);
    console.log(`[saveVideoToDatabase] URL:`, videoUrl);

    const { data: updatedScene, error: updateError } = await supabase
      .from('video_scenes')
      .update({ video_clip_url: videoUrl })
      .eq('id', sceneId)
      .select();

    if (updateError) {
      console.error(`[saveVideoToDatabase] DB error:`, updateError);
      return res.status(500).json({ success: false, message: updateError.message });
    }

    console.log(`[saveVideoToDatabase] ✅ Saved successfully:`, updatedScene);

    return res.status(200).json({
      success: true,
      scene: updatedScene[0]
    });

  } catch (error) {
    console.error('[saveVideoToDatabase] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Get Project Status
 */
async function getProject(req, res, projectId) {
  try {
    const { data: project } = await supabase
      .from('video_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const { data: scenes } = await supabase
      .from('video_scenes')
      .select('*, image_options:video_image_options(*)')
      .eq('project_id', projectId)
      .order('order_index');

    // Log for debugging
    console.log(`[getProject] Project ${projectId}: ${scenes?.length || 0} scenes`);
    scenes?.forEach((scene, idx) => {
      console.log(`  Scene ${idx + 1}: ${scene.image_options?.length || 0} images`);
    });

    return res.status(200).json({
      success: true,
      project: { ...project, scenes: scenes || [] }
    });

  } catch (error) {
    console.error('[getProject] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Select Image
 */
async function selectImage(req, res, sceneId, imageOptionId) {
  try {
    // Deselect all
    await supabase
      .from('video_image_options')
      .update({ is_selected: false })
      .eq('scene_id', sceneId);

    // Select chosen
    await supabase
      .from('video_image_options')
      .update({ is_selected: true })
      .eq('id', imageOptionId);

    // Update scene
    const { data: imageOption } = await supabase
      .from('video_image_options')
      .select('url')
      .eq('id', imageOptionId)
      .single();

    if (imageOption) {
      await supabase
        .from('video_scenes')
        .update({ selected_image_url: imageOption.url })
        .eq('id', sceneId);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('[selectImage] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Generate 2 images for ONE scene (synchronous to avoid timeout)
 */
async function generateImagesForOneScene(scene) {
  console.log(`[generateImagesForOneScene] Starting for scene ${scene.id}`);

  try {
    // Generate 2 images sequentially
    for (let i = 0; i < 2; i++) {
      console.log(`[generateImagesForOneScene] Generating image ${i + 1}/2 for scene ${scene.id}`);

      // Step 1: Create image generation task
      console.log(`[generateImagesForOneScene] Calling KIE.AI with prompt:`, scene.visual_prompt?.substring(0, 50));
      
      const requestBody = {
        prompt: scene.visual_prompt,
        aspectRatio: '16:9',
        enableTranslation: true,
        outputFormat: 'jpeg',
        promptUpsampling: false,
        model: 'flux-kontext-pro'
      };
      
      console.log(`[generateImagesForOneScene] Request body:`, JSON.stringify(requestBody));

      const response = await fetch('https://api.kie.ai/api/v1/flux/kontext/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KIE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`[generateImagesForOneScene] Response status:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[generateImagesForOneScene] KIE.AI error (${response.status}):`, errorText);
        continue; // Skip this image and try the next one
      }

      const taskData = await response.json();
      console.log(`[generateImagesForOneScene] Task response:`, JSON.stringify(taskData));
      
      if (taskData.code !== 200 || !taskData.data?.taskId) {
        console.error(`[generateImagesForOneScene] Invalid response structure:`, taskData);
        continue;
      }

      const taskId = taskData.data.taskId;
      console.log(`[generateImagesForOneScene] ✅ Task created: ${taskId}`);

      // Step 2: Poll for completion (max 2 minutes per image)
      const imageUrl = await pollImageTask(taskId, scene.id, i + 1);
      
      if (imageUrl) {
        // Save to database
        const { data: insertedImage, error: insertError } = await supabase
          .from('video_image_options')
          .insert({
            scene_id: scene.id,
            url: imageUrl,
            is_selected: false
          })
          .select();

        if (insertError) {
          console.error(`[generateImagesForOneScene] DB error:`, insertError);
        } else {
          console.log(`[generateImagesForOneScene] ✅ Saved image ${i + 1}/2 for scene ${scene.id}`);
        }
      }
    }

    console.log(`[generateImagesForOneScene] ✅ Completed scene ${scene.id}`);
    return true;

  } catch (error) {
    console.error(`[generateImagesForOneScene] Error:`, error);
    return false;
  }
}

/**
 * Background Image Generation (2 images per scene using KIE.AI Flux Kontext)
 * DEPRECATED: Replaced by generateImagesForOneScene to avoid timeouts
 */
async function generateImagesBackground(scenes) {
  console.log('[generateImagesBackground] Starting for', scenes.length, 'scenes');

  for (const scene of scenes) {
    try {
      const promises = Array(2).fill(null).map(async (_, idx) => {
        try {
          // Step 1: Create image generation task
          const response = await fetch('https://api.kie.ai/api/v1/flux/kontext/generate', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${KIE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              prompt: scene.visual_prompt,
              aspectRatio: '16:9',
              enableTranslation: true,
              outputFormat: 'jpeg',
              promptUpsampling: false,
              model: 'flux-kontext-pro'
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[generateImagesBackground] KIE.AI error for scene ${scene.id}, image ${idx + 1}:`, errorText);
            return null;
          }

          const taskData = await response.json();
          
          if (taskData.code !== 200 || !taskData.data?.taskId) {
            console.error(`[generateImagesBackground] Invalid response for scene ${scene.id}:`, taskData);
            return null;
          }

          const taskId = taskData.data.taskId;
          console.log(`[generateImagesBackground] Task created ${taskId} for scene ${scene.id}, image ${idx + 1}`);

          // Step 2: Poll for completion
          const imageUrl = await pollImageTask(taskId, scene.id, idx + 1);
          
          if (imageUrl) {
            // Save to database
            const { data: insertedImage, error: insertError } = await supabase
              .from('video_image_options')
              .insert({
                scene_id: scene.id,
                url: imageUrl,
                is_selected: false
              })
              .select();

            if (insertError) {
              console.error(`[generateImagesBackground] Failed to save image for scene ${scene.id}:`, insertError);
            } else {
              console.log(`[generateImagesBackground] ✅ Saved image ${idx + 1}/2 for scene ${scene.id}:`, insertedImage);
            }
          } else {
            console.error(`[generateImagesBackground] ❌ No image URL for scene ${scene.id}, image ${idx + 1}`);
          }

          return imageUrl;

        } catch (err) {
          console.error(`[generateImagesBackground] Error:`, err);
          return null;
        }
      });

      await Promise.all(promises);

    } catch (error) {
      console.error(`[generateImagesBackground] Scene ${scene.id} error:`, error);
    }
  }

  console.log('[generateImagesBackground] Complete');
}

/**
 * Poll KIE.AI task until completion
 */
async function pollImageTask(taskId, sceneId, imageIndex) {
  const maxAttempts = 24; // 2 minutes (5 sec intervals)
  let attempts = 0;

  console.log(`[pollImageTask] Starting polling for task ${taskId}`);

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`https://api.kie.ai/api/v1/flux/kontext/status/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${KIE_API_KEY}`
        }
      });

      console.log(`[pollImageTask] Poll attempt ${attempts + 1}/${maxAttempts}, status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[pollImageTask] Status check failed (${response.status}):`, errorText);
        return null;
      }

      const statusData = await response.json();
      console.log(`[pollImageTask] Status response:`, JSON.stringify(statusData));

      if (statusData.code === 200 && statusData.data?.status === 'SUCCESS') {
        const imageUrl = statusData.data.images?.[0];
        if (imageUrl) {
          console.log(`[pollImageTask] ✅ SUCCESS! Task ${taskId} complete, URL:`, imageUrl);
          return imageUrl;
        } else {
          console.error(`[pollImageTask] Success but no image URL in response:`, statusData);
        }
      } else if (statusData.data?.status === 'FAILED') {
        console.error(`[pollImageTask] ❌ Task ${taskId} FAILED:`, statusData);
        return null;
      } else if (statusData.data?.status === 'PENDING' || statusData.data?.status === 'PROCESSING') {
        console.log(`[pollImageTask] Task ${taskId} still processing... (${statusData.data?.status})`);
      } else {
        console.log(`[pollImageTask] Unknown status for task ${taskId}:`, statusData.data?.status);
      }

      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;

    } catch (err) {
      console.error(`[pollImageTask] Error polling task ${taskId}:`, err);
      return null;
    }
  }

  console.error(`[pollImageTask] ⏱️ TIMEOUT for task ${taskId} after ${attempts} attempts`);
  return null;
}

/**
 * Stitch Video - Get all scene videos for download
 * Note: Actual FFmpeg stitching requires server-side processing
 * For now, we return all scene video URLs
 */
async function stitchVideo(req, res, projectId, scenes) {
  try {
    console.log(`[stitchVideo] Getting videos for project ${projectId}`);
    
    // Get all scenes with video URLs
    const { data: projectScenes, error } = await supabase
      .from('video_scenes')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index');

    if (error) {
      console.error('[stitchVideo] DB error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    // Filter scenes that have video URLs
    const videosReady = projectScenes.filter(scene => scene.video_clip_url);
    
    console.log(`[stitchVideo] Found ${videosReady.length}/${projectScenes.length} videos ready`);

    if (videosReady.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No videos available to stitch' 
      });
    }

    // Update project status
    await supabase
      .from('video_projects')
      .update({ 
        status: 'complete',
        final_video_url: videosReady[0].video_clip_url // Use first video as preview
      })
      .eq('id', projectId);

    return res.status(200).json({
      success: true,
      scenes: videosReady,
      message: `${videosReady.length} scene videos ready for download`
    });

  } catch (error) {
    console.error('[stitchVideo] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Animate Images (placeholder)
 */
async function animateImages(req, res, projectId, scenes) {
  try {
    console.log(`[animateImages] Starting for project ${projectId}`);
    
    // TODO: Implement KIE.AI Veo animation
    // For now, return placeholder
    return res.status(200).json({
      success: true,
      message: 'Animation started (placeholder)'
    });

  } catch (error) {
    console.error('[animateImages] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GENERATE VIDEO TOOL FUNCTIONS
 * Standalone video generation with scene breakdown
 */

async function createVideoProject(req, res) {
  const { userId, prompt, aspectRatio, duration } = req.body;
  
  console.log('[createVideoProject] Request:', { userId, prompt, aspectRatio, duration });
  console.log('[createVideoProject] Supabase initialized:', !!supabase);
  console.log('[createVideoProject] SUPABASE_URL:', !!SUPABASE_URL);
  console.log('[createVideoProject] SUPABASE_SERVICE_KEY:', !!SUPABASE_SERVICE_KEY);
  
  if (!supabase) {
    console.error('[createVideoProject] Supabase not initialized!');
    return res.status(500).json({ 
      success: false, 
      error: 'Database not configured',
      debug: {
        hasUrl: !!SUPABASE_URL,
        hasKey: !!SUPABASE_SERVICE_KEY
      }
    });
  }
  
  if (!userId || !prompt || !aspectRatio || !duration) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  
  const totalScenes = duration / 8;
  
  try {
    const { data: project, error } = await supabase
      .from('video_generation_projects')
      .insert({
        user_id: userId,
        original_prompt: prompt,
        aspect_ratio: aspectRatio,
        target_duration: duration,
        total_scenes: totalScenes,
        status: 'draft'
      })
      .select()
      .single();
    
    if (error) {
      console.error('[createVideoProject] Supabase error:', error);
      throw error;
    }
    
    console.log('[createVideoProject] ✅ Project created:', project.id);
    return res.status(200).json({ success: true, project });
  } catch (error) {
    console.error('[createVideoProject] Error:', error);
    console.error('[createVideoProject] Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code,
      details: error.details
    });
  }
}

async function enhanceVideoScript(req, res) {
  const { projectId, prompt, duration, aspectRatio } = req.body;
  const totalScenes = duration / 8;
  const orientation = aspectRatio === '16:9' ? 'landscape' : 'portrait';
  
  console.log('[enhanceVideoScript] Request:', { projectId, prompt, duration, aspectRatio });
  console.log('[enhanceVideoScript] GROK_API_KEY exists:', !!GROK_API_KEY);
  
  if (!GROK_API_KEY) {
    console.error('[enhanceVideoScript] GROK_API_KEY not set!');
    return res.status(500).json({ 
      success: false, 
      error: 'Grok API key not configured' 
    });
  }
  
  try {
    // Smart scene breakdown: prefer fewer, longer scenes over many short ones
    const shouldUseSingleScene = duration <= 32; // Up to 32s, use 1 continuous scene
    const actualScenes = shouldUseSingleScene ? 1 : Math.ceil(duration / 16); // Longer scenes (16s each)
    
    const grokPrompt = shouldUseSingleScene 
      ? `You are a professional video director. Create a detailed ${duration}-second continuous scene for this concept.

CONCEPT: "${prompt}"
ASPECT RATIO: ${aspectRatio} (${orientation})
DURATION: ${duration} seconds (will be generated as 8s base + extensions for continuity)

IMPORTANT: Break the ${duration}-second scene into progressive 8-second segments that flow naturally:
- Segment 1 (0-8s): Opening/establishing shot
- Segment 2 (8-16s): Development/action continues
- Segment 3 (16-24s): Climax/conclusion (if applicable)

Each segment should:
- Build upon the previous segment naturally
- Maintain visual consistency (lighting, style, colors)
- Show clear progression of action/movement
- Use cinematic camera work (angles, movement, focus)

OUTPUT JSON:
{
  "title": "Brief title",
  "enhancedPrompt": "Enhanced description",
  "scenes": [
    {
      "sceneNumber": 1,
      "scriptText": "What happens in this ${duration}-second scene",
      "visualDescription": "Detailed prompt for FIRST 8 seconds - opening/establishing shot with camera, lighting, movement",
      "duration": ${duration},
      "progressionSegments": [
        "Segment 1 (0-8s): Opening shot description",
        "Segment 2 (8-16s): How action continues and develops",
        "Segment 3 (16-24s): Climax/conclusion description"
      ]
    }
  ]
}`
      : `You are a professional video director. Break down this ${duration}-second video into ${actualScenes} scenes.

CONCEPT: "${prompt}"
ASPECT RATIO: ${aspectRatio} (${orientation})
TOTAL DURATION: ${duration} seconds

Create ${actualScenes} scenes (each 16-24 seconds) with:
- Camera angles (wide shot, close-up, aerial, POV, etc.)
- Lighting (golden hour, dramatic, soft, neon, etc.)
- Movement (pan, zoom, tracking, static, etc.)
- Mood and atmosphere
- Smooth transitions between scenes

OUTPUT JSON:
{
  "title": "Brief title",
  "enhancedPrompt": "Enhanced description",
  "scenes": [
    {
      "sceneNumber": 1,
      "scriptText": "What happens",
      "visualDescription": "Detailed cinematic prompt with camera, lighting, movement",
      "duration": 16
    }
  ]
}`;

    console.log('[enhanceVideoScript] Calling Grok API...');
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast',
        messages: [
          { role: 'system', content: 'You are a professional video director. Always respond with valid JSON only.' },
          { role: 'user', content: grokPrompt }
        ],
        temperature: 0.7
      })
    });
    
    if (!grokResponse.ok) {
      const errorText = await grokResponse.text();
      console.error('[enhanceVideoScript] Grok API error:', grokResponse.status, errorText);
      throw new Error(`Grok API failed: ${grokResponse.status} - ${errorText}`);
    }
    
    const grokData = await grokResponse.json();
    let scriptContent = grokData.choices[0].message.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('[enhanceVideoScript] Raw Grok response:', scriptContent);
    
    const scriptData = JSON.parse(scriptContent);
    
    console.log('[enhanceVideoScript] Parsed script data:', JSON.stringify(scriptData, null, 2));
    
    await supabase
      .from('video_generation_projects')
      .update({
        title: scriptData.title,
        enhanced_prompt: scriptData.enhancedPrompt,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);
    
    const scenesToInsert = scriptData.scenes.map(scene => ({
      project_id: projectId,
      scene_number: scene.sceneNumber,
      script_text: scene.scriptText,
      visual_description: scene.visualDescription,
      duration: scene.duration || 8,  // Use Grok's duration, fallback to 8
      progression_segments: scene.progressionSegments || null  // Save progressive prompts
    }));
    
    console.log('[enhanceVideoScript] Scenes to insert:', scenesToInsert.map(s => ({
      sceneNumber: s.scene_number,
      duration: s.duration,
      hasProgressionSegments: !!s.progression_segments,
      progressionSegmentsCount: s.progression_segments?.length || 0
    })));
    
    const { data: scenes, error } = await supabase
      .from('video_generation_scenes')
      .insert(scenesToInsert)
      .select();
    
    if (error) throw error;
    
    return res.status(200).json({
      success: true,
      title: scriptData.title,
      enhancedPrompt: scriptData.enhancedPrompt,
      scenes
    });
  } catch (error) {
    console.error('[enhanceVideoScript] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function updateVideoScenes(req, res) {
  const { scenes } = req.body;
  
  try {
    for (const scene of scenes) {
      await supabase
        .from('video_generation_scenes')
        .update({
          script_text: scene.script_text,
          visual_description: scene.visual_description,
          updated_at: new Date().toISOString()
        })
        .eq('id', scene.id);
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[updateVideoScenes] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function startVideoGeneration(req, res) {
  const { projectId, aspectRatio } = req.body;
  
  try {
    const { data: scenes } = await supabase
      .from('video_generation_scenes')
      .select('*')
      .eq('project_id', projectId)
      .order('scene_number');
    
    await supabase
      .from('video_generation_projects')
      .update({ status: 'generating', updated_at: new Date().toISOString() })
      .eq('id', projectId);
    
    const taskIds = [];
    
    for (const scene of scenes) {
      // Generate consistent seed for this scene (will be used for extensions too)
      // KIE.AI requires seeds in range 10000-99999
      const sceneSeed = Math.floor(Math.random() * 90000) + 10000;
      
      console.log(`[startVideoGeneration] Scene ${scene.scene_number}: seed=${sceneSeed}`);
      
      const veoResponse = await fetch('https://api.kie.ai/api/v1/veo/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KIE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: scene.visual_description,
          model: 'veo3_fast',
          aspectRatio: aspectRatio,
          seeds: sceneSeed,  // Add seed for consistency
          enableTranslation: true,
          enableFallback: true,
          generationType: 'TEXT_2_VIDEO'
        })
      });
      
      if (veoResponse.ok) {
        const veoData = await veoResponse.json();
        if (veoData.code === 200 && veoData.data?.taskId) {
          const taskId = veoData.data.taskId;
          taskIds.push({ sceneId: scene.id, taskId, sceneNumber: scene.scene_number, seed: sceneSeed });
          
          // Store seed in scene metadata for extensions to use
          await supabase
            .from('video_generation_scenes')
            .update({
              base_task_id: taskId,
              base_status: 'generating',
              updated_at: new Date().toISOString()
            })
            .eq('id', scene.id);
          
          console.log(`[startVideoGeneration] ✅ Scene ${scene.scene_number} started with seed ${sceneSeed}, taskId: ${taskId}`);
        }
      }
    }
    
    return res.status(200).json({ success: true, taskIds });
  } catch (error) {
    console.error('[startVideoGeneration] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function checkVideoProgress(req, res) {
  const { projectId } = req.body;
  
  try {
    const { data: scenes } = await supabase
      .from('video_generation_scenes')
      .select('*')
      .eq('project_id', projectId)
      .order('scene_number');
    
    const progress = { total: scenes.length, generating: 0, complete: 0, failed: 0, scenes: [] };
    
    for (const scene of scenes) {
      const sceneProgress = {
        id: scene.id,
        sceneNumber: scene.scene_number,
        status: scene.base_status,
        videoUrl: scene.base_video_url,
        taskId: scene.base_task_id,  // Include task ID for extensions
        error: scene.error_message
      };
      
      if (scene.base_status === 'generating' && scene.base_task_id) {
        const statusResponse = await fetch(
          `https://api.kie.ai/api/v1/veo/record-info?taskId=${scene.base_task_id}`,
          { headers: { 'Authorization': `Bearer ${KIE_API_KEY}` } }
        );
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          
          console.log(`[checkVideoProgress] Scene ${scene.scene_number} status:`, JSON.stringify(statusData, null, 2));
          
          // Check multiple possible response structures
          const successFlag = statusData.data?.successFlag;
          const code = statusData.code;
          const completeTime = statusData.data?.completeTime;
          
          // Try different video URL paths
          const videoUrl = 
            statusData.data?.response?.resultUrls?.[0] || 
            statusData.data?.response?.originUrls?.[0] ||
            statusData.data?.resultUrls?.[0] ||
            statusData.data?.originUrls?.[0] ||
            statusData.data?.videoUrl ||
            statusData.data?.url;
          
          console.log(`[checkVideoProgress] Scene ${scene.scene_number} - code: ${code}, successFlag: ${successFlag}, completeTime: ${completeTime}, videoUrl: ${videoUrl}`);
          
          // KIE.AI uses: 0=pending, 1=processing, 2=failed, 3=success
          // BUT sometimes successFlag stays at 1 even when complete! Check completeTime too
          const isComplete = successFlag === 3 || (completeTime && videoUrl);
          
          if (isComplete) {
            console.log(`[checkVideoProgress] Scene ${scene.scene_number} complete! Video URL:`, videoUrl);
            
            if (videoUrl) {
              await supabase
                .from('video_generation_scenes')
                .update({ base_status: 'complete', base_video_url: videoUrl, updated_at: new Date().toISOString() })
                .eq('id', scene.id);
              sceneProgress.status = 'complete';
              sceneProgress.videoUrl = videoUrl;
              progress.complete++;
            } else {
              console.error(`[checkVideoProgress] Scene ${scene.scene_number} marked complete but no video URL!`);
            }
          } else if (successFlag === 2) {
            console.error(`[checkVideoProgress] Scene ${scene.scene_number} failed:`, statusData.data?.errorMessage);
            await supabase
              .from('video_generation_scenes')
              .update({ base_status: 'failed', error_message: statusData.data?.errorMessage, updated_at: new Date().toISOString() })
              .eq('id', scene.id);
            sceneProgress.status = 'failed';
            progress.failed++;
          } else {
            console.log(`[checkVideoProgress] Scene ${scene.scene_number} still generating (successFlag: ${successFlag})`);
            progress.generating++;
          }
        } else {
          console.error(`[checkVideoProgress] Failed to check status for scene ${scene.scene_number}:`, statusResponse.status);
          progress.generating++;
        }
      } else if (scene.base_status === 'complete') {
        // Check if scene needs extensions
        if (scene.duration > 8) {
          // Scene needs extensions
          if (scene.extension_task_ids && scene.extension_task_ids.length > 0) {
            // Extensions have been started - check their status by polling KIE.AI
            console.log(`[checkVideoProgress] Scene ${scene.scene_number} has extensions: ${scene.extension_task_ids.length}, current status: ${scene.extension_status}`);
          
          // Check each extension task status
          const extensionResults = [];
          for (const taskId of scene.extension_task_ids) {
            const extStatusResponse = await fetch(
              `https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`,
              { headers: { 'Authorization': `Bearer ${KIE_API_KEY}` } }
            );
            
            if (extStatusResponse.ok) {
              const extStatusData = await extStatusResponse.json();
              const successFlag = extStatusData.data?.successFlag;
              const completeTime = extStatusData.data?.completeTime;
              
              console.log(`[checkExtensionProgress] Extension ${taskId} FULL response:`, JSON.stringify(extStatusData, null, 2));
              
              // Parse resultUrls - it's a JSON STRING according to KIE.AI docs
              let videoUrl = null;
              try {
                const resultUrlsStr = extStatusData.data?.resultUrls;
                if (resultUrlsStr && typeof resultUrlsStr === 'string') {
                  const urlsArray = JSON.parse(resultUrlsStr);
                  videoUrl = urlsArray[0]?.url;
                  console.log(`[checkExtensionProgress] Parsed resultUrls:`, urlsArray);
                }
              } catch (e) {
                console.log(`[checkExtensionProgress] resultUrls not a JSON string, trying direct access`);
              }
              
              // Fallback to other possible locations
              if (!videoUrl) {
                videoUrl = 
                  extStatusData.data?.response?.resultUrls?.[0] || 
                  extStatusData.data?.response?.originUrls?.[0];
              }
              
              const duration = extStatusData.data?.response?.duration || extStatusData.data?.duration || 'unknown';
              
              console.log(`[checkExtensionProgress] Extension ${taskId} - successFlag: ${successFlag}, completeTime: ${completeTime}, duration: ${duration}, videoUrl: ${videoUrl}`);
              
              // KIE.AI uses: 0=pending, 1=processing, 2=failed, 3=success
              // BUT sometimes successFlag stays at 1 even when complete! Check completeTime too
              const isComplete = successFlag === 3 || (completeTime && videoUrl);
              const status = isComplete ? 'complete' : (successFlag === 2 ? 'failed' : 'processing');
              
              extensionResults.push({
                taskId,
                status,
                videoUrl,
                duration
              });
            }
          }
          
          const allExtensionsComplete = extensionResults.every(r => r.status === 'complete');
          const completedCount = extensionResults.filter(r => r.status === 'complete').length;
          
          console.log(`[checkVideoProgress] Scene ${scene.scene_number} extensions: ${completedCount}/${extensionResults.length} complete`);
          
          if (allExtensionsComplete) {
            // Update database with extension URLs and status
            console.log(`[checkVideoProgress] Extension results:`, JSON.stringify(extensionResults, null, 2));
            
            const extensionUrls = extensionResults.filter(r => r.videoUrl).map(r => r.videoUrl);
            
            console.log(`[checkVideoProgress] ✅ All extensions complete! Updating database with ${extensionUrls.length} URLs:`, extensionUrls);
            
            if (extensionUrls.length === 0) {
              console.error(`[checkVideoProgress] ⚠️ WARNING: No video URLs found in extension results!`);
            }
            
            const { error: updateError } = await supabase
              .from('video_generation_scenes')
              .update({
                extension_video_urls: extensionUrls,
                extension_status: 'complete',
                updated_at: new Date().toISOString()
              })
              .eq('id', scene.id);
            
            if (updateError) {
              console.error(`[checkVideoProgress] Database update error:`, updateError);
            }
            
            progress.complete++;
            sceneProgress.extensionsComplete = true;
            sceneProgress.extensionUrls = extensionUrls;
          } else {
            console.log(`[checkVideoProgress] Scene ${scene.scene_number} - extensions still processing`);
            progress.generating++;
            sceneProgress.extensionsComplete = false;
            sceneProgress.extensionStatus = 'extending';
          }
          } else {
            // Extensions needed but not started yet - wait for frontend to start them
            console.log(`[checkVideoProgress] Scene ${scene.scene_number} - base complete, waiting for extensions to start`);
            progress.generating++;
            sceneProgress.status = 'complete'; // Base is complete
            sceneProgress.extensionsComplete = false;
            sceneProgress.extensionStatus = 'pending';
          }
        } else {
          // No extensions needed, base video complete = scene complete
          console.log(`[checkVideoProgress] Scene ${scene.scene_number} - base complete, no extensions needed`);
          progress.complete++;
        }
      } else if (scene.base_status === 'failed') {
        progress.failed++;
      } else {
        progress.generating++;
      }
      
      progress.scenes.push(sceneProgress);
    }
    
    if (progress.complete === progress.total) {
      await supabase
        .from('video_generation_projects')
        .update({ status: 'complete', updated_at: new Date().toISOString() })
        .eq('id', projectId);
    }
    
    return res.status(200).json({ success: true, progress });
  } catch (error) {
    console.error('[checkVideoProgress] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function getVideoProject(req, res) {
  const { projectId } = req.body;
  
  try {
    const { data: project } = await supabase
      .from('video_generation_projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    const { data: scenes } = await supabase
      .from('video_generation_scenes')
      .select('*')
      .eq('project_id', projectId)
      .order('scene_number');
    
    return res.status(200).json({
      success: true,
      project: { ...project, scenes: scenes || [] }
    });
  } catch (error) {
    console.error('[getVideoProject] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * EXTENSION API FUNCTIONS
 * Extend videos beyond 8 seconds for continuous scenes
 */

async function startVideoExtension(req, res) {
  const { sceneId, baseTaskId, prompt, seeds } = req.body;
  
  console.log(`[startVideoExtension] Scene: ${sceneId}, Base Task: ${baseTaskId}, Seeds: ${seeds}`);
  
  try {
    // Call Veo extend API with seeds for consistency
    const extensionPayload = {
      taskId: baseTaskId,
      prompt: prompt,
      seeds: seeds || (Math.floor(Math.random() * 90000) + 10000) // KIE.AI requires 10000-99999
    };
    
    console.log(`[startVideoExtension] 🚀 Calling KIE.AI /veo/extend with:`, JSON.stringify(extensionPayload, null, 2));
    
    const extendResponse = await fetch('https://api.kie.ai/api/v1/veo/extend', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(extensionPayload)
    });
    
    if (!extendResponse.ok) {
      const errorText = await extendResponse.text();
      console.error(`[startVideoExtension] API error:`, errorText);
      return res.status(200).json({ 
        success: false, 
        message: `Extension API error: ${errorText}` 
      });
    }
    
    const extendData = await extendResponse.json();
    console.log(`[startVideoExtension] ✅ Extension API Response:`, JSON.stringify(extendData, null, 2));
    console.log(`[startVideoExtension] Extension taskId: ${extendData.data?.taskId}`);
    
    if (extendData.code !== 200 || !extendData.data?.taskId) {
      console.error(`[startVideoExtension] Invalid response:`, extendData);
      return res.status(200).json({ 
        success: false, 
        message: `Invalid extension response: ${extendData.msg}` 
      });
    }
    
    const extensionTaskId = extendData.data.taskId;
    console.log(`[startVideoExtension] ✅ Extension task: ${extensionTaskId}`);
    
    // Update scene with extension task ID
    const { data: scene } = await supabase
      .from('video_generation_scenes')
      .select('extension_task_ids')
      .eq('id', sceneId)
      .single();
    
    const existingTaskIds = scene?.extension_task_ids || [];
    
    await supabase
      .from('video_generation_scenes')
      .update({
        extension_task_ids: [...existingTaskIds, extensionTaskId],
        extension_status: 'extending',
        updated_at: new Date().toISOString()
      })
      .eq('id', sceneId);
    
    return res.status(200).json({
      success: true,
      extensionTaskId,
      sceneId
    });
    
  } catch (error) {
    console.error('[startVideoExtension] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function checkExtensionProgress(req, res) {
  const { sceneId } = req.body;
  
  console.log(`[checkExtensionProgress] Called for scene: ${sceneId}`);
  
  try {
    const { data: scene } = await supabase
      .from('video_generation_scenes')
      .select('*')
      .eq('id', sceneId)
      .single();
    
    console.log(`[checkExtensionProgress] Scene data:`, {
      id: scene?.id,
      duration: scene?.duration,
      extension_task_ids: scene?.extension_task_ids,
      extension_status: scene?.extension_status
    });
    
    if (!scene || !scene.extension_task_ids || scene.extension_task_ids.length === 0) {
      console.log(`[checkExtensionProgress] No extensions found for scene ${sceneId}`);
      return res.status(200).json({
        success: true,
        status: 'no_extensions',
        extensions: []
      });
    }
    
    const extensionResults = [];
    
    // Check each extension task
    for (const taskId of scene.extension_task_ids) {
      const statusResponse = await fetch(
        `https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`,
        { headers: { 'Authorization': `Bearer ${KIE_API_KEY}` } }
      );
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const successFlag = statusData.data?.successFlag;
        
        if (successFlag === 1) {
          // Extension complete
          const videoUrl = statusData.data?.response?.resultUrls?.[0] 
                        || statusData.data?.response?.originUrls?.[0];
          
          extensionResults.push({
            taskId,
            status: 'complete',
            videoUrl
          });
        } else if (successFlag === 2) {
          // Extension failed
          extensionResults.push({
            taskId,
            status: 'failed',
            error: statusData.data?.errorMessage
          });
        } else {
          // Still processing
          extensionResults.push({
            taskId,
            status: 'processing',
            progress: statusData.data?.progress || '0.00'
          });
        }
      }
    }
    
    // Check if all extensions are complete
    const allComplete = extensionResults.every(r => r.status === 'complete');
    const anyFailed = extensionResults.some(r => r.status === 'failed');
    
    console.log(`[checkExtensionProgress] Scene ${sceneId}: ${extensionResults.length} extensions, allComplete=${allComplete}, anyFailed=${anyFailed}`);
    console.log(`[checkExtensionProgress] Extension statuses:`, extensionResults.map(r => ({ taskId: r.taskId, status: r.status })));
    
    if (allComplete) {
      // Update scene with all extension URLs
      const extensionUrls = extensionResults
        .filter(r => r.videoUrl)
        .map(r => r.videoUrl);
      
      console.log(`[checkExtensionProgress] ✅ All extensions complete! Updating database with ${extensionUrls.length} URLs`);
      
      const { error: updateError } = await supabase
        .from('video_generation_scenes')
        .update({
          extension_video_urls: extensionUrls,
          extension_status: 'complete',
          updated_at: new Date().toISOString()
        })
        .eq('id', sceneId);
      
      if (updateError) {
        console.error(`[checkExtensionProgress] Database update error:`, updateError);
      } else {
        console.log(`[checkExtensionProgress] ✅ Database updated successfully!`);
      }
      
      return res.status(200).json({
        success: true,
        status: 'complete',
        extensions: extensionResults
      });
    } else if (anyFailed) {
      await supabase
        .from('video_generation_scenes')
        .update({
          extension_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', sceneId);
      
      return res.status(200).json({
        success: true,
        status: 'failed',
        extensions: extensionResults
      });
    } else {
      return res.status(200).json({
        success: true,
        status: 'processing',
        extensions: extensionResults
      });
    }
    
  } catch (error) {
    console.error('[checkExtensionProgress] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// ============================================================================
// MULTI-MODEL VIDEO GENERATION (Kling 2.6, Grok, Sora, Wan, Veo)
// ============================================================================

async function generateMultiModelVideo(req, res, prompt, model, aspectRatio, duration, kieApiKey) {
  console.log('🎬 Starting multi-model video generation...');
  console.log('📝 Prompt:', prompt);
  console.log('🎨 Model:', model);
  console.log('📐 Aspect Ratio:', aspectRatio);
  console.log('⏱️ Duration:', duration);

  if (!kieApiKey) {
    return res.status(500).json({ error: 'KIE_API_KEY not configured' });
  }

  // Handle Veo 3.1 separately (uses different API)
  if (model === 'veo-3-1-fast') {
    return await generateVeoVideoMulti(req, res, prompt, aspectRatio, kieApiKey);
  }

  // Map model to API format and build input based on model requirements
  let apiModel;
  let input;

  switch (model) {
    case 'kling-2.6':
      apiModel = 'kling-2.6/text-to-video';
      input = {
        prompt: prompt,
        sound: true, // Enable audio by default
        aspect_ratio: aspectRatio || '16:9',
        duration: String(duration || 10)
      };
      break;

    case 'grok-imagine':
      apiModel = 'grok-imagine/text-to-video';
      input = {
        prompt: prompt,
        aspect_ratio: aspectRatio || '16:9',
        mode: 'normal'
      };
      break;

    case 'sora-2':
      apiModel = 'sora-2-pro-text-to-video';
      let soraAspectRatio = 'landscape';
      if (aspectRatio === '9:16') soraAspectRatio = 'portrait';
      else if (aspectRatio === '1:1') soraAspectRatio = 'square';
      
      input = {
        prompt: prompt,
        aspect_ratio: soraAspectRatio,
        n_frames: String(duration || 10),
        size: 'high',
        remove_watermark: true
      };
      break;

    case 'wan-2-5':
      apiModel = 'wan/2-5-text-to-video';
      input = {
        prompt: prompt,
        duration: String(duration || 5),
        aspect_ratio: aspectRatio || '16:9',
        resolution: '720p',
        enable_prompt_expansion: true
      };
      break;

    default:
      return res.status(400).json({ error: `Unsupported model: ${model}` });
  }

  const requestBody = { model: apiModel, input };
  console.log('📤 Jobs createTask body:', JSON.stringify(requestBody, null, 2));

  try {
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
      console.error(`❌ Jobs API error (${createResponse.status}):`, errorText);
      throw new Error(`KIE.AI API error: ${createResponse.status}`);
    }

    const taskData = await createResponse.json();

    if (taskData.code !== 200) {
      console.error('❌ API returned error:', taskData);
      throw new Error(taskData.msg || 'Video generation failed');
    }

    const taskId = taskData.data?.taskId;
    if (!taskId) {
      throw new Error('Failed to get task ID');
    }

    console.log('✅ Task created:', taskId);

    return res.status(200).json({
      success: true,
      status: 'processing',
      task_id: taskId,
      model: model
    });
  } catch (error) {
    console.error('❌ Multi-model video generation error:', error);
    return res.status(500).json({
      error: error.message || 'Video generation failed',
      details: error.toString()
    });
  }
}

async function generateVeoVideoMulti(req, res, prompt, aspectRatio, kieApiKey) {
  console.log('🎬 Starting Veo 3.1 video generation...');

  const requestBody = {
    prompt: prompt,
    aspectRatio: aspectRatio || '16:9',
    enableFallback: true,
    enableTranslation: true,
    generationType: 'TEXT_2_VIDEO'
  };

  console.log('📤 Veo request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('https://api.kie.ai/api/v1/veo/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Veo API error (${response.status}):`, errorText);
      throw new Error(`KIE.AI Veo API error: ${response.status}`);
    }

    const taskData = await response.json();

    if (taskData.code !== 200) {
      console.error('❌ Veo API returned error:', taskData);
      throw new Error(taskData.msg || 'Veo video generation failed');
    }

    const taskId = taskData.data?.taskId;
    if (!taskId) {
      throw new Error('Failed to get Veo task ID');
    }

    console.log('✅ Veo task created:', taskId);

    return res.status(200).json({
      success: true,
      status: 'processing',
      task_id: taskId,
      model: 'veo-3-1-fast'
    });
  } catch (error) {
    console.error('❌ Veo video generation error:', error);
    return res.status(500).json({
      error: error.message || 'Veo video generation failed',
      details: error.toString()
    });
  }
}

async function checkMultiModelVideoStatus(req, res, taskId, kieApiKey) {
  console.log('📊 Checking video status for task:', taskId);

  if (!kieApiKey) {
    return res.status(500).json({ error: 'KIE_API_KEY not configured' });
  }

  try {
    const statusResponse = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
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

    const statusData = await statusResponse.json();

    if (statusData.code !== 200 && statusData.code !== 501) {
      throw new Error(statusData.msg || 'Failed to check status');
    }

    const state = statusData.data?.state;
    const progress = statusData.data?.progress || '0.00';

    console.log(`📊 Task status: State = ${state}, Progress = ${progress}`);
    console.log(`📊 Full status data:`, JSON.stringify(statusData.data, null, 2));

    // Check for failure state
    if (state === 'fail' || statusData.code === 501) {
      const errorMsg = statusData.data?.failMsg || statusData.msg || 'Video generation failed';
      console.error('❌ Video failed:', errorMsg);
      return res.status(200).json({
        success: false,
        status: 'failed',
        error: errorMsg
      });
    }

    // Check for success state
    if (state === 'success') {
      const resultJson = statusData.data?.resultJson;
      let videoUrl = null;

      console.log('📦 resultJson type:', typeof resultJson);
      console.log('📦 resultJson value:', resultJson);

      if (resultJson) {
        try {
          const parsed = typeof resultJson === 'string' ? JSON.parse(resultJson) : resultJson;
          console.log('📦 Parsed result:', JSON.stringify(parsed, null, 2));
          
          // KIE.AI format: {"resultUrls": ["url1", "url2"]}
          if (parsed.resultUrls && Array.isArray(parsed.resultUrls) && parsed.resultUrls.length > 0) {
            videoUrl = parsed.resultUrls[0];
            console.log('🎬 Found video URL in resultUrls array:', videoUrl);
          }
          
          // Fallback: Try other possible field names
          if (!videoUrl) {
            videoUrl = parsed.video_url || 
                       parsed.videoUrl || 
                       parsed.url || 
                       parsed.output_url ||
                       parsed.result_url ||
                       parsed.video ||
                       (parsed.output && parsed.output.video_url) ||
                       (parsed.result && parsed.result.video_url);
            console.log('🎬 Extracted video URL from fallback fields:', videoUrl);
          }
        } catch (e) {
          console.error('❌ Failed to parse resultJson:', e);
          console.error('❌ Raw resultJson:', resultJson);
        }
      }

      // Also check direct fields on data object
      if (!videoUrl) {
        videoUrl = statusData.data?.video_url || 
                   statusData.data?.videoUrl || 
                   statusData.data?.url;
        console.log('🎬 Video URL from data object:', videoUrl);
      }

      if (!videoUrl) {
        console.error('❌ No video URL found in response');
        console.error('❌ Full data:', JSON.stringify(statusData.data, null, 2));
        throw new Error('No video URL in response');
      }

      console.log('✅ Video completed:', videoUrl);

      return res.status(200).json({
        success: true,
        status: 'completed',
        video_url: videoUrl,
        progress: '1.00'
      });
    }

    // State is 'processing' or 'pending' or any other state
    console.log(`⏳ Video still processing, state: ${state}`);
    return res.status(200).json({
      success: true,
      status: 'processing',
      progress: progress,
      state: state
    });
  } catch (error) {
    console.error('❌ Status check error:', error);
    return res.status(500).json({
      error: error.message || 'Status check failed',
      details: error.toString()
    });
  }
}

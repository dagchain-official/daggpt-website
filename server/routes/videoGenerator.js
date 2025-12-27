/**
 * Video Generator API Routes
 * Handles script generation, image generation, and video rendering
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Grok API configuration
const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

/**
 * POST /api/video/generate-script
 * Generate video script from user prompt
 */
router.post('/generate-script', async (req, res) => {
  try {
    const { prompt, userId } = req.body;

    if (!prompt || !userId) {
      return res.status(400).json({ error: 'Missing prompt or userId' });
    }

    console.log(`[Video Generator] Generating script for: "${prompt}"`);

    // Step 1: Create project in database
    const { data: project, error: projectError } = await supabase
      .from('video_projects')
      .insert({
        user_id: userId,
        prompt,
        status: 'scripting'
      })
      .select()
      .single();

    if (projectError) throw projectError;

    console.log(`[Video Generator] Project created: ${project.id}`);

    // Step 2: Call Grok 4.1 to generate script
    const systemPrompt = `You are an expert Video Producer and Scriptwriter.
Your task is to create engaging video scripts with visual descriptions.

CRITICAL RULES:
1. Output ONLY valid JSON - NO markdown, NO code blocks, NO explanations
2. Create 4-6 scenes for a 30-60 second video
3. Each scene should be 5-10 seconds long
4. Write compelling narrator scripts that are concise and engaging
5. Create detailed visual prompts for image generation (cinematic, high-quality)
6. Ensure smooth narrative flow between scenes

OUTPUT FORMAT (JSON only):
{
  "title": "Video title",
  "scenes": [
    {
      "narrator_script": "What the narrator says (1-2 sentences)",
      "image_generation_prompt": "Detailed visual description for AI image generation",
      "duration": 5
    }
  ]
}`;

    const userPrompt = `Create a video script for: "${prompt}"

Requirements:
- Make it engaging and professional
- Each scene should have a clear visual
- Keep narrator scripts concise (1-2 sentences per scene)
- Visual prompts should be detailed and cinematic
- Total video duration: 30-60 seconds

Return ONLY the JSON object, no other text.`;

    const grokResponse = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!grokResponse.ok) {
      throw new Error(`Grok API error: ${grokResponse.statusText}`);
    }

    const grokData = await grokResponse.json();
    let scriptContent = grokData.choices[0].message.content.trim();

    // Clean up response (remove markdown code blocks if present)
    scriptContent = scriptContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    const scriptData = JSON.parse(scriptContent);

    console.log(`[Video Generator] Script generated with ${scriptData.scenes.length} scenes`);

    // Step 3: Save scenes to database
    const scenesToInsert = scriptData.scenes.map((scene, index) => ({
      project_id: project.id,
      order_index: index,
      script_text: scene.narrator_script,
      visual_prompt: scene.image_generation_prompt,
      duration_seconds: scene.duration || 5
    }));

    const { data: scenes, error: scenesError } = await supabase
      .from('video_scenes')
      .insert(scenesToInsert)
      .select();

    if (scenesError) throw scenesError;

    console.log(`[Video Generator] ${scenes.length} scenes saved to database`);

    // Step 4: Generate images for each scene (4 variations per scene)
    // This is done asynchronously - we'll trigger it but not wait for completion
    generateImagesForScenes(scenes).catch(error => {
      console.error('[Video Generator] Image generation error:', error);
    });

    // Step 5: Update project status
    await supabase
      .from('video_projects')
      .update({ status: 'awaiting_selection' })
      .eq('id', project.id);

    // Return project data
    res.json({
      success: true,
      project: {
        id: project.id,
        title: scriptData.title,
        prompt: project.prompt,
        status: 'awaiting_selection',
        scenes: scenes.map(scene => ({
          id: scene.id,
          order_index: scene.order_index,
          script_text: scene.script_text,
          visual_prompt: scene.visual_prompt,
          duration_seconds: scene.duration_seconds
        }))
      }
    });

  } catch (error) {
    console.error('[Video Generator] Script generation error:', error);
    
    // Update project status to error if project was created
    if (req.body.projectId) {
      await supabase
        .from('video_projects')
        .update({ 
          status: 'error',
          error_message: error.message
        })
        .eq('id', req.body.projectId);
    }

    res.status(500).json({ 
      error: 'Failed to generate script',
      message: error.message
    });
  }
});

/**
 * Helper: Generate images for all scenes
 */
async function generateImagesForScenes(scenes) {
  const KIE_API_KEY = process.env.REACT_APP_KIE_API_KEY;
  const KIE_BASE_URL = 'https://api.kie.ai/v1';

  for (const scene of scenes) {
    try {
      console.log(`[Image Gen] Generating 4 images for scene ${scene.order_index}...`);

      // Generate 4 image variations using Flux Kontext
      const response = await fetch(`${KIE_BASE_URL}/flux-kontext`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KIE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: scene.visual_prompt,
          num_images: 4,
          aspect_ratio: '16:9',
          output_format: 'jpeg',
          safety_tolerance: 2
        })
      });

      if (!response.ok) {
        throw new Error(`Flux Kontext API error: ${response.statusText}`);
      }

      const data = await response.json();
      const imageUrls = data.images.map(img => img.url);

      // Save image options to database
      const imageOptions = imageUrls.map(url => ({
        scene_id: scene.id,
        url,
        is_selected: false
      }));

      await supabase
        .from('video_image_options')
        .insert(imageOptions);

      console.log(`[Image Gen] ✅ 4 images generated for scene ${scene.order_index}`);

    } catch (error) {
      console.error(`[Image Gen] Error for scene ${scene.order_index}:`, error);
    }
  }
}

/**
 * GET /api/video/project/:projectId
 * Get project details with scenes and image options
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('video_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // Get scenes with image options
    const { data: scenes, error: scenesError } = await supabase
      .from('video_scenes')
      .select(`
        *,
        image_options:video_image_options(*)
      `)
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (scenesError) throw scenesError;

    res.json({
      success: true,
      project: {
        ...project,
        scenes
      }
    });

  } catch (error) {
    console.error('[Video Generator] Get project error:', error);
    res.status(500).json({ 
      error: 'Failed to get project',
      message: error.message
    });
  }
});

/**
 * POST /api/video/select-image
 * User selects an image for a scene
 */
router.post('/select-image', async (req, res) => {
  try {
    const { sceneId, imageOptionId } = req.body;

    if (!sceneId || !imageOptionId) {
      return res.status(400).json({ error: 'Missing sceneId or imageOptionId' });
    }

    // Deselect all images for this scene
    await supabase
      .from('video_image_options')
      .update({ is_selected: false })
      .eq('scene_id', sceneId);

    // Select the chosen image
    const { data: selectedImage, error: selectError } = await supabase
      .from('video_image_options')
      .update({ is_selected: true })
      .eq('id', imageOptionId)
      .select()
      .single();

    if (selectError) throw selectError;

    // Update scene with selected image URL
    await supabase
      .from('video_scenes')
      .update({ selected_image_url: selectedImage.url })
      .eq('id', sceneId);

    res.json({
      success: true,
      message: 'Image selected successfully'
    });

  } catch (error) {
    console.error('[Video Generator] Select image error:', error);
    res.status(500).json({ 
      error: 'Failed to select image',
      message: error.message
    });
  }
});

module.exports = router;

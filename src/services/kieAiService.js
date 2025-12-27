/**
 * KIE.AI API Service
 * Handles Flux Kontext (Image Generation) and Veo (Image-to-Video Animation)
 * API Documentation: https://kie.ai/docs
 */

const KIE_API_KEY = process.env.REACT_APP_KIE_API_KEY;
const KIE_BASE_URL = 'https://api.kie.ai/v1';

/**
 * Generate images using Flux Kontext
 * @param {string} prompt - Image generation prompt
 * @param {number} count - Number of variations (default: 4)
 * @returns {Promise<string[]>} Array of image URLs
 */
export async function generateFluxImages(prompt, count = 4) {
  try {
    console.log(`[KIE.AI] Generating ${count} images with Flux Kontext...`);
    
    const response = await fetch(`${KIE_BASE_URL}/flux-kontext`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        num_images: count,
        aspect_ratio: '16:9',
        output_format: 'jpeg',
        safety_tolerance: 2
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Flux Kontext API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    
    // KIE.AI returns { images: [{ url: "..." }, ...] }
    const imageUrls = data.images.map(img => img.url);
    
    console.log(`[KIE.AI] ✅ Generated ${imageUrls.length} images`);
    return imageUrls;
    
  } catch (error) {
    console.error('[KIE.AI] Flux Kontext error:', error);
    throw error;
  }
}

/**
 * Animate image to video using Veo model
 * @param {string} imageUrl - URL of the image to animate
 * @param {string} prompt - Animation prompt (optional)
 * @param {number} duration - Video duration in seconds (5 or 10)
 * @returns {Promise<string>} Video URL
 */
export async function animateImageWithVeo(imageUrl, prompt = '', duration = 5) {
  try {
    console.log(`[KIE.AI] Animating image with Veo (${duration}s)...`);
    
    // Step 1: Submit animation job
    const submitResponse = await fetch(`${KIE_BASE_URL}/veo/animate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: prompt || 'Smooth cinematic camera movement',
        duration_seconds: duration,
        aspect_ratio: '16:9'
      })
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.json();
      throw new Error(`Veo API error: ${error.message || submitResponse.statusText}`);
    }

    const submitData = await submitResponse.json();
    const taskId = submitData.task_id;
    
    console.log(`[KIE.AI] Veo task submitted: ${taskId}`);
    
    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5s intervals)
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`${KIE_BASE_URL}/veo/status/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${KIE_API_KEY}`
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error('Failed to check Veo task status');
      }
      
      const statusData = await statusResponse.json();
      
      if (statusData.status === 'completed') {
        console.log(`[KIE.AI] ✅ Veo animation complete`);
        return statusData.video_url;
      } else if (statusData.status === 'failed') {
        throw new Error(`Veo animation failed: ${statusData.error}`);
      }
      
      attempts++;
      console.log(`[KIE.AI] Veo status: ${statusData.status} (${attempts}/${maxAttempts})`);
    }
    
    throw new Error('Veo animation timeout - exceeded 5 minutes');
    
  } catch (error) {
    console.error('[KIE.AI] Veo animation error:', error);
    throw error;
  }
}

/**
 * Generate music using Suno API (already implemented)
 * @param {string} prompt - Music generation prompt
 * @returns {Promise<string>} Audio URL
 */
export async function generateMusic(prompt) {
  try {
    console.log('[KIE.AI] Generating music with Suno...');
    
    const response = await fetch(`${KIE_BASE_URL}/suno/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        make_instrumental: false,
        wait_audio: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Suno API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('[KIE.AI] ✅ Music generated');
    
    return data.audio_url;
    
  } catch (error) {
    console.error('[KIE.AI] Suno error:', error);
    throw error;
  }
}

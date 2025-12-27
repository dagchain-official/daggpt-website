/**
 * Content Generation Engine
 * Generates viral-worthy social media content based on competitor insights
 */

const GROK_API_KEY = process.env.GROK_API_KEY || process.env.REACT_APP_GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

class ContentGenerationEngine {
  /**
   * Generate 4-week content calendar
   */
  async generate4WeekCalendar(brandAnalysis, contentStrategy, competitorReport) {
    try {
      console.log('📅 Generating 4-week content calendar...');

      const prompt = `You are a social media content creator. Generate a 4-week content calendar (28 days) with viral-worthy posts.

BRAND:
${JSON.stringify(brandAnalysis, null, 2)}

CONTENT STRATEGY:
${JSON.stringify(contentStrategy, null, 2)}

COMPETITOR INSIGHTS:
${JSON.stringify(competitorReport.market_insights, null, 2)}

REQUIREMENTS:
1. Create 28 days of content (4 weeks)
2. Each day should have content for: Instagram, Facebook, Twitter/X, TikTok
3. Mix content types: educational, promotional, entertaining, inspirational
4. Include trending topics and viral hooks
5. Optimize for each platform's best practices
6. Include hashtags, captions, and visual descriptions

Return ONLY a valid JSON array of 28 posts:
[
  {
    "day": 1,
    "date": "2024-01-01",
    "content_type": "educational|promotional|entertaining|inspirational",
    "theme": "Main theme of the post",
    "platforms": {
      "instagram": {
        "caption": "Instagram caption with emojis",
        "hashtags": ["#hashtag1", "#hashtag2"],
        "visual_description": "Detailed description for image generation",
        "cta": "Call to action"
      },
      "facebook": {
        "post": "Facebook post text",
        "visual_description": "Image description",
        "cta": "Call to action"
      },
      "twitter": {
        "tweet": "Twitter/X post (max 280 chars)",
        "hashtags": ["#hashtag1", "#hashtag2"],
        "visual_description": "Image description"
      },
      "tiktok": {
        "caption": "TikTok caption",
        "video_concept": "Video idea description",
        "hashtags": ["#hashtag1", "#hashtag2"],
        "hook": "Attention-grabbing opening"
      }
    }
  }
]

Make content engaging, authentic, and optimized for virality!`;

      const response = await fetch(GROK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'grok-2-1212',
          messages: [
            {
              role: 'system',
              content: 'You are a viral content creator. Always return valid JSON only, no markdown or explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.9,
          max_tokens: 16000
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }

      const calendar = JSON.parse(jsonMatch[0]);
      console.log('✅ Generated', calendar.length, 'days of content');
      
      return calendar;
    } catch (error) {
      console.error('❌ Calendar generation error:', error);
      throw error;
    }
  }

  /**
   * Generate static image post using Nano Banana Pro
   */
  async generateStaticPost(visualDescription, platform, brandColors) {
    try {
      console.log(`🎨 Generating ${platform} static post with Nano Banana Pro...`);

      const KIE_API_KEY = process.env.KIE_API_KEY || process.env.REACT_APP_KIE_API_KEY;
      
      // Enhance prompt for professional UGC-style ads
      const enhancedPrompt = `Professional ${platform} social media post: ${visualDescription}. 
Style: Modern, clean, eye-catching. 
Brand colors: ${brandColors?.join(', ') || 'vibrant and professional'}.
High quality, professional photography, perfect composition, trending aesthetic.
${platform === 'instagram' ? 'Square 1:1 ratio, Instagram-optimized' : ''}
${platform === 'facebook' ? 'Landscape format, Facebook-optimized' : ''}
${platform === 'twitter' ? '16:9 ratio, Twitter-optimized' : ''}
${platform === 'tiktok' ? 'Vertical 9:16 ratio, TikTok-optimized' : ''}`;

      // Determine aspect ratio
      let aspectRatio = '1:1';
      if (platform === 'tiktok') aspectRatio = '9:16';
      else if (platform === 'twitter' || platform === 'facebook') aspectRatio = '16:9';

      const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIE_API_KEY}`
        },
        body: JSON.stringify({
          model: 'nano-banana-pro',
          input: {
            prompt: enhancedPrompt,
            aspect_ratio: aspectRatio,
            resolution: '1K',
            output_format: 'png'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Nano Banana Pro API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.task_id || data.id) {
        const taskId = data.task_id || data.id;
        // Poll for completion
        const imageUrl = await this.pollKIETaskCompletion(taskId);
        console.log('✅ Static post generated with Nano Banana Pro');
        return imageUrl;
      }

      throw new Error('No task_id returned from Nano Banana Pro API');
    } catch (error) {
      console.error('❌ Static post generation error:', error);
      throw error;
    }
  }

  /**
   * Generate video post using Sora 2 Pro
   */
  async generateVideoPost(videoConcept, platform, brandColors, referenceImage = null) {
    try {
      console.log(`🎬 Generating ${platform} video post with Sora 2 Pro...`);

      const KIE_API_KEY = process.env.KIE_API_KEY || process.env.REACT_APP_KIE_API_KEY;
      
      // Determine aspect ratio
      let aspectRatio = 'landscape';
      if (platform === 'tiktok') aspectRatio = 'portrait';

      // Enhanced video prompt
      const enhancedPrompt = `${videoConcept}. Professional, cinematic quality, ${platform}-optimized. Brand colors: ${brandColors?.join(', ') || 'vibrant'}. High-quality production, engaging, viral-worthy content.`;

      let videoUrl;

      if (referenceImage) {
        // Image-to-Video using Sora 2 Pro
        console.log('🖼️ Using image-to-video with reference image...');
        
        const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${KIE_API_KEY}`
          },
          body: JSON.stringify({
            model: 'sora-2-pro-image-to-video',
            input: {
              image: referenceImage,
              aspect_ratio: aspectRatio,
              n_frames: '10',
              size: 'high',
              remove_watermark: true
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Sora 2 Image-to-Video API error: ${response.status}`);
        }

        const data = await response.json();
        const taskId = data.task_id || data.id;
        videoUrl = await this.pollKIETaskCompletion(taskId);

      } else {
        // Text-to-Video using Sora 2 Pro
        console.log('📝 Using text-to-video...');
        
        const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${KIE_API_KEY}`
          },
          body: JSON.stringify({
            model: 'sora-2-pro-text-to-video',
            input: {
              prompt: enhancedPrompt,
              aspect_ratio: aspectRatio,
              n_frames: '10',
              size: 'high',
              remove_watermark: true
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Sora 2 Text-to-Video API error: ${response.status}`);
        }

        const data = await response.json();
        const taskId = data.task_id || data.id;
        videoUrl = await this.pollKIETaskCompletion(taskId);
      }
      
      console.log('✅ Video post generated with Sora 2 Pro');
      return { videoUrl, referenceImage };
    } catch (error) {
      console.error('❌ Video post generation error:', error);
      throw error;
    }
  }

  /**
   * Poll KIE API task completion (updated for new job system)
   */
  async pollKIETaskCompletion(taskId, maxAttempts = 60) {
    const KIE_API_KEY = process.env.KIE_API_KEY || process.env.REACT_APP_KIE_API_KEY;
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const response = await fetch(`https://api.kie.ai/api/v1/jobs/getTask/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${KIE_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`Task status check failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Check for completion - handle different response formats
      if (data.status === 'completed' || data.status === 'success') {
        // Try different possible result locations
        const resultUrl = data.result?.url || 
                         data.result?.output_url || 
                         data.output?.url ||
                         data.url ||
                         (Array.isArray(data.result) ? data.result[0] : null);
        
        if (resultUrl) {
          return resultUrl;
        }
      } else if (data.status === 'failed' || data.status === 'error') {
        throw new Error('Task failed: ' + (data.error || data.message || 'Unknown error'));
      }
      
      // Continue polling
      console.log(`⏳ Task ${taskId} still processing... (${i + 1}/${maxAttempts}) - Status: ${data.status || 'unknown'}`);
    }

    throw new Error('Task timeout - took too long to complete');
  }
}

module.exports = new ContentGenerationEngine();

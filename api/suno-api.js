/**
 * Vercel Serverless Function: Consolidated Suno AI Music API
 * Handles: generate, status, download
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get action from query or body
  let action = req.query.action;
  let taskId = req.query.taskId;
  
  // For POST requests, also check body
  if (req.method === 'POST' && req.body) {
    action = action || req.body.action;
  }

  console.log('🎵 Suno API called:', { method: req.method, action, taskId, query: req.query, hasBody: !!req.body });

  try {
    const kieApiKey = process.env.KIE_API_KEY || process.env.REACT_APP_KIE_API_KEY;

    if (!kieApiKey) {
      console.error('❌ KIE API key not found');
      return res.status(500).json({ error: 'KIE API key not configured' });
    }

    // GENERATE MUSIC
    if (action === 'generate' && req.method === 'POST') {
      console.log('🎵 Generate music request received');
      const {
        prompt,
        customMode = false,
        instrumental = false,
        model = 'V4_5',
        style,
        title,
        negativeTags,
        callBackUrl = 'https://example.com/callback'
      } = req.body;

      console.log('🎵 Generating music with Suno AI...');

      const requestBody = {
        prompt,
        customMode,
        instrumental,
        model,
        callBackUrl
      };

      if (customMode) {
        if (!style || !title) {
          return res.status(400).json({ error: 'Custom mode requires style and title' });
        }
        requestBody.style = style;
        requestBody.title = title;
      }

      if (negativeTags) {
        requestBody.negativeTags = negativeTags;
      }

      const response = await fetch('https://api.kie.ai/api/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${kieApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Suno API error (${response.status}):`, errorText);
        return res.status(response.status).json({ 
          error: `Suno API error: ${response.status}`,
          details: errorText 
        });
      }

      const result = await response.json();
      
      if (result.code !== 200) {
        console.error('❌ Suno API returned error:', result.msg);
        return res.status(400).json({ error: result.msg || 'Music generation failed' });
      }

      console.log('✅ Music generation started, taskId:', result.data.taskId);
      return res.status(200).json({ taskId: result.data.taskId });
    }

    // CHECK STATUS
    if (action === 'status' && req.method === 'GET') {
      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      console.log('🔍 Checking Suno task status:', taskId);

      const response = await fetch(`https://api.kie.ai/api/v1/generate/record-info?taskId=${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${kieApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Suno status API error (${response.status}):`, errorText);
        return res.status(response.status).json({ 
          error: `Suno API error: ${response.status}`,
          details: errorText 
        });
      }

      const result = await response.json();
      
      if (result.code !== 200) {
        console.error('❌ Suno API returned error:', result.msg);
        return res.status(400).json({ error: result.msg || 'Status check failed' });
      }

      return res.status(200).json(result.data);
    }

    // DOWNLOAD WITH COVER ART
    if (action === 'download' && req.method === 'GET') {
      const { url, coverArt, title, artist, album } = req.query;
      
      if (!url) {
        return res.status(400).json({ error: 'Audio URL is required' });
      }

      console.log('🔽 Downloading audio with metadata:', { title, artist, coverArt: !!coverArt });

      // Fetch the audio file
      const audioResponse = await fetch(url);
      
      if (!audioResponse.ok) {
        console.error(`❌ Audio download failed (${audioResponse.status})`);
        return res.status(audioResponse.status).json({ error: 'Failed to fetch audio file' });
      }

      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

      // If cover art is provided, try to add ID3 tags
      if (coverArt) {
        try {
          // Dynamic import for node-id3
          const NodeID3 = await import('node-id3').then(m => m.default || m);
          
          // Fetch cover art image
          console.log('🖼️ Fetching cover art...');
          const imageResponse = await fetch(coverArt);
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

          // Create ID3 tags
          const tags = {
            title: title || 'Untitled',
            artist: artist || 'Suno AI',
            album: album || 'AI Generated Music',
            image: {
              mime: 'image/jpeg',
              type: {
                id: 3,
                name: 'front cover'
              },
              description: 'Cover Art',
              imageBuffer: imageBuffer
            }
          };

          console.log('🏷️ Adding ID3 tags with cover art...');
          const taggedBuffer = NodeID3.write(tags, audioBuffer);
          
          // Set headers for download
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Disposition', `attachment; filename="${(title || 'song').replace(/[^a-z0-9]/gi, '_')}.mp3"`);
          res.setHeader('Content-Length', taggedBuffer.length);
          
          res.send(taggedBuffer);
          console.log('✅ Download with cover art completed!');
          return;
          
        } catch (id3Error) {
          console.error('⚠️ ID3 tagging failed, sending without tags:', id3Error.message);
          
          // Fallback: send without tags
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Disposition', `attachment; filename="${(title || 'song').replace(/[^a-z0-9]/gi, '_')}.mp3"`);
          res.send(audioBuffer);
          return;
        }
      } else {
        // No cover art, send as-is
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${(title || 'song').replace(/[^a-z0-9]/gi, '_')}.mp3"`);
        res.send(audioBuffer);
        console.log('✅ Download completed (no cover art)');
        return;
      }
    }

    console.error('❌ Invalid action or method:', { action, method: req.method });
    return res.status(400).json({ 
      error: 'Invalid action or method',
      received: { action, method: req.method },
      expected: 'action=generate|status|download with appropriate method'
    });

  } catch (error) {
    console.error('❌ Suno API error:', error);
    return res.status(500).json({ error: error.message || 'Request failed' });
  }
}

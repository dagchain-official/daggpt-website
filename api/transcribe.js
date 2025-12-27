// Vercel Serverless Function for OpenAI Whisper Transcription
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
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
    const { audioData } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    // Convert base64 to buffer
    const base64Data = audioData.split(',')[1];
    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Create multipart form data manually
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36);
    const formDataParts = [];
    
    // Add file part
    formDataParts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="audio.webm"\r\n` +
      `Content-Type: audio/webm\r\n\r\n`
    );
    formDataParts.push(audioBuffer);
    formDataParts.push('\r\n');
    
    // Add model part
    formDataParts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="model"\r\n\r\n` +
      `whisper-1\r\n`
    );
    
    // Add language part
    formDataParts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="language"\r\n\r\n` +
      `en\r\n`
    );
    
    // Close boundary
    formDataParts.push(`--${boundary}--\r\n`);

    // Combine all parts
    const formDataBuffer = Buffer.concat([
      Buffer.from(formDataParts[0]),
      formDataParts[1],
      Buffer.from(formDataParts[2]),
      Buffer.from(formDataParts[3]),
      Buffer.from(formDataParts[4]),
      Buffer.from(formDataParts[5]),
    ]);

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: formDataBuffer,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Whisper API error:', error);
      return res.status(response.status).json({ 
        error: 'Transcription failed',
        details: error 
      });
    }

    const result = await response.json();
    
    return res.status(200).json({
      success: true,
      text: result.text,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

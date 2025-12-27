/**
 * Consolidated API Proxy
 * Handles: Claude, Freepik, Video proxying
 */

export default async function handler(req, res) {
  // Enable CORS
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { service } = req.query;

  try {
    // CLAUDE PROXY
    if (service === 'claude' && req.method === 'POST') {
      const apiKey = process.env.REACT_APP_CLAUDE_API_KEY || process.env.CLAUDE_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: 'Claude API key not configured' });
      }

      const { messages, system, model, max_tokens, temperature, stream } = req.body;

      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-sonnet-4-5',
          max_tokens: max_tokens || 8000,
          temperature: temperature || 0.7,
          system,
          messages,
          stream: stream || false
        })
      });

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        return res.status(claudeResponse.status).json({
          error: `Claude API error: ${claudeResponse.status}`,
          details: errorText
        });
      }

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = claudeResponse.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(decoder.decode(value));
        }

        res.end();
      } else {
        const data = await claudeResponse.json();
        return res.status(200).json(data);
      }
    }

    // VIDEO PROXY
    else if (service === 'video' && req.method === 'GET') {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const response = await fetch(url);
      const buffer = await response.arrayBuffer();

      res.setHeader('Content-Type', response.headers.get('content-type') || 'video/mp4');
      res.setHeader('Content-Length', buffer.byteLength);
      res.send(Buffer.from(buffer));
    }

    else {
      return res.status(400).json({ error: 'Invalid service or method' });
    }

  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * TEMPORARY IMAGE SERVER
 * Serves base64 images as public HTTP URLs
 * Images are stored in memory temporarily
 */

// In-memory storage for temporary images (will be cleared on serverless restart)
const imageStore = new Map();

// Cleanup old images after 10 minutes
const EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST: Store image and return URL
  if (req.method === 'POST') {
    try {
      const { base64Image } = req.body;

      if (!base64Image) {
        return res.status(400).json({ error: 'base64Image is required' });
      }

      // Generate unique ID
      const imageId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);

      // Store image with expiry timestamp
      imageStore.set(imageId, {
        data: base64Image,
        createdAt: Date.now()
      });

      // Generate public URL
      const publicUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/serve-temp-image?id=${imageId}`;

      console.log('✅ Image stored with ID:', imageId);

      return res.status(200).json({
        success: true,
        url: publicUrl,
        imageId: imageId,
        expiresIn: EXPIRY_TIME
      });

    } catch (error) {
      console.error('❌ Error storing image:', error);
      return res.status(500).json({
        error: error.message
      });
    }
  }

  // GET: Retrieve and serve image
  if (req.method === 'GET') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Image ID is required' });
      }

      const imageData = imageStore.get(id);

      if (!imageData) {
        return res.status(404).json({ error: 'Image not found or expired' });
      }

      // Check if expired
      if (Date.now() - imageData.createdAt > EXPIRY_TIME) {
        imageStore.delete(id);
        return res.status(404).json({ error: 'Image expired' });
      }

      // Extract base64 data
      let base64Data = imageData.data;
      let mimeType = 'image/png';

      // Parse data URL if present
      if (base64Data.startsWith('data:')) {
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Set headers
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', imageBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=600'); // Cache for 10 minutes

      // Send image
      return res.status(200).send(imageBuffer);

    } catch (error) {
      console.error('❌ Error serving image:', error);
      return res.status(500).json({
        error: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

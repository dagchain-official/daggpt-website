/**
 * Website Builder Service
 * Uses Gemini 2.0 Flash for generating complete, production-ready websites
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate a complete website using Gemini 2.0 Flash
 * @param {string} prompt - User's website description
 * @param {function} onUpdate - Callback for streaming updates
 * @returns {Promise<Object>} - Generated website HTML and metadata
 */
export const generateWebsite = async (prompt, onUpdate) => {
  try {
    onUpdate({ type: 'status', content: '🎨 Initializing Gemini 2.0 Flash...' });

    const systemPrompt = `You are an expert web developer and UI/UX designer. Generate a complete, production-ready, single-page website based on the user's request.

REQUIREMENTS:
1. Generate a COMPLETE HTML file with inline CSS and JavaScript
2. Use modern, beautiful design with excellent UX
3. Make it fully responsive (mobile, tablet, desktop)
4. Include proper semantic HTML5
5. Use modern CSS (Flexbox, Grid, animations, gradients)
6. Add smooth interactions and micro-animations
7. Include high-quality images using Unsplash URLs (MANDATORY):
   - ALWAYS use format: https://source.unsplash.com/[width]x[height]/?[keywords]
   - Example for hero: https://source.unsplash.com/1920x1080/?coffee,cafe,interior
   - Example for cards: https://source.unsplash.com/800x600/?coffee,beans,cup
   - Choose relevant keywords based on the website theme
   - Use different keywords for variety (coffee,barista,espresso,latte,etc)
   - EVERY image tag MUST have a working Unsplash URL
8. Make it visually stunning and professional
9. Add proper meta tags and favicon
10. Include comments in the code

STYLE GUIDELINES:
- Use a cohesive color scheme that matches the theme
- Add subtle shadows, gradients, and transitions
- Include hover effects and smooth animations
- Use modern fonts (Google Fonts via CDN)
- Add icons (Font Awesome CDN or inline SVG)
- Make it look like a premium, modern website
- Ensure images have proper alt text for accessibility

OUTPUT FORMAT:
Return ONLY the complete HTML code, nothing else. No explanations, no markdown code blocks, just pure HTML starting with <!DOCTYPE html>.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;
    
    onUpdate({ type: 'status', content: '💻 Generating website code...' });
    
    const result = await model.generateContentStream(fullPrompt);
    
    let fullHtml = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullHtml += chunkText;
      
      onUpdate({ 
        type: 'code', 
        content: fullHtml,
        partial: true 
      });
    }
    
    // Clean up markdown code blocks if present
    let cleanHtml = fullHtml.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
    
    onUpdate({ type: 'status', content: '✅ Website generated successfully!' });
    
    return {
      success: true,
      html: cleanHtml,
      prompt: prompt,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Website generation error:', error);
    onUpdate({ 
      type: 'error', 
      content: `Failed to generate website: ${error.message}` 
    });
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Download generated HTML as a file
 * @param {string} html - HTML content
 * @param {string} filename - File name
 */
export const downloadHTML = (html, filename = 'website.html') => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Extract title from HTML
 * @param {string} html - HTML content
 * @returns {string} - Page title
 */
export const extractTitle = (html) => {
  const match = html.match(/<title>(.*?)<\/title>/i);
  return match ? match[1] : 'Generated Website';
};

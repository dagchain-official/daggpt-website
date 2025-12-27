/**
 * Claude Sonnet 4.5 Website Generation Service
 * Uses Vercel serverless function with streaming
 */

/**
 * Generate website code using Claude Sonnet 4.5 with streaming
 */
export const generateWebsiteWithClaude = async (prompt, onProgress = null) => {
  try {
    // Use Vercel serverless function to avoid CORS issues
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? '/api/generate-website'
      : 'http://localhost:3001/api/generate-website';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        mode: 'create'
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullHtml = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.type === 'progress') {
              fullHtml += parsed.content;
              if (onProgress) {
                onProgress({ type: 'progress', length: parsed.length });
              }
            } else if (parsed.type === 'complete') {
              // Check if it's a multi-file project
              if (parsed.files && Array.isArray(parsed.files)) {
                return {
                  success: true,
                  files: parsed.files,
                  preview: parsed.preview,
                  model: parsed.model,
                  isMultiFile: true
                };
              } else {
                return {
                  success: true,
                  html: parsed.html,
                  model: parsed.model,
                  isMultiFile: false
                };
              }
            } else if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            if (e.message && !e.message.includes('Unexpected')) {
              throw e;
            }
            // Skip JSON parse errors
          }
        }
      }
    }

    // Fallback if streaming completes without explicit complete message
    if (fullHtml) {
      return {
        success: true,
        html: fullHtml,
        model: 'claude-sonnet-4-5'
      };
    }

    throw new Error('No content received from API');

  } catch (error) {
    console.error('Claude website generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Clone an existing website from URL with streaming
 */
export const cloneWebsiteFromUrl = async (url, onProgress = null) => {
  try {
    // Use Vercel serverless function to avoid CORS issues
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? '/api/generate-website'
      : 'http://localhost:3001/api/generate-website';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'clone',
        url: url
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullHtml = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.type === 'progress') {
              fullHtml += parsed.content;
              if (onProgress) {
                onProgress({ type: 'progress', length: parsed.length });
              }
            } else if (parsed.type === 'complete') {
              return {
                success: true,
                html: parsed.html,
                sourceUrl: url,
                model: parsed.model
              };
            } else if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            if (e.message && !e.message.includes('Unexpected')) {
              throw e;
            }
          }
        }
      }
    }

    if (fullHtml) {
      return {
        success: true,
        html: fullHtml,
        sourceUrl: url,
        model: 'claude-sonnet-4-5'
      };
    }

    throw new Error('No content received from API');

  } catch (error) {
    console.error('Website cloning error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Download all files as a zip
 */
export const downloadAllFiles = async (files, projectName = 'website') => {
  try {
    console.log('[Download] Files object:', files);
    console.log('[Download] Files keys:', Object.keys(files));
    
    // Check if files object is empty
    if (!files || Object.keys(files).length === 0) {
      throw new Error('No files to download');
    }
    
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Add all files to zip
    let fileCount = 0;
    for (const [path, content] of Object.entries(files)) {
      if (content && typeof content === 'string') {
        console.log(`[Download] Adding file: ${path} (${content.length} bytes)`);
        zip.file(path, content);
        fileCount++;
      } else {
        console.warn(`[Download] Skipping invalid file: ${path}`, typeof content);
      }
    }
    
    console.log(`[Download] Total files added: ${fileCount}`);
    
    if (fileCount === 0) {
      throw new Error('No valid files found to download');
    }
    
    // Generate zip file
    const blob = await zip.generateAsync({ type: 'blob' });
    console.log(`[Download] ZIP blob size: ${blob.size} bytes`);
    
    // Download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return { success: true, fileCount };
  } catch (error) {
    console.error('Download failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Refine existing website with Claude
 */
export const refineWebsite = async (files, userRequest, onProgress) => {
  try {
    onProgress({ type: 'stage', content: 'Refining with Claude' });
    onProgress({ type: 'log', content: '🔄 Analyzing current website...' });
    
    const currentHtml = files['index.html'] || Object.values(files)[0];
    
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? '/api/generate-website'
      : 'http://localhost:3001/api/generate-website';

    const refinementPrompt = `Current website code:\n\n${currentHtml}\n\nUser request: ${userRequest}\n\nPlease modify the website according to the user's request. Return the complete updated HTML code.`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: refinementPrompt,
        mode: 'create'
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let htmlCode = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.type === 'progress') {
              htmlCode += parsed.content;
              onProgress({ type: 'log', content: '📝 Updating code...' });
            } else if (parsed.type === 'complete') {
              htmlCode = parsed.html || htmlCode;
              break;
            }
          } catch (e) {
            // Skip parse errors
          }
        }
      }
    }

    htmlCode = htmlCode.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
    
    onProgress({ type: 'log', content: '✅ Refinement complete!' });
    
    return {
      success: true,
      files: {
        'index.html': htmlCode,
        'README.md': files['README.md'] || '# Website'
      }
    };
  } catch (error) {
    console.error('Refinement error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

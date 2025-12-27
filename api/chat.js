/**
 * Vercel Serverless Function for AI Chat
 * Handles chat requests with support for multiple AI models and file uploads
 */

const fetch = require('node-fetch');
const pdfParse = require('pdf-parse');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Set up streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { messages, model = 'gemini', researchMode = false } = req.body;

  console.log('📨 Chat request received:', { 
    model, 
    researchMode, 
    messageCount: messages?.length,
    lastMessage: messages?.[messages.length - 1]?.content?.substring(0, 50)
  });

  // Log files in the last message
  const lastMsg = messages?.[messages.length - 1];
  if (lastMsg?.files) {
    console.log('📎 Files in message:', lastMsg.files.map(f => ({ 
      name: f.name, 
      type: f.type,
      dataLength: f.data?.length 
    })));
  }

  try {
    const userMessage = messages[messages.length - 1].content;
    let contextInfo = '';
    let sources = [];

    // If research mode, use Tavily to search the web
    if (researchMode) {
      console.log('🔍 Research mode: Searching web with Tavily...');
      
      const tavilyApiKey = process.env.TAVILY_API_KEY;
      console.log('Tavily API key present:', !!tavilyApiKey);
      
      if (tavilyApiKey) {
        try {
          const { tavily } = await import('@tavily/core');
          const tvly = tavily({ apiKey: tavilyApiKey });
          
          const searchResults = await tvly.search(userMessage, {
            searchDepth: 'advanced',
            maxResults: 5
          });

          if (searchResults.results && searchResults.results.length > 0) {
            contextInfo = '\n\nWeb Search Results:\n';
            sources = searchResults.results.map(result => ({
              title: result.title,
              url: result.url,
              content: result.content
            }));

            searchResults.results.forEach((result, index) => {
              contextInfo += `\n[${index + 1}] ${result.title}\nURL: ${result.url}\n${result.content}\n`;
            });

            res.write(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`);
          }
        } catch (tavilyError) {
          console.error('Tavily search error:', tavilyError);
        }
      } else {
        console.log('⚠️ Tavily API key not configured');
      }
    }

    // Prepare messages for AI (with async processing for PDFs)
    console.log('🔄 Processing', messages.length, 'messages for AI...');
    messages.forEach((m, idx) => {
      console.log(`Message ${idx}:`, { 
        role: m.role, 
        contentLength: m.content?.length, 
        hasFiles: !!m.files,
        filesCount: m.files?.length 
      });
    });

    const aiMessages = await Promise.all(messages.map(async (m, idx) => {
      // Check if message has files (images or PDFs)
      if (m.files && m.files.length > 0) {
        console.log(`📎 Processing files in message ${idx}:`, m.files.map(f => ({ name: f.name, type: f.type })));
        const imageFiles = m.files.filter(f => f.type.startsWith('image/'));
        const pdfFiles = m.files.filter(f => 
          f.type === 'application/pdf' || 
          f.type === 'application/x-pdf' || 
          f.name.toLowerCase().endsWith('.pdf')
        );
        console.log('📄 PDF files found:', pdfFiles.length);
        
        // Extract text from PDFs
        let pdfText = '';
        if (pdfFiles.length > 0) {
          console.log(`📄 Processing ${pdfFiles.length} PDF file(s)...`);
          for (const pdfFile of pdfFiles) {
            try {
              console.log(`📄 Extracting text from: ${pdfFile.name}`);
              // Convert base64 to buffer
              const base64Data = pdfFile.data.split(',')[1];
              const buffer = Buffer.from(base64Data, 'base64');
              console.log(`📄 Buffer size: ${buffer.length} bytes`);
              const data = await pdfParse(buffer);
              console.log(`✅ Extracted ${data.text.length} characters from PDF`);
              pdfText += `\n\n[Content from ${pdfFile.name}]:\n${data.text}\n`;
            } catch (error) {
              console.error('❌ Error parsing PDF:', error.message);
              pdfText += `\n\n[Could not read PDF: ${pdfFile.name} - Error: ${error.message}]\n`;
            }
          }
          console.log(`📄 Total PDF text length: ${pdfText.length} characters`);
        }
        
        if (imageFiles.length > 0 && model === 'claude') {
          // Claude format for vision
          const content = [];
          
          // Add images first
          imageFiles.forEach(file => {
            const base64Data = file.data.split(',')[1]; // Remove data:image/...;base64, prefix
            const mediaType = file.type;
            content.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data
              }
            });
          });
          
          // Add text (including PDF text if any)
          if (m.content || pdfText) {
            content.push({
              type: 'text',
              text: (m.content || '') + pdfText
            });
          }
          
          return {
            role: m.role,
            content: content
          };
        } else if (pdfText) {
          // Only PDF, no images
          return {
            role: m.role,
            content: (m.content || '') + pdfText
          };
        }
      }
      
      // Default text-only message
      return {
        role: m.role,
        content: m.content || ''
      };
    }));

    // Add context from research if available
    if (contextInfo) {
      const lastMessage = aiMessages[aiMessages.length - 1];
      if (typeof lastMessage.content === 'string') {
        lastMessage.content += contextInfo + '\n\nBased on the above search results, please provide a comprehensive answer with citations.';
      } else if (Array.isArray(lastMessage.content)) {
        // Find text content and append
        const textContent = lastMessage.content.find(c => c.type === 'text');
        if (textContent) {
          textContent.text += contextInfo + '\n\nBased on the above search results, please provide a comprehensive answer with citations.';
        }
      }
    }

    // Call appropriate AI model
    console.log(`🤖 Calling ${model} with ${aiMessages.length} messages...`);
    
    if (model === 'gemini') {
      const geminiApiKey = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
      console.log('Gemini API key present:', !!geminiApiKey);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: aiMessages.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            }))
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', response.status, errorText);
        
        // Send error to client
        let errorMsg = `Gemini API error (${response.status})`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            errorMsg = errorJson.error.message;
          }
          if (errorText.includes('quota') || errorText.includes('Quota')) {
            errorMsg = 'Gemini API quota exceeded. Please try Claude or OpenAI, or wait 24 hours for quota reset.';
          }
        } catch (e) {}
        
        res.write(`data: ${JSON.stringify({ type: 'error', error: errorMsg })}\n\n`);
        res.end();
        return;
      }

      const reader = response.body;
      let buffer = '';

      for await (const chunk of reader) {
        const text = chunk.toString();
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') || line.startsWith('[{')) {
            try {
              const jsonStr = line.startsWith('data: ') ? line.slice(6) : line;
              const data = JSON.parse(jsonStr);
              
              if (data.candidates && data.candidates[0]?.content?.parts) {
                const textPart = data.candidates[0].content.parts.find(p => p.text);
                if (textPart) {
                  res.write(`data: ${JSON.stringify({ type: 'content', content: textPart.text })}\n\n`);
                }
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();

    } else if (model === 'openai' || model === 'gpt-4') {
      const openaiApiKey = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
      console.log('OpenAI API key present:', !!openaiApiKey);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: aiMessages,
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API error:', response.status, errorText);
        
        // Send error to client
        let errorMsg = `OpenAI API error (${response.status})`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            errorMsg = errorJson.error.message;
          }
          if (errorJson.error?.code === 'billing_not_active') {
            errorMsg = 'OpenAI billing not active. Please add a payment method at https://platform.openai.com/account/billing';
          }
        } catch (e) {}
        
        res.write(`data: ${JSON.stringify({ type: 'error', error: errorMsg })}\n\n`);
        res.end();
        return;
      }

      const reader = response.body;
      let buffer = '';

      for await (const chunk of reader) {
        const text = chunk.toString();
        buffer += text;
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                res.write(`data: ${JSON.stringify({ type: 'content', content })}\n\n`);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();

    } else if (model === 'claude') {
      const claudeApiKey = process.env.CLAUDE_API_KEY || process.env.REACT_APP_CLAUDE_API_KEY;
      console.log('Claude API key present:', !!claudeApiKey);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          stream: true,
          messages: aiMessages.filter(m => m.role !== 'system')
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Claude API error:', response.status, errorText);
        
        // Send error to client
        let errorMsg = `Claude API error (${response.status})`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            errorMsg = errorJson.error.message;
          }
        } catch (e) {}
        
        res.write(`data: ${JSON.stringify({ type: 'error', error: errorMsg })}\n\n`);
        res.end();
        return;
      }

      let buffer = '';
      let chunkCount = 0;

      for await (const chunk of response.body) {
        chunkCount++;
        const text = chunk.toString();
        buffer += text;
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                console.log(`📤 Sending chunk ${chunkCount}:`, data.delta.text.substring(0, 30));
                res.write(`data: ${JSON.stringify({ type: 'content', content: data.delta.text })}\n\n`);
              }
            } catch (e) {
              console.log('⚠️ JSON parse error:', e.message);
            }
          }
        }
      }
      
      console.log(`✅ Streaming complete. Total chunks: ${chunkCount}`);
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
};

/**
 * Local Development Server for API Functions
 * Simulates Vercel serverless functions locally
 */

const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const pdfParse = require('pdf-parse');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();
const { premiumTemplates } = require('./design-templates');

/**
 * Download CSS content from URL
 */
const downloadCSS = async (cssUrl) => {
  try {
    const response = await axios.get(cssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.log(`Failed to download CSS from ${cssUrl}:`, error.message);
    return null;
  }
};

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * Clone website using Puppeteer (handles dynamic content, loaders, and JavaScript)
 */
const cloneWebsiteWithScraper = async (url) => {
  let browser;
  try {
    console.log('🚀 Cloning website with Puppeteer:', url);
    
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📡 Loading page...');
    
    // Navigate to the page and wait for network to be idle
    await page.goto(url, {
      waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
      timeout: 90000 // 90 seconds
    });
    
    // Wait extra time after page load
    console.log('⏳ Waiting for initial page load...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('⏳ Waiting for dynamic content...');
    
    // Wait for any loaders to disappear (common loader selectors)
    try {
      await page.waitForFunction(() => {
        const loaders = document.querySelectorAll('.loader, .loading, .spinner, [class*="load"], [class*="spinner"], [class*="preload"]');
        return loaders.length === 0 || Array.from(loaders).every(l => l.style.display === 'none' || !l.offsetParent);
      }, { timeout: 15000 });
      console.log('✅ Loaders removed');
    } catch (e) {
      console.log('⚠️ No loaders found or timeout - continuing...');
    }
    
    // Wait for main content to appear (look for common content elements)
    console.log('⏳ Waiting for main content...');
    // Extract text content
    const bodyText = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style, noscript');
      scripts.forEach(script => script.remove());
      
      return document.body.innerText || document.body.textContent || '';
    });

    // Get main headings
    const headings = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim()).filter(Boolean);
      const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim()).filter(Boolean);
      return [...h1s, ...h2s].slice(0, 10);
    });

    // Extract product images
    console.log('Extracting product images...');
    const productImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      
      return images
        .map(img => {
          const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
          const alt = img.alt || '';
          const width = img.naturalWidth || img.width || 0;
          const height = img.naturalHeight || img.height || 0;
          
          return {
            src,
            alt,
            width,
            height,
            isProduct: alt.toLowerCase().includes('product') || 
                      alt.toLowerCase().includes('item') ||
                      src.toLowerCase().includes('product') ||
                      src.toLowerCase().includes('item') ||
                      (width > 200 && height > 200), // Likely product images are larger
            isHero: img.closest('hero, .hero, [class*="hero"], [class*="banner"], .banner') !== null,
            isLogo: alt.toLowerCase().includes('logo') || 
                   src.toLowerCase().includes('logo') ||
                   (width < 200 && height < 100), // Likely logos are smaller
          };
        })
        .filter(img => 
          img.src && 
          !img.src.startsWith('data:') && 
          !img.isLogo &&
          img.width > 100 && 
          img.height > 100 &&
          !img.src.includes('icon') &&
          !img.src.includes('avatar')
        )
        .sort((a, b) => {
          // Prioritize product images, then hero images, then by size
          if (a.isProduct && !b.isProduct) return -1;
          if (!a.isProduct && b.isProduct) return 1;
          if (a.isHero && !b.isHero) return -1;
          if (!a.isHero && b.isHero) return 1;
          return (b.width * b.height) - (a.width * a.height);
        })
        .slice(0, 10); // Get top 10 product images
    });

    console.log(`Found ${productImages.length} potential product images`);

    
    // Multiple scroll passes to trigger ALL lazy loading
    console.log('📜 Pass 1: Scrolling page slowly...');
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 50;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 150);
      });
    });
    
    console.log('⏳ Waiting for lazy content (Pass 1)...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Scroll to bottom and wait
    console.log('📜 Jumping to bottom...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Scroll back to top
    console.log('📜 Jumping to top...');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Second pass - slower and with pauses
    console.log('📜 Pass 2: Scrolling with pauses...');
    await page.evaluate(async () => {
      const sections = Math.ceil(document.body.scrollHeight / 500);
      for (let i = 0; i < sections; i++) {
        window.scrollTo(0, i * 500);
        await new Promise(r => setTimeout(r, 500)); // Pause at each section
      }
    });
    
    console.log('⏳ Waiting for lazy content (Pass 2)...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Third pass - trigger intersection observers
    console.log('📜 Pass 3: Triggering intersection observers...');
    await page.evaluate(async () => {
      // Get all elements that might have lazy loading
      const elements = document.querySelectorAll('[loading="lazy"], [data-src], [data-lazy], .lazy, [class*="lazy"]');
      
      // Scroll each element into view
      for (const elem of elements) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 300));
      }
    });
    
    console.log('⏳ Waiting for lazy content (Pass 3)...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Fourth pass - specifically target footer and bottom sections
    console.log('📜 Pass 4: Targeting footer and bottom sections...');
    await page.evaluate(async () => {
      // Find footer
      const footer = document.querySelector('footer, [class*="footer"], [id*="footer"]');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        await new Promise(r => setTimeout(r, 3000));
      }
      
      // Find all sections and scroll to each
      const sections = document.querySelectorAll('section, [class*="section"]');
      for (const section of sections) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 500));
      }
    });
    
    console.log('⏳ Waiting for footer content...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Final scroll back to top
    console.log('📜 Final scroll to top...');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Wait extra time for animations and videos to load
    console.log('⏳ Waiting for animations and media...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Wait for any React/Vue/Angular to fully render
    console.log('⏳ Waiting for framework rendering...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Trigger mouse movements to activate hover effects
    console.log('🖱️ Simulating mouse movements...');
    await page.evaluate(async () => {
      const sections = document.querySelectorAll('section, div[class*="section"], article');
      for (const section of sections) {
        // Dispatch mouse events
        section.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        section.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        await new Promise(r => setTimeout(r, 100));
      }
    });
    
    // Wait for images to load
    console.log('🖼️ Waiting for images to load...');
    await page.evaluate(async () => {
      const images = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve);
            setTimeout(resolve, 5000); // Timeout after 5s
          });
        })
      );
    });
    
    // Wait for videos to load
    console.log('🎥 Waiting for videos to load...');
    await page.evaluate(async () => {
      const videos = Array.from(document.querySelectorAll('video'));
      await Promise.all(
        videos.map(video => {
          if (video.readyState >= 2) return Promise.resolve();
          return new Promise((resolve) => {
            video.addEventListener('loadeddata', resolve);
            video.addEventListener('error', resolve);
            setTimeout(resolve, 5000); // Timeout after 5s
          });
        })
      );
    });
    
    console.log('📄 Extracting HTML...');
    
    // Get the fully rendered HTML
    const htmlContent = await page.content();
    
    console.log('✨ HTML extracted successfully. Length:', htmlContent.length);
    
    // Parse with cheerio to make relative URLs absolute
    const $ = cheerio.load(htmlContent);
    
    // Remove CSP meta tags that might block content
    $('meta[http-equiv="Content-Security-Policy"]').remove();
    $('meta[http-equiv="X-Frame-Options"]').remove();
    
    // Add base tag to help with relative URLs
    if (!$('base').length) {
      $('head').prepend(`<base href="${url}">`);
    }
    
    // Download and inline all CSS files
    console.log('📥 Downloading and inlining CSS files...');
    const cssLinks = $('link[rel="stylesheet"]');
    let inlinedCount = 0;
    
    for (let i = 0; i < cssLinks.length; i++) {
      const link = $(cssLinks[i]);
      let href = link.attr('href');
      
      if (!href) continue;
      
      // Convert relative URL to absolute
      if (!href.startsWith('http') && !href.startsWith('//')) {
        try {
          href = new URL(href, url).href;
        } catch (e) {
          console.log('Failed to convert CSS URL:', href);
          continue;
        }
      } else if (href.startsWith('//')) {
        href = 'https:' + href;
      }
      
      // Download CSS content
      const cssContent = await downloadCSS(href);
      
      if (cssContent) {
        // Replace link tag with inline style
        link.replaceWith(`<style data-original-href="${href}">\n${cssContent}\n</style>`);
        inlinedCount++;
        console.log(`✅ Inlined CSS ${inlinedCount}: ${href.substring(0, 60)}...`);
      } else {
        console.log(`❌ Failed to inline CSS: ${href}`);
      }
    }
    
    console.log(`📦 Total CSS files inlined: ${inlinedCount}`);
    
    // Handle @import statements in existing style tags
    console.log('🔍 Processing @import statements...');
    const styleTags = $('style');
    for (let i = 0; i < styleTags.length; i++) {
      const styleTag = $(styleTags[i]);
      let styleContent = styleTag.html();
      
      if (styleContent && styleContent.includes('@import')) {
        // Extract @import URLs
        const importRegex = /@import\s+(?:url\()?['"]?([^'"\)]+)['"]?\)?;?/g;
        let match;
        
        while ((match = importRegex.exec(styleContent)) !== null) {
          let importUrl = match[1];
          
          // Convert to absolute URL
          if (!importUrl.startsWith('http') && !importUrl.startsWith('//')) {
            try {
              importUrl = new URL(importUrl, url).href;
            } catch (e) {
              continue;
            }
          } else if (importUrl.startsWith('//')) {
            importUrl = 'https:' + importUrl;
          }
          
          // Download and replace @import with actual CSS
          const importedCSS = await downloadCSS(importUrl);
          if (importedCSS) {
            styleContent = styleContent.replace(match[0], `/* Imported from ${importUrl} */\n${importedCSS}`);
            console.log(`✅ Resolved @import: ${importUrl.substring(0, 60)}...`);
          }
        }
        
        styleTag.html(styleContent);
      }
    }
    
    // Convert relative URLs to absolute
    $('img').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('//')) {
        try {
          $(elem).attr('src', new URL(src, url).href);
        } catch (e) {
          console.log('Failed to convert image URL:', src);
        }
      }
    });
    
    $('link[rel="stylesheet"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        try {
          $(elem).attr('href', new URL(href, url).href);
        } catch (e) {
          console.log('Failed to convert CSS URL:', href);
        }
      }
    });
    
    $('script').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src && !src.startsWith('http') && !src.startsWith('//')) {
        try {
          $(elem).attr('src', new URL(src, url).href);
        } catch (e) {
          console.log('Failed to convert script URL:', src);
        }
      }
    });
    
    // Handle protocol-relative URLs (//example.com/file.js)
    $('img, link, script').each((i, elem) => {
      ['src', 'href'].forEach(attr => {
        const val = $(elem).attr(attr);
        if (val && val.startsWith('//')) {
          $(elem).attr(attr, 'https:' + val);
        }
      });
    });
    
    // Remove any iframe busting scripts
    $('script').each((i, elem) => {
      const content = $(elem).html();
      if (content && (content.includes('top.location') || content.includes('frameElement'))) {
        $(elem).remove();
      }
    });
    
    const processedHtml = $.html();
    
    // Take a screenshot for reference BEFORE closing browser
    console.log('📸 Taking screenshot...');
    const screenshot = await page.screenshot({
      fullPage: true,
      type: 'png'
    });
    const screenshotBase64 = screenshot.toString('base64');
    
    await browser.close();
    
    console.log('🎉 Cloning complete!');
    console.log('📊 Final HTML length:', processedHtml.length);
    console.log('📝 First 500 chars:', processedHtml.substring(0, 500));
    
    // If HTML is too small, it might be a JS-heavy site
    if (processedHtml.length < 5000) {
      console.log('⚠️ WARNING: HTML is very small. This might be a heavily JavaScript-based site.');
      console.log('💡 Consider using the screenshot or trying a different approach.');
    }
    
    return {
      success: true,
      html: processedHtml,
      files: ['index.html'],
      screenshot: screenshotBase64,
      metadata: {
        url: url,
        capturedAt: new Date().toISOString(),
        htmlLength: processedHtml.length
      }
    };
    
  } catch (error) {
    console.error('❌ Website cloning error:', error.message);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
};

// Import the serverless function handler
const generateWebsiteHandler = async (req, res) => {
  // Enable CORS and streaming
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Website generation request received (streaming mode)');

  try {
    const { prompt, mode, url } = req.body;
    console.log('Mode:', mode, 'Prompt length:', prompt?.length, 'URL:', url);
    const apiKey = process.env.CLAUDE_API_KEY || process.env.REACT_APP_CLAUDE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Claude API key not configured' });
    }

    const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
    const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929'; // Claude Sonnet 4.5 - Latest version

    let systemPrompt, userPrompt;

    if (mode === 'clone') {
      console.log('Clone mode: Using website-scraper to clone', url);
      
      try {
        // Send progress update
        res.write(`data: ${JSON.stringify({ type: 'progress', content: 'Starting website clone...\n', length: 0 })}\n\n`);
        
        // Use website-scraper to clone the website
        const cloneResult = await cloneWebsiteWithScraper(url);
        
        if (cloneResult.success) {
          // Send complete message
          res.write(`data: ${JSON.stringify({ 
            type: 'complete', 
            html: cloneResult.html,
            model: 'wget-clone',
            sourceUrl: url
          })}\n\n`);
          res.end();
          return;
        } else {
          throw new Error('Failed to clone website with wget');
        }
      } catch (wgetError) {
        console.error('wget clone failed:', wgetError);
        res.write(`data: ${JSON.stringify({ error: `Clone failed: ${wgetError.message}` })}\n\n`);
        res.end();
        return;
      }
      
    } else {
      // Use premium template as base
      const baseTemplate = premiumTemplates.saas.html;
      
      systemPrompt = `You are customizing a PREMIUM website template. I'll provide you with a high-quality base template, and you need to customize it for the user's specific needs.

BASE TEMPLATE (DO NOT change the core structure, styles, or animations - only customize content):
${baseTemplate}

CUSTOMIZATION INSTRUCTIONS:
1. Keep ALL the CSS styles, animations, and design system intact
2. Update the heading text to match the user's prompt
3. Update the subheading/description to match the topic
4. Customize the feature cards (icons, titles, descriptions) to be relevant
5. Update pricing tiers if needed for the topic
6. Keep the gradient mesh background, glass cards, and premium buttons
7. Maintain the bento grid layout
8. Keep all hover effects and animations

CRITICAL: Return ONLY the customized HTML. End with </html> tag. NO explanations after!`;

      userPrompt = `Customize this premium template for: ${prompt}. Update the heading, description, features, and pricing to match the topic. Keep all the beautiful design, animations, and styles intact!`;
    }

    console.log('Calling Claude API with streaming...');

    // Call Claude API with streaming enabled
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout for local

    try {
      const claudeResponse = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 16000, // Increased for multi-file projects
          temperature: 0.7,
          stream: true,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      console.log('Claude API streaming response status:', claudeResponse.status);

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error('Claude API error:', errorText);
        res.write(`data: ${JSON.stringify({ error: `Claude API error: ${claudeResponse.status}` })}\n\n`);
        res.end();
        return;
      }

      // Stream the response
      let fullHtml = '';
      const reader = claudeResponse.body;
      let buffer = '';

      reader.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                fullHtml += parsed.delta.text;
                // Send progress update
                res.write(`data: ${JSON.stringify({ 
                  type: 'progress', 
                  content: parsed.delta.text,
                  length: fullHtml.length 
                })}\n\n`);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      });

      reader.on('end', () => {
        console.log('Streaming complete, total length:', fullHtml.length);
        
        // Clean up markdown code blocks
        let cleanedContent = fullHtml.trim();
        if (cleanedContent.startsWith('```json')) {
          cleanedContent = cleanedContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanedContent.startsWith('```html')) {
          cleanedContent = cleanedContent.replace(/^```html\n?/, '').replace(/\n?```$/, '');
        } else if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }
        
        // CRITICAL: Remove any text after closing </html> tag
        const htmlEndIndex = cleanedContent.lastIndexOf('</html>');
        if (htmlEndIndex !== -1) {
          cleanedContent = cleanedContent.substring(0, htmlEndIndex + 7); // +7 for '</html>'
          console.log('✂️ Cleaned up text after </html> tag');
        }
        
        // Try to parse as JSON for multi-file project
        let projectData;
        try {
          // Check if it looks like JSON
          if (cleanedContent.trim().startsWith('{') && cleanedContent.includes('"files"')) {
            projectData = JSON.parse(cleanedContent);
            if (projectData.files && Array.isArray(projectData.files) && projectData.files.length > 0) {
              // Validate we have the required files
              const requiredFiles = ['index.html', 'css/styles.css', 'js/main.js'];
              const filePaths = projectData.files.map(f => f.path);
              const hasRequiredFiles = requiredFiles.every(rf => filePaths.includes(rf));
              
              if (hasRequiredFiles && projectData.files.length >= 4) {
                // Multi-file project structure
                console.log('✅ Generated multi-file project with', projectData.files.length, 'files:', filePaths.join(', '));
                res.write(`data: ${JSON.stringify({
                  type: 'complete',
                  success: true,
                  files: projectData.files,
                  preview: projectData.preview || 'index.html',
                  model: CLAUDE_MODEL
                })}\n\n`);
                res.end();
                return;
              } else {
                console.log('⚠️ Incomplete project - only got:', filePaths.join(', '));
              }
            }
          }
          throw new Error('Not a valid multi-file project');
        } catch (e) {
          // Fallback to single HTML file
          console.log('⚠️ Fallback to single HTML file:', e.message);
          res.write(`data: ${JSON.stringify({
            type: 'complete',
            success: true,
            html: cleanedContent,
            model: CLAUDE_MODEL
          })}\n\n`);
          res.end();
        }
      });

      reader.on('error', (error) => {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      });

    } catch (fetchError) {
      clearTimeout(timeout);
      console.error('Streaming error:', fetchError);
      if (fetchError.name === 'AbortError') {
        res.write(`data: ${JSON.stringify({ error: 'Request timeout - please try a simpler prompt' })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ error: fetchError.message })}\n\n`);
      }
      res.end();
    }

  } catch (error) {
    console.error('Website generation error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
};

/**
 * AI Chat Handler with Tavily Research
 */
const chatHandler = async (req, res) => {
  // CORS headers for streaming
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
      
      if (tavilyApiKey && tavilyApiKey !== 'YOUR_TAVILY_API_KEY_HERE') {
        try {
          const tavilyResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              api_key: tavilyApiKey,
              query: userMessage,
              search_depth: 'advanced',
              max_results: 5
            })
          });

          const tavilyData = await tavilyResponse.json();
          
          if (tavilyData.results && tavilyData.results.length > 0) {
            sources = tavilyData.results.map(r => ({
              title: r.title,
              url: r.url,
              content: r.content
            }));

            contextInfo = '\n\nWeb Search Results:\n' + 
              tavilyData.results.map((r, i) => 
                `[${i + 1}] ${r.title}\n${r.content}\nSource: ${r.url}`
              ).join('\n\n');

            console.log(`✅ Found ${sources.length} sources`);
            
            // Send sources to client
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

      console.log('✅ Gemini API response received, streaming...');

      // For Node.js, response.body is a readable stream
      let buffer = '';
      let chunkCount = 0;
      
      for await (const chunk of response.body) {
        chunkCount++;
        const text = chunk.toString();
        buffer += text;
        
        // Process complete JSON objects
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.candidates && data.candidates[0]?.content?.parts) {
                const textContent = data.candidates[0].content.parts[0].text;
                if (textContent) {
                  console.log(`📤 Sending chunk ${chunkCount}:`, textContent.substring(0, 30));
                  res.write(`data: ${JSON.stringify({ type: 'content', content: textContent })}\n\n`);
                }
              }
            } catch (e) {
              console.log('⚠️ JSON parse error:', e.message);
            }
          }
        }
      }
      
      console.log(`✅ Streaming complete. Total chunks: ${chunkCount}`);
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

      console.log('✅ OpenAI API response received, streaming...');

      // For Node.js, response.body is a readable stream
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
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                console.log(`📤 Sending chunk ${chunkCount}:`, content.substring(0, 30));
                res.write(`data: ${JSON.stringify({ type: 'content', content })}\n\n`);
              }
            } catch (e) {
              console.log('⚠️ JSON parse error:', e.message);
            }
          }
        }
      }
      
      console.log(`✅ Streaming complete. Total chunks: ${chunkCount}`);
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

      console.log('✅ Claude API response received, streaming...');

      // For Node.js, response.body is a readable stream
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
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
};

// Social Media Automation - Create Campaign
app.post('/api/social-media-create-campaign', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Website URL is required' });
    }

    console.log('Fetching website:', url);
    const websiteResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!websiteResponse.ok) {
      throw new Error(`Failed to fetch website: ${websiteResponse.statusText}`);
    }

    const html = await websiteResponse.text();
    const $ = cheerio.load(html);
    
    const brandData = {
      url: url,
      title: $('title').text() || '',
      metaDescription: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '',
      bodyText: $('body').text().replace(/\s+/g, ' ').trim().slice(0, 15000),
      headings: [],
      productImages: []
    };

    $('h1, h2, h3').each((i, el) => {
      if (i < 10) {
        brandData.headings.push($(el).text().trim());
      }
    });

    // Extract product images using Cheerio with improved detection
    console.log('Extracting product images with Cheerio...');
    $('img').each((i, el) => {
      if (i < 30) { // Check more images
        const $img = $(el);
        // Check multiple possible src attributes
        const src = $img.attr('src') || 
                   $img.attr('data-src') || 
                   $img.attr('data-lazy-src') ||
                   $img.attr('data-srcset')?.split(',')[0]?.trim().split(' ')[0] ||
                   $img.attr('srcset')?.split(',')[0]?.trim().split(' ')[0];
        
        const alt = $img.attr('alt') || '';
        const width = parseInt($img.attr('width')) || 0;
        const height = parseInt($img.attr('height')) || 0;
        
        if (src && 
            !src.startsWith('data:') && 
            !alt.toLowerCase().includes('logo') &&
            !src.toLowerCase().includes('logo') &&
            !src.toLowerCase().includes('icon') &&
            !src.toLowerCase().includes('avatar') &&
            !src.toLowerCase().includes('sprite') &&
            src.length > 10) { // Valid URL
          
          // Make URL absolute
          let absoluteSrc = src;
          try {
            if (src.startsWith('//')) {
              absoluteSrc = `https:${src}`;
            } else if (src.startsWith('/')) {
              const urlObj = new URL(url);
              absoluteSrc = `${urlObj.protocol}//${urlObj.host}${src}`;
            } else if (!src.includes('://')) {
              absoluteSrc = new URL(src, url).href;
            }
            
            const isProduct = alt.toLowerCase().includes('product') || 
                             alt.toLowerCase().includes('item') ||
                             alt.toLowerCase().includes('buy') ||
                             src.toLowerCase().includes('product') ||
                             src.toLowerCase().includes('item') ||
                             (width > 200 && height > 200);
            
            brandData.productImages.push({
              src: absoluteSrc,
              alt,
              width,
              height,
              isProduct,
              priority: isProduct ? 1 : (width * height > 40000 ? 2 : 3)
            });
          } catch (e) {
            // Skip invalid URLs
          }
        }
      }
    });
    
    // Sort by priority and size
    brandData.productImages.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return (b.width * b.height) - (a.width * a.height);
    });
    
    console.log(`Found ${brandData.productImages.length} potential product images`);

    const brandContext = `Website URL: ${brandData.url}
Title: ${brandData.title}
Meta Description: ${brandData.metaDescription}
Main Headings: ${brandData.headings.join(', ')}

Page Content (truncated to 15000 chars):
${brandData.bodyText}`;

    const prompt = `You are a senior brand analyst and social media strategist. Analyze this website and create detailed brand identity + UGC content.

Input: ${brandContext}

Task: 
1) DETAILED BRAND ANALYSIS:
   - Brand name and industry
   - Primary products/services (list 3-5 main offerings)
   - Brand personality (5 key traits)
   - Visual style (colors, typography, imagery style)
   - Target audience demographics
   - Brand tone (3 words)
   - Core value proposition
   - Competitive advantages
   - Brand colors (if identifiable from content)
   - Product categories

2) UGC CONTENT STRATEGY:
   - 14-day content batch optimized for Instagram, Facebook, X, TikTok
   - Each post should be product-specific and brand-aligned

For each day produce a JSON object with:
{
  "day": number,
  "platformVariants": {
    "instagram": {
      "caption": "string",
      "hashtags": ["string"],
      "suggested_image_prompt": "string",
      "product_focus": "string",
      "visual_style": "string"
    },
    "facebook": {
      "post": "string"
    },
    "x": {
      "tweet": "string (max 280 chars)"
    },
    "tiktok": {
      "caption": "string",
      "video_prompt": "string",
      "sound_suggestion": "string"
    }
  },
  "call_to_action": "string",
  "suggested_post_time": "HH:MM (UTC)",
  "content_type": "image|video|carousel|reel",
  "mood": ["word1", "word2", "word3"],
  "brand_elements": ["element1", "element2"]
}

Return ONLY valid JSON object with keys: 
- brand_analysis (detailed brand identity object)
- posts (array of 14 items with enhanced product focus)`;

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Calling Gemini API...');
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8000,
          responseMimeType: "application/json"
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    const aiOutput = geminiData.candidates[0].content.parts[0].text;

    let campaignData;
    try {
      campaignData = JSON.parse(aiOutput);
    } catch (e) {
      const jsonMatch = aiOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          campaignData = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          throw new Error('Failed to parse AI response as JSON');
        }
      } else {
        throw new Error('No JSON found in AI response');
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Campaign created successfully with detailed brand analysis',
      brand_analysis: campaignData.brand_analysis,
      brand_profile: campaignData.brand_profile || campaignData.brand_analysis,
      posts: campaignData.posts,
      website_url: url,
      created_at: new Date().toISOString(),
      ai_model: 'Gemini 2.0 Flash',
      image_generation: 'Multi-Step Custom Generation'
    });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({
      error: 'Failed to create campaign',
      message: error.message
    });
  }
});

// Freepik Mystic Task Status Check
app.get('/api/freepik-mystic-status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const freepikApiKey = process.env.REACT_APP_FREEPIK_API_KEY;

    if (!freepikApiKey) {
      return res.status(500).json({ error: 'Freepik API key not configured' });
    }

    console.log('Checking Freepik Mystic task status:', taskId);

    const statusResponse = await fetch(`https://api.freepik.com/v1/ai/mystic/${taskId}`, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': freepikApiKey
      }
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('Freepik status check error:', errorText);
      return res.status(statusResponse.status).json({
        error: 'Failed to check status',
        message: errorText
      });
    }

    const statusData = await statusResponse.json();
    console.log('Freepik status response:', JSON.stringify(statusData, null, 2));

    return res.status(200).json(statusData);

  } catch (error) {
    console.error('Error checking Freepik status:', error);
    return res.status(500).json({
      error: 'Status check failed',
      message: error.message
    });
  }
});

// Social Media Automation - Multi-Platform UGC Advertisement Generation
app.post('/api/social-media-generate-image', async (req, res) => {
  try {
    const { prompt, caption, day, brandData, postData, platform = 'instagram' } = req.body;

    console.log('🎨🎨🎨 MULTI-PLATFORM ENDPOINT CALLED 🎨🎨🎨');
    console.log('Request body:', { prompt, caption, day, platform, hasBrandData: !!brandData });
    console.log('🎨 Starting Multi-Platform UGC Generation Process...');

    // STEP 1: Extract Brand Identity (if not provided)
    let brandAnalysis = brandData;
    if (!brandAnalysis) {
      console.log('Step 1: Extracting brand identity...');
      // This would be extracted from the campaign creation
      brandAnalysis = {
        brand_name: 'Sample Brand',
        industry: 'Technology',
        primary_colors: ['#4F46E5', '#10B981'],
        brand_tone: ['Professional', 'Innovative', 'Trustworthy'],
        visual_style: 'Modern minimalist',
        target_audience: 'Tech professionals'
      };
    }

    // STEP 2: Generate Authentic UGC Prompt with Expert Engineering
    console.log('Step 2: Creating authentic UGC prompt with expert engineering...');
    
    const productName = postData?.platformVariants?.instagram?.product_focus || brandAnalysis.brand_name || 'product';
    const brandTone = brandAnalysis.brand_tone?.join(', ') || 'authentic, friendly, relatable';
    const brandColors = brandAnalysis.primary_colors?.join(', ') || '#4F46E5, #10B981';
    
    // Advanced UGC Scenarios with Emotional Storytelling
    const ugcScenarios = [
      {
        scene: `unboxing ${productName} at kitchen table, eyes lighting up with genuine excitement, hands trembling slightly with anticipation, packaging scattered authentically`,
        emotion: 'pure excitement and anticipation',
        environment: 'warm kitchen lighting, morning coffee steam visible, natural home clutter'
      },
      {
        scene: `mid-action using ${productName}, captured in perfect moment of satisfaction, sweat glistening naturally, authentic achievement expression`,
        emotion: 'triumph and accomplishment',
        environment: 'golden hour outdoor lighting, dynamic movement blur, natural athletic setting'
      },
      {
        scene: `intimate moment with ${productName}, gentle smile of contentment, eyes closed in bliss, product held close to heart`,
        emotion: 'deep satisfaction and love',
        environment: 'soft bedroom lighting, cozy blankets, personal intimate space'
      },
      {
        scene: `sharing ${productName} discovery with camera, leaning in conspiratorially, genuine enthusiasm bubbling over, authentic recommendation energy`,
        emotion: 'infectious excitement and trust',
        environment: 'natural window light, living room background, casual friend-to-friend vibe'
      },
      {
        scene: `transformation moment with ${productName}, before-and-after realization dawning, authentic surprise and joy, life-changing moment captured`,
        emotion: 'amazement and transformation',
        environment: 'bathroom mirror selfie, natural lighting, honest reflection moment'
      },
      {
        scene: `daily ritual with ${productName}, peaceful morning routine, mindful appreciation, product integrated seamlessly into life`,
        emotion: 'calm satisfaction and routine joy',
        environment: 'soft morning light, bedside table, minimalist peaceful setting'
      },
      {
        scene: `comparison moment with ${productName}, honest review expression, thoughtful consideration, authentic decision-making process`,
        emotion: 'thoughtful evaluation and honesty',
        environment: 'kitchen counter setup, natural comparison layout, authentic review setup'
      }
    ];
    
    const selectedScenario = ugcScenarios[day % ugcScenarios.length];
    
    // Diverse Actor Profiles with Authentic Characteristics
    const actors = [
      {
        description: 'A 25-30-year-old woman with natural beauty, casual athleisure wear, minimal makeup showing real skin texture, authentic confident energy',
        style: 'effortless modern, relatable millennial aesthetic',
        personality: 'genuine, approachable, naturally charismatic'
      },
      {
        description: 'A 28-35-year-old man with authentic masculine energy, comfortable weekend clothing, natural facial hair, honest expression',
        style: 'casual professional, approachable dad-friend vibe',
        personality: 'trustworthy, down-to-earth, naturally enthusiastic'
      },
      {
        description: 'A 22-28-year-old person with youthful energy, trendy but accessible fashion, natural skin with slight imperfections, genuine smile',
        style: 'Gen-Z authentic, effortlessly cool but relatable',
        personality: 'energetic, honest, naturally expressive'
      },
      {
        description: 'A 30-35-year-old woman with warm maternal energy, cozy home clothes, natural hair, genuine nurturing smile',
        style: 'comfortable elegance, real-life mom aesthetic',
        personality: 'caring, authentic, naturally warm'
      },
      {
        description: 'A 26-32-year-old man with athletic build, post-workout glow, casual sports wear, natural confidence',
        style: 'active lifestyle, health-conscious, naturally fit',
        personality: 'motivated, genuine, naturally inspiring'
      }
    ];
    
    const selectedActor = actors[day % actors.length];
    
    // Select product images for this post
    const availableImages = brandAnalysis.productImages || [];
    const selectedProductImage = availableImages[day % Math.max(availableImages.length, 1)];
    
    console.log(`Selected product image for Day ${day}:`, selectedProductImage?.src || 'No product image available');
    
    // Platform-Specific Format Configurations (All 1:1 for consistency)
    const platformFormats = {
      instagram: {
        aspectRatio: '1:1',
        dimensions: '1080x1080',
        textLayout: 'bottom-third overlay with gradient fade',
        style: 'Instagram Post aesthetic'
      },
      facebook: {
        aspectRatio: '1:1', 
        dimensions: '1080x1080',
        textLayout: 'top-third bold headline with subtitle',
        style: 'Facebook post format'
      },
      twitter: {
        aspectRatio: '1:1',
        dimensions: '1080x1080',
        textLayout: 'centered overlay with clean typography',
        style: 'Twitter card optimized'
      },
      tiktok: {
        aspectRatio: '1:1',
        dimensions: '1080x1080', 
        textLayout: 'dynamic text placement with TikTok aesthetics',
        style: 'TikTok square format'
      }
    };
    
    const currentFormat = platformFormats[platform] || platformFormats.instagram;
    
    // Enhanced Text Layout Specifications
    const textLayouts = {
      instagram: {
        primary: 'Large bold sans-serif, 72-96px, bottom-left alignment',
        secondary: 'Medium weight, 36-48px, subtle opacity overlay',
        spacing: 'Generous padding (80px margins), breathing room',
        styling: 'Gradient text shadow, subtle glow effect'
      },
      facebook: {
        primary: 'Bold headline font, 64-84px, top-center placement',
        secondary: 'Clean subtitle, 32-42px, balanced spacing',
        spacing: 'Professional margins (60px), clean hierarchy',
        styling: 'High contrast, readable overlay background'
      },
      twitter: {
        primary: 'Punchy headline, 56-72px, centered impact',
        secondary: 'Supporting text, 28-36px, minimal design',
        spacing: 'Compact but readable (40px margins)',
        styling: 'Clean overlay, Twitter blue accents'
      },
      tiktok: {
        primary: 'Dynamic bold text, 84-108px, creative placement',
        secondary: 'Trendy font, 42-56px, Gen-Z aesthetic',
        spacing: 'Creative margins (varied), engaging layout',
        styling: 'Vibrant colors, TikTok-style text effects'
      }
    };
    
    const currentTextLayout = textLayouts[platform] || textLayouts.instagram;
    
    const enhancedPrompt = `Professional product photography for ${brandAnalysis.brand_name} ${productName}.

SCENE: Clean, modern product shot with ${selectedScenario.environment} background. Product prominently displayed, hero shot style.

COMPOSITION:
- ${currentFormat.aspectRatio} aspect ratio (${currentFormat.dimensions})
- Product centered or following rule of thirds
- Professional studio lighting with soft shadows
- Clean background with subtle brand colors (${brandColors})
- Product takes up 60-70% of frame
- Space for text overlays at top and bottom (leave clean areas)

PRODUCT PRESENTATION:
- ${productName} as the hero element
- Professional product photography style
- High-quality, detailed product rendering
- Brand colors subtly integrated in background
- Clean, uncluttered composition
- Premium, advertising-quality aesthetic

LIGHTING & QUALITY:
- Professional studio lighting, soft and even
- Subtle shadows for depth
- High resolution, crisp details
- Premium advertising quality
- Brand-appropriate mood and tone

CRITICAL REQUIREMENTS:
- NO TEXT on image (text will be added separately)
- NO watermarks or logos
- Clean space at top for headline text
- Clean space at bottom for CTA button
- Professional advertising quality
- Product-focused composition

LIGHTING (Natural & Authentic):
- ${selectedScenario.environment}
- Soft directional light, natural shadows with detail retention
- Warm color temperature (3200K-4000K), golden hour feel
- Avoid harsh contrasts, maintain skin tone authenticity
- Natural catchlight in eyes, authentic skin luminosity

TECHNICAL IMPERFECTIONS (Smartphone Realism):
- Slight motion blur on hands/product (1-2px)
- Natural lens distortion, subtle barrel effect
- Finger partially visible at frame edge (10-15% opacity)
- Authentic smartphone grain structure (ISO 200-800 equivalent)
- Slight overexposure on highlights, natural lens flare
- Real skin texture with pores, natural imperfections
- Authentic fabric wrinkles, natural hair movement

BRAND INTEGRATION (Authentic Product Integration):
- ACTUAL PRODUCT: Use this specific product image as reference: ${selectedProductImage?.src || 'No specific product image - use generic product representation'}
- PRODUCT DESCRIPTION: ${selectedProductImage?.alt || productName}
- ${productName} prominently featured but naturally integrated in real-world context
- Brand colors (${brandColors}) subtly in background elements
- Product packaging/logo visible but not dominating (20-30% visibility)
- Natural product placement showing actual product being used authentically
- Real product in hands/environment, not staged product photography
- Authentic usage context matching the actual product shown

EMOTIONAL AUTHENTICITY:
- Micro-expressions showing genuine ${selectedScenario.emotion}
- Natural body language, unstaged positioning
- Authentic eye contact or natural gaze direction
- Real human connection with product, not posed interaction
- Spontaneous gesture, captured mid-moment
- Natural breathing pattern visible in posture

UGC STORYTELLING:
- Visual narrative that supports "${caption}"
- Relatable human moment that viewers can connect with
- Authentic lifestyle integration, not product showcase
- Real person recommendation energy, friend-to-friend vibe
- Genuine discovery or satisfaction moment captured

OUTPUT SPECIFICATIONS:
- Photorealistic quality, 1080x1080px, high detail retention
- Natural color grading, authentic smartphone processing
- Film grain texture, authentic digital noise pattern
- No CGI artifacts, no artificial enhancement
- Social media ready, optimized for Instagram/Facebook

NEGATIVE PROMPTS (Critical Exclusions):
NO studio lighting, NO white background, NO mannequin poses, NO fake smiles, NO stock photography aesthetics, NO professional model poses, NO perfect makeup, NO artificial staging, NO text overlays, NO watermarks, NO competing brand logos, NO overly saturated colors, NO HDR processing, NO artificial bokeh, NO perfect symmetry, NO hashtags on image, NO text on image, NO captions on image, NO social media text overlays.

STYLE REFERENCE: Authentic UGC content, smartphone photography, candid social media post, real person genuine moment, viral TikTok/Instagram aesthetic, relatable human story, organic brand integration.`;

    // STEP 3: Generate Base Image Using Freepik AI
    console.log('Step 3: Generating base product image with Freepik AI...');
    const freepikApiKey = process.env.REACT_APP_FREEPIK_API_KEY;
    
    console.log('🔑 Freepik API Key available:', !!freepikApiKey);
    
    if (freepikApiKey) {
      try {
        console.log('🎨 Calling Freepik AI API with enhanced prompt...');
        console.log('📝 Prompt length:', enhancedPrompt.length, 'characters');
        
        // Simplify prompt for Freepik (max 1000 chars recommended)
        const simplifiedPrompt = enhancedPrompt.substring(0, 1000);
        
        const imageResponse = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-freepik-api-key': freepikApiKey
          },
          body: JSON.stringify({
            prompt: simplifiedPrompt,
            num_images: 1,
            image: {
              size: 'square_1_1'
            },
            styling: {
              style: 'photo',
              color: 'natural',
              lightning: 'natural'
            }
          })
        });

        console.log('📡 Freepik API Response Status:', imageResponse.status);
        
        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.error('❌ Freepik API error response:', errorText);
          throw new Error(`Freepik API error: ${imageResponse.status}`);
        }

        const imageData = await imageResponse.json();
        console.log('📦 Full Freepik response:', JSON.stringify(imageData, null, 2).substring(0, 500));
        
        // Freepik returns data as an array with base64 image
        let finalImageUrl = null;
        
        if (imageData.data && Array.isArray(imageData.data) && imageData.data.length > 0) {
          const imageItem = imageData.data[0];
          
          if (imageItem.base64) {
            // Convert base64 to data URL
            finalImageUrl = `data:image/jpeg;base64,${imageItem.base64}`;
            console.log('✅ Got base64 image from Freepik');
          } else if (imageItem.url) {
            finalImageUrl = imageItem.url;
            console.log('✅ Got URL from Freepik');
          }
        }
        
        if (finalImageUrl) {
          console.log('✅ Image generated immediately by Freepik AI');
          console.log('🖼️ Image URL:', finalImageUrl);
          
          return res.status(200).json({
            status: 'completed',
            image_url: finalImageUrl,
            base_image: finalImageUrl, // Clean image without text
            caption: caption, // For text overlay generation
            platform: platform, // Platform info
            message: 'Product image generated successfully with Freepik AI',
            steps_completed: [
              'Brand identity extracted from website analysis',
              'Clean product image generated',
              'Ready for text overlay processing'
            ],
            brand_analysis: brandAnalysis,
            enhanced_prompt: enhancedPrompt,
            ai_model: 'Freepik AI',
            needs_text_overlay: true // Flag to trigger text overlay on frontend
          });
        }
        
        const taskId = imageData.data?.id;
        
        if (taskId) {
          console.log(`✅ Image generation started with task ID: ${taskId}`);
          console.log('⏳ Polling for completion...');
          
          // Poll for completion
          let attempts = 0;
          const maxAttempts = 30;
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            
            const statusResponse = await fetch(`https://api.freepik.com/v1/ai/text-to-image/${taskId}`, {
              method: 'GET',
              headers: {
                'x-freepik-api-key': freepikApiKey
              }
            });
            
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              console.log(`🔄 Attempt ${attempts + 1}: Status = ${statusData.data?.status}`);
              
              // Check if image is ready - Freepik returns image array directly
              if (statusData.data?.image && Array.isArray(statusData.data.image) && statusData.data.image.length > 0) {
                const finalImageUrl = statusData.data.image[0].url || statusData.data.image[0].base64;
                console.log('✅ Step 3 completed: Image generated with Freepik AI');
                console.log('🖼️ Image URL:', finalImageUrl);
                
                return res.status(200).json({
                  status: 'completed',
                  image_url: finalImageUrl,
                  message: 'Authentic UGC advertisement created successfully with Freepik AI',
                  steps_completed: [
                    'Brand identity extracted from website analysis',
                    'Authentic UGC scenario and actor selected',
                    'Expert-engineered prompt with smartphone POV and imperfections',
                    'Photorealistic UGC image generated with Freepik AI'
                  ],
                  brand_analysis: brandAnalysis,
                  enhanced_prompt: enhancedPrompt,
                  ai_model: 'Freepik AI'
                });
              } else if (statusData.data?.status === 'error') {
                console.error('❌ Freepik generation failed:', statusData.data?.error);
                throw new Error('Freepik generation error');
              }
            }
            
            attempts++;
          }
          
          console.log('⏱️ Polling timeout - image may still be generating');
          throw new Error('Polling timeout');
        }
      } catch (error) {
        console.error('❌ Freepik AI generation failed:', error.message);
        console.error('❌ Full error:', error);
        console.log('⚠️ Falling back to placeholder...');
      }
    } else {
      console.log('⚠️ No Freepik API key found - using placeholder');
    }

    // FALLBACK: High-quality placeholder with brand context
    console.log('Using enhanced placeholder with brand context...');
    const brandPlaceholders = [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1080&h=1080&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1080&h=1080&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=1080&h=1080&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1080&h=1080&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1080&h=1080&fit=crop&crop=center'
    ];

    const selectedImage = brandPlaceholders[(day - 1) % brandPlaceholders.length];

    return res.status(200).json({
      status: 'completed',
      image_url: selectedImage,
      message: 'Authentic UGC process completed (using expert-engineered placeholder)',
      steps_completed: [
        'Brand identity analyzed from website',
        'Authentic UGC scenario and actor selected',
        'Expert-engineered prompt with smartphone POV created',
        'High-quality UGC-style placeholder selected'
      ],
      brand_analysis: brandAnalysis,
      enhanced_prompt: enhancedPrompt,
      next_steps: 'Gemini Imagen 4.0 integration ready - using placeholder until API access is confirmed'
    });

  } catch (error) {
    console.error('Error in multi-step UGC generation:', error);
    return res.status(500).json({
      error: 'Multi-step generation failed',
      message: error.message
    });
  }
});

// Image Generation - Freepik Flux Pro 1.1 (Clean images without mockups)
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = 'square_1_1' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const freepikApiKey = process.env.REACT_APP_FREEPIK_API_KEY;

    if (!freepikApiKey) {
      console.error('❌ Freepik API key not found');
      return res.status(500).json({ error: 'Freepik API key not configured' });
    }

    console.log('🎨 Starting Flux Pro 1.1 generation...');
    console.log('📝 Prompt:', prompt);

    // Step 1: Create the image generation task
    const imageResponse = await fetch('https://api.freepik.com/v1/ai/text-to-image/flux-pro-v1-1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': freepikApiKey
      },
      body: JSON.stringify({
        prompt: prompt,
        prompt_upsampling: false,
        aspect_ratio: aspectRatio,
        safety_tolerance: 2,
        output_format: 'jpeg'
      })
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error(`❌ Freepik Flux Pro 1.1 API error (${imageResponse.status}):`, errorText);
      return res.status(imageResponse.status).json({ 
        error: `Freepik API error: ${imageResponse.status}`,
        details: errorText 
      });
    }

    const taskData = await imageResponse.json();
    const taskId = taskData.data?.task_id;
    const status = taskData.data?.status;

    if (!taskId) {
      console.error('❌ No task ID received from Freepik');
      return res.status(500).json({ error: 'Failed to get task ID from Freepik' });
    }

    console.log('✅ Task created:', taskId, 'Status:', status);

    // Step 2: Poll for the result if not immediately completed
    let imageResult = taskData;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (imageResult.data?.status !== 'COMPLETED' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.freepik.com/v1/ai/text-to-image/flux-pro-v1-1/${taskId}`, {
        method: 'GET',
        headers: {
          'x-freepik-api-key': freepikApiKey
        }
      });
      
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error(`❌ Status check error (${statusResponse.status}):`, errorText);
        return res.status(statusResponse.status).json({ 
          error: `Failed to check task status: ${statusResponse.status}`,
          details: errorText
        });
      }
      
      imageResult = await statusResponse.json();
      console.log(`📊 Attempt ${attempts + 1}/${maxAttempts}: Status = ${imageResult.data?.status}`);
      
      if (imageResult.data?.status === 'FAILED') {
        return res.status(500).json({ error: 'Image generation failed' });
      }
      
      attempts++;
    }

    if (imageResult.data?.status !== 'COMPLETED') {
      return res.status(408).json({ error: 'Image generation timed out' });
    }

    console.log('✅ Image generation completed');
    
    const generatedImages = imageResult.data?.generated || [];
    
    if (generatedImages.length === 0) {
      console.error('❌ No images in response');
      return res.status(500).json({ error: 'No images generated' });
    }

    const imageUrl = generatedImages[0];
    console.log('✅ Image URL:', imageUrl);

    return res.status(200).json({
      success: true,
      image_url: imageUrl,
      images: generatedImages,
      prompt: prompt,
      model: 'freepik-flux-pro-1.1'
    });

  } catch (error) {
    console.error('❌ Image generation error:', error);
    return res.status(500).json({
      error: error.message || 'Image generation failed',
      details: error.toString()
    });
  }
});

// Suno Music API Endpoints
app.post('/api/suno/generate', async (req, res) => {
  try {
    const { prompt, customMode, instrumental, model, style, title, negativeTags } = req.body;
    const kieApiKey = process.env.KIE_API_KEY || process.env.REACT_APP_KIE_API_KEY;

    if (!kieApiKey) {
      return res.status(500).json({ error: 'KIE API key not configured' });
    }

    console.log('🎵 Generating music with Suno AI...');
    console.log('📝 Prompt:', prompt);
    console.log('🎼 Model:', model || 'V3_5');

    const response = await fetch('https://api.kie.ai/api/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        customMode: customMode || false,
        instrumental: instrumental || false,
        model: model || 'V3_5',
        style,
        title,
        negativeTags,
        callBackUrl: 'https://your-app.com/callback' // Placeholder callback URL
      })
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
      return res.status(400).json({ error: result.msg || 'Generation failed' });
    }

    console.log('✅ Task created:', result.data.taskId);
    return res.status(200).json({ taskId: result.data.taskId });

  } catch (error) {
    console.error('❌ Suno generate error:', error);
    return res.status(500).json({ error: error.message || 'Music generation failed' });
  }
});

app.post('/api/suno/extend', async (req, res) => {
  try {
    const { audioId, defaultParamFlag, model, prompt, style, title, continueAt } = req.body;
    const kieApiKey = process.env.KIE_API_KEY || process.env.REACT_APP_KIE_API_KEY;

    if (!kieApiKey) {
      return res.status(500).json({ error: 'KIE API key not configured' });
    }

    console.log('🎵 Extending music track...');
    console.log('🎼 Audio ID:', audioId);

    const response = await fetch('https://api.kie.ai/api/v1/generate/extend', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audioId,
        defaultParamFlag: defaultParamFlag || false,
        model: model || 'V3_5',
        prompt,
        style,
        title,
        continueAt,
        callBackUrl: 'https://your-app.com/callback' // Placeholder callback URL
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Suno extend API error (${response.status}):`, errorText);
      return res.status(response.status).json({ 
        error: `Suno API error: ${response.status}`,
        details: errorText 
      });
    }

    const result = await response.json();
    
    if (result.code !== 200) {
      console.error('❌ Suno API returned error:', result.msg);
      return res.status(400).json({ error: result.msg || 'Extension failed' });
    }

    console.log('✅ Extension task created:', result.data.taskId);
    return res.status(200).json({ taskId: result.data.taskId });

  } catch (error) {
    console.error('❌ Suno extend error:', error);
    return res.status(500).json({ error: error.message || 'Music extension failed' });
  }
});

app.post('/api/suno/lyrics', async (req, res) => {
  try {
    const { prompt } = req.body;
    const kieApiKey = process.env.KIE_API_KEY || process.env.REACT_APP_KIE_API_KEY;

    if (!kieApiKey) {
      return res.status(500).json({ error: 'KIE API key not configured' });
    }

    console.log('📝 Generating lyrics...');
    console.log('💭 Prompt:', prompt);

    const response = await fetch('https://api.kie.ai/api/v1/lyrics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        prompt,
        callBackUrl: 'https://your-app.com/callback' // Placeholder callback URL
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Suno lyrics API error (${response.status}):`, errorText);
      return res.status(response.status).json({ 
        error: `Suno API error: ${response.status}`,
        details: errorText 
      });
    }

    const result = await response.json();
    
    if (result.code !== 200) {
      console.error('❌ Suno API returned error:', result.msg);
      return res.status(400).json({ error: result.msg || 'Lyrics generation failed' });
    }

    console.log('✅ Lyrics task created:', result.data.taskId);
    return res.status(200).json({ taskId: result.data.taskId });

  } catch (error) {
    console.error('❌ Suno lyrics error:', error);
    return res.status(500).json({ error: error.message || 'Lyrics generation failed' });
  }
});

app.get('/api/suno/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const kieApiKey = process.env.KIE_API_KEY || process.env.REACT_APP_KIE_API_KEY;

    if (!kieApiKey) {
      return res.status(500).json({ error: 'KIE API key not configured' });
    }

    const response = await fetch(`https://api.kie.ai/api/v1/generate/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`
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

  } catch (error) {
    console.error('❌ Suno status check error:', error);
    return res.status(500).json({ error: error.message || 'Status check failed' });
  }
});

// Proxy endpoint for downloading audio files with embedded cover art
app.get('/api/suno/download', async (req, res) => {
  try {
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
        const NodeID3 = require('node-id3');
        
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
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Length', taggedBuffer.length);
        
        res.send(taggedBuffer);
        console.log('✅ Download with cover art completed!');
        
      } catch (id3Error) {
        console.error('⚠️ ID3 tagging failed, sending without tags:', id3Error.message);
        
        // Fallback: send without tags
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${(title || 'song').replace(/[^a-z0-9]/gi, '_')}.mp3"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(audioBuffer);
      }
    } else {
      // No cover art, send as-is
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${(title || 'song').replace(/[^a-z0-9]/gi, '_')}.mp3"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(audioBuffer);
      console.log('✅ Download completed (no cover art)');
    }

  } catch (error) {
    console.error('❌ Download proxy error:', error);
    return res.status(500).json({ error: error.message || 'Download failed' });
  }
});

app.post('/api/suno/boost-style', async (req, res) => {
  try {
    const { content } = req.body;
    const kieApiKey = process.env.KIE_API_KEY || process.env.REACT_APP_KIE_API_KEY;

    if (!kieApiKey) {
      return res.status(500).json({ error: 'KIE API key not configured' });
    }

    console.log('✨ Boosting music style...');
    console.log('🎨 Content:', content);

    const response = await fetch('https://api.kie.ai/api/v1/style/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Suno style boost API error (${response.status}):`, errorText);
      return res.status(response.status).json({ 
        error: `Suno API error: ${response.status}`,
        details: errorText 
      });
    }

    const result = await response.json();
    
    if (result.code !== 200) {
      console.error('❌ Suno API returned error:', result.msg);
      return res.status(400).json({ error: result.msg || 'Style boost failed' });
    }

    console.log('✅ Style boosted:', result.data.result);
    return res.status(200).json({ enhancedStyle: result.data.result });

  } catch (error) {
    console.error('❌ Suno style boost error:', error);
    return res.status(500).json({ error: error.message || 'Style boost failed' });
  }
});

// API Routes
app.post('/api/chat', chatHandler);
app.options('/api/chat', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});
app.post('/api/generate-website', generateWebsiteHandler);
app.options('/api/generate-website', (req, res) => {
  res.status(200).end();
});

// Web App Builder - Claude Streaming
app.post('/api/webapp/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { messages } = req.body;
    const apiKey = process.env.CLAUDE_API_KEY || process.env.REACT_APP_CLAUDE_API_KEY;

    if (!apiKey) {
      res.write(`data: ${JSON.stringify({ error: 'Claude API key not configured' })}\n\n`);
      res.end();
      return;
    }

    const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
    const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

    const systemPrompt = `You are Bolt, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.

<system_constraints>
  You are operating in an environment called WebContainer, an in-browser Node.js runtime that emulates a Linux system to some degree. However, it runs in the browser and doesn't run a full-fledged Linux system and doesn't rely on a cloud VM to execute code. All code is executed in the browser.

  WebContainer has the ability to run a web server but requires to use an npm package (e.g., Vite, servor, serve, http-server) or use the Node.js APIs to implement a web server.

  IMPORTANT: Prefer using Vite instead of implementing a custom web server.
  IMPORTANT: Git is NOT available.
  IMPORTANT: When choosing databases or npm packages, prefer options that don't rely on native binaries.
</system_constraints>

<artifact_info>
  Bolt creates a SINGLE, comprehensive artifact for each project. The artifact contains all necessary steps and components.

  Wrap the content in opening and closing \`<boltArtifact>\` tags with \`<boltAction>\` elements inside.

  For each \`<boltAction>\`, add a type attribute:
    - shell: For running shell commands
    - file: For writing files (add filePath attribute)

  Example:
  <boltArtifact id="todo-app" title="Todo App">
    <boltAction type="file" filePath="package.json">
    {
      "name": "todo-app",
      "scripts": { "dev": "vite" },
      "dependencies": { "react": "^18.2.0", "react-dom": "^18.2.0" },
      "devDependencies": { "vite": "^4.0.0", "@vitejs/plugin-react": "^3.0.0" }
    }
    </boltAction>
    <boltAction type="shell">
    npm install && npm run dev
    </boltAction>
  </boltArtifact>

  CRITICAL: Always provide FULL file contents. NO placeholders or "rest of code" comments.
</artifact_info>

ULTRA IMPORTANT: Think first and reply with the artifact that contains all necessary steps to set up the project.`;

    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8000,
        temperature: 0.7,
        stream: true,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      res.write(`data: ${JSON.stringify({ error: `Claude API error: ${claudeResponse.status}` })}\n\n`);
      res.end();
      return;
    }

    const reader = claudeResponse.body;
    let buffer = '';

    reader.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              res.write(`data: ${JSON.stringify({ chunk: parsed.delta.text })}\n\n`);
            } else if (parsed.type === 'message_stop') {
              res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              res.end();
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    });

    reader.on('end', () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    reader.on('error', (error) => {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Stream error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

app.options('/api/webapp/stream', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

// Video Generator Routes
const videoGeneratorRoutes = require('./server/routes/videoGenerator');
app.use('/api/video', videoGeneratorRoutes);

// Social Media Automation Pro - New comprehensive API
app.post('/api/social-media-automation', async (req, res) => {
  try {
    const socialMediaHandler = require('./api/social-media-automation');
    await socialMediaHandler(req, res);
  } catch (error) {
    console.error('Social Media Automation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Local API server running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Local API Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - http://localhost:${PORT}/api/generate-website`);
  console.log(`   - http://localhost:${PORT}/api/generate-image`);
  console.log(`   - http://localhost:${PORT}/api/suno/generate`);
  console.log(`   - http://localhost:${PORT}/api/suno/extend`);
  console.log(`   - http://localhost:${PORT}/api/suno/lyrics`);
  console.log(`   - http://localhost:${PORT}/api/suno/status/:taskId`);
  console.log(`   - http://localhost:${PORT}/api/social-media-create-campaign`);
  console.log(`   - http://localhost:${PORT}/api/social-media-generate-image`);
  console.log(`   - http://localhost:${PORT}/api/social-media-automation (NEW)`);
  console.log(`   - http://localhost:${PORT}/api/video/generate-script`);
  console.log(`   - http://localhost:${PORT}/api/video/project/:projectId`);
  console.log(`   - http://localhost:${PORT}/api/video/select-image`);
  console.log(`💡 Make sure your React app is running on http://localhost:3000\n`);
});

/**
 * Social Media Automation API - Self-Contained Version
 * All logic inline for Vercel serverless deployment
 * Using simple HTTP fetch instead of Puppeteer for Vercel compatibility
 */

// Use global fetch (available in Node 18+)
const fetch = global.fetch || require('node-fetch');

const GROK_API_KEY = process.env.GROK_API_KEY || process.env.REACT_APP_GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const KIE_API_KEY = process.env.KIE_API_KEY || process.env.REACT_APP_KIE_API_KEY;

/**
 * Analyze website and extract brand information
 * Using simple HTML parsing instead of Puppeteer for Vercel compatibility
 */
async function analyzeWebsite(url) {
  try {
    console.log('🌐 Analyzing website:', url);

    // Fetch the HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();

    // Simple regex-based extraction (works without DOM parser)
    const extractMeta = (property) => {
      const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
      const match = html.match(regex);
      return match ? match[1] : null;
    };

    const extractTitle = () => {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return match ? match[1].split('|')[0].trim() : null;
    };

    const extractLogo = () => {
      // Try multiple logo extraction methods
      const logoPatterns = [
        /<link[^>]*rel=["'](?:icon|apple-touch-icon|shortcut icon)["'][^>]*href=["']([^"']*)["']/i,
        /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i,
        /<img[^>]*(?:class|id)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']*)["']/i
      ];
      
      for (const pattern of logoPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          let logoUrl = match[1];
          // Convert relative URLs to absolute
          if (logoUrl.startsWith('/')) {
            const urlObj = new URL(url);
            logoUrl = `${urlObj.protocol}//${urlObj.host}${logoUrl}`;
          }
          return logoUrl;
        }
      }
      return null;
    };

    const brandName = extractMeta('og:site_name') || 
                     extractTitle() || 
                     'Unknown Brand';

    const description = extractMeta('description') || 
                       extractMeta('og:description') || 
                       '';

    const logoUrl = extractLogo();

    // Extract some basic info
    const brandData = {
      brand_name: brandName,
      description,
      logo_url: logoUrl,
      colors: ['#6366f1', '#8b5cf6', '#ec4899'], // Default colors
      products: [],
      images: []
    };

    const enhancementPrompt = `Analyze this brand and provide detailed insights:

Brand Name: ${brandData.brand_name}
Website: ${url}
Description: ${brandData.description}

Based on the brand name and description, provide:
1. Industry/Category (be specific - e.g., "Coffee & Beverages", "Athletic Footwear", "Technology Hardware")
2. Target Audience (detailed demographics and psychographics)
3. Brand Personality (3-5 adjectives that match the brand)
4. Key Products/Services (infer from brand name and description - list 3-5 main offerings)
5. Unique Value Proposition

Return ONLY valid JSON:
{
  "industry": "specific industry category",
  "target_audience": "detailed audience description",
  "brand_personality": ["adjective1", "adjective2", "adjective3"],
  "key_products": ["product1", "product2", "product3"],
  "value_proposition": "unique value proposition"
}`;

    const grokResponse = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [
          { role: 'system', content: 'You are a brand analyst. Return only valid JSON.' },
          { role: 'user', content: enhancementPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!grokResponse.ok) {
      console.error('Grok API error:', grokResponse.status, grokResponse.statusText);
      // Return basic analysis without AI enhancement
      return {
        ...brandData,
        industry: 'General',
        target_audience: 'General audience',
        brand_personality: ['modern', 'professional', 'innovative'],
        key_products: [],
        value_proposition: 'Quality products and services',
        analyzed_at: new Date().toISOString()
      };
    }

    const grokData = await grokResponse.json();
    
    let aiInsights;
    try {
      const content = grokData.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      aiInsights = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      aiInsights = {
        industry: 'General',
        target_audience: 'General audience',
        brand_personality: ['modern', 'professional'],
        key_products: [],
        value_proposition: 'Quality products and services'
      };
    }

    const fullAnalysis = {
      ...brandData,
      ...aiInsights,
      analyzed_at: new Date().toISOString()
    };

    console.log('✅ Website analysis complete');
    return fullAnalysis;

  } catch (error) {
    console.error('❌ Website analysis error:', error);
    // Return a basic analysis even if something fails
    return {
      brand_name: url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
      description: 'Brand analysis in progress',
      colors: ['#6366f1', '#8b5cf6', '#ec4899'],
      products: [],
      images: [],
      industry: 'General',
      target_audience: 'General audience',
      brand_personality: ['modern', 'professional'],
      key_products: [],
      value_proposition: 'Quality products and services',
      analyzed_at: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Find and analyze competitors
 */
async function findCompetitors(websiteUrl, brandAnalysis) {
  try {
    console.log('🔍 Finding competitors...');

    const prompt = `You are a market research expert. Analyze this brand and find their REAL, ACTUAL competitors.

BRAND INFORMATION:
- Website: ${websiteUrl}
- Brand Name: ${brandAnalysis.brand_name || 'Unknown'}
- Industry: ${brandAnalysis.industry || 'Unknown'}
- Products/Services: ${brandAnalysis.key_products?.join(', ') || 'Unknown'}
- Target Audience: ${brandAnalysis.target_audience || 'Unknown'}

CRITICAL REQUIREMENTS:
1. Identify 3-5 REAL, WELL-KNOWN competitors in the same industry
2. Use ACTUAL company names and real websites (e.g., if analyzing Starbucks, competitors should be Dunkin', Peet's Coffee, Costa Coffee, etc.)
3. For each competitor, provide:
   - Real company name (not generic "Competitor 1")
   - Actual website URL (real, existing websites like https://dunkindonuts.com)
   - Brief description of what they do
   - Market position (leader/challenger/niche)

DO NOT use placeholder names like "Competitor 1" or "Example Company". Use REAL brands only.

Return ONLY a valid JSON object:
{
  "competitors": [
    {
      "name": "Real Competitor Name",
      "website": "https://realcompetitor.com",
      "description": "What they actually do",
      "market_position": "leader|challenger|niche"
    }
  ],
  "market_insights": {
    "industry_trends": ["specific industry trend 1", "specific industry trend 2", "specific industry trend 3"],
    "opportunities": ["specific opportunity 1", "specific opportunity 2"]
  }
}`;

    console.log('🔑 GROK_API_KEY present:', !!GROK_API_KEY);
    console.log('🔑 GROK_API_KEY length:', GROK_API_KEY?.length);
    
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [
          { role: 'system', content: 'You are a market research expert. Always return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    console.log('📡 Grok API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Grok API error:', response.status, response.statusText);
      console.error('❌ Grok API error details:', errorText);
      
      // Return industry-appropriate fallback based on brand
      const industry = brandAnalysis.industry?.toLowerCase() || '';
      let fallbackCompetitors = [];
      
      if (industry.includes('coffee') || industry.includes('beverage')) {
        fallbackCompetitors = [
          { name: 'Dunkin Donuts', website: 'https://dunkindonuts.com', description: 'Coffee and donut chain', market_position: 'challenger' },
          { name: 'Peet\'s Coffee', website: 'https://peets.com', description: 'Premium coffee roaster', market_position: 'niche' },
          { name: 'Costa Coffee', website: 'https://costa.co.uk', description: 'British coffee chain', market_position: 'challenger' }
        ];
      } else {
        fallbackCompetitors = [
          { name: 'Industry Competitor A', website: 'https://example.com', description: 'Market leader in the industry', market_position: 'leader' },
          { name: 'Industry Competitor B', website: 'https://example2.com', description: 'Growing market challenger', market_position: 'challenger' }
        ];
      }
      
      return {
        competitors: fallbackCompetitors,
        market_insights: {
          industry_trends: ['Digital transformation', 'Customer experience focus', 'Sustainability initiatives'],
          opportunities: ['Market expansion', 'Innovation', 'Digital engagement']
        }
      };
    }

    const data = await response.json();
    console.log('📦 Grok API raw response:', JSON.stringify(data).substring(0, 500));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Unexpected Grok API response format:', data);
      throw new Error('Invalid Grok API response format');
    }
    
    const content = data.choices[0].message.content;
    console.log('📝 Grok content preview:', content.substring(0, 200));
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in Grok response');
      throw new Error('No JSON in Grok response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    console.log('✅ Found', result.competitors?.length || 0, 'competitors');
    
    // Fetch Meta ads for each competitor using Foreplay Spyder (fast, no timeout issues)
    console.log('📢 Fetching competitor Meta ads via Foreplay...');
    const competitorsWithAds = await Promise.all(
      result.competitors.map(async (competitor) => {
        try {
          const ads = await scrapeCompetitorMetaAds(competitor.name);
          return { ...competitor, meta_ads: ads };
        } catch (error) {
          console.error(`Failed to fetch ads for ${competitor.name}:`, error);
          return { ...competitor, meta_ads: [] };
        }
      })
    );
    
    return {
      competitors: competitorsWithAds,
      market_insights: result.market_insights
    };
  } catch (error) {
    console.error('❌ Competitor discovery error:', error);
    return {
      competitors: [],
      market_insights: { industry_trends: [], opportunities: [] }
    };
  }
}

/**
 * Fetch real competitor Meta ads using Foreplay Spyder API
 */
async function scrapeCompetitorMetaAds(competitorName) {
  try {
    console.log(`📢 Fetching real Meta ads for ${competitorName} via Foreplay Spyder...`);
    
    const FOREPLAY_API_KEY = process.env.FOREPLAY_API_KEY;
    
    if (!FOREPLAY_API_KEY) {
      console.error('❌ FOREPLAY_API_KEY not configured');
      return [];
    }

    // Search for ads using Foreplay Discovery API
    console.log('🔍 Searching for brand ads in Foreplay Discovery...');
    const searchResponse = await fetch(`https://public.api.foreplay.co/api/discovery/ads?search=${encodeURIComponent(competitorName)}&limit=5&offset=0`, {
      method: 'GET',
      headers: {
        'Authorization': FOREPLAY_API_KEY
      }
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('❌ Foreplay API error:', searchResponse.status, errorText);
      return [];
    }

    const responseData = await searchResponse.json();
    console.log('📊 Foreplay response:', JSON.stringify(responseData).substring(0, 500));
    
    if (!responseData || !responseData.data || responseData.data.length === 0) {
      console.log(`No ads found for ${competitorName}`);
      return [];
    }

    // Transform Foreplay response to our format
    const ads = responseData.data.slice(0, 5).map(ad => {
      // Extract transcription text
      const transcription = ad.full_transcription || '';
      
      return {
        headline: ad.headline || ad.name || `${competitorName} Ad`,
        description: transcription || ad.description || 'View ad details',
        cta: ad.cta_title || 'Learn More',
        target_audience: ad.persona || 'General audience',
        format: ad.display_format || (ad.video ? 'Video' : 'Image'),
        estimated_impressions: 'N/A',
        estimated_engagement: 'N/A',
        platform: ad.publisher_platform?.join(', ') || 'Facebook',
        ad_snapshot_url: ad.link_url || '#',
        page_name: competitorName,
        start_date: ad.started_running || 'N/A',
        end_date: ad.live ? 'Active' : 'Ended',
        image_url: ad.thumbnail || ad.image || ad.video || null,
        media_type: ad.video ? 'video' : 'image'
      };
    });

    console.log(`✅ Found ${ads.length} real ads for ${competitorName} via Foreplay`);
    return ads;
  } catch (error) {
    console.error(`❌ Error fetching Meta ads for ${competitorName}:`, error);
    return [];
  }
}

/**
 * Generate content strategy
 */
async function generateContentStrategy(brandAnalysis, competitorReport) {
  try {
    console.log('🎯 Generating content strategy...');

    const prompt = `You are a content strategist. Create a winning content strategy.

BRAND:
${JSON.stringify(brandAnalysis, null, 2)}

COMPETITOR INSIGHTS:
${JSON.stringify(competitorReport.market_insights, null, 2)}

Create a content strategy with:
1. Content pillars (3-4 main themes)
2. Posting schedule per platform
3. Content mix percentages
4. Visual guidelines

Return ONLY valid JSON:
{
  "content_pillars": [
    {
      "name": "Pillar Name",
      "description": "What this covers",
      "frequency": "daily|weekly",
      "platforms": ["instagram", "facebook", "twitter", "tiktok"]
    }
  ],
  "posting_schedule": {
    "instagram": {"frequency": "daily", "best_times": ["9:00 AM", "6:00 PM"]},
    "facebook": {"frequency": "daily", "best_times": ["12:00 PM", "7:00 PM"]},
    "twitter": {"frequency": "multiple_daily", "best_times": ["8:00 AM", "12:00 PM", "5:00 PM"]},
    "tiktok": {"frequency": "daily", "best_times": ["7:00 PM", "9:00 PM"]}
  },
  "content_mix": {
    "educational": 30,
    "promotional": 20,
    "entertaining": 25,
    "inspirational": 15,
    "user_generated": 10
  },
  "visual_guidelines": {
    "style": "modern|minimalist|bold|elegant",
    "color_palette": ["#color1", "#color2"],
    "imagery_type": "photography|illustrations|mixed"
  }
}`;

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [
          { role: 'system', content: 'You are a content strategist. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      console.error('Grok API error:', response.status);
      return getDefaultContentStrategy();
    }

    const data = await response.json();
    
    let result;
    try {
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultContentStrategy();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      result = getDefaultContentStrategy();
    }

    console.log('✅ Content strategy generated');
    return result;
  } catch (error) {
    console.error('❌ Strategy generation error:', error);
    return getDefaultContentStrategy();
  }
}

function getDefaultContentStrategy() {
  return {
    content_pillars: [
      {
        name: "Brand Story",
        description: "Share your brand's journey and values",
        frequency: "weekly",
        platforms: ["instagram", "facebook", "twitter", "tiktok"]
      },
      {
        name: "Product Showcase",
        description: "Highlight products and services",
        frequency: "daily",
        platforms: ["instagram", "facebook", "tiktok"]
      },
      {
        name: "Customer Success",
        description: "Share customer testimonials and stories",
        frequency: "weekly",
        platforms: ["instagram", "facebook", "twitter"]
      }
    ],
    posting_schedule: {
      instagram: { frequency: "daily", best_times: ["9:00 AM", "6:00 PM"] },
      facebook: { frequency: "daily", best_times: ["12:00 PM", "7:00 PM"] },
      twitter: { frequency: "multiple_daily", best_times: ["8:00 AM", "12:00 PM", "5:00 PM"] },
      tiktok: { frequency: "daily", best_times: ["7:00 PM", "9:00 PM"] }
    },
    content_mix: {
      educational: 30,
      promotional: 20,
      entertaining: 25,
      inspirational: 15,
      user_generated: 10
    },
    visual_guidelines: {
      style: "modern",
      color_palette: ["#6366f1", "#8b5cf6"],
      imagery_type: "photography"
    }
  };
}

/**
 * Generate 4-week content calendar
 */
async function generate4WeekCalendar(brandAnalysis, contentStrategy, competitorReport) {
  try {
    console.log('📅 Generating 4-week content calendar...');

    const prompt = `Generate a 4-week content calendar (28 days) for ${brandAnalysis.brand_name} in ${brandAnalysis.industry}.

Create 28 posts. Each post needs: day number, theme, and content for Instagram, Facebook, Twitter, TikTok.

Keep it concise. Return ONLY valid JSON array:
[
  {
    "day": 1,
    "content_type": "educational",
    "theme": "Brief theme",
    "platforms": {
      "instagram": {"caption": "Short caption", "hashtags": ["#tag1","#tag2"], "visual_description": "Brief image desc"},
      "facebook": {"post": "Short post", "visual_description": "Brief image desc"},
      "twitter": {"tweet": "Short tweet", "hashtags": ["#tag1"], "visual_description": "Brief image desc"},
      "tiktok": {"caption": "Short caption", "video_concept": "Brief video idea", "hashtags": ["#tag1"]}
    }
  }
]

Generate all 28 days now.`;

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [
          { role: 'system', content: 'You are a content creator. Return only valid JSON array. Be concise.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 12000
      })
    });

    if (!response.ok) {
      console.error('Grok API error:', response.status);
      return getDefaultCalendar(brandAnalysis.brand_name);
    }

    const data = await response.json();
    
    let calendar;
    try {
      const content = data.choices[0].message.content;
      console.log('📝 Raw Grok response preview:', content.substring(0, 500));
      
      // Extract JSON array
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('❌ No JSON array found in response');
        calendar = getDefaultCalendar(brandAnalysis.brand_name);
      } else {
        // Clean up common JSON issues from Grok
        let jsonStr = jsonMatch[0]
          .replace(/\\'/g, "'")  // Fix escaped single quotes
          .replace(/\\''/g, "'") // Fix double escaped quotes
          .replace(/\\"/g, '"')  // Fix escaped double quotes
          .replace(/\n/g, ' ')   // Remove newlines
          .replace(/\r/g, '');   // Remove carriage returns
        
        calendar = JSON.parse(jsonStr);
      }
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Failed JSON string:', parseError.message);
      calendar = getDefaultCalendar(brandAnalysis.brand_name);
    }

    console.log('✅ Generated', calendar.length, 'days of content');
    return calendar;
  } catch (error) {
    console.error('❌ Calendar generation error:', error);
    return getDefaultCalendar(brandAnalysis?.brand_name || 'Your Brand');
  }
}

function getDefaultCalendar(brandName) {
  const calendar = [];
  for (let day = 1; day <= 28; day++) {
    calendar.push({
      day,
      content_type: ['educational', 'promotional', 'entertaining', 'inspirational'][day % 4],
      theme: `Day ${day} - ${brandName} Content`,
      platforms: {
        instagram: {
          caption: `🌟 ${brandName} - Day ${day} post! Follow us for more amazing content. #${brandName.replace(/\s+/g, '')} #SocialMedia`,
          hashtags: [`#${brandName.replace(/\s+/g, '')}`, '#Business', '#Marketing'],
          visual_description: `Professional ${brandName} branded image with modern design, featuring the brand colors and logo`
        },
        facebook: {
          post: `Check out what's new at ${brandName}! Day ${day} of our content series.`,
          visual_description: `Engaging ${brandName} image with clear branding and call-to-action`
        },
        twitter: {
          tweet: `Day ${day}: ${brandName} bringing you quality content! 🚀 #${brandName.replace(/\s+/g, '')}`,
          hashtags: [`#${brandName.replace(/\s+/g, '')}`, '#Business'],
          visual_description: `Twitter-optimized ${brandName} image with bold text and brand colors`
        },
        tiktok: {
          caption: `Day ${day} at ${brandName}! 🎉 #${brandName.replace(/\s+/g, '')} #Trending`,
          video_concept: `Dynamic video showcasing ${brandName} products/services with trending music and effects`,
          hashtags: [`#${brandName.replace(/\s+/g, '')}`, '#Trending', '#FYP']
        }
      }
    });
  }
  return calendar;
}

/**
 * Generate static image with Nano Banana Pro
 */
async function generateStaticPost(visualDescription, platform, brandColors, brandName) {
  try {
    console.log(`🎨 Generating ${platform} static post with Nano Banana Pro...`);
    console.log('KIE_API_KEY present:', !!KIE_API_KEY);

    // Create professional ad-style prompt WITHOUT logo (we'll overlay the real logo later)
    const enhancedPrompt = `Professional advertising creative for ${brandName} on ${platform}: ${visualDescription}

REQUIREMENTS:
- Product/service as main focus with professional photography
- Bold, eye-catching headline text overlay
- Brand colors: ${brandColors?.join(', ') || 'brand-appropriate colors'}
- Clean, modern advertising layout with SPACE IN TOP-LEFT CORNER for logo placement
- Professional studio lighting and composition
- Match ${brandName}'s brand aesthetic and visual style

Style: High-end commercial advertisement for ${brandName}, magazine-quality, professional marketing material.
IMPORTANT: Leave top-left corner area clear and uncluttered for logo overlay. Do NOT generate any logo - focus on product and messaging.`;

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
      const errorText = await response.text();
      console.error('KIE API error:', response.status, errorText);
      throw new Error(`KIE API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('KIE API response:', data);
    
    // KIE API format: { code: 200, message: "success", data: { taskId: "..." } }
    if (data.code !== 200) {
      throw new Error(`KIE API error: ${data.message || 'Unknown error'}`);
    }
    
    const taskId = data.data?.taskId;
    if (!taskId) {
      console.error('❌ No taskId in response:', data);
      throw new Error(`No taskId in KIE API response`);
    }
    
    console.log('✅ Task ID received:', taskId);
    const imageUrl = await pollKIETask(taskId);
    console.log('✅ Static post generated:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('❌ Static post generation error:', error);
    throw error;
  }
}

/**
 * Generate video with Sora 2 Pro (Text-to-Video)
 */
async function generateVideoPost(videoConcept, platform, brandColors, brandName) {
  try {
    console.log(`🎬 Generating ${platform} video with Sora 2 Pro...`);
    console.log('KIE_API_KEY present:', !!KIE_API_KEY);

    const enhancedPrompt = `Professional advertising video for ${brandName}: ${videoConcept}

MUST INCLUDE:
- Brand logo visible throughout (corner overlay or intro/outro)
- Product/service showcase with professional cinematography
- Dynamic camera movements and professional lighting
- Brand colors: ${brandColors?.join(', ') || 'vibrant professional colors'}
- Text overlays with key messaging
- Call-to-action at the end

Style: High-end commercial video ad, ${platform}-optimized, cinematic quality, professional marketing content, viral-worthy production value.`;
    const aspectRatio = platform === 'tiktok' ? 'portrait' : 'landscape';

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
      const errorText = await response.text();
      console.error('KIE API error:', response.status, errorText);
      throw new Error(`KIE API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('KIE API response:', data);
    
    // KIE API format: { code: 200, message: "success", data: { taskId: "..." } }
    if (data.code !== 200) {
      throw new Error(`KIE API error: ${data.message || 'Unknown error'}`);
    }
    
    const taskId = data.data?.taskId;
    if (!taskId) {
      console.error('❌ No taskId in response:', data);
      throw new Error(`No taskId in KIE API response`);
    }
    
    console.log('✅ Task ID received:', taskId);
    const videoUrl = await pollKIETask(taskId);
    console.log('✅ Video generated:', videoUrl);
    return { videoUrl };
  } catch (error) {
    console.error('❌ Video generation error:', error);
    throw error;
  }
}

/**
 * Poll KIE API task completion
 * Response format: { code: 200, data: { state: "success", resultJson: "{\"resultUrls\":[\"url\"]}" } }
 */
async function pollKIETask(taskId, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Correct endpoint: /recordInfo with taskId as query parameter
    const response = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`
      }
    });

    const result = await response.json();
    
    // Log full response on first attempt
    if (i === 0) {
      console.log('📦 Full polling response:', JSON.stringify(result, null, 2));
    }
    
    console.log(`⏳ Poll attempt ${i + 1}: code = ${result.code}, state = ${result.data?.state}`);
    
    // KIE API format: { code: 200, message: "success", data: { state: "success", resultJson: "..." } }
    if (result.code !== 200) {
      console.error('❌ Polling error response:', result);
      throw new Error(`KIE API error: ${result.message || 'Unknown error'}`);
    }
    
    const taskData = result.data;
    
    if (taskData.state === 'success') {
      // Parse resultJson which contains the actual result URLs
      const resultJson = JSON.parse(taskData.resultJson);
      const resultUrl = resultJson.resultUrls?.[0];
      
      if (resultUrl) {
        console.log('✅ Task completed, URL:', resultUrl);
        return resultUrl;
      }
      
      console.error('❌ No URL in resultUrls:', resultJson);
      throw new Error('No result URL in successful response');
    } else if (taskData.state === 'fail' || taskData.state === 'failed') {
      throw new Error(`Task failed: ${taskData.failMsg || 'Unknown error'}`);
    } else if (taskData.state === 'processing' || taskData.state === 'pending' || !taskData.state) {
      // Task still processing, continue polling
      console.log(`⏳ Task ${taskId} still processing...`);
    } else {
      console.warn(`⚠️ Unknown state: ${taskData.state}`);
    }
    
    console.log(`⏳ Task ${taskId} still processing... (${i + 1}/${maxAttempts})`);
  }

  throw new Error('Task timeout after ' + maxAttempts + ' attempts');
}

/**
 * Main API handler
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, data } = req.body;

    switch (action) {
      case 'analyze_website': {
        const { websiteUrl } = data;
        const brandAnalysis = await analyzeWebsite(websiteUrl);
        res.status(200).json({
          success: true,
          step: 'website_analyzed',
          data: brandAnalysis
        });
        break;
      }

      case 'find_competitors': {
        const { websiteUrl, brandAnalysis } = data;
        const competitorReport = await findCompetitors(websiteUrl, brandAnalysis);
        res.status(200).json({
          success: true,
          step: 'competitors_found',
          data: competitorReport
        });
        break;
      }

      case 'generate_strategy': {
        const { brandAnalysis, competitorReport } = data;
        const contentStrategy = await generateContentStrategy(brandAnalysis, competitorReport);
        res.status(200).json({
          success: true,
          step: 'strategy_generated',
          data: contentStrategy
        });
        break;
      }

      case 'generate_calendar': {
        const { brandAnalysis, contentStrategy, competitorReport } = data;
        const calendar = await generate4WeekCalendar(brandAnalysis, contentStrategy, competitorReport);
        res.status(200).json({
          success: true,
          step: 'calendar_generated',
          data: calendar
        });
        break;
      }

      case 'generate_post_media': {
        try {
          const { postData, mediaType, platform, brandColors, brandName } = data;
          console.log('🎨 Media generation request:', { mediaType, platform, brandName });
          
          if (!postData || !mediaType || !platform) {
            throw new Error('Missing required parameters: postData, mediaType, or platform');
          }

          if (!KIE_API_KEY) {
            throw new Error('KIE_API_KEY not configured in environment variables');
          }
          
          let result;
          if (mediaType === 'image') {
            const visualDescription = postData.platforms[platform]?.visual_description;
            if (!visualDescription) {
              throw new Error(`No visual description found for ${platform}`);
            }
            console.log('📸 Generating image for:', visualDescription.substring(0, 100));
            result = await generateStaticPost(visualDescription, platform, brandColors, brandName);
          } else if (mediaType === 'video') {
            const videoConcept = postData.platforms[platform]?.video_concept || 
                                postData.platforms[platform]?.visual_description;
            if (!videoConcept) {
              throw new Error(`No video concept found for ${platform}`);
            }
            console.log('🎬 Generating video for:', videoConcept.substring(0, 100));
            result = await generateVideoPost(videoConcept, platform, brandColors, brandName);
          } else {
            throw new Error(`Invalid media type: ${mediaType}`);
          }
          
          console.log('✅ Media generated successfully');
          res.status(200).json({
            success: true,
            step: 'media_generated',
            data: result
          });
        } catch (error) {
          console.error('❌ Media generation error:', error);
          res.status(500).json({
            success: false,
            error: error.message || 'Media generation failed',
            details: error.toString()
          });
        }
        break;
      }

      default:
        res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
};

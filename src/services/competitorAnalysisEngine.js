/**
 * Competitor Analysis Engine
 * Uses Grok AI to discover and analyze competitors
 */

const GROK_API_KEY = process.env.GROK_API_KEY || process.env.REACT_APP_GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

class CompetitorAnalysisEngine {
  /**
   * Analyze website and discover competitors
   */
  async analyzeWebsiteAndFindCompetitors(websiteUrl, brandAnalysis) {
    try {
      console.log('🔍 Starting competitor discovery for:', websiteUrl);

      const prompt = `You are a market research expert. Analyze this brand and find their top competitors.

BRAND INFORMATION:
- Website: ${websiteUrl}
- Brand Name: ${brandAnalysis.brand_name || 'Unknown'}
- Industry: ${brandAnalysis.industry || 'Unknown'}
- Products/Services: ${brandAnalysis.products?.join(', ') || 'Unknown'}
- Target Audience: ${brandAnalysis.target_audience || 'Unknown'}

TASK:
1. Identify 3-5 direct competitors in the same industry
2. For each competitor, provide:
   - Company name
   - Website URL
   - Brief description
   - Market position (leader/challenger/niche)
   - Key differentiators

Return ONLY a valid JSON object with this structure:
{
  "competitors": [
    {
      "name": "Competitor Name",
      "website": "https://competitor.com",
      "description": "Brief description",
      "market_position": "leader|challenger|niche",
      "differentiators": ["key point 1", "key point 2"]
    }
  ],
  "market_insights": {
    "industry_trends": ["trend 1", "trend 2"],
    "opportunities": ["opportunity 1", "opportunity 2"]
  }
}`;

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
              content: 'You are a market research expert. Always return valid JSON only, no markdown or explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);
      console.log('✅ Found', result.competitors?.length || 0, 'competitors');
      
      return result;
    } catch (error) {
      console.error('❌ Competitor discovery error:', error);
      throw error;
    }
  }

  /**
   * Research competitor's marketing strategies
   */
  async researchCompetitorMarketing(competitor) {
    try {
      console.log('🔬 Researching marketing strategies for:', competitor.name);

      const prompt = `You are a digital marketing analyst. Research and analyze the marketing strategies of this competitor.

COMPETITOR:
- Name: ${competitor.name}
- Website: ${competitor.website}
- Description: ${competitor.description}

TASK:
Analyze their marketing approach and provide insights on:
1. Content Strategy - What type of content do they create?
2. Social Media Presence - Which platforms are they most active on?
3. Posting Frequency - How often do they post?
4. Content Themes - What topics do they focus on?
5. Visual Style - What's their aesthetic/brand style?
6. Engagement Tactics - How do they engage their audience?
7. Ad Strategy - What type of ads might they run?

Return ONLY a valid JSON object:
{
  "content_strategy": {
    "types": ["blog posts", "videos", "infographics"],
    "themes": ["theme 1", "theme 2"],
    "tone": "professional|casual|playful"
  },
  "social_media": {
    "primary_platforms": ["instagram", "linkedin", "twitter"],
    "posting_frequency": "daily|weekly|multiple_per_day",
    "best_performing_content": ["content type 1", "content type 2"]
  },
  "visual_style": {
    "colors": ["#color1", "#color2"],
    "style": "minimalist|bold|elegant|modern",
    "imagery": "photography|illustrations|mixed"
  },
  "engagement_tactics": ["tactic 1", "tactic 2"],
  "ad_insights": {
    "platforms": ["meta", "google", "linkedin"],
    "ad_types": ["carousel", "video", "static"],
    "messaging": ["key message 1", "key message 2"]
  }
}`;

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
              content: 'You are a digital marketing analyst. Always return valid JSON only, no markdown or explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);
      console.log('✅ Marketing research completed for:', competitor.name);
      
      return result;
    } catch (error) {
      console.error('❌ Marketing research error:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive competitor report
   */
  async generateCompetitorReport(websiteUrl, brandAnalysis) {
    try {
      console.log('📊 Generating comprehensive competitor report...');

      // Step 1: Find competitors
      const competitorData = await this.analyzeWebsiteAndFindCompetitors(websiteUrl, brandAnalysis);
      
      // Step 2: Research top 2-3 competitors in detail
      const detailedResearch = [];
      const competitorsToResearch = competitorData.competitors.slice(0, 3);
      
      for (const competitor of competitorsToResearch) {
        const marketing = await this.researchCompetitorMarketing(competitor);
        detailedResearch.push({
          ...competitor,
          marketing_strategy: marketing
        });
        
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const report = {
        competitors: detailedResearch,
        market_insights: competitorData.market_insights,
        analyzed_at: new Date().toISOString(),
        summary: {
          total_competitors_found: competitorData.competitors.length,
          detailed_analysis_count: detailedResearch.length
        }
      };

      console.log('✅ Competitor report generated successfully');
      return report;
    } catch (error) {
      console.error('❌ Report generation error:', error);
      throw error;
    }
  }

  /**
   * Generate content strategy based on competitor analysis
   */
  async generateContentStrategy(brandAnalysis, competitorReport) {
    try {
      console.log('🎯 Generating content strategy...');

      const competitorStrategies = competitorReport.competitors
        .map(c => JSON.stringify(c.marketing_strategy, null, 2))
        .join('\n\n');

      const prompt = `You are a content strategist. Create a winning content strategy based on competitor analysis.

BRAND:
${JSON.stringify(brandAnalysis, null, 2)}

COMPETITOR STRATEGIES:
${competitorStrategies}

TASK:
Create a content strategy that:
1. Learns from competitors' successful tactics
2. Identifies gaps and opportunities
3. Differentiates the brand
4. Maximizes engagement potential

Return ONLY a valid JSON object:
{
  "content_pillars": [
    {
      "name": "Pillar Name",
      "description": "What this pillar covers",
      "frequency": "daily|weekly|bi-weekly",
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
    "color_palette": ["#color1", "#color2", "#color3"],
    "imagery_type": "photography|illustrations|mixed"
  },
  "engagement_tactics": ["tactic 1", "tactic 2", "tactic 3"],
  "differentiation_strategy": ["unique approach 1", "unique approach 2"]
}`;

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
              content: 'You are a content strategist. Always return valid JSON only, no markdown or explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2500
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);
      console.log('✅ Content strategy generated');
      
      return result;
    } catch (error) {
      console.error('❌ Strategy generation error:', error);
      throw error;
    }
  }
}

module.exports = new CompetitorAnalysisEngine();

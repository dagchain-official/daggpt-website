/**
 * AI-POWERED SCENE BREAKDOWN
 * Uses OpenAI to generate consistent, progressive scene prompts with SEED
 */

/**
 * Generate intelligent scene breakdown using AI
 */
export const generateAISceneBreakdown = async (prompt, duration, style) => {
  console.log('🤖 Generating AI-powered scene breakdown...');
  console.log('Prompt:', prompt);
  console.log('Duration:', duration);
  console.log('Style:', style);

  try {
    // Call OpenAI API to generate scene breakdown
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional video director and cinematographer. Your job is to break down video concepts into detailed, consistent scenes that maintain visual continuity.

CRITICAL RULES:
1. Keep the SAME subject/character throughout all scenes
2. Keep the SAME environment/setting throughout all scenes
3. Use progressive camera movements (wide → medium → close-up)
4. Each scene should flow naturally into the next
5. Maintain consistent lighting, time of day, and atmosphere
6. Use specific, descriptive language for AI video generation
7. Each scene should be 10 seconds long

Output format: JSON with this structure:
{
  "seed": <random number 1000-999999 for consistency>,
  "subject": "<exact subject description to use in ALL scenes>",
  "environment": "<exact environment description to use in ALL scenes>",
  "scenes": [
    {
      "number": 1,
      "duration": 10,
      "shot_type": "wide shot",
      "camera_movement": "slow push in",
      "prompt": "<detailed scene prompt>",
      "visual_notes": "<what should remain consistent>"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Create a ${duration}-second video breakdown for: "${prompt}"
Style: ${style}

Break it into ${Math.ceil(duration / 10)} scenes of 10 seconds each.
Ensure PERFECT visual consistency across all scenes.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('🤖 AI Response:', aiResponse);

    // Parse JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const breakdown = JSON.parse(jsonMatch[0]);
    
    console.log('✅ AI Scene Breakdown:', breakdown);

    // Format for our system
    const scenes = breakdown.scenes.map(scene => ({
      prompt: scene.prompt,
      duration: scene.duration,
      shotType: scene.shot_type,
      cameraMovement: scene.camera_movement
    }));

    return {
      totalScenes: scenes.length,
      totalDuration: duration,
      style: style,
      seed: breakdown.seed, // Use same seed for all scenes
      subject: breakdown.subject,
      environment: breakdown.environment,
      scenes: scenes,
      seedDescription: `AI-generated with seed ${breakdown.seed} for consistency`,
      aiGenerated: true
    };

  } catch (error) {
    console.error('❌ AI scene breakdown failed:', error);
    
    // Fallback to simple breakdown
    console.log('⚠️ Falling back to simple scene breakdown...');
    const { createSimpleSceneBreakdown } = await import('./simpleSceneBreakdown.js');
    return createSimpleSceneBreakdown(prompt, duration, style);
  }
};

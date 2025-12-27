/**
 * SIMPLE SCENE BREAKDOWN
 * Creates scene breakdown without using Gemini API
 * Avoids rate limit issues
 */

/**
 * Generate scene breakdown based on duration
 * No API calls - pure logic
 */
export const createSimpleSceneBreakdown = (prompt, duration, style) => {
  console.log('📋 Creating simple scene breakdown...');
  console.log(`Duration: ${duration}s, Style: ${style}`);

  // Calculate number of scenes (10 seconds per scene for Kling 2.5 Pro)
  const secondsPerScene = 10;
  const numScenes = Math.max(1, Math.ceil(duration / secondsPerScene));

  console.log(`Creating ${numScenes} scenes`);

  // Create scenes
  const scenes = [];
  
  if (numScenes === 1) {
    // Single scene - use full prompt
    // Shorten prompt to avoid Freepik API validation errors (max 2500 chars, but keep it shorter)
    const shortPrompt = prompt.length > 200 ? prompt.substring(0, 200) + '...' : prompt;
    
    scenes.push({
      sceneNumber: 1,
      prompt: `${shortPrompt}`,
      duration: duration,
      style: style
    });
  } else {
    // Multiple scenes - create progressive story
    const scenePrompts = generateProgressiveScenePrompts(prompt, numScenes);
    
    for (let i = 0; i < numScenes; i++) {
      scenes.push({
        sceneNumber: i + 1,
        prompt: scenePrompts[i],
        duration: secondsPerScene,
        style: style
      });
    }
  }

  const breakdown = {
    totalScenes: numScenes,
    totalDuration: duration,
    style: style,
    scenes: scenes,
    seedDescription: `${style} style video with consistent visual theme`,
    visualConsistency: {
      colorPalette: getColorPaletteForStyle(style),
      lighting: getLightingForStyle(style),
      mood: getMoodForStyle(style)
    }
  };

  console.log('✅ Scene breakdown created:', breakdown);
  return breakdown;
};

/**
 * Generate progressive scene prompts for storytelling
 * Creates unique prompts that build a narrative
 */
const generateProgressiveScenePrompts = (basePrompt, numScenes) => {
  const prompts = [];
  
  // Keep full prompt (don't truncate - VideoGenAPI handles long prompts)
  const base = basePrompt;
  
  if (numScenes === 1) {
    prompts.push(`${base}, smooth cinematic camera movement`);
  } else if (numScenes === 2) {
    prompts.push(`${base}, wide establishing shot with slow camera push in`);
    prompts.push(`${base}, close-up with gentle camera movement`);
  } else if (numScenes === 3) {
    prompts.push(`${base}, wide angle shot, camera slowly pans across scene`);
    prompts.push(`${base}, medium shot, camera moves closer revealing details`);
    prompts.push(`${base}, dynamic camera movement, final reveal`);
  } else if (numScenes === 4) {
    prompts.push(`${base}, wide establishing shot, slow camera dolly forward`);
    prompts.push(`${base}, camera orbits around subject`);
    prompts.push(`${base}, close-up, subtle camera movement`);
    prompts.push(`${base}, camera pulls back for final wide shot`);
  } else {
    // 5+ scenes
    prompts.push(`${base}, cinematic wide shot, camera slowly pushes in`);
    prompts.push(`${base}, camera pans left to right revealing scene`);
    prompts.push(`${base}, medium shot, camera tracks forward`);
    prompts.push(`${base}, close-up, camera slowly circles subject`);
    
    // Add middle scenes if needed
    for (let i = 4; i < numScenes - 1; i++) {
      prompts.push(`${base}, dynamic camera movement from different angle`);
    }
    
    // Final scene
    prompts.push(`${base}, camera pulls back revealing full scene`);
  }
  
  return prompts;
};

/**
 * Get color palette based on style
 */
const getColorPaletteForStyle = (style) => {
  const palettes = {
    'cinematic': 'Rich, dramatic colors with deep shadows',
    'anime': 'Vibrant, saturated colors with bold contrasts',
    'realistic': 'Natural, true-to-life colors',
    'cartoon': 'Bright, cheerful colors',
    'abstract': 'Bold, experimental colors',
    '3d-render': 'Clean, polished colors with good lighting',
    'watercolor': 'Soft, flowing colors',
    'oil-painting': 'Rich, textured colors',
    'sci-fi': 'Cool blues, neons, and metallics',
    'fantasy': 'Magical, ethereal colors'
  };

  return palettes[style] || 'Balanced, professional colors';
};

/**
 * Get lighting based on style
 */
const getLightingForStyle = (style) => {
  const lighting = {
    'cinematic': 'Dramatic lighting with strong shadows',
    'anime': 'Bright, clear lighting',
    'realistic': 'Natural, realistic lighting',
    'cartoon': 'Bright, even lighting',
    'abstract': 'Creative, artistic lighting',
    '3d-render': 'Studio lighting with good highlights',
    'watercolor': 'Soft, diffused lighting',
    'oil-painting': 'Classical lighting',
    'sci-fi': 'Neon and ambient lighting',
    'fantasy': 'Magical, glowing lighting'
  };

  return lighting[style] || 'Professional lighting';
};

/**
 * Get mood based on style
 */
const getMoodForStyle = (style) => {
  const moods = {
    'cinematic': 'Epic and dramatic',
    'anime': 'Energetic and expressive',
    'realistic': 'Authentic and grounded',
    'cartoon': 'Fun and playful',
    'abstract': 'Artistic and experimental',
    '3d-render': 'Polished and modern',
    'watercolor': 'Gentle and artistic',
    'oil-painting': 'Classical and refined',
    'sci-fi': 'Futuristic and mysterious',
    'fantasy': 'Magical and enchanting'
  };

  return moods[style] || 'Professional and engaging';
};

export default {
  createSimpleSceneBreakdown
};

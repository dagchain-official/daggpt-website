/**
 * AI ORCHESTRATOR AGENT
 * The brain of the video generation pipeline
 * Analyzes prompts, creates detailed scene breakdowns, and assigns optimal models
 */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * Main Orchestrator - Analyzes user prompt and creates complete production plan
 */
export const orchestrateVideoProduction = async (userPrompt, duration, style) => {
  console.log('🎬 AI ORCHESTRATOR AGENT ACTIVATED');
  console.log(`📝 Prompt: ${userPrompt}`);
  console.log(`⏱️ Duration: ${duration}s`);
  console.log(`🎨 Style: ${style}`);

  try {
    // Calculate number of scenes (8s each)
    const numScenes = Math.ceil(duration / 8);
    
    // Create the orchestration prompt
    const orchestrationPrompt = `You are a world-class AI film director and production orchestrator. Your task is to create a detailed production plan for an AI-generated video.

USER REQUEST:
Prompt: "${userPrompt}"
Duration: ${duration} seconds
Style: ${style}
Number of Scenes: ${numScenes} (8 seconds each)

YOUR MISSION:
Create a comprehensive production plan that includes:

1. OVERALL VISION
   - Core concept and theme
   - Visual style and aesthetic
   - Mood and atmosphere
   - Color palette
   - Key visual elements that must remain consistent

2. SCENE-BY-SCENE BREAKDOWN
   For each of the ${numScenes} scenes, provide:
   - Scene number and duration
   - Detailed visual description (camera angles, movements, composition)
   - Character/object descriptions (appearance, clothing, features)
   - Action and movement
   - Lighting and atmosphere
   - Continuity notes (what carries over from previous scene)
   - Transition to next scene
   - Best AI model for this scene type:
     * "veo-3.1" - Best for: Action, realistic characters, detailed scenes
     * "runway-gen3" - Best for: Cinematic shots, smooth motion, artistic
     * "pika-labs" - Best for: Effects, transformations, abstract
     * "luma-ai" - Best for: Camera movements, environments, nature

3. AUDIO REQUIREMENTS
   For each scene, specify:
   - Background ambience (e.g., "city noise", "wind", "rain")
   - Sound effects needed (e.g., "car engine", "footsteps", "explosion")
   - Music mood (e.g., "tense", "uplifting", "dramatic")
   - Audio intensity (1-10)

4. CONSISTENCY GUIDELINES
   - Character appearance (if any)
   - Environment/setting details
   - Lighting consistency
   - Color grading notes
   - Style consistency rules

IMPORTANT RULES:
- Each scene MUST flow naturally into the next
- Maintain visual consistency throughout
- Be extremely detailed in descriptions
- Consider camera work and cinematography
- Think about how scenes connect
- Assign the BEST model for each scene type
- Include specific audio requirements

Return your response as a JSON object with this EXACT structure:

{
  "productionPlan": {
    "title": "Brief title for the video",
    "overallVision": {
      "concept": "Core concept description",
      "visualStyle": "Detailed visual style",
      "mood": "Overall mood",
      "colorPalette": "Color scheme description",
      "keyElements": ["element1", "element2"]
    },
    "consistencyGuide": {
      "characters": "Character appearance details (if any)",
      "environment": "Environment/setting consistency",
      "lighting": "Lighting style",
      "colorGrading": "Color grading notes",
      "styleRules": ["rule1", "rule2"]
    },
    "scenes": [
      {
        "sceneNumber": 1,
        "duration": 8,
        "visualDescription": "Extremely detailed visual description",
        "cameraWork": "Camera angles, movements, shots",
        "action": "What happens in this scene",
        "lighting": "Lighting description",
        "continuity": "What must stay consistent",
        "transition": "How it connects to next scene",
        "aiModel": "veo-3.1 or runway-gen3 or pika-labs or luma-ai",
        "modelReason": "Why this model is best for this scene",
        "audio": {
          "ambience": ["ambient sound 1", "ambient sound 2"],
          "soundEffects": ["effect 1", "effect 2"],
          "musicMood": "mood description",
          "intensity": 7
        }
      }
    ],
    "audioOverall": {
      "musicStyle": "Overall music style for the video",
      "tempo": "Tempo description",
      "audioArc": "How audio should evolve (build/peak/resolve)"
    }
  }
}

Be creative, detailed, and professional. This will be used to generate a real video.`;

    // Call Gemini API
    console.log('🤖 Calling Gemini AI Orchestrator...');
    const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: orchestrationPrompt }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    console.log('📄 Raw AI Response:', responseText.substring(0, 500) + '...');

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText;
    if (responseText.includes('```json')) {
      jsonText = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('```')) {
      jsonText = responseText.split('```')[1].split('```')[0].trim();
    }

    // Parse the production plan
    const productionPlan = JSON.parse(jsonText);
    
    console.log('✅ Production Plan Created!');
    console.log(`📋 Title: ${productionPlan.productionPlan.title}`);
    console.log(`🎬 Scenes: ${productionPlan.productionPlan.scenes.length}`);
    
    // Log model distribution
    const modelCounts = {};
    productionPlan.productionPlan.scenes.forEach(scene => {
      modelCounts[scene.aiModel] = (modelCounts[scene.aiModel] || 0) + 1;
    });
    console.log('🤖 Model Distribution:', modelCounts);

    return {
      success: true,
      productionPlan: productionPlan.productionPlan,
      metadata: {
        totalScenes: productionPlan.productionPlan.scenes.length,
        duration: duration,
        style: style,
        modelDistribution: modelCounts
      }
    };

  } catch (error) {
    console.error('❌ Orchestrator Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Enhance individual scene prompt for specific AI model
 */
export const enhanceScenePrompt = (scene, consistencyGuide) => {
  const modelEnhancements = {
    'veo-3.1': 'Photorealistic, detailed, cinematic quality, 4K resolution',
    'runway-gen3': 'Cinematic, smooth motion, professional cinematography, film-like',
    'pika-labs': 'Creative effects, dynamic transformations, artistic style',
    'luma-ai': 'Smooth camera movement, natural motion, environmental detail'
  };

  const enhancement = modelEnhancements[scene.aiModel] || modelEnhancements['veo-3.1'];

  return `${scene.visualDescription}

Camera Work: ${scene.cameraWork}
Action: ${scene.action}
Lighting: ${scene.lighting}

CONSISTENCY REQUIREMENTS:
${consistencyGuide.characters ? `Characters: ${consistencyGuide.characters}` : ''}
${consistencyGuide.environment ? `Environment: ${consistencyGuide.environment}` : ''}
Lighting Style: ${consistencyGuide.lighting}
Color Grading: ${consistencyGuide.colorGrading}

Style: ${enhancement}

Maintain visual consistency with previous scenes. Ensure smooth continuity.`;
};

/**
 * Quality check - Analyze if scene descriptions are good enough
 */
export const validateProductionPlan = (productionPlan) => {
  const issues = [];

  // Check if all scenes have required fields
  productionPlan.scenes.forEach((scene, index) => {
    if (!scene.visualDescription || scene.visualDescription.length < 50) {
      issues.push(`Scene ${index + 1}: Visual description too short`);
    }
    if (!scene.aiModel) {
      issues.push(`Scene ${index + 1}: No AI model assigned`);
    }
    if (!scene.audio) {
      issues.push(`Scene ${index + 1}: No audio requirements`);
    }
  });

  // Check consistency guide
  if (!productionPlan.consistencyGuide) {
    issues.push('Missing consistency guide');
  }

  return {
    isValid: issues.length === 0,
    issues: issues,
    quality: issues.length === 0 ? 'excellent' : issues.length < 3 ? 'good' : 'needs improvement'
  };
};

export default {
  orchestrateVideoProduction,
  enhanceScenePrompt,
  validateProductionPlan
};

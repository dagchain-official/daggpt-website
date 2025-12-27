// Video Orchestration Service - Handles multi-scene video generation with consistency

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_TEXT_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * Generate scene breakdown from user prompt using Gemini
 * Breaks down the prompt into sequential scenes based on duration
 */
export const generateSceneBreakdown = async (prompt, duration, style) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API Key not configured');
  }

  // Calculate number of 8s segments needed
  const numSegments = Math.ceil(duration / 8);
  const segmentDuration = Math.min(8, duration);
  
  const systemPrompt = `You are a professional video director. Break down the following video prompt into ${numSegments} sequential scenes, each lasting approximately ${segmentDuration} seconds.

IMPORTANT RULES:
1. Each scene must flow naturally into the next
2. Maintain character consistency (appearance, clothing, voice tone)
3. Keep environment/setting consistent unless explicitly changing
4. Include specific details about:
   - Camera angles and movements
   - Character actions and expressions
   - Audio cues (dialogue, sound effects, music)
   - Lighting and atmosphere
   - Continuity elements (what carries over from previous scene)

5. For ${style} style, emphasize:
   ${style === 'dialogue' ? '- Clear dialogue with emotion\n   - Sound effects and ambient noise\n   - Character interactions' : ''}
   ${style === 'cinematic' ? '- Camera movements (pan, tilt, dolly)\n   - Lighting (golden hour, dramatic shadows)\n   - Composition (rule of thirds, depth)' : ''}
   ${style === 'animation' ? '- Animation style (2D, 3D, anime)\n   - Exaggerated movements\n   - Vibrant colors and effects' : ''}

6. Include a SEED_DESCRIPTION that captures the core visual identity to maintain consistency across all scenes (character appearance, art style, color palette, environment aesthetic).

Return ONLY valid JSON in this exact format:
{
  "title": "Brief title for the video",
  "seedDescription": "Detailed description of consistent visual elements (characters, style, colors, setting)",
  "totalDuration": ${duration},
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": ${segmentDuration},
      "prompt": "Detailed scene description with camera, action, audio, lighting",
      "continuityNotes": "What must remain consistent from this scene",
      "transitionTo": "How this scene connects to the next"
    }
  ]
}`;

  try {
    const response = await fetch(GEMINI_TEXT_API, {
      method: 'POST',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser Prompt: ${prompt}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error('No response from Gemini');
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = textResponse.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const sceneBreakdown = JSON.parse(jsonText);
    
    console.log('Scene Breakdown Generated:', sceneBreakdown);
    
    return {
      success: true,
      breakdown: sceneBreakdown
    };
  } catch (error) {
    console.error('Scene breakdown error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate multiple video clips sequentially and stitch them together
 * Shows all individual clips + final stitched video
 */
export const generateMultiClipVideo = async (prompt, style, aspectRatio, duration, onProgress) => {
  try {
    // Step 1: Generate scene breakdown
    onProgress({
      stage: 'planning',
      message: 'Creating scene breakdown...',
      progress: 5
    });

    const breakdownResult = await generateSceneBreakdown(prompt, duration, style);
    
    if (!breakdownResult.success) {
      throw new Error('Failed to create scene breakdown');
    }

    const breakdown = breakdownResult.breakdown;
    const scenes = breakdown.scenes;
    const totalScenes = scenes.length;

    onProgress({
      stage: 'planning',
      message: `Created ${totalScenes} scenes. Starting generation...`,
      progress: 10,
      sceneCount: totalScenes,
      breakdown: breakdown
    });

    // Step 2: Generate each clip sequentially
    const { generateVideoWithGemini, pollVideoOperation } = await import('./geminiVideoService');
    const { stitchVideos } = await import('./videoStitchingService');
    const generatedClips = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const sceneNumber = i + 1;

      onProgress({
        stage: 'generating',
        message: `Generating scene ${sceneNumber}/${totalScenes}...`,
        progress: 10 + (sceneNumber / totalScenes) * 70,
        currentScene: sceneNumber,
        totalScenes: totalScenes,
        generatedClips: generatedClips
      });

      // Create scene-specific prompt with consistency
      const scenePrompt = `${scene.prompt}\n\nVisual Consistency: ${breakdown.seedDescription}\n\nMaintain consistent characters, style, and atmosphere.`;

      // Generate this clip
      const clipResult = await generateVideoWithGemini(
        scenePrompt,
        style,
        aspectRatio,
        8 // Always 8 seconds per clip
      );

      if (!clipResult.success) {
        throw new Error(`Failed to generate scene ${sceneNumber}: ${clipResult.error}`);
      }

      // Poll for this clip with extended timeout
      const operationName = clipResult.video.operationName;
      let pollCount = 0;
      const maxPolls = 180; // Increased to 30 minutes (180 * 10s)

      while (pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        pollCount++;

        const elapsedMinutes = Math.floor((pollCount * 10) / 60);
        const elapsedSeconds = (pollCount * 10) % 60;

        onProgress({
          stage: 'generating',
          message: `Processing scene ${sceneNumber}/${totalScenes}... (${elapsedMinutes}m ${elapsedSeconds}s elapsed)`,
          progress: 10 + ((sceneNumber - 1 + pollCount / maxPolls) / totalScenes) * 70,
          currentScene: sceneNumber,
          totalScenes: totalScenes,
          pollCount: pollCount,
          generatedClips: generatedClips
        });

        try {
          const pollResult = await pollVideoOperation(operationName);

          if (pollResult.error) {
            console.error(`Scene ${sceneNumber} poll error:`, pollResult.error);
            // Continue polling instead of throwing immediately
            if (pollCount > 60) { // Only fail after 10 minutes
              throw new Error(`Scene ${sceneNumber} generation failed: ${pollResult.error.message}`);
            }
            continue;
          }

          if (pollResult.done) {
            const videoData = pollResult.response?.generateVideoResponse?.generatedSamples?.[0];
            
            if (videoData && videoData.video) {
              const clip = {
                sceneNumber: sceneNumber,
                uri: videoData.video.uri,
                prompt: scene.prompt,
                duration: 8,
                status: 'completed',
                generationTime: pollCount * 10
              };
              generatedClips.push(clip);

              console.log(`✅ Scene ${sceneNumber} completed in ${pollCount * 10}s`);

              onProgress({
                stage: 'generating',
                message: `Scene ${sceneNumber}/${totalScenes} complete! (${pollCount * 10}s)`,
                progress: 10 + (sceneNumber / totalScenes) * 70,
                currentScene: sceneNumber,
                totalScenes: totalScenes,
                generatedClips: [...generatedClips]
              });
              break;
            }
          }
        } catch (pollError) {
          console.error(`Poll error for scene ${sceneNumber}:`, pollError);
          // Continue polling unless we've exceeded max time
          if (pollCount >= maxPolls - 10) {
            throw pollError;
          }
        }
      }

      if (generatedClips.length !== sceneNumber) {
        console.error(`❌ Scene ${sceneNumber} timed out after ${pollCount * 10}s`);
        throw new Error(`Scene ${sceneNumber} timed out after ${Math.floor(pollCount * 10 / 60)} minutes. This can happen due to high API load. Please try again with a shorter duration or fewer scenes.`);
      }
    }

    // Step 3: REAL VIDEO STITCHING with FFmpeg!
    onProgress({
      stage: 'stitching',
      message: 'Stitching clips together with FFmpeg...',
      progress: 85,
      generatedClips: generatedClips
    });

    // Stitch all clips into one final video (stitchVideos already imported above)
    const stitchResult = await stitchVideos(generatedClips, (stitchProgress) => {
      onProgress({
        stage: 'stitching',
        message: stitchProgress.message || 'Stitching videos...',
        progress: 85 + (stitchProgress.progress / 100) * 10, // 85-95%
        generatedClips: generatedClips,
        stitchProgress: stitchProgress
      });
    });

    // Create final video metadata
    const actualDuration = generatedClips.length * 8; // Each clip is 8 seconds
    const finalVideo = {
      id: `video-${Date.now()}`,
      uri: stitchResult.success ? stitchResult.blobUrl : generatedClips[0].uri, // Stitched video or fallback to first clip
      prompt: prompt,
      style: style,
      aspectRatio: aspectRatio,
      duration: actualDuration, // Actual total duration of all clips
      requestedDuration: duration, // What user requested
      scenes: totalScenes,
      breakdown: breakdown,
      clips: generatedClips,
      status: 'completed',
      completedAt: new Date().toISOString(),
      isStitched: stitchResult.success, // TRUE if actually stitched!
      stitchedBlob: stitchResult.success ? stitchResult.blob : null,
      note: stitchResult.success 
        ? `✅ Final video stitched successfully! ${generatedClips.length} clips combined into ${actualDuration}s video.`
        : `Video consists of ${generatedClips.length} individual 8-second clips (${actualDuration}s total). Download individual clips below.`,
      stitchError: stitchResult.success ? null : stitchResult.error
    };

    onProgress({
      stage: 'complete',
      message: 'Video generation complete!',
      progress: 100,
      generatedClips: generatedClips,
      finalVideo: finalVideo
    });

    return {
      success: true,
      video: finalVideo,
      clips: generatedClips,
      breakdown: breakdown
    };

  } catch (error) {
    console.error('Multi-clip video generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate complete video with single comprehensive prompt
 * This approach uses ONE API call instead of multiple to avoid quota issues
 */
export const generateCompleteVideo = async (prompt, style, aspectRatio, duration, onProgress) => {
  try {
    // Step 1: Generate scene breakdown for planning (optional, for UI display)
    onProgress({
      stage: 'planning',
      message: 'Analyzing prompt and creating comprehensive video plan...',
      progress: 5
    });

    const breakdownResult = await generateSceneBreakdown(prompt, duration, style);
    
    if (!breakdownResult.success) {
      // If scene breakdown fails, continue with original prompt
      console.warn('Scene breakdown failed, using original prompt');
    }

    const breakdown = breakdownResult.success ? breakdownResult.breakdown : null;
    const sceneCount = breakdown ? breakdown.scenes.length : Math.ceil(duration / 8);

    onProgress({
      stage: 'planning',
      message: `Planned ${sceneCount} scene${sceneCount > 1 ? 's' : ''}. Generating video...`,
      progress: 15,
      sceneCount: sceneCount
    });

    // Step 2: Create comprehensive prompt with all scenes
    let comprehensivePrompt = prompt;
    
    if (breakdown) {
      // Enhance with scene details for better consistency
      const sceneDescriptions = breakdown.scenes.map((scene, i) => 
        `Scene ${i + 1} (${scene.duration}s): ${scene.prompt}`
      ).join('\n\n');
      
      comprehensivePrompt = `${prompt}\n\nDetailed Scene Breakdown:\n${sceneDescriptions}\n\nVisual Consistency: ${breakdown.seedDescription}\n\nCreate a seamless ${duration}s video with smooth transitions between scenes, maintaining consistent characters, style, and atmosphere throughout.`;
    } else {
      // Fallback: Add duration and consistency notes
      comprehensivePrompt = `${prompt}\n\nCreate a ${duration}s video with consistent characters, style, and atmosphere throughout. Ensure smooth flow and natural progression.`;
    }

    onProgress({
      stage: 'generating',
      message: `Generating ${duration}s video...`,
      progress: 20,
      totalScenes: sceneCount
    });

    // Step 3: Generate video with single API call
    const { generateVideoWithGemini, pollVideoOperation } = await import('./geminiVideoService');
    
    const videoResult = await generateVideoWithGemini(
      comprehensivePrompt, 
      style, 
      aspectRatio, 
      duration  // Pass full duration - Veo will handle it
    );

    if (!videoResult.success) {
      throw new Error(`Video generation failed: ${videoResult.error}`);
    }

    // Step 4: Poll for completion
    const operationName = videoResult.video.operationName;
    let pollCount = 0;
    const maxPolls = 180; // Longer timeout for longer videos

    onProgress({
      stage: 'generating',
      message: `Processing ${duration}s video...`,
      progress: 30,
      pollCount: 0
    });

    while (pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      pollCount++;

      const progressPercent = 30 + (pollCount / maxPolls) * 65;

      onProgress({
        stage: 'generating',
        message: `Processing video... (${pollCount * 10}s elapsed)`,
        progress: progressPercent,
        pollCount
      });

      const pollResult = await pollVideoOperation(operationName);

      if (pollResult.error) {
        throw new Error(`Video generation failed: ${pollResult.error.message}`);
      }

      if (pollResult.done) {
        const videoData = pollResult.response?.generateVideoResponse?.generatedSamples?.[0];
        
        if (videoData && videoData.video) {
          onProgress({
            stage: 'finalizing',
            message: 'Video generation complete!',
            progress: 100
          });

          return {
            success: true,
            video: {
              id: `video-${Date.now()}`,
              uri: videoData.video.uri,
              prompt: prompt,
              style: style,
              aspectRatio: aspectRatio,
              duration: duration,
              scenes: sceneCount,
              breakdown: breakdown,
              status: 'completed',
              completedAt: new Date().toISOString()
            }
          };
        }
      }
    }

    throw new Error('Video generation timed out after 30 minutes');

  } catch (error) {
    console.error('Complete video generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

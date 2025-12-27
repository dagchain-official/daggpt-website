/**
 * AUDIO GENERATION SERVICE
 * Generates background music, voiceover, and sound effects
 */

/**
 * Generate background music using ElevenLabs Music API
 */
export const generateBackgroundMusic = async (prompt, duration) => {
  console.log('🎵 Generating background music...');
  
  try {
    const apiKey = process.env.REACT_APP_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ ElevenLabs API key not found, skipping music generation');
      return { success: false, error: 'No API key' };
    }

    // ElevenLabs Music API
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: duration,
        prompt_influence: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Music generation failed: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    console.log('✅ Background music generated');
    return {
      success: true,
      url: audioUrl,
      blob: audioBlob
    };

  } catch (error) {
    console.error('❌ Music generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate voiceover using ElevenLabs TTS
 */
export const generateVoiceover = async (text, voiceId = 'default') => {
  console.log('🎤 Generating voiceover...');
  
  try {
    const apiKey = process.env.REACT_APP_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ ElevenLabs API key not found, skipping voiceover');
      return { success: false, error: 'No API key' };
    }

    // Use default voice if not specified
    const voice = voiceId === 'default' ? '21m00Tcm4TlvDq8ikWAM' : voiceId;

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Voiceover generation failed: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    console.log('✅ Voiceover generated');
    return {
      success: true,
      url: audioUrl,
      blob: audioBlob
    };

  } catch (error) {
    console.error('❌ Voiceover generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Search for sound effects from Freesound
 */
export const searchSoundEffects = async (query) => {
  console.log('🔊 Searching sound effects...');
  
  try {
    const apiKey = process.env.REACT_APP_FREESOUND_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ Freesound API key not found');
      return { success: false, error: 'No API key' };
    }

    const response = await fetch(
      `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&token=${apiKey}&fields=id,name,previews,duration`
    );

    if (!response.ok) {
      throw new Error(`Sound search failed: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`✅ Found ${data.results.length} sound effects`);
    return {
      success: true,
      sounds: data.results.slice(0, 5) // Return top 5
    };

  } catch (error) {
    console.error('❌ Sound search error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Mix audio tracks with video using FFmpeg
 */
export const mixAudioWithVideo = async (videoBlob, audioBlobs, onProgress) => {
  console.log('🎚️ Mixing audio with video...');
  
  try {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { fetchFile } = await import('@ffmpeg/util');
    
    const ffmpeg = new FFmpeg();
    
    // Load FFmpeg
    if (onProgress) onProgress({ stage: 'loading', progress: 10 });
    await ffmpeg.load();
    
    // Write video file
    if (onProgress) onProgress({ stage: 'writing', progress: 20 });
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoBlob));
    
    // Write audio files
    const audioInputs = [];
    for (let i = 0; i < audioBlobs.length; i++) {
      const filename = `audio${i}.mp3`;
      await ffmpeg.writeFile(filename, await fetchFile(audioBlobs[i]));
      audioInputs.push(filename);
    }
    
    // Mix audio
    if (onProgress) onProgress({ stage: 'mixing', progress: 50 });
    
    // Build FFmpeg command
    const inputs = ['-i', 'input.mp4'];
    audioInputs.forEach(audio => {
      inputs.push('-i', audio);
    });
    
    const filterComplex = audioInputs.length > 1
      ? `[1:a][2:a]amix=inputs=${audioInputs.length}:duration=longest[aout]`
      : '[1:a]anull[aout]';
    
    await ffmpeg.exec([
      ...inputs,
      '-filter_complex', filterComplex,
      '-map', '0:v',
      '-map', '[aout]',
      '-c:v', 'copy',
      '-c:a', 'aac',
      'output.mp4'
    ]);
    
    // Read output
    if (onProgress) onProgress({ stage: 'finalizing', progress: 90 });
    const data = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    
    if (onProgress) onProgress({ stage: 'complete', progress: 100 });
    
    console.log('✅ Audio mixed with video');
    return {
      success: true,
      url: url,
      blob: blob
    };
    
  } catch (error) {
    console.error('❌ Audio mixing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  generateBackgroundMusic,
  generateVoiceover,
  searchSoundEffects,
  mixAudioWithVideo
};

/**
 * FREESOUND.ORG AUDIO SERVICE
 * FREE professional audio library with 500,000+ sounds
 * No paid API required!
 */

// Freesound.org API (FREE - just need to register)
// Get your free API key at: https://freesound.org/apiv2/apply/
const FREESOUND_API_KEY = process.env.REACT_APP_FREESOUND_API_KEY || 'YOUR_FREE_API_KEY';
const FREESOUND_BASE_URL = 'https://freesound.org/apiv2';

/**
 * Search for sounds on Freesound.org
 */
export const searchSounds = async (query, options = {}) => {
  const {
    duration = 'short', // short (0-5s), medium (5-30s), long (30s+)
    sort = 'rating_desc', // rating_desc, downloads_desc, duration_desc
    limit = 5
  } = options;

  try {
    console.log(`🔍 Searching Freesound for: "${query}"`);

    const params = new URLSearchParams({
      query: query,
      sort: sort,
      fields: 'id,name,duration,previews,download,tags,description',
      page_size: limit,
      token: FREESOUND_API_KEY
    });

    // Add duration filter
    if (duration === 'short') {
      params.append('filter', 'duration:[0 TO 5]');
    } else if (duration === 'medium') {
      params.append('filter', 'duration:[5 TO 30]');
    } else if (duration === 'long') {
      params.append('filter', 'duration:[30 TO *]');
    }

    const response = await fetch(`${FREESOUND_BASE_URL}/search/text/?${params}`);
    
    if (!response.ok) {
      throw new Error(`Freesound API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`✅ Found ${data.results.length} sounds for "${query}"`);
    
    return {
      success: true,
      sounds: data.results.map(sound => ({
        id: sound.id,
        name: sound.name,
        duration: sound.duration,
        previewUrl: sound.previews['preview-hq-mp3'],
        downloadUrl: sound.download,
        tags: sound.tags,
        description: sound.description
      })),
      total: data.count
    };

  } catch (error) {
    console.error('❌ Freesound search error:', error);
    return {
      success: false,
      error: error.message,
      sounds: []
    };
  }
};

/**
 * Get audio for a specific scene based on requirements
 */
export const getSceneAudio = async (sceneAudio) => {
  const { ambience, soundEffects, musicMood } = sceneAudio;

  console.log(`🎵 Getting audio for scene...`);
  console.log(`  Ambience: ${ambience.join(', ')}`);
  console.log(`  Effects: ${soundEffects.join(', ')}`);
  console.log(`  Mood: ${musicMood}`);

  try {
    // Search for each audio requirement
    const audioPromises = [];

    // Get ambience sounds
    for (const amb of ambience) {
      audioPromises.push(
        searchSounds(amb, { duration: 'long', limit: 3 })
      );
    }

    // Get sound effects
    for (const effect of soundEffects) {
      audioPromises.push(
        searchSounds(effect, { duration: 'short', limit: 3 })
      );
    }

    // Get background music matching mood
    if (musicMood) {
      audioPromises.push(
        searchSounds(`${musicMood} music background`, { duration: 'medium', limit: 3 })
      );
    }

    const results = await Promise.all(audioPromises);

    // Organize results
    const sceneAudioPack = {
      ambience: results.slice(0, ambience.length).flatMap(r => r.sounds),
      effects: results.slice(ambience.length, ambience.length + soundEffects.length).flatMap(r => r.sounds),
      music: results[results.length - 1]?.sounds || []
    };

    console.log(`✅ Audio pack ready:`, {
      ambience: sceneAudioPack.ambience.length,
      effects: sceneAudioPack.effects.length,
      music: sceneAudioPack.music.length
    });

    return {
      success: true,
      audioPack: sceneAudioPack
    };

  } catch (error) {
    console.error('❌ Scene audio error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get complete audio for all scenes
 */
export const getCompleteAudioPack = async (productionPlan) => {
  console.log(`🎼 Creating complete audio pack for ${productionPlan.scenes.length} scenes...`);

  const audioPackPromises = productionPlan.scenes.map(scene => 
    getSceneAudio(scene.audio)
  );

  const results = await Promise.all(audioPackPromises);

  const completeAudioPack = results.map((result, index) => ({
    sceneNumber: index + 1,
    ...result
  }));

  // Also get overall background music
  const overallMusic = await searchSounds(
    `${productionPlan.audioOverall.musicStyle} ${productionPlan.audioOverall.tempo}`,
    { duration: 'long', limit: 5 }
  );

  console.log(`✅ Complete audio pack ready!`);

  return {
    success: true,
    sceneAudio: completeAudioPack,
    backgroundMusic: overallMusic.sounds,
    metadata: {
      totalScenes: productionPlan.scenes.length,
      musicStyle: productionPlan.audioOverall.musicStyle
    }
  };
};

/**
 * Download audio file (returns blob URL)
 */
export const downloadAudio = async (soundId) => {
  try {
    console.log(`📥 Downloading sound ${soundId}...`);

    const response = await fetch(
      `${FREESOUND_BASE_URL}/sounds/${soundId}/download/?token=${FREESOUND_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Download error: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    console.log(`✅ Audio downloaded: ${soundId}`);

    return {
      success: true,
      blobUrl: blobUrl,
      blob: blob
    };

  } catch (error) {
    console.error('❌ Audio download error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Alternative: Use royalty-free music libraries (no API needed)
 */
export const getRoyaltyFreeMusic = (mood, duration) => {
  // Curated list of royalty-free music sources
  const musicSources = {
    tense: [
      { name: 'Dark Tension', url: 'https://example.com/dark-tension.mp3', duration: 60 },
      { name: 'Suspense Build', url: 'https://example.com/suspense.mp3', duration: 45 }
    ],
    uplifting: [
      { name: 'Inspiring Journey', url: 'https://example.com/inspiring.mp3', duration: 60 },
      { name: 'Positive Vibes', url: 'https://example.com/positive.mp3', duration: 50 }
    ],
    dramatic: [
      { name: 'Epic Orchestral', url: 'https://example.com/epic.mp3', duration: 90 },
      { name: 'Cinematic Drama', url: 'https://example.com/drama.mp3', duration: 75 }
    ],
    action: [
      { name: 'High Energy', url: 'https://example.com/energy.mp3', duration: 60 },
      { name: 'Adrenaline Rush', url: 'https://example.com/adrenaline.mp3', duration: 55 }
    ]
  };

  return musicSources[mood] || musicSources.dramatic;
};

/**
 * Smart audio mixer - Combines multiple audio tracks
 */
export const createAudioMix = (audioPack) => {
  // This would use Web Audio API or FFmpeg to mix audio
  // For now, return the structure for mixing
  return {
    layers: [
      {
        type: 'background',
        tracks: audioPack.backgroundMusic,
        volume: 0.6,
        fadeIn: 2,
        fadeOut: 2
      },
      {
        type: 'ambience',
        tracks: audioPack.sceneAudio.flatMap(s => s.audioPack?.ambience || []),
        volume: 0.4,
        continuous: true
      },
      {
        type: 'effects',
        tracks: audioPack.sceneAudio.flatMap(s => s.audioPack?.effects || []),
        volume: 0.8,
        timed: true // Play at specific timestamps
      }
    ],
    mixingInstructions: {
      normalize: true,
      compression: true,
      masterVolume: 0.8
    }
  };
};

/**
 * Get audio setup instructions for user
 */
export const getAudioSetupInstructions = () => {
  return {
    freesound: {
      name: 'Freesound.org (FREE)',
      steps: [
        '1. Go to https://freesound.org/apiv2/apply/',
        '2. Register for a free account',
        '3. Get your free API key',
        '4. Add to .env as REACT_APP_FREESOUND_API_KEY'
      ],
      features: [
        '500,000+ professional sounds',
        'Completely free',
        'High quality audio',
        'Commercial use allowed (with attribution)'
      ]
    },
    alternative: {
      name: 'User Upload',
      description: 'Let users upload their own audio files',
      formats: ['.mp3', '.wav', '.m4a', '.ogg']
    }
  };
};

export default {
  searchSounds,
  getSceneAudio,
  getCompleteAudioPack,
  downloadAudio,
  getRoyaltyFreeMusic,
  createAudioMix,
  getAudioSetupInstructions
};

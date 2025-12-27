/**
 * VIDEO TRANSITIONS
 * Different transition effects for smooth video stitching
 */

/**
 * Available transition types
 */
export const TRANSITION_TYPES = {
  FADE: 'fade',
  WIPELEFT: 'wipeleft',
  WIPERIGHT: 'wiperight',
  WIPEUP: 'wipeup',
  WIPEDOWN: 'wipedown',
  SLIDELEFT: 'slideleft',
  SLIDERIGHT: 'slideright',
  SLIDEUP: 'slideup',
  SLIDEDOWN: 'slidedown',
  CIRCLECROP: 'circlecrop',
  RECTCROP: 'rectcrop',
  DISTANCE: 'distance',
  FADEBLACK: 'fadeblack',
  FADEWHITE: 'fadewhite',
  RADIAL: 'radial',
  SMOOTHLEFT: 'smoothleft',
  SMOOTHRIGHT: 'smoothright',
  SMOOTHUP: 'smoothup',
  SMOOTHDOWN: 'smoothdown',
  CIRCLEOPEN: 'circleopen',
  CIRCLECLOSE: 'circleclose',
  VERTOPEN: 'vertopen',
  VERTCLOSE: 'vertclose',
  HORZOPEN: 'horzopen',
  HORZCLOSE: 'horzclose',
  DISSOLVE: 'dissolve',
  PIXELIZE: 'pixelize',
  DIAGTL: 'diagtl',
  DIAGTR: 'diagtr',
  DIAGBL: 'diagbl',
  DIAGBR: 'diagbr'
};

/**
 * Get recommended transition for video style
 */
export const getRecommendedTransition = (style) => {
  const transitions = {
    'cinematic': TRANSITION_TYPES.FADE,
    'anime': TRANSITION_TYPES.DISSOLVE,
    'realistic': TRANSITION_TYPES.FADE,
    'cartoon': TRANSITION_TYPES.WIPELEFT,
    'abstract': TRANSITION_TYPES.RADIAL,
    '3d-render': TRANSITION_TYPES.SMOOTHLEFT,
    'watercolor': TRANSITION_TYPES.DISSOLVE,
    'oil-painting': TRANSITION_TYPES.FADE,
    'sci-fi': TRANSITION_TYPES.PIXELIZE,
    'fantasy': TRANSITION_TYPES.CIRCLEOPEN
  };

  return transitions[style] || TRANSITION_TYPES.FADE;
};

/**
 * Build FFmpeg filter for transitions
 */
export const buildTransitionFilter = (clips, transitionType = 'fade', transitionDuration = 0.5, hasAudio = true) => {
  if (clips.length === 1) {
    return null; // No transitions needed
  }

  if (clips.length === 2) {
    // Two clips - one transition
    const offset = (clips[0].duration || 10) - transitionDuration;
    const filter = {
      video: `[0:v][1:v]xfade=transition=${transitionType}:duration=${transitionDuration}:offset=${offset}[v]`,
      maps: ['-map', '[v]']
    };
    
    if (hasAudio) {
      filter.audio = `[0:a][1:a]acrossfade=d=${transitionDuration}[a]`;
      filter.maps.push('-map', '[a]');
    }
    
    return filter;
  }

  // Three clips - two transitions
  const duration1 = clips[0].duration || 10;
  const duration2 = clips[1].duration || 10;
  const offset1 = duration1 - transitionDuration;
  const offset2 = duration1 + duration2 - (transitionDuration * 2);

  const filter = {
    video: 
      `[0:v][1:v]xfade=transition=${transitionType}:duration=${transitionDuration}:offset=${offset1}[v01];` +
      `[v01][2:v]xfade=transition=${transitionType}:duration=${transitionDuration}:offset=${offset2}[v]`,
    maps: ['-map', '[v]']
  };
  
  if (hasAudio) {
    filter.audio = 
      `[0:a][1:a]acrossfade=d=${transitionDuration}[a01];` +
      `[a01][2:a]acrossfade=d=${transitionDuration}[a]`;
    filter.maps.push('-map', '[a]');
  }
  
  return filter;
};

/**
 * Calculate actual video duration with transitions
 */
export const calculateFinalDuration = (clips, transitionDuration = 0.5) => {
  if (clips.length === 0) return 0;
  if (clips.length === 1) return clips[0].duration || 10;
  
  const totalDuration = clips.reduce((sum, clip) => sum + (clip.duration || 10), 0);
  const transitionOverlap = (clips.length - 1) * transitionDuration;
  
  return totalDuration - transitionOverlap;
};

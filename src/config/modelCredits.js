/**
 * Model Credits Configuration
 * Defines all AI models and their credit costs
 */

export const VIDEO_MODELS = {
  'veo3-fast-8s': {
    name: 'Veo 3.1 Fast',
    duration: '8 Seconds',
    credits: 90,
    description: 'Fast generation, 8 second clips',
    icon: '⚡'
  },
  'kling-2.6-5s': {
    name: 'Kling 2.6',
    duration: '5 Seconds',
    credits: 165,
    description: 'High quality, 5 second clips',
    icon: '🎬'
  },
  'kling-2.6-10s': {
    name: 'Kling 2.6',
    duration: '10 Seconds',
    credits: 330,
    description: 'High quality, 10 second clips',
    icon: '🎬'
  },
  'grok-imagine-6s': {
    name: 'Grok Imagine',
    duration: '6 Seconds',
    credits: 30,
    description: 'Budget-friendly, 6 second clips',
    icon: '🤖'
  },
  'sora-2-10s': {
    name: 'Sora 2',
    duration: '10 Seconds',
    credits: 495,
    description: 'Premium quality, 10 second clips',
    icon: '✨'
  },
  'sora-2-15s': {
    name: 'Sora 2',
    duration: '15 Seconds',
    credits: 945,
    description: 'Premium quality, 15 second clips',
    icon: '✨'
  },
  'wan-2.5-5s': {
    name: 'Wan 2.5',
    duration: '5 Seconds',
    credits: 150,
    description: 'Balanced quality, 5 second clips',
    icon: '🎥'
  },
  'wan-2.5-10s': {
    name: 'Wan 2.5',
    duration: '10 Seconds',
    credits: 300,
    description: 'Balanced quality, 10 second clips',
    icon: '🎥'
  }
};

export const IMAGE_MODELS = {
  // Will be populated in next step
};

/**
 * Get model display name with duration
 */
export function getModelDisplayName(modelKey) {
  const model = VIDEO_MODELS[modelKey] || IMAGE_MODELS[modelKey];
  if (!model) return modelKey;
  return `${model.name} (${model.duration})`;
}

/**
 * Get model credits
 */
export function getModelCredits(modelKey) {
  const model = VIDEO_MODELS[modelKey] || IMAGE_MODELS[modelKey];
  return model ? model.credits : 0;
}

/**
 * Format credits display
 */
export function formatCredits(credits) {
  return `${credits} credits`;
}

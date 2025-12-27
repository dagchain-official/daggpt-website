import React from 'react';

// This component will dynamically load SVG icons from the model-icons folder
// Once you add the SVG files, they'll automatically be used

const ModelIcon = ({ modelKey, className = "w-5 h-5" }) => {
  // Map of model keys to their icon file names
  const iconMap = {
    'flux-kontext-pro': 'flux-kontext-pro',
    'flux-2': 'flux-2',
    'nano-banana-pro': 'nano-banana-pro',
    'grok-imagine': 'grok-imagine',
    '4o-image': '4o-image',
    'seedream-v4': 'seedream-v4',
    'ideogram-v3': 'ideogram-v3',
    'midjourney': 'midjourney'
  };

  const iconFileName = iconMap[modelKey];

  // Try to import the icon, fallback to a default if not found
  try {
    const IconComponent = require(`../assets/model-icons/${iconFileName}.svg`);
    return <img src={IconComponent} alt={modelKey} className={className} />;
  } catch (error) {
    // Fallback: Return a placeholder icon if SVG not found
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="4" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
      </svg>
    );
  }
};

export default ModelIcon;

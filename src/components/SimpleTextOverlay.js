import React from 'react';

const SimpleTextOverlay = ({ baseImage, caption, brandData, platform }) => {
  // Extract key info from caption - take first 2-3 meaningful words
  const extractProductName = (text) => {
    const words = text.split(' ').filter(w => w.length > 2);
    // Take max 3 words to keep it short
    return words.slice(0, 3).join(' ');
  };

  const productName = extractProductName(caption);
  const brandName = brandData?.brand_name || '';
  const primaryColor = brandData?.brand_colors?.[0] || '#FF3B30';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Base Image */}
      <img 
        src={baseImage}
        alt="Product"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
      
      {/* Subtle gradient overlay for text readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Brand name - top left - smaller and subtle */}
      {brandName && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '10px',
          fontWeight: '700',
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '1.5px',
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          textTransform: 'uppercase'
        }}>
          {brandName}
        </div>
      )}

      {/* Product name - bottom left - properly sized */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        right: '40px'
      }}>
        <div style={{
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '16px',
          fontWeight: '800',
          lineHeight: '1.2',
          color: '#FFFFFF',
          letterSpacing: '0.5px',
          textShadow: `
            0 2px 8px rgba(0,0,0,0.8),
            0 1px 2px rgba(0,0,0,0.9)
          `,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {productName}
        </div>
      </div>

      {/* Platform badge - bottom right - very subtle */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '8px',
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        textShadow: '0 1px 2px rgba(0,0,0,0.6)'
      }}>
        #{platform}
      </div>
    </div>
  );
};

export default SimpleTextOverlay;

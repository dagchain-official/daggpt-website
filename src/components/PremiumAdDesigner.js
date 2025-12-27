import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';

const PremiumAdDesigner = ({ baseImage, platform, brandData, caption, onImageGenerated }) => {
  const designRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [adLayout, setAdLayout] = useState(null);

  useEffect(() => {
    if (baseImage && brandData) {
      generateAdLayout();
    }
  }, [baseImage, platform, brandData, caption]);

  const generateAdLayout = () => {
    // Extract key information
    const productName = extractProductName(caption, brandData);
    const offer = extractOffer(caption);
    const cta = extractCTA(caption);
    const brandName = brandData?.brand_name || '';
    const brandColors = brandData?.brand_colors || ['#FF3B30', '#000000'];

    // Select layout template based on platform and content
    const layout = selectLayoutTemplate(platform, { productName, offer, cta, brandName });
    
    setAdLayout({
      productName,
      offer,
      cta,
      brandName,
      brandColors,
      layout
    });

    // Generate after layout is set
    setTimeout(() => {
      generateFinalImage();
    }, 100);
  };

  const selectLayoutTemplate = (platform, content) => {
    const templates = [
      {
        id: 1,
        name: 'bold-modern',
        textPosition: 'bottom-left',
        textSize: 'large',
        offerStyle: 'badge-rotated',
        ctaStyle: 'rounded-full',
        gradient: 'dark-bottom'
      },
      {
        id: 2,
        name: 'elegant-centered',
        textPosition: 'center',
        textSize: 'extra-large',
        offerStyle: 'inline-text',
        ctaStyle: 'minimal-border',
        gradient: 'radial-center'
      },
      {
        id: 3,
        name: 'dynamic-split',
        textPosition: 'top-right',
        textSize: 'medium',
        offerStyle: 'corner-badge',
        ctaStyle: 'arrow-button',
        gradient: 'diagonal'
      },
      {
        id: 4,
        name: 'minimal-clean',
        textPosition: 'top-left',
        textSize: 'large',
        offerStyle: 'text-only',
        ctaStyle: 'underline',
        gradient: 'subtle-vignette'
      },
      {
        id: 5,
        name: 'vibrant-pop',
        textPosition: 'bottom-center',
        textSize: 'huge',
        offerStyle: 'starburst',
        ctaStyle: '3d-button',
        gradient: 'color-splash'
      }
    ];

    // Rotate through templates based on platform to ensure variety
    const platformIndex = {
      'instagram': 0,
      'facebook': 1,
      'twitter': 2,
      'x': 2,
      'tiktok': 3
    };
    
    const index = platformIndex[platform.toLowerCase()] || 0;
    return templates[index % templates.length];
  };

  const extractProductName = (caption, brandData) => {
    const words = caption.split(' ').filter(w => w.length > 3);
    return words.slice(0, 3).join(' ').toUpperCase();
  };

  const extractOffer = (caption) => {
    // Look for discount/offer patterns
    const offerRegex = /(\d+%?\s*(off|discount|sale|save))/gi;
    const match = caption.match(offerRegex);
    return match ? match[0].toUpperCase() : null;
  };

  const extractCTA = (caption) => {
    // Common CTAs - only return if explicitly found
    const ctas = ['shop now', 'buy now', 'order now', 'get yours', 'learn more', 'discover', 'grab yours', 'book now', 'try now', 'sign up'];
    const lowerCaption = caption.toLowerCase();
    
    for (const cta of ctas) {
      if (lowerCaption.includes(cta)) {
        return cta.toUpperCase();
      }
    }
    // Don't add default CTA if none found
    return null;
  };

  const generateFinalImage = async () => {
    if (!designRef.current) return;
    
    setIsGenerating(true);
    
    try {
      // Wait a bit for images to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(designRef.current, {
        width: 1080,
        height: 1080,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 0,
        removeContainer: true
      });

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        if (onImageGenerated) {
          onImageGenerated(url);
        }
        setIsGenerating(false);
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error generating premium ad:', error);
      // Still call the callback with the base image if canvas fails
      if (onImageGenerated && baseImage) {
        onImageGenerated(baseImage);
      }
      setIsGenerating(false);
    }
  };

  if (!adLayout) return null;

  const primaryColor = adLayout.brandColors[0] || '#FF3B30';
  const secondaryColor = adLayout.brandColors[1] || '#000000';

  return (
    <>
      {/* Hidden design canvas */}
      <div 
        ref={designRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1080px',
          height: '1080px',
          overflow: 'hidden'
        }}
      >
        {/* Base image with overlay */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, ${secondaryColor}20, transparent)`,
        }}>
          <img 
            src={baseImage}
            alt="Product"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.85)'
            }}
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('Image load error:', e);
              // Remove crossOrigin if it fails
              e.target.crossOrigin = '';
            }}
          />

          {/* Gradient overlays for text readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
          }} />

          {/* Brand name - top left */}
          {adLayout.brandName && (
            <div style={{
              position: 'absolute',
              top: '50px',
              left: '50px',
              fontFamily: 'Arial Black, sans-serif',
              fontSize: '36px',
              fontWeight: '900',
              color: '#FFFFFF',
              letterSpacing: '3px',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
              {adLayout.brandName.toUpperCase()}
            </div>
          )}

          {/* Main product text - position based on layout */}
          <div style={{
            position: 'absolute',
            ...(adLayout.layout.textPosition === 'bottom-left' && { bottom: adLayout.offer ? '320px' : '220px', left: '50px', right: '50px' }),
            ...(adLayout.layout.textPosition === 'center' && { top: '50%', left: '50px', right: '50px', transform: 'translateY(-50%)', textAlign: 'center' }),
            ...(adLayout.layout.textPosition === 'top-right' && { top: '100px', right: '50px', left: 'auto', textAlign: 'right' }),
            ...(adLayout.layout.textPosition === 'top-left' && { top: '150px', left: '50px', right: '50px' }),
            ...(adLayout.layout.textPosition === 'bottom-center' && { bottom: '200px', left: '50px', right: '50px', textAlign: 'center' }),
            zIndex: 10
          }}>
            {adLayout.productName.split(' ').map((word, index) => (
              <div
                key={index}
                style={{
                  fontFamily: 'Arial Black, sans-serif',
                  fontSize: adLayout.layout.textSize === 'huge' ? '130px' : 
                           adLayout.layout.textSize === 'extra-large' ? '120px' :
                           adLayout.layout.textSize === 'large' ? '110px' : '90px',
                  fontWeight: '900',
                  lineHeight: '0.9',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '-2px',
                  textShadow: `
                    0 0 40px ${primaryColor}80,
                    0 8px 30px rgba(0,0,0,0.8),
                    -4px -4px 0 ${primaryColor}40,
                    4px 4px 0 rgba(0,0,0,0.3)
                  `,
                  marginBottom: '10px',
                  background: `linear-gradient(135deg, #FFFFFF, ${primaryColor}30)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {word}
              </div>
            ))}
          </div>

          {/* Offer badge - if exists */}
          {adLayout.offer && (
            <div style={{
              position: 'absolute',
              bottom: '220px',
              left: '50px',
              zIndex: 11
            }}>
              <div style={{
                display: 'inline-block',
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}DD)`,
                padding: '20px 60px',
                borderRadius: '50px',
                boxShadow: `
                  0 10px 40px ${primaryColor}60,
                  0 0 0 4px rgba(255,255,255,0.2),
                  inset 0 -4px 0 rgba(0,0,0,0.2)
                `,
                transform: 'rotate(-2deg)'
              }}>
                <div style={{
                  fontFamily: 'Arial Black, sans-serif',
                  fontSize: '52px',
                  fontWeight: '900',
                  color: '#FFFFFF',
                  letterSpacing: '2px',
                  textShadow: '0 4px 10px rgba(0,0,0,0.4)'
                }}>
                  {adLayout.offer}
                </div>
              </div>
            </div>
          )}

          {/* CTA Button - only show if CTA exists */}
          {adLayout.cta && (
            <div style={{
              position: 'absolute',
              bottom: '60px',
              left: '50px',
              zIndex: 12
            }}>
              <div style={{
                display: 'inline-block',
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)`,
                padding: '28px 80px',
                borderRadius: '60px',
                boxShadow: `
                  0 15px 50px ${primaryColor}70,
                  0 0 0 6px rgba(255,255,255,0.15),
                  inset 0 -6px 0 rgba(0,0,0,0.2),
                  inset 0 2px 0 rgba(255,255,255,0.3)
                `,
                border: '3px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}>
                <div style={{
                  fontFamily: 'Arial Black, sans-serif',
                  fontSize: '48px',
                  fontWeight: '900',
                  color: '#FFFFFF',
                  letterSpacing: '3px',
                  textShadow: '0 4px 15px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  {adLayout.cta}
                  <span style={{ fontSize: '40px' }}>→</span>
                </div>
              </div>
            </div>
          )}

          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '50px',
            right: '50px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${primaryColor}40, transparent)`,
            filter: 'blur(40px)'
          }} />

          <div style={{
            position: 'absolute',
            bottom: '50px',
            right: '50px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            fontWeight: '700',
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            #{platform}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isGenerating && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '12px',
          color: 'white',
          fontWeight: '600'
        }}>
          Creating premium ad design...
        </div>
      )}
    </>
  );
};

export default PremiumAdDesigner;

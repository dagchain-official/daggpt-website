import React, { useState } from 'react';

const ProfessionalAdOverlay = ({ baseImage, caption, brandData, platform }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Extract detailed info from caption
  const extractAdElements = (text) => {
    // Extract product name (first 2-4 words)
    const words = text.split(' ').filter(w => w.length > 2);
    const productName = words.slice(0, 4).join(' ');
    
    // Extract offer/discount
    const offerMatch = text.match(/(\d+%?\s*(off|discount|save|deal))/gi);
    const offer = offerMatch ? offerMatch[0] : null;
    
    // Extract price if mentioned
    const priceMatch = text.match(/\$\d+/g);
    const price = priceMatch ? priceMatch[0] : null;
    
    // Create tagline from middle part of caption
    const tagline = words.slice(4, 10).join(' ');
    
    return { productName, offer, price, tagline };
  };

  const { productName, offer, price, tagline } = extractAdElements(caption);
  const brandName = brandData?.brand_name || '';
  const primaryColor = brandData?.brand_colors?.[0] || '#FF3B30';
  const secondaryColor = brandData?.brand_colors?.[1] || '#000000';

  // Platform-specific layouts
  const getLayoutStyle = () => {
    switch(platform) {
      case 'instagram':
        return 'top-center'; // Large title at top
      case 'facebook':
        return 'left-side'; // Text on left side
      case 'x':
      case 'twitter':
        return 'bottom-bold'; // Bold text at bottom
      case 'tiktok':
        return 'creative-split'; // Creative split layout
      default:
        return 'top-center';
    }
  };

  const layout = getLayoutStyle();

  return (
    <>
      {/* Main Ad Container */}
      <div 
        style={{ position: 'relative', width: '100%', height: '100%', cursor: 'pointer' }}
        onClick={() => setIsLightboxOpen(true)}
      >
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
        
        {/* Gradient Overlays */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: layout === 'top-center' 
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.4) 100%)'
            : layout === 'left-side'
            ? 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 50%)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none'
        }} />

        {/* TOP-CENTER LAYOUT (Instagram) */}
        {layout === 'top-center' && (
          <>
            {/* Brand Badge - Top Left */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(255,255,255,0.95)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '9px',
              fontWeight: '800',
              color: primaryColor,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              {brandName}
            </div>

            {/* Main Product Title - Top Center */}
            <div style={{
              position: 'absolute',
              top: '50px',
              left: '15px',
              right: '15px',
              textAlign: 'center'
            }}>
              <div style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '28px',
                fontWeight: '900',
                lineHeight: '1',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '-1px',
                textShadow: '0 4px 12px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)',
                marginBottom: '8px'
              }}>
                {productName}
              </div>
              
              {/* Tagline */}
              {tagline && (
                <div style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.95)',
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 6px rgba(0,0,0,0.8)',
                  maxWidth: '80%',
                  margin: '0 auto'
                }}>
                  {tagline}
                </div>
              )}
            </div>

            {/* Offer Badge - Bottom Left */}
            {offer && (
              <div style={{
                position: 'absolute',
                bottom: '50px',
                left: '15px',
                background: primaryColor,
                padding: '12px 24px',
                borderRadius: '30px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '20px',
                fontWeight: '900',
                color: '#FFFFFF',
                letterSpacing: '1px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                boxShadow: `0 4px 16px ${primaryColor}80, 0 2px 8px rgba(0,0,0,0.3)`,
                textTransform: 'uppercase'
              }}>
                {offer}
              </div>
            )}

            {/* Price - Bottom Right */}
            {price && (
              <div style={{
                position: 'absolute',
                bottom: '15px',
                right: '15px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '24px',
                fontWeight: '900',
                color: '#FFFFFF',
                textShadow: '0 2px 8px rgba(0,0,0,0.9)'
              }}>
                {price}
              </div>
            )}
          </>
        )}

        {/* BOTTOM-BOLD LAYOUT (Twitter/X) */}
        {layout === 'bottom-bold' && (
          <>
            {/* Brand - Top */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '10px',
              fontWeight: '700',
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '1.5px',
              textShadow: '0 1px 4px rgba(0,0,0,0.7)',
              textTransform: 'uppercase'
            }}>
              {brandName}
            </div>

            {/* Bold Product Name - Bottom */}
            <div style={{
              position: 'absolute',
              bottom: '15px',
              left: '15px',
              right: '15px'
            }}>
              <div style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '24px',
                fontWeight: '900',
                lineHeight: '1.1',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '-0.5px',
                textShadow: '0 3px 10px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)',
                maxWidth: '90%'
              }}>
                {productName}
              </div>
              
              {offer && (
                <div style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  background: primaryColor,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '800',
                  color: '#FFFFFF',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  boxShadow: `0 2px 8px ${primaryColor}60`
                }}>
                  {offer}
                </div>
              )}
            </div>
          </>
        )}

        {/* LEFT-SIDE LAYOUT (Facebook) */}
        {layout === 'left-side' && (
          <>
            {/* Text Block - Left Side */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '15px',
              bottom: '20px',
              width: '45%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              {/* Brand */}
              <div style={{
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

              {/* Product Name */}
              <div>
                <div style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: '22px',
                  fontWeight: '900',
                  lineHeight: '1.1',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.5px',
                  textShadow: '0 3px 10px rgba(0,0,0,0.9)',
                  marginBottom: '10px'
                }}>
                  {productName}
                </div>

                {tagline && (
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: '1.3',
                    textShadow: '0 2px 6px rgba(0,0,0,0.8)'
                  }}>
                    {tagline}
                  </div>
                )}
              </div>

              {/* Offer */}
              {offer && (
                <div style={{
                  background: primaryColor,
                  padding: '10px 20px',
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: '900',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  boxShadow: `0 4px 12px ${primaryColor}70`,
                  textTransform: 'uppercase'
                }}>
                  {offer}
                </div>
              )}
            </div>
          </>
        )}

        {/* CREATIVE-SPLIT LAYOUT (TikTok) */}
        {layout === 'creative-split' && (
          <>
            {/* Top Section */}
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '15px',
              right: '15px'
            }}>
              <div style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '26px',
                fontWeight: '900',
                lineHeight: '0.95',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                letterSpacing: '-1px',
                textShadow: '0 4px 12px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)',
                textAlign: 'center'
              }}>
                {productName}
              </div>
            </div>

            {/* Bottom Section */}
            <div style={{
              position: 'absolute',
              bottom: '15px',
              left: '15px',
              right: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}>
              {/* Brand */}
              <div style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '10px',
                fontWeight: '700',
                color: 'rgba(255,255,255,0.9)',
                letterSpacing: '1.5px',
                textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                textTransform: 'uppercase'
              }}>
                {brandName}
              </div>

              {/* Offer Badge */}
              {offer && (
                <div style={{
                  background: primaryColor,
                  padding: '10px 20px',
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: '900',
                  color: '#FFFFFF',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  boxShadow: `0 4px 12px ${primaryColor}70`,
                  textTransform: 'uppercase'
                }}>
                  {offer}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'pointer'
          }}
          onClick={() => setIsLightboxOpen(false)}
        >
          <img 
            src={baseImage}
            alt="Product enlarged"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}
          />
          <button
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.5)',
              color: '#FFFFFF',
              fontSize: '24px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '300'
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default ProfessionalAdOverlay;

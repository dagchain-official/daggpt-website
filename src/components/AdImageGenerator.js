import React, { useEffect, useRef, useState } from 'react';

const AdImageGenerator = ({ baseImage, platform, brandData, caption, onImageGenerated }) => {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (baseImage && canvasRef.current) {
      generateAdImage();
    }
  }, [baseImage, platform, brandData, caption]);

  const generateAdImage = async () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (1080x1080 for social media)
    canvas.width = 1080;
    canvas.height = 1080;

    try {
      // Load base image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = baseImage;
      });

      // Draw base image
      ctx.drawImage(img, 0, 0, 1080, 1080);

      // Add gradient overlay for text readability
      const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);

      // Extract product name from caption or brand data
      const productName = extractProductName(caption, brandData);
      const offer = extractOffer(caption);
      const cta = extractCTA(caption);

      // Add text overlays based on platform
      addTextOverlays(ctx, {
        productName,
        offer,
        cta,
        brandName: brandData?.brand_name || '',
        platform
      });

      // Convert canvas to blob and return
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        if (onImageGenerated) {
          onImageGenerated(url);
        }
        setIsGenerating(false);
      }, 'image/jpeg', 0.95);

    } catch (error) {
      console.error('Error generating ad image:', error);
      setIsGenerating(false);
    }
  };

  const extractProductName = (caption, brandData) => {
    // Extract product name from caption or use brand name
    const words = caption.split(' ');
    const productKeywords = words.slice(0, 4).join(' ');
    return productKeywords || brandData?.brand_name || 'Product';
  };

  const extractOffer = (caption) => {
    // Look for discount/offer patterns
    const offerRegex = /(\d+%?\s*(off|discount|sale))/gi;
    const match = caption.match(offerRegex);
    return match ? match[0].toUpperCase() : null;
  };

  const extractCTA = (caption) => {
    // Common CTAs
    const ctas = ['shop now', 'buy now', 'order now', 'get yours', 'learn more', 'discover', 'grab yours'];
    const lowerCaption = caption.toLowerCase();
    
    for (const cta of ctas) {
      if (lowerCaption.includes(cta)) {
        return cta.toUpperCase();
      }
    }
    return 'SHOP NOW';
  };

  const addTextOverlays = (ctx, { productName, offer, cta, brandName, platform }) => {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Brand name at top (small)
    if (brandName) {
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(brandName.toUpperCase(), 60, 60);
    }

    // Main product name (large, bold)
    const maxWidth = 960; // 1080 - 60px padding on each side
    const productLines = wrapText(ctx, productName.toUpperCase(), maxWidth, 'bold 96px Arial, sans-serif');
    
    ctx.font = 'bold 96px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    let yPosition = 400;
    productLines.forEach((line, index) => {
      ctx.fillText(line, 60, yPosition + (index * 110));
    });

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Offer badge (if exists)
    if (offer) {
      const offerY = yPosition + (productLines.length * 110) + 40;
      
      // Red badge background
      ctx.fillStyle = '#FF3B30';
      roundRect(ctx, 60, offerY, 400, 80, 40);
      ctx.fill();

      // Offer text
      ctx.font = 'bold 48px Arial, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(offer, 260, offerY + 20);
      ctx.textAlign = 'left';
    }

    // CTA Button at bottom
    const ctaY = 920;
    const ctaWidth = 400;
    const ctaHeight = 100;
    const ctaX = 60;

    // Button background with gradient
    const buttonGradient = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaWidth, ctaY);
    buttonGradient.addColorStop(0, '#FF3B30');
    buttonGradient.addColorStop(1, '#FF6B58');
    ctx.fillStyle = buttonGradient;
    roundRect(ctx, ctaX, ctaY, ctaWidth, ctaHeight, 50);
    ctx.fill();

    // Button text
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(cta, ctaX + ctaWidth / 2, ctaY + 30);

    // Platform-specific badge (bottom right)
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'right';
    ctx.fillText(`#${platform.toUpperCase()}`, 1020, 1020);
  };

  const wrapText = (ctx, text, maxWidth, font) => {
    ctx.font = font;
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        className="hidden"
      />
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
          <div className="text-white font-semibold">Adding text overlays...</div>
        </div>
      )}
    </div>
  );
};

export default AdImageGenerator;

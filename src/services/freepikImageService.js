/**
 * FREEPIK IMAGE GENERATION SERVICE
 * High-quality image generation using Freepik's Mystic model
 * Premium: 6000 RPD (much higher than Gemini!)
 */

import { generateImageWithMystic, pollTaskUntilComplete } from './freepikApiService';

/**
 * Generate image from text prompt
 */
export const generateImage = async (prompt, style, aspectRatio, onProgress) => {
  console.log('🎨 Generating image with Freepik Mystic...');
  console.log(`Prompt: ${prompt}`);
  console.log(`Style: ${style}`);
  console.log(`Aspect Ratio: ${aspectRatio}`);

  try {
    // Map aspect ratio to image size
    const imageSizeMap = {
      '16:9': '1792x1024',
      '9:16': '1024x1792',
      '1:1': '1024x1024',
      '4:3': '1024x768',
      '3:4': '768x1024'
    };

    const imageSize = imageSizeMap[aspectRatio] || '1024x1024';

    // Map style to Mystic styling options
    const stylingMap = {
      'realistic': {
        style: 'photo',
        color: 'natural',
        lighting: 'studio'
      },
      'cinematic': {
        style: 'photo',
        color: 'cinematic',
        lighting: 'dramatic'
      },
      'anime': {
        style: 'anime',
        color: 'vibrant',
        lighting: 'soft'
      },
      'cartoon': {
        style: 'digital-art',
        color: 'vibrant',
        lighting: 'bright'
      },
      'abstract': {
        style: 'digital-art',
        color: 'vibrant',
        lighting: 'artistic'
      },
      '3d-render': {
        style: '3d',
        color: 'vibrant',
        lighting: 'studio'
      },
      'watercolor': {
        style: 'painting',
        color: 'soft',
        lighting: 'natural'
      },
      'oil-painting': {
        style: 'painting',
        color: 'rich',
        lighting: 'classical'
      },
      'sci-fi': {
        style: 'digital-art',
        color: 'neon',
        lighting: 'futuristic'
      },
      'fantasy': {
        style: 'digital-art',
        color: 'magical',
        lighting: 'ethereal'
      }
    };

    const styling = stylingMap[style] || stylingMap['realistic'];

    // Enhanced prompt
    const enhancedPrompt = `${prompt}. High quality, detailed, professional ${style} style, masterpiece.`;

    if (onProgress) {
      onProgress({
        stage: 'generating',
        message: 'Starting image generation with Mystic AI...',
        progress: 10
      });
    }

    // Generate image
    const result = await generateImageWithMystic(enhancedPrompt, {
      imageSize,
      styling,
      numImages: 1,
      guidanceScale: 7.5,
      numInferenceSteps: 50
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    console.log('✅ Image generation task created:', result.taskId);

    if (onProgress) {
      onProgress({
        stage: 'processing',
        message: 'Processing image...',
        progress: 30
      });
    }

    // Poll for completion
    const completed = await pollTaskUntilComplete(
      result.taskId,
      'mystic',
      (pollProgress) => {
        if (onProgress) {
          onProgress({
            stage: 'processing',
            message: `Generating image... (${pollProgress.elapsed}s)`,
            progress: 30 + (pollProgress.attempts / pollProgress.maxAttempts) * 60
          });
        }
      },
      60 // 5 minutes max
    );

    if (!completed.success || !completed.images || completed.images.length === 0) {
      throw new Error('Image generation failed or no images returned');
    }

    const generatedImage = completed.images[0];

    console.log('✅ Image generated successfully!');

    if (onProgress) {
      onProgress({
        stage: 'complete',
        message: 'Image generation complete!',
        progress: 100
      });
    }

    return {
      success: true,
      image: {
        url: generatedImage.url,
        width: generatedImage.width,
        height: generatedImage.height,
        prompt: prompt,
        style: style,
        aspectRatio: aspectRatio,
        model: 'freepik-mystic',
        taskId: result.taskId
      }
    };

  } catch (error) {
    console.error('❌ Freepik image generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate multiple images (batch)
 */
export const generateMultipleImages = async (prompts, style, aspectRatio, onProgress) => {
  console.log(`🎨 Generating ${prompts.length} images with Freepik Mystic...`);

  const images = [];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];

    if (onProgress) {
      onProgress({
        stage: 'generating',
        currentImage: i + 1,
        totalImages: prompts.length,
        message: `Generating image ${i + 1}/${prompts.length}...`,
        progress: (i / prompts.length) * 100
      });
    }

    try {
      const result = await generateImage(
        prompt,
        style,
        aspectRatio,
        (imageProgress) => {
          if (onProgress) {
            onProgress({
              stage: 'generating',
              currentImage: i + 1,
              totalImages: prompts.length,
              imageProgress: imageProgress,
              message: `Image ${i + 1}: ${imageProgress.message}`,
              progress: (i / prompts.length) * 100 + (imageProgress.progress / 100) * (100 / prompts.length)
            });
          }
        }
      );

      if (result.success) {
        images.push(result.image);
        console.log(`✅ Image ${i + 1} completed`);
      } else {
        console.error(`❌ Image ${i + 1} failed:`, result.error);
        images.push({
          error: result.error,
          prompt: prompt
        });
      }

    } catch (error) {
      console.error(`❌ Image ${i + 1} error:`, error);
      images.push({
        error: error.message,
        prompt: prompt
      });
    }
  }

  return {
    success: true,
    images: images,
    totalImages: images.length,
    successfulImages: images.filter(img => !img.error).length
  };
};

export default {
  generateImage,
  generateMultipleImages
};

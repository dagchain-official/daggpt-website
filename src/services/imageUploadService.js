/**
 * IMAGE UPLOAD SERVICE
 * Uploads base64 images to imgbb and provides public HTTP URLs
 * Uses imgbb API (free, reliable, permanent URLs)
 */

const IMGBB_API_KEY = process.env.REACT_APP_IMGBB_API_KEY;

/**
 * Upload base64 image to imgbb and get HTTP URL
 */
export const uploadImageToImgbb = async (base64Image) => {
  console.log('📤 Uploading image to imgbb...');
  
  try {
    // Handle if base64Image is an object with url property
    let imageData = base64Image;
    if (typeof base64Image === 'object' && base64Image.url) {
      imageData = base64Image.url;
    }
    
    // Ensure we have a string
    if (typeof imageData !== 'string') {
      throw new Error('Invalid image data format');
    }
    
    // Remove data URL prefix if present
    let base64Only = imageData;
    if (imageData.startsWith('data:')) {
      base64Only = imageData.split(',')[1];
    }
    
    console.log('📤 Sending to imgbb...');
    
    // Upload to imgbb
    const formData = new FormData();
    formData.append('image', base64Only);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });
    
    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (!response.ok || !data.success) {
      const errorMsg = data.error?.message || 'Image upload failed';
      throw new Error(errorMsg);
    }
    
    const uploadedUrl = data.data.url;
    console.log('✅ Image uploaded successfully:', uploadedUrl);
    
    return {
      success: true,
      url: uploadedUrl,
      deleteUrl: data.data.delete_url
    };
    
  } catch (error) {
    console.error('❌ Image upload error:', error);
    console.error('❌ Error details:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload image from URL (for non-base64 images)
 */
export const uploadImageFromUrl = async (sourceImageUrl) => {
  console.log('📤 Uploading image from URL to imgbb...');
  
  try {
    // Fetch the image
    const response = await fetch(sourceImageUrl);
    const blob = await response.blob();
    
    // Convert to base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
    });
    reader.readAsDataURL(blob);
    
    const base64Image = await base64Promise;
    
    // Upload to imgbb
    return await uploadImageToImgbb(base64Image);
    
  } catch (error) {
    console.error('❌ Image upload from URL error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

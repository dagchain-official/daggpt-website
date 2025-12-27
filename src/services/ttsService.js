/**
 * Text-to-Speech Service using HuggingFace Space
 * API: https://huggingface.co/spaces/NihalGazi/Text-To-Speech-Unlimited
 */

const TTS_API_URL = 'https://nihalgazi-text-to-speech-unlimited.hf.space/api/predict';

/**
 * Generate speech from text
 * @param {string} text - Text to convert to speech
 * @param {string} voice - Voice model (default: 'en-US-Neural2-A')
 * @returns {Promise<string>} Audio URL
 */
export async function generateSpeech(text, voice = 'en-US-Neural2-A') {
  try {
    console.log(`[TTS] Generating speech for text (${text.length} chars)...`);
    
    const response = await fetch(TTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [
          text,           // Text input
          voice,          // Voice model
          1.0,            // Speed (1.0 = normal)
          1.0             // Pitch (1.0 = normal)
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // HuggingFace Gradio API returns: { data: [{ name: "audio.wav", data: "base64..." }] }
    if (!data.data || !data.data[0]) {
      throw new Error('Invalid TTS response format');
    }

    const audioData = data.data[0];
    
    // Convert base64 to blob URL
    const audioBlob = base64ToBlob(audioData.data, 'audio/wav');
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('[TTS] ✅ Speech generated');
    return audioUrl;
    
  } catch (error) {
    console.error('[TTS] Error:', error);
    throw error;
  }
}

/**
 * Generate speech and upload to storage
 * @param {string} text - Text to convert to speech
 * @param {string} voice - Voice model
 * @returns {Promise<string>} Permanent audio URL
 */
export async function generateAndUploadSpeech(text, voice = 'en-US-Neural2-A') {
  try {
    // Generate speech
    const audioUrl = await generateSpeech(text, voice);
    
    // Convert blob URL to File
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const file = new File([blob], `speech-${Date.now()}.wav`, { type: 'audio/wav' });
    
    // Upload to Supabase storage
    const { supabase } = await import('./supabaseService');
    const filePath = `video-audio/${Date.now()}-${Math.random().toString(36).substring(7)}.wav`;
    
    const { data, error } = await supabase.storage
      .from('creations')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('creations')
      .getPublicUrl(filePath);

    console.log('[TTS] ✅ Speech uploaded to storage');
    return urlData.publicUrl;
    
  } catch (error) {
    console.error('[TTS] Upload error:', error);
    throw error;
  }
}

/**
 * Helper: Convert base64 to Blob
 */
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Available voice options
 */
export const VOICE_OPTIONS = [
  { id: 'en-US-Neural2-A', name: 'Male Voice (US)', gender: 'male', accent: 'US' },
  { id: 'en-US-Neural2-C', name: 'Female Voice (US)', gender: 'female', accent: 'US' },
  { id: 'en-GB-Neural2-A', name: 'Male Voice (UK)', gender: 'male', accent: 'UK' },
  { id: 'en-GB-Neural2-C', name: 'Female Voice (UK)', gender: 'female', accent: 'UK' },
  { id: 'en-AU-Neural2-A', name: 'Male Voice (AU)', gender: 'male', accent: 'AU' },
  { id: 'en-AU-Neural2-C', name: 'Female Voice (AU)', gender: 'female', accent: 'AU' }
];

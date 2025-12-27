/**
 * TEST VIDEOGENAPI CONNECTION
 * Run this to verify API key and account status
 */

const API_KEY = process.env.REACT_APP_VIDEOGENAPI_KEY;

async function testVideoGenAPI() {
  console.log('🧪 Testing VideoGenAPI connection...');
  console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');

  if (!API_KEY) {
    console.error('❌ API Key not found! Set REACT_APP_VIDEOGENAPI_KEY in .env');
    return;
  }

  try {
    // Test 1: Get user info
    console.log('\n📊 Test 1: Getting user info...');
    const userResponse = await fetch('https://videogenapi.com/api/v1/user', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const userData = await userResponse.json();
    console.log('User Info Response:', JSON.stringify(userData, null, 2));

    if (!userResponse.ok) {
      console.error('❌ User info failed:', userData);
      return;
    }

    console.log('✅ User info retrieved successfully!');

    // Test 2: Try simple text-to-video
    console.log('\n🎬 Test 2: Trying simple text-to-video...');
    const videoResponse = await fetch('https://videogenapi.com/api/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'wan-25',
        prompt: 'A beautiful sunset over the ocean',
        duration: 5,
        resolution: '720p'
      })
    });

    const videoData = await videoResponse.json();
    console.log('Video Generation Response:', JSON.stringify(videoData, null, 2));

    if (!videoResponse.ok) {
      console.error('❌ Video generation failed:', videoData);
      return;
    }

    console.log('✅ Video generation request submitted successfully!');
    console.log('Generation ID:', videoData.generation_id);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
}

testVideoGenAPI();

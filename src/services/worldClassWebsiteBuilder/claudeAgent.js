/**
 * Claude Agent - Handles all Claude API calls via serverless proxy
 */

/**
 * Call Claude API via Vercel serverless function
 */
export async function callClaudeAPI(prompt, maxTokens = 4096, action = 'generate') {
  const apiUrl = process.env.NODE_ENV === 'production'
    ? '/api/claude-agent'
    : 'http://localhost:3001/api/claude-agent';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        prompt,
        maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error');
    }

    return data.text;

  } catch (error) {
    console.error('Claude API call failed:', error);
    throw error;
  }
}


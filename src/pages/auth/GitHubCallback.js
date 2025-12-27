/**
 * GitHub OAuth Callback Handler
 */

import React, { useEffect } from 'react';

const GitHubCallback = () => {
  useEffect(() => {
    // Parse OAuth response from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (error) {
      // Send error to parent window
      window.opener.postMessage({
        type: 'github-auth-error',
        error: error
      }, window.location.origin);
      return;
    }
    
    if (code) {
      // Exchange code for token via backend
      exchangeCodeForToken(code);
    }
  }, []);
  
  const exchangeCodeForToken = async (code) => {
    try {
      const response = await fetch('/api/auth/github/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      
      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }
      
      const data = await response.json();
      
      // Send token to parent window
      window.opener.postMessage({
        type: 'github-auth-success',
        token: data.access_token
      }, window.location.origin);
    } catch (error) {
      window.opener.postMessage({
        type: 'github-auth-error',
        error: error.message
      }, window.location.origin);
    }
  };
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <h2 style={{ margin: '0 0 10px', fontSize: '24px' }}>Connecting to GitHub...</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>Please wait while we complete the authorization</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default GitHubCallback;

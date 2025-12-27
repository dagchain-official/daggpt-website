/**
 * Netlify OAuth Callback Handler
 */

import React, { useEffect } from 'react';

const NetlifyCallback = () => {
  useEffect(() => {
    // Parse OAuth response from URL hash
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const error = params.get('error');
    
    if (error) {
      // Send error to parent window
      window.opener.postMessage({
        type: 'netlify-auth-error',
        error: error
      }, window.location.origin);
      return;
    }
    
    if (accessToken) {
      // Send token to parent window
      window.opener.postMessage({
        type: 'netlify-auth-success',
        token: accessToken
      }, window.location.origin);
    }
  }, []);
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #00c7b7 0%, #00a896 100%)'
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
        <h2 style={{ margin: '0 0 10px', fontSize: '24px' }}>Connecting to Netlify...</h2>
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

export default NetlifyCallback;

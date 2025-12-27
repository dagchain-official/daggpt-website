/**
 * Runtime Error Detector for WebContainer
 * 
 * Detects runtime errors in the iframe and feeds them back to the conversational AI
 */

/**
 * Inject error detection script into iframe
 * This captures console errors and sends them back to parent
 */
export const injectErrorDetector = (iframeWindow) => {
  if (!iframeWindow) return;

  try {
    // Inject error listener into iframe
    const script = iframeWindow.document.createElement('script');
    script.textContent = `
      (function() {
        // Store original console.error
        const originalError = console.error;
        
        // Override console.error to capture errors
        console.error = function(...args) {
          // Call original
          originalError.apply(console, args);
          
          // Send to parent
          window.parent.postMessage({
            type: 'RUNTIME_ERROR',
            error: args.map(arg => {
              if (arg instanceof Error) {
                return {
                  message: arg.message,
                  stack: arg.stack,
                  name: arg.name
                };
              }
              return String(arg);
            }).join(' ')
          }, '*');
        };
        
        // Capture unhandled errors
        window.addEventListener('error', function(event) {
          window.parent.postMessage({
            type: 'RUNTIME_ERROR',
            error: event.message + ' at ' + event.filename + ':' + event.lineno
          }, '*');
        });
        
        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', function(event) {
          window.parent.postMessage({
            type: 'RUNTIME_ERROR',
            error: 'Unhandled Promise Rejection: ' + event.reason
          }, '*');
        });
      })();
    `;
    
    iframeWindow.document.head.appendChild(script);
    console.log('[Runtime Error Detector] Injected into iframe');
  } catch (error) {
    console.warn('[Runtime Error Detector] Failed to inject:', error);
  }
};

/**
 * Listen for runtime errors from iframe
 */
export const listenForRuntimeErrors = (onError) => {
  const handleMessage = (event) => {
    if (event.data && event.data.type === 'RUNTIME_ERROR') {
      console.log('[Runtime Error Detector] Caught error:', event.data.error);
      onError(event.data.error);
    }
  };
  
  window.addEventListener('message', handleMessage);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
};

/**
 * Parse runtime error to extract useful information
 */
export const parseRuntimeError = (errorMessage) => {
  const patterns = {
    referenceError: /ReferenceError:\s*(\w+)\s*is not defined/i,
    typeError: /TypeError:\s*(.+)/i,
    syntaxError: /SyntaxError:\s*(.+)/i,
    undefined: /Cannot read propert.*of undefined/i,
    null: /Cannot read propert.*of null/i
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    const match = errorMessage.match(pattern);
    if (match) {
      return {
        type,
        message: errorMessage,
        variable: match[1] || null
      };
    }
  }
  
  return {
    type: 'unknown',
    message: errorMessage,
    variable: null
  };
};

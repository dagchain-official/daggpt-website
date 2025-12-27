import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as MicIcon } from '../assets/model-icons/mic.svg';

const VoiceInputButton = ({ onTranscript, className = '' }) => {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const accumulatedTextRef = useRef('');

  // Create recognition instance once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    // Detect Brave browser
    const isBrave = navigator.brave && navigator.brave.isBrave;
    if (isBrave) {
      console.warn('⚠️ Voice input may not work in Brave browser due to privacy settings. Please use Chrome or Edge for voice input.');
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      accumulatedTextRef.current = '';
    };

    recognition.onend = () => {
      setListening(false);
      // Send accumulated text when done
      if (accumulatedTextRef.current && onTranscript) {
        onTranscript(accumulatedTextRef.current);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error, event);
      setListening(false);
      
      if (event.error === 'not-allowed') {
        alert('🎤 Microphone Access Denied\n\nPlease allow microphone access in your browser settings.');
      } else if (event.error === 'network') {
        const isBrave = navigator.brave && navigator.brave.isBrave;
        const braveMsg = isBrave ? '\n\n⚠️ Brave browser blocks Google speech servers by default.\nPlease use Chrome or Edge for voice input.' : '';
        alert(`🌐 Network Error\n\nSpeech recognition requires internet connection to Google servers.\n\nPlease check:\n• Internet connection\n• Firewall/VPN settings\n• Try Chrome or Edge browser${braveMsg}\n\nAlternatively, type your message manually.`);
      } else if (event.error === 'no-speech') {
        // Silent error - user just didn't speak
        console.log('No speech detected');
      } else if (event.error === 'aborted') {
        // User stopped - no alert needed
        console.log('Speech recognition aborted');
      } else {
        alert(`🎤 Speech Recognition Error: ${event.error}\n\nPlease try again or type your message manually.`);
      }
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        accumulatedTextRef.current += (accumulatedTextRef.current ? ' ' : '') + finalTranscript.trim();
      }
    };

    return () => {
      try {
        recognition.onstart = null;
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        recognition.stop?.();
      } catch (e) {
        // ignore
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      try {
        // Set listening state immediately for better UX
        setListening(true);
        recognition.start();
      } catch (err) {
        console.warn('Could not start recognition:', err);
        setListening(false);
      }
    }
  };

  if (!supported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`relative transition-all ${
        listening 
          ? 'text-red-500 animate-pulse scale-110' 
          : 'text-gray-600'
      } ${className}`}
      title={listening ? 'Recording... Click to stop' : 'Click to start voice input'}
    >
      {listening ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
        </svg>
      ) : (
        <MicIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default VoiceInputButton;

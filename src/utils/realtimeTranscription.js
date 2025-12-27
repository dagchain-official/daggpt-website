// OpenAI Realtime API for Voice Transcription (like Perplexity)
export class RealtimeTranscription {
  constructor(apiKey, onTranscript, onError) {
    this.apiKey = apiKey;
    this.onTranscript = onTranscript;
    this.onError = onError;
    this.ws = null;
    this.audioContext = null;
    this.mediaStream = null;
    this.processor = null;
  }

  async start() {
    try {
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create WebSocket connection with API key in protocol
      const wsUrl = 'wss://api.openai.com/v1/realtime?intent=transcription';
      this.ws = new WebSocket(wsUrl, [
        'realtime',
        `openai-insecure-api-key.${this.apiKey}`
      ]);

      this.ws.onopen = () => {
        console.log('✅ Realtime transcription connected');
        this.setupAudioProcessing();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle transcription results
          if (data.type === 'conversation.item.input_audio_transcription.completed') {
            const transcript = data.transcript;
            if (transcript && this.onTranscript) {
              this.onTranscript(transcript);
            }
          }
          
          // Handle errors
          if (data.type === 'error') {
            console.error('Realtime API error:', data);
            if (this.onError) {
              this.onError(data.error?.message || 'Transcription error');
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.onError) {
          this.onError('Connection error');
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.cleanup();
      };

    } catch (error) {
      console.error('Failed to start transcription:', error);
      if (this.onError) {
        this.onError(error.message);
      }
    }
  }

  setupAudioProcessing() {
    // Create audio context
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 24000 // OpenAI Realtime API uses 24kHz
    });

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    
    // Create script processor for audio chunks
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert Float32Array to Int16Array (PCM16)
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Send audio data to WebSocket
        this.ws.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: this.arrayBufferToBase64(pcm16.buffer)
        }));
      }
    };

    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  stop() {
    this.cleanup();
  }

  cleanup() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

import React, { useState, useRef, useEffect } from 'react';
import { generateMusic, waitForCompletion } from '../services/sunoMusicService';
import { saveCreation, getCreations } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import CreditIcon from './CreditIcon';

const MusicGenerator = () => {
  const { currentUser } = useAuth();
  const [songDescription, setSongDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('pop');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSongs, setGeneratedSongs] = useState([]);
  const [customMode, setCustomMode] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [title, setTitle] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [generationStatus, setGenerationStatus] = useState('');
  const [selectedModel, setSelectedModel] = useState('V4_5');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);
  const [selectedSongForLyrics, setSelectedSongForLyrics] = useState(null);
  const audioRef = useRef(null);

  // Load user's music history from Supabase
  useEffect(() => {
    const loadMusicHistory = async () => {
      if (!currentUser) return;
      
      try {
        const musicCreations = await getCreations(currentUser.uid, 'music');
        console.log('📚 Loaded music history:', musicCreations);
        
        // Ensure URLs have .mp3 extension
        const ensureMp3Extension = (url) => {
          if (!url) return url;
          return url.endsWith('.mp3') ? url : `${url}.mp3`;
        };
        
        // Convert Supabase format to component format
        const historySongs = musicCreations.map(creation => ({
          id: creation.id,
          title: creation.metadata?.title || 'Untitled Song',
          description: creation.prompt,
          style: creation.metadata?.style || 'unknown',
          duration: creation.metadata?.duration || '0:00',
          createdAt: creation.created_at,
          audioUrl: ensureMp3Extension(creation.result_url),
          streamAudioUrl: ensureMp3Extension(creation.result_url),
          coverArt: creation.metadata?.coverArt,
          lyrics: creation.metadata?.lyrics || 'No lyrics available',
          plays: 0,
          likes: 0
        }));
        
        setGeneratedSongs(historySongs);
      } catch (error) {
        console.error('Error loading music history:', error);
      }
    };
    
    loadMusicHistory();
  }, [currentUser]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial volume
    audio.volume = volume;

    const handleTimeUpdate = () => {
      if (audio.currentTime) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handleDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        console.log('⏱️ Duration loaded:', audio.duration);
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [volume]);

  // Volume control
  const handleVolumeChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    setVolume(percentage);
    audio.volume = percentage;
  };

  // Play/Pause toggle
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentlyPlaying) return;
    
    const audioUrl = currentlyPlaying.streamAudioUrl || currentlyPlaying.audioUrl;
    if (!audioUrl) return;

    if (isPlaying) {
      console.log('⏸️ Pausing audio');
      audio.pause();
    } else {
      console.log('▶️ Playing audio');
      audio.play().catch(error => {
        console.error('❌ Play error:', error);
        setGenerationStatus(`❌ Playback error: ${error.message}`);
        setTimeout(() => setGenerationStatus(''), 3000);
      });
    }
  };

  // Play specific song
  const playSong = (song) => {
    if (!song.audioUrl && !song.streamAudioUrl) {
      console.error('❌ No audio URL available for this song:', song);
      setGenerationStatus('❌ Audio URL not available for this song');
      setTimeout(() => setGenerationStatus(''), 3000);
      return;
    }

    const audioUrl = song.streamAudioUrl || song.audioUrl;
    console.log('🎵 Playing song:', song.title, 'URL:', audioUrl);
    
    setCurrentlyPlaying(song);
    setCurrentTime(0);
    
    // Load and play the new song
    const audio = audioRef.current;
    if (audio) {
      audio.src = audioUrl;
      audio.load();
      
      // Wait for metadata to load before playing
      const handleLoadedMetadata = () => {
        console.log('✅ Audio metadata loaded, duration:', audio.duration);
        setDuration(audio.duration);
        audio.play().catch(error => {
          console.error('❌ Playback error:', error);
          setGenerationStatus(`❌ Playback error: ${error.message}`);
          setTimeout(() => setGenerationStatus(''), 3000);
        });
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    }
  };

  // Seek to position
  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format time
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Open lyrics panel
  const openLyricsPanel = (song) => {
    setSelectedSongForLyrics(song);
    setShowLyricsPanel(true);
  };

  // Close lyrics panel
  const closeLyricsPanel = () => {
    setShowLyricsPanel(false);
    setTimeout(() => setSelectedSongForLyrics(null), 300); // Wait for animation
  };

  // Download song
  const downloadSong = async (song) => {
    try {
      const audioUrl = song.streamAudioUrl || song.audioUrl;
      if (!audioUrl) {
        setGenerationStatus('❌ Audio URL not available for download');
        setTimeout(() => setGenerationStatus(''), 3000);
        return;
      }

      console.log('🔽 Starting download with cover art:', song.title);
      console.log('📦 Song data:', { audioUrl, coverArt: song.coverArt, title: song.title });
      setGenerationStatus('⬇️ Downloading with cover art...');

      // Always use server proxy to embed cover art
      const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001/api/suno/download'
        : '/api/suno-api';
      
      const params = new URLSearchParams({
        action: 'download',
        url: audioUrl,
        title: song.title,
        artist: 'Suno AI',
        album: 'AI Generated Music'
      });
      
      // Add cover art if available
      if (song.coverArt) {
        console.log('🖼️ Adding cover art to download:', song.coverArt);
        params.append('coverArt', song.coverArt);
      } else {
        console.warn('⚠️ No cover art available for this song');
      }
      
      const proxyUrl = `${baseUrl}?${params.toString()}`;
      console.log('🌐 Proxy URL:', proxyUrl);
      
      const a = document.createElement('a');
      a.href = proxyUrl;
      a.download = `${song.title.replace(/[^a-z0-9\s]/gi, '_').replace(/\s+/g, '_')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      console.log('✅ Download request sent to server');
      setGenerationStatus('✅ Downloading with cover art...');
      setTimeout(() => setGenerationStatus(''), 3000);
      
    } catch (error) {
      console.error('❌ Download error:', error);
      setGenerationStatus('❌ Download failed. Try right-click > Save As');
      setTimeout(() => setGenerationStatus(''), 5000);
    }
  };

  const musicStyles = [
    { id: 'pop', label: 'Pop' },
    { id: 'rock', label: 'Rock' },
    { id: 'electronic', label: 'Electronic' },
    { id: 'hiphop', label: 'Hip Hop' },
    { id: 'jazz', label: 'Jazz' },
    { id: 'classical', label: 'Classical' },
    { id: 'country', label: 'Country' },
    { id: 'rnb', label: 'R&B' },
    { id: 'reggae', label: 'Reggae' },
    { id: 'blues', label: 'Blues' },
    { id: 'metal', label: 'Metal' },
    { id: 'folk', label: 'Folk' }
  ];

  const models = [
    { id: 'V4_5', label: 'V4.5', description: 'Fast & smart' },
    { id: 'V4_5PLUS', label: 'V4.5 Plus', description: 'Highest quality' },
    { id: 'V5', label: 'V5', description: 'Superior musicality' },
  ];

  const handleGenerate = async () => {
    if (!songDescription.trim() && !lyrics.trim()) return;
    
    setIsGenerating(true);
    setGenerationStatus('🎵 Starting music generation...');
    
    try {
      // Prepare generation options
      const options = {
        prompt: customMode ? lyrics : songDescription,
        customMode: customMode,
        instrumental: false,
        model: selectedModel,
        style: customMode ? `${selectedStyle}, ${selectedStyle === 'pop' ? 'Catchy, Upbeat' : selectedStyle === 'rock' ? 'Energetic, Powerful' : selectedStyle === 'electronic' ? 'Synth, Modern' : selectedStyle === 'hiphop' ? 'Urban, Rhythmic' : selectedStyle === 'jazz' ? 'Smooth, Sophisticated' : 'Melodic'}` : undefined,
        title: customMode ? title : undefined
      };

      console.log('🎵 Generating music with options:', options);
      setGenerationStatus('⏳ Creating task...');

      // Generate music
      const taskId = await generateMusic(options);
      console.log('✅ Task ID:', taskId);
      setGenerationStatus(`⏳ Generating (Task: ${taskId.substring(0, 8)}...)...`);

      // Wait for completion with progress updates
      const result = await waitForCompletion(taskId, (status) => {
        console.log('📊 Status:', status.status);
        
        switch (status.status) {
          case 'PENDING':
            setGenerationStatus('⏳ Processing your request...');
            break;
          case 'FIRST_SUCCESS':
            setGenerationStatus('🎉 First track ready!');
            break;
          case 'SUCCESS':
            setGenerationStatus('✅ All tracks generated!');
            break;
          default:
            setGenerationStatus(`⏳ ${status.status}...`);
        }
      });

      console.log('✅ Generation complete:', result);
      setGenerationStatus('✅ Music generated successfully!');

      // Process generated tracks
      if (result.sunoData && result.sunoData.length > 0) {
        console.log('📦 Raw Suno Data:', result.sunoData);
        
        const newSongs = result.sunoData.map((track) => {
          console.log('🎵 Processing track - ALL FIELDS:', track);
          console.log('📝 Lyrics fields:', {
            lyric: track.lyric,
            lyrics: track.lyrics,
            prompt: track.prompt,
            lyricLength: track.lyric?.length,
            promptLength: track.prompt?.length
          });
          
          // Ensure URLs have .mp3 extension
          const ensureMp3Extension = (url) => {
            if (!url) return url;
            return url.endsWith('.mp3') ? url : `${url}.mp3`;
          };

          return {
            id: track.id,
            title: track.title || title || 'Untitled Song',
            description: songDescription || (track.prompt && track.prompt.length < 200 ? track.prompt : 'AI Generated Music'),
            style: track.tags || selectedStyle,
            duration: track.duration ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}` : '0:00',
            createdAt: track.createTime || new Date().toISOString(),
            audioUrl: ensureMp3Extension(track.audioUrl),
            streamAudioUrl: ensureMp3Extension(track.streamAudioUrl),
            coverArt: track.imageUrl || `https://source.unsplash.com/300x300/?music,${selectedStyle}`,
            lyrics: track.lyric || track.lyrics || lyrics || track.prompt || 'Lyrics will be available once the song is fully generated.\n\nThis is an instrumental track or lyrics are being processed.',
            plays: 0,
            likes: 0
          };
        });

        console.log('✅ Processed songs:', newSongs);
        setGeneratedSongs([...newSongs, ...generatedSongs]);
        
        // Save each song to Supabase
        if (currentUser) {
          for (const song of newSongs) {
            await saveCreation(
              currentUser.uid,
              'music',
              songDescription || lyrics || 'AI Generated Music',
              song.streamAudioUrl || song.audioUrl,
              {
                coverArt: song.coverArt,
                lyrics: song.lyrics,
                title: song.title,
                duration: song.duration,
                style: song.style,
                model: selectedModel,
                timestamp: new Date().toISOString()
              }
            );
            console.log('✅ Saved music creation to Supabase:', song.title);
          }
        }
        
        // Auto-play first song
        if (newSongs[0] && (newSongs[0].audioUrl || newSongs[0].streamAudioUrl)) {
          console.log('🎵 Auto-playing first song');
          playSong(newSongs[0]);
        } else {
          console.warn('⚠️ First song has no audio URL');
          setCurrentlyPlaying(newSongs[0]);
        }
        
        // Clear form
        setSongDescription('');
        setLyrics('');
        setTitle('');
      }

      setIsGenerating(false);
      setGenerationStatus('');

    } catch (error) {
      console.error('❌ Music generation error:', error);
      setGenerationStatus(`❌ Error: ${error.message}`);
      setIsGenerating(false);
      
      // Show error for 5 seconds then clear
      setTimeout(() => {
        setGenerationStatus('');
      }, 5000);
    }
  };

  return (
    <div className="h-screen w-full relative flex flex-col">
      {/* Purple Radial Gradient Background from Bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
        }}
      />
      <div className="relative z-10 h-full flex flex-col">
      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SECTION - Menu/Navigation - 15% */}
        <div className="w-[15%] bg-white border-r border-gray-200 flex flex-col" style={{
          boxShadow: '4px 0 12px rgba(0,0,0,0.05)'
        }}>
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              🎵 Music Studio
            </h1>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-3 space-y-1">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '3px 3px 6px rgba(0,0,0,0.1), -2px -2px 4px rgba(99,102,241,0.2)'
              }}
            >
              <span>✨</span>
              <span>Create</span>
            </button>

            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              <span>🎵</span>
              <span>Library</span>
            </button>

            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              <span>📊</span>
              <span>Analytics</span>
            </button>

            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              <span>⚙️</span>
              <span>Settings</span>
            </button>
          </nav>

          {/* Credits Card */}
          <div className="p-3 border-t border-gray-200">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
              <p className="text-xs text-gray-600 mb-1">Credits</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-800">50</span>
                <button className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-1 rounded-md hover:shadow-md transition-all">
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION - Generation Screen - 25% */}
        <div className="w-[25%] bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Song Description</h2>
              <p className="text-xs text-gray-500">Describe the music you want to create</p>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setCustomMode(false)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  !customMode ? 'text-white' : 'text-gray-600'
                }`}
                style={!customMode ? {
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '3px 3px 6px rgba(0,0,0,0.1), -2px -2px 4px rgba(99,102,241,0.2)'
                } : {
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.08), inset -2px -2px 4px rgba(255,255,255,0.9)'
                }}
              >
                <span>🎲</span>
                <span>Simple</span>
              </button>
              <button
                onClick={() => setCustomMode(true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  customMode ? 'text-white' : 'text-gray-600'
                }`}
                style={customMode ? {
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '3px 3px 6px rgba(0,0,0,0.1), -2px -2px 4px rgba(99,102,241,0.2)'
                } : {
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.08), inset -2px -2px 4px rgba(255,255,255,0.9)'
                }}
              >
                <span>🎨</span>
                <span>Custom</span>
              </button>
            </div>

            {/* Title Input (Custom Mode) */}
            {customMode && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Title</label>
                <div className="bg-gray-50 rounded-lg p-3" style={{
                  boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.06), inset -1px -1px 2px rgba(255,255,255,0.9)'
                }}>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter song title..."
                    className="w-full bg-transparent border-0 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Description/Lyrics Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                {customMode ? 'Lyrics' : 'Description'}
              </label>
              <div className="bg-gray-50 rounded-lg p-3" style={{
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.06), inset -1px -1px 2px rgba(255,255,255,0.9)'
              }}>
                <textarea
                  value={customMode ? lyrics : songDescription}
                  onChange={(e) => customMode ? setLyrics(e.target.value) : setSongDescription(e.target.value)}
                  placeholder={customMode ? "Enter your lyrics..." : "e.g., 'Upbeat pop song about summer'"}
                  className="w-full h-32 bg-transparent border-0 text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Style Selection */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Style</label>
              <div className="grid grid-cols-3 gap-2">
                {musicStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all ${
                      selectedStyle === style.id ? 'text-white' : 'text-gray-600'
                    }`}
                    style={selectedStyle === style.id ? {
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow: '3px 3px 6px rgba(0,0,0,0.1), -2px -2px 4px rgba(99,102,241,0.2)'
                    } : {
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                      boxShadow: '2px 2px 4px rgba(0,0,0,0.08), -2px -2px 4px rgba(255,255,255,0.9)'
                    }}
                  >
                    <span>{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">AI Model</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none" 
                style={{
                  boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.06), inset -1px -1px 2px rgba(255,255,255,0.9)'
                }}
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label} - {model.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Generation Status */}
            {generationStatus && (
              <div className="mb-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-gray-700 text-center">{generationStatus}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!songDescription.trim() && !lyrics.trim())}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isGenerating || (!songDescription.trim() && !lyrics.trim())
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-white hover:shadow-lg'
              }`}
              style={isGenerating || (!songDescription.trim() && !lyrics.trim()) ? {
                background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)'
              } : {
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '4px 4px 8px rgba(0,0,0,0.15), -2px -2px 4px rgba(99,102,241,0.3)'
              }}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🎵 Generate Music</span>
                  <span className="flex items-center gap-0.5">
                    <CreditIcon size={24} />
                    <span className="text-sm font-bold">36</span>
                  </span>
                </span>
              )}
            </button>

            {/* Tips */}
            <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
              <p className="text-xs font-semibold text-gray-800 mb-2">💡 Pro Tip</p>
              <p className="text-xs text-gray-600">Be specific about instruments, tempo, and mood for better results!</p>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - Output/Results - 60% */}
        <div className="w-[60%] bg-gradient-to-br from-gray-50 to-white overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-800">Generated Songs</h2>
              <p className="text-xs text-gray-500">{generatedSongs.length} songs</p>
            </div>

            {generatedSongs.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">🎵</div>
                <p className="text-xs text-gray-500">No songs yet</p>
                <p className="text-xs text-gray-400">Generate your first song!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {generatedSongs.map((song) => (
                  <div
                    key={song.id}
                    className={`bg-white rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                      currentlyPlaying?.id === song.id ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    style={{
                      boxShadow: '3px 3px 6px rgba(0,0,0,0.06), -3px -3px 6px rgba(255,255,255,0.9)'
                    }}
                    onClick={() => openLyricsPanel(song)}
                  >
                    <div className="flex gap-3">
                      {/* Album Art with Play Overlay */}
                      <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 relative group" style={{
                        boxShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover" />
                        
                        {/* Play/Pause Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentlyPlaying?.id === song.id) {
                                togglePlayPause();
                              } else {
                                playSong(song);
                              }
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white cursor-pointer"
                            style={{
                              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                              boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                            }}
                          >
                            <span className="text-xs">{currentlyPlaying?.id === song.id && isPlaying ? '⏸️' : '▶️'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-gray-800 truncate">{song.title}</h3>
                        <p className="text-xs text-gray-500 truncate mb-1">{song.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{song.duration}</span>
                          <span>•</span>
                          <span>{song.style}</span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-col gap-1 justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="text-gray-400 hover:text-[#ff4017] transition-all"
                          title="Like"
                        >
                          <span className="text-sm">❤️</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSong(song);
                          }}
                          className="text-gray-400 hover:text-[#ff4017] transition-all"
                          title="Download"
                        >
                          <span className="text-sm">⬇️</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openLyricsPanel(song);
                          }}
                          className="text-gray-400 hover:text-[#ff4017] transition-all"
                          title="View Lyrics"
                        >
                          <span className="text-sm">📄</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM - Neumorphic Music Player */}
      <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-white border-t border-gray-200 px-8 py-4" style={{
        boxShadow: '0 -8px 24px rgba(0,0,0,0.08), 0 -2px 8px rgba(255,255,255,0.9)'
      }}>
        <div className="flex items-center gap-8">
          {/* Left - Song Info with Neumorphic Card */}
          <div className="flex items-center gap-4 w-80">
            {currentlyPlaying ? (
              <>
                {/* Album Art - Embossed */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -4px -4px 8px rgba(255,255,255,0.9), inset 2px 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <img src={currentlyPlaying.coverArt} alt={currentlyPlaying.title} className="w-full h-full object-cover" />
                </div>
                
                {/* Song Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-800 truncate">{currentlyPlaying.title}</h4>
                  <p className="text-xs text-gray-500 truncate">{currentlyPlaying.style} • {currentlyPlaying.duration}</p>
                </div>

                {/* Like Button - Neumorphic */}
                <button 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:text-[#ff4017] transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                    boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0,0,0,0.15), inset -2px -2px 4px rgba(255,255,255,0.7)'}
                  onMouseUp={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'}
                >
                  ❤️
                </button>
              </>
            ) : (
              <>
                {/* Empty State - Depressed */}
                <div className="w-14 h-14 rounded-xl flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center" style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.12), inset -4px -4px 8px rgba(255,255,255,0.8)'
                }}>
                  <span className="text-2xl text-gray-400">🎵</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-400">No song playing</h4>
                  <p className="text-xs text-gray-400">Generate a song to start</p>
                </div>
              </>
            )}
          </div>

          {/* Center - Player Controls with Neumorphic Buttons */}
          <div className="flex-1 flex flex-col items-center gap-3">
            {/* Control Buttons */}
            <div className="flex items-center gap-6">
              {/* Shuffle Button */}
              <button 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-[#ff4017] transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  boxShadow: '3px 3px 6px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.9)'
                }}
                onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,0.15), inset -2px -2px 4px rgba(255,255,255,0.7)'}
                onMouseUp={(e) => e.currentTarget.style.boxShadow = '3px 3px 6px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.9)'}
              >
                <span className="text-xs">🔀</span>
              </button>

              {/* Previous Button */}
              <button 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'
                }}
                onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0,0,0,0.15), inset -3px -3px 6px rgba(255,255,255,0.7)'}
                onMouseUp={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'}
              >
                <span className="text-sm">⏮️</span>
              </button>

              {/* Play/Pause Button - Embossed with Orange Gradient */}
              <button 
                onClick={togglePlayPause}
                disabled={!currentlyPlaying}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all"
                style={{
                  background: currentlyPlaying 
                    ? 'linear-gradient(135deg, #ff4017 0%, #ff6b47 100%)'
                    : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                  boxShadow: currentlyPlaying
                    ? '6px 6px 12px rgba(0,0,0,0.2), -4px -4px 8px rgba(255,100,70,0.3), inset 0 0 0 1px rgba(255,255,255,0.2)'
                    : '6px 6px 12px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)',
                  cursor: currentlyPlaying ? 'pointer' : 'not-allowed'
                }}
                onMouseDown={(e) => currentlyPlaying && (e.currentTarget.style.boxShadow = 'inset 4px 4px 8px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,100,70,0.2)')}
                onMouseUp={(e) => currentlyPlaying && (e.currentTarget.style.boxShadow = '6px 6px 12px rgba(0,0,0,0.2), -4px -4px 8px rgba(255,100,70,0.3), inset 0 0 0 1px rgba(255,255,255,0.2)')}
              >
                <span className="text-xl">{isPlaying ? '⏸️' : '▶️'}</span>
              </button>

              {/* Next Button */}
              <button 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'
                }}
                onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0,0,0,0.15), inset -3px -3px 6px rgba(255,255,255,0.7)'}
                onMouseUp={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'}
              >
                <span className="text-sm">⏭️</span>
              </button>

              {/* Repeat Button */}
              <button 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-[#ff4017] transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  boxShadow: '3px 3px 6px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.9)'
                }}
                onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,0.15), inset -2px -2px 4px rgba(255,255,255,0.7)'}
                onMouseUp={(e) => e.currentTarget.style.boxShadow = '3px 3px 6px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.9)'}
              >
                <span className="text-xs">🔁</span>
              </button>
            </div>
            
            {/* Progress Bar - Neumorphic Track */}
            <div className="w-full max-w-3xl flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600">{formatTime(currentTime)}</span>
              
              {/* Track - Depressed */}
              <div 
                onClick={handleSeek}
                className="flex-1 h-2 rounded-full cursor-pointer relative" 
                style={{
                  background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)',
                  boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.12), inset -2px -2px 4px rgba(255,255,255,0.8)'
                }}
              >
                {/* Progress - Embossed Orange */}
                <div 
                  className="h-full rounded-full transition-all"
                  style={{
                    width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                    background: 'linear-gradient(135deg, #ff4017 0%, #ff6b47 100%)',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.2), -1px -1px 2px rgba(255,100,70,0.3)'
                  }}
                />
                
                {/* Playhead - Raised Circle */}
                {currentlyPlaying && duration > 0 && (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none"
                    style={{
                      left: `${(currentTime / duration) * 100}%`,
                      background: 'linear-gradient(135deg, #ff4017 0%, #ff6b47 100%)',
                      boxShadow: '3px 3px 6px rgba(0,0,0,0.25), -2px -2px 4px rgba(255,100,70,0.4), inset 0 0 0 2px rgba(255,255,255,0.3)'
                    }}
                  />
                )}
              </div>
              
              <span className="text-xs font-medium text-gray-600">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right - Volume Control with Neumorphic Elements */}
          <div className="flex items-center gap-4 w-56">
            {/* Volume Button */}
            <button 
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
              style={{
                background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'
              }}
              onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0,0,0,0.15), inset -2px -2px 4px rgba(255,255,255,0.7)'}
              onMouseUp={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'}
            >
              <span className="text-sm">🔊</span>
            </button>

            {/* Volume Slider - Depressed Track */}
            <div 
              onClick={handleVolumeChange}
              className="flex-1 h-2 rounded-full cursor-pointer relative" 
              style={{
                background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)',
                boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.12), inset -2px -2px 4px rgba(255,255,255,0.8)'
              }}
            >
              {/* Volume Level - Embossed */}
              <div 
                className="h-full rounded-full transition-all"
                style={{
                  width: `${volume * 100}%`,
                  background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  boxShadow: '2px 2px 4px rgba(0,0,0,0.15), -1px -1px 2px rgba(156,163,175,0.3)'
                }}
              />
              
              {/* Volume Knob - Raised */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none"
                style={{
                  left: `${volume * 100}%`,
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  boxShadow: '3px 3px 6px rgba(0,0,0,0.2), -2px -2px 4px rgba(255,255,255,0.9), inset 0 0 0 1px rgba(0,0,0,0.05)'
                }}
              />
            </div>

            {/* More Options Button */}
            <button 
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
              style={{
                background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'
              }}
              onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0,0,0,0.15), inset -2px -2px 4px rgba(255,255,255,0.7)'}
              onMouseUp={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'}
            >
              <span className="text-sm">⋯</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />

      {/* 4TH PANEL - Sliding Lyrics Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[400px] bg-white transition-transform duration-300 ease-in-out z-50 ${
          showLyricsPanel ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          boxShadow: '-8px 0 24px rgba(0,0,0,0.15), -4px 0 12px rgba(0,0,0,0.1)'
        }}
      >
        {selectedSongForLyrics && (
          <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedSongForLyrics.title}</h2>
                <p className="text-xs text-gray-500 mt-1">{selectedSongForLyrics.style}</p>
              </div>
              <button 
                onClick={closeLyricsPanel}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  boxShadow: '3px 3px 6px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.9)'
                }}
                onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,0.15), inset -2px -2px 4px rgba(255,255,255,0.7)'}
                onMouseUp={(e) => e.currentTarget.style.boxShadow = '3px 3px 6px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.9)'}
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            {/* Song Card */}
            <div className="p-6">
              <div className="flex flex-col items-center">
                {/* Large Album Art - Neumorphic */}
                <div 
                  className="w-56 h-56 rounded-2xl overflow-hidden mb-4" 
                  style={{
                    boxShadow: '8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.9)'
                  }}
                >
                  <img 
                    src={selectedSongForLyrics.coverArt} 
                    alt={selectedSongForLyrics.title} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Song Metadata */}
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{selectedSongForLyrics.duration}</span>
                  <span>•</span>
                  <span>{selectedSongForLyrics.plays || 0} plays</span>
                  <span>•</span>
                  <span>{selectedSongForLyrics.likes || 0} likes</span>
                </div>
              </div>
            </div>

            {/* Lyrics Section */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div 
                className="bg-white rounded-xl p-5 mb-4"
                style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.06), inset -4px -4px 8px rgba(255,255,255,0.9)'
                }}
              >
                <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">Lyrics</h3>
                
                {selectedSongForLyrics.lyrics && selectedSongForLyrics.lyrics.length > 10 ? (
                  <div className="space-y-3">
                    {selectedSongForLyrics.lyrics.split('\n').map((line, index) => {
                      // Simple highlighting: highlight lines based on playback progress
                      const totalLines = selectedSongForLyrics.lyrics.split('\n').length;
                      const currentLineIndex = Math.floor((currentTime / duration) * totalLines);
                      const isCurrentLine = index === currentLineIndex && isPlaying && currentlyPlaying?.id === selectedSongForLyrics.id;
                      const isPastLine = index < currentLineIndex && isPlaying && currentlyPlaying?.id === selectedSongForLyrics.id;
                      
                      return (
                        <p 
                          key={index}
                          className={`text-sm leading-relaxed transition-all duration-300 ${
                            isCurrentLine 
                              ? 'text-indigo-600 font-bold scale-105 transform' 
                              : isPastLine 
                                ? 'text-gray-400' 
                                : 'text-gray-700'
                          }`}
                          style={{
                            textShadow: isCurrentLine ? '0 0 10px rgba(99,102,241,0.3)' : 'none'
                          }}
                        >
                          {line || '\u00A0'}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🎵</div>
                    <p className="text-sm text-gray-500 mb-2">Lyrics not available</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {selectedSongForLyrics.description || 'This track may be instrumental or lyrics are still being generated.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions - Neumorphic */}
            <div className="p-5 border-t border-gray-200 flex gap-3">
              <button 
                onClick={() => playSong(selectedSongForLyrics)}
                className="flex-1 py-3 rounded-xl font-medium text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '4px 4px 8px rgba(99,102,241,0.3), -2px -2px 6px rgba(139,92,246,0.2)'
                }}
                onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(139,92,246,0.2)'}
                onMouseUp={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(99,102,241,0.3), -2px -2px 6px rgba(139,92,246,0.2)'}
              >
                {currentlyPlaying?.id === selectedSongForLyrics.id && isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>
              <button 
                onClick={() => downloadSong(selectedSongForLyrics)}
                className="px-5 py-3 rounded-xl text-gray-600 hover:text-indigo-600 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'
                }}
                onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0,0,0,0.15), inset -2px -2px 4px rgba(255,255,255,0.7)'}
                onMouseUp={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'}
                title="Download"
              >
                ⬇️
              </button>
              <button 
                className="px-5 py-3 rounded-xl text-gray-600 hover:text-indigo-600 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'
                }}
                onMouseDown={(e) => e.currentTarget.style.boxShadow = 'inset 3px 3px 6px rgba(0,0,0,0.15), inset -2px -2px 4px rgba(255,255,255,0.7)'}
                onMouseUp={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.9)'}
                title="Like"
              >
                ❤️
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay when lyrics panel is open */}
      {showLyricsPanel && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
          onClick={closeLyricsPanel}
        />
      )}
      </div>
    </div>
  );
};

export default MusicGenerator;

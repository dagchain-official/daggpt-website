import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { VIDEO_MODELS, getModelCredits, formatCredits } from '../config/modelCredits';
import VoiceInputButton from '../components/VoiceInputButton';
import ChatSidebar from '../components/ChatSidebar';
import WebAppBuilder from '../components/webapp/WebAppBuilder';
import ProfessionalMobileAppBuilder from '../components/ProfessionalMobileAppBuilder';
import SocialMediaAutomationPro from '../components/SocialMediaAutomationPro';
import MusicGenerator from '../components/MusicGenerator';
import ContentCreation from '../components/ContentCreation';
import ContentCreationTest from '../components/ContentCreationTest';
import GenerateVideo from '../components/GenerateVideo';
import EnhancedImageChatInput from '../components/EnhancedImageChatInput';
import EnhancedVideoChatInput from '../components/EnhancedVideoChatInput';
import EnhancedAIChatInput from '../components/EnhancedAIChatInput';
import { handleAIRequest } from '../services/aiHandler';
import { 
  createConversation, 
  getConversations, 
  saveMessage, 
  getMessages,
  saveCreation,
  updateCreationPrivacy,
  supabase
} from '../services/supabaseService';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [selectedTool, setSelectedTool] = useState('chat');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [realtimeWs, setRealtimeWs] = useState(null);
  const [isRealtimeRecording, setIsRealtimeRecording] = useState(false);
  const realtimeRef = useRef(null);
  
  // Conversation management
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [currentSupabaseConversationId, setCurrentSupabaseConversationId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('chat'); // 'chat', 'website-builder', 'mobile-app-builder', or 'my-creations'
  const [selectedCreation, setSelectedCreation] = useState(null);
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [myCreations, setMyCreations] = useState([]);

  const [toolScrollPosition, setToolScrollPosition] = useState(0);
  const toolsContainerRef = useRef(null);
  const [communityCreations, setCommunityCreations] = useState([]);

  // Detect URL and set view mode accordingly
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/ai-chat')) {
      setViewMode('chat');
      setSelectedTool('chat');
      // Don't auto-show sidebar - let it show after first message
    } else if (path.includes('/generate-image')) {
      setViewMode('chat');
      setSelectedTool('image');
      // Don't auto-show sidebar - let it show after first message
    } else if (path.includes('/generate-video')) {
      setViewMode('chat');
      setSelectedTool('video');
      // Don't auto-show sidebar - let it show after first message
    } else if (path.includes('/generate-music')) {
      setViewMode('music-generator');
      setSelectedTool('music');
    } else if (path.includes('/build-website')) {
      setViewMode('website-builder');
      setSelectedTool('website');
    } else if (path.includes('/social-media')) {
      setViewMode('social-media-automation');
      setSelectedTool('socialmedia');
    } else if (path.includes('/content-creation')) {
      setViewMode('content-creation');
      setSelectedTool('contentcreation');
    }
  }, [location.pathname]);

  // Load conversations from Supabase on mount
  useEffect(() => {
    const loadConversations = async () => {
      if (currentUser) {
        const supabaseConversations = await getConversations(currentUser.uid);
        setConversations(supabaseConversations);
      }
    };
    loadConversations();
  }, [currentUser]);

  // Load community creations (all users' PUBLIC creations only)
  useEffect(() => {
    const loadCommunityCreations = async () => {
      try {
        // Get only PUBLIC creations from Supabase (limit to recent 20)
        const { data, error } = await supabase
          .from('creations')
          .select('*')
          .in('type', ['image', 'video', 'music'])
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        
        // Convert URLs to signed URLs to bypass CORS and fix music extensions
        const fixedData = await Promise.all((data || []).map(async (creation) => {
          // Helper function to convert public URL to signed URL
          const convertToSignedUrl = async (url) => {
            try {
              const urlObj = new URL(url);
              const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/creations\/(.+)/);
              if (!pathMatch) return url;
              
              const filePath = pathMatch[1];
              const { data: signedData, error: signedError } = await supabase.storage
                .from('creations')
                .createSignedUrl(filePath, 31536000); // 1 year
              
              return signedError ? url : signedData.signedUrl;
            } catch {
              return url;
            }
          };
          
          // Fix music URLs and convert all URLs to signed URLs
          let resultUrl = creation.result_url;
          if (creation.type === 'music' && resultUrl && !resultUrl.endsWith('.mp3')) {
            resultUrl = `${resultUrl}.mp3`;
          }
          
          return {
            ...creation,
            result_url: await convertToSignedUrl(resultUrl),
            thumbnail_url: creation.thumbnail_url ? await convertToSignedUrl(creation.thumbnail_url) : null
          };
        }));
        
        setCommunityCreations(fixedData);
      } catch (error) {
        console.error('Error loading community creations:', error);
      }
    };
    loadCommunityCreations();
  }, []);

  // Load user's own creations
  const loadMyCreations = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('creations')
        .select('*')
        .eq('user_id', currentUser.uid)
        .in('type', ['image', 'video', 'music'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert URLs to signed URLs
      const fixedData = await Promise.all((data || []).map(async (creation) => {
        const convertToSignedUrl = async (url) => {
          try {
            const urlObj = new URL(url);
            const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/creations\/(.+)/);
            if (!pathMatch) return url;
            
            const filePath = pathMatch[1];
            const { data: signedData, error: signedError } = await supabase.storage
              .from('creations')
              .createSignedUrl(filePath, 31536000); // 1 year
            
            return signedError ? url : signedData.signedUrl;
          } catch {
            return url;
          }
        };
        
        let resultUrl = creation.result_url;
        if (creation.type === 'music' && resultUrl && !resultUrl.endsWith('.mp3')) {
          resultUrl = `${resultUrl}.mp3`;
        }
        
        return {
          ...creation,
          result_url: await convertToSignedUrl(resultUrl),
          thumbnail_url: creation.thumbnail_url ? await convertToSignedUrl(creation.thumbnail_url) : null
        };
      }));
      
      setMyCreations(fixedData);
    } catch (error) {
      console.error('Error loading my creations:', error);
    }
  };

  // Handle My Creations button click
  const handleMyCreations = () => {
    loadMyCreations();
    setViewMode('my-creations');
  };

  const tools = [
    // Row 1: Existing Tools
    { 
      id: 'chat', 
      label: 'AI Chat',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: '#6366f1'
    },
    { 
      id: 'image', 
      label: 'Create Image',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: '#ec4899'
    },
    { 
      id: 'video', 
      label: 'Generate Video',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: '#8b5cf6'
    },
    { 
      id: 'music', 
      label: 'Generate Music',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      color: '#10b981'
    },
    { 
      id: 'socialmedia', 
      label: 'Social Media',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      color: '#3b82f6'
    },
    { 
      id: 'contentcreation', 
      label: 'Content Creation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      color: '#ef4444'
    },
    { 
      id: 'website', 
      label: 'Website Builder',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: '#06b6d4'
    },
    
    // Row 2: Coming Soon Tools
    { 
      id: 'mobileapp', 
      label: 'Build Mobile Apps',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: '#f59e0b',
      comingSoon: true
    },
    { 
      id: 'documents', 
      label: 'Document Tools',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: '#f97316',
      comingSoon: true
    },
    { 
      id: 'voiceclone', 
      label: 'Voice Cloning',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: '#06b6d4',
      comingSoon: true
    },
    { 
      id: 'avatar', 
      label: 'Avatar Creation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: '#a855f7',
      comingSoon: true
    },
    { 
      id: 'aimeetings', 
      label: 'AI Meetings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: '#ef4444',
      comingSoon: true
    },
    { 
      id: 'aiagents', 
      label: 'Custom AI Agents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      color: '#84cc16',
      comingSoon: true
    },
  ];

  const scrollTools = (direction) => {
    if (toolsContainerRef.current) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? Math.max(0, toolScrollPosition - scrollAmount)
        : toolScrollPosition + scrollAmount;
      
      toolsContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setToolScrollPosition(newPosition);
    }
  };

  const handleSend = async () => {
    if (!prompt.trim() || !currentUser) return;
    
    // Intelligent tool detection
    const detectTool = (text) => {
      const lowerText = text.toLowerCase();
      
      // Image generation keywords
      if (lowerText.match(/\b(create|generate|make|draw|design|show me|give me).*(image|picture|photo|illustration|artwork|visual|graphic)/i) ||
          lowerText.match(/\b(image|picture|photo|illustration).*(of|showing|with|for)/i)) {
        return 'image';
      }
      
      // Video generation keywords
      if (lowerText.match(/\b(create|generate|make|produce).*(video|animation|clip|footage)/i)) {
        return 'video';
      }
      
      // Website builder keywords
      if (lowerText.match(/\b(create|build|make|design).*(website|webpage|landing page|site)/i)) {
        return 'website';
      }
      
      // Code generation keywords
      if (lowerText.match(/\b(write|create|generate|code|program).*(code|function|script|program|algorithm)/i) ||
          lowerText.match(/\b(how to code|write a function|create a script)/i)) {
        return 'code';
      }
      
      // Music generation keywords
      if (lowerText.match(/\b(create|generate|make|compose).*(music|song|audio|track|beat)/i)) {
        return 'music';
      }
      
      // Research keywords
      if (lowerText.match(/\b(research|search|find information|look up|what are the latest)/i)) {
        return 'research';
      }
      
      // Default to chat
      return 'chat';
    };
    
    // Auto-detect tool if in chat mode
    const detectedTool = selectedTool === 'chat' ? detectTool(prompt) : selectedTool;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      tool: detectedTool,
      content: prompt,
      files: attachedFiles,
      timestamp: new Date().toLocaleTimeString()
    };
    
    // Create or get Supabase conversation
    let supabaseConvId = currentSupabaseConversationId;
    
    if (messages.length === 0) {
      // Create new Supabase conversation
      const title = prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '');
      const newConv = await createConversation(currentUser.uid, title);
      
      if (newConv) {
        supabaseConvId = newConv.id;
        setCurrentSupabaseConversationId(newConv.id);
        setConversations([newConv, ...conversations]);
        setActiveConversationId(newConv.id);
      }
    }
    
    // Save user message to Supabase
    if (supabaseConvId) {
      await saveMessage(supabaseConvId, 'user', prompt, detectedTool);
    }
    
    // Add user message to UI
    setMessages(prev => [...prev, userMessage]);
    const userPrompt = prompt;
    setPrompt('');
    setAttachedFiles([]);
    
    // Create AI response placeholder
    const aiMessageId = Date.now() + 1;
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      tool: detectedTool,
      content: '⏳ Processing...',
      timestamp: new Date().toLocaleTimeString(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
    // Process AI request
    try {
      // Build conversation history for chat
      const conversationHistory = detectedTool === 'chat' 
        ? messages.filter(m => !m.isLoading).map(m => ({
            role: m.role,
            content: m.content
          }))
        : [];
      
      const result = await handleAIRequest(detectedTool, userPrompt, (update) => {
        // Update AI message in real-time
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: update.content, isLoading: update.type === 'status' }
            : msg
        ));
      }, conversationHistory);
      
      if (result.success) {
        // Update UI
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { 
                ...msg, 
                content: result.content, 
                type: result.type,
                imageUrl: result.type === 'image' ? result.content : null,
                images: result.type === 'image' ? result.images : null, // Store array of images
                websiteHtml: result.type === 'website' ? result.content : null,
                models: result.models,
                videoPrompt: result.prompt,
                ratios: result.ratios,
                prompt: result.prompt,
                sources: result.sources,
                isLoading: false 
              }
            : msg
        ));

        // Save assistant message to Supabase
        if (supabaseConvId) {
          await saveMessage(
            supabaseConvId, 
            'assistant', 
            result.content, 
            detectedTool,
            { type: result.type }
          );
        }

        // Save creation to Supabase (for image, video, music, website)
        if (result.type && ['image', 'video', 'music', 'website', 'code'].includes(result.type)) {
          const creationMetadata = {
            tool: detectedTool,
            timestamp: new Date().toISOString()
          };

          // Add music-specific metadata
          if (result.type === 'music' && result.metadata) {
            creationMetadata.coverArt = result.metadata.coverArt;
            creationMetadata.lyrics = result.metadata.lyrics;
            creationMetadata.title = result.metadata.title;
            creationMetadata.duration = result.metadata.duration;
            creationMetadata.style = result.metadata.style;
            creationMetadata.model = result.metadata.model;
          }

          await saveCreation(
            currentUser.uid,
            result.type,
            userPrompt,
            result.content,
            creationMetadata
          );
          console.log(`✅ Saved ${result.type} creation to Supabase`);
        }
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: `❌ Error: ${result.error}`, isLoading: false }
            : msg
        ));
      }
    } catch (error) {
      console.error('AI request error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: `❌ Error: ${error.message}`, isLoading: false }
          : msg
      ));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles([...attachedFiles, ...files]);
    setShowAttachMenu(false);
  };

  const handleModelSelection = async (modelKey, modelPrompt, messageId, isImage = false) => {
    // Update message to show loading
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            content: isImage 
              ? `🎨 Preparing aspect ratios for ${modelKey}...` 
              : `🎬 Generating video with ${modelKey}...`,
            type: 'text',
            isLoading: true, 
            models: null 
          }
        : msg
    ));

    // Image model selection -> ask for aspect ratio first
    if (isImage) {
      try {
        const result = await handleAIRequest('image', modelPrompt, (update) => {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: update.content, isLoading: update.type === 'status' }
              : msg
          ));
        }, [], modelKey, null);

        if (result.success) {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { 
                  ...msg, 
                  content: result.content, 
                  type: result.type,
                  ratios: result.ratios,
                  prompt: result.prompt,
                  model: result.model,
                  isLoading: false 
                }
              : msg
          ));
        } else {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: `❌ Error: ${result.error}`, isLoading: false }
              : msg
          ));
        }
      } catch (error) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: `❌ Error: ${error.message}`, isLoading: false }
            : msg
        ));
      }
      return;
    }

    // Video model selection (existing behaviour)
    try {
      const result = await handleAIRequest('video', modelPrompt, (update) => {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: update.content, isLoading: update.type === 'status' }
            : msg
        ));
      }, [], modelKey);

      if (result.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: result.content, type: 'video', isLoading: false }
            : msg
        ));

        // Save creation to Supabase
        if (currentUser && result.type === 'video') {
          await saveCreation(
            currentUser.uid,
            'video',
            modelPrompt,
            result.content,
            {
              model: modelKey,
              timestamp: new Date().toISOString()
            }
          );
          console.log('✅ Saved video creation to Supabase');
        }
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: `❌ Error: ${result.error}`, isLoading: false }
            : msg
        ));
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: `❌ Error: ${error.message}`, isLoading: false }
          : msg
      ));
    }
  };

  const handleAspectRatioSelection = async (aspectRatio, imagePrompt, messageId, modelKey = null) => {
    console.log('🎨 Aspect ratio selected:', aspectRatio);
    console.log('📝 Image prompt:', imagePrompt);
    console.log('🆔 Message ID:', messageId);

    // Update message to show loading
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: `🎨 Generating image in ${aspectRatio} format...`, type: 'text', isLoading: true, ratios: null }
        : msg
    ));

    // Call image generation with selected aspect ratio and model
    try {
      console.log('📞 Calling handleAIRequest with aspect ratio:', aspectRatio, 'and model:', modelKey);
      const result = await handleAIRequest('image', imagePrompt, (update) => {
        console.log('📡 Update received:', update);
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: update.content, isLoading: update.type === 'status' }
            : msg
        ));
      }, [], modelKey, aspectRatio);

      console.log('✅ Result:', result);

      if (result.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: result.content, type: 'image', imageUrl: result.content, isLoading: false }
            : msg
        ));

        // Save creation to Supabase
        if (currentUser && result.type === 'image') {
          await saveCreation(
            currentUser.uid,
            'image',
            imagePrompt,
            result.content,
            {
              aspectRatio: aspectRatio,
              timestamp: new Date().toISOString()
            }
          );
          console.log('✅ Saved image creation to Supabase');
        }
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: `❌ Error: ${result.error}`, isLoading: false }
            : msg
        ));
      }
    } catch (error) {
      console.error('❌ Aspect ratio selection error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: `❌ Error: ${error.message}`, isLoading: false }
          : msg
      ));
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setPrompt('');
    setAttachedFiles([]);
    setActiveConversationId(null);
    setCurrentSupabaseConversationId(null);
    setShowSidebar(false);
  };

  const handleSelectConversation = async (conversationId) => {
    // Load messages from Supabase
    const supabaseMessages = await getMessages(conversationId);
    
    // Convert Supabase messages to UI format
    const formattedMessages = supabaseMessages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      tool: msg.tool_used,
      type: msg.metadata?.type,
      timestamp: new Date(msg.created_at).toLocaleTimeString()
    }));
    
    setMessages(formattedMessages);
    setActiveConversationId(conversationId);
    setCurrentSupabaseConversationId(conversationId);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePrivacyToggle = async (creationId, currentPrivacy) => {
    try {
      const newPrivacy = !currentPrivacy;
      const updatedCreation = await updateCreationPrivacy(creationId, newPrivacy);
      
      if (updatedCreation) {
        // Update the selected creation in modal
        setSelectedCreation(updatedCreation);
        
        // Update community creations list
        setCommunityCreations(prev => {
          if (newPrivacy) {
            // If made public, add to community if not already there
            const exists = prev.some(c => c.id === creationId);
            return exists ? prev.map(c => c.id === creationId ? updatedCreation : c) : [updatedCreation, ...prev];
          } else {
            // If made private, remove from community
            return prev.filter(c => c.id !== creationId);
          }
        });
        
        console.log(`✅ Privacy updated: ${newPrivacy ? 'Public' : 'Private'}`);
      }
    } catch (error) {
      console.error('❌ Error toggling privacy:', error);
    }
  };

  const handleVoiceMode = () => {
    setShowVoiceMode(true);
  };

  const toggleVoiceModeRecording = async () => {
    if (isVoiceModeActive) {
      setIsVoiceModeActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsVoiceModeActive(true);
        };

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          
          // Add to messages when final result
          if (event.results[event.results.length - 1].isFinal) {
            setMessages(prev => [...prev, {
              id: Date.now(),
              tool: selectedTool,
              content: transcript,
              timestamp: new Date().toLocaleTimeString(),
              isVoice: true
            }]);
          }
        };

        recognition.onerror = (event) => {
          console.error('Voice mode error:', event.error);
          setIsVoiceModeActive(false);
          stream.getTracks().forEach(track => track.stop());
          
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            alert('Voice mode error. Try deploying to HTTPS for better results.');
          }
        };

        recognition.onend = () => {
          setIsVoiceModeActive(false);
          stream.getTracks().forEach(track => track.stop());
        };

        recognition.start();
      } else {
        alert('Speech recognition not available in this browser.');
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error('Microphone error:', error);
      setIsVoiceModeActive(false);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Full-screen Website Builder mode - Redirect to DAGGPT-branded Website Builder
  if (viewMode === 'website-builder') {
    window.location.href = 'https://64178e68.bolt-2xz.pages.dev';
    return null;
  }

  // Full-screen Mobile App Builder mode
  if (viewMode === 'mobile-app-builder') {
    return <ProfessionalMobileAppBuilder />;
  }

  // Full-screen Social Media Automation mode
  if (viewMode === 'social-media-automation') {
    return <SocialMediaAutomationPro />;
  }

  // Full-screen Music Generator mode
  if (viewMode === 'music-generator') {
    return <MusicGenerator />;
  }

  // My Creations View
  if (viewMode === 'my-creations') {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <ChatSidebar
            currentUser={currentUser}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
            onLogout={handleLogout}
            onMyCreations={handleMyCreations}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Creations</h1>
                <p className="text-gray-500 mt-1">
                  {myCreations.length} {myCreations.length === 1 ? 'creation' : 'creations'}
                </p>
              </div>
              <button
                onClick={() => {
                  setViewMode('chat');
                  setMessages([]);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New
              </button>
            </div>
          </div>

          {/* Creations Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {myCreations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="w-32 h-32 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-3">No creations yet</h3>
                  <p className="text-gray-500 mb-6">Start creating images, videos, or music to see them here!</p>
                  <button
                    onClick={() => {
                      setViewMode('chat');
                      setMessages([]);
                    }}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Start Creating
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
                {myCreations.map((creation) => (
                  <div
                    key={creation.id}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedCreation(creation);
                      setCreationModalOpen(true);
                    }}
                  >
                    {/* Media Preview */}
                    <div className="relative aspect-square bg-gray-900 overflow-hidden">
                      {creation.type === 'image' ? (
                        <img
                          src={creation.result_url}
                          alt={creation.prompt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : creation.type === 'video' ? (
                        <>
                          <video
                            src={creation.result_url}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          creation.type === 'image' 
                            ? 'bg-purple-500 text-white' 
                            : creation.type === 'video'
                            ? 'bg-blue-500 text-white'
                            : 'bg-green-500 text-white'
                        }`}>
                          {creation.type === 'image' ? '🖼️' : 
                           creation.type === 'video' ? '🎬' : '🎵'}
                        </span>
                      </div>

                      {/* Privacy Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          creation.is_public !== false
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {creation.is_public !== false ? '🌍' : '🔒'}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <p className="text-xs text-gray-600 line-clamp-1 mb-1.5">
                        {creation.type === 'music' 
                          ? creation.metadata?.title || 'Untitled Music'
                          : creation.prompt}
                      </p>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs text-gray-400 truncate">
                          {new Date(creation.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const newPrivacy = creation.is_public === false;
                            
                            try {
                              await updateCreationPrivacy(creation.id, newPrivacy);
                              
                              // Update local state
                              setMyCreations(prev => prev.map(c => 
                                c.id === creation.id ? { ...c, is_public: newPrivacy } : c
                              ));
                              
                              // Refresh community creations
                              const { data } = await supabase
                                .from('creations')
                                .select('*')
                                .in('type', ['image', 'video', 'music'])
                                .eq('is_public', true)
                                .order('created_at', { ascending: false })
                                .limit(20);
                              
                              if (data) {
                                setCommunityCreations(data);
                              }
                            } catch (error) {
                              console.error('Failed to update privacy:', error);
                            }
                          }}
                          className="text-xs px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded font-medium transition-colors whitespace-nowrap"
                        >
                          {creation.is_public !== false ? '🔓' : '🔒'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Creation Modal for My Creations View */}
        {creationModalOpen && selectedCreation && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setCreationModalOpen(false)}
          >
            <div 
              className="relative max-w-7xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setCreationModalOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                  {/* Media */}
                  <div className="flex-1 bg-black flex items-center justify-center p-4">
                    {selectedCreation.type === 'image' ? (
                      <img
                        src={selectedCreation.result_url}
                        alt={selectedCreation.prompt}
                        className="max-w-full max-h-[70vh] object-contain"
                      />
                    ) : selectedCreation.type === 'video' ? (
                      <video
                        src={selectedCreation.result_url}
                        className="max-w-full max-h-[70vh] object-contain"
                        controls
                        autoPlay
                        loop
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full max-w-sm space-y-4 p-8">
                        <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl">
                          <img
                            src={selectedCreation.metadata?.coverArt || 'https://via.placeholder.com/400x400/6366f1/ffffff?text=Music'}
                            alt="Music"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <audio
                          src={selectedCreation.result_url}
                          controls
                          autoPlay
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Info Panel */}
                  <div className="lg:w-96 bg-white flex flex-col overflow-hidden">
                    <div className="p-6 space-y-4 flex flex-col h-full overflow-y-auto">
                      {/* Type Badge */}
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                          selectedCreation.type === 'image' 
                            ? 'bg-purple-100 text-purple-700' 
                            : selectedCreation.type === 'video'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {selectedCreation.type === 'image' ? '🖼️ Image' : 
                           selectedCreation.type === 'video' ? '🎬 Video' : '🎵 Music'}
                        </span>
                      </div>

                      {/* Prompt */}
                      {selectedCreation.type !== 'music' && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 mb-2">Prompt</h3>
                          <div className="max-h-32 overflow-y-auto text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                            {selectedCreation.prompt}
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-500">Details</h3>
                        
                        {selectedCreation.metadata?.aspectRatio && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Aspect Ratio:</span>
                            <span className="font-medium text-gray-700">{selectedCreation.metadata.aspectRatio}</span>
                          </div>
                        )}
                        
                        {selectedCreation.metadata?.model && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Model:</span>
                            <span className="font-medium text-gray-700">{selectedCreation.metadata.model}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Created:</span>
                          <span className="font-medium text-gray-700">
                            {new Date(selectedCreation.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Privacy Toggle */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700">Privacy</h4>
                            <p className="text-xs text-gray-500">
                              {selectedCreation.is_public !== false ? '🌍 Public' : '🔒 Private'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              selectedCreation.is_public !== false ? 'bg-green-500' : 'bg-gray-400'
                            }`}></span>
                            <span className="text-xs text-gray-600">
                              {selectedCreation.is_public !== false ? 'Visible to everyone in community' : 'Only visible to you'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            const newPrivacy = selectedCreation.is_public === false;
                            try {
                              await updateCreationPrivacy(selectedCreation.id, newPrivacy);
                              setSelectedCreation({ ...selectedCreation, is_public: newPrivacy });
                              setMyCreations(prev => prev.map(c => 
                                c.id === selectedCreation.id ? { ...c, is_public: newPrivacy } : c
                              ));
                              const { data } = await supabase
                                .from('creations')
                                .select('*')
                                .in('type', ['image', 'video', 'music'])
                                .eq('is_public', true)
                                .order('created_at', { ascending: false })
                                .limit(20);
                              if (data) setCommunityCreations(data);
                            } catch (error) {
                              console.error('Failed to update privacy:', error);
                            }
                          }}
                          className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            selectedCreation.is_public !== false
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                          }`}
                        >
                          {selectedCreation.is_public !== false ? 'Make Private' : 'Make Public'}
                        </button>
                      </div>

                      {/* Download Button */}
                      <a
                        href={selectedCreation.result_url}
                        download
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full-screen Content Creation mode
  if (viewMode === 'content-creation') {
    return <ContentCreation />;
  }

  // Full-screen Generate Video mode
  if (viewMode === 'generate-video') {
    return <GenerateVideo />;
  }

  // Regular chat mode with sidebar
  return (
    <div className="h-screen flex bg-white relative">
      {/* Purple Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10 flex flex-1">
      {/* Sidebar - Hidden on mobile by default, shown on desktop */}
      {showSidebar && (
        <div className="hidden md:block">
          <ChatSidebar
            currentUser={currentUser}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
            onLogout={handleLogout}
            onMyCreations={handleMyCreations}
          />
        </div>
      )}
      
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSidebar(false)}
          />
          {/* Sidebar */}
          <div className="relative w-64 h-full">
            <ChatSidebar
              currentUser={currentUser}
              conversations={conversations}
              activeConversationId={activeConversationId}
              onNewChat={handleNewChat}
              onSelectConversation={handleSelectConversation}
              onLogout={handleLogout}
              onMyCreations={handleMyCreations}
            />
          </div>
        </div>
      )}

      {/* Chat View */}
      <>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Centered Welcome or Messages */}
        <div className="flex-1 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-col h-full">
              {/* Hamburger Menu Button - Top Right (Mobile) / Dashboard Button (Desktop) */}
              <div className="absolute top-4 sm:top-6 right-3 sm:right-6 z-20">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="px-3 sm:px-6 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:border-[#ff4017] hover:shadow-lg transition-all flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-[#ff4017] text-sm sm:text-base font-medium shadow-sm"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              </div>

              {/* Centered Welcome Content */}
              <div className="flex-1 flex items-center justify-center px-2 sm:px-4 md:px-8 min-h-[50vh] md:min-h-[60vh] pb-8 pt-16 sm:pt-8">
              <div className="w-full mx-auto" style={{ width: '95%', maxWidth: '100%' }}>
                {/* Personalized Greeting - Neumorphic */}
                <div className="text-center mb-8 sm:mb-12">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">
                    <span className="text-[#251b18]" style={{
                      textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
                    }}>Hello, </span>
                    <span 
                      className="relative inline-block"
                      style={{
                        color: '#ffffff',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.5)',
                      }}
                    >
                      {currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Creator'}
                    </span>
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600">What would you like to create today?</p>
                </div>

                <style>{`
                  @keyframes glow {
                    0%, 100% {
                      text-shadow: 4px 4px 8px rgba(0,0,0,0.2), -2px -2px 4px rgba(255,255,255,0.8), 0 0 30px rgba(255,64,23,0.5);
                    }
                    50% {
                      text-shadow: 4px 4px 8px rgba(0,0,0,0.2), -2px -2px 4px rgba(255,255,255,0.8), 0 0 40px rgba(255,64,23,0.8);
                    }
                  }
                `}</style>

                {/* Centered Input Box - Neumorphic */}
                {/* Initial Prompt Input - Only show when no messages */}
                <div className="w-full max-w-4xl mx-auto mb-6 sm:mb-8">
                  {/* Use Enhanced AI Chat Input for AI Chat tool */}
                  {selectedTool === 'chat' ? (
                    <EnhancedAIChatInput
                      prompt={prompt}
                      setPrompt={setPrompt}
                      dropdownDirection="down"
                      onSend={async ({ prompt: enhancedPrompt, model }) => {
                        if (!enhancedPrompt.trim() || !currentUser) return;
                        
                        const userMessage = {
                          id: Date.now(),
                          role: 'user',
                          tool: 'chat',
                          content: enhancedPrompt,
                          timestamp: new Date().toLocaleTimeString()
                        };
                        
                        // Create conversation
                        if (messages.length === 0) {
                          const title = enhancedPrompt.slice(0, 50) + (enhancedPrompt.length > 50 ? '...' : '');
                          const newConv = await createConversation(currentUser.uid, title);
                          if (newConv) {
                            setCurrentSupabaseConversationId(newConv.id);
                            setConversations([newConv, ...conversations]);
                            setActiveConversationId(newConv.id);
                            await saveMessage(newConv.id, 'user', enhancedPrompt, 'chat');
                          }
                        }
                        
                        // Add user message
                        setMessages(prev => [...prev, userMessage]);
                        setPrompt('');
                        
                        // Create AI response placeholder
                        const aiMessageId = Date.now() + 1;
                        setMessages(prev => [...prev, {
                          id: aiMessageId,
                          role: 'assistant',
                          tool: 'chat',
                          content: '⏳ Thinking...',
                          timestamp: new Date().toLocaleTimeString(),
                          isLoading: true
                        }]);
                        
                        // Build conversation history
                        const conversationHistory = messages.filter(m => m.tool === 'chat').map(m => ({
                          role: m.role,
                          content: m.content
                        }));
                        
                        // Call AI chat with selected model
                        try {
                          const result = await handleAIRequest('chat', enhancedPrompt, (update) => {
                            setMessages(prev => prev.map(msg => 
                              msg.id === aiMessageId 
                                ? { ...msg, content: update.content, isLoading: update.type === 'status' }
                                : msg
                            ));
                          }, conversationHistory, model);
                          
                          if (result.success) {
                            setMessages(prev => prev.map(msg => 
                              msg.id === aiMessageId 
                                ? { 
                                    ...msg, 
                                    content: result.content, 
                                    sources: result.sources,
                                    isLoading: false 
                                  }
                                : msg
                            ));
                          }
                        } catch (error) {
                          console.error('AI chat error:', error);
                          setMessages(prev => prev.map(msg => 
                            msg.id === aiMessageId 
                              ? { ...msg, content: `Error: ${error.message}`, isLoading: false }
                              : msg
                          ));
                        }
                      }}
                      onFileUpload={handleFileUpload}
                    />
                  ) : selectedTool === 'image' ? (
                    <EnhancedImageChatInput
                      prompt={prompt}
                      setPrompt={setPrompt}
                      dropdownDirection="down"
                      onSend={async ({ prompt: enhancedPrompt, model, aspectRatio }) => {
                        if (!enhancedPrompt.trim() || !currentUser) return;
                        
                        const userMessage = {
                          id: Date.now(),
                          role: 'user',
                          tool: 'image',
                          content: enhancedPrompt,
                          timestamp: new Date().toLocaleTimeString()
                        };
                        
                        // Create conversation
                        if (messages.length === 0) {
                          const title = enhancedPrompt.slice(0, 50) + (enhancedPrompt.length > 50 ? '...' : '');
                          const newConv = await createConversation(currentUser.uid, title);
                          if (newConv) {
                            setCurrentSupabaseConversationId(newConv.id);
                            setConversations([newConv, ...conversations]);
                            setActiveConversationId(newConv.id);
                            await saveMessage(newConv.id, 'user', enhancedPrompt, 'image');
                          }
                        }
                        
                        // Add user message
                        setMessages(prev => [...prev, userMessage]);
                        setPrompt('');
                        
                        // Create AI response placeholder
                        const aiMessageId = Date.now() + 1;
                        setMessages(prev => [...prev, {
                          id: aiMessageId,
                          role: 'assistant',
                          tool: 'image',
                          content: '⏳ Generating image...',
                          timestamp: new Date().toLocaleTimeString(),
                          isLoading: true
                        }]);
                        
                        // Call image generation with model and aspect ratio
                        try {
                          const result = await handleAIRequest('image', enhancedPrompt, (update) => {
                            setMessages(prev => prev.map(msg => 
                              msg.id === aiMessageId 
                                ? { ...msg, content: update.content, isLoading: update.type === 'status' }
                                : msg
                            ));
                          }, [], model, aspectRatio);
                          
                          if (result.success) {
                            setMessages(prev => prev.map(msg => 
                              msg.id === aiMessageId 
                                ? { 
                                    ...msg, 
                                    content: result.content, 
                                    type: 'image',
                                    imageUrl: result.content,
                                    isLoading: false 
                                  }
                                : msg
                            ));
                            
                            // Save image creation to Supabase
                            if (currentUser && result.type === 'image') {
                              await saveCreation(
                                currentUser.uid,
                                'image',
                                enhancedPrompt,
                                result.content,
                                {
                                  model: model,
                                  aspectRatio: aspectRatio,
                                  timestamp: new Date().toISOString()
                                }
                              );
                              console.log('✅ Saved image creation to Supabase');
                              
                              // Refresh community creations
                              const { data } = await supabase
                                .from('creations')
                                .select('*')
                                .in('type', ['image', 'video', 'music'])
                                .eq('is_public', true)
                                .order('created_at', { ascending: false })
                                .limit(20);
                              
                              if (data) {
                                setCommunityCreations(data);
                              }
                            }
                          }
                        } catch (error) {
                          console.error('Image generation error:', error);
                          setMessages(prev => prev.map(msg => 
                            msg.id === aiMessageId 
                              ? { ...msg, content: `Error: ${error.message}`, isLoading: false }
                              : msg
                          ));
                        }
                      }}
                      onFileUpload={handleFileUpload}
                    />
                  ) : selectedTool === 'video' ? (
                    <EnhancedVideoChatInput
                      prompt={prompt}
                      setPrompt={setPrompt}
                      dropdownDirection="down"
                      onSend={async ({ prompt: enhancedPrompt, model, aspectRatio, duration }) => {
                        if (!enhancedPrompt.trim() || !currentUser) return;
                        
                        const userMessage = {
                          id: Date.now(),
                          role: 'user',
                          tool: 'video',
                          content: enhancedPrompt,
                          timestamp: new Date().toLocaleTimeString()
                        };
                        
                        // Create conversation
                        if (messages.length === 0) {
                          const title = enhancedPrompt.slice(0, 50) + (enhancedPrompt.length > 50 ? '...' : '');
                          const newConv = await createConversation(currentUser.uid, title);
                          if (newConv) {
                            setCurrentSupabaseConversationId(newConv.id);
                            setConversations([newConv, ...conversations]);
                            setActiveConversationId(newConv.id);
                            await saveMessage(newConv.id, 'user', enhancedPrompt, 'video');
                          }
                        }
                        
                        // Add user message
                        setMessages(prev => [...prev, userMessage]);
                        setPrompt('');
                        
                        // Create AI response placeholder
                        const aiMessageId = Date.now() + 1;
                        setMessages(prev => [...prev, {
                          id: aiMessageId,
                          role: 'assistant',
                          tool: 'video',
                          content: '⏳ Generating video...',
                          timestamp: new Date().toLocaleTimeString(),
                          isLoading: true
                        }]);
                        
                        // Call video generation with model, aspect ratio, and duration
                        try {
                          const result = await handleAIRequest('video', enhancedPrompt, (update) => {
                            setMessages(prev => prev.map(msg => 
                              msg.id === aiMessageId 
                                ? { ...msg, content: update.content, isLoading: update.type === 'status' }
                                : msg
                            ));
                          }, [], model, aspectRatio, duration);
                          
                          if (result.success) {
                            setMessages(prev => prev.map(msg => 
                              msg.id === aiMessageId 
                                ? { 
                                    ...msg, 
                                    content: result.content, 
                                    type: 'video',
                                    videoUrl: result.content,
                                    isLoading: false 
                                  }
                                : msg
                            ));
                            
                            // Save video creation to Supabase
                            if (currentUser && result.type === 'video') {
                              await saveCreation(
                                currentUser.uid,
                                'video',
                                enhancedPrompt,
                                result.content,
                                {
                                  model: model,
                                  aspectRatio: aspectRatio,
                                  duration: duration,
                                  timestamp: new Date().toISOString()
                                }
                              );
                              console.log('✅ Saved video creation to Supabase');
                              
                              // Refresh community creations
                              const { data } = await supabase
                                .from('creations')
                                .select('*')
                                .in('type', ['image', 'video', 'music'])
                                .eq('is_public', true)
                                .order('created_at', { ascending: false })
                                .limit(20);
                              
                              if (data) {
                                setCommunityCreations(data);
                              }
                            }
                          }
                        } catch (error) {
                          console.error('Video generation error:', error);
                          setMessages(prev => prev.map(msg => 
                            msg.id === aiMessageId 
                              ? { ...msg, content: `Error: ${error.message}`, isLoading: false }
                              : msg
                          ));
                        }
                      }}
                      onFileUpload={handleFileUpload}
                    />
                  ) : (
                    <div className="relative bg-white rounded-2xl transition-all border border-gray-200 shadow-sm hover:shadow-md">
                      {/* Attached Files Display */}
                      {attachedFiles.length > 0 && (
                        <div className="px-6 pt-4 pb-2 flex flex-wrap gap-2">
                          {attachedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-xs">
                              <span>📎</span>
                              <span className="text-gray-700">{file.name}</span>
                              <button
                                onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== index))}
                                className="text-gray-500 hover:text-red-500"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Ask DAG GPT anything or describe what you want to create..."
                        className="w-full px-6 py-5 text-base resize-none focus:outline-none rounded-t-2xl bg-transparent text-gray-800 placeholder-gray-400"
                        rows="3"
                      />
                      
                      {/* Action Bar */}
                      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {/* File Attachment */}
                          <div className="relative">
                            <input
                              type="file"
                              id="file-upload"
                              multiple
                              onChange={handleFileUpload}
                              className="hidden"
                              accept="*/*"
                            />
                            <label
                              htmlFor="file-upload"
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              title="Attach files"
                            >
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                            </label>
                          </div>

                          {/* Voice Input - Prominent */}
                          <div className="p-2 hover:bg-orange-50 rounded-lg transition-colors">
                            <VoiceInputButton 
                              onTranscript={(text) => setPrompt(prev => prev ? prev + ' ' + text : text)}
                              className="!text-[#ff4017] hover:!text-[#ff6b47] [&>svg]:!w-5 [&>svg]:!h-5"
                            />
                          </div>
                        </div>

                        {/* Send Button */}
                        <button
                          onClick={handleSend}
                          disabled={!prompt.trim()}
                          className="px-6 py-2 bg-[#ff4017] hover:bg-[#ff6b47] text-white rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                        >
                          <span>Send</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer Note */}
                  <p className="text-xs text-gray-500 text-center mt-4">
                    DAG GPT uses advanced AI models. Always verify important information.
                  </p>
                </div>
                </div>
              </div>

              {/* Tool Grid - Single Row with More Tools - Outside centered container */}
              <div className="w-full px-3 sm:px-4 md:px-8 pb-6 sm:pb-8 mt-6 sm:mt-8">
                <div className="max-w-6xl mx-auto">
                  {/* Single Row: 7 Active Tools + More Tools */}
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                  {tools.filter(t => !t.comingSoon).map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => {
                        if (tool.comingSoon) return; // Disable click for coming soon
                        
                        // Map tool IDs to URL paths
                        const toolPaths = {
                          'chat': '/dashboard/ai-chat',
                          'image': '/dashboard/generate-image',
                          'video': '/dashboard/generate-video',
                          'music': '/dashboard/generate-music',
                          'website': '/dashboard/build-website',
                          'webapp': '/dashboard/build-webapp',
                          'socialmedia': '/dashboard/social-media',
                          'contentcreation': '/dashboard/content-creation'
                        };
                        
                        const path = toolPaths[tool.id] || '/dashboard';
                        
                        // Open in new tab
                        window.open(path, '_blank');
                      }}
                      className={`group flex flex-col items-center gap-2 transition-all relative ${tool.comingSoon ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      {/* Circular Icon */}
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-md"
                        style={{
                          backgroundColor: selectedTool === tool.id ? `${tool.color}30` : '#ffffff',
                          color: tool.color,
                          border: selectedTool === tool.id ? `2px solid ${tool.color}` : '2px solid #e5e7eb',
                          boxShadow: selectedTool === tool.id 
                            ? `0 4px 12px ${tool.color}40, 0 0 0 3px ${tool.color}20`
                            : '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {tool.icon}
                      </div>
                      
                      {/* Label Below */}
                      <div 
                        className="text-[10px] sm:text-xs font-semibold text-center transition-colors w-[70px] sm:w-[90px]"
                        style={{
                          color: selectedTool === tool.id ? tool.color : '#374151'
                        }}
                      >
                        <div className="h-[28px] sm:h-[32px] flex items-center justify-center leading-tight">
                          {tool.label}
                        </div>
                        {tool.comingSoon && (
                          <span className="block text-[11px] text-amber-700 font-extrabold mt-0.5" style={{ letterSpacing: '0.02em' }}>
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  
                  {/* More Tools Button with Hover Dropdown */}
                  <div className="relative group">
                    <button className="flex flex-col items-center gap-2 transition-all">
                      {/* Circular Icon with Grid */}
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-md bg-white border-2 border-gray-200 group-hover:border-indigo-500"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      >
                        <svg className="w-6 h-6 text-gray-600 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </div>
                      
                      {/* Label Below */}
                      <div className="text-[10px] sm:text-xs font-semibold text-center text-gray-700 group-hover:text-indigo-600 transition-colors w-[70px] sm:w-[90px]">
                        <div className="h-[28px] sm:h-[32px] flex items-center justify-center leading-tight">
                          More Tools
                        </div>
                      </div>
                    </button>
                    
                    {/* Hover Dropdown - Coming Soon Tools */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 sm:p-6 min-w-[280px] sm:min-w-[400px]">
                        <h3 className="text-sm font-bold text-gray-800 mb-4 text-center">Coming Soon</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {tools.filter(t => t.comingSoon).map((tool) => (
                            <div
                              key={tool.id}
                              className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 opacity-60"
                            >
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: `${tool.color}20`,
                                  color: tool.color
                                }}
                              >
                                {tool.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-gray-700 truncate">{tool.label}</div>
                                <div className="text-[10px] text-amber-600 font-bold">Coming Soon</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              {/* Community Creations Grid - Full Width */}
              {communityCreations.length > 0 && messages.length === 0 && (
                <div className="w-full px-3 sm:px-4 md:px-8 pb-12 sm:pb-16 pt-8 sm:pt-12">
                  <div className="w-full">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 auto-rows-[140px] sm:auto-rows-[160px]">
                      {communityCreations.map((creation, index) => {
                        // Randomize row spans for masonry effect
                        const rowSpans = ['row-span-1', 'row-span-2', 'row-span-1', 'row-span-2'];
                        const randomRowSpan = rowSpans[index % rowSpans.length];
                        
                        return (
                          <div
                            key={creation.id}
                            onClick={() => {
                              setSelectedCreation(creation);
                              setCreationModalOpen(true);
                            }}
                            className={`relative ${randomRowSpan} rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group`}
                          >
                            {creation.type === 'image' ? (
                              <img
                                src={creation.result_url}
                                alt={creation.prompt}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : creation.type === 'video' ? (
                              <video
                                src={creation.result_url}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                onMouseEnter={(e) => e.target.play()}
                                onMouseLeave={(e) => e.target.pause()}
                              />
                            ) : creation.type === 'music' ? (
                              <div className="relative w-full h-full">
                                {/* Cover Art */}
                                <img
                                  src={creation.metadata?.coverArt || 'https://via.placeholder.com/400x400/6366f1/ffffff?text=Music'}
                                  alt={creation.prompt}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {/* Music Icon Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                                    <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z"/>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            ) : null}
                            
                            {/* Privacy Badge - Only show for user's own creations */}
                            {creation.user_id === currentUser?.uid && (
                              <div className="absolute top-2 right-2 z-10">
                                {creation.is_public ? (
                                  <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg flex items-center gap-1">
                                    🌍 Public
                                  </span>
                                ) : (
                                  <span className="bg-gray-700/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg flex items-center gap-1">
                                    🔒 Private
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Overlay with prompt */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-white text-sm line-clamp-2">
                                  {creation.prompt}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mx-auto p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 w-full sm:w-[90%] md:w-[85%] lg:w-[75%] pb-32 md:pb-8">
              {/* Hamburger Menu Button - Top Right - Mobile Only */}
              <div className="md:hidden fixed top-4 right-3 z-40">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-[#ff4017] hover:shadow-lg transition-all flex items-center gap-1 text-gray-700 hover:text-[#ff4017] text-sm font-medium shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-2 sm:gap-4">
                  <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-gray-600 to-gray-700' 
                      : 'bg-gradient-to-br from-[#ff4017] to-[#ff6b47]'
                  }`}>
                    {msg.role === 'user' ? '👤' : tools.find(t => t.id === msg.tool)?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm">
                      {/* Text Content */}
                      {(!msg.type || msg.type === 'text' || msg.type === 'code' || msg.type === 'research') && (
                        <div className="text-gray-800 prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-800 prose-p:leading-relaxed prose-p:my-4 prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-li:leading-relaxed prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
                          {msg.isLoading && <span className="inline-block animate-pulse">⏳</span>}
                          {!msg.isLoading && (
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const language = match ? match[1] : '';
                                  
                                  return !inline ? (
                                    <div className="relative group my-5 rounded-lg overflow-hidden border border-gray-200">
                                      {/* Language Label & Copy Button */}
                                      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200">
                                        <span className="text-xs font-mono text-gray-600 uppercase font-semibold">{language || 'code'}</span>
                                        <button
                                          onClick={() => navigator.clipboard.writeText(String(children))}
                                          className="px-2 py-1 bg-white hover:bg-gray-50 text-gray-700 text-xs rounded border border-gray-200 transition-colors flex items-center gap-1"
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                          </svg>
                                          Copy
                                        </button>
                                      </div>
                                      <pre className="bg-gray-50 p-4 overflow-x-auto">
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      </pre>
                                    </div>
                                  ) : (
                                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                table({ children }) {
                                  return (
                                    <div className="overflow-x-auto my-5">
                                      <table className="min-w-full border-collapse border border-gray-300">
                                        {children}
                                      </table>
                                    </div>
                                  );
                                },
                                thead({ children }) {
                                  return <thead className="bg-gray-100">{children}</thead>;
                                },
                                tbody({ children }) {
                                  return <tbody className="bg-white">{children}</tbody>;
                                },
                                tr({ children }) {
                                  return <tr className="border-b border-gray-200">{children}</tr>;
                                },
                                th({ children }) {
                                  return (
                                    <th className="px-4 py-3 text-left text-gray-900 font-semibold border border-gray-300">
                                      {children}
                                    </th>
                                  );
                                },
                                td({ children }) {
                                  return (
                                    <td className="px-4 py-3 text-gray-700 border border-gray-300">
                                      {children}
                                    </td>
                                  );
                                },
                                p({ children }) {
                                  return <p className="mb-4 last:mb-0 leading-relaxed text-[15px]">{children}</p>;
                                },
                                h1({ children }) {
                                  return <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-gray-900">{children}</h1>;
                                },
                                h2({ children }) {
                                  return <h2 className="text-xl font-bold mb-3 mt-5 text-gray-900">{children}</h2>;
                                },
                                h3({ children }) {
                                  return <h3 className="text-lg font-semibold mb-3 mt-4 text-gray-900">{children}</h3>;
                                },
                                ul({ children }) {
                                  return <ul className="list-disc ml-5 mb-4 space-y-2">{children}</ul>;
                                },
                                ol({ children }) {
                                  return <ol className="list-decimal ml-5 mb-4 space-y-2">{children}</ol>;
                                },
                                li({ children }) {
                                  return <li className="leading-relaxed text-[15px] pl-1">{children}</li>;
                                },
                                blockquote({ children }) {
                                  return <blockquote className="border-l-4 border-indigo-500 pl-4 my-4 italic text-gray-600">{children}</blockquote>;
                                }
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      )}
                      
                      {/* Image Content - Display single image */}
                      {msg.type === 'image' && (msg.imageUrl || msg.images) && (
                        <div className="w-full max-w-2xl">
                          {(() => {
                            console.log('🖼️ Image message data:', { images: msg.images, imageUrl: msg.imageUrl });
                            return (msg.images || [msg.imageUrl]).map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={imageUrl} 
                                alt={`Generated ${index + 1}`} 
                                className="w-full rounded-lg sm:rounded-xl shadow-md cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => {
                                  setSelectedImage(imageUrl);
                                  setImageModalOpen(true);
                                }}
                              />
                              <a
                                href={imageUrl}
                                download={`generated-image-${index + 1}.png`}
                                className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </a>
                            </div>
                          ));
                          })()}
                        </div>
                      )}
                      
                      {/* Model Selection (Video) */}
                      {msg.type === 'model-selection' && msg.models && (
                        <div>
                          <p className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">{msg.content}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {msg.models.map((model) => {
                              const credits = getModelCredits(model.key);
                              return (
                              <button
                                key={model.key}
                                onClick={() => handleModelSelection(model.key, msg.videoPrompt, msg.id, false)}
                                className="p-3 sm:p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg sm:rounded-xl hover:border-[#ff4017] hover:shadow-lg transition-all text-left group"
                              >
                                <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-[#ff4017]">{model.name}</h4>
                                  <div className="flex flex-col items-end gap-1">
                                    {credits > 0 && (
                                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                                        💎 {credits}
                                      </span>
                                    )}
                                    {model.free ? (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">FREE</span>
                                    ) : (
                                      <span className="text-xs bg-orange-100 text-[#ff4017] px-2 py-1 rounded-full">PRO</span>
                                    )}
                                  </div>
                                </div>
                                {model.provider && (
                                  <p className="text-xs text-gray-500 mb-1">{model.provider}</p>
                                )}
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs text-gray-600">
                                  <span className="inline-flex items-center gap-1">
                                    <span className="inline-block w-3 h-3 border border-gray-400 rounded-sm" />
                                    {model.resolution}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <span className="inline-block w-3 h-3 border border-gray-400 rounded-full" />
                                    {model.duration}
                                  </span>
                                  {model.audio && (
                                    <span className="inline-flex items-center gap-1">
                                      <span className="inline-block w-3 h-3 border border-gray-400 rounded-full" />
                                      Audio
                                    </span>
                                  )}
                                </div>
                              </button>
                            )})}
                          </div>
                        </div>
                      )}

                      {/* Image Model Selection (Create Image tool) */}
                      {msg.type === 'image-model-selection' && msg.models && (
                        <div>
                          <p className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">{msg.content}</p>
                          <div className="mb-3 sm:mb-4">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Enhanced prompt (editable)</label>
                            <textarea
                              className="w-full border border-gray-200 rounded-lg p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4017]/60"
                              defaultValue={msg.prompt}
                              rows={3}
                              onBlur={(e) => {
                                const updated = e.target.value;
                                setMessages(prev => prev.map(m => 
                                  m.id === msg.id ? { ...m, prompt: updated } : m
                                ));
                              }}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {msg.models.map((model) => (
                              <button
                                key={model.key}
                                onClick={() => handleModelSelection(model.key, msg.prompt, msg.id, true)}
                                className={`p-3 sm:p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg sm:rounded-xl transition-all text-left group ${
                                  model.enabled ? 'hover:border-[#ff4017] hover:shadow-lg cursor-pointer' : 'opacity-60 cursor-not-allowed'
                                }`}
                                disabled={!model.enabled}
                              >
                                <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                                  <div>
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-[#ff4017]">{model.name}</h4>
                                    {model.provider && (
                                      <p className="text-xs text-gray-500 mt-0.5">{model.provider}</p>
                                    )}
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded-full ${model.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {model.enabled ? 'LIVE' : 'PLANNED'}
                                  </span>
                                </div>
                                {model.description && (
                                  <p className="text-xs text-gray-600 mb-2">{model.description}</p>
                                )}
                                <div className="flex gap-2 text-[11px] text-gray-600">
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                                      <rect x="5" y="6" width="3" height="4" rx="0.8" stroke="currentColor" strokeWidth="1" />
                                    </svg>
                                    Flexible ratios
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
                                      <path d="M8 4v4l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Async task
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Aspect Ratio Selection */}
                      {msg.type === 'aspect-ratio-selection' && msg.ratios && (
                        <div>
                          <p className="text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">{msg.content}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {msg.ratios.map((ratio) => (
                              <button
                                key={ratio.key}
                                onClick={() => handleAspectRatioSelection(ratio.key, msg.prompt, msg.id, msg.model)}
                                className="p-3 sm:p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg sm:rounded-xl hover:border-[#ff4017] hover:shadow-lg transition-all text-left group"
                              >
                                <div className="flex items-start gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                                  <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-gray-300 bg-gray-50 text-[10px] sm:text-[11px] font-semibold text-gray-700">
                                    {ratio.icon || ratio.key.replace('_', ':')}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-[#ff4017]">{ratio.name}</h4>
                                    <p className="text-xs text-gray-600 mt-1">{ratio.description}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Video Content */}
                      {msg.type === 'video' && msg.content && (
                        <div className="w-full">
                          <video 
                            src={msg.content} 
                            controls 
                            className="w-full rounded-lg sm:rounded-xl shadow-md"
                            playsInline
                          />
                        </div>
                      )}
                      
                      {/* Website Preview */}
                      {msg.type === 'website' && msg.websiteHtml && (
                        <div>
                          <div className="bg-gray-100 p-4 rounded-lg mb-3 max-h-96 overflow-auto">
                            <iframe
                              srcDoc={msg.websiteHtml}
                              className="w-full h-96 border-0 rounded"
                              title="Website Preview"
                            />
                          </div>
                          <details className="text-sm">
                            <summary className="cursor-pointer text-[#ff4017] font-semibold">View HTML Code</summary>
                            <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg mt-2 overflow-x-auto text-xs border border-gray-200">
                              {msg.websiteHtml}
                            </pre>
                          </details>
                        </div>
                      )}
                      
                      {/* Research Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Sources:</p>
                          <ul className="space-y-1">
                            {msg.sources.map((source, idx) => (
                              <li key={idx} className="text-xs">
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[#ff4017] hover:underline"
                                >
                                  {source.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Input Box - Shows when messages exist - Fixed at bottom on mobile */}
        {messages.length > 0 && (
          <div className="border-t border-gray-200 bg-white p-2 sm:p-4 shadow-lg fixed md:relative bottom-0 left-0 right-0 z-30 md:z-auto">
            <div className="w-full max-w-4xl mx-auto">
              {selectedTool === 'chat' ? (
                <EnhancedAIChatInput
                  prompt={prompt}
                  setPrompt={setPrompt}
                  dropdownDirection="up"
                  onSend={async ({ prompt: enhancedPrompt, model }) => {
                    if (!enhancedPrompt.trim() || !currentUser) return;
                    
                    const userMessage = {
                      id: Date.now(),
                      role: 'user',
                      tool: 'chat',
                      content: enhancedPrompt,
                      timestamp: new Date().toLocaleTimeString()
                    };
                    
                    // Add user message
                    setMessages(prev => [...prev, userMessage]);
                    setPrompt('');
                    
                    // Save to Supabase
                    if (currentSupabaseConversationId) {
                      await saveMessage(currentSupabaseConversationId, 'user', enhancedPrompt, 'chat');
                    }
                    
                    // Create AI response placeholder
                    const aiMessageId = Date.now() + 1;
                    setMessages(prev => [...prev, {
                      id: aiMessageId,
                      role: 'assistant',
                      tool: 'chat',
                      content: '⏳ Thinking...',
                      timestamp: new Date().toLocaleTimeString(),
                      isLoading: true
                    }]);
                    
                    // Build conversation history
                    const conversationHistory = messages.filter(m => m.tool === 'chat').map(m => ({
                      role: m.role,
                      content: m.content
                    }));
                    
                    // Call AI chat with selected model
                    try {
                      const result = await handleAIRequest('chat', enhancedPrompt, (update) => {
                        setMessages(prev => prev.map(msg => 
                          msg.id === aiMessageId 
                            ? { ...msg, content: update.content, isLoading: update.type === 'status' }
                            : msg
                        ));
                      }, conversationHistory, model);
                      
                      if (result.success) {
                        setMessages(prev => prev.map(msg => 
                          msg.id === aiMessageId 
                            ? { 
                                ...msg, 
                                content: result.content, 
                                sources: result.sources,
                                isLoading: false 
                              }
                            : msg
                        ));
                        
                        // Save to Supabase
                        if (currentSupabaseConversationId) {
                          await saveMessage(currentSupabaseConversationId, 'assistant', result.content, 'chat');
                        }
                      }
                    } catch (error) {
                      console.error('AI chat error:', error);
                      setMessages(prev => prev.map(msg => 
                        msg.id === aiMessageId 
                          ? { ...msg, content: `Error: ${error.message}`, isLoading: false }
                          : msg
                      ));
                    }
                  }}
                  onFileUpload={handleFileUpload}
                />
              ) : selectedTool === 'image' ? (
                <EnhancedImageChatInput
                  prompt={prompt}
                  setPrompt={setPrompt}
                  dropdownDirection="up"
                  onSend={async ({ prompt: enhancedPrompt, model, aspectRatio }) => {
                    if (!enhancedPrompt.trim() || !currentUser) return;
                    
                    const userMessage = {
                      id: Date.now(),
                      role: 'user',
                      tool: 'image',
                      content: enhancedPrompt,
                      timestamp: new Date().toLocaleTimeString()
                    };
                    
                    // Add user message
                    setMessages(prev => [...prev, userMessage]);
                    setPrompt('');
                    
                    // Save to Supabase
                    if (currentSupabaseConversationId) {
                      await saveMessage(currentSupabaseConversationId, 'user', enhancedPrompt, 'image');
                    }
                    
                    // Create AI response placeholder
                    const aiMessageId = Date.now() + 1;
                    setMessages(prev => [...prev, {
                      id: aiMessageId,
                      role: 'assistant',
                      tool: 'image',
                      content: '⏳ Generating image...',
                      timestamp: new Date().toLocaleTimeString(),
                      isLoading: true
                    }]);
                    
                    // Call image generation with model and aspect ratio
                    try {
                      const result = await handleAIRequest('image', enhancedPrompt, (update) => {
                        setMessages(prev => prev.map(msg => 
                          msg.id === aiMessageId 
                            ? { ...msg, content: update.content, isLoading: update.type === 'status' }
                            : msg
                        ));
                      }, [], model, aspectRatio);
                      
                      if (result.success) {
                        setMessages(prev => prev.map(msg => 
                          msg.id === aiMessageId 
                            ? { 
                                ...msg, 
                                content: result.content, 
                                type: 'image',
                                imageUrl: result.content,
                                isLoading: false 
                              }
                            : msg
                        ));
                        
                        // Save to Supabase
                        if (currentSupabaseConversationId) {
                          await saveMessage(currentSupabaseConversationId, 'assistant', result.content, 'image', { type: 'image' });
                        }
                      }
                    } catch (error) {
                      console.error('Image generation error:', error);
                      setMessages(prev => prev.map(msg => 
                        msg.id === aiMessageId 
                          ? { ...msg, content: `Error: ${error.message}`, isLoading: false }
                          : msg
                      ));
                    }
                  }}
                  onFileUpload={handleFileUpload}
                />
              ) : selectedTool === 'video' ? (
                <EnhancedVideoChatInput
                  prompt={prompt}
                  setPrompt={setPrompt}
                  dropdownDirection="up"
                  onSend={async ({ prompt: enhancedPrompt, model, aspectRatio, duration }) => {
                    if (!enhancedPrompt.trim() || !currentUser) return;
                    
                    const userMessage = {
                      id: Date.now(),
                      role: 'user',
                      tool: 'video',
                      content: enhancedPrompt,
                      timestamp: new Date().toLocaleTimeString()
                    };
                    
                    // Add user message
                    setMessages(prev => [...prev, userMessage]);
                    setPrompt('');
                    
                    // Save to Supabase
                    if (currentSupabaseConversationId) {
                      await saveMessage(currentSupabaseConversationId, 'user', enhancedPrompt, 'video');
                    }
                    
                    // Create AI response placeholder
                    const aiMessageId = Date.now() + 1;
                    setMessages(prev => [...prev, {
                      id: aiMessageId,
                      role: 'assistant',
                      tool: 'video',
                      content: '⏳ Generating video...',
                      timestamp: new Date().toLocaleTimeString(),
                      isLoading: true
                    }]);
                    
                    // Call video generation with model, aspect ratio, and duration
                    try {
                      const result = await handleAIRequest('video', enhancedPrompt, (update) => {
                        setMessages(prev => prev.map(msg => 
                          msg.id === aiMessageId 
                            ? { ...msg, content: update.content, isLoading: update.type === 'status' }
                            : msg
                        ));
                      }, [], model, aspectRatio, duration);
                      
                      if (result.success) {
                        setMessages(prev => prev.map(msg => 
                          msg.id === aiMessageId 
                            ? { 
                                ...msg, 
                                content: result.content, 
                                type: 'video',
                                videoUrl: result.content,
                                isLoading: false 
                              }
                            : msg
                        ));
                        
                        // Save to Supabase
                        if (currentSupabaseConversationId) {
                          await saveMessage(currentSupabaseConversationId, 'assistant', result.content, 'video', { type: 'video' });
                        }
                      }
                    } catch (error) {
                      console.error('Video generation error:', error);
                      setMessages(prev => prev.map(msg => 
                        msg.id === aiMessageId 
                          ? { ...msg, content: `Error: ${error.message}`, isLoading: false }
                          : msg
                      ));
                    }
                  }}
                  onFileUpload={handleFileUpload}
                />
              ) : (
                <div className="relative bg-white rounded-2xl border-2 border-gray-200">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Message DAG GPT..."
                    className="w-full px-6 py-4 text-base resize-none focus:outline-none rounded-2xl bg-transparent text-gray-800 placeholder-gray-400"
                    rows="2"
                  />
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <input
                        type="file"
                        id="file-upload-bottom"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="file-upload-bottom"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Attach files"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </label>
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!prompt.trim()}
                      className="p-2 bg-[#ff4017] hover:bg-[#ff6b47] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Voice Mode Modal - Animated Particle Globe */}
      {showVoiceMode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowVoiceMode(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()} style={{
            boxShadow: '20px 20px 40px rgba(0,0,0,0.2), -20px -20px 40px rgba(255,255,255,0.9)'
          }}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[#251b18] mb-2">Voice Mode</h3>
              <p className="text-sm text-gray-600">Talk naturally with DAG GPT</p>
            </div>

            {/* Animated Particle Globe */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Outer Ring */}
                <div className={`absolute w-64 h-64 rounded-full border-2 border-[#ff4017]/30 ${isVoiceModeActive ? 'animate-ping' : ''}`}></div>
                
                {/* Middle Ring */}
                <div className={`absolute w-48 h-48 rounded-full border-2 border-[#ff4017]/50 ${isVoiceModeActive ? 'animate-pulse' : ''}`}></div>
                
                {/* Inner Globe - Animated */}
                <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-[#ff4017] to-[#ff6b47] flex items-center justify-center" style={{
                  boxShadow: '0 0 40px rgba(255,64,23,0.6), inset 0 0 20px rgba(255,255,255,0.3)',
                  animation: isVoiceModeActive ? 'pulse 1.5s ease-in-out infinite' : 'none'
                }}>
                  {/* Particle Effect */}
                  <div className="relative w-full h-full">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `rotate(${i * 30}deg) translateY(-${isVoiceModeActive ? '40px' : '20px'})`,
                          opacity: isVoiceModeActive ? 0.8 : 0.3,
                          transition: 'all 0.3s ease-in-out',
                          animation: isVoiceModeActive ? `float ${1 + i * 0.1}s ease-in-out infinite` : 'none'
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Microphone Icon */}
                  <svg className="w-12 h-12 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-[#251b18] mb-1">
                {isVoiceModeActive ? 'Listening...' : 'Tap to start'}
              </p>
              <p className="text-xs text-gray-500">
                {isVoiceModeActive ? 'Speak naturally, I\'m listening' : 'Click the globe to activate voice mode'}
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
              <button
                onClick={toggleVoiceModeRecording}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#ff4017] to-[#ff6b47] text-white rounded-xl font-semibold transition-all"
                style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -2px -2px 6px rgba(255,100,70,0.3)'
                }}
              >
                {isVoiceModeActive ? 'Stop Listening' : 'Start Listening'}
              </button>
              <button
                onClick={() => {
                  setShowVoiceMode(false);
                  setIsVoiceModeActive(false);
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <a
                href={selectedImage}
                download="generated-image.png"
                className="p-3 bg-white hover:bg-gray-100 rounded-lg shadow-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
              <button
                onClick={() => setImageModalOpen(false)}
                className="p-3 bg-white hover:bg-gray-100 rounded-lg shadow-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      </>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(-20px);
          }
          50% {
            transform: translateY(-40px);
          }
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Creation Modal/Lightbox */}
      {creationModalOpen && selectedCreation && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setCreationModalOpen(false)}
        >
          <div 
            className="relative max-w-7xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setCreationModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Media */}
                <div className="flex-1 bg-black flex items-center justify-center p-4">
                  {selectedCreation.type === 'image' ? (
                    <img
                      src={selectedCreation.result_url}
                      alt={selectedCreation.prompt}
                      className="max-w-full max-h-[70vh] object-contain"
                      onError={(e) => {
                        console.error('❌ Image failed to load:', selectedCreation.result_url);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="text-white text-center"><p class="text-xl mb-2">⚠️ Image failed to load</p><p class="text-sm text-gray-400">${selectedCreation.result_url}</p></div>`;
                      }}
                    />
                  ) : selectedCreation.type === 'video' ? (
                    <video
                      src={selectedCreation.result_url}
                      className="max-w-full max-h-[70vh] object-contain"
                      controls
                      autoPlay
                      loop
                      onError={(e) => {
                        console.error('❌ Video failed to load:', selectedCreation.result_url);
                      }}
                    />
                  ) : selectedCreation.type === 'music' ? (
                    <div className="flex flex-col items-center justify-center w-full max-w-sm space-y-4 p-8">
                      {/* Cover Art */}
                      <div className="relative w-64 h-64 rounded-2xl overflow-hidden shadow-2xl">
                        <img
                          src={selectedCreation.metadata?.coverArt || 'https://via.placeholder.com/400x400/6366f1/ffffff?text=Music'}
                          alt={selectedCreation.prompt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Audio Player */}
                      <div className="w-full space-y-2">
                        <audio
                          key={selectedCreation.result_url}
                          src={selectedCreation.result_url}
                          controls
                          autoPlay
                          crossOrigin="anonymous"
                          className="w-full"
                          style={{
                            filter: 'invert(1) hue-rotate(180deg)',
                            borderRadius: '8px'
                          }}
                          onError={(e) => {
                            console.error('❌ Audio playback error:', e);
                            console.error('❌ Audio URL:', selectedCreation.result_url);
                            console.error('❌ Error details:', e.target.error);
                          }}
                          onLoadedData={() => {
                            console.log('✅ Audio loaded successfully:', selectedCreation.result_url);
                          }}
                        />
                        {/* Debug Info */}
                        <div className="text-xs text-gray-500 break-all">
                          <strong>Audio URL:</strong> {selectedCreation.result_url}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Info Panel */}
                <div className="lg:w-96 bg-white flex flex-col overflow-hidden">
                  <div className="p-6 space-y-4 flex flex-col h-full overflow-y-auto">
                    {/* Debug Info - Remove after testing */}
                    {console.log('🔍 Debug Creation Modal:', {
                      creation_user_id: selectedCreation.user_id,
                      current_user_id: currentUser?.uid,
                      is_match: selectedCreation.user_id === currentUser?.uid,
                      is_public: selectedCreation.is_public,
                      has_is_public_field: 'is_public' in selectedCreation,
                      metadata: selectedCreation.metadata,
                      result_url: selectedCreation.result_url,
                      type: selectedCreation.type
                    })}
                    
                    {/* Type Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedCreation.type === 'image' 
                          ? 'bg-purple-100 text-purple-700' 
                          : selectedCreation.type === 'video'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {selectedCreation.type === 'image' ? '🖼️ Image' : selectedCreation.type === 'video' ? '🎬 Video' : '🎵 Music'}
                      </span>
                    </div>

                    {/* Prompt - Hide for Music */}
                    {selectedCreation.type !== 'music' && (
                      <div className="flex-shrink-0">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Prompt</h3>
                        <div className="max-h-32 overflow-y-auto text-sm text-gray-800 leading-relaxed bg-gray-50 rounded-lg p-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {selectedCreation.prompt}
                        </div>
                      </div>
                    )}

                    {/* Lyrics - Only for Music - Takes 50% height */}
                    {selectedCreation.type === 'music' && selectedCreation.metadata?.lyrics && (
                      <div className="flex flex-col" style={{ height: '50%' }}>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Lyrics</h3>
                        <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 text-sm text-gray-700 scrollbar-hide">
                          <div className="space-y-4">
                            {selectedCreation.metadata.lyrics.split('\n').map((line, index) => {
                              // Check if line is a section header (Verse, Chorus, Bridge, etc.)
                              const isSectionHeader = /^\[(.*?)\]/.test(line) || 
                                                     /^(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Hook)/i.test(line);
                              
                              // Empty line creates spacing
                              if (line.trim() === '') {
                                return <div key={index} className="h-2"></div>;
                              }
                              
                              // Section headers
                              if (isSectionHeader) {
                                return (
                                  <div key={index} className="font-bold text-indigo-600 text-xs uppercase tracking-wide mt-4 first:mt-0">
                                    {line.replace(/[\[\]]/g, '')}
                                  </div>
                                );
                              }
                              
                              // Regular lyrics
                              return (
                                <div key={index} className="leading-relaxed">
                                  {line}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Section - Takes remaining 40% for music, auto for others */}
                    <div className={selectedCreation.type === 'music' ? 'space-y-4 overflow-y-auto' : 'space-y-4'}>
                    {/* Metadata */}
                    {selectedCreation.metadata && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Details</h3>
                        <div className="space-y-2 text-sm">
                          {selectedCreation.metadata.aspectRatio && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Aspect Ratio:</span>
                              <span className="text-gray-800 font-medium">
                                {selectedCreation.metadata.aspectRatio.replace('_', ':')}
                              </span>
                            </div>
                          )}
                          {selectedCreation.metadata.model && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Model:</span>
                              <span className="text-gray-800 font-medium">
                                {selectedCreation.metadata.model}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="text-gray-800 font-medium">
                              {new Date(selectedCreation.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Privacy Control - Only show for user's own creations */}
                    {selectedCreation.user_id === currentUser?.uid && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-800">Privacy</span>
                                {(selectedCreation.is_public !== false) ? (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                    🌍 Public
                                  </span>
                                ) : (
                                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                                    🔒 Private
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600">
                                {(selectedCreation.is_public !== false)
                                  ? 'Visible to everyone in community' 
                                  : 'Only visible to you'}
                              </p>
                            </div>
                            <button
                              onClick={() => handlePrivacyToggle(selectedCreation.id, selectedCreation.is_public !== false)}
                              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all transform hover:scale-105 ${
                                (selectedCreation.is_public !== false)
                                  ? 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400' 
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
                              }`}
                            >
                              {(selectedCreation.is_public !== false) ? 'Make Private' : 'Make Public'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <a
                        href={selectedCreation.result_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-2 bg-[#ff4017] hover:bg-[#ff6b47] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>

                      {/* Blockchain Badge - Coming Soon */}
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 border border-indigo-100">
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0" style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(99, 102, 241, 0.1) 10px, rgba(99, 102, 241, 0.1) 20px)`,
                            animation: 'slide 20s linear infinite'
                          }}></div>
                        </div>

                        <div className="relative">
                          {/* Header with Icon */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-800">Blockchain Native</h4>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                Coming Soon
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                            This creation will be secured on the <span className="font-semibold text-indigo-600">DAGChain</span> decentralized network, ensuring permanent ownership and authenticity.
                          </p>

                          {/* Placeholder for Transaction Hash */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Transaction Hash:</span>
                              <span className="text-gray-400 italic">Pending blockchain launch</span>
                            </div>
                            <div className="h-8 bg-white/60 rounded-lg border border-dashed border-indigo-200 flex items-center justify-center">
                              <span className="text-xs text-gray-400 font-mono">0x...coming soon</span>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="mt-3 pt-3 border-t border-indigo-100 grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="flex items-center justify-center mb-1">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                              <div className="text-xs text-gray-600 font-medium">Immutable</div>
                            </div>
                            <div>
                              <div className="flex items-center justify-center mb-1">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="text-xs text-gray-600 font-medium">Verified</div>
                            </div>
                            <div>
                              <div className="flex items-center justify-center mb-1">
                                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                </svg>
                              </div>
                              <div className="text-xs text-gray-600 font-medium">Permanent</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Animation Keyframes */}
                    <style>{`
                      @keyframes slide {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(20px); }
                      }
                    `}</style>
                    </div>
                    {/* End Bottom Section */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      </div>
    </div>
  );
};

export default Dashboard;

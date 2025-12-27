import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NeumorphicChatCard from '../components/NeumorphicChatCard';
import PricingSection from '../components/PricingSection';

const ProfessionalDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showSolutionsMenu, setShowSolutionsMenu] = useState(false);
  const [animateText, setAnimateText] = useState(false);
  const [animateHero, setAnimateHero] = useState(false);
  const [typedTextHero, setTypedTextHero] = useState('');
  const [heroLabelHero, setHeroLabelHero] = useState('Ask Anything:');
  const [typedTextImage, setTypedTextImage] = useState('');
  const [imageLabelImage, setImageLabelImage] = useState('Create Anything:');
  const [imageQAState, setImageQAState] = useState('question');
  const [typedTextVideo, setTypedTextVideo] = useState('');
  const [videoLabelVideo, setVideoLabelVideo] = useState('Create Anything:');
  const [videoQAState, setVideoQAState] = useState('question');
  const [currentQAIndex, setCurrentQAIndex] = useState(0);
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  const [heroCharIndex, setHeroCharIndex] = useState(0);
  const [heroIsDeleting, setHeroIsDeleting] = useState(false);
  const [heroPaused, setHeroPaused] = useState(false);
  const [imageCharIndex, setImageCharIndex] = useState(0);
  const [imageIsDeleting, setImageIsDeleting] = useState(false);
  const [imagePaused, setImagePaused] = useState(false);
  const [videoCharIndex, setVideoCharIndex] = useState(0);
  const [videoIsDeleting, setVideoIsDeleting] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const heroQAPairs = [
    {
      question: 'Help me understand about Quantum Computer in detail...',
      answer: 'Quantum computers use quantum mechanics principles like superposition and entanglement to process information. Unlike classical bits (0 or 1), qubits can exist in multiple states simultaneously, enabling exponentially faster computations for specific problems like cryptography, drug discovery, and complex simulations.'
    },
    {
      question: 'What should be my career path after finishing my Mechanical Engineering...',
      answer: 'After Mechanical Engineering, you have diverse options: pursue advanced degrees (MS/PhD), enter industries like automotive, aerospace, or robotics, transition to data science or AI engineering, start your own tech venture, or specialize in emerging fields like renewable energy, 3D printing, or mechatronics.'
    }
  ];
  
  const imageQuestion = "Create an image of a model in her 20's showcasing Perfume brands.";
  const imageAnswer = '{"prompt": "Professional photo of elegant female model in her 20s, holding luxury perfume bottle, soft studio lighting, high-end fashion photography, bokeh background, commercial product shot", "style": "photorealistic", "quality": "high", "aspect_ratio": "9:16"}';
  
  const videoQuestion = "Create a video for a concept Super Car brand in silver colour, focussed inside a showroom..";
  const videoAnswer = '{"prompt": "Cinematic video of futuristic silver supercar in modern showroom, dramatic lighting, camera rotating around vehicle, reflections on polished floor, high-end automotive commercial", "duration": "10s", "style": "cinematic", "camera_movement": "orbital", "quality": "4K"}';

  useEffect(() => {
    setTimeout(() => setAnimateText(true), 100);
    setTimeout(() => setAnimateHero(true), 300);
    
    // Hero section Q&A typing animation
    const typeHeroText = () => {
      if (heroPaused) return;
      
      const currentPair = heroQAPairs[currentQAIndex];
      const currentText = isShowingAnswer ? currentPair.answer : currentPair.question;
      
      if (!heroIsDeleting && heroCharIndex < currentText.length) {
        // Typing forward
        setHeroCharIndex(heroCharIndex + 1);
        setTypedTextHero(currentText.slice(0, heroCharIndex + 1));
      } else if (!heroIsDeleting && heroCharIndex === currentText.length) {
        // Finished typing, pause before deleting
        setHeroPaused(true);
        setTimeout(() => {
          setHeroPaused(false);
          setHeroIsDeleting(true);
        }, isShowingAnswer ? 3000 : 2000);
      } else if (heroIsDeleting && heroCharIndex > 0) {
        // Deleting
        setHeroCharIndex(heroCharIndex - 1);
        setTypedTextHero(currentText.slice(0, heroCharIndex - 1));
      } else if (heroIsDeleting && heroCharIndex === 0) {
        // Finished deleting
        setHeroIsDeleting(false);
        if (!isShowingAnswer) {
          // Just finished question, now show answer
          setIsShowingAnswer(true);
          setHeroLabelHero('DAG GPT:');
        } else {
          // Just finished answer, move to next question
          setIsShowingAnswer(false);
          setHeroLabelHero('Ask Anything:');
          setCurrentQAIndex((currentQAIndex + 1) % heroQAPairs.length);
        }
      }
    };
    
    const heroTypingInterval = setInterval(typeHeroText, heroIsDeleting ? 20 : 50);
    
    // Image section Q&A typing animation (question -> answer -> loop)
    const typeImageText = () => {
      if (imagePaused) return;
      
      const currentText = imageQAState === 'question' ? imageQuestion : imageAnswer;
      
      if (!imageIsDeleting && imageCharIndex < currentText.length) {
        setImageCharIndex(imageCharIndex + 1);
        setTypedTextImage(currentText.slice(0, imageCharIndex + 1));
      } else if (!imageIsDeleting && imageCharIndex === currentText.length) {
        setImagePaused(true);
        setTimeout(() => {
          setImagePaused(false);
          setImageIsDeleting(true);
        }, imageQAState === 'answer' ? 3000 : 2000);
      } else if (imageIsDeleting && imageCharIndex > 0) {
        setImageCharIndex(imageCharIndex - 1);
        setTypedTextImage(currentText.slice(0, imageCharIndex - 1));
      } else if (imageIsDeleting && imageCharIndex === 0) {
        setImageIsDeleting(false);
        if (imageQAState === 'question') {
          setImageQAState('answer');
          setImageLabelImage('DAG GPT:');
        } else {
          setImageQAState('question');
          setImageLabelImage('Create Anything:');
        }
      }
    };
    
    const imageTypingInterval = setInterval(typeImageText, imageIsDeleting ? 20 : 50);
    
    // Video section Q&A typing animation (question -> answer -> loop)
    const typeVideoText = () => {
      if (videoPaused) return;
      
      const currentText = videoQAState === 'question' ? videoQuestion : videoAnswer;
      
      if (!videoIsDeleting && videoCharIndex < currentText.length) {
        setVideoCharIndex(videoCharIndex + 1);
        setTypedTextVideo(currentText.slice(0, videoCharIndex + 1));
      } else if (!videoIsDeleting && videoCharIndex === currentText.length) {
        setVideoPaused(true);
        setTimeout(() => {
          setVideoPaused(false);
          setVideoIsDeleting(true);
        }, videoQAState === 'answer' ? 3000 : 2000);
      } else if (videoIsDeleting && videoCharIndex > 0) {
        setVideoCharIndex(videoCharIndex - 1);
        setTypedTextVideo(currentText.slice(0, videoCharIndex - 1));
      } else if (videoIsDeleting && videoCharIndex === 0) {
        setVideoIsDeleting(false);
        if (videoQAState === 'question') {
          setVideoQAState('answer');
          setVideoLabelVideo('DAG GPT:');
        } else {
          setVideoQAState('question');
          setVideoLabelVideo('Create Anything:');
        }
      }
    };
    
    const videoTypingInterval = setInterval(typeVideoText, videoIsDeleting ? 20 : 50);
    
    return () => {
      clearInterval(heroTypingInterval);
      clearInterval(imageTypingInterval);
      clearInterval(videoTypingInterval);
    };
  }, [currentQAIndex, isShowingAnswer, heroCharIndex, heroIsDeleting, heroPaused, 
      imageQAState, imageCharIndex, imageIsDeleting, imagePaused,
      videoQAState, videoCharIndex, videoIsDeleting, videoPaused]);

  const handleAuthAction = async () => {
    if (currentUser) {
      // Logout
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    } else {
      // Redirect to dashboard (will show login if not authenticated)
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Purple Radial Gradient Background from Bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
        }}
      />

      {/* Main Content Layer */}
      <div className="relative z-10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/logo192.png" 
                alt="DAG GPT Logo" 
                className="h-8 sm:h-10 w-auto object-contain rounded-lg"
              />
              <span className="text-lg sm:text-xl font-bold text-[#251b18]" style={{ fontFamily: 'Nasalization, sans-serif' }}>
                DAG GPT
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-sm font-medium text-[#251b18] hover:text-indigo-600 transition-colors">
                About
              </a>
              <a href="#feature" className="text-sm font-medium text-[#251b18] hover:text-indigo-600 transition-colors">
                Feature
              </a>
              
              {/* Solutions Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowSolutionsMenu(true)}
                onMouseLeave={() => setShowSolutionsMenu(false)}
              >
                <button className="text-sm font-medium text-[#251b18] hover:text-indigo-600 transition-colors flex items-center gap-1 py-2">
                  Solutions
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showSolutionsMenu && (
                  <div className="absolute left-0 pt-2 w-64 z-50" style={{ top: '100%' }}>
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <a href="/solutions/content-creators" className="block px-4 py-2.5 text-sm text-[#251b18] hover:bg-gray-50 hover:text-[#6366f1] transition-colors">
                        Content Creators / Influencers
                      </a>
                      <a href="/solutions/marketers" className="block px-4 py-2.5 text-sm text-[#251b18] hover:bg-gray-50 hover:text-[#6366f1] transition-colors">
                        Marketers / Agencies
                      </a>
                      <a href="/solutions/educators" className="block px-4 py-2.5 text-sm text-[#251b18] hover:bg-gray-50 hover:text-[#6366f1] transition-colors">
                        Educators / Trainers
                      </a>
                      <a href="/solutions/developers" className="block px-4 py-2.5 text-sm text-[#251b18] hover:bg-gray-50 hover:text-[#6366f1] transition-colors">
                        Developers / Founders
                      </a>
                      <a href="/solutions/corporate" className="block px-4 py-2.5 text-sm text-[#251b18] hover:bg-gray-50 hover:text-[#6366f1] transition-colors">
                        Corporate Teams / HR / Sales
                      </a>
                      <a href="/solutions/students" className="block px-4 py-2.5 text-sm text-[#251b18] hover:bg-gray-50 hover:text-[#6366f1] transition-colors">
                        Students / Professionals
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <a href="#pricing" className="text-sm font-medium text-[#251b18] hover:text-[#6366f1] transition-colors">
                Pricing
              </a>
              <a href="/knowledge-base" className="text-sm font-medium text-[#251b18] hover:text-[#6366f1] transition-colors">
                Knowledge Base
              </a>
              <a href="#blog" className="text-sm font-medium text-[#251b18] hover:text-[#6366f1] transition-colors">
                Blog
              </a>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {currentUser && (
                <span className="hidden sm:inline text-sm text-gray-600">
                  Hi, {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
              )}
              <button
                onClick={handleAuthAction}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-b from-[#161612] to-[#2b2c2e] text-white rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-all shadow-md"
              >
                {currentUser ? 'Logout' : 'Sign In'}
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#251b18] hover:text-indigo-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3 pt-4">
                <a href="#about" className="text-sm font-medium text-[#251b18] hover:text-indigo-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                  About
                </a>
                <a href="#feature" className="text-sm font-medium text-[#251b18] hover:text-indigo-600 transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                  Feature
                </a>
                <a href="#pricing" className="text-sm font-medium text-[#251b18] hover:text-[#6366f1] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </a>
                <a href="/knowledge-base" className="text-sm font-medium text-[#251b18] hover:text-[#6366f1] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                  Knowledge Base
                </a>
                <a href="#blog" className="text-sm font-medium text-[#251b18] hover:text-[#6366f1] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                  Blog
                </a>
                
                {/* Mobile Solutions Menu */}
                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="text-xs font-semibold text-gray-500 mb-2">SOLUTIONS</div>
                  <a href="/solutions/content-creators" className="block text-sm text-[#251b18] hover:text-[#6366f1] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                    Content Creators
                  </a>
                  <a href="/solutions/marketers" className="block text-sm text-[#251b18] hover:text-[#6366f1] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                    Marketers
                  </a>
                  <a href="/solutions/educators" className="block text-sm text-[#251b18] hover:text-[#6366f1] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                    Educators
                  </a>
                  <a href="/solutions/developers" className="block text-sm text-[#251b18] hover:text-[#6366f1] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                    Developers
                  </a>
                  <a href="/solutions/corporate" className="block text-sm text-[#251b18] hover:text-[#6366f1] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                    Corporate Teams
                  </a>
                  <a href="/solutions/students" className="block text-sm text-[#251b18] hover:text-[#6366f1] transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                    Students
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main>
        {/* Hero Section - Full Viewport */}
        <section className="min-h-screen flex items-center relative overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 z-0">
            <div 
              style={{
                filter: 'brightness(0.69) grayscale() invert()',
                position: 'absolute',
                inset: '-238px -177px -47px -176px',
                zIndex: 2
              }}
            >
              <video 
                src="https://framerusercontent.com/assets/aMPvRVYHFQxBoB0v2qyJln83jI.mp4" 
                loop 
                preload="auto" 
                muted 
                playsInline 
                autoPlay
                style={{
                  cursor: 'auto',
                  width: '100%',
                  height: '100%',
                  borderRadius: '0px',
                  display: 'block',
                  objectFit: 'cover',
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  objectPosition: '50% 50%'
                }}
              />
            </div>
          </div>

          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 pt-24 sm:pt-32 w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 sm:gap-12 lg:gap-20 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-6 sm:space-y-8 lg:pr-12">
              {/* Main Heading with Word Animation */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                  {['Your', 'smart', 'AI', 'assistant', 'with'].map((word, i) => (
                    <span
                      key={i}
                      className={`inline-block mr-4 transition-all duration-700 text-[#251b18] ${
                        animateText ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-3 blur-sm'
                      }`}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    >
                      {word}
                    </span>
                  ))}
                </h1>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                  {['DAG', 'GPT'].map((word, i) => (
                    <span
                      key={i}
                      className={`inline-block mr-4 transition-all duration-700 ${
                        animateText ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-3 blur-sm'
                      }`}
                      style={{ 
                        transitionDelay: `${(i + 5) * 100}ms`,
                        color: '#6366f1'
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </h1> 
              </div>

              {/* Subtitle */}
              <p 
                className={`text-base sm:text-lg text-[#595250] leading-relaxed max-w-xl transition-all duration-700 delay-700 ${
                  animateText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                DAGGPT generates high-converting contents with AI, helping you get the most out of Ai Models.
              </p>

              {/* CTA Buttons */}
              <div 
                className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4" 
                style={{ opacity: animateHero ? 1 : 0, transform: animateHero ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 800ms' }}
              >
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-b from-[#161612] to-[#2b2c2e] text-white rounded-lg text-sm sm:text-base font-medium hover:opacity-90 transition-all shadow-md"
                >
                  Explore our Models
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-b from-white to-[#f9f9f9] text-[#251b18] border border-[#d8d9db] rounded-lg text-sm sm:text-base font-medium hover:border-gray-300 transition-all shadow-sm"
                >
                  Spin your Imagination
                </button>
              </div>

              {/* Feature Highlights */}
              <div 
                className={`grid grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 max-w-md transition-all duration-700 delay-1000 ${
                  animateText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#6366f1] mb-1">10K+</div>
                  <div className="text-xs sm:text-sm text-[#595250]">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#6366f1] mb-1">50+</div>
                  <div className="text-xs sm:text-sm text-[#595250]">AI Models</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#6366f1] mb-1">1M+</div>
                  <div className="text-xs sm:text-sm text-[#595250]">Creations</div>
                </div>
              </div>

              {/* Key Features */}
              <div 
                className={`flex flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4 transition-all duration-700 delay-1100 ${
                  animateText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                {['AI Chat', 'Image Generation', 'Video Creation', 'Website Builder'].map((feature, i) => (
                  <div 
                    key={i}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-b from-[#f9f9f9] to-white border border-[#e5e5e5] rounded-full text-xs sm:text-sm text-[#595250] font-medium"
                  >
                    ✨ {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Neumorphic Chat Interface */}
            <div 
              className={`hidden lg:block transition-all duration-1000 delay-300 lg:ml-auto lg:max-w-xl ${
                animateHero ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-90'
              }`}
            >
              <NeumorphicChatCard 
                typedText={typedTextHero} 
                staticLabel={heroLabelHero}
              />
            </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
          {/* Image Generation Subsection */}
          <div className="mb-20 sm:mb-32">
            {/* Title and Subtitle */}
            <div className="mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight" style={{ lineHeight: '1.2' }}>
                {['Generate', 'Stunning'].map((word, i) => (
                  <span
                    key={i}
                    className={`inline-block mr-4 transition-all duration-700 text-[#251b18] ${
                      animateHero ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-5 blur-sm'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    {word}
                  </span>
                ))}
                <span
                  className={`inline-block transition-all duration-700 ${
                    animateHero ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-5 blur-sm'
                  }`}
                  style={{ 
                    transitionDelay: '200ms',
                    background: 'linear-gradient(135deg, #ff6347 0%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    paddingBottom: '4px',
                    display: 'inline-block'
                  }}
                >
                  AI Images
                </span>
              </h2>
              <p 
                className={`text-lg text-[#595250] leading-relaxed max-w-3xl transition-all duration-700 delay-300 ${
                  animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
              >
                Transform your ideas into breathtaking visuals with our advanced AI. From product photography to artistic masterpieces, create professional-grade images in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 sm:gap-8 items-start">
              {/* Left Side - Animated Chat Box (Fixed width, aligned left) */}
              <div 
                className={`transition-all duration-1000 ${
                  animateHero ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                }`}
              >
                <NeumorphicChatCard 
                  typedText={typedTextImage} 
                  staticLabel={imageLabelImage}
                  isFeatureSection={true}
                  portraitMode={true}
                  mobileActive={true}
                />
              </div>

            {/* Right Side - Image Carousel */}
            <div className="relative overflow-hidden" style={{ height: '480px' }}>
              {/* Row 1 */}
              <div className="flex gap-6 mb-6 animate-scroll-left">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5].map((num, i) => (
                  <div 
                    key={`row1-${i}`}
                    className="flex-shrink-0 w-[210px] h-[210px] rounded-2xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                      boxShadow: '0 0 1px rgba(0,0,0,0.1), 6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.9)'
                    }}
                  >
                    <img 
                      src={`/images/gallery/${num}.png`}
                      alt={`Gallery ${num}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(145deg, #e0e0e0, #f5f5f5)';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Row 2 */}
              <div className="flex gap-6 animate-scroll-left-delayed">
                {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 11, 12, 13, 14, 15].map((num, i) => (
                  <div 
                    key={`row2-${i}`}
                    className="flex-shrink-0 w-[210px] h-[210px] rounded-2xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                      boxShadow: '0 0 1px rgba(0,0,0,0.1), 6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.9)'
                    }}
                  >
                    <img 
                      src={`/images/gallery/${num}.png`}
                      alt={`Gallery ${num}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(145deg, #e0e0e0, #f5f5f5)';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Gradient Fade on Left */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
            </div>
            </div>
          </div>

          {/* Video Generation Subsection */}
          <div className="mb-32">
            {/* Title and Subtitle */}
            <div className="mb-16">
              <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ lineHeight: '1.2' }}>
                {['Bring', 'Your', 'Vision', 'to'].map((word, i) => (
                  <span
                    key={i}
                    className={`inline-block mr-4 transition-all duration-700 text-[#251b18] ${
                      animateHero ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-5 blur-sm'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    {word}
                  </span>
                ))}
                <br />
                <span
                  className={`inline-block transition-all duration-700 ${
                    animateHero ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-5 blur-sm'
                  }`}
                  style={{ 
                    transitionDelay: '400ms',
                    background: 'linear-gradient(135deg, #ff6347 0%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    paddingBottom: '4px',
                    display: 'inline-block'
                  }}
                >
                  Life with AI Video
                </span>
              </h2>
              <p 
                className={`text-lg text-[#595250] leading-relaxed max-w-3xl transition-all duration-700 delay-500 ${
                  animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
              >
                Create cinematic videos from simple text prompts. Perfect for marketing campaigns, product showcases, and storytelling. Professional quality, zero filming required.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Side - Video Player */}
            <div 
              className={`transition-all duration-1000 ${
                animateHero ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}
            >
              <div 
                className="relative w-full rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                  boxShadow: '0 0 1px rgba(0,0,0,0.1), 8px 8px 20px rgba(0,0,0,0.15), -8px -8px 20px rgba(255,255,255,0.9), inset 0 0 0 1px rgba(255,255,255,0.5)',
                  padding: '12px'
                }}
              >
                <video
                  className="w-full h-auto rounded-2xl"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <source src="/videos/1.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Right Side - Animated Chat Box */}
            <div 
              className={`transition-all duration-1000 ${
                animateHero ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
              }`}
            >
              <NeumorphicChatCard 
                typedText={typedTextVideo} 
                staticLabel={videoLabelVideo}
                isFeatureSection={true}
                activeFeature="video"
                customHeight="240px"
              />
            </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* Beautiful Footer */}
        <footer className="bg-gradient-to-br from-gray-100 via-gray-50 to-white py-12 sm:py-16 px-4 mt-12 sm:mt-20">
          <div className="max-w-7xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
              {/* Company Info */}
              <div>
                <h3 className="text-2xl font-bold mb-4" style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #ff8c42 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '2px 2px 4px rgba(255, 64, 23, 0.1)'
                }}>
                  DAG GPT
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Your smart AI assistant powered by cutting-edge technology. Create, innovate, and transform your ideas into reality.
                </p>
                <div className="flex space-x-4">
                  {/* Social Media Icons */}
                  {/* Telegram */}
                  <a href="#" className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110" style={{
                    background: '#ffffff',
                    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9)'
                  }}>
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  </a>
                  {/* X (Twitter) */}
                  <a href="#" className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110" style={{
                    background: '#ffffff',
                    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9)'
                  }}>
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  {/* Facebook */}
                  <a href="#" className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110" style={{
                    background: '#ffffff',
                    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9)'
                  }}>
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  {/* Instagram */}
                  <a href="#" className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110" style={{
                    background: '#ffffff',
                    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9)'
                  }}>
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  {/* Discord */}
                  <a href="#" className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110" style={{
                    background: '#ffffff',
                    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9)'
                  }}>
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                  </a>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Products</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">AI Chat</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Image Generation</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Video Creation</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Website Builder</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">API Access</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Resources</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Tutorials</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Community</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Support</a></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Company</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">About Us</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Careers</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Press Kit</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Contact</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Partners</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-gray-600 text-sm">
                  © 2025 DAG GPT. All rights reserved.
                </p>
                <div className="flex space-x-6 text-sm">
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600 transition-colors">Privacy Policy</a>
                  <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Terms of Service</a>
                  <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;


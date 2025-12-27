import React, { useState } from 'react';

const LandingPage = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleWalletConnect = async () => {
    // Web3 wallet connection logic will go here
    console.log('Connecting wallet...');
    // For now, just toggle the state
    setIsWalletConnected(!isWalletConnected);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Logo */}
            <div className="flex items-center space-x-4">
              <img 
                src="/images/logo8.jpg" 
                alt="DAG GPT Logo" 
                className="h-12 w-auto object-contain rounded-lg"
              />
              <span className="text-2xl font-bold text-black" style={{ fontFamily: 'Nasalization, sans-serif' }}>
                DAG GPT
              </span>
            </div>

            {/* Center - Menu Items */}
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#create" 
                className="text-gray-700 hover:text-black font-medium transition-colors"
              >
                Create
              </a>
              <a 
                href="#community" 
                className="text-gray-700 hover:text-black font-medium transition-colors"
              >
                Community
              </a>
              <a 
                href="#solutions" 
                className="text-gray-700 hover:text-black font-medium transition-colors"
              >
                Solutions
              </a>
              <a 
                href="#pricing" 
                className="text-gray-700 hover:text-black font-medium transition-colors"
              >
                Pricing
              </a>
            </div>

            {/* Right - Web3 Wallet Login */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleWalletConnect}
                className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                {isWalletConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Video */}
      <main className="pt-24 min-h-screen">
        <section className="relative h-screen w-full overflow-hidden">
          {/* Background Video with White Filter */}
          <div className="absolute inset-0 z-0">
            <video 
              src="https://framerusercontent.com/assets/aMPvRVYHFQxBoB0v2qyJln83jI.mp4" 
              loop 
              preload="auto" 
              muted 
              playsInline 
              autoPlay
              className="w-full h-full object-cover"
              style={{
                cursor: 'auto',
                width: '100%',
                height: '100%',
                borderRadius: '0px',
                display: 'block',
                objectFit: 'cover',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                objectPosition: '50% 50%',
                filter: 'brightness(2) contrast(0.8) invert(1)'
              }}
            />
            {/* White overlay to ensure white appearance */}
            <div className="absolute inset-0 bg-white opacity-40"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <h1 className="text-6xl md:text-7xl font-bold text-black mb-6" style={{ fontFamily: 'Nasalization, sans-serif' }}>
                AI-Powered Marketing
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
                Transform your business with intelligent automation and data-driven insights
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button className="px-8 py-4 bg-black text-white rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors">
                  Get Started
                </button>
                <button className="px-8 py-4 bg-white text-black border-2 border-black rounded-lg font-medium text-lg hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;

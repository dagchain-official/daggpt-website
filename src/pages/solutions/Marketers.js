import React from 'react';

const Marketers = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white">
      {/* Navigation - Neumorphic */}
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-gray-100 to-gray-50" style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 -2px 4px rgba(255,255,255,0.9)'
      }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-3 group">
              <div className="relative rounded-xl p-1" style={{
                boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -6px -6px 12px rgba(255,255,255,0.9)'
              }}>
                <img src="/images/logo8.jpg" alt="DAG GPT Logo" className="h-10 w-auto object-contain rounded-lg" />
              </div>
              <span className="text-xl font-bold text-[#251b18]" style={{ 
                fontFamily: 'Nasalization, sans-serif',
                textShadow: '2px 2px 4px rgba(255,255,255,0.9), -1px -1px 2px rgba(0,0,0,0.1)'
              }}>DAG GPT</span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm font-medium text-gray-700 hover:text-[#6366f1] transition-all px-4 py-2 rounded-xl" style={{
                boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.1), inset -3px -3px 6px rgba(255,255,255,0.9)'
              }}>
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section - Neumorphic */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900" style={{
          boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-white">
                <div className="inline-block px-6 py-3 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full text-sm font-semibold mb-6" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,100,70,0.3)'
                }}>
                  📊 For Marketing Agencies
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                  Your Agency's Secret Weapon for <span className="text-[#6366f1]">Explosive Growth</span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Stop losing clients to faster agencies. Generate campaign assets 50x faster, serve 10x more clients, and boost your profit margins by 60%.
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-300 mt-8">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#6366f1]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#6366f1]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Setup in 5 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#6366f1]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>

              {/* Right Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.15), -10px -10px 20px rgba(255,255,255,0.7), inset 2px 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <div className="text-4xl font-bold text-[#6366f1] mb-2">50x</div>
                  <div className="text-sm text-gray-600">Faster Campaign Creation</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.15), -10px -10px 20px rgba(255,255,255,0.7), inset 2px 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <div className="text-4xl font-bold text-[#6366f1] mb-2">10x</div>
                  <div className="text-sm text-gray-600">More Clients Served</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.15), -10px -10px 20px rgba(255,255,255,0.7), inset 2px 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <div className="text-4xl font-bold text-[#6366f1] mb-2">60%</div>
                  <div className="text-sm text-gray-600">Higher Profit Margins</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.15), -10px -10px 20px rgba(255,255,255,0.7), inset 2px 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <div className="text-4xl font-bold text-[#6366f1] mb-2">500+</div>
                  <div className="text-sm text-gray-600">Agencies Trust Us</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problems Section - Before/After Comparison - Neumorphic */}
        <section className="py-20 bg-gradient-to-br from-gray-100 via-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#251b18] mb-4" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>Traditional Agency vs AI-Powered Agency</h2>
              <p className="text-xl text-gray-600">See the dramatic difference AI makes</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Traditional Agency Column */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center" style={{
                    boxShadow: '4px 4px 8px rgba(0,0,0,0.2), -2px -2px 4px rgba(255,100,100,0.3)'
                  }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#251b18]">Traditional Agency</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">$6,500+/month on creative team</p>
                      <p className="text-sm text-gray-600">Designers, writers, editors eating your margins</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">2-3 weeks per campaign</p>
                      <p className="text-sm text-gray-600">Clients getting impatient, losing to faster competitors</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">5-10 clients maximum</p>
                      <p className="text-sm text-gray-600">Can't scale without killing profit margins</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Inconsistent quality</p>
                      <p className="text-sm text-gray-600">Different designers = different styles, endless revisions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Team management nightmare</p>
                      <p className="text-sm text-gray-600">Sick days, vacations, freelancer flakes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">A/B testing takes weeks</p>
                      <p className="text-sm text-gray-600">By the time you test, campaign window closed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI-Powered Agency Column */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center" style={{
                    boxShadow: '4px 4px 8px rgba(0,0,0,0.2), -2px -2px 4px rgba(255,100,70,0.3)'
                  }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#251b18]">With DAG GPT</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Pay As GO Model</p>
                      <p className="text-sm text-gray-600">pay for only what you create, boost margins by 60%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">2-3 hours per campaign</p>
                      <p className="text-sm text-gray-600">50x faster, clients amazed, win more business</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">50+ clients easily</p>
                      <p className="text-sm text-gray-600">Scale without hiring, pure profit growth</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Perfect brand consistency</p>
                      <p className="text-sm text-gray-600">AI learns client style, zero revisions needed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Zero team headaches</p>
                      <p className="text-sm text-gray-600">AI never sleeps, never quits, always delivers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6366f1] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">50 variations in 5 minutes</p>
                      <p className="text-sm text-gray-600">Test everything, optimize fast, dominate results</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section - Neumorphic */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#251b18] mb-4" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>Your AI Marketing Department</h2>
              <p className="text-xl text-gray-600">Replace your entire creative team with one AI platform</p>
            </div>

            {/* Feature 1: Ad Creative Generator */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <div className="inline-block px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-50 text-[#6366f1] rounded-full text-sm font-semibold mb-4" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.9)'
                }}>
                  🎯 High-Converting Ads
                </div>
                <h3 className="text-3xl font-bold text-[#251b18] mb-4">AI Ad Creative Generator</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Generate hundreds of ad variations in minutes. Test more, win more. Perfect for Facebook, Instagram, Google, LinkedIn, and TikTok ads.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#6366f1] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Multi-Format Ads:</strong> Static, carousel, video ads generated instantly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#6366f1] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>A/B Test Ready:</strong> Generate 50 variations in 5 minutes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#6366f1] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Brand Consistency:</strong> Maintains client brand guidelines</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#6366f1] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Platform Optimization:</strong> Auto-sized for each platform</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-8 h-96 flex items-center justify-center" style={{
                boxShadow: '20px 20px 40px rgba(0,0,0,0.15), -20px -20px 40px rgba(255,255,255,0.9), inset 5px 5px 10px rgba(255,255,255,0.5)'
              }}>
                <div className="text-center">
                  <svg className="w-24 h-24 text-[#6366f1] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-600 font-medium">Ad Examples</p>
                </div>
              </div>
            </div>

            {/* Feature 2: Landing Page Builder */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div className="order-2 lg:order-1 bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-8 h-96 flex items-center justify-center" style={{
                boxShadow: '20px 20px 40px rgba(0,0,0,0.15), -20px -20px 40px rgba(255,255,255,0.9), inset 5px 5px 10px rgba(255,255,255,0.5)'
              }}>
                <div className="text-center">
                  <svg className="w-24 h-24 text-[#6366f1] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <p className="text-gray-600 font-medium">Landing Page Demo</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-50 text-[#6366f1] rounded-full text-sm font-semibold mb-4" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.9)'
                }}>
                  🚀 Conversion-Optimized
                </div>
                <h3 className="text-3xl font-bold text-[#251b18] mb-4">AI Landing Page Builder</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Build high-converting landing pages in minutes, not days. No coding required. Perfect for campaigns, product launches, and lead generation.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#6366f1] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Text-to-Website:</strong> Describe it, AI builds it</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#6366f1] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Mobile Responsive:</strong> Perfect on all devices</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#6366f1] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>SEO Optimized:</strong> Built-in best practices</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#6366f1] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Form Integration:</strong> Connect to any CRM</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3: Email Campaign Generator */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-50 text-[#6366f1] rounded-full text-sm font-semibold mb-4" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.1), -6px -6px 12px rgba(255,255,255,0.9)'
                }}>
                  ✉️ Email Marketing
                </div>
                <h3 className="text-3xl font-bold text-[#251b18] mb-4">AI Email Campaign Generator</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Create complete email campaigns with subject lines, body copy, and CTAs that convert. Personalized for each segment.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#6366f1] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Subject Line Generator:</strong> High open-rate headlines</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#6366f1] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Personalization:</strong> Dynamic content for each recipient</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#6366f1] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Drip Campaigns:</strong> Automated sequences generated</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#6366f1] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700"><strong>Template Library:</strong> Industry-specific templates</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl p-8 h-96 flex items-center justify-center" style={{
                boxShadow: '20px 20px 40px rgba(0,0,0,0.15), -20px -20px 40px rgba(255,255,255,0.9), inset 5px 5px 10px rgba(255,255,255,0.5)'
              }}>
                <div className="text-center">
                  <svg className="w-24 h-24 text-[#6366f1] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 font-medium">Email Templates</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Marketers;

import React, { useState } from 'react';

const PricingSection = () => {
  const [hoveredBadge, setHoveredBadge] = useState(null);

  return (
    <section id="pricing" className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-32">
      {/* Section Header */}
      <div className="text-center mb-12 sm:mb-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
          <span className="text-[#251b18]">Choose Your </span>
          <span className="text-[#6366f1]">Perfect Plan</span>
        </h2>
        <p className="text-lg text-[#595250] max-w-2xl mx-auto">
          Unlock the full potential of AI with our flexible pricing plans. Start creating amazing content today.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto items-start">
        
        {/* Free Plan */}
        <div className="relative group h-full">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-200 hover:border-[#6366f1] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-[#251b18] mb-2">Free</h3>
              <p className="text-sm text-[#595250]">Get started for free</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl sm:text-5xl font-bold text-[#6366f1]">$0</span>
                <span className="text-[#595250] ml-2 text-sm">/month</span>
              </div>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-[#251b18] rounded-xl font-semibold hover:from-[#6366f1] hover:to-[#8b5cf6] hover:text-white transition-all duration-300 mb-6 border border-gray-200">
              Get Started
            </button>

            <div className="space-y-3 flex-1">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">100 AI Chat messages/month</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">10 Image generations</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">3 Video generations (5s)</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">1 Website project</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">Basic AI models</span>
              </div>
              <div className="flex items-start relative">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <div className="flex items-center gap-1">
                  <svg 
                    className="w-3.5 h-3.5 text-[#6366f1] cursor-help" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    onMouseEnter={() => setHoveredBadge('soldier')}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-[#595250]">Get a DAG Soldier badge</span>
                </div>
                {hoveredBadge === 'soldier' && (
                  <div className="absolute left-0 top-8 z-50 w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-200">
                    <p className="text-xs text-gray-700"><strong>DAG Soldier Badge:</strong> Join the DAG community with an exclusive profile badge showing your commitment to AI-powered creativity.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Starter - $9 */}
        <div className="relative group h-full">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-200 hover:border-[#6366f1] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-[#251b18] mb-2">Starter</h3>
              <p className="text-sm text-[#595250]">Perfect for individuals</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl sm:text-5xl font-bold text-[#6366f1]">$9</span>
                <span className="text-[#595250] ml-2 text-sm">/month</span>
              </div>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-[#251b18] rounded-xl font-semibold hover:from-[#6366f1] hover:to-[#8b5cf6] hover:text-white transition-all duration-300 mb-6 border border-gray-200">
              Get Started
            </button>

            <div className="space-y-3 flex-1">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">1,000 AI Chat messages/month</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">100 Image generations</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">20 Video generations (10s)</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">10 Music generations (30s)</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">5 Website projects</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">Standard AI models</span>
              </div>
              <div className="flex items-start relative">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <div className="flex items-center gap-1">
                  <svg 
                    className="w-3.5 h-3.5 text-[#6366f1] cursor-help" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    onMouseEnter={() => setHoveredBadge('soldier')}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-[#595250]">Get a DAG Soldier badge</span>
                </div>
                {hoveredBadge === 'soldier' && (
                  <div className="absolute left-0 top-8 z-50 w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-200">
                    <p className="text-xs text-gray-700"><strong>DAG Soldier Badge:</strong> Join the DAG community with an exclusive profile badge showing your commitment to AI-powered creativity.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professional - $29 - Popular */}
        <div className="relative group h-full">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <span className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
              POPULAR
            </span>
          </div>
          
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-6 sm:p-8 border-2 border-[#6366f1] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-[#251b18] mb-2">Professional</h3>
              <p className="text-sm text-[#595250]">For creators & businesses</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl sm:text-5xl font-bold text-[#6366f1]">$29</span>
                <span className="text-[#595250] ml-2 text-sm">/month</span>
              </div>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 mb-6">
              Get Started
            </button>

            <div className="space-y-3 flex-1">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]"><strong>5,000</strong> AI Chat messages/month</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">500 Image generations</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">100 Video generations (30s)</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">50 Music generations (60s)</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">20 Website projects</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">Advanced AI models (GPT-4, Claude)</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">Priority support</span>
              </div>
              <div className="flex items-start relative">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <div className="flex items-center gap-1">
                  <svg 
                    className="w-3.5 h-3.5 text-[#6366f1] cursor-help" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    onMouseEnter={() => setHoveredBadge('soldier')}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-[#595250]">Get a DAG Soldier badge</span>
                </div>
                {hoveredBadge === 'soldier' && (
                  <div className="absolute left-0 top-8 z-50 w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-200">
                    <p className="text-xs text-gray-700"><strong>DAG Soldier Badge:</strong> Join the DAG community with an exclusive profile badge showing your commitment to AI-powered creativity.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise - $99 */}
        <div className="relative group h-full">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-200 hover:border-[#6366f1] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-[#251b18] mb-2">Enterprise</h3>
              <p className="text-sm text-[#595250]">For teams & agencies</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl sm:text-5xl font-bold text-[#6366f1]">$99</span>
                <span className="text-[#595250] ml-2 text-sm">/month</span>
              </div>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-[#251b18] rounded-xl font-semibold hover:from-[#6366f1] hover:to-[#8b5cf6] hover:text-white transition-all duration-300 mb-6 border border-gray-200">
              Get Started
            </button>

            <div className="space-y-3 flex-1">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]"><strong>Unlimited</strong> AI Chat messages</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">2,000 Image generations</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">500 Video generations (60s)</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">200 Music generations (120s)</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">Unlimited Website projects</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">All premium AI models</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">White-label options</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">24/7 Premium support</span>
              </div>
              <div className="flex items-start relative">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <div className="flex items-center gap-1">
                  <svg 
                    className="w-3.5 h-3.5 text-[#6366f1] cursor-help" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    onMouseEnter={() => setHoveredBadge('soldier')}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-[#595250]">Get a DAG Soldier badge</span>
                </div>
                {hoveredBadge === 'soldier' && (
                  <div className="absolute left-0 top-8 z-50 w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-200">
                    <p className="text-xs text-gray-700"><strong>DAG Soldier Badge:</strong> Join the DAG community with an exclusive profile badge showing your commitment to AI-powered creativity.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DAG ARMY - $149 Lifetime */}
        <div className="relative group h-full md:col-span-2 lg:col-span-1">
          <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-10 w-auto">
            <span className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg whitespace-nowrap">
              🎖️ LIFETIME ACCESS
            </span>
          </div>
          
          <div className="bg-gradient-to-br from-[#6366f1]/10 via-white to-purple-50 rounded-3xl p-6 sm:p-8 border-2 border-[#6366f1] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#6366f1] to-transparent opacity-10 rounded-full blur-3xl"></div>
            
            <div className="mb-4 relative z-10">
              <h3 className="text-2xl font-bold text-[#6366f1] mb-2">DAG ARMY 🎖️</h3>
              <p className="text-sm text-[#595250]">Lifetime Lieutenant Access</p>
            </div>
            
            <div className="mb-6 relative z-10">
              <div className="flex items-baseline">
                <span className="text-4xl sm:text-5xl font-bold text-[#6366f1]">$149</span>
                <span className="text-[#595250] ml-2 text-sm">one-time</span>
              </div>
              <p className="text-xs text-[#6366f1] font-semibold mt-1">✨ Pay once, create forever!</p>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 mb-6 relative z-10">
              Get Started
            </button>

            <div className="space-y-3 flex-1 relative z-10">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]"><strong>LIFETIME Unlimited</strong> AI Chat</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]"><strong>LIFETIME Unlimited</strong> Image Generation</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]"><strong>LIFETIME Unlimited</strong> Video Generation</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]"><strong>LIFETIME Unlimited</strong> Music Generation</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]"><strong>LIFETIME Unlimited</strong> Website Builder</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">🎖️ <strong>DAG Lieutenant</strong> position</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">Community Ambassador program</span>
              </div>
              <div className="flex items-start relative">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <div className="flex items-center gap-1">
                  <svg 
                    className="w-3.5 h-3.5 text-[#6366f1] cursor-help" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    onMouseEnter={() => setHoveredBadge('lieutenant')}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-[#595250]">Exclusive DAG Lieutenant badge</span>
                </div>
                {hoveredBadge === 'lieutenant' && (
                  <div className="absolute left-0 top-8 z-50 w-72 p-3 bg-white rounded-lg shadow-xl border-2 border-[#6366f1]">
                    <p className="text-xs text-gray-700"><strong className="text-[#6366f1]">DAG Lieutenant Badge:</strong> Elite status badge with special privileges - priority feature access, exclusive community channel, VIP support, and recognition as a founding member of the DAG Army.</p>
                  </div>
                )}
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">Early access to all features</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">VIP support channel</span>
              </div>
            </div>
          </div>
        </div>

        {/* On Demand Credit Top Up */}
        <div className="relative group h-full">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 sm:p-8 border border-gray-200 hover:border-[#6366f1] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-[#251b18] mb-2">Credit Top-Up</h3>
              <p className="text-sm text-[#595250]">Pay as you go</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl sm:text-5xl font-bold text-[#6366f1]">Custom</span>
              </div>
              <p className="text-xs text-[#595250] mt-1">Flexible credit packages</p>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-[#251b18] rounded-xl font-semibold hover:from-[#6366f1] hover:to-[#8b5cf6] hover:text-white transition-all duration-300 mb-6 border border-gray-200">
              Get Started
            </button>

            <div className="space-y-3 flex-1">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">No subscription required</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">Credits never expire</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">Use across all tools</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">Bulk discounts available</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">Perfect for occasional use</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#6366f1] mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm text-[#595250]">Instant activation</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};

export default PricingSection;

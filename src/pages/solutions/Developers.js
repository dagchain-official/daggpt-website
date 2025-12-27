import React from 'react';

const Developers = () => {
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
        <section className="py-20 bg-gradient-to-br from-gray-100 via-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-2">
                <div className="inline-block px-6 py-3 bg-gradient-to-br from-[#251b18] to-[#3d2e28] text-white rounded-full text-sm font-semibold mb-6" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.2), -2px -2px 6px rgba(100,100,100,0.3)'
                }}>
                  💻 For Developers & Founders
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-[#251b18] mb-6 leading-tight" style={{
                  textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
                }}>
                  Ship Products <span className="text-[#6366f1]">10x Faster</span> with AI
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  From idea to MVP in days, not months. Generate code, build UIs, create documentation, and launch faster than your competition.
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white p-6 rounded-xl" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.15), -5px -5px 15px rgba(255,100,70,0.3)'
                }}>
                  <div className="text-3xl font-bold mb-1">85%</div>
                  <div className="text-sm opacity-90">Faster Development</div>
                </div>
                <div className="bg-gradient-to-br from-[#251b18] to-[#3d2e28] text-white p-6 rounded-xl" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.3), -5px -5px 15px rgba(100,100,100,0.2)'
                }}>
                  <div className="text-3xl font-bold mb-1">$50K+</div>
                  <div className="text-sm opacity-90">Saved on Dev Costs</div>
                </div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 text-[#251b18] p-6 rounded-xl" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.1), -10px -10px 20px rgba(255,255,255,0.9), inset 2px 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <div className="text-3xl font-bold mb-1">2K+</div>
                  <div className="text-sm">Founders Building</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problems Section - Timeline Neumorphic */}
        <section className="py-20 bg-gradient-to-br from-gray-100 via-gray-50 to-white">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#251b18] mb-4" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>The Founder's Journey (Without AI)</h2>
              <p className="text-xl text-gray-600">Every startup faces these challenges</p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#6366f1]"></div>

              {/* Timeline Items */}
              <div className="space-y-12">
                <div className="relative pl-20">
                  <div className="absolute left-0 w-16 h-16 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold text-xl" style={{
                    boxShadow: '6px 6px 12px rgba(0,0,0,0.2), -3px -3px 8px rgba(255,100,70,0.3)'
                  }}>
                    1
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl" style={{
                    boxShadow: '8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.9)'
                  }}>
                    <h3 className="text-xl font-bold text-[#251b18] mb-2">Idea Phase: 2-4 weeks</h3>
                    <p className="text-gray-600">Sketching wireframes, writing specs, creating mockups. Burning through savings before writing a single line of code.</p>
                  </div>
                </div>

                <div className="relative pl-20">
                  <div className="absolute left-0 w-16 h-16 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold text-xl" style={{
                    boxShadow: '6px 6px 12px rgba(0,0,0,0.2), -3px -3px 8px rgba(255,100,70,0.3)'
                  }}>
                    2
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl" style={{
                    boxShadow: '8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.9)'
                  }}>
                    <h3 className="text-xl font-bold text-[#251b18] mb-2">Finding Developers: 1-2 months</h3>
                    <p className="text-gray-600">Interviewing, negotiating rates ($100-200/hr), dealing with flakes. Finally hire someone, they quit after 2 weeks.</p>
                  </div>
                </div>

                <div className="relative pl-20">
                  <div className="absolute left-0 w-16 h-16 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold text-xl" style={{
                    boxShadow: '6px 6px 12px rgba(0,0,0,0.2), -3px -3px 8px rgba(255,100,70,0.3)'
                  }}>
                    3
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl" style={{
                    boxShadow: '8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.9)'
                  }}>
                    <h3 className="text-xl font-bold text-[#251b18] mb-2">Development Hell: 3-6 months</h3>
                    <p className="text-gray-600">Bugs, scope creep, missed deadlines. Spending $50K+ before seeing a working product. Competitors launching faster.</p>
                  </div>
                </div>

                <div className="relative pl-20">
                  <div className="absolute left-0 w-16 h-16 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold text-xl" style={{
                    boxShadow: '6px 6px 12px rgba(0,0,0,0.2), -3px -3px 8px rgba(255,100,70,0.3)'
                  }}>
                    4
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl" style={{
                    boxShadow: '8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.9)'
                  }}>
                    <h3 className="text-xl font-bold text-[#251b18] mb-2">Launch Day: 9-12 months later</h3>
                    <p className="text-gray-600">Finally launch. Market has moved on. Out of money. Need to pivot but can't afford more development.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section - Card Grid Neumorphic */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#251b18] mb-4" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>Build Faster with AI</h2>
              <p className="text-xl text-gray-600">Everything you need to ship products at lightning speed</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center mb-4" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,100,70,0.3)'
                }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#251b18] mb-3">AI Code Generator</h3>
                <p className="text-gray-600 mb-4">Generate React components, APIs, database schemas, and full-stack code instantly.</p>
                <div className="text-sm text-[#6366f1] font-semibold">⚡ 10x faster coding</div>
              </div>

              {/* Card 2 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center mb-4" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,100,70,0.3)'
                }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#251b18] mb-3">Website Builder</h3>
                <p className="text-gray-600 mb-4">Build landing pages, dashboards, and full websites from text descriptions.</p>
                <div className="text-sm text-[#6366f1] font-semibold">🚀 Launch in hours</div>
              </div>

              {/* Card 3 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center mb-4" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,100,70,0.3)'
                }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#251b18] mb-3">UI/UX Generator</h3>
                <p className="text-gray-600 mb-4">Create beautiful interfaces, mockups, and design systems with AI.</p>
                <div className="text-sm text-[#6366f1] font-semibold">🎨 Professional designs</div>
              </div>

              {/* Card 4 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center mb-4" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,100,70,0.3)'
                }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#251b18] mb-3">Auto Documentation</h3>
                <p className="text-gray-600 mb-4">Generate technical docs, API references, and README files automatically.</p>
                <div className="text-sm text-[#6366f1] font-semibold">📚 Always up-to-date</div>
              </div>

              {/* Card 5 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center mb-4" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,100,70,0.3)'
                }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#251b18] mb-3">AI Chat Assistant</h3>
                <p className="text-gray-600 mb-4">Get coding help, debug issues, and learn new technologies with AI guidance.</p>
                <div className="text-sm text-[#6366f1] font-semibold">💡 24/7 support</div>
              </div>

              {/* Card 6 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center mb-4" style={{
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,100,70,0.3)'
                }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#251b18] mb-3">Demo Videos</h3>
                <p className="text-gray-600 mb-4">Create product demos, explainer videos, and tutorials for your MVP.</p>
                <div className="text-sm text-[#6366f1] font-semibold">🎥 Investor-ready</div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Developers;

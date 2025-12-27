import React, { useState } from 'react';

const KnowledgeBase = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSolutionsMenu, setShowSolutionsMenu] = useState(false);

  const categories = [
    { id: 'all', label: 'All Tools', icon: '🎯' },
    { id: 'video', label: 'Video Generation', icon: '🎬' },
    { id: 'image', label: 'Image Creation', icon: '🎨' },
    { id: 'audio', label: 'Audio & Music', icon: '🎵' },
    { id: 'website', label: 'Website Builder', icon: '🌐' },
    { id: 'mobile', label: 'Mobile Apps', icon: '📱' },
  ];

  const tutorials = [
    {
      id: 1,
      category: 'video',
      title: 'AI Video Generation',
      description: 'Create stunning videos from text prompts in minutes',
      icon: '🎬',
      color: 'from-[#ff4017] to-[#ff6b47]',
      examples: [
        'Product demos and explainer videos',
        'Social media content (TikTok, Instagram Reels)',
        'Marketing campaigns and advertisements',
        'Educational tutorials and courses'
      ],
      howItWorks: [
        'Enter your video description or script',
        'Choose style (Cinematic, Anime, Realistic, etc.)',
        'Select duration (8s to 30 minutes)',
        'AI generates scenes, adds music, and renders video'
      ],
      useCases: [
        { role: 'Content Creators', benefit: 'Post daily without filming' },
        { role: 'Marketers', benefit: 'Create ad variations instantly' },
        { role: 'Educators', benefit: 'Make engaging lesson videos' },
        { role: 'Founders', benefit: 'Build product demos fast' }
      ]
    },
    {
      id: 2,
      category: 'image',
      title: 'AI Image Generation',
      description: 'Generate professional images, artwork, and designs',
      icon: '🎨',
      color: 'from-[#ff4017] to-[#ff6b47]',
      examples: [
        'Social media graphics and thumbnails',
        'Product mockups and visualizations',
        'Brand assets and illustrations',
        'Marketing materials and banners'
      ],
      howItWorks: [
        'Describe the image you want to create',
        'Select art style and dimensions',
        'AI generates multiple variations',
        'Download or edit further'
      ],
      useCases: [
        { role: 'Content Creators', benefit: 'Custom thumbnails for every video' },
        { role: 'Marketers', benefit: 'A/B test ad creatives' },
        { role: 'Educators', benefit: 'Visual aids for lessons' },
        { role: 'Founders', benefit: 'Prototype UI designs' }
      ]
    },
    {
      id: 3,
      category: 'audio',
      title: 'AI Music & Audio',
      description: 'Generate background music, voiceovers, and sound effects',
      icon: '🎵',
      color: 'from-[#ff4017] to-[#ff6b47]',
      examples: [
        'Background music for videos',
        'Podcast intros and outros',
        'Voiceovers in multiple languages',
        'Sound effects and ambience'
      ],
      howItWorks: [
        'Describe the mood or style you need',
        'Choose duration and instruments',
        'AI composes original music',
        'Export in high quality formats'
      ],
      useCases: [
        { role: 'Content Creators', benefit: 'Royalty-free music library' },
        { role: 'Marketers', benefit: 'Brand-specific audio identity' },
        { role: 'Educators', benefit: 'Engaging audio for e-learning' },
        { role: 'Founders', benefit: 'App sounds and notifications' }
      ]
    },
    {
      id: 4,
      category: 'website',
      title: 'AI Website Builder',
      description: 'Build complete websites from text descriptions',
      icon: '🌐',
      color: 'from-[#ff4017] to-[#ff6b47]',
      examples: [
        'Landing pages for products',
        'Portfolio and personal websites',
        'Business dashboards',
        'E-commerce stores'
      ],
      howItWorks: [
        'Describe your website purpose and style',
        'AI generates layout and design',
        'Customize colors, fonts, and content',
        'Deploy with one click'
      ],
      useCases: [
        { role: 'Content Creators', benefit: 'Personal brand website' },
        { role: 'Marketers', benefit: 'Campaign landing pages' },
        { role: 'Educators', benefit: 'Course websites' },
        { role: 'Founders', benefit: 'MVP in hours, not weeks' }
      ]
    },
    {
      id: 5,
      category: 'mobile',
      title: 'AI Mobile App Builder',
      description: 'Create Android and iOS apps without coding',
      icon: '📱',
      color: 'from-[#ff4017] to-[#ff6b47]',
      examples: [
        'Business apps and utilities',
        'Educational and learning apps',
        'Social and community apps',
        'E-commerce mobile stores'
      ],
      howItWorks: [
        'Describe your app functionality',
        'Choose features and integrations',
        'AI generates native code',
        'Test and publish to app stores'
      ],
      useCases: [
        { role: 'Content Creators', benefit: 'Fan engagement apps' },
        { role: 'Marketers', benefit: 'Brand loyalty apps' },
        { role: 'Educators', benefit: 'Learning companion apps' },
        { role: 'Founders', benefit: 'Validate ideas quickly' }
      ]
    },
    {
      id: 6,
      category: 'video',
      title: 'Video Styles & Customization',
      description: 'Master different video styles for various use cases',
      icon: '🎭',
      color: 'from-[#ff4017] to-[#ff6b47]',
      examples: [
        'Cinematic: Movie-quality productions',
        'Anime: Japanese animation style',
        'Realistic: Photorealistic videos',
        'Cartoon: Fun, animated content'
      ],
      howItWorks: [
        'Select your preferred style',
        'Adjust parameters (lighting, camera angles)',
        'Preview different variations',
        'Fine-tune until perfect'
      ],
      useCases: [
        { role: 'Content Creators', benefit: 'Unique visual identity' },
        { role: 'Marketers', benefit: 'Brand-consistent videos' },
        { role: 'Educators', benefit: 'Engaging visual styles' },
        { role: 'Founders', benefit: 'Professional presentations' }
      ]
    }
  ];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = activeCategory === 'all' || tutorial.category === activeCategory;
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white">
      {/* Navigation - Neumorphic */}
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-gray-100 to-gray-50" style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 -2px 4px rgba(255,255,255,0.9)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-4 group">
              <div className="relative rounded-xl p-1" style={{
                boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -6px -6px 12px rgba(255,255,255,0.9)'
              }}>
                <img 
                  src="/images/logo8.jpg" 
                  alt="DAG GPT Logo" 
                  className="h-10 w-auto object-contain rounded-lg"
                />
              </div>
              <span className="text-xl font-bold text-[#251b18]" style={{ 
                fontFamily: 'Nasalization, sans-serif',
                textShadow: '2px 2px 4px rgba(255,255,255,0.9), -1px -1px 2px rgba(0,0,0,0.1)'
              }}>
                DAG GPT
              </span>
            </a>

            {/* Menu Items */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/#about" className="text-sm font-medium text-[#251b18] hover:text-[#ff4017] transition-colors">
                About
              </a>
              <a href="/#feature" className="text-sm font-medium text-[#251b18] hover:text-[#ff4017] transition-colors">
                Feature
              </a>
              
              {/* Solutions Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowSolutionsMenu(true)}
                onMouseLeave={() => setShowSolutionsMenu(false)}
              >
                <button className="text-sm font-medium text-[#251b18] hover:text-[#ff4017] transition-colors flex items-center gap-1 py-2">
                  Solutions
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showSolutionsMenu && (
                  <div className="absolute left-0 pt-2 w-64 z-50" style={{ top: '100%' }}>
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <a href="/solutions/content-creators" className="block px-4 py-2.5 text-sm text-[#251b18] hover:bg-gray-50 hover:text-[#ff4017] transition-colors">
                        Content Creators / Influencers
                      </a>
                      <a href="/solutions/marketers" className="block px-4 py-2.5 text-sm text-[#251b18] hover:bg-gray-50 hover:text-[#ff4017] transition-colors">
                        Marketers / Agencies
                      </a>
                      <a href="/solutions/educators" className="block px-4 py-2.5 text-sm text-[#251b18] hover:bg-gray-50 hover:text-[#ff4017] transition-colors">
                        Educators / Trainers
                      </a>
                      <a href="/solutions/developers" className="block px-4 py-2.5 text-sm text-[#251b18] hover:bg-gray-50 hover:text-[#ff4017] transition-colors">
                        Developers / Founders
                      </a>
                      <a href="/solutions/corporate" className="block px-4 py-2.5 text-sm text-[#251b18] hover:bg-gray-50 hover:text-[#ff4017] transition-colors">
                        Corporate Teams / HR / Sales
                      </a>
                      <a href="/solutions/students" className="block px-4 py-2.5 text-sm text-[#251b18] hover:bg-gray-50 hover:text-[#ff4017] transition-colors">
                        Students / Professionals
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <a href="/#pricing" className="text-sm font-medium text-[#251b18] hover:text-[#ff4017] transition-colors">
                Pricing
              </a>
              <a href="/knowledge-base" className="text-sm font-medium text-[#ff4017] transition-colors">
                Knowledge Base
              </a>
              <a href="/#blog" className="text-sm font-medium text-[#251b18] hover:text-[#ff4017] transition-colors">
                Blog
              </a>
            </div>

            {/* Login Button */}
            <div className="flex items-center space-x-3">
              <button className="px-6 py-2.5 bg-gradient-to-br from-[#ff4017] to-[#ff6b47] text-white rounded-lg text-sm font-medium transition-all" style={{
                boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -2px -2px 6px rgba(255,100,70,0.3)'
              }}>
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Neumorphic */}
      <section className="bg-gradient-to-br from-gray-100 via-gray-50 to-white py-20 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block px-6 py-3 bg-gradient-to-br from-[#ff4017] to-[#ff6b47] text-white rounded-full text-sm font-semibold mb-6" style={{
              boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -2px -2px 6px rgba(255,100,70,0.3)'
            }}>
              📚 Knowledge Base
            </div>
            <h1 className="text-5xl font-bold text-[#251b18] mb-6" style={{
              textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
            }}>Master DAG GPT Tools</h1>
            <p className="text-xl text-gray-600 mb-8">
              Learn how to use our AI tools to create amazing content, build products, and solve real-world problems
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search tutorials, tools, or solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-br from-gray-50 to-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff4017]"
                style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.9)'
                }}
              />
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter - Neumorphic */}
      <section className="bg-gradient-to-r from-gray-100 to-gray-50 sticky top-16 z-40" style={{
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
                style={activeCategory === category.id ? {
                  background: 'linear-gradient(135deg, #ff4017 0%, #ff6b47 100%)',
                  boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -2px -2px 6px rgba(255,100,70,0.3)'
                } : {
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.1), inset -3px -3px 6px rgba(255,255,255,0.9)'
                }}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorials Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {filteredTutorials.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No tutorials found. Try a different search or category.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredTutorials.map((tutorial) => (
                <div key={tutorial.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden transition-all hover:scale-[1.02]" style={{
                  boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
                }}>
                  {/* Tutorial Header - Neumorphic */}
                  <div className="bg-gradient-to-br from-white to-gray-50 p-8 border-b border-gray-100" style={{
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-5xl p-3 rounded-2xl bg-gradient-to-br from-gray-50 to-white" style={{
                        boxShadow: '8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.9)'
                      }}>{tutorial.icon}</div>
                      <div>
                        <h2 className="text-3xl font-bold text-[#251b18]" style={{
                          textShadow: '2px 2px 4px rgba(255,255,255,0.9), -1px -1px 2px rgba(0,0,0,0.1)'
                        }}>{tutorial.title}</h2>
                        <p className="text-lg text-gray-600">{tutorial.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tutorial Content */}
                  <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      {/* Examples */}
                      <div>
                        <h3 className="text-xl font-bold text-[#251b18] mb-4 flex items-center gap-2">
                          <span className="text-2xl">💡</span>
                          What You Can Create
                        </h3>
                        <ul className="space-y-3">
                          {tutorial.examples.map((example, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-gradient-to-br from-[#ff4017] to-[#ff6b47] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{
                                boxShadow: '3px 3px 6px rgba(0,0,0,0.15)'
                              }}>
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="text-gray-700">{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* How It Works */}
                      <div>
                        <h3 className="text-xl font-bold text-[#251b18] mb-4 flex items-center gap-2">
                          <span className="text-2xl">⚙️</span>
                          How It Works
                        </h3>
                        <ol className="space-y-3">
                          {tutorial.howItWorks.map((step, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-[#ff4017] text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                {index + 1}
                              </div>
                              <span className="text-gray-700 pt-1">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    {/* Use Cases */}
                    <div>
                      <h3 className="text-xl font-bold text-[#251b18] mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        Perfect For
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tutorial.useCases.map((useCase, index) => (
                          <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 transition-all hover:scale-105" style={{
                            boxShadow: '6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.9)'
                          }}>
                            <div className="font-bold text-[#251b18] mb-2">{useCase.role}</div>
                            <div className="text-sm text-gray-600">{useCase.benefit}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Tips Section - Neumorphic */}
      <section className="py-20 bg-gradient-to-br from-gray-100 via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#251b18] mb-4" style={{
              textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
            }}>Pro Tips & Best Practices</h2>
            <p className="text-xl text-gray-600">Get the most out of DAG GPT</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 transition-all hover:scale-105" style={{
              boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
            }}>
              <div className="text-3xl mb-4">✍️</div>
              <h3 className="text-xl font-bold text-[#251b18] mb-3">Write Better Prompts</h3>
              <p className="text-gray-700 mb-4">Be specific and descriptive. Include details about style, mood, colors, and context.</p>
              <div className="text-sm text-gray-600 bg-white rounded-lg p-3">
                <strong>Example:</strong> "Cinematic video of a sunset over mountains, warm orange tones, peaceful atmosphere"
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 transition-all hover:scale-105" style={{
              boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
            }}>
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-[#251b18] mb-3">Iterate & Refine</h3>
              <p className="text-gray-700 mb-4">Generate multiple variations and combine the best elements. AI gets better with feedback.</p>
              <div className="text-sm text-gray-600 bg-white rounded-lg p-3">
                <strong>Tip:</strong> Start broad, then add specific details in follow-up prompts
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 transition-all hover:scale-105" style={{
              boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
            }}>
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-[#251b18] mb-3">Save Time with Templates</h3>
              <p className="text-gray-700 mb-4">Create reusable templates for common projects. Maintain consistency across content.</p>
              <div className="text-sm text-gray-600 bg-white rounded-lg p-3">
                <strong>Use Case:</strong> Save brand colors, fonts, and styles for instant reuse
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default KnowledgeBase;

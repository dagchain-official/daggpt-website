import React, { useState } from 'react';

const Corporate = () => {
  const [openAccordion, setOpenAccordion] = useState(null);

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
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-block px-6 py-3 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white rounded-full text-sm font-semibold mb-6" style={{
                boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -2px -2px 6px rgba(255,100,70,0.3)'
              }}>
                🏢 For Corporate Teams, HR & Sales
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#251b18] mb-6 leading-tight" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>
                Transform Your <span className="text-[#6366f1]">Enterprise Operations</span> with AI
              </h1>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Empower every department with AI-powered tools for training, sales enablement, internal communications, and productivity at scale.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.1), -10px -10px 20px rgba(255,255,255,0.9), inset 2px 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <div className="text-4xl font-bold text-[#6366f1] mb-2">75%</div>
                  <div className="text-sm text-gray-600">Faster Onboarding</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.1), -10px -10px 20px rgba(255,255,255,0.9), inset 2px 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <div className="text-4xl font-bold text-[#6366f1] mb-2">3x</div>
                  <div className="text-sm text-gray-600">Content Output</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.1), -10px -10px 20px rgba(255,255,255,0.9), inset 2px 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <div className="text-4xl font-bold text-[#6366f1] mb-2">$200K+</div>
                  <div className="text-sm text-gray-600">Annual Savings</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Department Solutions - Accordion Style */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#251b18] mb-4" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>AI Solutions for Every Department</h2>
              <p className="text-xl text-gray-600">Comprehensive tools tailored to your team's needs</p>
            </div>

            <div className="space-y-6 max-w-5xl mx-auto">
              {/* HR Department */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden transition-all" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 1 ? null : 1)}
                  className="w-full p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center" style={{
                      boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,100,70,0.3)'
                    }}>
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-[#251b18]">Human Resources</h3>
                      <p className="text-gray-600">Onboarding, Training & Employee Engagement</p>
                    </div>
                  </div>
                  <svg className={`w-6 h-6 text-[#6366f1] transition-transform ${openAccordion === 1 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openAccordion === 1 && (
                  <div className="px-8 pb-8 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Onboarding Materials
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Welcome videos for new hires</li>
                          <li>• Company culture presentations</li>
                          <li>• Policy and procedure documents</li>
                          <li>• Department-specific training modules</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Training Programs
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Skills development courses</li>
                          <li>• Compliance training videos</li>
                          <li>• Leadership development content</li>
                          <li>• Interactive assessment quizzes</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Internal Communications
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Company newsletters</li>
                          <li>• Policy update announcements</li>
                          <li>• Employee recognition posts</li>
                          <li>• Benefits information guides</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Employee Handbooks
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Comprehensive policy guides</li>
                          <li>• Benefits and perks documentation</li>
                          <li>• Code of conduct materials</li>
                          <li>• FAQ sections and resources</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sales Department */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden transition-all" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 2 ? null : 2)}
                  className="w-full p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center" style={{
                      boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,100,70,0.3)'
                    }}>
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-[#251b18]">Sales Teams</h3>
                      <p className="text-gray-600">Proposals, Presentations & Sales Enablement</p>
                    </div>
                  </div>
                  <svg className={`w-6 h-6 text-[#6366f1] transition-transform ${openAccordion === 2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openAccordion === 2 && (
                  <div className="px-8 pb-8 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Sales Presentations
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Product demo presentations</li>
                          <li>• Pitch deck templates</li>
                          <li>• ROI calculators and visualizations</li>
                          <li>• Case study presentations</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Proposals & Quotes
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Custom proposal documents</li>
                          <li>• Pricing and quote templates</li>
                          <li>• Contract summaries</li>
                          <li>• Terms and conditions docs</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Sales Collateral
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Product brochures and flyers</li>
                          <li>• One-pagers and fact sheets</li>
                          <li>• Comparison charts</li>
                          <li>• Testimonial compilations</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Email Campaigns
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Outreach email sequences</li>
                          <li>• Follow-up templates</li>
                          <li>• Newsletter content</li>
                          <li>• Personalized video messages</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Marketing Department */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden transition-all" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 3 ? null : 3)}
                  className="w-full p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center" style={{
                      boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,100,70,0.3)'
                    }}>
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-[#251b18]">Marketing Teams</h3>
                      <p className="text-gray-600">Content, Campaigns & Brand Assets</p>
                    </div>
                  </div>
                  <svg className={`w-6 h-6 text-[#6366f1] transition-transform ${openAccordion === 3 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openAccordion === 3 && (
                  <div className="px-8 pb-8 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Content Marketing
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Blog posts and articles</li>
                          <li>• Whitepapers and ebooks</li>
                          <li>• Infographics and visual content</li>
                          <li>• Social media posts</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Video Content
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Product explainer videos</li>
                          <li>• Brand story videos</li>
                          <li>• Customer testimonials</li>
                          <li>• Social media clips</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Campaign Materials
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Landing page content</li>
                          <li>• Ad copy and creatives</li>
                          <li>• Email marketing campaigns</li>
                          <li>• Press releases</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Brand Assets
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Logo variations and guidelines</li>
                          <li>• Brand style guides</li>
                          <li>• Marketing templates</li>
                          <li>• Presentation decks</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Operations & IT */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden transition-all" style={{
                boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
              }}>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 4 ? null : 4)}
                  className="w-full p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center" style={{
                      boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -3px -3px 8px rgba(255,100,70,0.3)'
                    }}>
                      <span className="text-2xl font-bold text-white">4</span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-[#251b18]">Operations & IT</h3>
                      <p className="text-gray-600">Documentation, Processes & Support</p>
                    </div>
                  </div>
                  <svg className={`w-6 h-6 text-[#6366f1] transition-transform ${openAccordion === 4 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openAccordion === 4 && (
                  <div className="px-8 pb-8 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Technical Documentation
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• API documentation</li>
                          <li>• System architecture guides</li>
                          <li>• User manuals</li>
                          <li>• Troubleshooting guides</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Process Documentation
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Standard operating procedures</li>
                          <li>• Workflow diagrams</li>
                          <li>• Best practices guides</li>
                          <li>• Change management docs</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Support Materials
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Help desk knowledge base</li>
                          <li>• FAQ sections</li>
                          <li>• Video tutorials</li>
                          <li>• Quick reference guides</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#251b18] mb-3 flex items-center gap-2">
                          <span className="text-[#6366f1]">✓</span> Training Resources
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Software training videos</li>
                          <li>• Security awareness content</li>
                          <li>• Tool usage guides</li>
                          <li>• Certification prep materials</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section - Card Grid */}
        <section className="py-20 bg-gradient-to-br from-gray-100 via-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#251b18] mb-4" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>Enterprise-Grade Benefits</h2>
              <p className="text-xl text-gray-600">Built for scale, security, and success</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '🔒',
                  title: 'Enterprise Security',
                  desc: 'SOC 2 compliant, SSO integration, role-based access control, and data encryption'
                },
                {
                  icon: '📊',
                  title: 'Usage Analytics',
                  desc: 'Track team productivity, content output, cost savings, and ROI metrics'
                },
                {
                  icon: '🎯',
                  title: 'Brand Consistency',
                  desc: 'Maintain brand guidelines across all content with custom templates and style guides'
                },
                {
                  icon: '⚡',
                  title: 'Rapid Deployment',
                  desc: 'Get your entire organization up and running in days, not months'
                },
                {
                  icon: '🤝',
                  title: 'Dedicated Support',
                  desc: '24/7 priority support, dedicated account manager, and custom training'
                },
                {
                  icon: '💰',
                  title: 'Cost Savings',
                  desc: 'Reduce content creation costs by 70% while increasing output by 3x'
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                  boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
                }}>
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-[#251b18] mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Corporate;

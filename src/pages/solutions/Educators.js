import React, { useState } from 'react';

const Educators = () => {
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
              <a href="/" className="px-6 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all">
                Start Free Trial
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section - Neumorphic */}
        <section className="py-20 bg-gradient-to-br from-gray-100 via-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <div className="inline-block px-6 py-3 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white rounded-full text-sm font-semibold mb-6" style={{
                boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -2px -2px 6px rgba(255,100,70,0.3)'
              }}>
                📚 For Educators & Trainers
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#251b18] mb-6 leading-tight" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>
                Transform Your Teaching with <span className="text-[#6366f1]">AI-Powered Content</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create engaging lessons, interactive materials, and personalized learning experiences in minutes. 
                Spend less time preparing, more time inspiring students.
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-5xl font-bold text-[#6366f1] mb-2">10K+</div>
                <div className="text-sm text-gray-600">Educators Using DAG GPT</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-[#6366f1] mb-2">90%</div>
                <div className="text-sm text-gray-600">Time Saved on Prep</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-[#6366f1] mb-2">5M+</div>
                <div className="text-sm text-gray-600">Lessons Created</div>
              </div>
            </div>
          </div>
        </section>

        {/* Problems Section - Accordion Style */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#251b18] mb-4">The Educator's Daily Struggle</h2>
              <p className="text-xl text-gray-600">Sound familiar? You're not alone.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Endless Lesson Planning",
                  problem: "Spending 3-5 hours every evening creating lesson plans, presentations, and worksheets. Your personal time disappears.",
                  solution: "Generate complete lesson plans with activities, assessments, and materials in 5 minutes."
                },
                {
                  title: "Differentiation Nightmare",
                  problem: "Creating materials for different learning levels means triple the work. Advanced students bored, struggling students lost.",
                  solution: "AI automatically creates versions for different skill levels - beginner, intermediate, advanced."
                },
                {
                  title: "Outdated Resources",
                  problem: "Textbooks from 2010, boring worksheets, students disengaged. No budget for new materials.",
                  solution: "Generate fresh, current content daily. Interactive, engaging, and relevant to today's students."
                },
                {
                  title: "Assessment Overload",
                  problem: "Creating quizzes, tests, rubrics takes hours. Grading takes even longer. Weekends consumed by paperwork.",
                  solution: "Auto-generate assessments with answer keys. Create rubrics instantly. Focus on teaching, not admin."
                }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#6366f1] text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-bold text-[#251b18] text-left">{item.title}</h3>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform ${openAccordion === index ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openAccordion === index && (
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm font-semibold text-gray-500 mb-2">THE PROBLEM:</div>
                          <p className="text-gray-700">{item.problem}</p>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#6366f1] mb-2">THE SOLUTION:</div>
                          <p className="text-gray-700">{item.solution}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section - Zigzag Numbered Steps */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#251b18] mb-4">How DAG GPT Works for Educators</h2>
              <p className="text-xl text-gray-600">Four simple steps to transform your teaching</p>
            </div>

            <div className="space-y-20">
              {/* Step 1 - Left */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#6366f1] text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      1
                    </div>
                    <h3 className="text-3xl font-bold text-[#251b18]">Describe Your Lesson</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    Tell DAG GPT your subject, grade level, and learning objectives. Example: "5th grade math, teaching fractions with real-world examples"
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#6366f1] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Works for any subject and grade level</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#6366f1] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Aligns with your curriculum standards</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-100 rounded-2xl p-8 h-80 flex items-center justify-center border-2 border-[#6366f1]">
                  <div className="text-center">
                    <svg className="w-24 h-24 text-[#6366f1] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <p className="text-gray-600 font-medium">Input Interface</p>
                  </div>
                </div>
              </div>

              {/* Step 2 - Right */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 bg-gray-100 rounded-2xl p-8 h-80 flex items-center justify-center border-2 border-[#6366f1]">
                  <div className="text-center">
                    <svg className="w-24 h-24 text-[#6366f1] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-600 font-medium">Generated Content</p>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#6366f1] text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      2
                    </div>
                    <h3 className="text-3xl font-bold text-[#251b18]">AI Generates Materials</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    In seconds, get complete lesson plans, presentations, worksheets, and activities - all ready to use.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#6366f1] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Detailed lesson plans with timing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#6366f1] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Engaging activities and exercises</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 3 - Left */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#6366f1] text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      3
                    </div>
                    <h3 className="text-3xl font-bold text-[#251b18]">Customize & Personalize</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    Tweak the content to match your teaching style. Add your examples, adjust difficulty, or generate variations.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#6366f1] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Easy editing interface</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#6366f1] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Generate multiple versions instantly</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-100 rounded-2xl p-8 h-80 flex items-center justify-center border-2 border-[#6366f1]">
                  <div className="text-center">
                    <svg className="w-24 h-24 text-[#6366f1] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <p className="text-gray-600 font-medium">Customization Tools</p>
                  </div>
                </div>
              </div>

              {/* Step 4 - Right */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 bg-gray-100 rounded-2xl p-8 h-80 flex items-center justify-center border-2 border-[#6366f1]">
                  <div className="text-center">
                    <svg className="w-24 h-24 text-[#6366f1] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-gray-600 font-medium">Classroom Ready</p>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#6366f1] text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      4
                    </div>
                    <h3 className="text-3xl font-bold text-[#251b18]">Teach with Confidence</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    Download, print, or share digitally. Your materials are ready to engage and inspire your students.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#6366f1] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Export to PDF, PowerPoint, Google Docs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#6366f1] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Share with students via LMS</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Educators;

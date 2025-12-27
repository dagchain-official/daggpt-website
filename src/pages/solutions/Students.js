import React, { useState } from 'react';

const Students = () => {
  const [activeTab, setActiveTab] = useState('academic');

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
                🎓 For Students & Professionals
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#251b18] mb-6 leading-tight" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>
                Supercharge Your <span className="text-[#6366f1]">Learning & Career</span> with AI
              </h1>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                From acing exams to landing your dream job - AI tools designed to help students and professionals excel at every stage of their journey.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.1), -10px -10px 20px rgba(255,255,255,0.9), inset 2px 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <div className="text-4xl font-bold text-[#6366f1] mb-2">90%</div>
                  <div className="text-sm text-gray-600">Higher Grades</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.1), -10px -10px 20px rgba(255,255,255,0.9), inset 2px 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <div className="text-4xl font-bold text-[#6366f1] mb-2">5x</div>
                  <div className="text-sm text-gray-600">Faster Learning</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl" style={{
                  boxShadow: '10px 10px 20px rgba(0,0,0,0.1), -10px -10px 20px rgba(255,255,255,0.9), inset 2px 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <div className="text-4xl font-bold text-[#6366f1] mb-2">100K+</div>
                  <div className="text-sm text-gray-600">Students Helped</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabbed Content Section - Neumorphic */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#251b18] mb-4" style={{
                textShadow: '3px 3px 6px rgba(255,255,255,0.9), -2px -2px 4px rgba(0,0,0,0.1)'
              }}>AI Tools for Every Stage</h2>
              <p className="text-xl text-gray-600">From classroom to career - we've got you covered</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center gap-4 mb-12 flex-wrap">
              {[
                { id: 'academic', label: '📚 Academic Success', emoji: '📚' },
                { id: 'career', label: '💼 Career Development', emoji: '💼' },
                { id: 'skills', label: '🚀 Skill Building', emoji: '🚀' },
                { id: 'productivity', label: '⚡ Productivity', emoji: '⚡' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-700'
                  }`}
                  style={activeTab === tab.id ? {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '6px 6px 12px rgba(0,0,0,0.15), -2px -2px 6px rgba(255,100,70,0.3)'
                  } : {
                    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                    boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.1), inset -3px -3px 6px rgba(255,255,255,0.9)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="max-w-6xl mx-auto">
              {/* Academic Success Tab */}
              {activeTab === 'academic' && (
                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    {
                      title: 'Essay & Paper Writing',
                      items: [
                        'Research paper assistance',
                        'Thesis and dissertation support',
                        'Literature review generation',
                        'Citation and bibliography formatting',
                        'Plagiarism-free content',
                        'Grammar and style checking'
                      ]
                    },
                    {
                      title: 'Homework Help',
                      items: [
                        'Math problem solving',
                        'Science concept explanations',
                        'History and social studies research',
                        'Language learning assistance',
                        'Step-by-step solutions',
                        'Practice problem generation'
                      ]
                    },
                    {
                      title: 'Exam Preparation',
                      items: [
                        'Study guide creation',
                        'Flashcard generation',
                        'Practice test creation',
                        'Concept summarization',
                        'Memory techniques',
                        'Last-minute revision notes'
                      ]
                    },
                    {
                      title: 'Project & Presentations',
                      items: [
                        'Project topic ideas',
                        'Presentation slide design',
                        'Infographic creation',
                        'Video presentation scripts',
                        'Data visualization',
                        'Poster and report templates'
                      ]
                    },
                    {
                      title: 'Research Assistance',
                      items: [
                        'Topic research and analysis',
                        'Source finding and evaluation',
                        'Data collection strategies',
                        'Survey and questionnaire design',
                        'Statistical analysis help',
                        'Research methodology guidance'
                      ]
                    },
                    {
                      title: 'Study Materials',
                      items: [
                        'Lecture note summarization',
                        'Textbook chapter summaries',
                        'Concept mapping',
                        'Study schedule planning',
                        'Learning style optimization',
                        'Group study coordination'
                      ]
                    }
                  ].map((section, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                      boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
                    }}>
                      <h3 className="text-xl font-bold text-[#251b18] mb-4">{section.title}</h3>
                      <ul className="space-y-2">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-600">
                            <span className="text-[#6366f1] mt-1">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Career Development Tab */}
              {activeTab === 'career' && (
                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    {
                      title: 'Resume Building',
                      items: [
                        'ATS-optimized resume templates',
                        'Professional summary writing',
                        'Achievement highlighting',
                        'Skills section optimization',
                        'Industry-specific formatting',
                        'Multiple format exports (PDF, DOCX)'
                      ]
                    },
                    {
                      title: 'Cover Letters',
                      items: [
                        'Personalized cover letter generation',
                        'Company research integration',
                        'Value proposition crafting',
                        'Tone and style matching',
                        'Follow-up letter templates',
                        'Thank you note creation'
                      ]
                    },
                    {
                      title: 'Interview Preparation',
                      items: [
                        'Common interview questions',
                        'STAR method response crafting',
                        'Behavioral question practice',
                        'Technical interview prep',
                        'Mock interview scenarios',
                        'Salary negotiation strategies'
                      ]
                    },
                    {
                      title: 'LinkedIn Optimization',
                      items: [
                        'Profile headline creation',
                        'About section writing',
                        'Experience descriptions',
                        'Skills endorsement strategy',
                        'Networking message templates',
                        'Content posting ideas'
                      ]
                    },
                    {
                      title: 'Portfolio Development',
                      items: [
                        'Project showcase creation',
                        'Case study writing',
                        'Portfolio website content',
                        'Work sample descriptions',
                        'GitHub profile optimization',
                        'Personal brand storytelling'
                      ]
                    },
                    {
                      title: 'Job Search Strategy',
                      items: [
                        'Job description analysis',
                        'Company research reports',
                        'Application tracking',
                        'Networking email templates',
                        'Career path planning',
                        'Industry trend analysis'
                      ]
                    }
                  ].map((section, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                      boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
                    }}>
                      <h3 className="text-xl font-bold text-[#251b18] mb-4">{section.title}</h3>
                      <ul className="space-y-2">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-600">
                            <span className="text-[#6366f1] mt-1">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Skill Building Tab */}
              {activeTab === 'skills' && (
                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    {
                      title: 'Programming & Coding',
                      items: [
                        'Code learning tutorials',
                        'Debugging assistance',
                        'Algorithm explanations',
                        'Project idea generation',
                        'Code review and optimization',
                        'Documentation writing'
                      ]
                    },
                    {
                      title: 'Design Skills',
                      items: [
                        'UI/UX design principles',
                        'Graphic design tutorials',
                        'Color theory guidance',
                        'Typography selection',
                        'Design tool tutorials',
                        'Portfolio piece creation'
                      ]
                    },
                    {
                      title: 'Writing & Communication',
                      items: [
                        'Creative writing exercises',
                        'Technical writing skills',
                        'Business communication',
                        'Public speaking scripts',
                        'Storytelling techniques',
                        'Content creation strategies'
                      ]
                    },
                    {
                      title: 'Data & Analytics',
                      items: [
                        'Excel and spreadsheet mastery',
                        'Data visualization techniques',
                        'Statistical analysis basics',
                        'SQL query writing',
                        'Dashboard creation',
                        'Business intelligence concepts'
                      ]
                    },
                    {
                      title: 'Digital Marketing',
                      items: [
                        'SEO fundamentals',
                        'Social media strategy',
                        'Content marketing basics',
                        'Email campaign creation',
                        'Analytics and metrics',
                        'Personal brand building'
                      ]
                    },
                    {
                      title: 'Business Skills',
                      items: [
                        'Financial literacy basics',
                        'Project management fundamentals',
                        'Leadership development',
                        'Negotiation techniques',
                        'Time management strategies',
                        'Entrepreneurship guidance'
                      ]
                    }
                  ].map((section, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                      boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
                    }}>
                      <h3 className="text-xl font-bold text-[#251b18] mb-4">{section.title}</h3>
                      <ul className="space-y-2">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-600">
                            <span className="text-[#6366f1] mt-1">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Productivity Tab */}
              {activeTab === 'productivity' && (
                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    {
                      title: 'Time Management',
                      items: [
                        'Study schedule creation',
                        'Task prioritization',
                        'Deadline tracking',
                        'Pomodoro timer integration',
                        'Calendar optimization',
                        'Break time planning'
                      ]
                    },
                    {
                      title: 'Note Taking',
                      items: [
                        'Lecture note organization',
                        'Cornell note method',
                        'Mind mapping tools',
                        'Voice-to-text notes',
                        'Note summarization',
                        'Cross-referencing system'
                      ]
                    },
                    {
                      title: 'Organization Tools',
                      items: [
                        'Digital filing system',
                        'Research organization',
                        'Bookmark management',
                        'Reference library',
                        'Cloud storage optimization',
                        'Version control basics'
                      ]
                    },
                    {
                      title: 'Focus & Concentration',
                      items: [
                        'Distraction blocking tips',
                        'Deep work strategies',
                        'Study environment setup',
                        'Mindfulness techniques',
                        'Energy management',
                        'Motivation maintenance'
                      ]
                    },
                    {
                      title: 'Collaboration Tools',
                      items: [
                        'Group project coordination',
                        'Shared document creation',
                        'Meeting scheduling',
                        'Task delegation',
                        'Communication templates',
                        'Feedback collection'
                      ]
                    },
                    {
                      title: 'Learning Optimization',
                      items: [
                        'Learning style identification',
                        'Memory technique application',
                        'Spaced repetition system',
                        'Active recall practice',
                        'Progress tracking',
                        'Goal setting and review'
                      ]
                    }
                  ].map((section, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 transition-all hover:scale-105" style={{
                      boxShadow: '12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.9)'
                    }}>
                      <h3 className="text-xl font-bold text-[#251b18] mb-4">{section.title}</h3>
                      <ul className="space-y-2">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-600">
                            <span className="text-[#6366f1] mt-1">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Students;

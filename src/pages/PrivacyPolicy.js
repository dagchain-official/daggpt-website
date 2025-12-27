import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl opacity-90">Last Updated: December 21, 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-4 border-orange-500 pb-2 inline-block">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed mt-6">
              Welcome to <span className="font-semibold text-orange-600">DAGGPT</span> ("we," "our," or "us"). 
              We are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
              use our AI-powered platform for content creation, website building, and social media automation.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By using DAGGPT, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-4 border-orange-500 pb-2 inline-block">
              Information We Collect
            </h2>
            
            <div className="mt-6 space-y-6">
              <div className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-500">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Name and email address (when you create an account)</li>
                  <li>Profile information (optional)</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Communication preferences</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Usage Data</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Content you create (images, videos, websites, social media posts)</li>
                  <li>AI prompts and generation history</li>
                  <li>Platform usage statistics and analytics</li>
                  <li>Device information (browser type, operating system, IP address)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Third-Party Integrations</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Social media account connections (Facebook, Instagram, Twitter, TikTok)</li>
                  <li>API keys for third-party services (OpenAI, Gemini, Claude, etc.)</li>
                  <li>Website deployment credentials (GitHub, Netlify)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-4 border-orange-500 pb-2 inline-block">
              How We Use Your Information
            </h2>
            
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 shadow-md">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Generation</h3>
                <p className="text-gray-700 text-sm">
                  To provide AI-powered content creation services including images, videos, and social media posts.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 shadow-md">
                <div className="text-3xl mb-3">🔧</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Improvement</h3>
                <p className="text-gray-700 text-sm">
                  To analyze usage patterns and improve our platform's features and performance.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 shadow-md">
                <div className="text-3xl mb-3">📧</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Communication</h3>
                <p className="text-gray-700 text-sm">
                  To send you updates, newsletters, and important service announcements.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 shadow-md">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Security</h3>
                <p className="text-gray-700 text-sm">
                  To protect against fraud, unauthorized access, and ensure platform security.
                </p>
              </div>
            </div>
          </section>

          {/* Data Storage and Security */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-4 border-orange-500 pb-2 inline-block">
              Data Storage & Security
            </h2>
            <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700"><strong>Encryption:</strong> All data is encrypted in transit (SSL/TLS) and at rest</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700"><strong>Secure Storage:</strong> Data stored on secure cloud infrastructure (Firebase, Supabase)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700"><strong>Access Control:</strong> Strict access controls and authentication mechanisms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700"><strong>Regular Audits:</strong> Periodic security audits and vulnerability assessments</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-4 border-orange-500 pb-2 inline-block">
              Third-Party Services
            </h2>
            <p className="text-gray-700 leading-relaxed mt-6 mb-4">
              DAGGPT integrates with various third-party AI and service providers to deliver our features:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white border-2 border-orange-200 rounded-lg p-4 text-center">
                <p className="font-semibold text-gray-900">AI Models</p>
                <p className="text-sm text-gray-600 mt-2">OpenAI, Google Gemini, Anthropic Claude, Grok AI</p>
              </div>
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4 text-center">
                <p className="font-semibold text-gray-900">Media Generation</p>
                <p className="text-sm text-gray-600 mt-2">KIE.AI, Suno AI, Runway ML</p>
              </div>
              <div className="bg-white border-2 border-purple-200 rounded-lg p-4 text-center">
                <p className="font-semibold text-gray-900">Infrastructure</p>
                <p className="text-sm text-gray-600 mt-2">Vercel, Firebase, Supabase</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4 text-sm">
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-4 border-orange-500 pb-2 inline-block">
              Your Rights
            </h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-start bg-orange-50 rounded-lg p-4">
                <span className="text-2xl mr-4">👁️</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Access</h3>
                  <p className="text-gray-700 text-sm">Request access to your personal data</p>
                </div>
              </div>
              <div className="flex items-start bg-blue-50 rounded-lg p-4">
                <span className="text-2xl mr-4">✏️</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Correction</h3>
                  <p className="text-gray-700 text-sm">Update or correct inaccurate information</p>
                </div>
              </div>
              <div className="flex items-start bg-red-50 rounded-lg p-4">
                <span className="text-2xl mr-4">🗑️</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Deletion</h3>
                  <p className="text-gray-700 text-sm">Request deletion of your account and data</p>
                </div>
              </div>
              <div className="flex items-start bg-purple-50 rounded-lg p-4">
                <span className="text-2xl mr-4">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Portability</h3>
                  <p className="text-gray-700 text-sm">Export your data in a machine-readable format</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-4 border-orange-500 pb-2 inline-block">
              Cookies & Tracking
            </h2>
            <p className="text-gray-700 leading-relaxed mt-6">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage, and 
              personalize content. You can control cookie preferences through your browser settings.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-4 border-orange-500 pb-2 inline-block">
              Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed mt-6">
              DAGGPT is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please contact us.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-4 border-orange-500 pb-2 inline-block">
              Changes to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed mt-6">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-4 border-orange-500 pb-2 inline-block">
              Contact Us
            </h2>
            <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border-l-4 border-orange-500">
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@daggpt.com</p>
                <p><strong>Website:</strong> https://daggpt.vercel.app</p>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">
              © 2024 DAGGPT. All rights reserved. | This Privacy Policy is effective as of December 21, 2024.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

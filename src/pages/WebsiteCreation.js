import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WebsiteCreation = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors">
                ← Back
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold">W</span>
                </div>
                <span className="text-xl font-semibold">Website Creation</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🌐</div>
            <h1 className="text-4xl font-bold mb-4">Create Your Website</h1>
            <p className="text-xl text-gray-400">Describe your website and we'll build it for you</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold mb-4">Website Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., A modern portfolio website for a photographer with a gallery, about page, and contact form..."
                className="w-full h-40 bg-dark-surface border border-dark-border rounded-xl p-4 text-white placeholder-gray-500 resize-none outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              disabled={!prompt}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Website
            </button>
          </div>

          <div className="mt-12 text-center text-gray-500">
            <p>Full implementation coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WebsiteCreation;

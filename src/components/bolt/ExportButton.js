/**
 * Export Button Component
 * Allows users to download their projects
 */

import React, { useState } from 'react';
import { Download, Github, Globe, Copy } from 'lucide-react';
import { exportAsZip, generateGitHubInstructions, generateVercelConfig, generateNetlifyConfig } from '../../services/export/exportProject';

const ExportButton = ({ files, projectName = 'my-project' }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportZip = async () => {
    setExporting(true);
    try {
      await exportAsZip(files, projectName);
      alert('✅ Project exported successfully!');
    } catch (error) {
      alert('❌ Failed to export project');
      console.error(error);
    }
    setExporting(false);
    setShowMenu(false);
  };

  const handleCopyGitHub = () => {
    const instructions = generateGitHubInstructions(projectName);
    navigator.clipboard.writeText(instructions);
    alert('✅ GitHub instructions copied to clipboard!');
    setShowMenu(false);
  };

  const handleCopyVercel = () => {
    const config = generateVercelConfig();
    navigator.clipboard.writeText(config['vercel.json']);
    alert('✅ Vercel config copied to clipboard!');
    setShowMenu(false);
  };

  const handleCopyNetlify = () => {
    const config = generateNetlifyConfig();
    navigator.clipboard.writeText(config['netlify.toml']);
    alert('✅ Netlify config copied to clipboard!');
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        disabled={exporting}
      >
        <Download size={18} />
        {exporting ? 'Exporting...' : 'Export'}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-2">
            <button
              onClick={handleExportZip}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition text-left"
            >
              <Download size={18} className="text-indigo-600" />
              <div>
                <div className="font-medium text-gray-900">Download ZIP</div>
                <div className="text-sm text-gray-500">Get all project files</div>
              </div>
            </button>

            <button
              onClick={handleCopyGitHub}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition text-left"
            >
              <Github size={18} className="text-gray-700" />
              <div>
                <div className="font-medium text-gray-900">GitHub</div>
                <div className="text-sm text-gray-500">Copy deploy instructions</div>
              </div>
            </button>

            <button
              onClick={handleCopyVercel}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition text-left"
            >
              <Globe size={18} className="text-black" />
              <div>
                <div className="font-medium text-gray-900">Vercel</div>
                <div className="text-sm text-gray-500">Copy config file</div>
              </div>
            </button>

            <button
              onClick={handleCopyNetlify}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition text-left"
            >
              <Globe size={18} className="text-teal-600" />
              <div>
                <div className="font-medium text-gray-900">Netlify</div>
                <div className="text-sm text-gray-500">Copy config file</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;

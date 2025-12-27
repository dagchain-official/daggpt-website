/**
 * Enhanced Export Button Component with Real Integrations
 * Supports GitHub, Netlify, and WebContainer deployments
 */

import React, { useState } from 'react';
import { Download, Github, Globe, Loader, CheckCircle, XCircle, Box } from 'lucide-react';
import { exportAsZip } from '../../services/export/exportProject';
import { 
  deployToGitHub, 
  isGitHubAuthenticated,
  removeGitHubToken 
} from '../../services/integrations/githubService';
import { 
  deployToNetlify, 
  isNetlifyAuthenticated,
  removeNetlifyToken 
} from '../../services/integrations/netlifyService';
import {
  createWebContainerProject,
  connectToWebContainerProject,
  listWebContainerProjects
} from '../../services/integrations/webcontainerIntegration';

const EnhancedExportButton = ({ files, projectName = 'my-project' }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null);
  const [deployProgress, setDeployProgress] = useState(null);
  const [showWebContainerModal, setShowWebContainerModal] = useState(false);
  const [webContainerProjects, setWebContainerProjects] = useState([]);

  const handleExportZip = async () => {
    setDeploying(true);
    setDeployStatus({ type: 'loading', message: 'Creating ZIP file...' });
    
    try {
      await exportAsZip(files, projectName);
      setDeployStatus({ type: 'success', message: 'Project exported successfully!' });
      setTimeout(() => {
        setDeployStatus(null);
        setShowMenu(false);
      }, 2000);
    } catch (error) {
      setDeployStatus({ type: 'error', message: 'Failed to export project' });
      console.error(error);
    }
    
    setDeploying(false);
  };

  const handleGitHubDeploy = async () => {
    setDeploying(true);
    setDeployStatus({ type: 'loading', message: 'Deploying to GitHub...' });
    setDeployProgress(null);
    
    try {
      const result = await deployToGitHub(projectName, files, (progress) => {
        setDeployProgress(progress);
        setDeployStatus({ 
          type: 'loading', 
          message: progress.message,
          percentage: progress.percentage 
        });
      });
      
      setDeployStatus({ 
        type: 'success', 
        message: 'Deployed to GitHub!',
        url: result.repoUrl,
        pagesUrl: result.pagesUrl
      });
    } catch (error) {
      setDeployStatus({ 
        type: 'error', 
        message: error.message || 'GitHub deployment failed' 
      });
      console.error(error);
    }
    
    setDeploying(false);
  };

  const handleNetlifyDeploy = async () => {
    setDeploying(true);
    setDeployStatus({ type: 'loading', message: 'Deploying to Netlify...' });
    setDeployProgress(null);
    
    try {
      const result = await deployToNetlify(projectName, files, (progress) => {
        setDeployProgress(progress);
        setDeployStatus({ 
          type: 'loading', 
          message: progress.message,
          percentage: progress.percentage 
        });
      });
      
      setDeployStatus({ 
        type: 'success', 
        message: 'Deployed to Netlify!',
        url: result.url,
        adminUrl: result.adminUrl
      });
    } catch (error) {
      setDeployStatus({ 
        type: 'error', 
        message: error.message || 'Netlify deployment failed' 
      });
      console.error(error);
    }
    
    setDeploying(false);
  };

  const handleWebContainerConnect = async () => {
    setShowWebContainerModal(true);
    const projects = listWebContainerProjects();
    setWebContainerProjects(projects);
  };

  const handleCreateWebContainerProject = async () => {
    setDeploying(true);
    setDeployStatus({ type: 'loading', message: 'Creating WebContainer project...' });
    
    try {
      const result = await createWebContainerProject(projectName, files);
      setDeployStatus({ 
        type: 'success', 
        message: 'WebContainer project created!',
        projectId: result.projectId
      });
      
      // Refresh projects list
      const projects = listWebContainerProjects();
      setWebContainerProjects(projects);
    } catch (error) {
      setDeployStatus({ 
        type: 'error', 
        message: error.message || 'Failed to create project' 
      });
      console.error(error);
    }
    
    setDeploying(false);
  };

  const handleConnectToProject = async (projectId) => {
    setDeploying(true);
    setDeployStatus({ type: 'loading', message: 'Connecting to project...' });
    
    try {
      const result = await connectToWebContainerProject(projectId);
      setDeployStatus({ 
        type: 'success', 
        message: 'Connected to project!',
        serverUrl: result.serverUrl
      });
      
      // Open preview in new tab
      if (result.serverUrl) {
        window.open(result.serverUrl, '_blank');
      }
    } catch (error) {
      setDeployStatus({ 
        type: 'error', 
        message: error.message || 'Failed to connect to project' 
      });
      console.error(error);
    }
    
    setDeploying(false);
    setShowWebContainerModal(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        disabled={deploying}
      >
        {deploying ? <Loader size={18} className="animate-spin" /> : <Download size={18} />}
        {deploying ? 'Processing...' : 'Export & Deploy'}
      </button>

      {/* Deployment Status */}
      {deployStatus && (
        <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl border p-4 z-50 ${
          deployStatus.type === 'success' ? 'bg-green-50 border-green-200' :
          deployStatus.type === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            {deployStatus.type === 'loading' && <Loader size={20} className="animate-spin text-blue-600 flex-shrink-0 mt-0.5" />}
            {deployStatus.type === 'success' && <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />}
            {deployStatus.type === 'error' && <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />}
            
            <div className="flex-1">
              <p className={`font-medium ${
                deployStatus.type === 'success' ? 'text-green-900' :
                deployStatus.type === 'error' ? 'text-red-900' :
                'text-blue-900'
              }`}>
                {deployStatus.message}
              </p>
              
              {deployStatus.percentage && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${deployStatus.percentage}%` }}
                  />
                </div>
              )}
              
              {deployStatus.url && (
                <a 
                  href={deployStatus.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-2 block"
                >
                  View Site →
                </a>
              )}
              
              {deployStatus.pagesUrl && (
                <a 
                  href={deployStatus.pagesUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline block"
                >
                  GitHub Pages →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Menu */}
      {showMenu && !deployStatus && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-2">
            {/* Download ZIP */}
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

            {/* GitHub */}
            <button
              onClick={handleGitHubDeploy}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition text-left"
            >
              <Github size={18} className="text-gray-700" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Deploy to GitHub</div>
                <div className="text-sm text-gray-500">
                  {isGitHubAuthenticated() ? 'Create repo & deploy' : 'Connect & deploy'}
                </div>
              </div>
              {isGitHubAuthenticated() && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Connected
                </span>
              )}
            </button>

            {/* Netlify */}
            <button
              onClick={handleNetlifyDeploy}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition text-left"
            >
              <Globe size={18} className="text-teal-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Deploy to Netlify</div>
                <div className="text-sm text-gray-500">
                  {isNetlifyAuthenticated() ? 'Deploy instantly' : 'Connect & deploy'}
                </div>
              </div>
              {isNetlifyAuthenticated() && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Connected
                </span>
              )}
            </button>

            {/* WebContainer */}
            <button
              onClick={handleWebContainerConnect}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition text-left"
            >
              <Box size={18} className="text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">WebContainer</div>
                <div className="text-sm text-gray-500">Open in new tab</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* WebContainer Modal */}
      {showWebContainerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">WebContainer Projects</h3>
            
            {webContainerProjects.length === 0 ? (
              <div className="text-center py-8">
                <Box size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">No active projects</p>
                <button
                  onClick={handleCreateWebContainerProject}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  disabled={deploying}
                >
                  Create New Project
                </button>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {webContainerProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleConnectToProject(project.id)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(project.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowWebContainerModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              {webContainerProjects.length > 0 && (
                <button
                  onClick={handleCreateWebContainerProject}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  disabled={deploying}
                >
                  New Project
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedExportButton;

/**
 * WebContainer Integration Service
 * Handles WebContainer project management and connections
 */

import { getWebContainer } from '../webContainerService';

let activeProjects = new Map();

/**
 * Create a new WebContainer project
 */
export const createWebContainerProject = async (projectName, files) => {
  try {
    const webcontainer = await getWebContainer();
    
    // Convert files to WebContainer format
    const fileTree = convertToFileTree(files);
    
    // Mount files
    await webcontainer.mount(fileTree);
    
    // Install dependencies
    const installProcess = await webcontainer.spawn('npm', ['install']);
    await installProcess.exit;
    
    // Start dev server
    const devProcess = await webcontainer.spawn('npm', ['run', 'dev']);
    
    // Wait for server to be ready
    webcontainer.on('server-ready', (port, url) => {
      console.log(`Server ready at ${url}`);
    });
    
    // Store project
    const projectId = generateProjectId();
    activeProjects.set(projectId, {
      id: projectId,
      name: projectName,
      webcontainer,
      devProcess,
      files,
      createdAt: new Date()
    });
    
    return {
      projectId,
      name: projectName,
      status: 'ready'
    };
  } catch (error) {
    console.error('Failed to create WebContainer project:', error);
    throw error;
  }
};

/**
 * Connect to an existing WebContainer project
 */
export const connectToWebContainerProject = async (projectId) => {
  const project = activeProjects.get(projectId);
  
  if (!project) {
    throw new Error('Project not found. Please create a new project first.');
  }
  
  // Get server URL
  const webcontainer = project.webcontainer;
  const serverUrl = await getServerUrl(webcontainer);
  
  return {
    projectId: project.id,
    name: project.name,
    serverUrl,
    files: project.files,
    status: 'connected'
  };
};

/**
 * List all active WebContainer projects
 */
export const listWebContainerProjects = () => {
  return Array.from(activeProjects.values()).map(project => ({
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    status: 'active'
  }));
};

/**
 * Update files in WebContainer project
 */
export const updateWebContainerFiles = async (projectId, files) => {
  const project = activeProjects.get(projectId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const webcontainer = project.webcontainer;
  
  // Update each file
  for (const [path, content] of Object.entries(files)) {
    await webcontainer.fs.writeFile(path, content);
  }
  
  // Update stored files
  project.files = { ...project.files, ...files };
  
  return {
    success: true,
    updatedFiles: Object.keys(files).length
  };
};

/**
 * Stop WebContainer project
 */
export const stopWebContainerProject = async (projectId) => {
  const project = activeProjects.get(projectId);
  
  if (!project) {
    return { success: false, message: 'Project not found' };
  }
  
  // Kill dev server process
  if (project.devProcess) {
    project.devProcess.kill();
  }
  
  // Remove from active projects
  activeProjects.delete(projectId);
  
  return {
    success: true,
    message: 'Project stopped'
  };
};

/**
 * Get WebContainer project status
 */
export const getWebContainerProjectStatus = async (projectId) => {
  const project = activeProjects.get(projectId);
  
  if (!project) {
    return {
      status: 'not_found',
      message: 'Project not found'
    };
  }
  
  try {
    const serverUrl = await getServerUrl(project.webcontainer);
    
    return {
      status: 'running',
      projectId: project.id,
      name: project.name,
      serverUrl,
      uptime: Date.now() - project.createdAt.getTime()
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
};

/**
 * Export WebContainer project files
 */
export const exportWebContainerProject = async (projectId) => {
  const project = activeProjects.get(projectId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  return {
    projectId: project.id,
    name: project.name,
    files: project.files,
    exportedAt: new Date()
  };
};

/**
 * Helper: Convert flat files to WebContainer tree format
 */
const convertToFileTree = (files) => {
  const tree = {};
  
  for (const [path, content] of Object.entries(files)) {
    const parts = path.split('/');
    let current = tree;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      
      if (isFile) {
        current[part] = {
          file: {
            contents: content
          }
        };
      } else {
        if (!current[part]) {
          current[part] = {
            directory: {}
          };
        }
        current = current[part].directory;
      }
    }
  }
  
  return tree;
};

/**
 * Helper: Get server URL from WebContainer
 */
const getServerUrl = async (webcontainer) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Server URL timeout'));
    }, 30000);
    
    webcontainer.on('server-ready', (port, url) => {
      clearTimeout(timeout);
      resolve(url);
    });
  });
};

/**
 * Helper: Generate unique project ID
 */
const generateProjectId = () => {
  return `wc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Save project to localStorage for persistence
 */
export const saveWebContainerProjectToStorage = (projectId) => {
  const project = activeProjects.get(projectId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  const projectData = {
    id: project.id,
    name: project.name,
    files: project.files,
    createdAt: project.createdAt.toISOString()
  };
  
  const savedProjects = JSON.parse(localStorage.getItem('webcontainer_projects') || '[]');
  savedProjects.push(projectData);
  localStorage.setItem('webcontainer_projects', JSON.stringify(savedProjects));
  
  return projectData;
};

/**
 * Load saved projects from localStorage
 */
export const loadSavedWebContainerProjects = () => {
  try {
    const savedProjects = JSON.parse(localStorage.getItem('webcontainer_projects') || '[]');
    return savedProjects;
  } catch (error) {
    console.error('Failed to load saved projects:', error);
    return [];
  }
};

/**
 * Restore project from saved data
 */
export const restoreWebContainerProject = async (savedProject) => {
  return await createWebContainerProject(savedProject.name, savedProject.files);
};

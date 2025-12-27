/**
 * Project History Service
 * Saves and manages project history in localStorage
 */

const STORAGE_KEY = 'daggpt_project_history';
const MAX_PROJECTS = 50;

/**
 * Save project to history
 */
export function saveProject(project) {
  try {
    const history = getProjectHistory();
    
    const projectData = {
      id: generateProjectId(),
      name: project.name || 'Untitled Project',
      type: project.type || 'unknown',
      files: project.files,
      thumbnail: project.thumbnail || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: project.description || '',
      tags: project.tags || []
    };

    // Check if project already exists (update instead of create)
    const existingIndex = history.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      history[existingIndex] = {
        ...history[existingIndex],
        ...projectData,
        updatedAt: new Date().toISOString()
      };
    } else {
      history.unshift(projectData);
    }

    // Limit history size
    const limitedHistory = history.slice(0, MAX_PROJECTS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));

    return projectData;
  } catch (error) {
    console.error('[History] Failed to save project:', error);
    return null;
  }
}

/**
 * Get all projects from history
 */
export function getProjectHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[History] Failed to load history:', error);
    return [];
  }
}

/**
 * Get single project by ID
 */
export function getProject(projectId) {
  const history = getProjectHistory();
  return history.find(p => p.id === projectId);
}

/**
 * Delete project from history
 */
export function deleteProject(projectId) {
  try {
    const history = getProjectHistory();
    const filtered = history.filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('[History] Failed to delete project:', error);
    return false;
  }
}

/**
 * Clear all history
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('[History] Failed to clear history:', error);
    return false;
  }
}

/**
 * Search projects
 */
export function searchProjects(query) {
  const history = getProjectHistory();
  const lowerQuery = query.toLowerCase();

  return history.filter(project => 
    project.name.toLowerCase().includes(lowerQuery) ||
    project.description.toLowerCase().includes(lowerQuery) ||
    project.type.toLowerCase().includes(lowerQuery) ||
    project.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get projects by type
 */
export function getProjectsByType(type) {
  const history = getProjectHistory();
  return history.filter(p => p.type === type);
}

/**
 * Get recent projects
 */
export function getRecentProjects(limit = 10) {
  const history = getProjectHistory();
  return history.slice(0, limit);
}

/**
 * Generate project ID
 */
function generateProjectId() {
  return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export history as JSON
 */
export function exportHistory() {
  const history = getProjectHistory();
  const json = JSON.stringify(history, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `daggpt-history-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  return true;
}

/**
 * Import history from JSON
 */
export function importHistory(jsonData) {
  try {
    const imported = JSON.parse(jsonData);
    
    if (!Array.isArray(imported)) {
      throw new Error('Invalid history format');
    }

    const currentHistory = getProjectHistory();
    const merged = [...imported, ...currentHistory];
    
    // Remove duplicates by ID
    const unique = merged.reduce((acc, project) => {
      if (!acc.find(p => p.id === project.id)) {
        acc.push(project);
      }
      return acc;
    }, []);

    // Limit size
    const limited = unique.slice(0, MAX_PROJECTS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));

    return true;
  } catch (error) {
    console.error('[History] Failed to import history:', error);
    return false;
  }
}

/**
 * Get storage usage
 */
export function getStorageUsage() {
  try {
    const history = getProjectHistory();
    const json = JSON.stringify(history);
    const bytes = new Blob([json]).size;
    const kb = (bytes / 1024).toFixed(2);
    const mb = (bytes / 1024 / 1024).toFixed(2);

    return {
      bytes,
      kb,
      mb,
      projects: history.length,
      maxProjects: MAX_PROJECTS,
      percentage: (history.length / MAX_PROJECTS) * 100
    };
  } catch (error) {
    console.error('[History] Failed to get storage usage:', error);
    return null;
  }
}

/**
 * Duplicate project
 */
export function duplicateProject(projectId) {
  const project = getProject(projectId);
  
  if (!project) {
    return null;
  }

  const duplicate = {
    ...project,
    id: generateProjectId(),
    name: `${project.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return saveProject(duplicate);
}

/**
 * Update project metadata
 */
export function updateProjectMetadata(projectId, updates) {
  try {
    const history = getProjectHistory();
    const index = history.findIndex(p => p.id === projectId);

    if (index < 0) {
      return false;
    }

    history[index] = {
      ...history[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('[History] Failed to update metadata:', error);
    return false;
  }
}

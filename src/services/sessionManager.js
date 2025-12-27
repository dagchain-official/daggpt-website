/**
 * Session State Management - Persistent sessions with user authentication
 * Uses Supabase for user-specific session storage
 */

import {
  saveWebsiteSession as supabaseSaveSession,
  getWebsiteSessions as supabaseGetSessions,
  loadWebsiteSession as supabaseLoadSession,
  deleteWebsiteSession as supabaseDeleteSession
} from './supabaseService';

const CURRENT_SESSION_KEY = 'current_session_id';
let currentUserId = null;

/**
 * Set current user ID (call this when user logs in)
 */
export function setCurrentUser(userId) {
  currentUserId = userId;
  console.log('[Session] User set:', userId);
}

/**
 * Get current user ID
 */
export function getCurrentUser() {
  return currentUserId;
}

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save session to Supabase
 */
export async function saveSession(sessionData) {
  if (!currentUserId) {
    console.error('[Session] No user logged in');
    throw new Error('User must be logged in to save sessions');
  }

  try {
    const session = {
      id: sessionData.id || generateSessionId(),
      projectName: sessionData.projectName || 'Untitled Project',
      files: sessionData.files || {},
      metadata: sessionData.metadata || {},
      chatHistory: sessionData.chatHistory || []
    };
    
    const savedSession = await supabaseSaveSession(currentUserId, session);
    
    // Set as current session
    localStorage.setItem(CURRENT_SESSION_KEY, savedSession.id);
    
    console.log(`[Session] Saved: ${savedSession.id}`);
    return savedSession;
    
  } catch (error) {
    console.error('[Session] Save failed:', error);
    throw error;
  }
}

/**
 * Load session from Supabase
 */
export async function loadSession(sessionId) {
  if (!currentUserId) {
    console.error('[Session] No user logged in');
    return null;
  }

  try {
    const session = await supabaseLoadSession(sessionId, currentUserId);
    
    if (session) {
      console.log(`[Session] Loaded: ${sessionId}`);
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
      
      // Convert Supabase format to app format
      return {
        id: session.id,
        projectName: session.project_name,
        files: session.files,
        metadata: session.metadata,
        chatHistory: session.chat_history
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Session] Load failed:', error);
    return null;
  }
}

/**
 * Get current session ID
 */
export function getCurrentSessionId() {
  return localStorage.getItem(CURRENT_SESSION_KEY);
}

/**
 * Load current session
 */
export async function loadCurrentSession() {
  const sessionId = getCurrentSessionId();
  if (!sessionId) {
    return null;
  }
  
  return await loadSession(sessionId);
}

/**
 * List all sessions for current user
 */
export async function listSessions() {
  if (!currentUserId) {
    console.error('[Session] No user logged in');
    return [];
  }

  try {
    const sessions = await supabaseGetSessions(currentUserId);
    
    // Convert to app format
    return sessions.map(session => ({
      id: session.id,
      projectName: session.project_name,
      timestamp: new Date(session.created_at).getTime(),
      lastModified: new Date(session.updated_at).getTime()
    }));
    
  } catch (error) {
    console.error('[Session] List failed:', error);
    return [];
  }
}

/**
 * Delete session
 */
export async function deleteSession(sessionId) {
  if (!currentUserId) {
    console.error('[Session] No user logged in');
    return false;
  }

  try {
    const success = await supabaseDeleteSession(sessionId, currentUserId);
    
    // Clear current session if it was deleted
    if (success && getCurrentSessionId() === sessionId) {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
    
    return success;
    
  } catch (error) {
    console.error('[Session] Delete failed:', error);
    return false;
  }
}

/**
 * Create new session
 */
export async function createNewSession(projectName = 'New Project') {
  const session = {
    id: generateSessionId(),
    projectName,
    files: {},
    metadata: {},
    chatHistory: [],
    timestamp: Date.now(),
    lastModified: Date.now()
  };
  
  return await saveSession(session);
}

/**
 * Update session (auto-save)
 */
export async function updateSession(sessionId, updates) {
  try {
    const session = await loadSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const updatedSession = {
      ...session,
      ...updates,
      lastModified: Date.now()
    };
    
    return await saveSession(updatedSession);
    
  } catch (error) {
    console.error('[Session] Update failed:', error);
    throw error;
  }
}

/**
 * Auto-save hook (debounced)
 */
let autoSaveTimeout = null;
export function scheduleAutoSave(sessionId, data, delay = 2000) {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  autoSaveTimeout = setTimeout(async () => {
    try {
      await updateSession(sessionId, data);
      console.log('[Session] Auto-saved');
    } catch (error) {
      console.error('[Session] Auto-save failed:', error);
    }
  }, delay);
}

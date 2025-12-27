import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== USER MANAGEMENT ====================

/**
 * Create or update user profile in Supabase
 * @param {Object} user - Firebase user object
 */
export const syncUserProfile = async (user) => {
  if (!user) return null;

  try {
    console.log('🔄 Syncing user profile to Supabase:', user.uid);
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.uid,
        email: user.email,
        display_name: user.displayName || user.email?.split('@')[0],
        avatar_url: user.photoURL,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error syncing user profile:', error);
      throw error;
    }
    console.log('✅ User profile synced:', data);
    return data;
  } catch (error) {
    console.error('❌ Error syncing user profile:', error);
    return null;
  }
};

/**
 * Get user profile
 * @param {string} userId - Firebase UID
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// ==================== CONVERSATIONS ====================

/**
 * Create a new conversation
 * @param {string} userId - Firebase UID
 * @param {string} title - Conversation title
 */
export const createConversation = async (userId, title) => {
  try {
    console.log('💬 Creating conversation:', { userId, title });
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: title || 'New Conversation'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating conversation:', error);
      throw error;
    }
    console.log('✅ Conversation created:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    return null;
  }
};

/**
 * Get all conversations for a user
 * @param {string} userId - Firebase UID
 */
export const getConversations = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

/**
 * Update conversation title
 * @param {string} conversationId - Conversation UUID
 * @param {string} title - New title
 */
export const updateConversationTitle = async (conversationId, title) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating conversation:', error);
    return null;
  }
};

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation UUID
 */
export const deleteConversation = async (conversationId) => {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
};

// ==================== MESSAGES ====================

/**
 * Save a message to a conversation
 * @param {string} conversationId - Conversation UUID
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - Message content
 * @param {string} toolUsed - Tool used (chat, image, video, etc.)
 * @param {Object} metadata - Additional metadata
 */
export const saveMessage = async (conversationId, role, content, toolUsed = 'chat', metadata = {}) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        tool_used: toolUsed,
        metadata
      })
      .select()
      .single();

    if (error) throw error;
    
    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  } catch (error) {
    console.error('Error saving message:', error);
    return null;
  }
};

/**
 * Get all messages for a conversation
 * @param {string} conversationId - Conversation UUID
 */
export const getMessages = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

// ==================== CREATIONS ====================

/**
 * Save a creation (image, video, music, etc.)
 * @param {string} userId - Firebase UID
 * @param {string} type - Creation type (image, video, music, website, code)
 * @param {string} prompt - User prompt
 * @param {string} resultUrl - URL to the created content
 * @param {Object} metadata - Additional metadata
 * @param {boolean} isPublic - Privacy setting (default: true for public)
 */
export const saveCreation = async (userId, type, prompt, resultUrl, metadata = {}, isPublic = true) => {
  try {
    const { data, error } = await supabase
      .from('creations')
      .insert({
        user_id: userId,
        type,
        prompt,
        result_url: resultUrl,
        thumbnail_url: type === 'image' ? resultUrl : null,
        metadata,
        is_public: isPublic
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving creation:', error);
    return null;
  }
};

/**
 * Convert public URL to signed URL to bypass CORS
 * @param {string} url - Public URL from storage
 * @returns {string} - Signed URL or original URL if conversion fails
 */
const convertToSignedUrl = async (url) => {
  try {
    // Extract file path from public URL
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/creations\/(.+)/);
    
    if (!pathMatch) return url; // Not a storage URL, return as-is
    
    const filePath = pathMatch[1];
    
    // Create signed URL (valid for 1 year)
    const { data, error } = await supabase.storage
      .from('creations')
      .createSignedUrl(filePath, 31536000);
    
    if (error) {
      console.warn('Failed to create signed URL, using original:', error);
      return url;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.warn('Error converting to signed URL:', error);
    return url;
  }
};

/**
 * Get all creations for a user
 * @param {string} userId - Firebase UID
 * @param {string} type - Optional: filter by type
 */
export const getCreations = async (userId, type = null) => {
  try {
    let query = supabase
      .from('creations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Convert all URLs to signed URLs to bypass CORS
    const creationsWithSignedUrls = await Promise.all(
      (data || []).map(async (creation) => ({
        ...creation,
        url: await convertToSignedUrl(creation.url),
        thumbnail_url: creation.thumbnail_url ? await convertToSignedUrl(creation.thumbnail_url) : null
      }))
    );
    
    return creationsWithSignedUrls;
  } catch (error) {
    console.error('Error getting creations:', error);
    return [];
  }
};

/**
 * Update creation privacy setting
 * @param {string} creationId - Creation UUID
 * @param {boolean} isPublic - New privacy state (true = public, false = private)
 */
export const updateCreationPrivacy = async (creationId, isPublic) => {
  try {
    const { data, error } = await supabase
      .from('creations')
      .update({ is_public: isPublic })
      .eq('id', creationId)
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Creation privacy updated: ${isPublic ? 'Public' : 'Private'}`);
    return data;
  } catch (error) {
    console.error('Error updating creation privacy:', error);
    return null;
  }
};

/**
 * Delete a creation
 * @param {string} creationId - Creation UUID
 */
export const deleteCreation = async (creationId) => {
  try {
    const { error } = await supabase
      .from('creations')
      .delete()
      .eq('id', creationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting creation:', error);
    return false;
  }
};

// ==================== STORAGE ====================

/**
 * Upload a file to Supabase Storage
 * @param {File} file - File to upload
 * @param {string} userId - Firebase UID
 * @param {string} folder - Folder name (images, videos, music, etc.)
 */
export const uploadFile = async (file, userId, folder = 'misc') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('creations')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Use signed URL to bypass CORS issues (valid for 1 year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('creations')
      .createSignedUrl(filePath, 31536000); // 1 year in seconds

    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      // Fallback to public URL
      const { data: publicUrlData } = supabase.storage
        .from('creations')
        .getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    }

    return urlData.signedUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - Path to file in storage
 */
export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('creations')
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// ==================== WEBSITE BUILDER SESSIONS ====================

/**
 * Save website builder session to Supabase
 * @param {string} userId - Firebase UID
 * @param {Object} sessionData - Session data (files, chatHistory, metadata)
 */
export const saveWebsiteSession = async (userId, sessionData) => {
  try {
    const { data, error} = await supabase
      .from('website_sessions')
      .upsert({
        id: sessionData.id,
        user_id: userId,
        project_name: sessionData.projectName || 'Untitled Project',
        files: sessionData.files || {},
        metadata: sessionData.metadata || {},
        chat_history: sessionData.chatHistory || [],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Website session saved:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error saving website session:', error);
    throw error;
  }
};

/**
 * Get all website sessions for a user
 * @param {string} userId - Firebase UID
 */
export const getWebsiteSessions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('website_sessions')
      .select('id, project_name, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Error getting website sessions:', error);
    return [];
  }
};

/**
 * Load a specific website session
 * @param {string} sessionId - Session ID
 * @param {string} userId - Firebase UID (for security)
 */
export const loadWebsiteSession = async (sessionId, userId) => {
  try {
    const { data, error } = await supabase
      .from('website_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error loading website session:', error);
    return null;
  }
};

/**
 * Delete a website session
 * @param {string} sessionId - Session ID
 * @param {string} userId - Firebase UID (for security)
 */
export const deleteWebsiteSession = async (sessionId, userId) => {
  try {
    const { error } = await supabase
      .from('website_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) throw error;
    console.log('✅ Website session deleted:', sessionId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting website session:', error);
    return false;
  }
};

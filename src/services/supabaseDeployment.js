import { supabase } from './supabaseService';

/**
 * Deploy generated website to Supabase Storage
 * Returns a public URL where the website can be accessed
 */
export async function deployToSupabase(files, projectName, userId) {
  try {
    console.log('[Supabase Deploy] Starting deployment...');
    console.log('[Supabase Deploy] Files to upload:', Object.keys(files).length);
    
    // Generate unique project ID
    const timestamp = Date.now();
    const projectId = `${userId}_${projectName.replace(/\s+/g, '-').toLowerCase()}_${timestamp}`;
    const bucketName = 'websites';
    
    console.log('[Supabase Deploy] Project ID:', projectId);
    
    // Check if bucket exists
    console.log('[Supabase Deploy] Checking for bucket...');
    console.log('[Supabase Deploy] Supabase URL:', supabase.supabaseUrl);
    console.log('[Supabase Deploy] Has auth key:', !!supabase.supabaseKey);
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('[Supabase Deploy] Error listing buckets:', listError);
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }
    
    console.log('[Supabase Deploy] Available buckets:', buckets?.map(b => b.name));
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.error('[Supabase Deploy] Bucket "websites" does not exist!');
      console.error('[Supabase Deploy] Available buckets:', buckets?.map(b => b.name));
      console.error('[Supabase Deploy] Please create it manually in Supabase Dashboard');
      throw new Error('Storage bucket "websites" not found. Please create it in Supabase Dashboard → Storage → New bucket');
    }
    
    console.log('[Supabase Deploy] Bucket "websites" found! Proceeding with upload...');
    
    // Upload all files
    const uploadPromises = [];
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = `${projectId}/${filePath}`;
      
      // Convert content to blob
      const blob = new Blob([content], { 
        type: getContentType(filePath) 
      });
      
      console.log('[Supabase Deploy] Uploading:', fullPath);
      
      const uploadPromise = supabase.storage
        .from(bucketName)
        .upload(fullPath, blob, {
          contentType: getContentType(filePath),
          cacheControl: '3600',
          upsert: true
        });
      
      uploadPromises.push(uploadPromise);
    }
    
    // Wait for all uploads
    const results = await Promise.all(uploadPromises);
    
    // Check for errors
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('[Supabase Deploy] Upload errors:', errors);
      throw new Error(`Failed to upload ${errors.length} files`);
    }
    
    console.log('[Supabase Deploy] All files uploaded successfully!');
    
    // Get public URL for index.html
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`${projectId}/public/index.html`);
    
    const websiteUrl = urlData.publicUrl;
    
    // Save deployment metadata to database
    const { error: dbError } = await supabase
      .from('deployments')
      .insert({
        user_id: userId,
        project_id: projectId,
        project_name: projectName,
        website_url: websiteUrl,
        file_count: Object.keys(files).length,
        deployed_at: new Date().toISOString()
      });
    
    if (dbError) {
      console.warn('[Supabase Deploy] Database save error:', dbError);
      // Don't throw - deployment succeeded even if DB save failed
    }
    
    console.log('[Supabase Deploy] Deployment complete!');
    console.log('[Supabase Deploy] Website URL:', websiteUrl);
    
    return {
      success: true,
      projectId,
      websiteUrl,
      fileCount: Object.keys(files).length
    };
    
  } catch (error) {
    console.error('[Supabase Deploy] Deployment failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  
  const mimeTypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'jsx': 'text/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'md': 'text/markdown',
    'txt': 'text/plain'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * List all deployments for a user
 */
export async function getUserDeployments(userId) {
  try {
    const { data, error } = await supabase
      .from('deployments')
      .select('*')
      .eq('user_id', userId)
      .order('deployed_at', { ascending: false });
    
    if (error) throw error;
    
    return {
      success: true,
      deployments: data
    };
  } catch (error) {
    console.error('[Supabase Deploy] Failed to fetch deployments:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete a deployment
 */
export async function deleteDeployment(projectId, userId) {
  try {
    const bucketName = 'websites';
    
    // List all files in the project folder
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list(projectId);
    
    if (listError) throw listError;
    
    // Delete all files
    const filePaths = files.map(f => `${projectId}/${f.name}`);
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove(filePaths);
    
    if (deleteError) throw deleteError;
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('deployments')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);
    
    if (dbError) throw dbError;
    
    return {
      success: true
    };
  } catch (error) {
    console.error('[Supabase Deploy] Failed to delete deployment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

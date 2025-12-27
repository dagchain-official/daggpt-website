/**
 * Netlify Integration Service
 * Handles direct deployment to Netlify
 */

const NETLIFY_API_BASE = 'https://api.netlify.com/api/v1';

/**
 * Initialize Netlify OAuth flow
 */
export const initiateNetlifyAuth = () => {
  const clientId = process.env.REACT_APP_NETLIFY_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/netlify/callback`;
  
  const authUrl = `https://app.netlify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}`;
  
  // Open OAuth popup
  const width = 600;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  const popup = window.open(
    authUrl,
    'Netlify Authorization',
    `width=${width},height=${height},left=${left},top=${top}`
  );
  
  return new Promise((resolve, reject) => {
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        reject(new Error('Authorization cancelled'));
      }
    }, 1000);
    
    // Listen for OAuth callback
    window.addEventListener('message', (event) => {
      if (event.data.type === 'netlify-auth-success') {
        clearInterval(checkPopup);
        popup.close();
        resolve(event.data.token);
      } else if (event.data.type === 'netlify-auth-error') {
        clearInterval(checkPopup);
        popup.close();
        reject(new Error(event.data.error));
      }
    });
  });
};

/**
 * Get Netlify access token from localStorage
 */
const getNetlifyToken = () => {
  return localStorage.getItem('netlify_access_token');
};

/**
 * Save Netlify access token
 */
export const saveNetlifyToken = (token) => {
  localStorage.setItem('netlify_access_token', token);
};

/**
 * Remove Netlify access token
 */
export const removeNetlifyToken = () => {
  localStorage.removeItem('netlify_access_token');
};

/**
 * Check if user is authenticated with Netlify
 */
export const isNetlifyAuthenticated = () => {
  return !!getNetlifyToken();
};

/**
 * Get authenticated user info
 */
export const getNetlifyUser = async () => {
  const token = getNetlifyToken();
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(`${NETLIFY_API_BASE}/user`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }
  
  return response.json();
};

/**
 * Create a ZIP file from project files
 */
const createZipBlob = async (files) => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  // Add all files to ZIP
  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }
  
  // Generate ZIP blob
  return await zip.generateAsync({ type: 'blob' });
};

/**
 * Deploy to Netlify
 */
export const deployToNetlify = async (projectName, files, onProgress) => {
  try {
    // Step 1: Authenticate
    if (!isNetlifyAuthenticated()) {
      onProgress?.({ stage: 'auth', message: 'Authenticating with Netlify...' });
      const token = await initiateNetlifyAuth();
      saveNetlifyToken(token);
    }
    
    const token = getNetlifyToken();
    
    // Step 2: Create site
    onProgress?.({ stage: 'site', message: 'Creating Netlify site...' });
    const site = await createNetlifySite(projectName);
    
    // Step 3: Create ZIP
    onProgress?.({ stage: 'zip', message: 'Preparing files...' });
    const zipBlob = await createZipBlob(files);
    
    // Step 4: Deploy
    onProgress?.({ stage: 'deploy', message: 'Deploying to Netlify...' });
    const deploy = await deployZipToNetlify(site.id, zipBlob, onProgress);
    
    return {
      success: true,
      siteId: site.id,
      siteName: site.name,
      url: site.ssl_url || site.url,
      adminUrl: site.admin_url,
      deployId: deploy.id,
      deployUrl: deploy.deploy_ssl_url || deploy.deploy_url
    };
  } catch (error) {
    console.error('Netlify deployment failed:', error);
    throw error;
  }
};

/**
 * Create a new Netlify site
 */
const createNetlifySite = async (siteName) => {
  const token = getNetlifyToken();
  if (!token) throw new Error('Not authenticated with Netlify');
  
  const response = await fetch(`${NETLIFY_API_BASE}/sites`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: siteName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      custom_domain: null
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create site');
  }
  
  return response.json();
};

/**
 * Deploy ZIP to Netlify site
 */
const deployZipToNetlify = async (siteId, zipBlob, onProgress) => {
  const token = getNetlifyToken();
  if (!token) throw new Error('Not authenticated with Netlify');
  
  // Upload ZIP
  const response = await fetch(`${NETLIFY_API_BASE}/sites/${siteId}/deploys`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/zip'
    },
    body: zipBlob
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to deploy');
  }
  
  const deploy = await response.json();
  
  // Wait for deployment to be ready
  onProgress?.({ stage: 'deploy', message: 'Building site...' });
  await waitForDeployment(deploy.id, onProgress);
  
  return deploy;
};

/**
 * Wait for deployment to complete
 */
const waitForDeployment = async (deployId, onProgress) => {
  const token = getNetlifyToken();
  const maxAttempts = 60; // 5 minutes max
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const response = await fetch(`${NETLIFY_API_BASE}/deploys/${deployId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check deployment status');
    }
    
    const deploy = await response.json();
    
    if (deploy.state === 'ready') {
      onProgress?.({ stage: 'deploy', message: 'Deployment complete!' });
      return deploy;
    } else if (deploy.state === 'error') {
      throw new Error('Deployment failed');
    }
    
    // Update progress
    onProgress?.({ 
      stage: 'deploy', 
      message: `Building... (${deploy.state})`,
      percentage: Math.min((attempts / maxAttempts) * 100, 90)
    });
    
    // Wait 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }
  
  throw new Error('Deployment timeout');
};

/**
 * List user's Netlify sites
 */
export const listNetlifySites = async () => {
  const token = getNetlifyToken();
  if (!token) throw new Error('Not authenticated with Netlify');
  
  const response = await fetch(`${NETLIFY_API_BASE}/sites`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch sites');
  }
  
  return response.json();
};

/**
 * Update existing site
 */
export const updateNetlifySite = async (siteId, files, onProgress) => {
  try {
    const token = getNetlifyToken();
    if (!token) throw new Error('Not authenticated with Netlify');
    
    // Create ZIP
    onProgress?.({ stage: 'zip', message: 'Preparing files...' });
    const zipBlob = await createZipBlob(files);
    
    // Deploy
    onProgress?.({ stage: 'deploy', message: 'Deploying update...' });
    const deploy = await deployZipToNetlify(siteId, zipBlob, onProgress);
    
    return {
      success: true,
      deployId: deploy.id,
      deployUrl: deploy.deploy_ssl_url || deploy.deploy_url
    };
  } catch (error) {
    console.error('Netlify update failed:', error);
    throw error;
  }
};

/**
 * Delete a Netlify site
 */
export const deleteNetlifySite = async (siteId) => {
  const token = getNetlifyToken();
  if (!token) throw new Error('Not authenticated with Netlify');
  
  const response = await fetch(`${NETLIFY_API_BASE}/sites/${siteId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete site');
  }
  
  return true;
};

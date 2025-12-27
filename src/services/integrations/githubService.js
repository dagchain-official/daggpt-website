/**
 * GitHub Integration Service
 * Handles repository creation, file uploads, and deployment
 */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Initialize GitHub OAuth flow
 */
export const initiateGitHubAuth = () => {
  const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/github/callback`;
  const scope = 'repo,user';
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  
  // Open OAuth popup
  const width = 600;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  const popup = window.open(
    authUrl,
    'GitHub Authorization',
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
      if (event.data.type === 'github-auth-success') {
        clearInterval(checkPopup);
        popup.close();
        resolve(event.data.token);
      } else if (event.data.type === 'github-auth-error') {
        clearInterval(checkPopup);
        popup.close();
        reject(new Error(event.data.error));
      }
    });
  });
};

/**
 * Get GitHub access token from localStorage
 */
const getGitHubToken = () => {
  return localStorage.getItem('github_access_token');
};

/**
 * Save GitHub access token
 */
export const saveGitHubToken = (token) => {
  localStorage.setItem('github_access_token', token);
};

/**
 * Remove GitHub access token
 */
export const removeGitHubToken = () => {
  localStorage.removeItem('github_access_token');
};

/**
 * Check if user is authenticated with GitHub
 */
export const isGitHubAuthenticated = () => {
  return !!getGitHubToken();
};

/**
 * Get authenticated user info
 */
export const getGitHubUser = async () => {
  const token = getGitHubToken();
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }
  
  return response.json();
};

/**
 * Create a new GitHub repository
 */
export const createGitHubRepository = async (repoName, description = '', isPrivate = false) => {
  const token = getGitHubToken();
  if (!token) throw new Error('Not authenticated with GitHub');
  
  const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: repoName,
      description: description || `Generated with DAGGPT - AI Website Builder`,
      private: isPrivate,
      auto_init: true
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create repository');
  }
  
  return response.json();
};

/**
 * Upload files to GitHub repository
 */
export const uploadFilesToGitHub = async (owner, repo, files, onProgress) => {
  const token = getGitHubToken();
  if (!token) throw new Error('Not authenticated with GitHub');
  
  const totalFiles = Object.keys(files).length;
  let uploadedFiles = 0;
  
  // Get default branch
  const repoInfo = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  }).then(r => r.json());
  
  const branch = repoInfo.default_branch;
  
  // Upload each file
  for (const [path, content] of Object.entries(files)) {
    try {
      // Encode content to base64
      const base64Content = btoa(unescape(encodeURIComponent(content)));
      
      const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Add ${path}`,
          content: base64Content,
          branch: branch
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error(`Failed to upload ${path}:`, error);
      }
      
      uploadedFiles++;
      if (onProgress) {
        onProgress({
          current: uploadedFiles,
          total: totalFiles,
          file: path,
          percentage: Math.round((uploadedFiles / totalFiles) * 100)
        });
      }
    } catch (error) {
      console.error(`Error uploading ${path}:`, error);
    }
  }
  
  return {
    success: true,
    uploadedFiles,
    totalFiles,
    repoUrl: `https://github.com/${owner}/${repo}`
  };
};

/**
 * Deploy to GitHub (create repo + upload files)
 */
export const deployToGitHub = async (projectName, files, onProgress) => {
  try {
    // Step 1: Authenticate
    if (!isGitHubAuthenticated()) {
      onProgress?.({ stage: 'auth', message: 'Authenticating with GitHub...' });
      const token = await initiateGitHubAuth();
      saveGitHubToken(token);
    }
    
    // Step 2: Get user info
    onProgress?.({ stage: 'user', message: 'Getting user information...' });
    const user = await getGitHubUser();
    
    // Step 3: Create repository
    onProgress?.({ stage: 'repo', message: 'Creating repository...' });
    const repo = await createGitHubRepository(projectName);
    
    // Step 4: Upload files
    onProgress?.({ stage: 'upload', message: 'Uploading files...' });
    await uploadFilesToGitHub(user.login, repo.name, files, (progress) => {
      onProgress?.({
        stage: 'upload',
        message: `Uploading ${progress.file}...`,
        percentage: progress.percentage
      });
    });
    
    // Step 5: Enable GitHub Pages
    onProgress?.({ stage: 'pages', message: 'Configuring GitHub Pages...' });
    await enableGitHubPages(user.login, repo.name);
    
    return {
      success: true,
      repoUrl: repo.html_url,
      pagesUrl: `https://${user.login}.github.io/${repo.name}`,
      owner: user.login,
      repo: repo.name
    };
  } catch (error) {
    console.error('GitHub deployment failed:', error);
    throw error;
  }
};

/**
 * Enable GitHub Pages for a repository
 */
export const enableGitHubPages = async (owner, repo) => {
  const token = getGitHubToken();
  if (!token) throw new Error('Not authenticated with GitHub');
  
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: {
          branch: 'main',
          path: '/'
        }
      })
    });
    
    if (!response.ok && response.status !== 409) { // 409 = already exists
      const error = await response.json();
      console.warn('GitHub Pages setup warning:', error.message);
    }
    
    return true;
  } catch (error) {
    console.warn('GitHub Pages setup failed:', error);
    return false;
  }
};

/**
 * List user's repositories
 */
export const listGitHubRepositories = async () => {
  const token = getGitHubToken();
  if (!token) throw new Error('Not authenticated with GitHub');
  
  const response = await fetch(`${GITHUB_API_BASE}/user/repos?sort=updated&per_page=100`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch repositories');
  }
  
  return response.json();
};

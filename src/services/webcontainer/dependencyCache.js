/**
 * Dependency Cache Service
 * Pre-installs and caches common dependencies to speed up project setup
 * This is the key to matching Bolt's speed!
 */

import { WebContainer } from '@webcontainer/api';

// Singleton WebContainer instance
let cachedContainer = null;
let isBooting = false;
let bootPromise = null;

// Common dependencies for React projects
const COMMON_DEPENDENCIES = {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@vitejs/plugin-react": "^4.2.1",
  "vite": "^5.0.8",
  "tailwindcss": "^3.4.1",
  "autoprefixer": "^10.4.17",
  "postcss": "^8.4.33",
  "lucide-react": "^0.294.0"
};

/**
 * Get or create WebContainer instance
 * Reuses the same instance across projects for speed
 */
export async function getWebContainer() {
  // If already booted, return immediately
  if (cachedContainer) {
    console.log('[Cache] Reusing existing WebContainer instance');
    return cachedContainer;
  }
  
  // If currently booting, wait for it
  if (isBooting && bootPromise) {
    console.log('[Cache] Waiting for WebContainer to boot...');
    return bootPromise;
  }
  
  // Boot new instance
  isBooting = true;
  bootPromise = bootWebContainer();
  
  try {
    cachedContainer = await bootPromise;
    return cachedContainer;
  } finally {
    isBooting = false;
    bootPromise = null;
  }
}

/**
 * Boot WebContainer and pre-install common dependencies
 */
async function bootWebContainer() {
  console.log('[Cache] Booting new WebContainer instance...');
  
  try {
    const container = await WebContainer.boot();
    console.log('[Cache] WebContainer booted successfully');
    
    // Pre-install common dependencies in background
    preInstallDependencies(container).catch(err => {
      console.warn('[Cache] Pre-install failed:', err);
    });
    
    return container;
  } catch (error) {
    console.error('[Cache] Failed to boot WebContainer:', error);
    throw error;
  }
}

/**
 * Pre-install common dependencies
 * This runs in the background and doesn't block the main flow
 */
async function preInstallDependencies(container) {
  console.log('[Cache] Pre-installing common dependencies...');
  
  try {
    // Create a temporary package.json with common deps
    const packageJson = {
      name: "cache-warmup",
      version: "1.0.0",
      type: "module",
      dependencies: COMMON_DEPENDENCIES
    };
    
    await container.fs.writeFile(
      '/cache-package.json',
      JSON.stringify(packageJson, null, 2)
    );
    
    // Install in background
    const installProcess = await container.spawn('npm', [
      'install',
      '--package-lock-only',
      '--package-lock=false',
      '--no-save',
      '--prefix',
      '/cache'
    ]);
    
    const exitCode = await installProcess.exit;
    
    if (exitCode === 0) {
      console.log('[Cache] Common dependencies pre-installed successfully');
    } else {
      console.warn('[Cache] Pre-install exited with code:', exitCode);
    }
  } catch (error) {
    console.warn('[Cache] Pre-install error:', error);
  }
}

/**
 * Clear the cached container
 * Useful for testing or when errors occur
 */
export function clearCache() {
  console.log('[Cache] Clearing WebContainer cache');
  cachedContainer = null;
  isBooting = false;
  bootPromise = null;
}

/**
 * Check if container is cached and ready
 */
export function isCached() {
  return cachedContainer !== null;
}

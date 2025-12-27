/**
 * Parallel Processor Service
 * Processes multiple operations in parallel for speed
 */

/**
 * Write files in parallel batches
 * Instead of writing one by one, write multiple files simultaneously
 */
export async function writeFilesInParallel(container, files, onProgress) {
  const BATCH_SIZE = 10; // Write 10 files at a time
  const allFiles = flattenFileTree(files);
  
  let written = 0;
  
  for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
    const batch = allFiles.slice(i, i + BATCH_SIZE);
    
    // Write batch in parallel
    await Promise.all(
      batch.map(async ({ path, content }) => {
        try {
          await container.fs.writeFile(path, content);
          written++;
          
          if (onProgress) {
            onProgress({
              current: written,
              total: allFiles.length,
              percentage: Math.round((written / allFiles.length) * 100)
            });
          }
        } catch (error) {
          console.error(`[Parallel] Failed to write ${path}:`, error);
        }
      })
    );
  }
  
  return written;
}

/**
 * Flatten file tree into array of {path, content}
 */
function flattenFileTree(files, basePath = '') {
  const result = [];
  
  for (const file of files) {
    const currentPath = basePath ? `${basePath}/${file.name}` : file.name;
    
    if (file.type === 'file') {
      result.push({
        path: currentPath,
        content: file.content || ''
      });
    } else if (file.type === 'folder' && file.children) {
      result.push(...flattenFileTree(file.children, currentPath));
    }
  }
  
  return result;
}

/**
 * Create directories in parallel
 */
export async function createDirectoriesInParallel(container, files) {
  const dirs = collectDirectories(files);
  
  // Create all directories in parallel
  await Promise.all(
    dirs.map(dir => 
      container.fs.mkdir(dir, { recursive: true }).catch(err => {
        console.warn(`[Parallel] Failed to create ${dir}:`, err);
      })
    )
  );
  
  return dirs.length;
}

/**
 * Collect all directory paths from file tree
 */
function collectDirectories(files, basePath = '') {
  const dirs = [];
  
  for (const file of files) {
    if (file.type === 'folder') {
      const dirPath = basePath ? `${basePath}/${file.name}` : file.name;
      dirs.push(dirPath);
      
      if (file.children) {
        dirs.push(...collectDirectories(file.children, dirPath));
      }
    }
  }
  
  return dirs;
}

/**
 * Process file operations with progress tracking
 */
export async function processWithProgress(operations, onProgress) {
  const total = operations.length;
  let completed = 0;
  
  const results = await Promise.all(
    operations.map(async (operation) => {
      try {
        const result = await operation();
        completed++;
        
        if (onProgress) {
          onProgress({
            completed,
            total,
            percentage: Math.round((completed / total) * 100)
          });
        }
        
        return { success: true, result };
      } catch (error) {
        completed++;
        
        if (onProgress) {
          onProgress({
            completed,
            total,
            percentage: Math.round((completed / total) * 100)
          });
        }
        
        return { success: false, error };
      }
    })
  );
  
  return results;
}

/**
 * Batch process with concurrency limit
 */
export async function batchProcess(items, processor, concurrency = 5) {
  const results = [];
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);
  }
  
  return results;
}

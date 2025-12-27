/**
 * WebContainer Service - Based on Bolt.new
 * Manages WebContainer instance for running full-stack apps in browser
 */

import { WebContainer } from '@webcontainer/api';

let webcontainerInstance = null;

/**
 * Boot WebContainer (singleton pattern)
 */
export async function bootWebContainer() {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  console.log('🚀 Booting WebContainer...');
  webcontainerInstance = await WebContainer.boot();
  console.log('✅ WebContainer booted successfully');
  
  return webcontainerInstance;
}

/**
 * Get WebContainer instance
 */
export function getWebContainer() {
  return webcontainerInstance;
}

/**
 * Write files to WebContainer
 */
export async function writeFiles(files, onProgress) {
  const webcontainer = await bootWebContainer();
  
  for (const file of files) {
    await writeFileNode(webcontainer, file, onProgress);
  }
}

/**
 * Recursively write file nodes
 */
async function writeFileNode(webcontainer, node, onProgress) {
  if (node.type === 'file') {
    const path = node.path || node.name;
    await webcontainer.fs.writeFile(path, node.content || '');
    
    if (onProgress) {
      onProgress({ type: 'file_written', path });
    }
  } else if (node.type === 'folder' && node.children) {
    const path = node.path || node.name;
    
    try {
      await webcontainer.fs.mkdir(path, { recursive: true });
    } catch (error) {
      // Folder might already exist
    }
    
    for (const child of node.children) {
      const childPath = `${path}/${child.name}`;
      await writeFileNode(webcontainer, { ...child, path: childPath }, onProgress);
    }
  }
}

/**
 * Install dependencies
 */
export async function installDependencies(onOutput) {
  const webcontainer = await bootWebContainer();
  
  console.log('📦 Installing dependencies...');
  
  const installProcess = await webcontainer.spawn('npm', ['install']);
  
  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        if (onOutput) {
          onOutput(data);
        }
      },
    })
  );
  
  const exitCode = await installProcess.exit;
  
  if (exitCode !== 0) {
    throw new Error(`npm install failed with exit code ${exitCode}`);
  }
  
  console.log('✅ Dependencies installed');
}

/**
 * Start dev server
 */
export async function startDevServer(onReady, onOutput) {
  const webcontainer = await bootWebContainer();
  
  console.log('🚀 Starting dev server...');
  
  const devProcess = await webcontainer.spawn('npm', ['run', 'dev']);
  
  devProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        if (onOutput) {
          onOutput(data);
        }
        
        // Check if server is ready
        const output = data.toString();
        if (output.includes('Local:') || output.includes('localhost')) {
          const urlMatch = output.match(/https?:\/\/[^\s]+/);
          if (urlMatch && onReady) {
            onReady(urlMatch[0]);
          }
        }
      },
    })
  );
  
  // Listen for server ready event
  webcontainer.on('server-ready', (port, url) => {
    console.log(`✅ Server ready at ${url}`);
    if (onReady) {
      onReady(url);
    }
  });
  
  return devProcess;
}

/**
 * Run command in WebContainer
 */
export async function runCommand(command, args = [], onOutput) {
  const webcontainer = await bootWebContainer();
  
  const process = await webcontainer.spawn(command, args);
  
  if (onOutput) {
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          onOutput(data);
        },
      })
    );
  }
  
  return process;
}

/**
 * Read file from WebContainer
 */
export async function readFile(path) {
  const webcontainer = await bootWebContainer();
  return await webcontainer.fs.readFile(path, 'utf-8');
}

/**
 * Write single file to WebContainer
 */
export async function writeFile(path, content) {
  const webcontainer = await bootWebContainer();
  await webcontainer.fs.writeFile(path, content);
}

/**
 * Get terminal stream
 */
export async function getTerminalStream() {
  const webcontainer = await bootWebContainer();
  
  const shellProcess = await webcontainer.spawn('jsh', {
    terminal: {
      cols: 80,
      rows: 24,
    },
  });
  
  return shellProcess;
}

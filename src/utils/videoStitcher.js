import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg = null;

/**
 * Initialize FFmpeg.wasm
 */
export async function initFFmpeg(onProgress) {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  // Set up progress callback
  ffmpeg.on('progress', ({ progress, time }) => {
    if (onProgress) {
      onProgress(Math.round(progress * 100));
    }
  });

  // Load FFmpeg
  await ffmpeg.load({
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
  });

  return ffmpeg;
}

/**
 * Stitch multiple video URLs into one final video
 * @param {Array<string>} videoUrls - Array of video URLs to stitch
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Blob} - Final stitched video as Blob
 */
export async function stitchVideos(videoUrls, onProgress) {
  try {
    console.log('[videoStitcher] Starting to stitch', videoUrls.length, 'videos');
    
    // Initialize FFmpeg
    if (onProgress) onProgress(5);
    await initFFmpeg((progress) => {
      // Map FFmpeg progress (0-100) to overall progress (5-95)
      if (onProgress) onProgress(5 + (progress * 0.9));
    });

    console.log('[videoStitcher] FFmpeg loaded');
    if (onProgress) onProgress(10);

    // Download all videos
    console.log('[videoStitcher] Downloading videos...');
    const videoFiles = [];
    
    for (let i = 0; i < videoUrls.length; i++) {
      const url = videoUrls[i];
      const filename = `input${i}.mp4`;
      
      console.log(`[videoStitcher] Downloading video ${i + 1}/${videoUrls.length}:`, url);
      
      try {
        const videoData = await fetchFile(url);
        await ffmpeg.writeFile(filename, videoData);
        videoFiles.push(filename);
        
        const downloadProgress = 10 + ((i + 1) / videoUrls.length) * 30;
        if (onProgress) onProgress(downloadProgress);
      } catch (err) {
        console.error(`[videoStitcher] Failed to download video ${i + 1}:`, err);
        throw new Error(`Failed to download video ${i + 1}`);
      }
    }

    console.log('[videoStitcher] All videos downloaded');
    if (onProgress) onProgress(40);

    // Create concat file
    const concatContent = videoFiles.map(f => `file '${f}'`).join('\n');
    await ffmpeg.writeFile('concat.txt', concatContent);
    
    console.log('[videoStitcher] Concat file created');
    if (onProgress) onProgress(45);

    // Run FFmpeg concat
    console.log('[videoStitcher] Running FFmpeg concat...');
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      'output.mp4'
    ]);

    console.log('[videoStitcher] FFmpeg concat complete');
    if (onProgress) onProgress(90);

    // Read output file
    const data = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });

    console.log('[videoStitcher] ✅ Stitching complete! Size:', blob.size, 'bytes');
    if (onProgress) onProgress(100);

    // Clean up
    for (const file of videoFiles) {
      await ffmpeg.deleteFile(file);
    }
    await ffmpeg.deleteFile('concat.txt');
    await ffmpeg.deleteFile('output.mp4');

    return blob;

  } catch (error) {
    console.error('[videoStitcher] Error:', error);
    throw error;
  }
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

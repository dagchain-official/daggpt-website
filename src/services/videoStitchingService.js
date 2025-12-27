/**
 * VIDEO STITCHING SERVICE
 * Uses FFmpeg.wasm to stitch multiple video clips into one final video
 * Runs entirely in the browser - no server needed!
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance = null;
let isLoaded = false;

/**
 * Initialize FFmpeg (only once)
 */
export const initFFmpeg = async (onProgress) => {
  if (isLoaded && ffmpegInstance) {
    return ffmpegInstance;
  }

  try {
    console.log('🎬 Initializing FFmpeg.wasm...');
    
    if (onProgress) {
      onProgress({ stage: 'init', message: 'Loading video processing engine...', progress: 0 });
    }

    ffmpegInstance = new FFmpeg();

    // Load FFmpeg
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    isLoaded = true;
    console.log('✅ FFmpeg loaded successfully!');

    if (onProgress) {
      onProgress({ stage: 'init', message: 'Video processing engine ready!', progress: 10 });
    }

    return ffmpegInstance;
  } catch (error) {
    console.error('❌ FFmpeg initialization error:', error);
    throw new Error(`Failed to initialize video processor: ${error.message}`);
  }
};

/**
 * Stitch multiple video clips into one final video
 */
export const stitchVideos = async (videoClips, onProgress) => {
  console.log(`🎬 Starting video stitching for ${videoClips.length} clips...`);

  try {
    // Initialize FFmpeg
    const ffmpeg = await initFFmpeg(onProgress);

    if (onProgress) {
      onProgress({ 
        stage: 'downloading', 
        message: 'Downloading video clips...', 
        progress: 15,
        currentClip: 0,
        totalClips: videoClips.length
      });
    }

    // Download all video clips
    const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
    const clipFiles = [];

    for (let i = 0; i < videoClips.length; i++) {
      const clip = videoClips[i];
      console.log(`📥 Downloading clip ${i + 1}/${videoClips.length}...`);

      if (onProgress) {
        onProgress({ 
          stage: 'downloading', 
          message: `Downloading clip ${i + 1}/${videoClips.length}...`, 
          progress: 15 + ((i / videoClips.length) * 30),
          currentClip: i + 1,
          totalClips: videoClips.length
        });
      }

      try {
        const response = await fetch(clip.uri, {
          headers: {
            'x-goog-api-key': GEMINI_API_KEY
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to download clip ${i + 1}: ${response.status}`);
        }

        const blob = await response.blob();
        const fileName = `clip_${i}.mp4`;
        
        // Write file to FFmpeg virtual filesystem
        await ffmpeg.writeFile(fileName, await fetchFile(blob));
        clipFiles.push(fileName);

        console.log(`✅ Clip ${i + 1} downloaded: ${fileName}`);
      } catch (error) {
        console.error(`❌ Error downloading clip ${i + 1}:`, error);
        throw error;
      }
    }

    if (onProgress) {
      onProgress({ 
        stage: 'stitching', 
        message: 'Combining clips into final video...', 
        progress: 50
      });
    }

    // Create concat file list
    const concatList = clipFiles.map(file => `file '${file}'`).join('\n');
    await ffmpeg.writeFile('concat_list.txt', concatList);

    console.log('📝 Concat list created:', concatList);

    // Run FFmpeg concat command
    console.log('🎬 Running FFmpeg concat...');
    
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat_list.txt',
      '-c', 'copy',
      'output.mp4'
    ]);

    console.log('✅ FFmpeg concat complete!');

    if (onProgress) {
      onProgress({ 
        stage: 'finalizing', 
        message: 'Creating final video file...', 
        progress: 90
      });
    }

    // Read the output file
    const data = await ffmpeg.readFile('output.mp4');
    const finalBlob = new Blob([data.buffer], { type: 'video/mp4' });
    const finalBlobUrl = URL.createObjectURL(finalBlob);

    // Cleanup
    for (const file of clipFiles) {
      await ffmpeg.deleteFile(file);
    }
    await ffmpeg.deleteFile('concat_list.txt');
    await ffmpeg.deleteFile('output.mp4');

    console.log('🎉 Video stitching complete!');

    if (onProgress) {
      onProgress({ 
        stage: 'complete', 
        message: 'Final video ready!', 
        progress: 100
      });
    }

    return {
      success: true,
      blobUrl: finalBlobUrl,
      blob: finalBlob,
      duration: videoClips.length * 8,
      clips: videoClips.length
    };

  } catch (error) {
    console.error('❌ Video stitching error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if FFmpeg is supported in this browser
 */
export const isFFmpegSupported = () => {
  // Check for required browser features
  return (
    typeof SharedArrayBuffer !== 'undefined' &&
    typeof WebAssembly !== 'undefined'
  );
};

/**
 * Get FFmpeg status
 */
export const getFFmpegStatus = () => {
  return {
    isLoaded: isLoaded,
    isSupported: isFFmpegSupported(),
    instance: ffmpegInstance
  };
};

export default {
  initFFmpeg,
  stitchVideos,
  isFFmpegSupported,
  getFFmpegStatus
};

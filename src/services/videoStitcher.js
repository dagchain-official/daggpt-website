/**
 * CLIENT-SIDE VIDEO STITCHING
 * Uses FFmpeg.wasm to stitch videos in the browser with smooth transitions
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { buildTransitionFilter, TRANSITION_TYPES } from './videoTransitions';

let ffmpeg = null;
let isLoaded = false;

/**
 * Load FFmpeg.wasm
 */
export const loadFFmpeg = async (onProgress) => {
  if (isLoaded) return ffmpeg;

  console.log('📦 Loading FFmpeg.wasm...');
  
  ffmpeg = new FFmpeg();
  
  // Set up progress logging
  ffmpeg.on('log', ({ message }) => {
    console.log('FFmpeg:', message);
  });

  ffmpeg.on('progress', ({ progress, time }) => {
    if (onProgress) {
      onProgress({
        progress: Math.round(progress * 100),
        time: time
      });
    }
  });

  try {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    isLoaded = true;
    console.log('✅ FFmpeg.wasm loaded');
    return ffmpeg;
    
  } catch (error) {
    console.error('❌ Failed to load FFmpeg:', error);
    throw error;
  }
};

/**
 * Stitch multiple video clips into one
 */
export const stitchVideos = async (clips, onProgress) => {
  try {
    console.log('🎬 Starting video stitching...');
    console.log(`Clips to stitch: ${clips.length}`);

    // Load FFmpeg if not already loaded
    if (!isLoaded) {
      if (onProgress) {
        onProgress({
          stage: 'loading',
          message: 'Loading FFmpeg...',
          progress: 0
        });
      }
      await loadFFmpeg();
    }

    if (onProgress) {
      onProgress({
        stage: 'downloading',
        message: 'Downloading clips...',
        progress: 10
      });
    }

    // Download and write all clips to FFmpeg filesystem
    const inputFiles = [];
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const filename = `input${i}.mp4`;
      
      console.log(`📥 Downloading clip ${i + 1}/${clips.length}...`);
      
      // Use original URL if available, otherwise use proxied URL
      const videoUrl = clip.originalUri || clip.uri;
      
      // Fetch the video
      const videoData = await fetchFile(videoUrl);
      
      // Write to FFmpeg filesystem
      await ffmpeg.writeFile(filename, videoData);
      inputFiles.push(filename);
      
      if (onProgress) {
        onProgress({
          stage: 'downloading',
          message: `Downloaded clip ${i + 1}/${clips.length}`,
          progress: 10 + ((i + 1) / clips.length) * 30
        });
      }
    }

    console.log('✅ All clips downloaded');

    // Create concat file
    if (onProgress) {
      onProgress({
        stage: 'processing',
        message: 'Preparing to stitch...',
        progress: 45
      });
    }

    const concatContent = inputFiles
      .map(file => `file '${file}'`)
      .join('\n');
    
    await ffmpeg.writeFile('concat.txt', concatContent);
    console.log('📝 Created concat file');

    if (onProgress) {
      onProgress({
        stage: 'stitching',
        message: 'Adding smooth transitions...',
        progress: 70
      });
    }

    console.log('🎬 Running FFmpeg with smooth transitions...');
    
    // Check if clips have audio
    const hasAudio = clips.some(clip => clip.hasAudio);
    console.log(`🔊 Audio detected: ${hasAudio}`);
    
    // Build transition filter
    const transitionDuration = 0.5;
    const transitionType = TRANSITION_TYPES.FADE; // Use fade for smooth transitions
    const filter = buildTransitionFilter(clips, transitionType, transitionDuration, hasAudio);
    
    if (!filter) {
      // Single clip - no transitions needed
      console.log('📹 Single clip - no transitions');
      const singleClipArgs = [
        '-i', inputFiles[0],
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23'
      ];
      
      if (hasAudio) {
        singleClipArgs.push('-c:a', 'aac');
      }
      
      singleClipArgs.push('output.mp4');
      await ffmpeg.exec(singleClipArgs);
    } else {
      // Multiple clips with transitions
      console.log(`🎞️ Applying ${transitionType} transitions between ${clips.length} clips`);
      
      const ffmpegArgs = [];
      
      // Add input files
      for (const file of inputFiles) {
        ffmpegArgs.push('-i', file);
      }
      
      // Add filter complex
      const filterComplex = filter.audio 
        ? `${filter.video};${filter.audio}`
        : filter.video;
      
      ffmpegArgs.push(
        '-filter_complex',
        filterComplex
      );
      
      // Add output mappings and encoding
      ffmpegArgs.push(
        ...filter.maps,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23'
      );
      
      if (hasAudio) {
        ffmpegArgs.push('-c:a', 'aac');
      }
      
      ffmpegArgs.push('output.mp4');
      
      await ffmpeg.exec(ffmpegArgs);
    }

    console.log('✅ FFmpeg completed');

    if (onProgress) {
      onProgress({
        stage: 'finalizing',
        message: 'Creating final video...',
        progress: 90
      });
    }

    // Read the output file
    const data = await ffmpeg.readFile('output.mp4');
    
    // Create blob URL
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);

    // Clean up
    console.log('🧹 Cleaning up...');
    for (const file of inputFiles) {
      await ffmpeg.deleteFile(file);
    }
    await ffmpeg.deleteFile('concat.txt');
    await ffmpeg.deleteFile('output.mp4');

    if (onProgress) {
      onProgress({
        stage: 'complete',
        message: 'Video stitched successfully!',
        progress: 100
      });
    }

    console.log('✅ Video stitching complete');

    return {
      success: true,
      url: url,
      blob: blob,
      size: blob.size
    };

  } catch (error) {
    console.error('❌ Stitching error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Download stitched video
 */
export const downloadVideo = (blob, filename = 'stitched-video.mp4') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default {
  loadFFmpeg,
  stitchVideos,
  downloadVideo
};

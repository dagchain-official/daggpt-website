import React, { useState, useEffect } from 'react';
import BoxLoader from './BoxLoader';
import VideoProductionProgress from './VideoProductionProgress';

const ContentCreationCanvas = ({ 
  activeTab,
  isGenerating, 
  generatedImages,
  generatedVideo,
  videoClips = [],
  videoPollingProgress,
  analysisResult,
  uploadedFile,
  isStitching = false,
  stitchingProgress = null,
  stitchedVideo = null,
  onStitchVideos
}) => {
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const [clipBlobs, setClipBlobs] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch video with API key when video is ready
  useEffect(() => {
    let blobUrlToCleanup = null;

    const fetchVideo = async () => {
      if (generatedVideo && generatedVideo.uri && generatedVideo.status === 'completed') {
        try {
          const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
          // Only add Gemini API key for Gemini videos
          const isGeminiVideo = generatedVideo.uri.includes('generativelanguage.googleapis.com');
          const fetchOptions = isGeminiVideo 
            ? { headers: { 'x-goog-api-key': apiKey } }
            : {}; // VideoGenAPI and other providers don't need auth headers
          
          const response = await fetch(generatedVideo.uri, fetchOptions);
          
          if (response.ok) {
            const blob = await response.blob();
            setVideoBlob(blob);
            const blobUrl = URL.createObjectURL(blob);
            blobUrlToCleanup = blobUrl;
            setVideoBlobUrl(blobUrl);
          }
        } catch (error) {
          console.error('Error fetching video:', error);
        }
      }
    };

    fetchVideo();

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrlToCleanup) {
        URL.revokeObjectURL(blobUrlToCleanup);
      }
    };
  }, [generatedVideo]);

  // Fetch individual clips
  useEffect(() => {
    const fetchClips = async () => {
      if (videoClips && videoClips.length > 0) {
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        const newClipBlobs = {};

        for (const clip of videoClips) {
          if (clip.uri && clip.status === 'completed' && !clipBlobs[clip.sceneNumber]) {
            try {
              // Only add Gemini API key for Gemini videos (generativelanguage.googleapis.com)
              const isGeminiVideo = clip.uri.includes('generativelanguage.googleapis.com');
              const fetchOptions = isGeminiVideo 
                ? { headers: { 'x-goog-api-key': apiKey } }
                : {}; // VideoGenAPI and other providers don't need auth headers
              
              const response = await fetch(clip.uri, fetchOptions);
              
              if (response.ok) {
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                newClipBlobs[clip.sceneNumber] = { blob, blobUrl };
              }
            } catch (error) {
              console.error(`Error fetching clip ${clip.sceneNumber}:`, error);
            }
          }
        }

        if (Object.keys(newClipBlobs).length > 0) {
          setClipBlobs(prev => ({ ...prev, ...newClipBlobs }));
        }
      }
    };

    fetchClips();
  }, [videoClips]);

  const handleDownloadVideo = async () => {
    if (!videoBlob) return;
    
    setIsDownloading(true);
    try {
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dag-gpt-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading video:', error);
      alert('Failed to download video');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewFull = (imageUrl) => {
    // Create a new window with the image
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Generated Image</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #000;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" alt="Generated Image" />
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center p-8 h-full overflow-auto">
      {!isGenerating && !generatedImages && !generatedVideo && !analysisResult && (
        <div className="text-center">
          <div className="text-6xl mb-6 animate-pulse">
            {activeTab === 'image' && '🖼️'}
            {activeTab === 'video' && '🎬'}
            {activeTab === 'audio' && '🎵'}
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-brand-purple to-pink-500 bg-clip-text text-transparent">
            {activeTab === 'image' && 'Create Stunning Images'}
            {activeTab === 'video' && 'Analyze Your Videos'}
            {activeTab === 'audio' && 'Understand Your Audio'}
          </h2>
          <p className="text-gray-400 text-lg">with DAG GPT</p>
        </div>
      )}

      {isGenerating && (
        <div className="text-center">
          <div className="mb-8">
            <BoxLoader />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {activeTab === 'image' && 'Generating Images...'}
            {activeTab === 'video' && 'Analyzing Video...'}
            {activeTab === 'audio' && 'Analyzing Audio...'}
          </h3>
          <p className="text-gray-400">This may take a few moments</p>
        </div>
      )}

      {generatedImages && generatedImages.length > 0 && !isGenerating && (
        <div className="w-full max-w-7xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Generated Images</h2>
            <p className="text-gray-400">{generatedImages.length} image{generatedImages.length > 1 ? 's' : ''} created</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedImages.map((image, index) => (
              <div key={image.id} className="group relative bg-gray-900 rounded-xl overflow-hidden border border-white/10 hover:border-brand-purple/50 transition-all">
                <div className="bg-gray-800 relative">
                  <img 
                    src={image.url} 
                    alt={`Generated ${index + 1}`}
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewFull(image.url)}
                        className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        View Full
                      </button>
                      <a 
                        href={image.url} 
                        download={`dag-gpt-image-${index + 1}.png`}
                        className="px-4 py-2 bg-brand-purple text-white rounded-lg font-medium hover:bg-brand-purple-dark transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400">IMAGE #{index + 1}</span>
                    <span className="text-xs text-gray-500 capitalize">{image.style}</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{image.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isGenerating && videoPollingProgress && (
        <div className="w-full max-w-4xl mx-auto">
          <VideoProductionProgress 
            progress={videoPollingProgress}
            clips={videoClips}
          />
        </div>
      )}

      {generatedVideo && !isGenerating && generatedVideo.status === 'completed' && (
        <div className="w-full max-w-4xl">
          <div className="bg-gray-900 rounded-xl border border-white/10 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-pink-500 rounded-xl flex items-center justify-center text-3xl">
                ✅
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Video Generated Successfully!</h2>
                <p className="text-gray-400">Powered by Veo 3.1</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Individual Clips Section */}
              {videoClips && videoClips.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Individual Clips ({videoClips.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {videoClips.map((clip) => (
                      <div key={clip.sceneNumber} className="bg-gray-800 rounded-lg overflow-hidden border border-white/10">
                        <div className="bg-black" style={{ aspectRatio: generatedVideo?.aspectRatio ? generatedVideo.aspectRatio.replace(':', '/') : '16/9' }}>
                          {clipBlobs[clip.sceneNumber]?.blobUrl ? (
                            <video 
                              controls 
                              className="w-full h-full"
                              src={clipBlobs[clip.sceneNumber].blobUrl}
                              style={{ objectFit: 'contain' }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple mx-auto mb-2"></div>
                                <p className="text-gray-400 text-xs">Loading...</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="text-white font-medium text-sm mb-2">Scene {clip.sceneNumber}</div>
                          <button
                            onClick={() => {
                              if (clipBlobs[clip.sceneNumber]?.blob) {
                                const url = URL.createObjectURL(clipBlobs[clip.sceneNumber].blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `scene-${clip.sceneNumber}.mp4`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }
                            }}
                            disabled={!clipBlobs[clip.sceneNumber]?.blob}
                            className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              clipBlobs[clip.sceneNumber]?.blob
                                ? 'bg-brand-purple hover:bg-brand-purple-dark text-white'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            📥 Download Clip
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Stitch Videos Button */}
                  {videoClips.length > 1 && (
                    <div className="mt-6">
                      <button
                        onClick={onStitchVideos}
                        disabled={isStitching || videoClips.some(clip => !clipBlobs[clip.sceneNumber]?.blob)}
                        className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-all ${
                          isStitching || videoClips.some(clip => !clipBlobs[clip.sceneNumber]?.blob)
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-brand-purple to-pink-500 hover:from-brand-purple-dark hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {isStitching ? (
                          <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>{stitchingProgress?.message || 'Stitching...'}</span>
                            {stitchingProgress?.progress && (
                              <span className="text-sm">({stitchingProgress.progress}%)</span>
                            )}
                          </div>
                        ) : (
                          <span>🎬 Stitch All Clips Into Final Video</span>
                        )}
                      </button>
                      {videoClips.some(clip => !clipBlobs[clip.sceneNumber]?.blob) && (
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Waiting for all clips to load...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Final Stitched Video */}
              {stitchedVideo && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-bold text-white">✅ Final Stitched Video</h3>
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video 
                      controls 
                      className="w-full"
                      src={stitchedVideo.url}
                      style={{ objectFit: 'contain' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{stitchedVideo.clipCount} clips • {stitchedVideo.totalDuration}s • {(stitchedVideo.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = stitchedVideo.url;
                        a.download = `final-video-${Date.now()}.mp4`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      className="px-4 py-2 bg-brand-purple hover:bg-brand-purple-dark text-white rounded-lg font-medium transition-colors"
                    >
                      📥 Download Final Video
                    </button>
                  </div>
                </div>
              )}

              {/* Old Final Stitched Video Section - Remove this */}
              {generatedVideo.isStitched && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Final Stitched Video</h3>
                  <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: generatedVideo.aspectRatio.replace(':', '/') }}>
                {videoBlobUrl ? (
                  <video 
                    controls 
                    className="w-full h-full"
                    src={videoBlobUrl}
                    style={{ objectFit: 'contain' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading video...</p>
                    </div>
                  </div>
                )}
                  </div>

                  {/* Download Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleDownloadVideo}
                      disabled={!videoBlob || isDownloading}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        videoBlob && !isDownloading
                          ? 'bg-gradient-to-r from-brand-purple to-pink-500 text-white hover:shadow-lg hover:shadow-brand-purple/50'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isDownloading ? '⏳ Downloading...' : '📥 Download Final Video'}
                    </button>
                  </div>
                </div>
              )}

              {/* Video Details */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Generation Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="text-gray-400 mb-1">Duration</div>
                    <div className="text-white font-medium text-lg">{generatedVideo.duration}s</div>
                  </div>
                  {generatedVideo.scenes && (
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="text-gray-400 mb-1">Scenes</div>
                      <div className="text-white font-medium text-lg">{generatedVideo.scenes}</div>
                    </div>
                  )}
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="text-gray-400 mb-1">Resolution</div>
                    <div className="text-white font-medium text-lg">720p</div>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="text-gray-400 mb-1">Style</div>
                    <div className="text-white font-medium text-lg capitalize">{generatedVideo.style}</div>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="text-gray-400 mb-1">Aspect Ratio</div>
                    <div className="text-white font-medium text-lg">{generatedVideo.aspectRatio}</div>
                  </div>
                </div>
              </div>

              {/* Prompt */}
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Prompt</div>
                <div className="text-white text-sm leading-relaxed">{generatedVideo.prompt}</div>
              </div>

              {/* Operation Info */}
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Operation ID</div>
                <div className="text-gray-300 text-xs font-mono break-all">{generatedVideo.operationName}</div>
              </div>

              {generatedVideo.note && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">ℹ️</div>
                    <div>
                      <p className="text-sm text-blue-300 font-medium mb-2">Multi-Clip Video</p>
                      <p className="text-sm text-blue-200">{generatedVideo.note}</p>
                      {generatedVideo.requestedDuration && (
                        <p className="text-xs text-blue-300 mt-2">
                          Requested: {generatedVideo.requestedDuration}s | Generated: {generatedVideo.duration}s ({generatedVideo.clips?.length} clips)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="text-xs text-gray-500 text-center">
                Video generation is asynchronous. In a production app, you would poll the operation status 
                and download the video when ready.
              </div>
            </div>
          </div>
        </div>
      )}

      {analysisResult && !isGenerating && (
        <div className="w-full max-w-4xl">
          <div className="bg-gray-900 rounded-xl border border-white/10 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-pink-500 rounded-xl flex items-center justify-center text-3xl">
                {activeTab === 'video' ? '🎬' : '🎵'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Analysis Complete</h2>
                <p className="text-gray-400">{uploadedFile?.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Results</h3>
                <div className="bg-black/50 rounded-lg p-6 border border-white/10">
                  <p className="text-white whitespace-pre-wrap leading-relaxed">{analysisResult}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Analyzed by Gemini 2.0 Flash</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCreationCanvas;
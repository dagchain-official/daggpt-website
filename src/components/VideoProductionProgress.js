/**
 * PROFESSIONAL VIDEO PRODUCTION PROGRESS
 * Shows detailed progress for long-form video generation with stitching
 */

import React from 'react';

const VideoProductionProgress = ({ progress, clips = [] }) => {
  if (!progress) return null;

  const { stage, message, progress: percentage, currentScene, totalScenes, stitchProgress } = progress;

  // Define production stages
  const stages = [
    { id: 'planning', name: 'Planning', icon: '📋', color: 'blue' },
    { id: 'generating', name: 'Generating Clips', icon: '🎬', color: 'purple' },
    { id: 'stitching', name: 'Stitching Video', icon: '🎞️', color: 'orange' },
    { id: 'complete', name: 'Complete', icon: '✅', color: 'green' }
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(s => s.id === stage);
  };

  const currentStageIndex = getCurrentStageIndex();

  return (
    <div className="space-y-6">
      {/* Main Progress Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Video Production in Progress</h3>
            <p className="text-indigo-100 text-sm mt-1">{message}</p>
          </div>
          <div className="text-4xl animate-pulse">
            {stages[currentStageIndex]?.icon || '🎬'}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="relative">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            >
              <div className="h-full w-full bg-gradient-to-r from-white to-indigo-200 animate-pulse"></div>
            </div>
          </div>
          <div className="text-right mt-2 text-sm font-semibold">
            {Math.round(percentage)}%
          </div>
        </div>
      </div>

      {/* Production Stages Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Production Pipeline</h4>
        <div className="space-y-3">
          {stages.map((stageItem, index) => {
            const isActive = index === currentStageIndex;
            const isCompleted = index < currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div 
                key={stageItem.id}
                className={`flex items-center p-4 rounded-lg transition-all ${
                  isActive ? 'bg-indigo-50 border-2 border-indigo-500 shadow-md' :
                  isCompleted ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`text-3xl mr-4 ${isActive ? 'animate-bounce' : ''}`}>
                  {stageItem.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${
                      isActive ? 'text-indigo-700' :
                      isCompleted ? 'text-green-700' :
                      'text-gray-500'
                    }`}>
                      {stageItem.name}
                    </span>
                    {isCompleted && (
                      <span className="text-green-600 text-sm font-medium">✓ Done</span>
                    )}
                    {isActive && (
                      <span className="text-indigo-600 text-sm font-medium animate-pulse">● In Progress</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clip Generation Progress (when generating) */}
      {stage === 'generating' && totalScenes > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-800">Clip Generation</h4>
            <span className="text-sm font-medium text-indigo-600">
              {currentScene || 0} / {totalScenes} clips
            </span>
          </div>

          {/* Clips Grid */}
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: totalScenes }).map((_, index) => {
              const clipNumber = index + 1;
              const isGenerating = clipNumber === currentScene;
              const isCompleted = clipNumber < (currentScene || 0);
              const isPending = clipNumber > (currentScene || 0);

              return (
                <div
                  key={index}
                  className={`relative aspect-video rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                    isGenerating ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-110 animate-pulse' :
                    isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted && <span className="text-2xl">✓</span>}
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {isPending && <span>{clipNumber}</span>}
                  <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-600">
                    Clip {clipNumber}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Clip Details */}
          {currentScene && (
            <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentScene}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-900">
                    Currently generating clip {currentScene} of {totalScenes}
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stitching Progress (when stitching) */}
      {stage === 'stitching' && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-800">Video Stitching</h4>
            <span className="text-2xl animate-spin">🎞️</span>
          </div>

          {/* Stitching Stages */}
          <div className="space-y-3">
            {stitchProgress ? (
              <>
                <StitchingStage 
                  name="Loading FFmpeg Engine"
                  status={stitchProgress.stage === 'init' ? 'active' : 'completed'}
                  icon="⚙️"
                />
                <StitchingStage 
                  name="Downloading Clips"
                  status={
                    stitchProgress.stage === 'downloading' ? 'active' :
                    ['stitching', 'finalizing', 'complete'].includes(stitchProgress.stage) ? 'completed' : 'pending'
                  }
                  icon="📥"
                  details={stitchProgress.stage === 'downloading' && stitchProgress.currentClip ? 
                    `Clip ${stitchProgress.currentClip}/${stitchProgress.totalClips}` : null}
                />
                <StitchingStage 
                  name="Combining Clips"
                  status={
                    stitchProgress.stage === 'stitching' ? 'active' :
                    ['finalizing', 'complete'].includes(stitchProgress.stage) ? 'completed' : 'pending'
                  }
                  icon="🔗"
                />
                <StitchingStage 
                  name="Finalizing Video"
                  status={
                    stitchProgress.stage === 'finalizing' ? 'active' :
                    stitchProgress.stage === 'complete' ? 'completed' : 'pending'
                  }
                  icon="✨"
                />
              </>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Preparing stitching engine...</p>
              </div>
            )}
          </div>

          {/* Stitching Progress Bar */}
          {stitchProgress && (
            <div className="mt-6">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${stitchProgress.progress || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                {stitchProgress.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Completed Clips Summary */}
      {clips.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Generated Clips</h4>
          <div className="space-y-2">
            {clips.map((clip, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {clip.sceneNumber || index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Clip {clip.sceneNumber || index + 1}
                    </p>
                    <p className="text-xs text-gray-600">
                      {clip.duration || 8}s • {clip.status || 'completed'}
                    </p>
                  </div>
                </div>
                <span className="text-green-600 text-xl">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Time */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Estimated time remaining</span>
          <span className="font-bold text-gray-800">
            {stage === 'complete' ? 'Done!' :
             stage === 'stitching' ? '2-3 minutes' :
             stage === 'generating' && totalScenes ? `${Math.max(1, (totalScenes - (currentScene || 0)) * 3)} minutes` :
             'Calculating...'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper component for stitching stages
const StitchingStage = ({ name, status, icon, details }) => {
  return (
    <div className={`flex items-center p-3 rounded-lg transition-all ${
      status === 'active' ? 'bg-orange-50 border-2 border-orange-500' :
      status === 'completed' ? 'bg-green-50 border border-green-200' :
      'bg-gray-50 border border-gray-200'
    }`}>
      <div className={`text-2xl mr-3 ${status === 'active' ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${
            status === 'active' ? 'text-orange-700' :
            status === 'completed' ? 'text-green-700' :
            'text-gray-500'
          }`}>
            {name}
          </span>
          {status === 'completed' && <span className="text-green-600 text-xs">✓</span>}
          {status === 'active' && <span className="text-orange-600 text-xs animate-pulse">●</span>}
        </div>
        {details && (
          <p className="text-xs text-gray-600 mt-1">{details}</p>
        )}
      </div>
    </div>
  );
};

export default VideoProductionProgress;

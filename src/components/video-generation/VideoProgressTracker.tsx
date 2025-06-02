/**
 * Video Progress Tracker
 * 影片生成進度追蹤組件
 */

'use client';

import React from 'react';
import { VideoGenerationProgress } from '../../lib/video-generator';
import { OptimizedVideoPrompt } from '../../lib/video-prompt-optimizer';

interface VideoProgressTrackerProps {
  progress: VideoGenerationProgress;
  optimizedPrompt: OptimizedVideoPrompt;
}

export const VideoProgressTracker: React.FC<VideoProgressTrackerProps> = ({
  progress,
  optimizedPrompt
}) => {
  const getStageIcon = (status: string) => {
    switch (status) {
      case 'queued': return '⏳';
      case 'processing': return '🔄';
      case 'generating': return '🎬';
      case 'finalizing': return '✨';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'queued': return '排隊等待中';
      case 'processing': return '準備生成';
      case 'generating': return '正在生成影片';
      case 'finalizing': return '最終處理';
      case 'completed': return '生成完成';
      case 'failed': return '生成失敗';
      default: return '處理中';
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '';
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      {/* 主要進度顯示 */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{getStageIcon(progress.status)}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">
          {getStatusText(progress.status)}
        </h3>
        {progress.currentStage && (
          <p className="text-gray-600 text-sm">{progress.currentStage}</p>
        )}
      </div>

      {/* 進度條 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">進度</span>
          <span className="text-sm font-medium text-blue-600">{progress.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress.progress}%` }}
          ></div>
        </div>
      </div>

      {/* 時間資訊 */}
      {progress.estimatedTimeRemaining && (
        <div className="text-center text-sm text-gray-600">
          預估剩餘時間：{formatTime(progress.estimatedTimeRemaining)}
        </div>
      )}

      {/* Prompt 優化展示 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">📝 您的故事描述優化</h4>
        
        <div className="bg-white rounded-lg p-4 space-y-3">
          {/* 原始 vs 優化對比 */}
          <div>
            <div className="text-xs text-gray-500 mb-1">原始描述:</div>
            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
              {optimizedPrompt.originalPrompt}
            </div>
          </div>
          
          <div className="text-center text-gray-400">⬇️</div>
          
          <div>
            <div className="text-xs text-green-600 mb-1">優化後描述:</div>
            <div className="text-sm text-gray-800 bg-green-50 p-2 rounded border border-green-200">
              {optimizedPrompt.optimizedPrompt}
            </div>
          </div>

          {/* 品質分數 */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-gray-600">品質分數:</span>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-semibold text-green-600">
                {optimizedPrompt.qualityScore}/100
              </div>
              <div className="flex text-yellow-400 text-xs">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i}>
                    {i < Math.floor(optimizedPrompt.qualityScore / 20) ? '★' : '☆'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
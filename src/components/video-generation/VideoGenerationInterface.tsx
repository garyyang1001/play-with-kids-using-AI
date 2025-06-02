/**
 * Video Generation Interface
 * 主要的影片生成介面組件
 */

'use client';

import React, { useState, useEffect } from 'react';
import { videoGenerator, VideoGenerationProgress, VideoGenerationResult } from '../../lib/video-generator';
import { videoPromptOptimizer, OptimizedVideoPrompt } from '../../lib/video-prompt-optimizer';
import { VideoProgressTracker } from './VideoProgressTracker';
import { VideoWaitingExperience } from './VideoWaitingExperience';
import { VideoResultDisplay } from './VideoResultDisplay';

interface VideoGenerationInterfaceProps {
  basePrompt: string;
  templateType?: 'daily-life' | 'adventure' | 'animal-friend';
  userId?: string;
  onComplete?: (result: VideoGenerationResult) => void;
  onCancel?: () => void;
}

export const VideoGenerationInterface: React.FC<VideoGenerationInterfaceProps> = ({
  basePrompt,
  templateType,
  userId,
  onComplete,
  onCancel
}) => {
  const [currentStage, setCurrentStage] = useState<'optimizing' | 'generating' | 'completed' | 'error'>('optimizing');
  const [optimizedPrompt, setOptimizedPrompt] = useState<OptimizedVideoPrompt | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [progress, setProgress] = useState<VideoGenerationProgress | null>(null);
  const [result, setResult] = useState<VideoGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startVideoGeneration();
  }, [basePrompt]);

  useEffect(() => {
    if (generationId) {
      const interval = setInterval(() => {
        const currentProgress = videoGenerator.getProgress(generationId);
        if (currentProgress) {
          setProgress(currentProgress);
          
          if (currentProgress.status === 'completed') {
            setCurrentStage('completed');
            // 這裡實際應該從 VideoGenerator 獲取結果
            const mockResult: VideoGenerationResult = {
              id: generationId,
              success: true,
              videoUrl: '/mock-video.mp4',
              thumbnailUrl: '/mock-thumbnail.jpg',
              metadata: {
                prompt: optimizedPrompt?.optimizedPrompt || basePrompt,
                duration: 5,
                aspectRatio: '9:16',
                qualityScore: 4.2
              },
              generationTime: 120000
            };
            setResult(mockResult);
            onComplete?.(mockResult);
            clearInterval(interval);
          } else if (currentProgress.status === 'failed') {
            setCurrentStage('error');
            setError(currentProgress.error || '影片生成失敗');
            clearInterval(interval);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [generationId, optimizedPrompt, basePrompt, onComplete]);

  const startVideoGeneration = async () => {
    try {
      setCurrentStage('optimizing');
      
      // 1. 優化 Prompt
      const optimized = templateType 
        ? videoPromptOptimizer.optimizeForTemplate(basePrompt, templateType)
        : videoPromptOptimizer.optimizeForVeo2(basePrompt);
      
      setOptimizedPrompt(optimized);
      
      // 2. 提交生成請求
      setCurrentStage('generating');
      const requestId = await videoGenerator.submitGeneration(optimized, userId);
      setGenerationId(requestId);
      
    } catch (err) {
      setCurrentStage('error');
      setError(err instanceof Error ? err.message : '啟動影片生成失敗');
    }
  };

  const handleCancel = () => {
    if (generationId) {
      videoGenerator.cancelGeneration(generationId);
    }
    onCancel?.();
  };

  const handleRetry = () => {
    setCurrentStage('optimizing');
    setError(null);
    setProgress(null);
    setResult(null);
    setGenerationId(null);
    startVideoGeneration();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎬 AI 影片創作中
          </h1>
          <p className="text-gray-600">
            正在為您的故事製作精彩的動畫影片
          </p>
        </div>

        {/* 主要內容區域 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {currentStage === 'optimizing' && (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">優化您的故事描述</h3>
              <p className="text-gray-600">正在讓您的 Prompt 更適合影片生成...</p>
            </div>
          )}

          {currentStage === 'generating' && optimizedPrompt && progress && (
            <div className="space-y-6">
              {/* 進度追蹤器 */}
              <VideoProgressTracker 
                progress={progress}
                optimizedPrompt={optimizedPrompt}
              />
              
              {/* 等待體驗 */}
              <VideoWaitingExperience 
                progress={progress}
                optimizedPrompt={optimizedPrompt}
                onCancel={handleCancel}
              />
            </div>
          )}

          {currentStage === 'completed' && result && (
            <VideoResultDisplay 
              result={result}
              optimizedPrompt={optimizedPrompt}
              onCreateAnother={() => window.location.href = '/'}
              onShare={() => {/* 實作分享功能 */}}
            />
          )}

          {currentStage === 'error' && (
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">生成失敗</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={handleRetry}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  重新嘗試
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  返回
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
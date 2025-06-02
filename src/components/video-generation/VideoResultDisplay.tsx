/**
 * Video Result Display
 * 影片生成完成後的結果展示組件
 */

'use client';

import React, { useState } from 'react';
import { VideoGenerationResult } from '../../lib/video-generator';
import { OptimizedVideoPrompt } from '../../lib/video-prompt-optimizer';

interface VideoResultDisplayProps {
  result: VideoGenerationResult;
  optimizedPrompt: OptimizedVideoPrompt | null;
  onCreateAnother: () => void;
  onShare: () => void;
}

export const VideoResultDisplay: React.FC<VideoResultDisplayProps> = ({
  result,
  optimizedPrompt,
  onCreateAnother,
  onShare
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showPromptComparison, setShowPromptComparison] = useState(false);

  const formatGenerationTime = (timeMs: number) => {
    const seconds = Math.floor(timeMs / 1000);
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  const getQualityStars = (score: number) => {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="text-yellow-400">
            {i < fullStars ? '★' : i === fullStars && hasHalfStar ? '☆' : '☆'}
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">{score.toFixed(1)}/5.0</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 慶祝標題 */}
      <div className="text-center py-6">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">創作完成！</h2>
        <p className="text-gray-600">您的專屬 AI 影片已經準備好了</p>
      </div>

      {/* 影片播放器 */}
      <div className="bg-black rounded-xl overflow-hidden">
        <div className="relative" style={{ aspectRatio: '9/16', maxHeight: '500px' }}>
          {result.videoUrl ? (
            <video
              className="w-full h-full object-cover"
              controls
              poster={result.thumbnailUrl}
              onLoadedData={() => setIsVideoLoaded(true)}
            >
              <source src={result.videoUrl} type="video/mp4" />
              您的瀏覽器不支援影片播放。
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-center">
                <div className="text-4xl mb-2">📹</div>
                <div className="text-gray-600">影片載入中...</div>
              </div>
            </div>
          )}
          
          {!isVideoLoaded && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <div>載入中...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 影片資訊 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">📊 影片資訊</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{result.metadata.duration}秒</div>
            <div className="text-sm text-gray-600">影片長度</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{result.metadata.aspectRatio}</div>
            <div className="text-sm text-gray-600">畫面比例</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatGenerationTime(result.generationTime)}
            </div>
            <div className="text-sm text-gray-600">生成時間</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {getQualityStars(result.metadata.qualityScore || 4.0)}
            </div>
            <div className="text-sm text-gray-600">品質評分</div>
          </div>
        </div>
      </div>

      {/* Prompt 學習成果 */}
      {optimizedPrompt && (
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-blue-800">📝 您的 Prompt 學習成果</h3>
            <button
              onClick={() => setShowPromptComparison(!showPromptComparison)}
              className="text-blue-600 text-sm hover:underline"
            >
              {showPromptComparison ? '隱藏詳情' : '查看對比'}
            </button>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">品質提升程度</span>
              <span className="text-xl font-bold text-green-600">
                {optimizedPrompt.qualityScore}% 🎯
              </span>
            </div>
            
            {showPromptComparison && (
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">原始描述:</div>
                  <div className="text-sm bg-gray-50 p-2 rounded">
                    {optimizedPrompt.originalPrompt}
                  </div>
                </div>
                
                <div className="text-center text-gray-400">⬇️ 優化後 ⬇️</div>
                
                <div>
                  <div className="text-xs text-green-600 mb-1">最終影片描述:</div>
                  <div className="text-sm bg-green-50 p-2 rounded border border-green-200">
                    {optimizedPrompt.optimizedPrompt}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {optimizedPrompt.improvements.map((improvement, index) => (
                    <div key={index} className="bg-yellow-50 p-2 rounded text-xs">
                      <div className="font-medium text-yellow-800">
                        {improvement.type === 'added_motion' && '⚡ 添加動作'}
                        {improvement.type === 'enhanced_color' && '🎨 強化色彩'}
                        {improvement.type === 'improved_emotion' && '😊 情感表達'}
                        {improvement.type === 'refined_scene' && '🏠 場景優化'}
                        {improvement.type === 'timing_optimization' && '⏰ 時間調整'}
                      </div>
                      <div className="text-gray-600">{improvement.reasoning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 操作按鈕 */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={onCreateAnother}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          🎬 再創作一個影片
        </button>
        
        <button
          onClick={onShare}
          className="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors"
        >
          📱 分享到社群
        </button>
        
        <button
          onClick={() => window.location.href = '/learning-journey'}
          className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
        >
          📊 查看學習歷程
        </button>
      </div>

      {/* 統計資訊 */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        影片 ID: {result.id} | 生成於 {new Date().toLocaleDateString('zh-TW')}
      </div>
    </div>
  );
};
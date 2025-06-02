/**
 * Share Success Message
 * 分享成功訊息組件
 */

'use client';

import React from 'react';
import { VideoGenerationResult } from '../../lib/video-generator';

interface ShareSuccessMessageProps {
  shareResults: Record<string, boolean>;
  videoResult: VideoGenerationResult;
  onCreateAnother: () => void;
  onViewLearningReport: () => void;
  onClose?: () => void;
}

export const ShareSuccessMessage: React.FC<ShareSuccessMessageProps> = ({
  shareResults,
  videoResult,
  onCreateAnother,
  onViewLearningReport,
  onClose
}) => {
  const successfulShares = Object.entries(shareResults).filter(([, success]) => success);
  const failedShares = Object.entries(shareResults).filter(([, success]) => !success);

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'Facebook';
      case 'instagram': return 'Instagram';
      case 'twitter': return 'Twitter';
      case 'line': return 'LINE';
      default: return platform;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return '👥';
      case 'instagram': return '📸';
      case 'twitter': return '🐦';
      case 'line': return '💬';
      default: return '📱';
    }
  };

  return (
    <div className="text-center py-8">
      {/* 慶祝動畫 */}
      <div className="relative mb-6">
        <div className="text-6xl animate-bounce">🎉</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl animate-pulse">✨</div>
        </div>
      </div>

      {/* 成功標題 */}
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        分享成功！
      </h2>
      <p className="text-gray-600 mb-6">
        您的 AI 創作成果已經成功分享到社群媒體
      </p>

      {/* 分享結果統計 */}
      <div className="bg-green-50 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-green-800 mb-4">📊 分享結果</h3>
        
        {/* 成功的分享 */}
        {successfulShares.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-green-700 mb-2">✅ 成功分享到：</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {successfulShares.map(([platform]) => (
                <div key={platform} className="bg-white rounded-lg p-3 flex items-center justify-center">
                  <span className="mr-2">{getPlatformIcon(platform)}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {getPlatformName(platform)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 失敗的分享 */}
        {failedShares.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-700 mb-2">❌ 分享失敗：</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {failedShares.map(([platform]) => (
                <div key={platform} className="bg-red-100 rounded-lg p-3 flex items-center justify-center">
                  <span className="mr-2">{getPlatformIcon(platform)}</span>
                  <span className="text-sm font-medium text-red-800">
                    {getPlatformName(platform)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 創作統計 */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-blue-800 mb-4">🎬 本次創作成果</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {videoResult.metadata.duration}秒
            </div>
            <div className="text-sm text-gray-600">影片長度</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-green-600">
              {(videoResult.metadata.qualityScore || 4.0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">品質評分</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(videoResult.generationTime / 1000)}秒
            </div>
            <div className="text-sm text-gray-600">生成時間</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {successfulShares.length}
            </div>
            <div className="text-sm text-gray-600">分享平台</div>
          </div>
        </div>
      </div>

      {/* 社群反饋預測 */}
      <div className="bg-yellow-50 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-4">📈 預期社群反應</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4">
            <div className="text-xl mb-2">👍</div>
            <div className="font-semibold text-gray-800">50+ 讚</div>
            <div className="text-xs text-gray-600">預估按讚數</div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="text-xl mb-2">💬</div>
            <div className="font-semibold text-gray-800">10+ 留言</div>
            <div className="text-xs text-gray-600">預估留言數</div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="text-xl mb-2">📤</div>
            <div className="font-semibold text-gray-800">5+ 分享</div>
            <div className="text-xs text-gray-600">預估分享數</div>
          </div>
        </div>
      </div>

      {/* 下一步建議 */}
      <div className="bg-purple-50 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-purple-800 mb-4">🚀 接下來可以做什麼？</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="bg-white rounded-lg p-4">
            <div className="text-lg mb-2">📱</div>
            <h4 className="font-medium text-gray-800 mb-1">查看社群反應</h4>
            <p className="text-sm text-gray-600">
              關注分享的貼文，回覆朋友們的留言和讚美
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="text-lg mb-2">🎓</div>
            <h4 className="font-medium text-gray-800 mb-1">檢視學習成果</h4>
            <p className="text-sm text-gray-600">
              查看詳細的學習報告，了解 AI 技能進步情況
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="text-lg mb-2">🎨</div>
            <h4 className="font-medium text-gray-800 mb-1">創作新的影片</h4>
            <p className="text-sm text-gray-600">
              嘗試不同的故事模板，繼續提升 Prompt 技巧
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="text-lg mb-2">👨‍👩‍👧‍👦</div>
            <h4 className="font-medium text-gray-800 mb-1">邀請家人參與</h4>
            <p className="text-sm text-gray-600">
              分享創作樂趣，一起學習 AI 技能
            </p>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onCreateAnother}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-8 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105"
        >
          🎬 再創作一個影片
        </button>
        
        <button
          onClick={onViewLearningReport}
          className="bg-green-500 text-white py-3 px-8 rounded-xl font-semibold hover:bg-green-600 transition-colors"
        >
          📊 查看學習報告
        </button>
        
        {onClose && (
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-3 px-8 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
          >
            ✨ 完成
          </button>
        )}
      </div>

      {/* 感謝訊息 */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm">
          感謝您使用 AI 親子創作坊！🎉<br/>
          您的分享將激勵更多家庭一起學習 AI 技能
        </p>
      </div>
    </div>
  );
};
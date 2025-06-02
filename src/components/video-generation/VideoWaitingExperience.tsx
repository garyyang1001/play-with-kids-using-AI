/**
 * Video Waiting Experience
 * 影片生成等待期間的體驗優化組件
 */

'use client';

import React, { useState, useEffect } from 'react';
import { VideoGenerationProgress } from '../../lib/video-generator';
import { OptimizedVideoPrompt } from '../../lib/video-prompt-optimizer';

interface VideoWaitingExperienceProps {
  progress: VideoGenerationProgress;
  optimizedPrompt: OptimizedVideoPrompt;
  onCancel: () => void;
}

export const VideoWaitingExperience: React.FC<VideoWaitingExperienceProps> = ({
  progress,
  optimizedPrompt,
  onCancel
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [gameScore, setGameScore] = useState(0);

  const learningTips = [
    {
      title: "💡 Prompt 技巧：加入動作詞",
      content: "描述動態場景時，使用'飛翔'、'跳躍'、'旋轉'等動作詞，讓影片更生動！",
      example: "小鳥飛翔 → 彩色小鳥在藍天中快樂地飛翔"
    },
    {
      title: "🎨 色彩描述很重要",
      content: "豐富的色彩描述讓畫面更鮮豔，試試'鮮豔的'、'溫暖的'、'夢幻的'！",
      example: "花園 → 充滿鮮豔花朵的夢幻花園"
    },
    {
      title: "😊 情感表達加分",
      content: "描述角色的情感狀態，如'開心地'、'興奮地'，讓角色更有生命力！",
      example: "小朋友玩耍 → 小朋友開心地在草地上玩耍"
    },
    {
      title: "🏠 場景設定完整",
      content: "詳細的背景描述讓故事更完整，加入環境、時間、氛圍等元素！",
      example: "吃早餐 → 在明亮的廚房裡享用豐盛的早餐"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % learningTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [learningTips.length]);

  const handleMiniGameClick = () => {
    setGameScore(gameScore + 1);
    // 簡單的點擊遊戲效果
    const celebration = document.createElement('div');
    celebration.textContent = '+1 ✨';
    celebration.className = 'absolute text-yellow-500 font-bold pointer-events-none animate-ping';
    document.body.appendChild(celebration);
    setTimeout(() => document.body.removeChild(celebration), 1000);
  };

  return (
    <div className="space-y-6">
      {/* 學習技巧輪播 */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h4 className="font-semibold text-blue-800 mb-4">🎓 等待期間學習小技巧</h4>
        
        <div className="bg-white rounded-lg p-4 min-h-[120px]">
          <h5 className="font-medium text-gray-800 mb-2">
            {learningTips[currentTipIndex].title}
          </h5>
          <p className="text-gray-600 mb-3">
            {learningTips[currentTipIndex].content}
          </p>
          <div className="bg-gray-50 p-2 rounded text-sm">
            <span className="text-gray-500">範例：</span>
            <span className="text-green-600 font-medium">
              {learningTips[currentTipIndex].example}
            </span>
          </div>
        </div>

        {/* 輪播指示器 */}
        <div className="flex justify-center mt-4 space-x-2">
          {learningTips.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentTipIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 您學會了什麼？成就展示 */}
      <div className="bg-green-50 rounded-xl p-6">
        <h4 className="font-semibold text-green-800 mb-4">🏆 您的學習成果</h4>
        
        <div className="grid grid-cols-2 gap-4">
          {optimizedPrompt.optimizationAreas.map((area, index) => (
            <div key={index} className="bg-white rounded-lg p-3">
              <div className="text-sm font-medium text-gray-800 mb-1">
                {area.area === 'motion' && '⚡ 動作描述'}
                {area.area === 'visual' && '🎨 視覺效果'}
                {area.area === 'emotion' && '😊 情感表達'}
                {area.area === 'scene' && '🏠 場景設定'}
                {area.area === 'timing' && '⏰ 時間節奏'}
              </div>
              <div className="text-xs text-gray-600">{area.improvement}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            品質提升 {optimizedPrompt.qualityScore}%!
          </div>
          <div className="text-sm text-gray-600">比原始描述更精彩了</div>
        </div>
      </div>

      {/* 等待期間小活動 */}
      <div className="bg-purple-50 rounded-xl p-6">
        <h4 className="font-semibold text-purple-800 mb-4">🎮 等待期間小遊戲</h4>
        
        <div className="text-center">
          <div className="text-lg mb-4">點擊收集創意星星！</div>
          <button
            onClick={handleMiniGameClick}
            className="text-6xl hover:scale-110 transition-transform cursor-pointer"
          >
            ⭐
          </button>
          <div className="mt-4">
            <div className="text-2xl font-bold text-purple-600">⭐ {gameScore}</div>
            <div className="text-sm text-gray-600">創意點數</div>
          </div>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          取消生成
        </button>
        
        <div className="bg-blue-100 px-4 py-2 rounded-lg">
          <div className="text-sm text-blue-800">
            💡 小提示：影片生成大約需要 2-3 分鐘
          </div>
        </div>
      </div>
    </div>
  );
};
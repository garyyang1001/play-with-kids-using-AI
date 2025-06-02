/**
 * Video Generation Demo Page
 * 影片生成完整流程演示頁面
 */

'use client';

import React, { useState } from 'react';
import { VideoGenerationInterface } from '../../components/video-generation/VideoGenerationInterface';
import { VideoGenerationResult } from '../../lib/video-generator';

interface DemoPrompt {
  id: string;
  title: string;
  prompt: string;
  templateType: 'daily-life' | 'adventure' | 'animal-friend';
  description: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

export default function VideoGenerationDemoPage() {
  const [selectedPrompt, setSelectedPrompt] = useState<DemoPrompt | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showGeneration, setShowGeneration] = useState(false);

  const demoPrompts: DemoPrompt[] = [
    {
      id: 'daily-1',
      title: '早晨刷牙時光',
      prompt: '小朋友在浴室裡刷牙',
      templateType: 'daily-life',
      description: '基礎級：學習日常生活的結構化描述',
      difficulty: 'basic'
    },
    {
      id: 'adventure-1',
      title: '超級英雄冒險',
      prompt: '小英雄飛在天空中拯救小貓',
      templateType: 'adventure',
      description: '進階級：學習角色設定與情節發展',
      difficulty: 'intermediate'
    },
    {
      id: 'animal-1',
      title: '森林動物朋友',
      prompt: '小兔子和小熊在森林裡一起玩耍',
      templateType: 'animal-friend',
      description: '創意級：學習角色互動與視覺創意',
      difficulty: 'advanced'
    },
    {
      id: 'daily-2',
      title: '晚餐時間',
      prompt: '家人一起吃晚餐',
      templateType: 'daily-life',
      description: '基礎級：家庭場景的溫馨描述',
      difficulty: 'basic'
    },
    {
      id: 'adventure-2',
      title: '太空探險',
      prompt: '小太空人在星球上探索',
      templateType: 'adventure',
      description: '進階級：科幻場景的想像力發揮',
      difficulty: 'intermediate'
    },
    {
      id: 'animal-2',
      title: '海底世界',
      prompt: '彩色魚兒在珊瑚礁中游泳',
      templateType: 'animal-friend',
      description: '創意級：海洋環境的奇幻創作',
      difficulty: 'advanced'
    }
  ];

  const handlePromptSelect = (prompt: DemoPrompt) => {
    setSelectedPrompt(prompt);
    setCustomPrompt(prompt.prompt);
  };

  const handleStartGeneration = () => {
    if (customPrompt.trim()) {
      setShowGeneration(true);
    }
  };

  const handleGenerationComplete = (result: VideoGenerationResult) => {
    console.log('影片生成完成:', result);
    // 這裡可以添加更多的完成後處理邏輯
  };

  const handleBackToSelection = () => {
    setShowGeneration(false);
    setSelectedPrompt(null);
    setCustomPrompt('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return '基礎級';
      case 'intermediate': return '進階級';
      case 'advanced': return '創意級';
      default: return '一般';
    }
  };

  if (showGeneration) {
    return (
      <VideoGenerationInterface
        basePrompt={customPrompt}
        templateType={selectedPrompt?.templateType}
        userId="demo-user"
        onComplete={handleGenerationComplete}
        onCancel={handleBackToSelection}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎬 AI 影片生成體驗
          </h1>
          <p className="text-gray-600 text-lg">
            選擇一個範例或創建自己的故事，體驗 Veo2 影片生成功能
          </p>
        </div>

        {/* 範例選擇區域 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            📚 選擇範例故事
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`bg-white rounded-xl p-6 shadow-md cursor-pointer transition-all hover:shadow-lg border-2 ${
                  selectedPrompt?.id === prompt.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-transparent hover:border-gray-200'
                }`}
                onClick={() => handlePromptSelect(prompt)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {prompt.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(prompt.difficulty)}`}>
                    {getDifficultyText(prompt.difficulty)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3 text-sm">
                  {prompt.description}
                </p>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">故事描述：</div>
                  <div className="text-sm text-gray-800 font-medium">
                    &ldquo;{prompt.prompt}&rdquo;
                  </div>
                </div>

                <div className="mt-3 flex items-center text-xs text-gray-500">
                  <span className="mr-2">
                    {prompt.templateType === 'daily-life' && '🏠 日常生活'}
                    {prompt.templateType === 'adventure' && '🚀 冒險故事'}
                    {prompt.templateType === 'animal-friend' && '🐾 動物朋友'}
                  </span>
                  <span>模板</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 自訂故事區域 */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ✏️ 或者創建您自己的故事
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                故事描述 (建議 10-50 字)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="請描述您想要創作的故事場景，例如：小朋友在公園裡盪鞦韆..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {customPrompt.length}/200 字
              </div>
            </div>

            {selectedPrompt && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-800 mb-1">
                  已選擇範例：{selectedPrompt.title}
                </div>
                <div className="text-xs text-blue-600">
                  將使用 {selectedPrompt.templateType} 模板進行優化
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 開始生成按鈕 */}
        <div className="text-center">
          <button
            onClick={handleStartGeneration}
            disabled={!customPrompt.trim()}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              customPrompt.trim()
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            🎬 開始生成影片
          </button>
          
          {customPrompt.trim() && (
            <div className="mt-4 text-sm text-gray-600">
              💡 影片生成大約需要 2-3 分鐘，期間您可以學習 Prompt 優化技巧
            </div>
          )}
        </div>

        {/* 功能說明 */}
        <div className="mt-12 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🌟 體驗功能
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🤖</div>
              <h4 className="font-medium text-gray-800 mb-1">AI Prompt 優化</h4>
              <p className="text-sm text-gray-600">
                自動優化您的故事描述，提升影片生成品質
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🎓</div>
              <h4 className="font-medium text-gray-800 mb-1">學習 Prompt Engineering</h4>
              <p className="text-sm text-gray-600">
                等待期間學習如何寫出更好的 AI 指令
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🎥</div>
              <h4 className="font-medium text-gray-800 mb-1">高品質影片生成</h4>
              <p className="text-sm text-gray-600">
                使用 Veo2 技術生成 9:16 豎屏動畫影片
              </p>
            </div>
          </div>
        </div>

        {/* 返回首頁連結 */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            ← 返回首頁
          </a>
        </div>
      </div>
    </div>
  );
}

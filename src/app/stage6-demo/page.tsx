'use client';

import React, { useState } from 'react';
import SharingInterface from '@/components/sharing/SharingInterface';
import LearningReportDisplay from '@/components/sharing/LearningReportDisplay';
import { SocialPostData } from '@/lib/social-post-generator';

export default function Stage6DemoPage() {
  const [currentView, setCurrentView] = useState<'intro' | 'sharing' | 'report'>('intro');
  const [shareAnalytics, setShareAnalytics] = useState({
    totalShares: 0,
    platforms: { facebook: 0, line: 0, copy: 0 }
  });

  // 模擬學習會話數據
  const mockSessionData: SocialPostData = {
    templateName: 'adventure',
    childAge: 8,
    learningSession: {
      duration: 18,
      promptEvolutions: 3,
      skillsLearned: ['色彩描述', '情感表達', '動作描述'],
      qualityImprovement: 6.2
    },
    finalPrompt: '身穿紅色斗篷的勇敢小超級英雄，在藍天中飛翔，眼神堅定地用愛心光線拯救困在高塔中的小朋友，周圍有七彩的雲朵和閃亮的星星',
    originalPrompt: '超級英雄',
    achievements: ['情感表達進階', '動作描述新手', '創意組合達人'],
    videoUrl: 'https://example.com/demo-video.mp4'
  };

  const handleShare = (platform: string, content: string) => {
    setShareAnalytics(prev => ({
      totalShares: prev.totalShares + 1,
      platforms: {
        ...prev.platforms,
        [platform]: prev.platforms[platform as keyof typeof prev.platforms] + 1
      }
    }));
    
    console.log(`分享到 ${platform}:`, content);
  };

  const handleDownloadPDF = () => {
    alert('PDF下載功能演示 - 實際環境中會下載完整的學習報告');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* 頂部導航 */}
      <div className="bg-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              🎯 階段6：社群分享與系統完善 Demo
            </h1>
            
            <div className="flex space-x-2">
              {[
                { key: 'intro', label: '📋 功能介紹', icon: '📋' },
                { key: 'sharing', label: '🚀 社群分享', icon: '🚀' },
                { key: 'report', label: '📊 學習報告', icon: '📊' }
              ].map(view => (
                <button
                  key={view.key}
                  onClick={() => setCurrentView(view.key as any)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentView === view.key
                      ? 'bg-blue-500 text-white font-bold'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {view.icon} {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 功能介紹視圖 */}
        {currentView === 'intro' && (
          <div className="space-y-8">
            {/* 階段6概述 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  🎉 階段6完成！最終系統功能展示
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  完整的親子AI創作平台現已完成所有核心功能，包含社群分享、學習報告生成、
                  用戶成就展示等最終階段功能。讓我們一起體驗完整的產品吧！
                </p>
              </div>

              {/* 功能亮點 */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                  <div className="text-3xl mb-3">🤖</div>
                  <h3 className="text-xl font-bold text-blue-800 mb-2">AI社群貼文生成</h3>
                  <p className="text-blue-600">
                    智能生成個人化社群分享內容，包含學習亮點、Prompt進化過程和親子互動回饋
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">個人化學習報告</h3>
                  <p className="text-green-600">
                    全面分析學習進度、技能發展趨勢，提供專業的親子教育洞察和建議
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                  <div className="text-3xl mb-3">🚀</div>
                  <h3 className="text-xl font-bold text-purple-800 mb-2">多平台分享</h3>
                  <p className="text-purple-600">
                    支援Facebook、LINE等主流平台，一鍵分享學習成果和創作影片
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                  <div className="text-3xl mb-3">🏆</div>
                  <h3 className="text-xl font-bold text-orange-800 mb-2">成就系統</h3>
                  <p className="text-orange-600">
                    多維度成就追蹤，激勵孩子持續學習和創意表達
                  </p>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
                  <div className="text-3xl mb-3">📈</div>
                  <h3 className="text-xl font-bold text-pink-800 mb-2">進度追蹤</h3>
                  <p className="text-pink-600">
                    精確追蹤學習進度，可視化技能發展曲線和改進建議
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg">
                  <div className="text-3xl mb-3">💰</div>
                  <h3 className="text-xl font-bold text-indigo-800 mb-2">系統優化</h3>
                  <p className="text-indigo-600">
                    完整的錯誤處理、性能監控和穩定性優化，提供流暢用戶體驗
                  </p>
                </div>
              </div>

              {/* 階段完成統計 */}
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-4 text-center">🎯 專案完成度</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                  {[
                    { stage: '階段1', name: '語音對話', status: '✅', completion: '100%' },
                    { stage: '階段2', name: 'Prompt教學', status: '✅', completion: '100%' },
                    { stage: '階段3', name: '模板系統', status: '✅', completion: '100%' },
                    { stage: '階段4', name: '三大模板', status: '✅', completion: '100%' },
                    { stage: '階段5', name: 'Veo2整合', status: '✅', completion: '100%' },
                    { stage: '階段6', name: '社群分享', status: '✅', completion: '100%' }
                  ].map((stage, index) => (
                    <div key={index} className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="text-2xl mb-1">{stage.status}</div>
                      <div className="font-bold">{stage.stage}</div>
                      <div className="text-sm">{stage.name}</div>
                      <div className="text-xs mt-1">{stage.completion}</div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <div className="text-3xl font-bold">🎉 MVP 100% 完成！</div>
                  <p className="mt-2">所有核心功能已完整實作，準備正式發布！</p>
                </div>
              </div>
            </div>

            {/* 分享統計 */}
            {shareAnalytics.totalShares > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">📈 Demo 分享統計</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{shareAnalytics.totalShares}</div>
                    <div className="text-sm text-gray-600">總分享次數</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{shareAnalytics.platforms.facebook}</div>
                    <div className="text-sm text-gray-600">Facebook</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{shareAnalytics.platforms.line}</div>
                    <div className="text-sm text-gray-600">LINE</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{shareAnalytics.platforms.copy}</div>
                    <div className="text-sm text-gray-600">複製內容</div>
                  </div>
                </div>
              </div>
            )}

            {/* 快速導航 */}
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-gray-800">🧭 快速體驗功能</h3>
              <div className="space-x-4">
                <button
                  onClick={() => setCurrentView('sharing')}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🚀 體驗社群分享
                </button>
                <button
                  onClick={() => setCurrentView('report')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  📊 查看學習報告
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 社群分享視圖 */}
        {currentView === 'sharing' && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🚀 社群分享功能演示</h2>
              <p className="text-gray-600">
                基於模擬的學習會話數據，體驗AI生成的個人化社群分享內容
              </p>
            </div>
            
            <SharingInterface 
              sessionData={mockSessionData}
              videoUrl="https://example.com/demo-video.mp4"
              onShare={handleShare}
            />
          </div>
        )}

        {/* 學習報告視圖 */}
        {currentView === 'report' && (
          <LearningReportDisplay 
            userId="demo-user"
            onDownloadPDF={handleDownloadPDF}
          />
        )}
      </div>

      {/* 底部導航 */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-500 transition-colors">🏠 回到首頁</a>
            <a href="/voice-chat" className="hover:text-blue-500 transition-colors">🎙️ 語音對話</a>
            <a href="/template-experience" className="hover:text-blue-500 transition-colors">🎨 模板體驗</a>
            <a href="/video-generation-demo" className="hover:text-blue-500 transition-colors">🎬 影片生成</a>
          </div>
        </div>
      </div>
    </div>
  );
}
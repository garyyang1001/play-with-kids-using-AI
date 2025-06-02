/**
 * Personalized Content Card
 * 個人化內容卡片組件
 */

'use client';

import React from 'react';
import { LearningReport } from '../../lib/learning-report-generator';

interface PersonalizedContentCardProps {
  content: LearningReport['personalizedContent'];
  childName: string;
}

export const PersonalizedContentCard: React.FC<PersonalizedContentCardProps> = ({
  content,
  childName
}) => {
  return (
    <div className="space-y-6">
      {/* 慶祝訊息 */}
      <div className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-100 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-yellow-800 mb-3">
          給 {childName} 的特別訊息
        </h3>
        <p className="text-lg text-yellow-700 leading-relaxed">
          {content.celebrationMessage}
        </p>
        <div className="mt-4 inline-block bg-yellow-200 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
          ⭐ 學習之星 ⭐
        </div>
      </div>

      {/* 鼓勵話語 */}
      <div className="bg-gradient-to-r from-green-100 via-green-50 to-emerald-100 rounded-2xl p-6">
        <div className="flex items-center justify-center mb-4">
          <span className="text-3xl mr-3">💪</span>
          <h4 className="text-xl font-bold text-green-800">給你的鼓勵</h4>
        </div>
        <blockquote className="text-center text-lg text-green-700 italic leading-relaxed">
          "{content.encouragementNote}"
        </blockquote>
        <div className="text-center mt-4">
          <div className="inline-flex items-center bg-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <span className="mr-2">🌟</span>
            你做得很棒，繼續加油！
          </div>
        </div>
      </div>

      {/* 學習目標 */}
      <div className="bg-gradient-to-r from-blue-100 via-blue-50 to-purple-100 rounded-2xl p-6">
        <div className="flex items-center mb-6">
          <span className="text-3xl mr-3">🎯</span>
          <h4 className="text-xl font-bold text-blue-800">你的下一步學習目標</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.nextLearningGoals.map((goal, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium leading-relaxed">{goal}</p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span className="mr-1">⏱️</span>
                    預計1-2週完成
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 bg-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center text-blue-800">
            <span className="text-lg mr-2">💡</span>
            <div className="text-sm text-center">
              <strong>小提醒：</strong>每完成一個目標，記得慶祝一下自己的進步！
              學習是一個快樂的旅程。
            </div>
          </div>
        </div>
      </div>

      {/* 推薦模板 */}
      <div className="bg-gradient-to-r from-purple-100 via-purple-50 to-pink-100 rounded-2xl p-6">
        <div className="flex items-center mb-6">
          <span className="text-3xl mr-3">📚</span>
          <h4 className="text-xl font-bold text-purple-800">為你推薦的創作模板</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.recommendedTemplates.map((template, index) => {
            const templateInfo = {
              '我的一天（基礎級）': { icon: '🏠', color: 'bg-blue-500', description: '用AI記錄美好的日常時光' },
              '夢想冒險（進階級）': { icon: '🚀', color: 'bg-purple-500', description: '創造精彩的冒險故事' },
              '動物朋友（創意級）': { icon: '🐾', color: 'bg-green-500', description: '與可愛動物朋友互動' },
              '我的一天': { icon: '🏠', color: 'bg-blue-500', description: '用AI記錄美好的日常時光' },
              '夢想冒險': { icon: '🚀', color: 'bg-purple-500', description: '創造精彩的冒險故事' },
              '動物朋友': { icon: '🐾', color: 'bg-green-500', description: '與可愛動物朋友互動' }
            };
            
            const info = templateInfo[template as keyof typeof templateInfo] || 
                        { icon: '✨', color: 'bg-gray-500', description: '探索新的創作可能' };
            
            return (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className={`w-12 h-12 ${info.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-white text-xl">{info.icon}</span>
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-2">{template}</h5>
                  <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                  <button className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
                    開始創作
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 bg-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-center text-purple-800">
            <span className="text-lg mr-2">🎨</span>
            <div className="text-sm text-center">
              <strong>創作建議：</strong>嘗試不同的模板可以幫助你發現更多創意靈感，
              每個模板都有獨特的學習重點喔！
            </div>
          </div>
        </div>
      </div>

      {/* 成長軌跡 */}
      <div className="bg-gradient-to-r from-gray-100 via-gray-50 to-slate-100 rounded-2xl p-6">
        <div className="flex items-center mb-6">
          <span className="text-3xl mr-3">📈</span>
          <h4 className="text-xl font-bold text-gray-800">{childName} 的成長軌跡</h4>
        </div>
        
        <div className="relative">
          {/* 成長時間線 */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          <div className="space-y-6">
            {/* 過去成就 */}
            <div className="relative flex items-start space-x-4">
              <div className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                <span className="text-white text-sm">✓</span>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
                <h5 className="font-semibold text-gray-800 mb-1">已完成的學習</h5>
                <p className="text-sm text-gray-600">掌握了基礎的AI溝通技巧，能夠創作有趣的故事內容</p>
              </div>
            </div>
            
            {/* 當前進行 */}
            <div className="relative flex items-start space-x-4">
              <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 animate-pulse">
                <span className="text-white text-sm">⟳</span>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex-1">
                <h5 className="font-semibold text-blue-800 mb-1">正在學習中</h5>
                <p className="text-sm text-blue-700">持續提升創意表達能力和故事描述技巧</p>
              </div>
            </div>
            
            {/* 未來目標 */}
            <div className="relative flex items-start space-x-4">
              <div className="bg-purple-300 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                <span className="text-white text-sm">→</span>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex-1">
                <h5 className="font-semibold text-purple-800 mb-1">未來展望</h5>
                <p className="text-sm text-purple-700">成為AI創作小達人，幫助其他小朋友學習</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 特別獎勵 */}
      <div className="bg-gradient-to-r from-pink-100 via-pink-50 to-rose-100 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-4">🎁</div>
        <h4 className="text-xl font-bold text-pink-800 mb-3">特別獎勵時間！</h4>
        <p className="text-pink-700 mb-4">
          {childName} 在AI學習方面表現優秀，值得一個特別的獎勵！
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">🍭</div>
            <div className="text-sm font-medium text-gray-800">小點心獎勵</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-sm font-medium text-gray-800">新故事書</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">🎮</div>
            <div className="text-sm font-medium text-gray-800">額外遊戲時間</div>
          </div>
        </div>
      </div>
    </div>
  );
};
/**
 * Parent Insights Card
 * 家長洞察卡片組件
 */

'use client';

import React from 'react';
import { LearningReport } from '../../lib/learning-report-generator';

interface ParentInsightsCardProps {
  insights: LearningReport['parentInsights'];
  childName: string;
}

export const ParentInsightsCard: React.FC<ParentInsightsCardProps> = ({
  insights,
  childName
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          💡 專業教育洞察
        </h3>
        <p className="text-gray-600">
          基於 {childName} 的學習數據，為家長提供個人化的指導建議
        </p>
      </div>

      {/* 優勢能力 */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">💪</span>
          <h4 className="text-xl font-bold text-green-800">{childName} 的優勢能力</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.strengths.map((strength, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2 mt-1">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{strength}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 bg-green-100 rounded-lg p-4">
          <div className="flex items-center text-green-800">
            <span className="text-lg mr-2">🌟</span>
            <div className="text-sm">
              <strong>教育建議：</strong>發現並讚美 {childName} 的這些優勢，建立學習自信心。
              這些天賦將成為未來學習的重要基礎。
            </div>
          </div>
        </div>
      </div>

      {/* 成長空間 */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">🎯</span>
          <h4 className="text-xl font-bold text-blue-800">可以成長的領域</h4>
        </div>
        
        <div className="space-y-4">
          {insights.areasForGrowth.map((area, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2 mt-1">
                  <span className="text-blue-600 text-sm">→</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium mb-2">{area}</p>
                  <div className="text-sm text-gray-600">
                    這是很正常的學習過程，每個孩子都有自己的節奏。
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 bg-blue-100 rounded-lg p-4">
          <div className="flex items-center text-blue-800">
            <span className="text-lg mr-2">💡</span>
            <div className="text-sm">
              <strong>成長心態：</strong>這些領域是 {childName} 最有潛力突破的地方。
              適當的練習和鼓勵將帶來顯著進步。
            </div>
          </div>
        </div>
      </div>

      {/* 實用建議 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">📋</span>
          <h4 className="text-xl font-bold text-purple-800">實用指導建議</h4>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.recommendations.map((recommendation, index) => (
            <div key={index} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 rounded-full p-2 mt-1 flex-shrink-0">
                  <span className="text-purple-600 text-sm font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium leading-relaxed">{recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 bg-purple-100 rounded-lg p-4">
          <div className="flex items-center text-purple-800">
            <span className="text-lg mr-2">👨‍👩‍👧‍👦</span>
            <div className="text-sm">
              <strong>親子互動：</strong>這些建議基於兒童發展心理學，
              適合在日常親子時光中自然融入，讓學習變得更有趣。
            </div>
          </div>
        </div>
      </div>

      {/* 下一步行動 */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">🚀</span>
          <h4 className="text-xl font-bold text-orange-800">接下來的學習目標</h4>
        </div>
        
        <div className="space-y-3">
          {insights.nextSteps.map((step, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{step}</p>
                </div>
                <div className="text-gray-400">
                  <span className="text-sm">📅 建議在1-2週內開始</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 bg-orange-100 rounded-lg p-4">
          <div className="flex items-center text-orange-800">
            <span className="text-lg mr-2">⏰</span>
            <div className="text-sm">
              <strong>學習節奏：</strong>建議每天花費10-15分鐘，
              保持輕鬆愉快的學習氛圍。重質量勝過數量。
            </div>
          </div>
        </div>
      </div>

      {/* 專家觀點 */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">👨‍🏫</span>
          <h4 className="text-xl font-bold text-gray-800">兒童AI教育專家觀點</h4>
        </div>
        
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-gray-100 rounded-full p-3 flex-shrink-0">
              <span className="text-gray-600">💭</span>
            </div>
            <div className="flex-1">
              <blockquote className="text-gray-700 italic leading-relaxed">
                "在AI時代，最重要的能力是與AI有效溝通。{childName} 正在學習的Prompt Engineering技能，
                將成為未來學習和工作的核心競爭力。家長的陪伴和鼓勵對於建立孩子的AI素養非常關鍵。"
              </blockquote>
              <footer className="mt-3 text-sm text-gray-500">
                — AI教育研究專家
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* 學習環境建議 */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">🏠</span>
          <h4 className="text-xl font-bold text-teal-800">學習環境優化建議</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4">
            <h5 className="font-semibold text-teal-700 mb-3">📅 最佳學習時間</h5>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center"><span className="text-teal-500 mr-2">•</span>建議在孩子精神狀態最好的時候</li>
              <li className="flex items-center"><span className="text-teal-500 mr-2">•</span>每次10-15分鐘，避免疲勞</li>
              <li className="flex items-center"><span className="text-teal-500 mr-2">•</span>可以是餐後或睡前的親子時光</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-4">
            <h5 className="font-semibold text-teal-700 mb-3">🌟 互動方式</h5>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center"><span className="text-teal-500 mr-2">•</span>以提問引導代替直接指導</li>
              <li className="flex items-center"><span className="text-teal-500 mr-2">•</span>慶祝每一個小進步</li>
              <li className="flex items-center"><span className="text-teal-500 mr-2">•</span>鼓勵創意表達，不要過度糾正</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
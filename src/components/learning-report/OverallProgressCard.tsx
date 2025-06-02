/**
 * Overall Progress Card
 * 整體進度卡片組件
 */

'use client';

import React from 'react';
import { LearningReport } from '../../lib/learning-report-generator';

interface OverallProgressCardProps {
  progress: LearningReport['overallProgress'];
  period: LearningReport['period'];
  childName: string;
}

export const OverallProgressCard: React.FC<OverallProgressCardProps> = ({
  progress,
  period,
  childName
}) => {
  const getLearningVelocityColor = (velocity: string) => {
    switch (velocity) {
      case 'exceptional': return 'text-purple-600 bg-purple-100';
      case 'fast': return 'text-green-600 bg-green-100';
      case 'steady': return 'text-blue-600 bg-blue-100';
      case 'slow': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLearningVelocityText = (velocity: string) => {
    switch (velocity) {
      case 'exceptional': return '超強學習力';
      case 'fast': return '快速學習者';
      case 'steady': return '穩定進步者';
      case 'slow': return '需要鼓勵';
      default: return '一般';
    }
  };

  const getCreativityLevel = (score: number) => {
    if (score >= 80) return { level: 'AI創作大師', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (score >= 60) return { level: '創意達人', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 40) return { level: '創意新手', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { level: '創意萌芽', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  };

  const creativityLevel = getCreativityLevel(progress.creativityScore);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🌟 {childName} 的學習成果概覽
      </h3>

      {/* 主要指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {progress.promptQualityGrowth}%
          </div>
          <div className="text-sm text-gray-600 mb-1">品質提升</div>
          <div className="text-xs text-gray-500">平均每次創作</div>
        </div>

        <div className="bg-white rounded-xl p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {progress.skillsAcquired.length}
          </div>
          <div className="text-sm text-gray-600 mb-1">技能掌握</div>
          <div className="text-xs text-gray-500">項新技能</div>
        </div>

        <div className="bg-white rounded-xl p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {progress.totalAchievements}
          </div>
          <div className="text-sm text-gray-600 mb-1">解鎖成就</div>
          <div className="text-xs text-gray-500">個成就徽章</div>
        </div>

        <div className="bg-white rounded-xl p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {period.totalSessions}
          </div>
          <div className="text-sm text-gray-600 mb-1">學習次數</div>
          <div className="text-xs text-gray-500">次創作體驗</div>
        </div>
      </div>

      {/* 特殊標籤 */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <div className={`px-4 py-2 rounded-full font-semibold ${getLearningVelocityColor(progress.learningVelocity)}`}>
          🚀 {getLearningVelocityText(progress.learningVelocity)}
        </div>
        
        <div className={`px-4 py-2 rounded-full font-semibold ${creativityLevel.bg} ${creativityLevel.color}`}>
          🎨 {creativityLevel.level}
        </div>

        {progress.creativityScore >= 70 && (
          <div className="px-4 py-2 rounded-full font-semibold bg-yellow-100 text-yellow-800">
            ⭐ 創意之星
          </div>
        )}
      </div>

      {/* 技能列表 */}
      <div className="bg-white rounded-xl p-6">
        <h4 className="font-semibold text-gray-800 mb-4 text-center">
          🎯 已掌握的 AI 溝通技能
        </h4>
        
        {progress.skillsAcquired.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {progress.skillsAcquired.map((skill, index) => (
              <div
                key={index}
                className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium text-center"
              >
                {skill === 'clarity' && '🔍 清晰表達'}
                {skill === 'detail' && '📝 豐富細節'}
                {skill === 'emotion' && '😊 情感描述'}
                {skill === 'visual' && '🎨 視覺想像'}
                {skill === 'structure' && '🏗️ 結構組織'}
                {!['clarity', 'detail', 'emotion', 'visual', 'structure'].includes(skill) && `✨ ${skill}`}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            即將開始學習第一個 AI 技能！🌱
          </div>
        )}
      </div>

      {/* 創意分數詳情 */}
      <div className="mt-6 bg-white rounded-xl p-6">
        <h4 className="font-semibold text-gray-800 mb-4 text-center">
          🎨 創意分數分析
        </h4>
        
        <div className="flex items-center justify-center mb-4">
          <div className="w-32 h-32 relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="8"
                strokeDasharray={`${progress.creativityScore * 2.51} 251`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {progress.creativityScore}
                </div>
                <div className="text-xs text-gray-600">創意分數</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          {progress.creativityScore >= 80 && '🌟 創意思維非常出色！繼續保持這種創新精神！'}
          {progress.creativityScore >= 60 && progress.creativityScore < 80 && '🎨 表現出很好的創意能力！嘗試更多元的創作主題！'}
          {progress.creativityScore >= 40 && progress.creativityScore < 60 && '🌱 創意正在萌芽！多觀察生活中的有趣事物！'}
          {progress.creativityScore < 40 && '🌅 創意之旅剛開始！每一次嘗試都是進步！'}
        </div>
      </div>
    </div>
  );
};
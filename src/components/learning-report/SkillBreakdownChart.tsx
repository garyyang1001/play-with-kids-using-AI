/**
 * Skill Breakdown Chart
 * 技能細分圖表組件
 */

'use client';

import React from 'react';
import { LearningReport } from '../../lib/learning-report-generator';

interface SkillBreakdownChartProps {
  skillBreakdown: LearningReport['skillBreakdown'];
}

export const SkillBreakdownChart: React.FC<SkillBreakdownChartProps> = ({
  skillBreakdown
}) => {
  const skills = [
    { key: 'clarity', name: '清晰表達', icon: '🔍', description: '能清楚表達想法和描述' },
    { key: 'detail', name: '豐富細節', icon: '📝', description: '善用具體細節豐富內容' },
    { key: 'emotion', name: '情感描述', icon: '😊', description: '表達角色情感和氛圍' },
    { key: 'visual', name: '視覺想像', icon: '🎨', description: '描繪生動的視覺畫面' },
    { key: 'structure', name: '結構組織', icon: '🏗️', description: '邏輯清晰的內容組織' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'stable': return '➡️';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'declining': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = (level: number) => {
    if (level >= 80) return 'bg-purple-500';
    if (level >= 60) return 'bg-green-500';
    if (level >= 40) return 'bg-blue-500';
    if (level >= 20) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getSkillLevel = (level: number) => {
    if (level >= 80) return { text: '專家級', color: 'text-purple-600' };
    if (level >= 60) return { text: '進階級', color: 'text-green-600' };
    if (level >= 40) return { text: '中級', color: 'text-blue-600' };
    if (level >= 20) return { text: '初級', color: 'text-yellow-600' };
    return { text: '新手', color: 'text-gray-600' };
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          🎯 AI 溝通技能分析
        </h3>
        <p className="text-gray-600">
          詳細了解各項 Prompt Engineering 技能的發展情況
        </p>
      </div>

      {/* 技能雷達圖 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h4 className="font-semibold text-gray-800 mb-6 text-center">
          📊 技能雷達圖
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 雷達圖視覺化 */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* 背景網格 */}
                {[20, 40, 60, 80, 100].map((radius, index) => (
                  <circle
                    key={radius}
                    cx="100"
                    cy="100"
                    r={radius * 0.8}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}
                
                {/* 軸線 */}
                {skills.map((_, index) => {
                  const angle = (index * 72 - 90) * (Math.PI / 180);
                  const x2 = 100 + Math.cos(angle) * 80;
                  const y2 = 100 + Math.sin(angle) * 80;
                  return (
                    <line
                      key={index}
                      x1="100"
                      y1="100"
                      x2={x2}
                      y2={y2}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  );
                })}
                
                {/* 技能數據多邊形 */}
                <polygon
                  points={skills.map((skill, index) => {
                    const skillData = skillBreakdown[skill.key as keyof typeof skillBreakdown];
                    const value = skillData.currentLevel;
                    const angle = (index * 72 - 90) * (Math.PI / 180);
                    const distance = (value / 100) * 80;
                    const x = 100 + Math.cos(angle) * distance;
                    const y = 100 + Math.sin(angle) * distance;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="rgba(139, 92, 246, 0.2)"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                />
                
                {/* 技能點 */}
                {skills.map((skill, index) => {
                  const skillData = skillBreakdown[skill.key as keyof typeof skillBreakdown];
                  const value = skillData.currentLevel;
                  const angle = (index * 72 - 90) * (Math.PI / 180);
                  const distance = (value / 100) * 80;
                  const x = 100 + Math.cos(angle) * distance;
                  const y = 100 + Math.sin(angle) * distance;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#8b5cf6"
                    />
                  );
                })}
              </svg>
              
              {/* 技能標籤 */}
              {skills.map((skill, index) => {
                const angle = (index * 72 - 90) * (Math.PI / 180);
                const distance = 100;
                const x = 100 + Math.cos(angle) * distance;
                const y = 100 + Math.sin(angle) * distance;
                
                return (
                  <div
                    key={index}
                    className="absolute text-xs font-medium text-gray-700 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${(x / 200) * 100}%`,
                      top: `${(y / 200) * 100}%`
                    }}
                  >
                    <div className="text-center">
                      <div className="text-lg">{skill.icon}</div>
                      <div>{skill.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* 技能說明 */}
          <div className="space-y-4">
            <h5 className="font-medium text-gray-800 mb-4">技能說明</h5>
            {skills.map((skill) => {
              const skillData = skillBreakdown[skill.key as keyof typeof skillBreakdown];
              const skillLevel = getSkillLevel(skillData.currentLevel);
              
              return (
                <div key={skill.key} className="flex items-start space-x-3">
                  <span className="text-xl">{skill.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">{skill.name}</span>
                      <span className={`text-sm font-medium ${skillLevel.color}`}>
                        {skillLevel.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>進度: {skillData.currentLevel}/100</span>
                      <span className={getTrendColor(skillData.trend)}>
                        {getTrendIcon(skillData.trend)} {skillData.growthRate > 0 ? '+' : ''}{skillData.growthRate}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 詳細技能卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => {
          const skillData = skillBreakdown[skill.key as keyof typeof skillBreakdown];
          const skillLevel = getSkillLevel(skillData.currentLevel);
          
          return (
            <div key={skill.key} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{skill.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-800">{skill.name}</h4>
                  <span className={`text-sm font-medium ${skillLevel.color}`}>
                    {skillLevel.text}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{skill.description}</p>
              
              {/* 進度條 */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">熟練度</span>
                  <span className="font-medium">{skillData.currentLevel}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(skillData.currentLevel)}`}
                    style={{ width: `${skillData.currentLevel}%` }}
                  ></div>
                </div>
              </div>
              
              {/* 統計資訊 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-800">{skillData.sessions}</div>
                  <div className="text-gray-600">練習次數</div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold ${getTrendColor(skillData.trend)}`}>
                    {getTrendIcon(skillData.trend)} {skillData.growthRate > 0 ? '+' : ''}{skillData.growthRate}%
                  </div>
                  <div className="text-gray-600">成長率</div>
                </div>
              </div>
              
              {/* 最後改進時間 */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  最近練習：{skillData.lastImprovement.toLocaleDateString('zh-TW')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 改進建議 */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
        <h4 className="font-semibold text-orange-800 mb-4 text-center">
          💡 技能提升建議
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-orange-700 mb-3">📈 重點加強</h5>
            <div className="space-y-2">
              {skills
                .filter(skill => skillBreakdown[skill.key as keyof typeof skillBreakdown].currentLevel < 60)
                .map(skill => (
                  <div key={skill.key} className="bg-white rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span>{skill.icon}</span>
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-xs text-gray-500">
                        ({skillBreakdown[skill.key as keyof typeof skillBreakdown].currentLevel}/100)
                      </span>
                    </div>
                  </div>
                ))
              }
              {skills.filter(skill => skillBreakdown[skill.key as keyof typeof skillBreakdown].currentLevel < 60).length === 0 && (
                <div className="text-sm text-gray-600">🌟 所有技能都表現優秀！</div>
              )}
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-orange-700 mb-3">⭐ 優勢技能</h5>
            <div className="space-y-2">
              {skills
                .filter(skill => skillBreakdown[skill.key as keyof typeof skillBreakdown].currentLevel >= 70)
                .map(skill => (
                  <div key={skill.key} className="bg-white rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span>{skill.icon}</span>
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-xs text-green-600 font-medium">
                        ({skillBreakdown[skill.key as keyof typeof skillBreakdown].currentLevel}/100)
                      </span>
                    </div>
                  </div>
                ))
              }
              {skills.filter(skill => skillBreakdown[skill.key as keyof typeof skillBreakdown].currentLevel >= 70).length === 0 && (
                <div className="text-sm text-gray-600">🌱 繼續努力發展優勢技能！</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
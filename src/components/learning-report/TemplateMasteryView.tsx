/**
 * Template Mastery View
 * 模板熟練度展示組件
 */

'use client';

import React from 'react';
import { LearningReport } from '../../lib/learning-report-generator';

interface TemplateMasteryViewProps {
  templateMastery: LearningReport['templateMastery'];
}

export const TemplateMasteryView: React.FC<TemplateMasteryViewProps> = ({
  templateMastery
}) => {
  const templates = [
    {
      key: 'dailyLife',
      name: '我的一天',
      icon: '🏠',
      description: '日常生活場景創作',
      difficulty: '基礎級',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800'
    },
    {
      key: 'adventure',
      name: '夢想冒險',
      icon: '🚀',
      description: '冒險故事情節創作',
      difficulty: '進階級',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800'
    },
    {
      key: 'animalFriend',
      name: '動物朋友',
      icon: '🐾',
      description: '動物角色互動創作',
      difficulty: '創意級',
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-800'
    }
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'expert': return '👑';
      case 'advanced': return '⭐';
      case 'intermediate': return '🎯';
      case 'beginner': return '🌱';
      default: return '🔰';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'expert': return '專家級';
      case 'advanced': return '高級';
      case 'intermediate': return '中級';
      case 'beginner': return '新手';
      default: return '未開始';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-purple-600 bg-purple-100';
      case 'intermediate': return 'text-blue-600 bg-blue-100';
      case 'beginner': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-yellow-500';
      case 'advanced': return 'bg-purple-500';
      case 'intermediate': return 'bg-blue-500';
      case 'beginner': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          📚 創作模板熟練度
        </h3>
        <p className="text-gray-600">
          掌握不同類型的故事創作模板，發展多元化的創意表達能力
        </p>
      </div>

      {/* 模板概覽 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => {
          const mastery = templateMastery[template.key as keyof typeof templateMastery];
          
          return (
            <div key={template.key} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {/* 模板頭部 */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{template.icon}</div>
                <h4 className="text-xl font-bold text-gray-800 mb-1">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${template.bgColor} ${template.textColor}`}>
                  {template.difficulty}
                </span>
              </div>

              {/* 熟練度等級 */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${getLevelColor(mastery.level)}`}>
                  <span className="text-lg mr-2">{getLevelIcon(mastery.level)}</span>
                  <span className="font-semibold">{getLevelText(mastery.level)}</span>
                </div>
              </div>

              {/* 進度圓環 */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke={template.color.includes('blue') ? '#3b82f6' : 
                             template.color.includes('purple') ? '#8b5cf6' : '#10b981'}
                      strokeWidth="6"
                      strokeDasharray={`${mastery.progress * 2.2} 220`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">
                      {mastery.progress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 統計數據 */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-800">{mastery.sessionsCompleted}</div>
                  <div className="text-xs text-gray-600">完成次數</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{mastery.averageQuality}</div>
                  <div className="text-xs text-gray-600">平均品質</div>
                </div>
              </div>

              {/* 優勢技能 */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">💪 優勢技能</h5>
                <div className="space-y-1">
                  {mastery.strengths.length > 0 ? (
                    mastery.strengths.map((strength, index) => (
                      <div key={index} className={`text-xs px-2 py-1 rounded ${template.bgColor} ${template.textColor}`}>
                        {strength}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">開始練習以發現優勢</div>
                  )}
                </div>
              </div>

              {/* 下個里程碑 */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">🎯 下個目標</h5>
                <div className="space-y-1">
                  {mastery.nextMilestones.slice(0, 2).map((milestone, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                      {milestone}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 詳細分析 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">
          📊 模板熟練度詳細分析
        </h4>

        <div className="space-y-6">
          {templates.map((template) => {
            const mastery = templateMastery[template.key as keyof typeof templateMastery];
            
            return (
              <div key={template.key} className={`${template.bgColor} rounded-xl p-6`}>
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{template.icon}</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800">{template.name}</h5>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{template.difficulty}</span>
                      <span>•</span>
                      <span>{getLevelIcon(mastery.level)} {getLevelText(mastery.level)}</span>
                      <span>•</span>
                      <span>{mastery.progress}% 完成度</span>
                    </div>
                  </div>
                </div>

                {/* 進度條 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">熟練度進展</span>
                    <span className="font-medium">{mastery.progress}/100</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-50 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${getProgressColor(mastery.level)}`}
                      style={{ width: `${mastery.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* 詳細信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h6 className={`font-medium mb-2 ${template.textColor}`}>📈 學習統計</h6>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">完成次數:</span>
                        <span className="font-medium">{mastery.sessionsCompleted} 次</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">平均品質:</span>
                        <span className="font-medium">{mastery.averageQuality}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">當前等級:</span>
                        <span className="font-medium">{getLevelIcon(mastery.level)} {getLevelText(mastery.level)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h6 className={`font-medium mb-2 ${template.textColor}`}>🎯 發展重點</h6>
                    <div className="space-y-1">
                      {mastery.nextMilestones.map((milestone, index) => (
                        <div key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-yellow-500 mr-2">▸</span>
                          <span>{milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 優勢展示 */}
                {mastery.strengths.length > 0 && (
                  <div className="mt-4">
                    <h6 className={`font-medium mb-2 ${template.textColor}`}>⭐ 已掌握技能</h6>
                    <div className="flex flex-wrap gap-2">
                      {mastery.strengths.map((strength, index) => (
                        <span key={index} className="bg-white bg-opacity-70 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 整體建議 */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
        <h4 className="text-xl font-bold text-orange-800 mb-4 text-center">
          💡 模板學習建議
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-orange-700 mb-3">🚀 推薦練習順序</h5>
            <div className="space-y-2">
              {templates
                .sort((a, b) => {
                  const masteryA = templateMastery[a.key as keyof typeof templateMastery];
                  const masteryB = templateMastery[b.key as keyof typeof templateMastery];
                  return masteryA.progress - masteryB.progress;
                })
                .map((template, index) => {
                  const mastery = templateMastery[template.key as keyof typeof templateMastery];
                  return (
                    <div key={template.key} className="bg-white rounded-lg p-3 flex items-center space-x-3">
                      <span className="text-orange-600 font-bold">{index + 1}.</span>
                      <span className="text-lg">{template.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{template.name}</div>
                        <div className="text-sm text-gray-600">目前進度: {mastery.progress}%</div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>

          <div>
            <h5 className="font-medium text-orange-700 mb-3">🎯 學習重點</h5>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <div className="font-medium text-gray-800 mb-1">🏠 生活觀察力</div>
                <div className="text-sm text-gray-600">多觀察日常生活中的細節，提升描述的真實感</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="font-medium text-gray-800 mb-1">🚀 想像力發揮</div>
                <div className="text-sm text-gray-600">大膽想像，創造有趣的冒險情節和奇幻元素</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="font-medium text-gray-800 mb-1">🐾 角色塑造</div>
                <div className="text-sm text-gray-600">為動物角色設計獨特個性和有趣的互動方式</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
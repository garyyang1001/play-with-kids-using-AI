/**
 * Achievements Gallery
 * 成就展示畫廊組件
 */

'use client';

import React, { useState } from 'react';
import { ExtendedLearningReport } from '../../types/learning-report';

interface AchievementsGalleryProps {
  achievements: ExtendedLearningReport['achievements'];
  overallProgress: ExtendedLearningReport['overallProgress'];
}

export const AchievementsGallery: React.FC<AchievementsGalleryProps> = ({
  achievements,
  overallProgress
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'recent' | 'milestones'>('all');

  // 模擬完整的成就系統
  const allAchievements = [
    // 學習類成就
    {
      id: 'first_creation',
      title: '初次創作',
      description: '完成第一個AI影片創作',
      icon: '🎬',
      type: 'milestone' as const,
      category: 'learning',
      earned: true,
      earnedDate: new Date('2025-06-01'),
      rarity: 'common' as const
    },
    {
      id: 'quality_improver',
      title: '品質提升者',
      description: 'Prompt品質提升超過50%',
      icon: '📈',
      type: 'skill' as const,
      category: 'learning',
      earned: overallProgress.promptQualityGrowth >= 50,
      earnedDate: overallProgress.promptQualityGrowth >= 50 ? new Date() : undefined,
      rarity: 'uncommon' as const
    },
    {
      id: 'creativity_master',
      title: '創意大師',
      description: '創意分數達到80分以上',
      icon: '🎨',
      type: 'skill' as const,
      category: 'creativity',
      earned: overallProgress.creativityScore >= 80,
      earnedDate: overallProgress.creativityScore >= 80 ? new Date() : undefined,
      rarity: 'rare' as const
    },
    {
      id: 'fast_learner',
      title: '快速學習者',
      description: '學習速度達到快速等級',
      icon: '⚡',
      type: 'skill' as const,
      category: 'learning',
      earned: ['fast', 'exceptional'].includes(overallProgress.learningVelocity),
      earnedDate: ['fast', 'exceptional'].includes(overallProgress.learningVelocity) ? new Date() : undefined,
      rarity: 'uncommon' as const
    },
    {
      id: 'skill_collector',
      title: '技能收集家',
      description: '掌握5項以上AI溝通技能',
      icon: '🎯',
      type: 'milestone' as const,
      category: 'learning',
      earned: overallProgress.skillsAcquired.length >= 5,
      earnedDate: overallProgress.skillsAcquired.length >= 5 ? new Date() : undefined,
      rarity: 'rare' as const
    },
    // 持續性成就
    {
      id: 'persistent_creator',
      title: '堅持創作者',
      description: '連續7天進行創作練習',
      icon: '🔥',
      type: 'persistence' as const,
      category: 'dedication',
      earned: false, // 需要根據實際數據判斷
      rarity: 'uncommon' as const
    },
    {
      id: 'template_explorer',
      title: '模板探索家',
      description: '嘗試所有三種創作模板',
      icon: '🗺️',
      type: 'milestone' as const,
      category: 'exploration',
      earned: false, // 需要根據模板使用情況判斷
      rarity: 'common' as const
    },
    // 創意類成就
    {
      id: 'storyteller',
      title: '故事大王',
      description: '創作超過10個精彩故事',
      icon: '📚',
      type: 'milestone' as const,
      category: 'creativity',
      earned: false, // 需要根據創作數量判斷
      rarity: 'rare' as const
    },
    {
      id: 'detail_master',
      title: '細節大師',
      description: '細節描述技能達到專家級',
      icon: '🔍',
      type: 'skill' as const,
      category: 'learning',
      earned: false, // 需要根據技能等級判斷
      rarity: 'rare' as const
    },
    {
      id: 'emotion_expert',
      title: '情感表達專家',
      description: '情感描述技能達到高級',
      icon: '😊',
      type: 'skill' as const,
      category: 'learning',
      earned: false, // 需要根據技能等級判斷
      rarity: 'uncommon' as const
    }
  ];

  const earnedAchievements = allAchievements.filter(achievement => achievement.earned);
  const recentAchievements = earnedAchievements.slice(-5); // 最近5個
  const milestoneAchievements = earnedAchievements.filter(achievement => achievement.type === 'milestone');

  const getDisplayedAchievements = () => {
    switch (selectedCategory) {
      case 'recent': return recentAchievements;
      case 'milestones': return milestoneAchievements;
      default: return allAchievements;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-purple-500';
      case 'uncommon': return 'from-green-400 to-blue-500';
      case 'common': return 'from-gray-400 to-gray-500';
      default: return 'from-gray-300 to-gray-400';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '傳說級';
      case 'epic': return '史詩級';
      case 'rare': return '稀有';
      case 'uncommon': return '少見';
      case 'common': return '普通';
      default: return '未知';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning': return '📖';
      case 'creativity': return '🎨';
      case 'dedication': return '💪';
      case 'exploration': return '🗺️';
      case 'social': return '👥';
      default: return '⭐';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'learning': return '學習成長';
      case 'creativity': return '創意表達';
      case 'dedication': return '堅持努力';
      case 'exploration': return '探索發現';
      case 'social': return '社群互動';
      default: return '其他';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          🏆 成就展示廳
        </h3>
        <p className="text-gray-600">
          記錄每一個學習里程碑，見證AI技能的成長軌跡
        </p>
      </div>

      {/* 成就統計 */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {earnedAchievements.length}
            </div>
            <div className="text-sm text-gray-600">已獲得成就</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {allAchievements.length}
            </div>
            <div className="text-sm text-gray-600">總成就數量</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {Math.round((earnedAchievements.length / allAchievements.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">完成度</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {milestoneAchievements.length}
            </div>
            <div className="text-sm text-gray-600">里程碑成就</div>
          </div>
        </div>
      </div>

      {/* 分類選擇器 */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-xl p-1 shadow-sm">
          {[
            { id: 'all', label: '全部成就', count: allAchievements.length },
            { id: 'recent', label: '最近獲得', count: recentAchievements.length },
            { id: 'milestones', label: '里程碑', count: milestoneAchievements.length }
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* 成就網格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {getDisplayedAchievements().map((achievement) => (
          <div
            key={achievement.id}
            className={`relative bg-white rounded-xl p-6 shadow-sm border transition-all hover:shadow-md ${
              achievement.earned
                ? 'border-green-200 bg-gradient-to-br from-white to-green-50'
                : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 opacity-60'
            }`}
          >
            {/* 稀有度標識 */}
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}>
              {getRarityText(achievement.rarity)}
            </div>

            {/* 成就圖標 */}
            <div className="text-center mb-4">
              <div className={`text-4xl mb-2 ${achievement.earned ? '' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <div className="flex items-center justify-center space-x-1">
                <span className="text-xs">{getCategoryIcon(achievement.category)}</span>
                <span className="text-xs text-gray-500">{getCategoryName(achievement.category)}</span>
              </div>
            </div>

            {/* 成就信息 */}
            <div className="text-center">
              <h4 className={`font-semibold mb-2 ${
                achievement.earned ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {achievement.title}
              </h4>
              <p className={`text-sm mb-4 ${
                achievement.earned ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {achievement.description}
              </p>

              {/* 獲得日期或進度 */}
              {achievement.earned ? (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  ✅ {achievement.earnedDate?.toLocaleDateString('zh-TW')}
                </div>
              ) : (
                <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                  🔒 尚未解鎖
                </div>
              )}
            </div>

            {/* 獲得效果 */}
            {achievement.earned && (
              <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 animate-pulse"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 下一個成就預覽 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">
          🎯 即將解鎖的成就
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.suggestions.slice(0, 3).map((suggestion, index) => (
            <div key={index} className="bg-white rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🏅</div>
              <div className="font-medium text-gray-800 mb-1">{suggestion}</div>
              <div className="text-sm text-gray-600">繼續努力即可獲得！</div>
            </div>
          ))}
        </div>
      </div>

      {/* 成就獲得提示 */}
      {earnedAchievements.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-yellow-800">
            <span className="text-xl">💡</span>
            <div>
              <div className="font-medium">成就獲得小貼士</div>
              <div className="text-sm text-yellow-700 mt-1">
                每個成就都代表著學習路上的重要進步！繼續創作和學習，解鎖更多精彩成就。
                你已經完成了 {Math.round((earnedAchievements.length / allAchievements.length) * 100)}% 的成就，表現優秀！
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

/**
 * 模板選擇器組件
 * 階段4：三大模板實作 - 模板UI組件
 */

import React, { useState, useEffect } from 'react';
import { TemplateMetadata, UserLevel } from '@/types/template';
import { TemplatePromptSystem } from '@/lib/template-prompt-system';
import { LearningProgressTracker } from '@/lib/learning-progress-tracker';

interface TemplateCardProps {
  template: TemplateMetadata;
  userLevel: UserLevel | null;
  onSelect: (templateId: string) => void;
  isRecommended?: boolean;
}

function TemplateCard({ template, userLevel, onSelect, isRecommended }: TemplateCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'beginner': return '基礎級';
      case 'intermediate': return '進階級';
      case 'advanced': return '創意級';
      default: return level;
    }
  };

  const isAgeAppropriate = userLevel && 
    userLevel.overall >= (template.level === 'beginner' ? 0 : template.level === 'intermediate' ? 50 : 75);

  return (
    <div 
      className={`relative bg-white rounded-xl p-6 shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${
        isRecommended ? 'border-orange-400 ring-2 ring-orange-200' : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={() => onSelect(template.id)}
    >
      {isRecommended && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          推薦
        </div>
      )}

      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{template.icon}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{template.name}</h3>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(template.level)}`}>
          {getDifficultyText(template.level)}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {template.description}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <span className="w-4 h-4 mr-2">⏱️</span>
          約 {template.estimatedDuration} 分鐘
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <span className="w-4 h-4 mr-2">👶</span>
          適合 {template.targetAge.min}-{template.targetAge.max} 歲
        </div>

        {userLevel && !isAgeAppropriate && (
          <div className="flex items-center text-sm text-amber-600">
            <span className="w-4 h-4 mr-2">⚠️</span>
            建議先完成基礎級模板
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {template.tags.slice(0, 3).map((tag, index) => (
          <span 
            key={index}
            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>

      <button 
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isAgeAppropriate || !userLevel
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={userLevel && !isAgeAppropriate}
      >
        {userLevel && !isAgeAppropriate ? '暫不適合' : '開始創作'}
      </button>
    </div>
  );
}

interface TemplateSelectorProps {
  userId: string;
  onTemplateSelect: (templateId: string, templateName: string) => void;
  showRecommendations?: boolean;
}

export default function TemplateSelector({ 
  userId, 
  onTemplateSelect, 
  showRecommendations = true 
}: TemplateSelectorProps) {
  const [templateSystem] = useState(() => new TemplatePromptSystem());
  const [progressTracker] = useState(() => new LearningProgressTracker());
  
  const [templates, setTemplates] = useState<TemplateMetadata[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recommendedTemplates, setRecommendedTemplates] = useState<string[]>([]);

  useEffect(() => {
    loadTemplatesAndUserData();
  }, [userId]);

  const loadTemplatesAndUserData = async () => {
    setLoading(true);
    try {
      // 獲取用戶水平
      const level = await progressTracker.getUserLevel(userId);
      setUserLevel(level);
      
      // 獲取可用模板
      const availableTemplates = await templateSystem.getAvailableTemplates(level);
      setTemplates(availableTemplates);
      
      // 獲取推薦模板
      if (showRecommendations) {
        const recommendations = await templateSystem.getRecommendedLearningPath(level);
        setRecommendedTemplates(recommendations.map(t => t.id));
      }
      
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
    setLoading(false);
  };

  const categories = [
    { id: 'all', name: '全部', icon: '📚' },
    { id: 'daily-life', name: '日常生活', icon: '🌅' },
    { id: 'adventure', name: '冒險故事', icon: '🚀' },
    { id: 'animal-friend', name: '動物朋友', icon: '🐼' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onTemplateSelect(templateId, template.name);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">載入模板中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 用戶進度概覽 */}
      {userLevel && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">👋 歡迎回來！</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(userLevel.overall)}</div>
              <div className="text-sm text-gray-600">整體水平</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(userLevel.confidence)}</div>
              <div className="text-sm text-gray-600">信心度</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(userLevel.engagement)}</div>
              <div className="text-sm text-gray-600">參與度</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">{userLevel.learningStyle === 'visual' ? '👁️' : 
                                      userLevel.learningStyle === 'auditory' ? '👂' : 
                                      userLevel.learningStyle === 'kinesthetic' ? '✋' : '🎭'}</div>
              <div className="text-sm text-gray-600">學習風格</div>
            </div>
          </div>
        </div>
      )}

      {/* 標題 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🎨 選擇你的創作主題</h2>
        <p className="text-gray-600">和AI一起創造精彩的故事，學習Prompt Engineering技巧！</p>
      </div>

      {/* 分類篩選 */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 推薦模板 */}
      {showRecommendations && recommendedTemplates.length > 0 && selectedCategory === 'all' && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">⭐ 為你推薦</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates
              .filter(template => recommendedTemplates.includes(template.id))
              .map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  userLevel={userLevel}
                  onSelect={handleTemplateSelect}
                  isRecommended={true}
                />
              ))}
          </div>
        </div>
      )}

      {/* 所有模板 */}
      <div>
        {selectedCategory !== 'all' && (
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {categories.find(c => c.id === selectedCategory)?.icon} {categories.find(c => c.id === selectedCategory)?.name}
          </h3>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates
            .filter(template => !showRecommendations || !recommendedTemplates.includes(template.id) || selectedCategory !== 'all')
            .map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                userLevel={userLevel}
                onSelect={handleTemplateSelect}
                isRecommended={false}
              />
            ))}
        </div>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">沒有找到模板</h3>
          <p className="text-gray-600">試試選擇其他分類或重新載入頁面</p>
        </div>
      )}

      {/* 學習建議 */}
      {userLevel && userLevel.overall < 50 && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h4 className="font-semibold text-amber-800 mb-2">💡 學習建議</h4>
          <p className="text-amber-700 text-sm">
            建議從「我的一天」模板開始，這個基礎級模板能幫助你熟悉AI創作的基本技巧！
          </p>
        </div>
      )}
    </div>
  );
}

export { TemplateCard };

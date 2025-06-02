'use client';

/**
 * 學習路徑組件
 * 階段4：三大模板實作 - 學習路徑與進度追蹤
 */

import React, { useState, useEffect } from 'react';
import { TemplateMetadata, UserLevel } from '@/types/template';
import { TemplatePromptSystem } from '@/lib/template-prompt-system';
import { LearningProgressTracker } from '@/lib/learning-progress-tracker';
import { AchievementSystem, AchievementProgress } from '@/lib/achievement-system';

interface LearningPathProps {
  userId: string;
  onTemplateSelect: (templateId: string) => void;
}

function PathStep({ 
  template, 
  isCompleted, 
  isCurrent, 
  isLocked, 
  completionPercentage,
  onClick 
}: {
  template: TemplateMetadata;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  completionPercentage: number;
  onClick: () => void;
}) {
  const getStepColor = () => {
    if (isCompleted) return 'bg-green-500';
    if (isCurrent) return 'bg-blue-500';
    if (isLocked) return 'bg-gray-300';
    return 'bg-yellow-500';
  };

  const getStepIcon = () => {
    if (isCompleted) return '✅';
    if (isCurrent) return '🎯';
    if (isLocked) return '🔒';
    return '⏳';
  };

  return (
    <div className="flex items-center space-x-4">
      {/* 步驟圓圈 */}
      <div 
        className={`relative w-16 h-16 rounded-full ${getStepColor()} flex items-center justify-center cursor-pointer transition-all hover:scale-110`}
        onClick={!isLocked ? onClick : undefined}
      >
        <span className="text-2xl">{template.icon}</span>
        <div className="absolute -bottom-2 text-xs">
          {getStepIcon()}
        </div>
        
        {/* 進度環 */}
        {!isCompleted && !isLocked && (
          <div className="absolute inset-0 rounded-full">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="white"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${completionPercentage * 2.827} 282.7`}
                className="transition-all duration-500"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 模板資訊 */}
      <div className="flex-1">
        <h3 className={`font-semibold ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>
          {template.name}
        </h3>
        <p className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
          {template.description}
        </p>
        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
          <span>⏱️ {template.estimatedDuration} 分鐘</span>
          <span>👶 {template.targetAge.min}-{template.targetAge.max} 歲</span>
          {!isLocked && (
            <span className="text-blue-600">
              {isCompleted ? '已完成' : isCurrent ? '進行中' : '可開始'}
            </span>
          )}
        </div>
        
        {/* 進度條 */}
        {!isCompleted && !isLocked && completionPercentage > 0 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              進度: {Math.round(completionPercentage)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AchievementCard({ progress }: { progress: AchievementProgress }) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return '普通';
      case 'rare': return '稀有';
      case 'epic': return '史詩';
      case 'legendary': return '傳說';
      default: return rarity;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getRarityColor(progress.definition.rarity)} ${
      progress.completed ? 'opacity-100' : 'opacity-75'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{progress.definition.icon}</span>
          <div>
            <h4 className="font-semibold text-sm">{progress.definition.title}</h4>
            <p className="text-xs text-gray-600">{getRarityText(progress.definition.rarity)}</p>
          </div>
        </div>
        {progress.completed && <span className="text-green-500">✅</span>}
      </div>
      
      <p className="text-xs text-gray-600 mb-3">{progress.definition.description}</p>
      
      {!progress.completed && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{progress.currentValue} / {progress.targetValue}</span>
            <span>{Math.round(progress.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearningPath({ userId, onTemplateSelect }: LearningPathProps) {
  const [templateSystem] = useState(() => new TemplatePromptSystem());
  const [progressTracker] = useState(() => new LearningProgressTracker());
  const [achievementSystem] = useState(() => new AchievementSystem());
  
  const [learningPath, setLearningPath] = useState<TemplateMetadata[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [templateProgress, setTemplateProgress] = useState<Record<string, number>>({});
  const [currentTemplate, setCurrentTemplate] = useState<string>('');
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearningData();
  }, [userId]);

  const loadLearningData = async () => {
    setLoading(true);
    try {
      // 獲取用戶水平
      const level = await progressTracker.getUserLevel(userId);
      setUserLevel(level);
      
      // 獲取推薦學習路徑
      const path = await templateSystem.getRecommendedLearningPath(level);
      setLearningPath(path);
      
      // 獲取各模板進度
      const progress: Record<string, number> = {};
      let current = '';
      
      for (const template of path) {
        const userProgress = await progressTracker.getUserProgress(userId, template.id);
        if (userProgress) {
          const totalStages = 4; // 假設每個模板有4個階段
          const completedStages = userProgress.completedStages.length;
          progress[template.id] = (completedStages / totalStages) * 100;
          
          // 判斷當前模板
          if (completedStages > 0 && completedStages < totalStages && !current) {
            current = template.id;
          }
        } else {
          progress[template.id] = 0;
          if (!current) {
            current = template.id;
          }
        }
      }
      
      setTemplateProgress(progress);
      setCurrentTemplate(current);
      
      // 獲取成就進度
      const userProgress = await progressTracker.getUserProgress(userId, '');
      if (userProgress) {
        const skillProgress = userProgress.skillProgress || [];
        const attempts = userProgress.attempts || [];
        const completedTemplates = Object.keys(progress).filter(id => progress[id] >= 100);
        
        const achievementProgress = achievementSystem.getAchievementProgress(
          userId, 
          skillProgress, 
          attempts, 
          completedTemplates
        );
        setAchievements(achievementProgress.slice(0, 6)); // 顯示前6個
      }
      
    } catch (error) {
      console.error('Failed to load learning data:', error);
    }
    setLoading(false);
  };

  const isTemplateCompleted = (templateId: string) => {
    return templateProgress[templateId] >= 100;
  };

  const isTemplateCurrent = (templateId: string) => {
    return currentTemplate === templateId;
  };

  const isTemplateLocked = (templateId: string, index: number) => {
    if (index === 0) return false; // 第一個模板總是解鎖的
    
    // 檢查前一個模板是否完成
    const prevTemplate = learningPath[index - 1];
    return prevTemplate ? !isTemplateCompleted(prevTemplate.id) : false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">載入學習路徑中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 用戶進度概覽 */}
      {userLevel && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 學習概覽</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{Math.round(userLevel.overall)}</div>
              <div className="text-sm text-gray-600">整體水平</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {learningPath.filter(t => isTemplateCompleted(t.id)).length}
              </div>
              <div className="text-sm text-gray-600">已完成模板</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {achievements.filter(a => a.completed).length}
              </div>
              <div className="text-sm text-gray-600">獲得成就</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {Math.round(Object.values(templateProgress).reduce((sum, p) => sum + p, 0) / learningPath.length)}%
              </div>
              <div className="text-sm text-gray-600">總體進度</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 學習路徑 */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🛤️ 學習路徑</h2>
          
          <div className="space-y-6">
            {learningPath.map((template, index) => (
              <div key={template.id}>
                <PathStep
                  template={template}
                  isCompleted={isTemplateCompleted(template.id)}
                  isCurrent={isTemplateCurrent(template.id)}
                  isLocked={isTemplateLocked(template.id, index)}
                  completionPercentage={templateProgress[template.id] || 0}
                  onClick={() => onTemplateSelect(template.id)}
                />
                
                {/* 連接線 */}
                {index < learningPath.length - 1 && (
                  <div className="ml-8 my-4">
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="text-center text-xs text-gray-500">↓</div>
                    <div className="w-px h-8 bg-gray-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 學習建議 */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-2">💡 學習建議</h3>
            <div className="text-sm text-blue-700 space-y-2">
              {userLevel && userLevel.overall < 40 && (
                <p>• 建議從基礎模板開始，循序漸進地提升技能</p>
              )}
              {userLevel && userLevel.overall >= 40 && userLevel.overall < 70 && (
                <p>• 可以嘗試進階模板，挑戰更複雜的創作</p>
              )}
              {userLevel && userLevel.overall >= 70 && (
                <p>• 你已經有很好的基礎，可以挑戰高級創意模板</p>
              )}
              <p>• 每天堅持練習，技能會持續提升</p>
              <p>• 和家長一起創作，可以獲得更好的學習效果</p>
            </div>
          </div>
        </div>

        {/* 成就系統 */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 成就進度</h3>
          
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <AchievementCard 
                key={achievement.achievementId} 
                progress={achievement} 
              />
            ))}
          </div>

          {achievements.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎯</div>
              <p>開始創作來解鎖成就吧！</p>
            </div>
          )}

          {/* 學習統計 */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">📈 學習統計</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">學習風格</span>
                <span className="font-medium">
                  {userLevel?.learningStyle === 'visual' ? '視覺型' :
                   userLevel?.learningStyle === 'auditory' ? '聽覺型' :
                   userLevel?.learningStyle === 'kinesthetic' ? '動覺型' : '綜合型'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">信心指數</span>
                <span className="font-medium">{userLevel ? Math.round(userLevel.confidence) : 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">參與度</span>
                <span className="font-medium">{userLevel ? Math.round(userLevel.engagement) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

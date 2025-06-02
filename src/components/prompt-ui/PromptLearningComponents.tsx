'use client';

import React, { useState, useEffect } from 'react';
import {
  PromptQualityScore,
  PromptOptimizationSuggestion,
  LearningProgress
} from '../../lib/types/prompt-engineering';

interface PromptQualityDisplayProps {
  qualityScore: PromptQualityScore;
  className?: string;
}

/**
 * Prompt 品質評分顯示組件
 */
export const PromptQualityDisplay: React.FC<PromptQualityDisplayProps> = ({
  qualityScore,
  className = ''
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getDimensionName = (key: string) => {
    const names: { [key: string]: string } = {
      clarity: '清晰度',
      detail: '細節豐富度',
      emotion: '情感表達',
      visual: '視覺描述',
      structure: '結構完整性'
    };
    return names[key] || key;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* 整體評分 */}
      <div className="text-center mb-6">
        <div className={`text-4xl font-bold ${getScoreColor(qualityScore.overall)}`}>
          {qualityScore.overall}/100
        </div>
        <div className="text-gray-600 mt-1">整體評分</div>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getScoreBackground(qualityScore.overall)} ${getScoreColor(qualityScore.overall)}`}>
          {qualityScore.overall >= 80 ? '優秀' : qualityScore.overall >= 60 ? '良好' : '需要改善'}
        </div>
      </div>

      {/* 各維度評分 */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 mb-3">詳細評分</h3>
        {Object.entries(qualityScore.dimensions).map(([key, score]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-gray-700">{getDimensionName(key)}</span>
            <div className="flex items-center space-x-3">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={`text-sm font-medium w-8 ${getScoreColor(score)}`}>
                {score}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 優勢和改善領域 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {qualityScore.strengths.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
              <span className="mr-2">✨</span>
              優勢領域
            </h4>
            <ul className="text-green-700 text-sm space-y-1">
              {qualityScore.strengths.map((strength, index) => (
                <li key={index}>• {strength}</li>
              ))}
            </ul>
          </div>
        )}

        {qualityScore.improvementAreas.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <span className="mr-2">🎯</span>
              改善領域
            </h4>
            <ul className="text-blue-700 text-sm space-y-1">
              {qualityScore.improvementAreas.map((area, index) => (
                <li key={index}>• {area}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 建議行動 */}
      {qualityScore.recommendedActions.length > 0 && (
        <div className="mt-4 bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            建議行動
          </h4>
          <ul className="text-purple-700 text-sm space-y-1">
            {qualityScore.recommendedActions.map((action, index) => (
              <li key={index}>• {action}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface OptimizationSuggestionsProps {
  suggestions: PromptOptimizationSuggestion[];
  onApplySuggestion?: (suggestion: PromptOptimizationSuggestion) => void;
  className?: string;
}

/**
 * 優化建議組件
 */
export const OptimizationSuggestions: React.FC<OptimizationSuggestionsProps> = ({
  suggestions,
  onApplySuggestion,
  className = ''
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-yellow-300 bg-yellow-50';
      case 'low': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高優先級';
      case 'medium': return '中優先級';
      case 'low': return '低優先級';
      default: return priority;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clarity': return '🔍';
      case 'detail': return '🎨';
      case 'emotion': return '💖';
      case 'visual': return '👁️';
      case 'structure': return '🏗️';
      default: return '💡';
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className={`bg-green-50 rounded-lg p-6 text-center ${className}`}>
        <div className="text-green-600 text-4xl mb-2">🎉</div>
        <div className="text-green-800 font-semibold">太棒了！</div>
        <div className="text-green-700 text-sm mt-1">你的描述已經很好了，不需要額外的建議！</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">💡</span>
        AI 小助手的建議
      </h3>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getPriorityColor(suggestion.priority)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCategoryIcon(suggestion.category)}</span>
                <span className="font-medium text-gray-800">
                  {suggestion.suggestedText}
                </span>
              </div>
              <span className="text-xs px-2 py-1 bg-white rounded-full font-medium">
                {getPriorityText(suggestion.priority)}
              </span>
            </div>

            <p className="text-gray-700 text-sm mb-3">
              {suggestion.explanation}
            </p>

            {suggestion.example && (
              <div className="bg-white bg-opacity-70 rounded p-3 mb-3">
                <div className="text-xs font-medium text-gray-600 mb-1">範例：</div>
                <div className="text-sm text-gray-800">{suggestion.example}</div>
              </div>
            )}

            {onApplySuggestion && (
              <button
                onClick={() => onApplySuggestion(suggestion)}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                套用建議
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface LearningProgressDisplayProps {
  progress: LearningProgress;
  className?: string;
}

/**
 * 學習進度顯示組件
 */
export const LearningProgressDisplay: React.FC<LearningProgressDisplayProps> = ({
  progress,
  className = ''
}) => {
  const getSkillLevel = (level: number) => {
    if (level >= 80) return { text: '熟練', color: 'text-green-600', bg: 'bg-green-500' };
    if (level >= 60) return { text: '進步中', color: 'text-yellow-600', bg: 'bg-yellow-500' };
    if (level >= 40) return { text: '學習中', color: 'text-blue-600', bg: 'bg-blue-500' };
    return { text: '新手', color: 'text-gray-600', bg: 'bg-gray-500' };
  };

  const getSkillName = (key: string) => {
    const names: { [key: string]: string } = {
      clarity: '清晰表達',
      creativity: '創意思維',
      detail: '細節描述',
      emotion: '情感表達',
      structure: '邏輯結構'
    };
    return names[key] || key;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">📊</span>
        學習進度
      </h3>

      {/* 整體統計 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{progress.totalPrompts}</div>
          <div className="text-blue-700 text-sm">總描述數</div>
        </div>
        <div className="text-center bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{progress.totalOptimizations}</div>
          <div className="text-green-700 text-sm">優化次數</div>
        </div>
        <div className="text-center bg-purple-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600">{progress.currentStreak}</div>
          <div className="text-purple-700 text-sm">連續天數</div>
        </div>
      </div>

      {/* 技能等級 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">技能等級</h4>
        {Object.entries(progress.skillLevels).map(([key, level]) => {
          const skillInfo = getSkillLevel(level);
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-700">{getSkillName(key)}</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${skillInfo.bg}`}
                    style={{ width: `${level}%` }}
                  />
                </div>
                <span className={`text-sm font-medium w-16 ${skillInfo.color}`}>
                  {skillInfo.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 徽章 */}
      {progress.badges.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-3">獲得徽章</h4>
          <div className="flex flex-wrap gap-2">
            {progress.badges.map((badge, index) => (
              <div
                key={badge.id}
                className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-center space-x-2"
                title={badge.description}
              >
                <img src={badge.iconUrl} alt={badge.name} className="w-6 h-6" />
                <span className="text-yellow-800 text-sm font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface PromptEvolutionDisplayProps {
  originalPrompt: string;
  optimizedPrompt: string;
  qualityImprovement: number;
  className?: string;
}

/**
 * Prompt 演進顯示組件
 */
export const PromptEvolutionDisplay: React.FC<PromptEvolutionDisplayProps> = ({
  originalPrompt,
  optimizedPrompt,
  qualityImprovement,
  className = ''
}) => {
  const improvementColor = qualityImprovement > 0 ? 'text-green-600' : 'text-gray-600';
  const improvementIcon = qualityImprovement > 0 ? '📈' : '📊';

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">🔄</span>
        Prompt 演進過程
      </h3>

      <div className="space-y-4">
        {/* 改善幅度 */}
        <div className="text-center bg-gray-50 rounded-lg p-4">
          <div className={`text-2xl font-bold ${improvementColor} flex items-center justify-center`}>
            <span className="mr-2">{improvementIcon}</span>
            +{qualityImprovement.toFixed(1)}分
          </div>
          <div className="text-gray-600 text-sm mt-1">品質提升</div>
        </div>

        {/* 前後對比 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2 flex items-center">
              <span className="mr-2">📝</span>
              原始描述
            </h4>
            <p className="text-red-700 text-sm leading-relaxed">
              {originalPrompt}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              <span className="mr-2">✨</span>
              優化後描述
            </h4>
            <p className="text-green-700 text-sm leading-relaxed">
              {optimizedPrompt}
            </p>
          </div>
        </div>

        {/* 箭頭指示 */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 rounded-full px-4 py-2">
            <span className="text-blue-600 font-medium">變得更生動</span>
            <span className="text-blue-600 text-xl">→</span>
            <span className="text-blue-600 font-medium">AI能更好理解</span>
          </div>
        </div>
      </div>
    </div>
  );
};
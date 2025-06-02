'use client';

/**
 * 模板體驗頁面
 * 階段4：三大模板實作 - 完整體驗流程
 */

import React, { useState, useEffect } from 'react';
import { TemplatePromptSystem, StageExecutionResult } from '@/lib/template-prompt-system';
import { TemplateInstance, TemplateStage } from '@/types/template';
import TemplateSelector from '@/components/template-ui/TemplateSelector';

interface StageDisplayProps {
  stage: TemplateStage;
  instance: TemplateInstance;
  onComplete: (input: string, timeSpent: number) => void;
  loading: boolean;
}

function StageDisplay({ stage, instance, onComplete, loading }: StageDisplayProps) {
  const [userInput, setUserInput] = useState('');
  const [startTime] = useState(Date.now());
  const [showHints, setShowHints] = useState(false);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  const handleSubmit = () => {
    if (userInput.trim()) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onComplete(userInput.trim(), timeSpent);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-green-50 border-green-200 text-green-800';
      case 'good': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'excellent': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 進度指示器 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            階段 {stage.order} / {instance.stages.length}
          </span>
          <span className="text-sm text-gray-500">
            {instance.metadata.name}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(stage.order / instance.stages.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 階段標題和描述 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {stage.name}
        </h2>
        <p className="text-gray-600">
          {stage.description}
        </p>
      </div>

      {/* 指導說明 */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">📝 創作指導</h3>
        <p className="text-blue-700 leading-relaxed">
          {stage.prompt.instruction}
        </p>
      </div>

      {/* 範例展示 */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">✨ 參考範例</h3>
        <div className="grid gap-4">
          {stage.prompt.examples.map((example, index) => (
            <div 
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedExample === index 
                  ? 'ring-2 ring-blue-300' 
                  : ''
              } ${getLevelColor(example.level)}`}
              onClick={() => setSelectedExample(selectedExample === index ? null : index)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">
                  {example.level === 'basic' ? '基礎版本' : 
                   example.level === 'good' ? '進步版本' : '完美版本'}
                </span>
                <span className="text-xs opacity-75">點擊查看解析</span>
              </div>
              
              <p className="font-medium mb-2">"{example.text}"</p>
              
              {selectedExample === index && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                  <p className="text-sm mb-2">{example.explanation}</p>
                  <div className="flex flex-wrap gap-1">
                    {example.highlights.map((highlight, hIndex) => (
                      <span 
                        key={hIndex}
                        className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 輸入區域 */}
      <div className="mb-6">
        <label className="block font-semibold text-gray-800 mb-2">
          🎨 你的創作
        </label>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="在這裡寫下你的創作..."
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          disabled={loading}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            已輸入 {userInput.length} 字
          </span>
          <button
            onClick={() => setShowHints(!showHints)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showHints ? '隱藏提示' : '顯示提示'} 💡
          </button>
        </div>
      </div>

      {/* 提示區域 */}
      {showHints && (
        <div className="mb-6 bg-yellow-50 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 寫作提示</h4>
          <div className="space-y-2 text-sm text-yellow-700">
            {stage.prompt.coaching.childEncouragement.map((tip, index) => (
              <div key={index}>• {tip}</div>
            ))}
          </div>
        </div>
      )}

      {/* 提交按鈕 */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!userInput.trim() || loading}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            userInput.trim() && !loading
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              分析中...
            </span>
          ) : (
            '提交創作 🚀'
          )}
        </button>
      </div>

      {/* 家長指導 */}
      <div className="mt-8 bg-green-50 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">👨‍👩‍👧‍👦 家長小幫手</h4>
        <div className="text-sm text-green-700 space-y-1">
          {stage.prompt.coaching.parentGuidance.map((guidance, index) => (
            <div key={index}>• {guidance}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ResultDisplayProps {
  result: StageExecutionResult;
  onNext: () => void;
  onRetry: () => void;
}

function ResultDisplay({ result, onNext, onRetry }: ResultDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🌟';
    if (score >= 80) return '✨';
    if (score >= 70) return '👍';
    if (score >= 60) return '👌';
    return '💪';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 分數展示 */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{getScoreEmoji(result.score)}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {result.passed ? '太棒了！' : '繼續加油！'}
        </h2>
        <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
          {Math.round(result.score)} 分
        </div>
      </div>

      {/* 詳細分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 技能分析 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">📊 技能分析</h3>
          <div className="space-y-3">
            {Object.entries(result.qualityScore.dimensions).map(([skill, score]) => (
              <div key={skill}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">
                    {skill === 'clarity' ? '清晰度' :
                     skill === 'detail' ? '細節豐富度' :
                     skill === 'emotion' ? '情感表達' :
                     skill === 'visual' ? '視覺描述' :
                     skill === 'structure' ? '結構完整性' : skill}
                  </span>
                  <span className={`text-sm font-medium ${getScoreColor(score as number)}`}>
                    {Math.round(score as number)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (score as number) >= 80 ? 'bg-green-500' :
                      (score as number) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI 建議 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">🤖 AI 建議</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">👏 做得很好：</h4>
              <p className="text-sm text-gray-600">
                {result.coachingAdvice.encouragement}
              </p>
            </div>
            
            {result.coachingAdvice.improvements.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2">💡 改進建議：</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {result.coachingAdvice.improvements.slice(0, 3).map((improvement: string, index: number) => (
                    <li key={index}>• {improvement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 進度展示 */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-blue-800 mb-4">🎯 學習進度</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {result.templateProgress.completedStages}
            </div>
            <div className="text-sm text-blue-700">已完成階段</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {result.templateProgress.totalStages}
            </div>
            <div className="text-sm text-blue-700">總階段數</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((result.templateProgress.completedStages / result.templateProgress.totalStages) * 100)}%
            </div>
            <div className="text-sm text-blue-700">完成進度</div>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex gap-4 justify-center">
        {!result.passed && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
          >
            🔄 再試一次
          </button>
        )}
        
        {result.nextStage && (
          <button
            onClick={onNext}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            ➡️ 下一階段
          </button>
        )}

        {result.isTemplateCompleted && (
          <button
            onClick={onNext}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
          >
            🎉 完成模板
          </button>
        )}
      </div>
    </div>
  );
}

export default function TemplateExperiencePage() {
  const [templateSystem] = useState(() => new TemplatePromptSystem());
  const [currentView, setCurrentView] = useState<'selector' | 'stage' | 'result' | 'completed'>('selector');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');
  const [instance, setInstance] = useState<TemplateInstance | null>(null);
  const [currentStage, setCurrentStage] = useState<TemplateStage | null>(null);
  const [stageResult, setStageResult] = useState<StageExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const mockUserId = 'template-exp-user';

  const handleTemplateSelect = async (templateId: string, templateName: string) => {
    setLoading(true);
    try {
      setSelectedTemplate(templateId);
      setSelectedTemplateName(templateName);
      
      // 創建模板實例
      const newInstance = await templateSystem.createTemplateInstance(templateId, mockUserId);
      setInstance(newInstance);
      
      // 設置第一個階段
      const firstStage = newInstance.stages[0];
      setCurrentStage(firstStage);
      
      setCurrentView('stage');
    } catch (error) {
      console.error('Failed to create template instance:', error);
      alert('創建模板實例失敗，請重試');
    }
    setLoading(false);
  };

  const handleStageComplete = async (input: string, timeSpent: number) => {
    if (!instance || !currentStage) return;

    setLoading(true);
    try {
      const result = await templateSystem.executeStage(
        instance.id,
        currentStage.id,
        input,
        timeSpent
      );
      
      setStageResult(result);
      setCurrentView('result');
    } catch (error) {
      console.error('Failed to execute stage:', error);
      alert('提交失敗，請重試');
    }
    setLoading(false);
  };

  const handleNext = async () => {
    if (!stageResult || !instance) return;

    if (stageResult.isTemplateCompleted) {
      setCurrentView('completed');
      return;
    }

    if (stageResult.nextStage) {
      const nextStage = instance.stages.find(s => s.id === stageResult.nextStage);
      if (nextStage) {
        setCurrentStage(nextStage);
        setCurrentView('stage');
        setStageResult(null);
      }
    }
  };

  const handleRetry = () => {
    setCurrentView('stage');
    setStageResult(null);
  };

  const handleBackToSelector = () => {
    setCurrentView('selector');
    setInstance(null);
    setCurrentStage(null);
    setStageResult(null);
    setSelectedTemplate('');
    setSelectedTemplateName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 頭部導航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">
              🎨 AI 親子創作坊
            </h1>
            {currentView !== 'selector' && (
              <button
                onClick={handleBackToSelector}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← 返回模板選擇
              </button>
            )}
          </div>
          {selectedTemplateName && (
            <div className="mt-2 text-sm text-gray-600">
              當前模板：{selectedTemplateName}
            </div>
          )}
        </div>
      </div>

      {/* 主要內容 */}
      <div className="py-8">
        {currentView === 'selector' && (
          <TemplateSelector
            userId={mockUserId}
            onTemplateSelect={handleTemplateSelect}
            showRecommendations={true}
          />
        )}

        {currentView === 'stage' && currentStage && instance && (
          <StageDisplay
            stage={currentStage}
            instance={instance}
            onComplete={handleStageComplete}
            loading={loading}
          />
        )}

        {currentView === 'result' && stageResult && (
          <ResultDisplay
            result={stageResult}
            onNext={handleNext}
            onRetry={handleRetry}
          />
        )}

        {currentView === 'completed' && (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              恭喜完成模板！
            </h2>
            <p className="text-gray-600 mb-8">
              你已經完成了「{selectedTemplateName}」模板的所有階段，
              Prompt Engineering 技能得到了很大提升！
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleBackToSelector}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                選擇其他模板
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                重新開始
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

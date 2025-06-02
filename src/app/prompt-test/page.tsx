'use client';

import React, { useState, useEffect } from 'react';
import { PromptEngineeringEngine } from '../../lib/prompt-engineering-engine';
import {
  PromptQualityDisplay,
  OptimizationSuggestions,
  LearningProgressDisplay,
  PromptEvolutionDisplay
} from '../../components/prompt-ui/PromptLearningComponents';
import {
  PromptEngineeringConfig,
  PromptQualityScore,
  PromptOptimizationSuggestion,
  RealTimeAnalysisResult,
  LearningProgress
} from '../../lib/types/prompt-engineering';

export default function PromptEngineeringTestPage() {
  const [prompt, setPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState<RealTimeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [engine, setEngine] = useState<PromptEngineeringEngine | null>(null);
  const [evolutionHistory, setEvolutionHistory] = useState<Array<{
    original: string;
    optimized: string;
    improvement: number;
  }>>([]);
  const [learningProgress, setLearningProgress] = useState<LearningProgress | null>(null);

  // 初始化引擎
  useEffect(() => {
    const config: PromptEngineeringConfig = {
      analysisModel: 'gemini-2.0-flash-exp',
      optimizationMode: 'balanced',
      targetAudience: 'family',
      domainFocus: 'video_creation',
      enableRealTimeAnalysis: true,
      maxSuggestions: 5,
      confidenceThreshold: 0.7
    };

    const promptEngine = new PromptEngineeringEngine(config);
    
    // 監聽事件
    promptEngine.on('promptEngineering', (event) => {
      console.log('Prompt Engineering Event:', event);
    });

    setEngine(promptEngine);

    // 初始化學習進度
    setLearningProgress({
      userId: 'test_user',
      skillLevels: {
        clarity: 45,
        creativity: 50,
        detail: 40,
        emotion: 35,
        structure: 55
      },
      totalPrompts: 12,
      totalOptimizations: 8,
      averageImprovement: 25.5,
      badges: [],
      currentStreak: 3,
      lastActiveDate: Date.now()
    });
  }, []);

  // 分析Prompt
  const analyzePrompt = async () => {
    if (!engine || !prompt.trim()) {
      alert('請輸入要分析的描述');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await engine.performRealTimeAnalysis(prompt);
      setAnalysisResult(result);
      
      // 更新學習進度
      if (learningProgress) {
        const newProgress = { ...learningProgress };
        newProgress.totalPrompts++;
        
        // 模擬技能提升
        Object.keys(newProgress.skillLevels).forEach(skill => {
          const currentLevel = newProgress.skillLevels[skill as keyof typeof newProgress.skillLevels];
          const dimensionScore = result.qualityScore.dimensions[skill as keyof typeof result.qualityScore.dimensions];
          if (dimensionScore) {
            newProgress.skillLevels[skill as keyof typeof newProgress.skillLevels] = 
              Math.round(currentLevel * 0.9 + dimensionScore * 0.1);
          }
        });
        
        setLearningProgress(newProgress);
      }
      
    } catch (error) {
      console.error('分析失敗:', error);
      alert('分析失敗，請稍後再試');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 套用建議
  const applySuggestion = (suggestion: PromptOptimizationSuggestion) => {
    const originalPrompt = prompt;
    let optimizedPrompt = prompt;

    // 模擬套用建議的邏輯
    switch (suggestion.type) {
      case 'add':
        optimizedPrompt = `${prompt} ${suggestion.suggestedText}`;
        break;
      case 'modify':
        // 簡單的詞語替換邏輯
        optimizedPrompt = prompt + ` (${suggestion.suggestedText})`;
        break;
      default:
        optimizedPrompt = `${prompt} (已改善：${suggestion.suggestedText})`;
    }

    setPrompt(optimizedPrompt);
    
    // 記錄演進
    const newEvolution = {
      original: originalPrompt,
      optimized: optimizedPrompt,
      improvement: Math.random() * 20 + 10 // 模擬改善幅度
    };
    
    setEvolutionHistory(prev => [newEvolution, ...prev.slice(0, 4)]);
    
    // 更新學習進度
    if (learningProgress) {
      const newProgress = { ...learningProgress };
      newProgress.totalOptimizations++;
      newProgress.averageImprovement = 
        (newProgress.averageImprovement + newEvolution.improvement) / 2;
      setLearningProgress(newProgress);
    }
  };

  // 範例Prompt
  const examplePrompts = [
    {
      title: '基礎級',
      prompt: '小朋友在玩',
      description: '簡單描述，適合測試基本功能'
    },
    {
      title: '進階級',
      prompt: '可愛的小女孩在公園裡開心地玩盪秋千',
      description: '中等複雜度，包含基本細節'
    },
    {
      title: '高級級',
      prompt: '一個穿著粉紅色洋裝的可愛小女孩，在陽光明媚的綠色公園裡，和小狗一起開心地玩著五彩繽紛的氣球',
      description: '豐富描述，包含多種細節元素'
    }
  ];

  const useExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <h1 className="text-2xl font-bold">Prompt Engineering 教學引擎</h1>
            <p className="text-purple-100 mt-2">階段2：AI驅動的Prompt教學與優化系統</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：輸入和控制 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt 輸入區 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">描述你的想法</h2>
              
              <div className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="在這裡描述你想要創造的畫面..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={analyzePrompt}
                    disabled={isAnalyzing || !prompt.trim()}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        分析中...
                      </>
                    ) : (
                      '🔍 分析Prompt'
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setPrompt('');
                      setAnalysisResult(null);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600"
                  >
                    清除
                  </button>
                </div>
              </div>

              {/* 範例Prompt */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-3">範例描述：</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {examplePrompts.map((example, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => useExamplePrompt(example.prompt)}
                    >
                      <div className="font-medium text-sm text-purple-600 mb-1">
                        {example.title}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {example.description}
                      </div>
                      <div className="text-sm text-gray-800 line-clamp-2">
                        "{example.prompt}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 分析結果 */}
            {analysisResult && (
              <PromptQualityDisplay 
                qualityScore={analysisResult.qualityScore}
              />
            )}

            {/* 優化建議 */}
            {analysisResult && analysisResult.suggestions.length > 0 && (
              <OptimizationSuggestions
                suggestions={analysisResult.suggestions}
                onApplySuggestion={applySuggestion}
              />
            )}

            {/* Prompt演進歷史 */}
            {evolutionHistory.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Prompt 演進歷史</h2>
                {evolutionHistory.map((evolution, index) => (
                  <PromptEvolutionDisplay
                    key={index}
                    originalPrompt={evolution.original}
                    optimizedPrompt={evolution.optimized}
                    qualityImprovement={evolution.improvement}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 右側：學習進度和家長指導 */}
          <div className="space-y-6">
            {/* 學習進度 */}
            {learningProgress && (
              <LearningProgressDisplay progress={learningProgress} />
            )}

            {/* 家長指導 */}
            {analysisResult && analysisResult.parentGuidance && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">👨‍👩‍👧‍👦</span>
                  家長小幫手
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">建議提問</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      {analysisResult.parentGuidance.suggestedQuestions.map((question, index) => (
                        <li key={index}>• {question}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">鼓勵技巧</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      {analysisResult.parentGuidance.encouragementTips.map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">下一步建議</h4>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      {analysisResult.parentGuidance.nextSteps.map((step, index) => (
                        <li key={index}>• {step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 統計資訊 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                今日統計
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">分析次數</span>
                  <span className="font-medium text-purple-600">
                    {engine?.analysisCount || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">平均評分</span>
                  <span className="font-medium text-purple-600">
                    {engine?.averageQualityScore.toFixed(1) || '0.0'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">優化次數</span>
                  <span className="font-medium text-purple-600">
                    {evolutionHistory.length}
                  </span>
                </div>
              </div>
            </div>

            {/* 使用說明 */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">使用技巧</h3>
              <ul className="text-purple-700 text-sm space-y-1">
                <li>• 先選擇範例描述來體驗功能</li>
                <li>• 點擊「分析Prompt」查看詳細評分</li>
                <li>• 套用AI建議來改善描述</li>
                <li>• 觀察演進歷史學習進步過程</li>
                <li>• 參考家長指導進行親子互動</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
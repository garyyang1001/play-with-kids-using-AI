'use client';

/**
 * 模板系統測試頁面
 * 階段3：模板系統架構 - 測試介面
 */

import React, { useState, useEffect } from 'react';
import { TemplatePromptSystem } from '@/lib/template-prompt-system';
import { LearningProgressTracker } from '@/lib/learning-progress-tracker';
import { AdaptiveGuidanceEngine } from '@/lib/adaptive-guidance-engine';
import { 
  TemplateMetadata, 
  UserLevel, 
  TemplateInstance,
  SessionContext,
  LearningProgress 
} from '@/types/template';

export default function TemplateTestPage() {
  const [templateSystem] = useState(() => new TemplatePromptSystem());
  const [progressTracker] = useState(() => new LearningProgressTracker());
  const [adaptiveEngine] = useState(() => new AdaptiveGuidanceEngine());
  
  const [availableTemplates, setAvailableTemplates] = useState<TemplateMetadata[]>([]);
  const [currentInstance, setCurrentInstance] = useState<TemplateInstance | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const mockUserId = 'test-user-123';

  useEffect(() => {
    initializeTest();
  }, []);

  const initializeTest = async () => {
    setLoading(true);
    try {
      // 初始化模擬用戶資料
      await createMockUserData();
      
      // 獲取用戶水平
      const level = await progressTracker.getUserLevel(mockUserId);
      setUserLevel(level);
      
      // 獲取可用模板
      const templates = await templateSystem.getAvailableTemplates(level);
      setAvailableTemplates(templates);
      
      addTestResult('✅ 系統初始化完成', {
        userLevel: level,
        availableTemplates: templates.length
      });
    } catch (error) {
      addTestResult('❌ 系統初始化失敗', { error: error.message });
    }
    setLoading(false);
  };

  const createMockUserData = async () => {
    // 模擬學習會話和嘗試記錄
    const mockAttempts = [
      {
        id: 'attempt1',
        stageId: 'stage1',
        timestamp: new Date(Date.now() - 3600000), // 1小時前
        prompt: '小朋友在公園玩',
        score: 65,
        dimensions: { clarity: 70, detail: 60, emotion: 50, visual: 75, structure: 60 },
        improvements: ['增加更多感官描述'],
        timeSpent: 120,
        completed: true
      },
      {
        id: 'attempt2',
        stageId: 'stage1',
        timestamp: new Date(Date.now() - 1800000), // 30分鐘前
        prompt: '可愛的小朋友在綠色的公園裡開心地盪秋千',
        score: 78,
        dimensions: { clarity: 80, detail: 75, emotion: 70, visual: 85, structure: 75 },
        improvements: ['很好的改進！'],
        timeSpent: 90,
        completed: true
      }
    ];

    // 模擬進度追蹤
    const progress = await progressTracker.startLearningSession(
      mockUserId, 
      'daily-life-template', 
      'stage1'
    );

    // 記錄模擬嘗試
    for (const attempt of mockAttempts) {
      await progressTracker.recordAttempt(
        mockUserId,
        'daily-life-template',
        attempt.stageId,
        attempt.prompt,
        {
          overall: attempt.score,
          dimensions: attempt.dimensions,
          improvementAreas: attempt.improvements,
          suggestions: []
        },
        attempt.timeSpent
      );
    }
  };

  const testTemplateCreation = async () => {
    setLoading(true);
    try {
      // 創建模板實例
      const instance = await templateSystem.createTemplateInstance(
        'daily-life-template',
        mockUserId
      );
      
      setCurrentInstance(instance);
      addTestResult('✅ 模板實例創建成功', {
        instanceId: instance.id,
        templateName: instance.metadata.name,
        stagesCount: instance.stages.length
      });
    } catch (error) {
      addTestResult('❌ 模板實例創建失敗', { error: error.message });
    }
    setLoading(false);
  };

  const testStageExecution = async () => {
    if (!currentInstance) {
      addTestResult('❌ 請先創建模板實例', {});
      return;
    }

    setLoading(true);
    try {
      const testInput = '小朋友在明亮的教室裡認真地寫作業，桌上有彩色的鉛筆和書本';
      
      const result = await templateSystem.executeStage(
        currentInstance.id,
        currentInstance.stages[0].id,
        testInput,
        150 // 2.5分鐘
      );

      addTestResult('✅ 階段執行成功', {
        passed: result.passed,
        score: result.score,
        nextStage: result.nextStage,
        coachingAdvice: result.coachingAdvice?.improvements?.slice(0, 2)
      });
    } catch (error) {
      addTestResult('❌ 階段執行失敗', { error: error.message });
    }
    setLoading(false);
  };

  const testAdaptiveGuidance = async () => {
    if (!userLevel) return;

    setLoading(true);
    try {
      const mockContext: SessionContext = {
        timeOfDay: 'afternoon',
        sessionLength: 'medium',
        energyLevel: 'medium',
        previousPerformance: 75,
        parentPresence: true
      };

      const guidance = await adaptiveEngine.generateAdaptiveGuidance(
        mockUserId,
        mockContext,
        userLevel,
        []
      );

      addTestResult('✅ 適應性指導生成成功', {
        adaptedLevel: guidance.user.overall,
        preferences: guidance.preferences,
        sessionContext: guidance.session.energyLevel
      });
    } catch (error) {
      addTestResult('❌ 適應性指導失敗', { error: error.message });
    }
    setLoading(false);
  };

  const testProgressAnalysis = async () => {
    setLoading(true);
    try {
      const report = await progressTracker.generateLearningReport(mockUserId);
      const achievements = await progressTracker.getUserAchievements(mockUserId);

      addTestResult('✅ 進度分析完成', {
        totalAttempts: report.summary.totalAttempts,
        averageScore: Math.round(report.summary.averageScore),
        achievements: achievements.length,
        recommendations: report.recommendations.slice(0, 2)
      });
    } catch (error) {
      addTestResult('❌ 進度分析失敗', { error: error.message });
    }
    setLoading(false);
  };

  const addTestResult = (message: string, data: any) => {
    const result = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      data
    };
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // 保持最近10條記錄
  };

  const runAllTests = async () => {
    await initializeTest();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testTemplateCreation();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testStageExecution();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testAdaptiveGuidance();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testProgressAnalysis();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🧪 模板系統測試中心
          </h1>
          <p className="text-gray-600">
            階段3：模板系統架構 - 功能驗證與測試
          </p>
        </div>

        {/* 系統狀態 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-2">📊 用戶水平</h3>
            {userLevel ? (
              <div className="space-y-1 text-sm">
                <div>整體: {Math.round(userLevel.overall)}/100</div>
                <div>信心: {Math.round(userLevel.confidence)}/100</div>
                <div>參與度: {Math.round(userLevel.engagement)}/100</div>
                <div>學習風格: {userLevel.learningStyle}</div>
              </div>
            ) : (
              <div className="text-gray-500">尚未初始化</div>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-2">📚 可用模板</h3>
            <div className="text-sm">
              <div>總數: {availableTemplates.length}</div>
              {availableTemplates.slice(0, 2).map(template => (
                <div key={template.id} className="text-gray-600">
                  • {template.name} ({template.level})
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-2">🎯 當前實例</h3>
            {currentInstance ? (
              <div className="text-sm">
                <div>ID: {currentInstance.id.slice(-8)}</div>
                <div>模板: {currentInstance.metadata.name}</div>
                <div>階段: {currentInstance.progress.currentStage}</div>
                <div>完成: {currentInstance.progress.completedStages.length}</div>
              </div>
            ) : (
              <div className="text-gray-500">尚未創建</div>
            )}
          </div>
        </div>

        {/* 測試按鈕 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
          <h2 className="text-xl font-semibold mb-4">🔧 測試功能</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={initializeTest}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              初始化系統
            </button>
            <button
              onClick={testTemplateCreation}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              創建模板實例
            </button>
            <button
              onClick={testStageExecution}
              disabled={loading}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              執行階段測試
            </button>
            <button
              onClick={testAdaptiveGuidance}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              適應性指導
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              onClick={testProgressAnalysis}
              disabled={loading}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              進度分析
            </button>
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              🚀 執行全部測試
            </button>
          </div>
        </div>

        {/* 測試結果 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">📋 測試結果</h2>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">執行測試中...</span>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="border-l-4 border-blue-400 pl-4 py-2 bg-gray-50 rounded-r">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.message}</span>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>
                {Object.keys(result.data).length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {testResults.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              尚無測試結果。點擊上方按鈕開始測試。
            </div>
          )}
        </div>

        {/* 系統資訊 */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">📖 系統架構說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium mb-2">🏗️ 核心組件</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• TemplatePromptSystem - 模板管理系統</li>
                <li>• LearningProgressTracker - 學習進度追蹤</li>
                <li>• AdaptiveGuidanceEngine - 適應性指導引擎</li>
                <li>• Template Types - 完整類型定義</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">🎯 驗收標準</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• ✅ 支援動態模板載入</li>
                <li>• ✅ 學習進度精確追蹤</li>
                <li>• ✅ 模板間無縫切換</li>
                <li>• ✅ 支援個人化難度調整</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

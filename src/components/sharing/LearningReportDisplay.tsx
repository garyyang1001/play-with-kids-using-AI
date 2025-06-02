'use client';

import React, { useState, useEffect } from 'react';
import { LearningReportGenerator, LearningReport, LearningSessionData } from '@/lib/learning-report-generator';

interface LearningReportDisplayProps {
  userId: string;
  timeRange?: { start: Date; end: Date };
  onDownloadPDF?: () => void;
}

export default function LearningReportDisplay({ userId, timeRange, onDownloadPDF }: LearningReportDisplayProps) {
  const [report, setReport] = useState<LearningReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    generateReport();
  }, [userId, selectedPeriod]);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const generator = new LearningReportGenerator(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '');
      
      // 模擬添加一些學習數據（實際應用中從數據庫獲取）
      const mockSessions: LearningSessionData[] = [
        {
          sessionId: '1',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          templateName: 'daily-life',
          childAge: 8,
          duration: 15,
          promptEvolutions: [{
            original: '小朋友刷牙',
            improved: '可愛的小朋友在明亮的浴室裡，用藍色小牙刷開心地刷牙',
            improvementAreas: ['色彩描述', '場景設定'],
            qualityScore: { before: 20, after: 85, improvement: 4.25 }
          }],
          skillsProgress: {
            '色彩描述': { before: 30, after: 75, improvement: 45 },
            '場景設定': { before: 25, after: 70, improvement: 45 },
            '情感表達': { before: 40, after: 65, improvement: 25 }
          },
          achievements: ['色彩描述新手', '場景設定入門']
        },
        {
          sessionId: '2',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          templateName: 'adventure',
          childAge: 8,
          duration: 18,
          promptEvolutions: [{
            original: '超級英雄',
            improved: '身穿紅色斗篷的勇敢小超級英雄，在藍天中飛翔，用愛心光線拯救小朋友',
            improvementAreas: ['情感表達', '動作描述'],
            qualityScore: { before: 15, after: 90, improvement: 6.0 }
          }],
          skillsProgress: {
            '色彩描述': { before: 75, after: 85, improvement: 10 },
            '情感表達': { before: 65, after: 85, improvement: 20 },
            '動作描述': { before: 20, after: 80, improvement: 60 }
          },
          achievements: ['情感表達進階', '動作描述新手']
        }
      ];

      // 添加模擬數據
      mockSessions.forEach(session => generator.addSession(session));
      
      // 計算時間範圍
      let calculatedTimeRange = timeRange;
      if (!calculatedTimeRange) {
        const now = new Date();
        switch (selectedPeriod) {
          case 'week':
            calculatedTimeRange = {
              start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
              end: now
            };
            break;
          case 'month':
            calculatedTimeRange = {
              start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              end: now
            };
            break;
          default:
            calculatedTimeRange = undefined;
        }
      }

      const generatedReport = await generator.generateReport(userId, calculatedTimeRange);
      setReport(generatedReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成報告時發生錯誤');
    }
    
    setLoading(false);
  };

  const getSkillColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'improving': return '📈';
      case 'stable': return '➡️';
      case 'needs_attention': return '📉';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-600">正在生成學習報告...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">❌ {error}</div>
        <button 
          onClick={generateReport}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          重新生成報告
        </button>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-12 text-gray-500">沒有找到學習資料</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 標題和控制面板 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-4">📊 個人化學習成果報告</h1>
        
        <div className="flex justify-center space-x-4 mb-4">
          {[
            { key: 'all', label: '全部時間' },
            { key: 'month', label: '近一個月' },
            { key: 'week', label: '近一週' }
          ].map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as any)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedPeriod === period.key
                  ? 'bg-white text-purple-600 font-bold'
                  : 'bg-purple-500 bg-opacity-50 hover:bg-opacity-75'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className="text-purple-100">生成日期：{new Date().toLocaleDateString('zh-TW')}</p>
        </div>
      </div>

      {/* 學習概況 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
          📈 學習概況
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{report.summary.totalSessions}</div>
            <div className="text-sm text-gray-600">學習次數</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{report.summary.totalDuration}</div>
            <div className="text-sm text-gray-600">總時長(分)</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{report.summary.averageImprovement.toFixed(1)}x</div>
            <div className="text-sm text-gray-600">平均提升</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{report.summary.skillsMastered.length}</div>
            <div className="text-sm text-gray-600">掌握技能</div>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <div className="text-lg font-bold text-pink-600">{report.summary.favoriteTemplate}</div>
            <div className="text-sm text-gray-600">最愛模板</div>
          </div>
        </div>

        {report.summary.skillsMastered.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">🎯 已掌握技能</h3>
            <div className="flex flex-wrap gap-2">
              {report.summary.skillsMastered.map(skill => (
                <span key={skill} className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 技能進步分析 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
          🎨 技能進步分析
        </h2>

        <div className="space-y-4">
          {Object.entries(report.progressAnalysis.skillTrends).map(([skill, data]: [string, any]) => (
            <div key={skill} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">{skill}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getTrendIcon(data.trend)}</span>
                  <span className="text-sm text-gray-500">平均 {data.averageScore.toFixed(0)} 分</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${getSkillColor(data.averageScore)}`}
                  style={{ width: `${Math.min(data.averageScore, 100)}%` }}
                ></div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                趨勢：{data.trend === 'improving' ? '持續進步' : data.trend === 'stable' ? '穩定發展' : '需要關注'}
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">💪 優勢領域</h3>
            <ul className="space-y-1">
              {report.progressAnalysis.strengthAreas.map(area => (
                <li key={area} className="text-green-700 flex items-center">
                  <span className="mr-2">✅</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">🎯 待加強領域</h3>
            <ul className="space-y-1">
              {report.progressAnalysis.improvementAreas.map(area => (
                <li key={area} className="text-yellow-700 flex items-center">
                  <span className="mr-2">🔄</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 親子互動洞察 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
          👨‍👩‍👧‍👦 親子互動洞察
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { key: 'engagement', label: '參與度', value: report.parentInsights.engagement, color: 'blue' },
            { key: 'creativity', label: '創意度', value: report.parentInsights.creativity, color: 'purple' },
            { key: 'confidence', label: '自信度', value: report.parentInsights.confidence, color: 'green' },
            { key: 'collaborationQuality', label: '協作品質', value: report.parentInsights.collaborationQuality, color: 'orange' }
          ].map(insight => (
            <div key={insight.key} className="text-center">
              <div className={`w-20 h-20 mx-auto mb-2 rounded-full border-4 border-${insight.color}-200 relative`}>
                <div 
                  className={`absolute inset-1 rounded-full bg-${insight.color}-500 opacity-80`}
                  style={{ 
                    background: `conic-gradient(from 0deg, rgb(59, 130, 246) ${insight.value * 3.6}deg, rgb(229, 231, 235) ${insight.value * 3.6}deg)` 
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-700">{insight.value}</span>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">{insight.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI專家洞察 */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
          🤖 AI 專家洞察
        </h2>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-gray-700 leading-relaxed">{report.aiGeneratedInsights}</p>
        </div>
      </div>

      {/* 學習建議 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
          💡 個人化學習建議
        </h2>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 下一步行動</h3>
            <ul className="space-y-2">
              {report.recommendations.nextSteps.map((step, index) => (
                <li key={index} className="text-blue-700 flex items-start">
                  <span className="mr-2 mt-1">📌</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">📈 適合挑戰等級</h3>
              <div className="text-green-700 text-lg font-medium">
                {report.recommendations.challengeLevel === 'beginner' && '🌱 初學者'}
                {report.recommendations.challengeLevel === 'intermediate' && '🌿 進階者'}
                {report.recommendations.challengeLevel === 'advanced' && '🌳 高級者'}
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">🎨 推薦模板</h3>
              <div className="flex flex-wrap gap-2">
                {report.recommendations.suggestedTemplates.map(template => (
                  <span key={template} className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm">
                    {template}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onDownloadPDF}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          📄 下載PDF報告
        </button>
        
        <button
          onClick={generateReport}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          🔄 重新生成報告
        </button>
      </div>
    </div>
  );
}
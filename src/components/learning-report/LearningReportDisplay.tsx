/**
 * Learning Report Display
 * 學習報告展示主組件
 */

'use client';

import React, { useState } from 'react';
import { LearningReport } from '../../lib/learning-report-generator';
import { OverallProgressCard } from './OverallProgressCard';
import { SkillBreakdownChart } from './SkillBreakdownChart';
import { TemplateMasteryView } from './TemplateMasteryView';
import { AchievementsGallery } from './AchievementsGallery';
import { ParentInsightsCard } from './ParentInsightsCard';
import { PersonalizedContentCard } from './PersonalizedContentCard';
import { ProgressVisualization } from './ProgressVisualization';

interface LearningReportDisplayProps {
  report: LearningReport;
  userProfile?: {
    childName?: string;
    childAge?: number;
    parentName?: string;
  };
  onExportReport?: () => void;
  onShareReport?: () => void;
}

export const LearningReportDisplay: React.FC<LearningReportDisplayProps> = ({
  report,
  userProfile,
  onExportReport,
  onShareReport
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'templates' | 'achievements' | 'insights'>('overview');
  
  const childName = userProfile?.childName || '小朋友';
  const periodDays = Math.ceil((report.period.endDate.getTime() - report.period.startDate.getTime()) / (1000 * 60 * 60 * 24));

  const tabs = [
    { id: 'overview', label: '總覽', icon: '📊' },
    { id: 'skills', label: '技能分析', icon: '🎯' },
    { id: 'templates', label: '模板熟練度', icon: '📚' },
    { id: 'achievements', label: '成就展示', icon: '🏆' },
    { id: 'insights', label: '家長洞察', icon: '💡' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 報告標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📈 {childName} 的 AI 學習報告
          </h1>
          <p className="text-gray-600 text-lg">
            學習期間：{report.period.startDate.toLocaleDateString('zh-TW')} ~ {report.period.endDate.toLocaleDateString('zh-TW')} ({periodDays}天)
          </p>
          <div className="flex justify-center items-center space-x-4 mt-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              總學習次數：{report.period.totalSessions}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              學習速度：{report.overallProgress.learningVelocity === 'exceptional' ? '超強' : 
                       report.overallProgress.learningVelocity === 'fast' ? '快速' :
                       report.overallProgress.learningVelocity === 'steady' ? '穩定' : '需加油'}
            </span>
          </div>
        </div>

        {/* 標籤導航 */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* 標籤內容 */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <OverallProgressCard 
                  progress={report.overallProgress}
                  period={report.period}
                  childName={childName}
                />
                <ProgressVisualization 
                  visualProgress={report.visualProgress}
                />
                <PersonalizedContentCard 
                  content={report.personalizedContent}
                  childName={childName}
                />
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <SkillBreakdownChart 
                  skillBreakdown={report.skillBreakdown}
                />
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-6">
                <TemplateMasteryView 
                  templateMastery={report.templateMastery}
                />
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <AchievementsGallery 
                  achievements={report.achievements}
                  overallProgress={report.overallProgress}
                />
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-6">
                <ParentInsightsCard 
                  insights={report.parentInsights}
                  childName={childName}
                />
              </div>
            )}
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-8 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            🎬 繼續創作新影片
          </button>
          
          {onShareReport && (
            <button
              onClick={onShareReport}
              className="bg-green-500 text-white py-3 px-8 rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              📱 分享學習成果
            </button>
          )}
          
          {onExportReport && (
            <button
              onClick={onExportReport}
              className="bg-gray-500 text-white py-3 px-8 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
            >
              📄 匯出報告
            </button>
          )}
        </div>

        {/* 報告資訊 */}
        <div className="text-center mt-8 text-sm text-gray-500">
          報告 ID: {report.reportId}<br/>
          生成時間: {new Date().toLocaleDateString('zh-TW')} {new Date().toLocaleTimeString('zh-TW')}
        </div>
      </div>
    </div>
  );
};
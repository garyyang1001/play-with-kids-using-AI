/**
 * Learning Report Page
 * 學習報告主頁面
 */

'use client';

import React, { useState, useEffect } from 'react';
import { LearningReportDisplay } from '../../components/learning-report/LearningReportDisplay';
import { learningReportGenerator, LearningReport, LearningSession } from '../../lib/learning-report-generator';
import { socialPostGenerator } from '../../lib/social-post-generator';
import { SocialSharingInterface } from '../../components/sharing/SocialSharingInterface';

export default function LearningReportPage() {
  const [report, setReport] = useState<LearningReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSocialSharing, setShowSocialSharing] = useState(false);

  // 模擬用戶資料
  const userProfile = {
    childName: '小明',
    childAge: 8,
    parentName: '王媽媽'
  };

  useEffect(() => {
    generateSampleReport();
  }, []);

  const generateSampleReport = async () => {
    try {
      setLoading(true);
      
      // 模擬學習會話數據
      const sampleSessions: LearningSession[] = [
        {
          id: 'session_1',
          userId: 'user_123',
          templateType: 'daily-life',
          startTime: new Date('2025-05-25'),
          endTime: new Date('2025-05-25'),
          originalPrompt: '小朋友刷牙',
          optimizedPrompt: '可愛的小朋友在明亮的浴室裡，用藍色小牙刷開心地刷牙，白色泡沫冒出來',
          qualityImprovement: 65,
          skillsLearned: ['clarity', 'detail'],
          achievementsUnlocked: [],
          videoCreated: true
        },
        {
          id: 'session_2',
          userId: 'user_123',
          templateType: 'adventure',
          startTime: new Date('2025-05-27'),
          endTime: new Date('2025-05-27'),
          originalPrompt: '超級英雄飛天',
          optimizedPrompt: '身穿紅色斗篷的勇敢小超級英雄，在蔚藍天空中快樂地飛翔，用愛心光線拯救需要幫助的小朋友',
          qualityImprovement: 78,
          skillsLearned: ['emotion', 'visual'],
          achievementsUnlocked: [],
          videoCreated: true
        },
        {
          id: 'session_3',
          userId: 'user_123',
          templateType: 'animal-friend',
          startTime: new Date('2025-05-30'),
          endTime: new Date('2025-05-30'),
          originalPrompt: '小貓玩球',
          optimizedPrompt: '毛茸茸的橘色小貓咪在陽光灑落的客廳裡，興奮地追逐著彩色毛線球，發出可愛的喵喵聲',
          qualityImprovement: 82,
          skillsLearned: ['visual', 'emotion', 'structure'],
          achievementsUnlocked: [],
          videoCreated: true
        }
      ];

      const startDate = new Date('2025-05-20');
      const endDate = new Date('2025-06-02');

      const generatedReport = await learningReportGenerator.generateLearningReport(
        'user_123',
        sampleSessions,
        startDate,
        endDate,
        userProfile
      );

      setReport(generatedReport);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成學習報告失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!report) return;
    
    // 模擬報告導出
    const reportData = {
      reportId: report.reportId,
      childName: userProfile.childName,
      period: report.period,
      overallProgress: report.overallProgress,
      summary: `${userProfile.childName}在${Math.ceil((report.period.endDate.getTime() - report.period.startDate.getTime()) / (1000 * 60 * 60 * 24))}天內完成了${report.period.totalSessions}次AI創作學習，Prompt品質平均提升${report.overallProgress.promptQualityGrowth}%，掌握了${report.overallProgress.skillsAcquired.length}項AI溝通技能。`
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${userProfile.childName}_AI學習報告_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    alert('📄 學習報告已導出！');
  };

  const handleShareReport = () => {
    setShowSocialSharing(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">正在生成學習報告</h2>
          <p className="text-gray-600">分析學習數據，生成個人化報告...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">報告生成失敗</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={generateSampleReport}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            重新生成報告
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">暫無學習數據</h2>
          <p className="text-gray-600 mb-6">
            開始創作AI影片後，這裡將顯示詳細的學習進步報告。
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            開始創作
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <LearningReportDisplay
        report={report}
        userProfile={userProfile}
        onExportReport={handleExportReport}
        onShareReport={handleShareReport}
      />

      {/* 社群分享介面 */}
      {showSocialSharing && (
        <SocialSharingInterface
          videoResult={{
            id: 'sample_video',
            success: true,
            videoUrl: '/sample-video.mp4',
            thumbnailUrl: '/sample-thumbnail.jpg',
            metadata: {
              prompt: '學習報告分享',
              duration: 5,
              aspectRatio: '9:16',
              qualityScore: 4.5
            },
            generationTime: 120000
          }}
          optimizedPrompt={null}
          userContext={userProfile}
          onClose={() => setShowSocialSharing(false)}
        />
      )}
    </>
  );
}
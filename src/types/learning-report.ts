/**
 * 擴展的學習報告類型定義
 * 用於學習報告展示組件
 */

import { LearningReport as BaseLearningReport } from '../lib/learning-report-generator';

// 擴展的學習報告類型
export interface ExtendedLearningReport extends BaseLearningReport {
  reportId: string;
  period: {
    startDate: Date;
    endDate: Date;
    totalSessions: number;
  };
  overallProgress: {
    promptQualityGrowth: number;
    creativityScore: number;
    learningVelocity: 'slow' | 'steady' | 'fast' | 'exceptional';
    skillsAcquired: string[];
  };
  skillBreakdown: {
    [skillName: string]: {
      currentLevel: number;
      growth: number;
      practiceCount: number;
      lastPracticed: Date;
    };
  };
  templateMastery: {
    [templateName: string]: {
      completionRate: number;
      averageQuality: number;
      sessionsCount: number;
      lastUsed: Date;
    };
  };
  achievements: {
    earned: Array<{
      id: string;
      name: string;
      description: string;
      earnedDate: Date;
      type: 'milestone' | 'skill' | 'persistence' | 'creativity';
    }>;
    suggestions: string[];
  };
  visualProgress: {
    timeline: Array<{
      date: Date;
      score: number;
      sessionCount: number;
    }>;
    skillRadar: {
      [skillName: string]: number;
    };
  };
  personalizedContent: {
    encouragements: string[];
    tips: string[];
    challenges: string[];
  };
}

// 重新導出基礎類型
export type { LearningReport } from '../lib/learning-report-generator';

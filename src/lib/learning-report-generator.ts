/**
 * Learning Report Generator
 * 學習報告生成器
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Achievement } from './achievement-system';
import { LearningProgress } from './learning-progress-tracker';
import { OptimizedVideoPrompt } from './video-prompt-optimizer';

export interface LearningSession {
  id: string;
  userId: string;
  templateType: 'daily-life' | 'adventure' | 'animal-friend';
  startTime: Date;
  endTime: Date;
  originalPrompt: string;
  optimizedPrompt: string;
  qualityImprovement: number;
  skillsLearned: string[];
  achievementsUnlocked: Achievement[];
  videoCreated: boolean;
}

export interface LearningReport {
  reportId: string;
  userId: string;
  period: {
    startDate: Date;
    endDate: Date;
    totalSessions: number;
  };
  overallProgress: {
    promptQualityGrowth: number;
    skillsAcquired: string[];
    totalAchievements: number;
    creativityScore: number;
    learningVelocity: 'slow' | 'steady' | 'fast' | 'exceptional';
  };
  skillBreakdown: {
    clarity: SkillProgress;
    detail: SkillProgress;
    emotion: SkillProgress;
    visual: SkillProgress;
    structure: SkillProgress;
  };
  templateMastery: {
    dailyLife: MasteryLevel;
    adventure: MasteryLevel;
    animalFriend: MasteryLevel;
  };
  achievements: {
    recent: Achievement[];
    milestones: Achievement[];
    suggestions: string[];
  };
  parentInsights: {
    strengths: string[];
    areasForGrowth: string[];
    recommendations: string[];
    nextSteps: string[];
  };
  visualProgress: {
    qualityTrendData: { date: string; score: number }[];
    skillRadarData: { skill: string; value: number }[];
    sessionActivityData: { date: string; sessions: number }[];
  };
  personalizedContent: {
    celebrationMessage: string;
    encouragementNote: string;
    nextLearningGoals: string[];
    recommendedTemplates: string[];
  };
}

export interface SkillProgress {
  currentLevel: number; // 0-100
  growthRate: number; // percentage
  sessions: number;
  lastImprovement: Date;
  trend: 'improving' | 'stable' | 'declining';
}

export interface MasteryLevel {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number; // 0-100 within level
  sessionsCompleted: number;
  averageQuality: number;
  strengths: string[];
  nextMilestones: string[];
}

export class LearningReportGenerator {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Google AI API Key 未設定');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * 生成完整學習報告
   */
  async generateLearningReport(
    userId: string,
    sessions: LearningSession[],
    startDate: Date,
    endDate: Date,
    userProfile?: {
      childName?: string;
      childAge?: number;
      parentName?: string;
      learningPreferences?: string[];
    }
  ): Promise<LearningReport> {
    if (sessions.length === 0) {
      return this.generateEmptyReport(userId, startDate, endDate);
    }

    const overallProgress = this.calculateOverallProgress(sessions);
    const skillBreakdown = this.analyzeSkillBreakdown(sessions);
    const templateMastery = this.assessTemplateMastery(sessions);
    const achievements = this.collectAchievements(sessions);
    const visualProgress = this.generateVisualProgress(sessions);
    
    const parentInsights = await this.generateParentInsights(
      sessions, 
      overallProgress, 
      skillBreakdown,
      userProfile
    );
    
    const personalizedContent = await this.generatePersonalizedContent(
      sessions,
      overallProgress,
      templateMastery,
      userProfile
    );

    return {
      reportId: `report_${userId}_${Date.now()}`,
      userId,
      period: {
        startDate,
        endDate,
        totalSessions: sessions.length
      },
      overallProgress,
      skillBreakdown,
      templateMastery,
      achievements,
      parentInsights,
      visualProgress,
      personalizedContent
    };
  }

  /**
   * 計算整體進度
   */
  private calculateOverallProgress(sessions: LearningSession[]) {
    const qualityScores = sessions.map(s => s.qualityImprovement);
    const avgQualityGrowth = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
    
    const allSkills = [...new Set(sessions.flatMap(s => s.skillsLearned))];
    const totalAchievements = [...new Set(sessions.flatMap(s => s.achievementsUnlocked.map(a => a.id)))].length;
    
    const creativityScore = this.calculateCreativityScore(sessions);
    const learningVelocity = this.assessLearningVelocity(sessions);

    return {
      promptQualityGrowth: Math.round(avgQualityGrowth),
      skillsAcquired: allSkills,
      totalAchievements,
      creativityScore,
      learningVelocity
    };
  }

  /**
   * 分析技能細分
   */
  private analyzeSkillBreakdown(sessions: LearningSession[]): LearningReport['skillBreakdown'] {
    const skills = ['clarity', 'detail', 'emotion', 'visual', 'structure'] as const;
    const breakdown: any = {};

    skills.forEach(skill => {
      const skillSessions = sessions.filter(s => s.skillsLearned.includes(skill));
      const currentLevel = this.calculateSkillLevel(skill, skillSessions);
      const growthRate = this.calculateGrowthRate(skill, sessions);
      
      breakdown[skill] = {
        currentLevel,
        growthRate,
        sessions: skillSessions.length,
        lastImprovement: skillSessions.length > 0 ? skillSessions[skillSessions.length - 1].endTime : new Date(),
        trend: growthRate > 5 ? 'improving' : growthRate < -5 ? 'declining' : 'stable'
      };
    });

    return breakdown;
  }

  /**
   * 評估模板熟練度
   */
  private assessTemplateMastery(sessions: LearningSession[]): LearningReport['templateMastery'] {
    const templates = ['daily-life', 'adventure', 'animal-friend'] as const;
    const mastery: any = {};

    templates.forEach(template => {
      const templateSessions = sessions.filter(s => s.templateType === template);
      
      if (templateSessions.length === 0) {
        mastery[template === 'daily-life' ? 'dailyLife' : template === 'animal-friend' ? 'animalFriend' : template] = {
          level: 'beginner',
          progress: 0,
          sessionsCompleted: 0,
          averageQuality: 0,
          strengths: [],
          nextMilestones: ['完成第一個創作']
        };
        return;
      }

      const avgQuality = templateSessions.reduce((sum, s) => sum + s.qualityImprovement, 0) / templateSessions.length;
      const level = this.determineMasteryLevel(templateSessions.length, avgQuality);
      const progress = this.calculateMasteryProgress(level, templateSessions.length, avgQuality);
      
      mastery[template === 'daily-life' ? 'dailyLife' : template === 'animal-friend' ? 'animalFriend' : template] = {
        level,
        progress,
        sessionsCompleted: templateSessions.length,
        averageQuality: Math.round(avgQuality),
        strengths: this.identifyTemplateStrengths(template, templateSessions),
        nextMilestones: this.suggestNextMilestones(template, level)
      };
    });

    return mastery;
  }

  /**
   * 收集成就
   */
  private collectAchievements(sessions: LearningSession[]) {
    const allAchievements = sessions.flatMap(s => s.achievementsUnlocked);
    const recent = allAchievements.slice(-5); // 最近5個成就
    const milestones = allAchievements.filter(a => a.type === 'milestone');
    
    return {
      recent,
      milestones,
      suggestions: this.generateAchievementSuggestions(sessions)
    };
  }

  /**
   * 生成視覺化進度數據
   */
  private generateVisualProgress(sessions: LearningSession[]) {
    return {
      qualityTrendData: this.generateQualityTrend(sessions),
      skillRadarData: this.generateSkillRadar(sessions),
      sessionActivityData: this.generateActivityData(sessions)
    };
  }

  /**
   * 生成家長洞察
   */
  private async generateParentInsights(
    sessions: LearningSession[],
    overallProgress: any,
    skillBreakdown: any,
    userProfile?: any
  ) {
    const model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp' 
    });

    const prompt = this.buildParentInsightsPrompt(sessions, overallProgress, skillBreakdown, userProfile);
    
    try {
      const response = await model.generateContent(prompt);
      const insights = this.parseParentInsights(response.response.text());
      return insights;
    } catch (error) {
      console.error('生成家長洞察失敗:', error);
      return this.generateFallbackParentInsights(overallProgress);
    }
  }

  /**
   * 建立家長洞察提示
   */
  private buildParentInsightsPrompt(
    sessions: LearningSession[],
    overallProgress: any,
    skillBreakdown: any,
    userProfile?: any
  ): string {
    const childName = userProfile?.childName || '孩子';
    const childAge = userProfile?.childAge || '學齡';
    
    return `
作為兒童AI教育專家，請分析以下學習數據並提供家長洞察：

## 學習概況
- 總學習次數：${sessions.length}
- 平均品質提升：${overallProgress.promptQualityGrowth}%
- 習得技能：${overallProgress.skillsAcquired.join('、')}
- 創意分數：${overallProgress.creativityScore}/100
- 學習速度：${overallProgress.learningVelocity}

## 技能細分表現
${Object.entries(skillBreakdown).map(([skill, data]: [string, any]) => 
  `- ${skill}：目前水平 ${data.currentLevel}/100，成長率 ${data.growthRate}%`
).join('\n')}

## 孩子背景
- 姓名：${childName}
- 年齡：${childAge}歲

請以以下格式提供分析（使用繁體中文）：

### STRENGTHS
[列出3-5個孩子在AI學習方面的具體優勢]

### AREAS_FOR_GROWTH  
[指出2-3個可以改進的領域，給出具體建議]

### RECOMMENDATIONS
[提供3-4個實用的家長指導建議]

### NEXT_STEPS
[建議接下來的2-3個學習目標]

要求：
1. 語言親切、正面、具體
2. 建議要實用可行
3. 考慮孩子年齡特點
4. 強調AI技能的未來價值
`;
  }

  /**
   * 解析家長洞察
   */
  private parseParentInsights(text: string) {
    const sections = this.extractSections(text);
    
    return {
      strengths: this.parseListItems(sections.STRENGTHS) || [
        '對AI創作表現出濃厚興趣',
        '能夠快速學習新的表達技巧',
        '展現良好的想像力和創意'
      ],
      areasForGrowth: this.parseListItems(sections.AREAS_FOR_GROWTH) || [
        '可以更詳細地描述場景',
        '嘗試表達更豐富的情感'
      ],
      recommendations: this.parseListItems(sections.RECOMMENDATIONS) || [
        '鼓勵孩子多觀察日常生活細節',
        '一起討論故事中的情感表達',
        '讚美孩子的創意想法'
      ],
      nextSteps: this.parseListItems(sections.NEXT_STEPS) || [
        '嘗試更複雜的故事模板',
        '學習更多描述技巧'
      ]
    };
  }

  /**
   * 生成個人化內容
   */
  private async generatePersonalizedContent(
    sessions: LearningSession[],
    overallProgress: any,
    templateMastery: any,
    userProfile?: any
  ) {
    const model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp' 
    });

    const prompt = this.buildPersonalizedContentPrompt(sessions, overallProgress, templateMastery, userProfile);
    
    try {
      const response = await model.generateContent(prompt);
      return this.parsePersonalizedContent(response.response.text());
    } catch (error) {
      console.error('生成個人化內容失敗:', error);
      return this.generateFallbackPersonalizedContent(userProfile);
    }
  }

  /**
   * 建立個人化內容提示
   */
  private buildPersonalizedContentPrompt(
    sessions: LearningSession[],
    overallProgress: any,
    templateMastery: any,
    userProfile?: any
  ): string {
    const childName = userProfile?.childName || '小朋友';
    
    return `
為${childName}生成個人化的學習報告內容：

## 學習成果
- 學習次數：${sessions.length}
- 品質提升：${overallProgress.promptQualityGrowth}%  
- 創意分數：${overallProgress.creativityScore}

## 模板熟練度
${Object.entries(templateMastery).map(([template, data]: [string, any]) => 
  `- ${template}：${data.level}級別，${data.progress}%完成度`
).join('\n')}

請生成以下內容（使用繁體中文）：

### CELEBRATION_MESSAGE
[為孩子的學習成果寫一段溫馨的慶祝訊息，30-50字]

### ENCOURAGEMENT_NOTE
[給孩子的鼓勵話語，激勵繼續學習，20-40字]

### NEXT_LEARNING_GOALS
[建議的下一步學習目標，3-4個具體目標]

### RECOMMENDED_TEMPLATES
[根據目前進度推薦的模板或主題]

要求：
1. 語調溫暖、正面、激勵
2. 適合孩子的年齡和理解能力
3. 具體且可行的建議
`;
  }

  /**
   * 解析個人化內容
   */
  private parsePersonalizedContent(text: string) {
    const sections = this.extractSections(text);
    
    return {
      celebrationMessage: sections.CELEBRATION_MESSAGE || `恭喜你在AI創作方面取得了很棒的進步！`,
      encouragementNote: sections.ENCOURAGEMENT_NOTE || '繼續保持好奇心，你會創作出更精彩的作品！',
      nextLearningGoals: this.parseListItems(sections.NEXT_LEARNING_GOALS) || [
        '嘗試新的故事模板',
        '學習更豐富的描述技巧',
        '創作更長的故事'
      ],
      recommendedTemplates: this.parseListItems(sections.RECOMMENDED_TEMPLATES) || [
        '冒險故事模板',
        '動物朋友模板'
      ]
    };
  }

  /**
   * 工具函數：提取區段
   */
  private extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const sectionPattern = /### (\w+)\s*\n([\s\S]*?)(?=\n### |\n*$)/g;
    
    let match;
    while ((match = sectionPattern.exec(text)) !== null) {
      const [, sectionName, content] = match;
      sections[sectionName] = content.trim();
    }

    return sections;
  }

  /**
   * 工具函數：解析列表項目
   */
  private parseListItems(text?: string): string[] {
    if (!text) return [];
    
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[-*•]\s*/, ''))
      .filter(line => line.length > 0);
  }

  /**
   * 計算創意分數
   */
  private calculateCreativityScore(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0;
    
    let score = 0;
    const totalSessions = sessions.length;
    
    // 模板多樣性 (30%)
    const uniqueTemplates = new Set(sessions.map(s => s.templateType)).size;
    score += (uniqueTemplates / 3) * 30;
    
    // 品質提升 (40%)
    const avgQuality = sessions.reduce((sum, s) => sum + s.qualityImprovement, 0) / totalSessions;
    score += Math.min(avgQuality / 100 * 40, 40);
    
    // 學習頻率 (30%)
    const learningSpan = Math.max(1, (sessions[sessions.length - 1].endTime.getTime() - sessions[0].startTime.getTime()) / (1000 * 60 * 60 * 24));
    const frequency = totalSessions / learningSpan;
    score += Math.min(frequency * 10, 30);
    
    return Math.round(Math.min(score, 100));
  }

  /**
   * 評估學習速度
   */
  private assessLearningVelocity(sessions: LearningSession[]): 'slow' | 'steady' | 'fast' | 'exceptional' {
    if (sessions.length < 2) return 'steady';
    
    const qualityGrowth = sessions.reduce((sum, s) => sum + s.qualityImprovement, 0) / sessions.length;
    const sessionFrequency = sessions.length / Math.max(1, (Date.now() - sessions[0].startTime.getTime()) / (1000 * 60 * 60 * 24));
    
    const velocityScore = qualityGrowth * 0.6 + sessionFrequency * 40 * 0.4;
    
    if (velocityScore >= 80) return 'exceptional';
    if (velocityScore >= 60) return 'fast';
    if (velocityScore >= 30) return 'steady';
    return 'slow';
  }

  /**
   * 其他輔助函數
   */
  private calculateSkillLevel(skill: string, sessions: LearningSession[]): number {
    // 基於學習次數和品質提升計算技能水平
    const sessionCount = sessions.length;
    const avgQuality = sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.qualityImprovement, 0) / sessionCount : 0;
    
    return Math.min(100, sessionCount * 5 + avgQuality * 0.3);
  }

  private calculateGrowthRate(skill: string, sessions: LearningSession[]): number {
    // 簡化的成長率計算
    if (sessions.length < 2) return 0;
    
    const recent = sessions.slice(-3);
    const earlier = sessions.slice(0, -3);
    
    if (earlier.length === 0) return 10;
    
    const recentAvg = recent.reduce((sum, s) => sum + s.qualityImprovement, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, s) => sum + s.qualityImprovement, 0) / earlier.length;
    
    return Math.round(((recentAvg - earlierAvg) / earlierAvg) * 100);
  }

  private determineMasteryLevel(sessionCount: number, avgQuality: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (sessionCount >= 20 && avgQuality >= 80) return 'expert';
    if (sessionCount >= 10 && avgQuality >= 60) return 'advanced';
    if (sessionCount >= 5 && avgQuality >= 40) return 'intermediate';
    return 'beginner';
  }

  private calculateMasteryProgress(level: string, sessionCount: number, avgQuality: number): number {
    const thresholds = {
      beginner: { sessions: 5, quality: 40 },
      intermediate: { sessions: 10, quality: 60 },
      advanced: { sessions: 20, quality: 80 },
      expert: { sessions: 50, quality: 90 }
    };
    
    const threshold = thresholds[level as keyof typeof thresholds];
    const sessionProgress = Math.min(100, (sessionCount / threshold.sessions) * 100);
    const qualityProgress = Math.min(100, (avgQuality / threshold.quality) * 100);
    
    return Math.round((sessionProgress + qualityProgress) / 2);
  }

  private identifyTemplateStrengths(template: string, sessions: LearningSession[]): string[] {
    // 基於模板類型和學習成果識別優勢
    const baseStrengths = {
      'daily-life': ['生活觀察力', '細節描述'],
      'adventure': ['想像力', '情節設計'],
      'animal-friend': ['創意思考', '角色塑造']
    };
    
    return baseStrengths[template as keyof typeof baseStrengths] || ['創意表達'];
  }

  private suggestNextMilestones(template: string, level: string): string[] {
    const milestones = {
      beginner: ['完成5個創作', '學會基礎描述'],
      intermediate: ['掌握進階技巧', '創作連續故事'],
      advanced: ['教導其他小朋友', '創作原創角色'],
      expert: ['成為創作導師', '開發新模板']
    };
    
    return milestones[level as keyof typeof milestones] || ['繼續練習'];
  }

  private generateAchievementSuggestions(sessions: LearningSession[]): string[] {
    const suggestions = [];
    
    if (sessions.length >= 5) suggestions.push('連續學習獎章');
    if (sessions.some(s => s.qualityImprovement >= 80)) suggestions.push('品質大師徽章');
    if (new Set(sessions.map(s => s.templateType)).size >= 3) suggestions.push('全能創作者');
    
    return suggestions.slice(0, 3);
  }

  private generateQualityTrend(sessions: LearningSession[]) {
    return sessions.map(session => ({
      date: session.endTime.toISOString().split('T')[0],
      score: session.qualityImprovement
    }));
  }

  private generateSkillRadar(sessions: LearningSession[]) {
    const skills = ['clarity', 'detail', 'emotion', 'visual', 'structure'];
    return skills.map(skill => ({
      skill,
      value: this.calculateSkillLevel(skill, sessions.filter(s => s.skillsLearned.includes(skill)))
    }));
  }

  private generateActivityData(sessions: LearningSession[]) {
    const activityMap: Record<string, number> = {};
    
    sessions.forEach(session => {
      const date = session.endTime.toISOString().split('T')[0];
      activityMap[date] = (activityMap[date] || 0) + 1;
    });
    
    return Object.entries(activityMap).map(([date, sessions]) => ({
      date,
      sessions
    }));
  }

  private generateEmptyReport(userId: string, startDate: Date, endDate: Date): LearningReport {
    return {
      reportId: `empty_report_${userId}_${Date.now()}`,
      userId,
      period: { startDate, endDate, totalSessions: 0 },
      overallProgress: {
        promptQualityGrowth: 0,
        skillsAcquired: [],
        totalAchievements: 0,
        creativityScore: 0,
        learningVelocity: 'steady'
      },
      skillBreakdown: {
        clarity: { currentLevel: 0, growthRate: 0, sessions: 0, lastImprovement: new Date(), trend: 'stable' },
        detail: { currentLevel: 0, growthRate: 0, sessions: 0, lastImprovement: new Date(), trend: 'stable' },
        emotion: { currentLevel: 0, growthRate: 0, sessions: 0, lastImprovement: new Date(), trend: 'stable' },
        visual: { currentLevel: 0, growthRate: 0, sessions: 0, lastImprovement: new Date(), trend: 'stable' },
        structure: { currentLevel: 0, growthRate: 0, sessions: 0, lastImprovement: new Date(), trend: 'stable' }
      },
      templateMastery: {
        dailyLife: { level: 'beginner', progress: 0, sessionsCompleted: 0, averageQuality: 0, strengths: [], nextMilestones: ['開始第一個創作'] },
        adventure: { level: 'beginner', progress: 0, sessionsCompleted: 0, averageQuality: 0, strengths: [], nextMilestones: ['開始第一個創作'] },
        animalFriend: { level: 'beginner', progress: 0, sessionsCompleted: 0, averageQuality: 0, strengths: [], nextMilestones: ['開始第一個創作'] }
      },
      achievements: { recent: [], milestones: [], suggestions: ['開始你的第一個AI創作之旅！'] },
      parentInsights: {
        strengths: ['準備開始學習AI創作'],
        areasForGrowth: ['可以從簡單的故事開始練習'],
        recommendations: ['鼓勵孩子嘗試第一個創作', '一起探索不同的故事模板'],
        nextSteps: ['完成第一個AI影片創作', '學習基礎的故事描述技巧']
      },
      visualProgress: {
        qualityTrendData: [],
        skillRadarData: [],
        sessionActivityData: []
      },
      personalizedContent: {
        celebrationMessage: '歡迎開始你的AI創作學習之旅！',
        encouragementNote: '每一個創作大師都是從第一步開始的！',
        nextLearningGoals: ['完成第一個故事創作', '學習基礎描述技巧'],
        recommendedTemplates: ['我的一天（基礎級）']
      }
    };
  }

  private generateFallbackParentInsights(overallProgress: any) {
    return {
      strengths: [
        '孩子對AI創作表現出積極的學習態度',
        '能夠理解並應用基礎的故事描述技巧',
        '展現出良好的想像力和創意潛能'
      ],
      areasForGrowth: [
        '可以嘗試更詳細地描述故事場景',
        '加強情感表達的豐富度'
      ],
      recommendations: [
        '鼓勵孩子多觀察生活中的細節',
        '一起討論故事中角色的感受',
        '讚美孩子的創意想法和學習進步'
      ],
      nextSteps: [
        '嘗試不同類型的故事模板',
        '學習更進階的描述技巧'
      ]
    };
  }

  private generateFallbackPersonalizedContent(userProfile?: any) {
    const childName = userProfile?.childName || '小朋友';
    
    return {
      celebrationMessage: `${childName}，你在AI創作方面表現得很棒！`,
      encouragementNote: '繼續保持好奇心，你會創作出更棒的作品！',
      nextLearningGoals: [
        '嘗試新的創作主題',
        '學習更豐富的描述方式',
        '與家人分享你的創作成果'
      ],
      recommendedTemplates: [
        '夢想冒險模板',
        '動物朋友模板'
      ]
    };
  }
}

// 單例導出
export const learningReportGenerator = new LearningReportGenerator();
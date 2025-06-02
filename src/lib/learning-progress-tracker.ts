/**
 * 學習進度追蹤系統
 * 階段3：模板系統架構 - 學習進度追蹤
 */

import {
  LearningProgress,
  SkillProgress,
  Achievement,
  AttemptRecord,
  AchievementType,
  UserLevel,
  TemplateEvent,
  TemplateEventType
} from '../types/template';
import { PromptQualityScore } from './types/prompt-engineering';

export class LearningProgressTracker {
  private progressCache = new Map<string, LearningProgress>();
  private achievements = new Map<string, Achievement[]>();
  private eventListeners = new Map<TemplateEventType, Function[]>();

  constructor(
    private readonly config = {
      syncInterval: 30000, // 30秒同步一次
      cacheSize: 100,
      masteryThreshold: 80,
      improvementWindow: 10, // 追蹤最近10次改善趨勢
      persistentStorage: true
    }
  ) {
    this.initializeEventSystem();
  }

  // ===== 核心進度追蹤方法 =====

  /**
   * 開始新的學習會話
   */
  async startLearningSession(
    userId: string,
    templateId: string,
    initialStage: string
  ): Promise<LearningProgress> {
    const progressKey = `${userId}-${templateId}`;
    
    let progress = this.progressCache.get(progressKey);
    if (!progress) {
      progress = {
        userId,
        templateId,
        currentStage: initialStage,
        startedAt: new Date(),
        lastActiveAt: new Date(),
        completedStages: [],
        skillProgress: [],
        achievements: [],
        totalTimeSpent: 0,
        attempts: []
      };
    }

    progress.lastActiveAt = new Date();
    this.progressCache.set(progressKey, progress);

    this.emitEvent('template-started', {
      templateId,
      userId,
      timestamp: new Date(),
      data: { stage: initialStage }
    });

    return progress;
  }

  /**
   * 記錄學習嘗試
   */
  async recordAttempt(
    userId: string,
    templateId: string,
    stageId: string,
    prompt: string,
    qualityScore: PromptQualityScore,
    timeSpent: number
  ): Promise<AttemptRecord> {
    const progressKey = `${userId}-${templateId}`;
    const progress = this.progressCache.get(progressKey);
    
    if (!progress) {
      throw new Error('Learning session not found. Please start a session first.');
    }

    const attempt: AttemptRecord = {
      id: this.generateAttemptId(),
      stageId,
      timestamp: new Date(),
      prompt,
      score: qualityScore.overall,
      dimensions: qualityScore.dimensions,
      improvements: qualityScore.improvementAreas,
      timeSpent,
      completed: qualityScore.overall >= this.config.masteryThreshold
    };

    progress.attempts.push(attempt);
    progress.totalTimeSpent += timeSpent;
    progress.lastActiveAt = new Date();

    // 更新技能進度
    await this.updateSkillProgress(progress, qualityScore);

    // 檢查是否完成階段
    if (attempt.completed && !progress.completedStages.includes(stageId)) {
      progress.completedStages.push(stageId);
      
      this.emitEvent('stage-completed', {
        templateId,
        userId,
        timestamp: new Date(),
        data: { 
          stageId, 
          score: qualityScore.overall,
          timeSpent: progress.totalTimeSpent
        }
      });
    }

    // 檢查成就
    await this.checkAchievements(progress);

    this.progressCache.set(progressKey, progress);
    return attempt;
  }

  /**
   * 更新技能進度
   */
  private async updateSkillProgress(
    progress: LearningProgress,
    qualityScore: PromptQualityScore
  ): Promise<void> {
    const skills = Object.keys(qualityScore.dimensions);

    for (const skill of skills) {
      const score = qualityScore.dimensions[skill];
      let skillProgress = progress.skillProgress.find(sp => sp.skill === skill);

      if (!skillProgress) {
        skillProgress = {
          skill,
          currentLevel: score,
          improvement: 0,
          practiceCount: 0,
          lastPracticed: new Date(),
          masteryTrend: []
        };
        progress.skillProgress.push(skillProgress);
      }

      // 計算改善幅度（使用平滑算法避免波動）
      const previousLevel = skillProgress.currentLevel;
      const newLevel = this.smoothLevelUpdate(previousLevel, score);
      const improvement = newLevel - (skillProgress.masteryTrend[0] || previousLevel);

      // 更新技能資料
      skillProgress.currentLevel = newLevel;
      skillProgress.improvement = improvement;
      skillProgress.practiceCount += 1;
      skillProgress.lastPracticed = new Date();
      
      // 更新趨勢（保持最近10次記錄）
      skillProgress.masteryTrend.unshift(score);
      if (skillProgress.masteryTrend.length > this.config.improvementWindow) {
        skillProgress.masteryTrend.pop();
      }

      // 發送技能改善事件
      if (improvement > 5) { // 改善超過5分
        this.emitEvent('skill-improved', {
          templateId: progress.templateId,
          userId: progress.userId,
          timestamp: new Date(),
          data: { 
            skill, 
            previousLevel, 
            newLevel, 
            improvement 
          }
        });
      }
    }
  }

  /**
   * 平滑技能等級更新（避免分數劇烈波動）
   */
  private smoothLevelUpdate(previousLevel: number, newScore: number): number {
    const smoothingFactor = 0.3; // 30%新分數 + 70%舊分數
    return previousLevel * (1 - smoothingFactor) + newScore * smoothingFactor;
  }

  /**
   * 檢查並解鎖成就
   */
  private async checkAchievements(progress: LearningProgress): Promise<void> {
    const newAchievements: Achievement[] = [];

    // 技能掌握成就
    for (const skillProgress of progress.skillProgress) {
      if (skillProgress.currentLevel >= this.config.masteryThreshold) {
        const achievementId = `skill-mastery-${skillProgress.skill}`;
        if (!progress.achievements.find(a => a.id === achievementId)) {
          newAchievements.push({
            id: achievementId,
            type: 'skill-mastery',
            title: `${this.getSkillDisplayName(skillProgress.skill)}大師`,
            description: `在${skillProgress.skill}技能上達到熟練程度！`,
            unlockedAt: new Date(),
            requirements: [
              { type: 'skill-level', threshold: this.config.masteryThreshold }
            ]
          });
        }
      }
    }

    // 持續性成就
    const recentAttempts = progress.attempts.filter(
      a => Date.now() - a.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // 最近7天
    );
    
    if (recentAttempts.length >= 5) {
      const achievementId = 'consistency-week';
      if (!progress.achievements.find(a => a.id === achievementId)) {
        newAchievements.push({
          id: achievementId,
          type: 'consistency',
          title: '堅持練習',
          description: '一週內完成5次以上練習！',
          unlockedAt: new Date(),
          requirements: [
            { type: 'practice-frequency', threshold: 5, timeframe: '7days' }
          ]
        });
      }
    }

    // 創意成就
    const creativityScores = progress.attempts
      .slice(-5) // 最近5次
      .map(a => a.dimensions.emotion || 0);
    
    const avgCreativity = creativityScores.reduce((sum, score) => sum + score, 0) / creativityScores.length;
    
    if (avgCreativity >= 85) {
      const achievementId = 'creativity-master';
      if (!progress.achievements.find(a => a.id === achievementId)) {
        newAchievements.push({
          id: achievementId,
          type: 'creativity',
          title: '創意大師',
          description: '你的創意表達能力超群！',
          unlockedAt: new Date(),
          requirements: [
            { type: 'creativity-average', threshold: 85 }
          ]
        });
      }
    }

    // 添加新成就到進度中
    progress.achievements.push(...newAchievements);

    // 發送成就解鎖事件
    for (const achievement of newAchievements) {
      this.emitEvent('achievement-unlocked', {
        templateId: progress.templateId,
        userId: progress.userId,
        timestamp: new Date(),
        data: { achievement }
      });
    }
  }

  // ===== 查詢方法 =====

  /**
   * 獲取用戶進度
   */
  async getUserProgress(userId: string, templateId: string): Promise<LearningProgress | null> {
    const progressKey = `${userId}-${templateId}`;
    return this.progressCache.get(progressKey) || null;
  }

  /**
   * 獲取用戶整體技能水平
   */
  async getUserLevel(userId: string): Promise<UserLevel> {
    const userProgresses = Array.from(this.progressCache.values())
      .filter(p => p.userId === userId);

    if (userProgresses.length === 0) {
      return {
        overall: 0,
        skills: {},
        confidence: 50,
        engagement: 50,
        parentSupport: 50,
        learningStyle: 'mixed'
      };
    }

    // 計算整體技能水平
    const allSkills = new Map<string, number[]>();
    let totalAttempts = 0;
    let totalTimeSpent = 0;

    for (const progress of userProgresses) {
      totalAttempts += progress.attempts.length;
      totalTimeSpent += progress.totalTimeSpent;

      for (const skillProgress of progress.skillProgress) {
        if (!allSkills.has(skillProgress.skill)) {
          allSkills.set(skillProgress.skill, []);
        }
        allSkills.get(skillProgress.skill)!.push(skillProgress.currentLevel);
      }
    }

    // 計算各技能平均水平
    const skills: Record<string, number> = {};
    let skillSum = 0;
    
    for (const [skill, levels] of allSkills.entries()) {
      const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      skills[skill] = average;
      skillSum += average;
    }

    const overall = allSkills.size > 0 ? skillSum / allSkills.size : 0;

    // 估算其他指標
    const confidence = Math.min(100, overall + (totalAttempts * 2));
    const engagement = Math.min(100, 50 + (totalAttempts * 3));
    const parentSupport = 70; // 預設值，後續可根據實際互動調整

    return {
      overall,
      skills,
      confidence,
      engagement,
      parentSupport,
      learningStyle: this.detectLearningStyle(userProgresses)
    };
  }

  /**
   * 檢測學習風格
   */
  private detectLearningStyle(progresses: LearningProgress[]): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' {
    // 基於用戶的學習模式數據推測學習風格
    // 這裡使用簡化的啟發式規則，實際可以更複雜
    
    const totalAttempts = progresses.reduce((sum, p) => sum + p.attempts.length, 0);
    if (totalAttempts < 5) return 'mixed';

    // 分析維度偏好
    const dimensionScores = progresses
      .flatMap(p => p.attempts)
      .reduce((acc, attempt) => {
        for (const [dimension, score] of Object.entries(attempt.dimensions)) {
          if (!acc[dimension]) acc[dimension] = [];
          acc[dimension].push(score);
        }
        return acc;
      }, {} as Record<string, number[]>);

    const avgScores = Object.entries(dimensionScores).map(([dimension, scores]) => ({
      dimension,
      average: scores.reduce((sum, score) => sum + score, 0) / scores.length
    }));

    // 根據強項判斷學習風格
    const strongest = avgScores.reduce((max, current) => 
      current.average > max.average ? current : max
    );

    switch (strongest.dimension) {
      case 'visual':
        return 'visual';
      case 'emotion':
        return 'auditory';
      case 'detail':
        return 'kinesthetic';
      default:
        return 'mixed';
    }
  }

  /**
   * 獲取用戶成就
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const userProgresses = Array.from(this.progressCache.values())
      .filter(p => p.userId === userId);

    return userProgresses.flatMap(p => p.achievements);
  }

  // ===== 分析與報告方法 =====

  /**
   * 生成學習報告
   */
  async generateLearningReport(userId: string, templateId?: string): Promise<LearningReport> {
    const progresses = templateId 
      ? [this.progressCache.get(`${userId}-${templateId}`)]
      : Array.from(this.progressCache.values()).filter(p => p.userId === userId);

    const validProgresses = progresses.filter(Boolean) as LearningProgress[];

    if (validProgresses.length === 0) {
      throw new Error('No learning progress found for user');
    }

    const totalAttempts = validProgresses.reduce((sum, p) => sum + p.attempts.length, 0);
    const totalTimeSpent = validProgresses.reduce((sum, p) => sum + p.totalTimeSpent, 0);
    const totalAchievements = validProgresses.reduce((sum, p) => sum + p.achievements.length, 0);

    // 計算改善趨勢
    const allAttempts = validProgresses
      .flatMap(p => p.attempts)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const improvementTrend = this.calculateImprovementTrend(allAttempts);

    // 技能分析
    const skillAnalysis = this.analyzeSkillDevelopment(validProgresses);

    return {
      userId,
      templateId: templateId || 'all',
      reportDate: new Date(),
      summary: {
        totalAttempts,
        totalTimeSpent,
        totalAchievements,
        completedTemplates: validProgresses.filter(p => this.isTemplateCompleted(p)).length,
        averageScore: allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length
      },
      improvementTrend,
      skillAnalysis,
      recommendations: this.generateRecommendations(validProgresses),
      achievements: validProgresses.flatMap(p => p.achievements)
    };
  }

  /**
   * 計算改善趨勢
   */
  private calculateImprovementTrend(attempts: AttemptRecord[]): ImprovementTrend {
    if (attempts.length < 2) {
      return {
        direction: 'stable',
        rate: 0,
        confidence: 0
      };
    }

    const scores = attempts.map(a => a.score);
    const timespan = attempts[attempts.length - 1].timestamp.getTime() - attempts[0].timestamp.getTime();
    
    // 簡單線性迴歸計算趨勢
    const n = scores.length;
    const sumX = scores.reduce((sum, _, i) => sum + i, 0);
    const sumY = scores.reduce((sum, score) => sum + score, 0);
    const sumXY = scores.reduce((sum, score, i) => sum + (i * score), 0);
    const sumXX = scores.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const rate = slope * (24 * 60 * 60 * 1000) / timespan; // 每天的改善率

    return {
      direction: rate > 0.5 ? 'improving' : rate < -0.5 ? 'declining' : 'stable',
      rate: Math.abs(rate),
      confidence: Math.min(100, n * 10) // 信心度隨樣本數增加
    };
  }

  /**
   * 分析技能發展
   */
  private analyzeSkillDevelopment(progresses: LearningProgress[]): SkillAnalysis {
    const allSkills = new Map<string, SkillProgress>();

    for (const progress of progresses) {
      for (const skillProgress of progress.skillProgress) {
        const existing = allSkills.get(skillProgress.skill);
        if (!existing || skillProgress.currentLevel > existing.currentLevel) {
          allSkills.set(skillProgress.skill, skillProgress);
        }
      }
    }

    const skills = Array.from(allSkills.values());
    
    return {
      strongest: skills.reduce((max, skill) => 
        skill.currentLevel > max.currentLevel ? skill : max
      , skills[0]),
      weakest: skills.reduce((min, skill) => 
        skill.currentLevel < min.currentLevel ? skill : min
      , skills[0]),
      mostImproved: skills.reduce((max, skill) => 
        skill.improvement > max.improvement ? skill : max
      , skills[0]),
      needsAttention: skills.filter(skill => 
        skill.currentLevel < 60 || skill.masteryTrend.slice(-3).every(score => score < 70)
      )
    };
  }

  /**
   * 生成個人化建議
   */
  private generateRecommendations(progresses: LearningProgress[]): string[] {
    const recommendations: string[] = [];
    const userLevel = this.calculateUserLevelFromProgresses(progresses);

    // 基於整體水平的建議
    if (userLevel.overall < 60) {
      recommendations.push('建議多練習基礎技能，鞏固描述清晰度');
    } else if (userLevel.overall > 80) {
      recommendations.push('嘗試更具挑戰性的創作主題，發揮創意');
    }

    // 基於技能偏好的建議
    const skillEntries = Object.entries(userLevel.skills);
    const strongestSkill = skillEntries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    const weakestSkill = skillEntries.reduce((min, current) => 
      current[1] < min[1] ? current : min
    );

    if (strongestSkill[1] - weakestSkill[1] > 20) {
      recommendations.push(`發揮你在${this.getSkillDisplayName(strongestSkill[0])}的優勢，同時加強${this.getSkillDisplayName(weakestSkill[0])}`);
    }

    // 基於學習頻率的建議
    const recentActivity = progresses.some(p => 
      Date.now() - p.lastActiveAt.getTime() < 3 * 24 * 60 * 60 * 1000 // 3天內
    );

    if (!recentActivity) {
      recommendations.push('定期練習能幫助保持技能水平，建議每週至少練習2-3次');
    }

    return recommendations;
  }

  // ===== 輔助方法 =====

  private generateAttemptId(): string {
    return `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSkillDisplayName(skill: string): string {
    const displayNames: Record<string, string> = {
      clarity: '清晰度',
      detail: '細節豐富度',
      emotion: '情感表達',
      visual: '視覺描述',
      structure: '結構完整性'
    };
    return displayNames[skill] || skill;
  }

  private isTemplateCompleted(progress: LearningProgress): boolean {
    // 簡化判斷：如果有3個以上完成的階段就算完成
    return progress.completedStages.length >= 3;
  }

  private calculateUserLevelFromProgresses(progresses: LearningProgress[]): UserLevel {
    // 簡化版本，實際會在 getUserLevel 中更詳細
    const allSkills = new Map<string, number[]>();
    
    for (const progress of progresses) {
      for (const skillProgress of progress.skillProgress) {
        if (!allSkills.has(skillProgress.skill)) {
          allSkills.set(skillProgress.skill, []);
        }
        allSkills.get(skillProgress.skill)!.push(skillProgress.currentLevel);
      }
    }

    const skills: Record<string, number> = {};
    let skillSum = 0;
    
    for (const [skill, levels] of allSkills.entries()) {
      const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
      skills[skill] = average;
      skillSum += average;
    }

    return {
      overall: allSkills.size > 0 ? skillSum / allSkills.size : 0,
      skills,
      confidence: 50,
      engagement: 50,
      parentSupport: 50,
      learningStyle: 'mixed'
    };
  }

  // ===== 事件系統 =====

  private initializeEventSystem(): void {
    // 初始化事件監聽器
    this.eventListeners.set('template-started', []);
    this.eventListeners.set('stage-completed', []);
    this.eventListeners.set('skill-improved', []);
    this.eventListeners.set('achievement-unlocked', []);
    this.eventListeners.set('difficulty-adjusted', []);
    this.eventListeners.set('template-completed', []);
    this.eventListeners.set('error-occurred', []);
  }

  public addEventListener(
    eventType: TemplateEventType, 
    callback: (event: TemplateEvent) => void
  ): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(callback);
    this.eventListeners.set(eventType, listeners);
  }

  private emitEvent(
    eventType: TemplateEventType,
    eventData: Omit<TemplateEvent, 'type'>
  ): void {
    const event: TemplateEvent = {
      type: eventType,
      ...eventData
    };

    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    });
  }
}

// ===== 輔助介面定義 =====

export interface LearningReport {
  userId: string;
  templateId: string;
  reportDate: Date;
  summary: {
    totalAttempts: number;
    totalTimeSpent: number;
    totalAchievements: number;
    completedTemplates: number;
    averageScore: number;
  };
  improvementTrend: ImprovementTrend;
  skillAnalysis: SkillAnalysis;
  recommendations: string[];
  achievements: Achievement[];
}

export interface ImprovementTrend {
  direction: 'improving' | 'declining' | 'stable';
  rate: number;
  confidence: number;
}

export interface SkillAnalysis {
  strongest: SkillProgress;
  weakest: SkillProgress;
  mostImproved: SkillProgress;
  needsAttention: SkillProgress[];
}

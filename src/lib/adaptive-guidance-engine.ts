/**
 * 適應性教學難度調整引擎
 * 階段3：模板系統架構 - 適應性教學
 */

import {
  UserLevel,
  DifficultyConfig,
  AdaptiveGuidanceConfig,
  SessionContext,
  LearningPreferences,
  LearningStyle,
  SkillProgress,
  AttemptRecord
} from '../types/template';

export class AdaptiveGuidanceEngine {
  private userProfiles = new Map<string, UserAdaptiveProfile>();
  private sessionData = new Map<string, SessionAnalytics>();
  
  constructor(
    private readonly config = {
      adaptationSensitivity: 0.7, // 適應敏感度
      confidenceThreshold: 0.8, // 信心度門檻
      performanceWindow: 5, // 分析最近5次表現
      minDataPoints: 3, // 最少數據點才開始適應
      maxDifficultyJump: 10, // 最大難度跳躍
      stabilityPeriod: 300000, // 5分鐘穩定期
      debugMode: false
    }
  ) {
    this.initializeDefaultProfiles();
  }

  // ===== 核心適應方法 =====

  /**
   * 為用戶生成適應性指導配置
   */
  async generateAdaptiveGuidance(
    userId: string,
    currentContext: SessionContext,
    userLevel: UserLevel,
    recentPerformance: AttemptRecord[]
  ): Promise<AdaptiveGuidanceConfig> {
    // 更新用戶檔案
    await this.updateUserProfile(userId, userLevel, recentPerformance);
    
    // 分析當前會話
    const sessionAnalysis = this.analyzeCurrentSession(userId, currentContext, recentPerformance);
    
    // 生成適應性配置
    const guidance: AdaptiveGuidanceConfig = {
      user: await this.calculateAdaptedUserLevel(userId, userLevel, sessionAnalysis),
      session: currentContext,
      preferences: await this.generateLearningPreferences(userId, sessionAnalysis)
    };

    if (this.config.debugMode) {
      console.log(`Generated adaptive guidance for user ${userId}:`, guidance);
    }

    return guidance;
  }

  /**
   * 計算適應後的用戶水平
   */
  private async calculateAdaptedUserLevel(
    userId: string,
    baseLevel: UserLevel,
    sessionAnalysis: SessionAnalytics
  ): Promise<UserLevel> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return baseLevel;
    }

    // 基於會話表現調整技能評估
    const adaptedSkills = { ...baseLevel.skills };
    
    for (const [skill, baseScore] of Object.entries(adaptedSkills)) {
      const recentTrend = sessionAnalysis.skillTrends[skill] || 0;
      const confidenceAdjustment = this.calculateConfidenceAdjustment(profile, skill);
      const contextAdjustment = this.calculateContextAdjustment(sessionAnalysis, skill);
      
      // 綜合調整
      const totalAdjustment = (recentTrend * 0.4) + (confidenceAdjustment * 0.3) + (contextAdjustment * 0.3);
      adaptedSkills[skill] = Math.max(0, Math.min(100, baseScore + totalAdjustment));
    }

    // 重新計算整體水平
    const skillValues = Object.values(adaptedSkills);
    const adaptedOverall = skillValues.length > 0 
      ? skillValues.reduce((sum, val) => sum + val, 0) / skillValues.length 
      : baseLevel.overall;

    return {
      ...baseLevel,
      overall: adaptedOverall,
      skills: adaptedSkills,
      confidence: this.calculateAdaptedConfidence(profile, sessionAnalysis),
      engagement: this.calculateAdaptedEngagement(profile, sessionAnalysis)
    };
  }

  /**
   * 分析當前會話
   */
  private analyzeCurrentSession(
    userId: string,
    context: SessionContext,
    recentPerformance: AttemptRecord[]
  ): SessionAnalytics {
    const analytics: SessionAnalytics = {
      userId,
      sessionId: this.generateSessionId(),
      startTime: new Date(),
      context,
      performanceTrend: this.calculatePerformanceTrend(recentPerformance),
      skillTrends: this.calculateSkillTrends(recentPerformance),
      engagementLevel: this.assessEngagementLevel(recentPerformance, context),
      frustrationLevel: this.assessFrustrationLevel(recentPerformance),
      optimalDifficulty: this.calculateOptimalDifficulty(recentPerformance),
      recommendedPace: this.calculateRecommendedPace(context, recentPerformance),
      adaptationNeeded: this.determineAdaptationNeeded(recentPerformance)
    };

    // 儲存會話數據
    this.sessionData.set(analytics.sessionId, analytics);

    return analytics;
  }

  /**
   * 計算表現趨勢
   */
  private calculatePerformanceTrend(attempts: AttemptRecord[]): number {
    if (attempts.length < 2) return 0;

    const recentAttempts = attempts.slice(-this.config.performanceWindow);
    const scores = recentAttempts.map(a => a.score);
    
    // 計算線性趨勢
    const n = scores.length;
    const sumX = scores.reduce((sum, _, i) => sum + i, 0);
    const sumY = scores.reduce((sum, score) => sum + score, 0);
    const sumXY = scores.reduce((sum, score, i) => sum + (i * score), 0);
    const sumXX = scores.reduce((sum, _, i) => sum + (i * i), 0);

    if (n * sumXX - sumX * sumX === 0) return 0;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return Math.max(-10, Math.min(10, slope)); // 限制在 -10 到 10 之間
  }

  /**
   * 計算技能趨勢
   */
  private calculateSkillTrends(attempts: AttemptRecord[]): Record<string, number> {
    const skillTrends: Record<string, number> = {};
    
    if (attempts.length < 2) return skillTrends;

    // 為每個技能計算趨勢
    const skillData: Record<string, number[]> = {};
    
    attempts.forEach(attempt => {
      Object.entries(attempt.dimensions).forEach(([skill, score]) => {
        if (!skillData[skill]) skillData[skill] = [];
        skillData[skill].push(score);
      });
    });

    for (const [skill, scores] of Object.entries(skillData)) {
      if (scores.length >= 2) {
        const trend = this.calculateTrend(scores);
        skillTrends[skill] = trend;
      }
    }

    return skillTrends;
  }

  /**
   * 計算數值趨勢
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const recent = values.slice(-3); // 最近3次
    const early = values.slice(0, Math.max(1, values.length - 3));
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const earlyAvg = early.reduce((sum, val) => sum + val, 0) / early.length;
    
    return recentAvg - earlyAvg;
  }

  /**
   * 評估參與度
   */
  private assessEngagementLevel(attempts: AttemptRecord[], context: SessionContext): number {
    let engagement = 50; // 基礎值

    // 基於嘗試頻率
    if (attempts.length > 0) {
      const avgTimeSpent = attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length;
      if (avgTimeSpent > 120) { // 超過2分鐘每次
        engagement += 10;
      } else if (avgTimeSpent < 30) { // 少於30秒
        engagement -= 10;
      }
    }

    // 基於時間背景
    if (context.energyLevel === 'high') {
      engagement += 15;
    } else if (context.energyLevel === 'low') {
      engagement -= 10;
    }

    // 基於家長陪同
    if (context.parentPresence) {
      engagement += 10;
    }

    return Math.max(0, Math.min(100, engagement));
  }

  /**
   * 評估挫折程度
   */
  private assessFrustrationLevel(attempts: AttemptRecord[]): number {
    if (attempts.length === 0) return 0;

    let frustration = 0;
    const recentAttempts = attempts.slice(-3);

    // 連續失敗增加挫折感
    const consecutiveFailures = this.countConsecutiveFailures(recentAttempts);
    frustration += consecutiveFailures * 20;

    // 分數下降增加挫折感
    if (recentAttempts.length >= 2) {
      const scoreTrend = this.calculateTrend(recentAttempts.map(a => a.score));
      if (scoreTrend < -5) {
        frustration += Math.abs(scoreTrend) * 2;
      }
    }

    // 時間壓力
    const avgTimeSpent = recentAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / recentAttempts.length;
    if (avgTimeSpent < 15) { // 太快可能表示匆忙或挫折
      frustration += 15;
    }

    return Math.max(0, Math.min(100, frustration));
  }

  /**
   * 計算最佳難度
   */
  private calculateOptimalDifficulty(attempts: AttemptRecord[]): number {
    if (attempts.length === 0) return 60; // 預設中等難度

    const recentAttempts = attempts.slice(-this.config.performanceWindow);
    const avgScore = recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length;
    const successRate = recentAttempts.filter(a => a.completed).length / recentAttempts.length;

    // 理想狀態：70-85分，成功率60-80%
    let optimalDifficulty = 60;

    if (avgScore > 85 && successRate > 0.8) {
      // 太簡單，提高難度
      optimalDifficulty = Math.min(90, avgScore + 5);
    } else if (avgScore < 60 || successRate < 0.4) {
      // 太難，降低難度
      optimalDifficulty = Math.max(40, avgScore - 10);
    } else {
      // 適中，微調
      optimalDifficulty = avgScore;
    }

    return optimalDifficulty;
  }

  /**
   * 計算建議節奏
   */
  private calculateRecommendedPace(context: SessionContext, attempts: AttemptRecord[]): 'slow' | 'normal' | 'fast' {
    // 基於上下文
    if (context.energyLevel === 'low' || context.sessionLength === 'short') {
      return 'slow';
    }
    
    if (context.energyLevel === 'high' && context.sessionLength === 'long') {
      return 'fast';
    }

    // 基於表現
    if (attempts.length > 0) {
      const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
      if (avgScore > 80) return 'fast';
      if (avgScore < 60) return 'slow';
    }

    return 'normal';
  }

  /**
   * 判斷是否需要適應
   */
  private determineAdaptationNeeded(attempts: AttemptRecord[]): boolean {
    if (attempts.length < this.config.minDataPoints) return false;

    const recentAttempts = attempts.slice(-3);
    
    // 連續失敗需要適應
    if (this.countConsecutiveFailures(recentAttempts) >= 2) return true;
    
    // 表現大幅波動需要適應
    const scores = recentAttempts.map(a => a.score);
    const variance = this.calculateVariance(scores);
    if (variance > 400) return true; // 標準差 > 20

    return false;
  }

  // ===== 用戶檔案管理 =====

  /**
   * 更新用戶檔案
   */
  private async updateUserProfile(
    userId: string,
    userLevel: UserLevel,
    recentPerformance: AttemptRecord[]
  ): Promise<void> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = this.createDefaultProfile(userId, userLevel);
      this.userProfiles.set(userId, profile);
    }

    // 更新學習歷史
    profile.learningHistory.push({
      timestamp: new Date(),
      overallLevel: userLevel.overall,
      skillLevels: { ...userLevel.skills },
      performance: recentPerformance.slice(-3).map(a => a.score)
    });

    // 保持歷史記錄在合理範圍內
    if (profile.learningHistory.length > 50) {
      profile.learningHistory = profile.learningHistory.slice(-30);
    }

    // 更新適應參數
    profile.adaptationHistory.push({
      timestamp: new Date(),
      trigger: this.identifyAdaptationTrigger(recentPerformance),
      adjustments: this.calculateNecessaryAdjustments(recentPerformance),
      effectiveness: this.evaluateLastAdaptationEffectiveness(profile)
    });

    profile.lastUpdated = new Date();
  }

  /**
   * 創建預設檔案
   */
  private createDefaultProfile(userId: string, userLevel: UserLevel): UserAdaptiveProfile {
    return {
      userId,
      baselineLevel: userLevel,
      learningHistory: [],
      adaptationHistory: [],
      preferences: {
        pace: 'normal',
        feedback: 'immediate',
        encouragement: 'balanced',
        complexity: 'adaptive'
      },
      stabilityFactors: {
        moodConsistency: 0.7,
        performanceVariability: 0.5,
        engagementReliability: 0.6
      },
      lastUpdated: new Date(),
      totalSessions: 0
    };
  }

  // ===== 生成學習偏好 =====

  /**
   * 生成學習偏好
   */
  private async generateLearningPreferences(
    userId: string,
    sessionAnalysis: SessionAnalytics
  ): Promise<LearningPreferences> {
    const profile = this.userProfiles.get(userId);
    const basePreferences = profile?.preferences || {
      pace: 'normal',
      feedback: 'immediate',
      encouragement: 'balanced',
      complexity: 'adaptive'
    };

    // 基於會話分析調整偏好
    const adaptedPreferences: LearningPreferences = { ...basePreferences };

    // 調整節奏
    if (sessionAnalysis.frustrationLevel > 60) {
      adaptedPreferences.pace = 'slow';
    } else if (sessionAnalysis.engagementLevel > 80 && sessionAnalysis.performanceTrend > 0) {
      adaptedPreferences.pace = 'fast';
    }

    // 調整反饋類型
    if (sessionAnalysis.context.energyLevel === 'low') {
      adaptedPreferences.feedback = 'summary';
    } else if (sessionAnalysis.engagementLevel > 70) {
      adaptedPreferences.feedback = 'immediate';
    }

    // 調整鼓勵風格
    if (sessionAnalysis.frustrationLevel > 40) {
      adaptedPreferences.encouragement = 'gentle';
    } else if (sessionAnalysis.performanceTrend > 5) {
      adaptedPreferences.encouragement = 'enthusiastic';
    }

    return adaptedPreferences;
  }

  // ===== 難度配置生成 =====

  /**
   * 生成難度配置
   */
  async generateDifficultyConfig(
    userId: string,
    templateId: string,
    currentStage: string
  ): Promise<DifficultyConfig> {
    const profile = this.userProfiles.get(userId);
    const sessionAnalysis = this.sessionData.get(this.getCurrentSessionId(userId));

    const baseDifficulty = 60; // 預設難度
    const adaptiveLevel = sessionAnalysis?.optimalDifficulty || baseDifficulty;

    // 生成技能權重
    const skillWeights = this.calculateSkillWeights(profile, sessionAnalysis);

    return {
      adaptiveLevel,
      skillWeights,
      hintFrequency: this.determineHintFrequency(sessionAnalysis),
      exampleComplexity: this.determineExampleComplexity(adaptiveLevel),
      evaluationStrict: this.calculateEvaluationStrictness(profile, sessionAnalysis)
    };
  }

  /**
   * 計算技能權重
   */
  private calculateSkillWeights(
    profile?: UserAdaptiveProfile,
    sessionAnalysis?: SessionAnalytics
  ): Record<string, number> {
    const defaultWeights = {
      clarity: 0.25,
      detail: 0.20,
      emotion: 0.20,
      visual: 0.20,
      structure: 0.15
    };

    if (!profile || !sessionAnalysis) {
      return defaultWeights;
    }

    // 基於用戶弱點調整權重
    const adjustedWeights = { ...defaultWeights };
    
    for (const [skill, trend] of Object.entries(sessionAnalysis.skillTrends)) {
      if (trend < -5) { // 下降趨勢
        adjustedWeights[skill] = Math.min(0.4, adjustedWeights[skill] + 0.1);
      }
    }

    // 正規化權重
    const totalWeight = Object.values(adjustedWeights).reduce((sum, w) => sum + w, 0);
    for (const skill of Object.keys(adjustedWeights)) {
      adjustedWeights[skill] /= totalWeight;
    }

    return adjustedWeights;
  }

  /**
   * 決定提示頻率
   */
  private determineHintFrequency(sessionAnalysis?: SessionAnalytics): 'minimal' | 'normal' | 'frequent' {
    if (!sessionAnalysis) return 'normal';

    if (sessionAnalysis.frustrationLevel > 50 || sessionAnalysis.performanceTrend < -5) {
      return 'frequent';
    }
    
    if (sessionAnalysis.engagementLevel > 80 && sessionAnalysis.performanceTrend > 0) {
      return 'minimal';
    }

    return 'normal';
  }

  /**
   * 決定例子複雜度
   */
  private determineExampleComplexity(adaptiveLevel: number): 'simple' | 'moderate' | 'complex' {
    if (adaptiveLevel < 50) return 'simple';
    if (adaptiveLevel > 75) return 'complex';
    return 'moderate';
  }

  /**
   * 計算評分嚴格度
   */
  private calculateEvaluationStrictness(
    profile?: UserAdaptiveProfile,
    sessionAnalysis?: SessionAnalytics
  ): number {
    let strictness = 0.7; // 預設適中嚴格度

    if (sessionAnalysis) {
      // 挫折感高時放寬評分
      if (sessionAnalysis.frustrationLevel > 50) {
        strictness -= 0.2;
      }
      
      // 表現很好時提高標準
      if (sessionAnalysis.performanceTrend > 5) {
        strictness += 0.1;
      }
    }

    return Math.max(0.4, Math.min(0.9, strictness));
  }

  // ===== 輔助方法 =====

  private countConsecutiveFailures(attempts: AttemptRecord[]): number {
    let count = 0;
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (!attempts[i].completed) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private calculateConfidenceAdjustment(profile: UserAdaptiveProfile, skill: string): number {
    // 基於歷史穩定性計算信心調整
    return (profile.stabilityFactors.performanceVariability - 0.5) * 10;
  }

  private calculateContextAdjustment(sessionAnalysis: SessionAnalytics, skill: string): number {
    // 基於會話背景調整
    let adjustment = 0;
    
    if (sessionAnalysis.context.energyLevel === 'high') {
      adjustment += 5;
    } else if (sessionAnalysis.context.energyLevel === 'low') {
      adjustment -= 5;
    }

    return adjustment;
  }

  private calculateAdaptedConfidence(profile: UserAdaptiveProfile, sessionAnalysis: SessionAnalytics): number {
    const baseConfidence = 50;
    let confidence = baseConfidence;

    // 基於表現趨勢
    confidence += sessionAnalysis.performanceTrend * 2;

    // 基於挫折感
    confidence -= sessionAnalysis.frustrationLevel * 0.3;

    // 基於參與度
    confidence += (sessionAnalysis.engagementLevel - 50) * 0.5;

    return Math.max(0, Math.min(100, confidence));
  }

  private calculateAdaptedEngagement(profile: UserAdaptiveProfile, sessionAnalysis: SessionAnalytics): number {
    // 直接使用會話分析的參與度，可以加上歷史修正
    return sessionAnalysis.engagementLevel;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentSessionId(userId: string): string {
    // 簡化：返回最近的會話ID
    const sessions = Array.from(this.sessionData.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    
    return sessions[0]?.sessionId || '';
  }

  private identifyAdaptationTrigger(attempts: AttemptRecord[]): string {
    if (this.countConsecutiveFailures(attempts) >= 2) {
      return 'consecutive_failures';
    }
    
    const scores = attempts.slice(-3).map(a => a.score);
    const variance = this.calculateVariance(scores);
    if (variance > 400) {
      return 'high_variability';
    }

    return 'routine_adjustment';
  }

  private calculateNecessaryAdjustments(attempts: AttemptRecord[]): Record<string, number> {
    const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
    
    return {
      difficultyAdjustment: avgScore < 60 ? -10 : avgScore > 85 ? 5 : 0,
      paceAdjustment: this.countConsecutiveFailures(attempts) >= 2 ? -1 : 0
    };
  }

  private evaluateLastAdaptationEffectiveness(profile: UserAdaptiveProfile): number {
    if (profile.adaptationHistory.length < 2) return 0.5;
    
    // 簡化評估：比較最近兩次適應前後的表現
    const recent = profile.learningHistory.slice(-5);
    if (recent.length < 3) return 0.5;

    const beforeAdaptation = recent.slice(0, 2);
    const afterAdaptation = recent.slice(-2);

    const beforeAvg = beforeAdaptation.reduce((sum, h) => sum + h.overallLevel, 0) / beforeAdaptation.length;
    const afterAvg = afterAdaptation.reduce((sum, h) => sum + h.overallLevel, 0) / afterAdaptation.length;

    return Math.max(0, Math.min(1, (afterAvg - beforeAvg + 20) / 40));
  }

  private initializeDefaultProfiles(): void {
    if (this.config.debugMode) {
      console.log('AdaptiveGuidanceEngine initialized');
    }
  }
}

// ===== 輔助介面定義 =====

export interface UserAdaptiveProfile {
  userId: string;
  baselineLevel: UserLevel;
  learningHistory: LearningHistoryEntry[];
  adaptationHistory: AdaptationHistoryEntry[];
  preferences: LearningPreferences;
  stabilityFactors: {
    moodConsistency: number;
    performanceVariability: number;
    engagementReliability: number;
  };
  lastUpdated: Date;
  totalSessions: number;
}

export interface LearningHistoryEntry {
  timestamp: Date;
  overallLevel: number;
  skillLevels: Record<string, number>;
  performance: number[];
}

export interface AdaptationHistoryEntry {
  timestamp: Date;
  trigger: string;
  adjustments: Record<string, number>;
  effectiveness: number;
}

export interface SessionAnalytics {
  userId: string;
  sessionId: string;
  startTime: Date;
  context: SessionContext;
  performanceTrend: number;
  skillTrends: Record<string, number>;
  engagementLevel: number;
  frustrationLevel: number;
  optimalDifficulty: number;
  recommendedPace: 'slow' | 'normal' | 'fast';
  adaptationNeeded: boolean;
}

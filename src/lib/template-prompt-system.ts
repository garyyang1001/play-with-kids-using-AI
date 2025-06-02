/**
 * 模板Prompt系統核心（更新版）
 * 階段4：三大模板實作 - 整合模板註冊中心
 */

import {
  TemplateConfig,
  TemplateInstance,
  TemplateMetadata,
  TemplateStage,
  LearningProgress,
  UserLevel,
  DifficultyConfig,
  AdaptiveGuidanceConfig,
  TemplateError,
  RecoveryStrategy,
  TemplateEvent,
  TemplateEventType,
  TemplateCustomization
} from '../types/template';
import { LearningProgressTracker } from './learning-progress-tracker';
import { PromptEngineeringEngine } from './prompt-engineering-engine';
import { VoicePromptCoach } from './voice-prompt-coach';
import { AdaptiveGuidanceEngine } from './adaptive-guidance-engine';
import { templateRegistry } from '../templates/template-registry';

export class TemplatePromptSystem {
  private instances = new Map<string, TemplateInstance>();
  private progressTracker: LearningProgressTracker;
  private promptEngine: PromptEngineeringEngine;
  private voiceCoach: VoicePromptCoach;
  private adaptiveEngine: AdaptiveGuidanceEngine;

  constructor(
    private readonly config = {
      maxConcurrentTemplates: 10,
      defaultCacheDuration: 300000, // 5分鐘
      progressSyncInterval: 30000, // 30秒
      adaptationSensitivity: 0.7, // 適應敏感度
      debugMode: false,
      autoSave: true
    }
  ) {
    this.progressTracker = new LearningProgressTracker();
    this.promptEngine = new PromptEngineeringEngine();
    this.voiceCoach = new VoicePromptCoach();
    this.adaptiveEngine = new AdaptiveGuidanceEngine();
    
    this.setupEventHandlers();
    
    if (this.config.debugMode) {
      console.log('TemplatePromptSystem initialized with template registry');
    }
  }

  // ===== 模板管理方法（使用註冊中心）=====

  /**
   * 獲取可用模板列表
   */
  async getAvailableTemplates(userLevel?: UserLevel): Promise<TemplateMetadata[]> {
    let templates = templateRegistry.getAllTemplates();
    
    if (!userLevel) {
      return templates.map(t => t.metadata);
    }

    // 根據用戶水平過濾適合的模板
    const suitableTemplates = templates.filter(template => 
      this.isTemplateAppropriate(template, userLevel)
    );

    // 按推薦分數排序
    return suitableTemplates
      .map(template => ({
        template,
        score: this.calculateTemplateRecommendationScore(template.metadata, userLevel)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.template.metadata);
  }

  /**
   * 獲取推薦學習路徑
   */
  async getRecommendedLearningPath(userLevel?: UserLevel): Promise<TemplateMetadata[]> {
    const learningPath = templateRegistry.getRecommendedLearningPath();
    
    if (!userLevel) {
      return learningPath.map(t => t.metadata);
    }

    // 根據用戶水平調整推薦路徑
    const adaptedPath = learningPath.filter(template =>
      this.isTemplateAppropriate(template, userLevel)
    );

    return adaptedPath.map(t => t.metadata);
  }

  /**
   * 按分類獲取模板
   */
  async getTemplatesByCategory(category: string, userLevel?: UserLevel): Promise<TemplateMetadata[]> {
    let templates = templateRegistry.getTemplatesByCategory(category);
    
    if (userLevel) {
      templates = templates.filter(template => 
        this.isTemplateAppropriate(template, userLevel)
      );
    }

    return templates.map(t => t.metadata);
  }

  /**
   * 按年齡獲取模板
   */
  async getTemplatesForAge(age: number): Promise<TemplateMetadata[]> {
    const templates = templateRegistry.getTemplatesForAge(age);
    return templates.map(t => t.metadata);
  }

  /**
   * 搜尋模板
   */
  async searchTemplates(query: string, userLevel?: UserLevel): Promise<TemplateMetadata[]> {
    let templates = templateRegistry.searchTemplates(query);
    
    if (userLevel) {
      templates = templates.filter(template => 
        this.isTemplateAppropriate(template, userLevel)
      );
    }

    return templates.map(t => t.metadata);
  }

  /**
   * 獲取模板統計
   */
  async getTemplateStats(): Promise<any> {
    return templateRegistry.getTemplateStats();
  }

  // ===== 模板實例化方法 =====

  /**
   * 創建模板實例
   */
  async createTemplateInstance(
    templateId: string,
    userId: string,
    customizations: TemplateCustomization[] = []
  ): Promise<TemplateInstance> {
    const template = templateRegistry.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // 獲取用戶水平以調整難度
    const userLevel = await this.progressTracker.getUserLevel(userId);
    
    // 生成適應性指導
    const adaptiveGuidance = await this.adaptiveEngine.generateAdaptiveGuidance(
      userId,
      {
        timeOfDay: this.getCurrentTimeOfDay(),
        sessionLength: 'medium',
        energyLevel: 'medium',
        previousPerformance: userLevel.overall,
        parentPresence: true // 預設有家長陪同
      },
      userLevel,
      [] // 初始無歷史記錄
    );
    
    // 建立進度追蹤
    const progress = await this.progressTracker.startLearningSession(
      userId, 
      templateId, 
      template.stages[0].id
    );

    // 創建實例
    const instance: TemplateInstance = {
      id: this.generateInstanceId(),
      templateId,
      userId,
      metadata: template.metadata,
      stages: await this.adaptStagesForUser(template.stages, adaptiveGuidance.user),
      progress,
      customizations,
      createdAt: new Date(),
      lastModified: new Date()
    };

    // 應用自訂化
    this.applyCustomizations(instance, customizations);

    // 儲存實例
    this.instances.set(instance.id, instance);

    // 檢查併發限制
    await this.manageConcurrentInstances(userId);

    if (this.config.debugMode) {
      console.log(`Template instance created: ${instance.id} for template: ${template.metadata.name}`);
    }

    return instance;
  }

  /**
   * 根據用戶調整階段
   */
  private async adaptStagesForUser(
    stages: TemplateStage[], 
    userLevel: UserLevel
  ): Promise<TemplateStage[]> {
    return stages.map(stage => {
      const adaptedStage = { ...stage };
      
      // 調整提示內容
      adaptedStage.prompt = this.adaptPromptForUser(stage.prompt, userLevel);
      
      // 調整成功標準
      adaptedStage.successCriteria = this.adaptSuccessCriteria(stage.successCriteria, userLevel);
      
      // 調整提示
      adaptedStage.hints = this.adaptHintsForUser(stage.hints, userLevel);
      
      return adaptedStage;
    });
  }

  /**
   * 調整提示內容
   */
  private adaptPromptForUser(prompt: any, userLevel: UserLevel): any {
    const adapted = { ...prompt };
    
    // 根據用戶水平調整例子複雜度
    if (userLevel.overall < 40) {
      // 新手：只顯示基礎例子
      adapted.examples = prompt.examples.filter((ex: any) => ex.level === 'basic');
    } else if (userLevel.overall < 70) {
      // 中級：顯示基礎和良好例子
      adapted.examples = prompt.examples.filter((ex: any) => ex.level !== 'excellent');
    }
    // 高級用戶：顯示所有例子

    // 調整指導策略
    if (userLevel.confidence < 50) {
      adapted.coaching.childEncouragement = [
        ...adapted.coaching.childEncouragement,
        '你做得很好！讓我們慢慢來',
        '沒關係，我們一步一步學習'
      ];
    }

    if (userLevel.parentSupport > 70) {
      adapted.coaching.parentGuidance = [
        ...adapted.coaching.parentGuidance,
        '您的支持對孩子很重要',
        '可以多鼓勵孩子發揮創意'
      ];
    }

    return adapted;
  }

  /**
   * 調整成功標準
   */
  private adaptSuccessCriteria(criteria: any, userLevel: UserLevel): any {
    const adapted = { ...criteria };
    
    // 根據用戶水平調整最低分數要求
    if (userLevel.overall < 40) {
      adapted.minimumScore = Math.max(50, criteria.minimumScore - 15);
    } else if (userLevel.overall > 80) {
      adapted.minimumScore = Math.min(95, criteria.minimumScore + 10);
    }

    // 調整技能門檻
    Object.keys(adapted.skillThresholds).forEach(skill => {
      const baseThreshold = adapted.skillThresholds[skill];
      const userSkillLevel = userLevel.skills[skill] || 50;
      
      if (userSkillLevel < 40) {
        adapted.skillThresholds[skill] = Math.max(30, baseThreshold - 10);
      } else if (userSkillLevel > 80) {
        adapted.skillThresholds[skill] = Math.min(95, baseThreshold + 5);
      }
    });

    return adapted;
  }

  /**
   * 調整提示
   */
  private adaptHintsForUser(hints: any[], userLevel: UserLevel): any[] {
    if (!hints) return [];
    
    return hints.map(hint => {
      const adaptedHint = { ...hint };
      
      // 根據用戶信心度調整提示優先級
      if (userLevel.confidence < 50 && hint.priority === 'low') {
        adaptedHint.priority = 'medium';
      }
      
      return adaptedHint;
    });
  }

  // ===== 模板執行方法 =====

  /**
   * 執行模板階段
   */
  async executeStage(
    instanceId: string,
    stageId: string,
    userInput: string,
    timeSpent: number
  ): Promise<StageExecutionResult> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Template instance not found: ${instanceId}`);
    }

    const stage = instance.stages.find(s => s.id === stageId);
    if (!stage) {
      throw new Error(`Stage not found: ${stageId}`);
    }

    try {
      // 使用 Prompt Engineering 引擎評估輸入
      const qualityScore = await this.promptEngine.analyzePrompt(userInput);
      
      // 記錄嘗試
      const attempt = await this.progressTracker.recordAttempt(
        instance.userId,
        instance.templateId,
        stageId,
        userInput,
        qualityScore,
        timeSpent
      );

      // 檢查是否通過階段
      const passed = this.evaluateStageCompletion(stage, qualityScore);
      
      // 獲取用戶水平以生成適應性建議
      const userLevel = await this.progressTracker.getUserLevel(instance.userId);
      
      // 獲取語音教練建議
      const coachingAdvice = await this.voiceCoach.generateAdvice(
        userInput,
        qualityScore,
        stage.expectedSkills,
        { 
          isChild: true, 
          difficultyLevel: instance.metadata.level,
          currentStage: stageId,
          userLevel: userLevel.overall,
          template: instance.metadata.name
        }
      );

      // 更新實例進度
      if (passed) {
        const nextStageId = this.getNextStageId(instance, stageId);
        instance.progress.currentStage = nextStageId || stageId;
        
        if (!instance.progress.completedStages.includes(stageId)) {
          instance.progress.completedStages.push(stageId);
        }
      }

      instance.progress.lastActiveAt = new Date();
      instance.lastModified = new Date();

      const result: StageExecutionResult = {
        instanceId,
        stageId,
        passed,
        score: qualityScore.overall,
        qualityScore,
        coachingAdvice,
        nextStage: passed ? this.getNextStageId(instance, stageId) : stageId,
        isTemplateCompleted: this.isTemplateCompleted(instance),
        attempt,
        templateProgress: {
          completedStages: instance.progress.completedStages.length,
          totalStages: instance.stages.filter(s => s.isRequired).length,
          currentTemplate: instance.metadata.name
        }
      };

      // 檢查是否需要難度調整
      await this.checkAndAdjustDifficulty(instance, result);

      return result;

    } catch (error) {
      return this.handleStageError(instanceId, stageId, error as Error);
    }
  }

  // ===== 輔助方法 =====

  /**
   * 檢查模板是否適合用戶
   */
  private isTemplateAppropriate(template: TemplateConfig, userLevel: UserLevel): boolean {
    // 檢查難度適配性
    const difficultyMatch = this.calculateDifficultyMatch(template.metadata.level, userLevel);
    if (difficultyMatch < 0.3) return false;

    // 檢查先決技能
    const requiredSkills = template.stages.flatMap(stage => stage.expectedSkills);
    const skillMet = requiredSkills.every(skill => 
      (userLevel.skills[skill] || 0) >= 30 // 基本門檻
    );

    return skillMet;
  }

  /**
   * 計算模板推薦分數
   */
  private calculateTemplateRecommendationScore(
    metadata: TemplateMetadata, 
    userLevel: UserLevel
  ): number {
    let score = 0;

    // 難度適配性 (40%)
    const difficultyMatch = this.calculateDifficultyMatch(metadata.level, userLevel);
    score += difficultyMatch * 40;

    // 興趣偏好 (30%)
    const interestMatch = this.calculateInterestMatch(metadata, userLevel);
    score += interestMatch * 30;

    // 技能發展需求 (30%)
    const skillDevelopmentNeed = this.calculateSkillDevelopmentNeed(metadata, userLevel);
    score += skillDevelopmentNeed * 30;

    return score;
  }

  /**
   * 計算難度匹配度
   */
  private calculateDifficultyMatch(
    templateLevel: 'beginner' | 'intermediate' | 'advanced',
    userLevel: UserLevel
  ): number {
    const levelMap = { beginner: 30, intermediate: 60, advanced: 85 };
    const templateDifficulty = levelMap[templateLevel];
    const userSkill = userLevel.overall;

    // 計算適配度
    const difference = Math.abs(templateDifficulty - userSkill);
    return Math.max(0, (50 - difference) / 50);
  }

  /**
   * 計算興趣匹配度
   */
  private calculateInterestMatch(metadata: TemplateMetadata, userLevel: UserLevel): number {
    const stylePreferences = {
      visual: ['adventure', 'animal-friend'],
      auditory: ['daily-life', 'adventure'],
      kinesthetic: ['adventure', 'animal-friend'],
      mixed: ['daily-life', 'adventure', 'animal-friend']
    };

    const preferredCategories = stylePreferences[userLevel.learningStyle] || [];
    return preferredCategories.includes(metadata.category) ? 1 : 0.5;
  }

  /**
   * 計算技能發展需求匹配度
   */
  private calculateSkillDevelopmentNeed(metadata: TemplateMetadata, userLevel: UserLevel): number {
    const skills = Object.entries(userLevel.skills);
    if (skills.length === 0) return 0.5;

    const weakestSkill = skills.reduce((min, current) => 
      current[1] < min[1] ? current : min
    );

    // 檢查模板是否能幫助提升這個技能
    const skillFocusMap = {
      'daily-life': ['clarity', 'structure'],
      'adventure': ['emotion', 'visual'],
      'animal-friend': ['emotion', 'visual', 'detail']
    };

    const templateSkills = skillFocusMap[metadata.category] || [];
    return templateSkills.includes(weakestSkill[0]) ? 1 : 0.3;
  }

  /**
   * 評估階段完成度
   */
  private evaluateStageCompletion(stage: TemplateStage, qualityScore: any): boolean {
    const criteria = stage.successCriteria;
    
    // 檢查最低分數
    if (qualityScore.overall < criteria.minimumScore) {
      return false;
    }

    // 檢查必要維度
    for (const dimension of criteria.requiredDimensions) {
      if ((qualityScore.dimensions[dimension] || 0) < (criteria.skillThresholds[dimension] || 60)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 獲取下一階段ID
   */
  private getNextStageId(instance: TemplateInstance, currentStageId: string): string | null {
    const currentIndex = instance.stages.findIndex(s => s.id === currentStageId);
    if (currentIndex === -1 || currentIndex === instance.stages.length - 1) {
      return null;
    }
    return instance.stages[currentIndex + 1].id;
  }

  /**
   * 檢查模板是否完成
   */
  private isTemplateCompleted(instance: TemplateInstance): boolean {
    const requiredStages = instance.stages.filter(s => s.isRequired);
    return requiredStages.every(stage => 
      instance.progress.completedStages.includes(stage.id)
    );
  }

  /**
   * 檢查並調整難度
   */
  private async checkAndAdjustDifficulty(
    instance: TemplateInstance, 
    result: StageExecutionResult
  ): Promise<void> {
    const recentAttempts = instance.progress.attempts.slice(-3);
    
    // 如果連續失敗，降低難度
    if (recentAttempts.length >= 3 && recentAttempts.every(a => !a.completed)) {
      await this.adjustInstanceDifficulty(instance, 'decrease');
    }
    // 如果表現很好，提高難度
    else if (recentAttempts.length >= 2 && recentAttempts.every(a => a.score > 85)) {
      await this.adjustInstanceDifficulty(instance, 'increase');
    }
  }

  /**
   * 調整實例難度
   */
  private async adjustInstanceDifficulty(
    instance: TemplateInstance, 
    direction: 'increase' | 'decrease'
  ): Promise<void> {
    const adjustment = direction === 'increase' ? 5 : -5;
    
    // 調整所有未完成階段的成功標準
    for (const stage of instance.stages) {
      if (!instance.progress.completedStages.includes(stage.id)) {
        stage.successCriteria.minimumScore = Math.max(50, 
          Math.min(90, stage.successCriteria.minimumScore + adjustment)
        );
      }
    }

    // 記錄調整
    const customization: TemplateCustomization = {
      type: 'difficulty',
      changes: { direction, adjustment, timestamp: new Date() },
      reason: `自動難度調整：${direction === 'increase' ? '提升' : '降低'}難度`,
      appliedAt: new Date()
    };

    instance.customizations.push(customization);
    instance.lastModified = new Date();

    if (this.config.debugMode) {
      console.log(`Difficulty adjusted for instance ${instance.id}: ${direction}`);
    }
  }

  // ===== 錯誤處理 =====

  private handleStageError(instanceId: string, stageId: string, error: Error): StageExecutionResult {
    const templateError: TemplateError = {
      code: 'STAGE_EXECUTION_ERROR',
      message: error.message,
      severity: 'medium',
      context: { instanceId, stageId },
      recovery: {
        type: 'retry',
        maxAttempts: 3,
        userMessage: '遇到一些問題，讓我們再試一次！'
      }
    };

    return {
      instanceId,
      stageId,
      passed: false,
      score: 0,
      qualityScore: {
        overall: 0,
        dimensions: {},
        improvementAreas: [],
        suggestions: []
      },
      coachingAdvice: {
        encouragement: '別擔心，遇到問題很正常！',
        improvements: ['讓我們稍後再試試看'],
        parentGuidance: ['請協助孩子檢查網路連接']
      },
      nextStage: stageId,
      isTemplateCompleted: false,
      attempt: null,
      error: templateError,
      templateProgress: {
        completedStages: 0,
        totalStages: 1,
        currentTemplate: 'Unknown'
      }
    };
  }

  // ===== 其他方法（保持原有功能）=====

  private generateInstanceId(): string {
    return `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async manageConcurrentInstances(userId: string): Promise<void> {
    const userInstances = Array.from(this.instances.values())
      .filter(instance => instance.userId === userId);

    if (userInstances.length > this.config.maxConcurrentTemplates) {
      const oldest = userInstances
        .filter(instance => !this.isTemplateCompleted(instance))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
      
      if (oldest) {
        this.instances.delete(oldest.id);
      }
    }
  }

  private setupEventHandlers(): void {
    this.progressTracker.addEventListener('achievement-unlocked', (event) => {
      if (this.config.debugMode) {
        console.log(`Achievement unlocked: ${event.data.achievement.title}`);
      }
    });

    this.progressTracker.addEventListener('skill-improved', (event) => {
      if (this.config.debugMode) {
        console.log(`Skill improved: ${event.data.skill} (+${event.data.improvement})`);
      }
    });
  }

  private getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  // 暫時的自訂化應用方法（簡化實作）
  private applyCustomizations(instance: TemplateInstance, customizations: TemplateCustomization[]): void {
    // 實作自訂化邏輯
  }

  // ===== 公開查詢方法 =====

  /**
   * 獲取模板實例
   */
  async getTemplateInstance(instanceId: string): Promise<TemplateInstance | null> {
    return this.instances.get(instanceId) || null;
  }

  /**
   * 獲取用戶的活躍實例
   */
  async getUserActiveInstances(userId: string): Promise<TemplateInstance[]> {
    return Array.from(this.instances.values())
      .filter(instance => 
        instance.userId === userId && 
        !this.isTemplateCompleted(instance)
      );
  }

  /**
   * 獲取模板配置
   */
  async getTemplateConfig(templateId: string): Promise<TemplateConfig | null> {
    return templateRegistry.getTemplate(templateId);
  }
}

// ===== 結果介面定義 =====

export interface StageExecutionResult {
  instanceId: string;
  stageId: string;
  passed: boolean;
  score: number;
  qualityScore: any;
  coachingAdvice: any;
  nextStage: string | null;
  isTemplateCompleted: boolean;
  attempt: any;
  error?: TemplateError;
  templateProgress: {
    completedStages: number;
    totalStages: number;
    currentTemplate: string;
  };
}

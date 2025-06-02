/**
 * 模板Prompt系統核心
 * 階段3：模板系統架構 - 核心系統
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

export class TemplatePromptSystem {
  private templates = new Map<string, TemplateConfig>();
  private instances = new Map<string, TemplateInstance>();
  private progressTracker: LearningProgressTracker;
  private promptEngine: PromptEngineeringEngine;
  private voiceCoach: VoicePromptCoach;

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
    
    this.initializeDefaultTemplates();
    this.setupEventHandlers();
  }

  // ===== 模板管理方法 =====

  /**
   * 註冊新模板
   */
  async registerTemplate(templateConfig: TemplateConfig): Promise<void> {
    // 驗證模板配置
    this.validateTemplateConfig(templateConfig);
    
    // 儲存模板
    this.templates.set(templateConfig.metadata.id, templateConfig);
    
    if (this.config.debugMode) {
      console.log(`Template registered: ${templateConfig.metadata.name}`);
    }
  }

  /**
   * 獲取可用模板列表
   */
  async getAvailableTemplates(userLevel?: UserLevel): Promise<TemplateMetadata[]> {
    const templates = Array.from(this.templates.values());
    
    if (!userLevel) {
      return templates.map(t => t.metadata);
    }

    // 根據用戶水平過濾適合的模板
    return templates
      .filter(template => this.isTemplateAppropriate(template, userLevel))
      .map(t => t.metadata)
      .sort((a, b) => this.calculateTemplateRecommendationScore(b, userLevel) - 
                       this.calculateTemplateRecommendationScore(a, userLevel));
  }

  /**
   * 檢查模板是否適合用戶
   */
  private isTemplateAppropriate(template: TemplateConfig, userLevel: UserLevel): boolean {
    const metadata = template.metadata;
    
    // 檢查難度適配性
    const difficultyMatch = this.calculateDifficultyMatch(metadata.level, userLevel);
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

    // 計算適配度 (用戶技能和模板難度的匹配)
    const difference = Math.abs(templateDifficulty - userSkill);
    return Math.max(0, (50 - difference) / 50);
  }

  /**
   * 計算興趣匹配度
   */
  private calculateInterestMatch(metadata: TemplateMetadata, userLevel: UserLevel): number {
    // 基於學習風格和過往表現推測興趣
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
    // 找出用戶最弱的技能
    const skills = Object.entries(userLevel.skills);
    if (skills.length === 0) return 0.5;

    const weakestSkill = skills.reduce((min, current) => 
      current[1] < min[1] ? current : min
    );

    // 檢查模板是否能幫助提升這個技能
    // 這裡簡化為根據模板類別判斷
    const skillFocusMap = {
      'daily-life': ['clarity', 'structure'],
      'adventure': ['emotion', 'visual'],
      'animal-friend': ['creativity', 'detail']
    };

    const templateSkills = skillFocusMap[metadata.category] || [];
    return templateSkills.includes(weakestSkill[0]) ? 1 : 0.3;
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
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // 獲取用戶水平以調整難度
    const userLevel = await this.progressTracker.getUserLevel(userId);
    
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
      stages: await this.adaptStagesForUser(template.stages, userLevel),
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
      console.log(`Template instance created: ${instance.id}`);
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
    return stages.map(stage => ({
      ...stage,
      prompt: this.adaptPromptForUser(stage.prompt, userLevel),
      successCriteria: this.adaptSuccessCriteria(stage.successCriteria, userLevel)
    }));
  }

  /**
   * 調整提示內容
   */
  private adaptPromptForUser(prompt: any, userLevel: UserLevel): any {
    const adapted = { ...prompt };
    
    // 根據用戶水平調整例子複雜度
    if (userLevel.overall < 40) {
      adapted.examples = prompt.examples.filter((ex: any) => ex.level === 'basic');
    } else if (userLevel.overall > 70) {
      adapted.examples = prompt.examples.filter((ex: any) => ex.level !== 'basic');
    }

    // 調整指導策略
    if (userLevel.confidence < 50) {
      adapted.coaching.childEncouragement = [
        ...adapted.coaching.childEncouragement,
        '你做得很好！讓我們慢慢來',
        '沒關係，我們一步一步學習'
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
      adapted.minimumScore = Math.max(60, criteria.minimumScore - 10);
    } else if (userLevel.overall > 70) {
      adapted.minimumScore = Math.min(90, criteria.minimumScore + 5);
    }

    return adapted;
  }

  /**
   * 應用自訂化設定
   */
  private applyCustomizations(
    instance: TemplateInstance, 
    customizations: TemplateCustomization[]
  ): void {
    for (const customization of customizations) {
      switch (customization.type) {
        case 'difficulty':
          this.applyDifficultyCustomization(instance, customization.changes);
          break;
        case 'content':
          this.applyContentCustomization(instance, customization.changes);
          break;
        case 'timing':
          this.applyTimingCustomization(instance, customization.changes);
          break;
        case 'style':
          this.applyStyleCustomization(instance, customization.changes);
          break;
      }
      
      instance.lastModified = new Date();
    }
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
      
      // 獲取語音教練建議
      const coachingAdvice = await this.voiceCoach.generateAdvice(
        userInput,
        qualityScore,
        stage.expectedSkills,
        { 
          isChild: true, 
          difficultyLevel: instance.metadata.level,
          currentStage: stageId 
        }
      );

      // 更新實例進度
      if (passed) {
        instance.progress.currentStage = this.getNextStageId(instance, stageId);
        instance.progress.completedStages.push(stageId);
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
        attempt
      };

      // 檢查是否需要難度調整
      await this.checkAndAdjustDifficulty(instance, result);

      return result;

    } catch (error) {
      return this.handleStageError(instanceId, stageId, error as Error);
    }
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
      error: templateError
    };
  }

  // ===== 輔助方法 =====

  private validateTemplateConfig(config: TemplateConfig): void {
    if (!config.metadata.id) {
      throw new Error('Template ID is required');
    }
    if (!config.stages || config.stages.length === 0) {
      throw new Error('Template must have at least one stage');
    }
    // 更多驗證邏輯...
  }

  private generateInstanceId(): string {
    return `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async manageConcurrentInstances(userId: string): Promise<void> {
    const userInstances = Array.from(this.instances.values())
      .filter(instance => instance.userId === userId);

    if (userInstances.length > this.config.maxConcurrentTemplates) {
      // 移除最舊的未完成實例
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

  // 暫時的自訂化應用方法（簡化實作）
  private applyDifficultyCustomization(instance: TemplateInstance, changes: any): void {
    // 實作難度自訂化邏輯
  }

  private applyContentCustomization(instance: TemplateInstance, changes: any): void {
    // 實作內容自訂化邏輯
  }

  private applyTimingCustomization(instance: TemplateInstance, changes: any): void {
    // 實作時間自訂化邏輯
  }

  private applyStyleCustomization(instance: TemplateInstance, changes: any): void {
    // 實作風格自訂化邏輯
  }

  // ===== 初始化預設模板 =====

  private initializeDefaultTemplates(): void {
    // 這將在後續階段4中實作具體的三大模板
    if (this.config.debugMode) {
      console.log('TemplatePromptSystem initialized with default templates');
    }
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
    return this.templates.get(templateId) || null;
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
}

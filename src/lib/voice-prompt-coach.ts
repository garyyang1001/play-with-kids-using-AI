/**
 * 階段2核心：語音 Prompt 教練
 * 結合語音AI與Prompt Engineering，提供即時語音教學
 */

import { EventEmitter } from 'events';
import { VoiceAIClient } from './voice-ai-client';
import { PromptEngineeringEngine } from './prompt-engineering-engine';
import {
  VoiceCoachConfig,
  VoiceCoachSession,
  VoiceCoachInteraction,
  ParentGuidance,
  PromptQualityScore,
  PromptOptimizationSuggestion,
  LearningProgress
} from './types/prompt-engineering';
import { VoiceAIConfig } from './types/voice';

/**
 * 語音 Prompt 教練主類別
 */
export class VoicePromptCoach extends EventEmitter {
  private voiceClient: VoiceAIClient;
  private promptEngine: PromptEngineeringEngine;
  private config: VoiceCoachConfig;
  private currentSession: VoiceCoachSession | null = null;
  private learningProgress: LearningProgress | null = null;
  private isActive = false;

  constructor(
    voiceConfig: VoiceAIConfig,
    promptConfig: any,
    coachConfig: VoiceCoachConfig
  ) {
    super();
    this.voiceClient = new VoiceAIClient(voiceConfig);
    this.promptEngine = new PromptEngineeringEngine(promptConfig);
    this.config = coachConfig;
    
    this.setupEventListeners();
  }

  /**
   * 設置事件監聽器
   */
  private setupEventListeners(): void {
    // 語音客戶端事件
    this.voiceClient.on('voiceInteraction', this.handleVoiceInteraction.bind(this));
    this.voiceClient.on('connectionStateChange', this.handleConnectionStateChange.bind(this));
    
    // Prompt引擎事件
    this.promptEngine.on('promptEngineering', this.handlePromptEngineering.bind(this));
  }

  /**
   * 開始教學會話
   */
  async startCoachingSession(learningGoals: string[] = []): Promise<VoiceCoachSession> {
    try {
      // 連接語音AI
      if (!this.voiceClient.isConnected) {
        await this.voiceClient.connect();
      }
      
      // 創建新會話
      this.currentSession = {
        sessionId: this.generateSessionId(),
        startTime: Date.now(),
        config: this.config,
        interactions: [],
        learningGoals,
        achievedGoals: [],
        sessionScore: 0,
        nextSteps: []
      };
      
      this.isActive = true;
      
      // 發送開場白
      await this.sendWelcomeMessage();
      
      this.emit('sessionStarted', this.currentSession);
      return this.currentSession;
      
    } catch (error) {
      this.emit('error', { error: '開始會話失敗', details: error });
      throw error;
    }
  }

  /**
   * 結束教學會話
   */
  async endCoachingSession(): Promise<VoiceCoachSession> {
    if (!this.currentSession) {
      throw new Error('沒有進行中的會話');
    }
    
    this.isActive = false;
    this.currentSession.endTime = Date.now();
    this.currentSession.sessionScore = this.calculateSessionScore();
    this.currentSession.nextSteps = this.generateNextSteps();
    
    // 發送結束訊息
    await this.sendFarewellMessage();
    
    const completedSession = { ...this.currentSession };
    this.currentSession = null;
    
    this.emit('sessionCompleted', completedSession);
    return completedSession;
  }

  /**
   * 處理用戶語音輸入
   */
  async processUserInput(userInput: string): Promise<void> {
    if (!this.isActive || !this.currentSession) {
      return;
    }
    
    try {
      // 分析用戶的Prompt
      const analysisResult = await this.promptEngine.performRealTimeAnalysis(userInput);
      
      // 生成教學回應
      const coachResponse = await this.generateCoachResponse(userInput, analysisResult);
      
      // 記錄互動
      const interaction: VoiceCoachInteraction = {
        timestamp: Date.now(),
        type: 'prompt_analysis',
        userInput,
        coachResponse: coachResponse.text,
        audioResponse: coachResponse.audioData,
        visualAids: coachResponse.visualAids,
        learningPoints: coachResponse.learningPoints
      };
      
      this.currentSession.interactions.push(interaction);
      
      // 發送語音回應
      if (coachResponse.shouldSpeak) {
        await this.speakResponse(coachResponse.text);
      }
      
      // 更新學習進度
      this.updateLearningProgress(analysisResult);
      
      this.emit('interactionCompleted', interaction);
      
    } catch (error) {
      this.emit('error', { error: '處理用戶輸入失敗', details: error });
    }
  }

  /**
   * 生成教練回應
   */
  private async generateCoachResponse(
    userInput: string, 
    analysisResult: any
  ): Promise<{
    text: string;
    audioData?: ArrayBuffer;
    visualAids?: string[];
    learningPoints: string[];
    shouldSpeak: boolean;
  }> {
    const { qualityScore, suggestions } = analysisResult;
    
    let responseText = '';
    const learningPoints: string[] = [];
    const visualAids: string[] = [];
    
    // 根據品質評分生成回應
    if (qualityScore.overall >= 80) {
      responseText = this.generateExcellentResponse(userInput, qualityScore);
      learningPoints.push('優秀的描述能力');
    } else if (qualityScore.overall >= 60) {
      responseText = this.generateGoodResponse(userInput, qualityScore, suggestions);
      learningPoints.push('描述有進步空間');
    } else {
      responseText = this.generateNeedsImprovementResponse(userInput, qualityScore, suggestions);
      learningPoints.push('需要更多練習');
    }
    
    // 加入具體的改善建議
    if (suggestions.length > 0) {
      responseText += '\n\n' + this.formatSuggestions(suggestions.slice(0, 2));
      learningPoints.push(...suggestions.map(s => s.explanation));
    }
    
    // 根據配置調整語調
    responseText = this.adjustToneForPersonality(responseText);
    
    return {
      text: responseText,
      learningPoints,
      visualAids,
      shouldSpeak: true
    };
  }

  /**
   * 生成優秀回應
   */
  private generateExcellentResponse(userInput: string, qualityScore: PromptQualityScore): string {
    const encouragements = [
      '哇！你的描述真的很棒！',
      '太厲害了！你說得好詳細！',
      '完美！你真的很會描述！',
      '讚！這個描述很生動！'
    ];
    
    const strengths = qualityScore.strengths.length > 0 ? 
      `特別是你的${qualityScore.strengths.join('和')}都很出色。` : '';
    
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    return `${encouragement} ${strengths} 我已經可以想像出這個美麗的畫面了！`;
  }

  /**
   * 生成良好回應
   */
  private generateGoodResponse(
    userInput: string, 
    qualityScore: PromptQualityScore, 
    suggestions: PromptOptimizationSuggestion[]
  ): string {
    const encouragements = [
      '不錯喔！你的描述已經很好了！',
      '很棒！我聽得出你很用心在描述！',
      '好的開始！你想得很仔細！'
    ];
    
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    if (qualityScore.strengths.length > 0) {
      return `${encouragement} 你的${qualityScore.strengths[0]}特別好。`;
    }
    
    return `${encouragement} 讓我們一起讓它變得更生動！`;
  }

  /**
   * 生成需要改善回應
   */
  private generateNeedsImprovementResponse(
    userInput: string, 
    qualityScore: PromptQualityScore, 
    suggestions: PromptOptimizationSuggestion[]
  ): string {
    const encouragements = [
      '很好的想法！讓我們一起讓它更棒！',
      '不錯的開始！我們可以加入更多細節！',
      '有趣的想法！讓我幫你把它說得更清楚！'
    ];
    
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    return `${encouragement}`;
  }

  /**
   * 格式化建議
   */
  private formatSuggestions(suggestions: PromptOptimizationSuggestion[]): string {
    if (suggestions.length === 0) return '';
    
    let formatted = '讓我給你一些小建議：\n';
    
    suggestions.forEach((suggestion, index) => {
      formatted += `${index + 1}. ${suggestion.explanation}\n`;
      if (suggestion.example) {
        formatted += `   例如：${suggestion.example}\n`;
      }
    });
    
    return formatted;
  }

  /**
   * 根據個性調整語調
   */
  private adjustToneForPersonality(text: string): string {
    switch (this.config.personality) {
      case 'encouraging':
        return text.replace(/！/g, '！✨').replace(/。/g, '！');
      case 'gentle':
        return text.replace(/！/g, '。').replace(/哇|太棒了/g, '很好');
      case 'enthusiastic':
        return text.replace(/！/g, '！！').replace(/。/g, '！');
      case 'patient':
        return `慢慢來，${text}`;
      default:
        return text;
    }
  }

  /**
   * 語音回應
   */
  private async speakResponse(text: string): Promise<void> {
    try {
      // 透過語音AI發送回應
      this.voiceClient.sendTextMessage(text);
    } catch (error) {
      console.error('語音回應失敗:', error);
    }
  }

  /**
   * 發送歡迎訊息
   */
  private async sendWelcomeMessage(): Promise<void> {
    const welcomeMessages = {
      beginner: '你好！我是你的AI小助手！今天我們要一起學習如何跟AI說話，讓它幫我們做出超棒的影片！準備好了嗎？',
      intermediate: '嗨！很高興見到你！我們今天要練習如何描述得更生動，讓AI做出更棒的影片！',
      advanced: '歡迎！你已經很會描述了，今天我們要挑戰更有創意的表達方式！'
    };
    
    const message = welcomeMessages[this.config.difficulty];
    await this.speakResponse(message);
  }

  /**
   * 發送結束訊息
   */
  private async sendFarewellMessage(): Promise<void> {
    if (!this.currentSession) return;
    
    const score = this.currentSession.sessionScore;
    let message = '';
    
    if (score >= 80) {
      message = '哇！你今天表現得太棒了！你已經是描述小達人了！';
    } else if (score >= 60) {
      message = '你今天學得很好！持續練習，你會變得更厲害！';
    } else {
      message = '你今天很努力！記住我們學到的小技巧，下次會更棒！';
    }
    
    message += ` 今天我們一共練習了${this.currentSession.interactions.length}次，每一次都有進步！`;
    
    await this.speakResponse(message);
  }

  /**
   * 計算會話評分
   */
  private calculateSessionScore(): number {
    if (!this.currentSession || this.currentSession.interactions.length === 0) {
      return 0;
    }
    
    // 基於互動次數和學習進度計算
    const interactionCount = this.currentSession.interactions.length;
    const achievedGoalsRatio = this.currentSession.achievedGoals.length / 
                              Math.max(this.currentSession.learningGoals.length, 1);
    
    const baseScore = Math.min(interactionCount * 10, 60);
    const goalBonus = achievedGoalsRatio * 40;
    
    return Math.round(baseScore + goalBonus);
  }

  /**
   * 生成下一步建議
   */
  private generateNextSteps(): string[] {
    const steps = [];
    
    if (!this.currentSession) return steps;
    
    const interactionCount = this.currentSession.interactions.length;
    
    if (interactionCount < 3) {
      steps.push('多練習基本描述');
    } else if (interactionCount < 6) {
      steps.push('嘗試加入更多細節');
    } else {
      steps.push('挑戰更複雜的場景');
    }
    
    steps.push('複習今天學到的技巧');
    steps.push('和家人分享學習成果');
    
    return steps;
  }

  /**
   * 更新學習進度
   */
  private updateLearningProgress(analysisResult: any): void {
    if (!this.learningProgress) {
      this.learningProgress = this.initializeLearningProgress();
    }
    
    const { qualityScore } = analysisResult;
    
    // 更新技能等級
    this.learningProgress.skillLevels.clarity = this.updateSkill(
      this.learningProgress.skillLevels.clarity, 
      qualityScore.dimensions.clarity
    );
    
    this.learningProgress.skillLevels.detail = this.updateSkill(
      this.learningProgress.skillLevels.detail, 
      qualityScore.dimensions.detail
    );
    
    this.learningProgress.skillLevels.emotion = this.updateSkill(
      this.learningProgress.skillLevels.emotion, 
      qualityScore.dimensions.emotion
    );
    
    // 更新統計
    this.learningProgress.totalPrompts++;
    this.learningProgress.totalOptimizations++;
    this.learningProgress.lastActiveDate = Date.now();
    
    this.emit('learningProgressUpdated', this.learningProgress);
  }

  /**
   * 更新技能等級
   */
  private updateSkill(currentLevel: number, newScore: number): number {
    // 漸進式學習：新分數影響較小，避免大幅波動
    return Math.round(currentLevel * 0.8 + newScore * 0.2);
  }

  /**
   * 初始化學習進度
   */
  private initializeLearningProgress(): LearningProgress {
    return {
      userId: 'current_user',
      skillLevels: {
        clarity: 50,
        creativity: 50,
        detail: 50,
        emotion: 50,
        structure: 50
      },
      totalPrompts: 0,
      totalOptimizations: 0,
      averageImprovement: 0,
      badges: [],
      currentStreak: 0,
      lastActiveDate: Date.now()
    };
  }

  /**
   * 處理語音互動事件
   */
  private handleVoiceInteraction(event: any): void {
    if (!this.isActive) return;
    
    if (event.type === 'user_speech_end') {
      // 用戶說話結束，準備分析
      this.emit('userSpeechCompleted');
    }
  }

  /**
   * 處理連接狀態變化
   */
  private handleConnectionStateChange(state: any): void {
    this.emit('connectionStateChanged', state);
  }

  /**
   * 處理Prompt引擎事件
   */
  private handlePromptEngineering(event: any): void {
    this.emit('promptAnalysisUpdate', event);
  }

  /**
   * 生成會話ID
   */
  private generateSessionId(): string {
    return `coach_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 暫停會話
   */
  pauseSession(): void {
    this.isActive = false;
    this.emit('sessionPaused');
  }

  /**
   * 恢復會話
   */
  resumeSession(): void {
    this.isActive = true;
    this.emit('sessionResumed');
  }

  /**
   * 獲取當前會話狀態
   */
  getSessionStatus(): {
    isActive: boolean;
    session: VoiceCoachSession | null;
    progress: LearningProgress | null;
  } {
    return {
      isActive: this.isActive,
      session: this.currentSession,
      progress: this.learningProgress
    };
  }

  /**
   * 更新教練配置
   */
  updateConfig(newConfig: Partial<VoiceCoachConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  /**
   * 清理資源
   */
  async cleanup(): Promise<void> {
    if (this.currentSession) {
      await this.endCoachingSession();
    }
    
    this.voiceClient.disconnect();
    this.removeAllListeners();
  }
}
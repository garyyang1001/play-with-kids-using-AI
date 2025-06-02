/**
 * 階段2核心：Prompt Engineering 引擎
 * 負責分析、評分和優化用戶的 Prompt
 */

import { EventEmitter } from 'events';
import {
  PromptEngineeringConfig,
  PromptQualityScore,
  PromptQualityDimensions,
  PromptOptimizationSuggestion,
  RealTimeAnalysisResult,
  PromptEvolution,
  PromptEngineeringEvent,
  PromptEngineeringError
} from './types/prompt-engineering';

/**
 * Prompt Engineering 引擎主類別
 */
export class PromptEngineeringEngine extends EventEmitter {
  private config: PromptEngineeringConfig;
  private analysisHistory: RealTimeAnalysisResult[] = [];
  private evolutionHistory: PromptEvolution[] = [];

  constructor(config: PromptEngineeringConfig) {
    super();
    this.config = config;
  }

  /**
   * 分析 Prompt 品質
   */
  async analyzePromptQuality(prompt: string): Promise<PromptQualityScore> {
    try {
      this.emitEvent({
        type: 'analysis_started',
        data: { prompt }
      });

      // 各維度分析
      const dimensions = await this.analyzeDimensions(prompt);
      
      // 計算整體評分
      const overall = this.calculateOverallScore(dimensions);
      
      // 識別改善領域和優勢
      const { improvementAreas, strengths } = this.identifyAreasAndStrengths(dimensions);
      
      // 生成建議行動
      const recommendedActions = await this.generateRecommendedActions(prompt, dimensions);
      
      const qualityScore: PromptQualityScore = {
        overall,
        dimensions,
        improvementAreas,
        strengths,
        recommendedActions,
        confidenceLevel: this.calculateConfidenceLevel(prompt, dimensions)
      };

      return qualityScore;
    } catch (error) {
      this.handleError('品質分析失敗', 'ANALYSIS_FAILED', { prompt, error });
      throw error;
    }
  }

  /**
   * 分析各維度得分
   */
  private async analyzeDimensions(prompt: string): Promise<PromptQualityDimensions> {
    const clarity = this.analyzeClarityScore(prompt);
    const detail = this.analyzeDetailScore(prompt);
    const emotion = this.analyzeEmotionScore(prompt);
    const visual = this.analyzeVisualScore(prompt);
    const structure = this.analyzeStructureScore(prompt);

    return { clarity, detail, emotion, visual, structure };
  }

  /**
   * 分析清晰度得分
   */
  private analyzeClarityScore(prompt: string): number {
    let score = 50; // 基礎分數
    
    // 長度檢查
    if (prompt.length >= 10 && prompt.length <= 200) {
      score += 20;
    } else if (prompt.length < 10) {
      score -= 20;
    } else if (prompt.length > 300) {
      score -= 10;
    }
    
    // 語句完整性
    if (this.hasCompleteStructure(prompt)) {
      score += 15;
    }
    
    // 避免模糊詞語
    const vagueWords = ['東西', '什麼', '那個', '一些', '很多'];
    const vagueCount = vagueWords.filter(word => prompt.includes(word)).length;
    score -= vagueCount * 5;
    
    // 具體名詞檢查
    const concreteNouns = this.countConcreteNouns(prompt);
    score += Math.min(concreteNouns * 3, 15);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 分析細節豐富度得分
   */
  private analyzeDetailScore(prompt: string): number {
    let score = 40; // 基礎分數
    
    // 形容詞數量
    const adjectives = this.countAdjectives(prompt);
    score += Math.min(adjectives * 5, 25);
    
    // 顏色描述
    const colors = ['紅', '藍', '綠', '黃', '紫', '橙', '白', '黑', '粉', '金'];
    const colorCount = colors.filter(color => prompt.includes(color)).length;
    score += colorCount * 8;
    
    // 尺寸描述
    const sizes = ['大', '小', '巨', '微', '高', '矮', '寬', '窄', '厚', '薄'];
    const sizeCount = sizes.filter(size => prompt.includes(size)).length;
    score += sizeCount * 6;
    
    // 材質描述
    const materials = ['木', '金屬', '玻璃', '布', '石', '塑膠', '紙', '毛'];
    const materialCount = materials.filter(material => prompt.includes(material)).length;
    score += materialCount * 7;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 分析情感表達得分
   */
  private analyzeEmotionScore(prompt: string): number {
    let score = 30; // 基礎分數
    
    // 情感詞語
    const emotionWords = ['開心', '快樂', '興奮', '溫馨', '驚喜', '神奇', '美麗', '可愛', '溫暖', '舒服'];
    const emotionCount = emotionWords.filter(word => prompt.includes(word)).length;
    score += emotionCount * 10;
    
    // 動作動詞
    const actionVerbs = ['跳', '跑', '笑', '唱', '跳舞', '玩', '擁抱', '親吻', '微笑'];
    const actionCount = actionVerbs.filter(verb => prompt.includes(verb)).length;
    score += actionCount * 8;
    
    // 感官描述
    const sensoryWords = ['香', '甜', '軟', '響', '亮', '暖', '涼', '順'];
    const sensoryCount = sensoryWords.filter(word => prompt.includes(word)).length;
    score += sensoryCount * 12;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 分析視覺描述得分
   */
  private analyzeVisualScore(prompt: string): number {
    let score = 35; // 基礎分數
    
    // 場景描述
    const scenes = ['公園', '花園', '房間', '廚房', '學校', '海邊', '山上', '森林'];
    const sceneCount = scenes.filter(scene => prompt.includes(scene)).length;
    score += sceneCount * 10;
    
    // 光線描述
    const lighting = ['陽光', '月光', '燈光', '亮', '暗', '閃', '發光'];
    const lightCount = lighting.filter(light => prompt.includes(light)).length;
    score += lightCount * 12;
    
    // 動態描述
    const movements = ['飄', '搖', '轉', '滾', '飛', '流', '動'];
    const movementCount = movements.filter(movement => prompt.includes(movement)).length;
    score += movementCount * 8;
    
    // 構圖描述
    const composition = ['前面', '後面', '旁邊', '中間', '角落', '遠方', '近處'];
    const compositionCount = composition.filter(comp => prompt.includes(comp)).length;
    score += compositionCount * 9;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 分析結構完整性得分
   */
  private analyzeStructureScore(prompt: string): number {
    let score = 40; // 基礎分數
    
    // 主體檢查
    if (this.hasSubject(prompt)) {
      score += 20;
    }
    
    // 動作檢查
    if (this.hasAction(prompt)) {
      score += 20;
    }
    
    // 場景檢查
    if (this.hasScene(prompt)) {
      score += 15;
    }
    
    // 邏輯連接詞
    const connectors = ['和', '然後', '接著', '同時', '在', '當'];
    const connectorCount = connectors.filter(conn => prompt.includes(conn)).length;
    score += Math.min(connectorCount * 3, 15);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 計算整體評分
   */
  private calculateOverallScore(dimensions: PromptQualityDimensions): number {
    const weights = {
      clarity: 0.25,
      detail: 0.2,
      emotion: 0.2,
      visual: 0.2,
      structure: 0.15
    };
    
    return Math.round(
      dimensions.clarity * weights.clarity +
      dimensions.detail * weights.detail +
      dimensions.emotion * weights.emotion +
      dimensions.visual * weights.visual +
      dimensions.structure * weights.structure
    );
  }

  /**
   * 識別改善領域和優勢
   */
  private identifyAreasAndStrengths(dimensions: PromptQualityDimensions): {
    improvementAreas: string[];
    strengths: string[];
  } {
    const improvementAreas: string[] = [];
    const strengths: string[] = [];
    
    Object.entries(dimensions).forEach(([key, value]) => {
      const dimensionName = this.getDimensionName(key);
      if (value < 60) {
        improvementAreas.push(dimensionName);
      } else if (value >= 80) {
        strengths.push(dimensionName);
      }
    });
    
    return { improvementAreas, strengths };
  }

  /**
   * 生成優化建議
   */
  async generateOptimizationSuggestions(
    prompt: string, 
    qualityScore: PromptQualityScore
  ): Promise<PromptOptimizationSuggestion[]> {
    const suggestions: PromptOptimizationSuggestion[] = [];
    
    // 基於各維度得分生成建議
    if (qualityScore.dimensions.clarity < 70) {
      suggestions.push(...this.generateClaritySuggestions(prompt));
    }
    
    if (qualityScore.dimensions.detail < 70) {
      suggestions.push(...this.generateDetailSuggestions(prompt));
    }
    
    if (qualityScore.dimensions.emotion < 70) {
      suggestions.push(...this.generateEmotionSuggestions(prompt));
    }
    
    if (qualityScore.dimensions.visual < 70) {
      suggestions.push(...this.generateVisualSuggestions(prompt));
    }
    
    if (qualityScore.dimensions.structure < 70) {
      suggestions.push(...this.generateStructureSuggestions(prompt));
    }
    
    // 按優先級排序
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }).slice(0, this.config.maxSuggestions);
  }

  /**
   * 生成清晰度建議
   */
  private generateClaritySuggestions(prompt: string): PromptOptimizationSuggestion[] {
    const suggestions: PromptOptimizationSuggestion[] = [];
    
    if (prompt.length < 10) {
      suggestions.push({
        type: 'add',
        priority: 'high',
        category: 'clarity',
        suggestedText: '加入更多具體描述',
        explanation: '描述太簡短，需要更多細節讓AI理解你的想法',
        example: '例如：「小朋友」→「一個穿著紅色衣服的可愛小朋友」'
      });
    }
    
    if (this.hasVagueWords(prompt)) {
      suggestions.push({
        type: 'modify',
        priority: 'medium',
        category: 'clarity',
        suggestedText: '用具體詞語替換模糊詞語',
        explanation: '避免使用「東西」、「什麼」等模糊詞語',
        example: '「什麼動物」→「小貓咪」或「小狗狗」'
      });
    }
    
    return suggestions;
  }

  /**
   * 生成細節建議
   */
  private generateDetailSuggestions(prompt: string): PromptOptimizationSuggestion[] {
    const suggestions: PromptOptimizationSuggestion[] = [];
    
    if (!this.hasColorDescription(prompt)) {
      suggestions.push({
        type: 'add',
        priority: 'medium',
        category: 'detail',
        suggestedText: '加入顏色描述',
        explanation: '顏色讓畫面更生動，更容易想像',
        example: '「花朵」→「粉紅色的花朵」'
      });
    }
    
    if (!this.hasSizeDescription(prompt)) {
      suggestions.push({
        type: 'add',
        priority: 'medium',
        category: 'detail',
        suggestedText: '描述大小或尺寸',
        explanation: '大小描述幫助建立比例感',
        example: '「房子」→「小小的房子」'
      });
    }
    
    return suggestions;
  }

  /**
   * 生成情感建議
   */
  private generateEmotionSuggestions(prompt: string): PromptOptimizationSuggestion[] {
    const suggestions: PromptOptimizationSuggestion[] = [];
    
    if (!this.hasEmotionalWords(prompt)) {
      suggestions.push({
        type: 'add',
        priority: 'high',
        category: 'emotion',
        suggestedText: '加入情感詞語',
        explanation: '情感讓故事更有溫度，更吸引人',
        example: '「小朋友玩」→「小朋友開心地玩」'
      });
    }
    
    return suggestions;
  }

  /**
   * 生成視覺建議
   */
  private generateVisualSuggestions(prompt: string): PromptOptimizationSuggestion[] {
    const suggestions: PromptOptimizationSuggestion[] = [];
    
    if (!this.hasSceneDescription(prompt)) {
      suggestions.push({
        type: 'add',
        priority: 'medium',
        category: 'visual',
        suggestedText: '描述場景背景',
        explanation: '場景讓故事有完整的環境',
        example: '加入「在公園裡」、「在房間中」等場景描述'
      });
    }
    
    return suggestions;
  }

  /**
   * 生成結構建議
   */
  private generateStructureSuggestions(prompt: string): PromptOptimizationSuggestion[] {
    const suggestions: PromptOptimizationSuggestion[] = [];
    
    if (!this.hasSubject(prompt)) {
      suggestions.push({
        type: 'add',
        priority: 'high',
        category: 'structure',
        suggestedText: '明確指出主角',
        explanation: '誰是故事的主角？',
        example: '「小女孩」、「小狗」、「媽媽」'
      });
    }
    
    if (!this.hasAction(prompt)) {
      suggestions.push({
        type: 'add',
        priority: 'high',
        category: 'structure',
        suggestedText: '描述動作行為',
        explanation: '主角在做什麼？',
        example: '「跑步」、「畫畫」、「吃飯」'
      });
    }
    
    return suggestions;
  }

  /**
   * 執行即時分析
   */
  async performRealTimeAnalysis(prompt: string): Promise<RealTimeAnalysisResult> {
    const startTime = Date.now();
    
    try {
      const qualityScore = await this.analyzePromptQuality(prompt);
      const suggestions = await this.generateOptimizationSuggestions(prompt, qualityScore);
      
      const result: RealTimeAnalysisResult = {
        timestamp: Date.now(),
        inputPrompt: prompt,
        qualityScore,
        suggestions,
        parentGuidance: this.generateParentGuidance(prompt, qualityScore),
        estimatedVideoQuality: this.estimateVideoQuality(qualityScore),
        processingTime: Date.now() - startTime
      };
      
      this.analysisHistory.push(result);
      
      this.emitEvent({
        type: 'analysis_completed',
        data: result
      });
      
      return result;
    } catch (error) {
      this.handleError('即時分析失敗', 'REALTIME_ANALYSIS_FAILED', { prompt, error });
      throw error;
    }
  }

  /**
   * 生成家長引導
   */
  private generateParentGuidance(prompt: string, qualityScore: PromptQualityScore): any {
    const childLevel = qualityScore.overall >= 70 ? 'advanced' : 
                     qualityScore.overall >= 50 ? 'intermediate' : 'beginner';
    
    return {
      situation: `孩子目前的描述水平：${this.getLevelDescription(childLevel)}`,
      childLevel,
      suggestedQuestions: this.getSuggestedQuestions(qualityScore),
      encouragementTips: this.getEncouragementTips(qualityScore),
      commonMistakes: this.getCommonMistakes(childLevel),
      nextSteps: this.getNextSteps(qualityScore),
      timeEstimate: 3
    };
  }

  /**
   * 估算影片品質
   */
  private estimateVideoQuality(qualityScore: PromptQualityScore): number {
    return Math.round(qualityScore.overall * 0.8 + 20); // 80-100 範圍
  }

  /**
   * 計算信心度
   */
  private calculateConfidenceLevel(prompt: string, dimensions: PromptQualityDimensions): number {
    const promptLength = prompt.length;
    const lengthFactor = Math.min(promptLength / 50, 1); // 長度因子
    const consistencyFactor = this.calculateConsistency(dimensions); // 一致性因子
    
    return Math.min(lengthFactor * 0.4 + consistencyFactor * 0.6, 1);
  }

  /**
   * 計算維度一致性
   */
  private calculateConsistency(dimensions: PromptQualityDimensions): number {
    const scores = Object.values(dimensions);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - average, 2), 0) / scores.length;
    
    return Math.max(0, 1 - variance / 1000); // 標準化到 0-1
  }

  // 輔助方法
  private hasCompleteStructure(prompt: string): boolean {
    return prompt.includes('。') || prompt.length > 15;
  }

  private countConcreteNouns(prompt: string): number {
    const nouns = ['小朋友', '房子', '花', '樹', '貓', '狗', '車', '書'];
    return nouns.filter(noun => prompt.includes(noun)).length;
  }

  private countAdjectives(prompt: string): number {
    const adjectives = ['美麗', '可愛', '大', '小', '紅', '藍', '快樂', '溫暖'];
    return adjectives.filter(adj => prompt.includes(adj)).length;
  }

  private hasSubject(prompt: string): boolean {
    const subjects = ['小朋友', '孩子', '男孩', '女孩', '媽媽', '爸爸', '老師', '動物'];
    return subjects.some(subject => prompt.includes(subject));
  }

  private hasAction(prompt: string): boolean {
    const actions = ['跑', '跳', '玩', '笑', '唱', '畫', '吃', '睡', '讀'];
    return actions.some(action => prompt.includes(action));
  }

  private hasScene(prompt: string): boolean {
    const scenes = ['公園', '家', '學校', '花園', '房間', '廚房'];
    return scenes.some(scene => prompt.includes(scene));
  }

  private hasVagueWords(prompt: string): boolean {
    const vagueWords = ['東西', '什麼', '那個', '一些'];
    return vagueWords.some(word => prompt.includes(word));
  }

  private hasColorDescription(prompt: string): boolean {
    const colors = ['紅', '藍', '綠', '黃', '紫', '橙', '白', '黑'];
    return colors.some(color => prompt.includes(color));
  }

  private hasSizeDescription(prompt: string): boolean {
    const sizes = ['大', '小', '巨', '微', '高', '矮'];
    return sizes.some(size => prompt.includes(size));
  }

  private hasEmotionalWords(prompt: string): boolean {
    const emotions = ['開心', '快樂', '興奮', '溫馨', '可愛'];
    return emotions.some(emotion => prompt.includes(emotion));
  }

  private hasSceneDescription(prompt: string): boolean {
    const scenes = ['在', '裡', '中', '上', '下', '旁邊'];
    return scenes.some(scene => prompt.includes(scene));
  }

  private getDimensionName(key: string): string {
    const names: { [key: string]: string } = {
      clarity: '清晰度',
      detail: '細節豐富度',
      emotion: '情感表達',
      visual: '視覺描述',
      structure: '結構完整性'
    };
    return names[key] || key;
  }

  private getLevelDescription(level: string): string {
    const descriptions = {
      beginner: '初學者，正在學習基本描述',
      intermediate: '進步中，能夠提供基本細節',
      advanced: '表現優秀，描述生動具體'
    };
    return descriptions[level as keyof typeof descriptions] || level;
  }

  private getSuggestedQuestions(qualityScore: PromptQualityScore): string[] {
    const questions = [];
    
    if (qualityScore.dimensions.detail < 70) {
      questions.push('可以告訴我更多細節嗎？比如顏色或大小？');
    }
    
    if (qualityScore.dimensions.emotion < 70) {
      questions.push('他們的心情如何？開心還是興奮？');
    }
    
    if (qualityScore.dimensions.visual < 70) {
      questions.push('這是在什麼地方發生的？');
    }
    
    return questions.length > 0 ? questions : ['你想要加入什麼有趣的細節？'];
  }

  private getEncouragementTips(qualityScore: PromptQualityScore): string[] {
    return [
      '給孩子時間思考，不要急著提示',
      '當孩子說出細節時，要給予正面回饋',
      '用開放式問題引導，而不是直接給答案',
      '鼓勵孩子的創意，即使想法很特別'
    ];
  }

  private getCommonMistakes(level: string): string[] {
    const mistakes = {
      beginner: ['描述太簡單', '缺少具體細節', '忘記說明場景'],
      intermediate: ['情感表達不夠', '色彩描述較少', '動作描述簡單'],
      advanced: ['結構可以更完整', '可以加入更多感官描述']
    };
    return mistakes[level as keyof typeof mistakes] || [];
  }

  private getNextSteps(qualityScore: PromptQualityScore): string[] {
    const steps = [];
    
    const weakestDimension = Object.entries(qualityScore.dimensions)
      .sort(([,a], [,b]) => a - b)[0];
    
    steps.push(`重點改善：${this.getDimensionName(weakestDimension[0])}`);
    
    if (qualityScore.overall >= 80) {
      steps.push('嘗試更具挑戰性的主題');
    } else {
      steps.push('練習加入更多細節');
    }
    
    return steps;
  }

  private emitEvent(event: PromptEngineeringEvent): void {
    this.emit('promptEngineering', event);
  }

  private handleError(message: string, code: string, context?: any): void {
    const error = new PromptEngineeringError(message, code, context);
    this.emitEvent({
      type: 'error',
      data: { error: message, context }
    });
  }

  // Public getters
  get analysisCount(): number {
    return this.analysisHistory.length;
  }

  get averageQualityScore(): number {
    if (this.analysisHistory.length === 0) return 0;
    return this.analysisHistory.reduce((sum, result) => sum + result.qualityScore.overall, 0) / this.analysisHistory.length;
  }

  get recentAnalysis(): RealTimeAnalysisResult[] {
    return this.analysisHistory.slice(-10);
  }
}
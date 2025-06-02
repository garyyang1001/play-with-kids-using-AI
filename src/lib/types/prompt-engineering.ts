/**
 * 階段2核心：Prompt Engineering 教學引擎類型定義
 * 支援Prompt品質評分、優化建議、學習進度追蹤
 */

/**
 * Prompt 品質維度
 */
export interface PromptQualityDimensions {
  clarity: number;      // 清晰度 (0-100)
  detail: number;       // 細節豐富度 (0-100)
  emotion: number;      // 情感表達 (0-100)
  visual: number;       // 視覺描述 (0-100)
  structure: number;    // 結構完整性 (0-100)
}

/**
 * Prompt 品質評分結果
 */
export interface PromptQualityScore {
  overall: number;                    // 整體評分 (0-100)
  dimensions: PromptQualityDimensions;
  improvementAreas: string[];         // 需要改善的領域
  strengths: string[];                // 優勢領域
  recommendedActions: string[];       // 建議行動
  confidenceLevel: number;            // 評分信心度 (0-1)
}

/**
 * Prompt 優化建議
 */
export interface PromptOptimizationSuggestion {
  type: 'add' | 'modify' | 'remove' | 'restructure';
  priority: 'high' | 'medium' | 'low';
  category: 'clarity' | 'detail' | 'emotion' | 'visual' | 'structure';
  originalText?: string;
  suggestedText: string;
  explanation: string;                // 為什麼這樣改善
  example?: string;                   // 範例
}

/**
 * Prompt 演進記錄
 */
export interface PromptEvolution {
  id: string;
  timestamp: number;
  original: string;
  optimized: string;
  qualityImprovement: number;         // 品質提升幅度
  appliedSuggestions: PromptOptimizationSuggestion[];
  userFeedback?: 'accept' | 'reject' | 'modify';
  learningPoints: string[];           // 學習要點
}

/**
 * 學習進度追蹤
 */
export interface LearningProgress {
  userId: string;
  skillLevels: {
    clarity: number;        // 清晰度技能 (0-100)
    creativity: number;     // 創意表達技能 (0-100)
    detail: number;         // 細節描述技能 (0-100)
    emotion: number;        // 情感表達技能 (0-100)
    structure: number;      // 結構組織技能 (0-100)
  };
  totalPrompts: number;              // 總提示數量
  totalOptimizations: number;        // 總優化次數
  averageImprovement: number;        // 平均改善幅度
  badges: LearningBadge[];           // 獲得的徽章
  currentStreak: number;             // 當前連續練習天數
  lastActiveDate: number;            // 最後活動日期
}

/**
 * 學習徽章
 */
export interface LearningBadge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedDate: number;
  category: 'clarity' | 'creativity' | 'detail' | 'emotion' | 'structure' | 'consistency';
}

/**
 * 語音教學配置
 */
export interface VoiceCoachConfig {
  personality: 'encouraging' | 'gentle' | 'enthusiastic' | 'patient';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusArea?: 'clarity' | 'detail' | 'emotion' | 'visual' | 'structure';
  interactionStyle: 'guided' | 'conversational' | 'gamelike';
  language: string;
}

/**
 * 語音教學會話
 */
export interface VoiceCoachSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  config: VoiceCoachConfig;
  interactions: VoiceCoachInteraction[];
  learningGoals: string[];
  achievedGoals: string[];
  sessionScore: number;
  nextSteps: string[];
}

/**
 * 語音教學互動
 */
export interface VoiceCoachInteraction {
  timestamp: number;
  type: 'prompt_analysis' | 'optimization_suggestion' | 'encouragement' | 'question' | 'feedback';
  userInput: string;
  coachResponse: string;
  audioResponse?: ArrayBuffer;
  visualAids?: string[];          // 視覺輔助材料URL
  learningPoints: string[];
}

/**
 * 家長引導提示
 */
export interface ParentGuidance {
  situation: string;              // 當前情況描述
  childLevel: 'beginner' | 'intermediate' | 'advanced';
  suggestedQuestions: string[];   // 建議問的問題
  encouragementTips: string[];    // 鼓勵技巧
  commonMistakes: string[];       // 常見錯誤
  nextSteps: string[];           // 下一步建議
  timeEstimate: number;          // 預估時間（分鐘）
}

/**
 * Prompt Engineering 引擎配置
 */
export interface PromptEngineeringConfig {
  analysisModel: string;          // 分析模型名稱
  optimizationMode: 'conservative' | 'balanced' | 'creative';
  targetAudience: 'children' | 'family' | 'general';
  domainFocus: 'video_creation' | 'storytelling' | 'general';
  enableRealTimeAnalysis: boolean;
  maxSuggestions: number;
  confidenceThreshold: number;
}

/**
 * 即時分析結果
 */
export interface RealTimeAnalysisResult {
  timestamp: number;
  inputPrompt: string;
  qualityScore: PromptQualityScore;
  suggestions: PromptOptimizationSuggestion[];
  parentGuidance: ParentGuidance;
  estimatedVideoQuality: number;  // 預估生成影片品質
  processingTime: number;         // 分析處理時間
}

/**
 * 學習統計
 */
export interface LearningStatistics {
  timeRange: 'daily' | 'weekly' | 'monthly' | 'allTime';
  promptsCreated: number;
  averageQualityScore: number;
  totalImprovements: number;
  skillProgression: {
    [skill: string]: {
      startLevel: number;
      currentLevel: number;
      improvement: number;
    };
  };
  badges: LearningBadge[];
  streaks: {
    current: number;
    longest: number;
  };
}

/**
 * 教學內容類型
 */
export interface TeachingContent {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'clarity' | 'detail' | 'emotion' | 'visual' | 'structure';
  examples: {
    before: string;
    after: string;
    explanation: string;
  }[];
  exercises: {
    prompt: string;
    expectedElements: string[];
    hints: string[];
  }[];
  estimatedTime: number;
}

/**
 * 事件類型
 */
export type PromptEngineeringEvent = 
  | { type: 'analysis_started'; data: { prompt: string } }
  | { type: 'analysis_completed'; data: RealTimeAnalysisResult }
  | { type: 'suggestion_applied'; data: { suggestion: PromptOptimizationSuggestion; result: string } }
  | { type: 'skill_improved'; data: { skill: string; oldLevel: number; newLevel: number } }
  | { type: 'badge_earned'; data: LearningBadge }
  | { type: 'session_completed'; data: VoiceCoachSession }
  | { type: 'parent_guidance_requested'; data: ParentGuidance }
  | { type: 'error'; data: { error: string; context?: any } };

/**
 * 錯誤類型
 */
export class PromptEngineeringError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'PromptEngineeringError';
  }
}
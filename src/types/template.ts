/**
 * 模板系統核心類型定義
 * 階段3：模板系統架構 - 核心類型
 */

// ===== 基礎類型定義 =====

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  level: TemplateDifficultyLevel;
  category: TemplateCategory;
  estimatedDuration: number; // 分鐘
  targetAge: {
    min: number;
    max: number;
  };
  icon: string;
  preview: string;
  tags: string[];
  version: string;
}

export type TemplateDifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type TemplateCategory = 'daily-life' | 'adventure' | 'animal-friend' | 'custom';

export interface TemplateStage {
  id: string;
  name: string;
  description: string;
  order: number;
  isRequired: boolean;
  prompt: TemplatePrompt;
  expectedSkills: string[];
  successCriteria: SuccessCriteria;
  hints: TeachingHint[];
}

export interface TemplatePrompt {
  instruction: string;
  examples: PromptExample[];
  improvementAreas: ImprovementArea[];
  coaching: CoachingStrategy;
}

export interface PromptExample {
  level: 'basic' | 'good' | 'excellent';
  text: string;
  explanation: string;
  highlights: string[];
}

export interface ImprovementArea {
  skill: string;
  weight: number; // 0-1
  keywords: string[];
  requiredElements: string[];
}

export interface CoachingStrategy {
  parentGuidance: string[];
  childEncouragement: string[];
  technicalTips: string[];
  errorCorrection: ErrorCorrectionStrategy[];
}

export interface ErrorCorrectionStrategy {
  errorType: string;
  detection: string[];
  correction: string;
  encouragement: string;
}

export interface SuccessCriteria {
  minimumScore: number;
  requiredDimensions: string[];
  skillThresholds: Record<string, number>;
  timeLimit?: number;
}

export interface TeachingHint {
  trigger: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  timing: 'before' | 'during' | 'after';
  audience: 'parent' | 'child' | 'both';
}

// ===== 學習進度相關 =====

export interface LearningProgress {
  userId: string;
  templateId: string;
  currentStage: string;
  startedAt: Date;
  lastActiveAt: Date;
  completedStages: string[];
  skillProgress: SkillProgress[];
  achievements: Achievement[];
  totalTimeSpent: number;
  attempts: AttemptRecord[];
}

export interface SkillProgress {
  skill: string;
  currentLevel: number; // 0-100
  improvement: number; // 相對於開始時的改善幅度
  practiceCount: number;
  lastPracticed: Date;
  masteryTrend: number[]; // 最近10次的分數趨勢
}

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  unlockedAt: Date;
  requirements: AchievementRequirement[];
}

export type AchievementType = 
  | 'skill-mastery' 
  | 'consistency' 
  | 'improvement' 
  | 'creativity' 
  | 'collaboration';

export interface AchievementRequirement {
  type: string;
  threshold: number;
  timeframe?: string;
}

export interface AttemptRecord {
  id: string;
  stageId: string;
  timestamp: Date;
  prompt: string;
  score: number;
  dimensions: Record<string, number>;
  improvements: string[];
  timeSpent: number;
  completed: boolean;
}

// ===== 難度調整相關 =====

export interface DifficultyConfig {
  adaptiveLevel: number; // 0-10
  skillWeights: Record<string, number>;
  hintFrequency: 'minimal' | 'normal' | 'frequent';
  exampleComplexity: 'simple' | 'moderate' | 'complex';
  evaluationStrict: number; // 0-1, 評分嚴格程度
}

export interface UserLevel {
  overall: number; // 0-100
  skills: Record<string, number>;
  confidence: number;
  engagement: number;
  parentSupport: number;
  learningStyle: LearningStyle;
}

export type LearningStyle = 
  | 'visual' 
  | 'auditory' 
  | 'kinesthetic' 
  | 'mixed';

export interface AdaptiveGuidanceConfig {
  user: UserLevel;
  session: SessionContext;
  preferences: LearningPreferences;
}

export interface SessionContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  sessionLength: 'short' | 'medium' | 'long';
  energyLevel: 'low' | 'medium' | 'high';
  previousPerformance: number;
  parentPresence: boolean;
}

export interface LearningPreferences {
  pace: 'slow' | 'normal' | 'fast';
  feedback: 'immediate' | 'delayed' | 'summary';
  encouragement: 'gentle' | 'enthusiastic' | 'balanced';
  complexity: 'gradual' | 'challenge' | 'adaptive';
}

// ===== 模板實例化相關 =====

export interface TemplateInstance {
  id: string;
  templateId: string;
  userId: string;
  metadata: TemplateMetadata;
  stages: TemplateStage[];
  progress: LearningProgress;
  customizations: TemplateCustomization[];
  createdAt: Date;
  lastModified: Date;
}

export interface TemplateCustomization {
  type: 'difficulty' | 'content' | 'timing' | 'style';
  changes: Record<string, unknown>;
  reason: string;
  appliedAt: Date;
}

// ===== 模板配置相關 =====

export interface TemplateConfig {
  metadata: TemplateMetadata;
  stages: TemplateStage[];
  defaults: TemplateDefaults;
  customization: CustomizationRules;
  validation: ValidationRules;
}

export interface TemplateDefaults {
  difficulty: DifficultyConfig;
  coaching: CoachingStrategy;
  progression: ProgressionRules;
}

export interface ProgressionRules {
  autoAdvance: boolean;
  retryLimit: number;
  masteryThreshold: number;
  skipConditions: SkipCondition[];
}

export interface SkipCondition {
  skill: string;
  minimumLevel: number;
  allowSkip: boolean;
}

export interface CustomizationRules {
  allowedFields: string[];
  constraints: Record<string, unknown>;
  validationFunctions: string[];
}

export interface ValidationRules {
  required: string[];
  types: Record<string, string>;
  ranges: Record<string, { min: number; max: number }>;
  custom: ValidationFunction[];
}

export interface ValidationFunction {
  name: string;
  description: string;
  function: (value: unknown) => boolean;
}

// ===== 系統管理相關 =====

export interface TemplateSystemConfig {
  maxConcurrentTemplates: number;
  defaultCacheDuration: number;
  progressSyncInterval: number;
  adaptationSensitivity: number;
  debugMode: boolean;
  analytics: AnalyticsConfig;
}

export interface AnalyticsConfig {
  trackingEnabled: boolean;
  metricsToTrack: string[];
  reportingInterval: number;
  anonymization: boolean;
}

// ===== 錯誤處理相關 =====

export interface TemplateError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, unknown>;
  recovery: RecoveryStrategy;
}

export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'skip' | 'abort';
  maxAttempts?: number;
  fallbackTemplate?: string;
  userMessage: string;
}

// ===== 事件系統相關 =====

export interface TemplateEvent {
  type: TemplateEventType;
  templateId: string;
  userId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export type TemplateEventType = 
  | 'template-started'
  | 'stage-completed'
  | 'skill-improved'
  | 'achievement-unlocked'
  | 'difficulty-adjusted'
  | 'template-completed'
  | 'error-occurred';

// ===== 導出所有類型 =====

export * from './prompt-engineering';
export * from './voice';

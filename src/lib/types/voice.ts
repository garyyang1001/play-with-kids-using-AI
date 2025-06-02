// 語音AI系統相關類型定義

/**
 * 語音AI客戶端配置
 */
export interface VoiceAIConfig {
  apiKey: string;
  model: string;
  voice: string;
  language: string;
  sampleRate: number;
}

/**
 * 語音連接狀態
 */
export enum VoiceConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

/**
 * 語音會話狀態
 */
export enum VoiceSessionState {
  IDLE = 'idle',
  LISTENING = 'listening',
  PROCESSING = 'processing',
  SPEAKING = 'speaking',
  PAUSED = 'paused'
}

/**
 * 音訊品質設定
 */
export interface AudioQualitySettings {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  sampleRate: number;
  channelCount: number;
}

/**
 * 語音互動事件
 */
export interface VoiceInteractionEvent {
  type: 'user_speech_start' | 'user_speech_end' | 'ai_response_start' | 'ai_response_end' | 'error';
  timestamp: number;
  data?: any;
}

/**
 * 語音轉錄結果
 */
export interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
}

/**
 * AI語音回應
 */
export interface AIVoiceResponse {
  text: string;
  audioData: ArrayBuffer;
  timestamp: number;
  emotion?: string;
  confidence: number;
}

/**
 * 語音會話統計
 */
export interface VoiceSessionStats {
  totalDuration: number;
  userSpeechDuration: number;
  aiResponseDuration: number;
  interactionCount: number;
  averageLatency: number;
  qualityScore: number;
}
// 語音系統核心類型定義
export interface VoiceAIConfig {
  apiKey: string
  model: string
  voice?: string
  language?: string
  sampleRate?: number
}

export interface VoiceMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: number
  audioData?: ArrayBuffer
}

export interface VoiceState {
  isConnected: boolean
  isRecording: boolean
  isPlaying: boolean
  isLoading: boolean
  error: string | null
  connectionId?: string
}

export interface AudioConfig {
  sampleRate: number
  channels: number
  bitsPerSample: number
  format: 'pcm' | 'wav'
}

export interface VoiceAIClientEvents {
  connected: () => void
  disconnected: () => void
  error: (error: Error) => void
  message: (message: VoiceMessage) => void
  audioReceived: (audioData: ArrayBuffer) => void
  stateChanged: (state: VoiceState) => void
}

export interface ConnectionStatus {
  connected: boolean
  lastPingTime: number
  reconnectAttempts: number
  quality: 'excellent' | 'good' | 'poor' | 'unstable'
}

export interface VoicePromptContext {
  templateId: string
  templateName: string
  conversationHistory: VoiceMessage[]
  currentStep: number
  learningGoals: string[]
}

export interface PromptOptimizationSuggestion {
  category: 'clarity' | 'detail' | 'emotion' | 'visual' | 'structure'
  originalText: string
  improvedText: string
  explanation: string
  priority: 'high' | 'medium' | 'low'
}

export interface VoiceSessionData {
  sessionId: string
  templateId: string
  startTime: number
  endTime?: number
  messages: VoiceMessage[]
  promptOptimizations: PromptOptimizationSuggestion[]
  qualityScores: {
    clarity: number
    detail: number
    emotion: number
    visual: number
    structure: number
    overall: number
  }
}
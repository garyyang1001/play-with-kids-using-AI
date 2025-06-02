/**
 * VoiceAIClient - 語音AI客戶端
 * 使用 Google Gemini 1.5 Flash 進行文字對話，暫時不支援即時語音
 * 等待 Google Live API 正式發布後再升級
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

export interface VoiceAIConfig {
  apiKey?: string;
  model?: string;
  voice?: string;
  language?: string;
  sampleRate?: number;
}

export interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface VoiceState {
  isConnected: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  connectionId?: string;
}

export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface ConnectionStatus {
  connected: boolean;
  lastPingTime: number;
  reconnectAttempts: number;
  quality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export interface VoicePromptContext {
  templateName: string;
  learningGoals: string[];
  currentStep: number;
}

export interface VoiceAIClientEvents {
  connected?: () => void;
  disconnected?: () => void;
  message?: (message: VoiceMessage) => void;
  audioReceived?: (audio: ArrayBuffer) => void;
  error?: (error: Error) => void;
  stateChanged?: (state: VoiceState) => void;
}

/**
 * VoiceAIClient - 語音AI客戶端
 * 暫時使用文字對話模式，模擬語音互動體驗
 */
export class VoiceAIClient {
  private client: GoogleGenerativeAI;
  private config: VoiceAIConfig;
  private state: VoiceState;
  private connectionStatus: ConnectionStatus;
  private eventListeners: Partial<VoiceAIClientEvents> = {};
  private conversationHistory: VoiceMessage[] = [];
  private sessionId: string;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private promptContext: VoicePromptContext | null = null;
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private chat: any = null;

  constructor(config: VoiceAIConfig) {
    // 獲取 API Key
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || config.apiKey;
    
    if (!apiKey) {
      throw new Error('未設定 Gemini API Key。請在 .env.local 中設定 NEXT_PUBLIC_GEMINI_API_KEY');
    }
    
    // 使用標準的文字模型
    const modelName = config.model || 'gemini-1.5-flash';
    
    this.config = {
      voice: 'zh-TW',
      language: 'zh-TW',
      sampleRate: 16000,
      ...config,
      apiKey,
      model: modelName
    };
    
    this.client = new GoogleGenerativeAI(this.config.apiKey);
    this.sessionId = uuidv4();
    
    this.state = {
      isConnected: false,
      isRecording: false,
      isPlaying: false,
      isLoading: false,
      error: null,
      connectionId: undefined
    };

    this.connectionStatus = {
      connected: false,
      lastPingTime: 0,
      reconnectAttempts: 0,
      quality: 'excellent'
    };
  }

  /**
   * 初始化語音AI連接（模擬）
   */
  async connect(promptContext?: VoicePromptContext): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });
      this.promptContext = promptContext || null;

      // 初始化 Gemini 聊天
      const model = this.client.getGenerativeModel({ model: this.config.model! });
      const systemPrompt = this.buildSystemPrompt();
      
      this.chat = model.startChat({
        history: [{
          role: "user",
          parts: [{ text: systemPrompt }],
        }, {
          role: "model",
          parts: [{ text: "好的！我是你的AI語音助手，準備開始親子創作對話。請告訴我今天想要創作什麼主題呢？" }],
        }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.9,
        },
      });

      // 模擬音訊初始化
      await this.initializeAudioContext();
      await this.requestMicrophonePermission();
      
      this.setState({ 
        isConnected: true, 
        isLoading: false,
        connectionId: this.sessionId
      });
      
      this.connectionStatus.connected = true;
      this.connectionStatus.lastPingTime = Date.now();
      
      this.emit('connected');
      
      console.log('VoiceAI 連接成功！（文字模式）');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '連接失敗';
      this.setState({ 
        isLoading: false, 
        error: errorMessage,
        isConnected: false 
      });
      this.emit('error', new Error(errorMessage));
      throw error;
    }
  }

  /**
   * 初始化音訊上下文
   */
  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.config.sampleRate
      });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      console.log('音訊上下文初始化成功');
    } catch (error) {
      console.error('音訊上下文初始化失敗:', error);
      // 不拋出錯誤，允許在沒有音訊的情況下繼續
    }
  }

  /**
   * 請求麥克風權限
   */
  private async requestMicrophonePermission(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioStream = stream;
      console.log('麥克風權限獲取成功');
    } catch (error) {
      console.warn('麥克風權限獲取失敗，將使用文字輸入模式:', error);
      // 不拋出錯誤，允許文字模式
    }
  }

  /**
   * 建立系統提示詞
   */
  private buildSystemPrompt(): string {
    const basePrompt = `你是一個專門為親子AI創作設計的助手。請用溫暖、親和的語調與家長和孩子對話。

你的主要任務：
1. 引導家長和孩子進行創意對話
2. 教授簡單的 Prompt Engineering 技巧
3. 提供即時的優化建議
4. 鼓勵孩子的創意表達

回應要求：
- 使用自然、溫暖的中文
- 語言簡單易懂，適合孩子理解
- 適時給予鼓勵和讚美
- 回應長度控制在 1-2 句話內
- 主動引導對話，提出啟發性問題

請始終保持積極、耐心、鼓勵的態度。`;

    if (this.promptContext) {
      return `${basePrompt}\n\n當前創作情境：
- 模板：${this.promptContext.templateName}
- 學習目標：${this.promptContext.learningGoals.join(', ')}
- 對話階段：第 ${this.promptContext.currentStep} 步

請根據這個情境引導對話，並適時提供 Prompt 優化建議。`;
    }

    return basePrompt;
  }

  /**
   * 開始錄音（模擬）
   */
  async startRecording(): Promise<void> {
    if (!this.state.isConnected) {
      throw new Error('請先連接語音AI服務');
    }

    if (this.state.isRecording) {
      console.warn('已在錄音中');
      return;
    }

    try {
      this.setState({ isRecording: true });
      console.log('開始錄音（模擬）');
      
      // 模擬錄音狀態，實際上等待用戶輸入文字
      
    } catch (error) {
      console.error('錄音失敗:', error);
      this.setState({ error: '錄音失敗，請使用文字輸入' });
      throw error;
    }
  }

  /**
   * 停止錄音
   */
  stopRecording(): void {
    if (!this.state.isRecording) {
      return;
    }

    this.setState({ isRecording: false });
    console.log('停止錄音（模擬）');
  }

  /**
   * 發送文字訊息（代替語音）
   */
  async sendTextMessage(text: string): Promise<void> {
    if (!this.state.isConnected || !this.chat) {
      throw new Error('請先連接語音AI服務');
    }

    try {
      this.setState({ isLoading: true });

      // 添加用戶訊息到歷史
      const userMessage: VoiceMessage = {
        id: uuidv4(),
        type: 'user',
        content: text,
        timestamp: Date.now()
      };
      
      this.conversationHistory.push(userMessage);
      this.emit('message', userMessage);

      // 發送到 Gemini
      const result = await this.chat.sendMessage(text);
      const response = await result.response;
      const responseText = response.text();

      // 添加助手回應到歷史
      const assistantMessage: VoiceMessage = {
        id: uuidv4(),
        type: 'assistant',
        content: responseText,
        timestamp: Date.now()
      };
      
      this.conversationHistory.push(assistantMessage);
      this.emit('message', assistantMessage);

      // 模擬語音播放
      this.simulateAudioPlayback(responseText);

      this.setState({ isLoading: false });
      
    } catch (error) {
      console.error('發送訊息失敗:', error);
      this.setState({ 
        isLoading: false, 
        error: '發送訊息失敗，請重試' 
      });
      throw error;
    }
  }

  /**
   * 模擬語音播放
   */
  private simulateAudioPlayback(text: string): void {
    this.setState({ isPlaying: true });
    
    // 根據文字長度計算播放時間
    const playbackDuration = Math.max(1000, text.length * 100);
    
    setTimeout(() => {
      this.setState({ isPlaying: false });
    }, playbackDuration);
  }

  /**
   * 嘗試重連
   */
  private async attemptReconnect(): Promise<void> {
    if (this.connectionStatus.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setState({ error: '重連失敗，請手動重新連接' });
      return;
    }

    this.connectionStatus.reconnectAttempts++;
    console.log(`嘗試重連... (${this.connectionStatus.reconnectAttempts}/${this.maxReconnectAttempts})`);

    try {
      await this.connect(this.promptContext || undefined);
      this.connectionStatus.reconnectAttempts = 0;
    } catch (error) {
      console.error('重連失敗:', error);
      
      this.reconnectTimer = setTimeout(() => {
        this.attemptReconnect();
      }, 5000 * this.connectionStatus.reconnectAttempts);
    }
  }

  /**
   * 斷開連接
   */
  disconnect(): void {
    // 停止錄音
    if (this.state.isRecording) {
      this.stopRecording();
    }

    // 停止音訊流
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    // 清理音訊上下文
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // 清理定時器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // 清理聊天實例
    this.chat = null;

    this.setState({
      isConnected: false,
      isRecording: false,
      isPlaying: false,
      isLoading: false,
      connectionId: undefined
    });

    this.connectionStatus.connected = false;
    this.emit('disconnected');
    
    console.log('VoiceAI 連接已斷開');
  }

  /**
   * 獲取對話歷史
   */
  getConversationHistory(): VoiceMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * 清空對話歷史
   */
  clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * 獲取當前狀態
   */
  getState(): VoiceState {
    return { ...this.state };
  }

  /**
   * 獲取連接狀態
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * 添加事件監聽器
   */
  on<T extends keyof VoiceAIClientEvents>(
    event: T,
    listener: VoiceAIClientEvents[T]
  ): void {
    this.eventListeners[event] = listener;
  }

  /**
   * 移除事件監聽器
   */
  off<T extends keyof VoiceAIClientEvents>(event: T): void {
    delete this.eventListeners[event];
  }

  /**
   * 發送事件
   */
  private emit<T extends keyof VoiceAIClientEvents>(
    event: T,
    ...args: Parameters<NonNullable<VoiceAIClientEvents[T]>>
  ): void {
    const listener = this.eventListeners[event];
    if (listener) {
      (listener as any)(...args);
    }
  }

  /**
   * 更新狀態
   */
  private setState(newState: Partial<VoiceState>): void {
    this.state = { ...this.state, ...newState };
    this.emit('stateChanged', this.state);
  }
}
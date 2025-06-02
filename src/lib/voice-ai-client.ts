/**
 * VoiceAIClient - 正確的 Google Live API 實現
 * 基於官方 Live API WebSocket 文檔
 * https://ai.google.dev/api/live
 */

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
  audioData?: ArrayBuffer;
}

export interface VoiceState {
  isConnected: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  connectionId?: string;
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
  transcription?: (text: string) => void;
}

/**
 * VoiceAIClient - 正確的 Live API 實現
 */
export class VoiceAIClient {
  private config: VoiceAIConfig;
  private state: VoiceState;
  private connectionStatus: ConnectionStatus;
  private eventListeners: Partial<VoiceAIClientEvents> = {};
  private conversationHistory: VoiceMessage[] = [];
  private sessionId: string;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private promptContext: VoicePromptContext | null = null;
  
  // WebSocket 相關
  private websocket: WebSocket | null = null;
  private isSetupComplete = false;
  
  // 音訊相關
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];

  constructor(config: VoiceAIConfig) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || config.apiKey;
    
    if (!apiKey) {
      throw new Error('未設定 Gemini API Key。請在 .env.local 中設定 NEXT_PUBLIC_GEMINI_API_KEY');
    }
    
    this.config = {
      voice: 'Puck', // 根據文檔的語音選項
      language: 'zh-TW',
      sampleRate: 16000,
      model: 'models/gemini-2.0-flash-exp', // 支援 Live API 的模型
      ...config,
      apiKey
    };
    
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
   * 連接到 Live API
   */
  async connect(promptContext?: VoicePromptContext): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });
      this.promptContext = promptContext || null;

      // 初始化音訊
      await this.initializeAudioContext();
      await this.requestMicrophonePermission();
      
      // 建立 WebSocket 連接
      await this.establishWebSocketConnection();
      
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
   * 建立 WebSocket 連接
   */
  private async establishWebSocketConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Live API WebSocket 端點
        const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.config.apiKey}`;
        
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
          console.log('WebSocket 連接已建立');
          this.sendSetupMessage();
        };
        
        this.websocket.onmessage = (event) => {
          this.handleServerMessage(event.data);
        };
        
        this.websocket.onerror = (error) => {
          console.error('WebSocket 錯誤:', error);
          this.handleConnectionError(new Error('WebSocket 連接錯誤'));
          reject(error);
        };
        
        this.websocket.onclose = (event) => {
          console.log('WebSocket 連接關閉:', event.code, event.reason);
          this.handleConnectionClose(event);
        };

        // 設定連接超時
        setTimeout(() => {
          if (!this.isSetupComplete) {
            reject(new Error('連接超時'));
          } else {
            resolve();
          }
        }, 10000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 發送設定訊息
   */
  private sendSetupMessage(): void {
    if (!this.websocket) return;

    const setupMessage = {
      setup: {
        model: this.config.model,
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voice
              }
            }
          }
        },
        systemInstruction: {
          parts: [{
            text: this.buildSystemPrompt()
          }]
        }
      }
    };

    console.log('發送設定訊息:', setupMessage);
    this.websocket.send(JSON.stringify(setupMessage));
  }

  /**
   * 建立系統提示詞
   */
  private buildSystemPrompt(): string {
    const basePrompt = `你是一個專門為親子AI創作設計的語音助手。請用溫暖、親和的語調與家長和孩子對話。

你的主要任務：
1. 引導家長和孩子進行創意對話
2. 教授簡單的 Prompt Engineering 技巧
3. 提供即時的優化建議
4. 鼓勵孩子的創意表達

語音回應要求：
- 使用自然、溫暖的中文語調
- 語速適中，方便孩子理解
- 適時給予鼓勵和讚美
- 用簡單詞彙解釋概念
- 回應長度控制在 1-2 句話內

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
   * 處理伺服器訊息
   */
  private handleServerMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      console.log('收到伺服器訊息:', message);

      if (message.setupComplete) {
        this.isSetupComplete = true;
        this.setState({ 
          isConnected: true, 
          isLoading: false,
          connectionId: this.sessionId
        });
        this.connectionStatus.connected = true;
        this.connectionStatus.lastPingTime = Date.now();
        this.emit('connected');
        console.log('Live API 設定完成');
      }

      if (message.serverContent) {
        this.handleServerContent(message.serverContent);
      }

    } catch (error) {
      console.error('解析伺服器訊息失敗:', error);
    }
  }

  /**
   * 處理伺服器內容
   */
  private handleServerContent(serverContent: any): void {
    // 處理模型回應
    if (serverContent.modelTurn?.parts) {
      for (const part of serverContent.modelTurn.parts) {
        // 處理文字回應
        if (part.text) {
          const assistantMessage: VoiceMessage = {
            id: uuidv4(),
            type: 'assistant',
            content: part.text,
            timestamp: Date.now()
          };
          
          this.conversationHistory.push(assistantMessage);
          this.emit('message', assistantMessage);
        }

        // 處理音訊回應
        if (part.inlineData) {
          this.handleAudioResponse(part.inlineData);
        }
      }
    }

    // 處理轉錄
    if (serverContent.inputTranscription) {
      this.emit('transcription', serverContent.inputTranscription.text);
    }

    // 檢查輪次完成
    if (serverContent.turnComplete) {
      this.setState({ isLoading: false, isPlaying: false });
    }
  }

  /**
   * 處理音訊回應
   */
  private handleAudioResponse(inlineData: any): void {
    try {
      const audioData = this.base64ToArrayBuffer(inlineData.data);
      this.playAudioResponse(audioData);
      this.emit('audioReceived', audioData);
    } catch (error) {
      console.error('音訊回應處理失敗:', error);
    }
  }

  /**
   * Base64 轉 ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * 播放音訊回應
   */
  private async playAudioResponse(audioBuffer: ArrayBuffer): Promise<void> {
    if (!this.audioContext) return;

    try {
      this.setState({ isPlaying: true });
      
      const audioBufferSource = this.audioContext.createBufferSource();
      const decodedBuffer = await this.audioContext.decodeAudioData(audioBuffer.slice(0));
      
      audioBufferSource.buffer = decodedBuffer;
      audioBufferSource.connect(this.audioContext.destination);
      
      audioBufferSource.onended = () => {
        this.setState({ isPlaying: false });
      };
      
      audioBufferSource.start();
    } catch (error) {
      console.error('音訊播放失敗:', error);
      this.setState({ isPlaying: false });
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
      throw new Error('無法初始化音訊系統');
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
      console.error('麥克風權限獲取失敗:', error);
      throw new Error('無法獲取麥克風權限，請檢查瀏覽器設定');
    }
  }

  /**
   * 開始錄音
   */
  async startRecording(): Promise<void> {
    if (!this.state.isConnected || !this.websocket) {
      throw new Error('請先連接語音AI服務');
    }

    if (this.state.isRecording) {
      console.warn('已在錄音中');
      return;
    }

    try {
      if (!this.audioStream) {
        await this.requestMicrophonePermission();
      }

      this.audioChunks = [];

      // 創建 MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.audioStream!, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        await this.sendAudioToServer();
      };

      this.mediaRecorder.start(100); // 100ms 間隔
      this.setState({ isRecording: true });
      
      console.log('開始錄音');
      
    } catch (error) {
      console.error('錄音失敗:', error);
      this.setState({ error: '錄音失敗，請檢查麥克風設定' });
      throw error;
    }
  }

  /**
   * 停止錄音
   */
  stopRecording(): void {
    if (!this.state.isRecording || !this.mediaRecorder) {
      return;
    }

    this.mediaRecorder.stop();
    this.setState({ isRecording: false, isLoading: true });
    console.log('停止錄音');
  }

  /**
   * 發送音訊到伺服器
   */
  private async sendAudioToServer(): Promise<void> {
    if (!this.websocket || this.audioChunks.length === 0) return;

    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);

      const realtimeInputMessage = {
        realtimeInput: {
          mediaChunks: [{
            mimeType: "audio/pcm;rate=16000",
            data: base64Audio
          }]
        }
      };

      console.log('發送音訊數據');
      this.websocket.send(JSON.stringify(realtimeInputMessage));

      // 添加用戶訊息到歷史
      const userMessage: VoiceMessage = {
        id: uuidv4(),
        type: 'user',
        content: '(語音輸入)',
        timestamp: Date.now(),
        audioData: arrayBuffer
      };
      
      this.conversationHistory.push(userMessage);
      this.emit('message', userMessage);

    } catch (error) {
      console.error('發送音訊失敗:', error);
      this.setState({ error: '音訊發送失敗' });
    }
  }

  /**
   * ArrayBuffer 轉 Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * 處理連接錯誤
   */
  private handleConnectionError(error: Error): void {
    console.error('連接錯誤:', error);
    this.setState({ error: error.message });
    this.emit('error', error);
  }

  /**
   * 處理連接關閉
   */
  private handleConnectionClose(event: CloseEvent): void {
    this.setState({ isConnected: false });
    this.connectionStatus.connected = false;
    this.isSetupComplete = false;
    this.emit('disconnected');
    
    // 如果不是正常關閉，嘗試重連
    if (event.code !== 1000) {
      this.attemptReconnect();
    }
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

    // 關閉 WebSocket
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
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

    this.setState({
      isConnected: false,
      isRecording: false,
      isPlaying: false,
      isLoading: false,
      connectionId: undefined
    });

    this.connectionStatus.connected = false;
    this.isSetupComplete = false;
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
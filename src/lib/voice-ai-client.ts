/**
 * 階段1核心：語音AI客戶端類別
 * 處理與Google Gemini Live API的WebSocket連接和語音互動
 */

import { EventEmitter } from 'events';
import {
  VoiceAIConfig,
  VoiceConnectionState,
  VoiceSessionState,
  VoiceInteractionEvent,
  TranscriptionResult,
  AIVoiceResponse,
  VoiceSessionStats,
  AudioQualitySettings
} from './types/voice';

/**
 * 語音AI客戶端 - 核心語音對話系統
 */
export class VoiceAIClient extends EventEmitter {
  private config: VoiceAIConfig;
  private websocket: WebSocket | null = null;
  private connectionState: VoiceConnectionState = VoiceConnectionState.DISCONNECTED;
  private sessionState: VoiceSessionState = VoiceSessionState.IDLE;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private sessionStats: VoiceSessionStats;
  private sessionStartTime: number = 0;

  constructor(config: VoiceAIConfig) {
    super();
    this.config = config;
    this.sessionStats = this.initializeStats();
  }

  /**
   * 初始化會話統計
   */
  private initializeStats(): VoiceSessionStats {
    return {
      totalDuration: 0,
      userSpeechDuration: 0,
      aiResponseDuration: 0,
      interactionCount: 0,
      averageLatency: 0,
      qualityScore: 0
    };
  }

  /**
   * 連接到語音AI服務
   */
  async connect(): Promise<void> {
    try {
      this.setConnectionState(VoiceConnectionState.CONNECTING);
      this.sessionStartTime = Date.now();
      
      // 初始化音訊上下文
      await this.initializeAudioContext();
      
      // 建立WebSocket連接到Gemini Live API
      await this.establishWebSocketConnection();
      
      // 設置媒體錄音器
      await this.setupMediaRecorder();
      
      this.setConnectionState(VoiceConnectionState.CONNECTED);
      this.setSessionState(VoiceSessionState.IDLE);
      
      this.emitEvent({
        type: 'ai_response_start',
        timestamp: Date.now(),
        data: { message: '語音連接成功，可以開始對話了！' }
      });
      
    } catch (error) {
      this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * 初始化音訊上下文
   */
  private async initializeAudioContext(): Promise<void> {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: this.config.sampleRate
    });
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * 建立WebSocket連接
   */
  private async establishWebSocketConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      // TODO: 實際的Gemini Live API WebSocket URL
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.StreamGenerateContent?key=${this.config.apiKey}`;
      
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('[VoiceAI] WebSocket連接成功');
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.websocket.onmessage = this.handleWebSocketMessage.bind(this);
      this.websocket.onerror = this.handleWebSocketError.bind(this);
      this.websocket.onclose = this.handleWebSocketClose.bind(this);
      
      // 連接超時處理
      setTimeout(() => {
        if (this.connectionState === VoiceConnectionState.CONNECTING) {
          reject(new Error('WebSocket連接超時'));
        }
      }, 10000);
    });
  }

  /**
   * 設置媒體錄音器
   */
  private async setupMediaRecorder(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: this.config.sampleRate
      }
    });
    
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    this.mediaRecorder.ondataavailable = this.handleAudioData.bind(this);
    this.mediaRecorder.onstart = () => {
      this.setSessionState(VoiceSessionState.LISTENING);
      this.emitEvent({
        type: 'user_speech_start',
        timestamp: Date.now()
      });
    };
    
    this.mediaRecorder.onstop = () => {
      this.setSessionState(VoiceSessionState.PROCESSING);
      this.emitEvent({
        type: 'user_speech_end',
        timestamp: Date.now()
      });
    };
  }

  /**
   * 處理音訊資料
   */
  private handleAudioData(event: BlobEvent): void {
    if (event.data.size > 0 && this.websocket?.readyState === WebSocket.OPEN) {
      // 將音訊轉換為適合的格式並發送到API
      event.data.arrayBuffer().then(buffer => {
        this.sendAudioToAPI(buffer);
      });
    }
  }

  /**
   * 發送音訊到API
   */
  private sendAudioToAPI(audioBuffer: ArrayBuffer): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      const message = {
        realtime_input: {
          media_chunks: [{
            mime_type: 'audio/pcm',
            data: this.arrayBufferToBase64(audioBuffer)
          }]
        }
      };
      
      this.websocket.send(JSON.stringify(message));
    }
  }

  /**
   * 處理WebSocket訊息
   */
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      if (data.serverContent) {
        this.handleServerContent(data.serverContent);
      }
      
      if (data.toolCall) {
        this.handleToolCall(data.toolCall);
      }
      
    } catch (error) {
      console.error('[VoiceAI] 處理WebSocket訊息錯誤:', error);
    }
  }

  /**
   * 處理伺服器內容回應
   */
  private handleServerContent(content: any): void {
    if (content.modelTurn) {
      const response: AIVoiceResponse = {
        text: content.modelTurn.parts?.[0]?.text || '',
        audioData: new ArrayBuffer(0), // TODO: 處理實際音訊回應
        timestamp: Date.now(),
        confidence: 0.95
      };
      
      this.setSessionState(VoiceSessionState.SPEAKING);
      this.emitEvent({
        type: 'ai_response_start',
        timestamp: Date.now(),
        data: response
      });
      
      // 播放AI回應（如果有音訊）
      this.playAIResponse(response);
    }
  }

  /**
   * 處理工具呼叫
   */
  private handleToolCall(toolCall: any): void {
    // TODO: 實現工具呼叫邏輯
    console.log('[VoiceAI] 工具呼叫:', toolCall);
  }

  /**
   * 播放AI語音回應
   */
  private async playAIResponse(response: AIVoiceResponse): Promise<void> {
    // TODO: 實現音訊播放邏輯
    console.log('[VoiceAI] AI回應:', response.text);
    
    // 模擬播放完成
    setTimeout(() => {
      this.setSessionState(VoiceSessionState.IDLE);
      this.emitEvent({
        type: 'ai_response_end',
        timestamp: Date.now()
      });
    }, 2000);
  }

  /**
   * 開始錄音
   */
  startRecording(): void {
    if (this.mediaRecorder && this.sessionState === VoiceSessionState.IDLE) {
      this.mediaRecorder.start(100); // 每100ms收集一次資料
    }
  }

  /**
   * 停止錄音
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.sessionState === VoiceSessionState.LISTENING) {
      this.mediaRecorder.stop();
    }
  }

  /**
   * 斷開連接
   */
  disconnect(): void {
    this.setConnectionState(VoiceConnectionState.DISCONNECTED);
    this.setSessionState(VoiceSessionState.IDLE);
    
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.mediaRecorder) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.mediaRecorder = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.updateSessionStats();
  }

  /**
   * 自動重連機制
   */
  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setConnectionState(VoiceConnectionState.ERROR);
      return;
    }
    
    this.reconnectAttempts++;
    this.setConnectionState(VoiceConnectionState.RECONNECTING);
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('[VoiceAI] 重連失敗:', error);
        await this.attemptReconnect();
      }
    }, delay);
  }

  /**
   * 處理連接錯誤
   */
  private handleConnectionError(error: any): void {
    console.error('[VoiceAI] 連接錯誤:', error);
    this.setConnectionState(VoiceConnectionState.ERROR);
    this.emitEvent({
      type: 'error',
      timestamp: Date.now(),
      data: { error: error.message }
    });
  }

  /**
   * 處理WebSocket錯誤
   */
  private handleWebSocketError(error: Event): void {
    console.error('[VoiceAI] WebSocket錯誤:', error);
    this.handleConnectionError(new Error('WebSocket連接錯誤'));
  }

  /**
   * 處理WebSocket關閉
   */
  private handleWebSocketClose(event: CloseEvent): void {
    console.log('[VoiceAI] WebSocket連接關閉:', event.code, event.reason);
    
    if (event.code !== 1000) { // 非正常關閉
      this.attemptReconnect();
    }
  }

  /**
   * 設置連接狀態
   */
  private setConnectionState(state: VoiceConnectionState): void {
    this.connectionState = state;
    this.emit('connectionStateChange', state);
  }

  /**
   * 設置會話狀態
   */
  private setSessionState(state: VoiceSessionState): void {
    this.sessionState = state;
    this.emit('sessionStateChange', state);
  }

  /**
   * 發送事件
   */
  private emitEvent(event: VoiceInteractionEvent): void {
    this.emit('voiceInteraction', event);
  }

  /**
   * 更新會話統計
   */
  private updateSessionStats(): void {
    this.sessionStats.totalDuration = Date.now() - this.sessionStartTime;
    this.emit('sessionStatsUpdate', this.sessionStats);
  }

  /**
   * ArrayBuffer轉Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Getters
  get connectionStatus(): VoiceConnectionState {
    return this.connectionState;
  }

  get sessionStatus(): VoiceSessionState {
    return this.sessionState;
  }

  get stats(): VoiceSessionStats {
    return { ...this.sessionStats };
  }

  get isConnected(): boolean {
    return this.connectionState === VoiceConnectionState.CONNECTED;
  }

  get isRecording(): boolean {
    return this.sessionState === VoiceSessionState.LISTENING;
  }
}
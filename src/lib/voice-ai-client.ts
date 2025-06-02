/**
 * 階段1核心：語音AI客戶端類別 - 優化版
 * 處理與Google Gemini Live API的WebSocket連接和語音互動
 * 支援實際的 Live API v2.0-exp 整合
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
 * 語音AI客戶端 - 核心語音對話系統（優化版）
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
  private audioChunks: Blob[] = [];
  private conversationHistory: string[] = [];

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
      sampleRate: this.config.sampleRate || 16000
    });
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * 建立WebSocket連接 - 使用最新的Live API
   */
  private async establishWebSocketConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 使用正確的 Live API v2.0-exp WebSocket URL
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.config.apiKey}`;
      
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('[VoiceAI] WebSocket連接成功');
        this.initializeSession();
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
   * 初始化會話 - 發送設定訊息
   */
  private initializeSession(): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      const setupMessage = {
        setup: {
          model: "models/gemini-2.0-flash-exp",
          generation_config: {
            response_modalities: ["AUDIO"],
            speech_config: {
              voice_config: {
                prebuilt_voice_config: {
                  voice_name: "Puck" // 適合兒童的聲音
                }
              }
            }
          },
          system_instruction: {
            parts: [{
              text: `你是一個溫馨的親子AI教練，專門幫助家長和孩子學習如何與AI溝通。
              
              你的任務：
              1. 用溫暖親切的語調與用戶對話
              2. 引導用戶改善他們的描述，讓它們更生動、更具體
              3. 教導Prompt Engineering的基本概念
              4. 鼓勵創意表達，特別是視覺描述
              5. 保持對話輕鬆有趣，適合親子互動
              
              請用繁體中文回應，語調要溫暖親切。`
            }]
          }
        }
      };
      
      this.websocket.send(JSON.stringify(setupMessage));
    }
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
        sampleRate: this.config.sampleRate || 16000,
        channelCount: 1
      }
    });
    
    // 使用 PCM 格式，適合 Live API
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=pcm'
    });
    
    this.mediaRecorder.ondataavailable = this.handleAudioData.bind(this);
    this.mediaRecorder.onstart = () => {
      this.audioChunks = [];
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
      this.processCollectedAudio();
    };
  }

  /**
   * 處理音訊資料
   */
  private handleAudioData(event: BlobEvent): void {
    if (event.data.size > 0) {
      this.audioChunks.push(event.data);
    }
  }

  /**
   * 處理收集到的音訊
   */
  private async processCollectedAudio(): Promise<void> {
    if (this.audioChunks.length === 0) return;
    
    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // 轉換為 PCM 格式並發送
      const pcmData = await this.convertToPCM(arrayBuffer);
      this.sendAudioToAPI(pcmData);
      
    } catch (error) {
      console.error('[VoiceAI] 音訊處理錯誤:', error);
    }
  }

  /**
   * 轉換音訊為 PCM 格式
   */
  private async convertToPCM(audioBuffer: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.audioContext) {
      throw new Error('AudioContext 未初始化');
    }
    
    try {
      const audioData = await this.audioContext.decodeAudioData(audioBuffer);
      const pcmData = audioData.getChannelData(0);
      
      // 轉換為 16-bit PCM
      const pcmBuffer = new ArrayBuffer(pcmData.length * 2);
      const view = new DataView(pcmBuffer);
      
      for (let i = 0; i < pcmData.length; i++) {
        const sample = Math.max(-1, Math.min(1, pcmData[i]));
        view.setInt16(i * 2, sample * 0x7FFF, true);
      }
      
      return pcmBuffer;
    } catch (error) {
      console.error('[VoiceAI] PCM轉換錯誤:', error);
      return audioBuffer; // 降級處理
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
      this.sessionStats.interactionCount++;
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
      
      if (data.setupComplete) {
        console.log('[VoiceAI] 會話設置完成');
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
      const textResponse = content.modelTurn.parts?.find((p: any) => p.text)?.text || '';
      const audioResponse = content.modelTurn.parts?.find((p: any) => p.inlineData);
      
      const response: AIVoiceResponse = {
        text: textResponse,
        audioData: audioResponse ? this.base64ToArrayBuffer(audioResponse.inlineData.data) : new ArrayBuffer(0),
        timestamp: Date.now(),
        confidence: 0.95
      };
      
      this.conversationHistory.push(`AI: ${textResponse}`);
      
      this.setSessionState(VoiceSessionState.SPEAKING);
      this.emitEvent({
        type: 'ai_response_start',
        timestamp: Date.now(),
        data: response
      });
      
      // 播放AI回應
      this.playAIResponse(response);
    }
    
    if (content.turnComplete) {
      this.setSessionState(VoiceSessionState.IDLE);
      this.emitEvent({
        type: 'ai_response_end',
        timestamp: Date.now()
      });
    }
  }

  /**
   * 處理工具呼叫
   */
  private handleToolCall(toolCall: any): void {
    console.log('[VoiceAI] 工具呼叫:', toolCall);
    // TODO: 實現具體的工具呼叫邏輯
  }

  /**
   * 播放AI語音回應
   */
  private async playAIResponse(response: AIVoiceResponse): Promise<void> {
    try {
      if (response.audioData.byteLength > 0) {
        // 播放音訊回應
        const audioBlob = new Blob([response.audioData], { type: 'audio/pcm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.setSessionState(VoiceSessionState.IDLE);
          this.emitEvent({
            type: 'ai_response_end',
            timestamp: Date.now()
          });
        };
        
        await audio.play();
      } else {
        // 只有文字回應時的模擬播放
        console.log('[VoiceAI] AI回應:', response.text);
        setTimeout(() => {
          this.setSessionState(VoiceSessionState.IDLE);
          this.emitEvent({
            type: 'ai_response_end',
            timestamp: Date.now()
          });
        }, response.text.length * 100); // 根據文字長度估算播放時間
      }
    } catch (error) {
      console.error('[VoiceAI] 播放音訊錯誤:', error);
      this.setSessionState(VoiceSessionState.IDLE);
    }
  }

  /**
   * 開始錄音
   */
  startRecording(): void {
    if (this.mediaRecorder && this.sessionState === VoiceSessionState.IDLE) {
      this.mediaRecorder.start(250); // 每250ms收集一次資料
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
   * 發送文字訊息（用於測試）
   */
  sendTextMessage(message: string): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      const textMessage = {
        client_content: {
          turns: [{
            role: "user",
            parts: [{ text: message }]
          }],
          turn_complete: true
        }
      };
      
      this.websocket.send(JSON.stringify(textMessage));
      this.conversationHistory.push(`User: ${message}`);
      this.sessionStats.interactionCount++;
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
      this.emitEvent({
        type: 'error',
        timestamp: Date.now(),
        data: { error: '重連次數超過限制' }
      });
      return;
    }
    
    this.reconnectAttempts++;
    this.setConnectionState(VoiceConnectionState.RECONNECTING);
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    
    setTimeout(async () => {
      try {
        await this.connect();
        this.emitEvent({
          type: 'reconnected',
          timestamp: Date.now()
        });
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
    
    if (event.code !== 1000 && this.connectionState !== VoiceConnectionState.DISCONNECTED) {
      // 非正常關閉且不是用戶主動斷開
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
    this.sessionStats.qualityScore = this.calculateQualityScore();
    this.emit('sessionStatsUpdate', this.sessionStats);
  }

  /**
   * 計算品質評分
   */
  private calculateQualityScore(): number {
    // 基於互動次數、連接穩定性等計算品質評分
    const baseScore = 85;
    const interactionBonus = Math.min(this.sessionStats.interactionCount * 2, 15);
    const reconnectPenalty = this.reconnectAttempts * 5;
    
    return Math.max(0, Math.min(100, baseScore + interactionBonus - reconnectPenalty));
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

  /**
   * Base64轉ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
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

  get conversationLog(): string[] {
    return [...this.conversationHistory];
  }
}
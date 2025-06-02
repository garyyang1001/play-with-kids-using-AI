import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import type {
  VoiceAIConfig,
  VoiceMessage,
  VoiceState,
  AudioConfig,
  VoiceAIClientEvents,
  ConnectionStatus,
  VoicePromptContext
} from './types/voice';

/**
 * VoiceAIClient - 語音AI客戶端
 * 使用 Google Gemini Live API 進行即時語音對話
 */
export class VoiceAIClient {
  private genAI: GoogleGenAI;
  private config: VoiceAIConfig;
  private state: VoiceState;
  private connectionStatus: ConnectionStatus;
  private session: Session | null = null;
  private eventListeners: Partial<VoiceAIClientEvents> = {};
  private conversationHistory: VoiceMessage[] = [];
  private sessionId: string;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private promptContext: VoicePromptContext | null = null;
  private responseQueue: LiveServerMessage[] = [];
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;

  constructor(config: VoiceAIConfig) {
    this.config = {
      model: 'models/gemini-2.0-flash-exp', // 使用正確的模型版本
      voice: 'Aoede', // 台灣中文腔調
      language: 'zh-TW',
      sampleRate: 16000,
      ...config
    };
    
    this.genAI = new GoogleGenAI({
      apiKey: this.config.apiKey,
    });

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
   * 初始化語音AI連接
   */
  async connect(promptContext?: VoicePromptContext): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });
      this.promptContext = promptContext || null;

      // 初始化音訊上下文
      await this.initializeAudioContext();
      
      // 請求麥克風權限
      await this.requestMicrophonePermission();
      
      // 建立與 Gemini Live API 的連接
      await this.establishLiveConnection();
      
      this.setState({ 
        isConnected: true, 
        isLoading: false,
        connectionId: this.sessionId
      });
      
      this.connectionStatus.connected = true;
      this.connectionStatus.lastPingTime = Date.now();
      
      this.emit('connected');
      
      console.log('VoiceAI 連接成功！');
      
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
      
      // 保存音訊流
      this.audioStream = stream;
      
      console.log('麥克風權限獲取成功');
    } catch (error) {
      console.error('麥克風權限獲取失敗:', error);
      throw new Error('無法獲取麥克風權限，請檢查瀏覽器設定');
    }
  }

  /**
   * 建立與 Gemini Live API 的連接
   */
  private async establishLiveConnection(): Promise<void> {
    try {
      const config = {
        responseModalities: [Modality.AUDIO],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: this.config.voice || 'Aoede',
            }
          }
        },
        contextWindowCompression: {
          triggerTokens: '25600',
          slidingWindow: { targetTokens: '12800' },
        },
      };

      this.session = await this.genAI.live.connect({
        model: this.config.model,
        callbacks: {
          onopen: () => {
            console.log('Live API 連接已建立');
            this.handleConnectionOpen();
          },
          onmessage: (message: LiveServerMessage) => {
            this.responseQueue.push(message);
            this.handleServerMessage(message);
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live API 錯誤:', e.message);
            this.handleConnectionError(e);
          },
          onclose: (e: CloseEvent) => {
            console.log('Live API 連接關閉:', e.reason);
            this.handleConnectionClose(e);
          },
        },
        config
      });

      // 發送初始化訊息
      await this.sendInitialPrompt();
      
      console.log('Gemini Live API 連接已建立');
    } catch (error) {
      console.error('Gemini Live API 連接失敗:', error);
      throw new Error('無法連接到語音AI服務');
    }
  }

  /**
   * 發送初始化提示詞
   */
  private async sendInitialPrompt(): Promise<void> {
    if (!this.session) return;

    const systemPrompt = this.buildSystemPrompt();
    
    this.session.sendClientContent({
      turns: [systemPrompt]
    });
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
      return `${basePrompt}

當前創作情境：
- 模板：${this.promptContext.templateName}
- 學習目標：${this.promptContext.learningGoals.join(', ')}
- 對話階段：第 ${this.promptContext.currentStep} 步

請根據這個情境引導對話，並適時提供 Prompt 優化建議。`;
    }

    return basePrompt;
  }

  /**
   * 處理連接開啟事件
   */
  private handleConnectionOpen(): void {
    this.setState({ isConnected: true });
    this.connectionStatus.connected = true;
    this.connectionStatus.lastPingTime = Date.now();
  }

  /**
   * 處理伺服器訊息
   */
  private handleServerMessage(message: LiveServerMessage): void {
    if (message.serverContent?.modelTurn?.parts) {
      const part = message.serverContent.modelTurn.parts[0];

      // 處理文字回應
      if (part?.text) {
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
      if (part?.inlineData) {
        this.handleAudioResponse(part.inlineData);
      }
    }

    // 檢查對話輪次是否完成
    if (message.serverContent?.turnComplete) {
      this.setState({ isLoading: false, isPlaying: false });
    }
  }

  /**
   * 處理音訊回應
   */
  private handleAudioResponse(inlineData: any): void {
    try {
      const audioData = atob(inlineData.data);
      const audioBuffer = new ArrayBuffer(audioData.length);
      const audioView = new Uint8Array(audioBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        audioView[i] = audioData.charCodeAt(i);
      }

      // 播放音訊
      this.playAudioResponse(audioBuffer);
      this.emit('audioReceived', audioBuffer);
    } catch (error) {
      console.error('音訊回應處理失敗:', error);
    }
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
   * 處理連接錯誤
   */
  private handleConnectionError(error: ErrorEvent): void {
    console.error('Live API 連接錯誤:', error);
    this.setState({ error: '語音連接發生錯誤' });
    this.emit('error', new Error(error.message));
  }

  /**
   * 處理連接關閉
   */
  private handleConnectionClose(event: CloseEvent): void {
    this.setState({ isConnected: false });
    this.connectionStatus.connected = false;
    this.emit('disconnected');
    
    // 如果不是正常關閉，嘗試重連
    if (event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  /**
   * 開始錄音
   */
  async startRecording(): Promise<void> {
    if (!this.state.isConnected || !this.session) {
      throw new Error('請先連接語音AI服務');
    }

    if (this.state.isRecording) {
      console.warn('已在錄音中');
      return;
    }

    try {
      if (!this.audioStream) {
        this.audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: this.config.sampleRate,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      }

      // 創建 MediaRecorder 進行即時音訊流
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && this.session) {
          const arrayBuffer = await event.data.arrayBuffer();
          // 即時發送音訊數據到 Live API
          this.sendAudioToAPI(arrayBuffer);
        }
      };

      this.mediaRecorder.start(100); // 每100ms收集一次數據
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
   * 發送音訊到 API
   */
  private async sendAudioToAPI(audioData: ArrayBuffer): Promise<void> {
    if (!this.session) return;

    try {
      // 轉換音訊格式為 Live API 需要的格式
      const processedAudio = await this.convertAudioForAPI(audioData);
      
      // 發送音訊數據到 Live API
      // 注意：這裡需要根據實際的 Live API 介面調整
      // this.session.sendAudio(processedAudio);
      
    } catch (error) {
      console.error('音訊發送失敗:', error);
    }
  }

  /**
   * 轉換音訊格式供 API 使用
   */
  private async convertAudioForAPI(audioData: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.audioContext) {
      throw new Error('音訊上下文未初始化');
    }

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData.slice(0));
      const pcmData = this.audioBufferToPCM(audioBuffer);
      return pcmData;
    } catch (error) {
      console.error('音訊格式轉換失敗:', error);
      throw new Error('音訊格式轉換失敗');
    }
  }

  /**
   * 將 AudioBuffer 轉換為 PCM 數據
   */
  private audioBufferToPCM(audioBuffer: AudioBuffer): ArrayBuffer {
    const length = audioBuffer.length;
    const pcmData = new Int16Array(length);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      pcmData[i] = sample * 0x7FFF;
    }
    
    return pcmData.buffer;
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

    // 關閉 Live API 連接
    if (this.session) {
      this.session.close();
      this.session = null;
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
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
  private audioParts: string[] = [];

  constructor(config: VoiceAIConfig) {
    // 獲取模型名稱，優先使用環境變數
    const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || config.model || 'gemini-2.5-flash-preview-native-audio-dialog';
    
    this.config = {
      model: modelName,
      voice: 'Leda',  // 使用支援中文的語音
      language: 'zh-TW',
      sampleRate: 16000,  // Live API 建議使用 16kHz 輸入
      ...config
    };
    
    // 使用 v1alpha API 版本以支援原生音訊功能
    this.genAI = new GoogleGenAI({
      apiKey: this.config.apiKey,
      httpOptions: {
        apiVersion: "v1alpha"  // 原生音訊功能需要 v1alpha
      }
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
              voiceName: this.config.voice || 'Leda',
            }
          }
        },
        // 啟用情感對話（僅原生音訊模型支援）
        enableAffectiveDialog: true,
        // 啟用主動式音訊（僅原生音訊模型支援）
        proactivity: {
          proactiveAudio: true
        },
        contextWindowCompression: {
          triggerTokens: '25600',
          slidingWindow: { targetTokens: '12800' },
        },
      };

      console.log('正在連接模型:', this.config.model);

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
      throw new Error(`無法連接到語音AI服務: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 發送初始化提示詞
   */
  private async sendInitialPrompt(): Promise<void> {
    if (!this.session) return;

    const systemPrompt = this.buildSystemPrompt();
    
    this.session.sendClientContent({
      turns: [{
        role: "user",
        parts: [{ text: systemPrompt }]
      }]
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
      return `${basePrompt}\n\n當前創作情境：
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
      this.audioParts.push(inlineData?.data ?? '');

      // 使用瀏覽器相容的 WAV 轉換方法
      const buffer = this.convertToWav(this.audioParts, inlineData.mimeType ?? '');
      
      // 播放音訊
      this.playAudioResponse(buffer);
      this.emit('audioReceived', buffer);
    } catch (error) {
      console.error('音訊回應處理失敗:', error);
    }
  }

  /**
   * 轉換為 WAV 格式（瀏覽器相容版本）
   */
  private convertToWav(rawData: string[], mimeType: string): ArrayBuffer {
    const options = this.parseMimeType(mimeType);
    
    // 計算總數據長度
    let totalLength = 0;
    const decodedData: Uint8Array[] = [];
    
    for (const data of rawData) {
      const decoded = this.base64ToUint8Array(data);
      decodedData.push(decoded);
      totalLength += decoded.length;
    }
    
    const wavHeader = this.createWavHeader(totalLength, options);
    
    // 合併 WAV 標頭和音訊數據
    const result = new Uint8Array(wavHeader.length + totalLength);
    result.set(wavHeader, 0);
    
    let offset = wavHeader.length;
    for (const data of decodedData) {
      result.set(data, offset);
      offset += data.length;
    }
    
    return result.buffer;
  }

  /**
   * Base64 轉 Uint8Array（瀏覽器相容）
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  }

  /**
   * 解析 MIME 類型
   */
  private parseMimeType(mimeType: string) {
    const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
    const [_, format] = fileType.split('/');

    const options: any = {
      numChannels: 1,
      bitsPerSample: 16,
      sampleRate: 24000,  // Live API 音訊輸出使用 24kHz
    };

    if (format && format.startsWith('L')) {
      const bits = parseInt(format.slice(1), 10);
      if (!isNaN(bits)) {
        options.bitsPerSample = bits;
      }
    }

    for (const param of params) {
      const [key, value] = param.split('=').map(s => s.trim());
      if (key === 'rate') {
        options.sampleRate = parseInt(value, 10);
      }
    }

    return options;
  }

  /**
   * 創建 WAV 標頭（瀏覽器相容版本）
   */
  private createWavHeader(dataLength: number, options: any): Uint8Array {
    const {
      numChannels,
      sampleRate,
      bitsPerSample,
    } = options;

    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    // RIFF header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    this.writeString(view, 8, 'WAVE');
    
    // fmt chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    
    // data chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    return new Uint8Array(buffer);
  }

  /**
   * 寫入字符串到 DataView
   */
  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
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

      // 重置音訊部分
      this.audioParts = [];

      // 創建 MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const audioChunks: Blob[] = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      // 錄音結束時處理音訊
      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const arrayBuffer = await audioBlob.arrayBuffer();
          
          // 將音訊轉換為 base64 並發送到 Live API
          const base64Audio = this.arrayBufferToBase64(arrayBuffer);
          
          if (this.session) {
            // 使用 sendRealtimeInput 發送音訊
            this.session.sendRealtimeInput({
              audio: {
                data: base64Audio,
                mimeType: "audio/pcm;rate=16000"
              }
            });
          }
          
        } catch (error) {
          console.error('音訊處理失敗:', error);
          this.setState({ error: '音訊處理失敗' });
        }
      };

      this.mediaRecorder.start(100);
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
   * 將 ArrayBuffer 轉換為 Base64
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
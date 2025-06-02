import { GoogleGenAI } from '@google/genai'
import { v4 as uuidv4 } from 'uuid'
import type {
  VoiceAIConfig,
  VoiceMessage,
  VoiceState,
  AudioConfig,
  VoiceAIClientEvents,
  ConnectionStatus,
  VoicePromptContext
} from './types/voice'

/**
 * VoiceAIClient - 語音AI客戶端
 * 負責與 Google Gemini 2.0 Live API 進行語音對話
 */
export class VoiceAIClient {
  private genAI: GoogleGenAI
  private config: VoiceAIConfig
  private state: VoiceState
  private connectionStatus: ConnectionStatus
  private mediaRecorder: MediaRecorder | null = null
  private audioContext: AudioContext | null = null
  private eventListeners: Partial<VoiceAIClientEvents> = {}
  private conversationHistory: VoiceMessage[] = []
  private sessionId: string
  private reconnectTimer: NodeJS.Timeout | null = null
  private maxReconnectAttempts = 5
  private promptContext: VoicePromptContext | null = null

  constructor(config: VoiceAIConfig) {
    this.config = {
      model: 'gemini-2.0-flash-exp',
      voice: 'Aoede', // 台灣中文腔調
      language: 'zh-TW',
      sampleRate: 16000,
      ...config
    }
    
    this.genAI = new GoogleGenAI({
      apiKey: this.config.apiKey,
    })

    this.sessionId = uuidv4()
    
    this.state = {
      isConnected: false,
      isRecording: false,
      isPlaying: false,
      isLoading: false,
      error: null,
      connectionId: undefined
    }

    this.connectionStatus = {
      connected: false,
      lastPingTime: 0,
      reconnectAttempts: 0,
      quality: 'excellent'
    }
  }

  /**
   * 初始化語音AI連接
   */
  async connect(promptContext?: VoicePromptContext): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null })
      this.promptContext = promptContext || null

      // 初始化音訊上下文
      await this.initializeAudioContext()
      
      // 請求麥克風權限
      await this.requestMicrophonePermission()
      
      // 建立與 Gemini Live API 的連接
      await this.establishLiveConnection()
      
      this.setState({ 
        isConnected: true, 
        isLoading: false,
        connectionId: this.sessionId
      })
      
      this.connectionStatus.connected = true
      this.connectionStatus.lastPingTime = Date.now()
      
      this.emit('connected')
      
      console.log('VoiceAI 連接成功！')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '連接失敗'
      this.setState({ 
        isLoading: false, 
        error: errorMessage,
        isConnected: false 
      })
      this.emit('error', new Error(errorMessage))
      throw error
    }
  }

  /**
   * 初始化音訊上下文
   */
  private async initializeAudioContext(): Promise<void> {
    try {
      // 創建音訊上下文
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.config.sampleRate
      })

      // 如果音訊上下文被暫停，則恢復
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      console.log('音訊上下文初始化成功')
    } catch (error) {
      console.error('音訊上下文初始化失敗:', error)
      throw new Error('無法初始化音訊系統')
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
      })
      
      // 測試完成後停止流
      stream.getTracks().forEach(track => track.stop())
      
      console.log('麥克風權限獲取成功')
    } catch (error) {
      console.error('麥克風權限獲取失敗:', error)
      throw new Error('無法獲取麥克風權限，請檢查瀏覽器設定')
    }
  }

  /**
   * 建立與 Gemini Live API 的連接
   */
  private async establishLiveConnection(): Promise<void> {
    try {
      // 這裡會實作與 Gemini Live API 的實際連接
      // 目前先模擬連接成功
      
      // 設定系統提示詞
      const systemPrompt = this.buildSystemPrompt()
      console.log('系統提示詞設定:', systemPrompt)
      
      // 模擬連接延遲
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Gemini Live API 連接已建立')
    } catch (error) {
      console.error('Gemini Live API 連接失敗:', error)
      throw new Error('無法連接到語音AI服務')
    }
  }

  /**
   * 建立系統提示詞
   */
  private buildSystemPrompt(): string {
    const basePrompt = `你是一個專門為親子AI創作設計的語音助手。你的任務是：

1. 引導家長和孩子進行創意對話
2. 教授 Prompt Engineering 技巧
3. 提供即時的優化建議
4. 保持親子友好的語調

語音設定：
- 使用自然、溫暖的語調
- 說話速度適中，方便孩子理解
- 適時給予鼓勵和讚美
- 用簡單易懂的詞彙解釋概念`

    if (this.promptContext) {
      return `${basePrompt}

當前創作情境：
- 模板：${this.promptContext.templateName}
- 學習目標：${this.promptContext.learningGoals.join(', ')}
- 對話階段：第 ${this.promptContext.currentStep} 步

請根據這個情境引導對話，並適時提供 Prompt 優化建議。`
    }

    return basePrompt
  }

  /**
   * 開始錄音
   */
  async startRecording(): Promise<void> {
    if (!this.state.isConnected) {
      throw new Error('請先連接語音AI服務')
    }

    if (this.state.isRecording) {
      console.warn('已在錄音中')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      const audioChunks: Blob[] = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const arrayBuffer = await audioBlob.arrayBuffer()
        
        // 發送音訊到 Gemini Live API 進行處理
        await this.processAudioInput(arrayBuffer)
        
        // 停止所有音軌
        stream.getTracks().forEach(track => track.stop())
      }

      this.mediaRecorder.start(100) // 每100ms收集一次數據
      
      this.setState({ isRecording: true })
      console.log('開始錄音')
      
    } catch (error) {
      console.error('錄音失敗:', error)
      this.setState({ error: '錄音失敗，請檢查麥克風設定' })
      throw error
    }
  }

  /**
   * 停止錄音
   */
  stopRecording(): void {
    if (!this.state.isRecording || !this.mediaRecorder) {
      return
    }

    this.mediaRecorder.stop()
    this.setState({ isRecording: false })
    console.log('停止錄音')
  }

  /**
   * 處理音訊輸入
   */
  private async processAudioInput(audioData: ArrayBuffer): Promise<void> {
    try {
      this.setState({ isLoading: true })
      
      // 轉換音訊格式
      const processedAudio = await this.convertAudioFormat(audioData)
      
      // 模擬語音識別和AI回應
      // 實際實作會發送到 Gemini Live API
      const userMessage: VoiceMessage = {
        id: uuidv4(),
        type: 'user',
        content: '模擬的用戶語音輸入內容',
        timestamp: Date.now(),
        audioData: processedAudio
      }
      
      this.conversationHistory.push(userMessage)
      this.emit('message', userMessage)
      
      // 模擬AI回應
      setTimeout(() => {
        const assistantMessage: VoiceMessage = {
          id: uuidv4(),
          type: 'assistant',
          content: '很好！讓我幫你優化這個描述...',
          timestamp: Date.now()
        }
        
        this.conversationHistory.push(assistantMessage)
        this.emit('message', assistantMessage)
        this.setState({ isLoading: false })
      }, 1000)
      
    } catch (error) {
      console.error('音訊處理失敗:', error)
      this.setState({ 
        isLoading: false, 
        error: '語音處理失敗，請重試' 
      })
    }
  }

  /**
   * 轉換音訊格式
   */
  private async convertAudioFormat(audioData: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.audioContext) {
      throw new Error('音訊上下文未初始化')
    }

    try {
      // 解碼音訊
      const audioBuffer = await this.audioContext.decodeAudioData(audioData.slice(0))
      
      // 轉換為 PCM 格式
      const pcmData = this.audioBufferToPCM(audioBuffer)
      
      return pcmData
    } catch (error) {
      console.error('音訊格式轉換失敗:', error)
      throw new Error('音訊格式轉換失敗')
    }
  }

  /**
   * 將 AudioBuffer 轉換為 PCM 數據
   */
  private audioBufferToPCM(audioBuffer: AudioBuffer): ArrayBuffer {
    const length = audioBuffer.length
    const pcmData = new Int16Array(length)
    const channelData = audioBuffer.getChannelData(0)
    
    for (let i = 0; i < length; i++) {
      // 轉換為 16-bit PCM
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      pcmData[i] = sample * 0x7FFF
    }
    
    return pcmData.buffer
  }

  /**
   * 斷線重連
   */
  private async reconnect(): Promise<void> {
    if (this.connectionStatus.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setState({ error: '重連失敗，請手動重新連接' })
      return
    }

    this.connectionStatus.reconnectAttempts++
    console.log(`嘗試重連... (${this.connectionStatus.reconnectAttempts}/${this.maxReconnectAttempts})`)

    try {
      await this.connect(this.promptContext || undefined)
      this.connectionStatus.reconnectAttempts = 0
    } catch (error) {
      console.error('重連失敗:', error)
      
      // 設定重連定時器
      this.reconnectTimer = setTimeout(() => {
        this.reconnect()
      }, 5000 * this.connectionStatus.reconnectAttempts)
    }
  }

  /**
   * 斷開連接
   */
  disconnect(): void {
    // 停止錄音
    if (this.state.isRecording) {
      this.stopRecording()
    }

    // 清理音訊上下文
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    // 清理定時器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.setState({
      isConnected: false,
      isRecording: false,
      isPlaying: false,
      isLoading: false,
      connectionId: undefined
    })

    this.connectionStatus.connected = false
    this.emit('disconnected')
    
    console.log('VoiceAI 連接已斷開')
  }

  /**
   * 獲取對話歷史
   */
  getConversationHistory(): VoiceMessage[] {
    return [...this.conversationHistory]
  }

  /**
   * 清空對話歷史
   */
  clearConversationHistory(): void {
    this.conversationHistory = []
  }

  /**
   * 獲取當前狀態
   */
  getState(): VoiceState {
    return { ...this.state }
  }

  /**
   * 獲取連接狀態
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  /**
   * 添加事件監聽器
   */
  on<T extends keyof VoiceAIClientEvents>(
    event: T,
    listener: VoiceAIClientEvents[T]
  ): void {
    this.eventListeners[event] = listener
  }

  /**
   * 移除事件監聽器
   */
  off<T extends keyof VoiceAIClientEvents>(event: T): void {
    delete this.eventListeners[event]
  }

  /**
   * 發送事件
   */
  private emit<T extends keyof VoiceAIClientEvents>(
    event: T,
    ...args: Parameters<NonNullable<VoiceAIClientEvents[T]>>
  ): void {
    const listener = this.eventListeners[event]
    if (listener) {
      ;(listener as any)(...args)
    }
  }

  /**
   * 更新狀態
   */
  private setState(newState: Partial<VoiceState>): void {
    this.state = { ...this.state, ...newState }
    this.emit('stateChanged', this.state)
  }
}
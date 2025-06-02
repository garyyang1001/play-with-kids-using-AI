'use client'

import { useState, useEffect, useRef } from 'react'
import { VoiceAIClient } from '@/lib/voice-ai-client'
import type { 
  VoiceMessage, 
  VoiceState, 
  VoicePromptContext,
  ConnectionStatus 
} from '@/lib/types/voice'

interface VoiceChatInterfaceProps {
  templateId: string
  templateName: string
  templateEmoji: string
  onComplete?: (messages: VoiceMessage[]) => void
  onError?: (error: Error) => void
}

export default function VoiceChatInterface({
  templateId,
  templateName,
  templateEmoji,
  onComplete,
  onError
}: VoiceChatInterfaceProps) {
  const [voiceClient, setVoiceClient] = useState<VoiceAIClient | null>(null)
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isConnected: false,
    isRecording: false,
    isPlaying: false,
    isLoading: false,
    error: null
  })
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    lastPingTime: 0,
    reconnectAttempts: 0,
    quality: 'excellent'
  })
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 初始化語音客戶端
    initializeVoiceClient()
    
    return () => {
      // 清理資源
      if (voiceClient) {
        voiceClient.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    // 自動滾動到最新消息
    scrollToBottom()
  }, [messages])

  const initializeVoiceClient = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
      
      if (!apiKey) {
        throw new Error('未設定 Gemini API Key，請檢查環境變數設定')
      }

      const client = new VoiceAIClient({
        apiKey,
        model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash-exp',
        voice: process.env.NEXT_PUBLIC_GEMINI_VOICE || 'Aoede',
        language: process.env.NEXT_PUBLIC_GEMINI_LANGUAGE || 'zh-TW',
        sampleRate: parseInt(process.env.NEXT_PUBLIC_GEMINI_SAMPLE_RATE || '16000')
      })

      // 設定事件監聽器
      setupEventListeners(client)
      
      setVoiceClient(client)

    } catch (error) {
      console.error('語音客戶端初始化失敗:', error)
      const errorMessage = error instanceof Error ? error.message : '語音系統初始化失敗'
      setVoiceState(prev => ({ ...prev, error: errorMessage }))
      onError?.(new Error(errorMessage))
    }
  }

  const setupEventListeners = (client: VoiceAIClient) => {
    client.on('connected', () => {
      console.log('語音AI已連接')
      setConnectionStatus(client.getConnectionStatus())
    })

    client.on('disconnected', () => {
      console.log('語音AI已斷開連接')
      setConnectionStatus(client.getConnectionStatus())
    })

    client.on('error', (error) => {
      console.error('語音AI錯誤:', error)
      onError?.(error)
    })

    client.on('message', (message) => {
      console.log('收到語音消息:', message)
      setMessages(prev => [...prev, message])
      setCurrentStep(prev => prev + 1)
    })

    client.on('stateChanged', (state) => {
      setVoiceState(state)
    })
  }

  const handleConnect = async () => {
    if (!voiceClient) {
      await initializeVoiceClient()
      return
    }

    try {
      const promptContext: VoicePromptContext = {
        templateId,
        templateName,
        conversationHistory: messages,
        currentStep,
        learningGoals: getTemplateGoals()
      }

      await voiceClient.connect(promptContext)
      
      // 添加歡迎消息
      const welcomeMessage: VoiceMessage = {
        id: `welcome-${Date.now()}`,
        type: 'assistant',
        content: getWelcomeMessage(),
        timestamp: Date.now()
      }
      
      setMessages([welcomeMessage])
      
    } catch (error) {
      console.error('連接失敗:', error)
    }
  }

  const handleMicrophoneClick = async () => {
    if (!voiceClient || !voiceState.isConnected) {
      await handleConnect()
      return
    }

    try {
      if (voiceState.isRecording) {
        voiceClient.stopRecording()
      } else {
        await voiceClient.startRecording()
      }
    } catch (error) {
      console.error('錄音操作失敗:', error)
    }
  }

  const handleDisconnect = () => {
    if (voiceClient) {
      voiceClient.disconnect()
      setMessages([])
      setCurrentStep(1)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getTemplateGoals = (): string[] => {
    const goals: Record<string, string[]> = {
      'daily-life': ['時間順序描述', '場景細節表達', '感官體驗描述'],
      'adventure': ['角色設定技巧', '情節發展邏輯', '衝突解決方案'],
      'animal-friend': ['角色個性設計', '互動場景創作', '視覺創意表達']
    }
    return goals[templateId] || ['創意表達', 'AI溝通技巧']
  }

  const getWelcomeMessage = (): string => {
    const welcomeMessages: Record<string, string> = {
      'daily-life': '嗨！讓我們一起記錄你美好的一天！告訴我你今天做了什麼有趣的事情吧～我會幫你學習如何更生動地描述呢！',
      'adventure': '哇！準備好踏上精彩的冒險旅程了嗎？告訴我你想要什麼樣的冒險故事，我會教你如何創造吸引人的角色和情節！',
      'animal-friend': '太棒了！讓我們一起創造一個可愛的動物朋友吧！你想要什麼樣的動物角色呢？我會幫你設計出獨特的個性和特色！'
    }
    return welcomeMessages[templateId] || '你好！讓我們開始這次有趣的AI創作之旅吧！'
  }

  const getConnectionQualityColor = () => {
    switch (connectionStatus.quality) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'poor': return 'text-yellow-600'
      case 'unstable': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getConnectionQualityText = () => {
    switch (connectionStatus.quality) {
      case 'excellent': return '優秀'
      case 'good': return '良好'
      case 'poor': return '一般'
      case 'unstable': return '不穩定'
      default: return '未知'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 連接狀態指示器 */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              voiceState.isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-gray-600">
              {voiceState.isConnected ? '已連接' : '未連接'}
            </span>
            {voiceState.isConnected && (
              <span className={`${getConnectionQualityColor()} font-medium`}>
                · 品質：{getConnectionQualityText()}
              </span>
            )}
          </div>
          <div className="text-gray-500">
            {templateEmoji} {templateName}
          </div>
        </div>
      </div>

      {/* 對話區域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
              message.type === 'user'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div className="flex items-start gap-3">
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                    🤖
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className="text-xs opacity-70 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">
                    👤
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {voiceState.isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                🤖
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm text-gray-600">AI正在思考中...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 錯誤顯示 */}
      {voiceState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg mx-4 mb-4 p-3">
          <div className="flex items-center gap-2 text-red-800">
            <span className="text-red-500">⚠️</span>
            <span className="text-sm font-medium">錯誤</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{voiceState.error}</p>
          <button
            onClick={() => setVoiceState(prev => ({ ...prev, error: null }))}
            className="text-red-600 text-sm underline mt-2"
          >
            關閉
          </button>
        </div>
      )}

      {/* 控制區域 */}
      <div className="bg-white border-t px-4 py-6">
        <div className="text-center space-y-4">
          {/* 麥克風按鈕 */}
          <div>
            <button
              onClick={handleMicrophoneClick}
              disabled={voiceState.isLoading}
              className={`voice-button ${
                voiceState.isRecording ? 'recording' : 'idle'
              } ${voiceState.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-white text-2xl">
                {voiceState.isLoading ? '⏳' : 
                 voiceState.isRecording ? '🔴' : 
                 voiceState.isConnected ? '🎤' : '🔌'}
              </span>
            </button>
            
            <p className="mt-3 text-gray-600 text-sm">
              {voiceState.isLoading ? '正在處理中...' :
               voiceState.isRecording ? '正在聆聽...' :
               voiceState.isConnected ? '點擊開始說話' :
               '點擊連接語音AI'}
            </p>
          </div>

          {/* 控制按鈕 */}
          <div className="flex gap-3 justify-center">
            {!voiceState.isConnected ? (
              <button
                onClick={handleConnect}
                disabled={voiceState.isLoading}
                className="btn-primary text-sm px-4 py-2"
              >
                連接語音AI
              </button>
            ) : (
              <>
                <button
                  onClick={handleDisconnect}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  斷開連接
                </button>
                <button
                  onClick={() => onComplete?.(messages)}
                  disabled={messages.length === 0}
                  className="btn-primary text-sm px-4 py-2"
                >
                  完成對話
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
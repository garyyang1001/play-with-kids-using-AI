'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface VoiceState {
  isConnected: boolean
  isRecording: boolean
  isLoading: boolean
  error: string | null
}

export default function VoiceChat() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [template, setTemplate] = useState<string>('')
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isConnected: false,
    isRecording: false,
    isLoading: false,
    error: null
  })

  useEffect(() => {
    const templateParam = searchParams.get('template')
    if (templateParam) {
      setTemplate(templateParam)
    }
  }, [searchParams])

  const handleStartVoiceChat = () => {
    setVoiceState(prev => ({ ...prev, isLoading: true }))
    
    // 模擬初始化過程
    setTimeout(() => {
      setVoiceState({
        isConnected: true,
        isRecording: false,
        isLoading: false,
        error: null
      })
      alert('語音系統已就緒！\n\n🎤 點擊麥克風開始對話\n💡 AI助手將引導你創作\n✨ 學習 Prompt Engineering\n\n(實際語音功能將在下一階段開發)')
    }, 2000)
  }

  const handleMicrophoneClick = () => {
    if (!voiceState.isConnected) {
      handleStartVoiceChat()
      return
    }

    setVoiceState(prev => ({ 
      ...prev, 
      isRecording: !prev.isRecording 
    }))

    // 模擬語音對話
    if (!voiceState.isRecording) {
      setTimeout(() => {
        alert('🎤 正在聆聽中...\n\n請描述你想要創作的內容\n例如：「我想要一個小朋友在公園玩的影片」\n\n(實際語音識別將在階段2實作)')
        setVoiceState(prev => ({ ...prev, isRecording: false }))
      }, 3000)
    }
  }

  const getTemplateInfo = (templateId: string) => {
    const templates: Record<string, any> = {
      'daily-life': {
        name: '我的一天',
        emoji: '🌅',
        prompt: '讓我們一起記錄你的美好一天！告訴我你今天做了什麼有趣的事情吧～'
      },
      'adventure': {
        name: '夢想冒險',
        emoji: '🚀',
        prompt: '準備好踏上精彩的冒險旅程了嗎？告訴我你想要什麼樣的冒險故事！'
      },
      'animal-friend': {
        name: '動物朋友',
        emoji: '🐼',
        prompt: '讓我們創造一個可愛的動物朋友！你想要什麼樣的動物角色呢？'
      }
    }
    return templates[templateId] || templates['daily-life']
  }

  const templateInfo = getTemplateInfo(template)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => router.push('/template-experience')}
              className="flex items-center text-primary hover:text-primary/80"
            >
              ← 返回模板選擇
            </button>
            <h1 className="text-xl font-bold text-text">
              {templateInfo.emoji} {templateInfo.name} - 語音創作
            </h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左側 - 語音對話區域 */}
          <div className="lg:col-span-2">
            <div className="card text-center mb-8">
              <h2 className="text-2xl font-bold text-text mb-4">
                🎤 語音對話區域
              </h2>
              
              {/* 語音狀態顯示 */}
              <div className="mb-6">
                {voiceState.isLoading && (
                  <div className="text-lg text-gray-600">
                    🔄 正在初始化語音系統...
                  </div>
                )}
                {voiceState.isConnected && !voiceState.isLoading && (
                  <div className="text-lg text-green-600">
                    ✅ 語音系統已就緒
                  </div>
                )}
                {!voiceState.isConnected && !voiceState.isLoading && (
                  <div className="text-lg text-gray-600">
                    點擊下方麥克風開始對話
                  </div>
                )}
              </div>

              {/* 麥克風按鈕 */}
              <div className="mb-8">
                <button
                  onClick={handleMicrophoneClick}
                  disabled={voiceState.isLoading}
                  className={`voice-button ${
                    voiceState.isRecording ? 'recording' : 'idle'
                  } ${voiceState.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-white text-2xl">
                    {voiceState.isLoading ? '⏳' : voiceState.isRecording ? '🔴' : '🎤'}
                  </span>
                </button>
                <p className="mt-4 text-gray-600">
                  {voiceState.isRecording ? '正在聆聽...' : '按住說話'}
                </p>
              </div>

              {/* AI 助手提示 */}
              <div className="bg-primary/10 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl">
                    🤖
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-text mb-2">AI 助手</h3>
                    <p className="text-gray-700">
                      {templateInfo.prompt}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 對話記錄區域 */}
            <div className="card">
              <h3 className="text-xl font-bold text-text mb-4">💬 對話記錄</h3>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                <p className="text-gray-500 text-center">
                  對話記錄將顯示在這裡...
                  <br />
                  (語音對話功能將在階段2實作)
                </p>
              </div>
            </div>
          </div>

          {/* 右側 - 學習指導區域 */}
          <div className="lg:col-span-1">
            <div className="card mb-6">
              <h3 className="text-xl font-bold text-text mb-4">💡 家長小幫手</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">引導提示</h4>
                  <p className="text-yellow-700 text-sm">
                    鼓勵孩子用自己的話描述想法，不用擔心說錯！
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">學習重點</h4>
                  <p className="text-blue-700 text-sm">
                    這個階段主要學習如何清楚表達想法和使用描述性詞彙
                  </p>
                </div>
              </div>
            </div>

            <div className="card mb-6">
              <h3 className="text-xl font-bold text-text mb-4">🎨 Prompt 優化</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">描述清晰度</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-0"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">創意豐富度</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full w-0"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">情感表達</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full w-0"></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                開始對話後，這裡會顯示即時的優化建議
              </p>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-text mb-4">📈 學習進度</h3>
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-gray-500">0%</span>
                </div>
                <p className="text-sm text-gray-600">
                  完成對話後會更新進度
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部控制按鈕 */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/template-experience')}
            className="btn-secondary mr-4"
          >
            重新選擇模板
          </button>
          <button
            onClick={() => alert('影片生成功能將在階段5實作！\n\n目前專注於：\n• 階段2：語音對話系統\n• 階段3：Prompt Engineering教學\n• 階段4：模板深度實作')}
            className="btn-primary"
            disabled={!voiceState.isConnected}
          >
            進入影片生成 🎬
          </button>
        </div>
      </div>
    </main>
  )
}
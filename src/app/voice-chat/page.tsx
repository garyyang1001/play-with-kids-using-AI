'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import VoiceChatInterface from '@/components/voice-chat/VoiceChatInterface'
import type { VoiceMessage } from '@/lib/types/voice'

interface Template {
  id: string
  name: string
  emoji: string
  description: string
  promptHints: string[]
  learningTips: string[]
}

const templates: Record<string, Template> = {
  'daily-life': {
    id: 'daily-life',
    name: '我的一天',
    emoji: '🌅',
    description: '記錄日常生活，學習時間順序和場景描述',
    promptHints: [
      '試著描述時間：「早上、中午、晚上」',
      '加入感官描述：「聽到、看到、聞到」',
      '描述你的感受：「開心、興奮、期待」'
    ],
    learningTips: [
      '鼓勵孩子按時間順序描述',
      '引導使用豐富的形容詞',
      '讚美具體的場景描述'
    ]
  },
  'adventure': {
    id: 'adventure',
    name: '夢想冒險',
    emoji: '🚀',
    description: '創造想像中的冒險故事，培養創意思維',
    promptHints: [
      '設計你的英雄角色：「勇敢的、聰明的」',
      '描述冒險場景：「神秘的森林、太空基地」',
      '創造有趣的情節：「遇到困難、解決問題」'
    ],
    learningTips: [
      '鼓勵大膽的想像力',
      '引導邏輯性的故事發展',
      '讚美創意的角色設定'
    ]
  },
  'animal-friend': {
    id: 'animal-friend',
    name: '動物朋友',
    emoji: '🐼',
    description: '設計可愛的動物角色，學習個性描述',
    promptHints: [
      '描述動物的外貌：「毛茸茸的、彩色的」',
      '設計動物的個性：「調皮的、溫柔的」',
      '想像互動場景：「一起玩耍、分享食物」'
    ],
    learningTips: [
      '引導觀察動物特徵',
      '鼓勵賦予動物個性',
      '讚美創意的互動想像'
    ]
  }
}

export default function VoiceChat() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [templateId, setTemplateId] = useState<string>('daily-life')
  const [template, setTemplate] = useState<Template>(templates['daily-life'])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const templateParam = searchParams.get('template') || 'daily-life'
    setTemplateId(templateParam)
    setTemplate(templates[templateParam] || templates['daily-life'])
    setIsLoading(false)
  }, [searchParams])

  const handleConversationComplete = (messages: VoiceMessage[]) => {
    console.log('對話完成，消息數量:', messages.length)
    alert(`對話完成！\n\n共進行了 ${messages.length} 次交流\n\n下一步：\n• Prompt 優化分析\n• 影片生成準備\n• 學習成果總結\n\n(這些功能將在後續階段開發)`)
    
    // 之後可以跳轉到結果頁面或影片生成頁面
    // router.push('/video-generation?messages=' + encodeURIComponent(JSON.stringify(messages)))
  }

  const handleError = (error: Error) => {
    console.error('語音對話錯誤:', error)
    // 這裡可以添加錯誤追蹤或通知
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-text">載入中...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
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
              {template.emoji} {template.name} - 語音創作
            </h1>
            <button
              onClick={() => router.push('/voice-test')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              測試連接
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* 左側 - 語音對話區域 */}
        <div className="flex-1 flex flex-col">
          <VoiceChatInterface
            templateId={templateId}
            templateName={template.name}
            templateEmoji={template.emoji}
            onComplete={handleConversationComplete}
            onError={handleError}
          />
        </div>

        {/* 右側 - 學習指導區域 */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* 模板資訊 */}
            <div className="card">
              <h3 className="text-lg font-bold text-text mb-3">
                {template.emoji} {template.name}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* 家長小幫手 */}
            <div className="card">
              <h3 className="text-lg font-bold text-text mb-3">💡 家長小幫手</h3>
              <div className="space-y-3">
                <div className="bg-yellow-50 rounded-lg p-3">
                  <h4 className="font-semibold text-yellow-800 text-sm mb-2">引導技巧</h4>
                  <ul className="text-yellow-700 text-xs space-y-1">
                    {template.learningTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Prompt 提示 */}
            <div className="card">
              <h3 className="text-lg font-bold text-text mb-3">🎨 Prompt 提示</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-800 text-sm mb-2">描述建議</h4>
                  <ul className="text-blue-700 text-xs space-y-1">
                    {template.promptHints.map((hint, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Prompt 品質分析 */}
            <div className="card">
              <h3 className="text-lg font-bold text-text mb-3">📊 品質分析</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">描述清晰度</span>
                    <span className="text-gray-500">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-0 transition-all duration-500"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">創意豐富度</span>
                    <span className="text-gray-500">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full w-0 transition-all duration-500"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">情感表達</span>
                    <span className="text-gray-500">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full w-0 transition-all duration-500"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                開始對話後，這裡會顯示即時的品質分析
              </p>
            </div>

            {/* 學習進度 */}
            <div className="card">
              <h3 className="text-lg font-bold text-text mb-3">📈 學習進度</h3>
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-500">0%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  完成對話後會更新進度
                </p>
              </div>
            </div>

            {/* 快速操作 */}
            <div className="card">
              <h3 className="text-lg font-bold text-text mb-3">⚡ 快速操作</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/voice-test')}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  🔧 測試語音連接
                </button>
                <button
                  onClick={() => router.push('/template-experience')}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  🔄 切換模板
                </button>
                <button
                  onClick={() => alert('學習歷程功能將在後續開發！')}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  📚 查看學習歷程
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
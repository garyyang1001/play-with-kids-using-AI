'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Template {
  id: string
  name: string
  level: string
  duration: string
  emoji: string
  description: string
  color: string
  features: string[]
  skills: string[]
}

const templates: Record<string, Template> = {
  'daily-life': {
    id: 'daily-life',
    name: '我的一天',
    level: '基礎級',
    duration: '3-5 分鐘',
    emoji: '🌅',
    description: '記錄孩子的日常生活，學習時間順序和場景描述',
    color: 'blue',
    features: ['時間邏輯', '場景描述', '感官細節', '情感表達'],
    skills: ['描述清晰度', '時間順序', '日常詞彙', '基礎結構']
  },
  'adventure': {
    id: 'adventure',
    name: '夢想冒險',
    level: '進階級', 
    duration: '4-6 分鐘',
    emoji: '🚀',
    description: '創造想像中的冒險故事，培養創意思維和情節設計',
    color: 'green',
    features: ['角色設定', '情節發展', '衝突解決', '創意想像'],
    skills: ['角色描述', '故事邏輯', '創意表達', '進階詞彙']
  },
  'animal-friend': {
    id: 'animal-friend',
    name: '動物朋友',
    level: '創意級',
    duration: '5-7 分鐘',
    emoji: '🐼',
    description: '設計可愛的動物角色，學習個性描述和互動場景',
    color: 'purple',
    features: ['角色設計', '個性描述', '互動場景', '創意元素'],
    skills: ['個性設計', '互動描述', '視覺創意', '高級表達']
  }
}

export default function TemplateExperience() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const templateParam = searchParams.get('template')
    if (templateParam) {
      // 從URL參數中獲取模板
      let templateId = ''
      switch(templateParam) {
        case '我的一天':
          templateId = 'daily-life'
          break
        case '夢想冒險':
          templateId = 'adventure'
          break
        case '動物朋友':
          templateId = 'animal-friend'
          break
        default:
          templateId = 'daily-life'
      }
      setSelectedTemplate(templates[templateId])
    }
    setLoading(false)
  }, [searchParams])

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templates[templateId])
  }

  const handleStartCreation = () => {
    if (selectedTemplate) {
      alert(`準備開始 "${selectedTemplate.name}" 創作體驗！\n\n下一步將進入語音對話系統...`)
      // 之後會跳轉到語音對話頁面
      // router.push(`/voice-chat?template=${selectedTemplate.id}`)
    }
  }

  const getColorClass = (color: string) => {
    switch(color) {
      case 'blue': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'green': return 'bg-green-50 border-green-200 text-green-800'
      case 'purple': return 'bg-purple-50 border-purple-200 text-purple-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-text">載入中...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center text-primary hover:text-primary/80"
            >
              ← 返回首頁
            </button>
            <h1 className="text-xl font-bold text-text">模板體驗</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!selectedTemplate ? (
          /* 模板選擇視圖 */
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text mb-4">選擇你的創作模板</h2>
            <p className="text-xl text-gray-600 mb-12">每個模板都有不同的學習重點和創作風格</p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {Object.values(templates).map((template) => (
                <div
                  key={template.id}
                  className={`card hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 cursor-pointer ${getColorClass(template.color)}`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">{template.emoji}</div>
                    <h3 className="text-2xl font-bold mb-2">{template.name}</h3>
                    <p className="text-sm opacity-75 mb-4">{template.level} · {template.duration}</p>
                    <p className="text-sm mb-6 leading-relaxed">{template.description}</p>
                    
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">學習重點：</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {template.features.map((feature, index) => (
                          <span key={index} className="px-3 py-1 bg-white/50 rounded-full text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button className="btn-primary w-full">
                      選擇這個模板
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 選定模板詳細視圖 */
          <div>
            <div className="text-center mb-12">
              <div className="text-8xl mb-4">{selectedTemplate.emoji}</div>
              <h2 className="text-4xl font-bold text-text mb-4">{selectedTemplate.name}</h2>
              <p className="text-xl text-gray-600 mb-2">{selectedTemplate.level} · {selectedTemplate.duration}</p>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">{selectedTemplate.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* 學習重點 */}
              <div className="card">
                <h3 className="text-xl font-bold mb-4 text-text">🎯 學習重點</h3>
                <div className="space-y-3">
                  {selectedTemplate.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 技能培養 */}
              <div className="card">
                <h3 className="text-xl font-bold mb-4 text-text">🌟 技能培養</h3>
                <div className="space-y-3">
                  {selectedTemplate.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <span className="text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 創作流程預覽 */}
            <div className="card mb-12">
              <h3 className="text-xl font-bold mb-6 text-text">📋 創作流程預覽</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎤</span>
                  </div>
                  <h4 className="font-semibold mb-2">語音對話</h4>
                  <p className="text-sm text-gray-600">與AI助手對話，描述你的想法</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h4 className="font-semibold mb-2">Prompt 優化</h4>
                  <p className="text-sm text-gray-600">學習如何改進描述，讓AI更懂你</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <h4 className="font-semibold mb-2">影片生成</h4>
                  <p className="text-sm text-gray-600">AI根據你的描述創作影片</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h4 className="font-semibold mb-2">分享作品</h4>
                  <p className="text-sm text-gray-600">與家人朋友分享你的創作成果</p>
                </div>
              </div>
            </div>

            {/* 行動按鈕 */}
            <div className="text-center">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="btn-secondary mr-4"
              >
                重新選擇模板
              </button>
              <button
                onClick={handleStartCreation}
                className="btn-primary text-xl px-8 py-4 hover:transform hover:scale-105 transition-all duration-200"
              >
                開始創作體驗 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
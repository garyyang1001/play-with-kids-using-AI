'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [showAlert, setShowAlert] = useState(false)

  const handleTemplateClick = (templateName: string) => {
    // 暫時顯示提示，之後可以改為實際的模板頁面路由
    alert(`點擊了${templateName}模板！\n即將前往創作頁面...`)
    // router.push(`/template-experience?template=${templateName}`)
  }

  const handleStartExperience = () => {
    // 前往第一個模板或選擇頁面
    alert('開始免費體驗！\n請選擇下方的創作主題')
    // router.push('/template-experience')
  }

  const handleNavigation = (page: string) => {
    alert(`導航到：${page}\n(功能開發中...)`)
    // 之後可以實作具體的頁面跳轉
    // router.push(`/${page}`)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary cursor-pointer" 
                  onClick={() => router.push('/')}>
                AI 親子創作坊
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => handleNavigation('create')}
                className="text-text hover:text-primary transition-colors"
              >
                開始創作
              </button>
              <button 
                onClick={() => handleNavigation('learning-report')}
                className="text-text hover:text-primary transition-colors"
              >
                學習歷程
              </button>
              <button 
                onClick={() => handleNavigation('gallery')}
                className="text-text hover:text-primary transition-colors"
              >
                分享作品
              </button>
            </nav>
            <button 
              onClick={() => handleNavigation('login')}
              className="bg-gray-200 hover:bg-gray-300 text-text px-4 py-2 rounded-lg transition-colors"
            >
              登入
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-text mb-6">
            和孩子一起創作 AI 影片，學習未來技能！
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            5 分鐘完成專屬動畫，掌握 Prompt Engineering
          </p>
          <button 
            onClick={handleStartExperience}
            className="btn-secondary text-xl px-8 py-4 hover:transform hover:scale-105 transition-all duration-200"
          >
            開始免費體驗
          </button>
        </div>
      </section>

      {/* Template Cards */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-text mb-12">
            選擇你的創作主題
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-blue-50 border-blue-200 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌅</span>
                </div>
                <h4 className="text-xl font-bold text-text mb-2">我的一天</h4>
                <p className="text-gray-600 mb-4">基礎級 · 3-5 分鐘</p>
                <button 
                  onClick={() => handleTemplateClick('我的一天')}
                  className="btn-primary w-full hover:transform hover:scale-105 transition-all duration-200"
                >
                  開始創作
                </button>
              </div>
            </div>
            
            <div className="card bg-green-50 border-green-200 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h4 className="text-xl font-bold text-text mb-2">夢想冒險</h4>
                <p className="text-gray-600 mb-4">進階級 · 4-6 分鐘</p>
                <button 
                  onClick={() => handleTemplateClick('夢想冒險')}
                  className="btn-primary w-full hover:transform hover:scale-105 transition-all duration-200"
                >
                  開始創作
                </button>
              </div>
            </div>
            
            <div className="card bg-purple-50 border-purple-200 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🐼</span>
                </div>
                <h4 className="text-xl font-bold text-text mb-2">動物朋友</h4>
                <p className="text-gray-600 mb-4">創意級 · 5-7 分鐘</p>
                <button 
                  onClick={() => handleTemplateClick('動物朋友')}
                  className="btn-primary w-full hover:transform hover:scale-105 transition-all duration-200"
                >
                  開始創作
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-text mb-12">
            簡單 4 步驟，輕鬆上手
          </h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => alert('步驟 1：選擇適合的創作主題\n可以從基礎級開始！')}>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h4 className="font-bold text-text mb-2">選擇模板</h4>
              <p className="text-gray-600 text-sm">挑選適合的創作主題</p>
            </div>
            
            <div className="text-center hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => alert('步驟 2：語音對話\n用自然的中文和 AI 對話！')}>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h4 className="font-bold text-text mb-2">語音對話</h4>
              <p className="text-gray-600 text-sm">與 AI 互動描述想法</p>
            </div>
            
            <div className="text-center hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => alert('步驟 3：AI 生成影片\n等待 2-3 分鐘就能看到精美動畫！')}>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎬</span>
              </div>
              <h4 className="font-bold text-text mb-2">AI 生成影片</h4>
              <p className="text-gray-600 text-sm">等待精美動畫生成</p>
            </div>
            
            <div className="text-center hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => alert('步驟 4：分享作品\n展示你和孩子的學習成果！')}>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-bold text-text mb-2">分享作品</h4>
              <p className="text-gray-600 text-sm">展示學習成果</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => alert('AI 語音引導功能\n✓ 支援繁體中文\n✓ 親子友善互動\n✓ 即時回應')}>
              <h4 className="text-xl font-bold text-text mb-4">AI 語音引導</h4>
              <p className="text-gray-600">支援中文對話，親子互動</p>
            </div>
            
            <div className="text-center hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => alert('Prompt 教學功能\n✓ 學習 AI 溝通技巧\n✓ 即時優化建議\n✓ 創意表達提升')}>
              <h4 className="text-xl font-bold text-text mb-4">Prompt 教學</h4>
              <p className="text-gray-600">學習 AI 溝通技巧</p>
            </div>
            
            <div className="text-center hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => alert('高品質影片輸出\n✓ 9:16 豎屏動畫\n✓ 適合社群分享\n✓ 專業級品質')}>
              <h4 className="text-xl font-bold text-text mb-4">高品質影片</h4>
              <p className="text-gray-600">9:16 豎屏動畫影片</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center space-x-8 text-gray-600">
            <button 
              onClick={() => handleNavigation('about')}
              className="hover:text-primary transition-colors"
            >
              關於我們
            </button>
            <button 
              onClick={() => handleNavigation('guide')}
              className="hover:text-primary transition-colors"
            >
              使用說明
            </button>
            <button 
              onClick={() => handleNavigation('privacy')}
              className="hover:text-primary transition-colors"
            >
              隱私政策
            </button>
          </div>
        </div>
      </footer>
    </main>
  )
}
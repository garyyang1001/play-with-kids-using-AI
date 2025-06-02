export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">AI 親子創作坊</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-text hover:text-primary transition-colors">開始創作</a>
              <a href="#" className="text-text hover:text-primary transition-colors">學習歷程</a>
              <a href="#" className="text-text hover:text-primary transition-colors">分享作品</a>
            </nav>
            <button className="bg-gray-200 hover:bg-gray-300 text-text px-4 py-2 rounded-lg transition-colors">
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
          <button className="btn-secondary text-xl px-8 py-4">
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
            <div className="card bg-blue-50 border-blue-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌅</span>
                </div>
                <h4 className="text-xl font-bold text-text mb-2">我的一天</h4>
                <p className="text-gray-600 mb-4">基礎級 · 3-5 分鐘</p>
                <button className="btn-primary w-full">開始創作</button>
              </div>
            </div>
            
            <div className="card bg-green-50 border-green-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h4 className="text-xl font-bold text-text mb-2">夢想冒險</h4>
                <p className="text-gray-600 mb-4">進階級 · 4-6 分鐘</p>
                <button className="btn-primary w-full">開始創作</button>
              </div>
            </div>
            
            <div className="card bg-purple-50 border-purple-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🐼</span>
                </div>
                <h4 className="text-xl font-bold text-text mb-2">動物朋友</h4>
                <p className="text-gray-600 mb-4">創意級 · 5-7 分鐘</p>
                <button className="btn-primary w-full">開始創作</button>
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
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h4 className="font-bold text-text mb-2">選擇模板</h4>
              <p className="text-gray-600 text-sm">挑選適合的創作主題</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h4 className="font-bold text-text mb-2">語音對話</h4>
              <p className="text-gray-600 text-sm">與 AI 互動描述想法</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎬</span>
              </div>
              <h4 className="font-bold text-text mb-2">AI 生成影片</h4>
              <p className="text-gray-600 text-sm">等待精美動畫生成</p>
            </div>
            
            <div className="text-center">
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
            <div className="text-center">
              <h4 className="text-xl font-bold text-text mb-4">AI 語音引導</h4>
              <p className="text-gray-600">支援中文對話，親子互動</p>
            </div>
            
            <div className="text-center">
              <h4 className="text-xl font-bold text-text mb-4">Prompt 教學</h4>
              <p className="text-gray-600">學習 AI 溝通技巧</p>
            </div>
            
            <div className="text-center">
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
            <a href="#" className="hover:text-primary transition-colors">關於我們</a>
            <a href="#" className="hover:text-primary transition-colors">使用說明</a>
            <a href="#" className="hover:text-primary transition-colors">隱私政策</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
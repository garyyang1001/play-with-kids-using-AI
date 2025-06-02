'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectionStabilityTester } from '@/lib/connection-stability-tester'
import type { StabilityTestResult } from '@/lib/connection-stability-tester'

export default function VoiceTest() {
  const router = useRouter()
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<StabilityTestResult | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)

  const runStabilityTest = async () => {
    setIsTesting(true)
    setTestResult(null)

    try {
      const tester = new ConnectionStabilityTester({
        testCount: 5,
        timeoutMs: 5000,
        intervalMs: 1000,
        enableLatencyTest: true
      })

      // 檢查是否有 API Key
      const testApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY
      
      if (!testApiKey) {
        throw new Error('請提供 Gemini API Key 或設定環境變數')
      }

      const result = await tester.runStabilityTest({
        apiKey: testApiKey,
        model: 'gemini-2.0-flash-exp',
        voice: 'Aoede',
        language: 'zh-TW',
        sampleRate: 16000
      })

      setTestResult(result)

    } catch (error) {
      console.error('測試失敗:', error)
      const errorResult: StabilityTestResult = {
        success: false,
        totalTests: 5,
        successfulConnections: 0,
        failedConnections: 5,
        averageConnectionTime: 0,
        averageLatency: 0,
        errorMessages: [error instanceof Error ? error.message : '未知錯誤'],
        qualityAssessment: 'unstable',
        recommendations: ['檢查網路連線', '確認 API Key 正確', '檢查環境變數設定']
      }
      setTestResult(errorResult)
    } finally {
      setIsTesting(false)
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'good': return 'text-blue-600 bg-blue-50'
      case 'poor': return 'text-yellow-600 bg-yellow-50'
      case 'unstable': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return '🟢'
      case 'good': return '🔵'
      case 'poor': return '🟡'
      case 'unstable': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => router.push('/voice-chat')}
              className="flex items-center text-primary hover:text-primary/80"
            >
              ← 返回語音對話
            </button>
            <h1 className="text-xl font-bold text-text">語音連接測試</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 測試說明 */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-text mb-4">🔧 語音AI連接測試</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            這個測試工具會檢查你的設備與 Gemini 語音AI服務的連接品質。
            我們會進行多次連接測試，測量連接時間和延遲，並提供改善建議。
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 測試前準備</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• 確保網路連線穩定</li>
              <li>• 允許瀏覽器使用麥克風權限</li>
              <li>• 設定正確的 Gemini API Key</li>
              <li>• 關閉其他耗費頻寬的應用程式</li>
            </ul>
          </div>
        </div>

        {/* API Key 設定 */}
        <div className="card mb-8">
          <h3 className="text-lg font-bold text-text mb-4">🔑 API Key 設定</h3>
          
          <div className="mb-4">
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={showApiKeyInput}
                onChange={(e) => setShowApiKeyInput(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">
                手動輸入 API Key（如果環境變數未設定）
              </span>
            </label>
          </div>

          {showApiKeyInput && (
            <div className="mb-4">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="輸入你的 Gemini API Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-2">
                API Key 只會在本次測試中使用，不會被儲存
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <strong>如何獲取 API Key：</strong><br />
              1. 前往 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a><br />
              2. 登入你的 Google 帳號<br />
              3. 創建新的 API Key<br />
              4. 複製 API Key 並貼到上方欄位
            </p>
          </div>
        </div>

        {/* 測試控制 */}
        <div className="card mb-8 text-center">
          <button
            onClick={runStabilityTest}
            disabled={isTesting}
            className={`btn-primary text-lg px-8 py-4 ${
              isTesting ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:scale-105'
            } transition-all duration-200`}
          >
            {isTesting ? '正在測試中...' : '🚀 開始連接測試'}
          </button>
          
          {isTesting && (
            <div className="mt-4">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>正在執行連接穩定性測試...</span>
              </div>
            </div>
          )}
        </div>

        {/* 測試結果 */}
        {testResult && (
          <div className="space-y-6">
            {/* 整體評估 */}
            <div className="card">
              <h3 className="text-xl font-bold text-text mb-4">📊 測試結果總覽</h3>
              
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {testResult.successfulConnections}
                  </div>
                  <div className="text-sm text-gray-600">成功連接</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-500 mb-1">
                    {testResult.failedConnections}
                  </div>
                  <div className="text-sm text-gray-600">失敗連接</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500 mb-1">
                    {testResult.averageConnectionTime.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-gray-600">平均連接時間</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-500 mb-1">
                    {testResult.averageLatency.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-gray-600">平均延遲</div>
                </div>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getQualityColor(testResult.qualityAssessment)}`}>
                <span className="text-lg">{getQualityIcon(testResult.qualityAssessment)}</span>
                <span className="font-semibold">
                  整體品質：{testResult.qualityAssessment === 'excellent' ? '優秀' :
                           testResult.qualityAssessment === 'good' ? '良好' :
                           testResult.qualityAssessment === 'poor' ? '一般' : '不穩定'}
                </span>
              </div>
            </div>

            {/* 改善建議 */}
            {testResult.recommendations.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold text-text mb-4">💡 改善建議</h3>
                <ul className="space-y-2">
                  {testResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 錯誤詳情 */}
            {testResult.errorMessages.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold text-text mb-4">❌ 錯誤詳情</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="space-y-1">
                    {testResult.errorMessages.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-red-700 text-sm">
                        • {error}
                      </li>
                    ))}
                  </ul>
                  {testResult.errorMessages.length > 5 && (
                    <p className="text-red-600 text-sm mt-2">
                      ...還有 {testResult.errorMessages.length - 5} 個錯誤
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 下一步操作 */}
            <div className="card text-center">
              <h3 className="text-xl font-bold text-text mb-4">🎯 下一步操作</h3>
              
              {testResult.qualityAssessment === 'excellent' || testResult.qualityAssessment === 'good' ? (
                <div className="space-y-4">
                  <p className="text-green-700 mb-4">
                    ✅ 連接品質良好！你可以開始使用語音功能了。
                  </p>
                  <button
                    onClick={() => router.push('/voice-chat')}
                    className="btn-primary text-lg px-6 py-3"
                  >
                    🎤 開始語音對話
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-yellow-700 mb-4">
                    ⚠️ 連接品質需要改善，建議先解決上述問題再使用語音功能。
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={runStabilityTest}
                      className="btn-secondary text-sm px-4 py-2"
                    >
                      🔄 重新測試
                    </button>
                    <button
                      onClick={() => router.push('/voice-chat')}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      繼續嘗試
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 技術說明 */}
        <div className="card mt-8">
          <h3 className="text-lg font-bold text-text mb-4">🔬 技術說明</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>測試項目：</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Gemini 2.0 Live API 連接穩定性</li>
              <li>語音輸入輸出延遲測量</li>
              <li>麥克風權限和音訊系統檢查</li>
              <li>網路連線品質評估</li>
              <li>自動重連機制測試</li>
            </ul>
            
            <p className="mt-4"><strong>品質評估標準：</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>🟢 優秀：成功率 ≥ 95%，延遲 &lt; 200ms</li>
              <li>🔵 良好：成功率 ≥ 85%，延遲 &lt; 500ms</li>
              <li>🟡 一般：成功率 ≥ 70%</li>
              <li>🔴 不穩定：成功率 &lt; 70%</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}

'use client';

import { useState, useEffect } from 'react';

interface EnvCheckResult {
  name: string;
  value: string | undefined;
  status: 'success' | 'missing' | 'warning';
  required: boolean;
  description: string;
}

export default function EnvCheckPage() {
  const [envResults, setEnvResults] = useState<EnvCheckResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    checkEnvironmentVariables();
  }, []);

  const checkEnvironmentVariables = () => {
    const checks: EnvCheckResult[] = [
      {
        name: 'NEXT_PUBLIC_GEMINI_API_KEY',
        value: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        status: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'success' : 'missing',
        required: true,
        description: '🔑 Gemini AI API 金鑰 - 語音對話和影片生成必需'
      },
      {
        name: 'NEXT_PUBLIC_GEMINI_MODEL',
        value: process.env.NEXT_PUBLIC_GEMINI_MODEL,
        status: process.env.NEXT_PUBLIC_GEMINI_MODEL ? 'success' : 'warning',
        required: false,
        description: '🤖 Gemini 模型設定 (預設: gemini-2.0-flash-exp)'
      },
      {
        name: 'NEXT_PUBLIC_GEMINI_VOICE',
        value: process.env.NEXT_PUBLIC_GEMINI_VOICE,
        status: process.env.NEXT_PUBLIC_GEMINI_VOICE ? 'success' : 'warning',
        required: false,
        description: '🎤 語音設定 (預設: Aoede)'
      },
      {
        name: 'NEXT_PUBLIC_GEMINI_LANGUAGE',
        value: process.env.NEXT_PUBLIC_GEMINI_LANGUAGE,
        status: process.env.NEXT_PUBLIC_GEMINI_LANGUAGE ? 'success' : 'warning',
        required: false,
        description: '🌐 語言設定 (預設: zh-TW)'
      },
      {
        name: 'NEXT_PUBLIC_APP_URL',
        value: process.env.NEXT_PUBLIC_APP_URL,
        status: process.env.NEXT_PUBLIC_APP_URL ? 'success' : 'warning',
        required: false,
        description: '🌍 應用程式網址'
      }
    ];

    setEnvResults(checks);

    // 檢查整體狀態
    const hasAllRequired = checks.filter(c => c.required).every(c => c.status === 'success');
    setOverallStatus(hasAllRequired ? 'success' : 'error');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'missing': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'missing': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const copyEnvTemplate = () => {
    const template = `# FA-MVP 環境變數設定
# 複製到你的 .env.local 檔案

# 🔑 必需設定
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# ⚙️ 可選設定 (有預設值)
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash-exp
NEXT_PUBLIC_GEMINI_VOICE=Aoede
NEXT_PUBLIC_GEMINI_LANGUAGE=zh-TW
NEXT_PUBLIC_APP_URL=http://localhost:3000`;

    navigator.clipboard.writeText(template).then(() => {
      alert('環境變數模板已複製到剪貼簿！');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🔍 環境變數檢查工具
          </h1>
          <p className="text-lg text-gray-600">
            診斷並修復環境變數配置問題
          </p>
        </div>

        {/* Overall Status */}
        <div className={`rounded-xl shadow-md p-6 mb-8 ${
          overallStatus === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">
              {overallStatus === 'success' ? '🎉' : '🚨'}
            </span>
            <h2 className="text-xl font-semibold">
              {overallStatus === 'success' 
                ? '環境變數配置正確！' 
                : '環境變數配置有問題'}
            </h2>
          </div>
          
          {overallStatus === 'error' && (
            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-red-800 mb-2">🛠️ 修復步驟：</h3>
              <ol className="text-red-700 text-sm space-y-1 list-decimal list-inside">
                <li>獲取 Gemini API Key：<a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline text-blue-600">https://aistudio.google.com/app/apikey</a></li>
                <li>在專案根目錄創建 <code className="bg-gray-100 px-1 rounded">.env.local</code> 檔案</li>
                <li>點擊下方「複製環境變數模板」按鈕</li>
                <li>將模板貼到 <code className="bg-gray-100 px-1 rounded">.env.local</code> 檔案中</li>
                <li>將 <code className="bg-gray-100 px-1 rounded">your_gemini_api_key_here</code> 替換為你的實際 API Key</li>
                <li>重啟開發伺服器：<code className="bg-gray-100 px-1 rounded">npm run dev</code></li>
              </ol>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={copyEnvTemplate}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              📋 複製環境變數模板
            </button>
            <button
              onClick={checkEnvironmentVariables}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 重新檢查
            </button>
          </div>
        </div>

        {/* Environment Variables List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">環境變數詳細狀態</h3>
          </div>
          
          <div className="divide-y">
            {envResults.map((result, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getStatusIcon(result.status)}</span>
                    <div>
                      <h4 className="font-mono text-sm font-semibold text-gray-800">
                        {result.name}
                        {result.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {result.description}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                    {result.status === 'success' ? '已設定' :
                     result.status === 'missing' ? '缺少' : '預設值'}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                  <span className="text-gray-500">值：</span>
                  <span className="text-gray-800">
                    {result.value 
                      ? (result.name.includes('API_KEY') 
                          ? `${result.value.substring(0, 8)}...` 
                          : result.value)
                      : '未設定'
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vercel Deployment Guide */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🚀</span>
            Vercel 部署環境變數設定
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700 text-sm mb-3">
              在 Vercel Dashboard 設定以下環境變數：
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div>NEXT_PUBLIC_GEMINI_API_KEY = <span className="text-blue-600">your_actual_api_key</span></div>
              <div>NEXT_PUBLIC_GEMINI_MODEL = <span className="text-blue-600">gemini-2.0-flash-exp</span></div>
              <div>NEXT_PUBLIC_GEMINI_VOICE = <span className="text-blue-600">Aoede</span></div>
              <div>NEXT_PUBLIC_GEMINI_LANGUAGE = <span className="text-blue-600">zh-TW</span></div>
              <div>NEXT_PUBLIC_APP_URL = <span className="text-blue-600">https://your-domain.vercel.app</span></div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="mb-2">📝 步驟：</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>登入 Vercel Dashboard</li>
              <li>選擇你的專案</li>
              <li>進入 Settings → Environment Variables</li>
              <li>添加上述環境變數</li>
              <li>重新部署專案</li>
            </ol>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">🔧 快速動作</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <a
              href="/voice-test"
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors text-center"
            >
              🎤 測試語音功能
            </a>
            <a
              href="/integration-test"
              className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors text-center"
            >
              🧪 完整系統測試
            </a>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors text-center"
            >
              🔑 獲取 API Key
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

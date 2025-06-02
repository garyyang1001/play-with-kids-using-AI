'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IntegrationTestPage() {
  const router = useRouter();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const testItems = [
    {
      name: '語音系統',
      path: '/voice-test',
      description: '測試 Gemini Live API 語音對話功能'
    },
    {
      name: 'Prompt Engineering',
      path: '/prompt-test',
      description: '測試 Prompt 品質分析和優化建議'
    },
    {
      name: '模板系統',
      path: '/template-test',
      description: '測試三大模板功能和學習進度'
    },
    {
      name: '影片生成',
      path: '/video-generation-demo',
      description: '測試 Veo2 影片生成和優化'
    },
    {
      name: '學習報告',
      path: '/learning-report',
      description: '測試學習進度報告生成'
    },
    {
      name: '完整體驗',
      path: '/stage6-demo',
      description: '測試完整的親子創作流程'
    }
  ];

  const handleTest = (path: string) => {
    router.push(path);
  };

  const handleMarkTested = (name: string, success: boolean) => {
    setTestResults(prev => ({
      ...prev,
      [name]: success
    }));
  };

  const getTestStatus = (name: string) => {
    if (!(name in testResults)) return 'pending';
    return testResults[name] ? 'success' : 'failed';
  };

  const completedTests = Object.keys(testResults).length;
  const successfulTests = Object.values(testResults).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🧪 FA-MVP 整合測試中心
          </h1>
          <p className="text-lg text-gray-600">
            系統完整性驗證 - 確保所有功能正常運作
          </p>
          
          {/* Progress */}
          <div className="mt-6 bg-white rounded-lg p-4 shadow-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">測試進度</span>
              <span className="text-sm text-gray-500">
                {completedTests}/{testItems.length} 完成
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedTests / testItems.length) * 100}%` }}
              />
            </div>
            {completedTests > 0 && (
              <p className="text-sm text-green-600 mt-2">
                成功率: {Math.round((successfulTests / completedTests) * 100)}%
              </p>
            )}
          </div>
        </div>

        {/* Test Items */}
        <div className="grid gap-6 md:grid-cols-2">
          {testItems.map((item, index) => {
            const status = getTestStatus(item.name);
            return (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {status === 'pending' && (
                      <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                    )}
                    {status === 'success' && (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    {status === 'failed' && (
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-xs">✗</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleTest(item.path)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    開始測試
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkTested(item.name, true)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm transition-colors"
                    >
                      ✓ 測試通過
                    </button>
                    <button
                      onClick={() => handleMarkTested(item.name, false)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition-colors"
                    >
                      ✗ 發現問題
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">🚀 快速動作</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => router.push('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg transition-colors"
            >
              回到首頁
            </button>
            <button
              onClick={() => router.push('/template-experience')}
              className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg transition-colors"
            >
              完整體驗流程
            </button>
            <button
              onClick={() => window.open('https://github.com/garyyang1001/play-with-kids-using-AI', '_blank')}
              className="bg-gray-700 hover:bg-gray-800 text-white py-3 px-6 rounded-lg transition-colors"
            >
              查看代碼
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 系統檢查清單</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>✅ Next.js 14 + TypeScript 架構完整</li>
            <li>✅ @google/genai 1.3.0 已安裝</li>
            <li>✅ Firebase 10.13.2 已配置</li>
            <li>⚠️ 需要檢查 .env 環境變數設定</li>
            <li>⚠️ 需要確認 API 權限和配額</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

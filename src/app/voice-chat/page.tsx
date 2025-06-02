'use client';

import React from 'react';
import { VoiceInterface } from '@/components/voice-chat';

/**
 * 語音對話頁面 - 階段1 Demo
 */
export default function VoiceChatPage() {
  const handleConversationUpdate = (conversation: any[]) => {
    console.log('對話更新:', conversation);
  };

  const handlePromptEvolution = (evolution: any) => {
    console.log('Prompt進化:', evolution);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 頂部導航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-primary hover:text-primary/80 transition-colors">
                ← 返回首頁
              </a>
              <h1 className="text-xl font-bold text-text">語音對話測試</h1>
            </div>
            <div className="text-sm text-gray-500">
              階段1 - 核心語音對話系統
            </div>
          </div>
        </div>
      </header>

      {/* 主要內容區域 */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* 左側：語音對話介面 */}
        <div className="flex-1 flex flex-col">
          <VoiceInterface
            onConversationUpdate={handleConversationUpdate}
            onPromptEvolution={handlePromptEvolution}
          />
        </div>

        {/* 右側：家長小幫手面板（階段2預留） */}
        <div className="w-80 bg-gray-50 border-l p-6">
          <h3 className="text-lg font-bold text-text mb-4">家長小幫手</h3>
          
          <div className="space-y-6">
            {/* Prompt 進化展示區 */}
            <div className="card">
              <h4 className="font-medium text-text mb-2">💡 Prompt 進化</h4>
              <div className="text-sm text-gray-600">
                <p className="mb-2"><strong>原始:</strong> (等待用戶輸入...)</p>
                <p><strong>優化:</strong> (階段2功能)</p>
              </div>
            </div>

            {/* 學習進度 */}
            <div className="card">
              <h4 className="font-medium text-text mb-2">📈 學習進度</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>描述清晰度</span>
                  <span className="text-gray-500">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }} />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>創意豐富度</span>
                  <span className="text-gray-500">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '0%' }} />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>情感表達</span>
                  <span className="text-gray-500">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </div>

            {/* 引導提示 */}
            <div className="card">
              <h4 className="font-medium text-text mb-2">🎯 當前建議</h4>
              <p className="text-sm text-gray-600">
                開始語音對話，我會提供即時的Prompt優化建議！
              </p>
            </div>

            {/* 階段進度 */}
            <div className="card">
              <h4 className="font-medium text-text mb-2">🏗️ 開發進度</h4>
              <div className="text-sm space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-success">✅</span>
                  <span>基礎語音連接</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-secondary">🔄</span>
                  <span>WebSocket整合</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">⏳</span>
                  <span>Prompt分析引擎</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">⏳</span>
                  <span>影片生成系統</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
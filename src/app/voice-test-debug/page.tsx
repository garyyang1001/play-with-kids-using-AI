'use client';

import { useState, useEffect } from 'react';
import { VoiceAIClient } from '@/lib/voice-ai-client';

export default function VoiceConnectionTestPage() {
  const [status, setStatus] = useState('未開始');
  const [logs, setLogs] = useState<string[]>([]);
  const [client, setClient] = useState<VoiceAIClient | null>(null);
  const [apiKey, setApiKey] = useState('');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[VoiceTest] ${message}`);
  };

  useEffect(() => {
    // 檢查環境變數
    const envApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const envModel = process.env.NEXT_PUBLIC_GEMINI_MODEL;
    
    addLog(`環境變數檢查:`);
    addLog(`- API Key: ${envApiKey ? '已設定' : '未設定'}`);
    addLog(`- 模型: ${envModel || '未設定'}`);
    
    if (envApiKey) {
      setApiKey(envApiKey);
    }
  }, []);

  const testConnection = async () => {
    if (!apiKey.trim()) {
      addLog('❌ 請先設定 API Key');
      return;
    }

    setStatus('測試中...');
    addLog('🚀 開始連接測試');

    try {
      // 步驟1: 創建客戶端
      addLog('1️⃣ 創建 VoiceAIClient...');
      const voiceClient = new VoiceAIClient({
        apiKey: apiKey.trim(),
        model: 'gemini-2.0-flash-live-001',
        voice: 'Aoede',
        language: 'zh-TW'
      });

      // 設定事件監聽
      voiceClient.on('connected', () => {
        addLog('✅ Live API 連接成功！');
        setStatus('連接成功');
      });

      voiceClient.on('disconnected', () => {
        addLog('⚠️ Live API 連接斷開');
        setStatus('連接斷開');
      });

      voiceClient.on('error', (error) => {
        addLog(`❌ 連接錯誤: ${error.message}`);
        setStatus('連接失敗');
      });

      voiceClient.on('message', (message) => {
        addLog(`💬 收到訊息: ${message.content}`);
      });

      voiceClient.on('stateChanged', (state) => {
        addLog(`🔄 狀態變化: 連接=${state.isConnected}, 錄音=${state.isRecording}, 播放=${state.isPlaying}`);
        if (state.error) {
          addLog(`❌ 狀態錯誤: ${state.error}`);
        }
      });

      setClient(voiceClient);

      // 步驟2: 嘗試連接
      addLog('2️⃣ 嘗試連接 Live API...');
      await voiceClient.connect({
        templateId: 'test',
        templateName: '連接測試',
        conversationHistory: [],
        currentStep: 1,
        learningGoals: ['測試連接']
      });

      addLog('3️⃣ 連接建立完成');

    } catch (error) {
      addLog(`❌ 連接失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      setStatus('連接失敗');
    }
  };

  const testMicrophone = async () => {
    if (!client) {
      addLog('❌ 請先建立連接');
      return;
    }

    try {
      addLog('🎤 測試麥克風權限...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      addLog('✅ 麥克風權限獲取成功');
      
      // 停止測試流
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      addLog(`❌ 麥克風測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  };

  const testRecording = async () => {
    if (!client) {
      addLog('❌ 請先建立連接');
      return;
    }

    try {
      const state = client.getState();
      if (!state.isConnected) {
        addLog('❌ 未連接到 Live API');
        return;
      }

      if (state.isRecording) {
        addLog('🔴 停止錄音...');
        client.stopRecording();
      } else {
        addLog('🎤 開始錄音...');
        await client.startRecording();
      }
    } catch (error) {
      addLog(`❌ 錄音測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  };

  const disconnect = () => {
    if (client) {
      addLog('🔌 斷開連接...');
      client.disconnect();
      setClient(null);
      setStatus('已斷開');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('📝 日誌已清除');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🧪 Live API 連接測試</h1>
        
        {/* 狀態顯示 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">連接狀態</h2>
          <div className="flex items-center gap-4">
            <div className="text-lg">
              狀態: <span className={`font-bold ${
                status === '連接成功' ? 'text-green-600' : 
                status === '連接失敗' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>{status}</span>
            </div>
            {client && (
              <div className="text-sm text-gray-600">
                客戶端: {client.getState().isConnected ? '✅ 已連接' : '❌ 未連接'}
              </div>
            )}
          </div>
        </div>

        {/* API Key 設定 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API 設定</h2>
          <div className="flex gap-4">
            <input
              type="password"
              placeholder="輸入 Gemini API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => setApiKey(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              使用環境變數
            </button>
          </div>
        </div>

        {/* 測試按鈕 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">測試操作</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={testConnection}
              disabled={!apiKey.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
            >
              🔗 測試連接
            </button>
            
            <button
              onClick={testMicrophone}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              🎤 測試麥克風
            </button>
            
            <button
              onClick={testRecording}
              disabled={!client}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 transition-colors"
            >
              🔴 測試錄音
            </button>
            
            <button
              onClick={disconnect}
              disabled={!client}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 transition-colors"
            >
              🔌 斷開連接
            </button>
          </div>
        </div>

        {/* 除錯日誌 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">除錯日誌</h2>
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
            >
              清除日誌
            </button>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">沒有日誌記錄</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 系統資訊 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">系統資訊</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>瀏覽器:</strong> {navigator.userAgent.split(' ')[0]}
            </div>
            <div>
              <strong>支援 WebRTC:</strong> {navigator.mediaDevices ? '✅' : '❌'}
            </div>
            <div>
              <strong>支援 AudioContext:</strong> {window.AudioContext || (window as any).webkitAudioContext ? '✅' : '❌'}
            </div>
            <div>
              <strong>支援 MediaRecorder:</strong> {window.MediaRecorder ? '✅' : '❌'}
            </div>
          </div>
        </div>

        {/* 回到首頁 */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← 回到首頁
          </a>
        </div>
      </div>
    </div>
  );
}

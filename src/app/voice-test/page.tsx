'use client';

import React, { useState, useEffect } from 'react';
import { VoiceConnectionStabilityTester, runQuickStabilityTest, StabilityTestResult } from '../../lib/connection-stability-tester';
import { VoiceAIClient } from '../../lib/voice-ai-client';
import { VoiceConnectionState, VoiceSessionState } from '../../lib/types/voice';

export default function VoiceTestPage() {
  const [apiKey, setApiKey] = useState('');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<StabilityTestResult | null>(null);
  const [connectionState, setConnectionState] = useState<VoiceConnectionState>(VoiceConnectionState.DISCONNECTED);
  const [sessionState, setSessionState] = useState<VoiceSessionState>(VoiceSessionState.IDLE);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [voiceClient, setVoiceClient] = useState<VoiceAIClient | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const runStabilityTest = async () => {
    if (!apiKey.trim()) {
      alert('請輸入Google AI API Key');
      return;
    }

    setIsTestRunning(true);
    setTestResult(null);
    setTestLogs([]);
    addLog('開始執行語音連接穩定性測試...');

    try {
      const result = await runQuickStabilityTest(apiKey);
      setTestResult(result);
      addLog('測試完成！');
    } catch (error) {
      console.error('測試執行錯誤:', error);
      addLog(`測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setIsTestRunning(false);
    }
  };

  const testBasicConnection = async () => {
    if (!apiKey.trim()) {
      alert('請輸入Google AI API Key');
      return;
    }

    addLog('測試基本連接...');
    
    const client = new VoiceAIClient({
      apiKey,
      sampleRate: 16000,
      language: 'zh-TW'
    });

    client.on('connectionStateChange', (state: VoiceConnectionState) => {
      setConnectionState(state);
      addLog(`連接狀態變更: ${state}`);
    });

    client.on('sessionStateChange', (state: VoiceSessionState) => {
      setSessionState(state);
      addLog(`會話狀態變更: ${state}`);
    });

    client.on('voiceInteraction', (event) => {
      addLog(`語音事件: ${event.type}`);
    });

    setVoiceClient(client);

    try {
      await client.connect();
      addLog('基本連接測試成功！');
    } catch (error) {
      addLog(`連接失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  };

  const disconnectClient = () => {
    if (voiceClient) {
      voiceClient.disconnect();
      setVoiceClient(null);
      addLog('已斷開連接');
    }
  };

  const sendTestMessage = () => {
    if (voiceClient && voiceClient.isConnected) {
      const message = '你好，這是一個測試訊息';
      voiceClient.sendTextMessage(message);
      addLog(`發送測試訊息: ${message}`);
    } else {
      addLog('尚未連接，無法發送訊息');
    }
  };

  useEffect(() => {
    return () => {
      if (voiceClient) {
        voiceClient.disconnect();
      }
    };
  }, [voiceClient]);

  const getConnectionStateColor = (state: VoiceConnectionState) => {
    switch (state) {
      case VoiceConnectionState.CONNECTED: return 'text-green-600';
      case VoiceConnectionState.CONNECTING: return 'text-yellow-600';
      case VoiceConnectionState.RECONNECTING: return 'text-orange-600';
      case VoiceConnectionState.ERROR: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSessionStateColor = (state: VoiceSessionState) => {
    switch (state) {
      case VoiceSessionState.LISTENING: return 'text-blue-600';
      case VoiceSessionState.PROCESSING: return 'text-purple-600';
      case VoiceSessionState.SPEAKING: return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h1 className="text-2xl font-bold">語音AI連接測試</h1>
            <p className="text-blue-100 mt-2">階段1：核心語音對話系統測試工具</p>
          </div>

          <div className="p-6">
            {/* API Key Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google AI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="輸入你的Google AI API Key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Display */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">連接狀態</h3>
                <span className={`font-mono ${getConnectionStateColor(connectionState)}`}>
                  {connectionState}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">會話狀態</h3>
                <span className={`font-mono ${getSessionStateColor(sessionState)}`}>
                  {sessionState}
                </span>
              </div>
            </div>

            {/* Test Controls */}
            <div className="mb-6 space-y-3">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={runStabilityTest}
                  disabled={isTestRunning || !apiKey.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isTestRunning ? '測試中...' : '執行完整穩定性測試'}
                </button>
                
                <button
                  onClick={testBasicConnection}
                  disabled={isTestRunning || !apiKey.trim() || connectionState === VoiceConnectionState.CONNECTED}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  測試基本連接
                </button>
                
                <button
                  onClick={sendTestMessage}
                  disabled={!voiceClient || !voiceClient.isConnected}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  發送測試訊息
                </button>
                
                <button
                  onClick={disconnectClient}
                  disabled={!voiceClient || connectionState === VoiceConnectionState.DISCONNECTED}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  斷開連接
                </button>
              </div>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className="mb-6 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">測試結果</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm text-gray-600">整體評分</div>
                    <div className={`text-2xl font-bold ${testResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.overallScore}/100
                    </div>
                    <div className={`text-sm ${testResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.passed ? '✅ 通過' : '❌ 未通過'}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm text-gray-600">連接成功率</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {testResult.connectionSuccessRate.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm text-gray-600">平均延遲</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {testResult.averageLatency.toFixed(0)}ms
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">建議</h4>
                  <ul className="space-y-1">
                    {testResult.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-700 flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Test Logs */}
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">測試日誌</h3>
              <div className="bg-black rounded p-3 h-64 overflow-y-auto font-mono text-sm">
                {testLogs.length === 0 ? (
                  <div className="text-gray-500">等待測試開始...</div>
                ) : (
                  testLogs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">使用說明</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• 首先輸入你的Google AI API Key</li>
                <li>• 點擊「執行完整穩定性測試」進行全面測試</li>
                <li>• 或使用「測試基本連接」進行簡單連接測試</li>
                <li>• 觀察連接狀態和會話狀態的變化</li>
                <li>• 查看測試日誌了解詳細過程</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
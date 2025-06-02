'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { VoiceAIClient } from '@/lib/voice-ai-client';
import {
  VoiceConnectionState,
  VoiceSessionState,
  VoiceInteractionEvent,
  VoiceAIConfig
} from '@/lib/types/voice';

interface VoiceInterfaceProps {
  onConversationUpdate?: (conversation: ConversationMessage[]) => void;
  onPromptEvolution?: (evolution: PromptEvolution) => void;
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
  isTranscribing?: boolean;
}

interface PromptEvolution {
  original: string;
  improved: string;
  improvements: string[];
  score: number;
}

/**
 * 語音對話介面組件 - 階段1核心UI
 */
export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onConversationUpdate,
  onPromptEvolution
}) => {
  const [voiceClient, setVoiceClient] = useState<VoiceAIClient | null>(null);
  const [connectionState, setConnectionState] = useState<VoiceConnectionState>(VoiceConnectionState.DISCONNECTED);
  const [sessionState, setSessionState] = useState<VoiceSessionState>(VoiceSessionState.IDLE);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  /**
   * 初始化語音客戶端
   */
  const initializeVoiceClient = useCallback(async () => {
    if (isInitializing || voiceClient?.isConnected) return;
    
    setIsInitializing(true);
    setError(null);
    
    try {
      const config: VoiceAIConfig = {
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '',
        model: 'gemini-2.5-flash-preview-native-audio-dialog',
        voice: 'Leda',
        language: 'zh-TW',
        sampleRate: 24000
      };
      
      const client = new VoiceAIClient(config);
      
      // 設置事件監聽器
      client.on('connectionStateChange', setConnectionState);
      client.on('sessionStateChange', setSessionState);
      client.on('voiceInteraction', handleVoiceInteraction);
      client.on('sessionStatsUpdate', handleSessionStatsUpdate);
      
      await client.connect();
      setVoiceClient(client);
      
      // 添加歡迎訊息
      addConversationMessage({
        id: Date.now().toString(),
        type: 'ai',
        text: '你好！我是你的AI助手，準備幫助你和孩子一起創作精彩的影片。讓我們開始對話吧！',
        timestamp: Date.now()
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '連接失敗';
      setError(errorMessage);
      console.error('[VoiceInterface] 初始化失敗:', err);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, voiceClient]);

  /**
   * 處理語音互動事件
   */
  const handleVoiceInteraction = useCallback((event: VoiceInteractionEvent) => {
    switch (event.type) {
      case 'user_speech_start':
        setCurrentTranscript('');
        addConversationMessage({
          id: `user-${Date.now()}`,
          type: 'user',
          text: '',
          timestamp: event.timestamp,
          isTranscribing: true
        });
        break;
        
      case 'user_speech_end':
        // 更新最後一條用戶訊息
        setConversation(prev => {
          const updated = [...prev];
          const lastUserIndex = updated.findLastIndex(msg => msg.type === 'user');
          if (lastUserIndex !== -1) {
            updated[lastUserIndex] = {
              ...updated[lastUserIndex],
              text: currentTranscript || '(錄音完成，等待轉錄...)',
              isTranscribing: false
            };
          }
          return updated;
        });
        break;
        
      case 'ai_response_start':
        addConversationMessage({
          id: `ai-${Date.now()}`,
          type: 'ai',
          text: event.data?.text || event.data?.message || '正在思考...',
          timestamp: event.timestamp
        });
        break;
        
      case 'error':
        setError(event.data?.error || '發生未知錯誤');
        break;
    }
  }, [currentTranscript]);

  /**
   * 處理會話統計更新
   */
  const handleSessionStatsUpdate = useCallback((stats: any) => {
    console.log('[VoiceInterface] 會話統計更新:', stats);
  }, []);

  /**
   * 添加對話訊息
   */
  const addConversationMessage = useCallback((message: ConversationMessage) => {
    setConversation(prev => {
      const updated = [...prev, message];
      onConversationUpdate?.(updated);
      return updated;
    });
  }, [onConversationUpdate]);

  /**
   * 開始/停止錄音
   */
  const toggleRecording = useCallback(() => {
    if (!voiceClient?.isConnected) return;
    
    if (voiceClient.isRecording) {
      voiceClient.stopRecording();
    } else {
      voiceClient.startRecording();
    }
  }, [voiceClient]);

  /**
   * 斷開連接
   */
  const disconnect = useCallback(() => {
    if (voiceClient) {
      voiceClient.disconnect();
      setVoiceClient(null);
    }
  }, [voiceClient]);

  /**
   * 組件清理
   */
  useEffect(() => {
    return () => {
      if (voiceClient) {
        voiceClient.disconnect();
      }
    };
  }, [voiceClient]);

  /**
   * 取得連接狀態顯示文字
   */
  const getConnectionStatusText = () => {
    switch (connectionState) {
      case VoiceConnectionState.CONNECTING:
        return '正在連接...';
      case VoiceConnectionState.CONNECTED:
        return '已連接';
      case VoiceConnectionState.RECONNECTING:
        return '重新連接中...';
      case VoiceConnectionState.ERROR:
        return '連接錯誤';
      default:
        return '未連接';
    }
  };

  /**
   * 取得會話狀態顯示文字
   */
  const getSessionStatusText = () => {
    switch (sessionState) {
      case VoiceSessionState.LISTENING:
        return '正在聆聽...';
      case VoiceSessionState.PROCESSING:
        return '處理中...';
      case VoiceSessionState.SPEAKING:
        return 'AI 回應中...';
      default:
        return '準備就緒';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 頂部狀態列 */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionState === VoiceConnectionState.CONNECTED ? 'bg-success' :
              connectionState === VoiceConnectionState.CONNECTING || connectionState === VoiceConnectionState.RECONNECTING ? 'bg-secondary animate-pulse' :
              'bg-red-500'
            }`} />
            <span className="text-sm text-gray-600">{getConnectionStatusText()}</span>
          </div>
          
          {connectionState === VoiceConnectionState.CONNECTED && (
            <div className="text-sm text-gray-500">
              {getSessionStatusText()}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {voiceClient?.isConnected && (
            <button
              onClick={disconnect}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              斷開連接
            </button>
          )}
        </div>
      </div>

      {/* 對話區域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
              message.type === 'user'
                ? 'bg-primary text-white'
                : 'bg-white border shadow-sm'
            }`}>
              {message.isTranscribing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse text-sm">正在錄音...</div>
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-4 bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-4 bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              )}
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString('zh-TW', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 錯誤顯示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mx-4 rounded-lg">
          <p className="text-sm font-medium">連接錯誤</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-sm underline mt-2"
          >
            關閉
          </button>
        </div>
      )}

      {/* 語音控制區域 */}
      <div className="bg-white border-t p-6">
        <div className="flex flex-col items-center space-y-4">
          {!voiceClient?.isConnected ? (
            <button
              onClick={initializeVoiceClient}
              disabled={isInitializing}
              className="btn-primary flex items-center space-x-2"
            >
              {isInitializing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>🎤</span>
              )}
              <span>{isInitializing ? '連接中...' : '開始語音對話'}</span>
            </button>
          ) : (
            <>
              <button
                onClick={toggleRecording}
                className={`voice-button ${
                  sessionState === VoiceSessionState.LISTENING ? 'recording' : 'idle'
                }`}
              >
                <span className="text-white text-2xl">
                  {sessionState === VoiceSessionState.LISTENING ? '🛑' : '🎤'}
                </span>
              </button>
              
              <p className="text-sm text-gray-600 text-center">
                {sessionState === VoiceSessionState.LISTENING
                  ? '按住錄音鍵說話，放開結束'
                  : '點擊開始錄音'
                }
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export type { VoiceInterfaceProps };
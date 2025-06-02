'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VoiceAIClient } from '@/lib/voice-ai-client';
import type { VoiceMessage, VoiceState } from '@/lib/types/voice';

export default function CuteVoiceChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams.get('template') || 'daily-life';
  
  const [voiceClient, setVoiceClient] = useState<VoiceAIClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bearExpression, setBearExpression] = useState('🐻');
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversation, setConversation] = useState<VoiceMessage[]>([]);

  // 可愛的模板配置
  const templateConfig = {
    'daily-life': {
      emoji: '🏠',
      title: '我的一天',
      welcomeMessage: '哈囉小朋友！我是熊寶寶！今天想和我分享什麼有趣的事情呢？告訴我你今天做了什麼吧～',
      color: 'from-orange-300 to-orange-500',
      bgColor: 'bg-orange-50'
    },
    'adventure': {
      emoji: '🚀', 
      title: '夢想冒險',
      welcomeMessage: '嗨～我是愛冒險的熊寶寶！準備好一起踏上精彩的冒險旅程了嗎？告訴我你想要什麼樣的冒險故事！',
      color: 'from-blue-300 to-blue-500',
      bgColor: 'bg-blue-50'
    },
    'animal-friend': {
      emoji: '🐾',
      title: '動物朋友', 
      welcomeMessage: '哇～我是熊寶寶！我們一起創造一個可愛的動物朋友吧！你最喜歡什麼動物呢？',
      color: 'from-green-300 to-green-500',
      bgColor: 'bg-green-50'
    }
  };

  const currentTemplate = templateConfig[template as keyof typeof templateConfig];

  // 初始化語音客戶端
  useEffect(() => {
    initializeVoiceClient();
  }, []);

  // 設定歡迎訊息
  useEffect(() => {
    if (currentTemplate) {
      setCurrentMessage(currentTemplate.welcomeMessage);
    }
  }, [currentTemplate]);

  const initializeVoiceClient = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        setCurrentMessage('哎呀～需要設定 API Key 才能和我聊天呢！請檢查環境變數設定哦～');
        return;
      }

      const client = new VoiceAIClient({
        apiKey,
        model: 'gemini-2.0-flash-exp',
        voice: 'Aoede',
        language: 'zh-TW'
      });

      // 設定事件監聽
      client.on('connected', () => {
        setIsConnected(true);
        setBearExpression('🐻😊');
      });

      client.on('disconnected', () => {
        setIsConnected(false);
        setBearExpression('🐻😴');
      });

      client.on('message', (message) => {
        setConversation(prev => [...prev, message]);
        if (message.type === 'assistant') {
          setCurrentMessage(message.content);
          setBearExpression('🐻💬');
        }
      });

      client.on('stateChanged', (state: VoiceState) => {
        setIsRecording(state.isRecording);
        setIsPlaying(state.isPlaying);
        
        if (state.isRecording) {
          setBearExpression('🐻👂');
        } else if (state.isPlaying) {
          setBearExpression('🐻💬');
        } else if (state.isConnected) {
          setBearExpression('🐻😊');
        }
      });

      setVoiceClient(client);

    } catch (error) {
      console.error('語音初始化失敗:', error);
      setCurrentMessage('哎呀～我現在有點不舒服，連接不上呢！請稍後再試試看～');
      setBearExpression('🐻😵');
    }
  };

  const handleMicClick = async () => {
    if (!voiceClient) {
      await initializeVoiceClient();
      return;
    }

    if (!isConnected) {
      try {
        await voiceClient.connect({
          templateId: template,
          templateName: currentTemplate.title,
          conversationHistory: conversation,
          currentStep: 1,
          learningGoals: []
        });
      } catch (error) {
        console.error('連接失敗:', error);
        setCurrentMessage('哎呀～我現在連接不上，請檢查網路或重新整理頁面試試看！');
        setBearExpression('🐻😵');
      }
      return;
    }

    try {
      if (isRecording) {
        voiceClient.stopRecording();
      } else {
        await voiceClient.startRecording();
      }
    } catch (error) {
      console.error('錄音操作失敗:', error);
      setCurrentMessage('哎呀～麥克風好像有問題，請檢查權限設定！');
      setBearExpression('🐻🤔');
    }
  };

  const getMicButtonStyle = () => {
    if (isRecording) {
      return 'bg-red-400 hover:bg-red-500 animate-pulse shadow-lg shadow-red-200';
    }
    if (!isConnected) {
      return 'bg-gray-400 hover:bg-gray-500';
    }
    return 'bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl border-4 border-orange-200 hover:border-orange-300';
  };

  const getMicIcon = () => {
    if (isRecording) return '🔴';
    if (!isConnected) return '🔌';
    return '🎤';
  };

  const getStatusMessage = () => {
    if (isRecording) return '我在聽呢～說吧！';
    if (isPlaying) return '讓我想想...';
    if (!isConnected) return '點擊麥克風開始聊天！';
    return '點擊麥克風說話～';
  };

  return (
    <div className={`min-h-screen ${currentTemplate.bgColor} relative overflow-hidden`}>
      {/* 可愛的背景裝飾 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-4xl opacity-20">☁️</div>
        <div className="absolute top-20 right-20 text-3xl opacity-20">🌟</div>
        <div className="absolute bottom-20 left-20 text-3xl opacity-20">🌸</div>
        <div className="absolute bottom-10 right-10 text-4xl opacity-20">🌈</div>
        <div className="absolute top-1/3 left-1/4 text-2xl opacity-15">💫</div>
        <div className="absolute top-2/3 right-1/3 text-2xl opacity-15">🦋</div>
      </div>

      {/* 返回按鈕 */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push('/')}
          className="bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-md hover:shadow-lg transition-all"
        >
          <span className="text-xl">👈</span>
        </button>
      </div>

      {/* 主要內容 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        
        {/* 標題區域 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">{currentTemplate.emoji}</div>
          <h1 className="text-2xl font-bold text-gray-700 mb-1">
            {currentTemplate.title} 小故事
          </h1>
          <div className="text-sm text-gray-500">和熊寶寶一起創作</div>
        </div>

        {/* 熊寶寶頭像區域 */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-8xl transition-all duration-500 hover:scale-110">
              {bearExpression}
            </div>
            {/* 連接狀態指示器 */}
            <div className="absolute -top-2 -right-2">
              {isConnected ? (
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              )}
            </div>
          </div>
        </div>

        {/* 對話泡泡 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg max-w-md mx-auto mb-8 relative">
          <div className="text-gray-700 text-center leading-relaxed">
            {currentMessage}
          </div>
          {/* 泡泡尾巴 */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-white"></div>
          </div>
        </div>

        {/* 麥克風按鈕 */}
        <div className="text-center mb-6">
          <button
            onClick={handleMicClick}
            className={`
              w-24 h-24 rounded-full text-4xl transition-all duration-300 transform hover:scale-105
              ${getMicButtonStyle()}
            `}
          >
            {getMicIcon()}
          </button>
          
          <div className="mt-4 text-gray-600 font-medium">
            {getStatusMessage()}
          </div>

          {/* 錄音波形動畫 */}
          {isRecording && (
            <div className="flex justify-center items-center mt-4 gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* 小提示 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 max-w-sm mx-auto">
          <div className="text-center">
            <div className="text-xl mb-2">💡</div>
            <div className="text-sm text-gray-600">
              {template === 'daily-life' && '說說你今天做了什麼有趣的事情？'}
              {template === 'adventure' && '想要什麼樣的冒險故事呢？'}
              {template === 'animal-friend' && '想創造什麼可愛的動物朋友？'}
            </div>
          </div>
        </div>

        {/* 底部裝飾 */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
      </div>

      {/* 對話記錄（簡化版） */}
      {conversation.length > 1 && (
        <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 max-w-xs shadow-lg z-20">
          <div className="text-xs text-gray-500 mb-2">對話記錄</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {conversation.slice(-3).map((msg, index) => (
              <div key={index} className="text-xs">
                <span className={msg.type === 'user' ? 'text-blue-600' : 'text-orange-600'}>
                  {msg.type === 'user' ? '👤' : '🐻'}:
                </span>
                <span className="ml-1 text-gray-700">
                  {msg.content.slice(0, 30)}
                  {msg.content.length > 30 && '...'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

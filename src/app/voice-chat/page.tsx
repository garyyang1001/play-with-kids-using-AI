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
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

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

      // 使用環境變數配置
      const client = new VoiceAIClient({
        apiKey,
        model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash-live-001',
        voice: process.env.NEXT_PUBLIC_GEMINI_VOICE || 'Aoede',
        language: process.env.NEXT_PUBLIC_GEMINI_LANGUAGE || 'zh-TW',
        sampleRate: parseInt(process.env.NEXT_PUBLIC_GEMINI_SAMPLE_RATE || '16000')
      });

      // 設定事件監聽
      client.on('connected', () => {
        setIsConnected(true);
        setBearExpression('🐻😊');
        setCurrentMessage('太好了！我現在可以和你聊天了！點擊麥克風開始說話吧～');
      });

      client.on('disconnected', () => {
        setIsConnected(false);
        setBearExpression('🐻😴');
        setCurrentMessage('哎呀，連接斷開了...讓我重新連接一下！');
      });

      client.on('message', (message) => {
        setConversation(prev => [...prev, message]);
        if (message.type === 'assistant') {
          setCurrentMessage(message.content);
          setBearExpression('🐻💬');
          // 3秒後回到開心表情
          setTimeout(() => {
            if (isConnected) setBearExpression('🐻😊');
          }, 3000);
        }
      });

      client.on('stateChanged', (state: VoiceState) => {
        setIsRecording(state.isRecording);
        setIsPlaying(state.isPlaying);
        
        if (state.isRecording) {
          setBearExpression('🐻👂');
          setCurrentMessage('我在仔細聽呢～請說話吧！');
        } else if (state.isPlaying) {
          setBearExpression('🐻💬');
        } else if (state.isConnected) {
          setBearExpression('🐻😊');
        }

        if (state.error) {
          setCurrentMessage(`哎呀，出現問題了：${state.error}`);
          setBearExpression('🐻😵');
        }
      });

      client.on('error', (error) => {
        console.error('語音客戶端錯誤:', error);
        setCurrentMessage(`連接出現問題：${error.message}`);
        setBearExpression('🐻😵');
      });

      setVoiceClient(client);

    } catch (error) {
      console.error('語音初始化失敗:', error);
      setCurrentMessage('哎呀～我現在有點不舒服，連接不上呢！請檢查 API Key 設定或重新整理頁面～');
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
        setCurrentMessage('正在連接中...請稍等～');
        setBearExpression('🐻🔄');
        
        await voiceClient.connect({
          templateId: template,
          templateName: currentTemplate.title,
          conversationHistory: conversation,
          currentStep: 1,
          learningGoals: ['語音對話', 'Prompt Engineering', '創意表達']
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

  // 處理文字輸入
  const handleTextSubmit = async () => {
    if (!textInput.trim() || !voiceClient || !isConnected) return;

    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: textInput.trim(),
      timestamp: Date.now()
    };

    setConversation(prev => [...prev, userMessage]);
    setTextInput('');
    
    // 模擬AI回應（實際應該調用voiceClient的文字處理方法）
    setBearExpression('🐻🤔');
    setCurrentMessage('讓我想想...');
    
    // 這裡應該調用實際的AI文字處理
    setTimeout(() => {
      const aiMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant', 
        content: `哇！你說"${textInput.trim()}"真有趣呢！能告訴我更多細節嗎？比如當時的心情或看到的顏色？`,
        timestamp: Date.now()
      };
      setConversation(prev => [...prev, aiMessage]);
      setCurrentMessage(aiMessage.content);
      setBearExpression('🐻😊');
    }, 2000);
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

        {/* 輸入控制區域 */}
        <div className="text-center mb-6">
          {/* 麥克風按鈕 */}
          <button
            onClick={handleMicClick}
            className={`
              w-24 h-24 rounded-full text-4xl transition-all duration-300 transform hover:scale-105 mb-4
              ${getMicButtonStyle()}
            `}
            disabled={isPlaying}
          >
            {getMicIcon()}
          </button>
          
          <div className="mb-4 text-gray-600 font-medium">
            {getStatusMessage()}
          </div>

          {/* 錄音波形動畫 */}
          {isRecording && (
            <div className="flex justify-center items-center mb-4 gap-1">
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

          {/* 載入指示器 */}
          {isPlaying && (
            <div className="flex justify-center items-center mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
              <span className="ml-2 text-gray-600">AI 正在回應...</span>
            </div>
          )}

          {/* 切換文字輸入按鈕 */}
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-600 hover:bg-white transition-all"
          >
            {showTextInput ? '🎤 改用語音' : '✏️ 改用文字'}
          </button>
        </div>

        {/* 文字輸入區域 */}
        {showTextInput && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder="在這裡輸入你想說的話..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                disabled={!isConnected}
              />
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim() || !isConnected}
                className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 transition-all"
              >
                發送
              </button>
            </div>
          </div>
        )}

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

      {/* 對話記錄（改進版） */}
      {conversation.length > 0 && (
        <div className="fixed top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 max-w-sm shadow-lg z-20 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">對話記錄</div>
            <div className="text-xs text-gray-500">{conversation.length} 條對話</div>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {conversation.map((msg, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-shrink-0 text-lg">
                  {msg.type === 'user' ? '👤' : '🐻'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs px-3 py-2 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    <div className="font-medium mb-1">
                      {msg.type === 'user' ? '你' : '熊寶寶'}
                    </div>
                    <div className="break-words">
                      {msg.content.length > 60 
                        ? `${msg.content.slice(0, 60)}...` 
                        : msg.content
                      }
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 快速操作 */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
            <button
              onClick={() => setConversation([])}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-all"
            >
              清除記錄
            </button>
            <button
              onClick={() => router.push('/learning-report')}
              className="text-xs px-3 py-1 bg-orange-100 hover:bg-orange-200 rounded-full text-orange-600 transition-all"
            >
              查看報告
            </button>
          </div>
        </div>
      )}

      {/* Debug 資訊（開發時顯示） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded-lg z-20">
          <div>連接狀態: {isConnected ? '已連接' : '未連接'}</div>
          <div>錄音狀態: {isRecording ? '錄音中' : '停止'}</div>
          <div>播放狀態: {isPlaying ? '播放中' : '停止'}</div>
          <div>模型: {process.env.NEXT_PUBLIC_GEMINI_MODEL}</div>
        </div>
      )}
    </div>
  );
}

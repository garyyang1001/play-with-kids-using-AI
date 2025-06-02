'use client';

import React, { useState, useEffect } from 'react';
import { SocialPostGenerator, SocialPostContent, SocialPostData } from '@/lib/social-post-generator';

interface SharingInterfaceProps {
  sessionData: SocialPostData;
  videoUrl?: string;
  onShare?: (platform: string, content: string) => void;
}

export default function SharingInterface({ sessionData, videoUrl, onShare }: SharingInterfaceProps) {
  const [postContent, setPostContent] = useState<SocialPostContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'facebook' | 'line' | 'copy'>('facebook');
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    generateSocialPost();
  }, [sessionData]);

  const generateSocialPost = async () => {
    setLoading(true);
    try {
      const generator = new SocialPostGenerator(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '');
      const content = await generator.generateSocialPost(sessionData);
      setPostContent(content);
    } catch (error) {
      console.error('生成社群貼文失敗:', error);
    }
    setLoading(false);
  };

  const handleShare = async (platform: string) => {
    if (!postContent) return;

    const generator = new SocialPostGenerator(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '');
    let shareContent = '';

    switch (platform) {
      case 'facebook':
        shareContent = generator.formatForFacebook(postContent);
        if (customMessage) {
          shareContent = `${customMessage}\n\n${shareContent}`;
        }
        // 使用 Facebook Web Share Dialog
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareContent)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
        break;
        
      case 'line':
        shareContent = generator.formatForLineup(postContent);
        if (customMessage) {
          shareContent = `${customMessage}\n\n${shareContent}`;
        }
        // 使用 LINE Share URL
        const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareContent)}`;
        window.open(lineUrl, '_blank');
        break;
        
      case 'copy':
        shareContent = generator.formatForFacebook(postContent);
        if (customMessage) {
          shareContent = `${customMessage}\n\n${shareContent}`;
        }
        await navigator.clipboard.writeText(shareContent);
        alert('內容已複製到剪貼簿！');
        break;
    }

    onShare?.(platform, shareContent);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">正在準備分享內容...</span>
      </div>
    );
  }

  if (!postContent) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">無法生成分享內容</p>
        <button 
          onClick={generateSocialPost}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          重新生成
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        🎉 分享你的創作成果！
      </h2>

      {/* 貼文預覽 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">📱 貼文預覽</h3>
        <div className="space-y-3">
          <p className="text-gray-800">{postContent.mainContent}</p>
          
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-blue-800 font-medium">🎨 {postContent.promptLearningHighlight}</p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded">
            <p className="text-sm text-gray-700 mb-2">📝 Prompt 進化過程：</p>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">原始：</span>
                <p className="text-sm italic">「{postContent.beforeAfter.before}」</p>
              </div>
              <div className="text-center text-gray-400">↓</div>
              <div>
                <span className="text-xs text-gray-500">優化：</span>
                <p className="text-sm italic">「{postContent.beforeAfter.after}」</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 text-sm">
            <div className="flex-1 bg-green-50 p-2 rounded">
              <span className="text-green-700">👨‍👩‍👧‍👦 家長：</span>
              <p className="italic">「{postContent.parentQuote}」</p>
            </div>
            <div className="flex-1 bg-pink-50 p-2 rounded">
              <span className="text-pink-700">🧒 孩子：</span>
              <p className="italic">「{postContent.childQuote}」</p>
            </div>
          </div>

          <p className="text-blue-600">🎬 {postContent.videoPreview}</p>

          <div className="flex flex-wrap gap-1">
            {postContent.hashtags.map((tag, index) => (
              <span key={index} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 自訂訊息 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📝 添加個人訊息（選填）
        </label>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="想要加上什麼個人感想嗎？"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      {/* 平台選擇 */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-700">🔗 選擇分享平台</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedPlatform('facebook')}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedPlatform === 'facebook'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">📘</div>
            <div className="text-sm font-medium">Facebook</div>
          </button>
          
          <button
            onClick={() => setSelectedPlatform('line')}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedPlatform === 'line'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">💬</div>
            <div className="text-sm font-medium">LINE</div>
          </button>
          
          <button
            onClick={() => setSelectedPlatform('copy')}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedPlatform === 'copy'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">📋</div>
            <div className="text-sm font-medium">複製內容</div>
          </button>
        </div>
      </div>

      {/* 分享按鈕 */}
      <div className="text-center">
        <button
          onClick={() => handleShare(selectedPlatform)}
          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {selectedPlatform === 'copy' ? '📋 複製分享內容' : '🚀 立即分享'}
        </button>
      </div>

      {/* 額外功能 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={generateSocialPost}
            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="mr-2">🔄</span>
            重新生成貼文
          </button>
          
          <button
            onClick={() => window.open('/learning-report', '_blank')}
            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="mr-2">📊</span>
            查看學習報告
          </button>
        </div>
      </div>
    </div>
  );
}
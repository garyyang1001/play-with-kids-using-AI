/**
 * Social Sharing Interface
 * 社群分享主介面組件
 */

'use client';

import React, { useState, useEffect } from 'react';
import { socialPostGenerator, SocialPostContent, GeneratedSocialPost } from '../../lib/social-post-generator';
import { VideoGenerationResult } from '../../lib/video-generator';
import { OptimizedVideoPrompt } from '../../lib/video-prompt-optimizer';
import { SocialPlatformSelector } from './SocialPlatformSelector';
import { PostPreview } from './PostPreview';
import { ShareSuccessMessage } from './ShareSuccessMessage';

interface SocialSharingInterfaceProps {
  videoResult: VideoGenerationResult;
  optimizedPrompt: OptimizedVideoPrompt | null;
  userContext?: {
    childName?: string;
    childAge?: number;
    parentName?: string;
    learningGoals?: string[];
  };
  onClose?: () => void;
}

export const SocialSharingInterface: React.FC<SocialSharingInterfaceProps> = ({
  videoResult,
  optimizedPrompt,
  userContext,
  onClose
}) => {
  const [currentStage, setCurrentStage] = useState<'generating' | 'preview' | 'sharing' | 'success'>('generating');
  const [postContent, setPostContent] = useState<SocialPostContent | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Array<'facebook' | 'instagram' | 'twitter' | 'line'>>(['facebook']);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedSocialPost[]>([]);
  const [shareResults, setShareResults] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateSocialContent();
  }, []);

  const generateSocialContent = async () => {
    try {
      setCurrentStage('generating');
      
      const content = await socialPostGenerator.generateSocialPostContent(
        videoResult,
        optimizedPrompt,
        userContext
      );
      
      setPostContent(content);
      
      const posts = await socialPostGenerator.generateMultiPlatformPosts(
        content,
        videoResult,
        selectedPlatforms
      );
      
      setGeneratedPosts(posts);
      setCurrentStage('preview');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成分享內容失敗');
    }
  };

  const handlePlatformChange = (platforms: Array<'facebook' | 'instagram' | 'twitter' | 'line'>) => {
    setSelectedPlatforms(platforms);
  };

  const handleRegeneratePost = async () => {
    await generateSocialContent();
  };

  const handleShareToplatform = async (platform: string) => {
    try {
      setCurrentStage('sharing');
      
      // 模擬分享過程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 這裡應該整合實際的社群媒體 API
      const success = Math.random() > 0.1; // 90% 成功率模擬
      
      setShareResults(prev => ({ ...prev, [platform]: success }));
      
      if (success) {
        setCurrentStage('success');
      } else {
        setError(`分享到 ${platform} 失敗，請重試`);
        setCurrentStage('preview');
      }
      
    } catch (err) {
      setError('分享過程中發生錯誤');
      setCurrentStage('preview');
    }
  };

  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('內容已複製到剪貼簿！');
    } catch (err) {
      alert('複製失敗，請手動複製內容');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 標題區域 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📱 分享您的 AI 創作成果
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">
              ❌ {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 text-sm hover:underline"
            >
              關閉
            </button>
          </div>
        )}

        {/* 主要內容 */}
        {currentStage === 'generating' && (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">🤖 AI 正在為您製作分享內容</h3>
            <p className="text-gray-600">
              分析您的創作成果，生成最適合的社群分享內容...
            </p>
          </div>
        )}

        {currentStage === 'preview' && postContent && (
          <div className="space-y-6">
            {/* 平台選擇器 */}
            <SocialPlatformSelector
              selectedPlatforms={selectedPlatforms}
              onPlatformChange={handlePlatformChange}
              availablePlatforms={['facebook', 'instagram', 'twitter', 'line']}
            />

            {/* 貼文預覽 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {generatedPosts.map((post, index) => (
                <PostPreview
                  key={post.platform}
                  post={post}
                  videoResult={videoResult}
                  onShare={() => handleShareToplatform(post.platform)}
                  onCopy={() => handleCopyToClipboard(post.content)}
                />
              ))}
            </div>

            {/* 操作按鈕 */}
            <div className="flex justify-center space-x-4 pt-6">
              <button
                onClick={handleRegeneratePost}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                🔄 重新生成內容
              </button>
              
              <button
                onClick={() => setCurrentStage('sharing')}
                disabled={generatedPosts.length === 0}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300"
              >
                📤 一鍵分享全部
              </button>
            </div>
          </div>
        )}

        {currentStage === 'sharing' && (
          <div className="text-center py-12">
            <div className="animate-pulse w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">📤</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">正在分享到社群媒體</h3>
            <p className="text-gray-600">
              請稍等，我們正在將您的創作成果發佈到選定的平台...
            </p>
          </div>
        )}

        {currentStage === 'success' && (
          <ShareSuccessMessage
            shareResults={shareResults}
            videoResult={videoResult}
            onCreateAnother={() => window.location.href = '/'}
            onViewLearningReport={() => window.location.href = '/learning-report'}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};
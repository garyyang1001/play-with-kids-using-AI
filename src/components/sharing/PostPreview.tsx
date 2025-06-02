/**
 * Post Preview
 * 貼文預覽組件
 */

'use client';

import React, { useState } from 'react';
import { GeneratedSocialPost } from '../../lib/social-post-generator';
import { VideoGenerationResult } from '../../lib/video-generator';

interface PostPreviewProps {
  post: GeneratedSocialPost;
  videoResult: VideoGenerationResult;
  onShare: () => void;
  onCopy: () => void;
}

export const PostPreview: React.FC<PostPreviewProps> = ({
  post,
  videoResult,
  onShare,
  onCopy
}) => {
  const [showFullContent, setShowFullContent] = useState(false);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return '👥';
      case 'instagram': return '📸';
      case 'twitter': return '🐦';
      case 'line': return '💬';
      default: return '📱';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'bg-blue-500';
      case 'instagram': return 'bg-pink-500';
      case 'twitter': return 'bg-blue-400';
      case 'line': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'Facebook';
      case 'instagram': return 'Instagram';
      case 'twitter': return 'Twitter';
      case 'line': return 'LINE';
      default: return platform;
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEngagementText = (engagement: string) => {
    switch (engagement) {
      case 'high': return '高參與度';
      case 'medium': return '中等參與度';
      case 'low': return '較低參與度';
      default: return '未知';
    }
  };

  const truncatedContent = post.content.length > 200 
    ? post.content.substring(0, 200) + '...' 
    : post.content;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* 平台標頭 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 ${getPlatformColor(post.platform)} rounded-lg flex items-center justify-center text-white text-lg mr-3`}>
            {getPlatformIcon(post.platform)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">
              {getPlatformName(post.platform)}
            </h4>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{post.metadata.characterCount} 字</span>
              <span>•</span>
              <span className={getEngagementColor(post.metadata.estimatedEngagement)}>
                {getEngagementText(post.metadata.estimatedEngagement)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          {post.metadata.hashtagCount} 個標籤
        </div>
      </div>

      {/* 內容預覽 */}
      <div className="mb-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {showFullContent ? post.content : truncatedContent}
          </div>
          
          {post.content.length > 200 && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-blue-600 text-xs mt-2 hover:underline"
            >
              {showFullContent ? '收起' : '展開全文'}
            </button>
          )}
        </div>
      </div>

      {/* 媒體預覽 */}
      {post.mediaAttachments.videoUrl && (
        <div className="mb-4">
          <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {post.mediaAttachments.thumbnailUrl ? (
              <img
                src={post.mediaAttachments.thumbnailUrl}
                alt="影片縮圖"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎬</div>
                  <div className="text-sm">AI 生成影片</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 統計資訊 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>目標觀眾：{post.metadata.targetAudience.join('、')}</div>
          <div>預估觸及：{post.metadata.estimatedEngagement === 'high' ? '1000+' : post.metadata.estimatedEngagement === 'medium' ? '500+' : '100+'}</div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex space-x-3">
        <button
          onClick={onShare}
          className={`flex-1 ${getPlatformColor(post.platform)} text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium`}
        >
          📤 分享到 {getPlatformName(post.platform)}
        </button>
        
        <button
          onClick={onCopy}
          className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          📋 複製
        </button>
      </div>

      {/* 小提示 */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        💡 點擊分享後，將開啟 {getPlatformName(post.platform)} 分享頁面
      </div>
    </div>
  );
};
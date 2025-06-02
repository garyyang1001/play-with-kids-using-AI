/**
 * Social Platform Selector
 * 社群平台選擇器組件
 */

'use client';

import React from 'react';

interface Platform {
  id: 'facebook' | 'instagram' | 'twitter' | 'line';
  name: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
}

interface SocialPlatformSelectorProps {
  selectedPlatforms: Array<'facebook' | 'instagram' | 'twitter' | 'line'>;
  onPlatformChange: (platforms: Array<'facebook' | 'instagram' | 'twitter' | 'line'>) => void;
  availablePlatforms: Array<'facebook' | 'instagram' | 'twitter' | 'line'>;
}

export const SocialPlatformSelector: React.FC<SocialPlatformSelectorProps> = ({
  selectedPlatforms,
  onPlatformChange,
  availablePlatforms
}) => {
  const platforms: Platform[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '👥',
      color: 'bg-blue-500',
      description: '分享給親朋好友',
      features: ['長文支援', '影片嵌入', '多圖分享']
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📸',
      color: 'bg-pink-500',
      description: '視覺創作分享',
      features: ['精美排版', '限時動態', 'Hashtag推廣']
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-400',
      description: '快速分享動態',
      features: ['簡潔文字', '即時分享', '話題討論']
    },
    {
      id: 'line',
      name: 'LINE',
      icon: '💬',
      color: 'bg-green-500',
      description: '台灣最愛通訊軟體',
      features: ['家庭群組', '朋友圈', '貼圖支援']
    }
  ];

  const availablePlatformData = platforms.filter(p => availablePlatforms.includes(p.id));

  const handlePlatformToggle = (platformId: 'facebook' | 'instagram' | 'twitter' | 'line') => {
    const isSelected = selectedPlatforms.includes(platformId);
    
    if (isSelected) {
      // 移除平台（但至少保留一個）
      if (selectedPlatforms.length > 1) {
        onPlatformChange(selectedPlatforms.filter(p => p !== platformId));
      }
    } else {
      // 新增平台
      onPlatformChange([...selectedPlatforms, platformId]);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📱 選擇分享平台
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {availablePlatformData.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          
          return (
            <div
              key={platform.id}
              className={`cursor-pointer rounded-lg p-4 border-2 transition-all ${
                isSelected
                  ? `border-blue-500 bg-blue-50 ${platform.color} bg-opacity-10`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handlePlatformToggle(platform.id)}
            >
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{platform.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-800">{platform.name}</h4>
                  {isSelected && (
                    <span className="text-xs text-blue-600 font-medium">✓ 已選擇</span>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {platform.description}
              </p>
              
              <div className="space-y-1">
                {platform.features.map((feature, index) => (
                  <div key={index} className="text-xs text-gray-500 flex items-center">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          已選擇 {selectedPlatforms.length} 個平台 • 
          <span className="text-blue-600">建議同時分享到多個平台以擴大影響力</span>
        </p>
      </div>
    </div>
  );
};
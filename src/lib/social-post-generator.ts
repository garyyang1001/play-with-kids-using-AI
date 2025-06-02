/**
 * Social Post Generator
 * AI 社群貼文生成器
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { VideoGenerationResult } from './video-generator';
import { OptimizedVideoPrompt } from './video-prompt-optimizer';

export interface SocialPostContent {
  mainContent: string;
  promptLearningHighlight: string;
  beforeAfter: {
    before: string;
    after: string;
  };
  parentQuote: string;
  childQuote: string;
  hashtags: string[];
  videoPreview: string;
  achievementBadges: string[];
}

export interface SocialPostTemplate {
  platform: 'facebook' | 'instagram' | 'twitter' | 'line';
  maxLength: number;
  supportedFeatures: {
    hashtags: boolean;
    mentions: boolean;
    emojis: boolean;
    multipleImages: boolean;
    video: boolean;
  };
}

export interface GeneratedSocialPost {
  platform: 'facebook' | 'instagram' | 'twitter' | 'line';
  content: string;
  mediaAttachments: {
    videoUrl?: string;
    thumbnailUrl?: string;
    additionalImages?: string[];
  };
  metadata: {
    characterCount: number;
    hashtagCount: number;
    estimatedEngagement: 'low' | 'medium' | 'high';
    targetAudience: string[];
  };
}

export class SocialPostGenerator {
  private genAI: GoogleGenerativeAI;
  private platformTemplates: Record<string, SocialPostTemplate>;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Google AI API Key 未設定');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.initializePlatformTemplates();
  }

  /**
   * 初始化平台模板
   */
  private initializePlatformTemplates(): void {
    this.platformTemplates = {
      facebook: {
        platform: 'facebook',
        maxLength: 2000,
        supportedFeatures: {
          hashtags: true,
          mentions: true,
          emojis: true,
          multipleImages: true,
          video: true
        }
      },
      instagram: {
        platform: 'instagram',
        maxLength: 2200,
        supportedFeatures: {
          hashtags: true,
          mentions: true,
          emojis: true,
          multipleImages: true,
          video: true
        }
      },
      twitter: {
        platform: 'twitter',
        maxLength: 280,
        supportedFeatures: {
          hashtags: true,
          mentions: true,
          emojis: true,
          multipleImages: true,
          video: true
        }
      },
      line: {
        platform: 'line',
        maxLength: 1000,
        supportedFeatures: {
          hashtags: false,
          mentions: false,
          emojis: true,
          multipleImages: true,
          video: true
        }
      }
    };
  }

  /**
   * 生成社群貼文內容
   */
  async generateSocialPostContent(
    result: VideoGenerationResult,
    optimizedPrompt: OptimizedVideoPrompt | null,
    userContext?: {
      childName?: string;
      childAge?: number;
      parentName?: string;
      learningGoals?: string[];
    }
  ): Promise<SocialPostContent> {
    const model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp'
    });

    const prompt = this.buildContentGenerationPrompt(result, optimizedPrompt, userContext);
    
    try {
      const response = await model.generateContent(prompt);
      const generatedText = response.response.text();
      
      return this.parseSocialPostContent(generatedText, result, optimizedPrompt);
    } catch (error) {
      console.error('AI 社群貼文生成失敗:', error);
      return this.generateFallbackContent(result, optimizedPrompt, userContext);
    }
  }

  /**
   * 建立內容生成提示
   */
  private buildContentGenerationPrompt(
    result: VideoGenerationResult,
    optimizedPrompt: OptimizedVideoPrompt | null,
    userContext?: any
  ): string {
    const childName = userContext?.childName || '小朋友';
    const parentName = userContext?.parentName || '家長';
    
    return `
作為親子 AI 創作分享專家，請為以下影片創作成果生成吸引人的社群分享內容：

## 影片資訊
- 影片長度：${result.metadata.duration}秒
- 品質評分：${result.metadata.qualityScore || 4.0}/5.0
- 生成時間：${Math.round(result.generationTime / 1000)}秒

## Prompt 學習成果
${optimizedPrompt ? `
- 原始描述：「${optimizedPrompt.originalPrompt}」
- 優化後：「${optimizedPrompt.optimizedPrompt}」
- 品質提升：${optimizedPrompt.qualityScore}%
- 學習重點：${optimizedPrompt.optimizationAreas.map(area => area.improvement).join('、')}
` : ''}

## 用戶背景
- 孩子：${childName}${userContext?.childAge ? ` (${userContext.childAge}歲)` : ''}
- 家長：${parentName}

請生成以下格式的內容（使用繁體中文）：

### MAIN_CONTENT
[主要分享內容，強調親子共學AI的價值與成果，100-150字]

### PROMPT_LEARNING_HIGHLIGHT  
[重點展示 Prompt Engineering 學習成果，50-80字]

### BEFORE_AFTER
BEFORE: [簡化的原始描述]
AFTER: [精簡的優化後描述]

### PARENT_QUOTE
[模擬家長的真實感想，30-50字]

### CHILD_QUOTE  
[模擬孩子的興奮表達，20-30字]

### HASHTAGS
[6-8個相關標籤，包含 #親子AI創作 #PromptEngineering等]

### VIDEO_PREVIEW
[影片內容的吸引人描述，20-30字]

### ACHIEVEMENT_BADGES
[3-5個成就徽章文字，如「色彩大師」「創意達人」等]

要求：
1. 內容要真實、溫馨、有教育價值
2. 強調親子互動與 AI 學習
3. 展現孩子的創意成長
4. 適合台灣家庭文化背景
5. 語調親切自然，避免過度商業化
`;
  }

  /**
   * 解析AI生成的內容
   */
  private parseSocialPostContent(
    generatedText: string,
    result: VideoGenerationResult,
    optimizedPrompt: OptimizedVideoPrompt | null
  ): SocialPostContent {
    try {
      const sections = this.extractSections(generatedText);
      
      return {
        mainContent: sections.MAIN_CONTENT || this.generateDefaultMainContent(result),
        promptLearningHighlight: sections.PROMPT_LEARNING_HIGHLIGHT || '學會了更好的AI溝通技巧！',
        beforeAfter: {
          before: sections.BEFORE || optimizedPrompt?.originalPrompt || '簡單描述',
          after: sections.AFTER || optimizedPrompt?.optimizedPrompt || '詳細生動的描述'
        },
        parentQuote: sections.PARENT_QUOTE || '看到孩子學會與AI對話，真的很驚喜！',
        childQuote: sections.CHILD_QUOTE || '我會用AI做動畫了，好酷喔！',
        hashtags: this.parseHashtags(sections.HASHTAGS),
        videoPreview: sections.VIDEO_PREVIEW || '精彩的AI動畫作品',
        achievementBadges: this.parseAchievementBadges(sections.ACHIEVEMENT_BADGES)
      };
    } catch (error) {
      console.error('解析社群貼文內容失敗:', error);
      return this.generateFallbackContent(result, optimizedPrompt);
    }
  }

  /**
   * 提取各個區段
   */
  private extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const sectionPattern = /### (\w+)\s*\n([\s\S]*?)(?=\n### |\n*$)/g;
    
    let match;
    while ((match = sectionPattern.exec(text)) !== null) {
      const [, sectionName, content] = match;
      sections[sectionName] = content.trim();
    }

    // 處理 BEFORE_AFTER 特殊格式
    if (sections.BEFORE_AFTER) {
      const beforeMatch = sections.BEFORE_AFTER.match(/BEFORE:\s*(.*?)(?=\nAFTER:)/s);
      const afterMatch = sections.BEFORE_AFTER.match(/AFTER:\s*(.*?)$/s);
      
      if (beforeMatch) sections.BEFORE = beforeMatch[1].trim();
      if (afterMatch) sections.AFTER = afterMatch[1].trim();
    }

    return sections;
  }

  /**
   * 解析hashtags
   */
  private parseHashtags(hashtagText?: string): string[] {
    if (!hashtagText) {
      return ['#親子AI創作', '#PromptEngineering', '#AI學習', '#創意影片', '#兒童教育', '#科技育兒'];
    }

    const hashtags = hashtagText.match(/#[\w\u4e00-\u9fff]+/g) || [];
    
    // 確保包含核心標籤
    const coreHashtags = ['#親子AI創作', '#PromptEngineering'];
    const allHashtags = [...new Set([...coreHashtags, ...hashtags])];
    
    return allHashtags.slice(0, 8);
  }

  /**
   * 解析成就徽章
   */
  private parseAchievementBadges(badgeText?: string): string[] {
    if (!badgeText) {
      return ['創意達人', '色彩大師', 'AI溝通高手'];
    }

    const badges = badgeText.split(/[,、\n]/).map(badge => badge.trim()).filter(Boolean);
    return badges.slice(0, 5);
  }

  /**
   * 為特定平台優化貼文
   */
  async generatePlatformPost(
    content: SocialPostContent,
    platform: 'facebook' | 'instagram' | 'twitter' | 'line',
    videoResult: VideoGenerationResult
  ): Promise<GeneratedSocialPost> {
    const template = this.platformTemplates[platform];
    const optimizedContent = this.optimizeContentForPlatform(content, template);

    return {
      platform,
      content: optimizedContent,
      mediaAttachments: {
        videoUrl: videoResult.videoUrl,
        thumbnailUrl: videoResult.thumbnailUrl
      },
      metadata: {
        characterCount: optimizedContent.length,
        hashtagCount: content.hashtags.length,
        estimatedEngagement: this.estimateEngagement(optimizedContent, platform),
        targetAudience: ['家長', '教育工作者', 'AI愛好者', '親子家庭']
      }
    };
  }

  /**
   * 為平台優化內容
   */
  private optimizeContentForPlatform(
    content: SocialPostContent,
    template: SocialPostTemplate
  ): string {
    let postContent = '';

    switch (template.platform) {
      case 'facebook':
        postContent = this.buildFacebookPost(content);
        break;
      case 'instagram':
        postContent = this.buildInstagramPost(content);
        break;
      case 'twitter':
        postContent = this.buildTwitterPost(content);
        break;
      case 'line':
        postContent = this.buildLinePost(content);
        break;
    }

    // 確保不超過字數限制
    if (postContent.length > template.maxLength) {
      postContent = this.truncateContent(postContent, template.maxLength);
    }

    return postContent;
  }

  /**
   * 建立 Facebook 貼文
   */
  private buildFacebookPost(content: SocialPostContent): string {
    return `🎬✨ ${content.mainContent}

💡 ${content.promptLearningHighlight}

📈 學習成果展示：
「${content.beforeAfter.before}」
      ⬇️ AI優化後 ⬇️
「${content.beforeAfter.after}」

👨‍👩‍👧‍👦 家長心得：「${content.parentQuote}」
🧒 孩子的話：「${content.childQuote}」

🎯 解鎖成就：${content.achievementBadges.join(' 🏆 ')}

${content.hashtags.join(' ')}

#AI親子教育 #未來技能培養`;
  }

  /**
   * 建立 Instagram 貼文
   */
  private buildInstagramPost(content: SocialPostContent): string {
    return `🎬 ${content.videoPreview} ✨

${content.mainContent}

💫 ${content.promptLearningHighlight}

Before ➡️ After:
「${content.beforeAfter.before}」→「${content.beforeAfter.after}」

👶 "${content.childQuote}"
👨‍👩‍👧‍👦 "${content.parentQuote}"

🏆 ${content.achievementBadges.join(' 🏆 ')}

${content.hashtags.join(' ')}
#AIeducation #ParentingInTechAge`;
  }

  /**
   * 建立 Twitter 貼文
   */
  private buildTwitterPost(content: SocialPostContent): string {
    // Twitter 字數限制嚴格，需要簡化
    const shortContent = content.mainContent.substring(0, 80) + '...';
    const shortHashtags = content.hashtags.slice(0, 3).join(' ');
    
    return `🎬 ${shortContent}

💡 ${content.promptLearningHighlight.substring(0, 50)}...

🏆 ${content.achievementBadges[0]}

${shortHashtags}`;
  }

  /**
   * 建立 Line 貼文
   */
  private buildLinePost(content: SocialPostContent): string {
    return `🎬✨ ${content.mainContent}

💡 ${content.promptLearningHighlight}

學習對比：
原本：「${content.beforeAfter.before}」
優化：「${content.beforeAfter.after}」

💬 「${content.parentQuote}」
🧒 「${content.childQuote}」

🏆 成就：${content.achievementBadges.join('、')}`;
  }

  /**
   * 截斷內容
   */
  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    
    const truncated = content.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
  }

  /**
   * 估計參與度
   */
  private estimateEngagement(content: string, platform: string): 'low' | 'medium' | 'high' {
    let score = 0;
    
    // 內容品質指標
    if (content.includes('🎬') || content.includes('✨')) score += 1;
    if (content.includes('親子') || content.includes('孩子')) score += 2;
    if (content.includes('AI') || content.includes('Prompt')) score += 1;
    if (content.length > 100 && content.length < 500) score += 1;
    
    // 平台特性調整
    if (platform === 'facebook' || platform === 'instagram') score += 1;
    
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  /**
   * 生成預設主要內容
   */
  private generateDefaultMainContent(result: VideoGenerationResult): string {
    return `今天和孩子一起用AI創作了精彩的動畫影片！透過學習Prompt Engineering，我們把簡單的想法變成了生動的${result.metadata.duration}秒動畫。看到孩子掌握與AI對話的技巧，真的很有成就感！`;
  }

  /**
   * 生成備用內容
   */
  private generateFallbackContent(
    result: VideoGenerationResult,
    optimizedPrompt: OptimizedVideoPrompt | null,
    userContext?: any
  ): SocialPostContent {
    return {
      mainContent: this.generateDefaultMainContent(result),
      promptLearningHighlight: '學會了如何與AI更好地溝通，讓創意想法變成精彩作品！',
      beforeAfter: {
        before: optimizedPrompt?.originalPrompt || '簡單的故事想法',
        after: optimizedPrompt?.optimizedPrompt || '豐富生動的影片描述'
      },
      parentQuote: '看到孩子學習AI技能，為未來做好準備，真的很棒！',
      childQuote: '我學會用AI做動畫了，超酷的！',
      hashtags: ['#親子AI創作', '#PromptEngineering', '#AI學習', '#創意影片', '#兒童教育', '#科技育兒'],
      videoPreview: '親子共創的AI動畫作品',
      achievementBadges: ['創意達人', 'AI溝通高手', '學習冠軍']
    };
  }

  /**
   * 批量生成多平台貼文
   */
  async generateMultiPlatformPosts(
    content: SocialPostContent,
    videoResult: VideoGenerationResult,
    platforms: Array<'facebook' | 'instagram' | 'twitter' | 'line'> = ['facebook', 'instagram']
  ): Promise<GeneratedSocialPost[]> {
    const posts = await Promise.all(
      platforms.map(platform => 
        this.generatePlatformPost(content, platform, videoResult)
      )
    );
    
    return posts;
  }
}

// 單例導出
export const socialPostGenerator = new SocialPostGenerator();
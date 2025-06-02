import { GoogleGenAI } from '@google/genai';

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
}

export interface SocialPostData {
  templateName: string;
  childAge: number;
  learningSession: {
    duration: number; // 分鐘
    promptEvolutions: number;
    skillsLearned: string[];
    qualityImprovement: number; // 倍數
  };
  finalPrompt: string;
  originalPrompt: string;
  achievements: string[];
  videoUrl?: string;
}

export class SocialPostGenerator {
  private client: GoogleGenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (!key) {
      throw new Error('Google AI API Key 未設定');
    }
    this.client = new GoogleGenAI({ apiKey: key });
  }

  async generateSocialPost(data: SocialPostData): Promise<SocialPostContent> {
    const prompt = `
作為親子 AI 創作平台的社群內容專家，請根據以下學習成果生成一個溫馨有趣的 Facebook 分享貼文：

學習資料：
- 模板：${data.templateName}
- 孩子年齡：${data.childAge}歲
- 學習時長：${data.learningSession.duration}分鐘
- Prompt 優化次數：${data.learningSession.promptEvolutions}次
- 品質提升：${data.learningSession.qualityImprovement.toFixed(1)}倍
- 學會技能：${data.learningSession.skillsLearned.join(', ')}
- 解鎖成就：${data.achievements.join(', ')}

原始 Prompt：${data.originalPrompt}
優化後 Prompt：${data.finalPrompt}

請生成包含以下元素的貼文內容（JSON格式回傳）：

{
  "mainContent": "主要分享內容，展現親子共學的成果與喜悅，約100-150字",
  "promptLearningHighlight": "重點強調 Prompt Engineering 學習成果，約50字",
  "beforeAfter": {
    "before": "簡潔描述原始 Prompt",
    "after": "簡潔描述優化後 Prompt"
  },
  "parentQuote": "家長感想引述，約30字，第一人稱",
  "childQuote": "孩子可愛的話語引述，約20字，童真語氣",
  "hashtags": ["相關標籤陣列，包含 #親子AI創作", "#PromptEngineering", "#AI教育", "等10個標籤"],
  "videoPreview": "影片預覽描述，約30字"
}

注意事項：
- 語氣溫馨正面，突出親子互動價值
- 強調學習過程而非只有結果
- 展現孩子的創意和進步
- 鼓勵其他家庭也來嘗試
- 所有內容使用繁體中文
`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt
      });
      
      const text = response.text;
      
      // 解析 JSON 回應
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('無法解析 AI 回應為 JSON 格式');
      }

      const content = JSON.parse(jsonMatch[0]) as SocialPostContent;
      
      // 驗證必要欄位
      if (!content.mainContent || !content.hashtags || !Array.isArray(content.hashtags)) {
        throw new Error('AI 回應缺少必要欄位');
      }

      return content;
    } catch (error) {
      console.error('生成社群貼文失敗:', error);
      
      // 提供備用內容
      return this.generateFallbackContent(data);
    }
  }

  private generateFallbackContent(data: SocialPostData): SocialPostContent {
    return {
      mainContent: `今天和孩子一起體驗了 AI 影片創作！從簡單的「${data.originalPrompt}」到豐富的描述，看到孩子的創意在 AI 的幫助下綻放，真的很感動。短短 ${data.learningSession.duration} 分鐘，學會了這麼多 Prompt 技巧！`,
      promptLearningHighlight: `Prompt 品質提升了 ${data.learningSession.qualityImprovement.toFixed(1)} 倍，孩子掌握了描述技巧！`,
      beforeAfter: {
        before: data.originalPrompt.slice(0, 50) + (data.originalPrompt.length > 50 ? '...' : ''),
        after: data.finalPrompt.slice(0, 50) + (data.finalPrompt.length > 50 ? '...' : '')
      },
      parentQuote: '看到孩子的創意被 AI 理解並呈現出來，真的很神奇！',
      childQuote: '我的想法變成真的影片了！好厲害喔！',
      hashtags: [
        '#親子AI創作', '#PromptEngineering', '#AI教育', '#親子學習',
        '#創意表達', '#未來技能', '#家庭時光', '#教育科技',
        '#孩子創意', '#AI影片'
      ],
      videoPreview: '一起來看看我們創作的 AI 動畫影片吧！'
    };
  }

  async generatePersonalizedHashtags(data: SocialPostData): Promise<string[]> {
    const baseHashtags = ['#親子AI創作', '#PromptEngineering', '#AI教育'];
    
    // 根據模板添加特定標籤
    const templateHashtags: Record<string, string[]> = {
      'daily-life': ['#日常生活', '#孩子成長'],
      'adventure': ['#冒險故事', '#想像力'],
      'animal-friend': ['#動物朋友', '#創意故事']
    };

    // 根據技能添加標籤
    const skillHashtags: Record<string, string> = {
      '色彩描述': '#色彩美學',
      '情感表達': '#情感教育',
      '場景設定': '#故事創作',
      '角色設計': '#角色創作'
    };

    let hashtags = [...baseHashtags];
    
    // 添加模板相關標籤
    if (templateHashtags[data.templateName]) {
      hashtags.push(...templateHashtags[data.templateName]);
    }

    // 添加技能相關標籤
    data.learningSession.skillsLearned.forEach(skill => {
      if (skillHashtags[skill]) {
        hashtags.push(skillHashtags[skill]);
      }
    });

    // 根據年齡添加標籤
    if (data.childAge <= 6) {
      hashtags.push('#幼兒教育');
    } else if (data.childAge <= 12) {
      hashtags.push('#兒童學習');
    } else {
      hashtags.push('#青少年創作');
    }

    // 補足到10個標籤
    const additionalHashtags = [
      '#家庭時光', '#教育科技', '#孩子創意', '#AI影片',
      '#未來技能', '#創意表達', '#數位學習', '#親子互動'
    ];

    while (hashtags.length < 10 && additionalHashtags.length > 0) {
      const tag = additionalHashtags.shift();
      if (tag && !hashtags.includes(tag)) {
        hashtags.push(tag);
      }
    }

    return hashtags.slice(0, 10);
  }

  formatForFacebook(content: SocialPostContent): string {
    return `${content.mainContent}

🎨 ${content.promptLearningHighlight}

📝 Prompt 進化過程：
「${content.beforeAfter.before}」
↓
「${content.beforeAfter.after}」

👨‍👩‍👧‍👦 家長心得：「${content.parentQuote}」
🧒 孩子說：「${content.childQuote}」

🎬 ${content.videoPreview}

${content.hashtags.join(' ')}`;
  }

  formatForLineup(content: SocialPostContent): string {
    return `🎯 親子 AI 創作成果分享

${content.mainContent}

✨ 學習亮點
${content.promptLearningHighlight}

🔄 創作進化
原本：${content.beforeAfter.before}
進化：${content.beforeAfter.after}

💬 真實心聲
👨‍👩‍👧‍👦：${content.parentQuote}
🧒：${content.childQuote}

${content.hashtags.slice(0, 5).join(' ')}`;
  }
}

export default SocialPostGenerator;
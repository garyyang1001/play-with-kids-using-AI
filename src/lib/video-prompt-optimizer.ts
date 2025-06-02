/**
 * Video Prompt Optimizer
 * 專門針對 Veo2 影片生成優化 Prompt
 */

import { PromptQualityScore } from './types/prompt-engineering';

// Veo2 影片生成配置
export interface Veo2Config {
  model: 'veo-2.0-generate-001';
  aspectRatio: '9:16' | '16:9' | '1:1';
  durationSeconds: number;
  numberOfVideos: number;
  personGeneration: 'allow_adult' | 'allow_minor' | 'block_all';
}

export interface OptimizedVideoPrompt {
  optimizedPrompt: string;
  originalPrompt: string;
  optimizationAreas: VideoOptimizationArea[];
  qualityScore: number;
  veo2Config: Veo2Config;
  improvements: VideoImprovementDetail[];
}

export interface VideoOptimizationArea {
  area: 'motion' | 'visual' | 'emotion' | 'scene' | 'timing';
  improvement: string;
  example: string;
}

export interface VideoImprovementDetail {
  type: 'added_motion' | 'enhanced_color' | 'improved_emotion' | 'refined_scene' | 'timing_optimization';
  before: string;
  after: string;
  reasoning: string;
}

export class VideoPromptOptimizer {
  private readonly actionVerbs = [
    '飛翔', '跳躍', '旋轉', '奔跑', '漂浮', '閃爍', '搖擺', '翻滾', 
    '伸展', '舞蹈', '攀爬', '滑行', '彈跳', '搖晃', '揮手', '點頭',
    '轉圈', '飄動', '閃耀', '發光', '輕盈移動', '優雅漂移'
  ];

  private readonly colorEnhancers = [
    '鮮豔的', '柔和的', '溫暖的', '清亮的', '飽和的', '夢幻的',
    '彩虹色的', '漸層的', '閃爍的', '透明的', '珠光的', '絢爛的',
    '明亮的', '深邃的', '清透的', '斑斕的', '繽紛的', '燦爛的'
  ];

  private readonly emotionalTones = [
    '開心地', '興奮地', '溫柔地', '快樂地', '愉悅地', '充滿愛意地',
    '好奇地', '驚喜地', '滿足地', '安詳地', '活潑地', '熱情地',
    '溫暖地', '友善地', '充滿希望地', '感動地', '欣喜地', '陶醉地'
  ];

  private readonly sceneElements = [
    '在明亮的', '在溫馨的', '在夢幻的', '在寬敞的', '在美麗的',
    '在神奇的', '在舒適的', '在彩色的', '在陽光灿爛的', '在星光閃爍的',
    '在花香瀰漫的', '在音樂輕柔的', '在微風輕拂的', '在雲朵飄浮的'
  ];

  /**
   * 優化基礎 Prompt 為適合 Veo2 的影片 Prompt
   */
  optimizeForVeo2(
    basePrompt: string, 
    targetAudience: 'child' | 'family' = 'family',
    duration: number = 5
  ): OptimizedVideoPrompt {
    const improvements: VideoImprovementDetail[] = [];
    let optimizedPrompt = basePrompt;

    // 1. 添加動作動詞
    optimizedPrompt = this.addMotionElements(optimizedPrompt, improvements);

    // 2. 強化色彩描述
    optimizedPrompt = this.enhanceColorDescription(optimizedPrompt, improvements);

    // 3. 加入情感表達
    optimizedPrompt = this.addEmotionalExpression(optimizedPrompt, improvements);

    // 4. 優化場景設定
    optimizedPrompt = this.refineSceneSetting(optimizedPrompt, improvements);

    // 5. 添加時間流暢性
    optimizedPrompt = this.addTimingOptimization(optimizedPrompt, duration, improvements);

    // 6. 確保適合目標觀眾
    optimizedPrompt = this.ensureAudienceAppropriate(optimizedPrompt, targetAudience);

    const qualityScore = this.calculateVideoPromptQuality(optimizedPrompt);
    const optimizationAreas = this.generateOptimizationAreas(improvements);

    return {
      optimizedPrompt,
      originalPrompt: basePrompt,
      optimizationAreas,
      qualityScore,
      veo2Config: this.getDefaultVeo2Config(duration),
      improvements
    };
  }

  /**
   * 添加動作元素
   */
  private addMotionElements(prompt: string, improvements: VideoImprovementDetail[]): string {
    // 檢查是否已有動作詞
    const hasMotion = this.actionVerbs.some(verb => prompt.includes(verb));
    
    if (!hasMotion) {
      const randomAction = this.getRandomElement(this.actionVerbs);
      const enhanced = prompt + `，${randomAction}著`;
      
      improvements.push({
        type: 'added_motion',
        before: prompt,
        after: enhanced,
        reasoning: '添加動作動詞讓影片更生動有趣'
      });
      
      return enhanced;
    }
    
    return prompt;
  }

  /**
   * 強化色彩描述
   */
  private enhanceColorDescription(prompt: string, improvements: VideoImprovementDetail[]): string {
    // 檢查是否已有色彩描述
    const hasColor = this.colorEnhancers.some(color => prompt.includes(color));
    
    if (!hasColor) {
      const randomColor = this.getRandomElement(this.colorEnhancers);
      const enhanced = prompt.replace(/的/, `的${randomColor}`);
      
      improvements.push({
        type: 'enhanced_color',
        before: prompt,
        after: enhanced,
        reasoning: '添加色彩描述讓視覺效果更豐富'
      });
      
      return enhanced;
    }
    
    return prompt;
  }

  /**
   * 添加情感表達
   */
  private addEmotionalExpression(prompt: string, improvements: VideoImprovementDetail[]): string {
    // 檢查是否已有情感表達
    const hasEmotion = this.emotionalTones.some(emotion => prompt.includes(emotion));
    
    if (!hasEmotion) {
      const randomEmotion = this.getRandomElement(this.emotionalTones);
      const enhanced = prompt + `，${randomEmotion}享受這個時刻`;
      
      improvements.push({
        type: 'improved_emotion',
        before: prompt,
        after: enhanced,
        reasoning: '添加情感表達讓角色更有生命力'
      });
      
      return enhanced;
    }
    
    return prompt;
  }

  /**
   * 優化場景設定
   */
  private refineSceneSetting(prompt: string, improvements: VideoImprovementDetail[]): string {
    // 檢查是否已有場景描述
    const hasScene = this.sceneElements.some(scene => prompt.includes(scene));
    
    if (!hasScene) {
      const randomScene = this.getRandomElement(this.sceneElements);
      const enhanced = `${randomScene}環境中，${prompt}`;
      
      improvements.push({
        type: 'refined_scene',
        before: prompt,
        after: enhanced,
        reasoning: '添加場景設定讓背景更有氛圍'
      });
      
      return enhanced;
    }
    
    return prompt;
  }

  /**
   * 添加時間流暢性優化
   */
  private addTimingOptimization(prompt: string, duration: number, improvements: VideoImprovementDetail[]): string {
    const timingPhrases = duration <= 5 
      ? ['瞬間', '輕快地', '流暢地'] 
      : ['緩緩地', '優雅地', '悠然地'];
    
    const randomTiming = this.getRandomElement(timingPhrases);
    const enhanced = prompt + `，${randomTiming}展現著美好的畫面`;
    
    improvements.push({
      type: 'timing_optimization',
      before: prompt,
      after: enhanced,
      reasoning: `針對${duration}秒影片優化時間節奏`
    });
    
    return enhanced;
  }

  /**
   * 確保適合目標觀眾
   */
  private ensureAudienceAppropriate(prompt: string, targetAudience: 'child' | 'family'): string {
    if (targetAudience === 'child') {
      // 確保用詞適合兒童
      return prompt
        .replace(/複雜/g, '有趣')
        .replace(/深奧/g, '神奇')
        .replace(/困難/g, '好玩');
    }
    
    return prompt;
  }

  /**
   * 計算影片 Prompt 品質分數
   */
  private calculateVideoPromptQuality(prompt: string): number {
    let score = 0;
    const maxScore = 100;

    // 動作元素 (25%)
    const hasMotion = this.actionVerbs.some(verb => prompt.includes(verb));
    if (hasMotion) score += 25;

    // 色彩描述 (20%)
    const colorCount = this.colorEnhancers.filter(color => prompt.includes(color)).length;
    score += Math.min(colorCount * 10, 20);

    // 情感表達 (20%)
    const emotionCount = this.emotionalTones.filter(emotion => prompt.includes(emotion)).length;
    score += Math.min(emotionCount * 10, 20);

    // 場景設定 (20%)
    const sceneCount = this.sceneElements.filter(scene => prompt.includes(scene)).length;
    score += Math.min(sceneCount * 10, 20);

    // 長度適中 (15%)
    const length = prompt.length;
    if (length >= 50 && length <= 200) score += 15;
    else if (length >= 30 && length <= 250) score += 10;
    else if (length >= 20) score += 5;

    return Math.round(score);
  }

  /**
   * 生成優化區域說明
   */
  private generateOptimizationAreas(improvements: VideoImprovementDetail[]): VideoOptimizationArea[] {
    const areaMap: Record<string, VideoOptimizationArea> = {
      'added_motion': {
        area: 'motion',
        improvement: '添加動作元素讓影片更生動',
        example: '從靜態描述變為動態場景'
      },
      'enhanced_color': {
        area: 'visual',
        improvement: '強化色彩描述提升視覺效果',
        example: '添加色彩形容詞增強畫面豐富度'
      },
      'improved_emotion': {
        area: 'emotion',
        improvement: '加入情感表達讓角色更有生命力',
        example: '描述角色的情感狀態和表情'
      },
      'refined_scene': {
        area: 'scene',
        improvement: '優化場景設定增強環境氛圍',
        example: '添加環境背景讓場景更完整'
      },
      'timing_optimization': {
        area: 'timing',
        improvement: '優化時間節奏適合影片長度',
        example: '調整動作節奏配合影片時間'
      }
    };

    return improvements.map(imp => areaMap[imp.type]).filter(Boolean);
  }

  /**
   * 獲取默認 Veo2 配置
   */
  private getDefaultVeo2Config(duration: number): Veo2Config {
    return {
      model: 'veo-2.0-generate-001',
      aspectRatio: '9:16',
      durationSeconds: duration,
      numberOfVideos: 1,
      personGeneration: 'allow_minor'
    };
  }

  /**
   * 隨機獲取數組元素
   */
  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 批量優化多個 Prompt
   */
  async optimizeBatch(prompts: string[], targetAudience: 'child' | 'family' = 'family'): Promise<OptimizedVideoPrompt[]> {
    return prompts.map(prompt => this.optimizeForVeo2(prompt, targetAudience));
  }

  /**
   * 為特定模板優化 Prompt
   */
  optimizeForTemplate(
    prompt: string, 
    templateType: 'daily-life' | 'adventure' | 'animal-friend',
    duration: number = 5
  ): OptimizedVideoPrompt {
    const templateConfigs = {
      'daily-life': { 
        targetAudience: 'family' as const,
        preferredActions: ['走路', '吃飯', '刷牙', '睡覺', '玩耍'],
        preferredColors: ['溫暖的', '柔和的', '明亮的'],
        preferredEmotions: ['開心地', '滿足地', '安詳地']
      },
      'adventure': {
        targetAudience: 'child' as const,
        preferredActions: ['飛翔', '奔跑', '跳躍', '攀爬', '探索'],
        preferredColors: ['鮮豔的', '絢爛的', '彩虹色的'],
        preferredEmotions: ['興奮地', '勇敢地', '充滿希望地']
      },
      'animal-friend': {
        targetAudience: 'family' as const,
        preferredActions: ['搖擺', '跳躍', '玩耍', '奔跑', '飛翔'],
        preferredColors: ['可愛的', '繽紛的', '自然的'],
        preferredEmotions: ['友善地', '好奇地', '快樂地']
      }
    };

    const config = templateConfigs[templateType];
    return this.optimizeForVeo2(prompt, config.targetAudience, duration);
  }
}

// 單例導出
export const videoPromptOptimizer = new VideoPromptOptimizer();
/**
 * 成就系統
 * 階段4：三大模板實作 - 成就與獎勵系統
 */

import { Achievement, AchievementType, SkillProgress, AttemptRecord } from '@/types/template';

export class AchievementSystem {
  private achievements = new Map<string, Achievement[]>();
  private achievementDefinitions = new Map<string, AchievementDefinition>();
  
  constructor() {
    this.initializeAchievementDefinitions();
  }

  // ===== 成就定義初始化 =====

  private initializeAchievementDefinitions(): void {
    const definitions: AchievementDefinition[] = [
      // 技能掌握成就
      {
        id: 'clarity-master',
        type: 'skill-mastery',
        title: '清晰表達大師',
        description: '清晰度技能達到80分以上',
        icon: '🗣️',
        requirements: [
          { type: 'skill-level', skill: 'clarity', threshold: 80 }
        ],
        rewards: ['解鎖高級模板', '獲得特殊稱號'],
        rarity: 'common'
      },
      {
        id: 'detail-master',
        type: 'skill-mastery',
        title: '細節描述專家',
        description: '細節豐富度技能達到85分以上',
        icon: '🔍',
        requirements: [
          { type: 'skill-level', skill: 'detail', threshold: 85 }
        ],
        rewards: ['解鎖細節增強模式'],
        rarity: 'rare'
      },
      {
        id: 'emotion-master',
        type: 'skill-mastery',
        title: '情感表達藝術家',
        description: '情感表達技能達到90分以上',
        icon: '💝',
        requirements: [
          { type: 'skill-level', skill: 'emotion', threshold: 90 }
        ],
        rewards: ['解鎖情感深度模板'],
        rarity: 'epic'
      },
      {
        id: 'visual-master',
        type: 'skill-mastery',
        title: '視覺描述大師',
        description: '視覺描述技能達到88分以上',
        icon: '🎨',
        requirements: [
          { type: 'skill-level', skill: 'visual', threshold: 88 }
        ],
        rewards: ['解鎖視覺特效模板'],
        rarity: 'rare'
      },
      {
        id: 'structure-master',
        type: 'skill-mastery',
        title: '結構組織專家',
        description: '結構完整性技能達到85分以上',
        icon: '🏗️',
        requirements: [
          { type: 'skill-level', skill: 'structure', threshold: 85 }
        ],
        rewards: ['解鎖複雜結構模板'],
        rarity: 'rare'
      },

      // 持續性成就
      {
        id: 'daily-creator',
        type: 'consistency',
        title: '每日創作者',
        description: '連續3天完成創作',
        icon: '📅',
        requirements: [
          { type: 'consecutive-days', threshold: 3 }
        ],
        rewards: ['獲得每日創作徽章'],
        rarity: 'common'
      },
      {
        id: 'weekly-warrior',
        type: 'consistency',
        title: '週度戰士',
        description: '一週內完成10次創作',
        icon: '⚔️',
        requirements: [
          { type: 'attempts-per-week', threshold: 10 }
        ],
        rewards: ['解鎖週度挑戰'],
        rarity: 'rare'
      },
      {
        id: 'persistent-creator',
        type: 'consistency',
        title: '堅持不懈',
        description: '連續7天使用平台',
        icon: '💪',
        requirements: [
          { type: 'consecutive-days', threshold: 7 }
        ],
        rewards: ['獲得堅持徽章', '額外提示解鎖'],
        rarity: 'epic'
      },

      // 改善成就
      {
        id: 'rapid-improver',
        type: 'improvement',
        title: '快速進步者',
        description: '單次創作分數提升30分以上',
        icon: '🚀',
        requirements: [
          { type: 'score-improvement', threshold: 30 }
        ],
        rewards: ['獲得進步之星'],
        rarity: 'common'
      },
      {
        id: 'perfectionist',
        type: 'improvement',
        title: '完美主義者',
        description: '連續3次創作都達到90分以上',
        icon: '⭐',
        requirements: [
          { type: 'consecutive-high-scores', threshold: 3, minScore: 90 }
        ],
        rewards: ['解鎖完美模式'],
        rarity: 'legendary'
      },
      {
        id: 'steady-climber',
        type: 'improvement',
        title: '穩步提升',
        description: '總體技能水平提升50分',
        icon: '📈',
        requirements: [
          { type: 'overall-improvement', threshold: 50 }
        ],
        rewards: ['獲得成長軌跡圖'],
        rarity: 'rare'
      },

      // 創意成就
      {
        id: 'imagination-master',
        type: 'creativity',
        title: '想像力大師',
        description: '創作中包含10個以上創意元素',
        icon: '🌈',
        requirements: [
          { type: 'creative-elements', threshold: 10 }
        ],
        rewards: ['解鎖創意工坊'],
        rarity: 'epic'
      },
      {
        id: 'storyteller',
        type: 'creativity',
        title: '故事大王',
        description: '完成所有故事類模板',
        icon: '📚',
        requirements: [
          { type: 'template-completion', templates: ['adventure-template', 'animal-friend-template'] }
        ],
        rewards: ['獲得故事大王稱號'],
        rarity: 'legendary'
      },
      {
        id: 'color-artist',
        type: 'creativity',
        title: '色彩藝術家',
        description: '在創作中使用20種以上不同顏色',
        icon: '🎭',
        requirements: [
          { type: 'color-diversity', threshold: 20 }
        ],
        rewards: ['解鎖色彩調色板'],
        rarity: 'rare'
      },

      // 合作成就
      {
        id: 'family-team',
        type: 'collaboration',
        title: '家庭團隊',
        description: '與家長一起完成10次創作',
        icon: '👨‍👩‍👧‍👦',
        requirements: [
          { type: 'parent-collaboration', threshold: 10 }
        ],
        rewards: ['獲得家庭徽章'],
        rarity: 'rare'
      },
      {
        id: 'mentor',
        type: 'collaboration',
        title: '小導師',
        description: '幫助其他用戶改善創作',
        icon: '🎓',
        requirements: [
          { type: 'help-others', threshold: 5 }
        ],
        rewards: ['獲得導師權限'],
        rarity: 'epic'
      },

      // 模板完成成就
      {
        id: 'first-steps',
        type: 'milestone',
        title: '第一步',
        description: '完成第一個模板',
        icon: '👶',
        requirements: [
          { type: 'template-completion', templates: ['any'] }
        ],
        rewards: ['解鎖進階模板'],
        rarity: 'common'
      },
      {
        id: 'template-explorer',
        type: 'milestone',
        title: '模板探索者',
        description: '嘗試所有三個基礎模板',
        icon: '🗺️',
        requirements: [
          { type: 'template-completion', templates: ['daily-life-template', 'adventure-template', 'animal-friend-template'] }
        ],
        rewards: ['獲得探索者稱號', '解鎖隱藏模板'],
        rarity: 'legendary'
      },
      {
        id: 'master-creator',
        type: 'milestone',
        title: '創作大師',
        description: '完成100次創作',
        icon: '🏆',
        requirements: [
          { type: 'total-attempts', threshold: 100 }
        ],
        rewards: ['獲得大師稱號', '解鎖專屬模板'],
        rarity: 'legendary'
      }
    ];

    definitions.forEach(def => {
      this.achievementDefinitions.set(def.id, def);
    });
  }

  // ===== 成就檢查方法 =====

  /**
   * 檢查用戶成就
   */
  async checkAchievements(
    userId: string, 
    skillProgress: SkillProgress[], 
    attempts: AttemptRecord[],
    completedTemplates: string[]
  ): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const existingAchievements = this.achievements.get(userId) || [];
    const existingIds = new Set(existingAchievements.map(a => a.id));

    for (const [id, definition] of this.achievementDefinitions.entries()) {
      // 跳過已獲得的成就
      if (existingIds.has(id)) continue;

      // 檢查是否滿足要求
      if (await this.checkRequirements(definition, skillProgress, attempts, completedTemplates)) {
        const achievement: Achievement = {
          id,
          type: definition.type,
          title: definition.title,
          description: definition.description,
          unlockedAt: new Date(),
          requirements: definition.requirements.map(req => ({
            type: req.type,
            threshold: req.threshold || 0,
            timeframe: req.timeframe
          }))
        };
        
        newAchievements.push(achievement);
      }
    }

    // 儲存新成就
    if (newAchievements.length > 0) {
      const allAchievements = [...existingAchievements, ...newAchievements];
      this.achievements.set(userId, allAchievements);
    }

    return newAchievements;
  }

  /**
   * 檢查成就要求
   */
  private async checkRequirements(
    definition: AchievementDefinition,
    skillProgress: SkillProgress[],
    attempts: AttemptRecord[],
    completedTemplates: string[]
  ): Promise<boolean> {
    for (const requirement of definition.requirements) {
      if (!await this.checkSingleRequirement(requirement, skillProgress, attempts, completedTemplates)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 檢查單個要求
   */
  private async checkSingleRequirement(
    requirement: AchievementRequirement,
    skillProgress: SkillProgress[],
    attempts: AttemptRecord[],
    completedTemplates: string[]
  ): Promise<boolean> {
    switch (requirement.type) {
      case 'skill-level':
        const skill = skillProgress.find(sp => sp.skill === requirement.skill);
        return skill ? skill.currentLevel >= requirement.threshold : false;

      case 'consecutive-days':
        return this.checkConsecutiveDays(attempts, requirement.threshold);

      case 'attempts-per-week':
        return this.checkAttemptsPerWeek(attempts, requirement.threshold);

      case 'score-improvement':
        return this.checkScoreImprovement(attempts, requirement.threshold);

      case 'consecutive-high-scores':
        return this.checkConsecutiveHighScores(attempts, requirement.threshold, requirement.minScore || 90);

      case 'overall-improvement':
        return this.checkOverallImprovement(attempts, requirement.threshold);

      case 'creative-elements':
        return this.checkCreativeElements(attempts, requirement.threshold);

      case 'template-completion':
        if (requirement.templates?.includes('any')) {
          return completedTemplates.length > 0;
        }
        return requirement.templates?.every(template => completedTemplates.includes(template)) || false;

      case 'total-attempts':
        return attempts.length >= requirement.threshold;

      case 'color-diversity':
        return this.checkColorDiversity(attempts, requirement.threshold);

      case 'parent-collaboration':
        return this.checkParentCollaboration(attempts, requirement.threshold);

      case 'help-others':
        // 這個需要額外的資料追蹤
        return false;

      default:
        return false;
    }
  }

  // ===== 具體檢查方法 =====

  private checkConsecutiveDays(attempts: AttemptRecord[], threshold: number): boolean {
    if (attempts.length === 0) return false;

    const dates = [...new Set(attempts.map(a => a.timestamp.toDateString()))].sort();
    let consecutive = 1;
    let maxConsecutive = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        consecutive++;
        maxConsecutive = Math.max(maxConsecutive, consecutive);
      } else {
        consecutive = 1;
      }
    }

    return maxConsecutive >= threshold;
  }

  private checkAttemptsPerWeek(attempts: AttemptRecord[], threshold: number): boolean {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentAttempts = attempts.filter(a => a.timestamp >= oneWeekAgo);
    return recentAttempts.length >= threshold;
  }

  private checkScoreImprovement(attempts: AttemptRecord[], threshold: number): boolean {
    if (attempts.length < 2) return false;

    for (let i = 1; i < attempts.length; i++) {
      const improvement = attempts[i].score - attempts[i - 1].score;
      if (improvement >= threshold) return true;
    }
    return false;
  }

  private checkConsecutiveHighScores(attempts: AttemptRecord[], count: number, minScore: number): boolean {
    if (attempts.length < count) return false;

    const recentAttempts = attempts.slice(-count);
    return recentAttempts.every(a => a.score >= minScore);
  }

  private checkOverallImprovement(attempts: AttemptRecord[], threshold: number): boolean {
    if (attempts.length < 2) return false;

    const firstFew = attempts.slice(0, 3);
    const lastFew = attempts.slice(-3);

    const firstAvg = firstFew.reduce((sum, a) => sum + a.score, 0) / firstFew.length;
    const lastAvg = lastFew.reduce((sum, a) => sum + a.score, 0) / lastFew.length;

    return (lastAvg - firstAvg) >= threshold;
  }

  private checkCreativeElements(attempts: AttemptRecord[], threshold: number): boolean {
    const creativeKeywords = [
      '魔法', '彩虹', '閃亮', '夢幻', '神奇', '美麗', '奇幻', '童話',
      '仙境', '星星', '月亮', '太陽', '花朵', '蝴蝶', '天使', '精靈'
    ];

    let totalCreativeElements = 0;
    for (const attempt of attempts) {
      const text = attempt.prompt.toLowerCase();
      const elementCount = creativeKeywords.reduce((count, keyword) => {
        return count + (text.includes(keyword) ? 1 : 0);
      }, 0);
      totalCreativeElements += elementCount;
    }

    return totalCreativeElements >= threshold;
  }

  private checkColorDiversity(attempts: AttemptRecord[], threshold: number): boolean {
    const colorKeywords = [
      '紅色', '藍色', '綠色', '黃色', '紫色', '橙色', '粉色', '黑色', '白色',
      '金色', '銀色', '棕色', '灰色', '彩虹', '七彩', '五彩', '多彩'
    ];

    const uniqueColors = new Set<string>();
    for (const attempt of attempts) {
      const text = attempt.prompt.toLowerCase();
      colorKeywords.forEach(color => {
        if (text.includes(color)) {
          uniqueColors.add(color);
        }
      });
    }

    return uniqueColors.size >= threshold;
  }

  private checkParentCollaboration(attempts: AttemptRecord[], threshold: number): boolean {
    // 這裡需要額外的資料來追蹤家長參與
    // 暫時基於時間長度來推測（較長時間可能代表有家長參與）
    const collaborativeAttempts = attempts.filter(a => a.timeSpent > 180); // 超過3分鐘
    return collaborativeAttempts.length >= threshold;
  }

  // ===== 成就查詢方法 =====

  /**
   * 獲取用戶成就
   */
  getUserAchievements(userId: string): Achievement[] {
    return this.achievements.get(userId) || [];
  }

  /**
   * 獲取成就定義
   */
  getAchievementDefinition(achievementId: string): AchievementDefinition | null {
    return this.achievementDefinitions.get(achievementId) || null;
  }

  /**
   * 獲取所有成就定義
   */
  getAllAchievementDefinitions(): AchievementDefinition[] {
    return Array.from(this.achievementDefinitions.values());
  }

  /**
   * 獲取按稀有度分類的成就
   */
  getAchievementsByRarity(rarity: AchievementRarity): AchievementDefinition[] {
    return Array.from(this.achievementDefinitions.values())
      .filter(def => def.rarity === rarity);
  }

  /**
   * 獲取成就進度
   */
  getAchievementProgress(
    userId: string,
    skillProgress: SkillProgress[],
    attempts: AttemptRecord[],
    completedTemplates: string[]
  ): AchievementProgress[] {
    const progress: AchievementProgress[] = [];
    const existingAchievements = this.achievements.get(userId) || [];
    const achievedIds = new Set(existingAchievements.map(a => a.id));

    for (const [id, definition] of this.achievementDefinitions.entries()) {
      if (achievedIds.has(id)) {
        progress.push({
          achievementId: id,
          definition,
          completed: true,
          progress: 100,
          currentValue: definition.requirements[0]?.threshold || 0,
          targetValue: definition.requirements[0]?.threshold || 0
        });
      } else {
        const progressData = this.calculateProgress(definition, skillProgress, attempts, completedTemplates);
        progress.push({
          achievementId: id,
          definition,
          completed: false,
          progress: progressData.percentage,
          currentValue: progressData.current,
          targetValue: progressData.target
        });
      }
    }

    return progress.sort((a, b) => b.progress - a.progress);
  }

  /**
   * 計算成就進度
   */
  private calculateProgress(
    definition: AchievementDefinition,
    skillProgress: SkillProgress[],
    attempts: AttemptRecord[],
    completedTemplates: string[]
  ): { percentage: number; current: number; target: number } {
    // 簡化：只計算第一個要求的進度
    const requirement = definition.requirements[0];
    if (!requirement) return { percentage: 0, current: 0, target: 1 };

    let current = 0;
    let target = requirement.threshold;

    switch (requirement.type) {
      case 'skill-level':
        const skill = skillProgress.find(sp => sp.skill === requirement.skill);
        current = skill ? skill.currentLevel : 0;
        break;

      case 'total-attempts':
        current = attempts.length;
        break;

      case 'template-completion':
        if (requirement.templates?.includes('any')) {
          current = completedTemplates.length > 0 ? 1 : 0;
          target = 1;
        } else {
          const completed = requirement.templates?.filter(t => completedTemplates.includes(t)).length || 0;
          current = completed;
          target = requirement.templates?.length || 1;
        }
        break;

      case 'consecutive-high-scores':
        const recentAttempts = attempts.slice(-requirement.threshold);
        current = recentAttempts.filter(a => a.score >= (requirement.minScore || 90)).length;
        break;

      default:
        // 其他類型的進度計算
        current = 0;
    }

    const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    return { percentage, current, target };
  }
}

// ===== 介面定義 =====

export interface AchievementDefinition {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  requirements: AchievementRequirement[];
  rewards: string[];
  rarity: AchievementRarity;
}

export interface AchievementRequirement {
  type: string;
  threshold: number;
  skill?: string;
  templates?: string[];
  timeframe?: string;
  minScore?: number;
}

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementProgress {
  achievementId: string;
  definition: AchievementDefinition;
  completed: boolean;
  progress: number; // 0-100
  currentValue: number;
  targetValue: number;
}

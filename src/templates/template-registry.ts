/**
 * 模板註冊中心
 * 階段4：三大模板實作 - 模板註冊與管理
 */

import { TemplateConfig } from '@/types/template';
import { dailyLifeTemplate } from './daily-life/config';
import { adventureTemplate } from './adventure/config';
import { animalFriendTemplate } from './animal-friend/config';

export class TemplateRegistry {
  private static instance: TemplateRegistry;
  private templates = new Map<string, TemplateConfig>();
  private templateCategories = new Map<string, string[]>();

  private constructor() {
    this.initializeDefaultTemplates();
  }

  public static getInstance(): TemplateRegistry {
    if (!TemplateRegistry.instance) {
      TemplateRegistry.instance = new TemplateRegistry();
    }
    return TemplateRegistry.instance;
  }

  /**
   * 初始化預設模板
   */
  private initializeDefaultTemplates(): void {
    // 註冊三大核心模板
    this.registerTemplate(dailyLifeTemplate);
    this.registerTemplate(adventureTemplate);
    this.registerTemplate(animalFriendTemplate);

    // 建立分類索引
    this.buildCategoryIndex();
  }

  /**
   * 註冊模板
   */
  registerTemplate(template: TemplateConfig): void {
    // 驗證模板配置
    this.validateTemplate(template);
    
    // 儲存模板
    this.templates.set(template.metadata.id, template);
    
    // 更新分類索引
    this.updateCategoryIndex(template);
  }

  /**
   * 獲取模板
   */
  getTemplate(templateId: string): TemplateConfig | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * 獲取所有模板
   */
  getAllTemplates(): TemplateConfig[] {
    return Array.from(this.templates.values());
  }

  /**
   * 按分類獲取模板
   */
  getTemplatesByCategory(category: string): TemplateConfig[] {
    const templateIds = this.templateCategories.get(category) || [];
    return templateIds
      .map(id => this.templates.get(id))
      .filter(template => template !== undefined) as TemplateConfig[];
  }

  /**
   * 按難度獲取模板
   */
  getTemplatesByLevel(level: 'beginner' | 'intermediate' | 'advanced'): TemplateConfig[] {
    return Array.from(this.templates.values())
      .filter(template => template.metadata.level === level);
  }

  /**
   * 獲取推薦學習路徑
   */
  getRecommendedLearningPath(): TemplateConfig[] {
    // 按設計的學習順序返回
    return [
      this.templates.get('daily-life-template'),
      this.templates.get('adventure-template'),
      this.templates.get('animal-friend-template')
    ].filter(template => template !== undefined) as TemplateConfig[];
  }

  /**
   * 獲取適合年齡的模板
   */
  getTemplatesForAge(age: number): TemplateConfig[] {
    return Array.from(this.templates.values())
      .filter(template => 
        age >= template.metadata.targetAge.min && 
        age <= template.metadata.targetAge.max
      );
  }

  /**
   * 搜尋模板
   */
  searchTemplates(query: string): TemplateConfig[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.templates.values())
      .filter(template => 
        template.metadata.name.toLowerCase().includes(lowercaseQuery) ||
        template.metadata.description.toLowerCase().includes(lowercaseQuery) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
  }

  /**
   * 獲取模板統計資訊
   */
  getTemplateStats(): TemplateStats {
    const templates = Array.from(this.templates.values());
    
    return {
      totalTemplates: templates.length,
      byLevel: {
        beginner: templates.filter(t => t.metadata.level === 'beginner').length,
        intermediate: templates.filter(t => t.metadata.level === 'intermediate').length,
        advanced: templates.filter(t => t.metadata.level === 'advanced').length
      },
      byCategory: {
        'daily-life': templates.filter(t => t.metadata.category === 'daily-life').length,
        'adventure': templates.filter(t => t.metadata.category === 'adventure').length,
        'animal-friend': templates.filter(t => t.metadata.category === 'animal-friend').length,
        'custom': templates.filter(t => t.metadata.category === 'custom').length
      },
      averageDuration: templates.reduce((sum, t) => sum + t.metadata.estimatedDuration, 0) / templates.length,
      ageRange: {
        min: Math.min(...templates.map(t => t.metadata.targetAge.min)),
        max: Math.max(...templates.map(t => t.metadata.targetAge.max))
      }
    };
  }

  /**
   * 建立分類索引
   */
  private buildCategoryIndex(): void {
    this.templateCategories.clear();
    
    for (const template of this.templates.values()) {
      this.updateCategoryIndex(template);
    }
  }

  /**
   * 更新分類索引
   */
  private updateCategoryIndex(template: TemplateConfig): void {
    const category = template.metadata.category;
    if (!this.templateCategories.has(category)) {
      this.templateCategories.set(category, []);
    }
    
    const templateIds = this.templateCategories.get(category)!;
    if (!templateIds.includes(template.metadata.id)) {
      templateIds.push(template.metadata.id);
    }
  }

  /**
   * 驗證模板配置
   */
  private validateTemplate(template: TemplateConfig): void {
    if (!template.metadata.id) {
      throw new Error('Template ID is required');
    }
    
    if (!template.metadata.name) {
      throw new Error('Template name is required');
    }
    
    if (!template.stages || template.stages.length === 0) {
      throw new Error('Template must have at least one stage');
    }
    
    // 驗證階段順序
    const orders = template.stages.map(stage => stage.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new Error('Stage orders must be unique');
    }
    
    // 驗證必要階段
    const hasRequiredStage = template.stages.some(stage => stage.isRequired);
    if (!hasRequiredStage) {
      throw new Error('Template must have at least one required stage');
    }
  }

  /**
   * 移除模板
   */
  removeTemplate(templateId: string): boolean {
    const template = this.templates.get(templateId);
    if (!template) {
      return false;
    }
    
    // 從模板映射中移除
    this.templates.delete(templateId);
    
    // 從分類索引中移除
    const category = template.metadata.category;
    const templateIds = this.templateCategories.get(category);
    if (templateIds) {
      const index = templateIds.indexOf(templateId);
      if (index > -1) {
        templateIds.splice(index, 1);
      }
    }
    
    return true;
  }

  /**
   * 更新模板
   */
  updateTemplate(templateId: string, updates: Partial<TemplateConfig>): boolean {
    const existingTemplate = this.templates.get(templateId);
    if (!existingTemplate) {
      return false;
    }
    
    // 合併更新
    const updatedTemplate = {
      ...existingTemplate,
      ...updates,
      metadata: {
        ...existingTemplate.metadata,
        ...updates.metadata
      }
    };
    
    // 驗證更新後的模板
    this.validateTemplate(updatedTemplate);
    
    // 儲存更新
    this.templates.set(templateId, updatedTemplate);
    
    // 更新分類索引（如果分類改變）
    if (updates.metadata?.category && updates.metadata.category !== existingTemplate.metadata.category) {
      this.buildCategoryIndex();
    }
    
    return true;
  }

  /**
   * 複製模板
   */
  cloneTemplate(templateId: string, newId: string, newName: string): TemplateConfig | null {
    const originalTemplate = this.templates.get(templateId);
    if (!originalTemplate) {
      return null;
    }
    
    const clonedTemplate: TemplateConfig = {
      ...JSON.parse(JSON.stringify(originalTemplate)), // 深度複製
      metadata: {
        ...originalTemplate.metadata,
        id: newId,
        name: newName,
        version: '1.0.0' // 重置版本
      }
    };
    
    this.registerTemplate(clonedTemplate);
    return clonedTemplate;
  }

  /**
   * 匯出模板配置
   */
  exportTemplate(templateId: string): string | null {
    const template = this.templates.get(templateId);
    if (!template) {
      return null;
    }
    
    return JSON.stringify(template, null, 2);
  }

  /**
   * 匯入模板配置
   */
  importTemplate(templateJson: string): boolean {
    try {
      const template = JSON.parse(templateJson) as TemplateConfig;
      this.registerTemplate(template);
      return true;
    } catch (error) {
      console.error('Failed to import template:', error);
      return false;
    }
  }

  /**
   * 獲取模板相依性
   */
  getTemplateDependencies(templateId: string): string[] {
    const template = this.templates.get(templateId);
    if (!template) {
      return [];
    }
    
    // 基於難度級別的建議順序
    const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    const currentLevel = levelOrder[template.metadata.level];
    
    return Array.from(this.templates.values())
      .filter(t => levelOrder[t.metadata.level] < currentLevel)
      .map(t => t.metadata.id);
  }

  /**
   * 清除所有模板
   */
  clearAll(): void {
    this.templates.clear();
    this.templateCategories.clear();
  }

  /**
   * 重新載入預設模板
   */
  reloadDefaults(): void {
    this.clearAll();
    this.initializeDefaultTemplates();
  }
}

// 模板統計介面
export interface TemplateStats {
  totalTemplates: number;
  byLevel: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  byCategory: {
    'daily-life': number;
    'adventure': number;
    'animal-friend': number;
    'custom': number;
  };
  averageDuration: number;
  ageRange: {
    min: number;
    max: number;
  };
}

// 匯出單例實例
export const templateRegistry = TemplateRegistry.getInstance();

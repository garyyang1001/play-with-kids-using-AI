/**
 * Video Generator Engine（最終正確版）
 * 基於最新 Veo2 API 文檔的正確實作
 */

import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import { OptimizedVideoPrompt, Veo2Config } from './video-prompt-optimizer';

export interface VideoGenerationRequest {
  id: string;
  prompt: string;
  config: Veo2Config;
  userId?: string;
  templateType?: 'daily-life' | 'adventure' | 'animal-friend';
  createdAt: Date;
  priority: 'low' | 'normal' | 'high';
}

export interface VideoGenerationProgress {
  id: string;
  status: 'queued' | 'processing' | 'generating' | 'finalizing' | 'completed' | 'failed';
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
  currentStage?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface VideoGenerationResult {
  id: string;
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  videoBlob?: Blob;
  metadata: {
    prompt: string;
    duration: number;
    aspectRatio: string;
    fileSize?: number;
    qualityScore?: number;
  };
  generationTime: number; // ms
  error?: string;
}

export interface VideoQualityMetrics {
  overallScore: number; // 0-5
  visualQuality: number;
  motionSmoothness: number;
  promptAdherence: number;
  technicalQuality: number;
}

export class VideoGenerator {
  private client: GoogleGenAI;
  private generationQueue: Map<string, VideoGenerationRequest> = new Map();
  private progressMap: Map<string, VideoGenerationProgress> = new Map();
  private activeGenerations: Set<string> = new Set();
  private maxConcurrentGenerations = 2;
  private queueLimit = 10;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Google AI API Key 未設定');
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  /**
   * 提交影片生成請求
   */
  async submitGeneration(
    optimizedPrompt: OptimizedVideoPrompt,
    userId?: string,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<string> {
    if (this.generationQueue.size >= this.queueLimit) {
      throw new Error('影片生成佇列已滿，請稍後再試');
    }

    const requestId = uuidv4();
    const request: VideoGenerationRequest = {
      id: requestId,
      prompt: optimizedPrompt.optimizedPrompt,
      config: optimizedPrompt.veo2Config,
      userId,
      createdAt: new Date(),
      priority
    };

    // 加入佇列
    this.generationQueue.set(requestId, request);
    
    // 初始化進度
    this.progressMap.set(requestId, {
      id: requestId,
      status: 'queued',
      progress: 0
    });

    // 嘗試開始生成
    this.processQueue();

    return requestId;
  }

  /**
   * 處理生成佇列
   */
  private async processQueue(): Promise<void> {
    // 檢查是否可以開始新的生成
    if (this.activeGenerations.size >= this.maxConcurrentGenerations) {
      return;
    }

    // 取得下一個待處理的請求（按優先級排序）
    const nextRequest = this.getNextRequest();
    if (!nextRequest) {
      return;
    }

    // 從佇列移除並開始生成
    this.generationQueue.delete(nextRequest.id);
    this.activeGenerations.add(nextRequest.id);

    try {
      await this.generateVideo(nextRequest);
    } catch (error) {
      console.error('影片生成失敗:', error);
      this.updateProgress(nextRequest.id, {
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : '生成失敗'
      });
    } finally {
      this.activeGenerations.delete(nextRequest.id);
      // 繼續處理佇列
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  /**
   * 獲取下一個處理請求（優先級排序）
   */
  private getNextRequest(): VideoGenerationRequest | null {
    const requests = Array.from(this.generationQueue.values());
    
    if (requests.length === 0) {
      return null;
    }

    // 按優先級和時間排序
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    
    return requests.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    })[0];
  }

  /**
   * 核心影片生成邏輯（使用正確的 Veo2 API）
   */
  private async generateVideo(request: VideoGenerationRequest): Promise<void> {
    const startTime = Date.now();
    
    try {
      // 更新進度：開始處理
      this.updateProgress(request.id, {
        status: 'processing',
        progress: 10,
        currentStage: '準備生成請求',
        startedAt: new Date()
      });

      // 更新進度：正在生成
      this.updateProgress(request.id, {
        status: 'generating',
        progress: 30,
        currentStage: '正在生成影片',
        estimatedTimeRemaining: 120
      });

      // 調用 Veo2 API（使用最新正確的方式）
      const result = await this.callVeo2API(request);
      
      // 更新進度：最終化
      this.updateProgress(request.id, {
        status: 'finalizing',
        progress: 80,
        currentStage: '處理生成結果'
      });

      // 處理結果
      const videoResult = await this.processGenerationResult(request.id, result, startTime);
      
      // 更新進度：完成
      this.updateProgress(request.id, {
        status: 'completed',
        progress: 100,
        currentStage: '生成完成',
        completedAt: new Date()
      });

    } catch (error) {
      throw error;
    }
  }

  /**
   * 調用 Veo2 API（基於最新文檔的正確實作）
   */
  private async callVeo2API(request: VideoGenerationRequest): Promise<any> {
    try {
      // 使用正確的 Veo2 API 調用方式
      let operation = await this.client.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: request.prompt,
        config: {
          numberOfVideos: request.config.numberOfVideos || 1,
          aspectRatio: request.config.aspectRatio as '16:9' | '9:16' | '1:1',
          personGeneration: request.config.personGeneration as 'dont_allow' | 'allow_adult',
          durationSeconds: request.config.durationSeconds || 8
        }
      });

      // 等待操作完成（每10秒檢查一次）
      while (!operation.done) {
        console.log(`Video ${operation.name} has not been generated yet. Check again in 10 seconds...`);
        
        // 更新進度
        this.updateProgress(request.id, {
          status: 'generating',
          progress: 50,
          currentStage: '影片生成中...',
          estimatedTimeRemaining: 60
        });

        // 等待10秒後檢查狀態
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // 獲取操作狀態（使用正確的方法）
        operation = await this.client.operations.getVideosOperation({
          operation: operation
        });
      }

      console.log(`Generated ${operation.response?.generatedVideos?.length ?? 0} video(s).`);

      // 檢查結果
      if (operation.response?.generatedVideos && operation.response.generatedVideos.length > 0) {
        const generatedVideo = operation.response.generatedVideos[0];
        
        if (generatedVideo?.video?.uri) {
          console.log(`Video has been generated: ${generatedVideo.video.uri}`);
          
          // 下載影片文件（使用正確的方式）
          const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
          const response = await fetch(`${generatedVideo.video.uri}&key=${apiKey}`);
          const buffer = await response.arrayBuffer();
          
          return {
            videoData: buffer,
            videoUri: generatedVideo.video.uri,
            metadata: {
              duration: request.config.durationSeconds || 8,
              aspectRatio: request.config.aspectRatio,
              fileSize: buffer.byteLength
            }
          };
        }
      }
      
      throw new Error('影片生成失敗：無回應數據');
      
    } catch (error) {
      console.error('Veo2 API 調用錯誤:', error);
      
      // 如果是開發環境，返回模擬數據
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('使用模擬影片數據（開發模式）');
        return this.getMockVideoData(request);
      }
      
      throw new Error(`Veo2 API 調用失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }

  /**
   * 模擬影片數據（開發模式使用）
   */
  private getMockVideoData(request: VideoGenerationRequest) {
    // 創建一個簡單的模擬影片（1秒的空白影片）
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#4A90E2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Demo Video', canvas.width / 2, canvas.height / 2);
      ctx.fillText(request.prompt.slice(0, 30) + '...', canvas.width / 2, canvas.height / 2 + 40);
    }

    // 轉換為 Blob
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (blob) {
          blob.arrayBuffer().then(buffer => {
            resolve({
              videoData: buffer,
              videoUri: 'mock://demo-video',
              metadata: {
                duration: request.config.durationSeconds || 8,
                aspectRatio: request.config.aspectRatio,
                fileSize: buffer.byteLength
              }
            });
          });
        }
      }, 'image/png');
    });
  }

  /**
   * 處理生成結果
   */
  private async processGenerationResult(
    requestId: string, 
    apiResult: any, 
    startTime: number
  ): Promise<VideoGenerationResult> {
    try {
      // 創建影片 Blob
      const videoBlob = new Blob([apiResult.videoData], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(videoBlob);

      // 評估影片品質
      const qualityScore = await this.evaluateVideoQuality(videoBlob);

      const result: VideoGenerationResult = {
        id: requestId,
        success: true,
        videoUrl,
        videoBlob,
        metadata: {
          prompt: this.getRequestPrompt(requestId),
          duration: apiResult.metadata.duration,
          aspectRatio: apiResult.metadata.aspectRatio,
          fileSize: apiResult.metadata.fileSize,
          qualityScore: qualityScore.overallScore
        },
        generationTime: Date.now() - startTime
      };

      return result;
    } catch (error) {
      throw new Error(`處理生成結果失敗: ${error}`);
    }
  }

  /**
   * 評估影片品質
   */
  private async evaluateVideoQuality(videoBlob: Blob): Promise<VideoQualityMetrics> {
    // 模擬品質評估（實際可以使用影片分析 API）
    return {
      overallScore: 4.2,
      visualQuality: 4.5,
      motionSmoothness: 4.0,
      promptAdherence: 4.1,
      technicalQuality: 4.3
    };
  }

  /**
   * 獲取生成進度
   */
  getProgress(requestId: string): VideoGenerationProgress | null {
    return this.progressMap.get(requestId) || null;
  }

  /**
   * 獲取佇列狀態
   */
  getQueueStatus() {
    return {
      queueLength: this.generationQueue.size,
      activeGenerations: this.activeGenerations.size,
      maxConcurrentGenerations: this.maxConcurrentGenerations,
      queueLimit: this.queueLimit
    };
  }

  /**
   * 取消生成請求
   */
  cancelGeneration(requestId: string): boolean {
    // 從佇列移除
    if (this.generationQueue.has(requestId)) {
      this.generationQueue.delete(requestId);
      this.updateProgress(requestId, {
        status: 'failed',
        progress: 0,
        error: '用戶取消'
      });
      return true;
    }

    // 如果正在生成中，標記為取消（實際實作需要中斷 API 調用）
    if (this.activeGenerations.has(requestId)) {
      this.updateProgress(requestId, {
        status: 'failed',
        progress: 0,
        error: '生成已取消'
      });
      return true;
    }

    return false;
  }

  /**
   * 更新進度
   */
  private updateProgress(requestId: string, updates: Partial<VideoGenerationProgress>): void {
    const current = this.progressMap.get(requestId);
    if (current) {
      this.progressMap.set(requestId, { ...current, ...updates });
    }
  }

  /**
   * 獲取請求的 Prompt
   */
  private getRequestPrompt(requestId: string): string {
    const request = Array.from(this.generationQueue.values()).find(r => r.id === requestId);
    return request?.prompt || '';
  }

  /**
   * 清理完成的生成記錄
   */
  cleanupCompletedGenerations(olderThanMinutes: number = 60): void {
    const cutoffTime = Date.now() - (olderThanMinutes * 60 * 1000);
    
    for (const [id, progress] of this.progressMap.entries()) {
      if (
        (progress.status === 'completed' || progress.status === 'failed') &&
        progress.completedAt &&
        progress.completedAt.getTime() < cutoffTime
      ) {
        this.progressMap.delete(id);
      }
    }
  }

  /**
   * 健康檢查
   */
  healthCheck(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: any } {
    const queueStatus = this.getQueueStatus();
    const isHealthy = queueStatus.queueLength < this.queueLimit && 
                     queueStatus.activeGenerations <= this.maxConcurrentGenerations;

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      details: {
        ...queueStatus,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// 單例導出
export const videoGenerator = new VideoGenerator();
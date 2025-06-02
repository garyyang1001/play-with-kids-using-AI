/**
 * WebSocket 連接穩定性測試工具
 * 用於驗證階段1的語音連接品質
 */

import { VoiceAIClient } from './voice-ai-client';
import { VoiceAIConfig, VoiceConnectionState } from './types/voice';

export interface StabilityTestConfig {
  testDuration: number; // 測試持續時間（毫秒）
  reconnectTestEnabled: boolean;
  latencyTestEnabled: boolean;
  audioQualityTestEnabled: boolean;
  reportInterval: number; // 報告間隔（毫秒）
}

export interface StabilityTestResult {
  testName: string;
  startTime: number;
  endTime: number;
  totalDuration: number;
  
  // 連接穩定性
  connectionSuccessRate: number;
  reconnectAttempts: number;
  totalDisconnections: number;
  averageConnectionTime: number;
  
  // 延遲測試
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
  latencyStandardDeviation: number;
  
  // 音訊品質
  audioDropouts: number;
  audioQualityScore: number;
  
  // 整體評分
  overallScore: number;
  passed: boolean;
  recommendations: string[];
}

export class VoiceConnectionStabilityTester {
  private client: VoiceAIClient;
  private config: StabilityTestConfig;
  private testResults: Partial<StabilityTestResult> = {};
  private testStartTime: number = 0;
  private latencyMeasurements: number[] = [];
  private connectionEvents: Array<{ event: string; timestamp: number }> = [];
  private isTestRunning = false;

  constructor(voiceConfig: VoiceAIConfig, testConfig: StabilityTestConfig) {
    this.client = new VoiceAIClient(voiceConfig);
    this.config = testConfig;
    this.setupEventListeners();
  }

  /**
   * 設置事件監聽器
   */
  private setupEventListeners(): void {
    this.client.on('connectionStateChange', (state: VoiceConnectionState) => {
      this.recordConnectionEvent(`connection_state_${state}`, Date.now());
    });

    this.client.on('voiceInteraction', (event) => {
      if (event.type === 'ai_response_start') {
        const latency = Date.now() - event.timestamp;
        this.latencyMeasurements.push(latency);
      }
    });

    this.client.on('sessionStatsUpdate', (stats) => {
      this.testResults.audioQualityScore = stats.qualityScore;
    });
  }

  /**
   * 記錄連接事件
   */
  private recordConnectionEvent(event: string, timestamp: number): void {
    this.connectionEvents.push({ event, timestamp });
    console.log(`[StabilityTest] ${event} at ${new Date(timestamp).toISOString()}`);
  }

  /**
   * 執行完整穩定性測試
   */
  async runFullStabilityTest(): Promise<StabilityTestResult> {
    console.log('[StabilityTest] 開始連接穩定性測試');
    
    this.initializeTest();
    
    try {
      // 1. 基本連接測試
      await this.testBasicConnection();
      
      // 2. 延遲測試
      if (this.config.latencyTestEnabled) {
        await this.testLatency();
      }
      
      // 3. 重連測試
      if (this.config.reconnectTestEnabled) {
        await this.testReconnection();
      }
      
      // 4. 長時間穩定性測試
      await this.testLongTermStability();
      
      // 5. 音訊品質測試
      if (this.config.audioQualityTestEnabled) {
        await this.testAudioQuality();
      }
      
    } catch (error) {
      console.error('[StabilityTest] 測試執行錯誤:', error);
    } finally {
      this.client.disconnect();
      this.isTestRunning = false;
    }
    
    return this.generateTestReport();
  }

  /**
   * 初始化測試
   */
  private initializeTest(): void {
    this.testStartTime = Date.now();
    this.latencyMeasurements = [];
    this.connectionEvents = [];
    this.isTestRunning = true;
    
    this.testResults = {
      testName: 'VoiceAI 連接穩定性測試',
      startTime: this.testStartTime
    };
  }

  /**
   * 測試基本連接
   */
  private async testBasicConnection(): Promise<void> {
    console.log('[StabilityTest] 測試基本連接...');
    
    const connectionStartTime = Date.now();
    
    try {
      await this.client.connect();
      const connectionTime = Date.now() - connectionStartTime;
      
      this.testResults.averageConnectionTime = connectionTime;
      this.recordConnectionEvent('basic_connection_success', Date.now());
      
      // 等待一段時間確保連接穩定
      await this.sleep(2000);
      
    } catch (error) {
      this.recordConnectionEvent('basic_connection_failed', Date.now());
      throw error;
    }
  }

  /**
   * 測試延遲
   */
  private async testLatency(): Promise<void> {
    console.log('[StabilityTest] 測試延遲...');
    
    const testMessages = [
      '你好',
      '今天天氣怎麼樣',
      '請幫我描述一個美麗的花園',
      '小朋友在公園玩耍'
    ];
    
    for (const message of testMessages) {
      const startTime = Date.now();
      
      // 發送測試訊息並等待回應
      this.client.sendTextMessage(message);
      
      // 等待AI回應
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 5000);
        
        this.client.once('voiceInteraction', (event) => {
          if (event.type === 'ai_response_start') {
            clearTimeout(timeout);
            const latency = Date.now() - startTime;
            this.latencyMeasurements.push(latency);
            resolve();
          }
        });
      });
      
      await this.sleep(1000); // 間隔1秒
    }
  }

  /**
   * 測試重連功能
   */
  private async testReconnection(): Promise<void> {
    console.log('[StabilityTest] 測試重連功能...');
    
    // 故意斷開連接
    this.client.disconnect();
    await this.sleep(1000);
    
    // 嘗試重新連接
    try {
      await this.client.connect();
      this.recordConnectionEvent('reconnection_success', Date.now());
    } catch (error) {
      this.recordConnectionEvent('reconnection_failed', Date.now());
    }
  }

  /**
   * 測試長時間穩定性
   */
  private async testLongTermStability(): Promise<void> {
    console.log('[StabilityTest] 測試長時間穩定性...');
    
    const startTime = Date.now();
    const endTime = startTime + this.config.testDuration;
    
    while (Date.now() < endTime && this.isTestRunning) {
      // 定期檢查連接狀態
      if (!this.client.isConnected) {
        this.recordConnectionEvent('unexpected_disconnection', Date.now());
      }
      
      // 發送心跳訊息
      if (Date.now() % 10000 < 1000) { // 每10秒
        this.client.sendTextMessage('心跳測試');
      }
      
      await this.sleep(1000);
    }
  }

  /**
   * 測試音訊品質
   */
  private async testAudioQuality(): Promise<void> {
    console.log('[StabilityTest] 測試音訊品質...');
    
    // 模擬音訊輸入測試
    if (this.client.isConnected) {
      // 測試錄音功能
      this.client.startRecording();
      await this.sleep(3000);
      this.client.stopRecording();
      
      await this.sleep(2000); // 等待處理
    }
  }

  /**
   * 生成測試報告
   */
  private generateTestReport(): StabilityTestResult {
    const endTime = Date.now();
    const totalDuration = endTime - this.testStartTime;
    
    // 計算連接成功率
    const connectionAttempts = this.connectionEvents.filter(e => 
      e.event.includes('connection') && !e.event.includes('_state_')
    ).length;
    const successfulConnections = this.connectionEvents.filter(e => 
      e.event.includes('success')
    ).length;
    const connectionSuccessRate = connectionAttempts > 0 ? 
      (successfulConnections / connectionAttempts) * 100 : 0;
    
    // 計算延遲統計
    const averageLatency = this.latencyMeasurements.length > 0 ?
      this.latencyMeasurements.reduce((a, b) => a + b, 0) / this.latencyMeasurements.length : 0;
    const minLatency = this.latencyMeasurements.length > 0 ? Math.min(...this.latencyMeasurements) : 0;
    const maxLatency = this.latencyMeasurements.length > 0 ? Math.max(...this.latencyMeasurements) : 0;
    
    // 計算標準差
    const variance = this.latencyMeasurements.length > 0 ?
      this.latencyMeasurements.reduce((acc, val) => acc + Math.pow(val - averageLatency, 2), 0) / this.latencyMeasurements.length : 0;
    const latencyStandardDeviation = Math.sqrt(variance);
    
    // 計算整體評分
    const overallScore = this.calculateOverallScore({
      connectionSuccessRate,
      averageLatency,
      audioQualityScore: this.testResults.audioQualityScore || 0
    });
    
    // 生成建議
    const recommendations = this.generateRecommendations({
      connectionSuccessRate,
      averageLatency,
      latencyStandardDeviation
    });
    
    const result: StabilityTestResult = {
      testName: this.testResults.testName!,
      startTime: this.testStartTime,
      endTime,
      totalDuration,
      connectionSuccessRate,
      reconnectAttempts: this.connectionEvents.filter(e => e.event.includes('reconnection')).length,
      totalDisconnections: this.connectionEvents.filter(e => e.event.includes('disconnection')).length,
      averageConnectionTime: this.testResults.averageConnectionTime || 0,
      averageLatency,
      minLatency,
      maxLatency,
      latencyStandardDeviation,
      audioDropouts: 0, // TODO: 實際計算音訊中斷
      audioQualityScore: this.testResults.audioQualityScore || 0,
      overallScore,
      passed: overallScore >= 85, // 85分以上算通過
      recommendations
    };
    
    this.logTestReport(result);
    return result;
  }

  /**
   * 計算整體評分
   */
  private calculateOverallScore(metrics: {
    connectionSuccessRate: number;
    averageLatency: number;
    audioQualityScore: number;
  }): number {
    const connectionScore = metrics.connectionSuccessRate;
    const latencyScore = Math.max(0, 100 - (metrics.averageLatency / 20)); // 2秒內滿分
    const audioScore = metrics.audioQualityScore;
    
    return Math.round((connectionScore * 0.4 + latencyScore * 0.4 + audioScore * 0.2));
  }

  /**
   * 生成建議
   */
  private generateRecommendations(metrics: {
    connectionSuccessRate: number;
    averageLatency: number;
    latencyStandardDeviation: number;
  }): string[] {
    const recommendations: string[] = [];
    
    if (metrics.connectionSuccessRate < 95) {
      recommendations.push('連接成功率偏低，建議檢查網路連接和API金鑰');
    }
    
    if (metrics.averageLatency > 2000) {
      recommendations.push('平均延遲過高，建議優化網路環境或伺服器選擇');
    }
    
    if (metrics.latencyStandardDeviation > 1000) {
      recommendations.push('延遲變化較大，建議檢查網路穩定性');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('所有測試指標良好，系統運行穩定');
    }
    
    return recommendations;
  }

  /**
   * 記錄測試報告
   */
  private logTestReport(result: StabilityTestResult): void {
    console.log('\n=== VoiceAI 連接穩定性測試報告 ===');
    console.log(`測試時間: ${new Date(result.startTime).toLocaleString()} - ${new Date(result.endTime).toLocaleString()}`);
    console.log(`總測試時長: ${(result.totalDuration / 1000).toFixed(1)}秒`);
    console.log(`\n連接指標:`);
    console.log(`  成功率: ${result.connectionSuccessRate.toFixed(1)}%`);
    console.log(`  平均連接時間: ${result.averageConnectionTime}毫秒`);
    console.log(`  重連次數: ${result.reconnectAttempts}`);
    console.log(`\n延遲指標:`);
    console.log(`  平均延遲: ${result.averageLatency.toFixed(0)}毫秒`);
    console.log(`  最小延遲: ${result.minLatency}毫秒`);
    console.log(`  最大延遲: ${result.maxLatency}毫秒`);
    console.log(`  延遲標準差: ${result.latencyStandardDeviation.toFixed(0)}毫秒`);
    console.log(`\n音訊指標:`);
    console.log(`  品質評分: ${result.audioQualityScore.toFixed(1)}`);
    console.log(`  音訊中斷: ${result.audioDropouts}次`);
    console.log(`\n整體評分: ${result.overallScore}/100`);
    console.log(`測試結果: ${result.passed ? '✅ 通過' : '❌ 未通過'}`);
    console.log(`\n建議:`);
    result.recommendations.forEach(rec => console.log(`  • ${rec}`));
    console.log('================================\n');
  }

  /**
   * 輔助函數：延遲
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 停止測試
   */
  stopTest(): void {
    this.isTestRunning = false;
    this.client.disconnect();
  }
}

/**
 * 快速測試函數
 */
export async function runQuickStabilityTest(apiKey: string): Promise<StabilityTestResult> {
  const voiceConfig: VoiceAIConfig = {
    apiKey,
    sampleRate: 16000,
    language: 'zh-TW'
  };
  
  const testConfig: StabilityTestConfig = {
    testDuration: 30000, // 30秒
    reconnectTestEnabled: true,
    latencyTestEnabled: true,
    audioQualityTestEnabled: true,
    reportInterval: 5000
  };
  
  const tester = new VoiceConnectionStabilityTester(voiceConfig, testConfig);
  return await tester.runFullStabilityTest();
}
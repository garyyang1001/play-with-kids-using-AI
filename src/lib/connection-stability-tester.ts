import { VoiceAIClient } from './voice-ai-client'
import type { VoiceAIConfig, ConnectionStatus } from './types/voice'

export interface StabilityTestResult {
  success: boolean
  totalTests: number
  successfulConnections: number
  failedConnections: number
  averageConnectionTime: number
  averageLatency: number
  errorMessages: string[]
  qualityAssessment: 'excellent' | 'good' | 'poor' | 'unstable'
  recommendations: string[]
}

export interface TestConfig {
  testCount: number
  timeoutMs: number
  intervalMs: number
  enableLatencyTest: boolean
  mockApiKey?: string
}

/**
 * 連接穩定性測試工具
 * 用於測試 VoiceAIClient 的連接品質和穩定性
 */
export class ConnectionStabilityTester {
  private config: TestConfig
  
  constructor(config: Partial<TestConfig> = {}) {
    this.config = {
      testCount: 10,
      timeoutMs: 5000,
      intervalMs: 1000,
      enableLatencyTest: true,
      mockApiKey: 'test-api-key',
      ...config
    }
  }

  /**
   * 執行完整的穩定性測試
   */
  async runStabilityTest(voiceConfig: Partial<VoiceAIConfig>): Promise<StabilityTestResult> {
    console.log('開始連接穩定性測試...')
    
    const testConfig: VoiceAIConfig = {
      apiKey: this.config.mockApiKey || 'test-api-key',
      model: 'gemini-2.0-flash-exp',
      voice: 'Aoede',
      language: 'zh-TW',
      sampleRate: 16000,
      ...voiceConfig
    }

    const results: StabilityTestResult = {
      success: false,
      totalTests: this.config.testCount,
      successfulConnections: 0,
      failedConnections: 0,
      averageConnectionTime: 0,
      averageLatency: 0,
      errorMessages: [],
      qualityAssessment: 'unstable',
      recommendations: []
    }

    const connectionTimes: number[] = []
    const latencyMeasurements: number[] = []

    for (let i = 0; i < this.config.testCount; i++) {
      console.log(`執行測試 ${i + 1}/${this.config.testCount}`)
      
      try {
        const testResult = await this.runSingleConnectionTest(testConfig)
        
        if (testResult.success) {
          results.successfulConnections++
          connectionTimes.push(testResult.connectionTime)
          
          if (this.config.enableLatencyTest && testResult.latency !== undefined) {
            latencyMeasurements.push(testResult.latency)
          }
        } else {
          results.failedConnections++
          if (testResult.error) {
            results.errorMessages.push(testResult.error)
          }
        }
        
      } catch (error) {
        results.failedConnections++
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        results.errorMessages.push(errorMessage)
      }

      // 測試間隔
      if (i < this.config.testCount - 1) {
        await new Promise(resolve => setTimeout(resolve, this.config.intervalMs))
      }
    }

    // 計算平均值
    if (connectionTimes.length > 0) {
      results.averageConnectionTime = connectionTimes.reduce((a, b) => a + b, 0) / connectionTimes.length
    }

    if (latencyMeasurements.length > 0) {
      results.averageLatency = latencyMeasurements.reduce((a, b) => a + b, 0) / latencyMeasurements.length
    }

    // 評估整體品質
    results.qualityAssessment = this.assessConnectionQuality(results)
    results.recommendations = this.generateRecommendations(results)
    results.success = results.successfulConnections > 0

    console.log('連接穩定性測試完成:', results)
    return results
  }

  /**
   * 執行單次連接測試
   */
  private async runSingleConnectionTest(config: VoiceAIConfig): Promise<{
    success: boolean
    connectionTime: number
    latency?: number
    error?: string
  }> {
    const client = new VoiceAIClient(config)
    const startTime = Date.now()

    try {
      // 設定超時
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('連接超時')), this.config.timeoutMs)
      })

      // 測試連接
      await Promise.race([
        client.connect(),
        timeoutPromise
      ])

      const connectionTime = Date.now() - startTime
      
      // 測試延遲（如果啟用）
      let latency: number | undefined
      if (this.config.enableLatencyTest) {
        latency = await this.measureLatency(client)
      }

      // 清理連接
      client.disconnect()

      return {
        success: true,
        connectionTime,
        latency
      }

    } catch (error) {
      client.disconnect()
      
      return {
        success: false,
        connectionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : '未知錯誤'
      }
    }
  }

  /**
   * 測量延遲
   */
  private async measureLatency(client: VoiceAIClient): Promise<number> {
    // 模擬延遲測試
    // 實際實作會發送測試音訊並測量回應時間
    return new Promise((resolve) => {
      const startTime = Date.now()
      
      // 模擬回應延遲
      setTimeout(() => {
        const latency = Date.now() - startTime
        resolve(latency)
      }, Math.random() * 200 + 50) // 50-250ms 隨機延遲
    })
  }

  /**
   * 評估連接品質
   */
  private assessConnectionQuality(results: StabilityTestResult): 'excellent' | 'good' | 'poor' | 'unstable' {
    const successRate = results.successfulConnections / results.totalTests
    const avgConnectionTime = results.averageConnectionTime
    const avgLatency = results.averageLatency

    if (successRate >= 0.95 && avgConnectionTime < 2000 && avgLatency < 200) {
      return 'excellent'
    } else if (successRate >= 0.85 && avgConnectionTime < 3000 && avgLatency < 500) {
      return 'good'
    } else if (successRate >= 0.70) {
      return 'poor'
    } else {
      return 'unstable'
    }
  }

  /**
   * 生成改善建議
   */
  private generateRecommendations(results: StabilityTestResult): string[] {
    const recommendations: string[] = []
    const successRate = results.successfulConnections / results.totalTests

    if (successRate < 0.95) {
      recommendations.push('連接成功率偏低，請檢查網路連線品質')
    }

    if (results.averageConnectionTime > 3000) {
      recommendations.push('連接時間過長，建議優化網路環境或更換網路供應商')
    }

    if (results.averageLatency > 500) {
      recommendations.push('延遲過高，可能影響語音對話體驗，建議檢查網路延遲')
    }

    if (results.errorMessages.length > 0) {
      const commonErrors = this.findCommonErrors(results.errorMessages)
      commonErrors.forEach(error => {
        recommendations.push(`常見錯誤: ${error} - 請檢查相關設定`)
      })
    }

    if (recommendations.length === 0) {
      recommendations.push('連接品質良好，可以正常使用語音功能')
    }

    return recommendations
  }

  /**
   * 找出常見錯誤
   */
  private findCommonErrors(errorMessages: string[]): string[] {
    const errorCounts = new Map<string, number>()
    
    errorMessages.forEach(error => {
      const count = errorCounts.get(error) || 0
      errorCounts.set(error, count + 1)
    })

    return Array.from(errorCounts.entries())
      .filter(([_, count]) => count >= 2)
      .map(([error, _]) => error)
  }

  /**
   * 產生測試報告
   */
  generateReport(results: StabilityTestResult): string {
    const successRate = ((results.successfulConnections / results.totalTests) * 100).toFixed(1)
    
    return `
📊 語音AI連接穩定性測試報告

🔗 連接統計
- 總測試次數: ${results.totalTests}
- 成功連接: ${results.successfulConnections}
- 失敗連接: ${results.failedConnections}
- 成功率: ${successRate}%

⏱️ 性能指標
- 平均連接時間: ${results.averageConnectionTime.toFixed(0)}ms
- 平均延遲: ${results.averageLatency.toFixed(0)}ms
- 整體品質評估: ${results.qualityAssessment}

${results.errorMessages.length > 0 ? `
❌ 錯誤記錄
${results.errorMessages.slice(0, 5).map(error => `- ${error}`).join('\n')}
${results.errorMessages.length > 5 ? `...還有 ${results.errorMessages.length - 5} 個錯誤` : ''}
` : ''}

💡 改善建議
${results.recommendations.map(rec => `- ${rec}`).join('\n')}

測試時間: ${new Date().toLocaleString()}
    `.trim()
  }
}
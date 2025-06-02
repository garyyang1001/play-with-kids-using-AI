import { GoogleGenAI } from '@google/genai';

export interface LearningSessionData {
  sessionId: string;
  timestamp: Date;
  templateName: string;
  childAge: number;
  duration: number; // 分鐘
  promptEvolutions: {
    original: string;
    improved: string;
    improvementAreas: string[];
    qualityScore: {
      before: number;
      after: number;
      improvement: number;
    };
  }[];
  skillsProgress: {
    [skillName: string]: {
      before: number; // 0-100
      after: number; // 0-100
      improvement: number;
    };
  };
  achievements: string[];
  parentFeedback?: string;
  childFeedback?: string;
}

export interface LearningReport {
  summary: {
    totalSessions: number;
    totalDuration: number;
    averageImprovement: number;
    skillsMastered: string[];
    favoriteTemplate: string;
  };
  progressAnalysis: {
    skillTrends: {
      [skillName: string]: {
        trend: 'improving' | 'stable' | 'needs_attention';
        averageScore: number;
        recentSessions: number[];
      };
    };
    strengthAreas: string[];
    improvementAreas: string[];
  };
  recommendations: {
    nextSteps: string[];
    challengeLevel: 'beginner' | 'intermediate' | 'advanced';
    suggestedTemplates: string[];
  };
  parentInsights: {
    engagement: number; // 0-100
    creativity: number; // 0-100
    confidence: number; // 0-100
    collaborationQuality: number; // 0-100
    strengths: string[];
    areasForGrowth: string[];
    recommendations: string[];
    nextSteps: string[];
  };
  aiGeneratedInsights: string;
}

export class LearningReportGenerator {
  private client: GoogleGenAI;
  private sessions: LearningSessionData[] = [];

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) {
      throw new Error('Google AI API Key 未設定');
    }
    this.client = new GoogleGenAI({ apiKey: key });
  }

  addSession(session: LearningSessionData): void {
    this.sessions.push(session);
    this.sessions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async generateReport(childId: string, timeRange?: { start: Date; end: Date }): Promise<LearningReport> {
    let filteredSessions = this.sessions;
    
    if (timeRange) {
      filteredSessions = this.sessions.filter(
        session => session.timestamp >= timeRange.start && session.timestamp <= timeRange.end
      );
    }

    if (filteredSessions.length === 0) {
      throw new Error('沒有找到學習資料');
    }

    const summary = this.generateSummary(filteredSessions);
    const progressAnalysis = this.analyzeProgress(filteredSessions);
    const recommendations = this.generateRecommendations(progressAnalysis);
    const parentInsights = this.calculateParentInsights(filteredSessions);
    const aiGeneratedInsights = await this.generateAIInsights(filteredSessions);

    return {
      summary,
      progressAnalysis,
      recommendations,
      parentInsights,
      aiGeneratedInsights
    };
  }

  private generateSummary(sessions: LearningSessionData[]) {
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    
    const allImprovements = sessions.flatMap(session => 
      session.promptEvolutions.map(evo => evo.qualityScore.improvement)
    );
    const averageImprovement = allImprovements.reduce((sum, imp) => sum + imp, 0) / allImprovements.length;

    // 統計技能掌握情況
    const skillsMastered: string[] = [];
    const allSkills = new Set<string>();
    
    sessions.forEach(session => {
      Object.keys(session.skillsProgress).forEach(skill => {
        allSkills.add(skill);
        if (session.skillsProgress[skill].after >= 80) { // 80分以上視為掌握
          if (!skillsMastered.includes(skill)) {
            skillsMastered.push(skill);
          }
        }
      });
    });

    // 找出最喜歡的模板
    const templateCounts: Record<string, number> = {};
    sessions.forEach(session => {
      templateCounts[session.templateName] = (templateCounts[session.templateName] || 0) + 1;
    });
    const favoriteTemplate = Object.entries(templateCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    return {
      totalSessions,
      totalDuration,
      averageImprovement,
      skillsMastered,
      favoriteTemplate
    };
  }

  private analyzeProgress(sessions: LearningSessionData[]) {
    const skillTrends: Record<string, any> = {};
    const allSkills = new Set<string>();

    // 收集所有技能
    sessions.forEach(session => {
      Object.keys(session.skillsProgress).forEach(skill => allSkills.add(skill));
    });

    // 分析每個技能的趨勢
    allSkills.forEach(skill => {
      const skillSessions = sessions.filter(session => session.skillsProgress[skill]);
      const scores = skillSessions.map(session => session.skillsProgress[skill].after);
      
      if (scores.length >= 2) {
        const recent = scores.slice(-3); // 最近3次
        const trend = this.calculateTrend(recent);
        
        skillTrends[skill] = {
          trend,
          averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
          recentSessions: recent
        };
      }
    });

    // 識別優勢和待改進領域
    const strengthAreas = Object.entries(skillTrends)
      .filter(([, data]) => data.averageScore >= 75)
      .map(([skill]) => skill);

    const improvementAreas = Object.entries(skillTrends)
      .filter(([, data]) => data.averageScore < 60 || data.trend === 'needs_attention')
      .map(([skill]) => skill);

    return {
      skillTrends,
      strengthAreas,
      improvementAreas
    };
  }

  private calculateTrend(scores: number[]): 'improving' | 'stable' | 'needs_attention' {
    if (scores.length < 2) return 'stable';
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    const improvement = secondAvg - firstAvg;
    
    if (improvement > 5) return 'improving';
    if (improvement < -5) return 'needs_attention';
    return 'stable';
  }

  private generateRecommendations(progressAnalysis: any) {
    const nextSteps: string[] = [];
    
    // 根據待改進領域給建議
    if (progressAnalysis.improvementAreas.includes('色彩描述')) {
      nextSteps.push('多練習描述顏色和視覺效果，可以嘗試「動物朋友」模板');
    }
    if (progressAnalysis.improvementAreas.includes('情感表達')) {
      nextSteps.push('加強角色情感描述，建議使用「夢想冒險」模板練習');
    }
    if (progressAnalysis.improvementAreas.includes('場景設定')) {
      nextSteps.push('練習描述環境和背景，從「我的一天」模板開始');
    }

    // 根據優勢領域推薦挑戰
    if (progressAnalysis.strengthAreas.length >= 2) {
      nextSteps.push('可以嘗試更有挑戰性的創作主題');
    }

    // 判斷挑戰等級
    const averageScore = Object.values(progressAnalysis.skillTrends)
      .reduce((sum: number, trend: any) => sum + trend.averageScore, 0) / 
      Object.keys(progressAnalysis.skillTrends).length;

    let challengeLevel: 'beginner' | 'intermediate' | 'advanced';
    if (averageScore < 50) challengeLevel = 'beginner';
    else if (averageScore < 75) challengeLevel = 'intermediate';
    else challengeLevel = 'advanced';

    // 推薦模板
    const suggestedTemplates: string[] = [];
    if (challengeLevel === 'beginner') {
      suggestedTemplates.push('daily-life');
    } else if (challengeLevel === 'intermediate') {
      suggestedTemplates.push('adventure', 'animal-friend');
    } else {
      suggestedTemplates.push('adventure', 'animal-friend', 'custom');
    }

    return {
      nextSteps,
      challengeLevel,
      suggestedTemplates
    };
  }

  private calculateParentInsights(sessions: LearningSessionData[]) {
    // 根據學習數據計算各項指標
    const totalSessions = sessions.length;
    const averageDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions;
    
    // 參與度：基於學習頻率和時長
    const engagement = Math.min(100, (totalSessions * 10) + (averageDuration * 2));
    
    // 創意度：基於Prompt優化程度
    const creativityScores = sessions.flatMap(s => 
      s.promptEvolutions.map(evo => evo.qualityScore.improvement)
    );
    const creativity = Math.min(100, 
      creativityScores.reduce((sum, score) => sum + score, 0) / creativityScores.length * 20
    );

    // 自信度：基於技能進步趨勢
    const skillImprovements = sessions.flatMap(s => 
      Object.values(s.skillsProgress).map(skill => skill.improvement)
    );
    const confidence = Math.min(100,
      skillImprovements.reduce((sum, imp) => sum + imp, 0) / skillImprovements.length + 50
    );

    // 協作品質：基於親子互動品質
    const collaborationQuality = sessions.length > 3 ? 85 : Math.min(85, sessions.length * 20);

    // 生成詳細的洞察內容
    const strengths = this.generateStrengths(sessions, engagement, creativity, confidence);
    const areasForGrowth = this.generateAreasForGrowth(sessions);
    const recommendations = this.generateParentRecommendations(sessions);
    const nextSteps = this.generateNextSteps(sessions);

    return {
      engagement: Math.round(engagement),
      creativity: Math.round(creativity),
      confidence: Math.round(confidence),
      collaborationQuality: Math.round(collaborationQuality),
      strengths,
      areasForGrowth,
      recommendations,
      nextSteps
    };
  }

  private generateStrengths(sessions: LearningSessionData[], engagement: number, creativity: number, confidence: number): string[] {
    const strengths: string[] = [];
    
    if (engagement >= 80) {
      strengths.push('學習動機強烈，能主動參與AI創作活動');
    }
    if (creativity >= 75) {
      strengths.push('創意思維活躍，在描述細節方面表現出色');
    }
    if (confidence >= 70) {
      strengths.push('學習自信心足，願意嘗試新的表達方式');
    }
    if (sessions.length >= 5) {
      strengths.push('學習持續性良好，建立了穩定的學習習慣');
    }

    // 如果沒有明顯優勢，添加一些基礎正面評價
    if (strengths.length === 0) {
      strengths.push('正在積極探索AI創作的可能性');
      strengths.push('展現出對新技術學習的興趣');
    }

    return strengths;
  }

  private generateAreasForGrowth(sessions: LearningSessionData[]): string[] {
    const areas: string[] = [];
    
    // 基於學習次數判斷
    if (sessions.length < 3) {
      areas.push('可以增加學習頻率，建立更穩定的學習節奏');
    }
    
    // 基於 Prompt 品質改進
    const avgImprovement = sessions.reduce((sum, s) => 
      sum + s.promptEvolutions.reduce((pSum, p) => pSum + p.qualityScore.improvement, 0)
    , 0) / sessions.length;
    
    if (avgImprovement < 2) {
      areas.push('可以在描述細節方面更加豐富，增加感官描述');
    }
    
    // 總是添加一些成長建議
    areas.push('繼續探索不同的創作主題，拓展創意邊界');
    
    return areas;
  }

  private generateParentRecommendations(sessions: LearningSessionData[]): string[] {
    return [
      '每次學習後，花2-3分鐘與孩子討論學到的AI溝通技巧',
      '鼓勵孩子在日常生活中練習詳細描述所見所聞',
      '設定固定的親子AI創作時間，培養學習習慣',
      '當孩子表達創意想法時，多用開放性問題引導深入思考',
      '將AI創作與孩子的興趣愛好結合，提高學習動機'
    ];
  }

  private generateNextSteps(sessions: LearningSessionData[]): string[] {
    const nextSteps: string[] = [];
    
    if (sessions.length < 5) {
      nextSteps.push('完成至少5次基礎創作練習，熟悉不同模板');
    } else {
      nextSteps.push('嘗試混合不同模板元素，創作更複雜的故事');
    }
    
    nextSteps.push('練習使用更多形容詞和感官詞彙描述場景');
    nextSteps.push('學習基本的故事結構：開始、發展、高潮、結局');
    nextSteps.push('嘗試為創作的角色設計個性和背景故事');
    
    return nextSteps;
  }

  private async generateAIInsights(sessions: LearningSessionData[]): Promise<string> {
    const sessionSummary = sessions.map(session => ({
      template: session.templateName,
      duration: session.duration,
      improvements: session.promptEvolutions.length,
      averageImprovement: session.promptEvolutions.reduce(
        (sum, evo) => sum + evo.qualityScore.improvement, 0
      ) / session.promptEvolutions.length
    }));

    const prompt = `
作為親子教育專家和AI學習顧問，請分析以下孩子的Prompt Engineering學習資料：

學習記錄：
${JSON.stringify(sessionSummary, null, 2)}

總共 ${sessions.length} 次學習經歷，請提供：

1. 學習模式洞察（孩子的學習習慣和偏好）
2. 創意發展評估（創意思維的成長軌跡）
3. 親子互動品質觀察
4. 未來學習建議（3-5個具體建議）

請用溫馨、專業的語氣撰寫，約200-300字，重點關注孩子的成長亮點和潛力發展。
`;

    try {
      // 使用 @google/genai 的正確 API 格式
      const response = await this.client.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      return response.text;
    } catch (error) {
      console.error('生成AI洞察失敗:', error);
      return `根據 ${sessions.length} 次學習記錄，孩子在 Prompt Engineering 方面展現出良好的學習潛力。建議繼續保持規律的親子學習時光，多鼓勵孩子的創意表達，逐步提升描述的豐富度和準確性。`;
    }
  }

  generatePDFReport(report: LearningReport): string {
    // 生成PDF格式的報告內容（這裡返回HTML格式，可以轉換為PDF）
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>親子AI學習報告</title>
    <style>
        body { font-family: 'Microsoft JhengHei', sans-serif; line-height: 1.6; }
        .header { text-align: center; color: #4A90E2; margin-bottom: 30px; }
        .section { margin-bottom: 25px; padding: 15px; border-radius: 8px; }
        .summary { background-color: #f8f9fa; }
        .progress { background-color: #e8f4f8; }
        .recommendations { background-color: #fff3cd; }
        .insights { background-color: #f0f0f0; }
        .skill-bar { height: 20px; background-color: #ddd; border-radius: 10px; margin: 5px 0; }
        .skill-progress { height: 100%; background-color: #4CAF50; border-radius: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 親子 AI 學習成果報告</h1>
        <p>生成日期：${new Date().toLocaleDateString('zh-TW')}</p>
    </div>

    <div class="section summary">
        <h2>📊 學習概況</h2>
        <ul>
            <li>總學習次數：${report.summary.totalSessions} 次</li>
            <li>累計學習時間：${report.summary.totalDuration} 分鐘</li>
            <li>平均品質提升：${report.summary.averageImprovement.toFixed(1)} 倍</li>
            <li>已掌握技能：${report.summary.skillsMastered.join(', ')}</li>
            <li>最愛模板：${report.summary.favoriteTemplate}</li>
        </ul>
    </div>

    <div class="section progress">
        <h2>📈 技能進步分析</h2>
        <h3>優勢領域：</h3>
        <p>${report.progressAnalysis.strengthAreas.join(', ')}</p>
        
        <h3>待加強領域：</h3>
        <p>${report.progressAnalysis.improvementAreas.join(', ')}</p>
    </div>

    <div class="section recommendations">
        <h2>💡 學習建議</h2>
        <ul>
            ${report.recommendations.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ul>
        <p><strong>適合挑戰等級：</strong>${report.recommendations.challengeLevel}</p>
    </div>

    <div class="section insights">
        <h2>🤖 AI 專家洞察</h2>
        <p>${report.aiGeneratedInsights}</p>
    </div>
</body>
</html>
    `;
  }
}

export default LearningReportGenerator;
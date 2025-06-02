/**
 * 模板A：我的一天（基礎級）
 * 階段4：三大模板實作 - 基礎級模板
 */

import { TemplateConfig } from '@/types/template';

export const dailyLifeTemplate: TemplateConfig = {
  metadata: {
    id: 'daily-life-template',
    name: '我的一天',
    description: '跟著AI一起記錄你的一天，學習用生動的描述說出身邊的事物！',
    level: 'beginner',
    category: 'daily-life',
    estimatedDuration: 15, // 15分鐘
    targetAge: {
      min: 5,
      max: 10
    },
    icon: '🌅',
    preview: '學習描述日常生活，從早晨起床到晚上睡覺',
    tags: ['日常生活', '時間概念', '場景描述', '基礎創作'],
    version: '1.0.0'
  },
  stages: [
    {
      id: 'morning-routine',
      name: '早晨時光',
      description: '讓我們一起描述美好的早晨！',
      order: 1,
      isRequired: true,
      prompt: {
        instruction: '想想看你早上起床後會做什麼？請用2-3句話描述你的早晨。',
        examples: [
          {
            level: 'basic',
            text: '我早上起床刷牙',
            explanation: '很好的開始！但我們可以讓描述更生動',
            highlights: ['基本動作']
          },
          {
            level: 'good',
            text: '我早上起床，在亮亮的浴室裡刷牙',
            explanation: '加上了地點描述，很棒！',
            highlights: ['地點', '形容詞']
          },
          {
            level: 'excellent',
            text: '可愛的小朋友早上起床，在明亮的浴室裡用藍色小牙刷開心地刷牙，白色的泡沫冒出來',
            explanation: '太棒了！有顏色、情感、動作，畫面很生動！',
            highlights: ['顏色描述', '情感表達', '動作細節', '視覺效果']
          }
        ],
        improvementAreas: [
          {
            skill: 'clarity',
            weight: 0.3,
            keywords: ['起床', '刷牙', '洗臉', '穿衣服'],
            requiredElements: ['動作描述']
          },
          {
            skill: 'detail',
            weight: 0.25,
            keywords: ['浴室', '房間', '床', '牙刷'],
            requiredElements: ['地點', '物品']
          },
          {
            skill: 'visual',
            weight: 0.25,
            keywords: ['亮亮的', '藍色', '白色', '小小的'],
            requiredElements: ['顏色', '大小', '形狀']
          },
          {
            skill: 'emotion',
            weight: 0.2,
            keywords: ['開心', '舒服', '精神', '愉快'],
            requiredElements: ['情感描述']
          }
        ],
        coaching: {
          parentGuidance: [
            '可以問孩子：你的牙刷是什麼顏色的？',
            '引導孩子觀察：浴室裡還有什麼？',
            '鼓勵孩子說出感受：刷牙的時候心情怎樣？'
          ],
          childEncouragement: [
            '你說得很棒！讓我們加上更多有趣的細節',
            '想想看，你能告訴我更多顏色嗎？',
            '太好了！你能描述一下你的感受嗎？'
          ],
          technicalTips: [
            '加上顏色讓畫面更鮮明',
            '描述動作讓故事更生動',
            '說出感受讓角色更真實'
          ],
          errorCorrection: [
            {
              errorType: '描述太簡單',
              detection: ['太短', '只有動作', '沒有形容詞'],
              correction: '試著加上一些形容詞，比如顏色或大小',
              encouragement: '你說得對！讓我們讓它更精彩一點'
            },
            {
              errorType: '缺少情感',
              detection: ['沒有感受', '太冷淡'],
              correction: '告訴我你做這件事時的心情如何？',
              encouragement: '加上你的感受會讓故事更有趣'
            }
          ]
        }
      },
      expectedSkills: ['時間順序', '動作描述', '基礎形容詞'],
      successCriteria: {
        minimumScore: 65,
        requiredDimensions: ['clarity', 'detail'],
        skillThresholds: {
          clarity: 60,
          detail: 50,
          visual: 45,
          emotion: 40
        },
        timeLimit: 300 // 5分鐘
      },
      hints: [
        {
          trigger: 'low_detail_score',
          content: '試著告訴我你在哪裡做這件事？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'missing_colors',
          content: '想想看有什麼顏色可以描述？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'parent_help_needed',
          content: '可以引導孩子觀察身邊的物品和顏色',
          priority: 'medium',
          timing: 'during',
          audience: 'parent'
        }
      ]
    },
    {
      id: 'school-time',
      name: '上學路上',
      description: '描述你去上學的路上看到什麼？',
      order: 2,
      isRequired: true,
      prompt: {
        instruction: '告訴我你去上學路上的情景，你看到了什麼？遇到了誰？',
        examples: [
          {
            level: 'basic',
            text: '我走路去學校',
            explanation: '基本描述，讓我們加上更多細節',
            highlights: ['基本動作']
          },
          {
            level: 'good',
            text: '我背著書包走在大馬路上去學校',
            explanation: '很好！加上了物品和地點',
            highlights: ['物品', '地點']
          },
          {
            level: 'excellent',
            text: '小朋友背著紅色的書包，走在寬寬的馬路上，看到綠色的大樹和黃色的校車，開心地去學校',
            explanation: '太棒了！有顏色、物品、環境和情感！',
            highlights: ['顏色豐富', '環境描述', '情感表達', '多個物品']
          }
        ],
        improvementAreas: [
          {
            skill: 'visual',
            weight: 0.3,
            keywords: ['紅色', '綠色', '黃色', '大大的', '高高的'],
            requiredElements: ['顏色描述', '大小形容']
          },
          {
            skill: 'detail',
            weight: 0.25,
            keywords: ['書包', '馬路', '樹', '車子', '房子'],
            requiredElements: ['物品', '環境']
          },
          {
            skill: 'emotion',
            weight: 0.25,
            keywords: ['開心', '興奮', '期待', '快樂'],
            requiredElements: ['情感表達']
          },
          {
            skill: 'structure',
            weight: 0.2,
            keywords: ['然後', '接著', '看到', '遇到'],
            requiredElements: ['動作順序']
          }
        ],
        coaching: {
          parentGuidance: [
            '可以問：路上看到什麼顏色的東西？',
            '引導觀察：有什麼車子經過？',
            '鼓勵分享感受：你覺得開心嗎？'
          ],
          childEncouragement: [
            '你觀察得真仔細！',
            '還有什麼有趣的東西嗎？',
            '告訴我你看到這些時的感覺'
          ],
          technicalTips: [
            '用不同顏色描述看到的物品',
            '按照路上看到的順序來說',
            '表達你的心情和感受'
          ],
          errorCorrection: [
            {
              errorType: '場景單調',
              detection: ['只說了一樣東西', '沒有環境'],
              correction: '路上還有什麼其他東西嗎？',
              encouragement: '你一定看到了很多有趣的東西'
            }
          ]
        }
      },
      expectedSkills: ['環境觀察', '顏色識別', '順序表達'],
      successCriteria: {
        minimumScore: 70,
        requiredDimensions: ['visual', 'detail', 'emotion'],
        skillThresholds: {
          clarity: 65,
          detail: 60,
          visual: 65,
          emotion: 55,
          structure: 50
        }
      },
      hints: [
        {
          trigger: 'low_visual_score',
          content: '想想看你看到了什麼顏色？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'need_more_objects',
          content: '路上還有什麼東西？車子？樹？房子？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        }
      ]
    },
    {
      id: 'evening-family',
      name: '晚餐時光',
      description: '和家人一起的美好晚餐',
      order: 3,
      isRequired: true,
      prompt: {
        instruction: '描述你和家人一起吃晚餐的情景，有什麼好吃的食物？大家在聊什麼？',
        examples: [
          {
            level: 'basic',
            text: '我們吃晚餐',
            explanation: '這是個開始，讓我們加上更多細節',
            highlights: ['基本動作']
          },
          {
            level: 'good',
            text: '我和爸爸媽媽一起吃晚餐，有很多菜',
            explanation: '很棒！加上了人物和食物',
            highlights: ['人物', '食物']
          },
          {
            level: 'excellent',
            text: '溫暖的餐廳裡，我和親愛的爸爸媽媽圍著圓桌吃晚餐，桌上有香噴噴的紅燒肉、綠色的青菜和白米飯，大家開心地聊著今天發生的有趣事情',
            explanation: '太棒了！有環境、人物、具體食物、顏色和互動！',
            highlights: ['環境設定', '人物關係', '食物細節', '顏色描述', '互動場景']
          }
        ],
        improvementAreas: [
          {
            skill: 'emotion',
            weight: 0.3,
            keywords: ['溫暖', '開心', '愛', '幸福', '溫馨'],
            requiredElements: ['家庭情感', '快樂氛圍']
          },
          {
            skill: 'detail',
            weight: 0.25,
            keywords: ['餐桌', '椅子', '碗', '筷子', '食物'],
            requiredElements: ['具體物品', '食物描述']
          },
          {
            skill: 'visual',
            weight: 0.25,
            keywords: ['紅燒肉', '綠色青菜', '白米飯', '金黃色'],
            requiredElements: ['食物顏色', '外觀描述']
          },
          {
            skill: 'structure',
            weight: 0.2,
            keywords: ['首先', '然後', '一邊...一邊', '同時'],
            requiredElements: ['時間順序', '動作連接']
          }
        ],
        coaching: {
          parentGuidance: [
            '問問孩子：今天晚餐吃了什麼？',
            '引導回憶：大家聊了什麼有趣的事？',
            '鼓勵表達：你覺得和家人吃飯開心嗎？'
          ],
          childEncouragement: [
            '哇！聽起來是很棒的晚餐時光',
            '你記得真清楚！',
            '還有什麼有趣的事情嗎？'
          ],
          technicalTips: [
            '描述食物的顏色和味道',
            '說出和家人的互動',
            '表達溫馨的家庭氛圍'
          ],
          errorCorrection: [
            {
              errorType: '缺少互動',
              detection: ['只說食物', '沒有人物互動'],
              correction: '和家人一起吃飯時，大家有聊天嗎？',
              encouragement: '家人一起的時光一定很有趣'
            },
            {
              errorType: '情感表達不足',
              detection: ['太冷淡', '沒有感情'],
              correction: '告訴我你和家人一起時的感覺',
              encouragement: '你一定很愛你的家人'
            }
          ]
        }
      },
      expectedSkills: ['情感表達', '人物互動', '場景描述'],
      successCriteria: {
        minimumScore: 75,
        requiredDimensions: ['emotion', 'detail', 'visual'],
        skillThresholds: {
          clarity: 70,
          detail: 65,
          visual: 60,
          emotion: 70,
          structure: 60
        }
      },
      hints: [
        {
          trigger: 'low_emotion_score',
          content: '想想和家人一起吃飯時你的心情如何？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'missing_interaction',
          content: '大家有一起聊天嗎？聊了什麼？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'need_food_details',
          content: '可以描述一下今天吃了什麼嗎？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        }
      ]
    }
  ],
  defaults: {
    difficulty: {
      adaptiveLevel: 60,
      skillWeights: {
        clarity: 0.25,
        detail: 0.20,
        emotion: 0.20,
        visual: 0.20,
        structure: 0.15
      },
      hintFrequency: 'normal',
      exampleComplexity: 'simple',
      evaluationStrict: 0.6
    },
    coaching: {
      parentGuidance: [
        '這個模板適合5-10歲的孩子',
        '可以結合孩子的真實經驗來引導',
        '鼓勵孩子觀察生活中的細節'
      ],
      childEncouragement: [
        '你觀察得真仔細！',
        '生活中有很多美好的事情',
        '你說得越來越棒了！'
      ],
      technicalTips: [
        '從簡單的日常活動開始',
        '逐步加入顏色和形容詞',
        '鼓勵表達真實感受'
      ],
      errorCorrection: []
    },
    progression: {
      autoAdvance: true,
      retryLimit: 3,
      masteryThreshold: 75,
      skipConditions: [
        {
          skill: 'clarity',
          minimumLevel: 80,
          allowSkip: false
        }
      ]
    }
  },
  customization: {
    allowedFields: ['difficulty', 'examples', 'hints'],
    constraints: {
      minimumScore: { min: 50, max: 90 },
      timeLimit: { min: 180, max: 600 }
    },
    validationFunctions: []
  },
  validation: {
    required: ['stages', 'metadata'],
    types: {
      'stages': 'array',
      'metadata.level': 'string'
    },
    ranges: {
      'estimatedDuration': { min: 10, max: 30 }
    },
    custom: []
  }
};

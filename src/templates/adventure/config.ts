/**
 * 模板B：夢想冒險（進階級）
 * 階段4：三大模板實作 - 進階級模板
 */

import { TemplateConfig } from '@/types/template';

export const adventureTemplate: TemplateConfig = {
  metadata: {
    id: 'adventure-template',
    name: '夢想冒險',
    description: '創造屬於你的超級英雄故事！學習角色設定和劇情發展',
    level: 'intermediate',
    category: 'adventure',
    estimatedDuration: 20, // 20分鐘
    targetAge: {
      min: 7,
      max: 12
    },
    icon: '🚀',
    preview: '成為故事的主角，展開刺激的冒險旅程',
    tags: ['冒險故事', '角色創造', '情節發展', '想像力'],
    version: '1.0.0'
  },
  stages: [
    {
      id: 'hero-creation',
      name: '創造英雄',
      description: '設計你的專屬超級英雄！',
      order: 1,
      isRequired: true,
      prompt: {
        instruction: '創造一個超級英雄！告訴我他的外觀、服裝和超能力是什麼？',
        examples: [
          {
            level: 'basic',
            text: '我的英雄會飛',
            explanation: '超能力很酷！讓我們加上更多關於英雄的描述',
            highlights: ['基本能力']
          },
          {
            level: 'good',
            text: '我的英雄穿紅色斗篷，會飛翔和發光',
            explanation: '很棒！有服裝和多種能力了',
            highlights: ['服裝描述', '多種能力']
          },
          {
            level: 'excellent',
            text: '我的英雄叫做光明戰士，穿著閃亮的銀色盔甲和藍色斗篷，有一雙金色的眼睛，可以發出彩虹光束保護小朋友，還能在天空中快速飛翔',
            explanation: '太厲害了！有名字、詳細外觀、特色能力和使命感！',
            highlights: ['角色命名', '外觀細節', '顏色豐富', '能力描述', '正義使命']
          }
        ],
        improvementAreas: [
          {
            skill: 'visual',
            weight: 0.3,
            keywords: ['銀色', '藍色', '金色', '閃亮', '彩虹', '盔甲', '斗篷'],
            requiredElements: ['顏色描述', '服裝細節', '外觀特徵']
          },
          {
            skill: 'emotion',
            weight: 0.25,
            keywords: ['勇敢', '善良', '保護', '正義', '友善', '堅強'],
            requiredElements: ['性格特質', '使命感']
          },
          {
            skill: 'detail',
            weight: 0.25,
            keywords: ['光束', '飛翔', '盔甲', '眼睛', '能力', '武器'],
            requiredElements: ['能力描述', '裝備細節']
          },
          {
            skill: 'clarity',
            weight: 0.2,
            keywords: ['戰士', '英雄', '名字', '叫做'],
            requiredElements: ['角色定位', '清楚命名']
          }
        ],
        coaching: {
          parentGuidance: [
            '鼓勵孩子發揮想像力，沒有標準答案',
            '可以問：你的英雄想要保護誰？',
            '引導思考：什麼顏色的服裝最酷？'
          ],
          childEncouragement: [
            '哇！你的英雄聽起來超酷的！',
            '你的想像力真豐富！',
            '還有什麼特別的能力嗎？'
          ],
          technicalTips: [
            '給英雄取一個響亮的名字',
            '描述服裝的顏色和材質',
            '說明英雄的正義使命'
          ],
          errorCorrection: [
            {
              errorType: '描述太簡單',
              detection: ['只有能力', '沒有外觀'],
              correction: '你的英雄長什麼樣子？穿什麼衣服？',
              encouragement: '讓我們讓你的英雄更生動！'
            },
            {
              errorType: '缺少使命感',
              detection: ['沒有目標', '只有能力'],
              correction: '你的英雄想要保護什麼或幫助誰？',
              encouragement: '真正的英雄都有偉大的使命'
            }
          ]
        }
      },
      expectedSkills: ['角色設定', '外觀描述', '創意發想'],
      successCriteria: {
        minimumScore: 70,
        requiredDimensions: ['visual', 'emotion', 'detail'],
        skillThresholds: {
          clarity: 65,
          detail: 65,
          visual: 70,
          emotion: 60,
          structure: 55
        },
        timeLimit: 400 // 6-7分鐘
      },
      hints: [
        {
          trigger: 'low_visual_score',
          content: '想想你的英雄穿什麼顏色的衣服？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'missing_name',
          content: '給你的英雄取個帥氣的名字吧！',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'need_personality',
          content: '你的英雄是什麼性格？勇敢？善良？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        }
      ]
    },
    {
      id: 'adventure-scene',
      name: '冒險場景',
      description: '你的英雄要去哪裡冒險？',
      order: 2,
      isRequired: true,
      prompt: {
        instruction: '你的英雄要去一個神奇的地方冒險！描述這個地方是什麼樣子？',
        examples: [
          {
            level: 'basic',
            text: '英雄去森林',
            explanation: '森林是個好地方！讓我們描述得更詳細',
            highlights: ['基本場景']
          },
          {
            level: 'good',
            text: '英雄去神秘的森林，裡面有很多大樹',
            explanation: '很好！加上了形容詞和環境元素',
            highlights: ['形容詞', '環境元素']
          },
          {
            level: 'excellent',
            text: '英雄來到魔法森林，這裡有會發光的紫色大樹，金色的蝴蝶在空中飛舞，地上長著彩虹色的蘑菇，還有清澈的小溪在唱歌',
            explanation: '太棒了！充滿魔法色彩，有豐富的視覺和聽覺描述！',
            highlights: ['魔法元素', '豐富色彩', '多種生物', '感官描述', '擬人化']
          }
        ],
        improvementAreas: [
          {
            skill: 'visual',
            weight: 0.35,
            keywords: ['紫色', '金色', '彩虹色', '發光', '閃亮', '美麗'],
            requiredElements: ['色彩描述', '視覺特效', '光影效果']
          },
          {
            skill: 'detail',
            weight: 0.25,
            keywords: ['樹', '蝴蝶', '蘑菇', '小溪', '花朵', '動物'],
            requiredElements: ['自然元素', '生物描述', '地形特徵']
          },
          {
            skill: 'emotion',
            weight: 0.2,
            keywords: ['神奇', '美麗', '夢幻', '驚人', '壯觀'],
            requiredElements: ['氛圍營造', '情感渲染']
          },
          {
            skill: 'structure',
            weight: 0.2,
            keywords: ['這裡有', '地上長著', '空中飛舞', '還有'],
            requiredElements: ['場景層次', '空間描述']
          }
        ],
        coaching: {
          parentGuidance: [
            '可以問：這個地方有什麼特別的？',
            '引導想像：如果是魔法世界會是什麼樣？',
            '鼓勵添加：還有什麼有趣的動物或植物？'
          ],
          childEncouragement: [
            '哇！這個地方聽起來好神奇！',
            '你的想像力創造了一個美麗的世界',
            '還有什麼特別的東西嗎？'
          ],
          technicalTips: [
            '用豐富的顏色描述場景',
            '加入動物和植物讓場景生動',
            '描述從地面到天空的不同層次'
          ],
          errorCorrection: [
            {
              errorType: '場景單調',
              detection: ['只有一種元素', '沒有細節'],
              correction: '這個地方還有什麼特別的東西？',
              encouragement: '讓我們讓這個地方更神奇！'
            },
            {
              errorType: '缺少魔法感',
              detection: ['太普通', '沒有特色'],
              correction: '想想看，如果這是個魔法地方會怎樣？',
              encouragement: '在故事裡什麼都有可能！'
            }
          ]
        }
      },
      expectedSkills: ['場景描述', '想像力發揮', '空間概念'],
      successCriteria: {
        minimumScore: 75,
        requiredDimensions: ['visual', 'detail', 'emotion'],
        skillThresholds: {
          clarity: 70,
          detail: 70,
          visual: 75,
          emotion: 65,
          structure: 60
        }
      },
      hints: [
        {
          trigger: 'low_visual_score',
          content: '想想這個地方有什麼特別的顏色？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'need_more_elements',
          content: '這裡還有什麼動物或植物？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'missing_magic',
          content: '如果這是魔法世界，會有什麼特別的？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        }
      ]
    },
    {
      id: 'heroic-action',
      name: '英雄行動',
      description: '你的英雄遇到了挑戰！',
      order: 3,
      isRequired: true,
      prompt: {
        instruction: '你的英雄在冒險中遇到了困難或需要幫助的人！描述發生了什麼事，英雄如何解決？',
        examples: [
          {
            level: 'basic',
            text: '英雄救了小動物',
            explanation: '英雄做好事！讓我們知道更多細節',
            highlights: ['基本行動']
          },
          {
            level: 'good',
            text: '英雄用超能力救了被困的小兔子',
            explanation: '很好！有具體的救援對象和方法',
            highlights: ['具體對象', '使用能力']
          },
          {
            level: 'excellent',
            text: '突然，英雄聽到小兔子的哭聲，原來牠掉進了深深的洞裡！英雄立刻發射彩虹光束，在洞口架起一座光之橋樑，溫柔地把害怕的小兔子救上來，小兔子開心地說謝謝',
            explanation: '太精彩了！有緊急情況、解決過程、情感互動和結果！',
            highlights: ['情況描述', '解決方案', '能力運用', '情感互動', '完整結果']
          }
        ],
        improvementAreas: [
          {
            skill: 'structure',
            weight: 0.3,
            keywords: ['突然', '原來', '立刻', '然後', '最後'],
            requiredElements: ['事件順序', '因果關係', '故事結構']
          },
          {
            skill: 'emotion',
            weight: 0.25,
            keywords: ['害怕', '開心', '感謝', '勇敢', '溫柔', '擔心'],
            requiredElements: ['情感表達', '角色情緒', '情感變化']
          },
          {
            skill: 'detail',
            weight: 0.25,
            keywords: ['洞', '橋樑', '光束', '哭聲', '方法'],
            requiredElements: ['具體行動', '解決方案', '過程描述']
          },
          {
            skill: 'visual',
            weight: 0.2,
            keywords: ['彩虹光束', '深深的洞', '光之橋樑', '閃亮'],
            requiredElements: ['視覺效果', '動作畫面']
          }
        ],
        coaching: {
          parentGuidance: [
            '引導孩子思考：遇到困難怎麼辦？',
            '可以問：英雄會用什麼方法解決？',
            '鼓勵表達：被救的人感覺如何？'
          ],
          childEncouragement: [
            '你的英雄真是個好心的人！',
            '這個解決方法很聰明！',
            '你講故事的能力越來越棒了！'
          ],
          technicalTips: [
            '按照「問題-行動-結果」的順序',
            '描述英雄使用特殊能力的過程',
            '表達救援前後的情感變化'
          ],
          errorCorrection: [
            {
              errorType: '情節太簡單',
              detection: ['沒有過程', '太簡短'],
              correction: '告訴我英雄是怎麼做的？',
              encouragement: '讓我們把故事說得更精彩！'
            },
            {
              errorType: '缺少情感',
              detection: ['沒有感受', '太冷淡'],
              correction: '被救的人心情如何？英雄感覺如何？',
              encouragement: '情感讓故事更動人'
            }
          ]
        }
      },
      expectedSkills: ['情節發展', '問題解決', '情感表達'],
      successCriteria: {
        minimumScore: 80,
        requiredDimensions: ['structure', 'emotion', 'detail'],
        skillThresholds: {
          clarity: 75,
          detail: 70,
          visual: 65,
          emotion: 75,
          structure: 75
        }
      },
      hints: [
        {
          trigger: 'low_structure_score',
          content: '試著按順序說：發生什麼→英雄做什麼→結果如何',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'missing_problem',
          content: '什麼困難或危險需要英雄幫忙？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'need_emotion',
          content: '大家的心情如何？害怕？開心？感謝？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        }
      ]
    },
    {
      id: 'victory-celebration',
      name: '勝利慶祝',
      description: '英雄完成任務，大家來慶祝！',
      order: 4,
      isRequired: false, // 這是選修階段
      prompt: {
        instruction: '英雄成功完成了任務！描述大家如何慶祝這個勝利？',
        examples: [
          {
            level: 'basic',
            text: '大家很開心',
            explanation: '開心是對的！讓我們描述慶祝的方式',
            highlights: ['基本情感']
          },
          {
            level: 'good',
            text: '所有小動物都出來謝謝英雄，大家一起唱歌',
            explanation: '很棒！有感謝和慶祝活動',
            highlights: ['集體感謝', '慶祝活動']
          },
          {
            level: 'excellent',
            text: '森林裡所有的動物都出來了！小兔子、小鹿、小鳥們圍著英雄跳舞，蝴蝶在空中畫出美麗的圖案，花朵們也綻放出更鮮豔的顏色，大家一起唱著感謝之歌，英雄感到無比幸福和自豪',
            explanation: '太棒了！有豐富的慶祝場面和深刻的情感體驗！',
            highlights: ['豐富角色', '慶祝細節', '視覺效果', '情感升華', '完美結尾']
          }
        ],
        improvementAreas: [
          {
            skill: 'emotion',
            weight: 0.35,
            keywords: ['幸福', '自豪', '感謝', '開心', '滿足', '溫暖'],
            requiredElements: ['深層情感', '成就感', '愛與感謝']
          },
          {
            skill: 'visual',
            weight: 0.25,
            keywords: ['跳舞', '圖案', '鮮豔', '綻放', '圍著', '畫出'],
            requiredElements: ['慶祝畫面', '視覺盛宴', '動態場景']
          },
          {
            skill: 'detail',
            weight: 0.25,
            keywords: ['小兔子', '小鹿', '小鳥', '蝴蝶', '花朵'],
            requiredElements: ['參與角色', '慶祝元素', '具體活動']
          },
          {
            skill: 'structure',
            weight: 0.15,
            keywords: ['所有', '一起', '也', '大家'],
            requiredElements: ['統一行動', '集體慶祝']
          }
        ],
        coaching: {
          parentGuidance: [
            '這是故事的高潮，鼓勵孩子表達正面情感',
            '可以問：還有誰會來慶祝？',
            '引導思考：英雄心裡有什麼感受？'
          ],
          childEncouragement: [
            '這個結局太美好了！',
            '你讓所有角色都很開心！',
            '這真是個完美的英雄故事！'
          ],
          technicalTips: [
            '描述所有角色一起慶祝的場面',
            '表達英雄內心的成就感',
            '用美好的畫面作為故事結尾'
          ],
          errorCorrection: [
            {
              errorType: '慶祝太簡單',
              detection: ['太短', '沒有活動'],
              correction: '大家會怎麼慶祝？做什麼活動？',
              encouragement: '讓我們讓慶祝更熱鬧！'
            }
          ]
        }
      },
      expectedSkills: ['故事結尾', '情感表達', '場面描述'],
      successCriteria: {
        minimumScore: 75,
        requiredDimensions: ['emotion', 'visual', 'detail'],
        skillThresholds: {
          clarity: 70,
          detail: 65,
          visual: 70,
          emotion: 80,
          structure: 60
        }
      },
      hints: [
        {
          trigger: 'low_emotion_score',
          content: '英雄和大家的心情如何？很開心？很感動？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'need_more_celebration',
          content: '還有什麼慶祝活動？唱歌？跳舞？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        }
      ]
    }
  ],
  defaults: {
    difficulty: {
      adaptiveLevel: 70,
      skillWeights: {
        clarity: 0.20,
        detail: 0.20,
        emotion: 0.25,
        visual: 0.20,
        structure: 0.15
      },
      hintFrequency: 'normal',
      exampleComplexity: 'moderate',
      evaluationStrict: 0.7
    },
    coaching: {
      parentGuidance: [
        '這個模板適合7-12歲的孩子',
        '鼓勵孩子發揮想像力，創造獨特的英雄',
        '可以結合孩子喜歡的超級英雄來引導'
      ],
      childEncouragement: [
        '你的想像力真的很棒！',
        '這個英雄故事太精彩了！',
        '你是天生的故事家！'
      ],
      technicalTips: [
        '從角色設定開始，再發展情節',
        '用豐富的形容詞描述場景',
        '注意故事的起承轉合'
      ],
      errorCorrection: []
    },
    progression: {
      autoAdvance: true,
      retryLimit: 3,
      masteryThreshold: 75,
      skipConditions: [
        {
          skill: 'structure',
          minimumLevel: 80,
          allowSkip: true // 結構很好的話可以跳過選修階段
        }
      ]
    }
  },
  customization: {
    allowedFields: ['difficulty', 'examples', 'hints', 'characters'],
    constraints: {
      minimumScore: { min: 60, max: 90 },
      timeLimit: { min: 240, max: 800 }
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
      'estimatedDuration': { min: 15, max: 30 }
    },
    custom: []
  }
};

/**
 * 模板C：動物朋友（創意級）
 * 階段4：三大模板實作 - 創意級模板
 */

import { TemplateConfig } from '@/types/template';

export const animalFriendTemplate: TemplateConfig = {
  metadata: {
    id: 'animal-friend-template',
    name: '動物朋友',
    description: '創造奇幻的動物世界！學習角色互動和創意表達',
    level: 'advanced',
    category: 'animal-friend',
    estimatedDuration: 25, // 25分鐘
    targetAge: {
      min: 8,
      max: 14
    },
    icon: '🐼',
    preview: '與可愛的動物朋友一起展開奇幻冒險',
    tags: ['動物世界', '創意表達', '角色互動', '奇幻元素'],
    version: '1.0.0'
  },
  stages: [
    {
      id: 'animal-character',
      name: '動物朋友',
      description: '創造你的動物夥伴！',
      order: 1,
      isRequired: true,
      prompt: {
        instruction: '想像一個特別的動物朋友！牠可能有什麼獨特的外表、個性和特殊能力？',
        examples: [
          {
            level: 'basic',
            text: '我的動物朋友是一隻熊貓',
            explanation: '熊貓很可愛！讓我們了解更多關於牠的特別之處',
            highlights: ['基本選擇']
          },
          {
            level: 'good',
            text: '我的動物朋友是一隻會說話的熊貓，很聰明也很友善',
            explanation: '很棒！有特殊能力和性格描述了',
            highlights: ['特殊能力', '性格特徵']
          },
          {
            level: 'excellent',
            text: '我的動物朋友叫做彩虹，是一隻胖胖可愛的小熊貓，牠的毛是彩虹色的，會根據心情變換顏色，最愛吃彩虹竹子冰淇淋，個性天真活潑，會用魔法讓花朵綻放',
            explanation: '太創意了！有名字、獨特外觀、喜好、性格和魔法能力！',
            highlights: ['創意命名', '獨特外觀', '色彩魔法', '個性描述', '特殊喜好']
          }
        ],
        improvementAreas: [
          {
            skill: 'emotion',
            weight: 0.3,
            keywords: ['可愛', '友善', '天真', '活潑', '溫柔', '頑皮', '聰明'],
            requiredElements: ['性格特徵', '情感表達', '可愛特質']
          },
          {
            skill: 'visual',
            weight: 0.3,
            keywords: ['彩虹色', '胖胖', '閃亮', '毛茸茸', '大眼睛', '變換顏色'],
            requiredElements: ['外觀創意', '色彩描述', '視覺特效']
          },
          {
            skill: 'detail',
            weight: 0.25,
            keywords: ['竹子', '冰淇淋', '魔法', '花朵', '能力', '喜好'],
            requiredElements: ['特殊能力', '喜好描述', '生活細節']
          },
          {
            skill: 'clarity',
            weight: 0.15,
            keywords: ['叫做', '名字', '是一隻', '會'],
            requiredElements: ['清楚命名', '動物類型']
          }
        ],
        coaching: {
          parentGuidance: [
            '鼓勵孩子發揮最大的創意和想像力',
            '可以問：如果動物有魔法會怎樣？',
            '引導思考：動物朋友最喜歡做什麼？'
          ],
          childEncouragement: [
            '哇！你的動物朋友太特別了！',
            '這個創意太棒了！',
            '你的想像力真是無限大！'
          ],
          technicalTips: [
            '結合現實動物與奇幻元素',
            '用豐富的色彩和質感描述',
            '賦予動物朋友獨特的個性'
          ],
          errorCorrection: [
            {
              errorType: '創意不足',
              detection: ['太普通', '沒有特色'],
              correction: '想想看，如果這是魔法世界，動物會有什麼特別之處？',
              encouragement: '在你的故事裡，一切都有可能！'
            },
            {
              errorType: '缺少個性',
              detection: ['沒有性格', '只有外觀'],
              correction: '你的動物朋友是什麼性格？活潑？害羞？',
              encouragement: '個性讓動物朋友更真實可愛'
            }
          ]
        }
      },
      expectedSkills: ['創意發想', '角色塑造', '個性描述'],
      successCriteria: {
        minimumScore: 75,
        requiredDimensions: ['emotion', 'visual', 'detail'],
        skillThresholds: {
          clarity: 70,
          detail: 70,
          visual: 75,
          emotion: 75,
          structure: 60
        },
        timeLimit: 450 // 7-8分鐘
      },
      hints: [
        {
          trigger: 'low_creativity',
          content: '想想看動物朋友可能有什麼魔法能力？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'missing_personality',
          content: '你的動物朋友喜歡做什麼？性格如何？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'need_visual_details',
          content: '描述一下動物朋友的顏色和外貌特徵',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        }
      ]
    },
    {
      id: 'magical-home',
      name: '奇幻家園',
      description: '動物朋友住在哪裡？',
      order: 2,
      isRequired: true,
      prompt: {
        instruction: '你的動物朋友住在一個神奇的地方！描述這個家園的環境和特色',
        examples: [
          {
            level: 'basic',
            text: '動物朋友住在森林裡',
            explanation: '森林是個好地方！讓我們讓它更神奇',
            highlights: ['基本環境']
          },
          {
            level: 'good',
            text: '動物朋友住在竹林裡，那裡有很多彩色的竹子和花朵',
            explanation: '很好！有特色植物和色彩',
            highlights: ['環境特色', '色彩元素']
          },
          {
            level: 'excellent',
            text: '動物朋友住在夢幻竹林裡，這裡的竹子會發出柔和的七彩光芒，地上鋪滿了會唱歌的花瓣，天空中飄著棉花糖雲朵，還有會跳舞的蝴蝶和會發光的螢火蟲陪伴',
            explanation: '太夢幻了！充滿魔法色彩和互動元素！',
            highlights: ['魔法元素', '感官體驗', '互動生物', '夢幻氛圍', '豐富細節']
          }
        ],
        improvementAreas: [
          {
            skill: 'visual',
            weight: 0.35,
            keywords: ['七彩', '發光', '柔和', '閃亮', '夢幻', '彩色', '光芒'],
            requiredElements: ['色彩魔法', '光影效果', '視覺奇觀']
          },
          {
            skill: 'detail',
            weight: 0.25,
            keywords: ['竹子', '花瓣', '雲朵', '蝴蝶', '螢火蟲', '棉花糖'],
            requiredElements: ['環境元素', '生物描述', '材質特徵']
          },
          {
            skill: 'emotion',
            weight: 0.25,
            keywords: ['夢幻', '溫暖', '安全', '快樂', '舒適', '和諧'],
            requiredElements: ['氛圍營造', '情感體驗', '家的感覺']
          },
          {
            skill: 'structure',
            weight: 0.15,
            keywords: ['這裡', '地上', '天空中', '還有', '陪伴'],
            requiredElements: ['空間層次', '環境布局']
          }
        ],
        coaching: {
          parentGuidance: [
            '鼓勵孩子想像最美好的居住環境',
            '可以問：這裡有什麼特別的植物或動物？',
            '引導思考：什麼樣的地方讓人感到快樂？'
          ],
          childEncouragement: [
            '這個地方聽起來像仙境一樣美！',
            '我也想去這個神奇的地方！',
            '你創造了一個完美的家園！'
          ],
          technicalTips: [
            '從不同層次描述環境（地面、空中）',
            '加入會動的元素讓環境生動',
            '用感官描述營造氛圍'
          ],
          errorCorrection: [
            {
              errorType: '環境單調',
              detection: ['只有一種元素', '缺少變化'],
              correction: '這個地方還有什麼特別的東西？',
              encouragement: '讓我們讓這個家園更豐富多彩！'
            },
            {
              errorType: '缺少魔法感',
              detection: ['太現實', '沒有奇幻'],
              correction: '如果這是魔法世界，環境會有什麼神奇之處？',
              encouragement: '在魔法世界裡，一切都可能發生！'
            }
          ]
        }
      },
      expectedSkills: ['環境創造', '奇幻想像', '空間概念'],
      successCriteria: {
        minimumScore: 78,
        requiredDimensions: ['visual', 'detail', 'emotion'],
        skillThresholds: {
          clarity: 75,
          detail: 75,
          visual: 80,
          emotion: 70,
          structure: 65
        }
      },
      hints: [
        {
          trigger: 'low_visual_score',
          content: '想想這個地方有什麼特別的顏色和光線？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'need_magic_elements',
          content: '這裡有什麼神奇的植物或現象？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'missing_atmosphere',
          content: '在這個地方會有什麼感覺？溫暖？神秘？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        }
      ]
    },
    {
      id: 'friendship-activity',
      name: '友誼時光',
      description: '你和動物朋友一起做什麼？',
      order: 3,
      isRequired: true,
      prompt: {
        instruction: '描述你和動物朋友一起度過的美好時光！你們會做什麼有趣的活動？',
        examples: [
          {
            level: 'basic',
            text: '我和動物朋友一起玩',
            explanation: '一起玩很開心！告訴我們具體做什麼',
            highlights: ['基本互動']
          },
          {
            level: 'good',
            text: '我和熊貓朋友一起盪秋千，還分享彩虹竹子',
            explanation: '很棒！有具體活動和分享',
            highlights: ['具體活動', '分享行為']
          },
          {
            level: 'excellent',
            text: '我和彩虹一起在雲朵秋千上輕輕搖擺，一邊吃著甜甜的彩虹竹子冰淇淋，一邊看著蝴蝶們在空中跳舞，我們還用魔法讓花朵變成不同的形狀，互相分享今天最開心的事情',
            explanation: '太溫馨了！有豐富的互動、感官體驗和情感交流！',
            highlights: ['創意活動', '感官享受', '魔法互動', '情感分享', '多層次體驗']
          }
        ],
        improvementAreas: [
          {
            skill: 'emotion',
            weight: 0.35,
            keywords: ['開心', '溫馨', '甜甜', '分享', '快樂', '滿足', '愛'],
            requiredElements: ['情感交流', '友誼表達', '快樂體驗']
          },
          {
            skill: 'detail',
            weight: 0.25,
            keywords: ['秋千', '冰淇淋', '魔法', '花朵', '形狀', '活動'],
            requiredElements: ['具體活動', '互動細節', '共同體驗']
          },
          {
            skill: 'visual',
            weight: 0.25,
            keywords: ['雲朵', '彩虹', '跳舞', '搖擺', '變成', '不同'],
            requiredElements: ['動態畫面', '視覺變化', '美好場景']
          },
          {
            skill: 'structure',
            weight: 0.15,
            keywords: ['一起', '一邊...一邊', '還', '互相'],
            requiredElements: ['同步活動', '連續動作', '互動關係']
          }
        ],
        coaching: {
          parentGuidance: [
            '引導孩子思考真正的友誼是什麼',
            '可以問：你們最喜歡一起做什麼？',
            '鼓勵表達：和朋友在一起的感覺如何？'
          ],
          childEncouragement: [
            '你們的友誼真是太美好了！',
            '這樣的朋友真是太棒了！',
            '你懂得什麼是真正的友誼！'
          ],
          technicalTips: [
            '描述具體的共同活動',
            '表達互相關心和分享',
            '展現友誼的溫馨和快樂'
          ],
          errorCorrection: [
            {
              errorType: '互動太簡單',
              detection: ['只有一個活動', '太簡短'],
              correction: '你們還會一起做什麼有趣的事？',
              encouragement: '朋友之間有很多美好的時光！'
            },
            {
              errorType: '缺少情感',
              detection: ['沒有感受', '太冷淡'],
              correction: '和動物朋友在一起時你的心情如何？',
              encouragement: '友誼讓人感到溫暖和快樂'
            }
          ]
        }
      },
      expectedSkills: ['人際互動', '情感表達', '活動描述'],
      successCriteria: {
        minimumScore: 80,
        requiredDimensions: ['emotion', 'detail', 'visual'],
        skillThresholds: {
          clarity: 75,
          detail: 75,
          visual: 70,
          emotion: 80,
          structure: 70
        }
      },
      hints: [
        {
          trigger: 'low_emotion_score',
          content: '想想和好朋友在一起時的開心感覺',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'missing_interaction',
          content: '你們會互相分享什麼？一起做什麼？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'need_more_activities',
          content: '除了這個，你們還會一起做什麼有趣的事？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        }
      ]
    },
    {
      id: 'magical-adventure',
      name: '奇幻冒險',
      description: '一起展開神奇的冒險！',
      order: 4,
      isRequired: true,
      prompt: {
        instruction: '你和動物朋友一起遇到了什麼神奇的事情？描述這個奇幻冒險！',
        examples: [
          {
            level: 'basic',
            text: '我們去了一個新地方',
            explanation: '探索新地方很有趣！告訴我們發生了什麼',
            highlights: ['基本冒險']
          },
          {
            level: 'good',
            text: '我們發現了一個會唱歌的花園，還看到了會飛的魚',
            explanation: '很棒！有奇幻發現和神奇生物',
            highlights: ['奇幻發現', '神奇生物']
          },
          {
            level: 'excellent',
            text: '突然，彩虹告訴我牠聽到了哭聲！我們順著聲音找到了一朵傷心的小花，原來牠失去了顏色。彩虹溫柔地用魔法為小花重新塗上美麗的色彩，小花開心地笑了，整個花園都因此變得更加燦爛',
            explanation: '太感人了！有問題發現、合作解決和美好結果！',
            highlights: ['問題發現', '情感關懷', '魔法解決', '合作精神', '美好結果']
          }
        ],
        improvementAreas: [
          {
            skill: 'structure',
            weight: 0.3,
            keywords: ['突然', '原來', '順著', '因此', '最後'],
            requiredElements: ['事件發展', '因果關係', '故事脈絡']
          },
          {
            skill: 'emotion',
            weight: 0.3,
            keywords: ['傷心', '溫柔', '開心', '關懷', '幫助', '愛心'],
            requiredElements: ['情感變化', '同理心', '助人精神']
          },
          {
            skill: 'visual',
            weight: 0.25,
            keywords: ['色彩', '燦爛', '美麗', '魔法', '光芒', '變化'],
            requiredElements: ['視覺變化', '魔法效果', '美好畫面']
          },
          {
            skill: 'detail',
            weight: 0.15,
            keywords: ['哭聲', '小花', '失去', '重新', '塗上'],
            requiredElements: ['事件細節', '解決過程']
          }
        ],
        coaching: {
          parentGuidance: [
            '這個階段可以討論幫助他人的重要性',
            '可以問：遇到困難時朋友如何幫忙？',
            '引導思考：做好事的感覺如何？'
          ],
          childEncouragement: [
            '你們真是善良的好朋友！',
            '幫助別人是最棒的事情！',
            '這個冒險充滿了愛心！'
          ],
          technicalTips: [
            '按照發現問題→解決問題→美好結果的順序',
            '描述魔法的使用過程',
            '表達幫助他人後的快樂'
          ],
          errorCorrection: [
            {
              errorType: '情節太簡單',
              detection: ['沒有問題', '沒有解決'],
              correction: '在冒險中遇到了什麼需要幫助的？',
              encouragement: '真正的冒險總會有挑戰和收穫！'
            },
            {
              errorType: '缺少合作',
              detection: ['只有一個人', '沒有互動'],
              correction: '你和動物朋友是如何一起解決的？',
              encouragement: '朋友一起努力會更有力量！'
            }
          ]
        }
      },
      expectedSkills: ['故事發展', '問題解決', '合作精神'],
      successCriteria: {
        minimumScore: 82,
        requiredDimensions: ['structure', 'emotion', 'visual'],
        skillThresholds: {
          clarity: 80,
          detail: 75,
          visual: 75,
          emotion: 80,
          structure: 80
        }
      },
      hints: [
        {
          trigger: 'low_structure_score',
          content: '試著按順序說：發現什麼→怎麼幫忙→結果如何',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'missing_cooperation',
          content: '你和動物朋友是怎麼一起解決問題的？',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'need_magical_elements',
          content: '在這個冒險中有什麼神奇的魔法？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        }
      ]
    },
    {
      id: 'eternal-friendship',
      name: '永恆友誼',
      description: '友誼的美好承諾',
      order: 5,
      isRequired: false, // 選修階段
      prompt: {
        instruction: '在這個美好的一天結束時，你和動物朋友互相許下什麼承諾？',
        examples: [
          {
            level: 'basic',
            text: '我們約定永遠做朋友',
            explanation: '永遠做朋友很棒！說說你們的約定',
            highlights: ['友誼承諾']
          },
          {
            level: 'good',
            text: '我們約定要互相幫助，一起保護這個美麗的世界',
            explanation: '很有意義！有互助和保護環境的承諾',
            highlights: ['互助承諾', '環保意識']
          },
          {
            level: 'excellent',
            text: '夕陽西下時，我和彩虹手牽著手坐在雲朵上，我們約定無論走到哪裡都要記得彼此，用我們的愛心和魔法讓世界變得更美好，當夜空中出現第一顆星星時，我們一起許願希望所有的朋友都能快樂',
            explanation: '太感人了！有美好場景、深刻承諾和博愛精神！',
            highlights: ['浪漫場景', '深刻承諾', '博愛精神', '許願儀式', '詩意表達']
          }
        ],
        improvementAreas: [
          {
            skill: 'emotion',
            weight: 0.4,
            keywords: ['愛心', '記得', '快樂', '美好', '永遠', '珍惜', '感激'],
            requiredElements: ['深層情感', '友誼價值', '愛的表達']
          },
          {
            skill: 'visual',
            weight: 0.25,
            keywords: ['夕陽', '雲朵', '星星', '夜空', '手牽手', '許願'],
            requiredElements: ['美好場景', '儀式感', '詩意畫面']
          },
          {
            skill: 'structure',
            weight: 0.2,
            keywords: ['當...時', '無論', '一起', '希望'],
            requiredElements: ['承諾結構', '條件描述']
          },
          {
            skill: 'detail',
            weight: 0.15,
            keywords: ['承諾', '約定', '許願', '魔法', '保護'],
            requiredElements: ['具體承諾', '行動方案']
          }
        ],
        coaching: {
          parentGuidance: [
            '這是很好的品德教育機會',
            '可以討論友誼的珍貴和責任',
            '引導孩子思考如何做一個好朋友'
          ],
          childEncouragement: [
            '你懂得友誼的真正意義！',
            '這樣的承諾太美好了！',
            '你有一顆善良的心！'
          ],
          technicalTips: [
            '用美好的場景烘托友誼的珍貴',
            '表達對友誼的珍視和承諾',
            '展現願意為世界做好事的心願'
          ],
          errorCorrection: [
            {
              errorType: '承諾太簡單',
              detection: ['太短', '沒有具體'],
              correction: '你們具體約定要做什麼？',
              encouragement: '真正的承諾需要具體的行動！'
            }
          ]
        }
      },
      expectedSkills: ['情感深度', '價值觀表達', '承諾意識'],
      successCriteria: {
        minimumScore: 80,
        requiredDimensions: ['emotion', 'visual', 'structure'],
        skillThresholds: {
          clarity: 75,
          detail: 70,
          visual: 75,
          emotion: 85,
          structure: 70
        }
      },
      hints: [
        {
          trigger: 'low_emotion_score',
          content: '想想友誼對你來說有多重要',
          priority: 'high',
          timing: 'during',
          audience: 'child'
        },
        {
          trigger: 'missing_commitment',
          content: '你們想一起做什麼美好的事情？',
          priority: 'medium',
          timing: 'during',
          audience: 'child'
        }
      ]
    }
  ],
  defaults: {
    difficulty: {
      adaptiveLevel: 80,
      skillWeights: {
        clarity: 0.15,
        detail: 0.20,
        emotion: 0.30,
        visual: 0.25,
        structure: 0.10
      },
      hintFrequency: 'minimal',
      exampleComplexity: 'complex',
      evaluationStrict: 0.8
    },
    coaching: {
      parentGuidance: [
        '這個模板適合8-14歲有一定創作基礎的孩子',
        '鼓勵發揮最大的創意和想像力',
        '可以討論友誼、善良和環保等價值觀'
      ],
      childEncouragement: [
        '你的創意超越了我的想像！',
        '這個故事太感人了！',
        '你有著最美好的心靈！'
      ],
      technicalTips: [
        '結合現實與奇幻，創造獨特世界觀',
        '注重情感表達和價值觀傳遞',
        '用豐富的感官描述營造氛圍'
      ],
      errorCorrection: []
    },
    progression: {
      autoAdvance: false, // 需要手動確認，因為難度較高
      retryLimit: 4,
      masteryThreshold: 80,
      skipConditions: [
        {
          skill: 'emotion',
          minimumLevel: 85,
          allowSkip: true // 情感表達很好可以跳過最後階段
        }
      ]
    }
  },
  customization: {
    allowedFields: ['difficulty', 'examples', 'hints', 'magical_elements'],
    constraints: {
      minimumScore: { min: 70, max: 95 },
      timeLimit: { min: 300, max: 900 }
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
      'estimatedDuration': { min: 20, max: 35 }
    },
    custom: []
  }
};

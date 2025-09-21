/**
 * 模板管理器
 * 提供预设的视频模板和场景定义
 */

import { SceneDefinition } from '../core/video-generator';

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;  // 总时长（秒）
  scenes: SceneDefinition[];
  defaultOptions?: {
    ttsVoice?: string;
    ttsEngine?: string;
    musicStyle?: string;
    subtitleStyle?: string;
  };
}

export class TemplateManager {
  private templates: Map<string, VideoTemplate>;

  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  /**
   * 初始化内置模板
   */
  private initializeTemplates(): void {
    // 唐僧找工作模板
    this.addTemplate({
      id: 'tang-monk-job',
      name: '唐僧找工作',
      description: '幽默风格的求职视频，展现唐僧团队的独特能力',
      category: 'comedy',
      duration: 60,
      scenes: [
        {
          prompt: '唐僧身穿袈裟，手持简历，站在现代化办公楼前，表情认真而虔诚。背景是繁华的CBD商务区，玻璃幕墙反射着阳光。画面采用电影级质感，景深效果突出人物',
          dialogue: { text: '我是唐僧，刚从西天取经回来，正在找工作' },
          emotion: 'serious'
        },
        {
          prompt: '面试官坐在现代化办公室里，桌上放着唐僧的简历，表情既惊讶又好奇。办公室装修豪华，落地窗外是城市天际线。镜头从面试官的肩膀后方拍摄',
          dialogue: {
            question: '您有什么工作经验？',
            answer: '我带过团队，去西天取过经'
          },
          emotion: 'professional'
        },
        {
          prompt: '唐僧陷入沉思，画面切换到回忆场景：孙悟空大战妖怪、八戒挑担、沙僧护航的蒙太奇画面。特效炫酷，动作场面激烈，展现团队协作',
          dialogue: {
            question: '遇到困难怎么办？',
            answer: '念经，找徒弟帮忙'
          },
          emotion: 'nostalgic'
        },
        {
          prompt: '孙悟空在云端翻筋斗，七十二变特效炫目。画面展示各种变化形态：老鹰、老虎、巨人等，每个形态都栩栩如生，CG特效精良',
          dialogue: { text: '我的徒弟们都很优秀，悟空会七十二变' },
          emotion: 'proud'
        },
        {
          prompt: '猪八戒在自助餐厅大快朵颐，但依然保持憨厚可爱的形象。背景其他食客都在惊讶地看着他。画面温馨有趣，色彩明亮',
          dialogue: { text: '八戒虽然贪吃，但是很忠诚' },
          emotion: 'humorous'
        },
        {
          prompt: '唐僧双手合十，站在公司logo前，背景是现代化的办公环境与西游记元素的创意融合。金光从天而降，营造神圣氛围。画面庄严而不失现代感',
          dialogue: { text: '请给我一个机会，阿弥陀佛' },
          emotion: 'hopeful'
        }
      ],
      defaultOptions: {
        ttsVoice: 'zh-CN-YunxiNeural',
        ttsEngine: 'edge-tts',
        musicStyle: 'comedy',
        subtitleStyle: 'Question'
      }
    });

    // 产品推广模板
    this.addTemplate({
      id: 'product-promo',
      name: '产品推广',
      description: '专业的产品展示和功能介绍',
      category: 'business',
      duration: 60,
      scenes: [
        {
          prompt: '产品包装盒360度旋转展示，背景是纯白的无限空间，专业摄影灯光，苹果风格的极简美学',
          dialogue: { text: '全新产品震撼发布，改变你的生活方式' },
          emotion: 'exciting'
        },
        {
          prompt: '产品细节特写，展示精湛工艺和高端材质，微距镜头拍摄纹理和光泽',
          dialogue: { text: '精选顶级材料，匠心工艺打造' },
          emotion: 'professional'
        },
        {
          prompt: '用户在日常场景中使用产品，展现产品融入生活的自然状态',
          dialogue: { text: '简单易用，轻松上手，适合各种场景' },
          emotion: 'casual'
        },
        {
          prompt: '产品核心功能演示，动态展示产品的独特卖点和创新之处',
          dialogue: { text: '独家专利技术，行业领先性能' },
          emotion: 'confident'
        },
        {
          prompt: '多个用户的使用体验和好评展示，真实可信的见证',
          dialogue: { text: '千万用户的共同选择，好评如潮' },
          emotion: 'trustworthy'
        },
        {
          prompt: '产品logo和购买信息展示，优惠价格突出显示，行动号召按钮醒目',
          dialogue: { text: '限时特惠，立即抢购，改变从现在开始' },
          emotion: 'urgent'
        }
      ],
      defaultOptions: {
        ttsVoice: 'zh-CN-XiaoxiaoNeural',
        ttsEngine: 'edge-tts',
        musicStyle: 'corporate',
        subtitleStyle: 'Default'
      }
    });

    // 教育科普模板
    this.addTemplate({
      id: 'education',
      name: '教育科普',
      description: '知识分享和教育内容',
      category: 'education',
      duration: 60,
      scenes: [
        {
          prompt: '引人注目的问题或现象展示，激发观众好奇心',
          dialogue: { text: '你知道吗？这个现象背后隐藏着惊人的科学原理' },
          emotion: 'curious'
        },
        {
          prompt: '基础概念的可视化解释，使用图表和动画辅助理解',
          dialogue: { text: '首先，让我们了解一下基本概念' },
          emotion: 'educational'
        },
        {
          prompt: '深入原理的动态演示，展示内在机制和运作过程',
          dialogue: { text: '其实原理很简单，让我来演示给你看' },
          emotion: 'explanatory'
        },
        {
          prompt: '实际应用场景展示，连接理论与实践',
          dialogue: { text: '这个原理在生活中随处可见' },
          emotion: 'practical'
        },
        {
          prompt: '常见误区澄清和正确方法展示',
          dialogue: { text: '很多人都理解错了，正确的是这样' },
          emotion: 'corrective'
        },
        {
          prompt: '知识要点总结，强化记忆，鼓励进一步学习',
          dialogue: { text: '记住这三个要点，你也能成为专家' },
          emotion: 'encouraging'
        }
      ],
      defaultOptions: {
        ttsVoice: 'zh-CN-XiaoyiNeural',
        ttsEngine: 'edge-tts',
        musicStyle: 'educational',
        subtitleStyle: 'Default'
      }
    });

    // 美食制作模板
    this.addTemplate({
      id: 'cooking',
      name: '美食制作',
      description: '展示美食制作过程和成品',
      category: 'lifestyle',
      duration: 60,
      scenes: [
        {
          prompt: '食材整齐摆放的俯拍镜头，新鲜诱人，色彩鲜艳',
          dialogue: { text: '今天教大家做一道简单又美味的菜' },
          emotion: 'welcoming'
        },
        {
          prompt: '准备工作特写，切菜、调料等预处理过程',
          dialogue: { text: '准备好这些食材，开始我们的美食之旅' },
          emotion: 'preparatory'
        },
        {
          prompt: '烹饪过程动态拍摄，锅中食物的变化，蒸汽和火焰效果',
          dialogue: { text: '关键步骤来了，火候和时机很重要' },
          emotion: 'focused'
        },
        {
          prompt: '调味和装饰的细节展示，展现厨师的用心',
          dialogue: { text: '秘诀就在这个调料，让味道更上一层楼' },
          emotion: 'detailed'
        },
        {
          prompt: '成品360度展示，精美摆盘，让人垂涎欲滴',
          dialogue: { text: '看，色香味俱全，是不是很有食欲' },
          emotion: 'proud'
        },
        {
          prompt: '品尝画面和满意表情，分享制作心得',
          dialogue: { text: '简单几步就能做出餐厅级美食，你也试试吧' },
          emotion: 'satisfied'
        }
      ],
      defaultOptions: {
        ttsVoice: 'zh-CN-XiaoxiaoNeural',
        ttsEngine: 'edge-tts',
        musicStyle: 'upbeat',
        subtitleStyle: 'Default'
      }
    });

    // 旅行日记模板
    this.addTemplate({
      id: 'travel-vlog',
      name: '旅行日记',
      description: '记录旅行见闻和体验',
      category: 'lifestyle',
      duration: 60,
      scenes: [
        {
          prompt: '目的地标志性景观的震撼航拍，展现壮美风光',
          dialogue: { text: '终于来到了梦想中的地方' },
          emotion: 'amazed'
        },
        {
          prompt: '当地特色文化体验，与当地人互动的温馨画面',
          dialogue: { text: '这里的文化太有意思了，每个细节都是故事' },
          emotion: 'cultural'
        },
        {
          prompt: '美食探店，品尝当地特色美食的享受表情',
          dialogue: { text: '必须尝尝这里的特色美食，太地道了' },
          emotion: 'delighted'
        },
        {
          prompt: '探索隐藏景点，发现小众但绝美的风景',
          dialogue: { text: '偶然发现的小众景点，简直是意外惊喜' },
          emotion: 'adventurous'
        },
        {
          prompt: '日落或夜景的唯美画面，记录旅行中的浪漫时刻',
          dialogue: { text: '这一刻的美景，值得永远记住' },
          emotion: 'romantic'
        },
        {
          prompt: '旅行感悟分享，背景是整个旅程的精彩回顾',
          dialogue: { text: '旅行的意义不是目的地，而是沿途的风景和心情' },
          emotion: 'reflective'
        }
      ],
      defaultOptions: {
        ttsVoice: 'zh-CN-XiaoyiNeural',
        ttsEngine: 'edge-tts',
        musicStyle: 'travel',
        subtitleStyle: 'Narration'
      }
    });
  }

  /**
   * 添加模板
   */
  addTemplate(template: VideoTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * 获取模板
   */
  getTemplate(id: string): VideoTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): VideoTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 按分类获取模板
   */
  getTemplatesByCategory(category: string): VideoTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  /**
   * 获取模板分类列表
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const template of this.templates.values()) {
      categories.add(template.category);
    }
    return Array.from(categories);
  }

  /**
   * 从JSON加载自定义模板
   */
  loadCustomTemplate(jsonPath: string): VideoTemplate {
    const fs = require('fs-extra');
    const templateData = fs.readJsonSync(jsonPath);
    this.addTemplate(templateData);
    return templateData;
  }

  /**
   * 导出模板为JSON
   */
  exportTemplate(id: string, outputPath: string): void {
    const fs = require('fs-extra');
    const template = this.getTemplate(id);
    if (template) {
      fs.writeJsonSync(outputPath, template, { spaces: 2 });
    } else {
      throw new Error(`模板不存在: ${id}`);
    }
  }

  /**
   * 创建自定义模板
   */
  createCustomTemplate(
    name: string,
    scenes: SceneDefinition[],
    options?: Partial<VideoTemplate>
  ): VideoTemplate {
    const template: VideoTemplate = {
      id: `custom-${Date.now()}`,
      name,
      description: options?.description || '自定义模板',
      category: options?.category || 'custom',
      duration: scenes.length * 10,
      scenes,
      defaultOptions: options?.defaultOptions
    };

    this.addTemplate(template);
    return template;
  }

  /**
   * 验证模板
   */
  validateTemplate(template: VideoTemplate): boolean {
    // 检查必要字段
    if (!template.id || !template.name || !template.scenes) {
      return false;
    }

    // 检查场景数量（必须是6个）
    if (template.scenes.length !== 6) {
      return false;
    }

    // 检查每个场景都有prompt
    for (const scene of template.scenes) {
      if (!scene.prompt) {
        return false;
      }
    }

    return true;
  }
}
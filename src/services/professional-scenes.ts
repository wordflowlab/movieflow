/**
 * 专业格式场景预设
 * 包含详细的镜头语言和分镜信息
 */

export interface ProfessionalScene {
  // 基础信息
  index: number;
  prompt: string;
  audio: string;
  duration?: number;

  // 专业镜头语言
  shotNumber: number;
  shotType: string;
  timeCode: {
    start: string;
    end: string;
    duration: number;
  };
  cameraWork: string;
  transition: string;

  // 画面层次
  layers: {
    foreground?: string;
    midground: string;
    background: string;
    depth: 'shallow' | 'medium' | 'deep';
    focusPoint: string;
  };

  // 视觉效果
  visualEffects?: {
    colorTone: string;
    lighting: string;
    atmosphere: string;
    specialEffects?: string[];
  };

  // 制作备注
  notes?: string;
}

/**
 * 唐僧找工作 - 专业分镜场景
 */
export const TANG_MONK_PROFESSIONAL_SCENES: ProfessionalScene[] = [
  {
    index: 0,
    prompt: "Q版唐僧站在古色古香的寺庙前，背景青山绿水，阳光温暖，卡通风格，可爱形象，前景有寺庙台阶，中景唐僧身穿红色袈裟手持锡杖，背景青山绿水",
    audio: "你是做什么工作的？贫僧刚从西天取经回来，正在找工作",
    duration: 10,
    shotNumber: 1,
    shotType: "中景",
    timeCode: {
      start: "00:00:00",
      end: "00:00:10",
      duration: 10
    },
    cameraWork: "固定镜头",
    transition: "淡入",
    layers: {
      foreground: "寺庙石阶和栏杆",
      midground: "Q版唐僧站立，红色袈裟，手持锡杖",
      background: "青山绿水，祥云缭绕",
      depth: "deep",
      focusPoint: "唐僧面部表情"
    },
    visualEffects: {
      colorTone: "暖色调",
      lighting: "自然光，金色阳光",
      atmosphere: "祥和宁静",
      specialEffects: ["光晕效果", "粒子飘落"]
    },
    notes: "开场镜头，建立人物形象和环境氛围"
  },
  {
    index: 1,
    prompt: "Q版唐僧展示经书，背景是西天取经路线图，冒险地图风格，色彩鲜艳，特写唐僧翻阅经书的双手，经书发出金光",
    audio: "那你有什么工作经验？贫僧走了十四年，管理过三个问题员工",
    duration: 10,
    shotNumber: 2,
    shotType: "特写",
    timeCode: {
      start: "00:00:10",
      end: "00:00:20",
      duration: 10
    },
    cameraWork: "推镜",
    transition: "硬切",
    layers: {
      foreground: "经书特写，金光闪烁",
      midground: "唐僧的手和局部身体",
      background: "西天取经路线图，地图风格",
      depth: "shallow",
      focusPoint: "经书和手部动作"
    },
    visualEffects: {
      colorTone: "鲜艳饱和",
      lighting: "金色光效",
      atmosphere: "神秘冒险",
      specialEffects: ["经书发光", "地图动画", "路线轨迹"]
    },
    notes: "展示专业能力和经验背景"
  },
  {
    index: 2,
    prompt: "Q版唐僧与女儿国国王的可爱形象，花园背景，粉色浪漫氛围，少女心风格，远景展现两人在花园中相遇的场景",
    audio: "谈过恋爱吗？女儿国国王曾经追求过贫僧，但贫僧志在事业",
    duration: 10,
    shotNumber: 3,
    shotType: "远景",
    timeCode: {
      start: "00:00:20",
      end: "00:00:30",
      duration: 10
    },
    cameraWork: "横摇",
    transition: "溶解",
    layers: {
      foreground: "花瓣飘落效果",
      midground: "唐僧和女儿国国王的互动",
      background: "梦幻花园，粉色基调",
      depth: "medium",
      focusPoint: "两个角色的互动"
    },
    visualEffects: {
      colorTone: "粉色浪漫",
      lighting: "柔光滤镜",
      atmosphere: "梦幻温馨",
      specialEffects: ["花瓣飘落", "爱心泡泡", "柔焦效果"]
    },
    notes: "回忆片段，展现感情经历"
  },
  {
    index: 3,
    prompt: "Q版唐僧念经，妖怪抱头痛苦的搞笑场景，金光闪闪效果，动作夸张，中特写展现唐僧专注念经和妖怪痛苦表情的对比",
    audio: "你有什么特长？贫僧念经功力深厚，能让妖怪头痛欲裂",
    duration: 10,
    shotNumber: 4,
    shotType: "中特写",
    timeCode: {
      start: "00:00:30",
      end: "00:00:40",
      duration: 10
    },
    cameraWork: "跟拍",
    transition: "擦除",
    layers: {
      foreground: "金光波纹效果",
      midground: "唐僧念经，妖怪抱头",
      background: "简化的战斗场景",
      depth: "shallow",
      focusPoint: "表情对比"
    },
    visualEffects: {
      colorTone: "高对比度",
      lighting: "金色圣光",
      atmosphere: "喜剧夸张",
      specialEffects: ["音波攻击", "头顶冒星", "震动效果", "漫画速度线"]
    },
    notes: "展示特殊技能，增加喜剧效果"
  },
  {
    index: 4,
    prompt: "Q版师徒四人站在一起，孙悟空挥棒、猪八戒吃东西、沙僧扛担，团队形象，中远景展现完整团队阵容",
    audio: "遇到困难怎么办？贫僧有专业团队，悟空能打，八戒能吃，沙僧能扛",
    duration: 10,
    shotNumber: 5,
    shotType: "中远景",
    timeCode: {
      start: "00:00:40",
      end: "00:00:50",
      duration: 10
    },
    cameraWork: "升降镜头",
    transition: "滑动",
    layers: {
      foreground: "团队标志性道具",
      midground: "四人团队阵型",
      background: "西行路上的风景",
      depth: "deep",
      focusPoint: "团队整体"
    },
    visualEffects: {
      colorTone: "明亮活泼",
      lighting: "均匀照明",
      atmosphere: "团队协作",
      specialEffects: ["角色特效", "动作线条", "团队光环"]
    },
    notes: "展示团队合作能力"
  },
  {
    index: 5,
    prompt: "白龙马变身豪华跑车的魔法转换场景，闪光特效，搞笑风格，现代元素，全景展现变身过程和现代都市背景",
    audio: "有车有房吗？贫僧有一匹能变豪车的白龙马，大雷音寺还分配了禅房",
    duration: 10,
    shotNumber: 6,
    shotType: "全景",
    timeCode: {
      start: "00:00:50",
      end: "00:01:00",
      duration: 10
    },
    cameraWork: "拉镜",
    transition: "淡出",
    layers: {
      foreground: "变身特效和光粒子",
      midground: "白龙马到跑车的变形过程",
      background: "现代都市天际线",
      depth: "deep",
      focusPoint: "变身瞬间"
    },
    visualEffects: {
      colorTone: "金色夕阳",
      lighting: "魔法光效",
      atmosphere: "现代融合",
      specialEffects: ["变形动画", "闪电效果", "烟雾特效", "镜头光斑"]
    },
    notes: "结尾镜头，展现现代适应力，幽默收尾"
  }
];

/**
 * 将专业场景转换为简单格式（向后兼容）
 */
export function convertToSimpleFormat(scenes: ProfessionalScene[]): Array<{prompt: string, audio: string}> {
  return scenes.map(scene => ({
    prompt: scene.prompt,
    audio: scene.audio
  }));
}

/**
 * 生成专业脚本文档
 */
export function generateProfessionalScript(scenes: ProfessionalScene[]): string {
  let script = `# 专业分镜脚本\n\n`;
  script += `## 项目信息\n`;
  script += `- 总时长：${scenes.length * 10}秒\n`;
  script += `- 镜头数：${scenes.length}\n`;
  script += `- 格式：9:16竖屏\n\n`;

  script += `## 分镜表\n\n`;
  script += `| 镜头 | 时间码 | 景别 | 运镜 | 画面描述 | 音频/台词 | 转场 |\n`;
  script += `|------|--------|------|------|----------|-----------|------|\n`;

  scenes.forEach(scene => {
    const layerDesc = `前景:${scene.layers.foreground || '无'}, 中景:${scene.layers.midground}, 背景:${scene.layers.background}`;
    script += `| ${String(scene.shotNumber).padStart(3, '0')} | ${scene.timeCode.start}-${scene.timeCode.end.split(':').slice(1).join(':')} | ${scene.shotType} | ${scene.cameraWork} | ${layerDesc} | "${scene.audio}" | ${scene.transition} |\n`;
  });

  script += `\n## 视觉效果说明\n\n`;
  scenes.forEach(scene => {
    if (scene.visualEffects) {
      script += `### 镜头${scene.shotNumber}\n`;
      script += `- 色调：${scene.visualEffects.colorTone}\n`;
      script += `- 光线：${scene.visualEffects.lighting}\n`;
      script += `- 氛围：${scene.visualEffects.atmosphere}\n`;
      if (scene.visualEffects.specialEffects) {
        script += `- 特效：${scene.visualEffects.specialEffects.join(', ')}\n`;
      }
      script += `\n`;
    }
  });

  return script;
}
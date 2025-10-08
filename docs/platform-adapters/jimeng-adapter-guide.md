# 即梦AI 平台适配器使用指南

## 概述

本指南说明如何使用 `JimengAdapter` 与 `StandardVideoPrompt` 配合,实现跨平台视频生成。

**核心优势**:
- ✅ 使用统一的 `StandardVideoPrompt` 格式
- ✅ 自动转换为即梦AI的详细中文格式
- ✅ 支持首尾帧控制(即梦特色)

---

## 1. 快速开始

### 1.1 基础使用

```typescript
import { JimengAdapter, StandardVideoPrompt } from '@/adapters/platform-adapters';

// 初始化适配器(需要火山引擎凭证)
const jimeng = new JimengAdapter(
  process.env.VOLCANO_ACCESS_KEY,
  process.env.VOLCANO_SECRET_KEY
);

// 定义标准提示词
const standardPrompt: StandardVideoPrompt = {
  sceneId: 'scene-01',
  sceneName: '开场场景',
  duration: 10,
  aspectRatio: '9:16',

  visual: {
    foreground: '飘落的桃花花瓣',
    midground: '一位28岁的女性,身穿红色旗袍',
    background: '古典园林,假山流水'
  },

  camera: {
    shotSize: 'MS',
    movement: 'fixed'
  },

  firstLastFrame: {
    firstFrame: '女性站立,面向镜头',
    lastFrame: '女性转身背对镜头'
  }
};

// 转换为即梦格式
const platformPrompt = await jimeng.convertPrompt(standardPrompt);

// 提交任务
const taskId = await jimeng.submitTask(platformPrompt);

// 查询状态
const task = await jimeng.queryTask(taskId);

// 下载结果
if (task.status === 'completed') {
  const result = await jimeng.downloadVideo(taskId, './outputs/scene-01.mp4');
}
```

---

## 2. StandardVideoPrompt 到即梦AI 的转换

### 2.1 视觉层次转换(中文化)

**StandardVideoPrompt 输入**:
```typescript
visual: {
  foreground: 'Falling cherry blossom petals',
  midground: 'A 28-year-old woman in traditional dress',
  background: 'Ancient garden with pavilion'
}
```

**即梦AI 输出**(自动中文化):
```
前景: 飘落的樱花花瓣，主体: 一位28岁的女性穿着传统服饰，背景: 古典园林亭台
```

**转换特点**:
- ✅ 自动使用中文标签: `前景:`, `主体:`, `背景:`
- ✅ 即梦AI对详细中文描述理解最好
- ✅ 如果原本是中文,则保持原样

---

### 2.2 首尾帧控制 ⭐核心优势⭐

**StandardVideoPrompt 输入**:
```typescript
firstLastFrame: {
  firstFrame: '女性站立,面向镜头,身穿红色旗袍',
  lastFrame: '女性转身背对镜头,旗袍摆动'
}
```

**即梦AI 输出**:
```
首帧: 女性站立,面向镜头,身穿红色旗袍；尾帧: 女性转身背对镜头,旗袍摆动。[其余描述...]
```

**转换特点**:
- 首尾帧描述会前置到提示词开头
- 使用中文标记: `首帧:` 和 `尾帧:`
- **重要**: 这是即梦AI独有功能,Sora2不支持

**最佳实践**:
```typescript
// ✅ 正确: 首尾帧保持角色/场景一致
firstLastFrame: {
  firstFrame: '女性站立,红色旗袍,玉镯在左手',
  lastFrame: '女性坐下,同样红色旗袍,玉镯仍在左手'
}

// ❌ 错误: 首尾帧差异过大
firstLastFrame: {
  firstFrame: '女性站立,白天,花园',
  lastFrame: '男性坐下,夜晚,室内' // 角色和场景完全不同
}
```

---

### 2.3 相机运动转换(中文映射)

**StandardVideoPrompt 输入**:
```typescript
camera: {
  shotSize: 'MS',
  movement: 'dolly'
}
```

**即梦AI 输出**:
```
景别: 中景，运镜: 推拉镜头
```

**景别映射表**:
| 代码 | 即梦中文 | 英文 |
|------|---------|------|
| EWS | 超远景 | Extreme Wide Shot |
| WS | 远景 | Wide Shot |
| FS | 全景 | Full Shot |
| MS | 中景 | Medium Shot |
| MCU | 中近景 | Medium Close-Up |
| CU | 近景 | Close-Up |
| ECU | 特写 | Extreme Close-Up |

**运镜映射表**:
| 代码 | 即梦中文 |
|------|---------|
| fixed | 固定镜头 |
| dolly | 推拉镜头 |
| crane | 升降镜头 |
| pan | 横摇镜头 |
| tilt | 俯仰镜头 |
| zoom | 变焦镜头 |
| tracking | 跟踪镜头 |

---

### 2.4 光照与色彩转换

**StandardVideoPrompt 输入**:
```typescript
lighting: {
  style: 'Soft afternoon sunlight',
  timeOfDay: 'afternoon',
  mood: 'warm and peaceful'
},

colorGrading: {
  style: 'Vintage warm tones',
  palette: ['golden yellow', 'soft pink', 'sage green'],
  mood: 'nostalgic'
}
```

**即梦AI 输出**:
```
光照: Soft afternoon sunlight，时间: afternoon，氛围: warm and peaceful。
色调: Vintage warm tones，配色: golden yellow、soft pink、sage green。
```

**转换特点**:
- 保持原文(即梦AI也能理解英文,但中文更佳)
- 使用中文标签组织结构

**优化建议** - 使用中文描述:
```typescript
lighting: {
  style: '柔和的午后阳光',
  timeOfDay: '下午',
  mood: '温暖宁静'
},

colorGrading: {
  style: '复古暖色调',
  palette: ['金黄色', '粉红色', '青绿色'],
  mood: '怀旧'
}
```

输出会更优:
```
光照: 柔和的午后阳光，时间: 下午，氛围: 温暖宁静。
色调: 复古暖色调，配色: 金黄色、粉红色、青绿色。
```

---

### 2.5 物理描述转换

**StandardVideoPrompt 输入**:
```typescript
physics: {
  objectWeight: 'heavy, 3kg',
  motion: 'chef lifts with both hands'
}
```

**即梦AI 输出**:
```
重量: heavy, 3kg，动作: chef lifts with both hands
```

**注意**: 即梦AI对物理描述的理解不如Sora2精确,但仍会尝试模拟

---

### 2.6 对话处理(无lip-sync)

**StandardVideoPrompt 输入**:
```typescript
dialogue: [
  {
    speaker: 'Woman',
    text: 'It has been ten years',
    timing: { start: 3, end: 5 },
    lipSync: true, // 即梦AI会忽略此标记
    emotion: 'melancholic'
  }
]
```

**即梦AI 输出**:
```
对话动作: Woman，说"It has been ten years"，情绪: melancholic
```

**重要区别**:
- ⚠️ 即梦AI **不支持真正的lip-sync**
- 对话仅作为"动作指导"处理
- 如果需要lip-sync,必须使用Sora2

**替代方案**:
```typescript
// 将对话转为动作描述
visual: {
  midground: '女性张嘴说话,表情忧郁,口型模糊处理(不强调lip-sync)'
}
```

---

## 3. 完整转换示例

### 示例1: 中国风场景(即梦优势)

**StandardVideoPrompt**:
```typescript
{
  sceneId: 'scene-chinese-01',
  sceneName: '古典园林转身',
  duration: 10,
  aspectRatio: '9:16',

  visual: {
    foreground: '飘落的桃花花瓣',
    midground: '一位28岁的女性,身穿红色旗袍,玉镯在左手腕',
    background: '古典园林,假山流水,午后阳光'
  },

  camera: {
    shotSize: 'MS',
    movement: 'fixed'
  },

  lighting: {
    style: '柔和的午后阳光',
    timeOfDay: '下午',
    mood: '温暖宁静'
  },

  colorGrading: {
    style: '暖色调',
    palette: ['金黄', '粉红', '浅绿'],
    mood: '复古'
  },

  firstLastFrame: {
    firstFrame: '女性站立,面向镜头',
    lastFrame: '女性转身背对镜头,旗袍摆动'
  }
}
```

**JimengAdapter 转换后**:
```
首帧: 女性站立,面向镜头；尾帧: 女性转身背对镜头,旗袍摆动。

前景: 飘落的桃花花瓣，主体: 一位28岁的女性,身穿红色旗袍,玉镯在左手腕，背景: 古典园林,假山流水,午后阳光。

景别: 中景，运镜: 固定镜头。

光照: 柔和的午后阳光，时间: 下午，氛围: 温暖宁静。

色调: 暖色调，配色: 金黄、粉红、浅绿。
```

**估算成本**: 10秒 × ¥17/秒 = **¥170**
**估算时间**: 约3分钟

**为何适合即梦**:
- ✅ 中文文化内容(园林、旗袍、玉镯)
- ✅ 首尾帧精确控制(转身动作)
- ✅ 性价比高(比Sora2便宜43%)
- ✅ 无需对话同步

---

### 示例2: 美食制作(规避手部)

**StandardVideoPrompt**:
```typescript
{
  sceneId: 'scene-food-01',
  sceneName: '宋代点茶',
  duration: 10,
  aspectRatio: '16:9',

  visual: {
    midground: '30岁女性在茶席前点茶,手部动作柔和(略微虚焦)',
    background: '宋代书房,竹影窗外'
  },

  camera: {
    shotSize: 'MS',
    movement: 'dolly'
  },

  lighting: {
    style: '自然窗光',
    timeOfDay: '清晨',
    mood: '宁静'
  },

  firstLastFrame: {
    firstFrame: '女性坐在茶席前,茶具齐备',
    lastFrame: '茶碗特写,奶白色泡沫'
  }
}
```

**JimengAdapter 转换后**:
```
首帧: 女性坐在茶席前,茶具齐备；尾帧: 茶碗特写,奶白色泡沫。

主体: 30岁女性在茶席前点茶,手部动作柔和(略微虚焦)，背景: 宋代书房,竹影窗外。

景别: 中景，运镜: 推拉镜头。

光照: 自然窗光，时间: 清晨，氛围: 宁静。
```

**手部处理技巧**:
- ✅ 描述中加入"手部略微虚焦"
- ✅ 尾帧切换到茶碗特写(避开手部)
- ✅ 动作描述为"柔和"而非"手指细节"

---

## 4. 平台能力检查

### 4.1 使用 `validatePrompt`

```typescript
const validation = jimeng.validatePrompt(standardPrompt);

if (!validation.isValid) {
  console.warn('⚠️ Warnings:');
  validation.warnings.forEach(w => console.log(`  - ${w}`));
}

if (validation.suggestions.length > 0) {
  console.log('💡 Suggestions:');
  validation.suggestions.forEach(s => console.log(`  - ${s}`));
}
```

**示例输出(包含lip-sync警告)**:
```
⚠️ Warnings:
  - Lip sync requested but not supported by platform. Consider using Sora2 (excellent lip-sync support)

Estimated cost: ¥170
Estimated time: 3 minutes
```

### 4.2 即梦能力清单

```typescript
const caps = jimeng.capabilities;

console.log(`Platform: ${caps.name}`);
console.log(`Max Duration: ${caps.maxDuration}s`);
console.log(`Lip Sync: ${caps.hasLipSync ? '✓' : '✗'}`);
console.log(`First/Last Frame: ${caps.hasFirstLastFrame ? '✓' : '✗'}`);
console.log(`Cost: ¥${caps.costPerSecond}/sec`);
```

**输出**:
```
Platform: 即梦AI v3.0 Pro
Max Duration: 10s
Lip Sync: ✗
First/Last Frame: ✓
Cost: ¥17/sec
```

---

## 5. 最佳实践

### 5.1 何时选择 JimengAdapter

**强烈推荐**:
- ✅ 中文文化内容(宋代、民国、古风)
- ✅ 需要首尾帧精确控制
- ✅ 预算有限(¥17/秒)
- ✅ 静态或简单动作场景
- ✅ 团队熟悉中文描述

**不推荐**:
- ❌ 需要对话唇形同步
- ❌ 大量手部特写
- ❌ 需要长视频(>10秒)
- ❌ 需要数值化相机控制

### 5.2 充分利用即梦优势

**首尾帧控制模板**:
```typescript
firstLastFrame: {
  firstFrame: '[角色]在[位置],[状态A],[关键特征保持一致]',
  lastFrame: '[同一角色]在[同一位置],[状态B],[关键特征仍一致]'
}
```

**示例**:
```typescript
firstLastFrame: {
  firstFrame: '女性站在窗前,红色旗袍,玉镯在左手,面向窗外',
  lastFrame: '女性转身,红色旗袍,玉镯在左手,面向镜头微笑'
}
```

**中文详细描述模板**:
```typescript
visual: {
  midground: `
    [年龄]岁的[性别],
    身穿[详细服装描述],
    [配饰列表],
    在[地点]进行[动作],
    表情[情绪],
    [其他细节]
  `
}
```

### 5.3 手部处理策略

**策略1: 虚焦处理**
```typescript
visual: {
  midground: '女性端起茶杯(手部略微虚焦,焦点在面部)'
}
```

**策略2: 远景规避**
```typescript
camera: {
  shotSize: 'WS', // 远景,手部细节不明显
  movement: 'fixed'
}
```

**策略3: 道具遮挡**
```typescript
visual: {
  midground: '女性双手握住围巾(布料遮挡手指细节)'
}
```

**策略4: 尾帧切换**
```typescript
firstLastFrame: {
  firstFrame: '女性手持茶壶(中景,手部可见)',
  lastFrame: '茶杯特写(完全避开手部)' // 巧妙切换视角
}
```

---

## 6. 多平台对比

### 6.1 即梦 vs Sora2

**相同的 StandardVideoPrompt**:
```typescript
const prompt: StandardVideoPrompt = {
  sceneId: 'test-01',
  duration: 10,
  aspectRatio: '16:9',
  visual: {
    midground: 'A woman in traditional dress walks in garden'
  },
  firstLastFrame: {
    firstFrame: 'Woman stands facing camera',
    lastFrame: 'Woman walks away, back to camera'
  }
};
```

**即梦AI 转换**:
```
首帧: Woman stands facing camera；尾帧: Woman walks away, back to camera。
主体: A woman in traditional dress walks in garden。
```
- ✅ 支持首尾帧
- 💰 成本: ¥170

**Sora2 转换**:
```
Main subject: A woman in traditional dress walks in garden.
```
- ⚠️ 忽略首尾帧(不支持)
- 💰 成本: ¥300

**结论**:
- 如果需要首尾帧控制 → 选即梦
- 如果需要最高质量 → 选Sora2

---

### 6.2 成本对比案例

**60秒短视频 (6×10秒片段)**

**方案A: 全用Sora2**
```
6片段 × 10秒 × ¥30/秒 = ¥1800
质量: ⭐⭐⭐⭐⭐
```

**方案B: 全用即梦**
```
6片段 × 10秒 × ¥17/秒 = ¥1020
质量: ⭐⭐⭐⭐
节省: 43%
```

**方案C: 混合策略(推荐)**
```
对话场景 (2片段) × ¥30 = ¥600  (Sora2)
静态场景 (4片段) × ¥17 = ¥680  (即梦)
总成本: ¥1280
质量: ⭐⭐⭐⭐+
节省: 29%
```

---

## 7. 降级与升级策略

### 7.1 从 Sora2 降级到即梦

**场景**: Sora2成本超支或生成失败

```typescript
import { PlatformAdapterFactory } from '@/adapters/platform-adapters';

const prompt: StandardVideoPrompt = { ... };

// 先验证即梦是否支持
const jimeng = PlatformAdapterFactory.getAdapter('jimeng');
const validation = jimeng.validatePrompt(prompt);

// 移除即梦不支持的特性
if (prompt.dialogue) {
  // 移除 lip-sync 标记
  prompt.dialogue.forEach(d => d.lipSync = false);
}

// 如果时长>10秒,拆分场景
if (prompt.duration > 10) {
  console.warn('Jimeng max 10s, splitting scene...');
  // 拆分逻辑...
}

// 转换并提交
const jimengPrompt = await jimeng.convertPrompt(prompt);
const taskId = await jimeng.submitTask(jimengPrompt);
```

### 7.2 从即梦升级到Sora2

**场景**: 即梦生成质量不满意,需要更高质量

```typescript
// 为即梦设计的prompt
const jimengPrompt: StandardVideoPrompt = {
  sceneId: 'scene-01',
  duration: 10,
  visual: { ... },
  firstLastFrame: { ... } // 即梦支持
};

// 升级到Sora2
const sora2 = PlatformAdapterFactory.getAdapter('sora2');

// Sora2不支持首尾帧,但会忽略此字段
const sora2Prompt = await sora2.convertPrompt(jimengPrompt);

// ✅ 仍可正常生成,只是没有首尾帧控制
const taskId = await sora2.submitTask(sora2Prompt);
```

---

## 8. 故障排查

### 8.1 首尾帧不连贯

**问题**: 生成的视频首尾过渡不自然

**原因**: 首尾帧差异过大

**解决方案**:

❌ **错误示例**:
```typescript
firstLastFrame: {
  firstFrame: '女性站立,白天',
  lastFrame: '女性坐下,夜晚' // 时间突变
}
```

✅ **正确示例**:
```typescript
firstLastFrame: {
  firstFrame: '女性站立在椅子旁,白天',
  lastFrame: '女性坐在椅子上,白天' // 时间一致,仅姿态变化
}
```

**检查清单**:
- [ ] 角色服装一致
- [ ] 场景一致
- [ ] 光照时间一致
- [ ] 配饰位置一致(如玉镯始终在左手)

### 8.2 手部变形

**问题**: 生成的手指数量不对或变形

**解决方案**: 参考第5.3节"手部处理策略"

**快速修复**:
```typescript
// 修改前
visual: {
  midground: '女性用手指捏起茶杯'
}

// 修改后
visual: {
  midground: '女性端起茶杯(手部略微虚焦)'
}
```

### 8.3 中文描述无效

**问题**: 明明用了中文,但效果不佳

**原因**: 描述不够详细

**解决方案**: 增加细节

❌ **过于简洁**:
```typescript
visual: {
  midground: '女子走路'
}
```

✅ **详细描述**:
```typescript
visual: {
  midground: `
    一位28岁的优雅女性,
    身穿墨绿色丝绸肚兜,外罩薄纱长衫,
    玉镯在左手腕,玉簪斜插发间,
    缓慢行走在90年代香港旧街区,
    表情忧郁,眼神望向远方,
    步速约1.2米/秒,动作优雅
  `
}
```

---

## 9. API 参考

### 9.1 JimengAdapter 类

```typescript
class JimengAdapter extends BaseVideoPlatformAdapter {
  readonly capabilities: PlatformCapabilities;

  constructor(accessKey: string, secretKey: string);

  async convertPrompt(
    standardPrompt: StandardVideoPrompt
  ): Promise<PlatformSpecificPrompt>;

  async submitTask(
    platformPrompt: PlatformSpecificPrompt
  ): Promise<string>;

  async queryTask(taskId: string): Promise<VideoGenerationTask>;

  async downloadVideo(
    taskId: string,
    localPath: string
  ): Promise<VideoGenerationResult>;

  async cancelTask(taskId: string): Promise<void>;

  estimateCost(standardPrompt: StandardVideoPrompt): number;
  estimateTime(standardPrompt: StandardVideoPrompt): number;

  validatePrompt(standardPrompt: StandardVideoPrompt): {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  };
}
```

### 9.2 能力对象

```typescript
capabilities: {
  name: '即梦AI v3.0 Pro',
  maxDuration: 10,
  aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'],
  hasLipSync: false,
  hasCameraControl: false,
  hasFirstLastFrame: true, // 核心优势
  costPerSecond: 17,
  avgGenerationTime: 180,
  maxResolution: { width: 1920, height: 1920 },
  hasAudioGeneration: false,
  qualityLevels: ['v30', 'v30_1080p', 'v30_pro']
}
```

### 9.3 转换参数

```typescript
parameters: {
  version: 'v30_pro', // 默认Pro版本
  frames: Math.round(duration * 24), // 24fps
  aspect_ratio: '9:16',
  reference_images?: string[] // 角色参考图(可选)
}
```

---

## 10. 高级技巧

### 10.1 首尾帧拼接策略

**场景**: 生成60秒视频(6×10秒)

```typescript
const scenes: StandardVideoPrompt[] = [
  {
    sceneId: 'scene-01',
    duration: 10,
    visual: { midground: '女性站在窗前' },
    firstLastFrame: {
      firstFrame: '女性站立,窗前,红色旗袍',
      lastFrame: '女性转身,准备离开窗前' // Scene 01 结束状态
    }
  },
  {
    sceneId: 'scene-02',
    duration: 10,
    visual: { midground: '女性走向桌子' },
    firstLastFrame: {
      firstFrame: '女性转身,离开窗前', // 承接 Scene 01
      lastFrame: '女性到达桌子旁,准备坐下' // Scene 02 结束状态
    }
  },
  {
    sceneId: 'scene-03',
    duration: 10,
    visual: { midground: '女性坐下品茶' },
    firstLastFrame: {
      firstFrame: '女性站在桌子旁', // 承接 Scene 02
      lastFrame: '女性坐下,手持茶杯' // Scene 03 结束状态
    }
  }
];

// 确保首尾帧连贯:
// Scene 01 lastFrame → Scene 02 firstFrame
// Scene 02 lastFrame → Scene 03 firstFrame
```

**关键**: 每个场景的 `lastFrame` 应该与下一场景的 `firstFrame` 高度一致。

### 10.2 角色一致性增强

```typescript
const characterPrompt = '28岁女性,红色旗袍,玉镯在左手,玉簪在右侧发间';

const scenes: StandardVideoPrompt[] = [
  {
    sceneId: 'scene-01',
    visual: {
      midground: `${characterPrompt},站在窗前`
    },
    characterReferences: [{
      characterId: 'heroine',
      fixedPrompt: characterPrompt, // 固定描述
      referenceImages: ['./refs/heroine.jpg'] // 可选参考图
    }]
  },
  {
    sceneId: 'scene-02',
    visual: {
      midground: `${characterPrompt},走向桌子` // 复用相同描述
    },
    characterReferences: [{
      characterId: 'heroine',
      fixedPrompt: characterPrompt,
      referenceImages: ['./refs/heroine.jpg']
    }]
  }
];
```

**效果**: 所有场景中角色外观保持一致。

### 10.3 宽高比优化

即梦AI支持多种宽高比,根据内容选择:

```typescript
// 竖屏短视频(抖音/快手)
aspectRatio: '9:16'

// 横屏影视(B站/YouTube)
aspectRatio: '16:9'

// 方形(Instagram)
aspectRatio: '1:1'

// 宽屏电影感
aspectRatio: '21:9'

// 传统电视
aspectRatio: '4:3'
```

---

## 11. 典型工作流

### 11.1 单场景生成

```typescript
// 1. 定义标准提示词
const prompt: StandardVideoPrompt = {
  sceneId: 'scene-01',
  sceneName: '古典园林转身',
  duration: 10,
  aspectRatio: '9:16',
  visual: {
    foreground: '飘落的桃花',
    midground: '28岁女性,红色旗袍',
    background: '古典园林'
  },
  firstLastFrame: {
    firstFrame: '站立面向镜头',
    lastFrame: '转身背对镜头'
  }
};

// 2. 获取适配器
const jimeng = new JimengAdapter(accessKey, secretKey);

// 3. 验证
const validation = jimeng.validatePrompt(prompt);
if (!validation.isValid) {
  throw new Error(`Validation failed: ${validation.warnings.join(', ')}`);
}

// 4. 转换
const platformPrompt = await jimeng.convertPrompt(prompt);
console.log('Estimated cost:', platformPrompt.estimatedCost);
console.log('Estimated time:', platformPrompt.estimatedTime);

// 5. 提交
const taskId = await jimeng.submitTask(platformPrompt);

// 6. 轮询状态(每10秒检查一次)
let task = await jimeng.queryTask(taskId);
while (task.status === 'processing') {
  console.log(`Progress: ${task.progress}%`);
  await sleep(10000);
  task = await jimeng.queryTask(taskId);
}

// 7. 下载
if (task.status === 'completed') {
  const result = await jimeng.downloadVideo(
    taskId,
    './outputs/scene-01.mp4'
  );
  console.log('Downloaded:', result.localPath);
  console.log('Actual cost:', result.actualCost);
} else {
  console.error('Task failed:', task.error);
}
```

### 11.2 多场景批量生成

```typescript
const scenes: StandardVideoPrompt[] = [
  { sceneId: 'scene-01', ... },
  { sceneId: 'scene-02', ... },
  { sceneId: 'scene-03', ... }
];

const jimeng = new JimengAdapter(accessKey, secretKey);

// 批量提交
const taskIds = await Promise.all(
  scenes.map(async scene => {
    const platformPrompt = await jimeng.convertPrompt(scene);
    const taskId = await jimeng.submitTask(platformPrompt);
    return { sceneId: scene.sceneId, taskId };
  })
);

// 批量轮询
const results = await Promise.all(
  taskIds.map(async ({ sceneId, taskId }) => {
    // 轮询直到完成
    let task = await jimeng.queryTask(taskId);
    while (task.status === 'processing') {
      await sleep(10000);
      task = await jimeng.queryTask(taskId);
    }

    // 下载
    if (task.status === 'completed') {
      return await jimeng.downloadVideo(
        taskId,
        `./outputs/${sceneId}.mp4`
      );
    } else {
      throw new Error(`${sceneId} failed: ${task.error}`);
    }
  })
);

console.log(`Generated ${results.length} scenes`);
```

---

## 12. 总结

### 12.1 核心优势

1. **统一接口**: 使用 `StandardVideoPrompt`,无需学习即梦特殊语法
2. **自动中文化**: 适配器自动生成优化的中文提示词
3. **首尾帧控制**: 充分利用即梦独有的首尾帧功能
4. **性价比**: ¥17/秒,比Sora2便宜43%

### 12.2 典型使用场景

- 🎨 中文文化内容(古风、民国、宋代)
- 📱 短视频平台内容(抖音、快手、小红书)
- 💰 预算有限的项目
- 🎬 静态或简单动作场景
- 🔗 需要首尾帧精确控制的连续场景

### 12.3 何时切换到其他平台

**切换到 Sora2** (升级):
- ✅ 需要对话唇形同步
- ✅ 需要极致物理真实性
- ✅ 预算充足

**切换到 Runway** (加速):
- ✅ 需要快速迭代测试
- ✅ 需要数值化相机控制

**切换到 可灵/海螺** (降成本):
- ✅ 预算极度紧张
- ✅ 大批量低成本生产

---

**下一步**:
- 阅读 `sora2-adapter-guide.md` 了解Sora2适配器
- 阅读 `platform-comparison.md` 查看全平台对比
- 参考 `../platform-specific-guides/jimeng-guide.md` 深入了解即梦特性

---

**版本**: v1.0
**最后更新**: 2025-01-08
**基于**: MovieFlow Constitution v1.0.0

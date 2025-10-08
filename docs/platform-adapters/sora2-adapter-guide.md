# Sora2 平台适配器使用指南

## 概述

本指南说明如何使用 `Sora2Adapter` 与 `StandardVideoPrompt` 配合,实现跨平台视频生成。

**核心优势**:
- ✅ 使用统一的 `StandardVideoPrompt` 格式
- ✅ 自动转换为 Sora2 的 AI-Optimized 格式
- ✅ 无需手动编写平台特定提示词
- ✅ 轻松切换到其他平台(降级策略)

---

## 1. 快速开始

### 1.1 基础使用

```typescript
import { Sora2Adapter, StandardVideoPrompt } from '@/adapters/platform-adapters';

// 初始化适配器
const sora2 = new Sora2Adapter(process.env.SORA2_API_KEY);

// 定义标准提示词
const standardPrompt: StandardVideoPrompt = {
  sceneId: 'scene-01',
  sceneName: 'Opening Scene',
  duration: 10,
  aspectRatio: '16:9',

  visual: {
    foreground: 'Falling autumn leaves',
    midground: 'A 28-year-old woman in red coat',
    background: 'Ancient Chinese architecture, sunset light'
  },

  camera: {
    shotSize: 'MS',
    movement: 'dolly'
  }
};

// 转换为 Sora2 格式
const platformPrompt = await sora2.convertPrompt(standardPrompt);

// 提交任务
const taskId = await sora2.submitTask(platformPrompt);

// 查询状态
const task = await sora2.queryTask(taskId);

// 下载结果
if (task.status === 'completed') {
  const result = await sora2.downloadVideo(taskId, './outputs/scene-01.mp4');
}
```

---

## 2. StandardVideoPrompt 到 Sora2 的转换

### 2.1 视觉层次转换

**StandardVideoPrompt 输入**:
```typescript
visual: {
  foreground: 'Falling autumn leaves',
  midground: 'A 28-year-old woman in red coat slowly turns around',
  background: 'Ancient Chinese architecture, sunset light filtering through'
}
```

**Sora2 输出**:
```
Foreground: Falling autumn leaves. Main subject: A 28-year-old woman in red coat slowly turns around. Background: Ancient Chinese architecture, sunset light filtering through.
```

**转换逻辑**:
- 使用英文标签: `Foreground:`, `Main subject:`, `Background:`
- Sora2 偏好清晰的分段结构
- 如果提供 `fullDescription`,则直接使用,不分层

---

### 2.2 物理描述转换 ⭐核心优势⭐

**StandardVideoPrompt 输入**:
```typescript
physics: {
  objectWeight: 'heavy, approximately 3kg',
  motion: 'durian lifted with both hands, arms slightly bent',
  interactions: 'chef's biceps flex from exertion'
}
```

**Sora2 输出**:
```
The object has realistic weight and mass (heavy, approximately 3kg). Hands bend slightly from the weight, wrists angled downward naturally. Motion: durian lifted with both hands, arms slightly bent. Movement follows realistic physics with appropriate acceleration and momentum. Physical interactions: chef's biceps flex from exertion
```

**转换特点**:
- 自动添加物理细节描述
- 强调重量感和运动规律
- 这是 Sora2 的核心优势,适配器会充分利用

---

### 2.3 对话与唇形同步 ⭐独有功能⭐

**StandardVideoPrompt 输入**:
```typescript
dialogue: [
  {
    speaker: 'Woman',
    text: "It's been ten years",
    timing: { start: 3, end: 5 },
    lipSync: true,
    emotion: 'melancholic'
  }
]
```

**Sora2 输出**:
```
Woman says "It's been ten years" at 3.00s, lip-synced, with melancholic emotion.
```

**转换特点**:
- 精确时间标记: `at 3.00s`
- 唇形同步标记: `lip-synced`
- 情绪描述: `with melancholic emotion`
- **重要**: 只有 Sora2 支持 `lipSync: true`,其他平台会忽略或降级处理

---

### 2.4 音频生成转换

**StandardVideoPrompt 输入**:
```typescript
audio: {
  music: {
    style: 'Piano melody',
    bpm: 80,
    volume: -28
  },
  soundEffects: [
    { type: 'footsteps', timing: 2, volume: -16 },
    { type: 'door close', timing: 5, volume: -12 }
  ]
}
```

**Sora2 输出**:
```
Music: Piano melody, BPM 80, ducks to -28dB during dialogue. SFX: footsteps at 2s (-16dB). SFX: door close at 5s (-12dB).
```

**转换特点**:
- Sora2 会同步生成音频
- 音乐自动避让对话(ducking)
- 音效精确定位到时间点

---

### 2.5 相机运动转换

**StandardVideoPrompt 输入**:
```typescript
camera: {
  shotSize: 'MS',
  movement: 'dolly'
}
```

**Sora2 输出**:
```
Shot: medium shot. Camera dollies in smoothly.
```

**支持的景别映射**:
| 代码 | 英文 | 中文 |
|------|------|------|
| EWS | extreme wide shot | 超远景 |
| WS | wide shot | 远景 |
| MS | medium shot | 中景 |
| CU | close-up | 近景 |
| ECU | extreme close-up | 特写 |

**支持的运镜映射**:
| 代码 | Sora2 描述 |
|------|------------|
| fixed | remains static |
| dolly | dollies in smoothly |
| crane | cranes up elegantly |
| pan | pans horizontally |
| zoom | zooms dynamically |

---

### 2.6 光照转换

**StandardVideoPrompt 输入**:
```typescript
lighting: {
  style: 'Warm sunset light',
  timeOfDay: 'golden hour',
  mood: 'nostalgic'
}
```

**Sora2 输出**:
```
Lighting: Warm sunset light golden hour light creating nostalgic mood.
```

---

### 2.7 色彩调性转换

**StandardVideoPrompt 输入**:
```typescript
colorGrading: {
  style: 'Cinematic warm tones',
  palette: ['golden yellow', 'deep green', 'soft pink'],
  mood: 'vintage'
}
```

**Sora2 输出**:
```
Color: Cinematic warm tones palette of golden yellow, deep green, soft pink vintage tone.
```

---

## 3. 完整转换示例

### 示例1: 对话场景(Sora2核心优势)

**StandardVideoPrompt**:
```typescript
{
  sceneId: 'scene-dialogue-01',
  sceneName: 'Emotional Conversation',
  duration: 10,
  aspectRatio: '16:9',

  visual: {
    foreground: 'Soft focus bokeh lights',
    midground: 'Two characters facing each other in cafe',
    background: 'Rainy window with streaking water'
  },

  camera: {
    shotSize: 'MCU',
    movement: 'fixed'
  },

  dialogue: [
    {
      speaker: 'Woman',
      text: 'I never stopped thinking about you',
      timing: { start: 2, end: 5 },
      lipSync: true,
      emotion: 'melancholic'
    },
    {
      speaker: 'Man',
      text: "I know... I'm sorry",
      timing: { start: 6, end: 8 },
      lipSync: true,
      emotion: 'apologetic'
    }
  ],

  lighting: {
    style: 'Soft window light',
    timeOfDay: 'afternoon',
    mood: 'intimate'
  },

  audio: {
    music: {
      style: 'Melancholic piano',
      bpm: 72,
      volume: -28
    },
    soundEffects: [
      { type: 'rain on window', timing: 0, volume: -22 }
    ]
  }
}
```

**Sora2Adapter 转换后**:
```
Foreground: Soft focus bokeh lights. Main subject: Two characters facing each other in cafe. Background: Rainy window with streaking water.

Shot: medium close-up. Camera remains static.

Woman says "I never stopped thinking about you" at 2.00s, lip-synced, with melancholic emotion.

Man says "I'm sorry" at 6.00s, lip-synced, with apologetic emotion.

Lighting: Soft window light afternoon light creating intimate mood.

Music: Melancholic piano, BPM 72, ducks to -28dB during dialogue. SFX: rain on window at 0s (-22dB).
```

**估算成本**: 10秒 × ¥30/秒 = **¥300**
**估算时间**: 约5分钟

---

### 示例2: 物理真实场景(Sora2优势)

**StandardVideoPrompt**:
```typescript
{
  sceneId: 'scene-physics-01',
  sceneName: 'Chef Lifting Wok',
  duration: 10,
  aspectRatio: '16:9',

  visual: {
    midground: 'Chef in professional kitchen lifts heavy wok',
    background: 'Busy restaurant kitchen, steam rising'
  },

  physics: {
    objectWeight: 'heavy cast iron wok, approximately 5kg',
    motion: 'chef lifts with both hands, arms flex from weight',
    interactions: 'biceps strain, wrists angle downward from mass'
  },

  camera: {
    shotSize: 'MS',
    movement: 'dolly'
  },

  lighting: {
    style: 'Practical kitchen lights + flame glow',
    mood: 'energetic'
  }
}
```

**Sora2Adapter 转换后**:
```
Main subject: Chef in professional kitchen lifts heavy wok. Background: Busy restaurant kitchen, steam rising.

The object has realistic weight and mass (heavy cast iron wok, approximately 5kg). Hands bend slightly from the weight, wrists angled downward naturally. Motion: chef lifts with both hands, arms flex from weight. Movement follows realistic physics with appropriate acceleration and momentum. Physical interactions: biceps strain, wrists angle downward from mass.

Shot: medium shot. Camera dollies in smoothly.

Lighting: Practical kitchen lights + flame glow creating energetic mood.
```

**为何适合Sora2**:
- ✅ 详细物理描述(Sora2强项)
- ✅ 重量、力量、变形的精确模拟
- ✅ 真实的运动轨迹

---

## 4. 平台能力检查

### 4.1 使用 `validatePrompt` 检查兼容性

```typescript
const validation = sora2.validatePrompt(standardPrompt);

if (!validation.isValid) {
  console.warn('⚠️ Warnings:');
  validation.warnings.forEach(w => console.log(`  - ${w}`));
}

if (validation.suggestions.length > 0) {
  console.log('💡 Suggestions:');
  validation.suggestions.forEach(s => console.log(`  - ${s}`));
}
```

**示例输出**:
```
✅ All checks passed
Estimated cost: ¥300
Estimated time: 5 minutes
```

### 4.2 Sora2 能力清单

```typescript
const caps = sora2.capabilities;

console.log(`Platform: ${caps.name}`);
console.log(`Max Duration: ${caps.maxDuration}s`);
console.log(`Lip Sync: ${caps.hasLipSync ? '✓' : '✗'}`);
console.log(`Camera Control: ${caps.hasCameraControl ? '✓' : '✗'}`);
console.log(`Audio Generation: ${caps.hasAudioGeneration ? '✓' : '✗'}`);
console.log(`Cost: ¥${caps.costPerSecond}/sec`);
```

**输出**:
```
Platform: Sora2
Max Duration: 60s
Lip Sync: ✓
Camera Control: ✓
Audio Generation: ✓
Cost: ¥30/sec
```

---

## 5. 最佳实践

### 5.1 何时选择 Sora2Adapter

**强烈推荐**:
- ✅ 需要对话唇形同步
- ✅ 需要精确物理模拟
- ✅ 需要长视频(30-60秒)
- ✅ 需要同步音频生成
- ✅ 预算充足(¥30/秒)

**不推荐**:
- ❌ 简单静态场景(浪费性能)
- ❌ 预算紧张
- ❌ 需要首尾帧控制(Sora2不支持)

### 5.2 充分利用 Sora2 优势

**物理描述模板**:
```typescript
physics: {
  objectWeight: '[物体] weighs approximately [重量]',
  motion: '[动作描述] with realistic acceleration and deceleration',
  interactions: '[接触描述], follows real-world physics'
}
```

**对话描述模板**:
```typescript
dialogue: [
  {
    speaker: '[角色名]',
    text: '[台词]',
    timing: { start: [秒], end: [秒] },
    lipSync: true, // 必须为 true
    emotion: '[情绪: melancholic/excited/angry/playful]'
  }
]
```

### 5.3 降级策略

如果 Sora2 生成失败或成本超支,可以轻松切换到其他平台:

```typescript
import { PlatformAdapterFactory } from '@/adapters/platform-adapters';

// 尝试 Sora2
try {
  const sora2 = PlatformAdapterFactory.getAdapter('sora2');
  const result = await sora2.submitTask(platformPrompt);
} catch (error) {
  console.warn('Sora2 failed, falling back to Jimeng AI');

  // 降级到即梦AI
  const jimeng = PlatformAdapterFactory.getAdapter('jimeng');

  // 修改提示词:移除 lipSync (即梦不支持)
  standardPrompt.dialogue?.forEach(d => d.lipSync = false);

  const jimengPrompt = await jimeng.convertPrompt(standardPrompt);
  const result = await jimeng.submitTask(jimengPrompt);
}
```

---

## 6. 多平台对比

### 6.1 Sora2 vs 即梦AI

**相同的 StandardVideoPrompt**:
```typescript
const prompt: StandardVideoPrompt = {
  sceneId: 'test-01',
  duration: 10,
  aspectRatio: '16:9',
  visual: {
    midground: 'A woman walks in the street'
  },
  dialogue: [{
    text: 'Hello world',
    timing: { start: 3, end: 5 },
    lipSync: true
  }]
};
```

**Sora2 转换结果**:
```
Main subject: A woman walks in the street.
Character says "Hello world" at 3.00s, lip-synced.
```
- ✅ 支持 lip-sync
- ✅ 英文提示词
- 💰 成本: ¥300

**即梦AI 转换结果**:
```
主体: 女性在街上行走。
对话动作: 说"Hello world"，情绪: 平静
```
- ⚠️ 不支持 lip-sync,仅作为动作指导
- ✅ 中文提示词
- 💰 成本: ¥170

---

### 6.2 选择决策树

```
是否需要对话唇形同步?
├─ 是 → Sora2 (唯一支持)
└─ 否 ↓

是否需要精确物理模拟?
├─ 是 → Sora2 (最强)
└─ 否 ↓

预算是否充足 (>¥20/秒)?
├─ 是 → Sora2 (最高质量)
└─ 否 → 即梦AI 或 可灵 (性价比)
```

---

## 7. 故障排查

### 7.1 任务失败

**问题**: `submitTask` 抛出错误

**检查清单**:
1. API Key 是否正确设置?
```typescript
console.log(process.env.SORA2_API_KEY); // 不应为 undefined
```

2. 时长是否超过限制?
```typescript
if (standardPrompt.duration > sora2.capabilities.maxDuration) {
  console.error(`Duration ${standardPrompt.duration}s exceeds max 60s`);
}
```

3. 宽高比是否支持?
```typescript
if (!sora2.capabilities.aspectRatios.includes(standardPrompt.aspectRatio)) {
  console.error(`Aspect ratio ${standardPrompt.aspectRatio} not supported`);
}
```

### 7.2 对话不同步

**问题**: 生成的视频中嘴型与对话不匹配

**解决方案**:
1. 确保 `lipSync: true`
2. 提供精确的 `timing`
3. 简化对话内容(过长难以同步)

**优化前**:
```typescript
dialogue: [{
  text: 'I think it is time for me to finally move forward and embrace new possibilities in my life',
  timing: { start: 2, end: 8 }
}]
```

**优化后**(拆分为多句):
```typescript
dialogue: [
  {
    text: "It's time to move forward",
    timing: { start: 2, end: 4 },
    lipSync: true
  },
  {
    text: "And embrace new possibilities",
    timing: { start: 5, end: 8 },
    lipSync: true
  }
]
```

### 7.3 物理不真实

**问题**: 生成的视频中物体漂浮或运动不自然

**解决方案**: 添加详细物理描述

**优化前**:
```typescript
visual: {
  midground: 'Chef holds durian'
}
```

**优化后**:
```typescript
visual: {
  midground: 'Chef holds durian'
},
physics: {
  objectWeight: 'heavy durian, approximately 3kg',
  motion: 'chef lifts with both hands, arms slightly bent from weight',
  interactions: 'wrists angle downward, biceps flex'
}
```

---

## 8. API 参考

### 8.1 Sora2Adapter 类

```typescript
class Sora2Adapter extends BaseVideoPlatformAdapter {
  readonly capabilities: PlatformCapabilities;

  constructor(apiKey: string);

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

  setApiEndpoint(endpoint: string): void;
}
```

### 8.2 能力对象

```typescript
capabilities: {
  name: 'Sora2',
  maxDuration: 60,
  aspectRatios: ['16:9', '9:16', '1:1'],
  hasLipSync: true,
  hasCameraControl: true,
  hasFirstLastFrame: false,
  costPerSecond: 30,
  avgGenerationTime: 300,
  maxResolution: { width: 1920, height: 1920 },
  hasAudioGeneration: true,
  qualityLevels: ['standard', 'high', 'ultra']
}
```

---

## 9. 总结

### 9.1 核心优势

1. **统一接口**: 使用 `StandardVideoPrompt`,轻松切换平台
2. **自动转换**: 无需学习 Sora2 的特殊语法
3. **充分利用优势**: 适配器会强化物理、对话等 Sora2 强项
4. **降级策略**: 失败时可快速切换到其他平台

### 9.2 典型工作流

```typescript
// 1. 定义标准提示词
const prompt: StandardVideoPrompt = { ... };

// 2. 选择平台
const adapter = PlatformAdapterFactory.getAdapter('sora2');

// 3. 验证兼容性
const validation = adapter.validatePrompt(prompt);

// 4. 转换并提交
const platformPrompt = await adapter.convertPrompt(prompt);
const taskId = await adapter.submitTask(platformPrompt);

// 5. 轮询状态
const task = await adapter.queryTask(taskId);

// 6. 下载结果
const result = await adapter.downloadVideo(taskId, './output.mp4');
```

### 9.3 最佳适用场景

- 🎬 电影级叙事短片(对话密集)
- 🍳 美食视频(物理真实性)
- 💬 品牌广告(需要口播)
- 🎭 情感剧情(表情+对话同步)

---

**下一步**:
- 阅读 `jimeng-adapter-guide.md` 了解即梦AI适配器
- 阅读 `platform-comparison.md` 查看全平台对比
- 参考 `../platform-specific-guides/sora2-guide.md` 深入了解 Sora2 特性

---

**版本**: v1.0
**最后更新**: 2025-01-08
**基于**: MovieFlow Constitution v1.0.0

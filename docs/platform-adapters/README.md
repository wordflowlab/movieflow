# 平台适配器系统

MovieFlow 的多平台视频生成适配器系统。

## 概述

平台适配器系统允许 MovieFlow 使用统一的 `StandardVideoPrompt` 格式生成视频,然后通过适配器自动转换为各个平台的特定格式。这样可以:

- ✅ **一次编写,多平台生成**: 定义一次提示词,可以用于任何支持的平台
- ✅ **轻松切换平台**: 无需重写提示词,只需更换适配器
- ✅ **自动降级策略**: 主平台失败时自动切换到备用平台
- ✅ **成本优化**: 根据场景特点选择最佳性价比平台
- ✅ **平台能力检查**: 自动验证提示词与平台兼容性

---

## 架构

```
StandardVideoPrompt (统一格式)
         ↓
   Platform Adapters (适配器层)
         ↓
┌────────┬────────┬────────┬────────┐
│ Sora2  │ Jimeng │ Runway │ Kling  │ ... (各平台API)
└────────┴────────┴────────┴────────┘
         ↓
    Generated Videos
```

---

## 核心组件

### 1. `StandardVideoPrompt`

**位置**: `src/adapters/platform-adapters/base-video-adapter.ts`

统一的视频提示词格式,包含:
- 视觉描述(三层结构:前景/主体/背景)
- 相机运动
- 光照与色彩
- 对话与音频
- 物理描述
- 首尾帧控制
- 角色一致性

**示例**:
```typescript
const prompt: StandardVideoPrompt = {
  sceneId: 'scene-01',
  duration: 10,
  aspectRatio: '16:9',

  visual: {
    foreground: 'Falling autumn leaves',
    midground: 'A woman in red coat',
    background: 'Ancient Chinese architecture'
  },

  camera: {
    shotSize: 'MS',
    movement: 'dolly'
  },

  dialogue: [{
    text: "It's been ten years",
    timing: { start: 3, end: 5 },
    lipSync: true,
    emotion: 'melancholic'
  }]
};
```

### 2. 平台适配器

**位置**: `src/adapters/platform-adapters/`

每个平台一个适配器类,继承自 `BaseVideoPlatformAdapter`:

#### 已实现:

##### **Sora2Adapter**
- **文件**: `sora2-adapter.ts`
- **文档**: `sora2-adapter-guide.md`
- **特点**:
  - ✅ 唇形同步(唯一支持)
  - ✅ 物理真实性最强
  - ✅ 同步音频生成
  - ✅ 最长60秒
  - 💰 成本: ¥30/秒

##### **JimengAdapter**
- **文件**: `jimeng-adapter.ts`
- **文档**: `jimeng-adapter-guide.md`
- **特点**:
  - ✅ 中文理解优秀
  - ✅ 首尾帧控制(独有)
  - ✅ 性价比高
  - ✅ 稳定成熟
  - 💰 成本: ¥17/秒

#### 待实现:
- `RunwayAdapter` (Gen-4)
- `KlingAdapter` (可灵)
- `HailuoAdapter` (海螺02)
- `Veo3Adapter`
- `ViduAdapter` (Q2)

### 3. `PlatformAdapterFactory`

**位置**: `src/adapters/platform-adapters/base-video-adapter.ts`

平台适配器工厂,提供:

```typescript
// 注册平台
PlatformAdapterFactory.register('sora2', sora2Adapter);

// 获取平台
const adapter = PlatformAdapterFactory.getAdapter('sora2');

// 推荐平台
const recommendation = PlatformAdapterFactory.recommendPlatform({
  needsLipSync: true,
  maxBudget: 1000,
  prioritizeQuality: true
});
// → { recommended: 'sora2', alternatives: ['jimeng'], rationale: '...' }
```

### 4. `WorkflowOrchestrator`

**位置**: `src/core/workflow-orchestrator.ts`

工作流编排器,执行多阶段视频生成:
- Phase 0: 主设计图生成 (Midjourney/FLUX)
- Phase 1: 置景设计 (3D布局)
- Phase 2: 打光设计
- Phase 3: 视频生成 **(核心,必须)**
- Phase 4: 4K放大

**特性**:
- 从 `plan.md` 读取配置
- 多平台自动切换
- 降级策略
- 成本控制
- 进度追踪

---

## 快速开始

### 1. 初始化平台适配器

```typescript
import { initializePlatformAdapters } from '@/adapters/platform-adapters';

// 初始化(需要环境变量)
initializePlatformAdapters();
```

**环境变量**:
```bash
# 即梦AI
VOLCANO_ACCESS_KEY=your_key
VOLCANO_SECRET_KEY=your_secret

# Sora2
SORA2_API_KEY=your_key
```

### 2. 使用单个平台

```typescript
import { JimengAdapter, StandardVideoPrompt } from '@/adapters/platform-adapters';

const jimeng = new JimengAdapter(accessKey, secretKey);

const prompt: StandardVideoPrompt = {
  sceneId: 'scene-01',
  duration: 10,
  aspectRatio: '9:16',
  visual: {
    midground: '一位女性在园林中行走'
  },
  firstLastFrame: {
    firstFrame: '站立',
    lastFrame: '走远'
  }
};

// 转换
const platformPrompt = await jimeng.convertPrompt(prompt);

// 提交
const taskId = await jimeng.submitTask(platformPrompt);

// 查询
const task = await jimeng.queryTask(taskId);

// 下载
const result = await jimeng.downloadVideo(taskId, './output.mp4');
```

### 3. 使用工作流编排器

```typescript
import { WorkflowOrchestrator } from '@/core/workflow-orchestrator';
import { initializePlatformAdapters } from '@/adapters/platform-adapters';

initializePlatformAdapters();

const orchestrator = new WorkflowOrchestrator();

// 从 plan.md 加载
await orchestrator.loadPlanFromFile('./docs/plan.md');

// 设置场景
orchestrator.setScenes([
  { sceneId: 'scene-01', ... },
  { sceneId: 'scene-02', ... },
  // ... 6个场景
]);

// 执行完整工作流
const result = await orchestrator.executeWorkflow();

console.log(`生成 ${result.phases.phase3.outputs.length} 个视频`);
console.log(`总成本: ¥${result.totalCost}`);
```

---

## 平台选择策略

### 决策树

```
是否需要唇形同步?
├─ 是 → Sora2 (唯一支持)
└─ 否 ↓

是否需要精确物理模拟?
├─ 是 → Sora2 (最强)
└─ 否 ↓

是否需要首尾帧控制?
├─ 是 → 即梦AI 或 可灵
└─ 否 ↓

预算情况?
├─ 充足 (>¥20/秒) → Sora2
├─ 适中 (¥15-20/秒) → 即梦AI
└─ 紧张 (<¥15/秒) → 海螺02 或 可灵
```

### 场景推荐

**对话场景** → Sora2
- 唯一支持lip-sync
- 物理真实,表情自然
- 成本高但质量最佳

**中文文化内容** → 即梦AI
- 中文理解优秀
- 首尾帧控制
- 性价比高

**快速迭代测试** → 海螺02 / 可灵
- 成本低
- 速度快
- 质量中等

**产品展示** → Runway Gen-4
- 数值化相机控制
- 简洁高效
- 适合精确场景

### 混合策略

**60秒视频 (6×10秒) 成本对比**:

| 策略 | 平台组合 | 成本 | 质量 | 节省 |
|-----|---------|------|------|------|
| 全用Sora2 | 6片段 × ¥300 | ¥1800 | ⭐⭐⭐⭐⭐ | - |
| 全用即梦 | 6片段 × ¥170 | ¥1020 | ⭐⭐⭐⭐ | 43% |
| **混合(推荐)** | 对话2片段(Sora2) + 静态4片段(即梦) | ¥1280 | ⭐⭐⭐⭐+ | 29% |

---

## 降级策略

### 自动降级

WorkflowOrchestrator 支持自动降级:

```typescript
const config: WorkflowConfig = {
  primaryPlatform: 'sora2',
  fallbackPlatform: 'jimeng', // Sora2失败时自动切换
  // ...
};

// 执行时自动处理降级
const result = await orchestrator.executeWorkflow(config);
```

### 手动降级

```typescript
try {
  const sora2 = PlatformAdapterFactory.getAdapter('sora2');
  const result = await sora2.submitTask(prompt);
} catch (error) {
  console.warn('Sora2 failed, fallback to Jimeng');

  const jimeng = PlatformAdapterFactory.getAdapter('jimeng');

  // 修改prompt以适应即梦
  prompt.dialogue?.forEach(d => d.lipSync = false);
  delete prompt.firstLastFrame; // Sora2不支持

  const result = await jimeng.submitTask(prompt);
}
```

---

## API 参考

### BaseVideoPlatformAdapter

```typescript
abstract class BaseVideoPlatformAdapter {
  abstract readonly capabilities: PlatformCapabilities;

  // 核心方法
  abstract convertPrompt(standardPrompt: StandardVideoPrompt): Promise<PlatformSpecificPrompt>;
  abstract submitTask(platformPrompt: PlatformSpecificPrompt): Promise<string>;
  abstract queryTask(taskId: string): Promise<VideoGenerationTask>;
  abstract downloadVideo(taskId: string, localPath: string): Promise<VideoGenerationResult>;
  abstract cancelTask(taskId: string): Promise<void>;

  // 辅助方法
  estimateCost(standardPrompt: StandardVideoPrompt): number;
  estimateTime(standardPrompt: StandardVideoPrompt): number;
  validatePrompt(standardPrompt: StandardVideoPrompt): ValidationResult;
}
```

### PlatformCapabilities

```typescript
interface PlatformCapabilities {
  name: string;
  maxDuration: number;
  aspectRatios: string[];
  hasLipSync: boolean;
  hasCameraControl: boolean;
  hasFirstLastFrame: boolean;
  costPerSecond: number;
  avgGenerationTime: number;
  hasAudioGeneration: boolean;
}
```

---

## 文档索引

### 平台对比
- [📊 Platform Comparison](./platform-comparison.md) - 全平台对比表

### 适配器指南
- [📘 Sora2 Adapter Guide](./sora2-adapter-guide.md) - Sora2适配器使用
- [📗 Jimeng Adapter Guide](./jimeng-adapter-guide.md) - 即梦AI适配器使用

### 平台详细指南
- [Sora2 Platform Guide](../platform-specific-guides/sora2-guide.md)
- [Jimeng Platform Guide](../platform-specific-guides/jimeng-guide.md)
- [Runway Platform Guide](../platform-specific-guides/runway-guide.md)

### 示例代码
- [WorkflowOrchestrator Example](../../examples/workflow-orchestrator-example.ts)

---

## 开发状态

### 已完成 ✅
- [x] Base adapter architecture
- [x] StandardVideoPrompt format
- [x] Sora2Adapter
- [x] JimengAdapter
- [x] PlatformAdapterFactory
- [x] WorkflowOrchestrator
- [x] 平台对比文档
- [x] 适配器使用指南

### 进行中 🚧
- [ ] 集成到现有命令系统
- [ ] RunwayAdapter (Gen-4)
- [ ] KlingAdapter (可灵)
- [ ] HailuoAdapter (海螺02)

### 计划中 📋
- [ ] Veo3Adapter
- [ ] ViduAdapter (Q2)
- [ ] 4K upscaling integration
- [ ] Midjourney/FLUX integration (Phase 0)
- [ ] 自动化测试套件

---

## 常见问题

### Q: 如何选择平台?

**A**: 根据需求:
- **需要对话** → 只能用Sora2
- **中文内容** → 即梦AI最佳
- **预算紧张** → 海螺02/可灵
- **首尾帧控制** → 即梦AI/可灵
- **数值化相机控制** → Runway Gen-4

### Q: StandardVideoPrompt如何设计?

**A**: 参考模板:
```typescript
{
  sceneId: 'unique-id',
  duration: 10,
  aspectRatio: '16:9',

  visual: {
    foreground: '前景元素 (20%)',
    midground: '主体 (60%)',
    background: '背景 (20%)'
  },

  camera: { shotSize: 'MS', movement: 'dolly' },
  lighting: { style: '...', timeOfDay: '...', mood: '...' },

  // 可选:
  dialogue: [...],      // Sora2专用
  firstLastFrame: {...}, // 即梦AI专用
  physics: {...}        // Sora2专用
}
```

### Q: 如何处理平台失败?

**A**: 三种方式:
1. **自动降级**: 使用 WorkflowOrchestrator 的 `fallbackPlatform`
2. **手动重试**: catch 错误后切换平台
3. **多平台并发**: 同时提交多个平台,选最快的

### Q: 成本如何控制?

**A**:
- 使用 `estimateCost()` 预估
- 设置 `costBudget` 上限
- L0→L1→L2 渐进式验证
- 混合平台策略

---

## 贡献

### 添加新平台适配器

1. 创建 `{platform}-adapter.ts`:
```typescript
export class NewPlatformAdapter extends BaseVideoPlatformAdapter {
  readonly capabilities: PlatformCapabilities = {
    name: 'NewPlatform',
    maxDuration: 10,
    // ...
  };

  async convertPrompt(standardPrompt: StandardVideoPrompt): Promise<PlatformSpecificPrompt> {
    // 转换逻辑
  }

  async submitTask(platformPrompt: PlatformSpecificPrompt): Promise<string> {
    // API调用
  }

  // 实现其他抽象方法...
}
```

2. 在 `index.ts` 中注册:
```typescript
export function initializePlatformAdapters(): void {
  const newPlatform = new NewPlatformAdapter(apiKey);
  PlatformAdapterFactory.register('newplatform', newPlatform);
}
```

3. 添加文档:
- `{platform}-adapter-guide.md`
- 更新 `platform-comparison.md`

---

## 许可证

MIT License

---

**版本**: v1.0.0
**最后更新**: 2025-01-08
**基于**: MovieFlow Constitution v1.0.0

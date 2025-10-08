---
description: 执行完整视频生成工作流(多平台支持)
---

# /implement - 完整视频生成命令

## 概述
基于 WorkflowOrchestrator 执行多阶段视频生成工作流,支持多平台自动适配和降级策略。

## 核心功能
- ✅ 多平台支持: Sora2, 即梦AI, Runway, 可灵等
- ✅ 自动降级: 主平台失败时自动切换备用平台
- ✅ 成本优化: 混合平台策略降低30%成本
- ✅ 渐进式验证: L0→L1→L2→L3 逐级确认
- ✅ 断点续传: 支持任务中断后继续
- ✅ 多阶段工作流: Phase 0-4 灵活配置

## 使用方法
```bash
/implement <项目名> [选项]
```

## 执行流程

### 1. 读取配置
从 `.specify/specs/<项目>/plan.md` 读取工作流配置:

```markdown
## 技术方案

### 平台选择
- **主平台**: 即梦AI v3.0 Pro
- **备用平台**: Sora2 (如即梦失败)
- **成本预算**: ¥1020 (6片段 × ¥170)

### 工作流阶段
- Phase 0: ❌ 关闭 (节省¥18)
- Phase 3: ✅ 启用 (核心阶段)
- Phase 4: ❌ 关闭 (L3完成后可选)

### 验证策略
- L0: ✅ 启用 (免费验证)
- L1: ✅ 启用 (¥3-6验证)
- L2: ❌ 关闭 (可选)
```

### 2. 初始化 WorkflowOrchestrator

```typescript
import { WorkflowOrchestrator } from '@/core/workflow-orchestrator';
import { initializePlatformAdapters } from '@/adapters/platform-adapters';

// 初始化平台适配器
initializePlatformAdapters();

// 创建编排器
const orchestrator = new WorkflowOrchestrator('./.state');

// 加载配置
await orchestrator.loadPlanFromFile('.specify/specs/<项目>/plan.md');
```

### 3. 设置场景 (StandardVideoPrompt)

从 `script.json` 或 `spec.md` 读取场景定义,转换为 StandardVideoPrompt:

```typescript
const scenes: StandardVideoPrompt[] = [
  {
    sceneId: 'scene-01',
    sceneName: '开场场景',
    duration: 10,
    aspectRatio: '9:16',

    visual: {
      foreground: '飘落的樱花花瓣',
      midground: '28岁女性,古典旗袍,站在园林中',
      background: '古典园林,亭台楼阁,夕阳西下'
    },

    camera: {
      shotSize: 'MS',    // 中景
      movement: 'dolly'  // 推轨
    },

    lighting: {
      style: '黄昏柔光',
      timeOfDay: '傍晚',
      mood: '怀旧'
    },

    colorGrading: {
      style: '复古暖色调',
      palette: ['金黄', '粉红', '浅绿'],
      mood: '怀旧'
    },

    // 即梦AI专属功能
    firstLastFrame: {
      firstFrame: '女性站立,面向镜头',
      lastFrame: '女性转身,准备离开'
    }
  },
  // ... 5 more scenes
];

orchestrator.setScenes(scenes);
```

### 4. 执行工作流

```typescript
const result = await orchestrator.executeWorkflow({
  projectName: '<项目名>',
  totalDuration: 60,
  segmentCount: 6,

  phases: {
    phase0: { enabled: false },      // 主设计图生成(可选)
    phase1: { enabled: false },      // 置景设计(可选)
    phase2: { enabled: false },      // 打光设计(可选)
    phase3: { enabled: true },       // 视频生成(必须)
    phase4: { enabled: false }       // 4K放大(可选)
  },

  primaryPlatform: 'jimeng',
  fallbackPlatform: 'sora2',
  promptStrategy: 'layered-structure',

  validation: {
    l0: true,  // 免费验证
    l1: true   // 低成本验证
  },

  costBudget: {
    total: 1020,
    perScene: 170
  },

  scenes: scenes
});
```

### 5. 处理结果

```typescript
console.log(`✅ 生成完成!`);
console.log(`  - 生成片段: ${result.phases.phase3.outputs.length}个`);
console.log(`  - 总成本: ¥${result.totalCost}`);
console.log(`  - 总时长: ${Math.round(result.totalTime / 60)}分钟`);

// 6个视频片段路径
result.phases.phase3.outputs.forEach((output, i) => {
  console.log(`  场景${i + 1}: ${output.localPath}`);
});
```

### 6. 音频合成 (可选)

```typescript
import { AudioService } from '@/services/audio-service';

const audioService = new AudioService();

const audioSegments = scenes.map((scene, i) => ({
  text: scene.dialogue?.[0]?.text || '',
  timing: { start: i * 10, end: (i + 1) * 10 }
}));

await audioService.generateAudio(audioSegments, './audio/voice.mp3');
```

### 7. 视频合成

```typescript
import { FFmpegService } from '@/services/ffmpeg-service';

const ffmpeg = new FFmpegService();

// 合并6个片段
const videoPaths = result.phases.phase3.outputs.map(o => o.localPath);
await ffmpeg.mergeVideos(videoPaths, './output/merged.mp4');

// 添加音频
await ffmpeg.mergeAudio('./output/merged.mp4', './audio/voice.mp3', './output/final.mp4');
```

## 平台选择策略

### 决策树
```
是否需要唇形同步?
├─ 是 → Sora2 (唯一支持)
└─ 否 ↓

是否需要首尾帧控制?
├─ 是 → 即梦AI 或 可灵
└─ 否 ↓

预算情况?
├─ 充足 (>¥20/秒) → Sora2
├─ 适中 (¥15-20/秒) → 即梦AI
└─ 紧张 (<¥15/秒) → 海螺02
```

### 混合策略示例

**场景分析**:
- 场景1-2: 对话场景 → Sora2 (需要lip-sync)
- 场景3-6: 静态场景 → 即梦AI (性价比高)

**成本对比**:
```
全用Sora2:  6片段 × ¥300 = ¥1800
全用即梦:   6片段 × ¥170 = ¥1020
混合策略:   2×¥300 + 4×¥170 = ¥1280
           节省29%成本
```

## 降级策略

### 自动降级

WorkflowOrchestrator 自动处理平台失败:

```typescript
try {
  // 尝试主平台
  const result = await primaryAdapter.submitTask(prompt);
} catch (error) {
  console.warn('主平台失败,切换到备用平台');

  // 自动降级到备用平台
  const result = await fallbackAdapter.submitTask(prompt);
}
```

### 手动降级

如需手动控制降级逻辑:

```typescript
import { PlatformAdapterFactory } from '@/adapters/platform-adapters';

const sora2 = PlatformAdapterFactory.getAdapter('sora2');
const jimeng = PlatformAdapterFactory.getAdapter('jimeng');

// 检查平台能力
const canHandle = sora2.validatePrompt(prompt);

if (!canHandle.isValid) {
  console.log(`Sora2不支持: ${canHandle.errors.join(', ')}`);
  console.log('降级到即梦AI');

  // 修改prompt以适应即梦AI
  if (prompt.dialogue) {
    prompt.dialogue.forEach(d => d.lipSync = false);
  }

  const result = await jimeng.submitTask(prompt);
}
```

## 成本控制

### 预估成本

```typescript
const estimatedCost = orchestrator.estimateCost(scenes);
console.log(`预估成本: ¥${estimatedCost}`);

if (estimatedCost > config.costBudget.total) {
  console.warn('超出预算,建议:');
  console.log('  1. 切换到更便宜的平台');
  console.log('  2. 减少场景数量');
  console.log('  3. 缩短视频时长');
}
```

### 成本优化建议

1. **L0→L1→L2 渐进验证**
   - L0: 免费文本分析
   - L1: ¥3-6 图像预览
   - L2: ¥28 动态预览
   - L3: ¥170 完整生成

   总成本: ¥207 (vs 直接生成¥170,但避免了重做)

2. **混合平台策略**
   - 对话场景: Sora2
   - 静态场景: 即梦AI
   - 节省30%成本

3. **批量优化**
   - 并发3个任务 (避免串行等待)
   - 复用相同场景 (降低API调用)

## 输出结果

### 成功输出
```
✅ 视频生成完成!

📝 基本信息:
  项目名称: tang-monk-dating
  总时长: 60秒
  片段数量: 6个

🎬 生成片段:
  场景1: ./output/scene-01.mp4 (¥170, 12分钟)
  场景2: ./output/scene-02.mp4 (¥170, 11分钟)
  场景3: ./output/scene-03.mp4 (¥170, 13分钟)
  场景4: ./output/scene-04.mp4 (¥170, 12分钟)
  场景5: ./output/scene-05.mp4 (¥170, 14分钟)
  场景6: ./output/scene-06.mp4 (¥170, 11分钟)

💰 成本统计:
  平台: 即梦AI v3.0 Pro
  单价: ¥170/片段
  总成本: ¥1020
  预算: ¥1020 (100%)

⏱️ 时间统计:
  总时长: 73分钟
  平均每片段: 12分钟
  并发数: 3

📦 输出文件:
  合成视频: ./output/final.mp4
  音频文件: ./output/voice.mp3
  字幕文件: ./output/subtitle.ass
  项目状态: ./.state/session.json
```

### 错误处理
```
❌ 视频生成失败

错误信息: 场景3生成超时

处理建议:
  1. 检查网络连接
  2. 查看API余额
  3. 尝试降级到备用平台:
     /implement <项目名> --platform sora2
  4. 使用断点续传:
     /implement <项目名> --resume
```

## 断点续传

如果生成过程中断:

```bash
# 恢复上次任务
/implement <项目名> --resume

# 查看任务状态
/implement <项目名> --status

# 重新生成指定场景
/implement <项目名> --scenes 3,5
```

## 配置要求

```env
# .env 文件配置

# 即梦AI (火山引擎)
VOLCANO_ACCESS_KEY=your_access_key
VOLCANO_SECRET_KEY=your_secret_key

# Sora2 (备用平台)
SORA2_API_KEY=your_sora2_key

# 可选平台
RUNWAY_API_KEY=your_runway_key
KLING_API_KEY=your_kling_key
```

## 相关命令
- `/specify` - 创建项目规格
- `/plan` - 制定技术计划
- `/tasks` - 生成任务列表
- `/validate` - L0+L1 验证
- `/preview` - L2 动态预览

## 参考文档
- [WorkflowOrchestrator 示例](../../examples/workflow-orchestrator-example.ts)
- [平台适配器系统](../../docs/platform-adapters/README.md)
- [Sora2 适配器指南](../../docs/platform-adapters/sora2-adapter-guide.md)
- [即梦AI 适配器指南](../../docs/platform-adapters/jimeng-adapter-guide.md)
- [平台对比表](../../docs/platform-adapters/platform-comparison.md)

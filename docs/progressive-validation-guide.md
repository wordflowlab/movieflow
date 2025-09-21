# MovieFlow 渐进式验证指南

## 概述

MovieFlow 的渐进式验证系统让您能够以极低的成本逐步验证视频效果，避免直接生成导致的高昂调试费用。通过 L0→L1→L2→L3 的验证流程，将调试成本降低 **80%**。

## 为什么需要渐进式验证？

### 传统方式的痛点

- **每次测试成本高**：直接生成60秒视频需要约170元
- **调试效率低**：需要等待5-10分钟才能看到效果
- **成本失控**：3-5次调试就需要510-850元
- **反馈周期长**：发现问题后需要重新生成整个视频

### 渐进式验证的优势

- **成本控制**：通过分级验证，总成本仅需204元
- **快速反馈**：L0级即时反馈，L1级30秒反馈
- **风险降低**：在低成本阶段发现并解决问题
- **迭代高效**：可以快速调整和优化提示词

## 验证级别详解

### L0级 - 文本质量分析（免费）

**用途**：分析提示词质量，提供优化建议

**检查项目**：
- ✅ 场景描述完整性
- ✅ 人物形象描述
- ✅ 动作细节
- ✅ 视觉风格指定
- ✅ 提示词长度合理性

**使用方法**：
```bash
# 只进行文本分析
movieflow validate my-video --skip-l1
```

**输出示例**：
```
📊 L0 提示词质量分析:
  场景1: 85/100 分
    ✅ 包含场景描述
    ✅ 包含人物描述
    ✅ 包含动作描述
    ⚠️ 建议添加视觉风格描述

  平均分数: 78.5/100
  总体建议: 质量良好，可以继续
```

### L1级 - 关键帧预览（约6元）

**用途**：生成静态图像，预览视觉效果

**验证内容**：
- 🎨 角色形象是否符合预期
- 🏞️ 场景氛围是否正确
- 🎭 表情动作是否合适
- 🌈 色调风格是否满意

**使用方法**：
```bash
# 使用默认的UniAPI
movieflow validate my-video

# 使用云雾API作为备选
movieflow validate my-video --provider yunwu

# 只验证特定场景
movieflow validate my-video --scenes "1,3,5"
```

**支持的图像生成模型**：
- **UniAPI**: FLUX Pro/Dev, DALL-E 3, Stable Diffusion XL
- **云雾API**: FLUX系列, 豆包Pro, MidJourney V6

### L2级 - 动态预览（约28元）

**用途**：生成10秒测试视频，验证动态效果

**验证内容**：
- 🎬 镜头运动流畅度
- 🎵 音画同步效果
- 💬 字幕时间轴
- ✨ 转场特效

**使用方法**：
```bash
# 预览默认第一个场景
movieflow preview my-video

# 预览特定场景
movieflow preview my-video --scene 3

# 包含音频和字幕
movieflow preview my-video --with-audio --with-subtitle

# 高质量预览
movieflow preview my-video --quality high
```

**质量选项**：
- `low`: 720P，快速预览
- `medium`: 1080P，标准质量（默认）
- `high`: 1080P Pro，最高质量

### L3级 - 完整生成（约170元）

**用途**：生成最终的60秒完整视频

**前置条件**：
- ✅ L0验证通过（分数≥60）
- ✅ L1视觉效果确认
- ✅ L2动态效果满意

**使用方法**：
```bash
movieflow generate my-video --template tang-monk
```

## 最佳实践工作流

### 1. 创建项目规格
```bash
# 使用AI助手命令
/video-specify tang-monk-dating
```

### 2. L0验证 - 优化提示词
```bash
movieflow validate tang-monk-dating --skip-l1
# 根据建议优化提示词，重复直到分数≥80
```

### 3. L1验证 - 确认视觉效果
```bash
movieflow validate tang-monk-dating
# 查看生成的6张图像，确认角色和场景
```

### 4. L2验证 - 测试关键场景
```bash
# 选择最重要的场景进行动态测试
movieflow preview tang-monk-dating --scene 1 --with-audio
```

### 5. 最终生成
```bash
# 所有验证通过后，生成完整视频
movieflow generate tang-monk-dating
```

## 成本分析

### 典型项目成本对比

| 场景 | 传统方式 | 渐进式验证 | 节省 |
|------|---------|-----------|------|
| 简单调整（1-2次） | 340元 | 204元 | 40% |
| 中等调整（3次） | 510元 | 210元 | 59% |
| 复杂调整（5次） | 850元 | 222元 | 74% |

### 成本构成分析

```
渐进式验证总成本 = L0(0) + L1(6) + L2(28) + L3(170) = 204元

其中：
- L0-L1阶段：解决80%的问题，成本仅6元
- L2阶段：解决15%的问题，成本28元
- L3阶段：最终生成，成本170元
```

## 环境配置

### 必需的API密钥

```env
# 火山引擎（L2和L3必需）
VOLCANO_ACCESS_KEY=xxx
VOLCANO_SECRET_KEY=xxx

# 图像预览API（L1必需，二选一）
UNIAPI_KEY=xxx        # 推荐，支持更多模型
YUNWU_API_KEY=xxx     # 备选方案
```

### 获取API密钥

1. **火山引擎**：[console.volcengine.com](https://console.volcengine.com/)
2. **UniAPI**：[uniapi.ai](https://uniapi.ai/)
3. **云雾API**：[yunwu.ai](https://yunwu.ai/)

## 故障排除

### 常见问题

**Q: L0分数一直很低怎么办？**
A: 检查提示词是否包含：
- 具体的场景描述（环境、光线、氛围）
- 详细的人物描述（外貌、服装、表情）
- 明确的动作描述（姿势、动作、互动）
- 视觉风格指定（Q版、写实、卡通等）

**Q: L1图像生成失败？**
A:
1. 检查API密钥是否正确配置
2. 确认账户余额充足
3. 尝试切换到备用API服务商

**Q: L2预览质量不满意？**
A:
1. 尝试使用 `--quality high` 选项
2. 优化提示词中的动作描述
3. 调整场景的复杂度

## 进阶技巧

### 1. 批量优化提示词
```javascript
// 使用API批量验证
const results = await previewService.validateL0(prompts);
const optimized = results.map(r =>
  r.score < 80 ? validator.optimize(r.prompt) : r.prompt
);
```

### 2. 自定义验证规则
```javascript
// 添加行业特定的验证规则
validator.addKeywords({
  scene: ['办公室', '会议室'],
  character: ['商务装', '职业装'],
  style: ['专业', '正式']
});
```

### 3. 成本预算控制
```bash
# 设置预算上限
export MOVIEFLOW_BUDGET_LIMIT=200

# 超过预算时自动停止
movieflow generate --budget-check
```

## 总结

渐进式验证系统是MovieFlow的核心优势，它让AI视频创作变得更加可控和经济。通过合理使用L0-L1-L2三级验证，您可以：

- 📉 降低80%的调试成本
- ⚡ 获得更快的反馈周期
- 🎯 在早期发现并解决问题
- 💰 避免重复生成的浪费

记住：**好的视频始于好的验证流程**。

---

*更多信息请访问 [MovieFlow GitHub](https://github.com/wordflowlab/movieflow)*
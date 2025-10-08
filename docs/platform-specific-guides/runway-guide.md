# Runway Gen-4 平台专项指南

## 概述

Runway Gen-4 是迭代速度最快的AI视频生成平台，特点是：
- ✅ 生成速度极快（10秒视频 ~2分钟）
- ✅ 数值化相机控制（6轴精确控制）
- ✅ 简化描述策略（less is more）
- ✅ 高质量输入图像转视频
- ✅ 适合快速原型测试

本指南专注于Runway Gen-4的提示词策略和相机控制技巧。

---

## 1. Runway核心理念

### 1.1 简单即是美 (Simplicity First)

**Runway官方建议**: "Don't underestimate the power of simplicity"

与Sora2的详细描述相反，Runway Gen-4在简洁描述下表现更佳。

**示例对比**:

❌ **过度复杂**:
```
A 28-year-old woman with long black hair tied in a loose bun, wearing a green silk dudou with intricate bamboo embroidery and gold thread accents, walks slowly at 1.2 m/s through a 1990s Hong Kong street illuminated by practical neon signs in magenta and cyan colors emitting 3200K warm light, with wet pavement reflecting the colored lights and thin mist creating volumetric light beams...
```

✅ **Runway优化**:
```
Woman in green silk top walks through neon-lit Hong Kong street at night
```

**为何简洁更好**?
- Runway的AI偏向理解核心概念，而非细节
- 过多细节可能相互冲突，降低质量
- 简洁描述留给AI创造空间

---

### 1.2 迭代优于一次完美

Runway的快速生成速度使其非常适合迭代工作流：

**推荐流程**:
1. **第一次**: 简单描述核心概念
2. **第二次**: 添加1-2个关键细节
3. **第三次**: 调整相机运动参数
4. **第四次**: 微调光照或氛围

**示例迭代**:

**Iteration 1** (baseline):
```
Woman walks in park
```

**Iteration 2** (添加氛围):
```
Woman walks in park at golden hour
```

**Iteration 3** (添加相机):
```
Woman walks in park at golden hour
Camera: Dolly forward (+3), Zoom (+2)
```

**Iteration 4** (添加情绪):
```
Thoughtful woman walks slowly in park at golden hour
Camera: Dolly forward (+3), Zoom (+2)
```

---

### 1.3 正面描述 (Positive Phrasing)

Runway不支持负向提示词（与Stable Diffusion不同）。

❌ **避免使用**:
- "no clouds" → ✅ "clear sky"
- "without people" → ✅ "empty street"
- "not blurry" → ✅ "sharp focus"
- "don't show face" → ✅ "back view"

**原因**: Runway的模型架构不包含负向引导机制。

---

## 2. Runway相机控制系统

### 2.1 六轴数值控制

Runway Gen-4的核心优势：精确的数值化相机控制。

| 轴向 | 范围 | 描述 |
|------|------|------|
| **Horizontal** | -10 到 +10 | 水平移动（负=左，正=右） |
| **Vertical** | -10 到 +10 | 垂直移动（负=下，正=上） |
| **Pan** | -10 到 +10 | 水平旋转（负=左转，正=右转） |
| **Tilt** | -10 到 +10 | 垂直旋转（负=下俯，正=上仰） |
| **Zoom** | -10 到 +10 | 镜头焦距（负=缩小，正=放大） |
| **Roll** | -10 到 +10 | 轴向旋转（负=逆时针，正=顺时针） |

### 2.2 强度参考表

| 数值 | 强度 | 效果 | 适用场景 |
|------|------|------|---------|
| **0.1 - 1** | Minimal | 极微妙，几乎不可察觉 | 静态场景微调 |
| **2 - 3** | Subtle | 柔和流畅，不干扰主体 | 人物对话、产品展示 |
| **4 - 6** | Moderate | 明显但不夸张 | 跟拍、环境转换 |
| **7 - 10** | Intense | 强烈动感，戏剧性 | 动作场景、转场 |

### 2.3 常用组合

**推进特写** (Push In):
```
Horizontal: 0
Vertical: 0
Pan: 0
Tilt: 0
Zoom: +5
Roll: 0

描述: Slow push toward subject's face
```

**升起俯瞰** (Crane Up):
```
Horizontal: 0
Vertical: +6
Pan: 0
Tilt: -3
Zoom: 0
Roll: 0

描述: Camera rises and tilts down, revealing environment
```

**跟拍侧移** (Tracking Shot):
```
Horizontal: +4
Vertical: 0
Pan: +2 (保持朝向主体)
Tilt: 0
Zoom: 0
Roll: 0

描述: Camera tracks alongside moving subject
```

**环绕主体** (Orbit):
```
Horizontal: +5
Vertical: 0
Pan: +7 (同步旋转)
Tilt: 0
Zoom: 0
Roll: 0

描述: Camera orbits around static subject
```

**荷兰角** (Dutch Angle):
```
Horizontal: 0
Vertical: 0
Pan: 0
Tilt: 0
Zoom: 0
Roll: +4

描述: Tilted frame, creates unease
```

---

## 3. Runway提示词策略

### 3.1 核心结构

**简化公式**:
```
[主体] + [动作] + [环境] + [氛围/风格]
```

**示例**:

**场景1: 人物肖像**
```
Elderly man with grey beard smiles gently in warm candlelight
```
- 主体: Elderly man with grey beard
- 动作: smiles gently
- 环境: (隐含：室内)
- 氛围: warm candlelight

**场景2: 自然风光**
```
Waves crash on rocky shore at sunset, golden light
```
- 主体: Waves
- 动作: crash
- 环境: rocky shore
- 氛围: sunset, golden light

**场景3: 城市街拍**
```
Busy Tokyo street at night, neon signs reflect on wet pavement
```
- 主体: Busy Tokyo street
- 动作: (隐含：人流、车流)
- 环境: at night
- 氛围: neon signs, wet pavement

### 3.2 关键词优先级

**高优先级** (必须包含):
1. **主体**: 谁/什么（"woman", "car", "tree"）
2. **核心动作**: 做什么（"walks", "drives", "sways"）

**中优先级** (强烈推荐):
3. **环境**: 在哪里（"park", "street", "beach"）
4. **时间/光照**: 何时（"sunset", "night", "midday"）

**低优先级** (锦上添花):
5. **风格**: 如何表现（"cinematic", "dreamy", "dramatic"）
6. **情绪**: 感觉如何（"peaceful", "tense", "joyful"）

**示例 - 逐步添加**:

**最小版本** (高优先级):
```
Woman walks
```

**标准版本** (+ 中优先级):
```
Woman walks through park at golden hour
```

**完整版本** (+ 低优先级):
```
Thoughtful woman walks slowly through autumn park at golden hour, cinematic
```

### 3.3 专注运动描述

Runway Gen-4的官方建议：**描述运动，而非描述输入图像**。

❌ **描述输入图像**:
```
Prompt: A woman with long hair stands in a park
(Runway已经看到图像了，重复描述无意义)
```

✅ **描述期望的运动**:
```
Prompt: Camera slowly zooms toward woman's face, she turns head left
```

**原理**: Runway的图生视频模式（Image-to-Video）中，输入图像已提供所有静态信息。Prompt应该描述**动态变化**。

**更多示例**:

**静物变动态**:
- 输入: 桌上的蜡烛图片
- Prompt: `Candle flame flickers gently, wax melts slowly`

**人物表情变化**:
- 输入: 女性中性表情
- Prompt: `Woman slowly smiles, eyes brighten with joy`

**环境变化**:
- 输入: 街道日景
- Prompt: `Sunlight fades, streetlights turn on one by one`

---

## 4. 高质量输入图像技巧

### 4.1 输入图像要求

Runway的视频质量高度依赖输入图像质量。

**推荐参数**:
| 属性 | 推荐值 | 原因 |
|------|--------|------|
| **分辨率** | ≥1920x1080 | 低分辨率会被放大，产生噪点 |
| **清晰度** | 锐利清晰 | 模糊输入→模糊视频 |
| **光照** | 均匀或戏剧性 | 避免过曝/欠曝 |
| **构图** | 留白空间 | 为运动留出空间 |
| **主体位置** | 避免边缘 | 运动可能裁切 |

### 4.2 输入图像类型

**最佳类型**:
1. **AI生成图像**（Midjourney, DALL-E）
2. **专业摄影**（高质量相机拍摄）
3. **3D渲染**（Blender, C4D）

**可用但需优化**:
4. **手机照片**（需确保光照和清晰度）
5. **视频截图**（需高帧率源）

**避免**:
- 低分辨率网络图片
- 过度压缩的JPEG
- 水印或文字（会在视频中保持静态）

### 4.3 输入图像与Prompt配合

**策略1: 构图预留运动空间**

**输入图像**: 主体在左侧1/3处
**Prompt**: `Camera pans right, revealing cityscape`
**结果**: 相机右移，城市景观逐渐进入画面

**策略2: 动态元素识别**

**输入图像**: 女性站立，头发披散
**Prompt**: `Wind blows gently, hair flows to the right`
**结果**: Runway识别头发为可动元素，生成飘动

**策略3: 深度感利用**

**输入图像**: 前景有树木，中景有人物，背景有山
**Prompt**: `Camera dollies forward, passing tree toward person`
**结果**: 利用深度层次，生成穿越感

---

## 5. Runway光照与氛围

### 5.1 光照关键词

Runway对光照描述响应良好：

**时间光照**:
- `golden hour` - 暖黄色，柔和阴影
- `blue hour` - 冷蓝色，暮光
- `midday sun` - 明亮，硬阴影
- `overcast` - 柔光，低对比

**方向光照**:
- `backlit` - 逆光，轮廓光
- `side-lit` - 侧光，立体感
- `top-down lighting` - 顶光

**风格光照**:
- `cinematic lighting` - 戏剧性，高对比
- `soft diffused light` - 柔和，低对比
- `dramatic shadows` - 强烈阴影
- `volumetric light` - 体积光束

### 5.2 氛围关键词

**自然氛围**:
- `misty forest` - 雾气森林
- `rainy city street` - 雨中城市
- `dusty desert` - 尘土沙漠
- `snowy mountains` - 雪山

**人造氛围**:
- `neon-lit alley` - 霓虹小巷
- `smoky jazz club` - 烟雾爵士乐俱乐部
- `candlelit room` - 烛光房间
- `industrial warehouse` - 工业仓库

### 5.3 风格参考

**电影风格**:
- `Blade Runner aesthetic` - 赛博朋克霓虹
- `Wes Anderson style` - 对称构图，粉彩色调
- `noir film look` - 黑白高对比
- `documentary style` - 纪实自然

**摄影风格**:
- `National Geographic` - 自然纪实
- `fashion photography` - 时尚大片
- `street photography` - 街拍抓拍
- `aerial view` - 航拍视角

---

## 6. Runway常见问题

### 6.1 视频抖动/不稳定

**问题**: 生成的视频晃动严重

**原因**:
- 输入图像质量低
- Prompt冲突（描述静态+动态）
- 相机参数过高

**解决方案**:
1. 使用高质量输入图像
2. 简化Prompt，去除冲突描述
3. 降低相机参数（7→4）

**优化前**:
```
Prompt: Woman stands still in park, leaves blow in wind, camera shakes
Camera: All axes at +8
```

**优化后**:
```
Prompt: Gentle breeze, leaves rustle softly
Camera: Horizontal +2, others 0
```

### 6.2 主体变形

**问题**: 人物面部或身体变形

**原因**:
- 输入图像非正面/姿态复杂
- Prompt要求过度运动
- 相机Roll参数使用不当

**解决方案**:
1. 使用正面/标准姿态输入
2. 限制主体运动（focus on环境运动）
3. 避免Roll（除非刻意需要）

**优化前**:
```
Input: 侧面扭头照片
Prompt: Woman turns head and smiles
Camera: Roll +6
```

**优化后**:
```
Input: 正面照片
Prompt: Subtle smile forms, eyes brighten
Camera: All 0 (静态相机)
```

### 6.3 运动不自然

**问题**: 物体移动僵硬、速度不均

**原因**:
- Prompt中速度描述不清
- 相机运动与主体运动冲突

**解决方案**:
1. 明确速度词汇（`slowly`, `quickly`, `gently`）
2. 分离相机和主体运动

**优化前**:
```
Prompt: Woman walks and camera moves
Camera: Horizontal +5, Pan +5
```

**优化后**:
```
Prompt: Woman walks slowly
Camera: Horizontal +3 (平滑跟拍)
```

---

## 7. Runway与Sora2/即梦对比

| 特性 | Runway Gen-4 | Sora2 | 即梦AI |
|------|-------------|-------|--------|
| **生成速度** | ⭐⭐⭐⭐⭐ 最快(~2分钟) | ⭐⭐ 慢(~15分钟) | ⭐⭐⭐ 中(~5分钟) |
| **提示词策略** | 简化 | 详细 | 详细中文 |
| **相机控制** | ⭐⭐⭐⭐⭐ 数值化 | ⭐⭐⭐⭐ 描述式 | ⭐⭐⭐ 中文描述 |
| **输入图像依赖** | ⭐⭐⭐⭐⭐ 强依赖 | ⭐⭐ 可选 | ⭐⭐⭐ 首尾帧 |
| **对话支持** | ❌ 不支持 | ⭐⭐⭐⭐⭐ Lip-sync | ⭐⭐⭐ Agent模式 |
| **物理真实性** | ⭐⭐⭐ 一般 | ⭐⭐⭐⭐⭐ 最强 | ⭐⭐⭐⭐ 较好 |
| **最大时长** | 10秒 | 60秒+ | 10秒 |
| **成本** | $$ | $$$$ | $ |
| **适用场景** | 快速原型、简单动作 | 完整叙事、对话 | 中文内容 |

**使用建议**:
- **快速测试** → Runway (2分钟出结果，快速迭代)
- **最终成品** → Sora2 (质量最高，但耗时)
- **预算有限** → 即梦 (性价比高)

**混合工作流**:
```
Step 1: Runway快速生成5个版本，测试构图和运镜
Step 2: 选择最佳版本，转用Sora2生成高质量版
Step 3: 即梦生成中文配音版本（针对国内平台）
```

---

## 8. 实战案例

### 案例1: 人物肖像

**需求**: 女性转头微笑特写

**输入图像**: Midjourney生成的女性正面肖像（1920x1080）

**Prompt v1** (首次尝试):
```
Woman smiles
```

**结果**: 微笑但僵硬

**Prompt v2** (迭代):
```
Woman slowly smiles, eyes brighten with warmth
```

**相机**:
```
Zoom: +2 (缓慢推进到面部)
Others: 0
```

**结果**: ✅ 自然渐进的微笑，眼神变化

---

### 案例2: 街景展示

**需求**: 展现繁华东京夜景

**输入图像**: 东京涩谷路口照片（航拍）

**Prompt**:
```
Busy Tokyo intersection at night, neon signs glow, traffic flows
```

**相机**:
```
Vertical: -4 (从高空缓慢下降)
Tilt: +2 (同时下俯看向地面)
Zoom: +3 (放大)
```

**结果**: ✅ 电影感的城市俯冲镜头

---

### 案例3: 产品展示

**需求**: 手表产品360°展示

**输入图像**: 手表正面高清图（白色背景）

**Prompt**:
```
Watch rotates slowly, light reflects on metal surface
```

**相机**:
```
Horizontal: +5
Pan: +6 (保持朝向产品)
Others: 0
```

**结果**: ✅ 平滑的环绕展示，金属反光真实

---

## 9. 高级技巧

### 9.1 首尾帧控制

Runway支持同时指定首帧和尾帧图像（Gen-4 Turbo）。

**用法**:
- **首帧**: 初始状态
- **尾帧**: 最终状态
- **Prompt**: 描述过渡过程

**示例**:
- 首帧: 花苞未开
- 尾帧: 花朵盛开
- Prompt: `Flower blooms gracefully, petals unfold`

### 9.2 循环视频 (Looping)

创建无缝循环的技巧：

1. 首尾帧使用相同/相似图像
2. Prompt描述周期性运动
3. 相机参数使用低值（平滑）

**示例**:
```
Input: 旋转的行星
Prompt: Planet rotates smoothly, continuous motion
Camera: Pan +3 (匀速旋转)
```

### 9.3 分段生成长视频

Runway单次10秒，可分段生成：

**方法**:
1. 生成Segment 1 (0-10s)
2. 使用Segment 1尾帧作为Segment 2首帧
3. 生成Segment 2 (10-20s)
4. 后期拼接

**连贯性技巧**:
- 每段使用相同Prompt关键词
- 相机参数保持一致
- 避免跳跃性运动

---

## 10. Prompt速查表

### 运动词汇

| 慢速 | 中速 | 快速 |
|------|------|------|
| slowly | steadily | quickly |
| gently | smoothly | rapidly |
| gradually | continuously | swiftly |
| subtle | moderate | intense |

### 光照氛围

| 自然 | 人造 | 风格 |
|------|------|------|
| golden hour | neon lights | cinematic |
| sunset | candlelight | dramatic |
| overcast | streetlights | moody |
| sunrise | fireplace | soft |

### 相机运动

| 推拉 | 旋转 | 升降 |
|------|------|------|
| push toward | pan left/right | crane up |
| pull away | tilt up/down | descend |
| zoom in/out | orbit around | rise smoothly |

---

## 11. 最佳实践总结

### ✅ DO (推荐做法)

1. **保持简洁**: 10-20个词以内
2. **高质量输入**: 1920x1080+，清晰锐利
3. **描述运动**: Focus on what changes
4. **数值化相机**: 使用6轴精确控制
5. **快速迭代**: 利用速度优势测试多版本
6. **正面描述**: 说"是什么"，不说"不是什么"

### ❌ DON'T (避免做法)

1. **过度复杂**: 避免50+词的长描述
2. **负向提示**: 不使用"no", "without"
3. **冲突描述**: "静止" + "运动"同时出现
4. **过高参数**: 相机轴向>8易抖动
5. **低质输入**: <720p图像
6. **重复图像信息**: 图像已展示的不需重复描述

---

## 12. 工具与资源

### 官方资源

- [Runway Gen-4 Prompting Guide](https://help.runwayml.com/hc/en-us/articles/39789879462419)
- [Camera Control Documentation](https://help.runwayml.com/hc/en-us/articles/34926468947347)
- [Runway Community Gallery](https://app.runwayml.com/explore)

### 推荐工作流

**工作流A: 图生视频**
```
1. Midjourney/DALL-E生成高质量图像
2. Runway导入图像
3. 简化Prompt描述运动
4. 数值化设置相机
5. 快速生成测试（2分钟）
6. 迭代优化（重复2-3次）
```

**工作流B: 快速原型**
```
1. 手绘草图或截图作为输入
2. 极简Prompt（5-10词）
3. 测试多个相机组合
4. 选最佳版本精修（换高质输入）
```

---

## 总结

Runway Gen-4的核心策略：
1. **简洁为王**: 10-20词足够
2. **数值控制**: 利用6轴精确相机控制
3. **高质输入**: 图像质量=视频质量
4. **快速迭代**: 2分钟生成，多次测试
5. **描述运动**: Focus on what changes, not what is

**何时选择Runway**:
- ✅ 需要快速原型测试
- ✅ 已有高质量输入图像
- ✅ 简单运动场景（10秒内）
- ✅ 需要精确相机控制
- ❌ 需要对话同步（选Sora2）
- ❌ 需要长视频（>30s）（选Sora2）

---

**下一步**:
- 阅读 `sora2-guide.md` 了解详细物理描述
- 阅读 `jimeng-guide.md` 了解中文平台技巧
- 参考 `cinema-terminology-reference.md` 查询术语

---

**版本**: v1.0
**作者**: MovieFlow Team
**最后更新**: 2025-01-XX

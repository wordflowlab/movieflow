# AI视频脚本提示词标准化指南

> **版本**: 1.0.0
> **更新时间**: 2025-10-07
> **适用于**: MovieFlow、Sora2、Runway、即梦AI等主流AI视频生成平台

---

## 目录

1. [概述](#概述)
2. [研究背景](#研究背景)
3. [优秀示例分析](#优秀示例分析)
4. [AI平台对比](#ai平台对比)
5. [四大标准化方案](#四大标准化方案)
6. [MovieFlow集成建议](#movieflow集成建议)
7. [最佳实践](#最佳实践)
8. [术语表](#术语表)

---

## 概述

本指南基于对主流AI视频生成平台（Sora2、Runway Gen-4、即梦AI、Kling AI）的深入研究，以及优秀提示词案例的分析，总结出适用于不同场景的视频脚本提示词标准化方案。

### 核心目标

✅ 解决现有提示词的不足：
- ❌ 缺少对话和旁白文本
- ❌ 缺少字幕规范
- ❌ 视频时长限制（<20秒）
- ❌ 跨镜头连贯性管理缺失
- ❌ 角色表演细节不足

✅ 提供标准化的解决方案：
- ✅ 完整的对话/字幕系统
- ✅ 支持长视频（60-180秒）
- ✅ 跨镜头/跨Episode连贯性追踪
- ✅ 多平台适配
- ✅ 符合电影工业标准

---

## 研究背景

### 研究方法

本指南基于以下权威资源的深入研究：

#### 1. Sora2 官方文档和最佳实践
- **OpenAI Sora 2 System Card (2025)**
- **OpenAI "Sora 2 is here" announcement (2025)**
- **Skywork AI: 12 Essential Sora 2 Prompting Tips**

#### 2. Runway 官方指南
- **Gen-4 Video Prompting Guide**
- **Creating with Camera Control on Gen-3**

#### 3. 中文AI视频平台
- **即梦AI 平台实践**
- **Agent模式对话生成**

#### 4. 电影工业标准
- **专业分镜脚本格式**
- **Shot List模板**
- **中文电影制作术语**

### 核心发现

| 平台 | 核心原则 | 最大优势 | 最适合场景 |
|------|---------|---------|-----------|
| **Sora2** | 多句结构化，像给摄影师简报 | 对话时间标记、同步音频 | 叙事性内容、带对话的场景 |
| **Runway Gen-4** | 简单性优先，迭代添加细节 | 快速迭代、运动控制 | 视觉效果、运动设计 |
| **即梦AI** | 详细描述+Agent对话生成 | 中文语义理解、首尾帧控制 | 中文内容、国风题材 |
| **Kling AI** | 简单提示+详细运动控制 | 首尾帧精确控制 | 特定动作、运动控制 |

---

## 优秀示例分析

### 示例1：肚兜广告（王家卫风格）

**优势分析：**

✅ **技术规格明确**
```
- 时长：10秒
- 画幅：16:9宽屏
- 画质：高清1080p
- 镜头数量：5个
```

✅ **艺术方向清晰**
```
- 风格参考：王家卫电影光影
- 色调：低饱和度深红和玉色调
- 光照：高对比度侧逆光+暗角
- 主题：隐秘的东方韵味
```

✅ **镜头设计专业**
```
镜头一（0-2s）：微距特写 + Ultra-slow Dolly-in
镜头二（2-4s）：中景慢摇移 + Slow Pan
镜头三（4-6s）：低速升降特写 + Slow Crane Shot
镜头四（6-8s）：中景背部特写 + 侧逆光
镜头五（8-10s）：快速拉远至全景 + 柔和光晕
```

✅ **音效设计完整**
```
- 丝绸摩擦声（极轻微）
- 丝带滑落声
- 背景配乐：缓慢精致的古典弦乐
```

**不足之处：**

❌ 缺少对话/旁白文本
❌ 缺少字幕规范
❌ 时长太短（10秒）
❌ 没有跨镜头连贯性管理

### 示例2：肚兜广告（宋代美学）

**额外优势：**

✅ **拉焦技巧**（Rack Focus）
```
镜头二：焦点从玉手镯快速拉焦到肚兜主体
```

✅ **丁达尔效应**（Volumetric Light）
```
强烈光束照亮肚兜，突出主体色彩
```

✅ **微距垂直升降**
```
镜头紧贴刺绣图案，缓慢垂直升起
展示刺绣针法极致层次感
```

### 示例3：榴莲炒饭（美食短片）

**额外优势：**

✅ **快速蒙太奇**（Fast-cut Montage）
```
[00:03-00:06] 三组快切（每组1秒）
1. 酱油嘶嘶作响
2. 葱花均匀撒入
3. 铲子有力翻炒
```

✅ **节奏感设计**
```
SFX: "咣当"炒菜声 + "刷"的翻炒声
极强节奏感的音效设计
```

✅ **品牌结尾**
```
Text overlay: 'Produced by PAISHU'
clean sans-serif, white with drop shadow
```

### 三个示例的共同特点

| 要素 | 完成度 | 说明 |
|------|-------|------|
| 技术规格 | ✅ 100% | 时长、画幅、画质明确 |
| 时间线分解 | ✅ 100% | 精确到秒 |
| 镜头术语 | ✅ 100% | 专业电影术语 |
| 视觉风格 | ✅ 100% | 明确参考风格 |
| 光影设计 | ✅ 100% | 详细光照方案 |
| 音效设计 | ✅ 90% | 音效描述完整 |
| 对话文本 | ❌ 0% | **缺失** |
| 字幕规范 | ❌ 0% | **缺失** |
| 长视频支持 | ❌ 10-15秒 | **太短** |
| 跨镜头连贯性 | ❌ 0% | **缺失** |

---

## AI平台对比

### Sora2 提示词核心原则

#### 1. 像导演一样构建提示词（Shot List方式）

**结构化要素：**
```
- Subject/Action（主体/动作）
- Setting/Time（场景/时间）
- Camera & Lens（相机&镜头）
- Motion Path（运动路径）
- Lighting/Texture（光照/质感）
- Tone/Style（基调/风格）
```

**示例：**
```
A rainy neon alley in Tokyo at night;
medium close-up on a courier adjusting his helmet;
35mm lens, shallow depth of field;
handheld camera pushing in slowly;
wet asphalt glistening;
moody, synthwave palette.
```

#### 2. 使用电影术语控制镜头

**Shot Type（景别）：**
- Establishing（建立镜头）
- Wide/Full Shot（远景）
- Medium Shot（中景）
- Close-Up（特写）
- Extreme Close-Up（大特写）

**Angle（角度）：**
- Low Angle（低角度）
- High Angle（高角度）
- Eye Level（平视）

**Lens（镜头）：**
- Wide 24mm
- Standard 35mm
- Portrait 85mm

**Camera Moves（运镜）：**
- Dolly（推轨）
- Crane（升降）
- Gimbal（稳定器）
- Handheld Push-in（手持推进）

#### 3. 编码物理真实性

**关键要素：**
```
- Materials（材质）：rigid/soft, wet/dry
- Mass/Weight（质量/重量）描述
- Interactions（交互）：bounce, splash, skid, wobble
- Environment Forces（环境力）：wind, slope, uneven ground
- Causality（因果）：missed catch → ball rebounds
```

**示例：**
```
A skateboarder attempts a kickflip;
board clips the curb and tumbles;
wheels wobble;
skater stumbles and regains balance;
camera tracks right at ankle height.
```

#### 4. 有目的地设计音频

**音频要素：**
```
- Who speaks and what they say（谁说什么）
- Tone and pacing（语气和节奏）：whispered, urgent, relaxed
- Ambient SFX（环境音）：rain, crowd, traffic
- Musical mood（音乐情绪）：subtle pad
- Sync cues（同步提示）：door slam at reveal
```

**示例：**
```
Dialogue: "We're late—move!" whispered urgently;
distant rain on tin roofs;
a muffled train horn;
low synth pulse rising as camera pushes in.
```

#### 5. 对话时间标记（Sora2独有）

**语法：**
```
- Two lines of dialogue, lip-synced
- A pause before the punchline
- Footsteps crescendo as the camera nears
```

### Runway Gen-4 提示词核心原则

#### 1. 简单性优先（Power of Simplicity）

**推荐流程：**
```
1. 从简单基础提示词开始
2. 测试基本运动是否工作
3. 逐步添加元素：
   - Subject motion（主体运动）
   - Camera motion（相机运动）
   - Scene motion（场景运动）
   - Style descriptors（风格描述）
```

#### 2. 最佳实践

✅ **使用正向描述**
```
❌ "no rapid zooms"
✅ "stable handheld camera motion"
```

✅ **直接、简单、易懂**
```
❌ "the camera should move in a way that..."
✅ "camera dolly in slowly"
```

✅ **专注描述运动，而非输入图像**
```
❌ "the woman wears a red dress"（图像已包含）
✅ "the woman turns slowly towards camera"（描述运动）
```

✅ **避免对话式或命令式**
```
❌ "Make the camera zoom out"
❌ "Hi, I want to create..."
✅ "camera zooms out revealing the landscape"
```

✅ **避免过度复杂**
```
❌ 50词+多个从句
✅ 精炼到1-3句，每个元素清晰
```

#### 3. 相机控制数值化（Gen-3 Alpha Turbo）

**6种运动方向：**

| Direction | 描述 | 示例提示词 | 数值范围 |
|-----------|------|-----------|---------|
| Horizontal | X轴移动 | camera glides right | -10 ~ +10 |
| Vertical | Y轴移动 | camera glides up | -10 ~ +10 |
| Pan | 水平旋转（固定点） | camera pans left | -10 ~ +10 |
| Tilt | 垂直旋转（固定点） | camera tilts upwards | -10 ~ +10 |
| Zoom | 拉近/拉远 | camera zooms out | -10 ~ +10 |
| Roll | 画面旋转（固定点） | camera rotates right | -10 ~ +10 |

**数值强度：**
```
0.1-1   : Minimal（最小）
2-3     : Subtle（微妙）
4-6     : Moderate（适中）
7-10    : Intense（强烈）
```

### 即梦AI 提示词核心原则

#### 1. 详细描述优先

**要素：**
```
- 场景描述要尽可能详细
- 包含动作、情感描述
- 确保与首尾帧图像一致
```

#### 2. 首尾帧一致性

⚠️ **关键规则：**
```
- 提示词必须与首尾帧图像一致
- 避免添加图像中不存在的元素
- 如果首尾帧有重要细节，必须在提示词中明确说明
```

#### 3. Agent模式（2025新功能）

**特点：**
```
- 直接对话生成提示词
- 一次生成4个提示词变体
- 可通过对话调整
- 简化复杂多步骤创作任务
```

#### 4. 中文语义优化

**优势：**
```
- 对中文提示词理解更强
- 适合国风题材
- 中文描述更自然
```

**局限：**
```
⚠️ 手部理解较弱
- 手部常常变形或僵硬
- 建议避免手部特写
```

---

## 四大标准化方案

### 方案一：分层式结构（MovieFlow推荐）⭐

**适用场景：**
- 长视频（60-180秒）
- 多Episode系列
- 需要跨镜头连贯性管理
- 复杂叙事内容

**结构层次：**

```
┌─────────────────────────────────────────┐
│  第1层：项目元数据层 (Project Meta)       │
│  ├─ 技术规格                             │
│  ├─ 目标平台                             │
│  └─ 品牌信息                             │
├─────────────────────────────────────────┤
│  第2层：全局设计层 (Global Design)       │
│  ├─ 视觉风格                             │
│  ├─ 色调基调                             │
│  ├─ 光影风格                             │
│  └─ 音乐风格                             │
├─────────────────────────────────────────┤
│  第3层：Episode/场景层 (Episode/Scene)   │
│  ├─ 场景设定                             │
│  ├─ 人物                                 │
│  ├─ 位置                                 │
│  └─ 时间                                 │
├─────────────────────────────────────────┤
│  第4层：镜头序列层 (Shot Sequence)       │
│  ├─ 时间码                               │
│  ├─ 景别                                 │
│  ├─ 运镜                                 │
│  ├─ 画面描述                             │
│  ├─ 对话文本 ⭐                          │
│  ├─ 字幕规范 ⭐                          │
│  ├─ 音效设计                             │
│  └─ VFX特效                              │
├─────────────────────────────────────────┤
│  第5层：连贯性追踪层 (Continuity)        │
│  ├─ 角色状态                             │
│  ├─ 道具连续性                           │
│  ├─ 视觉母题                             │
│  └─ 情绪基调                             │
└─────────────────────────────────────────┘
```

**完整模板：**

查看详细模板：[template-1-layered-structure.md](./video-prompt-templates/template-1-layered-structure.md)

**优势：**
✅ 符合MovieFlow的Episode-Based架构
✅ 支持长视频（>60秒）
✅ 完整的对话和字幕支持
✅ 跨镜头连贯性管理
✅ 可模块化复用

---

### 方案二：电影脚本式结构

**适用场景：**
- 叙事性内容
- 团队协作
- 需要人类阅读和审核
- 复杂对话场景

**结构：**

```markdown
# 场景标题 [INT/EXT. 地点 - 时间]

## 技术规格
- Duration: 60秒
- Aspect: 16:9
- Quality: 1080p
- Platform: YouTube

## 艺术方向 (Art Direction)
- Reference Style: 王家卫《花样年华》
- Color Palette: 深红、琥珀、墨绿
- Lighting: 侧光、暗角、高对比度
- Mood: 含蓄、忧郁、精致

## 时间线 (Timeline)

### [00:00-00:05] 镜头1
- **Shot Type**: Close-Up (特写)
- **Camera Move**: Slow Dolly-in (缓慢推进)
- **Subject**: 一只修长的手轻抚丝绸
- **Dialogue**: [无]
- **Subtitle**:
  - Text: "隐秘的东方韵味"
  - Position: 底部居中
  - Style: 宋体、白色、描边
- **Audio**:
  - SFX: 丝绸摩擦声（极轻微）
  - Music: 古筝，淡入
- **VFX**: 柔和光晕

[重复其他镜头...]

## 连贯性注意 (Continuity Notes)
- 手部位置：从画面右侧进入
- 光线变化：保持侧光一致
- 色调延续：深红主色调贯穿
```

查看详细模板：[template-2-film-script-style.md](./video-prompt-templates/template-2-film-script-style.md)

**优势：**
✅ 电影工业标准
✅ 易于人类阅读和协作
✅ 完整的对话/字幕系统
✅ 适合复杂叙事

---

### 方案三：AI优化模板（Sora2最优）⭐⭐

**适用场景：**
- Sora2平台
- 需要对话同步
- 音频设计复杂
- 快速迭代

**结构：**

```markdown
=== VIDEO SPECIFICATION ===
Duration: 120s | Aspect: 16:9 | Quality: 1080p
Platform: YouTube | Genre: 叙事短片

=== CREATIVE BRIEF ===
Theme: 隐秘的东方韵味
Style Reference: 王家卫《花样年华》
Mood: 含蓄、忧郁、精致

=== VISUAL DESIGN ===
Color Palette: 深红、琥珀色、墨绿
Lighting Setup: 侧逆光 + 暗角 + 高对比度
Camera Style: 手持稳定器，缓慢运动

=== SHOT BREAKDOWN ===

## Shot 1 [00:00-00:05]
**Scene**: 昏暗的东方风格闺房，一件刺绣肚兜悬挂在半空

**Subject Motion**:
一只修长的女性手部（只到手腕）缓慢地抚摸悬挂的肚兜。
手指轻柔地沿着刺绣纹理滑动。

**Camera Motion**:
slow dolly-in from medium to close-up,
handheld with subtle breathing motion,
shallow depth of field focusing on fabric texture

**Scene Motion**:
丝绸在触摸下轻微摇晃，
微弱的灯光在丝绸表面产生光泽流动

**Dialogue**:
[无对话]

**Subtitle**:
- Text: "隐秘的东方韵味"
- Position: bottom-center, safe zone
- Style: serif font (宋体), white with black stroke, opacity 95%
- Timing: fade in at 0:01, hold until 0:04, fade out 0:05

**Audio Cues**:
- SFX: 极轻微的丝绸摩擦声，清晰可辨
- Music: 古筝独奏，缓慢淡入，音量-18dB
- Ambience: 静谧的室内环境音，几乎无声

**VFX**:
柔和的镜头光晕（lens flare），暗角（vignette）

**Style**:
cinematic, high-end fashion commercial aesthetic

[重复其他镜头...]

=== AUDIO DESIGN ===
Music Track: 古筝独奏《渔舟唱晚》片段
  - 0:00-0:30: 淡入，-18dB
  - 0:30-1:00: 渐强至-12dB
  - 1:00-2:00: 淡出至-∞dB

SFX Library:
  - 丝绸摩擦声 (0:01, 0:15, 0:45)
  - 丝带滑落声 (0:30)
  - 轻微呼吸声 (throughout, -24dB)

Dialogue Mix: N/A
Background Ambience: 静谧室内，-30dB

=== BRANDING ===
Logo Placement: 1:55-2:00, 右下角
End Card: "BRAND NAME"，纯白色，中心浮现

=== CONTINUITY TRACKER ===
Visual Links:
  - Shot 1→2: 手部从右侧移出，在Shot 2从左侧进入
  - Shot 2→3: 光线从侧光过渡到背光

Character State:
  - 情绪：含蓄、若有所思
  - 动作：缓慢、优雅

Props:
  - 肚兜位置：始终在画面中心偏右
  - 光源位置：45度侧逆光
```

查看详细模板：[template-3-ai-optimized.md](./video-prompt-templates/template-3-ai-optimized.md)

**优势：**
✅ 完美适配Sora2的对话时间标记功能
✅ 明确的音频节奏提示
✅ AI友好的结构化格式
✅ 完整的字幕规范
✅ 支持长视频分段生成

---

### 方案四：专业广告脚本格式

**适用场景：**
- 品牌广告
- 客户沟通
- 团队协作
- 短视频营销

**结构：**

```markdown
# 广告脚本

**CLIENT**: 东方韵味品牌
**PRODUCT**: 刺绣肚兜系列
**DURATION**: 15秒
**FORMAT**: 9:16 竖屏

## CONCEPT
"发现艺术品" - 展现传统刺绣肚兜的工艺美学

## VISUAL STYLE
- 参考：王家卫电影光影
- 色调：低饱和度深红和玉色调
- 光照：侧逆光 + 暗角

## STORYBOARD

| Time | Shot | Visual | Audio | Copy/VO | Subtitle |
|------|------|--------|-------|---------|----------|
| 0-3s | CU | 手部轻抚刺绣 | 丝绸摩擦声 | [无] | "隐秘的东方韵味" |
| 3-6s | MS | 肚兜缓慢展开 | 古筝淡入 | [无] | "千年工艺传承" |
| 6-9s | ECU | 刺绣细节特写 | 古筝渐强 | [无] | "每一针都是艺术" |
| 9-12s | FS | 女性背影转身 | 音乐达到高潮 | [无] | [无] |
| 12-15s | WS | 品牌logo浮现 | 音乐淡出 | [品牌名] | [品牌名] |

## TECHNICAL NOTES
- **Camera**: 手持稳定器，缓慢运动
- **Lighting**: 3点布光，主光45度侧面，-2 stops
- **Color Grade**: 电影LUT，降饱和度20%，提升对比度15%

## TALENT DIRECTION
- 动作缓慢、优雅
- 表情含蓄、若有所思
- 避免直视镜头

## POST PRODUCTION
- **Graphics**: 宋体中文字幕，白色描边
- **Subtitles**:
  - 位置：底部安全区
  - 字号：48pt
  - 动画：淡入淡出，0.3s
- **Music**: 版权古筝音乐
```

查看详细模板：[template-4-commercial-format.md](./video-prompt-templates/template-4-commercial-format.md)

**优势：**
✅ 广告行业标准
✅ 客户沟通友好
✅ 包含完整的字幕规范
✅ 适合品牌内容

---

## MovieFlow集成建议

### 1. 扩展Episode Spec格式

**当前结构：**
```json
{
  "scenes": [
    {
      "id": "S001",
      "shots": [...]
    }
  ]
}
```

**建议扩展：**
```json
{
  "scenes": [
    {
      "id": "S001",
      "name": "决心站队",
      "duration": 20,
      "shots": [...],
      "dialogue": {              // ⭐ 新增
        "lines": [
          {
            "speaker": "关允",
            "text": "成败在此一举",
            "timing": "00:15-00:18",
            "tone": "内心独白，坚定",
            "lipSync": false
          }
        ]
      },
      "subtitle": {              // ⭐ 新增
        "enabled": true,
        "style": {
          "font": "Source Han Sans CN",
          "size": 48,
          "color": "#FFFFFF",
          "stroke": "#000000",
          "position": "bottom-center"
        },
        "captions": [
          {
            "text": "县长办公室门口",
            "timing": "00:00-00:03",
            "animation": "fade"
          }
        ]
      },
      "audio": {                 // ⭐ 新增
        "music": {
          "track": "tension_ambient.mp3",
          "volume": -18,
          "timing": "00:00-00:20"
        },
        "sfx": [
          {
            "type": "footsteps",
            "timing": "00:02",
            "volume": -12
          },
          {
            "type": "door_knock",
            "timing": "00:18",
            "count": 3
          }
        ],
        "ambience": "office_corridor"
      },
      "continuity": {            // ⭐ 新增
        "characterState": {
          "关允": {
            "emotion": "紧张→决绝",
            "location": "门口→准备敲门",
            "clothing": "深色西装"
          }
        },
        "props": ["公文包", "报告材料"],
        "lighting": "走廊冷色调→门前暖色调",
        "visualLink": "从上一场景的远景延续"
      }
    }
  ]
}
```

### 2. 新增命令建议

#### `/comic-dialogue <episode-id>`
```bash
# 优化Episode中的对话时间点
/comic-dialogue EP001

# 功能：
- 自动分析场景时长
- 优化对话timing
- 检测lip-sync可行性
- 生成dialogue JSON
```

#### `/comic-subtitle <episode-id>`
```bash
# 生成字幕配置
/comic-subtitle EP001 --style "cinematic"

# 功能：
- 生成字幕时间码
- 选择字幕样式（cinematic/modern/minimal）
- 生成SRT文件
- 集成到Episode spec
```

#### `/comic-audio <episode-id>`
```bash
# 设计音频方案
/comic-audio EP001

# 功能：
- 推荐BGM
- 设计SFX时间点
- 优化音频层次
- 生成audio JSON
```

#### `/comic-extend <episode-id> --duration 120`
```bash
# 扩展Episode到指定时长
/comic-extend EP001 --duration 120

# 功能：
- 智能拆分为多个段落
- 保持跨段连贯性
- 自动时间重分配
- 生成扩展spec
```

### 3. 创建多平台适配器

#### SoraAdapter
```typescript
class SoraAdapter {
  // 转换为Sora2优化格式
  convertToSora2(episodeSpec: EpisodeSpec): Sora2Prompt {
    return {
      specification: this.extractTechSpecs(episodeSpec),
      creativeBrief: this.extractCreative(episodeSpec),
      visualDesign: this.extractVisual(episodeSpec),
      shotBreakdown: this.convertShots(episodeSpec.scenes),
      audioDesign: this.extractAudio(episodeSpec),
      continuityTracker: this.extractContinuity(episodeSpec)
    };
  }

  // 生成对话时间标记
  generateDialogueTiming(dialogue: Dialogue[]): string {
    // "Character says 'text' at 0:15, pause before next line"
  }
}
```

#### RunwayAdapter
```typescript
class RunwayAdapter {
  // 转换为Runway简化格式
  convertToRunway(episodeSpec: EpisodeSpec): RunwayPrompt {
    return {
      // 专注运动描述
      motion: this.extractMotion(episodeSpec),
      // 简化提示词
      simplified: this.simplifyPrompt(episodeSpec),
      // 相机控制数值
      cameraControl: this.extractCameraValues(episodeSpec)
    };
  }
}
```

#### JimengAdapter
```typescript
class JimengAdapter {
  // 转换为即梦AI优化格式
  convertToJimeng(episodeSpec: EpisodeSpec): JimengPrompt {
    return {
      // 详细中文描述
      detailedDescription: this.generateChineseDescription(episodeSpec),
      // 首尾帧一致性检查
      frameConsistency: this.checkFrameConsistency(episodeSpec),
      // Agent模式提示
      agentPrompt: this.generateAgentPrompt(episodeSpec)
    };
  }
}
```

### 4. Tracking系统增强

#### dialogue-tracker.json
```json
{
  "project": "官运",
  "episodes": [
    {
      "episodeId": "EP001",
      "dialogues": [
        {
          "speaker": "关允",
          "lines": [
            {
              "text": "成败在此一举",
              "timing": "00:15-00:18",
              "emotion": "坚定",
              "context": "准备敲门前的内心独白"
            }
          ]
        }
      ]
    }
  ]
}
```

#### timing-optimizer
```typescript
class TimingOptimizer {
  // 自动优化对话节奏
  optimizeDialogueTiming(dialogue: Dialogue, sceneDuration: number) {
    // 计算理想timing
    // 避免对话重叠
    // 留出呼吸空间
  }

  // 检测lip-sync可行性
  checkLipSyncFeasibility(dialogue: Dialogue, shot: Shot) {
    // 检查镜头类型
    // 检查说话者可见性
    // 返回可行性评分
  }
}
```

#### subtitle-config.json
```json
{
  "styles": {
    "cinematic": {
      "font": "Source Han Serif CN",
      "size": 48,
      "color": "#FFFFFF",
      "stroke": {
        "color": "#000000",
        "width": 2
      },
      "position": "bottom-center",
      "animation": "fade",
      "duration": 0.3
    },
    "modern": {
      "font": "Source Han Sans CN",
      "size": 56,
      "color": "#FFFFFF",
      "stroke": {
        "color": "#FF0000",
        "width": 3
      },
      "position": "top-center",
      "animation": "slide",
      "duration": 0.5
    }
  }
}
```

---

## 最佳实践

### 1. Sora2最佳实践

#### ✅ DO（推荐做法）

**使用结构化的shot list方式：**
```
✅ A rainy neon alley in Tokyo at night;
   medium close-up on a courier;
   35mm lens, shallow depth of field;
   handheld camera pushing in slowly.
```

**编码物理真实性：**
```
✅ A skateboarder attempts a kickflip;
   board clips the curb and tumbles;
   wheels wobble;
   skater stumbles and regains balance.
```

**有目的地设计音频：**
```
✅ Dialogue: "We're late—move!" whispered urgently;
   distant rain on tin roofs;
   low synth pulse rising.
```

**使用电影术语：**
```
✅ slow dolly-in building intimacy
✅ handheld tracking shot following character
✅ crane shot revealing the landscape
```

#### ❌ DON'T（避免做法）

**避免对话式提示词：**
```
❌ "Hi, I want to create a video where..."
❌ "Can you make the camera..."
❌ "Please generate..."
```

**避免否定提示：**
```
❌ "no rapid zooms"
❌ "without blur"
❌ "don't show hands"

✅ 改用正向描述：
   "stable camera motion"
   "sharp focus throughout"
   "subject centered in frame"
```

**避免过度复杂：**
```
❌ 50词+，多个从句，混合多个场景描述

✅ 精炼到1-3句，每个元素清晰
```

### 2. Runway最佳实践

#### ✅ 迭代式添加细节

**第1轮：基础运动**
```
camera zooms out
```

**第2轮：添加场景**
```
camera zooms out revealing a forest clearing
```

**第3轮：添加细节**
```
camera zooms out revealing a sunlit forest clearing;
soft mist drifting between trees
```

**第4轮：添加风格**
```
camera zooms out revealing a sunlit forest clearing;
soft mist drifting between trees;
cinematic, golden hour lighting
```

#### ✅ 专注描述运动

**主体运动：**
```
✅ the subject turns slowly towards the camera
✅ she raises her hand in greeting
```

**场景运动：**
```
✅ leaves blow gently in the wind
✅ curtains billow as she walks past
```

**相机运动：**
```
✅ camera glides smoothly from left to right
✅ slow crane shot descending to eye level
```

### 3. 即梦AI最佳实践

#### ✅ 详细中文描述

```
✅ 一位身着淡粉色汉服的女子站在古色古香的木质抽屉前，
   她的手上戴着温润的和田玉手镯，
   手指修长纤细，指甲涂着浅色指甲油。
   她缓慢地拉开抽屉，动作优雅而从容。
```

#### ✅ 首尾帧一致性检查

```
首帧：女子站在抽屉前，手放在抽屉把手上
提示词：✅ "女子拉开抽屉"

首帧：女子站在抽屉前
提示词：❌ "女子打开窗户" ← 与首帧不一致！
```

#### ⚠️ 避免手部特写

```
❌ 手部大特写、复杂手势
✅ 手部中景、简单动作
```

### 4. 通用最佳实践

#### ✅ 时长规划

**短视频（10-15秒）：**
```
- 1-3个镜头
- 单一主题
- 快速hook
- 适合广告
```

**中等视频（30-60秒）：**
```
- 3-6个镜头
- 简单叙事
- 清晰起承转合
- 适合产品展示
```

**长视频（60-180秒）：**
```
- 6-15个镜头
- 完整故事
- 分段生成
- 需要连贯性管理
```

#### ✅ 对话设计

**Timing原则：**
```
- 每个对话3-5秒
- 对话间留0.5-1秒呼吸
- 避免对话重叠
- 重要对话留更长时间
```

**Lip-sync可行性：**
```
✅ 中景以上、正面或侧面
✅ 简短对话（<10词）
❌ 远景、背影
❌ 长段对话（>20词）
```

#### ✅ 字幕规范

**位置：**
```
- 底部：最常用，不遮挡主体
- 顶部：主体在画面下方时使用
- 中央：强调文字时使用
- 避免：覆盖人脸或重要视觉元素
```

**样式：**
```
电影风格：
- 字体：衬线体（宋体、Source Han Serif）
- 颜色：白色 + 黑色描边
- 大小：48-56pt
- 动画：淡入淡出

现代风格：
- 字体：无衬线体（黑体、Source Han Sans）
- 颜色：白色 + 彩色描边
- 大小：56-64pt
- 动画：滑入滑出
```

**时长：**
```
- 最短：1秒（闪现字幕）
- 标准：2-3秒（正常阅读）
- 最长：5秒（重点强调）
```

---

## 术语表

### 镜头景别（Shot Size）

| 中文 | 英文 | 缩写 | 描述 |
|------|------|------|------|
| 大远景 | Extreme Wide Shot | EWS | 展现广阔环境 |
| 远景 | Wide Shot / Full Shot | WS/FS | 展现全身+环境 |
| 全景 | Full Shot | FS | 人物全身 |
| 中景 | Medium Shot | MS | 腰部以上 |
| 中近景 | Medium Close-Up | MCU | 胸部以上 |
| 近景 | Close-Up | CU | 肩部以上 |
| 特写 | Close-Up | CU | 头部 |
| 大特写 | Extreme Close-Up | ECU | 眼睛/嘴部 |

### 相机运动（Camera Movement）

| 中文 | 英文 | 描述 |
|------|------|------|
| 推镜 | Dolly In / Push In | 相机向前推进 |
| 拉镜 | Dolly Out / Pull Out | 相机向后拉远 |
| 横移 | Tracking / Trucking | 相机水平移动 |
| 升降 | Crane / Boom | 相机垂直移动 |
| 摇镜 | Pan | 相机水平旋转 |
| 俯仰 | Tilt | 相机垂直旋转 |
| 跟镜 | Follow | 跟随主体移动 |
| 环绕 | Arc | 围绕主体旋转 |
| 变焦 | Zoom | 改变焦距 |
| 手持 | Handheld | 手持相机晃动感 |
| 稳定器 | Gimbal / Steadicam | 稳定运动 |

### 镜头角度（Camera Angle）

| 中文 | 英文 | 描述 |
|------|------|------|
| 平视 | Eye Level | 与主体视线平齐 |
| 仰视 | Low Angle | 从下往上拍 |
| 俯视 | High Angle | 从上往下拍 |
| 鸟瞰 | Bird's Eye View | 垂直俯视 |
| 虫视 | Worm's Eye View | 极低角度仰视 |
| 荷兰角 | Dutch Angle / Canted | 倾斜画面 |

### 镜头焦距（Focal Length）

| 焦距 | 类型 | 用途 |
|------|------|------|
| 14-24mm | 超广角 | 环境、空间感 |
| 24-35mm | 广角 | 环境、小团体 |
| 35-50mm | 标准 | 接近人眼视角 |
| 50-85mm | 中长焦 | 人像 |
| 85-135mm | 长焦 | 特写、压缩空间 |
| 135mm+ | 超长焦 | 远距离拍摄 |

### 光照类型（Lighting）

| 中文 | 英文 | 描述 |
|------|------|------|
| 主光 | Key Light | 主要光源 |
| 辅光 | Fill Light | 填充阴影 |
| 轮廓光 | Rim Light / Back Light | 勾勒轮廓 |
| 侧光 | Side Light | 从侧面照射 |
| 顶光 | Top Light | 从上方照射 |
| 底光 | Bottom Light | 从下方照射（恐怖感） |
| 逆光 | Back Light | 从背后照射 |
| 侧逆光 | Side Back Light | 45度背侧光 |
| 自然光 | Natural Light | 日光 |
| 黄金时刻 | Golden Hour | 日出日落 |
| 蓝调时刻 | Blue Hour | 黎明黄昏 |

### 特殊光效（Special Lighting Effects）

| 中文 | 英文 | 描述 |
|------|------|------|
| 丁达尔效应 | Volumetric Light / God Rays | 光束可见 |
| 暗角 | Vignette | 画面四周变暗 |
| 镜头光晕 | Lens Flare | 强光造成的光斑 |
| 柔光 | Soft Light | 柔和的散射光 |
| 硬光 | Hard Light | 强烈的直射光 |
| 色温 | Color Temperature | 暖调/冷调 |

### 转场方式（Transitions）

| 中文 | 英文 | 描述 |
|------|------|------|
| 硬切 | Cut / Hard Cut | 直接切换 |
| 淡入淡出 | Fade In / Fade Out | 渐隐渐显 |
| 溶解 | Dissolve / Cross Fade | 两画面交叠 |
| 划像 | Wipe | 画面推移 |
| 匹配切 | Match Cut | 相似元素衔接 |
| 跳切 | Jump Cut | 时间跳跃 |

---

## 附录：完整示例

### 示例A：60秒叙事短片（分层式）

```markdown
=== 第1层：项目元数据 ===

**Project**: 东方韵味 - 传承
**Duration**: 60s
**Aspect Ratio**: 16:9
**Resolution**: 1080p
**Platform**: YouTube
**Brand**: 东方韵味
**Campaign**: 2025春季系列

=== 第2层：全局设计 ===

**Visual Style**: 王家卫《花样年华》+ 宋代美学
**Color Palette**:
- 主色：深红（#8B1A1A）
- 辅色：琥珀色（#D4AF37）
- 点缀：墨绿（#2F4F2F）
- 背景：米白（#F5F5DC）

**Lighting Style**:
- 侧逆光为主
- 高对比度
- 暗角效果
- 柔和光晕

**Music Style**: 古典民乐（古筝+琵琶）

**Mood**: 含蓄、精致、怀旧、高级

=== 第3层：Episode/场景 ===

**Scene Setup**:
- Location: 传统中式闺房
- Time of Day: 黄昏
- Characters: 年轻女性（25-30岁）
- Props: 刺绣肚兜、古色古香的木质抽屉、和田玉手镯

=== 第4层：镜头序列 ===

**Shot 1 [00:00-00:10]**
- **Shot Size**: Wide Shot → Medium Shot
- **Camera Move**: Slow dolly in (速度: 2/10)
- **Subject**: 女性站在古董柜前，手放在抽屉把手上，准备拉开
- **Dialogue**: [无]
- **Subtitle**:
  - Text: "每一件，都是传承"
  - Position: bottom-center, safe zone
  - Style: Source Han Serif, 48pt, white + black stroke
  - Timing: 00:02-00:06, fade in/out 0.3s
- **Audio**:
  - Music: 古筝独奏，淡入，-18dB
  - SFX: 木质抽屉轻微吱呀声 (00:08)
  - Ambience: 静谧室内
- **VFX**: 暗角，柔和光晕
- **Lighting**: 侧光从右侧45度照射

**Shot 2 [00:10-00:20]**
- **Shot Size**: Close-Up (Rack Focus)
- **Camera Move**: Fixed, focus pull from foreground to background
- **Subject**:
  - Foreground: 手腕上的和田玉手镯（失焦）
  - Background: 抽屉内的刺绣肚兜（拉焦后清晰）
  - 强烈丁达尔效应光束照亮肚兜
- **Dialogue**: [无]
- **Subtitle**:
  - Text: "千年工艺"
  - Position: top-center
  - Style: Source Han Serif, 48pt, white + black stroke
  - Timing: 00:15-00:18, fade in/out 0.3s
- **Audio**:
  - Music: 琵琶加入，-15dB
  - SFX: 光线流动的微妙音效
  - Ambience: 持续
- **VFX**: 丁达尔光束，暗角
- **Lighting**: 强烈顶光制造光束效果

[... 继续其他4个镜头 ...]

=== 第5层：连贯性追踪 ===

**Character State**:
- Episode Start: 好奇、期待
- Episode End: 欣赏、珍视

**Props Continuity**:
- 玉手镯：始终在右手腕，所有镜头可见
- 肚兜：从抽屉→手中→展开→穿着
- 抽屉：第1镜头拉开，之后保持开启状态

**Lighting Continuity**:
- 全程保持侧逆光
- 色温：3200K（暖色调）
- 光线方向：始终从右侧45度

**Visual Motifs**:
- 红色作为主色调贯穿
- 丝绸光泽反复出现
- 刺绣细节作为视觉锚点
```

---

## 版本历史

- **v1.0.0** (2025-10-07)
  - 初版发布
  - 基于Sora2、Runway、即梦AI研究
  - 包含4大标准化方案
  - MovieFlow集成建议

---

## 参考资料

1. **OpenAI Sora 2 System Card (2025)**
   https://openai.com/index/sora-2-system-card/

2. **OpenAI "Sora 2 is here" announcement (2025)**
   https://openai.com/index/sora-2/

3. **Skywork AI: 12 Essential Sora 2 Prompting Tips (2025)**
   https://skywork.ai/blog/sora-2-prompting-tips-2025/

4. **Runway Gen-4 Video Prompting Guide**
   https://help.runwayml.com/hc/en-us/articles/39789879462419

5. **Runway Creating with Camera Control**
   https://help.runwayml.com/hc/en-us/articles/34926468947347

---

## 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues: https://github.com/wordflowlab/movieflow/issues
- Email: movieflow@wordflowlab.com

---

**© 2025 MovieFlow Team. All rights reserved.**

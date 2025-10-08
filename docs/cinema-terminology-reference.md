# 电影摄影与AI视频术语参考

## 概述

本文档汇总了视频制作和AI视频生成中常用的专业术语，包括中英文对照和AI平台推荐用法。

**适用于**:
- AI视频平台: Sora2, Runway Gen-4, 即梦AI, Kling
- 传统视频制作
- MovieFlow Episode Spec编写

---

## 目录

1. [镜头景别 (Shot Sizes)](#1-镜头景别-shot-sizes)
2. [相机运镜 (Camera Movements)](#2-相机运镜-camera-movements)
3. [焦距与光圈 (Focal Length & Aperture)](#3-焦距与光圈-focal-length--aperture)
4. [光照术语 (Lighting)](#4-光照术语-lighting)
5. [色彩与调色 (Color Grading)](#5-色彩与调色-color-grading)
6. [构图术语 (Composition)](#6-构图术语-composition)
7. [音频术语 (Audio)](#7-音频术语-audio)
8. [AI视频专用术语 (AI-Specific)](#8-ai视频专用术语-ai-specific)
9. [物理与动态 (Physics & Dynamics)](#9-物理与动态-physics--dynamics)
10. [剪辑术语 (Editing)](#10-剪辑术语-editing)

---

## 1. 镜头景别 (Shot Sizes)

| 英文缩写 | 英文全称 | 中文 | 描述 | AI使用建议 |
|---------|---------|------|------|-----------|
| **EWS** | Extreme Wide Shot | 全景 / 大全景 | 展现广阔环境，人物很小或不可见 | ✅ Sora2, Runway, 即梦均支持 |
| **WS** | Wide Shot | 远景 | 包含完整人物及周围环境 | ✅ 最常用，推荐 |
| **FS** | Full Shot | 全身 | 人物全身，从头到脚 | ✅ 人物展示推荐 |
| **MS** | Medium Shot | 中景 | 人物从腰部以上 | ✅ 对话和动作推荐 |
| **MCU** | Medium Close-Up | 中特写 | 人物从胸部以上 | ✅ 情绪表现 |
| **CU** | Close-Up | 特写 | 人物面部或物体细节 | ✅ 情绪/产品特写 |
| **ECU** | Extreme Close-Up | 大特写 | 眼睛、嘴唇、手指等极小细节 | ✅ 强烈情绪/细节展示 |
| **OTS** | Over-the-Shoulder | 过肩镜头 | 从一个角色肩膀后拍另一角色 | ⚠️ Sora2较好，Runway一般 |
| **POV** | Point of View | 主观镜头 | 从角色视角看世界 | ✅ 沉浸感强，推荐 |
| **Two Shot** | Two Shot | 双人镜头 | 两个人物在同一画面 | ✅ 对话场景推荐 |

### 使用示例

```yaml
# Sora2格式
SHOT_SIZE: MS (Medium Shot)
DESCRIPTION: "Medium shot of a woman from waist up, standing in kitchen..."

# Runway格式
Prompt: "Medium shot, woman standing in kitchen"

# 即梦格式
景别: 中景
描述: "一位女性从腰部以上的中景镜头，站在厨房里..."
```

---

## 2. 相机运镜 (Camera Movements)

### 2.1 基础运镜

| 英文 | 中文 | 描述 | 数值参考 (Runway) | AI支持度 |
|------|------|------|------------------|----------|
| **Static / Locked-off** | 固定机位 | 相机完全静止 | 无运动参数 | ⭐⭐⭐⭐⭐ 所有平台 |
| **Pan** | 摇镜 / 横摇 | 相机左右水平旋转 | -10 (左) 到 +10 (右) | ⭐⭐⭐⭐⭐ 所有平台 |
| **Tilt** | 俯仰 / 竖摇 | 相机上下垂直旋转 | -10 (下) 到 +10 (上) | ⭐⭐⭐⭐⭐ 所有平台 |
| **Dolly / Tracking** | 推拉 / 跟拍 | 相机前后移动 | - | ⭐⭐⭐⭐⭐ 所有平台 |
| **Crane / Boom** | 升降 | 相机垂直上下移动 | - | ⭐⭐⭐⭐ Sora2, 即梦较好 |
| **Zoom** | 变焦 | 镜头焦距变化 | -10 (缩小) 到 +10 (放大) | ⭐⭐⭐⭐ 所有平台 |
| **Roll** | 旋转 / 翻滚 | 相机沿镜头轴旋转 | -10 (逆时针) 到 +10 (顺时针) | ⭐⭐⭐ Sora2, Runway |
| **Handheld** | 手持 | 轻微不稳定晃动 | - | ⭐⭐⭐⭐ Sora2最佳 |
| **Steadicam** | 斯坦尼康 | 平滑流畅跟拍 | - | ⭐⭐⭐ Sora2较好 |

### 2.2 复合运镜

| 英文 | 中文 | 描述 | AI支持度 |
|------|------|------|----------|
| **Push in** | 推进 | Dolly向前 + 可能Zoom | ⭐⭐⭐⭐⭐ |
| **Pull out** | 拉出 | Dolly向后 + 可能Zoom | ⭐⭐⭐⭐⭐ |
| **Orbit** | 环绕 | 相机围绕主体旋转 | ⭐⭐⭐ Sora2 |
| **Whip pan** | 甩镜 | 快速横摇，制造模糊转场 | ⭐⭐⭐⭐ Sora2, Runway |
| **Dutch angle / Canted** | 荷兰角 / 倾斜 | 相机倾斜（非水平） | ⭐⭐⭐ Sora2 |

### 2.3 Runway Gen-4数值参考

| 运镜 | 数值范围 | 强度说明 |
|------|---------|---------|
| Horizontal (左右) | -10 到 +10 | 负值=左移, 正值=右移 |
| Vertical (上下) | -10 到 +10 | 负值=下移, 正值=上移 |
| Pan (横摇) | -10 到 +10 | 负值=向左, 正值=向右 |
| Tilt (俯仰) | -10 到 +10 | 负值=向下, 正值=向上 |
| Zoom (变焦) | -10 到 +10 | 负值=缩小, 正值=放大 |
| Roll (旋转) | -10 到 +10 | 负值=逆时针, 正值=顺时针 |

**强度参考**:
- 0.1-1: Minimal (极小)
- 2-3: Subtle (微妙)
- 4-6: Moderate (中等)
- 7-10: Intense (强烈)

### 使用示例

```yaml
# Sora2描述式
CAMERA: Slow dolly in, pushing toward the character's face. Handheld style with slight natural shake.

# Runway数值式
Camera:
  Horizontal: +3
  Zoom: +5
  Roll: 0

# 即梦中文式
运镜: 缓慢推进，向角色面部靠近。手持风格，带有轻微自然晃动。
```

---

## 3. 焦距与光圈 (Focal Length & Aperture)

### 3.1 焦距 (Focal Length)

| 焦距 | 类型 | 用途 | 透视特点 | AI效果 |
|------|------|------|---------|--------|
| **14-24mm** | 超广角 | 风景、建筑、环境 | 透视夸张，畸变明显 | ⭐⭐⭐⭐ |
| **24-35mm** | 广角 | 环境、街拍 | 透视较宽，空间感强 | ⭐⭐⭐⭐⭐ |
| **35-50mm** | 标准 | 日常、纪实 | 接近人眼视角 | ⭐⭐⭐⭐⭐ |
| **50-85mm** | 人像 | 人像、特写 | 透视自然，背景虚化好 | ⭐⭐⭐⭐⭐ |
| **85-135mm** | 中长焦 | 人像、产品 | 压缩空间，虚化强 | ⭐⭐⭐⭐ |
| **135-300mm** | 长焦 | 远摄、野生动物 | 空间压缩明显 | ⭐⭐⭐ |
| **100mm macro** | 微距 | 极小物体细节 | 1:1放大，景深极浅 | ⭐⭐⭐⭐ Sora2 |

### 3.2 光圈 (Aperture)

| 光圈值 | 景深效果 | 用途 | AI效果描述 |
|--------|---------|------|-----------|
| **f/1.2 - f/1.8** | 极浅景深 | 人像、产品特写、艺术虚化 | "shallow depth of field", "creamy bokeh" |
| **f/2.0 - f/2.8** | 浅景深 | 人像、视频拍摄 | "soft background blur" |
| **f/4.0 - f/5.6** | 中等景深 | 街拍、纪实 | "balanced focus" |
| **f/8.0 - f/11** | 深景深 | 风景、建筑 | "deep focus", "everything sharp" |
| **f/16 - f/22** | 极深景深 | 风景、星芒效果 | "maximum sharpness throughout" |

### 焦距与光圈组合示例

```yaml
# 人像特写（虚化背景）
Lens: 85mm portrait lens, f/1.4
Result: Shallow depth of field, subject sharp, background creamy bokeh

# 风景全景（全清晰）
Lens: 24mm wide angle, f/11
Result: Deep focus, sharp from foreground to background

# 产品微距
Lens: 100mm macro, f/2.8
Result: Extreme close-up with soft background separation
```

---

## 4. 光照术语 (Lighting)

### 4.1 光源类型

| 英文 | 中文 | 描述 | AI关键词 |
|------|------|------|---------|
| **Key Light** | 主光 | 主要光源，塑造主体形态 | "key light from [direction]" |
| **Fill Light** | 补光 | 填充阴影，柔化对比 | "soft fill light", "bounce light" |
| **Rim Light / Back Light** | 轮廓光 / 背光 | 从背后照亮，勾勒边缘 | "rim light", "backlit", "halo effect" |
| **Practical Light** | 实用光源 | 画面中可见的光源（灯泡、蜡烛） | "practical lights", "neon signs", "candlelight" |
| **Natural Light** | 自然光 | 太阳光、天光 | "natural daylight", "golden hour", "overcast light" |
| **Ambient Light** | 环境光 | 整体环境照明 | "ambient lighting", "soft ambience" |

### 4.2 光照方向

| 英文 | 中文 | 效果 | AI描述 |
|------|------|------|--------|
| **Front Light** | 正面光 | 平淡，阴影少 | "front-lit", "flat lighting" |
| **Side Light** | 侧光 | 立体感强，戏剧性 | "side-lit", "dramatic shadows" |
| **Back Light** | 背光 | 轮廓清晰，主体偏暗 | "backlit", "silhouette" |
| **Top Light** | 顶光 | 阴影向下，眼窝深 | "overhead lighting", "harsh top light" |
| **Bottom Light** | 底光 | 恐怖感，不自然 | "uplight", "eerie lighting from below" |
| **Rembrandt Light** | 伦勃朗光 | 45°侧上光，三角形高光 | "Rembrandt lighting", "triangle of light" |

### 4.3 光照特性

| 英文 | 中文 | 描述 | AI关键词 |
|------|------|------|---------|
| **Hard Light** | 硬光 | 边缘锐利，阴影浓重 | "hard light", "direct sunlight", "harsh shadows" |
| **Soft Light** | 柔光 | 边缘柔和，阴影淡 | "soft light", "diffused lighting", "overcast" |
| **High Key** | 高调 | 整体明亮，对比度低 | "high key lighting", "bright and airy" |
| **Low Key** | 低调 | 整体暗沉，对比度高 | "low key lighting", "moody and dark" |
| **Golden Hour** | 黄金时段 | 日出日落温暖光 | "golden hour", "warm sunset light" |
| **Blue Hour** | 蓝调时刻 | 日出前/日落后冷蓝光 | "blue hour", "twilight", "cool ambient light" |
| **Volumetric Light** | 体积光 | 光束可见（丁达尔效应） | "volumetric light", "god rays", "light beams", "Tyndall effect" |

### 光照完整示例

```yaml
# 王家卫风格霓虹夜景
LIGHTING:
  Key: Neon signs (practical lights, magenta and cyan, 3200K)
  Fill: Bounce from wet street (subtle, -2 stops)
  Rim: Orange neon from background (warm halo)
  Atmosphere: Thin mist with volumetric light beams
  Style: Low key, moody, cinematic

AI Prompt: "Low key cinematic lighting. Practical neon signs in magenta and cyan as key lights. Wet street reflects colored lights. Thin mist creates volumetric light beams. Warm orange rim light from background."
```

---

## 5. 色彩与调色 (Color Grading)

### 5.1 色调 (Color Temperature)

| 色温 (Kelvin) | 描述 | 情绪 | AI关键词 |
|--------------|------|------|---------|
| **1000-2000K** | 烛光、篝火 | 温馨、亲密 | "candlelight", "warm amber glow" |
| **2500-3500K** | 白炽灯、日落 | 温暖、怀旧 | "warm tungsten light", "sunset glow" |
| **4000-5000K** | 荧光灯、清晨 | 中性、清新 | "neutral white", "daylight balanced" |
| **5500-6500K** | 正午阳光 | 自然、真实 | "daylight", "natural light" |
| **7000-10000K** | 阴天、蓝天 | 冷峻、忧郁 | "cool blue tone", "overcast sky" |

### 5.2 调色风格

| 风格 | 特点 | 代表作 | AI关键词 |
|------|------|--------|---------|
| **Cinematic Teal & Orange** | 青橙对比 | 《变形金刚》 | "teal shadows orange highlights", "blockbuster look" |
| **Bleach Bypass** | 低饱和高对比 | 《拯救大兵瑞恩》 | "desaturated", "bleach bypass", "gritty" |
| **Film Look (35mm)** | 胶片颗粒 | 各类电影 | "35mm film grain", "cinematic film look" |
| **Wong Kar-wai Style** | 暖黄+深绿阴影 | 《花样年华》 | "nostalgic warm yellow", "teal shadows", "vintage" |
| **Noir** | 黑白高对比 | 黑色电影 | "film noir", "high contrast black and white" |
| **Cyberpunk** | 霓虹紫/蓝/粉 | 《银翼杀手》 | "neon cyberpunk", "purple and cyan", "futuristic" |
| **Pastel** | 柔和粉彩 | 《布达佩斯大饭店》 | "pastel colors", "soft and dreamy" |

### 5.3 调色参数

| 参数 | 英文 | 作用 | AI描述技巧 |
|------|------|------|-----------|
| **曝光** | Exposure | 整体明暗 | "bright", "dark", "overexposed", "underexposed" |
| **对比度** | Contrast | 明暗差异 | "high contrast", "low contrast", "flat" |
| **饱和度** | Saturation | 色彩浓度 | "vibrant", "desaturated", "muted colors" |
| **阴影** | Shadows | 暗部细节 | "lifted shadows", "crushed blacks" |
| **高光** | Highlights | 亮部细节 | "blown highlights", "soft highlights" |
| **色调** | Hue | 色彩偏移 | "warm tones", "cool tones", "teal shift" |
| **晕影** | Vignette | 边缘暗角 | "vignette effect", "darkened edges" |
| **颗粒** | Grain | 胶片质感 | "film grain", "grainy texture" |

### 调色完整示例

```yaml
# 王家卫怀旧风格
COLOR_GRADING:
  Base: Warm yellow midtones (+15 hue shift toward yellow)
  Shadows: Deep teal/green (-20 saturation in shadows)
  Highlights: Soft bloom (+0.3 glow, prevent clipping)
  Saturation: Overall -20% (faded look)
  Film Grain: 35mm Kodak Vision3, 30% opacity
  Vignette: Subtle darkening (-15% edges)

AI Prompt: "Nostalgic cinematic color grading. Warm yellow midtones, teal shadows, faded saturation (-20%). Soft bloom on highlights. 35mm film grain. Subtle vignette."
```

---

## 6. 构图术语 (Composition)

### 6.1 构图法则

| 法则 | 英文 | 描述 | AI使用 |
|------|------|------|--------|
| **三分法** | Rule of Thirds | 画面九宫格，主体在交叉点 | "rule of thirds composition" |
| **黄金分割** | Golden Ratio | 1.618比例构图 | "golden ratio composition" |
| **对称构图** | Symmetrical | 左右或上下对称 | "symmetrical composition", "centered" |
| **引导线** | Leading Lines | 线条引导视线 | "leading lines toward subject" |
| **框架构图** | Frame within Frame | 画面内嵌套框架 | "frame within frame", "natural framing" |
| **前景深度** | Foreground Interest | 前景元素增加层次 | "foreground interest", "depth layering" |

### 6.2 画面比例

| 比例 | 用途 | 描述 | AI推荐 |
|------|------|------|--------|
| **16:9** | 横屏视频 | 标准宽屏，电影电视 | ⭐⭐⭐⭐⭐ 所有平台 |
| **9:16** | 竖屏短视频 | 抖音、视频号、Stories | ⭐⭐⭐⭐⭐ 所有平台 |
| **4:3** | 传统电视 | 复古感 | ⭐⭐⭐ Sora2 |
| **1:1** | 正方形 | Instagram方图 | ⭐⭐⭐⭐ 所有平台 |
| **2.39:1** | 超宽电影 | 史诗感 | ⭐⭐⭐ Sora2 |

### 构图示例

```yaml
# 三分法人像
COMPOSITION: Rule of thirds. Subject positioned on right third line, eyes on upper horizontal line. Negative space on left creates balance.

# 引导线风景
COMPOSITION: Leading lines. Road converges toward vanishing point in center. Mountains frame the horizon.
```

---

## 7. 音频术语 (Audio)

### 7.1 音频层级

| 层级 | 英文 | 内容 | 音量参考 |
|------|------|------|---------|
| **音乐** | Music | 背景音乐、配乐 | -18dB ~ -22dB |
| **对话** | Dialogue / VO | 人物对话、旁白 | -6dB ~ -10dB |
| **音效** | SFX (Sound Effects) | Foley、环境音 | -8dB ~ -20dB |
| **环境** | Ambience | 持续环境音 | -24dB ~ -32dB |

### 7.2 音频类型

| 类型 | 英文 | 描述 | AI关键词 |
|------|------|------|---------|
| **拟音** | Foley | 脚步、衣物摩擦等细节音 | "Foley sounds", "footsteps", "rustling" |
| **环境音** | Ambient Sound | 鸟鸣、车流、室内空间感 | "ambient sounds", "room tone", "background noise" |
| **同期声** | Sync Sound | 现场录制的对话和音效 | "sync sound", "on-screen dialogue" |
| **画外音** | Voiceover (VO) | 旁白、内心独白 | "voiceover", "narration", "inner monologue" |
| **音乐Cue** | Music Cue | 特定时间点的音乐 | "music hit at 0:15", "musical accent" |

### 7.3 音频处理

| 术语 | 英文 | 作用 | 参数参考 |
|------|------|------|---------|
| **混响** | Reverb | 空间感 | 0-30% (室内5-15%, 教堂30%) |
| **延迟** | Decay | 混响衰减时间 | 0.4-2.0s |
| **压缩** | Compression | 动态范围控制 | 4:1 ratio (对话) |
| **均衡** | EQ (Equalization) | 频率调整 | Boost 2-4kHz (清晰度) |
| **降噪** | De-noise | 去除底噪 | - |
| **响度** | Loudness (LUFS) | 标准响度 | -14 LUFS (抖音/视频号) |

### 音频设计示例

```yaml
# Sora2音频Cues
AUDIO:
  Music: Upbeat jazz, BPM 95, -20dB, ducks to -28dB during dialogue
  Dialogue:
    - "Character says 'Hello there' at 0:15, lip-synced"
    - Processing: Room reverb 8%, clarity boost
  SFX:
    - Door slam at 0:08, -10dB, stereo wide
    - Footsteps every 0.8s, -16dB, realistic Foley
  Ambience: Kitchen room tone, -28dB continuous

# 即梦格式
音频设计:
  背景音乐: 欢快爵士乐，BPM 95，音量 -20dB，对话时降至 -28dB
  对话: 角色在0:15秒说"你好"，口型同步，室内混响8%
  音效: 门响0:08秒、脚步声每0.8秒一次
  环境音: 厨房室内环境音，持续 -28dB
```

---

## 8. AI视频专用术语 (AI-Specific)

### 8.1 Sora2专用术语

| 术语 | 描述 | 示例 |
|------|------|------|
| **Lip-sync** | 对话口型同步 | "Character says 'text' at 0:15, lip-synced" |
| **Physics vocabulary** | 物理词汇（重量、力） | "heavy durian (3kg weight)", "force applied downward" |
| **Multi-sentence structure** | 多句描述结构 | 场景 + 动作 + 细节 + 氛围（分段描述） |
| **Audio cues** | 音频时间标记 | "A pause before the punchline", "music hit at 0:20" |
| **Dialogue timing** | 对话时间点 | "Two lines of dialogue, first at 0:10, second at 0:15" |

### 8.2 Runway Gen-4专用术语

| 术语 | 描述 | 示例 |
|------|------|------|
| **Camera Control数值** | 6轴运镜数值 | Horizontal: +5, Zoom: +3, Roll: 0 |
| **Simplicity first** | 简化描述 | "Woman walks in park" (不过度细节) |
| **Positive phrasing** | 正面描述 | ✅ "Clear sky" ✗ "No clouds" |
| **Motion focus** | 强调运动 | "Camera pushes in slowly" (描述运动，不描述输入图) |

### 8.3 即梦AI专用术语

| 术语 | 描述 | 示例 |
|------|------|------|
| **首帧/尾帧一致性** | 前后帧描述对应 | 首帧："女子站立" 尾帧："女子坐下" |
| **详细中文描述** | 用丰富中文细节 | "一位穿着墨绿色丝绸肚兜的女子，发髻松散..." |
| **Agent模式** | 对话式生成 | 通过对话与AI交互生成（集成Deepseek） |
| **手部弱项** | 避免复杂手部动作 | 即梦对手部细节处理较弱，避免复杂手势 |

### 8.4 通用AI术语

| 术语 | 描述 | 适用平台 |
|------|------|---------|
| **Prompt** | 提示词/描述文本 | 所有平台 |
| **Seed** | 随机种子（控制变化） | Runway, Kling |
| **Iteration** | 迭代生成 | 所有平台 |
| **Consistency** | 跨镜头一致性 | 所有平台（Sora2最佳） |
| **Hallucination** | AI幻觉（生成错误内容） | 所有平台（需人工检查） |

### AI Prompt最佳实践

```yaml
# ✅ GOOD - Sora2优化
"A medium shot of a 28-year-old woman in a green silk dudou, walking slowly through a 1990s Hong Kong street. Practical neon lights (magenta and cyan) illuminate her face from the left. Her jade bracelet catches the light as she moves. She says 'I've walked this street for ten years' at 0:06, lip-synced, with melancholic tone. Camera dollies alongside her. Wet pavement reflects the neon colors. Thin mist creates volumetric light beams. 24fps, cinematic film grain."

# ❌ BAD - 过于简单
"Woman walks in street with neon lights"

# ✅ GOOD - Runway简化
"Medium shot. Woman in green silk top walks through neon-lit street. Camera dollies left."

# ✅ GOOD - 即梦详细中文
"一位28岁的女性，穿着墨绿色丝绸肚兜，缓慢行走在90年代香港旧街区。霓虹灯招牌（品红和青色）从左侧照亮她的面容。她手腕上的玉镯在移动时反射光芒。镜头从侧面跟拍。湿漉的路面反射着霓虹色彩。薄雾中可见丁达尔光束。24帧每秒，电影胶片颗粒感。"
```

---

## 9. 物理与动态 (Physics & Dynamics)

### 9.1 物理属性 (Sora2优势项)

| 术语 | 英文 | 描述 | AI描述示例 |
|------|------|------|-----------|
| **重量** | Weight / Mass | 物体质量感 | "heavy 3kg durian, held with two hands, arms slightly bent from weight" |
| **力** | Force / Pressure | 施加的力 | "chef applies downward force, knife sinks slowly into durian shell" |
| **阻力** | Resistance | 物体抵抗变形 | "durian shell resists, tough and fibrous, requires 20 pounds of force" |
| **张力** | Tension | 拉伸状态 | "rope under tension, taut and strained" |
| **动量** | Momentum | 运动惯性 | "bowling ball rolls with momentum, slow to stop" |
| **速度** | Velocity | 运动速度 | "bird flies at 15 m/s" |
| **加速度** | Acceleration | 速度变化 | "car accelerates quickly, 0 to 60 mph" |
| **重力** | Gravity | 向下吸引力 | "apple falls with gravity at 9.8 m/s²" |

### 9.2 材质属性

| 属性 | 英文 | 描述 | AI关键词 |
|------|------|------|---------|
| **粘性** | Viscosity | 流体粘稠度 | "thick viscous fluid", "honey-like" |
| **弹性** | Elasticity | 恢复形变能力 | "elastic rubber band", "bouncy" |
| **刚性** | Rigid | 不易变形 | "rigid steel frame", "hard surface" |
| **柔软** | Soft-body | 易变形 | "soft pillow deforms under pressure" |
| **颗粒** | Granular | 颗粒状物质 | "granular sand flows", "rice grains" |
| **液体** | Fluid / Liquid | 流动液体 | "water splashes", "liquid pours" |

### 9.3 动态效果

| 效果 | 英文 | 描述 | AI关键词 |
|------|------|------|---------|
| **溅射** | Splash | 液体飞溅 | "water splashes up", "droplets scatter" |
| **烟雾** | Smoke / Mist | 烟雾弥漫 | "smoke rises slowly", "mist drifts" |
| **火焰** | Fire / Flames | 火焰燃烧 | "flames flicker at 10-15Hz", "heat distortion" |
| **蒸汽** | Steam / Vapor | 水蒸气上升 | "steam rises at 0.5 m/s", "hot vapor" |
| **破碎** | Shatter / Break | 物体碎裂 | "glass shatters into fragments" |
| **变形** | Deformation | 形状改变 | "durian flesh deforms under spoon pressure" |

### 物理描述完整示例

```yaml
# 榴莲开壳物理描述（Sora2优化）
VISUAL:
  Chef holds heavy durian (approximately 3kg weight, visible in arm tension and slightly bent wrists). He wedges a kitchen knife into the natural seam.

PHYSICS:
  - Knife edge applies focused pressure (high PSI at contact point)
  - Shell resists (thick fibrous structure, 20-30 pounds force required)
  - Crack propagates along seam (sudden tension release when threshold reached)
  - Shell splits into two halves (elastic energy release)
  - Flesh inside: soft, custard-like (viscosity ~5 Pa·s, elastic modulus ~10 kPa)
  - Juice adheres to knife surface (liquid surface tension)

SOUND:
  Deep bass crack (low frequency ~60Hz) + sharp treble snap (high frequency ~3kHz). Wet squelch as flesh exposed.

AI Prompt: "Chef holds heavy durian (3kg), arms slightly bent from weight. He applies downward force with knife. Shell is thick and fibrous, resists with 20-30 pounds of resistance. Knife sinks slowly, then shell cracks suddenly with release of tension. Two halves separate. Flesh inside is soft, custard-like, with wet glossy surface. Juice adheres to knife (surface tension). Crack sound: deep bass + sharp snap."
```

---

## 10. 剪辑术语 (Editing)

### 10.1 转场 (Transitions)

| 英文 | 中文 | 描述 | 使用场景 |
|------|------|------|---------|
| **Cut / Hard Cut** | 直切 | 直接切换，无过渡 | 最常用，快节奏 |
| **Fade In / Out** | 淡入 / 淡出 | 渐显 / 渐隐 | 开场结尾 |
| **Cross Dissolve** | 叠化 | 两画面交叠过渡 | 时间流逝、梦境 |
| **Wipe** | 划像 | 一画面推开另一画面 | 星战风格、复古 |
| **Match Cut** | 匹配剪辑 | 相似画面或动作衔接 | 创意转场 |
| **J-Cut / L-Cut** | J型/L型剪辑 | 声音先于/后于画面切换 | 自然对话 |
| **Smash Cut** | 突变剪辑 | 强烈对比的直切 | 戏剧性转折 |

### 10.2 剪辑节奏

| 术语 | 英文 | 描述 |
|------|------|------|
| **蒙太奇** | Montage | 快速剪辑序列，压缩时间 |
| **慢动作** | Slow Motion | 0.5x或更慢速度 |
| **快动作** | Fast Motion | 2x或更快速度 |
| **定格** | Freeze Frame | 画面静止 |
| **跳切** | Jump Cut | 同一镜头中间删除部分（时间跳跃感） |
| **交叉剪辑** | Cross-Cutting | 两条线索交替剪辑 |

### 剪辑节奏示例

```yaml
# 王家卫快速剪辑（0.8秒节奏）
EDITING:
  - Shot 01: 0.8s (眼睛特写)
  - Shot 02: 0.8s (回忆片段)
  - Shot 03: 0.8s (街道往事)
  - Shot 04: 1.2s (切回现在，稍长营造停顿)
  Style: Fast-paced, 0.8s cuts with occasional pause for emotional beat

# 美食视频蒙太奇
MONTAGE (0:40-0:55, 15 seconds total):
  - 5 shots x 3 seconds each
  - Fast cuts, energetic
  - Music drives pace
  Style: Tasty-style food montage, quick process shots
```

---

## 附录：中英术语速查表

### 常用景别

| 中文 | 英文缩写 | 英文全称 |
|------|---------|---------|
| 全景 | EWS | Extreme Wide Shot |
| 远景 | WS | Wide Shot |
| 全身 | FS | Full Shot |
| 中景 | MS | Medium Shot |
| 中特写 | MCU | Medium Close-Up |
| 特写 | CU | Close-Up |
| 大特写 | ECU | Extreme Close-Up |

### 常用运镜

| 中文 | 英文 |
|------|------|
| 推镜 | Push in / Dolly in |
| 拉镜 | Pull out / Dolly out |
| 摇镜 | Pan |
| 俯仰 | Tilt |
| 升降 | Crane / Boom |
| 变焦 | Zoom |
| 旋转 | Roll |
| 环绕 | Orbit |
| 跟拍 | Tracking / Dolly |
| 手持 | Handheld |

### 常用光照

| 中文 | 英文 |
|------|------|
| 主光 | Key Light |
| 补光 | Fill Light |
| 轮廓光 | Rim Light / Back Light |
| 侧光 | Side Light |
| 顶光 | Top Light |
| 实用光源 | Practical Light |
| 自然光 | Natural Light |
| 环境光 | Ambient Light |
| 体积光 | Volumetric Light |
| 高光 | Highlights |
| 阴影 | Shadows |

---

## 使用建议

### 针对不同AI平台

**Sora2**:
- ✅ 使用完整英文术语
- ✅ 加入物理描述（weight, force, viscosity）
- ✅ 多句结构化描述
- ✅ 明确对话时间和lip-sync标记

**Runway Gen-4**:
- ✅ 简化描述，专注核心动作
- ✅ 使用数值化相机控制
- ✅ 正面描述（避免"no", "without"）

**即梦AI**:
- ✅ 详细中文描述
- ✅ 首尾帧对应
- ✅ 避免复杂手部动作
- ✅ 使用Agent模式对话生成

### 术语组合模板

```yaml
# 完整镜头描述模板
[景别] + [运镜] + [焦距/光圈] + [主体描述] + [光照] + [色调] + [物理细节] + [对话/音频]

示例:
"Medium shot (MS), slow dolly in, 50mm f/1.8 lens. A 28-year-old woman in green silk dudou walks through 1990s Hong Kong street. Practical neon lights (magenta, cyan, 3200K) from left as key light, bounce fill from wet pavement. Warm yellow midtones, teal shadows, -20% saturation, 35mm film grain. She holds jade bracelet (30g weight, catches light). Says 'I've walked this street' at 0:06, lip-synced, melancholic. Background bokeh, soft focus. Ambient: distant firecrackers, street chatter."
```

---

## 相关资源

- **主指南**: `/docs/video-prompt-standardization-guide.md`
- **模板文件**:
  - `template-1-layered-structure.md`
  - `template-2-film-script-style.md`
  - `template-3-ai-optimized.md`
  - `template-4-commercial-format.md`
- **平台专项指南**:
  - `platform-specific-guides/sora2-guide.md`
  - `platform-specific-guides/runway-guide.md`
  - `platform-specific-guides/jimeng-guide.md`

---

**版本**: v1.0
**更新日期**: 2025-01-XX
**作者**: MovieFlow Team
**参考资料**: ASC Manual, Cinematography术语词典, Sora2/Runway官方文档

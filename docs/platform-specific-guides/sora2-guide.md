# Sora2 平台专项指南

## 概述

OpenAI Sora2 是最强大的AI视频生成平台之一，特别擅长：
- ✅ 物理真实性（重力、材质、运动）
- ✅ 对话口型同步（Lip-sync）
- ✅ 复杂场景连贯性
- ✅ 音频与视频同步生成
- ✅ 长视频生成（最长支持60秒+）

本指南提供Sora2专属的提示词编写技巧和最佳实践。

---

## 1. Sora2核心优势

### 1.1 物理模拟引擎

Sora2内置强大的物理引擎，理解真实世界的物理规律：

**支持的物理属性**：
- 重量和质量（weight, mass）
- 力和压力（force, pressure）
- 动量和惯性（momentum, inertia）
- 摩擦和阻力（friction, resistance）
- 弹性和变形（elasticity, deformation）
- 重力和加速度（gravity, acceleration）

**示例**：
```
❌ 弱提示: "A chef holds a durian"
✅ 强提示: "A chef holds a heavy durian (approximately 3kg). His arms are slightly bent from the weight, wrists angled downward from the force. The durian's spiky shell has mass and heft."
```

### 1.2 对话口型同步 (Lip-Sync)

Sora2是唯一原生支持对话口型同步的AI视频平台。

**语法**：
```
"Character says '[对话内容]' at [时间点], lip-synced"
```

**完整示例**：
```
"Medium shot of a 28-year-old woman. She looks at the camera and says 'This street holds so many memories' at 0:06, lip-synced, with a melancholic tone. Her lips move naturally, synchronized to the words."
```

**关键要素**：
1. 明确说话者：`Character says`
2. 对话内容：用引号包裹
3. 精确时间：`at 0:06`（秒）
4. 同步标记：`lip-synced`
5. 语气描述：`melancholic tone`, `excited`, `whisper`

**多段对话**：
```
"Two characters in conversation. Woman says 'Where have you been?' at 0:05, lip-synced, concerned tone. Man responds 'I'm sorry' at 0:08, lip-synced, apologetic tone. Camera alternates between close-ups."
```

### 1.3 音频生成与同步

Sora2可以同步生成视频和音频，包括对话、音乐和音效。

**音频Cues语法**：

**对话**：
```
Dialogue: Character says "text" at 0:10, lip-synced
```

**音乐**：
```
Music: Upbeat jazz, BPM 120, starts at 0:00, volume increases at 0:15
```

**音效**：
```
SFX: Door slam at 0:08, followed by footsteps every 0.5 seconds
```

**暂停和节奏**：
```
"A pause before the punchline at 0:12"
"Music hit on the dramatic reveal at 0:20"
"Two lines of dialogue with a 2-second pause between them"
```

**完整音频示例**：
```
Scene: Kitchen cooking video

Audio Design:
- Background music: Energetic electronic pop, BPM 128, starts at 0:00
- Chef voiceover: "First, we heat the wok" at 0:05, clear and friendly
- SFX: Gas ignition sound at 0:08, loud whoosh
- SFX: Sizzling oil continuous from 0:10 to 0:30
- Chef dialogue: "Now this is cooking!" at 0:25, lip-synced, excited tone
- Music ducks down during dialogue, returns to full volume at 0:28
```

### 1.4 复杂场景连贯性

Sora2在跨镜头连贯性方面表现最佳。

**连贯性技巧**：

**服装和道具一致性**：
```
"Throughout all shots: Woman wears a green silk dudou with bamboo embroidery. She has a jade bracelet on her left wrist (always visible). Her hair is in a loose bun with a jade hairpin on the right side."
```

**情绪弧线追踪**：
```
"Emotional arc: Shot 1 (0:00-0:10) - melancholic, eyes downcast. Shot 2 (0:10-0:20) - conflicted, hand touches necklace nervously. Shot 3 (0:20-0:30) - resolved, slight smile forms. Shot 4 (0:30-0:40) - hopeful, looks up toward sky."
```

**环境连续性**：
```
"Location consistency: 1990s Hong Kong street. Neon signs (magenta 'Tea House', cyan 'Mahjong') remain in background across all shots. Wet pavement reflects lights throughout. Thin mist persists at ground level."
```

---

## 2. Sora2提示词结构

### 2.1 推荐结构（Multi-Sentence）

Sora2最佳实践是使用多句子结构化描述：

```
[场景设定] + [主体描述] + [动作/行为] + [相机运动] + [光照] + [物理细节] + [对话/音频] + [氛围]
```

### 2.2 完整示例模板

```yaml
=== SHOT 01: Opening Scene ===

TIME: 0:00 - 0:10 (10 seconds)

SCENE SETUP:
A 1990s Hong Kong street at night, neon signs flicker (magenta, cyan, orange). Wet pavement reflects colored lights. Thin mist drifts at ground level.

SUBJECT:
A 28-year-old woman in a green silk dudou (traditional Chinese garment) and sheer outer robe. Jade bracelet on left wrist, jade hairpin in her loosely tied hair (right side).

ACTION:
She walks slowly through the street, her expression melancholic. Her hand touches the jade bracelet gently (weight ~30g, catches neon light).

CAMERA:
Medium shot, dolly tracking sideways alongside her. 35mm lens, f/1.8 (shallow depth, background neon signs blur into bokeh).

LIGHTING:
Practical neon lights as key lights (3200K warm tone). Side-lighting from left, creates rim light on her profile. Wet street acts as subtle fill (bounce light).

DIALOGUE:
She says "I've walked this street for ten years" at 0:06, lip-synced, soft melancholic tone, almost a whisper.

AUDIO:
- Background: Distant firecracker sounds, street chatter (ambience, -28dB)
- SFX: High heel footsteps every 0.8 seconds (-16dB)
- SFX: Jade bracelet tinkles at 0:07 (-20dB)
- Music: Nostalgic jazz piano (BPM 85, -22dB, ducks to -30dB during dialogue)

ATMOSPHERE:
Nostalgic, cinematic. Warm yellow midtones, teal shadows, -20% saturation (faded look). 35mm film grain. Slight handheld camera shake (natural, human touch).

PHYSICS NOTES:
- Woman's gait: natural pace, ~1.2 m/s walking speed
- Bracelet: swings with arm movement, ~30g mass, catches light intermittently
- Mist: rises slowly at ~0.3 m/s, creates volumetric light through neon beams
- Rain puddles: still water, perfect reflections (no wind)
```

### 2.3 精简版（适合快速迭代）

```
Medium shot. 28-year-old woman in green silk dudou walks through 1990s Hong Kong neon-lit street at night. Practical neon lights (magenta, cyan) illuminate from left. Wet pavement reflects colors. She touches jade bracelet (30g weight, catches light). Says "I've walked this street for ten years" at 0:06, lip-synced, melancholic whisper. Camera dollies alongside. 35mm, f/1.8, bokeh background. Nostalgic warm yellow tones, teal shadows. 35mm film grain. Ambient: distant firecrackers, footsteps. Music: jazz piano, -22dB.
```

---

## 3. Sora2物理描述最佳实践

### 3.1 重量与力

**食物**：
```
"Heavy cast iron wok (5kg), chef lifts with both hands, biceps flex from exertion"
"Durian (3kg), chef holds with arms slightly bent, wrists angled from weight"
```

**动作**：
```
"Chef applies downward force on knife. Knife sinks slowly into durian shell (fibrous, requires ~25 pounds of force). Shell resists, then cracks suddenly with release of tension."
```

### 3.2 材质与质感

**液体**：
```
"Thick honey (viscosity ~10 Pa·s) pours slowly from jar. Golden stream flows in smooth ribbon, coils on plate surface. High surface tension creates glossy dome."
```

**固体变形**：
```
"Soft durian flesh (elastic modulus ~10 kPa) deforms under spoon pressure. Flesh has custard-like texture, wet and glossy. Stretches slightly before separating from seed."
```

**颗粒物质**：
```
"Cooked rice (1000+ individual grains) cascades into hot wok. Granular flow, each grain tumbles independently. Angle of repose ~30°. Grains scatter on impact with oil surface (elastic collision)."
```

### 3.3 火与烟雾

**火焰**：
```
"Wok tilts toward flame. Oil ignites in dramatic burst. Flames leap upward 2-3 feet (60-90cm). Fire flickers at 10-15Hz. Heat distortion visible above flame (air refracts light). Orange-yellow tips (soot combustion), blue base (complete burn)."
```

**烟雾和蒸汽**：
```
"Steam rises from hot plate at ~0.5 m/s. Water vapor swirls and dissipates. Convection currents visible. Backlit steam creates volumetric effect (light scattering through particles)."
```

### 3.4 运动与动态

**人物运动**：
```
"Woman walks at natural pace (~1.2 m/s). Each step: heel strikes first, weight transfers forward, toes push off (gait cycle ~0.8s). Arms swing naturally in opposition to legs (momentum balance). Slight up-down head motion (realistic human locomotion)."
```

**物体抛投**：
```
"Chef tosses minced garlic into wok. Garlic pieces (each ~0.5g) follow parabolic trajectory under gravity (9.8 m/s²). Pieces scatter across oil surface, some bounce slightly (elastic collision, e=0.3). Land with randomized orientation."
```

---

## 4. Sora2对话进阶技巧

### 4.1 情绪表达

在对话描述中加入情绪和表情细节：

```
Excited: "Chef exclaims 'Perfect!' at 0:20, lip-synced, excited tone with wide smile, eyes bright"

Sad: "Woman whispers 'I miss you' at 0:15, lip-synced, voice cracks slightly, eyes glisten with tears"

Angry: "Man shouts 'Enough!' at 0:10, lip-synced, angry tone, jaw clenched, veins visible on neck"

Playful: "Girl giggles and says 'You're silly!' at 0:08, lip-synced, playful teasing tone, smirk on face"
```

### 4.2 多角色对话

**正反打对话（Shot-Reverse-Shot）**：
```
Shot A (0:00-0:05): Medium shot, Woman faces camera. She says "Where have you been?" at 0:02, lip-synced, concerned tone. Camera on her face, waiting for response.

Shot B (0:05-0:10): Reverse angle, Man faces camera. He says "I'm sorry, I lost track of time" at 0:06, lip-synced, apologetic, eyes downcast.

Shot C (0:10-0:15): Back to Woman. She sighs and says "Just call next time" at 0:12, lip-synced, softer tone, slight smile forming.
```

**群体对话**：
```
Wide shot, three friends at dinner table.
- Friend A (left): "This food is amazing!" at 0:05, lip-synced, enthusiastic
- Friend B (center): "I know, right?" at 0:07, lip-synced, agreeing, nods
- Friend C (right): "We should come here more often" at 0:10, lip-synced, excited
Camera slowly pushes in during conversation, capturing all three in frame.
```

### 4.3 旁白与内心独白

**画外音旁白**：
```
"Wide shot of woman walking through park. Voiceover (her inner thoughts): 'Sometimes the best memories are the ones we don't plan' at 0:05. No lip-sync (thoughts, not spoken aloud). Soft, reflective tone with slight reverb (dream-like quality)."
```

**内心独白与现场对话对比**：
```
Scene: Woman at doorway, about to knock

Visual: Close-up on woman's face, hand raised toward door, hesitating.

Inner monologue: "What if he doesn't want to see me?" at 0:03, voiceover, worried tone, no lip-sync

Action: She takes a breath, steels herself

Spoken aloud: She says "Here goes nothing" at 0:08, lip-synced, whisper to herself, determined
```

---

## 5. Sora2光影进阶

### 5.1 实用光源 (Practical Lights)

Sora2特别擅长处理画面内可见的光源：

```
"Restaurant interior at night. Warm pendant lamps hang above each table (practical lights, 2700K tungsten bulbs). Light pools on white tablecloths, creates soft falloff toward edges. Faces illuminated from above, slight shadows under eyes and chin (top-down key light). Background dim, creates intimate mood."
```

**霓虹灯实用光**：
```
"1990s Hong Kong alley. Practical neon signs: magenta 'Open 24H' sign on left wall, cyan 'Noodles' sign on right. Character walks through center. Magenta light hits left side of face (key), cyan light hits right side (rim). Color temperature contrast: warm magenta (~3200K) vs cool cyan (~6500K). Wet pavement reflects both colors, creates colored shadows."
```

### 5.2 复杂光照场景

**黄金时刻拍摄**：
```
"Golden hour exterior, 30 minutes before sunset. Warm orange sunlight (2500K) rakes across scene from low angle (15° above horizon). Long shadows stretch across grass. Subject backlit, sun creates rim light around hair and shoulders (halo effect). Lens flare: subtle hexagonal artifacts from f/1.8 aperture. Atmosphere hazy, diffuses light (Tyndall effect visible in shadow areas). High dynamic range: bright sky, darker foreground, but both hold detail."
```

**室内窗光**：
```
"Interior bedroom, afternoon. Large window on left (out of frame). Soft daylight streams through sheer curtains (diffused, 5500K). Window light as key: illuminates left side of subject's face, creates gentle falloff to shadow on right. Dust particles visible in light beam (volumetric rays). Bounce light from white walls acts as fill (-2 stops dimmer than key). Ratio: 4:1 key to fill (moderate contrast, flattering). Background slightly underexposed, focuses attention on subject."
```

### 5.3 动态光照变化

**火焰动态光**：
```
"Close-up of face illuminated by fireplace. Flames 3 feet away, off-screen left. Warm orange flickering light (1800K) dances across face. Light intensity fluctuates: bright flash (flame leaps) → dim (flame lowers), cycle ~0.5 seconds. Shadows move organically. Eyes reflect orange glow (catchlight). Skin tones warm, saturated oranges and reds. Background falls into darkness. Atmospheric smoke softens light."
```

**日落时间推移**：
```
"Wide shot, woman stands on hilltop overlooking city. Time progression:
- 0:00-0:10: Golden hour, warm orange directional light, long shadows
- 0:10-0:20: Sun dips below horizon, light shifts cooler, shadows lengthen
- 0:20-0:30: Blue hour begins, cool ambient light (7000K), sky gradient (orange→purple→deep blue)
- 0:30-0:40: City lights turn on (warm tungsten pinpoints), become key lights
- 0:40-0:50: Full twilight, silhouette backlit by city glow
Continuous shot, no cuts. Light naturally transitions."
```

---

## 6. Sora2相机技巧

### 6.1 复杂运镜组合

**Push In + Rack Focus**：
```
"Medium shot. Camera slowly pushes in toward subject (dolly in, 0.5 m/s). Focus starts on blurred background neon sign. At 0:03, focus shifts (rack focus) to subject's face in foreground. Background blurs into bokeh (f/1.4 shallow depth). Push continues until extreme close-up of eyes at 0:08. Smooth, cinematic motion."
```

**Orbit + Tilt**：
```
"Subject stands center, arms crossed. Camera orbits clockwise around subject (360° in 15 seconds, ~24°/s). Simultaneously tilts down from eye level to low angle (over 15 seconds). Creates dynamic reveal: starts with face, ends looking up at subject from below (empowering angle). Steadicam-smooth motion, no shake."
```

**Crane Up + Pan**：
```
"Close-up on subject's hand placing flower on gravestone. Camera begins crane move: rises vertically at 0.3 m/s. As camera rises, it pans left to reveal more of cemetery. At 0:10, reaches high angle overlooking rows of gravestones. Ends on extreme wide shot, subject now small in frame. Emotional shift: intimate → vast."
```

### 6.2 手持风格控制

Sora2可以精确控制手持程度：

```
Minimal handheld: "Slight handheld camera shake, barely perceptible. Natural micro-movements (~1-2cm drift). Gives organic feel without distraction."

Moderate handheld: "Handheld documentary style. Camera bobs gently with operator's breathing. Occasional small reframes. Feels present and intimate."

Intense handheld: "Energetic handheld, Bourne-style. Camera moves actively, follows action closely. Purposeful shake adds urgency. Reframes frequently to keep subject centered."
```

**完整示例**：
```
"Chase scene. Handheld camera runs behind fleeing character through narrow alley. Camera shakes intensely, bobs up and down with operator's running motion. Occasional wall scrapes (camera brushes past obstacles). Focus struggles to keep up (realistic AF hunting). Breathing audible. Urgent, visceral. Contrast with next shot: character stops, camera stabilizes, heavy breathing continues."
```

### 6.3 焦距特性模拟

**广角透视夸张**：
```
"24mm wide angle lens. Subject's face close to camera (0.5m), background street recedes dramatically (exaggerated perspective). Straight lines appear curved near edges (barrel distortion). Depth of field deep (f/5.6), both face and background relatively sharp. Emphasizes space and environment."
```

**长焦压缩**：
```
"200mm telephoto lens. Subject in foreground, buildings in background. Space appears compressed: buildings seem closer than reality (telephoto compression). Shallow depth of field (f/2.8), background heavily blurred despite distance. Isolates subject, creates abstract bokeh backdrop."
```

---

## 7. Sora2常见问题与解决

### 7.1 对话不同步

**问题**: 嘴型和对话不匹配

**解决方案**:
1. 确保使用 `lip-synced` 关键词
2. 提供精确时间 `at 0:06`
3. 简化对话内容（过长句子难同步）
4. 描述口型动作： `"lips move naturally, mouth opens and closes in sync with words"`

**优化前**:
```
Woman says "I think it's time for me to finally move forward and embrace new possibilities"
```

**优化后**:
```
Woman says "It's time to move forward" at 0:08, lip-synced, determined tone. Her lips articulate each word clearly, jaw moves naturally.
```

### 7.2 物理不真实

**问题**: 物体漂浮、重量感不对

**解决方案**: 明确描述物理属性

**优化前**:
```
Chef picks up durian
```

**优化后**:
```
Chef lifts heavy durian (3kg) with both hands. Arms bend slightly from weight, wrists angle downward. Durian has visible heft and mass. Chef's biceps flex with effort.
```

### 7.3 光照不一致

**问题**: 跨镜头光照变化

**解决方案**: 建立光照延续性描述

```
GLOBAL LIGHTING (applies to all shots):
- Time: Night, ~8:00 PM
- Key lights: Practical neon signs (magenta, cyan, orange)
- Fill: Bounce from wet street surfaces
- Color temperature: Warm 3200K neon
- Atmosphere: Thin ground-level mist
- All shots maintain this lighting setup for continuity
```

### 7.4 角色外观变化

**问题**: 服装、配饰在不同镜头中不一致

**解决方案**: 在每个镜头开头重申关键特征

```
CONTINUITY NOTES (repeat in every shot description):
"Woman wears green silk dudou with bamboo embroidery (consistent across all shots). Jade bracelet on LEFT wrist (always visible). Jade hairpin on RIGHT side of hair bun. Pearl earrings (two drops per ear)."
```

---

## 8. Sora2高级技巧

### 8.1 情绪弧线编排

在长视频中，明确规划情绪变化：

```yaml
EMOTIONAL ARC (60-second video):

0:00-0:15 (Establishing): Melancholy
  - Shot 1-3: Subject alone, downcast eyes, slow movements
  - Color: Desaturated, cool tones
  - Music: Slow, minor key

0:15-0:30 (Conflict): Inner turmoil
  - Shot 4-6: Flashback memories, quick cuts
  - Color: Warmer tones in flashbacks, cool in present
  - Music: Building tension

0:30-0:45 (Turning point): Resolve forming
  - Shot 7-8: Subject makes decision, stands taller
  - Color: Saturation increases
  - Music: Shifts to major key

0:45-0:60 (Resolution): Hope
  - Shot 9-10: Subject smiles, looks toward light
  - Color: Warm, saturated, golden tones
  - Music: Uplifting, full instrumentation
```

### 8.2 视觉母题 (Visual Motifs)

重复出现的视觉元素增强叙事：

```
VISUAL MOTIF: Jade bracelet

Shot 1 (0:05): Close-up of bracelet catching neon light
Shot 3 (0:18): Hand touches bracelet nervously (emotional gesture)
Shot 5 (0:32): Bracelet slips off wrist, falls in slow motion (letting go)
Shot 7 (0:50): Empty wrist (absence signifies change)

The bracelet symbolizes the past; its removal represents moving forward. Sora2 can track this prop across shots for narrative coherence.
```

### 8.3 时间感操控

**慢动作强调**:
```
"Slow motion 0.5x speed. Water droplet falls from faucet. Droplet stretches into teardrop shape (surface tension), catches light. Falls at 4.9 m/s² (half of real gravity due to slow-mo). Impacts water surface, creates crown splash (Worthington jet). Ripples expand outward in concentric circles. All physics remain realistic, just slowed down."
```

**时间压缩**:
```
"Time-lapse: Sun rises over city. 2 minutes compressed into 10 seconds. Shadows rotate across scene. Light changes from cool blue (dawn) → warm yellow (morning) → bright white (noon). Traffic streaks below (motion blur). Clouds drift and morph rapidly. Sky color gradient shifts continuously."
```

---

## 9. Sora2与其他平台对比

| 特性 | Sora2 | Runway Gen-4 | 即梦AI |
|------|-------|--------------|--------|
| **对话同步** | ⭐⭐⭐⭐⭐ 原生支持 | ❌ 不支持 | ⭐⭐⭐ Agent模式部分支持 |
| **物理真实性** | ⭐⭐⭐⭐⭐ 最强 | ⭐⭐⭐ 一般 | ⭐⭐⭐⭐ 较好 |
| **最大时长** | 60秒+ | 10秒 (Gen-4) | 10秒 |
| **连贯性** | ⭐⭐⭐⭐⭐ 最佳 | ⭐⭐⭐ 一般 | ⭐⭐⭐⭐ 较好 |
| **音频生成** | ⭐⭐⭐⭐⭐ 同步生成 | ❌ 需后期 | ⭐⭐⭐ 部分支持 |
| **提示词复杂度** | 高（详细更好） | 低（简单更好） | 中（详细中文） |
| **生成速度** | 较慢 | 快 | 中 |
| **成本** | 高 | 中 | 低 |

**选择建议**:
- 需要对话：**只选Sora2**
- 需要长视频（>30s）：**Sora2**
- 需要极致物理真实性：**Sora2**
- 快速迭代测试：**Runway** → 定稿后用Sora2
- 预算有限：**即梦** → 关键镜头用Sora2

---

## 10. 实战案例分析

### 案例1：商业广告（肚兜品牌）

**需求**: 90秒品牌形象片，王家卫风格，包含对话

**Sora2 Prompt（节选）**:

```
=== SHOT 03: 情绪转折 ===

Medium shot. 28-year-old woman stands at tea house entrance. Neon sign「新春快乐」(Happy New Year) flickers behind her in warm red-orange (practical light, 3000K). She wears green silk dudou (embroidered with bamboo pattern), sheer outer robe, jade bracelet on left wrist.

She turns toward camera. Hand reaches up to touch bracelet (30g weight, jade catches red neon light, creates small highlight). Expression shifts: melancholy → contemplation → subtle resolve.

Voiceover (her inner thought): "The old must go before the new can come" at 0:22, soft reflective tone, slight reverb (dream-like). No lip-sync (internal monologue).

Then at 0:26 she says aloud: "Maybe it's time to let go" at 0:26, lip-synced, whisper to herself, determination forming.

Camera locked-off, static. 50mm lens, f/1.8 (shallow depth, background bokeh). Lighting: Red neon as key (from behind left shoulder), wet street bounce as fill. Color grading: Warm yellow midtones, teal shadows, -20% saturation (vintage look). 35mm film grain overlay, slight vignette.

AUDIO:
- Music: Jazz piano (-22dB), holds note during monologue (creates space)
- Neon sign flicker sound: 0:20, 0:28 (-18dB, electric buzz)
- Distant fireworks: 0:28 (-24dB, foreshadowing new year)
- Ambience: Street chatter (-28dB continuous)

PHYSICS:
- Bracelet swings slightly as hand moves, catches light intermittently
- Steam from tea house drifts out door at 0.2 m/s (convection)
- Mist at ground level, illuminated by neon (volumetric light)

Time: 0:20 - 0:30 (10 seconds)
```

**为何这个Prompt有效**:
1. ✅ 多层次对话（旁白 + 现场）
2. ✅ 物理细节（玉镯重量、蒸汽运动）
3. ✅ 实用光源（霓虹灯）明确标注
4. ✅ 音频分层（音乐、音效、环境音）
5. ✅ 精确时间标记（对话、音效）
6. ✅ 情绪描述（表情变化轨迹）

---

### 案例2：美食视频（榴莲炒饭）

**需求**: 60秒美食制作过程，ASMR音效，口播

**Sora2 Prompt（节选）**:

```
=== SHOT 04: 火焰爆发（Hero Moment）===

Medium shot transitions to close-up. Chef Ming at wok station. Carbon steel wok sits over high-BTU burner. He turns gas knob clockwise - blue pilot flame visible at 0:28.

He pours vegetable oil into wok (viscous liquid, ~50mL, flows smoothly). Then tilts wok toward flame at 0:33.

DRAMATIC MOMENT: Oil ignites. Flames burst upward 2-3 feet (60-90cm height). Fire realistic:
- Flicker rate: 10-15Hz (natural flame motion)
- Color: Blue base (complete combustion), orange-yellow tips (soot particles)
- Heat distortion above flame (air refracts light, wavy shimmer effect)
- Dynamic orange light casts on Chef's face (practical lighting from fire)
- Shadows dance on walls behind (flame movement creates moving shadows)

Chef's expression: Focused, eyes slightly squinted from heat. Confident smile forms (mastery). Beads of sweat on forehead (heat radiation, ~400°C from flames). Skin tone slightly reddened from warmth.

Camera push in (dolly) to close-up of Chef's face at 0:36. Then whip pan back to flames at 0:38.

Chef says: "Now we're cooking!" at 0:36, lip-synced, excited energetic tone, grin.

AUDIO:
- Gas knob turn: 0:28, -16dB, mechanical click
- Oil pour: 0:30, -14dB, liquid flow with slight viscosity
- Flame whoosh (ignition): 0:33, -6dB (HERO SOUND), stereo wide, add sub-bass rumble (60Hz) for impact
- Wok flame roar: 0:33-0:38, -10dB continuous, layered fire crackle (multiple frequencies)
- Chef dialogue: 0:36, -8dB, clear above fire roar (compression applied)
- Music: Returns to full volume -18dB at 0:34, BPM increases (energy)

PHYSICS:
- Oil ignition point: ~350°C (reached when tilted toward flame)
- Flame height: 60-90cm (realistic for high-BTU burner, ~25,000 BTU)
- Heat radiation: Inverse square law (intensity drops with distance)
- Flame motion: Turbulent, affected by oil vapor combustion
- Air convection: Hot air rises rapidly above flame, creates updraft

Color: Warm orange dominates (firelight), rest of kitchen falls into shadow (low-key lighting, high contrast).

Time: 0:28 - 0:38 (10 seconds)
```

**为何有效**:
1. ✅ 物理精确（火焰高度、温度、运动频率）
2. ✅ ASMR音效分层（sizzle, whoosh, roar）
3. ✅ 动态实用光源（火焰照亮面部）
4. ✅ 对话同步（lip-synced标记）
5. ✅ Hero Moment强调（音频-6dB优先）

---

## 11. Prompt调试与迭代

### 11.1 常见错误及修正

**错误1: 描述模糊**
```
❌ "Woman walks in street"
✅ "28-year-old woman walks at 1.2 m/s through 1990s Hong Kong street. Each step: heel strikes first, weight transfers, toes push off. Arms swing naturally in opposition to legs."
```

**错误2: 遗漏时间标记**
```
❌ "Character says 'Hello'"
✅ "Character says 'Hello there' at 0:05, lip-synced, friendly warm tone"
```

**错误3: 物理不完整**
```
❌ "Chef holds wok"
✅ "Chef holds heavy wok (5kg) with both hands. Arms bent from weight, biceps flex. Wok handle (metal, warm from cooking) visible in grip."
```

### 11.2 A/B测试策略

**Test 1: 对话情绪变体**
- Version A: `"says 'I love you' at 0:10, lip-synced, romantic whisper"`
- Version B: `"says 'I love you' at 0:10, lip-synced, excited declaration, slight laugh"`
- 比较：哪个更符合场景？

**Test 2: 光照变体**
- Version A: `"Side-lit by neon, warm magenta key light"`
- Version B: `"Backlit by neon, silhouette with rim light"`
- 比较：哪个更有戏剧性？

---

## 12. 资源与工具

### 12.1 推荐学习资源

**Sora2官方文档**:
- [OpenAI Sora2 Prompting Guide](https://openai.com/sora)
- [Sora2 Physics Examples](https://openai.com/sora/examples)

**第三方教程**:
- Skywork AI Sora2 Tips (12条最佳实践)
- Sora2 Community Prompts (优秀案例库)

### 12.2 辅助工具

**Prompt模板生成器** (未来MovieFlow功能):
```bash
movieflow generate-sora2-prompt \
  --scene "1990s Hong Kong street" \
  --subject "woman in green dudou" \
  --dialogue "I've walked this street for ten years" \
  --style "Wong Kar-wai nostalgic" \
  --duration 10s
```

**物理参数计算器**:
- 重力加速度：9.8 m/s²
- 步行速度：1.2-1.5 m/s
- 跑步速度：3-5 m/s
- 蒸汽上升：0.3-0.8 m/s

---

## 总结

Sora2的核心优势在于：
1. **物理真实性**：详细描述物理属性可大幅提升质量
2. **对话同步**：唯一原生支持lip-sync的平台
3. **音频生成**：同步生成对话、音乐、音效
4. **长视频连贯性**：最适合60秒完整叙事

**提示词黄金法则**:
- 📐 物理优先：weight, force, mass, viscosity
- 🗣️ 对话精确：时间点 + lip-synced + 语气
- 🎬 多句结构：场景+主体+动作+相机+光照+音频+物理
- 🔁 连贯追踪：服装、道具、环境在所有镜头保持一致

---

**下一步**:
- 阅读 `runway-guide.md` 了解Runway简化描述技巧
- 阅读 `jimeng-guide.md` 了解即梦中文详细描述
- 参考 `template-3-ai-optimized.md` 获取完整Sora2模板

---

**版本**: v1.0
**作者**: MovieFlow Team
**最后更新**: 2025-01-XX

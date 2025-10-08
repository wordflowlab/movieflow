# 模板三：AI优化模板 (AI-Optimized Template for Sora2)

## 概述

**适用场景**：
- ✅ 专门为OpenAI Sora2优化
- ✅ 需要精确控制物理动态（重力、力、运动）
- ✅ 需要同步对话和嘴型 (lip-sync)
- ✅ 需要复杂音频设计（对话、音乐、SFX同步）
- ✅ 直接复制粘贴使用，无需转换

**核心优势**：
- 🤖 AI原生格式，最大化Sora2能力
- 🎯 物理词汇丰富（weight, force, momentum, tension）
- 🗣️ 对话时间标记精确（"at 0:15, lip-synced"）
- 🎵 音频cues详细（pauses, ambient sync, Foley）
- 📋 结构化清晰，易于调整参数

---

## 模板结构

```
=== SPECIFICATION ===
技术规格和平台参数

=== CREATIVE BRIEF ===
创意简报和故事概念

=== VISUAL DESIGN ===
视觉风格系统和美学指南

=== SHOT BREAKDOWN ===
镜头序列（含对话、字幕、物理动态）

=== AUDIO DESIGN ===
音频分层设计和时间轴

=== BRANDING ===
品牌元素和CTA

=== CONTINUITY TRACKER ===
连贯性追踪JSON
```

---

## 完整示例：榴莲炒饭美食视频

---

### === SPECIFICATION ===

```yaml
PROJECT_ID: food_durian_fried_rice_v2
PLATFORM: OpenAI Sora2
TARGET_DURATION: 90 seconds
ASPECT_RATIO: 9:16 vertical (mobile-optimized)
RESOLUTION: 1080x1920
FRAME_RATE: 24fps
PHYSICS_ENGINE: Enabled (food dynamics, steam, liquid)
AUDIO_SYNC: Dialogue lip-sync enabled
LIP_SYNC_MODEL: Sora2 native
TARGET_AUDIENCE: Food lovers, 18-45, Southeast Asia
DELIVERABLE: Instagram Reels / TikTok / 小红书
```

---

### === CREATIVE BRIEF ===

**Concept:**
"Durian Fried Rice - The Ultimate Fusion Challenge"

**Story Arc:**
1. **Hook (0-8s)**: Chef dramatically reveals durian, controversial ingredient
2. **Process (8-50s)**: Step-by-step cooking with sensory close-ups
3. **Tasting (50-75s)**: Taste test with exaggerated reactions
4. **Call-to-Action (75-90s)**: Recipe card + brand logo

**Tone:**
- Playful but professional
- Bold colors, high energy
- ASMR food sounds + upbeat music
- Humor through reactions to durian smell

**Unique Selling Point:**
Controversial durian + classic fried rice = viral food content

---

### === VISUAL DESIGN ===

```yaml
COLOR_PALETTE:
  Primary: Golden yellow (durian flesh) #FFD700
  Secondary: Vibrant orange (flames) #FF6B35
  Accent: Deep green (spring onions) #2D5016
  Background: Dark charcoal (kitchen counter) #1A1A1A

LIGHTING_SYSTEM:
  Key Light: Overhead softbox (5600K, daylight balanced)
  Fill Light: Side reflector (bounce, -2 stops softer)
  Rim Light: Warm practical (kitchen flame, 2800K)
  Atmosphere: Steam backlit by rim light (volumetric effect)

CAMERA_AESTHETIC:
  Style: Cinematic food photography + viral content energy
  Movement: Dynamic (whip pans, crash zooms, slow-mo reveals)
  Focal Lengths: 50mm (standard), 100mm macro (details)
  Depth of Field: Shallow (f/1.4-f/2.8) for hero shots, deeper (f/5.6) for process

REFERENCE_STYLES:
  - Binging with Babish (clean overhead shots)
  - Tasty (quick cuts, energetic)
  - Chef's Table (macro food details)
```

---

### === SHOT BREAKDOWN ===

---

#### SHOT 01: COLD OPEN - DURIAN REVEAL

**TIMECODE:** 0:00 - 0:08 (8 seconds)

**CAMERA:**
```
Type: ECU (Extreme Close-Up) → Zoom out to MS (Medium Shot)
Movement: Crash zoom out (dramatic reveal)
Lens: 100mm macro → 50mm (dynamic focal shift)
Speed: 1.0x normal → 0.5x slow-mo (on reveal)
```

**VISUAL DESCRIPTION:**
```
Extreme close-up on a spiky durian shell, dark background, single spotlight creates dramatic shadows. The shell has weight and texture - thorns are sharp, surface is rough. Camera rapidly zooms out to reveal **Chef Ming**, 30s, confident expression, wearing black chef's coat with golden embroidery. He holds the durian with two hands (showing its weight, approximately 3kg). His fingers grip tightly, knuckles slightly white from the effort.

Kitchen background blurred (bokeh). Steam rises from a wok in the far background (depth cue). Practical kitchen lights create warm ambience.

PHYSICS NOTE: Durian shows realistic weight - Chef's arms slightly bent from holding it, subtle downward force on his wrists.
```

**DIALOGUE:**
```yaml
- Speaker: Chef Ming
  Text: "Durian fried rice? You think I'm crazy?"
  Timing: 0:03 - 0:06
  Lip_Sync: true
  Emotion: Playful challenge, eyebrow raised
  Volume: -8dB (clear, primary audio)
  Processing: None (clean dialogue for clarity)
```

**SUBTITLE SPECS:**
```yaml
Text: "Durian fried rice? You think I'm crazy?"
Position: Bottom center, 15% from bottom edge
Font: Montserrat Bold, 48px
Color: White #FFFFFF
Stroke: Black 3px outline
Background: Semi-transparent black bar (80% opacity)
Animation: Pop-in with bounce (0.2s ease-out)
Timing: 0:03 - 0:06
```

**AUDIO CUES:**
```yaml
Music:
  - Track: Upbeat electronic pop (BPM 128)
  - Entry: Sudden hit at 0:00 (impact sound)
  - Volume: -22dB (ducks down for dialogue)

SFX:
  - Whoosh sound (zoom out effect): 0:00, -14dB, stereo wide
  - Durian shell tap (Chef's finger): 0:02, -16dB, realistic Foley
  - Kitchen ambience (wok sizzle far): 0:00 continuous, -28dB

Ambience: Kitchen room tone, light echo (Reverb 3%)
```

**CONTINUITY TRACKER:**
```json
{
  "chef_costume": "Black chef's coat, golden embroidery on collar",
  "props": ["Durian (3kg, spiky shell intact)", "Kitchen knife (out of frame, for later)"],
  "environment": "Professional kitchen, dark charcoal counter, warm practical lights",
  "emotion": "Chef Ming: confident, playful"
}
```

---

#### SHOT 02: PROCESS - OPENING THE DURIAN

**TIMECODE:** 0:08 - 0:18 (10 seconds)

**CAMERA:**
```
Type: CU (Close-Up) overhead POV
Movement: Locked-off overhead (Binging with Babish style)
Lens: 50mm, f/2.8
Speed: 1.0x normal (moment of crack) → 0.7x slow-mo
```

**VISUAL DESCRIPTION:**
```
Overhead shot: Durian placed on wooden cutting board. Chef's hands enter frame holding a heavy kitchen knife (blade reflects light). He wedges the knife into the durian's natural seam.

PHYSICS FOCUS: The knife meets resistance - durian shell is thick and tough. Chef applies downward force (visible in his wrist tension). Knife sinks slowly, then the shell cracks open with a sudden release of tension. The two halves separate, revealing yellow custard-like flesh inside.

Steam-like aroma lines (heat distortion effect) rise from the durian, simulating its infamous smell. The flesh has a wet, glossy surface (high moisture content).

SOUND-DRIVEN DETAIL: The crack is loud and satisfying, creating a "hero moment" for the ingredient.
```

**DIALOGUE:**
```yaml
- Speaker: Chef Ming (voiceover)
  Text: "First, we face our fear."
  Timing: 0:09 - 0:11
  Lip_Sync: false (voiceover, chef not in frame)
  Emotion: Dramatic, narrator-style
  Volume: -10dB
  Processing: Slight low-pass filter (cinematic VO tone)
```

**SUBTITLE SPECS:**
```yaml
Text: "First, we face our fear."
Position: Top center, 20% from top
Font: Playfair Display Italic, 44px
Color: Golden yellow #FFD700
Stroke: Dark charcoal 2px
Animation: Typewriter effect (0.1s per character)
Timing: 0:09 - 0:12
```

**AUDIO CUES:**
```yaml
Music: Continues, slight volume dip for SFX prominence

SFX:
  - Knife scraping shell: 0:08, -12dB, metallic grind
  - Durian crack (hero sound): 0:13, -8dB, deep bass + sharp treble crack
  - Wet squelch (flesh exposed): 0:14, -14dB, organic Foley
  - Aroma "whoosh" (comedic): 0:15, -18dB, airy reverb

Ambience: Kitchen continues, slight echo on crack for emphasis
```

**PHYSICS NOTES:**
```
- Knife edge: Sharp, applies focused pressure (high PSI at contact point)
- Shell resistance: Thick, fibrous, requires 20-30 pounds of force
- Crack propagation: Follows natural seam, sudden release when threshold reached
- Flesh properties: Soft, custard-like, slight jiggle (viscous fluid simulation)
```

**CONTINUITY TRACKER:**
```json
{
  "props_update": ["Durian now open (two halves)", "Kitchen knife (blade wet with durian juice)", "Wooden cutting board (visible grain)"],
  "environment": "Same kitchen, overhead angle",
  "physics_state": "Durian shell: cracked, flesh: exposed, wet surface"
}
```

---

#### SHOT 03: PROCESS - SCOOPING DURIAN FLESH (MACRO BEAUTY)

**TIMECODE:** 0:18 - 0:28 (10 seconds)

**CAMERA:**
```
Type: ECU (Extreme Close-Up) macro
Movement: Slow dolly in (push to flesh)
Lens: 100mm macro, f/1.4 (razor-thin focus plane)
Speed: 0.4x slow motion (ASMR emphasis)
```

**VISUAL DESCRIPTION:**
```
Macro shot: A metal spoon enters frame from the right. Focus is on the durian flesh - golden yellow, glossy, with visible fibrous strands. The spoon presses into the flesh, which deforms under pressure (soft-body physics). The flesh has weight and resistance, but ultimately yields.

As the spoon scoops, the flesh stretches slightly before separating from the seed (elastic properties, then break). A small amount of juice glistens on the spoon's surface (liquid adhesion).

Background is completely blurred into golden bokeh. Backlight creates a rim light on the spoon's edge (metallic sheen).

SENSORY GOAL: This shot is designed to be satisfying - the texture, the motion, the light. ASMR for the eyes.
```

**DIALOGUE:**
```yaml
[No dialogue - let the visuals and ASMR sounds speak]
```

**SUBTITLE SPECS:**
```yaml
Text: "🍴 Golden treasure"
Position: Bottom right, 25% from corner
Font: Emoji + Raleway Medium, 36px
Color: White with subtle glow
Animation: Fade in
Timing: 0:20 - 0:25
Style_Note: Minimal, doesn't distract from visual ASMR
```

**AUDIO CUES:**
```yaml
Music: Volume reduced to -28dB (ASMR takes priority)

SFX (ASMR prominence):
  - Spoon touches flesh: 0:18, -6dB, soft impact
  - Flesh deformation (wet squelch): 0:19-0:24, -8dB, slow, detailed Foley
  - Separation from seed: 0:25, -10dB, slight "pop"
  - Spoon scrape on shell: 0:26, -12dB, metallic resonance

Ambience: Nearly silent, only faint kitchen hum (-32dB)

AUDIO PROCESSING:
  - All Foley recorded close-mic for ASMR intimacy
  - Slight reverb (2%) to avoid sterile sound
  - EQ: Boost 2-5kHz (texture detail), gentle high-pass below 80Hz
```

**PHYSICS NOTES:**
```
- Durian flesh: Viscosity similar to thick custard, elastic modulus low
- Spoon pressure: Gradual deformation, then puncture at ~5N force
- Fiber strands: Visible stretching before snap (tensile strength ~0.5 MPa)
- Juice: Surface tension causes droplet formation on spoon edge
```

---

#### SHOT 04: PROCESS - WOK FIRE IGNITION (HERO MOMENT)

**TIMECODE:** 0:28 - 0:38 (10 seconds)

**CAMERA:**
```
Type: MS (Medium Shot) → CU (Close-Up) on flames
Movement: Slight push in, then whip pan to Chef's face
Lens: 35mm, f/2.8 → f/4 (accommodate flame brightness)
Speed: 1.0x normal → 0.6x slow-mo (flame ignition)
```

**VISUAL DESCRIPTION:**
```
Chef Ming stands at the wok station. The wok is large, carbon steel, sits over a high-BTU burner. He turns the gas knob - blue pilot flame visible. Then he adds oil to the wok.

HERO MOMENT: Chef tilts the wok toward the flame. Suddenly, the oil ignites in a dramatic burst of orange-yellow flames (wok hei technique). Flames leap upward, reaching 2-3 feet high (realistic fire simulation: flicker rate 10-15Hz, heat distortion above flame, casting dynamic orange light on Chef's face).

The flames reflect in the wok's curved surface. Chef's expression: focused, eyes slightly squinted from heat, a confident smile.

Camera whip-pans to Chef's face at 0:36 - his expression shows mastery and excitement.

PHYSICS: Fire has volume, motion, and heat distortion. Oil droplets at flame edges combust individually (particle system). Heat waves shimmer above the wok (index of refraction change).
```

**DIALOGUE:**
```yaml
- Speaker: Chef Ming
  Text: "Now we're cooking!"
  Timing: 0:36 - 0:37
  Lip_Sync: true (sync to whip pan reveal)
  Emotion: Excited, energetic, grin
  Volume: -8dB, clarity over flame roar
  Processing: Slight compression (ensure audible over SFX)
```

**SUBTITLE SPECS:**
```yaml
Text: "Now we're cooking! 🔥"
Position: Middle left, 30% from edge
Font: Impact, 52px (bold, energetic)
Color: Orange-red gradient #FF6B35 → #FF3E00
Stroke: Yellow 3px (fire theme)
Animation: Shake effect (0.2s, vibrant energy)
Timing: 0:36 - 0:38
```

**AUDIO CUES:**
```yaml
Music: Returns to full volume -18dB, tempo increase

SFX (Layered for impact):
  - Gas knob turn: 0:28, -16dB, mechanical click
  - Oil pour: 0:30, -14dB, liquid flow
  - Flame whoosh (ignition): 0:33, -6dB (hero sound), stereo wide + sub-bass rumble
  - Wok flame roar: 0:33-0:38, -10dB continuous, layered fire crackle
  - Heat shimmer (subtle): 0:34, -20dB, airy texture

Dialogue: 0:36 (see above)

Ambience: Kitchen intensifies, flame dominates soundscape

AUDIO NOTE: Flame whoosh should feel cinematic, not just realistic - add low-end rumble (60-120Hz) for impact
```

**PHYSICS NOTES:**
```
- Oil ignition point: ~350°C, reached when tilted toward flame
- Flame height: 2-3 feet (60-90cm), realistic for high-BTU wok burner
- Heat radiation: Visible on Chef's face (skin slightly reddened, sweat beginning)
- Air distortion: Heat waves above flame (index of refraction 1.0003 → 1.0001 gradient)
- Flame color: Blue base (complete combustion), orange-yellow tips (soot particles)
```

**CONTINUITY TRACKER:**
```json
{
  "props_update": ["Wok (heating, oil coating inside)", "Gas burner (high flame)", "Oil bottle (visible in background)"],
  "environment": "Kitchen lights dimmed by flame brightness, dynamic orange light cast",
  "chef_state": "Chef Ming: focused, eyes slightly squinted, slight sweat on forehead",
  "physics_state": "Fire: active, oil: ignited, heat: radiating"
}
```

---

#### SHOT 05: PROCESS - ADDING INGREDIENTS (FAST CUTS)

**TIMECODE:** 0:38 - 0:50 (12 seconds, 4 x 3-second cuts)

**CAMERA (applies to all 4 sub-shots):**
```
Type: CU (Close-Up) overhead + side angles
Movement: Locked-off (let ingredients be the motion)
Lens: 50mm, f/2.8
Speed: 1.0x normal (fast energy)
```

---

**SUB-SHOT 5A: Garlic hits wok (0:38-0:41)**

**VISUAL:**
```
Overhead: Chef's hand tosses minced garlic into the hot wok. Garlic pieces scatter across the oil surface (particle physics: individual pieces, randomized tumble, some bounce). Immediately, the garlic sizzles - small bubbles form around each piece (Maillard reaction begins). Garlic starts to brown within 1 second (time-accurate cooking).

PHYSICS: Each garlic piece has mass (~0.5g), falls with gravity (9.8 m/s²), bounces slightly on oil surface (elastic collision, e=0.3).
```

**AUDIO:**
```
SFX: Intense sizzle (0:38, -8dB), high-frequency crackle, garlic aroma "bloom" sound (0:39, -18dB, airy)
```

---

**SUB-SHOT 5B: Rice cascade (0:41-0:44)**

**VISUAL:**
```
Side angle: A large bowl tilts, releasing a cascade of cooked rice into the wok. The rice flows like a granular fluid (particle simulation: 1000+ grains, cohesion low, each grain visible). The rice hits the hot oil and spreads outward (momentum + heat + oil interaction). Small puffs of steam rise (water evaporation).

PHYSICS: Rice grains show realistic granular flow, angle of repose ~30°, individual grain tumble, no clumping (dry fried rice prep).
```

**AUDIO:**
```
SFX: Rice cascade (0:41, -10dB, granular sound), immediate sizzle (0:42, -8dB), steam hiss (0:43, -14dB)
```

---

**SUB-SHOT 5C: Durian plops in (0:44-0:47)**

**VISUAL:**
```
Overhead: Chef drops three large scoops of durian flesh into the wok. The durian is soft and wet - it "plops" rather than bounces. Each scoop deforms on impact (soft-body physics), spreading slightly. The heat begins to melt the durian, creating a creamy sauce that coats the rice.

PHYSICS: Durian flesh is viscous (η ~ 5 Pa·s), deforms on impact (elastic modulus ~10 kPa), melts under heat (phase transition at ~60°C).
```

**AUDIO:**
```
SFX: Three wet plops (0:44, 0:45, 0:46, -10dB each), sizzle intensifies (0:46, -8dB), comedic "bloop" sound (0:46, -16dB, playful tone)
```

---

**SUB-SHOT 5D: Spring onions sprinkle (0:47-0:50)**

**VISUAL:**
```
Overhead: Chef's hand sprinkles chopped spring onions (scallions) over the dish. The green pieces fall in slow-motion (0.8x), catching light, individual pieces rotating (angular momentum). They land on the golden rice-durian mixture, providing color contrast.

PHYSICS: Scallion pieces are light (~0.2g each), flutter slightly due to air resistance (drag coefficient ~1.0), land softly (low impact).
```

**AUDIO:**
```
SFX: Gentle sprinkle sound (0:47, -14dB), final sizzle (0:49, -10dB, diminishing as cooking ends)
Music: Build-up to transition (0:48-0:50, crescendo)
```

---

**DIALOGUE (covers all 4 sub-shots):**
```yaml
- Speaker: Chef Ming (voiceover)
  Text: "Garlic, rice, durian, and a little green for luck."
  Timing: 0:39 - 0:44
  Lip_Sync: false (VO)
  Volume: -10dB
  Processing: Clear, energetic delivery
```

**SUBTITLE SPECS:**
```yaml
Text: "Garlic, rice, durian, and a little green for luck."
Position: Bottom center
Font: Roboto, 42px
Color: White
Timing: 0:39 - 0:45
```

---

#### SHOT 06: TASTING - THE FIRST BITE

**TIMECODE:** 0:50 - 1:05 (15 seconds)

**CAMERA:**
```
Type: CU (Close-Up) → ECU (Extreme Close-Up on face)
Movement: Slow push in (build tension)
Lens: 85mm portrait, f/1.8 (face isolated)
Speed: 1.0x → 0.7x slow-mo (bite and reaction)
```

**VISUAL DESCRIPTION:**
```
Chef Ming holds a spoonful of durian fried rice up to his face. The rice glistens with oil and melted durian sauce. Steam rises from the spoon (heat visible). Background is blurred into kitchen bokeh.

He pauses for a moment (0:52-0:54), eyes on the spoon, building suspense. Then he takes a bite (0:54). His jaw moves (realistic chewing physics: temporomandibular joint motion, cheek muscles flex).

Camera pushes into ECU on his face: eyes widen (0:56), eyebrows raise (surprise), then his expression shifts to delight (0:58). He chews slowly, savoring. A small smile forms (1:00). Eyes close briefly (1:02, bliss).

ACTING NOTE: Reaction must be genuine - this is the payoff moment. Micro-expressions matter.
```

**DIALOGUE:**
```yaml
- Speaker: Chef Ming
  Text: "Okay, I admit it... this is incredible."
  Timing: 1:00 - 1:04
  Lip_Sync: true (chewing integrated, pauses between words)
  Emotion: Surprise → delight, speaking while savoring
  Volume: -8dB
  Processing: Slight mouth noise (realistic, not overdone)
```

**SUBTITLE SPECS:**
```yaml
Text: "Okay, I admit it... this is incredible."
Position: Bottom center
Font: Lato, 46px
Color: White
Animation: Word-by-word reveal (sync to speech cadence)
Timing: 1:00 - 1:04
```

**AUDIO CUES:**
```yaml
Music: Soft, emotional swell (strings enter, -20dB)

SFX:
  - Spoon scrape (picking up rice): 0:50, -14dB
  - Chewing sounds: 0:55-0:59, -12dB, subtle (not gross)
  - Satisfied "mm" vocalization: 0:59, -10dB
  - Ambient kitchen fades out (0:52-1:05, focus on Chef)

Dialogue: 1:00 (see above)

AUDIO NOTE: This is an intimate moment - reduce background, bring Chef's voice and subtle eating sounds forward
```

**PHYSICS NOTES:**
```
- Steam from spoon: Convection, rises at ~0.5 m/s
- Chewing mechanics: Jaw moves 1-2cm, temporalis muscle visible flex
- Facial muscles: 17 muscles involved in expression change (surprise → smile)
```

**CONTINUITY TRACKER:**
```json
{
  "chef_state": "Chef Ming: surprise → delight, eyes bright, slight sweat (from cooking heat)",
  "props": ["Spoon (with rice)", "Completed durian fried rice dish (out of focus behind)"],
  "emotion_arc": "Skeptical → challenged → triumphant → delighted"
}
```

---

#### SHOT 07: PLATING - FINAL DISH BEAUTY SHOT

**TIMECODE:** 1:05 - 1:15 (10 seconds)

**CAMERA:**
```
Type: Overhead → Slow crane up to 45° angle
Movement: Smooth crane transition
Lens: 50mm, f/2.8
Speed: 0.6x slow-mo (luxurious reveal)
```

**VISUAL DESCRIPTION:**
```
Overhead: The completed dish sits in a white ceramic bowl on dark charcoal counter. The rice is golden from durian and oil, flecked with green spring onions. A sprig of fresh cilantro (garnish) on top. Wisps of steam still rise (heat cue).

Around the bowl: Scattered ingredients (garlic cloves, durian shell piece, rice grains) suggest the creative process. A bamboo mat underneath (texture, Asian aesthetic).

Camera cranes up to 45° angle - now we see Chef in background, arms crossed, proud smile, looking at his creation.

LIGHTING: Key light from top-left creates highlights on rice, rim light from behind creates atmosphere.
```

**DIALOGUE:**
```yaml
[No dialogue - visual and music moment]
```

**SUBTITLE SPECS:**
```yaml
Text: "Durian Fried Rice ✨"
Position: Top center
Font: Playfair Display, 56px, elegant
Color: Golden #FFD700
Animation: Elegant fade + slight scale-up
Timing: 1:07 - 1:13
```

**AUDIO CUES:**
```yaml
Music: Triumphant swell, full instrumentation -16dB

SFX:
  - Final sizzle fade: 1:05, -20dB (dying out)
  - Ambient kitchen returns: 1:06, -24dB (gentle)
  - Subtle "ding" (completion sound): 1:08, -18dB, high-pitched bell

Ambience: Peaceful, satisfied, mission accomplished

AUDIO NOTE: This is the "hero product" moment - music should feel rewarding
```

---

#### SHOT 08: CALL-TO-ACTION - RECIPE CARD

**TIMECODE:** 1:15 - 1:30 (15 seconds)

**VISUAL:**
```
Animated recipe card appears over the dish. Card has a semi-transparent background, reveals ingredients and steps in clean typography.

Card content:
---
🍚 DURIAN FRIED RICE

INGREDIENTS:
• 2 cups cooked rice (day-old)
• 150g durian flesh
• 3 cloves garlic (minced)
• 2 tbsp vegetable oil
• Spring onions (garnish)

STEPS:
1. Heat wok on high flame
2. Fry garlic until golden
3. Add rice, stir constantly
4. Fold in durian, cook 2 min
5. Garnish and serve!

👨‍🍳 Recipe by Chef Ming
📱 @ChefMingCooks
---

At 1:25, the card slides up, revealing brand logo "CloudKitchen" below.
```

**SUBTITLE SPECS:**
```yaml
[Recipe card contains all text, no additional subtitles needed]
```

**AUDIO CUES:**
```yaml
Music: Outro (upbeat, BPM 120, -18dB)

Voiceover:
  - Speaker: Chef Ming
    Text: "Try it yourself - link in bio!"
    Timing: 1:20 - 1:23
    Lip_Sync: false (VO)
    Volume: -10dB
    Tone: Friendly, inviting

SFX:
  - Card "whoosh" in: 1:16, -14dB
  - Typing sounds (text appears): 1:17-1:24, -20dB, subtle
  - Logo "ding": 1:26, -16dB

Music: Fade out 1:28-1:30
```

---

### === AUDIO DESIGN ===

#### Audio Layers Timeline

```yaml
LAYER 1: MUSIC
  - Track: "Upbeat Kitchen Vibes" (royalty-free)
  - BPM: 128
  - Key: C Major (happy, energetic)
  - Structure:
    - 0:00-0:08: Intro hit + build
    - 0:08-0:28: Verse (reduced for VO)
    - 0:28-0:50: Build-up (cooking energy)
    - 0:50-1:05: Breakdown (emotional tasting)
    - 1:05-1:15: Chorus (triumphant)
    - 1:15-1:30: Outro
  - Volume: -18dB (average), ducks to -28dB for dialogue

LAYER 2: DIALOGUE
  - Total lines: 4
  - Lip-sync: 3 lines synced, 1 VO
  - Processing: Compression (4:1 ratio), EQ (clarity boost 2-4kHz), De-esser
  - Volume: -8dB to -10dB (priority audio)

LAYER 3: FOLEY & SFX
  - Categories:
    - Cooking sounds: Sizzle, crack, pour, plop (hero sounds)
    - Utensil sounds: Knife, spoon, wok scrape
    - Ambient: Kitchen hum, flame roar
  - Processing: Close-mic for ASMR, reverb 2-5% (space), EQ per sound
  - Volume: -6dB (hero SFX) to -20dB (subtle)

LAYER 4: AMBIENCE
  - Kitchen room tone throughout
  - Dynamic: Quiet (ASMR moments) → Loud (flame moments)
  - Volume: -24dB to -32dB

AUDIO MIX NOTES:
- Dialogue always intelligible (ducking on music/SFX)
- ASMR moments (0:18-0:28) reduce music to near-silence
- Hero sounds (durian crack, flame whoosh) punch through mix
- Maintain dynamic range (don't over-compress)
```

---

### === BRANDING ===

```yaml
BRAND: CloudKitchen
TAGLINE: "Recipes that go viral"
LOGO: Cloud shape + chef's hat icon

BRAND INTEGRATION:
  - Subtle logo watermark (bottom right, 10% opacity, throughout)
  - Chef's coat embroidery: "CloudKitchen" on collar (0:00-0:08)
  - Recipe card: Prominent logo and handle (1:15-1:30)

CALL-TO-ACTION:
  - Text: "Try it yourself - link in bio!"
  - Social handles: @ChefMingCooks (IG, TikTok)
  - QR code: Link to full recipe (optional overlay)

BRAND TONE:
  - Playful but professional
  - Encourages culinary experimentation
  - Community-focused ("share your attempts!")
```

---

### === CONTINUITY TRACKER ===

```json
{
  "project": "food_durian_fried_rice_v2",
  "duration": "90s",
  "character": {
    "name": "Chef Ming",
    "age": "30s",
    "costume": "Black chef's coat (CloudKitchen embroidered), no hat",
    "emotional_arc": [
      {"time": "0:00-0:08", "state": "Playful challenge"},
      {"time": "0:08-0:50", "state": "Focused, professional"},
      {"time": "0:50-1:05", "state": "Skeptical → Surprised → Delighted"},
      {"time": "1:05-1:30", "state": "Proud, satisfied"}
    ],
    "continuity_notes": [
      "Slight sweat on forehead increases from 0:28 (fire heat)",
      "Hands: Clean at start → slight oil stains by 0:50"
    ]
  },
  "props": {
    "durian": [
      {"time": "0:00-0:08", "state": "Whole, spiky shell"},
      {"time": "0:08-0:18", "state": "Cracked open, flesh visible"},
      {"time": "0:18-0:28", "state": "Flesh scooped out"},
      {"time": "0:28-0:50", "state": "In wok, melting"}
    ],
    "wok": [
      {"time": "0:00-0:28", "state": "Visible background, cold"},
      {"time": "0:28-0:50", "state": "Active cooking, flames, oil"},
      {"time": "0:50-1:30", "state": "Off-heat, dish completed"}
    ],
    "other": ["Kitchen knife", "Metal spoon", "White ceramic bowl", "Wooden cutting board", "Bamboo mat"]
  },
  "environment": {
    "location": "Professional kitchen (CloudKitchen studio)",
    "lighting": "Overhead softbox (constant), practical flame (dynamic 0:28-0:50), warm ambient",
    "temperature_cues": "Heat distortion from flame (0:28-0:50), steam (0:28-1:15)"
  },
  "physics_consistency": [
    "Durian weight: ~3kg, held with two hands",
    "Flame height: 60-90cm (realistic wok hei)",
    "Steam: Rises at ~0.5 m/s (water evaporation)",
    "Rice grains: Individual particle simulation, realistic granular flow",
    "Durian flesh: Viscous, melts under heat, coats rice"
  ],
  "audio_continuity": [
    "Kitchen ambience present throughout (-24dB to -32dB)",
    "Music consistent (same track, dynamic volume)",
    "Chef's voice: Same processing, clear intelligibility",
    "Foley: Realistic, source-accurate (close-mic ASMR style)"
  ],
  "visual_motifs": [
    "Golden yellow color (durian) appears in: flesh, rice, final dish, recipe card accent",
    "Steam as recurring element (heat, freshness cue)",
    "Overhead shots (3 instances) create visual consistency",
    "Dark charcoal background (contrasts golden food)"
  ]
}
```

---

## 使用此模板

### Step 1: 复制整个Prompt

复制从 `=== SPECIFICATION ===` 到 `=== CONTINUITY TRACKER ===` 的全部内容。

### Step 2: 调整项目参数

修改 `SPECIFICATION` 部分：
- `PROJECT_ID`: 你的项目名称
- `TARGET_DURATION`: 调整时长
- `TARGET_AUDIENCE`: 你的目标受众

### Step 3: 修改创意简报

在 `CREATIVE BRIEF` 中更改故事主题和基调。

### Step 4: 调整镜头分解

编辑 `SHOT BREAKDOWN` 中的每个镜头：
- 保留结构（TIMECODE, CAMERA, VISUAL, DIALOGUE, AUDIO）
- 修改描述内容
- 注意保持对话的 `Lip_Sync` 标记和时间点精确

### Step 5: 直接输入Sora2

将整个prompt输入Sora2界面，无需额外转换。

---

## Sora2优化技巧

### 对话同步语法

```
CORRECT: "Character says 'text here' at 0:15, lip-synced"
CORRECT: "Two lines of dialogue, lip-synced to character's mouth movements"
INCORRECT: "Character: text here" (no timing, no sync flag)
```

### 物理词汇

Sora2理解这些物理概念：
- **重量**: weight, heavy, light, mass
- **力**: force, pressure, tension, resistance
- **运动**: momentum, velocity, acceleration, trajectory
- **材质**: viscous, elastic, rigid, soft-body, granular

示例：
```
"The chef holds the durian with two hands, showing its weight (approximately 3kg). His arms are slightly bent from the effort, wrists angled downward from the force."
```

### 音频Cues最佳实践

```yaml
# Good: 明确时间和音效类型
SFX: Durian crack at 0:13, -8dB, deep bass crack + sharp treble

# Good: 描述音频情绪
Music: Upbeat electronic, BPM 128, ducks to -28dB during dialogue

# Good: 声音与动作同步
"A pause before the punchline" (0:05-0:06)
"Laugh track at 0:08, natural and warm"
```

---

## 对比其他模板

| 特点 | AI优化模板 | 分层式 | 电影脚本式 |
|------|-----------|--------|-----------|
| **Sora2优化** | ⭐⭐⭐⭐⭐ 原生 | ⭐⭐⭐ 需转换 | ⭐⭐ 需大幅转换 |
| **物理描述** | ⭐⭐⭐⭐⭐ 详细 | ⭐⭐⭐ 中等 | ⭐⭐ 少 |
| **对话同步** | ⭐⭐⭐⭐⭐ 精确标记 | ⭐⭐⭐⭐ YAML | ⭐⭐⭐⭐ 剧本格式 |
| **音频设计** | ⭐⭐⭐⭐⭐ 分层时间轴 | ⭐⭐⭐⭐ 结构化 | ⭐⭐⭐ 文本描述 |
| **可读性** | ⭐⭐⭐ 技术性强 | ⭐⭐⭐⭐ 逻辑清晰 | ⭐⭐⭐⭐⭐ 易读 |
| **直接使用** | ⭐⭐⭐⭐⭐ 复制粘贴 | ⭐⭐⭐ 需导出 | ⭐⭐ 需手动转换 |

---

## 常见问题

**Q: Sora2真的能理解这么详细的物理描述吗？**
A: 是的。Sora2在物理模拟方面表现出色。使用物理词汇（weight, force, viscosity）能显著提升生成质量。

**Q: 如果我的视频不需要对话怎么办？**
A: 删除 `DIALOGUE` 部分即可，保留 `SFX` 和 `Music` 即可获得良好的音频设计。

**Q: 这个模板能用于Runway或即梦吗？**
A: 可以，但需要简化：
- **Runway**: 删除物理细节，保留核心动作描述
- **即梦**: 翻译为详细中文，添加首尾帧描述

**Q: CONTINUITY TRACKER的JSON部分必须包含吗？**
A: 推荐包含。它帮助AI保持跨镜头一致性，尤其是长视频（60s+）。

---

## 版本历史

**v1.0** - 2025-01-XX
- 初始版本
- 基于榴莲炒饭美食视频示例
- 完整90秒Sora2优化prompt
- 包含物理描述、对话同步、音频分层

---

## 相关资源

- **Sora2官方文档**: [OpenAI Sora2 Prompting Guide](https://openai.com/sora)
- **主指南**: `/docs/video-prompt-standardization-guide.md`
- **其他模板**:
  - `template-1-layered-structure.md`
  - `template-2-film-script-style.md`
  - `template-4-commercial-format.md`
- **平台指南**: `/docs/platform-specific-guides/sora2-guide.md`

---

**作者**: MovieFlow Team
**优化顾问**: OpenAI Sora2 Best Practices
**授权**: MIT License

# Video Project Specification: [PROJECT_NAME]

**Created**: [DATE]
**Status**: Draft
**Target Platform**: [抖音/视频号/快手/通用]
**Duration**: 60秒 (6×10秒)

## Execution Flow (main)

```
1. Parse user description from Input
   → If empty: ERROR "No project description provided"
2. Extract key concepts: concept, style, platform, mood
   → Identify: scenes, characters, narrative arc
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill Scenes & Narrative section
   → If no clear narrative: ERROR "Cannot determine story structure"
5. Generate Visual Style Requirements
   → Each style aspect must be specific
   → Mark ambiguous aspects
6. Identify Characters (if applicable)
7. Define Workflow Preferences based on complexity
8. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
9. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT viewers see and WHY
- ❌ Avoid HOW to implement (no platform, tech, API details)
- 🎬 Written for creative stakeholders, not technicians

### Section Requirements

- **Mandatory sections**: Must be completed for every video project
- **Optional sections**: Include only when relevant to the project
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question]
2. **Don't guess**: If the prompt doesn't specify something, mark it
3. **Think like a director**: Every vague requirement fails the "testable and unambiguous" check
4. **Common underspecified areas**:
   - Visual style and mood
   - Character appearance and consistency
   - Platform-specific requirements
   - Scene transitions and pacing
   - Audio and dialogue needs
   - Budget and quality trade-offs

---

## Creative Brief *(mandatory)*

### Concept

[核心创意概念 - 用1-2句话描述这个视频是什么]

**Example**: Q版唐僧相亲自我介绍，通过6个场景幽默展示他的优点和西天取经经历

### Target Audience

[目标观众群体]

**Example**: 25-35岁年轻人，喜欢幽默内容，熟悉西游记文化

### Creative Goals

[创意目标 - 这个视频想达成什么？]

- **Primary Goal**: [主要目标，如品牌宣传/产品展示/娱乐/教育]
- **Emotional Impact**: [期望的情绪反应]
- **Call to Action**: [观看后希望用户做什么]

### Platform Requirements

- **Target Platform**: [抖音/视频号/快手/YouTube Shorts/通用]
- **Aspect Ratio**: [9:16 竖屏 / 1:1 方形 / 16:9 横屏]
- **Duration**: 60秒 (6×10秒模块化场景)
- **Format**: [MP4/MOV]
- **Resolution**: [1080×1920 / 1080×1080 / 1920×1080]

---

## Clarifications

*此部分由 `/clarify` 命令自动生成和更新。记录所有澄清会话的问答和决策。*

### Session YYYY-MM-DD

- Q: [示例问题] → A: [示例答案]

---

## Scenes & Narrative *(mandatory)*

### Narrative Structure

[选择叙事结构]

- [ ] **三幕结构**: 开端(Scene 1-2) → 冲突(Scene 3-4) → 结局(Scene 5-6)
- [ ] **Save the Cat 15拍**: [指定关键节拍在哪些场景]
- [ ] **情绪弧线**: [描述6场景的情绪走向]
- [ ] **问题-解决**: 提出问题 → 展开问题 → 解决方案
- [ ] **展示型**: 6个并列场景展示不同方面

**Chosen Structure**: [填写选择的结构]

### Scene Breakdown (6×10秒)

#### Scene 1: [场景名称] (0:00-0:10)

**Purpose**: [戏剧功能 - Opening Image / 建立基调 / 提出问题]
**Emotional Arc**: [起点情绪] → [终点情绪]
**Key Visual Elements**:

- [主体内容]
- [环境/背景]
- [关键道具/动作]

**Narrative Content**:

- [这个场景讲什么故事]
- [观众应该理解什么]

**Dialogue/Voiceover** *(if applicable)*:

- [台词或旁白内容]
- [语气和情绪]

**Transition to Next**: [如何自然过渡到Scene 2]

---

#### Scene 2: [场景名称] (0:10-0:20)

[重复Scene 1的结构]

---

#### Scene 3: [场景名称] (0:20-0:30)

[重复Scene 1的结构]

---

#### Scene 4: [场景名称] (0:30-0:40)

[重复Scene 1的结构]

---

#### Scene 5: [场景名称] (0:40-0:50)

[重复Scene 1的结构]

---

#### Scene 6: [场景名称] (0:50-1:00)

[重复Scene 1的结构]

---

## Visual Style Requirements *(mandatory)*

### Art Direction

**Overall Style**: [写实/3D动画/2D动画/Q版/卡通/混合风格]
**Visual References**: [参考作品/艺术家/风格]

**Example**: Q版3D动画，角色比例2:3头身，大眼睛圆脸，可爱风格，参考《摩尔庄园》

### Color Palette & Grading

**Primary Colors**: [主色调，2-3个颜色]
**Color Mood**: [暖色调/冷色调/去饱和/高对比/柔和]
**Color Grading Style**: [电影级/自然/鲜艳/复古/黑白]

**Example**: 暖色调为主（金黄、橙红），营造温馨氛围，电影级调色

### Lighting Style

**Lighting Approach**: [自然光/影棚光/戏剧性光照/柔和光/侧光/顶光]
**Time of Day**: [早晨/正午/黄昏/夜晚/室内] (如果相关)
**Mood Through Light**: [光照如何营造情绪]

**Example**: 柔和的黄昏光，顶光+侧光，营造温暖怀旧感

### Camera & Composition

**Camera Style**: [稳定/运动/手持/电影感/纪录片风格]
**Preferred Shot Types**: [特写为主/中景为主/远景展示/混合]
**Composition Rules**: [三分法/中心构图/对称/引导线]

**三层画面结构** (必需):

- **前景 (20%)**: [景深元素/动态元素/框架元素]
- **中景 (60%)**: [主体内容/角色/关键动作]
- **背景 (20%)**: [环境设置/氛围营造]

### Movement & Dynamics

**Pacing**: [快节奏/慢节奏/节奏变化]
**Camera Movements**: [推/拉/摇/移/跟/固定]
**Subject Movements**: [静态为主/动态为主/混合]

---

## Character Assets *(include if feature involves characters)*

### Character 1: [角色名称]

**Role**: [主角/配角/次要角色]
**Appearance**:

- **Age**: [年龄]
- **Gender**: [性别]
- **Physical Traits**: [身高、体型、特征]
- **Clothing**: [服装描述]
- **Distinctive Features**: [显著特征 - 发型、配饰、特殊标记]

**Consistency Requirements**:

- **Cross-Scene Consistency**: [跨场景一致性要求]
- **Reference Images Needed**: [是否需要参考图]
- **13-Image Fusion**: [是否需要13图融合建立素材库]

**Character Arc** *(if applicable)*:

- [角色在6个场景中的情绪/状态变化]

---

### Character 2: [角色名称]

[重复Character 1的结构]

---

## Audio & Music *(optional, if applicable)*

### Dialogue Requirements

- **Dialogue Density**: [对话密集/稀疏/无对话]
- **Language**: [中文/英文/多语言]
- **Voice Style**: [年轻/成熟/儿童/机械/旁白]
- **Lip-Sync Required**: [是 / 否]

### Music & Sound Design

- **Music Style**: [电子/古典/流行/民族/无音乐]
- **Music Role**: [背景烘托/主导情绪/节奏引导]
- **Sound Effects**: [重点音效需求]
- **Audio Mixing**: [音乐-对话-音效的权重比]

---

## Success Criteria *(mandatory)*

### Visual Quality

- [ ] **Composition**: 三层画面结构完整
- [ ] **Consistency**: 角色外貌一致性≥85%
- [ ] **Coherence**: 视觉风格连贯性≥90%
- [ ] **Resolution**: 符合平台规范

### Narrative Quality

- [ ] **Clarity**: 观众能理解核心信息
- [ ] **Engagement**: 能吸引注意力到最后
- [ ] **Emotion**: 传达期望的情绪
- [ ] **Pacing**: 节奏合理，不拖沓

### Technical Quality

- [ ] **Duration**: 精确60秒 (可接受±2秒)
- [ ] **Format**: 符合目标平台要求
- [ ] **Audio**: 音视频同步误差<50ms
- [ ] **Smoothness**: 动态流畅，无卡顿

### Budget & Timeline

- **Total Budget**: [预算] 元
- **Acceptable Cost Range**: [最低]-[最高] 元
- **Timeline**: [交付日期]
- **Quality vs Cost Trade-off**: [质量优先 / 成本优先 / 平衡]

---

## Workflow Preferences *(optional)*

选择需要的工作流阶段（在plan阶段会详细定义）：

- [ ] **Phase 0: 主设计图生成**
  - 用途：关键帧预设计，精确视觉控制
  - 适用：角色/场景复杂，需要客户预先确认
- [ ] **Phase 1: 置景设计**
  - 用途：3D场景布局，精确空间关系
  - 适用：多角度拍摄同一场景
- [ ] **Phase 2: 打光设计**
  - 用途：专业光照方案
  - 适用：电影级光照，特殊光影效果
- [ ] **Phase 4: 4K放大**
  - 用途：分辨率增强，细节优化
  - 适用：需要更高分辨率输出

**Rationale**: [为什么选择/不选择这些阶段]

---

## Review & Acceptance Checklist

*GATE: Automated checks run during main() execution*

### Content Quality

- [ ] No implementation details (platforms, tools, APIs)
- [ ] Focused on creative vision and viewer experience
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] 6 scenes are clearly defined
- [ ] Visual style is specific and measurable
- [ ] Success criteria are testable
- [ ] Character consistency requirements clear

### Constitution Compliance

- [ ] Spec-first: 规范优先于实现
- [ ] Cost awareness: 预算考虑已纳入
- [ ] Quality through iteration: 迭代路径可行
- [ ] Platform适配: 平台要求明确

---

## Execution Status

*Updated by main() during processing*

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] Scenes defined (6 complete)
- [ ] Visual style specified
- [ ] Characters identified
- [ ] Workflow preferences noted
- [ ] Review checklist passed

---

## Notes & Clarifications

[记录任何额外的说明、限制、假设或讨论要点]

---

**Next Steps**:

1. **运行 `/clarify` 命令**（必经阶段）
   - 系统化消除所有 [NEEDS CLARIFICATION] 标记
   - 10 维度覆盖度扫描
   - 最多 5 个高影响问题
   - 答案自动集成到 spec.md

2. **Review with stakeholders**
   - 审核完整规格
   - 确认所有决策

3. **运行 `/plan` 创建技术方案**
   - 验证无 [NEEDS CLARIFICATION]
   - Constitution Check
   - 平台选择和成本估算

4. **后续流程**
   - `/tasks` - 任务分解
   - `/validate` - 渐进式验证
   - `/implement` - 执行生成

---

*Based on MovieFlow Constitution v1.0.0 - See `/docs/constitution.md`*

# Implementation Plan: [PROJECT_NAME]

**Created**: [DATE]
**Spec**: `/specs/[project-name]/spec.md`
**Status**: Planning

## Execution Flow (/plan command scope)

```
1. Load video spec from spec.md
   → If not found: ERROR "No spec at {path}"
2. Scan spec.md for [NEEDS CLARIFICATION] markers
   → If ANY markers remain: ERROR "/clarify must be run first to resolve all ambiguities"
   → Instruct user: "Run /clarify before /plan to complete the specification"
   → List all remaining [NEEDS CLARIFICATION] markers with line numbers
3. Fill Technical Context
   → Extract from spec: platform, style, duration, budget
   → Detect Project Complexity: simple / standard / complex
4. Fill Constitution Check section
   → Evaluate against 10 principles in constitution.md
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
5. Execute Phase Planning
   → Determine which Phases needed based on spec preferences
   → For each Phase: define platform, cost, output, success criteria
6. Generate Platform Selection Strategy
   → Choose primary platform with rationale
   → Define backup platforms and fallback conditions
7. Generate Character Consistency Strategy (if characters exist)
   → Determine method: 13-image fusion / prompt-固定 / reference images
8. Generate Validation Strategy
   → L0: Always included (free)
   → L1: wireframe or Phase 0 output or full
   → L2: Only if complex movements/first-time platform
9. Calculate Total Cost Estimate
   → Sum all phases + validation
   → If over budget: ERROR "Reduce scope or increase budget"
10. Run Post-Planning Constitution Check
    → Re-verify compliance after all decisions
11. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command generates strategy and architecture. /script will generate actual prompts and scene details.

---

## Summary

[Extract from spec: core concept + technical approach + platform choice]

**Example**: Q版唐僧相亲视频，采用3D动画风格，使用即梦AI v3.0 Pro生成，layered提示词格式，总预算200元。

---

## Technical Context

### Platform & Format

**Target Platform**: [抖音/视频号/快手/通用]
**Video Format**:

- Aspect Ratio: [9:16 / 1:1 / 16:9]
- Resolution: [1080×1920 / 1080×1080 / 1920×1080]
- Duration: 60秒 (6×10秒)
- Frame Rate: 24fps
- Codec: H.264

### Project Complexity

**Complexity Level**: [Simple / Standard / Complex]

**Indicators**:

- Character Count: [数量]
- Scene Complexity: [Low / Medium / High]
- Camera Movements: [Fixed / Simple / Complex]
- Visual Effects: [None / Basic / Advanced]

**Complexity Decision**: [Explain why this level was chosen]

### Budget & Timeline

**Total Budget**: [金额] 元
**Budget Breakdown**: [See Phase Planning section]
**Timeline**: [交付日期]
**Priority**: [Quality优先 / Cost优先 / Balanced]

---

## Constitution Check *(GATE)*

*GATE: Must pass before Phase Planning. Re-check after Phase Planning.*

### I. 成本优先思维 (Cost-First Thinking)

- [ ] 渐进式验证路径已规划 (L0 → L1 → L2? → L3)
- [ ] L0→L1→L3成本递增合理
- [ ] 总成本在预算内
- [ ] 降级策略已定义

**Status**: [PASS / FAIL / NEEDS JUSTIFICATION]
**Notes**: [如有违反，说明原因]

### II. 规范优先 (Spec-First)

- [ ] `/clarify` 已运行（或明确跳过，需文档化理由）
- [ ] spec.md已完成并审核
- [ ] **所有 [NEEDS CLARIFICATION] 已解决**（必须 0 个，/plan 步骤 2 已验证）
- [ ] spec.md 包含 `## Clarifications` 部分（记录所有决策）
- [ ] 成功标准可衡量
- [ ] 不包含实现细节（平台选择在此plan中）

**Status**: [PASS / FAIL / NEEDS JUSTIFICATION]
**Notes**: [如有违反，说明原因]
**Clarification Status**: [✓ /clarify completed | ⚠ /clarify skipped (reason: ...)]

### III. 质量通过迭代 (Quality Through Iteration)

- [ ] 迭代路径清晰 (wireframe → full → final)
- [ ] 反馈周期合理 (<30分钟 for L0-L1)
- [ ] 规范随学习演进的机制已建立

**Status**: [PASS / FAIL / NEEDS JUSTIFICATION]
**Notes**: [如有违反，说明原因]

### IV. 角色一致性 (Character Consistency)

- [ ] 主要角色已在spec中详细定义
- [ ] 角色一致性策略已选择
- [ ] character-asset-library.json计划已制定

**Status**: [PASS / FAIL / NEEDS JUSTIFICATION / N/A (no characters)]
**Notes**: [如有违反，说明原因]

### V. 视觉连贯性 (Visual Continuity)

- [ ] 全局视觉风格已在spec中定义
- [ ] visual-continuity.json将被创建
- [ ] 跨场景一致性规则已明确

**Status**: [PASS / FAIL / NEEDS JUSTIFICATION]
**Notes**: [如有违反，说明原因]

### VI. 平台适配 (Platform Adaptation)

- [ ] 平台选择有文档化的理由
- [ ] 提示词风格适配平台特性
- [ ] 降级策略定义清晰

**Status**: [PASS / FAIL / NEEDS JUSTIFICATION]
**Notes**: [如有违反，说明原因]

### VII. 三层画面结构 (Three-Layer Composition)

- [ ] 所有场景将遵循前景-中景-背景结构
- [ ] 提示词模板包含三层描述

**Status**: [PASS / FAIL / NEEDS JUSTIFICATION]
**Notes**: [如有违反，说明原因]

### VIII. 10秒情绪单元 (10-Second Emotional Unit)

- [ ] 每个场景是完整情绪单元
- [ ] 场景间情绪过渡已规划

**Status**: [PASS / FAIL / NEEDS JUSTIFICATION]
**Notes**: [如有违反，说明原因]

### IX. 多阶段工作流 (Multi-Phase Workflow)

- [ ] Phase选择基于spec中的preferences
- [ ] 阶段间数据传递路径清晰

**Status**: [PASS / FAIL / NEEDS JUSTIFICATION]
**Notes**: [如有违反，说明原因]

### X. 宪法遵守 (Constitution Compliance)

- [ ] 所有违反已记录在Complexity Tracking
- [ ] 违反有充分理由
- [ ] Constitution Check在Phase Planning后重新验证

**Status**: [PASS / FAIL / NEEDS JUSTIFICATION]
**Notes**: [如有违反，说明原因]

---

## Workflow Phase Planning

### Phase 0: 主设计图生成 *(optional)*

**Enabled**: [YES / NO]
**Rationale**: [为什么需要/不需要这个阶段]

**如果启用**:

**Purpose**: 为每个场景生成关键帧参考图，提供视觉基准
**Platform**: [Midjourney V6 / FLUX / Stable Diffusion XL]
**Platform Choice Rationale**: [为什么选择这个平台]

**Output**:

- 6张关键帧设计图 (每场景1张)
- 格式: PNG, 1080×1920 (or target resolution)
- 存储位置: `output/design/scene-[N]-keyframe.png`

**Prompt Style**: [Midjourney style / FLUX prompting / SDXL]

**Cost Estimate**:

- Unit Cost: ~3元/张
- Total: ~18元 (6张)

**Success Criteria**:

- [ ] 构图符合三分法或spec中定义的规则
- [ ] 色彩统一符合spec中的color palette
- [ ] 角色外貌一致性（如果有角色）
- [ ] 客户/导演批准

**Timeline**: [预计完成时间]

---

### Phase 1: 置景设计 *(optional)*

**Enabled**: [YES / NO]
**Rationale**: [为什么需要/不需要这个阶段]

**如果启用**:

**Purpose**: 3D场景布局和环境设计，确保空间关系准确
**Platform**: [Blender / Unreal Engine / 3D工具 / 手动绘制]

**Output**:

- 场景布局文件/参考图
- 关键角度视图
- 存储位置: `output/scene-setup/`

**Cost Estimate**: ~[金额]元 (根据复杂度)

**Success Criteria**:

- [ ] 空间关系合理
- [ ] 符合导演视觉要求

**Timeline**: [预计完成时间]

---

### Phase 2: 打光设计 *(optional)*

**Enabled**: [YES / NO]
**Rationale**: [为什么需要/不需要这个阶段]

**如果启用**:

**Purpose**: 专业光照方案设计，确保光影效果符合spec
**Platform**: [光照工具 / 手动标注 / AI辅助]

**Output**:

- 光照参数文件
- 参考图标注
- 存储位置: `output/lighting/`

**Cost Estimate**: ~[金额]元

**Success Criteria**:

- [ ] 光照风格统一
- [ ] 符合spec中的lighting requirements

**Timeline**: [预计完成时间]

---

### Phase 3: 视频生成 *(mandatory)*

**Enabled**: YES (强制)

**Purpose**: 生成6个10秒视频片段，这是核心阶段
**Primary Platform**: [Sora2 / Runway Gen-4 / 即梦AI v3.0 Pro / 海螺02 / 可灵]
**API Version**: [具体版本，如v30_pro, Gen-4]

**Platform Choice Rationale**:

[详细说明为什么选择这个平台，基于以下因素:]

- **Strengths**: [这个平台的3个关键优势]
- **Fit for Project**: [为什么适合本项目的具体需求]
- **Cost**: [成本考虑]
- **Previous Experience**: [如果有，说明历史成功率]

**Prompt Strategy**:

**Prompt Style**: [layered-structure / film-script / ai-optimized / commercial]
**Prompt Style Rationale**: [为什么选择这种风格]

**Example Prompt Structure**:

```
[展示提示词的基本结构，不需要完整内容，在/script阶段生成]

# Layered Structure Example:
PROJECT: [project-name]
SCENE_01:
  VISUAL:
    - 前景: [元素]
    - 中景: [主体]
    - 背景: [环境]
  DIALOGUE: [台词]
  CAMERA: [运镜]

# AI-Optimized Example (Sora2):
"Character says 'text' at 0:03, lip-synced, joyful.
Heavy durian (3kg), arms bent from weight.
Music: Jazz, BPM 95."
```

**Output**:

- 6个视频文件 (每个10秒)
- 格式: MP4, [resolution], 24fps
- 存储位置: `output/segments/scene-[N].mp4`

**Previous Phase Integration**:

- [ ] If Phase 0 enabled: Use keyframe images as visual reference
- [ ] If Phase 1 enabled: Use scene layout for spatial accuracy
- [ ] If Phase 2 enabled: Use lighting parameters in prompts

**Cost Estimate**:

- Platform Base Cost: ~170元 (6×10秒)
- Additional Costs: [如果有，如特殊API费用]
- **Total**: ~170元

**Success Criteria**:

- [ ] 动态流畅，无卡顿
- [ ] 音视频同步（如有音频）
- [ ] 符合spec的visual style
- [ ] 角色一致性≥85% (如有角色)
- [ ] 转场自然

**Timeline**: [预计完成时间，考虑生成+等待时间]

---

### Phase 4: 4K放大 *(optional)*

**Enabled**: [YES / NO]
**Rationale**: [为什么需要/不需要这个阶段]

**如果启用**:

**Purpose**: 分辨率增强，细节优化，从1080p升至4K
**Platform**: [Topaz Video AI / AI增强工具]

**Output**:

- 4K视频文件
- 格式: MP4, 3840×2160 or 2160×3840
- 存储位置: `output/final-4k.mp4`

**Cost Estimate**: ~[金额]元

**Success Criteria**:

- [ ] 细节清晰增强
- [ ] 无明显伪影

**Timeline**: [预计完成时间]

---

### Phase Execution Order

```
Phase 0 (if enabled)
  ↓ Output: Keyframe images
Phase 1 (if enabled)
  ↓ Output: Scene layouts
Phase 2 (if enabled)
  ↓ Output: Lighting plans
Phase 3 (mandatory)
  ↓ Input: All previous phase outputs
  ↓ Output: 6 video segments
Phase 4 (if enabled)
  ↓ Input: Merged video from Phase 3
  ↓ Output: 4K final video
```

**Total Estimated Cost**: [Sum of all enabled phases] 元

---

## Platform Selection Strategy

### Primary Platform: [选择的平台]

**Full Name**: [如：Volcano Engine 即梦AI v3.0 Pro]
**API Version**: [v30_pro / Gen-4 / etc.]

**Rationale** (必须详细说明):

1. **Strengths for this project**:
   - [优势1，如：中文内容理解好]
   - [优势2，如：人物表情自然]
   - [优势3，如：首尾帧控制精确]

2. **Match with spec requirements**:
   - Spec要求: [引用spec中的具体要求]
   - Platform能力: [说明平台如何满足]

3. **Cost consideration**:
   - Unit cost: [单价]
   - Total cost: [总价]
   - Value: [性价比评估]

4. **Risk assessment**:
   - Known limitations: [已知的限制]
   - Mitigation: [如何缓解]

### Backup Platforms & Fallback Strategy

| 失败场景 | 切换到 | 触发条件 | 原因 |
|---------|--------|---------|------|
| 角色一致性<85% | [Platform B] | 3次生成后仍不达标 | [该平台的一致性能力] |
| 预算超支 | [Platform C] | 成本超过[金额]元 | [成本更低] |
| 生成超时 | [Platform D] | 等待时间>5分钟 | [生成速度快] |
| API限流 | [Platform E] | Rate limit错误 | [备用账号/平台] |

### Cross-Platform Consistency

**如果需要切换平台**:

- [ ] 使用统一的standard prompt作为中间格式
- [ ] 通过prompt translator转换为目标平台格式
- [ ] 保持角色描述一致（使用character-asset-library.json）
- [ ] 验证视觉风格一致性

---

## Character Consistency Strategy *(if applicable)*

**Characters in Project**: [列出所有角色]

### Method Selection

**Chosen Method**: [13-Image Fusion / Prompt固定 / Reference Images / ControlNet]

**Method Rationale**:

| Method | Pros | Cons | Cost | Chosen? |
|--------|------|------|------|---------|
| 13图融合 | 最可靠，80-90%一致性 | 成本高，需要预生成 | 高 | [YES/NO] |
| Prompt固定 | 成本低，实施简单 | 一致性60-70% | 低 | [YES/NO] |
| Reference Images | 平衡，70-80%一致性 | 需要好的参考图 | 中 | [YES/NO] |
| ControlNet | 精确控制 | 技术复杂 | 中 | [YES/NO] |

**Decision**: [Selected method] because [reason]

### Character Asset Library Setup

**Will Create**: `character-asset-library.json`

**For Each Character**:

```json
{
  "characters": {
    "[角色名]": {
      "role": "protagonist/supporting",
      "appearance": {
        "age": "[年龄]",
        "gender": "[性别]",
        "physicalTraits": "[from spec]",
        "clothing": "[from spec]",
        "distinctiveFeatures": ["[特征1]", "[特征2]"]
      },
      "referenceImages": {
        "front": "path/to/front.jpg",
        "side45": "path/to/side45.jpg",
        "...": "... (13 standard angles)"
      },
      "fusionPrompt": "[if using 13-image fusion]",
      "fixedPromptTemplate": "[if using prompt固定]"
    }
  }
}
```

### Consistency Verification

**Verification Method**: [人工审核 / AI自动检查 / 混合]

**Acceptance Criteria**:

- [ ] 外貌相似度≥85% (人工评分)
- [ ] 显著特征100%匹配
- [ ] 服装/配饰一致

**Re-generation Policy**:

- If consistency <85%: Re-generate with enhanced prompt
- Max retries: 3 per scene
- If still failing: Fallback to different platform or method

---

## Visual Continuity Tracking

**Will Create**: `visual-continuity.json`

### Global Style Definition

From spec.md:

```json
{
  "globalStyle": {
    "colorGrading": "[from spec]",
    "colorPalette": ["[color1]", "[color2]", "[color3]"],
    "lighting": "[from spec]",
    "atmosphere": "[from spec]",
    "artStyle": "[from spec]",
    "cameraStyle": "[from spec]"
  }
}
```

### Per-Scene Style Variations

```json
{
  "sceneStyles": [
    {
      "sceneId": "Scene_01",
      "timeOfDay": "[if applicable]",
      "weather": "[if applicable]",
      "emotionalTone": "[from spec]",
      "keyVisualElements": ["[element1]", "[element2]"],
      "transitionFrom": null,
      "transitionTo": "Scene_02"
    },
    // ... scenes 2-6
  ]
}
```

### Continuity Rules

1. **Same Location Scenes**: 光照/配色/氛围必须一致
2. **Time Progression Scenes**: 光照变化符合逻辑（早→中→晚）
3. **Mood Shift Scenes**: 色调可变化，但过渡流畅
4. **Character Appearance**: 在所有场景保持一致（除非故意变化）

---

## Validation Strategy

### L0: Text Validation (免费，强制)

**Always Executed**: YES

**What to Check**:

- [ ] Prompt completeness (每个场景都有完整描述)
- [ ] Scene composition quality (三层结构)
- [ ] Visual consistency (跨场景风格一致)
- [ ] Potential generation issues (标记可能的问题)

**Acceptance Criteria**: L0 score ≥ 60分

**Output**: `validation-report-l0.md`

---

### L1: Visual Preview (3-18元，推荐)

**Strategy**: [wireframe / Phase_0_output / full / skip]

**Decision Logic**:

```
If Phase 0 enabled:
  Use Phase 0 keyframes → Skip L1 wireframe
  Cost: Already included in Phase 0
Else if budget < 180元:
  Use wireframe (3元/张)
  Total: ~18元 for 6 scenes
Else if budget >= 200元:
  Use full render (6元/张)
  Total: ~36元 for 6 scenes, or
  Selective: 3 key scenes × 6元 = 18元
```

**Chosen Strategy**: [填写选择]
**Rationale**: [说明原因]

**Cost**: ~[金额]元

**What to Validate**:

- [ ] Composition (构图合理性)
- [ ] Color scheme (配色符合spec)
- [ ] Character appearance (角色外貌初步检查)
- [ ] Scene layout (场景布局)

**Re-generation Threshold**: 如果3个以上场景需要major changes，回到spec调整

---

### L2: Dynamic Preview (28元，可选)

**Will Execute**: [YES / NO]

**Decision Criteria**:

```
Execute L2 IF:
  - 有复杂相机运动 (推拉摇移跟)
  - 有复杂角色动作 (战斗/舞蹈/跑步)
  - 需要验证转场效果
  - 首次使用新平台
  - Spec明确要求

Skip L2 IF:
  - 场景主要静态或微动画
  - L1效果非常满意
  - 预算紧张
  - 有历史成功经验
```

**Decision**: [YES/NO], because [reason]

**If YES**:

**Scenes to Test**: [选择1-2个代表性场景]
**What to Validate**:

- [ ] Camera movement smoothness
- [ ] Subject motion naturalness
- [ ] Transition effects
- [ ] Audio-video sync (if applicable)

**Cost**: ~28元 (1 scene × 10s test)

---

### Validation Cost Summary

| Level | What | Cost | Status |
|-------|------|------|--------|
| L0 | Text analysis | 0元 | 强制 |
| L1 | Visual preview | [金额]元 | [Included/Recommended/Skip] |
| L2 | Dynamic preview | [金额]元 | [Yes/No] |
| **Total** | | **[金额]元** | |

---

## Quality Assurance Plan

### Three-Tier Quality Checklist

#### 基础层 (L0-Technical)

- [ ] 分辨率符合平台要求 ([resolution])
- [ ] 帧率稳定24fps
- [ ] 音频同步误差<50ms (if audio)
- [ ] 文件格式正确 (MP4)
- [ ] 总时长60秒±2秒

#### 中间层 (L1-Aesthetic)

- [ ] 画面构图符合三分法或spec规则
- [ ] 色彩调性统一 (≥90%一致性)
- [ ] 光影层次丰富
- [ ] 角色表情到位 (if characters)
- [ ] 运镜流畅自然

#### 应用层 (L2-Narrative)

- [ ] 叙事节奏合理 (符合spec的narrative structure)
- [ ] 情绪传递准确 (观众能感受到期望情绪)
- [ ] 台词与画面匹配 (if dialogue)
- [ ] 转场逻辑清晰
- [ ] 视觉连贯性 (跨场景风格统一)

### QA Execution

**Who**: [人工审核 / AI辅助 / 混合]
**When**: [每个Phase后 / 最终合成后]
**Output**: `quality-report.md`

---

## Cost Breakdown & Budget

| Item | Phase | Cost | Notes |
|------|-------|------|-------|
| 主设计图 | Phase 0 | [金额]元 | If enabled |
| 置景设计 | Phase 1 | [金额]元 | If enabled |
| 打光设计 | Phase 2 | [金额]元 | If enabled |
| 视频生成 | Phase 3 | ~170元 | Mandatory |
| 4K放大 | Phase 4 | [金额]元 | If enabled |
| L0验证 | Validation | 0元 | Free |
| L1验证 | Validation | [金额]元 | Recommended |
| L2验证 | Validation | [金额]元 | Optional |
| **Total** | | **[总计]元** | |

**Budget Status**: [Within / Over / At Limit]
**If Over Budget**: [Adjustment strategy]

---

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| 违反原则 | 为什么必需 | 更简单方案被拒绝的原因 |
|---------|----------|---------------------|
| [如：跳过L1验证] | [预算极度紧张] | [风险可接受，历史成功率高] |
| [如：不使用三层结构] | [特写镜头为主] | [故事需要，背景干扰情绪] |

---

## Progress Tracking

*This checklist is updated during execution*

### Planning Status

- [ ] Technical context defined
- [ ] Constitution Check: Initial pass
- [ ] Phase planning complete
- [ ] Platform selection documented
- [ ] Character consistency strategy defined
- [ ] Validation strategy defined
- [ ] Cost estimate calculated
- [ ] Constitution Check: Post-planning pass

### Execution Status (updated by /implement)

- [ ] Phase 0: Complete (if enabled)
- [ ] Phase 1: Complete (if enabled)
- [ ] Phase 2: Complete (if enabled)
- [ ] L0 Validation: Pass
- [ ] L1 Validation: Pass
- [ ] Phase 3: Complete (mandatory)
- [ ] L2 Validation: Pass (if executed)
- [ ] Phase 4: Complete (if enabled)
- [ ] QA: Pass
- [ ] Final delivery

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Resolve any violations** in Complexity Tracking
3. **Run `/script`** to generate detailed scene prompts
4. **Execute `/validate`** for L0+L1 validation
5. **Run `/implement`** to execute the workflow
6. **Monitor progress** through Progress Tracking section

---

*Based on MovieFlow Constitution v1.0.0 - See `/docs/constitution.md`*

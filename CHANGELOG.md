# Changelog

## [0.4.4] - 2025-10-09

### 文档增强 📚

#### 新增 SDD 实践指南

**核心价值**：帮助用户通过完整案例深入理解 Specification-Driven Development (SDD) 方法论在视频创作中的应用。

**新增文件**：
- `docs/practical-guide.md` (2352行) - 完整的 SDD 实践教程

**内容亮点**：

1. **核心理念澄清**
   - ❌ 线性流程 vs ✅ 分层递归
   - 4个层级：系列 → 视频 → 场景 → 元素
   - 每个层级都是完整的 SDD 循环

2. **"唐僧相亲"完整案例** (场景1)
   - 从 Constitution 到最终生成的完整流程
   - 包含 467行 spec.md 示例
   - 5个澄清问题的完整对话
   - 23个任务分解
   - L0+L1+L3 验证流程
   - 真实成本数据（197元 vs 245元）

3. **4个递归场景教学**
   - 场景2：视频级 SDVC（修改单个场景）
   - 场景3：场景级 SDVC（角色设计微调）
   - 场景4：元素级 SDVC（角色细节调整）
   - 场景5：系列级 SDVC（创建视频系列）

4. **决策支持工具**
   - 何时用哪个 SDD 层级（决策树）
   - 成本对比：传统方法 vs SDVC（节省59-66%）
   - 渐进式验证深入解析（L0-L3）
   - 追踪系统文档结构

5. **命令速查表**
   - 7个核心命令的快速参考
   - 好 vs 坏提示词对比示例
   - 完整用户-AI 对话流程

**收益**：
- 📖 降低学习曲线：通过真实案例理解抽象概念
- 🎯 决策支持：何时用何种方法的明确指导
- 💰 成本意识：每个环节的成本透明化
- 🔄 可复制：完整的对话模板可直接参考

**文档导航更新**：
- README.md 添加实践指南链接（用户文档部分）

### 技术细节

- 文档格式：Markdown
- 案例来源：MovieFlow 已有的"唐僧相亲"模板
- 参考结构：novel-writer 项目的 practical-guide.md
- 对齐版本：Spec-Kit v2.1.1 + MovieFlow v0.4.3

---

## [0.4.3] - 2025-10-09

### 重大升级 🎯 - SDD 方法论深度整合

#### 核心特性：新增 `/clarify` 命令（质量门控）

**背景**：MovieFlow v0.4.1 简化了命令系统（12→6），但缺少 Spec-Kit SDD 方法论的关键环节 - 系统化澄清机制。v0.4.3 填补这一缺口。

**问题**：
- 当前流程：`/specify` (标记 NEEDS CLARIFICATION) → `/plan` （检查但不强制）
- 结果：后期返工成本高（60-80% 成本浪费，Constitution 记录）

**解决方案**：
- 新流程：`/specify` → `/clarify` **（必经阶段）** → `/plan` （强制验证）→ `/tasks` → `/validate` → `/implement`

#### 1. 新增 `/clarify` 命令

**核心能力**：
- ✅ **10 维度视频专属覆盖度扫描**：
  1. 视觉风格与美术方向
  2. 角色设计与一致性
  3. 场景描述与环境
  4. 叙事结构与情绪弧线
  5. 镜头语言与构图
  6. 光照与色彩
  7. 音频与对话
  8. 平台适配与技术约束
  9. 预算与成本控制
  10. 边缘情况与合规性

- ✅ **结构化提问机制**：
  - 最多 5 个高度针对性问题
  - 多选或 ≤5 字短答案
  - 优先级排序：(影响 × 不确定性) 启发式

- ✅ **即时文档更新**：
  - 每个答案立即集成到 spec.md
  - 添加 `## Clarifications` 部分（可追溯性）
  - 同步更新相应规格章节
  - 删除已解决的 `[NEEDS CLARIFICATION]` 标记

#### 2. 强制质量门控机制

**Constitution.md 更新**：
- 强制流程更新：`/specify` → `/clarify` → `/plan` → ...
- 质量关口新增 `/clarify` 阶段检查
- 违反后果：`/plan` 发现 NEEDS CLARIFICATION → ERROR 拒绝执行

**plan-template.md 强化**：
- 步骤 2：扫描 spec.md，如有任何 `[NEEDS CLARIFICATION]` → ERROR
- Constitution Check 新增 `/clarify` 完成状态验证
- 明确指示用户运行 `/clarify`

**spec-template.md 更新**：
- 新增 `## Clarifications` 部分模板
- Next Steps 更新：强调 `/clarify` 为必经阶段

#### 3. 基础设施

**新增文件**：
- `templates/commands/clarify.md` - 完整的中文命令定义（10 维度）
- `scripts/bash/check-prerequisites.sh` - 前置条件检查脚本（支持 JSON 输出）

#### 4. 预期收益

- 💰 **降低返工成本 60-80%**（Constitution 文档化的数据）
- 📊 **系统化质量保证**：10 维度覆盖，无遗漏
- 🔒 **强制门控**：`/plan` 拒绝不完整规格
- 📝 **可追溯性**：所有澄清决策记录在案
- ✅ **符合 Spec-Kit SDD 标准方法论**

#### 5. 命令数量说明

- v0.4.1: 6 个核心命令（刚精简 -50%）
- v0.4.3: 7 个核心命令（+1 个**方法论核心命令**）
- 增加理由：填补 SDD 流程关键缺口，遵循 Spec-Kit 标准

#### 6. 工作流对比

**旧流程**（v0.4.1）：
```
/specify → /plan → /tasks → /validate → /implement
（缺少系统化澄清，后期返工多）
```

**新流程**（v0.4.3）：
```
/specify → /clarify → /plan → /tasks → /validate → /implement
          ↑
    必经阶段，10维度覆盖，强制门控
```

#### 7. 升级指南

**从 v0.4.1 升级到 v0.4.3**：

1. 创建规格后，**必须**运行 `/clarify`
2. `/clarify` 会通过最多 5 个问题系统化消除模糊点
3. 所有答案自动集成到 spec.md
4. `/plan` 会验证，如有遗漏的 NEEDS CLARIFICATION → 报错

**示例**：
```bash
# 1. 创建规格
/specify 创建一个产品介绍视频...

# 2. 系统化澄清（新增，必经）
/clarify

# 3. 创建技术方案（会验证澄清完成）
/plan

# 4. 后续流程
/tasks
/validate
/implement
```

### 技术细节

- 脚本语言：Bash（check-prerequisites.sh）
- 无外部依赖（不使用 jq）
- 支持 JSON 和文本输出模式
- 与 Spec-Kit v2.1.1 方法论对齐

---

## [0.4.1] - 2025-10-08

### 重大优化 🎯

#### 命令系统精简
- 🔥 **移除6个冗余命令**：遵循 Spec-Kit "如果非必须，请勿增加" 的原则
  - 删除 `/character`、`/script`、`/scene`、`/voice`（功能已融入 `/specify`）
  - 删除 `/platform`、`/estimate`（功能已融入 `/plan`）
- ✅ **保留6个核心命令**：
  - `/specify` - 创建项目规格（包含角色、场景、音频、字幕设计）
  - `/plan` - 制定技术方案（包含平台选择、成本预估）
  - `/tasks` - 任务分解
  - `/validate` - L0+L1验证
  - `/preview` - L2预览
  - `/implement` - 执行生成
- 📊 **效果**：命令数量减少50%，学习成本大幅降低，流程更清晰

#### 文档系统重构
- 📘 **新增完整用户使用手册** (`docs/USER_GUIDE.md`)
  - 5分钟上手指南
  - 6个核心命令详解（每个命令包含用途、示例、FAQ）
  - 3个完整创作流程案例（产品介绍、品牌故事、教程视频）
  - 成本优化建议（渐进式验证、平台选择、批量优化）
  - 故障排除指南（API错误、生成失败、音视频问题）
  - 50+ 常见问题解答
- 📚 **文档分类优化**：
  - 用户文档：USER_GUIDE.md、workflow.md、progressive-validation-guide.md
  - 技术文档：PRD.md、platform-adapters、提示词标准化
  - 开发文档：local-development.md、data-model.md
- 🔗 **README.md 增强**：添加完整的文档导航系统

### 文件清理
- 🗑️ **删除冗余文件**：
  - 命令模板：character.md、script.md、scene.md、voice.md、platform.md、estimate.md
  - 脚本文件：create-character.sh、create-script.sh、create-scene.sh、create-voice.sh
- 📝 **更新文档引用**：PRD.md、workflow.md、implement.md、README.md

### 升级指南

**从 v0.4.0 升级**：

旧的创作流程：
```bash
/specify → /script → /character → /scene → /voice → /platform → /estimate → /implement
```

新的创作流程（更简洁）：
```bash
/specify → /plan → /validate → /tasks → /preview → /implement
```

所有功能都已整合到核心命令中，无功能损失。

## [0.3.1] - 2025-10-05

### 优化

- 🎯 **简化 Slash 命令**：移除 `video-` 前缀，使命令更简洁
  - `/video-specify` → `/specify`
  - `/video-plan` → `/plan`
  - `/video-script` → `/script`
  - `/video-validate` → `/validate`
  - `/video-preview` → `/preview`
  - `/video-implement` → `/implement`

### 文档更新

- 更新 README.md 所有命令示例
- 更新 CHANGELOG.md 迁移指南
- 更新 CLI 初始化提示信息

## [0.3.0] - 2025-10-05

### 重大变更 🎯

MovieFlow 全面重构为 Spec-Kit 兼容架构，实现**基础设施与业务分离**：

#### CLI 简化（Breaking Changes）
- ❌ **移除业务命令**：`validate`、`preview`、`generate`、`sessions`、`script-export`
- ✅ **保留基础命令**：`init`（项目初始化）、`check`（环境检查）
- 🎯 **设计理念**：CLI 负责基础设施，AI 助手负责业务逻辑

#### Slash 命令系统
- 🆕 `/specify` - 创建视频项目规范
- 🆕 `/plan` - 制定技术实现计划
- 🆕 `/script` - 生成视频脚本（替代 `script-export`）
- 🆕 `/validate` - L0+L1 渐进式验证（替代 `validate`）
- 🆕 `/preview` - L2 动态预览（替代 `preview`）
- 🆕 `/implement` - 生成完整视频（替代 `generate`）

#### 多平台支持
- 🤖 **Claude Code**: `.claude/commands/*.md` (Markdown + YAML frontmatter)
- 🔮 **Cursor**: `.cursor/prompts/*.md` (Simple Markdown)
- 💎 **Gemini**: `.gemini/commands/*.toml` (TOML format)
- 🌊 **Windsurf**: `.windsurf/workflows/*.md` (Markdown workflows)

### 新增功能

- 🏗️ **Spec-Kit 项目结构**：`.specify/` 目录组织（memory, specs, projects, scripts）
- 📄 **Constitution.md**：MovieFlow 核心原则和最佳实践文档
- 🎨 **自动命令生成**：`init` 命令自动为各 AI 平台生成对应格式的 Slash 命令
- 🔍 **增强的环境检查**：`check` 命令提供更友好的 emoji 状态指示

### 优化改进

- 📖 **全面更新文档**：README.md 反映新架构，突出 Slash 命令工作流
- 🎓 **更好的用户引导**：初始化后显示完整的 Slash 命令使用指南
- 🧹 **代码简化**：移除冗余的 CLI 命令逻辑，专注核心功能

### 迁移指南

从 v0.2.7 升级到 v0.3.0：

```bash
# 旧版本 CLI 命令 → 新版本 Slash 命令
movieflow validate my-video         → /validate
movieflow preview my-video          → /preview
movieflow generate my-video         → /implement
movieflow sessions --list           → AI 助手自动管理
movieflow script-export             → /script
```

### 技术细节

- 保留所有底层 API（`VideoGenerator`、`PreviewService` 等）供编程调用
- Slash 命令通过 AI 助手调用底层 API，提供更智能的参数选择
- 断点续传、会话管理等功能由 AI 助手的记忆系统自动处理

---

## [0.2.7] - 2025-01-22

### 新增
- 🎨 多风格图像预览功能：支持 wireframe/sketch/lineart/full 四种风格
- 💰 成本优化：线框图验证仅需3元，是完整渲染的50%
- 🚀 快速迭代验证：黑白线稿快速验证分镜和构图
- 新增 `--style` 命令行参数，支持灵活选择验证风格

### 优化
- L1级验证现在支持根据风格自动调整成本估算
- 优化渐进式验证流程，提供三种推荐路径（完整/快速/预算紧张）
- 更新文档，详细说明各风格的适用场景和成本对比

### 技术改进
- PromptValidator 新增风格转换引擎
- UniAPIClient 和 YunwuAPIClient 支持风格参数
- PreviewService 增强风格选择功能

## [0.2.6] - 2025-01-22

### 新增
- 💰 渐进式验证系统：L0-L1-L2三级验证，调试成本降低80%
- 🔍 智能提示词分析：自动评分和优化建议（L0级，免费）
- 🖼️ 关键帧预览：生成静态图像预览视觉效果（L1级，约6元）
- 🎬 动态预览：10秒测试视频验证动态效果（L2级，约28元）
- 🌐 多API支持：集成UniAPI和云雾API，支持FLUX、DALL-E等模型

### 新增命令
- `movieflow validate` - 执行L0和L1级渐进式验证
- `movieflow preview` - 生成L2级动态预览视频

## [0.2.5] - 2025-01-21

### 新增
- 统一版本号管理系统
- 专业脚本格式导出功能
- 支持Markdown、HTML、JSON、CSV等多格式导出

## [0.2.4] - 2025-01-21

### 新增
- 集成阿里云智能语音交互TTS服务
- 支持阿里云TTS的多种音色选择（小云、小刚、小梦等）
- 实现TTS服务自动降级机制（阿里云 → 火山引擎 → Edge-TTS → macOS Say）

### 修复
- 修复火山引擎TTS API接口和认证格式问题
- 优化TTS服务失败时的错误处理和自动切换

### 优化
- 提升语音合成的稳定性和成功率
- 改进音频生成的容错机制

## [0.2.3] - 2025-01-21

### 新增
- 支持分镜脚本生成视频
- 添加唐僧找工作视频模板

## [0.2.2] - 2025-01-20

### 新增
- 支持即梦AI v3.0 Pro接口
- 添加视频生成进度条显示
- 支持多平台AI助手适配

## [0.2.1] - 2025-01-19

### 修复
- 修复视频合成时的音频同步问题
- 优化字幕时间轴对齐

## [0.2.0] - 2025-01-18

### 新增
- 断点续传功能
- 批量处理优化
- 支持自定义视频模板

## [0.1.0] - 2025-01-15

### 初始版本
- 基础视频生成功能
- 火山引擎即梦AI集成
- TTS语音合成
- 字幕生成
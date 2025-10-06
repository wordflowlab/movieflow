# Changelog

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
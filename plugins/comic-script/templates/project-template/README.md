# Comic Script 项目模板

这是 Comic Script Plugin 的标准项目模板。执行 `/comic-init` 命令时会自动基于此模板创建新项目。

## 目录结构

```
project-template/
├── spec/                          # Spec驱动核心
│   ├── config.json                # 项目配置
│   ├── beat-sheet.json            # Story Beats（由/comic-analyze生成）
│   ├── episode-index.json         # Episode索引（由/comic-analyze生成）
│   └── tracking/                  # 状态追踪系统
│       ├── character-tracker.json # 角色状态追踪
│       ├── scene-tracker.json     # 场景连贯性追踪
│       └── visual-continuity.json # 视觉风格追踪
├── source/                        # 源文件目录
│   └── .gitkeep
└── episodes/                      # Episode输出目录
    └── .gitkeep
```

## 文件说明

### config.json
项目配置文件，包含：
- 项目基本信息（名称、描述）
- 源文件路径和编码
- 制作设置（时长、策略、画幅）
- 元数据（类型、标签、作者）

### tracking/ 目录

#### character-tracker.json
追踪所有角色的状态，包括：
- 角色基本信息（名称、角色类型、外貌）
- 跨Episode的状态历史（位置、情绪、关系）
- 角色弧线（起点、当前、目标）

#### scene-tracker.json
追踪场景连贯性，包括：
- 当前状态（Episode、场景、地点、时间）
- 所有场景列表（状态、时长、戏剧功能）
- 全局元素（反复出现的母题、视觉主题）

#### visual-continuity.json
追踪视觉风格一致性，包括：
- 全局视觉风格（色调、光照、美术风格）
- Episode级别的视觉风格
- 地点视觉规范
- 视觉母题

## 使用方式

此模板由 `/comic-init` 命令自动使用，无需手动操作。

当用户执行：
```bash
/comic-init 官运 ~/Downloads/官运.txt
```

系统会：
1. 复制此模板到 `projects/官运/`
2. 填充 `config.json` 中的项目信息
3. 复制源文件到 `source/` 目录
4. 初始化 tracking 文件

## Schema 引用

所有 JSON 文件都引用了对应的 JSON Schema：
- `$schema: "../../../spec/schemas/config.schema.json"`
- `$schema: "../../../spec/schemas/character-tracker.schema.json"`
- `$schema: "../../../spec/schemas/scene-tracker.schema.json"`
- `$schema: "../../../spec/schemas/visual-continuity.schema.json"`

这确保了数据结构的正确性和编辑器的智能提示。

## 注意事项

⚠️ **不要直接修改此模板**，它是所有新项目的基础。

⚠️ 如需定制项目结构，请在生成的项目目录中修改，而不是在模板中。

⚠️ Tracking 文件会由系统自动更新，但也可以手动编辑微调。

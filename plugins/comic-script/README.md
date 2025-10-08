# 小说转漫画脚本插件 - Comic Script Plugin

## 概述

Comic Script Plugin 是 MovieFlow 的专业影视改编插件，采用 **Episode-based + Story Beats** 方法，将长篇小说转换为专业的视频制作脚本。

### 核心理念

- **Episode-Based 组织** - 基于戏剧单元而非机械章节划分
- **Story Beats 分析** - 采用 Save the Cat 15拍结构理论
- **Spec-Driven 架构** - 符合 MovieFlow SDVC 理念
- **增量处理** - 无需加载整本小说，按需读取
- **跨Episode追踪** - 保持角色、情节、视觉连贯性

## 为什么需要 Episode-Based 方法？

### 传统章节方法的问题

| 问题 | 传统方法 | Episode-Based 方法 |
|-----|---------|-------------------|
| **章节长度不一** | 机械按章处理，有的章太长，有的太短 | 基于戏剧单元灵活划分 |
| **场景分布不均** | 有的章1个场景，有的章10个场景 | 每个Episode包含1-8个完整场景 |
| **戏剧性断裂** | 可能在高潮时切断 | 保证每个Episode是完整戏剧单元 |
| **内存占用** | 需加载整本小说（100万+字） | 只读取当前Episode文本（4000-8000字） |
| **连贯性差** | 难以跨章追踪角色状态 | Tracking系统保证连贯性 |

### Episode-Based 的优势

**1. 灵活的场景组合**
```
小说章节：第1章（8000字）
  ↓ 传统方法：强制切成1个Episode
  ✗ 问题：可能包含3个不同的戏剧场景

  ↓ Episode-Based方法
  ✓ EP001: 站队之谜 (前2500字, 3场景, 60秒) - Opening Image
  ✓ EP002: 递交材料 (中3000字, 4场景, 80秒) - Catalyst
  ✓ EP003: 关系转变 (后2500字, 2场景, 40秒) - Break into Two
```

**2. 专业的故事结构**
- 基于 **Save the Cat 15拍** 识别关键节拍
- 确保每个Episode有明确的戏剧功能
- 符合三幕结构的节奏控制

**3. 高效的增量处理**
```python
# 传统方法
load_entire_novel()  # 读取 1,000,000 字

# Episode-Based
read_episode(EP001)  # 只读取 4,500 字
process_episode()    # 内存占用低
```

## 工作流程

```
小说文件 (TXT)
    ↓
/comic-init         → 初始化项目，创建规范目录结构
    ↓
/comic-analyze      → 全局分析，生成 Story Beats + Episode规划
    ↓               （仅执行一次，生成 beat-sheet.json 和 episode-index.json）
    ↓
/comic-episode EP001 → 增量制作Episode（场景识别→拆解→分镜→输出spec）
    ↓
/comic-episode EP002 → 继续下一个Episode（自动读取Tracking状态）
    ↓
...                  → 继续制作更多Episodes
    ↓
/comic-export-series → 导出Episode系列合集
    ↓
(MovieFlow主流程)
    ↓
/implement --spec episodes/EP001-.../output/EP001-spec.json
```

## 命令说明

### `/comic-init` - 初始化项目

创建规范驱动的目录结构：

```bash
/comic-init 官运 ~/Downloads/官运.txt
```

**生成结构**：
```
projects/官运/
├── spec/                      # Spec驱动核心
│   ├── config.json            # 项目配置
│   ├── beat-sheet.json        # Story Beats（待analyze生成）
│   ├── episode-index.json     # Episode索引（待analyze生成）
│   └── tracking/              # 状态追踪
│       ├── character-tracker.json
│       ├── scene-tracker.json
│       └── visual-continuity.json
├── source/                    # 源文件
│   └── 官运.txt
└── episodes/                  # 按Episode组织
    └── (待制作)
```

### `/comic-analyze` - 全局分析

**⚠️ 仅执行一次**，对整本小说进行 Story Beats 分析和 Episode 规划。

```bash
/comic-analyze
```

**执行内容**：
1. **章节识别** - 自动识别所有章节边界
2. **智能采样** - 采样20-30%内容（前10章+中间采样+后10章）
3. **Story Beats分析** - 识别15个关键节拍（Opening Image, Catalyst, Midpoint等）
4. **Episode规划** - 基于戏剧单元划分Episode（非机械章节切分）

**输出文件**：
- `spec/beat-sheet.json` - 故事节拍表
- `spec/episode-index.json` - Episode索引（包含每个Episode的源文本位置）

**示例输出**：
```markdown
🔍 正在分析小说《官运》...

📖 扫描小说结构
  ✅ 识别到 1000 章
  ✅ 总字数：2,050,000 字
  ✅ 采样策略：前10章 + 中间20章 + 后10章（共40章）

📊 Story Beats 分析
  🎬 识别到 15 个关键节拍：
    - Opening Image: 第1章 关允站在门口
    - Catalyst: 第1章 称呼之谜
    - Break into Two: 第3章 罕见笑容
    ...

🎯 Episode 规划
  策略：灵活场景组合（flexible-scene-grouping）
  📺 规划为 50 个 Episodes：
    EP001: 站队之谜 (第1章前半, 3场景, 60秒)
    EP002: 内心挣扎与转机 (第1章后+第2章, 6场景, 120秒)
    ...

✅ 分析完成！
```

### `/comic-episode` - 制作Episode

**增量式**制作单个或多个Episode，基于 episode-index.json 只读取必要的文本片段。

```bash
# 制作单个Episode
/comic-episode EP001

# 批量制作
/comic-episode EP001-EP010

# 继续下一个
/comic-episode --continue
```

**执行流程**：

1. **读取Episode元数据** - 从 episode-index.json 获取源文本位置
2. **增量读取文本** - 只读取该Episode涉及的4000-8000字
3. **读取Tracking状态** - 获取上一Episode的角色/场景/视觉状态
4. **场景识别（戏剧性驱动）** - 基于地点、时间、冲突、情绪识别1-8个场景
5. **场景拆解** - 生成详细场景描述（时长、地点、人物、视觉设计）
6. **分镜脚本设计** - 设计镜头表格（景别、运镜、画面、音频、转场）
7. **更新Tracking系统** - 保存当前状态供下一Episode使用
8. **导出Episode脚本** - 生成符合MovieFlow标准的 spec.json

**输出结构**：
```
episodes/EP001-站队之谜/
├── episode-spec.json         # Episode元数据
├── scenes/                   # 场景拆解
│   ├── S001-决心站队.md
│   ├── S002-递交材料.md
│   └── S003-称呼之谜.md
├── storyboards/              # 分镜脚本
│   ├── S001-分镜.md
│   ├── S002-分镜.md
│   └── S003-分镜.md
└── output/
    ├── EP001-spec.json       # ⭐ MovieFlow标准输入
    └── 完整脚本.md
```

**EP001-spec.json 示例**：
```json
{
  "version": "1.0",
  "episodeId": "EP001",
  "title": "站队之谜",
  "duration": 60,
  "sceneCount": 3,
  "scenes": [
    {
      "id": "S001",
      "name": "决心站队",
      "duration": 20,
      "shots": [
        {
          "number": "001",
          "timeCode": "00:00-00:05",
          "shotSize": "全景",
          "cameraMove": "固定",
          "prompt": "暗红色办公室门牌特写，背景是昏暗的走廊..."
        }
      ]
    }
  ]
}
```

### `/comic-status` - 查看状态

查看项目制作进度和状态：

```bash
/comic-status
```

**显示内容**：
- Episode制作进度（已完成/进行中/未开始）
- 总时长统计
- Tracking系统状态
- 待处理Episode列表

### `/comic-export-series` - 导出系列合集

导出多个Episode的合集：

```bash
/comic-export-series EP001-EP010
```

**输出**：
- 合并的分镜脚本
- 系列spec配置
- 资源清单

## 核心技术特性

### 1. Story Beats 分析

采用 **Save the Cat** 15拍结构：

```
第一幕 (Setup)
1. Opening Image (开场画面)
2. Theme Stated (主题陈述)
3. Setup (设定)
4. Catalyst (催化剂)
5. Debate (辩论)

第二幕A (Confrontation)
6. Break into Two (进入第二幕)
7. B Story (B故事线)
8. Fun and Games (有趣时刻)
9. Midpoint (中点)

第二幕B (Complications)
10. Bad Guys Close In (坏人逼近)
11. All Is Lost (全盘皆输)
12. Dark Night of the Soul (灵魂的黑夜)

第三幕 (Resolution)
13. Break into Three (进入第三幕)
14. Finale (结局)
15. Final Image (最后画面)
```

### 2. 灵活的场景识别

**场景边界标记**：
- 地点变化："来到..."、"走进..."
- 时间跳跃："第二天"、"几小时后"
- 人物进出："[角色]走了进来"
- 冲突转折："突然"、"这时"
- 情绪转变："神情一变"

**场景数量可变**：1-8个场景，根据内容动态调整

### 3. Tracking 系统

**character-tracker.json** - 追踪角色状态：
```json
{
  "关允": {
    "states": [
      {
        "episode": "EP001",
        "emotionalState": "紧张 → 决绝",
        "location": "县长办公室",
        "relationships": {"冷枫": "初次接触"}
      }
    ]
  }
}
```

**scene-tracker.json** - 追踪场景连贯性：
```json
{
  "currentState": {
    "currentEpisode": "EP001",
    "location": "县长办公室",
    "timepoint": "白天"
  },
  "scenes": [...]
}
```

**visual-continuity.json** - 追踪视觉风格：
```json
{
  "globalStyle": {
    "colorGrading": "冷色调（灰蓝、墨绿）",
    "lighting": "侧光为主"
  }
}
```

## 与 MovieFlow 主流程集成

Comic Script Plugin **为 MovieFlow 主流程服务**：

```
Comic Script Plugin (插件)          MovieFlow (主干)
    ↓
[小说分析]
    ↓
[Episode制作]
    ↓
[输出 spec.json] ---------------→ [/implement]
                                      ↓
                                  [场景渲染]
                                      ↓
                                  [视频合成]
                                      ↓
                                  [最终视频]
```

**集成示例**：
```bash
# 1. 使用插件生成脚本
/comic-init 官运 ~/Downloads/官运.txt
/comic-analyze
/comic-episode EP001

# 2. 使用主流程生成视频
/implement --spec projects/官运/episodes/EP001-站队之谜/output/EP001-spec.json

# 3. 继续下一个Episode
/comic-episode EP002
/implement --spec projects/官运/episodes/EP002-.../output/EP002-spec.json
```

## 专家模式

### 漫画导演专家 (`/expert comic-director`)
- 整体视觉叙事指导
- Episode节奏把控
- 风格统一建议

### 分镜师专家 (`/expert storyboard-artist`)
- 分镜设计和镜头语言
- 构图优化
- 视觉连贯性

## 技术要求

- MovieFlow >= 0.3.0
- 支持 UTF-8 编码的 TXT 文件
- 推荐至少 4GB 内存

## 使用示例

### 完整流程示例

```bash
# 步骤1: 初始化项目
/comic-init 官运 ~/Downloads/官运.txt

# 步骤2: 全局分析（仅一次）
/comic-analyze
# 输出：识别1000章，规划50个Episodes

# 步骤3: 制作第一个Episode
/comic-episode EP001
# 输出：生成 EP001-spec.json (3场景, 60秒)

# 步骤4: 生成视频
/implement --spec projects/官运/episodes/EP001-站队之谜/output/EP001-spec.json

# 步骤5: 继续制作
/comic-episode EP002
/implement --spec projects/官运/episodes/EP002-.../output/EP002-spec.json

# 步骤6: 批量制作
/comic-episode EP003-EP010

# 步骤7: 导出系列
/comic-export-series EP001-EP010
```

## 注意事项

⚠️ **版权提醒** - 请确保有权改编小说内容

⚠️ **文件编码** - 仅支持 UTF-8 编码的 TXT 文件

⚠️ **处理时长** - `/comic-analyze` 首次分析可能需要5-10分钟（取决于小说长度）

⚠️ **增量处理** - `/comic-episode` 每个Episode处理时间约1-3分钟

## 最佳实践

### 1. Episode 规划
- 建议每个Episode 60-120秒
- 每个Episode包含完整的戏剧弧线
- 关注Story Beats的戏剧功能

### 2. 场景设计
- 保持视觉连贯性（通过Tracking系统）
- 突出叙事重点
- 控制镜头节奏

### 3. 批量处理
- 第一次建议单个Episode制作，验证质量
- 质量满意后可批量制作

## 对比总结

| 维度 | 传统章节方法 | Episode-Based 方法 |
|-----|------------|-------------------|
| 划分依据 | 章节编号 | 戏剧单元（Story Beats） |
| 场景数量 | 固定6个 | 灵活1-8个 |
| 时长分配 | 机械平均 | 基于戏剧需要 |
| 内存占用 | 加载整本小说 | 只读取当前Episode |
| 连贯性 | 难以追踪 | Tracking系统保证 |
| 适用场景 | 结构规范的短篇 | 任意长度小说 |

## 支持

如遇问题或有建议，请提交 Issue：
https://github.com/wordflowlab/movieflow/issues

## 许可证

MIT License

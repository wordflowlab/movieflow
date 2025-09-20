---
description: 设计视频角色形象
scripts:
  sh: .specify/scripts/bash/create-character.sh --json "{ARGS}"
  ps: .specify/scripts/powershell/create-character.ps1 -Json "{ARGS}"
---

根据提供的角色描述创建视频角色形象：

1. 运行脚本 `{SCRIPT}` 并解析 JSON 输出，获取 CHARACTER_NAME 和 CHARACTER_FILE
2. 分析角色需求：
   - 角色类型（Q版/真人/动画/拟人）
   - 性格特征
   - 外观风格
   - 目标受众喜好
3. 设计角色形象：
   - **外观设计**：体型、服装、配色
   - **表情设计**：喜怒哀乐等基础表情
   - **动作设计**：标志性动作和姿态
   - **特色元素**：独特识别符号
4. 生成角色提示词：
   - 正面视角描述
   - 侧面视角描述
   - 动作状态描述
   - 表情变化描述
5. 输出到 CHARACTER_FILE

设计要点：
- 保持角色风格统一
- 突出角色个性特征
- 适配目标平台审美
- 便于AI稳定生成
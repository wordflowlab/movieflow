---
description: 设计视频场景画面
scripts:
  sh: .specify/scripts/bash/create-scene.sh --json "{ARGS}"
  ps: .specify/scripts/powershell/create-scene.ps1 -Json "{ARGS}"
---

根据脚本内容设计具体场景画面：

1. 运行脚本 `{SCRIPT}` 并解析 JSON 输出，获取 SCENE_ID 和 SCENE_FILE
2. 分析场景需求：
   - 画面构图要素
   - 色彩搭配方案
   - 光线氛围设置
   - 动态元素规划
3. 生成场景提示词：
   - **主体描述**：核心视觉元素
   - **背景环境**：场景设定和氛围
   - **摄影参数**：镜头角度、景深、焦距
   - **艺术风格**：视觉风格和美学特征
   - **动作描述**：动态变化和运动轨迹
4. 创建分镜设计：
   - 开始帧画面（第1帧）
   - 中间帧画面（第120帧）
   - 结束帧画面（第241帧）
   - 过渡衔接说明
5. 输出到 SCENE_FILE

场景设计要点：
- 保持视觉连贯性
- 突出叙事重点
- 控制视觉节奏
- 确保场景可生成性
#!/bin/bash

# MovieFlow 场景设计脚本
# 创建视频场景画面

# 获取当前时间戳
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

# 解析参数
ARGS="$1"
SCENE_NUM=""
DESCRIPTION=""

# 如果传入了JSON参数，解析它
if [ ! -z "$ARGS" ]; then
    # 尝试从JSON中提取参数
    SCENE_NUM=$(echo "$ARGS" | grep -o '"scene"[[:space:]]*:[[:space:]]*[0-9]*' | sed 's/.*://; s/[" ]//g')
    DESCRIPTION=$(echo "$ARGS" | grep -o '"description"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*://; s/[" ]//g')
fi

# 设置默认值
if [ -z "$SCENE_NUM" ]; then
    SCENE_NUM="1"
fi

if [ -z "$DESCRIPTION" ]; then
    DESCRIPTION="开场场景"
fi

SCENE_ID="scene_${SCENE_NUM}_${TIMESTAMP}"
SCENE_FILE="./scenes/${SCENE_ID}.md"

# 创建场景目录
mkdir -p ./scenes

# 输出JSON格式的结果
cat <<EOF
{
  "SCENE_ID": "$SCENE_ID",
  "SCENE_FILE": "$SCENE_FILE",
  "SCENE_NUM": $SCENE_NUM,
  "DESCRIPTION": "$DESCRIPTION",
  "TIMESTAMP": "$TIMESTAMP",
  "FRAMES": 241,
  "DURATION": 10
}
EOF
#!/bin/bash

# MovieFlow 视频生成脚本
# 生成60秒短视频的执行脚本

# 获取当前日期和时间
CURRENT_DATE=$(date '+%Y-%m-%d')
CURRENT_TIME=$(date '+%H-%M-%S')

# 解析参数
ARGS="$1"
PROJECT_NAME=""
PLATFORM="douyin"
TEMPLATE=""

# 如果传入了JSON参数，解析它
if [ ! -z "$ARGS" ]; then
    # 尝试从JSON中提取参数（简单实现）
    PROJECT_NAME=$(echo "$ARGS" | grep -o '"project"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*://; s/[" ]//g')
    PLATFORM=$(echo "$ARGS" | grep -o '"platform"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*://; s/[" ]//g')
    TEMPLATE=$(echo "$ARGS" | grep -o '"template"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*://; s/[" ]//g')
fi

# 设置默认值
if [ -z "$PROJECT_NAME" ]; then
    PROJECT_NAME="video_${CURRENT_DATE}_${CURRENT_TIME}"
fi

if [ -z "$PLATFORM" ]; then
    PLATFORM="douyin"
fi

# 创建输出目录
OUTPUT_DIR="./videos/${PROJECT_NAME}"
mkdir -p "$OUTPUT_DIR"

# 输出JSON格式的结果
cat <<EOF
{
  "PROJECT_NAME": "$PROJECT_NAME",
  "OUTPUT_PATH": "$OUTPUT_DIR/${PROJECT_NAME}.mp4",
  "PLATFORM": "$PLATFORM",
  "TEMPLATE": "$TEMPLATE",
  "DATE": "$CURRENT_DATE",
  "TIME": "$CURRENT_TIME",
  "SEGMENTS": [
    {
      "id": "segment_1",
      "start": 0,
      "duration": 10,
      "frames": 241
    },
    {
      "id": "segment_2",
      "start": 10,
      "duration": 10,
      "frames": 241
    },
    {
      "id": "segment_3",
      "start": 20,
      "duration": 10,
      "frames": 241
    },
    {
      "id": "segment_4",
      "start": 30,
      "duration": 10,
      "frames": 241
    },
    {
      "id": "segment_5",
      "start": 40,
      "duration": 10,
      "frames": 241
    },
    {
      "id": "segment_6",
      "start": 50,
      "duration": 10,
      "frames": 241
    }
  ]
}
EOF
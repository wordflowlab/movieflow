#!/bin/bash

# MovieFlow 配音设计脚本
# 创建视频配音和音效

# 获取当前时间戳
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

# 解析参数
ARGS="$1"
VOICE_TYPE=""
MOOD=""

# 如果传入了JSON参数，解析它
if [ ! -z "$ARGS" ]; then
    # 尝试从JSON中提取参数
    VOICE_TYPE=$(echo "$ARGS" | grep -o '"voice"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*://; s/[" ]//g')
    MOOD=$(echo "$ARGS" | grep -o '"mood"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*://; s/[" ]//g')
fi

# 设置默认值
if [ -z "$VOICE_TYPE" ]; then
    VOICE_TYPE="幽默男声"
fi

if [ -z "$MOOD" ]; then
    MOOD="轻松愉快"
fi

VOICE_NAME="voice_${TIMESTAMP}"
VOICE_FILE="./voices/${VOICE_NAME}.md"

# 创建配音目录
mkdir -p ./voices

# 输出JSON格式的结果
cat <<EOF
{
  "VOICE_NAME": "$VOICE_NAME",
  "VOICE_FILE": "$VOICE_FILE",
  "VOICE_TYPE": "$VOICE_TYPE",
  "MOOD": "$MOOD",
  "TIMESTAMP": "$TIMESTAMP",
  "DURATION": 60
}
EOF
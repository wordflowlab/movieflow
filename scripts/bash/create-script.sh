#!/bin/bash

# MovieFlow 视频脚本创建
# 创建60秒视频的分镜脚本

# 获取当前时间戳
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

# 解析参数
ARGS="$1"
THEME=""
STYLE=""

# 如果传入了JSON参数，解析它
if [ ! -z "$ARGS" ]; then
    # 尝试从JSON中提取参数
    THEME=$(echo "$ARGS" | grep -o '"theme"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*://; s/[" ]//g')
    STYLE=$(echo "$ARGS" | grep -o '"style"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*://; s/[" ]//g')
fi

# 设置默认值
if [ -z "$THEME" ]; then
    THEME="唐僧说媒"
fi

if [ -z "$STYLE" ]; then
    STYLE="幽默风格"
fi

SCRIPT_NAME="script_${TIMESTAMP}"
SCRIPT_FILE="./scripts/${SCRIPT_NAME}.md"

# 创建脚本目录
mkdir -p ./scripts

# 输出JSON格式的结果
cat <<EOF
{
  "SCRIPT_NAME": "$SCRIPT_NAME",
  "SCRIPT_FILE": "$SCRIPT_FILE",
  "THEME": "$THEME",
  "STYLE": "$STYLE",
  "TIMESTAMP": "$TIMESTAMP"
}
EOF
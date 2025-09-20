#!/bin/bash

# MovieFlow 角色设计脚本
# 创建视频角色形象

# 获取当前时间戳
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

# 解析参数
ARGS="$1"
NAME=""
TYPE=""

# 如果传入了JSON参数，解析它
if [ ! -z "$ARGS" ]; then
    # 尝试从JSON中提取参数
    NAME=$(echo "$ARGS" | grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*://; s/[" ]//g')
    TYPE=$(echo "$ARGS" | grep -o '"type"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*://; s/[" ]//g')
fi

# 设置默认值
if [ -z "$NAME" ]; then
    NAME="Q版唐僧"
fi

if [ -z "$TYPE" ]; then
    TYPE="Q版动画"
fi

CHARACTER_NAME="character_${TIMESTAMP}"
CHARACTER_FILE="./characters/${CHARACTER_NAME}.md"

# 创建角色目录
mkdir -p ./characters

# 输出JSON格式的结果
cat <<EOF
{
  "CHARACTER_NAME": "$CHARACTER_NAME",
  "CHARACTER_FILE": "$CHARACTER_FILE",
  "NAME": "$NAME",
  "TYPE": "$TYPE",
  "TIMESTAMP": "$TIMESTAMP"
}
EOF
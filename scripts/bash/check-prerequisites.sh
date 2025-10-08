#!/usr/bin/env bash

# MovieFlow 前置条件检查脚本
#
# 此脚本为 Spec-Driven Video Generation 工作流提供统一的前置条件检查
#
# 用法: ./check-prerequisites.sh [选项]
#
# 选项:
#   --json              以 JSON 格式输出
#   --require-tasks     要求 tasks.md 存在（用于实施阶段）
#   --include-tasks     在 AVAILABLE_DOCS 列表中包含 tasks.md
#   --paths-only        仅输出路径变量（无验证）
#   --help, -h          显示帮助信息
#
# 输出:
#   JSON 模式: {"FEATURE_DIR":"...", "AVAILABLE_DOCS":["..."]}
#   文本模式: FEATURE_DIR:... \n AVAILABLE_DOCS: \n ✓/✗ file.md
#   仅路径: REPO_ROOT: ... \n BRANCH: ... \n FEATURE_DIR: ... 等

set -e

# 解析命令行参数
JSON_MODE=false
REQUIRE_TASKS=false
INCLUDE_TASKS=false
PATHS_ONLY=false

for arg in "$@"; do
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --require-tasks)
            REQUIRE_TASKS=true
            ;;
        --include-tasks)
            INCLUDE_TASKS=true
            ;;
        --paths-only)
            PATHS_ONLY=true
            ;;
        --help|-h)
            cat << 'EOF'
用法: check-prerequisites.sh [选项]

MovieFlow Spec-Driven Video Generation 工作流的前置条件检查。

选项:
  --json              以 JSON 格式输出
  --require-tasks     要求 tasks.md 存在（用于实施阶段）
  --include-tasks     在 AVAILABLE_DOCS 列表中包含 tasks.md
  --paths-only        仅输出路径变量（无前置条件验证）
  --help, -h          显示此帮助信息

示例:
  # 检查任务前置条件（需要 plan.md）
  ./check-prerequisites.sh --json

  # 检查实施前置条件（需要 plan.md + tasks.md）
  ./check-prerequisites.sh --json --require-tasks --include-tasks

  # 仅获取功能路径（无验证）
  ./check-prerequisites.sh --paths-only

EOF
            exit 0
            ;;
        *)
            echo "错误: 未知选项 '$arg'。使用 --help 查看用法信息。" >&2
            exit 1
            ;;
    esac
done

# 获取仓库根目录
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

# 检查是否在 git 仓库中
HAS_GIT=false
if git rev-parse --git-dir > /dev/null 2>&1; then
    HAS_GIT=true
    CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
else
    CURRENT_BRANCH="main"
fi

# 确定功能目录
# 优先级: 环境变量 SPECIFY_FEATURE > git 分支名 > 扫描 specs/ 目录
if [ -n "$SPECIFY_FEATURE" ]; then
    FEATURE_NAME="$SPECIFY_FEATURE"
elif $HAS_GIT && [[ "$CURRENT_BRANCH" =~ ^[0-9]+-.*$ ]]; then
    FEATURE_NAME="$CURRENT_BRANCH"
else
    # 扫描 specs/ 目录找到最新的功能
    if [ -d "specs" ]; then
        FEATURE_NAME=$(ls -t specs/ | head -n 1)
    else
        FEATURE_NAME=""
    fi
fi

# 设置路径
if [ -n "$FEATURE_NAME" ]; then
    FEATURE_DIR="$REPO_ROOT/specs/$FEATURE_NAME"
    FEATURE_SPEC="$FEATURE_DIR/spec.md"
    IMPL_PLAN="$FEATURE_DIR/plan.md"
    TASKS="$FEATURE_DIR/tasks.md"
else
    FEATURE_DIR=""
    FEATURE_SPEC=""
    IMPL_PLAN=""
    TASKS=""
fi

# 仅路径模式 - 输出路径并退出
if $PATHS_ONLY; then
    if $JSON_MODE; then
        # 最小 JSON 路径负载（未执行验证）
        printf '{"REPO_ROOT":"%s","BRANCH":"%s","FEATURE_DIR":"%s","FEATURE_SPEC":"%s","IMPL_PLAN":"%s","TASKS":"%s"}\n' \
            "$REPO_ROOT" "$CURRENT_BRANCH" "$FEATURE_DIR" "$FEATURE_SPEC" "$IMPL_PLAN" "$TASKS"
    else
        echo "REPO_ROOT: $REPO_ROOT"
        echo "BRANCH: $CURRENT_BRANCH"
        echo "FEATURE_DIR: $FEATURE_DIR"
        echo "FEATURE_SPEC: $FEATURE_SPEC"
        echo "IMPL_PLAN: $IMPL_PLAN"
        echo "TASKS: $TASKS"
    fi
    exit 0
fi

# 验证功能目录存在
if [ -z "$FEATURE_DIR" ] || [ ! -d "$FEATURE_DIR" ]; then
    if $JSON_MODE; then
        printf '{"error":"未找到功能目录。请先运行 /specify 创建项目规格。"}\n' >&2
    else
        echo "错误: 未找到功能目录。" >&2
        echo "请先运行 /specify 创建项目规格。" >&2
    fi
    exit 1
fi

# 检查文档是否存在
AVAILABLE_DOCS=()
MISSING_DOCS=()

# spec.md 始终必需
if [ -f "$FEATURE_SPEC" ]; then
    AVAILABLE_DOCS+=("spec.md")
else
    MISSING_DOCS+=("spec.md")
fi

# plan.md 对于 /clarify 之后的命令是必需的
if [ -f "$IMPL_PLAN" ]; then
    AVAILABLE_DOCS+=("plan.md")
fi

# tasks.md（可选，除非 --require-tasks）
if [ -f "$TASKS" ]; then
    if $INCLUDE_TASKS; then
        AVAILABLE_DOCS+=("tasks.md")
    fi
elif $REQUIRE_TASKS; then
    MISSING_DOCS+=("tasks.md")
fi

# 如果有缺失的必需文档，报告错误
if [ ${#MISSING_DOCS[@]} -gt 0 ]; then
    if $JSON_MODE; then
        # 简单的 JSON 输出（不使用 jq）
        MISSING_JSON=""
        for doc in "${MISSING_DOCS[@]}"; do
            if [ -n "$MISSING_JSON" ]; then
                MISSING_JSON="$MISSING_JSON,\"$doc\""
            else
                MISSING_JSON="\"$doc\""
            fi
        done
        printf '{"error":"缺少必需文档: %s","missing":[%s]}\n' "${MISSING_DOCS[*]}" "$MISSING_JSON" >&2
    else
        echo "错误: 缺少必需文档:" >&2
        for doc in "${MISSING_DOCS[@]}"; do
            echo "  ✗ $doc" >&2
        done
    fi
    exit 1
fi

# 输出结果
if $JSON_MODE; then
    # JSON 格式输出（不使用 jq）
    DOCS_JSON=""
    for doc in "${AVAILABLE_DOCS[@]}"; do
        if [ -n "$DOCS_JSON" ]; then
            DOCS_JSON="$DOCS_JSON,\"$doc\""
        else
            DOCS_JSON="\"$doc\""
        fi
    done
    printf '{"FEATURE_DIR":"%s","FEATURE_SPEC":"%s","IMPL_PLAN":"%s","TASKS":"%s","AVAILABLE_DOCS":[%s]}\n' \
        "$FEATURE_DIR" "$FEATURE_SPEC" "$IMPL_PLAN" "$TASKS" "$DOCS_JSON"
else
    # 文本格式输出
    echo "FEATURE_DIR: $FEATURE_DIR"
    echo "可用文档:"
    for doc in "${AVAILABLE_DOCS[@]}"; do
        echo "  ✓ $doc"
    done
fi

exit 0

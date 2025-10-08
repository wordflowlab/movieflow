#!/usr/bin/env bash
# Create a new video project with directory structure
# Used by /specify command
set -e

JSON_MODE=false
ARGS=()
for arg in "$@"; do
    case "$arg" in
        --json) JSON_MODE=true ;;
        --help|-h) echo "Usage: $0 [--json] <video_description>"; exit 0 ;;
        *) ARGS+=("$arg") ;;
    esac
done

VIDEO_DESCRIPTION="${ARGS[*]}"
if [ -z "$VIDEO_DESCRIPTION" ]; then
    echo "Usage: $0 [--json] <video_description>" >&2
    exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
SPECS_DIR="$REPO_ROOT/specs"
mkdir -p "$SPECS_DIR"

# Find highest numbered directory
HIGHEST=0
if [ -d "$SPECS_DIR" ]; then
    for dir in "$SPECS_DIR"/*; do
        [ -d "$dir" ] || continue
        dirname=$(basename "$dir")
        number=$(echo "$dirname" | grep -o '^[0-9]\+' || echo "0")
        number=$((10#$number))
        if [ "$number" -gt "$HIGHEST" ]; then HIGHEST=$number; fi
    done
fi

NEXT=$((HIGHEST + 1))
PROJECT_NUM=$(printf "%03d" "$NEXT")

# Create project name from description
PROJECT_NAME=$(echo "$VIDEO_DESCRIPTION" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//')
WORDS=$(echo "$PROJECT_NAME" | tr '-' '\n' | grep -v '^$' | head -3 | tr '\n' '-' | sed 's/-$//')
PROJECT_NAME="${PROJECT_NUM}-${WORDS}"

# Create project directory
PROJECT_DIR="$SPECS_DIR/$PROJECT_NAME"
mkdir -p "$PROJECT_DIR"

# Create spec file
SPEC_FILE="$PROJECT_DIR/spec.md"
touch "$SPEC_FILE"

if $JSON_MODE; then
    printf '{"PROJECT_NAME":"%s","SPEC_FILE":"%s","PROJECT_NUM":"%s"}\n' "$PROJECT_NAME" "$SPEC_FILE" "$PROJECT_NUM"
else
    echo "PROJECT_NAME: $PROJECT_NAME"
    echo "SPEC_FILE: $SPEC_FILE"
    echo "PROJECT_NUM: $PROJECT_NUM"
fi
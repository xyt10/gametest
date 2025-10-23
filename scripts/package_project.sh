#!/bin/bash
# 将项目打包为ZIP归档，便于上传到GitHub或发行渠道

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_OUTPUT="${ROOT_DIR}/dist/thunder-fighter.zip"
OUTPUT_PATH="${1:-$DEFAULT_OUTPUT}"

mkdir -p "$(dirname "$OUTPUT_PATH")"

TMP_DIR="$(mktemp -d)"
cleanup() {
    rm -rf "$TMP_DIR"
}
trap cleanup EXIT

copy_path() {
    local source_path="$1"
    local target_name="$2"

    if [ -e "$ROOT_DIR/$source_path" ]; then
        local target_dir
        target_dir="${TMP_DIR}/$(dirname "$target_name")"
        mkdir -p "$target_dir"
        if [ -d "$ROOT_DIR/$source_path" ]; then
            cp -a "$ROOT_DIR/$source_path" "$TMP_DIR/$target_name"
        else
            cp -a "$ROOT_DIR/$source_path" "$TMP_DIR/$target_name"
        fi
    fi
}

copy_path "src" "src"
copy_path "index.html" "index.html"
copy_path "start.sh" "start.sh"
copy_path "README.md" "README.md"
copy_path "QUICK_START.md" "docs/QUICK_START.md"
copy_path "PROJECT_SUMMARY.md" "docs/PROJECT_SUMMARY.md"
copy_path "SHIP_SELECTION_GUIDE.md" "docs/SHIP_SELECTION_GUIDE.md"
copy_path "WINGMAN_SYSTEM.md" "docs/WINGMAN_SYSTEM.md"
copy_path "WINGMAN_QUICKSTART.md" "docs/WINGMAN_QUICKSTART.md"
copy_path "OPTIMIZATION_SUMMARY.md" "docs/OPTIMIZATION_SUMMARY.md"
copy_path "NEW_FEATURES.md" "docs/NEW_FEATURES.md"

pushd "$TMP_DIR" > /dev/null

if command -v zip >/dev/null 2>&1; then
    zip -r "$OUTPUT_PATH" . >/dev/null
else
    tar -czf "${OUTPUT_PATH%.zip}.tar.gz" .
fi

popd > /dev/null

echo "项目已成功打包: $OUTPUT_PATH"

#!/bin/bash
# 将项目打包为ZIP归档,便于上传到GitHub或发行渠道

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
        cp -a "$ROOT_DIR/$source_path" "$TMP_DIR/$target_name"
    else
        echo "警告: 找不到 $source_path, 已跳过" >&2
    fi
}

ASSETS=(
    "src::src"
    "index.html::index.html"
    "start.sh::start.sh"
    "README.md::README.md"
)

DOCS=(
    "QUICK_START.md::docs/QUICK_START.md"
    "PROJECT_SUMMARY.md::docs/PROJECT_SUMMARY.md"
    "SHIP_SELECTION_GUIDE.md::docs/SHIP_SELECTION_GUIDE.md"
    "WINGMAN_SYSTEM.md::docs/WINGMAN_SYSTEM.md"
    "WINGMAN_QUICKSTART.md::docs/WINGMAN_QUICKSTART.md"
    "OPTIMIZATION_SUMMARY.md::docs/OPTIMIZATION_SUMMARY.md"
    "NEW_FEATURES.md::docs/NEW_FEATURES.md"
    "TESTING_GUIDE.md::docs/TESTING_GUIDE.md"
    "README_PRO.md::docs/README_PRO.md"
    "CHANGELOG_v2.md::docs/CHANGELOG_v2.md"
    "UPLOAD_GUIDE.md::docs/UPLOAD_GUIDE.md"
)

for entry in "${ASSETS[@]}"; do
    IFS='::' read -r source target <<<"$entry"
    copy_path "$source" "$target"
done

for entry in "${DOCS[@]}"; do
    IFS='::' read -r source target <<<"$entry"
    copy_path "$source" "$target"
done

pushd "$TMP_DIR" > /dev/null

if command -v zip >/dev/null 2>&1; then
    zip -r "$OUTPUT_PATH" . >/dev/null
    echo "已生成ZIP归档: $OUTPUT_PATH"
else
    fallback_tar="${OUTPUT_PATH%.zip}.tar.gz"
    tar -czf "$fallback_tar" .
    echo "当前环境缺少zip命令,已生成Tar归档: $fallback_tar"
fi

popd > /dev/null

if [ -f "$OUTPUT_PATH" ]; then
    echo "项目已成功打包: $OUTPUT_PATH"
fi

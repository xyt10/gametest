#!/bin/bash
# 快速启动脚本

echo "=========================================="
echo "  雷霆战机 - Thunder Fighter"
echo "=========================================="
echo ""
echo "正在启动游戏服务器..."
echo ""

# 检查Python是否安装
if command -v python3 &> /dev/null; then
    echo "使用 Python 3 启动服务器..."
    echo "游戏地址: http://localhost:8080"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    echo "使用 Python 2 启动服务器..."
    echo "游戏地址: http://localhost:8080"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python -m SimpleHTTPServer 8080
elif command -v php &> /dev/null; then
    echo "使用 PHP 启动服务器..."
    echo "游戏地址: http://localhost:8080"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    php -S localhost:8080
else
    echo "错误: 未找到 Python 或 PHP"
    echo "请手动安装 Python 3 或使用其他HTTP服务器"
    exit 1
fi

#!/bin/bash

echo "====================================="
echo "Building and starting Uniswap Nginx Proxy"
echo "====================================="

# 确保脚本可执行
chmod +x "$0"

# 切换到脚本所在目录
cd "$(dirname "$0")"

echo "Building Docker container..."
docker-compose build

echo "Starting Docker container..."
docker-compose up -d

echo "====================================="
echo "Nginx代理服务器已启动!"
echo "访问以下地址进行测试:"
echo "- 欢迎页面: http://localhost:3080/welcome"
echo "- 测试页面: http://localhost:3080/test"
echo "- Uniswap交换页: http://localhost:3080/swap"
echo "====================================="

echo "查看日志: docker logs uniswap-nginx-proxy -f" 
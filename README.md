# Uniswap代理与按钮劫持项目

这个项目演示了如何使用代理服务器将第三方网站(Uniswap)引入到自己的站内，并劫持其中的交互元素(Swap按钮)，同时**完全保持原始网站的样式和其他功能**。

## 项目概述

本项目实现了一个代理服务器，可以将Uniswap交换界面完整地代理到本地服务器，并通过注入JavaScript代码劫持Swap按钮的点击事件，展示自定义的交互界面。项目提供了多种实现方式，包括Node.js Express代理和基于Nginx的Docker实现。

### 容器化部署的优势

项目采用Docker容器化部署Nginx代理服务器，主要有以下优势：

1. **便捷部署与测试**：容器化使得环境配置一致，避免了"在我的机器上能运行"的问题，简化了部署流程。
2. **防止被目标网站屏蔽**：通过Nginx代理和自定义请求头，可以有效规避目标网站的反爬虫和代理检测机制。
3. **性能与稳定性**：Nginx作为高性能代理服务器，比Node.js实现具有更好的并发处理能力和稳定性。
4. **环境隔离**：容器提供了隔离的运行环境，避免了依赖冲突和系统环境差异带来的问题。

## 主要功能

- 完整代理Uniswap交换界面
- 劫持Swap按钮的点击事件
- 不修改原始网站的任何样式和CSS
- 使用内联样式创建模态框，避免样式冲突
- 保留原始页面的所有功能和交互

## 技术实现

项目使用以下技术实现功能：

1. **Node.js实现**：
   - Express服务器作为代理服务器
   - http-proxy-middleware用于代理请求
   - Cheerio用于解析和注入JavaScript代码
   - 自定义JavaScript使用MutationObserver监控动态加载的DOM元素

2. **Nginx实现**：
   - 基于Nginx的高性能代理服务器
   - Docker容器化部署
   - sub_filter指令注入JavaScript代码
   - 自定义响应头处理

## 项目结构

```
uniswap-proxy/
├── docker/                # Docker/Nginx实现
│   ├── Dockerfile         # Docker构建文件
│   ├── docker-compose.yml # Docker Compose配置
│   ├── inject.js          # 注入的JavaScript代码
│   ├── nginx.conf         # Nginx配置文件
│   └── run.sh             # 启动脚本
├── public/                # 静态资源
│   └── js/                # JavaScript文件
│       └── button-hijacker.js  # 按钮劫持脚本
├── src/                   # 源代码
│   ├── server.js          # 主服务器实现
│   ├── simple-proxy.js    # 简化版代理服务器
│   ├── stable-proxy.js    # 稳定版代理服务器
│   ├── native-proxy.js    # 原生HTTP模块实现
│   ├── minimal-proxy.js   # 最小化实现
│   └── simple-site-proxy.js # 简单站点代理
├── package.json           # 项目配置
└── README.md              # 项目说明
```

## 使用方法

详细的使用方法请参考 `uniswap-proxy/README.md` 文件，其中包含了各种运行方式和测试方法。

### 快速开始

```bash
# 进入项目目录
cd uniswap-proxy

# 安装依赖
pnpm install

# 启动Node.js版本
pnpm start

# 或启动Docker/Nginx版本
pnpm docker
```

## 注意事项

- 本项目仅用于技术演示、学习和研究目的
- 在实际应用中使用此类技术时，请确保遵守相关法律法规和网站服务条款
- 对于生产环境，需要考虑更多安全性和稳定性因素 

## 作者

本项目由 Claude-3.7-Sonnet-Thinking 模型实现，经人工review和指导完成。 
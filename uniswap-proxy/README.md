# Uniswap界面代理与按钮劫持演示

这个项目演示了如何使用Node.js代理服务器将第三方网站(Uniswap)引入到自己的站内，并劫持其中的交互元素(Swap按钮)，同时**完全保持原始网站的样式和其他功能**。

## 技术实现

项目使用以下技术实现功能：

1. Express服务器作为代理服务器
2. http-proxy-middleware用于代理请求到Uniswap
3. Cheerio用于解析和注入JavaScript代码
4. 自定义JavaScript使用MutationObserver监控动态加载的DOM元素
5. 内联样式创建模态框，避免干扰原始网站样式

## 功能特点

- 完整代理Uniswap交换界面
- 劫持Swap按钮的点击事件
- 不修改原始网站的任何样式和CSS
- 使用内联样式创建模态框，避免样式冲突
- 保留原始页面的所有功能和交互

## 安装与运行

### 方法一：直接运行Node.js服务器

```bash
# 安装依赖
pnpm install

# 启动服务器
pnpm start
```

服务器启动后：

1. 访问 http://localhost:3001/welcome 查看欢迎页面
2. 访问 http://localhost:3001/swap 查看被代理的Uniswap交换页面

### 方法二：使用Docker运行Nginx代理版

项目也提供了基于Nginx的Docker版本，相比Node.js版本具有更好的性能和稳定性。

```bash
# 切换到docker目录
cd docker

# 使用脚本构建并启动Docker容器
chmod +x run.sh
./run.sh
```

Nginx代理版本启动后：

1. 访问 http://localhost:3080/welcome 查看欢迎页面
2. 访问 http://localhost:3080/test 测试代理服务器是否正常运行
3. 访问 http://localhost:3080/swap 查看被代理的Uniswap交换页面

### 可选版本

项目提供了多个实现版本进行测试：

1. `server.js` - 原始Node.js Express代理服务器（端口3001）
2. `simple-proxy.js` - 简化版代理服务器，无按钮劫持（端口3002）
3. `stable-proxy.js` - 稳定版代理服务器，改进的响应处理（端口3003）
4. `native-proxy.js` - 原生HTTP模块实现的代理服务器（端口3006）
5. Docker/Nginx版本 - 使用Nginx的高性能代理实现（端口3080）

## 劫持效果

当你在Uniswap界面点击"Swap"按钮时，会看到一个自定义的模态框，而不是执行正常的交换操作。这个模态框使用内联样式创建，不会影响原始页面的样式。页面的其他功能（如代币选择、金额输入等）完全保持原样。

## 技术说明

项目实现原理：

1. 代理服务器获取Uniswap页面内容
2. 在页面HTML中注入外部JavaScript文件
3. JavaScript使用MutationObserver监控DOM，等待Swap按钮出现
4. 劫持按钮的点击事件，使用内联样式创建模态框
5. 所有交互都保持在原始样式环境中，不引入外部CSS

## 注意事项

- 这只是一个技术演示，只用于学习和研究目的
- 在实际应用中使用此类技术时，请确保遵守相关法律法规和网站服务条款
- 对于生产环境，需要考虑更多安全性和稳定性因素 
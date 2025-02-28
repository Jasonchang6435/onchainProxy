/**
 * 极简版代理服务器
 * 尽可能简单地实现代理功能，避免复杂处理导致的崩溃
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3004; // 使用一个新端口
const TARGET_URL = 'https://app.uniswap.org';

// 提供静态文件
app.use(express.static(path.join(__dirname, '../public')));

// 测试路由
app.get('/test', (req, res) => {
  res.send('极简版代理服务器正常运行！');
});

// 简单的欢迎页面
app.get('/welcome', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>极简版Uniswap代理</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #ff007a; }
          .container { max-width: 800px; margin: 0 auto; }
          .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #ff007a; 
            color: white; 
            text-decoration: none;
            border-radius: 20px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>极简版Uniswap代理演示</h1>
          <p>这是一个更加稳定的极简版本，避免过多处理导致崩溃。</p>
          <a href="/swap" class="button">前往Uniswap交换页面</a>
          <p>如果有问题，请先测试代理服务器是否正常：<a href="/test">测试链接</a></p>
        </div>
      </body>
    </html>
  `);
});

// 使用更简单的方式注入JS的路由
app.get('/inject.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    // 极简按钮劫持脚本
    console.log("极简版劫持脚本已加载");
    
    // 等待DOM加载
    document.addEventListener('DOMContentLoaded', () => {
      console.log("DOM已加载，开始监听");
      setupObserver();
    });
    
    // 如果DOM已经加载，立即初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      console.log("DOM已加载，立即监听");
      setTimeout(setupObserver, 1000);
    }
    
    // 设置观察器
    function setupObserver() {
      // 监视DOM变化
      const observer = new MutationObserver(() => {
        // 查找输入代币按钮
        const inputButton = document.querySelector('[data-testid="input-button"]');
        if (inputButton && !inputButton._hijacked) {
          inputButton._hijacked = true;
          console.log("已劫持输入代币按钮");
          
          inputButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            alert("输入代币选择已被劫持！");
            return false;
          }, true);
        }
        
        // 查找输出代币按钮
        const outputButton = document.querySelector('[data-testid="output-button"]');
        if (outputButton && !outputButton._hijacked) {
          outputButton._hijacked = true;
          console.log("已劫持输出代币按钮");
          
          outputButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            alert("输出代币选择已被劫持！");
            return false;
          }, true);
        }
      });
      
      // 开始观察DOM
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
      console.log("DOM观察器已启动");
    }
  `);
});

// 配置代理，使用最简单的方式而不修改响应
const proxy = createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  // 不自定义处理响应
  selfHandleResponse: false,
  // 添加请求头
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('Origin', TARGET_URL);
    proxyReq.setHeader('Referer', TARGET_URL);
  },
  // 简单的错误处理
  onError: (err, req, res) => {
    console.error("代理错误:", err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('代理服务器错误: ' + err.message);
  }
});

// 中间件 - 在HTML响应中注入我们的脚本链接
app.use((req, res, next) => {
  // 保存原始的end方法
  const originalEnd = res.end;
  
  // 只处理HTML响应
  res.end = function(chunk, encoding) {
    // 检查这是否可能是HTML响应
    if (res.getHeader('content-type') && 
        res.getHeader('content-type').includes('text/html') && 
        chunk) {
      
      // 转换为字符串
      let body = chunk.toString('utf8');
      
      // 简单的字符串替换，在</head>前注入脚本
      if (body.includes('</head>')) {
        body = body.replace('</head>', '<script src="/inject.js"></script></head>');
        
        // 重置内容长度
        res.setHeader('Content-Length', Buffer.byteLength(body));
        
        // 调用原始的end方法，传递修改后的响应
        return originalEnd.call(this, body, encoding);
      }
    }
    
    // 对于非HTML或无法修改的响应，保持原样
    return originalEnd.apply(this, arguments);
  };
  
  next();
});

// 应用代理中间件
app.use('/', proxy);

// 启动服务器
app.listen(PORT, () => {
  console.log(`极简版代理服务器运行在 http://localhost:${PORT}`);
  console.log(`访问 http://localhost:${PORT}/welcome 查看欢迎页面`);
  console.log(`访问 http://localhost:${PORT}/swap 访问Uniswap交换页面`);
}); 
/**
 * 原生HTTP模块代理服务器
 * 使用Node.js内置http模块实现代理，避免使用第三方库可能导致的崩溃
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const express = require('express');

const app = express();
const PORT = 3006;
const TARGET_HOST = 'app.uniswap.org';

// 提供静态文件
app.use(express.static(path.join(__dirname, '../public')));

// 测试路由
app.get('/test', (req, res) => {
  res.send('原生HTTP代理服务器正常运行！');
});

// 欢迎页面
app.get('/welcome', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>原生HTTP代理</title>
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
          <h1>原生HTTP代理服务器</h1>
          <p>这个版本使用Node.js原生HTTP模块实现代理，避免使用可能有问题的第三方库。</p>
          <a href="/swap" class="button">前往Uniswap交换页面</a>
          <p>如果有问题，请先测试代理服务器是否正常：<a href="/test">测试链接</a></p>
        </div>
      </body>
    </html>
  `);
});

// 注入脚本
app.get('/native-inject.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    // 原生HTTP代理版按钮劫持脚本
    console.log("原生HTTP代理版劫持脚本已加载", new Date().toISOString());
    
    // 等待DOM加载
    document.addEventListener('DOMContentLoaded', () => {
      console.log("DOM已加载，开始监听");
      hijackTokenButtons();
    });
    
    // 如果DOM已经加载，立即初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      console.log("DOM已加载，立即监听");
      setTimeout(hijackTokenButtons, 1000);
    }
    
    // 监控并劫持代币选择按钮
    function hijackTokenButtons() {
      // 设置MutationObserver监听DOM变化
      const observer = new MutationObserver(() => {
        checkAndHijackButtons();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // 立即检查一次
      checkAndHijackButtons();
      
      // 每5秒强制检查一次
      setInterval(checkAndHijackButtons, 5000);
      
      console.log("按钮监控已启动");
    }
    
    // 检查并劫持按钮
    function checkAndHijackButtons() {
      // 查找输入代币按钮
      const inputButton = document.querySelector('[data-testid="input-button"]');
      if (inputButton && !inputButton._hijacked) {
        inputButton._hijacked = true;
        console.log("已劫持输入代币按钮");
        
        // 保存原始点击事件处理函数
        const originalClick = inputButton.onclick;
        
        // 添加点击事件处理函数
        inputButton.addEventListener('click', (e) => {
          console.log("输入代币按钮被点击");
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
        
        // 添加点击事件处理函数
        outputButton.addEventListener('click', (e) => {
          console.log("输出代币按钮被点击");
          e.preventDefault();
          e.stopPropagation();
          
          alert("输出代币选择已被劫持！");
          return false;
        }, true);
      }
    }
  `);
});

// 创建代理服务器
const server = http.createServer((req, res) => {
  // 处理静态路由
  if (req.url === '/test' || req.url === '/welcome' || req.url === '/native-inject.js' || req.url.startsWith('/js/') || req.url.startsWith('/css/')) {
    return app(req, res);
  }
  
  console.log(`请求: ${req.method} ${req.url}`);
  
  // 解析目标URL
  const targetUrl = url.parse(req.url);
  
  // 设置转发选项
  const options = {
    hostname: TARGET_HOST,
    port: 443,
    path: targetUrl.path,
    method: req.method,
    headers: {
      ...req.headers,
      host: TARGET_HOST,
      origin: `https://${TARGET_HOST}`,
      referer: `https://${TARGET_HOST}/`,
    }
  };
  
  // 删除可能导致问题的头部
  delete options.headers['connection'];
  delete options.headers['host'];
  
  // 创建HTTPS请求
  const proxy = https.request(options, (proxyRes) => {
    // 复制返回头
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    // 设置状态码
    res.writeHead(proxyRes.statusCode);
    
    // 如果是HTML响应，修改内容
    if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
      let body = '';
      
      proxyRes.on('data', (chunk) => {
        body += chunk;
      });
      
      proxyRes.on('end', () => {
        // 在HTML中注入脚本
        if (body.includes('</head>')) {
          body = body.replace('</head>', '<script src="/native-inject.js"></script></head>');
        }
        
        // 发送修改后的响应
        res.end(body);
      });
    } else {
      // 直接转发响应
      proxyRes.pipe(res);
    }
  });
  
  // 错误处理
  proxy.on('error', (err) => {
    console.error('代理错误:', err);
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end(`代理错误: ${err.message}`);
  });
  
  // 如果有请求体，转发它
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.pipe(proxy);
  } else {
    proxy.end();
  }
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`原生HTTP代理服务器运行在 http://localhost:${PORT}`);
  console.log(`访问 http://localhost:${PORT}/welcome 查看欢迎页面`);
  console.log(`访问 http://localhost:${PORT}/swap 访问Uniswap交换页面`);
}); 
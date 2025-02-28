/**
 * 简单网站代理测试
 * 用于测试代理其他网站是否也会出现段错误
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3005;
const TARGET_URL = 'http://example.com'; // 简单网站用于测试

// 测试路由
app.get('/test', (req, res) => {
  res.send('简单网站代理测试服务器正常运行！');
});

// 简单的欢迎页面
app.get('/welcome', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>简单网站代理测试</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #0066cc; }
          .container { max-width: 800px; margin: 0 auto; }
          .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #0066cc; 
            color: white; 
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>简单网站代理测试</h1>
          <p>这个页面用来测试代理其他网站是否会出现段错误。</p>
          <p>我们将代理 example.com 而不是 Uniswap。</p>
          <a href="/" class="button">访问被代理的网站</a>
          <p>如果有问题，请先测试代理服务器是否正常：<a href="/test">测试链接</a></p>
        </div>
      </body>
    </html>
  `);
});

// 配置代理
const proxy = createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`请求: ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`响应: ${proxyRes.statusCode} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error("代理错误:", err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('代理服务器错误: ' + err.message);
  }
});

// 应用代理中间件
app.use('/', proxy);

// 启动服务器
app.listen(PORT, () => {
  console.log(`简单网站代理测试服务器运行在 http://localhost:${PORT}`);
  console.log(`访问 http://localhost:${PORT}/welcome 查看欢迎页面`);
  console.log(`访问 http://localhost:${PORT}/ 访问被代理的网站 (example.com)`);
}); 
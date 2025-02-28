/**
 * 简单代理服务器
 * 这个脚本仅用于测试，不做任何HTML修改，只是单纯地代理请求
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3002; // 使用不同的端口
const TARGET_URL = 'https://app.uniswap.org';

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 测试路由
app.get('/test', (req, res) => {
  res.send('简单代理服务器正常运行！');
});

// 简单代理中间件，不修改任何内容
app.use('/', createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  ws: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('Origin', TARGET_URL);
    proxyReq.setHeader('Referer', TARGET_URL);
  }
}));

// 启动服务器
app.listen(PORT, () => {
  console.log(`简单代理服务器运行在 http://localhost:${PORT}`);
  console.log(`这个服务器只做纯代理，不修改任何内容`);
  console.log(`访问 http://localhost:${PORT}/test 测试服务器是否正常运行`);
  console.log(`访问 http://localhost:${PORT}/swap 直接代理到Uniswap交换页面`);
}); 
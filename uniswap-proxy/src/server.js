const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = 3001;
const TARGET_URL = 'https://app.uniswap.org';

// 提供静态文件
app.use(express.static(path.join(__dirname, '../public')));

// 添加基本日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 注入自定义JS的中间件
function modifyResponse(proxyRes, req, res) {
  console.log(`[Proxy Response] URL: ${req.url}, Status: ${proxyRes.statusCode}`);
  
  // 记录响应头
  console.log(`[Response Headers]`, proxyRes.headers);
  
  const bodyChunks = [];
  proxyRes.on('data', chunk => {
    bodyChunks.push(chunk);
  });
  
  return proxyRes.on('end', () => {
    try {
      let body = Buffer.concat(bodyChunks).toString('utf8');
      
      // 只修改HTML响应
      if (proxyRes.headers['content-type']?.includes('text/html')) {
        try {
          console.log(`[Modifying HTML] URL: ${req.url}`);
          const $ = cheerio.load(body);
          
          // 注入外部JS文件，而不是使用内联脚本
          $('head').append(`
            <script src="/js/button-hijacker.js"></script>
          `);
          
          body = $.html();
          console.log(`[HTML Modified Successfully]`);
        } catch (error) {
          console.error('[Error modifying HTML]', error);
        }
      }
      
      // 设置正确的响应头
      Object.keys(proxyRes.headers).forEach(key => {
        // 忽略某些可能导致问题的头部
        if (key !== 'content-length' && key !== 'transfer-encoding') {
          res.setHeader(key, proxyRes.headers[key]);
        }
      });
      
      // 设置内容类型
      if (proxyRes.headers['content-type']) {
        res.setHeader('Content-Type', proxyRes.headers['content-type']);
      }
      
      console.log(`[Sending Response] URL: ${req.url}, Size: ${body.length} bytes`);
      res.end(body);
    } catch (error) {
      console.error('[Error processing response]', error);
      // 在出错时返回一个简单的错误页面
      res.status(500).send('代理服务器出现错误，请查看服务器日志');
    }
  });
}

// 错误处理函数
function handleProxyError(err, req, res) {
  console.error('[Proxy Error]', err);
  res.status(500).send('代理服务器连接目标网站时出错');
}

// 设置代理中间件，添加超时设置
app.use('/', createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  selfHandleResponse: true, // 自行处理响应以便修改
  onProxyRes: modifyResponse,
  onError: handleProxyError,
  // 修复Websocket连接
  ws: true,
  // 设置超时时间
  proxyTimeout: 30000,  // 30秒
  timeout: 30000,       // 30秒
  // 保留原始请求头
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  },
  // 添加可能需要的CORS头
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy Request] URL: ${req.url}`);
    proxyReq.setHeader('Origin', TARGET_URL);
    proxyReq.setHeader('Referer', TARGET_URL);
  }
}));

// 添加一个简单的测试路由
app.get('/test', (req, res) => {
  res.send('代理服务器工作正常！');
});

// 创建一个欢迎页面
app.get('/welcome', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Uniswap代理</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #ff007a; } /* Uniswap粉色 */
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
          <h1>Uniswap代理演示</h1>
          <p>这是一个演示如何代理Uniswap界面并劫持交换按钮的示例。</p>
          <p>点击下面的按钮访问代理的Uniswap页面：</p>
          <a href="/swap" class="button">前往Uniswap交换页面</a>
          <p><b>说明：</b> 页面中的"Swap"按钮已被劫持，点击后会显示一个自定义的提示，而不是执行正常的交换操作。所有原始样式和功能保持不变。</p>
          <p>如果加载有问题，请先测试代理服务器是否正常：<a href="/test">测试链接</a></p>
        </div>
      </body>
    </html>
  `);
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).send('服务器出现错误，请查看日志');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
  console.log(`访问 http://localhost:${PORT}/welcome 查看欢迎页面`);
  console.log(`访问 http://localhost:${PORT}/swap 查看被代理的Uniswap交换页面`);
  console.log(`访问 http://localhost:${PORT}/test 测试服务器是否正常运行`);
}); 
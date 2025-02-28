/**
 * 稳定版代理服务器
 * 尝试使用更简单的方式代理和劫持按钮
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3003; // 使用不同的端口
const TARGET_URL = 'https://app.uniswap.org';

// 提供静态文件
app.use(express.static(path.join(__dirname, '../public')));

// 测试路由
app.get('/test', (req, res) => {
  res.send('稳定版代理服务器正常运行！');
});

// 欢迎页面
app.get('/welcome', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>稳定版Uniswap代理</title>
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
          <h1>稳定版Uniswap代理演示</h1>
          <p>这是一个更稳定的版本，尝试解决页面加载问题。</p>
          <p>我们提供了3种不同的代理方式：</p>
          <ul>
            <li><a href="http://localhost:3001/swap">完整劫持版本 (端口 3001)</a></li>
            <li><a href="http://localhost:3002/swap">纯代理版本 (端口 3002)</a></li>
            <li><a href="http://localhost:3003/swap">稳定版本 (端口 3003)</a></li>
          </ul>
          <p>如果其他版本不工作，请尝试这个稳定版本。</p>
          <a href="/swap" class="button">前往Uniswap交换页面 (稳定版)</a>
          <p>如果有问题，请先测试代理服务器是否正常：<a href="/test">测试链接</a></p>
        </div>
      </body>
    </html>
  `);
});

// 代理中间件
app.use('/', createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  ws: true,
  onProxyRes: function(proxyRes, req, res) {
    // 只对HTML响应注入我们的脚本
    if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
      delete proxyRes.headers['content-length']; // 必须删除，否则响应会被截断
      
      // 使用原始头部
      Object.keys(proxyRes.headers).forEach(function(key) {
        if (key !== 'transfer-encoding') { // 避免冲突
          res.setHeader(key, proxyRes.headers[key]);
        }
      });
      
      // 设置为分块传输编码
      res.setHeader('Transfer-Encoding', 'chunked');
      
      // 保留原始数据
      let originalBody = '';
      proxyRes.on('data', function(data) {
        originalBody += data.toString('utf8');
      });
      
      proxyRes.on('end', function() {
        // 在</body>前注入我们的脚本
        let modifiedBody = originalBody;
        
        if (originalBody.includes('</body>')) {
          modifiedBody = originalBody.replace('</body>', `
            <script>
              // 简单的按钮劫持脚本，直接内联以避免加载问题
              console.log("内联劫持脚本已加载");
              
              // 监视DOM变化
              const observer = new MutationObserver(() => {
                const swapButton = document.querySelector('button[data-testid="swap-button"]');
                if (swapButton && !swapButton.dataset.hijacked) {
                  swapButton.dataset.hijacked = "true";
                  console.log("找到并劫持Swap按钮");
                  
                  swapButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    alert("Swap按钮已被劫持! 这是稳定版本的简化演示。");
                    return false;
                  }, true);
                }
              });
              
              // 开始观察DOM
              document.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.body, { childList: true, subtree: true });
              });
              
              // 如果DOM已经加载完成
              if (document.readyState === 'complete' || document.readyState === 'interactive') {
                observer.observe(document.body, { childList: true, subtree: true });
              }
            </script>
          </body>`);
        }
        
        // 发送修改后的响应
        res.end(modifiedBody);
      });
    } else {
      // 非HTML内容直接转发
      proxyRes.pipe(res);
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    // 添加正确的请求头
    proxyReq.setHeader('Origin', TARGET_URL);
    proxyReq.setHeader('Referer', TARGET_URL);
  },
  onError: (err, req, res) => {
    console.error("代理错误:", err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('代理服务器错误: ' + err.message);
  }
}));

// 启动服务器
app.listen(PORT, () => {
  console.log(`稳定版代理服务器运行在 http://localhost:${PORT}`);
  console.log(`访问 http://localhost:${PORT}/welcome 查看欢迎页面`);
  console.log(`访问 http://localhost:${PORT}/swap 访问Uniswap交换页面`);
}); 
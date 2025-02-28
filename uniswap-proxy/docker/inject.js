/**
 * Uniswap按钮劫持脚本 - Nginx代理版本
 * 用于劫持Uniswap界面上的按钮点击事件，并显示自定义内容
 */

console.log("[Button Hijacker] 脚本已加载 - " + new Date().toISOString());

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  console.log("[Button Hijacker] DOM已加载，初始化按钮劫持");
  initButtonHijacking();
});

// 如果DOM已经加载完成，立即初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log("[Button Hijacker] 页面已经加载，立即初始化");
  setTimeout(initButtonHijacking, 1000);
}

function initButtonHijacking() {
  console.log("[Button Hijacker] 开始初始化按钮劫持");
  
  // 使用MutationObserver监听DOM变化，以便找到动态加载的按钮
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        checkForSwapButton();
      }
    }
  });
  
  // 配置观察器
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 立即检查一次
  checkForSwapButton();
  
  // 每秒强制检查一次，确保不会错过按钮
  setInterval(checkForSwapButton, 1000);
  
  console.log("[Button Hijacker] 按钮监控已启动");
}

// 检查并劫持Swap按钮
function checkForSwapButton() {
  // 查找主Swap按钮
  const swapButton = document.querySelector('button[data-testid="swap-button"]');
  
  // 如果找到Swap按钮且尚未被劫持
  if (swapButton && !swapButton._hijacked) {
    console.log("[Button Hijacker] 找到Swap按钮，劫持它!");
    
    // 标记按钮已被劫持，避免重复绑定
    swapButton._hijacked = true;
    
    // 添加点击事件监听器，使用捕获阶段确保在原始事件处理前执行
    swapButton.addEventListener('click', handleSwapButtonClick, true);
  }
  
  // 查找代币选择按钮
  const inputTokenButton = document.querySelector('[data-testid="input-button"]');
  if (inputTokenButton && !inputTokenButton._hijacked) {
    console.log("[Button Hijacker] 找到输入代币按钮，劫持它");
    inputTokenButton._hijacked = true;
    
    inputTokenButton.addEventListener('click', (e) => {
      console.log("[Button Hijacker] 输入代币按钮被点击");
      e.preventDefault();
      e.stopPropagation();
      
      // 显示自定义弹窗
      showCustomMessage("输入代币选择已被劫持！");
      return false;
    }, true);
  }
  
  const outputTokenButton = document.querySelector('[data-testid="output-button"]');
  if (outputTokenButton && !outputTokenButton._hijacked) {
    console.log("[Button Hijacker] 找到输出代币按钮，劫持它");
    outputTokenButton._hijacked = true;
    
    outputTokenButton.addEventListener('click', (e) => {
      console.log("[Button Hijacker] 输出代币按钮被点击");
      e.preventDefault();
      e.stopPropagation();
      
      // 显示自定义弹窗
      showCustomMessage("输出代币选择已被劫持！");
      return false;
    }, true);
  }
}

// 处理Swap按钮点击事件
function handleSwapButtonClick(event) {
  console.log("[Button Hijacker] Swap按钮被点击，阻止默认行为并显示自定义模态框");
  
  // 阻止事件传播和默认行为
  event.preventDefault();
  event.stopPropagation();
  
  // 获取交换信息
  const fromTokenInfo = getFromTokenInfo();
  const toTokenInfo = getToTokenInfo();
  
  // 显示自定义模态框
  showCustomModal(fromTokenInfo, toTokenInfo);
  
  // 返回false以阻止事件传播
  return false;
}

// 获取输入代币信息
function getFromTokenInfo() {
  console.log("[Button Hijacker] 尝试获取输入代币信息");
  try {
    const tokenElement = document.querySelector('[data-testid="input-button"]');
    if (tokenElement) {
      const symbol = tokenElement.textContent.trim();
      console.log("[Button Hijacker] 找到输入代币符号:", symbol);
      
      // 尝试获取输入金额
      const inputElement = document.querySelector('input[data-testid="token-amount-input"]');
      const amount = inputElement ? inputElement.value : "未知数量";
      console.log("[Button Hijacker] 找到输入代币数量:", amount);
      
      return { symbol, amount };
    }
  } catch (error) {
    console.error("[Button Hijacker] 获取输入代币信息时出错:", error);
  }
  
  return { symbol: "未知代币", amount: "未知数量" };
}

// 获取输出代币信息
function getToTokenInfo() {
  console.log("[Button Hijacker] 尝试获取输出代币信息");
  try {
    const tokenElement = document.querySelector('[data-testid="output-button"]');
    if (tokenElement) {
      const symbol = tokenElement.textContent.trim();
      console.log("[Button Hijacker] 找到输出代币符号:", symbol);
      
      // 尝试获取输出金额
      const outputElement = document.querySelector('input[data-testid="token-amount-output"]');
      const amount = outputElement ? outputElement.value : "未知数量";
      console.log("[Button Hijacker] 找到输出代币数量:", amount);
      
      return { symbol, amount };
    }
  } catch (error) {
    console.error("[Button Hijacker] 获取输出代币信息时出错:", error);
  }
  
  return { symbol: "未知代币", amount: "未知数量" };
}

// 显示自定义模态框
function showCustomModal(fromTokenInfo, toTokenInfo) {
  console.log("[Button Hijacker] 显示自定义模态框", fromTokenInfo, toTokenInfo);
  
  // 创建模态框容器
  const modal = document.createElement('div');
  modal.id = 'custom-swap-modal';
  
  // 使用内联样式确保不影响原始样式
  Object.assign(modal.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '9999'
  });
  
  // 创建模态框内容
  const modalContent = document.createElement('div');
  Object.assign(modalContent.style, {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '30px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
    color: '#000',
    textAlign: 'center'
  });
  
  // 创建标题
  const title = document.createElement('h2');
  title.textContent = '确认交换';
  Object.assign(title.style, {
    color: '#ff007a',
    marginBottom: '20px',
    fontSize: '24px'
  });
  
  // 创建交换信息
  const swapInfo = document.createElement('div');
  Object.assign(swapInfo.style, {
    margin: '20px 0',
    padding: '15px',
    backgroundColor: '#f7f8fa',
    borderRadius: '12px'
  });
  
  swapInfo.innerHTML = `
    <p style="margin: 10px 0; font-size: 16px;">
      <strong>从:</strong> ${fromTokenInfo.amount} ${fromTokenInfo.symbol}
    </p>
    <p style="margin: 10px 0; font-size: 16px;">
      <strong>到:</strong> ${toTokenInfo.amount} ${toTokenInfo.symbol}
    </p>
  `;
  
  // 创建按钮容器
  const buttonContainer = document.createElement('div');
  Object.assign(buttonContainer.style, {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '25px'
  });
  
  // 创建取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  Object.assign(cancelButton.style, {
    padding: '12px 24px',
    borderRadius: '12px',
    backgroundColor: '#f7f8fa',
    color: '#000',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    flex: '1',
    marginRight: '10px'
  });
  
  // 创建确认按钮
  const confirmButton = document.createElement('button');
  confirmButton.textContent = '确认交换';
  Object.assign(confirmButton.style, {
    padding: '12px 24px',
    borderRadius: '12px',
    backgroundColor: '#ff007a',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    flex: '1',
    marginLeft: '10px'
  });
  
  // 添加按钮事件
  cancelButton.onclick = () => {
    console.log("[Button Hijacker] 用户点击取消按钮");
    document.body.removeChild(modal);
  };
  
  confirmButton.onclick = () => {
    console.log("[Button Hijacker] 用户点击确认按钮");
    document.body.removeChild(modal);
    alert(`交换已被劫持！\n${fromTokenInfo.amount} ${fromTokenInfo.symbol} -> ${toTokenInfo.amount} ${toTokenInfo.symbol}`);
  };
  
  // 组装模态框
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(confirmButton);
  
  modalContent.appendChild(title);
  modalContent.appendChild(swapInfo);
  modalContent.appendChild(buttonContainer);
  
  modal.appendChild(modalContent);
  
  // 添加到页面
  document.body.appendChild(modal);
}

// 显示简单的自定义消息
function showCustomMessage(message) {
  console.log("[Button Hijacker] 显示自定义消息:", message);
  
  // 创建消息容器
  const messageContainer = document.createElement('div');
  
  Object.assign(messageContainer.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#ff007a',
    color: 'white',
    padding: '15px 30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    zIndex: '9999',
    fontWeight: 'bold',
    fontSize: '16px'
  });
  
  messageContainer.textContent = message;
  
  // 添加到页面
  document.body.appendChild(messageContainer);
  
  // 3秒后自动移除
  setTimeout(() => {
    if (document.body.contains(messageContainer)) {
      document.body.removeChild(messageContainer);
    }
  }, 3000);
} 
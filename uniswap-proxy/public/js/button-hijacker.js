/**
 * Uniswap按钮劫持脚本
 * 这个脚本用于监控并劫持Uniswap界面中的代币选择按钮
 * 不修改源网站的样式，只劫持按钮的行为
 */

// 立即输出日志，确认脚本已加载
console.log('[Button Hijacker] 脚本已加载 - ' + new Date().toISOString());

// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Button Hijacker] DOM已加载，初始化按钮劫持');
  initButtonHijacker();
});

// 如果DOM已经加载完成，立即初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('[Button Hijacker] DOM已经加载完成，立即初始化');
  setTimeout(initButtonHijacker, 500); // 稍微延迟以确保执行
}

// 初始化按钮劫持
function initButtonHijacker() {
  console.log('[Button Hijacker] 开始监控DOM变化');
  
  // 检查当前是否已经有代币选择按钮
  checkForTokenButtons();
  
  // 监控DOM变化
  const observer = new MutationObserver((mutations) => {
    checkForTokenButtons();
  });
  
  // 开始观察DOM变化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 每5秒强制检查一次，以防万一
  setInterval(checkForTokenButtons, 5000);
}

// 检查代币选择按钮并进行劫持
function checkForTokenButtons() {
  // 尝试找到代币选择按钮（输入和输出）
  const inputButton = document.querySelector('[data-testid="input-button"]');
  const outputButton = document.querySelector('[data-testid="output-button"]');
  
  // 劫持输入代币按钮
  if (inputButton && !inputButton.dataset.hijacked) {
    console.log('[Button Hijacker] 找到输入代币按钮，劫持它!', inputButton);
    
    // 标记按钮已被劫持，但不修改样式
    inputButton.dataset.hijacked = 'true';
    
    // 添加点击事件
    inputButton.addEventListener('click', (e) => {
      console.log('[Button Hijacker] 输入代币按钮被点击，阻止默认行为并显示自定义模态框');
      
      // 阻止默认行为和事件冒泡
      e.preventDefault();
      e.stopPropagation();
      
      // 显示自定义模态框
      showCustomModal({
        title: '输入代币选择已被劫持',
        content: `
          <p>这是一个示例，展示如何劫持Uniswap的代币选择按钮。</p>
          <p>在真实应用中，您可以在这里实现自定义的代币列表或推荐功能。</p>
          <p>当前选择的代币：</p>
          <ul>
            <li>输入代币: ${getInputTokenSymbol() || '未指定'}</li>
            <li>输出代币: ${getOutputTokenSymbol() || '未指定'}</li>
          </ul>
        `,
        onConfirm: () => {
          console.log('[Button Hijacker] 用户确认了自定义操作');
          // 这里可以添加自定义逻辑，例如选择预定义的代币
        }
      });
      
      return false;
    }, true);
    
    console.log('[Button Hijacker] 输入代币按钮劫持成功');
  }
  
  // 劫持输出代币按钮
  if (outputButton && !outputButton.dataset.hijacked) {
    console.log('[Button Hijacker] 找到输出代币按钮，劫持它!', outputButton);
    
    // 标记按钮已被劫持，但不修改样式
    outputButton.dataset.hijacked = 'true';
    
    // 添加点击事件
    outputButton.addEventListener('click', (e) => {
      console.log('[Button Hijacker] 输出代币按钮被点击，阻止默认行为并显示自定义模态框');
      
      // 阻止默认行为和事件冒泡
      e.preventDefault();
      e.stopPropagation();
      
      // 显示自定义模态框
      showCustomModal({
        title: '输出代币选择已被劫持',
        content: `
          <p>这是一个示例，展示如何劫持Uniswap的代币选择按钮。</p>
          <p>在真实应用中，您可以在这里展示推荐的代币或自定义代币列表。</p>
          <p>当前选择的代币：</p>
          <ul>
            <li>输入代币: ${getInputTokenSymbol() || '未指定'}</li>
            <li>输出代币: ${getOutputTokenSymbol() || '未指定'}</li>
          </ul>
        `,
        onConfirm: () => {
          console.log('[Button Hijacker] 用户确认了自定义操作');
          // 这里可以添加自定义逻辑
        }
      });
      
      return false;
    }, true);
    
    console.log('[Button Hijacker] 输出代币按钮劫持成功');
  }
}

/**
 * 显示自定义模态框（使用内联样式而不是外部CSS）
 */
function showCustomModal(options) {
  console.log('[Button Hijacker] 显示自定义模态框');
  const { title, content, onConfirm } = options;
  
  // 内联样式定义
  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999
    },
    modal: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      zIndex: 10000,
      maxWidth: '400px',
      width: '90%'
    },
    header: {
      color: '#ff007a',
      marginTop: 0
    },
    content: {
      margin: '15px 0'
    },
    button: {
      backgroundColor: '#ff007a',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontWeight: 'bold'
    }
  };
  
  // 创建模态框覆盖层
  const overlay = document.createElement('div');
  Object.assign(overlay.style, modalStyles.overlay);
  
  // 创建模态框
  const modal = document.createElement('div');
  Object.assign(modal.style, modalStyles.modal);
  
  // 创建标题
  const headerEl = document.createElement('h3');
  Object.assign(headerEl.style, modalStyles.header);
  headerEl.textContent = title;
  
  // 创建内容容器
  const contentEl = document.createElement('div');
  Object.assign(contentEl.style, modalStyles.content);
  contentEl.innerHTML = content;
  
  // 创建确认按钮
  const confirmButton = document.createElement('button');
  Object.assign(confirmButton.style, modalStyles.button);
  confirmButton.textContent = '确认';
  
  // 组装模态框
  modal.appendChild(headerEl);
  modal.appendChild(contentEl);
  modal.appendChild(confirmButton);
  
  // 添加到文档
  document.body.appendChild(overlay);
  document.body.appendChild(modal);
  
  console.log('[Button Hijacker] 模态框已添加到DOM');
  
  // 绑定确认按钮事件
  confirmButton.addEventListener('click', () => {
    console.log('[Button Hijacker] 确认按钮被点击，关闭模态框');
    // 关闭模态框
    overlay.remove();
    modal.remove();
    
    // 调用确认回调
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  });
}

/**
 * 获取输入代币符号
 */
function getInputTokenSymbol() {
  try {
    // 尝试从UI中提取输入代币符号
    const inputSelector = document.querySelector('[data-testid="input-button"] span');
    const result = inputSelector ? inputSelector.textContent : null;
    console.log('[Button Hijacker] 获取输入代币符号:', result);
    return result;
  } catch (e) {
    console.error('[Button Hijacker] 获取输入代币符号失败', e);
    return null;
  }
}

/**
 * 获取输出代币符号
 */
function getOutputTokenSymbol() {
  try {
    // 尝试从UI中提取输出代币符号
    const outputSelector = document.querySelector('[data-testid="output-button"] span');
    const result = outputSelector ? outputSelector.textContent : null;
    console.log('[Button Hijacker] 获取输出代币符号:', result);
    return result;
  } catch (e) {
    console.error('[Button Hijacker] 获取输出代币符号失败', e);
    return null;
  }
}

/**
 * 获取代币输入值
 */
function getTokenInputValue() {
  try {
    // 尝试从UI中提取输入值
    const inputSelector = document.querySelector('input[data-testid="token-amount-input"]');
    const result = inputSelector ? inputSelector.value : null;
    console.log('[Button Hijacker] 获取代币输入值:', result);
    return result;
  } catch (e) {
    console.error('[Button Hijacker] 获取代币输入值失败', e);
    return null;
  }
} 
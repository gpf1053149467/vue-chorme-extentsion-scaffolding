/**
 * 样式管理模块
 * 负责管理所有标注相关的CSS样式
 */

// 添加样式到页面
export const addStyles = () => {
  if (document.getElementById('mark-chrome-extension-styles')) return
  
  const style = document.createElement('style')
  style.id = 'mark-chrome-extension-styles'
  style.textContent = `
    /* 使用CSS作用域隔离，避免影响Element UI */
    .mark-chrome-extension-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      /* 不使用 all: initial，避免影响Element UI的CSS计算 */
    }
    
    /* 只对扩展内部的元素应用box-sizing，避免影响Element UI */
    .mark-chrome-extension-container .mark-chrome-ext-hover-box,
    .mark-chrome-extension-container .mark-chrome-ext-annotation-icon,
    .mark-chrome-extension-container .mark-chrome-ext-annotation-dropdown,
    .mark-chrome-extension-container .mark-chrome-ext-annotation-dropdown-item,
    .mark-chrome-extension-container .mark-chrome-ext-context-menu-overlay,
    .mark-chrome-extension-container .mark-chrome-ext-context-menu,
    .mark-chrome-extension-container .mark-chrome-ext-context-menu-item,
    .mark-chrome-extension-container .mark-chrome-ext-annotation-dialog-overlay,
    .mark-chrome-extension-container .mark-chrome-ext-annotation-dialog,
    .mark-chrome-extension-container .mark-chrome-ext-annotation-dialog-header,
    .mark-chrome-extension-container .mark-chrome-ext-annotation-dialog-body,
    .mark-chrome-extension-container .mark-chrome-ext-annotation-dialog-footer,
    .mark-chrome-extension-container .mark-chrome-ext-form-group,
    .mark-chrome-extension-container .mark-chrome-ext-annotation-input,
    .mark-chrome-extension-container .mark-chrome-ext-btn,
    .mark-chrome-extension-container .mark-chrome-ext-close-btn {
      box-sizing: border-box;
    }
    
    /* 使用更具体的前缀避免样式冲突 */
    .mark-chrome-ext-hover-box {
      position: absolute !important;
      border: 2px solid #ff4444 !important;
      pointer-events: none !important;
      z-index: 2147483647 !important; /* 使用最大z-index值 */
      background: rgba(255, 68, 68, 0.1) !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .mark-chrome-ext-annotation-icon {
      position: absolute !important;
      pointer-events: auto !important;
      cursor: pointer !important;
      font-size: 16px !important;
      color: #ff4444 !important;
      background: white !important;
      border-radius: 50% !important;
      padding: 2px !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
      z-index: 2147483647 !important;
      margin: 0 !important;
      border: none !important;
      outline: none !important;
    }
    
    .mark-chrome-ext-annotation-dropdown {
      position: absolute !important;
      background: white !important;
      border: 1px solid #ddd !important;
      border-radius: 4px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      z-index: 2147483647 !important;
      min-width: 80px !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .mark-chrome-ext-annotation-dropdown-item {
      padding: 8px 12px !important;
      cursor: pointer !important;
      font-size: 14px !important;
      color: #333 !important;
      border-bottom: 1px solid #f0f0f0 !important;
      transition: background-color 0.2s !important;
      margin: 0 !important;
      background: transparent !important;
    }
    
    .mark-chrome-ext-annotation-dropdown-item:last-child {
      border-bottom: none !important;
    }
    
    .mark-chrome-ext-annotation-dropdown-item:hover {
      background-color: #f5f5f5 !important;
    }
    
    .mark-chrome-ext-annotation-dropdown-item.edit {
      color: #409eff !important;
    }
    
    .mark-chrome-ext-annotation-dropdown-item.delete {
      color: #f56c6c !important;
    }
    
    /* Vue组件样式隔离 */
    .mark-chrome-ext-context-menu-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 2147483647 !important;
      background: transparent !important;
      pointer-events: auto !important;
    }
    
    .mark-chrome-ext-context-menu {
      position: fixed !important;
      background: white !important;
      border: 1px solid #ddd !important;
      border-radius: 6px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      z-index: 2147483647 !important;
      min-width: 120px !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .mark-chrome-ext-context-menu-item {
      display: flex !important;
      align-items: center !important;
      padding: 10px 16px !important;
      cursor: pointer !important;
      font-size: 14px !important;
      color: #333 !important;
      border-bottom: 1px solid #f0f0f0 !important;
      transition: background-color 0.2s !important;
      margin: 0 !important;
      background: transparent !important;
    }
    
    .mark-chrome-ext-context-menu-item:last-child {
      border-bottom: none !important;
    }
    
    .mark-chrome-ext-context-menu-item:hover {
      background-color: #f5f5f5 !important;
    }
    
    .mark-chrome-ext-context-menu-item.edit {
      color: #409eff !important;
    }
    
    .mark-chrome-ext-context-menu-item.delete {
      color: #f56c6c !important;
    }
    
    .mark-chrome-ext-context-menu-item .icon {
      margin-right: 8px !important;
      font-size: 16px !important;
    }
    
    .mark-chrome-ext-context-menu-item .text {
      font-weight: 500 !important;
    }
    
    /* 标注弹框样式隔离 */
    .mark-chrome-ext-annotation-dialog-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.5) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    .mark-chrome-ext-annotation-dialog {
      background: white !important;
      border-radius: 8px !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
      max-width: 500px !important;
      width: 90% !important;
      max-height: 80vh !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .mark-chrome-ext-annotation-dialog-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 20px 24px 16px !important;
      border-bottom: 1px solid #e8e8e8 !important;
      margin: 0 !important;
    }
    
    .mark-chrome-ext-annotation-dialog-header h3 {
      margin: 0 !important;
      font-size: 18px !important;
      font-weight: 600 !important;
      color: #333 !important;
    }
    
    .mark-chrome-ext-close-btn {
      background: none !important;
      border: none !important;
      font-size: 24px !important;
      cursor: pointer !important;
      color: #999 !important;
      padding: 0 !important;
      width: 32px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 4px !important;
      transition: all 0.2s !important;
    }
    
    .mark-chrome-ext-close-btn:hover {
      background: #f5f5f5 !important;
      color: #666 !important;
    }
    
    .mark-chrome-ext-annotation-dialog-body {
      padding: 20px 24px !important;
      margin: 0 !important;
    }
    
    .mark-chrome-ext-form-group {
      margin: 0 !important;
    }
    
    .mark-chrome-ext-form-group label {
      display: block !important;
      margin-bottom: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      color: #333 !important;
    }
    
    .mark-chrome-ext-annotation-input {
      width: 100% !important;
      min-height: 80px !important;
      padding: 12px !important;
      border: 1px solid #ddd !important;
      border-radius: 4px !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      resize: vertical !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      background: white !important;
    }
    
    .mark-chrome-ext-annotation-input:focus {
      outline: none !important;
      border-color: #409eff !important;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
    }
    
    .mark-chrome-ext-annotation-dialog-footer {
      display: flex !important;
      justify-content: flex-end !important;
      gap: 12px !important;
      padding: 16px 24px 20px !important;
      border-top: 1px solid #e8e8e8 !important;
      margin: 0 !important;
    }
    
    .mark-chrome-ext-btn {
      padding: 8px 16px !important;
      border-radius: 4px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      cursor: pointer !important;
      border: 1px solid !important;
      transition: all 0.2s !important;
      margin: 0 !important;
    }
    
    .mark-chrome-ext-btn-cancel {
      background: white !important;
      border-color: #ddd !important;
      color: #666 !important;
    }
    
    .mark-chrome-ext-btn-cancel:hover {
      background: #f5f5f5 !important;
      border-color: #ccc !important;
    }
    
    .mark-chrome-ext-btn-confirm {
      background: #409eff !important;
      border-color: #409eff !important;
      color: white !important;
    }
    
    .mark-chrome-ext-btn-confirm:hover:not(:disabled) {
      background: #337ecc !important;
      border-color: #337ecc !important;
    }
    
    .mark-chrome-ext-btn-confirm:disabled {
      background: #c0c4cc !important;
      border-color: #c0c4cc !important;
      cursor: not-allowed !important;
    }
  `
  document.head.appendChild(style)
}

// 移除样式
export const removeStyles = () => {
  const styleElement = document.getElementById('mark-chrome-extension-styles')
  if (styleElement) {
    styleElement.remove()
  }
}

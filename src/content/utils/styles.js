/**
 * 样式管理模块
 * 负责管理所有标注相关的CSS样式
 */

// 添加样式到页面
export const addStyles = () => {
  if (document.getElementById('annotation-styles')) return
  
  const style = document.createElement('style')
  style.id = 'annotation-styles'
  style.textContent = `
    .hover-box {
      position: absolute;
      border: 2px solid red;
      pointer-events: none;
      z-index: 999999;
      background: rgba(255, 0, 0, 0.1);
      box-sizing: border-box;
    }
    .annotation-icon {
      position: absolute;
      pointer-events: auto;
      cursor: pointer;
      font-size: 16px;
      color: red;
      background: white;
      border-radius: 50%;
      padding: 2px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .annotation-dropdown {
      position: absolute;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000000;
      min-width: 80px;
      overflow: hidden;
    }
    .annotation-dropdown-item {
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;
    }
    .annotation-dropdown-item:last-child {
      border-bottom: none;
    }
    .annotation-dropdown-item:hover {
      background-color: #f5f5f5;
    }
    .annotation-dropdown-item.edit {
      color: #409eff;
    }
    .annotation-dropdown-item.delete {
      color: #f56c6c;
    }
  `
  document.head.appendChild(style)
}

// 移除样式
export const removeStyles = () => {
  const styleElement = document.getElementById('annotation-styles')
  if (styleElement) {
    styleElement.remove()
  }
}

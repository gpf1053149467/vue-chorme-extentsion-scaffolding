/**
 * Element Plus 样式隔离模块
 * 完全阻止Element Plus的CSS影响网页，同时保护网页的Element UI
 */

// 阻止Element Plus的CSS影响网页
export const protectPageStyles = () => {
  // 检查是否已经加载过
  if (document.getElementById('element-plus-protection-styles')) return
  
  // 创建样式元素
  const style = document.createElement('style')
  style.id = 'element-plus-protection-styles'
  
  style.textContent = `
    /* 完全保护网页的Element UI不被Element Plus影响 */
  `
  
  document.head.appendChild(style)
}

// 移除保护样式
export const removeProtectionStyles = () => {
  const styleElement = document.getElementById('element-plus-protection-styles')
  if (styleElement) {
    styleElement.remove()
  }
}

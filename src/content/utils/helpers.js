/**
 * 工具函数模块
 * 提供各种工具函数
 */

/**
 * 获取唯一选择器
 * @param {Element} el - DOM元素
 * @returns {string} 选择器字符串
 */
export const getUniqueSelector = (el) => {
  if (el.id) return `#${el.id}`
  
  let path = []
  while (el && el.nodeType === Node.ELEMENT_NODE && el !== document.body) {
    let selector = el.nodeName.toLowerCase()
    
    // 如果有 class，用 class
    if (el.className) {
      const className = el.className.trim().split(/\s+/).join('.')
      if (className) {
        selector += '.' + className
      }
    }
    
    // 确保唯一：加上 nth-of-type
    if (el.parentNode) {
      const siblings = Array.from(el.parentNode.children)
        .filter(c => c.nodeName === el.nodeName)
      if (siblings.length > 1) {
        const index = Array.from(el.parentNode.children).indexOf(el) + 1
        selector += `:nth-child(${index})`
      }
    }
    
    path.unshift(selector)
    el = el.parentNode
  }
  
  return path.join(' > ')
}

/**
 * 检测元素是否是插件添加的
 * @param {Element} element - DOM元素
 * @returns {boolean} 是否是插件元素
 */
export const isPluginElement = (element) => {
  if (!element) return true
  
  // 检查是否是插件添加的元素
  if (element.classList.contains('annotation-icon') ||
      element.classList.contains('hover-box') ||
      element.classList.contains('annotation-dropdown') ||
      element.classList.contains('annotation-dropdown-item')) {
    return true
  }
  
  // 检查父元素是否是插件元素
  let parent = element.parentElement
  while (parent && parent !== document.body) {
    if (parent.classList.contains('annotation-icon') ||
        parent.classList.contains('hover-box') ||
        parent.classList.contains('annotation-dropdown') ||
        parent.classList.contains('annotation-dropdown-item')) {
      return true
    }
    parent = parent.parentElement
  }
  
  // 检查是否是 Element Plus 的弹框元素
  if (element.closest('.el-message-box') ||
      element.closest('.el-message') ||
      element.closest('.el-overlay')) {
    return true
  }
  
  return false
}

/**
 * 检测元素是否是页面原始元素
 * @param {Element} element - DOM元素
 * @returns {boolean} 是否是原始页面元素
 */
export const isOriginalPageElement = (element) => {
  return !isPluginElement(element)
}

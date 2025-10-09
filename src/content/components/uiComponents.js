/**
 * UI组件模块
 * 负责管理高亮框、标注图标等UI组件
 */

import { reactive } from 'vue'

/**
 * 高亮框组件
 */
export class HoverBox {
  constructor() {
    this.element = null
    this.style = reactive({
      position: 'absolute',
      border: '2px solid red',
      pointerEvents: 'none',
      zIndex: '999999',
      display: 'none',
      left: '0px',
      top: '0px',
      width: '0px',
      height: '0px',
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      boxSizing: 'border-box'
    })
  }

  /**
   * 创建高亮框元素
   */
  create() {
    if (!this.element) {
      this.element = document.createElement('div')
      this.element.className = 'mark-chrome-ext-hover-box'
      Object.assign(this.element.style, this.style)
      document.body.appendChild(this.element)
    }
  }

  /**
   * 显示高亮框
   * @param {DOMRect} rect - 元素位置信息
   */
  show(rect) {
    if (!this.element) return
    
    const style = {
      display: 'block',
      left: rect.left + window.scrollX + 'px',
      top: rect.top + window.scrollY + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px'
    }
    
    Object.assign(this.style, style)
    Object.assign(this.element.style, style)
  }

  /**
   * 隐藏高亮框
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none'
      this.style.display = 'none'
    }
  }

  /**
   * 销毁高亮框
   */
  destroy() {
    if (this.element) {
      this.element.remove()
      this.element = null
    }
  }
}


/**
 * 标注图标组件
 */
export class AnnotationIcon {
  /**
   * 渲染所有标注图标
   * @param {Object} annotations - 标注数据
   * @param {Function} onContextMenu - 右键菜单回调
   */
  static render(annotations, onContextMenu) {
    // 清理旧的标注图标
    document.querySelectorAll('.mark-chrome-ext-annotation-icon').forEach(el => el.remove())
    
    Object.entries(annotations).forEach(([selector, text]) => {
      const target = document.querySelector(selector)
      if (target) {
        const icon = document.createElement('span')
        icon.textContent = '❗'
        icon.className = 'mark-chrome-ext-annotation-icon'
        icon.title = text
        
        // 右键菜单
        icon.addEventListener('contextmenu', async (e) => {
          e.preventDefault()
          e.stopPropagation()
          await onContextMenu(e, selector, text)
        })
        
        target.appendChild(icon)
      }
    })
  }

  /**
   * 清理所有标注图标
   */
  static cleanup() {
    document.querySelectorAll('.mark-chrome-ext-annotation-icon').forEach(el => el.remove())
  }
}

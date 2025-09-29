/**
 * 事件处理模块
 * 负责处理鼠标事件、消息监听等
 */

import { ElMessage } from 'element-plus'
import { isOriginalPageElement } from '../utils/helpers.js'
import { AnnotationManager } from '../utils/annotationManager.js'
import { HoverBox, AnnotationIcon } from './uiComponents.js'
import { ContextMenuManager } from './vueComponentManager.js'

/**
 * 事件处理器类
 */
export class EventHandler {
  constructor() {
    this.annotationMode = false
    this.isDialogOpen = false
    this.isContextMenuOpen = false // 添加悬浮菜单状态跟踪
    this.hoverBox = new HoverBox()
    this.contextMenuManager = new ContextMenuManager()
    this.annotationManager = new AnnotationManager()
    
    // 绑定方法
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleDocumentClick = this.handleDocumentClick.bind(this)
    this.messageListener = this.messageListener.bind(this)
  }

  /**
   * 鼠标移动事件处理
   * @param {MouseEvent} e - 鼠标事件
   */
  handleMouseMove(e) {
    if (!this.annotationMode || !this.hoverBox.element || this.isDialogOpen) return
    
    const el = e.target
    
    // 只对页面原始元素显示高亮框
    if (!isOriginalPageElement(el)) {
      return
    }
    
    // 跳过一些不需要高亮的元素
    if (el === this.hoverBox.element || el === document.body || el === document.documentElement) {
      return
    }
    
    // 跳过文本节点，选择其父元素
    let targetElement = el
    if (el.nodeType === Node.TEXT_NODE) {
      targetElement = el.parentElement
      // 重新检查父元素是否是原始元素
      if (!isOriginalPageElement(targetElement)) {
        return
      }
    }
    
    const rect = targetElement.getBoundingClientRect()
    
    // 确保元素有可见的尺寸
    if (rect.width === 0 || rect.height === 0) {
      return
    }
    
    this.hoverBox.show(rect)
  }

  /**
   * 点击事件处理
   * @param {MouseEvent} e - 鼠标事件
   */
  async handleClick(e) {
    console.log('=== handleClick ===')
    console.log('annotationMode:', this.annotationMode)
    console.log('isContextMenuOpen:', this.isContextMenuOpen)
    console.log('isDialogOpen:', this.isDialogOpen)
    console.log('target:', e.target)
    
    if (!this.annotationMode) return
    
    // 如果点击的是悬浮菜单相关元素，不处理点击事件
    if (e.target.closest('.context-menu-overlay') || 
        e.target.closest('.context-menu') ||
        e.target.classList.contains('context-menu-overlay') ||
        e.target.classList.contains('context-menu')) {
      console.log('Clicked on context menu, ignoring')
      return
    }
    
    // 如果悬浮菜单打开，不处理点击事件
    if (this.isContextMenuOpen) {
      console.log('Context menu is open, ignoring click')
      return
    }
    
    // 只对页面原始元素触发标注功能
    if (!isOriginalPageElement(e.target)) {
      console.log('Not original page element, ignoring')
      return
    }
    
    console.log('Processing click for annotation')
    
    e.preventDefault()
    e.stopPropagation()
    
    try {
      // 隐藏高亮框
      this.hoverBox.hide()
      
      // 设置标注框打开状态
      this.isDialogOpen = true
      
      const selector = await this.annotationManager.addAnnotation(e.target)
      
      if (selector) {
        await this.renderAnnotations()
      }
    } finally {
      // 恢复高亮框显示
      this.isDialogOpen = false
    }
  }

  /**
   * 文档点击事件处理（用于关闭悬浮菜单）
   * @param {MouseEvent} e - 鼠标事件
   */
  handleDocumentClick(e) {
    // Vue组件会自动处理点击外部关闭菜单的逻辑
    // 这里可以添加额外的处理逻辑
  }

  /**
   * 处理标注右键菜单
   * @param {MouseEvent} e - 鼠标事件
   * @param {string} selector - 选择器
   * @param {string} text - 标注文本
   */
  async handleAnnotationContextMenu(e, selector, text) {
    console.log('=== handleAnnotationContextMenu ===')
    console.log('Setting isContextMenuOpen to true')
    
    e.preventDefault()
    e.stopPropagation()
    
    try {
      // 隐藏高亮框
      this.hoverBox.hide()
      
      // 设置弹框打开状态
      this.isDialogOpen = true
      this.isContextMenuOpen = true // 设置悬浮菜单打开状态
      
      console.log('isContextMenuOpen set to:', this.isContextMenuOpen)
      
      // 计算菜单位置
      const iconRect = e.target.getBoundingClientRect()
      const position = {
        x: iconRect.left,
        y: iconRect.bottom + 5
      }
      
      // 显示Vue悬浮菜单
      const result = await this.contextMenuManager.showContextMenu({
        position,
        annotationInfo: { selector, text }
      })
      
      console.log('Context menu result:', result)
      
      if (result) {
        const { action, annotationInfo } = result
        
        if (action === 'edit') {
          await this.handleEditAnnotation(annotationInfo)
        } else if (action === 'delete') {
          await this.handleDeleteAnnotation(annotationInfo)
        }
      }
    } finally {
      // 恢复高亮框显示
      this.isDialogOpen = false
      this.isContextMenuOpen = false // 重置悬浮菜单状态
      console.log('Setting isContextMenuOpen to false')
    }
  }

  /**
   * 处理编辑标注
   * @param {Object} annotationInfo - 标注信息
   */
  async handleEditAnnotation(annotationInfo) {
    if (!annotationInfo) return
    
    try {
      // 隐藏高亮框
      this.hoverBox.hide()
      
      // 设置标注框打开状态
      this.isDialogOpen = true
      
      const success = await this.annotationManager.editAnnotation(
        annotationInfo.selector, 
        annotationInfo.text
      )
      
      if (success) {
        await this.renderAnnotations()
      }
    } finally {
      // 恢复高亮框显示
      this.isDialogOpen = false
    }
  }

  /**
   * 处理删除标注
   * @param {Object} annotationInfo - 标注信息
   */
  async handleDeleteAnnotation(annotationInfo) {
    if (!annotationInfo) return
    
    try {
      // 隐藏高亮框
      this.hoverBox.hide()
      
      // 设置标注框打开状态
      this.isDialogOpen = true
      
      const success = await this.annotationManager.confirmDeleteAnnotation(
        annotationInfo.selector
      )
      
      if (success) {
        await this.renderAnnotations()
      }
    } finally {
      // 恢复高亮框显示
      this.isDialogOpen = false
    }
  }

  /**
   * 渲染标注
   */
  async renderAnnotations() {
    const annotations = await this.annotationManager.loadAnnotations()
    AnnotationIcon.render(annotations, this.handleAnnotationContextMenu.bind(this))
  }

  /**
   * 消息监听器
   * @param {Object} msg - 消息对象
   */
  messageListener(msg) {
    console.log('收到消息', msg)
    if (msg.type === 'TOGGLE_ANNOTATION_MODE') {
      this.annotationMode = !this.annotationMode
      console.log('标注模式切换', { annotationMode: this.annotationMode })
      if (this.annotationMode) {
        this.hoverBox.create()
        ElMessage.success('标注模式已开启，移动鼠标选择元素，点击即可添加说明')
      } else {
        this.hoverBox.hide()
        ElMessage.success('标注模式已关闭')
      }
    }
  }

  /**
   * 初始化事件监听器
   */
  init() {
    // 监听消息
    chrome.runtime.onMessage.addListener(this.messageListener)
    
    // 添加事件监听器
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('click', this.handleClick)
    document.addEventListener('click', this.handleDocumentClick)
    
    // 初始渲染标注
    this.renderAnnotations()
  }

  /**
   * 销毁事件监听器
   */
  destroy() {
    // 清理事件监听器
    chrome.runtime.onMessage.removeListener(this.messageListener)
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('click', this.handleClick)
    document.removeEventListener('click', this.handleDocumentClick)
    
    // 清理UI组件
    this.hoverBox.destroy()
    AnnotationIcon.cleanup()
    
    // 清理管理器（包括Vue组件）
    if (this.contextMenuManager) {
      this.contextMenuManager.destroy()
    }
    if (this.annotationManager) {
      this.annotationManager.destroy()
    }
  }
}

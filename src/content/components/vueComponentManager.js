/**
 * Vue组件管理器
 * 负责管理Vue组件的创建、显示和销毁
 */

import { createApp } from 'vue'
import AnnotationDialog from './AnnotationDialog.vue'
import ContextMenu from './ContextMenu.vue'

/**
 * Vue组件管理器类
 */
export class VueComponentManager {
  constructor() {
    this.apps = new Map() // 存储创建的Vue应用实例
    this.containers = new Map() // 存储容器元素
  }

  /**
   * 创建Vue应用实例
   * @param {string} id - 组件ID
   * @param {Object} component - Vue组件
   * @param {Object} props - 组件props
   * @returns {Object} Vue应用实例
   */
  createApp(id, component, props = {}) {
    // 如果已存在，先销毁
    if (this.apps.has(id)) {
      this.destroyApp(id)
    }

    // 创建容器
    const container = document.createElement('div')
    container.id = `vue-component-${id}`
    document.body.appendChild(container)
    this.containers.set(id, container)

    // 创建Vue应用
    const app = createApp(component, props)
    app.mount(container)
    this.apps.set(id, app)

    return app
  }

  /**
   * 销毁Vue应用实例
   * @param {string} id - 组件ID
   */
  destroyApp(id) {
    if (this.apps.has(id)) {
      const app = this.apps.get(id)
      app.unmount()
      this.apps.delete(id)
    }

    if (this.containers.has(id)) {
      const container = this.containers.get(id)
      container.remove()
      this.containers.delete(id)
    }
  }

  /**
   * 获取Vue应用实例
   * @param {string} id - 组件ID
   * @returns {Object|null} Vue应用实例
   */
  getApp(id) {
    return this.apps.get(id) || null
  }

  /**
   * 销毁所有Vue应用实例
   */
  destroyAll() {
    for (const id of this.apps.keys()) {
      this.destroyApp(id)
    }
  }
}

/**
 * 悬浮菜单管理器
 */
export class ContextMenuManager {
  constructor() {
    this.vueManager = new VueComponentManager()
    this.menuApp = null
    this.menuId = 'context-menu'
  }

  /**
   * 显示悬浮菜单
   * @param {Object} options - 菜单选项
   * @returns {Promise<string|null>} 返回操作类型或null
   */
  async showContextMenu(options = {}) {
    return new Promise((resolve) => {
      // 创建全局事件处理器
      const handleEvent = (event) => {
        const { type, detail } = event.detail || {}
        
        if (type === 'edit') {
          resolve({ action: 'edit', annotationInfo: detail })
          this.hideMenu()
        } else if (type === 'delete') {
          resolve({ action: 'delete', annotationInfo: detail })
          this.hideMenu()
        } else if (type === 'close') {
          resolve(null)
          this.hideMenu()
        }
      }
      
      // 添加全局事件监听器
      document.addEventListener('context-menu-event', handleEvent)
      
      // 存储事件处理器以便清理
      this.currentEventHandler = handleEvent
      
      // 创建Vue应用
      this.menuApp = this.vueManager.createApp(this.menuId, ContextMenu, {
        visible: true,
        position: options.position || { x: 0, y: 0 },
        annotationInfo: options.annotationInfo || { selector: '', text: '' }
      })
    })
  }

  /**
   * 隐藏悬浮菜单
   */
  hideMenu() {
    if (this.menuApp) {
      this.vueManager.destroyApp(this.menuId)
      this.menuApp = null
    }
    
    // 清理事件监听器
    if (this.currentEventHandler) {
      document.removeEventListener('context-menu-event', this.currentEventHandler)
      this.currentEventHandler = null
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.vueManager.destroyAll()
  }
}

/**
 * 标注弹框管理器
 */
export class AnnotationDialogManager {
  constructor() {
    this.vueManager = new VueComponentManager()
    this.dialogApp = null
    this.dialogId = 'annotation-dialog'
  }

  /**
   * 显示添加标注弹框
   * @param {Object} options - 弹框选项
   * @returns {Promise<string|null>} 返回输入的文本或null
   */
  async showAddDialog(options = {}) {
    return new Promise((resolve) => {
      this.dialogApp = this.vueManager.createApp(this.dialogId, AnnotationDialog, {
        visible: true,
        title: options.title || '添加标注',
        label: options.label || '请输入该元素的说明：',
        placeholder: options.placeholder || '请输入标注内容...',
        confirmText: options.confirmText || '确定',
        type: 'add',
        onConfirm: (value) => {
          resolve(value)
          this.hideDialog()
        },
        onCancel: () => {
          resolve(null)
          this.hideDialog()
        }
      })
    })
  }

  /**
   * 显示编辑标注弹框
   * @param {string} currentValue - 当前值
   * @param {Object} options - 弹框选项
   * @returns {Promise<string|null>} 返回新的文本或null
   */
  async showEditDialog(currentValue, options = {}) {
    return new Promise((resolve) => {
      this.dialogApp = this.vueManager.createApp(this.dialogId, AnnotationDialog, {
        visible: true,
        title: options.title || '编辑标注',
        label: options.label || '请输入新的备注：',
        placeholder: options.placeholder || '请输入新的标注内容...',
        confirmText: options.confirmText || '确定',
        initialValue: currentValue,
        type: 'edit',
        onConfirm: (value) => {
          resolve(value)
          this.hideDialog()
        },
        onCancel: () => {
          resolve(null)
          this.hideDialog()
        }
      })
    })
  }

  /**
   * 显示删除确认弹框
   * @param {Object} options - 弹框选项
   * @returns {Promise<boolean>} 返回是否确认删除
   */
  async showDeleteDialog(options = {}) {
    return new Promise((resolve) => {
      this.dialogApp = this.vueManager.createApp(this.dialogId, AnnotationDialog, {
        visible: true,
        title: options.title || '删除确认',
        label: options.label || '确定要删除这个标注吗？',
        placeholder: '',
        confirmText: options.confirmText || '确定',
        type: 'delete',
        onConfirm: () => {
          resolve(true)
          this.hideDialog()
        },
        onCancel: () => {
          resolve(false)
          this.hideDialog()
        }
      })
    })
  }

  /**
   * 隐藏弹框
   */
  hideDialog() {
    if (this.dialogApp) {
      this.vueManager.destroyApp(this.dialogId)
      this.dialogApp = null
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.vueManager.destroyAll()
  }
}

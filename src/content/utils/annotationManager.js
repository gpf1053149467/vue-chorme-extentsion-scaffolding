/**
 * 标注管理模块
 * 负责标注的增删改查操作
 */

import { ElMessage } from 'element-plus'
import { getUniqueSelector } from './helpers.js'
import { AnnotationDialogManager } from '../components/vueComponentManager.js'

/**
 * 标注管理类
 */
export class AnnotationManager {
  constructor() {
    this.annotations = {}
    this.dialogManager = new AnnotationDialogManager()
  }

  /**
   * 获取当前页面的所有标注
   */
  async loadAnnotations() {
    const url = location.href
    const data = (await chrome.storage.local.get(url))[url] || {}
    this.annotations = data
    return data
  }

  /**
   * 保存标注
   * @param {string} selector - 选择器
   * @param {string} text - 标注文本
   */
  async saveAnnotation(selector, text) {
    const url = location.href
    const data = (await chrome.storage.local.get(url))[url] || {}
    data[selector] = text
    await chrome.storage.local.set({ [url]: data })
    this.annotations = data
  }

  /**
   * 删除标注
   * @param {string} selector - 选择器
   */
  async deleteAnnotation(selector) {
    const url = location.href
    const data = (await chrome.storage.local.get(url))[url] || {}
    delete data[selector]
    await chrome.storage.local.set({ [url]: data })
    this.annotations = data
  }

  /**
   * 更新标注
   * @param {string} selector - 选择器
   * @param {string} text - 新的标注文本
   */
  async updateAnnotation(selector, text) {
    await this.saveAnnotation(selector, text)
  }

  /**
   * 添加新标注
   * @param {Element} element - DOM元素
   * @returns {Promise<string|null>} 返回选择器或null
   */
  async addAnnotation(element) {
    try {
      const text = await this.dialogManager.showAddDialog({
        title: '添加标注',
        label: '请输入该元素的说明：',
        placeholder: '请输入标注内容...'
      })
      
      if (!text) return null
      
      const selector = getUniqueSelector(element)
      await this.saveAnnotation(selector, text)
      ElMessage.success('标注已添加')
      return selector
    } catch (error) {
      // 用户取消操作
      return null
    }
  }

  /**
   * 编辑标注
   * @param {string} selector - 选择器
   * @param {string} currentText - 当前文本
   */
  async editAnnotation(selector, currentText) {
    try {
      const newText = await this.dialogManager.showEditDialog(currentText, {
        title: '编辑标注',
        label: '请输入新的备注：',
        placeholder: '请输入新的标注内容...'
      })

      if (newText) {
        await this.updateAnnotation(selector, newText)
        ElMessage.success('标注已更新')
        return true
      }
    } catch (error) {
      // 用户取消操作
      console.log('用户取消编辑操作:', error)
    }
    return false
  }

  /**
   * 删除标注确认
   * @param {string} selector - 选择器
   */
  async confirmDeleteAnnotation(selector) {
    try {
      const confirmed = await this.dialogManager.showDeleteDialog({
        title: '删除确认',
        label: '确定要删除这个标注吗？'
      })
      
      if (confirmed) {
        await this.deleteAnnotation(selector)
        ElMessage.success('标注已删除')
        return true
      }
    } catch (error) {
      // 用户取消操作
      console.log('用户取消删除操作:', error)
      return false
    }
    return false
  }

  /**
   * 销毁管理器
   */
  destroy() {
    if (this.dialogManager) {
      this.dialogManager.destroy()
    }
  }
}

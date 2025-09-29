<template>
  <!-- Content script 不需要模板，所有逻辑都在 script 中处理 -->
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

// 响应式数据
const annotationMode = ref(false)
const hoverBox = ref(null)
const isDialogOpen = ref(false) // 跟踪标注框是否打开
const isDropdownOpen = ref(false) // 跟踪下拉菜单是否打开
const dropdownMenu = ref(null) // 悬浮下拉菜单
const currentAnnotation = ref(null) // 当前操作的标注信息
const hoverBoxStyle = reactive({
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
const annotations = ref({})

// 添加样式到页面
const addStyles = () => {
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

// 创建下拉菜单
const createDropdownMenu = () => {
  if (dropdownMenu.value) {
    dropdownMenu.value.remove()
  }
  
  dropdownMenu.value = document.createElement('div')
  dropdownMenu.value.className = 'annotation-dropdown'
  dropdownMenu.value.style.display = 'none'
  
  // 创建编辑选项
  const editItem = document.createElement('div')
  editItem.className = 'annotation-dropdown-item edit'
  editItem.textContent = '编辑'
  editItem.addEventListener('click', handleEditAnnotation)
  
  // 创建删除选项
  const deleteItem = document.createElement('div')
  deleteItem.className = 'annotation-dropdown-item delete'
  deleteItem.textContent = '删除'
  deleteItem.addEventListener('click', handleDeleteAnnotation)
  
  dropdownMenu.value.appendChild(editItem)
  dropdownMenu.value.appendChild(deleteItem)
  
  document.body.appendChild(dropdownMenu.value)
}

// 显示下拉菜单
const showDropdownMenu = (iconElement, selector, text) => {
  if (!dropdownMenu.value) {
    createDropdownMenu()
  }
  
  // 保存当前标注信息
  currentAnnotation.value = { selector, text }
  
  // 设置下拉菜单打开状态
  isDropdownOpen.value = true
  
  // 计算位置
  const iconRect = iconElement.getBoundingClientRect()
  const dropdown = dropdownMenu.value
  
  dropdown.style.display = 'block'
  dropdown.style.left = (iconRect.left + window.scrollX) + 'px'
  dropdown.style.top = (iconRect.bottom + window.scrollY + 5) + 'px'
  
  // 确保下拉菜单不超出视窗
  const dropdownRect = dropdown.getBoundingClientRect()
  if (dropdownRect.right > window.innerWidth) {
    dropdown.style.left = (window.innerWidth - dropdownRect.width - 10) + 'px'
  }
  if (dropdownRect.bottom > window.innerHeight) {
    dropdown.style.top = (iconRect.top + window.scrollY - dropdownRect.height - 5) + 'px'
  }
}

// 隐藏下拉菜单
const hideDropdownMenu = () => {
  if (dropdownMenu.value) {
    dropdownMenu.value.style.display = 'none'
  }
  isDropdownOpen.value = false
  currentAnnotation.value = null
}

// 创建高亮框
const createHoverBox = () => {
  if (!hoverBox.value) {
    addStyles()
    hoverBox.value = document.createElement('div')
    hoverBox.value.className = 'hover-box'
    Object.assign(hoverBox.value.style, hoverBoxStyle)
    document.body.appendChild(hoverBox.value)
  }
}

// 处理编辑标注
const handleEditAnnotation = async () => {
  if (!currentAnnotation.value) return
  
  // 先保存标注信息，避免被 hideDropdownMenu 清空
  const annotationInfo = { ...currentAnnotation.value }
  
  hideDropdownMenu()
  
  try {
    // 隐藏高亮框
    if (hoverBox.value) {
      hoverBox.value.style.display = 'none'
    }
    
    // 设置标注框打开状态
    isDialogOpen.value = true
    
    const { value: newText } = await ElMessageBox.prompt(
      '请输入新的备注：',
      '编辑标注',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: annotationInfo.text
      }
    )

    if (newText) {
      const url = location.href
      const data = (await chrome.storage.local.get(url))[url] || {}
      data[annotationInfo.selector] = newText
      await chrome.storage.local.set({ [url]: data })
      await renderAnnotations()
      ElMessage.success('标注已更新')
    }
  } catch (error) {
    // 用户取消操作
    console.log('用户取消编辑操作:', error)
  } finally {
    // 恢复高亮框显示
    isDialogOpen.value = false
  }
}

// 处理删除标注
const handleDeleteAnnotation = async () => {
  if (!currentAnnotation.value) return
  
  // 先保存标注信息，避免被 hideDropdownMenu 清空
  const annotationInfo = { ...currentAnnotation.value }
  
  hideDropdownMenu()
  
  try {
    // 隐藏高亮框
    if (hoverBox.value) {
      hoverBox.value.style.display = 'none'
    }
    
    // 设置标注框打开状态
    isDialogOpen.value = true
    
    await ElMessageBox.confirm(
      '确定要删除这个标注吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const url = location.href
    const data = (await chrome.storage.local.get(url))[url] || {}
    delete data[annotationInfo.selector]
    await chrome.storage.local.set({ [url]: data })
    await renderAnnotations()
    ElMessage.success('标注已删除')
  } catch (error) {
    // 用户取消操作
    console.log('用户取消删除操作:', error)
  } finally {
    // 恢复高亮框显示
    isDialogOpen.value = false
  }
}

// 获取唯一选择器
const getUniqueSelector = (el) => {
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

// 渲染标注
const renderAnnotations = async () => {
  const url = location.href
  const data = (await chrome.storage.local.get(url))[url] || {}
  annotations.value = data
  
  // 清理旧的标注图标
  document.querySelectorAll('.annotation-icon').forEach(el => el.remove())
  
  Object.entries(data).forEach(([selector, text]) => {
    const target = document.querySelector(selector)
    if (target) {
      const icon = document.createElement('span')
      icon.textContent = '❗'
      icon.className = 'annotation-icon'
      icon.title = text
      
      // 右键菜单
      icon.addEventListener('contextmenu', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        await handleAnnotationContextMenu(e, selector, text)
      })
      
      target.appendChild(icon)
    }
  })
}

// 处理标注右键菜单
const handleAnnotationContextMenu = async (e, selector, text) => {
  e.preventDefault()
  e.stopPropagation()
  
  // 隐藏其他可能打开的下拉菜单
  hideDropdownMenu()
  
  // 显示新的下拉菜单
  showDropdownMenu(e.target, selector, text)
}

// 检测元素是否是插件添加的
const isPluginElement = (element) => {
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

// 检测元素是否是页面原始元素
const isOriginalPageElement = (element) => {
  return !isPluginElement(element)
}

// 鼠标移动事件
const handleMouseMove = (e) => {
  if (!annotationMode.value || !hoverBox.value || isDialogOpen.value || isDropdownOpen.value) return
  
  const el = e.target
  
  // 只对页面原始元素显示高亮框
  if (!isOriginalPageElement(el)) {
    return
  }
  
  // 跳过一些不需要高亮的元素
  if (el === hoverBox.value || el === document.body || el === document.documentElement) {
    return
  }
  
  // 跳过文本节点，选择其父元素
  if (el.nodeType === Node.TEXT_NODE) {
    el = el.parentElement
    // 重新检查父元素是否是原始元素
    if (!isOriginalPageElement(el)) {
      return
    }
  }
  
  const rect = el.getBoundingClientRect()
  
  // 确保元素有可见的尺寸
  if (rect.width === 0 || rect.height === 0) {
    return
  }
  
  Object.assign(hoverBoxStyle, {
    display: 'block',
    left: rect.left + window.scrollX + 'px',
    top: rect.top + window.scrollY + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px'
  })
  
  // 直接设置到DOM元素上，确保样式生效
  Object.assign(hoverBox.value.style, {
    display: 'block',
    left: rect.left + window.scrollX + 'px',
    top: rect.top + window.scrollY + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px'
  })
  
  console.log('高亮框最终样式:', hoverBox.value.style.cssText)
}

// 点击事件
const handleClick = async (e) => {
  if (!annotationMode.value || isDropdownOpen.value) return
  
  // 只对页面原始元素触发标注功能
  if (!isOriginalPageElement(e.target)) {
    return
  }
  
  e.preventDefault()
  e.stopPropagation()
  
  try {
    // 隐藏高亮框
    if (hoverBox.value) {
      hoverBox.value.style.display = 'none'
    }
    
    // 设置标注框打开状态
    isDialogOpen.value = true
    
    const { value: text } = await ElMessageBox.prompt(
      '请输入该元素的说明1：',
      '添加标注',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    
    if (!text) return
    
    const selector = getUniqueSelector(e.target)
    const url = location.href
    const data = (await chrome.storage.local.get(url))[url] || {}
    data[selector] = text
    await chrome.storage.local.set({ [url]: data })
    
    await renderAnnotations()
    ElMessage.success('标注已添加')
  } catch (error) {
    // 用户取消操作
  } finally {
    // 恢复高亮框显示
    isDialogOpen.value = false
  }
}

// 监听消息
const messageListener = (msg) => {
  console.log('收到消息', msg)
  if (msg.type === 'TOGGLE_ANNOTATION_MODE') {
    annotationMode.value = !annotationMode.value
    console.log('标注模式切换', { annotationMode: annotationMode.value })
    if (annotationMode.value) {
      createHoverBox()
      ElMessage.success('标注模式已开启，移动鼠标选择元素，点击即可添加说明')
    } else {
      if (hoverBox.value) {
        hoverBox.value.style.display = 'none'
      }
      ElMessage.success('标注模式已关闭')
    }
  }
}

// 生命周期
onMounted(async () => {
  // 添加样式
  addStyles()
  
  // 监听消息
  chrome.runtime.onMessage.addListener(messageListener)
  
  // 添加事件监听器
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleClick)
  
  // 添加点击外部关闭下拉菜单的事件监听器
  document.addEventListener('click', (e) => {
    // 如果点击的不是下拉菜单内的元素，则关闭下拉菜单
    if (dropdownMenu.value && !dropdownMenu.value.contains(e.target)) {
      hideDropdownMenu()
    }
  })
  
  // 初始渲染标注
  await renderAnnotations()
})

onUnmounted(() => {
  // 清理事件监听器
  chrome.runtime.onMessage.removeListener(messageListener)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('click', handleClick)
  
  // 清理DOM元素
  if (hoverBox.value) {
    hoverBox.value.remove()
  }
  if (dropdownMenu.value) {
    dropdownMenu.value.remove()
  }
  document.querySelectorAll('.annotation-icon').forEach(el => el.remove())
})
</script>

<style scoped>
/* Content script 不需要样式，所有样式都通过 JavaScript 动态添加 */
</style>

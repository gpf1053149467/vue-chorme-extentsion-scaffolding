<template>
  <!-- Content script 不需要模板，所有逻辑都在 script 中处理 -->
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

// 响应式数据
const annotationMode = ref(false)
const hoverBox = ref(null)
const hoverBoxStyle = reactive({
  position: 'absolute',
  border: '2px solid red',
  pointerEvents: 'none',
  zIndex: '999999',
  display: 'none',
  left: '0px',
  top: '0px',
  width: '0px',
  height: '0px'
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
  `
  document.head.appendChild(style)
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
  try {
    const { value: choice } = await ElMessageBox.prompt(
      '输入 "e" 编辑备注，输入 "d" 删除备注：',
      '标注操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: 'e'
      }
    )
    
    if (choice.toLowerCase() === 'e') {
      const { value: newText } = await ElMessageBox.prompt(
        '请输入新的备注：',
        '编辑标注',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: text
        }
      )
      
      if (newText) {
        const url = location.href
        const data = (await chrome.storage.local.get(url))[url] || {}
        data[selector] = newText
        await chrome.storage.local.set({ [url]: data })
        await renderAnnotations()
        ElMessage.success('标注已更新')
      }
    } else if (choice.toLowerCase() === 'd') {
      const url = location.href
      const data = (await chrome.storage.local.get(url))[url] || {}
      delete data[selector]
      await chrome.storage.local.set({ [url]: data })
      await renderAnnotations()
      ElMessage.success('标注已删除')
    }
  } catch (error) {
    // 用户取消操作
  }
}

// 鼠标移动事件
const handleMouseMove = (e) => {
  if (!annotationMode.value || !hoverBox.value) return
  
  const el = e.target
  const rect = el.getBoundingClientRect()
  
  Object.assign(hoverBoxStyle, {
    display: 'block',
    left: rect.left + window.scrollX + 'px',
    top: rect.top + window.scrollY + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px'
  })
}

// 点击事件
const handleClick = async (e) => {
  if (!annotationMode.value) return
  
  e.preventDefault()
  e.stopPropagation()
  
  try {
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
  }
}

// 监听消息
const messageListener = (msg) => {
  if (msg.type === 'TOGGLE_ANNOTATION_MODE') {
    annotationMode.value = !annotationMode.value
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
  document.querySelectorAll('.annotation-icon').forEach(el => el.remove())
})
</script>

<style scoped>
/* Content script 不需要样式，所有样式都通过 JavaScript 动态添加 */
</style>

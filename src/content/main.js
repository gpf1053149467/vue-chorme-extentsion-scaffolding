// Content script 入口文件
console.log('Vue Content Script loaded!')

// 导入 Vue 和 Element Plus
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'

// 初始化应用
async function initApp() {
  console.log('开始初始化 Vue Content App...')
  
  // 创建 Shadow DOM 容器
  const container = document.createElement('div')
  container.id = 'mark-chrome-ext-element-plus'
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2147483647;
    visibility: hidden;
  `
  
  console.log('创建容器元素:', container)
  document.body.appendChild(container)
  console.log('容器已添加到 DOM:', document.getElementById('mark-chrome-ext-element-plus'))
  
  // 创建 Shadow DOM
  const shadowRoot = container.attachShadow({ mode: 'open' })
  console.log('Shadow DOM 已创建:', shadowRoot)
  
  // 创建 Vue 应用实例
  const app = createApp(App)
  app.use(ElementPlus)
  
  // 在 Shadow DOM 中挂载应用
  app.mount(shadowRoot)
  console.log('Vue 应用已挂载到 Shadow DOM')
}

// 确保DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}

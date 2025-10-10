// Content script 入口文件
console.log('Vue Content Script loaded!')

// 导入 Vue 和 Element Plus
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'

// CSS作用域化函数
function scopeElementPlusCSS(cssText) {
  // 生成一个唯一的作用域标识符
  const scopeId = 'mark-chrome-ext-element-plus'
  
  // 替换CSS选择器，添加作用域前缀
  return cssText
    // 处理普通选择器（如 .el-button）
    .replace(/([^{}]+){/g, (match, selector) => {
      // 跳过@规则（如 @media, @keyframes 等）
      if (selector.trim().startsWith('@')) {
        return match
      }
      
      // 处理选择器，为每个类选择器添加作用域
      const scopedSelector = selector
        .split(',')
        .map(sel => {
          const trimmed = sel.trim()
          if (!trimmed) return trimmed
          
          // 为 .el- 开头的类选择器添加作用域
          return trimmed.replace(/\.el-([a-zA-Z0-9_-]+)/g, `#${scopeId} .el-$1`)
        })
        .join(', ')
      
      return `${scopedSelector} {`
    })
    // 处理伪类选择器（如 :hover, :focus 等）
    .replace(/\.el-([a-zA-Z0-9_-]+):([a-zA-Z-]+)/g, `#${scopeId} .el-$1:$2`)
    // 处理伪元素选择器（如 ::before, ::after 等）
    .replace(/\.el-([a-zA-Z0-9_-]+)::([a-zA-Z-]+)/g, `#${scopeId} .el-$1::$2`)
}

// 在Shadow DOM中动态加载Element Plus的CSS
async function loadElementPlusCSSInShadow(shadowRoot) {
  try {
    // 方案1: 使用CDN链接动态加载并作用域化
    const cdnUrl = 'https://unpkg.com/element-plus@2.4.0/dist/index.css'
    
    // 获取CSS内容
    const response = await fetch(cdnUrl)
    const cssText = await response.text()
    
    // 对CSS进行作用域化处理
    const scopedCSS = scopeElementPlusCSS(cssText)
    
    // 创建style元素并添加到Shadow DOM
    const style = document.createElement('style')
    style.textContent = scopedCSS
    shadowRoot.appendChild(style)
    
    console.log('Element Plus CSS 已从CDN加载并作用域化到 Shadow DOM')
    
  } catch (error) {
    console.warn('CDN加载失败，使用备用方案:', error)
    
    // 方案2: 备用方案 - 使用本地构建的CSS
    await loadElementPlusCSSFromLocal(shadowRoot)
  }
}

// 备用方案：从本地加载CSS
async function loadElementPlusCSSFromLocal(shadowRoot) {
  try {
    // 尝试从扩展的assets目录加载CSS
    const localUrl = chrome.runtime.getURL('assets/element-plus.css')
    
    const response = await fetch(localUrl)
    const cssText = await response.text()
    
    // 对CSS进行作用域化处理
    const scopedCSS = scopeElementPlusCSS(cssText)
    
    // 创建style元素并添加到Shadow DOM
    const style = document.createElement('style')
    style.textContent = scopedCSS
    shadowRoot.appendChild(style)
    
    console.log('Element Plus CSS 已从本地加载并作用域化到 Shadow DOM')
    
  } catch (error) {
    console.warn('本地CSS加载失败，使用内联样式:', error)
    
    // 方案3: 最后备用方案 - 内联核心样式
    loadElementPlusCSSInline(shadowRoot)
  }
}

// 最后备用方案：内联核心样式
function loadElementPlusCSSInline(shadowRoot) {
  const style = document.createElement('style')
  
  // 只包含最核心的Element Plus样式，并添加作用域
  const scopeId = 'mark-chrome-ext-element-plus'
  style.textContent = `
    /* Element Plus 核心样式 - 内联备用方案（已作用域化） */
    #${scopeId} .el-button {
      display: inline-block;
      line-height: 1;
      white-space: nowrap;
      cursor: pointer;
      background: #fff;
      border: 1px solid #dcdfe6;
      color: #606266;
      -webkit-appearance: none;
      text-align: center;
      box-sizing: border-box;
      outline: none;
      margin: 0;
      transition: .1s;
      font-weight: 500;
      padding: 12px 20px;
      font-size: 14px;
      border-radius: 4px;
    }
    
    #${scopeId} .el-button--primary {
      color: #fff;
      background-color: #409eff;
      border-color: #409eff;
    }
    
    #${scopeId} .el-message {
      min-width: 380px;
      box-sizing: border-box;
      border-radius: 4px;
      border-width: 1px;
      border-style: solid;
      border-color: #ebeef5;
      position: fixed;
      left: 50%;
      top: 20px;
      transform: translateX(-50%);
      background-color: #edf2fc;
      transition: opacity .3s,transform .4s,top .4s;
      padding: 15px 15px 15px 20px;
      display: flex;
      align-items: center;
      z-index: 2147483647;
    }
    
    #${scopeId} .el-message--success {
      background-color: #f0f9ff;
      border-color: #b3e19d;
      color: #67c23a;
    }
    
    #${scopeId} .el-message--error {
      background-color: #fef0f0;
      border-color: #fbc4c4;
      color: #f56c6c;
    }
  `
  
  shadowRoot.appendChild(style)
  console.log('Element Plus CSS 已使用内联样式加载到 Shadow DOM（已作用域化）')
}

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
  
  // 在Shadow DOM中动态加载Element Plus的CSS
  // await loadElementPlusCSSInShadow(shadowRoot)
  
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

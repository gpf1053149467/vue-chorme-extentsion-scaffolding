<template>
  <!-- Content script 不需要模板，所有逻辑都在 script 中处理 -->
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { addStyles } from './utils/styles.js'
import { EventHandler } from './components/eventHandler.js'

// 创建事件处理器实例
let eventHandler = null

// 生命周期
onMounted(async () => {
  // 添加样式
  addStyles()
  
  // 创建并初始化事件处理器
  eventHandler = new EventHandler()
  eventHandler.init()
})

onUnmounted(() => {
  // 销毁事件处理器
  if (eventHandler) {
    eventHandler.destroy()
    eventHandler = null
  }
})
</script>

<style scoped>
/* Content script 不需要样式，所有样式都通过 JavaScript 动态添加 */
</style>

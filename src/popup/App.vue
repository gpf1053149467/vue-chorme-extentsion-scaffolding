<template>
  <div class="popup-container">
    <el-card>
      <h2>Hello from Vue 3 + Element Plus!</h2>
      <div class="button-group">
        <el-button type="primary" @click="onClick">标注模式</el-button>
        <el-button type="success" @click="openSidePanel">打开侧边栏</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const onClick = async () => {
  ElMessage.success('你点击了按钮！')
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_ANNOTATION_MODE" });
}

const openSidePanel = async () => {
  try {
    await chrome.sidePanel.open({ windowId: (await chrome.windows.getCurrent()).id })
    ElMessage.success('侧边栏已打开！')
    // 关闭popup
    window.close()
  } catch (error) {
    ElMessage.error('打开侧边栏失败：' + error.message)
  }
}
</script>

<style scoped>
.popup-container {
  width: 400px;
  height: 300px;
  min-width: 350px;
  min-height: 250px;
  padding: 16px;
  box-sizing: border-box;
}

.popup-container .el-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.popup-container h2 {
  margin-bottom: 20px;
  text-align: center;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  .el-button+.el-button {
    margin-left: 0;
  }
}

.button-group .el-button {
  width: 100%;
}
</style>
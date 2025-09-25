<template>
  <div class="sidepanel-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>Vue3 侧边栏</span>
          <el-button type="primary" size="small" @click="openSidePanel">
            打开侧边栏
          </el-button>
        </div>
      </template>
      
      <div class="content">
        <h3>侧边栏功能</h3>
        <p>这是一个使用 Vue3 + Element Plus 构建的侧边栏界面</p>
        
        <el-divider />
        
        <div class="feature-list">
          <el-card v-for="feature in features" :key="feature.id" class="feature-card">
            <div class="feature-item">
              <el-icon :size="20">
                <component :is="feature.icon" />
              </el-icon>
              <span>{{ feature.name }}</span>
            </div>
            <p class="feature-desc">{{ feature.description }}</p>
          </el-card>
        </div>
        
        <el-divider />
        
        <div class="actions">
          <el-button type="success" @click="showSuccess">成功消息</el-button>
          <el-button type="warning" @click="showWarning">警告消息</el-button>
          <el-button type="danger" @click="showError">错误消息</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Setting, Tools, Star } from '@element-plus/icons-vue'

const features = ref([
  {
    id: 1,
    name: '文档管理',
    icon: Document,
    description: '管理和查看相关文档'
  },
  {
    id: 2,
    name: '设置配置',
    icon: Setting,
    description: '自定义扩展设置'
  },
  {
    id: 3,
    name: '工具集',
    icon: Tools,
    description: '各种实用工具'
  },
  {
    id: 4,
    name: '收藏功能',
    icon: Star,
    description: '收藏重要内容'
  }
])

const openSidePanel = () => {
  ElMessage.info('侧边栏已打开！')
}

const showSuccess = () => {
  ElMessage.success('操作成功！')
}

const showWarning = () => {
  ElMessage.warning('请注意！')
}

const showError = () => {
  ElMessage.error('操作失败！')
}
</script>

<style scoped>
.sidepanel-container {
  padding: 16px;
  height: 100vh;
  box-sizing: border-box;
}

.main-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.content h3 {
  margin: 0 0 16px 0;
  color: #409eff;
}

.content p {
  margin: 0 0 16px 0;
  color: #666;
  line-height: 1.5;
}

.feature-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 16px 0;
}

.feature-card {
  padding: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
}

.feature-desc {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.actions .el-button {
  flex: 1;
  min-width: 80px;
}
</style>

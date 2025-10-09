<template>
        <div
          v-if="visible"
          class="mark-chrome-ext-context-menu-overlay"
          @click="handleOverlayClick"
        >
          <div
            class="mark-chrome-ext-context-menu"
            :style="menuStyle"
            @click.stop
          >
            <div class="mark-chrome-ext-context-menu-item edit" @click="handleEdit">
              <span class="icon">✏️</span>
              <span class="text">编辑</span>
            </div>
            <div class="mark-chrome-ext-context-menu-item delete" @click="handleDelete">
              <span class="icon">🗑️</span>
              <span class="text">删除</span>
            </div>
          </div>
        </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  annotationInfo: {
    type: Object,
    default: () => ({ selector: '', text: '' })
  }
})

// Emits
const emit = defineEmits(['edit', 'delete', 'close', 'update:visible'])

// 响应式数据
const menuRef = ref(null)

// 计算菜单位置
const menuStyle = computed(() => {
  if (!props.position) {
    return {
      left: '10px',
      top: '10px'
    }
  }
  
  const { x, y } = props.position
  const menuWidth = 120
  const menuHeight = 80
  
  let left = x
  let top = y
  
  // 确保菜单不超出视窗右边界
  if (x + menuWidth > window.innerWidth) {
    left = window.innerWidth - menuWidth - 10
  }
  
  // 确保菜单不超出视窗下边界
  if (y + menuHeight > window.innerHeight) {
    top = y - menuHeight - 5
  }
  
  // 确保菜单不超出视窗左边界
  if (left < 10) {
    left = 10
  }
  
  // 确保菜单不超出视窗上边界
  if (top < 10) {
    top = 10
  }
  
  return {
    left: `${left}px`,
    top: `${top}px`
  }
})

// 处理编辑
const handleEdit = () => {
  const event = new CustomEvent('context-menu-event', {
    detail: { type: 'edit', detail: props.annotationInfo }
  })
  document.dispatchEvent(event)
}

// 处理删除
const handleDelete = () => {
  const event = new CustomEvent('context-menu-event', {
    detail: { type: 'delete', detail: props.annotationInfo }
  })
  document.dispatchEvent(event)
}

// 处理遮罩层点击
const handleOverlayClick = () => {
  const event = new CustomEvent('context-menu-event', {
    detail: { type: 'close' }
  })
  document.dispatchEvent(event)
}
</script>

<style scoped>
.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000000;
  background: transparent;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  overflow: hidden;
  z-index: 1000001;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.context-menu-item:last-child {
  border-bottom: none;
}

.context-menu-item:hover {
  background-color: #f8f9fa;
}

.context-menu-item.edit {
  color: #409eff;
}

.context-menu-item.edit:hover {
  background-color: #f0f9ff;
  color: #337ecc;
}

.context-menu-item.delete {
  color: #f56c6c;
}

.context-menu-item.delete:hover {
  background-color: #fef0f0;
  color: #f78989;
}

.context-menu-item .icon {
  margin-right: 8px;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.context-menu-item .text {
  font-weight: 500;
}

/* 动画效果 */
.context-menu {
  animation: contextMenuAppear 0.2s ease-out;
}

@keyframes contextMenuAppear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .context-menu {
    min-width: 100px;
  }
  
  .context-menu-item {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .context-menu-item .icon {
    font-size: 14px;
    margin-right: 6px;
  }
}
</style>

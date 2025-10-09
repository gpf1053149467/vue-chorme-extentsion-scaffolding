<template>
  <div v-if="visible" class="mark-chrome-ext-annotation-dialog-overlay" @click="handleOverlayClick">
    <div class="mark-chrome-ext-annotation-dialog" @click.stop>
      <div class="mark-chrome-ext-annotation-dialog-header">
        <h3>{{ title }}</h3>
        <button class="mark-chrome-ext-close-btn" @click="handleCancel">×</button>
      </div>
      
      <div class="mark-chrome-ext-annotation-dialog-body">
        <div class="mark-chrome-ext-form-group">
          <label>{{ label }}</label>
          <textarea 
            v-model="inputValue" 
            :placeholder="placeholder"
            rows="3"
            class="mark-chrome-ext-annotation-input"
            ref="inputRef"
            @keydown.enter.ctrl="handleConfirm"
            @keydown.escape="handleCancel"
          ></textarea>
        </div>
      </div>
      
      <div class="mark-chrome-ext-annotation-dialog-footer">
        <button class="mark-chrome-ext-btn mark-chrome-ext-btn-cancel" @click="handleCancel">取消</button>
        <button class="mark-chrome-ext-btn mark-chrome-ext-btn-confirm" @click="handleConfirm" :disabled="!inputValue.trim()">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '添加标注'
  },
  label: {
    type: String,
    default: '请输入该元素的说明：'
  },
  placeholder: {
    type: String,
    default: '请输入标注内容...'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  initialValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'add', // add, edit, delete
    validator: (value) => ['add', 'edit', 'delete'].includes(value)
  }
})

// Emits
const emit = defineEmits(['confirm', 'cancel', 'update:visible'])

// 响应式数据
const inputValue = ref('')
const inputRef = ref(null)

// 监听visible变化，自动聚焦输入框
watch(() => props.visible, (newVal) => {
  if (newVal) {
    inputValue.value = props.initialValue
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus()
        inputRef.value.select()
      }
    })
  }
})

// 监听initialValue变化
watch(() => props.initialValue, (newVal) => {
  inputValue.value = newVal
})

// 处理确认
const handleConfirm = () => {
  if (!inputValue.value.trim()) return
  
  // 发送自定义DOM事件
  const event = new CustomEvent('annotation-dialog-event', {
    detail: { type: 'confirm', value: inputValue.value.trim() }
  })
  document.dispatchEvent(event)
  
  emit('confirm', inputValue.value.trim())
  emit('update:visible', false)
}

// 处理取消
const handleCancel = () => {
  // 发送自定义DOM事件
  const event = new CustomEvent('annotation-dialog-event', {
    detail: { type: 'cancel' }
  })
  document.dispatchEvent(event)
  
  emit('cancel')
  emit('update:visible', false)
}

// 处理遮罩层点击
const handleOverlayClick = () => {
  handleCancel()
}
</script>

<style scoped>
.annotation-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.annotation-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  min-width: 400px;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
}

.annotation-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.annotation-dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e5e5;
  color: #666;
}

.annotation-dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.annotation-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.annotation-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.annotation-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.btn-cancel:hover {
  background: #e5e5e5;
  color: #333;
}

.btn-confirm {
  background: #409eff;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #337ecc;
}

.btn-confirm:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}

/* 删除确认对话框样式 */
.annotation-dialog.delete .annotation-dialog-header {
  background: #fef0f0;
  border-bottom-color: #fbc4c4;
}

.annotation-dialog.delete .annotation-dialog-header h3 {
  color: #f56c6c;
}

.annotation-dialog.delete .annotation-dialog-footer {
  background: #fef0f0;
  border-top-color: #fbc4c4;
}

.annotation-dialog.delete .btn-confirm {
  background: #f56c6c;
}

.annotation-dialog.delete .btn-confirm:hover:not(:disabled) {
  background: #f78989;
}

/* 编辑对话框样式 */
.annotation-dialog.edit .annotation-dialog-header {
  background: #f0f9ff;
  border-bottom-color: #b3d8ff;
}

.annotation-dialog.edit .annotation-dialog-header h3 {
  color: #409eff;
}

.annotation-dialog.edit .annotation-dialog-footer {
  background: #f0f9ff;
  border-top-color: #b3d8ff;
}
</style>

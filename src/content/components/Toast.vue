<template>
  <transition name="toast-fade">
    <div v-if="visible" class="mark-chrome-ext-toast" :class="type">
      <span class="icon">{{ icon }}</span>
      <span class="message">{{ message }}</span>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info', // success, warning, error, info
    validator: (value) => ['success', 'warning', 'error', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const visible = ref(false)
const icon = ref('')

const icons = {
  success: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️'
}

onMounted(() => {
  icon.value = icons[props.type]
  visible.value = true
  
  if (props.duration > 0) {
    setTimeout(() => {
      visible.value = false
    }, props.duration)
  }
})
</script>

<style scoped>
.mark-chrome-ext-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2147483647;
  font-size: 14px;
  min-width: 300px;
  pointer-events: none;
  background: white;
  border: 1px solid #ebeef5;
}

.mark-chrome-ext-toast.success {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}

.mark-chrome-ext-toast.warning {
  background-color: #fdf6ec;
  border-color: #faecd8;
  color: #e6a23c;
}

.mark-chrome-ext-toast.error {
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
}

.mark-chrome-ext-toast.info {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>

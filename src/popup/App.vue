<template>
  <el-card>
    <h2>Hello from Vue 3 + Element Plus!</h2>
    <el-button type="primary" @click="onClick">点击我1js</el-button>
  </el-card>
</template>

<script setup>
const onClick = () => {
  ElMessage.success('你点击了按钮！')
}
</script>
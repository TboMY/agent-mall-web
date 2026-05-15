<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
  
</template>

<style scoped>
:global(body) {
  margin: 0;
  background: #f7f3ea;
  color: #132337;
  font-family: "Trebuchet MS", "Microsoft YaHei UI", "PingFang SC", sans-serif;
}

:global(#app) {
  min-height: 100vh;
}

:global(.el-container) { min-height: 100vh; }
:global(.page-container) { max-width: 1280px; margin: 0 auto; padding: 0 20px; overflow: visible }
</style>


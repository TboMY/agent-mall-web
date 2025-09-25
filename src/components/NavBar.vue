<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

function to(path) { router.push(path) }
</script>

<template>
  <el-header height="auto" class="navbar">
    <div class="center page-container">
      <div class="logo" @click="to('/')">Agent Mall</div>
      <el-menu :default-active="route.path" mode="horizontal" router background-color="transparent" class="menu" :ellipsis="false">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/hot-products">热点商品</el-menu-item>
        <el-menu-item index="/categories" disabled>商品分类</el-menu-item>
        <el-menu-item index="/cart" disabled>购物车</el-menu-item>
        <el-menu-item index="/profile" disabled>我的</el-menu-item>
      </el-menu>
    </div>
  </el-header>
</template>

<style scoped>
.navbar { padding: 8px 16px; position: sticky; top: 0; z-index: 1000; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; width: 100%; }
.logo {
  font-weight: 700;
  cursor: pointer;
}
.menu { justify-content: center; border-bottom: none; }
@media (max-width: 768px) {
  .menu :deep(.el-menu-item) { padding: 0 8px; }
}
</style>



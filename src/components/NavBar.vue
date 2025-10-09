<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'
import SearchOverlay from '@/components/SearchOverlay.vue'

const router = useRouter()
const route = useRoute()

function to(path) { router.push(path) }

const showSearch = ref(false)
</script>

<template>
  <el-header height="auto" class="navbar">
    <div class="center page-container">
      <div class="logo" @click="to('/')">Agent Mall</div>
      <el-menu :default-active="route.path" mode="horizontal" router background-color="transparent" class="menu" :ellipsis="false">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/hot-products">热点商品</el-menu-item>
        <el-menu-item index="/categories">商品分类</el-menu-item>
        <el-menu-item index="/cart" disabled>购物车</el-menu-item>
        <el-menu-item index="/profile" disabled>我的</el-menu-item>
        <button class="search-btn" aria-label="搜索" @click.stop="showSearch = true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </button>
      </el-menu>
    </div>
    <SearchOverlay v-model="showSearch" />
  </el-header>
</template>

<style scoped>
.navbar { padding: 8px 16px; position: sticky; top: 0; z-index: 1000; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; width: 100%; }
.logo {
  font-weight: 700;
  cursor: pointer;
}
.menu { justify-content: center; border-bottom: none; position: relative; }
.search-btn {
  position: absolute; left: calc(100% + 200px); top: 50%; transform: translateY(-50%);
  width: 36px; height: 36px; border-radius: 18px; border: none; background: #f5f7fa; color: #606266;
  display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;
}
.search-btn:hover { background: #eef2f6; }
@media (max-width: 768px) {
  .menu :deep(.el-menu-item) { padding: 0 8px; }
}
</style>



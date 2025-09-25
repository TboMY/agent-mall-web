<script setup>
import { useRouter, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'

const router = useRouter()
const auth = useAuthStore()
const active = ref('dashboard')

function handleSelect(key) {
  if (key === 'logout') {
    auth.logout()
    router.replace('/admin/login')
    return
  }
  router.push(`/admin/${key}`)
}

function onUserCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    router.replace('/admin/login')
  }
}
</script>

<template>
  <el-container style="min-height: 100vh;">
    <el-aside width="220px" style="border-right:1px solid #ebeef5;">
      <div style="height:56px; display:flex; align-items:center; justify-content:center; font-weight:700;">Admin</div>
      <el-menu :default-active="active" @select="handleSelect" :router="false" unique-opened>
        <el-menu-item index="dashboard">首页</el-menu-item>
        <el-sub-menu index="products">
          <template #title>商品</template>
          <el-menu-item index="products/ai-hot">AI热点选品</el-menu-item>
          <el-menu-item index="products/list">商品列表</el-menu-item>
          <el-menu-item index="products/add">添加商品</el-menu-item>
          <el-menu-item index="products/categories">商品分类</el-menu-item>
          <el-menu-item index="products/types">商品类型</el-menu-item>
          <el-menu-item index="products/brands">品牌管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="permissions">权限</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header height="56px" style="display:flex; align-items:center; justify-content:space-between; padding:0 16px; border-bottom:1px solid #ebeef5;">
        <div>管理员后台</div>
        <div>
          <el-dropdown @command="onUserCommand">
            <span class="el-dropdown-link" style="display:flex; align-items:center; cursor:pointer;">
              <el-avatar size="small" src="https://tse3.mm.bing.net/th/id/OIP.g9UbVfyVZX-SfD09JcYr5QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3" />
              <span style="margin-left:8px;">Admin</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="page-container">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>



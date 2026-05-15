<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <img src="/favicon.ico" alt="Logo" v-if="!isCollapse">
        <span v-if="!isCollapse">AI商城管理</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/admin/dashboard" v-if="auth.hasPermission('dashboard.view')">
          <el-icon><House /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        
        <el-sub-menu index="mall" v-if="hasMallMenu">
          <template #title>
            <el-icon><Shop /></el-icon>
            <span>商城运营</span>
          </template>
          <el-menu-item index="/admin/products/list" v-if="auth.hasPermission('products.view')">商品列表</el-menu-item>
          <el-menu-item index="/admin/products/add" v-if="auth.hasPermission('products.manage')">添加商品</el-menu-item>
          <el-menu-item index="/admin/categories/list" v-if="auth.hasPermission('categories.manage')">分类管理</el-menu-item>
          <el-menu-item index="/admin/brands/list" v-if="auth.hasPermission('brands.manage')">品牌管理</el-menu-item>
          <el-menu-item index="/admin/product-types/list" v-if="auth.hasPermission('productTypes.manage')">规格模板</el-menu-item>
          <el-menu-item index="/admin/homepage-display" v-if="auth.hasPermission('systemConfigs.manage')">首页展示</el-menu-item>
          <el-menu-item index="/admin/mall-users" v-if="auth.hasPermission('mallUsers.view')">商城用户</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="orders" v-if="hasOrderMenu">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>订单</span>
          </template>
          <el-menu-item index="/admin/orders/list" v-if="auth.hasPermission('orders.view')">订单列表</el-menu-item>
          <el-menu-item index="/admin/orders/returns" v-if="auth.hasPermission('orders.manage')">退货申请处理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="ai" v-if="auth.hasPermission('aiWorkbench.view')">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>AI 选品</span>
          </template>
          <el-menu-item index="/admin/ai-workbench/products">候选商品审核</el-menu-item>
          <el-menu-item index="/admin/ai-workbench/settings" v-if="auth.hasPermission('systemConfigs.manage')">工作台设置</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="permissions" v-if="hasPermissionMenu">
          <template #title>
            <el-icon><Lock /></el-icon>
            <span>权限</span>
          </template>
          <el-menu-item index="/admin/permissions/users" v-if="auth.hasPermission('users.manage')">用户列表</el-menu-item>
          <el-menu-item index="/admin/permissions/roles" v-if="auth.hasPermission('roles.manage')">角色列表</el-menu-item>
        </el-sub-menu>
        
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-button 
            type="text" 
            @click="toggleCollapse"
            class="collapse-btn"
          >
            <el-icon><Expand v-if="isCollapse" /><Fold v-else /></el-icon>
          </el-button>
          
          <el-breadcrumb separator="/">
            <el-breadcrumb-item 
              v-for="item in breadcrumbs" 
              :key="item.path"
              :to="item.path"
            >
              {{ item.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><Avatar /></el-icon>
              <span>{{ currentUserName }}</span>
              <el-tag size="small" type="info">{{ currentUserRole }}</el-tag>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isCollapse = ref(false)

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

const currentUserName = computed(() => auth.displayName)
const currentUserRole = computed(() => auth.roleLabel)
const hasMallMenu = computed(() => (
  auth.hasPermission('products.view')
  || auth.hasPermission('products.manage')
  || auth.hasPermission('categories.manage')
  || auth.hasPermission('brands.manage')
  || auth.hasPermission('productTypes.manage')
  || auth.hasPermission('systemConfigs.manage')
  || auth.hasPermission('mallUsers.view')
))
const hasOrderMenu = computed(() => (
  auth.hasPermission('orders.view')
  || auth.hasPermission('orders.manage')
))
const hasPermissionMenu = computed(() => (
  auth.hasPermission('users.manage')
  || auth.hasPermission('roles.manage')
))

// 面包屑导航
const breadcrumbs = computed(() => {
  const pathArray = route.path.split('/').filter(Boolean)
  const breadcrumbList = []
  
  let currentPath = ''
  pathArray.forEach((segment, index) => {
    currentPath += `/${segment}`
    const name = getBreadcrumbName(segment, index)
    if (name) {
      breadcrumbList.push({
        name,
        path: currentPath
      })
    }
  })
  
  return breadcrumbList
})

// 获取面包屑名称
function getBreadcrumbName(segment, index) {
  const nameMap = {
    'admin': '管理后台',
    'dashboard': '仪表盘',
    'mall-users': '商城用户',
    'products': '商品',
    'list': '列表',
    'add': '添加',
    'edit': '编辑',
    'ai-workbench': 'AI 选品工作台',
    'categories': '分类管理',
    'brands': '品牌管理',
    'product-types': '规格模板',
    'homepage-display': '首页展示',
    'orders': '订单管理',
    'returns': '退货申请处理',
    'permissions': '权限',
    'users': '用户列表',
    'roles': '角色列表',
    'settings': '系统设置',
    'forbidden': '权限受限'
  }
  
  return nameMap[segment] || segment
}

// 切换侧边栏折叠状态
function toggleCollapse() {
  isCollapse.value = !isCollapse.value
}

// 退出登录
function logout() {
  auth.logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #434a50;
}

.logo img {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 20px;
  font-size: 18px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-info span {
  margin: 0 4px;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}

/* 菜单样式覆盖 */
:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: #263445 !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #409EFF !important;
  color: #fff !important;
}
</style>

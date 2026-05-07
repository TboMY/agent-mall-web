# 基于大语言模型的智能选品系统 - 前端代码

## 项目概述

随着抖音等短视频平台的迅猛发展，用户生成内容已成为新兴消费趋势的重要来源。本系统设计并实现了一套基于大语言模型的智能选品系统，能够从热门短视频中自动挖掘高潜力商品。

系统首先通过关键词策略爬取视频元数据，随后利用大语言模型(LLM)过滤非商业内容，并提取商品名称、分类及推荐理由等关键信息。最后，系统计算商品热度评分，并推送至人工审核工作台。审核通过的商品将自动上架至商城前台。

该系统采用前后端分离架构，前端使用Vue.js 3 + Element Plus构建用户界面，后端使用Node.js + Express提供API服务，数据库使用MySQL存储业务数据。

## 技术栈

- **前端框架**: Vue.js 3.4
- **UI组件库**: Element Plus 2.11
- **状态管理**: Pinia 2.1
- **路由**: Vue Router 4.3
- **HTTP客户端**: Axios 1.12
- **构建工具**: Vite 5.1
- **图标**: @element-plus/icons-vue

## 项目结构

```
agent-mall-web/
├── public/              # 静态资源
│   └── favicon.ico
├── src/                 # 源代码目录
│   ├── assets/          # 样式资源
│   │   ├── base.css
│   │   └── main.css
│   ├── components/      # 公共组件
│   │   ├── AIHotProducts.vue
│   │   ├── CategoryMegaMenu.vue
│   │   ├── MainCarousel.vue
│   │   ├── NavBar.vue
│   │   ├── ProductCard.vue
│   │   ├── QuickCategoryGrid.vue
│   │   ├── SearchOverlay.vue
│   │   ├── SiteFooter.vue
│   │   └── copy.vue
│   ├── mock/            # 模拟数据
│   │   └── data.js
│   ├── router/          # 路由配置
│   │   └── index.js
│   ├── services/        # API服务
│   │   └── api.js
│   ├── stores/          # 状态管理
│   │   └── auth.js
│   ├── views/           # 页面视图
│   │   ├── admin/       # 后台管理
│   │   │   ├── ai-workbench/
│   │   │   │   ├── AIProductsReview.vue
│   │   │   │   ├── AIWorkbenchLayout.vue
│   │   │   │   └── AIWorkbenchSettings.vue
│   │   │   ├── AdminLayout.vue
│   │   │   ├── AttributeValueManager.vue
│   │   │   ├── BrandList.vue
│   │   │   ├── CategoryList.vue
│   │   │   ├── Login.vue
│   │   │   ├── ProductAttributeManager.vue
│   │   │   ├── ProductForm.vue
│   │   │   ├── ProductList.vue
│   │   │   └── ProductTypeList.vue
│   │   ├── AdminAgentView.vue
│   │   ├── CategoriesView.vue
│   │   ├── HomeView.vue
│   │   ├── HotProductsView.vue
│   │   └── ProductDetailView.vue
│   ├── App.vue
│   └── main.js
├── index.html
├── jsconfig.json
├── package.json
└── vite.config.js
```

## 快速开始

```sh
npm install
npm run dev
npm run build
```

---

# 源代码

## 一、配置文件

### 1.1 package.json

```json
{
  "name": "agent-mall-web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@element-plus/icons-vue": "^2.3.1",
    "axios": "^1.12.2",
    "element-plus": "^2.11.1",
    "pinia": "^2.1.7",
    "vue": "^3.4.21",
    "vue-router": "^4.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "vite": "^5.1.6"
  }
}
```

### 1.2 vite.config.js

```javascript
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

### 1.3 jsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "exclude": ["node_modules", "dist"]
}
```

### 1.4 index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

---

## 二、入口文件

### 2.1 src/main.js

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
```

### 2.2 src/App.vue

```vue
<template>
  <router-view />
</template>

<script setup>
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
```

---

## 三、路由配置

### 3.1 src/router/index.js

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/hot-products',
      name: 'hot-products',
      component: () => import('../views/HotProductsView.vue')
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('../views/CategoriesView.vue')
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('../views/ProductDetailView.vue')
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/admin/products'
        },
        {
          path: 'login',
          component: () => import('../views/admin/Login.vue')
        },
        {
          path: 'products',
          component: () => import('../views/admin/ProductList.vue')
        },
        {
          path: 'products/add',
          component: () => import('../views/admin/ProductForm.vue')
        },
        {
          path: 'products/edit/:id',
          component: () => import('../views/admin/ProductForm.vue')
        },
        {
          path: 'brands',
          component: () => import('../views/admin/BrandList.vue')
        },
        {
          path: 'categories',
          component: () => import('../views/admin/CategoryList.vue')
        },
        {
          path: 'product-types',
          component: () => import('../views/admin/ProductTypeList.vue')
        },
        {
          path: 'ai-workbench',
          component: () => import('../views/admin/ai-workbench/AIWorkbenchLayout.vue'),
          children: [
            {
              path: '',
              redirect: '/admin/ai-workbench/products'
            },
            {
              path: 'products',
              component: () => import('../views/admin/ai-workbench/AIProductsReview.vue')
            },
            {
              path: 'settings',
              component: () => import('../views/admin/ai-workbench/AIWorkbenchSettings.vue')
            }
          ]
        }
      ]
    }
  ]
})

export default router
```

---

## 四、API服务

### 4.1 src/services/api.js

```javascript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// 商品API
export const productAPI = {
  getProducts: (params) => apiClient.get('/products', { params }),
  getProduct: (id) => apiClient.get(`/products/${id}`),
  createProduct: (data) => apiClient.post('/products', data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),
  getHotProducts: () => apiClient.get('/products/hot'),
  getProductsByCategory: (categoryId) => apiClient.get(`/products/category/${categoryId}`)
}

// 分类API
export const categoryAPI = {
  getCategories: () => apiClient.get('/categories'),
  getCategoryTree: () => apiClient.get('/categories/tree'),
  getCategory: (id) => apiClient.get(`/categories/${id}`),
  createCategory: (data) => apiClient.post('/categories', data),
  updateCategory: (id, data) => apiClient.put(`/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`)
}

// 品牌API
export const brandAPI = {
  getBrands: () => apiClient.get('/brands'),
  getBrand: (id) => apiClient.get(`/brands/${id}`),
  createBrand: (data) => apiClient.post('/brands', data),
  updateBrand: (id, data) => apiClient.put(`/brands/${id}`, data),
  deleteBrand: (id) => apiClient.delete(`/brands/${id}`)
}

// 商品类型API
export const productTypeAPI = {
  getList: (params) => apiClient.get('/product-types', { params }),
  get: (id) => apiClient.get(`/product-types/${id}`),
  create: (data) => apiClient.post('/product-types', data),
  update: (id, data) => apiClient.put(`/product-types/${id}`, data),
  delete: (id) => apiClient.delete(`/product-types/${id}`)
}

// 商品属性API
export const productAttributeAPI = {
  getByProductType: (productTypeId) => apiClient.get(`/product-types/${productTypeId}/attributes`),
  create: (data) => apiClient.post('/product-attributes', data),
  update: (id, data) => apiClient.put(`/product-attributes/${id}`, data),
  delete: (id) => apiClient.delete(`/product-attributes/${id}`),
  getValues: (attributeId) => apiClient.get(`/product-attributes/${attributeId}/values`),
  createValue: (attributeId, data) => apiClient.post(`/product-attributes/${attributeId}/values`, data),
  updateValue: (id, data) => apiClient.put(`/product-attribute-values/${id}`, data),
  deleteValue: (id) => apiClient.delete(`/product-attribute-values/${id}`)
}

// AI候选商品API
export const aiCandidateAPI = {
  getCandidates: (params) => apiClient.get('/ai-candidates', { params }),
  getCandidate: (id) => apiClient.get(`/ai-candidates/${id}`),
  updateStatus: (id, status) => apiClient.patch(`/ai-candidates/${id}/status`, { status }),
  deleteCandidate: (id) => apiClient.delete(`/ai-candidates/${id}`),
  convertToProduct: (id, data) => apiClient.post(`/ai-candidates/${id}/convert`, data)
}

// 系统配置API
export const systemConfigAPI = {
  getAIWorkbenchConfig: () => apiClient.get('/system-configs/ai-workbench'),
  saveAIWorkbenchConfig: (data) => apiClient.post('/system-configs/ai-workbench', data)
}

// 抖音视频API
export const awemeAPI = {
  analyze: () => apiClient.post('/aweme/analyze')
}

export default apiClient
```

---

## 五、状态管理

### 5.1 src/stores/auth.js

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUser(newUser) {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function isAuthenticated() {
    return !!token.value
  }

  return {
    token,
    user,
    setToken,
    setUser,
    logout,
    isAuthenticated
  }
})
```

---

## 六、模拟数据

### 6.1 src/mock/data.js

```javascript
// 模拟商品数据
export const mockProducts = [
  {
    id: 1,
    name: '智能手表 Pro',
    description: '最新款智能手表，支持心率监测、血氧检测',
    price: 2999,
    originalPrice: 3999,
    image: 'https://picsum.photos/400/400?random=1',
    category: '智能穿戴',
    brand: 'TechBrand',
    sales: 1500,
    rating: 4.8,
    isAIRecommended: true,
    hotScore: 95
  },
  {
    id: 2,
    name: '无线降噪耳机',
    description: '主动降噪，40小时超长续航',
    price: 899,
    originalPrice: 1299,
    image: 'https://picsum.photos/400/400?random=2',
    category: '数码配件',
    brand: 'AudioPro',
    sales: 2300,
    rating: 4.6,
    isAIRecommended: true,
    hotScore: 88
  },
  {
    id: 3,
    name: '机械键盘 RGB',
    description: 'Cherry轴体，全键无冲',
    price: 599,
    originalPrice: 799,
    image: 'https://picsum.photos/400/400?random=3',
    category: '电脑配件',
    brand: 'KeyboardMaster',
    sales: 1800,
    rating: 4.7,
    isAIRecommended: false,
    hotScore: 75
  }
]

// 模拟分类数据
export const mockCategories = [
  {
    id: 1,
    name: '数码产品',
    icon: '📱',
    children: [
      { id: 11, name: '手机通讯' },
      { id: 12, name: '电脑办公' },
      { id: 13, name: '数码配件' }
    ]
  },
  {
    id: 2,
    name: '服饰鞋包',
    icon: '👕',
    children: [
      { id: 21, name: '男装' },
      { id: 22, name: '女装' },
      { id: 23, name: '运动鞋' }
    ]
  },
  {
    id: 3,
    name: '家居生活',
    icon: '🏠',
    children: [
      { id: 31, name: '厨房用品' },
      { id: 32, name: '床上用品' }
    ]
  }
]

// 模拟轮播图数据
export const mockBanners = [
  {
    id: 1,
    title: 'AI精选爆款',
    image: 'https://picsum.photos/1200/400?random=1',
    link: '/hot-products'
  },
  {
    id: 2,
    title: '新品上市',
    image: 'https://picsum.photos/1200/400?random=2',
    link: '/categories'
  }
]

// 模拟品牌数据
export const mockBrands = [
  { id: 1, name: 'TechBrand', logo: 'https://picsum.photos/100/50?random=1' },
  { id: 2, name: 'AudioPro', logo: 'https://picsum.photos/100/50?random=2' },
  { id: 3, name: 'KeyboardMaster', logo: 'https://picsum.photos/100/50?random=3' }
]
```

---

## 七、样式文件

### 7.1 src/assets/base.css

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  color: #333;
}

a {
  text-decoration: none;
  color: inherit;
}

ul, ol {
  list-style: none;
}

img {
  max-width: 100%;
  height: auto;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
}

input, textarea {
  outline: none;
  border: 1px solid #ddd;
}
```

### 7.2 src/assets/main.css

```css
@import './base.css';

/* 容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 页面容器 */
.page-container {
  min-height: calc(100vh - 60px);
  padding: 20px 0;
}

/* 文本工具类 */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* 间距工具类 */
.mt-10 { margin-top: 10px; }
.mt-20 { margin-top: 20px; }
.mt-30 { margin-top: 30px; }
.mb-10 { margin-bottom: 10px; }
.mb-20 { margin-bottom: 20px; }
.mb-30 { margin-bottom: 30px; }

/* Flex 工具类 */
.flex { display: flex; }
.flex-center { display: flex; justify-content: center; align-items: center; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.flex-wrap { flex-wrap: wrap; }

/* 网格布局 */
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

/* 响应式 */
@media (max-width: 1200px) {
  .grid-4 { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .grid-4, .grid-3 { grid-template-columns: repeat(2, 1fr); }
```

---

## 十、 其他后台管理视图

### 10.8 src/views/admin/CategoryList.vue (分类管理核心代码)

```vue
<template>
  <div class="category-management">
    <div class="page-header">
      <h1>分类管理</h1>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <el-table :data="filteredCategories" v-loading="loading" row-key="id">
      <el-table-column prop="name" label="分类名称" width="200" />
      <el-table-column prop="level" label="层级" width="80">
        <template #default="{ row }">
          <el-tag :type="getLevelTagType(row.level)">
            {{ getLevelText(row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="editCategory(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteCategory(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { categoryAPI } from '@/services/api'

const loading = ref(false)
const categories = ref([])

const filteredCategories = computed(() => categories.value)

const loadCategories = async () => {
  loading.value = true
  try {
    const response = await categoryAPI.getCategoryTree()
    if (response.success) {
      categories.value = response.data
    }
  } finally {
    loading.value = false
  }
}

const getLevelTagType = (level) => {
  const types = { 1: 'primary', 2: 'success', 3: 'warning' }
  return types[level] || 'info'
}

const getLevelText = (level) => {
  const texts = { 1: '一级', 2: '二级', 3: '三级' }
  return texts[level] || '未知'
}

onMounted(() => {
  loadCategories()
})
</script>
```

### 10.9 src/views/admin/BrandList.vue (品牌管理核心代码)

```vue
<template>
  <div class="brand-management">
    <div class="page-header">
      <h1>品牌管理</h1>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        新增品牌
      </el-button>
    </div>

    <el-table :data="filteredBrands" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="品牌名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="editBrand(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteBrand(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { brandAPI } from '@/services/api'

const loading = ref(false)
const brands = ref([])

const filteredBrands = computed(() => brands.value)

const loadBrands = async () => {
  loading.value = true
  try {
    const response = await brandAPI.getBrands()
    if (response.success) {
    brands.value = response.data
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadBrands()
})
</script>
```

---

## 十、 项目总结

本项目是一个完整的基于Vue.js 3的智能选品系统前端应用，主要特点包括:

1. **现代化技术栈**: 使用Vue 3 + Vite + Element Plus + Pinia
2. **模块化设计**: 组件化开发，代码结构清晰
3. **AI驱动**: 集成AI智能选品功能
4. **人机协同**: AI推荐 + 人工审核的工作流
5. **完整的商城功能**: 包含商品展示、分类浏览、搜索等

项目已完整实现，可直接用于毕业设计展示和实际部署。
  .grid-2 { grid-template-columns: 1fr; }
}
```

---

## 八、公共组件

### 8.1 src/components/NavBar.vue

```vue
<template>
  <header class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/">
          <span class="logo">🛒 Agent Mall</span>
        </router-link>
      </div>

      <nav class="navbar-menu">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/hot-products" class="nav-link">🔥 AI爆款</router-link>
        <CategoryMegaMenu />
      </nav>

      <div class="navbar-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索商品..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <router-link to="/admin" class="admin-link">
          <el-button type="primary">管理后台</el-button>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import CategoryMegaMenu from './CategoryMegaMenu.vue'

const router = useRouter()
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/', query: { search: searchQuery.value } })
  }
}
</script>

<style scoped>
.navbar {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand .logo {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-link {
  color: #333;
  font-size: 16px;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #409eff;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-input {
  width: 250px;
}
</style>
```

### 8.2 src/components/SiteFooter.vue

```vue
<template>
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-section">
        <h4>关于我们</h4>
        <p>基于大语言模型的智能选品系统</p>
      </div>
      <div class="footer-section">
        <h4>联系方式</h4>
        <p>Email: contact@agentmall.com</p>
      </div>
      <div class="footer-section">
        <h4>技术支持</h4>
        <p>Vue.js 3 + Element Plus</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2024 Agent Mall. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.site-footer {
  background: #2c3e50;
  color: #fff;
  padding: 40px 0 20px;
  margin-top: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-section h4 {
  margin-bottom: 15px;
  font-size: 18px;
}

.footer-section p {
  color: #aaa;
  line-height: 1.8;
}

.footer-bottom {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #3d4f5f;
  color: #888;
}
</style>
```

### 8.3 src/components/ProductCard.vue

```vue
<template>
  <div class="product-card" @click="goToDetail">
    <div class="product-image">
      <el-image :src="product.image" fit="cover" />
      <div v-if="product.isAIRecommended" class="ai-badge">AI推荐</div>
      <div v-if="product.hotScore >= 90" class="hot-badge">爆款</div>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-desc">{{ product.description }}</p>
      <div class="product-price">
        <span class="current-price">¥{{ product.price }}</span>
        <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
      </div>
      <div class="product-meta">
        <span>销量: {{ product.sales }}</span>
        <span>评分: {{ product.rating }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
}
</script>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  height: 200px;
}

.product-image .el-image {
  width: 100%;
  height: 100%;
}

.ai-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #67c23a;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.hot-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f56c6c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  color: #999;
  font-size: 14px;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  margin-bottom: 10px;
}

.current-price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}

.original-price {
  color: #999;
  font-size: 14px;
  text-decoration: line-through;
  margin-left: 10px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  color: #999;
  font-size: 12px;
}
</style>
```

### 8.4 src/components/AIHotProducts.vue

```vue
<template>
  <section class="ai-hot-products">
    <div class="section-header">
      <h2>🔥 AI今日爆款推荐</h2>
      <router-link to="/hot-products" class="view-all">查看全部 ></router-link>
    </div>
    <div class="products-grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProductCard from './ProductCard.vue'
import { productAPI } from '@/services/api'

const products = ref([])

onMounted(async () => {
  try {
    const response = await productAPI.getHotProducts()
    if (response.success) {
      products.value = response.data.slice(0, 8)
    }
  } catch (error) {
    console.error('获取AI爆款商品失败:', error)
  }
})
</script>

<style scoped>
.ai-hot-products {
  margin: 40px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 24px;
  color: #333;
}

.view-all {
  color: #409eff;
  font-size: 14px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .products-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
```

### 8.5 src/components/MainCarousel.vue

```vue
<template>
  <div class="main-carousel">
    <el-carousel height="400px" :interval="5000">
      <el-carousel-item v-for="banner in banners" :key="banner.id">
        <router-link :to="banner.link" class="carousel-link">
          <el-image :src="banner.image" fit="cover" class="carousel-image" />
          <div class="carousel-title">{{ banner.title }}</div>
        </router-link>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { mockBanners } from '@/mock/data'

const banners = ref(mockBanners)

onMounted(async () => {
  // 可以从API获取轮播图数据
})
</script>

<style scoped>
.main-carousel {
  margin-bottom: 30px;
}

.carousel-link {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-image {
  width: 100%;
  height: 100%;
}

.carousel-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
  font-size: 24px;
}
</style>
```

### 8.6 src/components/CategoryMegaMenu.vue

```vue
<template>
  <el-dropdown trigger="hover" @command="handleCategorySelect">
    <span class="category-trigger">
      全部分类 <el-icon><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <div class="mega-menu">
        <div class="mega-menu-content">
          <div v-for="category in categories" :key="category.id" class="category-column">
            <h4>{{ category.icon }} {{ category.name }}</h4>
            <div class="sub-categories">
              <el-dropdown-item
                v-for="sub in category.children"
                :key="sub.id"
                :command="sub.id"
              >
                {{ sub.name }}
              </el-dropdown-item>
            </div>
          </div>
        </div>
      </div>
    </template>
  </el-dropdown>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { categoryAPI } from '@/services/api'

const router = useRouter()
const categories = ref([])

onMounted(async () => {
  try {
    const response = await categoryAPI.getCategories()
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
})

const handleCategorySelect = (categoryId) => {
  router.push({ path: '/categories', query: { category: categoryId } })
}
</script>

<style scoped>
.category-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #333;
}

.mega-menu {
  padding: 20px;
}

.mega-menu-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  min-width: 600px;
}

.category-column h4 {
  margin-bottom: 10px;
  color: #333;
  font-size: 16px;
}

.sub-categories {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
```

### 8.7 src/components/QuickCategoryGrid.vue

```vue
<template>
  <div class="quick-category-grid">
    <div
      v-for="category in categories"
      :key="category.id"
      class="category-item"
      @click="goToCategory(category.id)"
    >
      <span class="category-icon">{{ category.icon }}</span>
      <span class="category-name">{{ category.name }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categoryAPI } from '@/services/api'

const router = useRouter()
const categories = ref([])

onMounted(async () => {
  try {
    const response = await categoryAPI.getCategories()
    if (response.success) {
      categories.value = response.data.slice(0, 10)
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
})

const goToCategory = (categoryId) => {
  router.push({ path: '/categories', query: { category: categoryId } })
}
</script>

<style scoped>
.quick-category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin: 20px 0;
}

.category-item {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 10px;
}

.category-name {
  font-size: 14px;
  color: #333;
}
</style>
```

---

## 九、页面视图

### 9.1 src/views/HomeView.vue

```vue
<template>
  <div class="home-view">
    <NavBar />
    <main class="main-content">
      <div class="container">
        <MainCarousel />
        <QuickCategoryGrid />
        <AIHotProducts />
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import MainCarousel from '@/components/MainCarousel.vue'
import QuickCategoryGrid from '@/components/QuickCategoryGrid.vue'
import AIHotProducts from '@/components/AIHotProducts.vue'
import SiteFooter from '@/components/SiteFooter.vue'
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

.main-content {
  padding: 20px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>
```

### 9.2 src/views/HotProductsView.vue

```vue
<template>
  <div class="hot-products-view">
    <NavBar />
    <main class="main-content">
      <div class="container">
        <h1>🔥 AI爆款推荐</h1>
        <p class="subtitle">基于大语言模型智能分析，为您精选高热度商品</p>
        <div class="products-grid">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>
        <div v-if="loading" class="loading">
          <el-spinner />
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ProductCard from '@/components/ProductCard.vue'
import { productAPI } from '@/services/api'

const products = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const response = await productAPI.getHotProducts()
    if (response.success) {
      products.value = response.data
    }
  } catch (error) {
    console.error('获取爆款商品失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hot-products-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  padding: 40px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
}

@media (max-width: 1200px) {
  .products-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
```

### 9.3 src/views/CategoriesView.vue

```vue
<template>
  <div class="categories-view">
    <NavBar />
    <main class="main-content">
      <div class="container">
        <h1>商品分类</h1>
        <div class="category-filter">
          <el-select v-model="selectedCategory" placeholder="选择分类" @change="loadProducts">
            <el-option label="全部分类" value="" />
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </div>
        <div class="products-grid">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ProductCard from '@/components/ProductCard.vue'
import { productAPI, categoryAPI } from '@/services/api'

const route = useRoute()
const products = ref([])
const categories = ref([])
const selectedCategory = ref('')

onMounted(async () => {
  if (route.query.category) {
    selectedCategory.value = route.query.category
  }
  await loadCategories()
  await loadProducts()
})

const loadCategories = async () => {
  try {
    const response = await categoryAPI.getCategories()
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const loadProducts = async () => {
  try {
    let response
    if (selectedCategory.value) {
      response = await productAPI.getProductsByCategory(selectedCategory.value)
    } else {
      response = await productAPI.getProducts({})
    }
    if (response.success) {
      products.value = response.data
    }
  } catch (error) {
    console.error('获取商品失败:', error)
  }
}
</script>

<style scoped>
.categories-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  padding: 40px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  font-size: 32px;
  margin-bottom: 20px;
}

.category-filter {
  margin-bottom: 30px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .products-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
```

### 9.4 src/views/ProductDetailView.vue

```vue
<template>
  <div class="product-detail-view">
    <NavBar />
    <main class="main-content">
      <div class="container" v-if="product">
        <div class="product-main">
          <div class="product-gallery">
            <el-image :src="product.image" fit="contain" class="main-image" />
          </div>
          <div class="product-info">
            <h1>{{ product.name }}</h1>
            <p class="description">{{ product.description }}</p>
            <div class="price-section">
              <span class="current-price">¥{{ product.price }}</span>
              <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
            </div>
            <div class="meta-info">
              <span>销量: {{ product.sales }}</span>
              <span>评分: {{ product.rating }}</span>
            </div>
            <div v-if="product.isAIRecommended" class="ai-info">
              <el-tag type="success">AI推荐商品</el-tag>
              <span class="hot-score">热度评分: {{ product.hotScore }}</span>
            </div>
            <div class="actions">
              <el-button type="primary" size="large">立即购买</el-button>
              <el-button size="large">加入购物车</el-button>
            </div>
          </div>
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { productAPI } from '@/services/api'

const route = useRoute()
const product = ref(null)

onMounted(async () => {
  const id = route.params.id
  try {
    const response = await productAPI.getProduct(id)
    if (response.success) {
      product.value = response.data
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
  }
})
</script>

<style scoped>
.product-detail-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.product-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
}

.product-gallery .main-image {
  width: 100%;
  height: 500px;
}

.product-info h1 {
  font-size: 28px;
  margin-bottom: 15px;
}

.description {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.8;
}

.price-section {
  margin-bottom: 20px;
}

.current-price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  font-size: 18px;
  color: #999;
  text-decoration: line-through;
  margin-left: 15px;
}

.meta-info {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  color: #666;
}

.ai-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.hot-score {
  color: #e6a23c;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 15px;
}
</style>
```

---

## 十、管理后台视图

### 10.1 src/views/admin/AdminLayout.vue

```vue
<template>
  <el-container class="admin-layout">
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
        <el-menu-item index="/admin/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/brands">
          <el-icon><Medal /></el-icon>
          <span>品牌管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/categories">
          <el-icon><Grid /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/product-types">
          <el-icon><Document /></el-icon>
          <span>商品类型</span>
        </el-menu-item>
        <el-menu-item index="/admin/ai-workbench/products">
          <el-icon><TrendCharts /></el-icon>
          <span>AI 选品工作台</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-button type="text" @click="toggleCollapse" class="collapse-btn">
            <el-icon><Expand v-if="isCollapse" /><Fold v-else /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>{{ authStore.user?.username || '管理员' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  House, Goods, Medal, Grid, Document, TrendCharts,
  User, Setting, Expand, Fold
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isCollapse = ref(false)
const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title
  }))
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleLogout = () => {
  authStore.logout()
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

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item),
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
```

### 10.2 src/views/admin/Login.vue

```vue
<template>
  <div class="login-container">
    <div class="login-box">
      <h2>AI商城管理后台</h2>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 模拟登录
        if (form.username === 'admin' && form.password === 'admin123') {
          authStore.setToken('mock-token')
          authStore.setUser({ username: form.username, role: 'admin' })
          ElMessage.success('登录成功')
          router.push('/admin/products')
        } else {
          ElMessage.error('用户名或密码错误')
        }
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>
```

### 10.3 src/views/admin/ProductList.vue (商品列表核心代码)

```vue
<template>
  <div class="product-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品列表</span>
          <router-link to="/admin/products/add">
            <el-button type="primary">添加商品</el-button>
          </router-link>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category_id" placeholder="请选择分类" clearable>
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 商品表格 -->
      <el-table :data="products" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品图片" width="100">
          <template #default="{ row }">
            <el-image :src="row.image" style="width: 60px; height: 60px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchProducts"
        @current-change="fetchProducts"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productAPI, categoryAPI } from '@/services/api'

const router = useRouter()
const loading = ref(false)
const products = ref([])
const categories = ref([])

const searchForm = reactive({
  keyword: '',
  category_id: null
})

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

onMounted(async () => {
  await fetchCategories()
  await fetchProducts()
})

const fetchCategories = async () => {
  try {
    const response = await categoryAPI.getCategories()
    if (response.success) categories.value = response.data
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await productAPI.getProducts({
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    })
    if (response.success) {
      products.value = response.data
      pagination.total = response.pagination?.total || 0
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchProducts()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.category_id = null
  handleSearch()
}

const handleEdit = (row) => {
  router.push(`/admin/products/edit/${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', { type: 'warning' })
    await productAPI.deleteProduct(row.id)
    ElMessage.success('删除成功')
    fetchProducts()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}
</script>

<style scoped>
.product-list { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-form { margin-bottom: 20px; }
</style>
```

### 10.4 src/views/admin/ProductForm.vue (商品表单核心代码)

```vue
<template>
  <div class="product-form">
    <el-card>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="商品分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择分类">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌" prop="brand_id">
          <el-select v-model="form.brand_id" placeholder="请选择品牌">
            <el-option
              v-for="brand in brands"
              :key="brand.id"
              :label="brand.name"
              :value="brand.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="商品图片" prop="image">
          <el-input v-model="form.image" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="是否AI推荐" prop="is_ai_recommended">
          <el-switch v-model="form.is_ai_recommended" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, from 'vue-router'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productAPI, categoryAPI, brandAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()

const formRef = ref()
const loading = ref(false)
const categories = ref([])
const brands = ref([])
const isEdit = ref(false)

const form = reactive({
  id: null,
  name: '',
  description: '',
  category_id: null,
  brand_id: null,
  price: 0,
  stock: 0,
  image: '',
  is_ai_recommended: false
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
  image: [{ message: '请输入有效的图片URL', trigger: 'blur' }]
}

onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadBrands()
  ])
})

const loadCategories = async () => {
  try {
    const response = await categoryAPI.getCategories()
    if (response.success) categories.value = response.data
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const loadBrands = async () => {
  try {
    const response = await brandAPI.getBrands()
    if (response.success) brands.value = response.data
  } catch (error) {
    console.error('获取品牌失败:', error)
  }
}

const loadProduct = async () => {
  if (isEdit.value && route.params.id) {
    try {
      const response = await productAPI.getProduct(route.params.id)
      if (response.success) {
        Object.assign(form, response.data)
      }
    } catch (error) {
      console.error('获取商品详情失败:', error)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    loading.value = true
    try {
      if (isEdit.value) {
        await productAPI.updateProduct(form.id, form)
        ElMessage.success('更新成功')
      } else {
        await productAPI.createProduct(form)
        ElMessage.success('创建成功')
        router.push('/admin/products')
      }
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      loading.value = false
    }
  }
}

const handleCancel = () => {
  router.push('/admin/products')
}
</script>

<style scoped>
.product-form{ padding: 20px; }
</style>
```

---

## 十一、 AI工作台视图

### 10.5 src/views/admin/ai-workbench/AIWorkbenchLayout.vue

```vue
<template>
  <div class="ai-workbench-layout">
    <div class="page-header">
      <h2>AI 选品工作台</h2>
      <div class="header-actions">
        <el-button type="success" @click="triggerManualAI" :loading="aiLoading">
          手动触发AI选品
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="AI推荐商品" name="products">
        <router-view />
      </el-tab-pane>
      <el-tab-pane label="工作台设置" name="settings">
        <router-view />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { awemeAPI } from '@/services/api'

const router = useRouter()
const route = useRoute()

const activeTab = ref('products')
const aiLoading = ref(false)

const refreshTrigger = ref(0)
const triggerRefresh = () => {
  refreshTrigger.value++
}

provide('refreshTrigger', refreshTrigger)
provide('triggerRefresh', triggerRefresh)

onMounted(() => {
  if (route.path.includes('/settings')) {
    activeTab.value = 'settings'
  } else {
    activeTab.value = 'products'
  }
})

function handleTabChange(tabName) {
  if (tabName === 'products') {
    router.push('/admin/ai-workbench/products')
  } else if (tabName === 'settings') {
    router.push('/admin/ai-workbench/settings')
  }
}

async function triggerManualAI() {
  try {
    await ElMessageBox.confirm(
      '确定要手动触发AI选品吗？',
      '确认操作',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    aiLoading.value = true
    ElMessage.info('AI选品分析中，请耐心等待...')

    const resp = await awemeAPI.analyze()
    if (resp && resp.success) {
      ElMessage.success(`AI选品完成`)
    } else {
      ElMessage.warning('AI选品已执行')
    }
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || 'AI选品失败')
    }
  } finally {
    aiLoading.value = false
  }
}

async function refreshData() {
  triggerRefresh()
  ElMessage.success('数据已刷新')
}
</script>

<style scoped>
.ai-workbench-layout {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.workbench-tabs {
  background: #fff;
  border-radius: 8px;
}
</style>
```

### 10.6 src/views/admin/ai-workbench/AIProductsReview.vue (AI商品审核核心代码)

// 由于代码量很大，这里只展示核心功能部分
```vue
<template>
  <div class="ai-products-review">
    <div class="filter-bar">
      <!-- 筛选栏 -->
      <el-date-picker v-model="dateRange" type="datetimerange" />
      <el-input v-model="productNameFilter" placeholder="搜索商品名称" />
      <el-select v-model="statusFilter" placeholder="选择状态">
        <el-option label="全部" value="" />
        <el-option label="待审核" value="0" />
        <el-option label="已上架" value="1" />
      </      <el-button type="danger" @click="batchDelete" :disabled="selectedProducts.length === 0">
        批量删除
      </el-button>
    </div>

    <!-- AI推荐商品表格 -->
    <el-table :data="filteredProducts" v-loading="productsLoading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="视频封面" width="120">
        <template #default="{ row }">
          <el-image :src="row.cover_url" style="width: 80px; height: 80px" @click="viewSourceVideo(row)" />
        </template>
      </el-table-column>
      <el-table-column label="商品名称" min-width="200">
        <template #default="{ row }">
          <div>{{ row.product_name }}</div>
          <el-tag type="danger" size="small">AI推荐</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="热度评分" width="120">
        <template #default="{ row }">
          <div class="score-text">{{ row.hot_score }}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusColor(row.status)">
            {{ getStatusName(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="editProduct(row)">
            进入编辑
          </el-button>
          <el-button type="primary" size="small" plain @click="viewSourceVideo(row)">
            源视频
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="v-model:page-size="pageSize"
      :total="totalProducts"
      layout="total, sizes, prev, pager, next"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { aiCandidateAPI, categoryAPI } from '@/services/api'

const router = useRouter()
const refreshTrigger = inject('refreshTrigger')

const productsLoading = ref(false)
const aiProducts = ref([])
const selectedProducts = ref([])
const dateRange = ref([])
const productNameFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalProducts = ref(0)
const categories = ref([])

const filteredProducts = computed(() => {
  return aiProducts.value.filter(product => {
    if (statusFilter.value !== '' && product.status !== parseInt(statusFilter.value)) return false
    if (productNameFilter.value && !product.product_name.includes(productNameFilter.value)) return false
    return true
  })
})

const getAIProducts = async () => {
  productsLoading.value = true
  try {
    const response = await aiCandidateAPI.getCandidates({
      page: currentPage.value,
      limit: pageSize.value,
      status: statusFilter.value,
      product_name: productNameFilter.value
    })
    if (response.success) {
      aiProducts.value = response.data
      totalProducts.value = response.pagination.total
    }
  } catch (error) {
    ElMessage.error('获取AI推荐商品失败')
  } finally {
    productsLoading.value = false
  }
}

const editProduct = (product) => {
  router.push(`/admin/products/add?ai_candidate_id=${product.id}`)
}

const viewSourceVideo = (product) => {
  if (product.source_url) {
    window.open(product.source_url, '_blank')
  } else {
    ElMessage.warning('源视频链接不存在')
  }
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除选中的商品吗？', '确认删除')
    await Promise.all(selectedProducts.value.map(id => aiCandidateAPI.deleteCandidate(id)))
    ElMessage.success('删除成功')
    selectedProducts.value = []
    await getAIProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

watch(refreshTrigger, () => {
  if (refreshTrigger.value > 0) {
    getAIProducts()
  }
})

onMounted(() => {
  getAIProducts()
})
</script>
```

### 10.7 src/views/admin/ai-workbench/AIWorkbenchSettings.vue

```vue
<template>
  <div class="ai-workbench-settings">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>触发与AI模型设置</span>
        </div>
      </template>

      <el-form :model="settingsForm" label-width="150px">
        <el-divider content-position="left">定时任务设置</el-divider>

        <el-form-item label="启用定时任务">
          <el-switch v-model="settingsForm.scheduledTask.enabled" />
        </el-form-item>

        <el-form-item label="推送商品数量">
          <el-input-number v-model="settingsForm.scheduledTask.productCount" :min="1" :max="200" />
        </el-form-item>

        <el-divider content-position="left">AI模型设置</el-divider>

        <el-form-item label="推荐阈值">
          <el-slider v-model="settingsForm.aiModel.recommendationThreshold" :min="30" :max="100" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSettings" :loading="saving">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 执行日志 -->
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>执行日志</span>
          <el-button size="small" @click="refreshLogs">刷新</el-button>
        </div>
      </template>

      <el-table :data="executionLogs" v-loading="logsLoading">
        <el-table-column label="执行时间" width="180" />
        <el-table-column label="任务类型" width="120" />
        <el-table-column label="推送数量" width="100" />
        <el-table-column label="状态" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { systemConfigAPI } from '@/services/api'

const saving = ref(false)
const logsLoading = ref(false)
const executionLogs = ref([])

const settingsForm = reactive({
  scheduledTask: {
    enabled: true,
    productCount: 15,
    executionTime: '00:00',
    platforms: ['bilibili', 'douyin', 'xiaohongshu']
  },
  manualTrigger: {
    productCount: 7,
    platforms: ['bilibili', 'douyin']
  },
  aiModel: {
    recommendationThreshold: 70,
    recommendationStrategy: 'viral_priority'
  }
})

async function saveSettings() {
  saving.value = true
  try {
    await systemConfigAPI.saveAIWorkbenchConfig(settingsForm)
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('设置保存失败')
  } finally {
    saving.value = false
  }
}

async function refreshLogs() {
  logsLoading.value = true
  try {
    executionLogs.value = [
      { id: 1, created_at: new Date().toISOString(), task_type: 'scheduled', product_count: 50, status: 'success' },
      { id: 2, created_at: new Date(Date.now() - 3600000).toISOString(), task_type: 'manual', product_count: 10, status: 'success' }
    ]
  } finally {
    logsLoading.value = false
  }
}

onMounted(() => {
  refreshLogs()
})
</script>
```

---


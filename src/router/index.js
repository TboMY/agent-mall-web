import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import HotProductsView from '@/views/HotProductsView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import AdminAgentView from '@/views/AdminAgentView.vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import AdminLogin from '@/views/admin/Login.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/hot-products', name: 'hot-products', component: HotProductsView },
    { path: '/categories', name: 'categories', component: CategoriesView },
    { path: '/product/:id', name: 'product-detail', component: ProductDetailView },
    { path: '/admin/agent', name: 'admin-agent', component: AdminAgentView },
    { path: '/admin/login', name: 'admin-login', component: AdminLogin },
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        { path: 'dashboard', component: { template: '<div>仪表盘</div>' } },
        { path: 'products/ai-hot', component: { template: '<div>AI热点选品</div>' } },
        { path: 'products/list', component: { template: '<div>商品列表</div>' } },
        { path: 'products/add', component: { template: '<div>添加商品</div>' } },
        { path: 'products/categories', component: { template: '<div>商品分类</div>' } },
        { path: 'products/types', component: { template: '<div>商品类型</div>' } },
        { path: 'products/brands', component: { template: '<div>品牌管理</div>' } },
        { path: 'permissions', component: { template: '<div>权限</div>' } }
      ]
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
      return { path: '/admin/login', query: { redirect: to.fullPath } }
    }
  }
})

export default router



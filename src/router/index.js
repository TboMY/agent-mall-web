import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import HotProductsView from '@/views/HotProductsView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import AdminAgentView from '@/views/AdminAgentView.vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import AdminLogin from '@/views/admin/Login.vue'
import ProductList from '@/views/admin/ProductList.vue'
import ProductForm from '@/views/admin/ProductForm.vue'
import AIWorkbenchLayout from '@/views/admin/ai-workbench/AIWorkbenchLayout.vue'
import AIProductsReview from '@/views/admin/ai-workbench/AIProductsReview.vue'
import AIWorkbenchSettings from '@/views/admin/ai-workbench/AIWorkbenchSettings.vue'
import BrandList from '@/views/admin/BrandList.vue'
import CategoryList from '@/views/admin/CategoryList.vue'
import ProductTypeList from '@/views/admin/ProductTypeList.vue'
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
        { 
          path: 'ai-workbench', 
          component: AIWorkbenchLayout,
          children: [
            { path: 'products', component: AIProductsReview },
            { path: 'settings', component: AIWorkbenchSettings }
          ]
        },
        { path: 'products/list', component: ProductList },
        { path: 'products/add', component: ProductForm },
        { path: 'products/edit/:id', component: ProductForm },
        { path: 'categories/list', component: CategoryList },
        { path: 'brands/list', component: BrandList },
        { path: 'product-types/list', component: ProductTypeList },
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



import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import HotProductsView from '@/views/HotProductsView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import CartView from '@/views/CartView.vue'
import AccountView from '@/views/AccountView.vue'
import OrderPaymentView from '@/views/OrderPaymentView.vue'
import OrderPayResultView from '@/views/OrderPayResultView.vue'
import CustomerAuthView from '@/views/CustomerAuthView.vue'
import AdminAgentView from '@/views/AdminAgentView.vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import AdminLogin from '@/views/admin/Login.vue'
import DashboardView from '@/views/admin/Dashboard.vue'
import ProductList from '@/views/admin/ProductList.vue'
import ProductForm from '@/views/admin/ProductForm.vue'
import UserList from '@/views/admin/UserList.vue'
import RoleList from '@/views/admin/RoleList.vue'
import MallUserList from '@/views/admin/MallUserList.vue'
import OrderList from '@/views/admin/OrderList.vue'
import ReturnRequestList from '@/views/admin/ReturnRequestList.vue'
import ForbiddenView from '@/views/admin/ForbiddenView.vue'
import AIWorkbenchLayout from '@/views/admin/ai-workbench/AIWorkbenchLayout.vue'
import AIProductsReview from '@/views/admin/ai-workbench/AIProductsReview.vue'
import AIWorkbenchSettings from '@/views/admin/ai-workbench/AIWorkbenchSettings.vue'
import BrandList from '@/views/admin/BrandList.vue'
import CategoryList from '@/views/admin/CategoryList.vue'
import ProductTypeList from '@/views/admin/ProductTypeList.vue'
import HomepageDisplayConfig from '@/views/admin/HomepageDisplayConfig.vue'
import { useAuthStore } from '@/stores/auth'
import { useCustomerAuthStore } from '@/stores/customerAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/hot-products', name: 'hot-products', component: HotProductsView },
    { path: '/categories', name: 'categories', component: CategoriesView },
    { path: '/product/:id', name: 'product-detail', component: ProductDetailView },
    { path: '/login', name: 'login', component: CustomerAuthView },
    { path: '/register', name: 'register', component: CustomerAuthView },
    { path: '/cart', name: 'cart', component: CartView, meta: { customerAuth: true } },
    { path: '/account', name: 'account', component: AccountView, meta: { customerAuth: true } },
    { path: '/orders/:id/pay', name: 'order-pay', component: OrderPaymentView, meta: { customerAuth: true } },
    { path: '/orders/pay/result', name: 'order-pay-result', component: OrderPayResultView, meta: { customerAuth: true } },
    { path: '/admin/agent', name: 'admin-agent', component: AdminAgentView },
    { path: '/admin/login', name: 'admin-login', component: AdminLogin },
    {
      path: '/admin',
      component: AdminLayout,
      redirect: '/admin/dashboard',
      children: [
        { path: 'dashboard', component: DashboardView, meta: { permission: 'dashboard.view' } },
        { 
          path: 'ai-workbench', 
          component: AIWorkbenchLayout,
          redirect: '/admin/ai-workbench/products',
          meta: { permission: 'aiWorkbench.view' },
          children: [
            { path: 'products', component: AIProductsReview, meta: { permission: 'aiWorkbench.view' } },
            { path: 'settings', component: AIWorkbenchSettings, meta: { permission: 'systemConfigs.manage' } }
          ]
        },
        { path: 'products/list', component: ProductList, meta: { permission: 'products.view' } },
        { path: 'products/add', component: ProductForm, meta: { permission: 'products.manage' } },
        { path: 'products/edit/:id', component: ProductForm, meta: { permission: 'products.manage' } },
        { path: 'categories/list', component: CategoryList, meta: { permission: 'categories.manage' } },
        { path: 'brands/list', component: BrandList, meta: { permission: 'brands.manage' } },
        { path: 'product-types/list', component: ProductTypeList, meta: { permission: 'productTypes.manage' } },
        { path: 'homepage-display', component: HomepageDisplayConfig, meta: { permission: 'systemConfigs.manage' } },
        { path: 'mall-users', component: MallUserList, meta: { permission: 'mallUsers.view' } },
        { path: 'orders/list', component: OrderList, meta: { permission: 'orders.view' } },
        { path: 'orders/returns', component: ReturnRequestList, meta: { permission: 'orders.manage' } },
        { path: 'permissions/users', component: UserList, meta: { permission: 'users.manage' } },
        { path: 'permissions/roles', component: RoleList, meta: { permission: 'roles.manage' } },
        { path: 'forbidden', component: ForbiddenView }
      ]
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const customerAuth = useCustomerAuthStore()

  if (auth.token && !auth.initialized) {
    try {
      await auth.bootstrap()
    } catch (_) {
      // bootstrap 失败时会自动清理本地会话
    }
  }

  if (customerAuth.token && !customerAuth.initialized) {
    try {
      await customerAuth.bootstrap()
    } catch (_) {
      // ignore
    }
  }

  if (to.path === '/admin/login' && auth.isAuthenticated) {
    return { path: '/admin/dashboard' }
  }

  if ((to.path === '/login' || to.path === '/register') && customerAuth.isAuthenticated) {
    return { path: '/account' }
  }

  if (to.meta?.customerAuth && !customerAuth.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }

  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!auth.isAuthenticated) {
      return { path: '/admin/login', query: { redirect: to.fullPath } }
    }

    const permission = to.meta?.permission
    if (permission && !auth.hasPermission(permission) && to.path !== '/admin/forbidden') {
      return { path: '/admin/forbidden', query: { from: to.fullPath } }
    }
  }
})

export default router

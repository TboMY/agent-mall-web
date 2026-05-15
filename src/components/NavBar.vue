<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SearchOverlay from '@/components/SearchOverlay.vue'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const customerAuth = useCustomerAuthStore()
const cart = useCartStore()
const showSearch = ref(false)

const navItems = [
  { label: '首页', path: '/' },
  { label: 'AI热点', path: '/hot-products' },
  { label: '商品分类', path: '/categories' },
  { label: '个人中心', path: '/account' }
]

const activePath = computed(() => route.path)
const customerActionLabel = computed(() => customerAuth.isAuthenticated ? customerAuth.displayName : '登录 / 注册')

function isNavActive(path) {
  if (path === '/') return activePath.value === '/'
  return activePath.value === path || activePath.value.startsWith(`${path}/`)
}

function go(path) {
  if (path === '/account' && !customerAuth.isAuthenticated) {
    router.push('/login')
    return
  }
  router.push(path)
}

onMounted(async () => {
  if (customerAuth.isAuthenticated && !cart.items.length) {
    await cart.fetchCart()
  }
})
</script>

<template>
  <header class="am-nav">
    <div class="am-nav__notice">
      <div class="page-container am-nav__notice-inner">
        <span>新客首单优惠进行中</span>
        <span>精选数码、美妆个护、家居好物，热门单品持续上新</span>
      </div>
    </div>

    <div class="am-nav__main">
      <div class="page-container am-nav__main-inner">
        <button class="am-nav__brand" type="button" @click="go('/')">
          <span class="am-nav__brand-mark">A</span>
          <span class="am-nav__brand-copy">
            <strong>Agent Mall</strong>
            <small>AI Curated Commerce</small>
          </span>
        </button>

        <nav class="am-nav__links">
          <button
            v-for="item in navItems"
            :key="item.path"
            type="button"
            :class="['am-nav__link', { 'is-active': isNavActive(item.path) }]"
            @click="go(item.path)"
          >
            {{ item.label }}
          </button>
        </nav>

        <div class="am-nav__actions">
          <button class="am-nav__action am-nav__action--search" type="button" @click="showSearch = true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z"/>
            </svg>
            搜索
          </button>
          <button class="am-nav__action" type="button" @click="go('/cart')">
            购物车
            <span v-if="cart.count" class="am-nav__badge">{{ cart.count }}</span>
          </button>
          <button class="am-nav__action" type="button" @click="go(customerAuth.isAuthenticated ? '/account' : '/login')">{{ customerActionLabel }}</button>
        </div>
      </div>
    </div>

    <SearchOverlay v-model="showSearch" />
  </header>
</template>

<style>
.am-nav {
  position: sticky;
  top: 0;
  z-index: 1100;
}

.am-nav__notice {
  background: linear-gradient(90deg, #172331 0%, #223649 58%, #345778 100%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.am-nav__notice-inner {
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.am-nav__main {
  background: rgba(247, 243, 234, 0.94);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(17, 35, 56, 0.08);
  box-shadow: 0 14px 38px rgba(18, 34, 57, 0.08);
}

.am-nav__main-inner {
  min-height: 78px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px;
}

.am-nav__brand,
.am-nav__link,
.am-nav__action {
  appearance: none;
  -webkit-appearance: none;
  font: inherit;
}

.am-nav__brand {
  padding: 0;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.am-nav__brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ef7140 0%, #f2ba5e 100%);
  color: #fff;
  font-size: 20px;
  font-weight: 800;
  box-shadow: 0 14px 26px rgba(239, 113, 64, 0.26);
}

.am-nav__brand-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #14263c;
}

.am-nav__brand-copy strong {
  font-size: 20px;
  line-height: 1;
  font-weight: 800;
}

.am-nav__brand-copy small {
  margin-top: 4px;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #718295;
}

.am-nav__links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.am-nav__link {
  border: none;
  border-radius: 999px;
  padding: 11px 18px;
  background: transparent;
  color: #4a5f75;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.am-nav__link:hover {
  background: rgba(255, 255, 255, 0.76);
  color: #14263c;
}

.am-nav__link.is-active {
  color: #fff;
  background: linear-gradient(135deg, #18304f 0%, #2c597f 100%);
  box-shadow: 0 12px 24px rgba(24, 48, 79, 0.22);
}

.am-nav__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.am-nav__action {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(24, 48, 79, 0.12);
  background: rgba(255, 255, 255, 0.72);
  color: #203348;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.am-nav__action--search:hover {
  background: #fff;
}

.am-nav__badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #ef6c40;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}

@media (max-width: 980px) {
  .am-nav__notice-inner span:last-child {
    display: none;
  }

  .am-nav__notice-inner {
    justify-content: center;
  }

  .am-nav__main-inner {
    grid-template-columns: 1fr;
    gap: 16px;
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .am-nav__links,
  .am-nav__actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { customerOrderAPI } from '@/services/api'
import { useCustomerAuthStore } from '@/stores/customerAuth'

const route = useRoute()
const router = useRouter()
const customerAuth = useCustomerAuthStore()

const loading = ref(true)
const order = ref(null)
const errorMessage = ref('')

const statusText = computed(() => {
  if (!order.value) return '正在确认支付结果...'
  if (order.value.payment_status === 'paid') return '支付成功'
  if (order.value.status === 'cancelled') return '订单已取消'
  return '支付结果确认中'
})

const statusClass = computed(() => {
  if (order.value?.payment_status === 'paid') return 'text-green-600'
  if (order.value?.status === 'cancelled') return 'text-slate-500'
  return 'text-orange-500'
})

function formatPrice(value) {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

async function loadOrderResult() {
  const orderNo = route.query.out_trade_no
  if (!orderNo) {
    errorMessage.value = '缺少订单号'
    loading.value = false
    return
  }

  try {
    const startedAt = Date.now()
    while (Date.now() - startedAt < 20000) {
      const response = await customerOrderAPI.reconcileOrderPayment(orderNo)
      order.value = response.data
      if (response.data?.payment_status === 'paid' || response.data?.status === 'cancelled') {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
    await customerAuth.fetchOrders()
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || '查询订单支付结果失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadOrderResult)
</script>

<template>
  <el-container direction="vertical" class="min-h-screen bg-[#FDFBF7]">
    <NavBar />

    <el-main class="mx-auto flex w-full max-w-[960px] px-5 py-12">
      <section class="w-full rounded-[32px] border border-gray-100 bg-white px-8 py-10 shadow-soft">
        <div class="text-center">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-3xl text-white">
            支
          </div>
          <h1 class="mt-6 text-4xl font-bold text-slate-900">支付结果</h1>
          <p class="mt-3 text-base" :class="statusClass">
            {{ loading ? '正在确认支付结果...' : errorMessage || statusText }}
          </p>
        </div>

        <div v-if="order" class="mx-auto mt-10 max-w-[520px] rounded-[24px] bg-gray-50 px-6 py-6">
          <div class="flex items-center justify-between border-b border-gray-200 pb-4 text-sm text-slate-500">
            <span>订单号</span>
            <span class="font-semibold text-slate-900">{{ order.order_no }}</span>
          </div>
          <div class="flex items-center justify-between border-b border-gray-200 py-4 text-sm text-slate-500">
            <span>订单金额</span>
            <span class="font-semibold text-slate-900">¥ {{ formatPrice(order.payable_amount) }}</span>
          </div>
          <div class="flex items-center justify-between pt-4 text-sm text-slate-500">
            <span>订单状态</span>
            <span class="font-semibold text-slate-900">{{ order.payment_status === 'paid' ? '已支付' : '待确认' }}</span>
          </div>
        </div>

        <div class="mt-10 flex justify-center gap-4">
          <button
            type="button"
            class="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            @click="router.push('/account')"
          >
            返回个人中心
          </button>
          <button
            type="button"
            class="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            @click="router.push('/')"
          >
            返回首页
          </button>
        </div>
      </section>
    </el-main>

    <SiteFooter />
  </el-container>
</template>

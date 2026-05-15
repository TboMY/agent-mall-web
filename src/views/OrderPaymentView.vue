<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { customerOrderAPI } from '@/services/api'
import { useCustomerAuthStore } from '@/stores/customerAuth'

const route = useRoute()
const router = useRouter()
const customerAuth = useCustomerAuthStore()

const loading = ref(false)
const paying = ref(false)
const order = ref(null)

const canPay = computed(() => (
  order.value
  && order.value.status === 'pending_payment'
  && order.value.payment_status === 'unpaid'
))

function formatPrice(value) {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

function normalizeOrderStatus(status) {
  const statusMap = {
    pending_payment: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    refunding: '退款中',
    refunded: '已退款'
  }
  return statusMap[status] || status || '处理中'
}

async function loadOrder() {
  loading.value = true
  try {
    const response = await customerOrderAPI.getOrderDetail(route.params.id)
    order.value = response.data
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取订单详情失败')
    router.replace('/account')
  } finally {
    loading.value = false
  }
}

async function handlePay() {
  if (!order.value) return
  paying.value = true
  try {
    const payment = await customerAuth.createAlipayPayment(order.value.id)
    window.location.href = payment.payment_url
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '发起支付宝支付失败')
  } finally {
    paying.value = false
  }
}

async function handleCancelOrder() {
  if (!order.value || !canPay.value) return
  try {
    await ElMessageBox.confirm('取消后订单将关闭，当前未付款订单无法恢复，是否继续？', '取消订单', {
      type: 'warning',
      confirmButtonText: '确认取消',
      cancelButtonText: '再想想'
    })
    order.value = await customerAuth.cancelOrder(order.value.id)
    ElMessage.success('订单已取消')
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error.response?.data?.message || '取消订单失败')
  }
}

onMounted(async () => {
  await customerAuth.fetchMe(true)
  await loadOrder()
})
</script>

<template>
  <el-container direction="vertical" class="am-pay-page">
    <NavBar />

    <el-main class="page-container am-pay-page__main">
      <section v-if="order" class="am-pay-page__layout">
        <div class="am-pay-page__content">
          <div class="am-pay-page__hero">
            <div class="am-pay-page__kicker">Order Payment</div>
            <h1>订单付款</h1>
            <p>确认订单信息后，前往支付宝完成支付。</p>
          </div>

          <div class="am-pay-page__card">
            <div class="am-pay-page__card-head">
              <div>
                <h2>{{ order.order_no }}</h2>
                <p>订单状态：{{ normalizeOrderStatus(order.status) }}</p>
              </div>
              <strong>¥ {{ formatPrice(order.payable_amount) }}</strong>
            </div>

            <div class="am-pay-page__items">
              <article v-for="item in order.items || []" :key="item.id" class="am-pay-page__item">
                <img :src="item.product_image" :alt="item.product_name" class="am-pay-page__item-image" />
                <div class="am-pay-page__item-info">
                  <h3>{{ item.product_name }}</h3>
                  <p>{{ item.sku_name || '默认规格' }}</p>
                  <div v-if="item.spec_summary?.length" class="am-pay-page__item-specs">
                    <span v-for="spec in item.spec_summary" :key="`${item.id}-${spec.attribute_name}-${spec.value_label}`">
                      {{ spec.attribute_name }}：{{ spec.value_label }}
                    </span>
                  </div>
                </div>
                <div class="am-pay-page__item-side">
                  <div>× {{ item.quantity }}</div>
                  <strong>¥ {{ formatPrice(item.line_total) }}</strong>
                </div>
              </article>
            </div>
          </div>
        </div>

        <aside class="am-pay-page__sidebar">
          <div class="am-pay-page__summary">
            <h2>支付信息</h2>

            <div class="am-pay-page__row">
              <span>支付方式</span>
              <strong>支付宝</strong>
            </div>
            <div class="am-pay-page__row">
              <span>订单金额</span>
              <strong>¥ {{ formatPrice(order.payable_amount) }}</strong>
            </div>
            <div class="am-pay-page__row am-pay-page__row--total">
              <span>待支付</span>
              <strong>¥ {{ formatPrice(order.payable_amount) }}</strong>
            </div>

            <button
              type="button"
              class="am-pay-page__primary"
              :disabled="paying || !canPay"
              @click="handlePay"
            >
              {{
                !canPay
                  ? '订单已完成支付'
                  : paying
                    ? '跳转中...'
                    : '前往支付宝支付'
              }}
            </button>

            <button
              v-if="canPay"
              type="button"
              class="am-pay-page__danger"
              @click="handleCancelOrder"
            >
              取消订单
            </button>

            <button type="button" class="am-pay-page__secondary" @click="router.push('/account')">
              返回个人中心
            </button>
          </div>
        </aside>
      </section>

      <div v-else class="am-pay-page__loading">
        {{ loading ? '订单加载中...' : '订单不存在' }}
      </div>
    </el-main>

    <SiteFooter />
  </el-container>
</template>

<style>
.am-pay-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(244, 186, 92, 0.14), transparent 22%),
    #f7f3ea;
}

.am-pay-page__main {
  padding-top: 28px;
  padding-bottom: 40px;
}

.am-pay-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) 360px;
  gap: 24px;
}

.am-pay-page__hero,
.am-pay-page__card,
.am-pay-page__summary,
.am-pay-page__loading {
  border-radius: 30px;
  background: rgba(255,255,255,0.88);
  border: 1px solid rgba(19,35,55,0.08);
  box-shadow: 0 20px 48px rgba(24,39,62,0.08);
}

.am-pay-page__hero,
.am-pay-page__card,
.am-pay-page__summary {
  padding: 24px 28px;
}

.am-pay-page__kicker {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(21,43,69,0.08);
  color: #4d6277;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.am-pay-page__hero h1 {
  margin: 12px 0 0;
  font-size: 34px;
  color: #132337;
}

.am-pay-page__hero p,
.am-pay-page__card-head p {
  margin: 10px 0 0;
  color: #627385;
}

.am-pay-page__card {
  margin-top: 20px;
}

.am-pay-page__card-head,
.am-pay-page__row,
.am-pay-page__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.am-pay-page__card-head h2 {
  margin: 0;
  font-size: 22px;
  color: #132337;
}

.am-pay-page__card-head strong,
.am-pay-page__row strong,
.am-pay-page__item-side strong {
  color: #132337;
}

.am-pay-page__items {
  margin-top: 20px;
  display: grid;
  gap: 14px;
}

.am-pay-page__item {
  padding: 16px;
  border-radius: 22px;
  background: rgba(248,250,252,0.84);
}

.am-pay-page__item-image {
  width: 84px;
  height: 84px;
  border-radius: 18px;
  object-fit: cover;
}

.am-pay-page__item-info {
  flex: 1;
}

.am-pay-page__item-info h3 {
  margin: 0;
  font-size: 18px;
  color: #132337;
}

.am-pay-page__item-info p {
  margin: 8px 0 0;
  color: #627385;
}

.am-pay-page__item-specs {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.am-pay-page__item-specs span {
  padding: 4px 8px;
  border-radius: 999px;
  background: #fff;
  color: #5f7082;
  font-size: 12px;
}

.am-pay-page__item-side {
  flex-direction: column;
  align-items: flex-end;
}

.am-pay-page__summary {
  position: sticky;
  top: 120px;
}

.am-pay-page__summary h2 {
  margin: 0 0 18px;
  font-size: 26px;
  color: #132337;
}

.am-pay-page__row {
  margin-top: 16px;
  color: #627385;
}

.am-pay-page__row--total strong {
  font-size: 30px;
  color: #ef6c40;
}

.am-pay-page__warning {
  margin: 18px 0 0;
  color: #d96a42;
  line-height: 1.7;
}

.am-pay-page__primary,
.am-pay-page__danger,
.am-pay-page__secondary {
  width: 100%;
  min-height: 48px;
  margin-top: 18px;
  border: none;
  border-radius: 999px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.am-pay-page__primary {
  background: linear-gradient(135deg, #ef6c40 0%, #f2b458 100%);
  color: #fff;
}

.am-pay-page__danger {
  background: rgba(239, 108, 64, 0.1);
  color: #d96a42;
}

.am-pay-page__primary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.am-pay-page__secondary {
  background: rgba(19,35,55,0.08);
  color: #132337;
}

.am-pay-page__loading {
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #627385;
  font-size: 18px;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .am-pay-page__layout {
    grid-template-columns: 1fr;
  }

  .am-pay-page__summary {
    position: static;
  }
}
</style>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import { useCartStore } from '@/stores/cart'

const customerAuth = useCustomerAuthStore()
const cart = useCartStore()
const router = useRouter()

const saving = ref(false)
const profileSaving = ref(false)
const addressDialogVisible = ref(false)
const editingAddressId = ref(null)
const returnDialogVisible = ref(false)
const phoneDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const activeSection = ref('overview')
const activeOrderFilter = ref('all')
const profileForm = reactive({
  nickname: '',
  gender: 2,
  email: ''
})

const addressForm = reactive({
  recipient_name: '',
  recipient_phone: '',
  province: '',
  city: '',
  district: '',
  detail_address: '',
  is_default: 0
})

const returnRequestForm = reactive({
  orderId: null,
  orderNo: '',
  reason: '',
  description: ''
})

const phoneForm = reactive({
  phone: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const recentOrders = computed(() => customerAuth.orders.slice(0, 3))
const pendingPaymentCount = computed(() => countOrdersByStatus(['pending_payment']))
const totalOrderCount = computed(() => customerAuth.orders.length)

const sidebarItems = computed(() => ([
  { key: 'overview', label: '账户概览' },
  { key: 'orders', label: '我的订单' },
  { key: 'addresses', label: '收货地址' },
  { key: 'settings', label: '账户设置' }
]))

const orderStatusCards = computed(() => ([
  { key: 'pending_payment', label: '待付款', icon: '💳', count: countOrdersByStatus(['pending_payment']) },
  { key: 'pending_shipment', label: '待发货', icon: '📦', count: countOrdersByStatus(['pending_shipment', 'paid']) },
  { key: 'pending_receipt', label: '待收货', icon: '🚚', count: countOrdersByStatus(['pending_receipt', 'shipped']) },
  { key: 'completed', label: '已完成', icon: '✅', count: countOrdersByStatus(['completed']) },
  { key: 'after_sale', label: '退款/售后', icon: '🛡️', count: countOrdersByStatus(['refunding', 'refunded']) }
]))

const orderFilters = computed(() => ([
  { key: 'all', label: '全部', count: customerAuth.orders.length },
  { key: 'pending_payment', label: '待付款', count: countOrdersByStatus(['pending_payment']) },
  { key: 'pending_shipment', label: '待发货', count: countOrdersByStatus(['pending_shipment', 'paid']) },
  { key: 'pending_receipt', label: '待收货', count: countOrdersByStatus(['pending_receipt', 'shipped']) },
  { key: 'completed', label: '已完成', count: countOrdersByStatus(['completed']) },
  { key: 'after_sale', label: '退款/售后', count: countOrdersByStatus(['refunding', 'refunded']) }
]))

const filteredOrders = computed(() => {
  const filterMap = {
    pending_payment: ['pending_payment'],
    pending_shipment: ['pending_shipment', 'paid'],
    pending_receipt: ['pending_receipt', 'shipped'],
    completed: ['completed'],
    after_sale: ['refunding', 'refunded']
  }

  if (activeOrderFilter.value === 'all') {
    return customerAuth.orders
  }

  const statuses = filterMap[activeOrderFilter.value] || []
  return customerAuth.orders.filter((order) => statuses.includes(order.status))
})

function countOrdersByStatus(statuses) {
  return customerAuth.orders.filter((order) => statuses.includes(order.status)).length
}

function normalizeOrderStatus(status) {
  const statusMap = {
    pending_payment: '待付款',
    pending_shipment: '待发货',
    paid: '待发货',
    pending_receipt: '待收货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    closed: '已关闭',
    refunding: '退款中',
    refunded: '已退款'
  }
  return statusMap[status] || status || '处理中'
}

function normalizeReturnRequestStatus(status) {
  const statusMap = {
    pending: '退货申请处理中',
    approved: '退货申请已通过',
    rejected: '退货申请未通过'
  }
  return statusMap[status] || '售后处理中'
}

function formatSpecSummary(specSummary = []) {
  if (!Array.isArray(specSummary) || !specSummary.length) return ''
  return specSummary
    .map((item) => {
      const name = item.attribute_name || item.name || ''
      const value = item.attribute_value_name || item.value || item.custom_value || ''
      return name && value ? `${name}：${value}` : value || name
    })
    .filter(Boolean)
    .join(' / ')
}

function getOrderItemSummary(order) {
  if (!order?.items?.length) return '暂无商品明细'
  return order.items.map((item) => item.product_name || item.sku_name || '未命名商品').join('、')
}

function canApplyReturn(order) {
  const requestStatus = order?.latest_return_request?.status
  const blocked = ['pending', 'approved'].includes(requestStatus)
  return !blocked && ['shipped', 'completed'].includes(order.status) && order.payment_status === 'paid'
}

function formatPrice(value) {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

function resetAddressForm() {
  editingAddressId.value = null
  Object.assign(addressForm, {
    recipient_name: '',
    recipient_phone: '',
    province: '',
    city: '',
    district: '',
    detail_address: '',
    is_default: customerAuth.addresses.length ? 0 : 1
  })
}

function initProfileForm() {
  const rawGender = Number(customerAuth.user?.gender)
  const normalizedGender = rawGender === 0 ? 0 : rawGender === 1 ? 1 : 2
  Object.assign(profileForm, {
    nickname: customerAuth.user?.nickname || '',
    gender: normalizedGender,
    email: customerAuth.user?.email || ''
  })
}

function resetPhoneForm() {
  phoneForm.phone = customerAuth.user?.phone || ''
}

function resetPasswordForm() {
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

function openCreateAddress() {
  resetAddressForm()
  addressDialogVisible.value = true
}

function openEditAddress(address) {
  editingAddressId.value = address.id
  Object.assign(addressForm, {
    recipient_name: address.recipient_name || '',
    recipient_phone: address.recipient_phone || '',
    province: address.province || '',
    city: address.city || '',
    district: address.district || '',
    detail_address: address.detail_address || '',
    is_default: Number(address.is_default || 0)
  })
  addressDialogVisible.value = true
}

async function submitAddress() {
  saving.value = true
  try {
    await customerAuth.saveAddress({
      id: editingAddressId.value,
      ...addressForm
    })
    addressDialogVisible.value = false
    ElMessage.success(editingAddressId.value ? '收货地址已更新' : '收货地址已添加')
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '保存地址失败')
  } finally {
    saving.value = false
  }
}

async function setDefaultAddress(id) {
  await customerAuth.setDefaultAddress(id)
  ElMessage.success('默认地址已更新')
}

async function deleteAddress(id) {
  await customerAuth.deleteAddress(id)
  ElMessage.success('收货地址已删除')
}

async function saveProfile() {
  profileSaving.value = true
  try {
    await customerAuth.updateProfile({
      nickname: profileForm.nickname,
      gender: profileForm.gender,
      email: profileForm.email
    })
    initProfileForm()
    ElMessage.success('账户信息已更新')
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '保存账户信息失败')
  } finally {
    profileSaving.value = false
  }
}

function openPhoneDialog() {
  resetPhoneForm()
  phoneDialogVisible.value = true
}

async function submitPhoneChange() {
  try {
    await customerAuth.updatePhone({ phone: phoneForm.phone })
    phoneDialogVisible.value = false
    ElMessage.success('手机号已更新')
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '更新手机号失败')
  }
}

function openPasswordDialog() {
  resetPasswordForm()
  passwordDialogVisible.value = true
}

async function submitPasswordChange() {
  try {
    await customerAuth.updatePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    })
    passwordDialogVisible.value = false
    customerAuth.logout()
    cart.clear()
    ElMessage.success('登录密码已更新，请重新登录')
    router.replace('/login')
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '修改密码失败')
  }
}

function logout() {
  customerAuth.logout()
  cart.clear()
  ElMessage.success('已退出登录')
  router.replace('/login')
}

async function handlePayOrder(order) {
  router.push(`/orders/${order.id}/pay`)
}

async function handleCancelOrder(order) {
  try {
    await ElMessageBox.confirm('取消后订单将关闭，当前未付款订单无法恢复，是否继续？', '取消订单', {
      type: 'warning',
      confirmButtonText: '确认取消',
      cancelButtonText: '再想想'
    })
    await customerAuth.cancelOrder(order.id)
    ElMessage.success('订单已取消')
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error?.response?.data?.message || '取消订单失败')
  }
}

async function handleConfirmReceipt(order) {
  try {
    await customerAuth.confirmOrderReceipt(order.id)
    ElMessage.success('确认收货成功')
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '确认收货失败')
  }
}

function openReturnRequest(order) {
  returnRequestForm.orderId = order.id
  returnRequestForm.orderNo = order.order_no
  returnRequestForm.reason = ''
  returnRequestForm.description = ''
  returnDialogVisible.value = true
}

async function submitReturnRequest() {
  try {
    await customerAuth.createReturnRequest(returnRequestForm.orderId, {
      reason: returnRequestForm.reason,
      description: returnRequestForm.description
    })
    ElMessage.success('退货申请已提交')
    returnDialogVisible.value = false
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '提交退货申请失败')
  }
}

onMounted(async () => {
  await Promise.allSettled([customerAuth.fetchAddresses(), customerAuth.fetchOrders(), cart.fetchCart()])
  initProfileForm()
})
</script>

<template>
  <el-container direction="vertical" class="min-h-screen bg-[#FDFBF7]">
    <NavBar />

    <el-main class="mx-auto w-full max-w-[1280px] px-5 py-8">
      <div class="grid items-start gap-6 lg:grid-cols-[256px_minmax(0,1fr)]">
        <aside class="w-full shrink-0 self-start rounded-[28px] border border-gray-100 bg-white p-6 shadow-soft lg:w-64">
          <div class="flex flex-col items-center border-b border-gray-100 pb-8">
            <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white shadow-lg shadow-slate-900/20">
              {{ customerAuth.displayName.slice(0, 1).toUpperCase() }}
            </div>
            <h1 class="text-[30px] font-bold tracking-tight text-slate-900">{{ customerAuth.displayName }}</h1>
            <p class="mt-1 text-sm text-slate-400">{{ customerAuth.user?.username }}</p>
          </div>

          <nav class="mt-6 space-y-2">
            <button
              v-for="item in sidebarItems"
              :key="item.key"
              type="button"
              :class="[
                'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition-colors',
                activeSection === item.key
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                  : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
              ]"
              @click="activeSection = item.key"
            >
              <span>{{ item.label }}</span>
            </button>
          </nav>

          <button
            type="button"
            class="mt-10 w-full text-center text-sm text-slate-400 transition-colors hover:text-slate-700"
            @click="logout"
          >
            退出登录
          </button>
        </aside>

        <main class="min-w-0">
          <section v-if="activeSection === 'overview'" class="flex flex-col gap-6">
            <div class="grid gap-6 xl:grid-cols-[2fr_1fr]">
              <div class="flex items-center justify-between rounded-[28px] bg-gradient-to-r from-slate-900 to-slate-800 px-7 py-6 text-white shadow-soft">
                <div>
                  <h2 class="text-3xl font-bold tracking-tight">你好，{{ customerAuth.displayName }} 👋</h2>
                  <p class="mt-2 text-sm text-slate-300">欢迎回到个人中心，订单、地址和账户信息都可以在这里统一管理。</p>
                </div>
                <div class="text-5xl opacity-80">✨</div>
              </div>

              <div class="rounded-[28px] bg-gradient-to-br from-orange-400 to-orange-500 px-7 py-6 text-white shadow-soft shadow-orange-500/20">
                <div class="text-sm text-orange-100">所有订单</div>
                <div class="mt-2 text-4xl font-bold tracking-tight">{{ totalOrderCount }}</div>
                <button
                  type="button"
                  class="mt-6 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/30"
                  @click="activeSection = 'orders'; activeOrderFilter = 'all'"
                >
                  立即查看
                </button>
              </div>
            </div>

            <section class="rounded-[28px] border border-gray-100 bg-white px-7 py-6 shadow-soft">
              <div class="mb-6 flex items-center justify-between gap-4">
                <h3 class="text-2xl font-bold text-slate-900">我的订单</h3>
                <button type="button" class="text-sm text-slate-400 transition-colors hover:text-orange-500" @click="activeSection = 'orders'">
                  全部订单 >
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4 md:grid-cols-5">
                <button
                  v-for="item in orderStatusCards"
                  :key="item.key"
                  type="button"
                  class="group flex flex-col items-center rounded-2xl px-3 py-2 transition-colors hover:bg-orange-50"
                  @click="activeSection = 'orders'; activeOrderFilter = item.key"
                >
                  <div class="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-2xl transition-colors group-hover:bg-orange-100">
                    <span>{{ item.icon }}</span>
                    <span
                      v-if="item.count"
                      class="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-orange-500 px-1 text-[10px] font-bold text-white"
                    >
                      {{ item.count }}
                    </span>
                  </div>
                  <span class="text-sm font-medium text-slate-700">{{ item.label }}</span>
                </button>
              </div>
            </section>

            <div class="grid gap-6 xl:grid-cols-[3fr_2fr]">
              <section class="rounded-[28px] border border-gray-100 bg-white px-7 py-6 shadow-soft">
                <div class="mb-6 flex items-center justify-between">
                  <h3 class="text-2xl font-bold text-slate-900">近期购买</h3>
                  <button type="button" class="text-sm text-slate-400 transition-colors hover:text-orange-500" @click="activeSection = 'orders'">
                    查看全部
                  </button>
                </div>

                <div v-if="recentOrders.length" class="space-y-3">
                  <article
                    v-for="order in recentOrders"
                    :key="order.id"
                    class="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/60 px-5 py-4 transition-colors hover:border-orange-200"
                  >
                    <div class="flex items-center gap-4">
                      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">📦</div>
                      <div>
                        <div class="text-sm font-bold text-slate-900">{{ getOrderItemSummary(order) }}</div>
                        <div class="mt-1 text-xs text-slate-400">订单号：{{ order.order_no }}</div>
                        <div class="mt-1 text-xs text-slate-400">{{ order.created_at }}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-bold text-slate-900">¥ {{ formatPrice(order.payable_amount) }}</div>
                      <div class="mt-1 text-xs font-semibold text-orange-500">{{ normalizeOrderStatus(order.status) }}</div>
                    </div>
                  </article>
                </div>
                <div v-else class="flex min-h-[220px] items-center justify-center rounded-3xl bg-gray-50 text-slate-400">
                  还没有订单，先去挑选喜欢的商品吧。
                </div>
              </section>

              <section class="rounded-[28px] border border-gray-100 bg-white px-7 py-6 shadow-soft">
                <div class="mb-6 flex items-center justify-between">
                  <h3 class="text-2xl font-bold text-slate-900">默认地址</h3>
                  <button type="button" class="text-sm text-slate-400 transition-colors hover:text-orange-500" @click="activeSection = 'addresses'">
                    去管理
                  </button>
                </div>

                <div v-if="customerAuth.defaultAddress" class="rounded-3xl border border-orange-100 bg-orange-50/50 p-5">
                  <div class="text-base font-bold text-slate-900">
                    {{ customerAuth.defaultAddress.recipient_name }} {{ customerAuth.defaultAddress.recipient_phone }}
                  </div>
                  <p class="mt-3 text-sm leading-7 text-slate-600">
                    {{ customerAuth.defaultAddress.province }}{{ customerAuth.defaultAddress.city }}{{ customerAuth.defaultAddress.district || '' }}{{ customerAuth.defaultAddress.detail_address }}
                  </p>
                  <button
                    type="button"
                    class="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                    @click="activeSection = 'addresses'"
                  >
                    管理收货地址
                  </button>
                </div>
                <div v-else class="flex min-h-[220px] items-center justify-center rounded-3xl bg-gray-50 text-slate-400">
                  还没有默认地址
                </div>
              </section>
            </div>
          </section>

          <section v-else-if="activeSection === 'orders'" class="rounded-[28px] border border-gray-100 bg-white px-7 py-6 shadow-soft">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h2 class="text-3xl font-bold tracking-tight text-slate-900">我的订单</h2>
                <p class="mt-2 text-sm text-slate-400">查看订单状态、下单时间和订单金额。</p>
              </div>
            </div>

            <div class="mb-6 flex flex-wrap gap-3">
              <button
                v-for="item in orderFilters"
                :key="item.key"
                type="button"
                :class="[
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  activeOrderFilter === item.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                ]"
                @click="activeOrderFilter = item.key"
              >
                <span>{{ item.label }}</span>
                <span
                  :class="[
                    'rounded-full px-2 py-0.5 text-xs',
                    activeOrderFilter === item.key
                      ? 'bg-white/15 text-white'
                      : 'bg-white text-slate-500'
                  ]"
                >
                  {{ item.count }}
                </span>
              </button>
            </div>

            <div v-if="filteredOrders.length" class="space-y-3">
              <article
                v-for="order in filteredOrders"
                :key="order.id"
                class="rounded-2xl border border-gray-100 bg-gray-50/60 px-5 py-4"
              >
                <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div class="min-w-0">
                    <div class="text-base font-bold text-slate-900">{{ order.order_no }}</div>
                    <div class="mt-2 text-sm text-slate-500">下单时间：{{ order.created_at }}</div>
                    <div v-if="order.latest_return_request" class="mt-3 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
                      <div class="text-sm font-semibold text-orange-600">
                        {{ normalizeReturnRequestStatus(order.latest_return_request.status) }}
                      </div>
                      <div class="mt-1 text-sm text-slate-600">
                        原因：{{ order.latest_return_request.reason || '未填写' }}
                      </div>
                      <div
                        v-if="order.latest_return_request.admin_remark"
                        class="mt-1 text-sm text-slate-500"
                      >
                        处理说明：{{ order.latest_return_request.admin_remark }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-6 md:pl-6">
                    <span class="text-sm font-semibold text-orange-500">{{ normalizeOrderStatus(order.status) }}</span>
                    <span class="text-lg font-bold text-slate-900">¥ {{ formatPrice(order.payable_amount) }}</span>
                    <button
                      v-if="order.status === 'pending_payment' && order.payment_status === 'unpaid'"
                      type="button"
                      class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                      @click="handlePayOrder(order)"
                    >
                      立即付款
                    </button>
                    <button
                      v-if="order.status === 'pending_payment' && order.payment_status === 'unpaid'"
                      type="button"
                      class="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:border-red-300 hover:bg-red-50"
                      @click="handleCancelOrder(order)"
                    >
                      取消订单
                    </button>
                    <button
                      v-if="order.status === 'shipped' && order.payment_status === 'paid'"
                      type="button"
                      class="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                      @click="handleConfirmReceipt(order)"
                    >
                      确认收货
                    </button>
                    <button
                      v-if="canApplyReturn(order)"
                      type="button"
                      class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-orange-200 hover:text-orange-500"
                      @click="openReturnRequest(order)"
                    >
                      申请退货
                    </button>
                  </div>
                </div>

                <div v-if="order.items?.length" class="mt-4 space-y-3 border-t border-gray-100 pt-4">
                  <article
                    v-for="item in order.items"
                    :key="item.id"
                    class="flex flex-col gap-3 rounded-2xl bg-white px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div class="min-w-0">
                      <div class="text-base font-semibold text-slate-900">
                        {{ item.product_name || item.sku_name || '未命名商品' }}
                      </div>
                      <div v-if="item.sku_name" class="mt-1 text-sm text-slate-500">
                        {{ item.sku_name }}
                      </div>
                      <div v-if="formatSpecSummary(item.spec_summary)" class="mt-2 text-sm text-slate-500">
                        规格：{{ formatSpecSummary(item.spec_summary) }}
                      </div>
                    </div>
                    <div class="flex items-center gap-6 text-sm text-slate-500">
                      <span>数量 × {{ item.quantity }}</span>
                      <span class="text-base font-semibold text-slate-900">¥ {{ formatPrice(item.unit_price) }}</span>
                    </div>
                  </article>
                </div>
              </article>
            </div>
            <div v-else class="flex min-h-[260px] items-center justify-center rounded-3xl bg-gray-50 text-slate-400">
              当前筛选下暂无订单记录
            </div>
          </section>

          <section v-else-if="activeSection === 'addresses'" class="rounded-[28px] border border-gray-100 bg-white px-7 py-6 shadow-soft">
            <div class="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 class="text-3xl font-bold tracking-tight text-slate-900">收货地址</h2>
                <p class="mt-2 text-sm text-slate-400">维护常用收货地址，下单时可直接选择默认地址。</p>
              </div>
              <button
                type="button"
                class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                @click="openCreateAddress"
              >
                新增地址
              </button>
            </div>

            <div v-if="customerAuth.addresses.length" class="grid gap-4 md:grid-cols-2">
              <article
                v-for="address in customerAuth.addresses"
                :key="address.id"
                class="rounded-3xl border border-gray-100 bg-gray-50/60 p-5"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="text-base font-bold text-slate-900">{{ address.recipient_name }}</div>
                    <div class="mt-1 text-sm text-slate-500">{{ address.recipient_phone }}</div>
                  </div>
                  <span
                    v-if="Number(address.is_default) === 1"
                    class="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-500"
                  >
                    默认地址
                  </span>
                </div>

                <p class="mt-4 text-sm leading-7 text-slate-600">
                  {{ address.province }}{{ address.city }}{{ address.district || '' }}{{ address.detail_address }}
                </p>

                <div class="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold">
                  <button
                    v-if="Number(address.is_default) !== 1"
                    type="button"
                    class="text-slate-600 transition-colors hover:text-orange-500"
                    @click="setDefaultAddress(address.id)"
                  >
                    设为默认
                  </button>
                  <button type="button" class="text-slate-600 transition-colors hover:text-slate-900" @click="openEditAddress(address)">
                    编辑
                  </button>
                  <button type="button" class="text-red-500 transition-colors hover:text-red-600" @click="deleteAddress(address.id)">
                    删除
                  </button>
                </div>
              </article>
            </div>
            <div v-else class="flex min-h-[260px] items-center justify-center rounded-3xl bg-gray-50 text-slate-400">
              还没有收货地址，先添加一个常用地址吧。
            </div>
          </section>

          <section v-else class="rounded-[28px] border border-gray-100 bg-white px-7 py-8 shadow-soft">
            <h2 class="mb-8 text-[30px] font-bold tracking-tight text-slate-900">账户设置</h2>

            <div class="mb-10">
              <h3 class="mb-5 text-base font-bold text-slate-900">基本信息</h3>

              <div class="mb-6 flex items-center gap-6">
                <div class="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white shadow-md">
                  {{ customerAuth.displayName.slice(0, 1).toUpperCase() }}
                </div>
                <div>
                  <button
                    type="button"
                    class="mb-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-50"
                  >
                    上传新头像
                  </button>
                  <p class="text-xs text-gray-400">支持 JPG、PNG 格式，大小不超过 2MB</p>
                </div>
              </div>

              <div class="max-w-md space-y-5">
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">昵称</label>
                  <input
                    v-model="profileForm.nickname"
                    type="text"
                    class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-slate-900 focus:bg-white focus:outline-none"
                  >
                </div>

                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">性别</label>
                  <div class="mt-2 flex gap-6">
                    <label class="flex cursor-pointer items-center gap-2 text-sm">
                      <input v-model="profileForm.gender" type="radio" :value="0" class="h-4 w-4 accent-slate-900">
                      男
                    </label>
                    <label class="flex cursor-pointer items-center gap-2 text-sm">
                      <input v-model="profileForm.gender" type="radio" :value="1" class="h-4 w-4 accent-slate-900">
                      女
                    </label>
                    <label class="flex cursor-pointer items-center gap-2 text-sm">
                      <input v-model="profileForm.gender" type="radio" :value="2" class="h-4 w-4 accent-slate-900">
                      保密
                    </label>
                  </div>
                </div>

                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">邮箱</label>
                  <input
                    v-model="profileForm.email"
                    type="email"
                    placeholder="请输入您的常用邮箱"
                    class="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-slate-900 focus:bg-white focus:outline-none"
                  >
                </div>

                <button
                  type="button"
                  class="mt-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
                  :disabled="profileSaving"
                  @click="saveProfile"
                >
                  {{ profileSaving ? '保存中...' : '保存修改' }}
                </button>
              </div>
            </div>

            <hr class="my-8 border-gray-100">

            <div>
              <h3 class="mb-5 text-base font-bold text-slate-900">账号绑定</h3>

              <div class="overflow-hidden rounded-2xl border border-gray-100 divide-y divide-gray-100">
                <div class="flex items-center justify-between bg-white p-5 transition-colors hover:bg-gray-50/50">
                  <div class="flex items-center gap-4">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-lg">📱</div>
                    <div>
                      <div class="text-sm font-bold text-slate-900">手机号码</div>
                      <div class="mt-1 text-xs text-gray-500">
                        {{ customerAuth.user?.phone ? `${customerAuth.user.phone.slice(0, 3)}****${customerAuth.user.phone.slice(-4)}` : '未绑定' }}
                      </div>
                    </div>
                  </div>
                  <button type="button" class="text-sm font-medium text-slate-600 hover:text-slate-900" @click="openPhoneDialog">更换</button>
                </div>

                <div class="flex items-center justify-between bg-white p-5 transition-colors hover:bg-gray-50/50">
                  <div class="flex items-center gap-4">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-lg">🔑</div>
                    <div>
                      <div class="text-sm font-bold text-slate-900">登录密码</div>
                      <div class="mt-1 text-xs text-gray-500">已设置</div>
                    </div>
                  </div>
                  <button type="button" class="text-sm font-medium text-slate-600 hover:text-slate-900" @click="openPasswordDialog">修改</button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </el-main>

    <SiteFooter />

    <el-dialog v-model="addressDialogVisible" :title="editingAddressId ? '编辑收货地址' : '新增收货地址'" width="560px">
      <el-form label-position="top">
        <el-form-item label="收件人">
          <el-input v-model="addressForm.recipient_name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="addressForm.recipient_phone" />
        </el-form-item>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <el-form-item label="省份">
            <el-input v-model="addressForm.province" />
          </el-form-item>
          <el-form-item label="城市">
            <el-input v-model="addressForm.city" />
          </el-form-item>
        </div>
        <el-form-item label="区县">
          <el-input v-model="addressForm.district" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="addressForm.detail_address" />
        </el-form-item>
        <el-checkbox v-model="addressForm.is_default" :true-label="1" :false-label="0">设为默认地址</el-checkbox>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            @click="addressDialogVisible = false"
          >
            取消
          </button>
          <button
            type="button"
            class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            :disabled="saving"
            @click="submitAddress"
          >
            {{ saving ? '保存中...' : '保存地址' }}
          </button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="returnDialogVisible" title="申请退货" width="520px">
      <el-form label-position="top">
        <el-form-item label="订单号">
          <el-input :model-value="returnRequestForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="退货原因">
          <el-select v-model="returnRequestForm.reason" placeholder="请选择退货原因" style="width: 100%">
            <el-option label="商品不喜欢" value="商品不喜欢" />
            <el-option label="商品与描述不符" value="商品与描述不符" />
            <el-option label="商品存在质量问题" value="商品存在质量问题" />
            <el-option label="尺寸/规格不合适" value="尺寸/规格不合适" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
        <el-form-item label="补充说明">
          <el-input
            v-model="returnRequestForm.description"
            type="textarea"
            :rows="4"
            placeholder="可填写更详细的说明，方便后台审核"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            @click="returnDialogVisible = false"
          >
            取消
          </button>
          <button
            type="button"
            class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            @click="submitReturnRequest"
          >
            提交申请
          </button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="phoneDialogVisible" title="更换手机号" width="460px">
      <el-form label-position="top">
        <el-form-item label="新手机号">
          <el-input v-model="phoneForm.phone" placeholder="请输入新的11位手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            @click="phoneDialogVisible = false"
          >
            取消
          </button>
          <button
            type="button"
            class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            @click="submitPhoneChange"
          >
            保存手机号
          </button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordDialogVisible" title="修改登录密码" width="480px">
      <el-form label-position="top">
        <el-form-item label="当前密码">
          <el-input v-model="passwordForm.currentPassword" type="password" show-password placeholder="请输入当前密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            @click="passwordDialogVisible = false"
          >
            取消
          </button>
          <button
            type="button"
            class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            @click="submitPasswordChange"
          >
            保存新密码
          </button>
        </div>
      </template>
    </el-dialog>

  </el-container>
</template>

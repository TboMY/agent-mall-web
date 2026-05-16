<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const customerAuth = useCustomerAuthStore()
const cart = useCartStore()

const submitting = ref(false)
const remark = ref('')
const selectedAddressId = ref(null)

const isLoggedIn = computed(() => customerAuth.isAuthenticated)
const allSelected = computed(() => cart.items.length > 0 && cart.items.every((item) => Number(item.selected) === 1))
const selectedCount = computed(() => cart.selectedItems.length)

function formatPrice(value) {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

async function bootstrapCart() {
  if (!isLoggedIn.value) {
    cart.clear()
    return
  }
  await Promise.all([customerAuth.fetchAddresses(), cart.fetchCart()])
  selectedAddressId.value = customerAuth.defaultAddress?.id || null
}

async function handleQuantityChange(item, quantity) {
  const next = Math.max(1, Number(quantity || 1))
  await cart.updateItem(item.id, { quantity: next, selected: item.selected })
}

async function handleToggleItem(item, selected) {
  await cart.toggleSelected(item.id, selected)
}

async function handleToggleAll(value) {
  await cart.toggleAll(value)
}

async function handleRemove(item) {
  await cart.removeItem(item.id)
  ElMessage.success('已移出购物车')
}

async function handleCheckout() {
  if (!cart.selectedItems.length) {
    ElMessage.warning('请先选择要结算的商品')
    return
  }
  if (!selectedAddressId.value && !customerAuth.defaultAddress) {
    ElMessage.warning('请先添加收货地址')
    router.push('/account')
    return
  }

  submitting.value = true
  try {
    const order = await cart.checkout(selectedAddressId.value || customerAuth.defaultAddress?.id, remark.value)
    await customerAuth.fetchOrders()
    ElMessage.success('订单提交成功')
    router.push(`/orders/${order.id}/pay`)
    return order
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || error.message || '提交订单失败')
  } finally {
    submitting.value = false
  }
}

onMounted(bootstrapCart)
</script>

<template>
  <el-container direction="vertical" class="am-cart">
    <NavBar />

    <el-main class="page-container am-cart__main">
      <section class="am-cart__hero">
        <div>
          <div class="am-cart__kicker">Shopping Cart</div>
          <h1>购物车</h1>
          <p>已选商品、收货地址和订单金额都在这里确认。</p>
        </div>
      </section>

      <section v-if="!isLoggedIn" class="am-cart__empty-state">
        <h2>登录后查看购物车</h2>
        <p>登录后可查看已加入购物车的商品。</p>
        <div class="am-cart__empty-actions">
          <button type="button" class="am-cart__primary" @click="router.push('/account')">去登录</button>
          <button type="button" class="am-cart__secondary" @click="router.push('/')">继续逛逛</button>
        </div>
      </section>

      <section v-else-if="cart.items.length" class="am-cart__layout">
        <div class="am-cart__list">
          <div class="am-cart__list-head">
            <label class="am-cart__checkbox-row">
              <input type="checkbox" :checked="allSelected" @change="handleToggleAll($event.target.checked)" />
              <span>全选</span>
            </label>
            <strong>{{ cart.count }} 件商品</strong>
          </div>

          <div v-if="cart.items.length" class="am-cart__items">
            <article v-for="item in cart.items" :key="item.id" class="am-cart__item">
              <label class="am-cart__checkbox-row">
                <input
                  type="checkbox"
                  :checked="Number(item.selected) === 1"
                  @change="handleToggleItem(item, $event.target.checked)"
                />
              </label>

              <div class="am-cart__item-visual">
                <img :src="item.sku_image || item.product_image" :alt="item.product_name" class="am-cart__item-image" />
              </div>

              <div class="am-cart__item-info">
                <h3>{{ item.product_name }}</h3>
                <p>{{ item.sku_name }}</p>
                <div v-if="item.spec_summary?.length" class="am-cart__specs">
                  <span v-for="spec in item.spec_summary" :key="`${item.id}-${spec.attribute_name}-${spec.value_label}`">
                    {{ spec.attribute_name }}：{{ spec.value_label }}
                  </span>
                </div>
              </div>

              <div class="am-cart__item-price">
                <strong>￥{{ formatPrice(item.price) }}</strong>
                <small v-if="item.original_price">￥{{ formatPrice(item.original_price) }}</small>
              </div>

              <div class="am-cart__item-qty">
                <el-input-number
                  :min="1"
                  :max="Number(item.sku_stock || 1)"
                  :model-value="Number(item.quantity)"
                  @change="(val) => handleQuantityChange(item, val)"
                />
              </div>

              <div class="am-cart__item-total">
                ￥{{ formatPrice(Number(item.price) * Number(item.quantity)) }}
              </div>

              <button type="button" class="am-cart__remove" @click="handleRemove(item)">删除</button>
            </article>
          </div>
          <div v-else class="am-cart__empty">
            购物车还是空的，先去挑几件喜欢的商品吧。
          </div>
        </div>

        <aside class="am-cart__summary">
          <div class="am-cart__summary-card">
            <div class="am-cart__summary-head">
              <h2>结算信息</h2>
              <span>{{ selectedCount }} 件已选</span>
            </div>

            <div class="am-cart__address">
              <div class="am-cart__label">收货地址</div>
              <el-select
                v-model="selectedAddressId"
                placeholder="选择收货地址"
                style="width: 100%;"
                :disabled="!customerAuth.addresses.length"
              >
                <el-option
                  v-for="address in customerAuth.addresses"
                  :key="address.id"
                  :label="`${address.recipient_name} ${address.recipient_phone} ${address.province}${address.city}${address.district || ''}${address.detail_address}`"
                  :value="address.id"
                />
              </el-select>
              <button type="button" class="am-cart__text-link" @click="router.push('/account')">管理地址</button>
            </div>

            <div class="am-cart__address">
              <div class="am-cart__label">订单备注</div>
              <el-input v-model="remark" type="textarea" :rows="3" placeholder="选填，给商家留言" />
            </div>

            <div class="am-cart__summary-row">
              <span>商品合计</span>
              <strong>￥{{ formatPrice(cart.selectedTotal) }}</strong>
            </div>

            <div class="am-cart__summary-row am-cart__summary-row--total">
              <span>应付金额</span>
              <strong>￥{{ formatPrice(cart.selectedTotal) }}</strong>
            </div>

            <button type="button" class="am-cart__primary am-cart__primary--block" :disabled="submitting" @click="handleCheckout">
              {{ submitting ? '提交中...' : '提交订单' }}
            </button>
          </div>
        </aside>
      </section>

      <section v-else class="am-cart__empty-cart">
        <div class="am-cart__empty-cart-card">
          <div class="am-cart__empty-cart-icon">🛒</div>
          <h2>购物车还是空的</h2>
          <p>去看看最近上新的商品，把喜欢的先加入购物车吧。</p>
          <div class="am-cart__empty-actions">
            <button type="button" class="am-cart__primary" @click="router.push('/hot-products')">去逛热门</button>
            <button type="button" class="am-cart__secondary" @click="router.push('/categories')">浏览分类</button>
          </div>
        </div>
      </section>
    </el-main>

    <SiteFooter />
  </el-container>
</template>

<style>
.am-cart {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(244, 186, 92, 0.14), transparent 22%),
    #f7f3ea;
}

.am-cart__main {
  padding-top: 26px;
  padding-bottom: 36px;
}

.am-cart__hero,
.am-cart__list,
.am-cart__summary-card,
.am-cart__empty-state {
  border-radius: 30px;
  background: rgba(255,255,255,0.88);
  border: 1px solid rgba(19,35,55,0.08);
  box-shadow: 0 20px 48px rgba(24,39,62,0.08);
}

.am-cart__hero {
  padding: 28px 30px;
}

.am-cart__kicker {
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

.am-cart__hero h1,
.am-cart__empty-state h2 {
  margin: 12px 0 0;
  font-size: 34px;
  line-height: 1.08;
  color: #132337;
}

.am-cart__hero p,
.am-cart__empty-state p {
  margin: 12px 0 0;
  color: #627385;
  line-height: 1.8;
}

.am-cart__empty-state {
  margin-top: 24px;
  padding: 56px 32px;
  text-align: center;
}

.am-cart__empty-actions {
  margin-top: 22px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.am-cart__layout {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
}

.am-cart__empty-cart {
  margin-top: 24px;
}

.am-cart__empty-cart-card {
  min-height: 420px;
  border-radius: 30px;
  background: rgba(255,255,255,0.88);
  border: 1px solid rgba(19,35,55,0.08);
  box-shadow: 0 20px 48px rgba(24,39,62,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 32px;
}

.am-cart__empty-cart-icon {
  width: 88px;
  height: 88px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(239,108,64,0.12) 0%, rgba(242,180,88,0.16) 100%);
  font-size: 40px;
}

.am-cart__empty-cart-card h2 {
  margin: 22px 0 0;
  font-size: 34px;
  line-height: 1.1;
  color: #132337;
}

.am-cart__empty-cart-card p {
  max-width: 460px;
  margin: 14px 0 0;
  color: #627385;
  line-height: 1.8;
}

.am-cart__list {
  padding: 20px;
}

.am-cart__list-head,
.am-cart__summary-head,
.am-cart__summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.am-cart__checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #203348;
  font-weight: 700;
}

.am-cart__items {
  margin-top: 18px;
  display: grid;
  gap: 14px;
}

.am-cart__item {
  display: grid;
  grid-template-columns: auto 120px minmax(220px, 1.4fr) 0.7fr 0.8fr 0.7fr auto;
  gap: 14px;
  align-items: center;
  padding: 16px;
  border-radius: 22px;
  background: rgba(248,250,252,0.84);
}

.am-cart__item-visual {
  width: 120px;
  height: 120px;
  border-radius: 22px;
  background: linear-gradient(180deg, #f7fafc 0%, #e7eef5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(19,35,55,0.06);
}

.am-cart__item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.am-cart__item-info h3 {
  margin: 0;
  font-size: 18px;
  color: #132337;
}

.am-cart__item-info p {
  margin: 8px 0 0;
  color: #627385;
}

.am-cart__specs {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.am-cart__specs span {
  padding: 4px 8px;
  border-radius: 999px;
  background: #fff;
  color: #5f7082;
  font-size: 12px;
}

.am-cart__item-price,
.am-cart__item-total {
  color: #132337;
  font-weight: 800;
}

.am-cart__item-price small {
  display: block;
  margin-top: 4px;
  color: #97a4b1;
  font-weight: 600;
  text-decoration: line-through;
}

.am-cart__remove,
.am-cart__text-link,
.am-cart__primary,
.am-cart__secondary {
  appearance: none;
  -webkit-appearance: none;
  border: none;
  font: inherit;
}

.am-cart__remove {
  background: transparent;
  color: #d96a42;
  font-weight: 700;
  cursor: pointer;
}

.am-cart__empty {
  margin-top: 18px;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  background: rgba(248,250,252,0.84);
  color: #7c8d9f;
  font-weight: 700;
}

.am-cart__summary-card {
  padding: 24px;
  position: sticky;
  top: 120px;
}

.am-cart__summary-head h2 {
  margin: 0;
  font-size: 24px;
  color: #132337;
}

.am-cart__summary-head span,
.am-cart__label {
  color: #627385;
  font-size: 13px;
}

.am-cart__address {
  margin-top: 18px;
}

.am-cart__text-link {
  margin-top: 10px;
  padding: 0;
  background: transparent;
  color: #2b527a;
  font-weight: 700;
  cursor: pointer;
}

.am-cart__summary-row {
  margin-top: 18px;
  font-size: 15px;
  color: #5f7082;
}

.am-cart__summary-row--total strong {
  font-size: 30px;
  color: #ef6c40;
}

.am-cart__primary,
.am-cart__secondary {
  min-height: 48px;
  padding: 0 22px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 800;
}

.am-cart__primary {
  background: linear-gradient(135deg, #ef6c40 0%, #f2b458 100%);
  color: #fff;
}

.am-cart__secondary {
  background: rgba(19,35,55,0.08);
  color: #132337;
}

.am-cart__primary--block {
  width: 100%;
  margin-top: 24px;
}

@media (max-width: 1100px) {
  .am-cart__layout {
    grid-template-columns: 1fr;
  }

  .am-cart__summary-card {
    position: static;
  }

  .am-cart__item {
    grid-template-columns: auto 96px 1fr;
  }
}

@media (max-width: 760px) {
  .am-cart__item {
    grid-template-columns: 1fr;
  }

  .am-cart__empty-actions {
    flex-direction: column;
  }
}
</style>

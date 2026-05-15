<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import NavBar from '@/components/NavBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { productAPI } from '@/services/api'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const customerAuth = useCustomerAuthStore()
const cart = useCartStore()

const loading = ref(false)
const product = ref(null)
const gallery = ref([])
const activeImage = ref('')
const guess = ref([])
const activeSkuId = ref(null)

const activeSku = computed(() => {
  if (!product.value?.skus?.length) return null
  return product.value.skus.find((item) => Number(item.id) === Number(activeSkuId.value)) || product.value.skus[0]
})

const detailTags = computed(() => {
  const raw = product.value?.tags
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return raw.split(',').map((item) => item.trim()).filter(Boolean)
    }
  }
  return []
})

function formatPrice(value) {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

async function loadData() {
  loading.value = true
  try {
    const resp = await productAPI.getProduct(route.params.id)
    if (resp.success) {
      product.value = resp.data
      const images = Array.isArray(resp.data.images)
        ? resp.data.images
        : (typeof resp.data.images === 'string'
          ? JSON.parse(resp.data.images || '[]')
          : [])

      gallery.value = [resp.data.image, ...images].filter(Boolean)
      activeImage.value = gallery.value[0] || resp.data.image

      if (Array.isArray(resp.data.skus) && resp.data.skus.length) {
        const defaultSku = resp.data.skus.find((item) => Number(item.is_default) === 1) || resp.data.skus[0]
        activeSkuId.value = defaultSku.id
      }
    }

    const rec = await productAPI.getProducts({ page: 1, limit: 8, sort_by: 'created_at', sort_order: 'DESC' })
    if (rec.success) {
      guess.value = (rec.data || []).filter((item) => Number(item.id) !== Number(route.params.id)).slice(0, 4)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function selectSku(id) {
  activeSkuId.value = id
}

async function addToCart() {
  if (!activeSku.value) {
    ElMessage.warning('当前商品暂无可用SKU')
    return
  }
  if (!customerAuth.isAuthenticated) {
    ElMessage.warning('请先登录后再加入购物车')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  try {
    await cart.addItem(activeSku.value.id, 1)
    ElMessage.success(`已加入购物车：${activeSku.value.sku_name}`)
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || error.message || '加入购物车失败')
  }
}

function openSource() {
  if (product.value?.source_url) {
    window.open(product.value.source_url, '_blank')
  }
}

onMounted(loadData)
</script>

<template>
  <el-container direction="vertical" class="am-detail">
    <NavBar />

    <el-main class="page-container am-detail__main" v-loading="loading">
      <section class="am-detail__hero">
        <div class="am-detail__gallery">
          <div class="am-detail__main-image-wrap">
            <img :src="activeImage" :alt="product?.name" class="am-detail__main-image" />
          </div>
          <div class="am-detail__thumbs">
            <button
              v-for="(img, index) in gallery"
              :key="`${img}-${index}`"
              type="button"
              :class="['am-detail__thumb', { 'is-active': img === activeImage }]"
              @click="activeImage = img"
            >
              <img :src="img" :alt="product?.name" />
            </button>
          </div>
        </div>

        <div class="am-detail__summary" v-if="product">
          <div class="am-detail__kicker">Product Detail</div>
          <h1>{{ product.name }}</h1>

          <div class="am-detail__tags">
            <span v-if="product.is_ai_recommended" class="am-detail__pill am-detail__pill--hot">AI推荐</span>
            <span v-if="product.source_platform" class="am-detail__pill">{{ product.source_platform }}</span>
            <span v-for="tag in detailTags" :key="tag" class="am-detail__pill am-detail__pill--soft">{{ tag }}</span>
          </div>

          <div class="am-detail__price-board">
            <div>
              <div class="am-detail__price-label">当前SKU价格</div>
              <div class="am-detail__price-row">
                <span class="am-detail__price-symbol">￥</span>
                <strong>{{ formatPrice(activeSku?.price ?? product.price) }}</strong>
              </div>
            </div>
            <div class="am-detail__price-sub">
              <span>商品总库存</span>
              <strong>{{ product.stock }}</strong>
            </div>
          </div>

          <p class="am-detail__description">{{ product.description }}</p>

          <div class="am-detail__meta">
            <div><span>分类</span><strong>{{ product.category_name || '-' }}</strong></div>
            <div><span>品牌</span><strong>{{ product.brand_name || '-' }}</strong></div>
            <div><span>模板</span><strong>{{ product.product_type_name || '-' }}</strong></div>
          </div>

          <div class="am-detail__sku-block" v-if="product.skus?.length">
            <div class="am-detail__sku-title">选择SKU</div>
            <div class="am-detail__sku-list">
              <button
                v-for="sku in product.skus"
                :key="sku.id"
                type="button"
                :class="['am-detail__sku-chip', { 'is-active': Number(sku.id) === Number(activeSkuId) }]"
                @click="selectSku(sku.id)"
              >
                <strong>{{ sku.sku_name }}</strong>
                <small>库存 {{ sku.stock }}</small>
              </button>
            </div>
          </div>

          <div class="am-detail__sku-specs" v-if="activeSku?.spec_summary?.length">
            <div
              v-for="spec in activeSku.spec_summary"
              :key="`${spec.attribute_id}-${spec.attribute_value_id}-${spec.value_label}`"
              class="am-detail__spec-row"
            >
              <span>{{ spec.attribute_name }}</span>
              <strong>{{ spec.value_label }}</strong>
            </div>
          </div>

          <div class="am-detail__actions">
            <button type="button" class="am-detail__primary" @click="addToCart">加入购物车</button>
            <button type="button" class="am-detail__secondary" @click="router.push('/cart')">查看购物车</button>
            <button v-if="product.source_url" type="button" class="am-detail__secondary" @click="openSource">查看源视频</button>
          </div>

          <div v-if="product.ai_recommendation" class="am-detail__reason">
            <h3>AI推荐理由</h3>
            <p>{{ product.ai_recommendation }}</p>
          </div>
        </div>
      </section>

      <section class="am-detail__section">
        <div class="am-detail__section-head">
          <div class="am-detail__kicker">Visual Story</div>
          <h2>商品图集</h2>
        </div>

        <div class="am-detail__story-grid">
          <div v-for="(img, index) in gallery" :key="`${img}-story-${index}`" class="am-detail__story-image">
            <img :src="img" :alt="product?.name" />
          </div>
        </div>
      </section>

      <section class="am-detail__section">
        <div class="am-detail__section-head">
          <div class="am-detail__kicker">Maybe You Like</div>
          <h2>猜你喜欢</h2>
        </div>

        <div class="am-detail__guess-grid" v-if="guess.length">
          <ProductCard v-for="item in guess" :key="item.id" :product="item" :show-source="true" />
        </div>
        <div v-else class="am-detail__empty">暂无推荐商品</div>
      </section>
    </el-main>

    <SiteFooter />
  </el-container>
</template>

<style>
.am-detail {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(240, 184, 97, 0.16), transparent 22%),
    #f7f3ea;
}

.am-detail__main {
  padding-top: 26px;
  padding-bottom: 36px;
}

.am-detail__hero {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 24px;
  align-items: start;
}

.am-detail__gallery,
.am-detail__summary,
.am-detail__section {
  border-radius: 30px;
  background: rgba(255,255,255,0.86);
  border: 1px solid rgba(19,35,55,0.08);
  box-shadow: 0 22px 52px rgba(24,39,62,0.08);
  backdrop-filter: blur(16px);
}

.am-detail__gallery {
  padding: 22px;
}

.am-detail__main-image-wrap {
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(180deg, #eff4f8 0%, #dbe5ef 100%);
}

.am-detail__main-image {
  width: 100%;
  height: 520px;
  object-fit: cover;
  display: block;
}

.am-detail__thumbs {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.am-detail__thumb {
  border: 1px solid rgba(19,35,55,0.08);
  border-radius: 18px;
  overflow: hidden;
  padding: 0;
  background: #fff;
  cursor: pointer;
}

.am-detail__thumb img {
  width: 100%;
  height: 88px;
  object-fit: cover;
  display: block;
}

.am-detail__thumb.is-active {
  border-color: #ef6c40;
  box-shadow: 0 0 0 2px rgba(239,108,64,0.18);
}

.am-detail__summary {
  padding: 28px;
}

.am-detail__kicker {
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

.am-detail__summary h1,
.am-detail__section-head h2 {
  margin: 14px 0 0;
  font-size: 34px;
  line-height: 1.08;
  color: #132337;
}

.am-detail__tags {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.am-detail__pill {
  min-height: 30px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(19,35,55,0.08);
  color: #173049;
  font-size: 12px;
  font-weight: 700;
}

.am-detail__pill--hot {
  background: linear-gradient(135deg, #ef6c40 0%, #f2b458 100%);
  color: #fff;
}

.am-detail__pill--soft {
  background: #f3f6f9;
  color: #617386;
}

.am-detail__price-board {
  margin-top: 20px;
  padding: 18px 20px;
  border-radius: 24px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  background: linear-gradient(135deg, rgba(255,247,235,0.94) 0%, rgba(242,247,252,0.9) 100%);
}

.am-detail__price-label,
.am-detail__meta span,
.am-detail__sku-chip small {
  color: #78889a;
  font-size: 12px;
}

.am-detail__price-row {
  margin-top: 4px;
  color: #ef6c40;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.am-detail__price-row strong {
  font-size: 36px;
  line-height: 1;
}

.am-detail__price-sub {
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 6px;
}

.am-detail__price-sub strong {
  font-size: 28px;
  line-height: 1;
  color: #132337;
}

.am-detail__description {
  margin: 18px 0 0;
  color: #5f7082;
  line-height: 1.85;
}

.am-detail__meta {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.am-detail__meta div {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(248,250,252,0.84);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.am-detail__meta strong {
  color: #173049;
}

.am-detail__sku-block {
  margin-top: 22px;
}

.am-detail__sku-title {
  font-size: 15px;
  font-weight: 800;
  color: #132337;
}

.am-detail__sku-list {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.am-detail__sku-chip {
  min-width: 150px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(19,35,55,0.1);
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
  cursor: pointer;
}

.am-detail__sku-chip strong {
  color: #173049;
  font-size: 14px;
}

.am-detail__sku-chip.is-active {
  border-color: #ef6c40;
  background: rgba(255,246,237,0.95);
  box-shadow: 0 10px 20px rgba(239,108,64,0.14);
}

.am-detail__sku-specs {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.am-detail__spec-row {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(248,250,252,0.84);
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.am-detail__spec-row span {
  color: #748597;
}

.am-detail__spec-row strong {
  color: #132337;
}

.am-detail__actions {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.am-detail__primary,
.am-detail__secondary {
  appearance: none;
  -webkit-appearance: none;
  min-height: 48px;
  padding: 0 22px;
  border-radius: 999px;
  border: none;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.am-detail__primary {
  background: linear-gradient(135deg, #ef6c40 0%, #f2b458 100%);
  color: #fff;
  box-shadow: 0 20px 34px rgba(239,108,64,0.28);
}

.am-detail__secondary {
  background: rgba(19,35,55,0.08);
  color: #132337;
}

.am-detail__reason {
  margin-top: 24px;
  padding: 18px 20px;
  border-radius: 22px;
  background: linear-gradient(160deg, rgba(255,248,236,0.95) 0%, rgba(241,247,252,0.88) 100%);
}

.am-detail__reason h3 {
  margin: 0;
  font-size: 18px;
}

.am-detail__reason p {
  margin: 12px 0 0;
  color: #5f7082;
  line-height: 1.8;
}

.am-detail__section {
  margin-top: 26px;
  padding: 24px;
}

.am-detail__section-head {
  margin-bottom: 18px;
}

.am-detail__story-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.am-detail__story-image {
  border-radius: 24px;
  overflow: hidden;
  background: #eef4f8;
}

.am-detail__story-image img {
  width: 100%;
  height: 360px;
  object-fit: cover;
  display: block;
}

.am-detail__guess-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.am-detail__empty {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  background: rgba(248,250,252,0.84);
  color: #7c8d9f;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .am-detail__hero,
  .am-detail__guess-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .am-detail__hero,
  .am-detail__guess-grid,
  .am-detail__story-grid,
  .am-detail__meta {
    grid-template-columns: 1fr;
  }

  .am-detail__price-board {
    flex-direction: column;
    align-items: flex-start;
  }

  .am-detail__price-sub {
    align-items: flex-start;
  }
}
</style>

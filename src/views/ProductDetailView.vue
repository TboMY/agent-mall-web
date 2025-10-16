<script setup>
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { productAPI } from '@/services/api'

const route = useRoute()
const loading = ref(false)
const product = ref(null)
const gallery = ref([])
const activeImage = ref('')
const guess = ref([])

function parseTags(t) {
  if (!t) return []
  if (Array.isArray(t)) return t
  if (typeof t === 'string') {
    try { const j = JSON.parse(t); return Array.isArray(j) ? j : String(t).split(',').map(s=>s.trim()).filter(Boolean) }
    catch { return String(t).split(',').map(s=>s.trim()).filter(Boolean) }
  }
  return []
}

function formatPrice(p) {
  const n = Number(p ?? 0)
  return Number.isFinite(n) ? n.toFixed(2) : '—'
}

async function loadData() {
  loading.value = true
  try {
    const resp = await productAPI.getProduct(route.params.id)
    if (resp.success) {
      product.value = resp.data
      const imgs = resp.data.images ? (Array.isArray(resp.data.images) ? resp.data.images : JSON.parse(resp.data.images||'[]')) : []
      gallery.value = [resp.data.image, ...imgs].filter(Boolean)
      activeImage.value = gallery.value[0] || resp.data.image
    }
    const rec = await productAPI.getProducts({ page: 1, limit: 8, sort_by: 'created_at', sort_order: 'DESC' })
    if (rec.success) {
      guess.value = (rec.data || []).filter(i => i.id != route.params.id).slice(0, 4)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function addToCart() {
  ElMessage.success('已加入购物车（示例）')
}

function openSource() {
  if (product.value?.source_url) window.open(product.value.source_url, '_blank')
}

onMounted(loadData)
</script>

<template>
  <el-container direction="vertical">
    <NavBar />
    <el-main class="page-container">
      <el-row :gutter="24" v-loading="loading">
        <el-col :xs="24" :md="12">
          <div class="gallery">
            <el-image :src="activeImage" fit="contain" class="main-image" />
            <div class="thumbs">
              <el-image v-for="(img,i) in gallery" :key="i" :src="img" fit="cover" class="thumb" :class="{active: img===activeImage}" @click="activeImage = img" />
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :md="12">
          <h2>{{ product?.name || '-' }}</h2>
          <div class="meta">
            <el-tag v-if="product?.is_ai_recommended" type="danger" size="small">AI推荐</el-tag>
            <el-tag v-if="product?.source_platform" size="small" style="margin-left:6px;">{{ product.source_platform }}</el-tag>
            <el-tag v-for="t in parseTags(product?.tags)" :key="t" size="small" style="margin-left:6px;">{{ t }}</el-tag>
          </div>
          <div class="price-bar">
            <div class="price">￥{{ formatPrice(product?.price) }}</div>
            <div v-if="product?.original_price" class="orig">￥{{ formatPrice(product?.original_price) }}</div>
          </div>
          <div class="brief">
            <span v-if="product?.category_name">分类：{{ product.category_name }}</span>
            <span v-if="product?.brand_name" style="margin-left:16px;">品牌：{{ product.brand_name }}</span>
            <span style="margin-left:16px;">库存：{{ product?.stock ?? 0 }}</span>
          </div>
          <div class="actions">
            <el-button type="primary" size="large" @click="addToCart">加入购物车</el-button>
            <el-button v-if="product?.source_url" size="large" @click="openSource">查看源视频</el-button>
          </div>
          <div class="ai-reason" v-if="product?.ai_recommendation">{{ product.ai_recommendation }}</div>

          <div class="assurance">
            <el-tag size="small" effect="plain">正品保障</el-tag>
            <el-tag size="small" effect="plain">极速发货</el-tag>
            <el-tag size="small" effect="plain">7天无理由</el-tag>
          </div>
        </el-col>
      </el-row>

      <el-card class="tabs-card">
        <el-tabs>
          <el-tab-pane label="商品详情">
            <div class="detail-content">
              <p v-if="product?.description" class="desc">{{ product.description }}</p>
              <div class="detail-images">
                <el-image v-for="(img,i) in gallery" :key="'d-'+i" :src="img" fit="contain" class="detail-image" />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="规格参数">
            <el-descriptions :column="2" border size="small" v-if="product">
              <el-descriptions-item label="分类">{{ product.category_name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="品牌">{{ product.brand_name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="上架状态">{{ product.status === 1 ? '上架' : '下架' }}</el-descriptions-item>
              <el-descriptions-item label="热度分">{{ product.heat_score ?? 0 }}</el-descriptions-item>
              <el-descriptions-item label="来源平台">{{ product.source_platform || '-' }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ new Date(product.created_at).toLocaleString('zh-CN') }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="推荐搭配">
            <div class="pairing-tips">基于相似类别与热度，以下商品可能适合搭配使用。</div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <h3 class="sec-title">猜你喜欢</h3>
      <el-row :gutter="16">
        <el-col v-for="item in guess" :key="item.id" :xs="12" :sm="8" :md="6" :lg="6">
          <ProductCard :product="item" />
        </el-col>
      </el-row>
    </el-main>
    <SiteFooter />
  </el-container>
  
</template>

<style scoped>
.gallery { display: flex; flex-direction: column; gap: 12px; }
.main-image { width: 100%; height: 420px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.thumbs { display: flex; gap: 8px; flex-wrap: wrap; }
.thumb { width: 68px; height: 68px; border-radius: 6px; cursor: pointer; border: 1px solid #eee; }
.thumb.active { outline: 2px solid #409eff; }
.meta { margin: 8px 0; }
.price-bar { display:flex; align-items: baseline; gap: 10px; margin: 10px 0; }
.price { color: #e1251b; font-size: 28px; font-weight: 700; }
.orig { color:#909399; text-decoration: line-through; }
.brief { color:#606266; font-size: 13px; margin-bottom: 12px; }
.actions { display: flex; gap: 12px; margin-bottom: 12px; }
.ai-reason { color: #606266; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
.assurance { display:flex; gap:8px; margin-top: 8px; }
.tabs-card { margin-top: 20px; }
.detail-images { display:flex; flex-direction: column; gap: 10px; }
.detail-image { width: 100%; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,.04); }
.sec-title { margin-top: 24px; }
</style>



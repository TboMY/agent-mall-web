<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { categoryAPI, productAPI, systemConfigAPI } from '@/services/api'

const loading = ref(false)
const saving = ref(false)
const productOptions = ref([])
const aiProductOptions = ref([])
const categoryOptions = ref([])

const sectionDefs = [
  { key: 'aiProductIds', title: 'AI热点商品', description: '用于首页首屏右侧“AI热点商品”区域，只能选择 AI 推荐商品，按上架时间倒序选择。', limit: 3, source: 'ai' },
  { key: 'hotProductIds', title: '人气单品', description: '用于首页“人气单品”区域，建议选择 1-4 个商品。', limit: 4 },
  { key: 'latestProductIds', title: '新品上架', description: '用于首页“新品上架”区域，建议选择 1-8 个商品。', limit: 8 }
]

const form = reactive({
  aiProductIds: [],
  hotProductIds: [],
  latestProductIds: [],
  categoryIds: []
})

const productMap = computed(() => {
  const map = new Map()
  ;[...productOptions.value, ...aiProductOptions.value].forEach((item) => map.set(Number(item.id), item))
  return map
})

const categoryMap = computed(() => {
  const map = new Map()
  categoryOptions.value.forEach((item) => map.set(Number(item.id), item))
  return map
})

function normalizeIds(ids = []) {
  return (ids || []).map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
}

function getSelectedProducts(ids = []) {
  return normalizeIds(ids).map((id) => productMap.value.get(id)).filter(Boolean)
}

function getSelectedCategories(ids = []) {
  return normalizeIds(ids).map((id) => categoryMap.value.get(id)).filter(Boolean)
}

function formatPrice(value) {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

function ensureLimit(key, limit) {
  if (form[key].length > limit) {
    form[key] = form[key].slice(0, limit)
    ElMessage.warning(`最多选择 ${limit} 个商品`)
  }
}

function getProductSelectOptions(section) {
  return section.source === 'ai' ? aiProductOptions.value : productOptions.value
}

async function loadData() {
  loading.value = true
  try {
    const [productResp, aiProductResp, categoryResp, configResp] = await Promise.all([
      productAPI.getProducts({ page: 1, limit: 200, status: 1, sort_by: 'created_at', sort_order: 'DESC' }),
      productAPI.getProducts({ page: 1, limit: 200, status: 1, is_ai_recommended: 1, sort_by: 'created_at', sort_order: 'DESC' }),
      categoryAPI.getCategoryTree(),
      systemConfigAPI.getHomepageDisplayConfig()
    ])

    productOptions.value = productResp.success ? (productResp.data || []) : []
    aiProductOptions.value = aiProductResp.success ? (aiProductResp.data || []) : []
    categoryOptions.value = categoryResp.success ? (categoryResp.data || []).filter((item) => Number(item.level) === 1) : []
    const config = configResp.data || {}
    form.aiProductIds = normalizeIds(config.aiProductIds)
    form.hotProductIds = normalizeIds(config.hotProductIds)
    form.latestProductIds = normalizeIds(config.latestProductIds)
    form.categoryIds = normalizeIds(config.categoryIds)
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '加载首页展示配置失败')
  } finally {
    loading.value = false
  }
}

async function saveConfig() {
  saving.value = true
  try {
    await systemConfigAPI.saveHomepageDisplayConfig({
      aiProductIds: normalizeIds(form.aiProductIds),
      hotProductIds: normalizeIds(form.hotProductIds),
      latestProductIds: normalizeIds(form.latestProductIds),
      categoryIds: normalizeIds(form.categoryIds)
    })
    ElMessage.success('首页展示配置已保存')
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '保存首页展示配置失败')
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="homepage-display-page" v-loading="loading">
    <div class="page-header">
      <h2>首页展示</h2>
      <el-button type="primary" :loading="saving" @click="saveConfig">保存配置</el-button>
    </div>

    <el-card shadow="never" class="page-card intro-card">
      <div class="intro-title">首页商品展示控制</div>
      <div class="intro-text">在这里选择首页各个区域实际展示的商品和分类，前台首页会优先使用这里的配置。</div>
    </el-card>

    <el-card shadow="never" class="page-card section-card">
      <template #header>
        <div class="section-header">
          <div>
            <div class="section-title">分类会场</div>
            <div class="section-desc">用于首页“分类会场”区域，建议选择 1-3 个一级分类，商品会自动读取该分类下最新上架内容。</div>
          </div>
          <el-tag type="info">最多 3 个</el-tag>
        </div>
      </template>

      <div class="section-body">
        <el-select
          v-model="form.categoryIds"
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择一级分类"
          style="width: 100%"
          @change="ensureLimit('categoryIds', 3)"
        >
          <el-option
            v-for="category in categoryOptions"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>

        <div v-if="getSelectedCategories(form.categoryIds).length" class="category-chip-list">
          <span
            v-for="category in getSelectedCategories(form.categoryIds)"
            :key="category.id"
            class="category-chip"
          >
            {{ category.name }}
          </span>
        </div>
        <el-empty v-else description="当前还没有选择分类会场" :image-size="80" />
      </div>
    </el-card>

    <el-card
      v-for="section in sectionDefs"
      :key="section.key"
      shadow="never"
      class="page-card section-card"
    >
      <template #header>
        <div class="section-header">
          <div>
            <div class="section-title">{{ section.title }}</div>
            <div class="section-desc">{{ section.description }}</div>
          </div>
          <el-tag type="info">最多 {{ section.limit }} 个</el-tag>
        </div>
      </template>

      <div class="section-body">
        <el-select
          v-model="form[section.key]"
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择商品"
          style="width: 100%"
          @change="ensureLimit(section.key, section.limit)"
        >
          <el-option
            v-for="product in getProductSelectOptions(section)"
            :key="product.id"
            :label="`${product.name}（¥${formatPrice(product.price)}）`"
            :value="product.id"
          />
        </el-select>

        <div v-if="getSelectedProducts(form[section.key]).length" class="selected-grid">
          <article
            v-for="product in getSelectedProducts(form[section.key])"
            :key="product.id"
            class="selected-product"
          >
            <img :src="product.image" :alt="product.name">
            <div class="selected-product__content">
              <div class="selected-product__name">{{ product.name }}</div>
              <div class="selected-product__meta">
                <span>{{ product.category_name || '未分类' }}</span>
                <strong>¥ {{ formatPrice(product.price) }}</strong>
              </div>
            </div>
          </article>
        </div>
        <el-empty v-else description="当前区域还没有选择商品" :image-size="80" />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.homepage-display-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header h2 {
  margin: 0;
  font-size: 32px;
  color: #303133;
}

.page-card {
  border-radius: 12px;
}

.intro-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.intro-text {
  margin-top: 8px;
  color: #606266;
  line-height: 1.7;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.section-desc {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selected-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.category-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: #f5f7fa;
  color: #303133;
  font-size: 13px;
  font-weight: 700;
}

.selected-product {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  background: #fafafa;
}

.selected-product img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 10px;
  background: #f2f3f5;
}

.selected-product__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.selected-product__name {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  line-height: 1.5;
}

.selected-product__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #909399;
  font-size: 12px;
}

.selected-product__meta strong {
  color: #303133;
  font-size: 14px;
}
</style>

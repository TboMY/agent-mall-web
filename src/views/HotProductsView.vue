<script setup>
import NavBar from '@/components/NavBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { ref, computed, onMounted } from 'vue'
import { productAPI } from '@/services/api'

// Keep same filters and defaults as homepage AI section
const sortType = ref('time')
const sourceFilter = ref('all')
const currentPage = ref(1)
const pageSize = 12

const sortOptions = [
  { label: '按时间排序', value: 'time' },
  { label: '按热度排序', value: 'heat' }
]

const sourceOptions = [
  { label: '全部来源', value: 'all' },
  { label: '小红书', value: 'xiaohongshu' },
  { label: '抖音', value: 'douyin' },
  { label: 'B站', value: 'bilibili' }
]

const list = ref([])
const filteredAndSorted = computed(() => {
  let data = list.value
  if (sourceFilter.value !== 'all') {
    data = data.filter(p => {
      const sp = p.source_platform || p.source
      if (!sp) return false
      return typeof sp === 'string' ? (sp === sourceFilter.value || sp.includes(sourceFilter.value)) : false
    })
  }
  if (sortType.value === 'heat') {
    const getHeat = (p) => Number(p.hot_score ?? p.heat ?? 0)
    return [...data].sort((a, b) => getHeat(b) - getHeat(a))
  }
  // default keep time order similar to homepage (createdAt desc)
  const getTime = (p) => new Date(p.created_at ?? p.createdAt ?? 0).getTime()
  return [...data].sort((a, b) => getTime(b) - getTime(a))
})

const pageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredAndSorted.value.slice(start, start + pageSize)
})

onMounted(async () => {
  try {
    // 取前100条，前端分页
    const resp = await productAPI.getProducts({ page: 1, limit: 100, sort_by: 'created_at', sort_order: 'DESC' })
    if (resp.success) list.value = resp.data || []
  } catch (e) { console.error('加载商品失败:', e) }
})
</script>

<template>
  <el-container direction="vertical">
    <NavBar />
    <el-main class="page-container">
      <div class="ai-hot-section">
        <div class="section-header">
          <h2 class="title">🔥 AI 实时追热点 · 今日爆款抢先上</h2>
          <div class="ai-tag">← AI推荐标签</div>
        </div>

        <div class="filters">
          <div class="filter-group">
            <label>排序方式：</label>
            <el-select v-model="sortType" placeholder="选择排序" size="small" style="width: 120px;">
              <el-option
                v-for="option in sortOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>

          <div class="filter-group">
            <label>来源平台：</label>
            <el-select v-model="sourceFilter" placeholder="选择来源" size="small" style="width: 120px;">
              <el-option
                v-for="option in sourceOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
        </div>

        <div v-if="filteredAndSorted.length > 0" class="products-grid">
          <div v-for="item in pageData" :key="item.id" class="product-item">
            <ProductCard :product="item" :show-source="true" :show-recommendation="true" />
          </div>
        </div>
        <div v-else class="products-grid empty-grid">
          <el-empty description="暂无AI热点商品" style="grid-column: 1 / -1;" />
        </div>

        <div class="section-footer" style="justify-content: center;">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="filteredAndSorted.length"
            :page-size="pageSize"
            v-model:current-page="currentPage"
          />
        </div>
      </div>
    </el-main>
    <SiteFooter />
  </el-container>
</template>

<style scoped>
.ai-hot-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.filters {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #e1251b;
  margin: 0;
}

.ai-tag {
  font-size: 14px;
  color: #666;
  background: #f0f9ff;
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid #e1f5fe;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  width: 1040px; /* 固定容器宽度，空态/有数据一致 */
  margin-left: auto;
  margin-right: auto;
}

.empty-grid { min-height: 120px; }

.section-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 1200px) {
  .products-grid { grid-template-columns: repeat(3, 1fr); width: 780px; }
}

@media (max-width: 768px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); width: 520px; }
  .section-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .filters { flex-direction: column; gap: 12px; }
}
</style>



<script setup>
import { ref, computed } from 'vue'
import ProductCard from '@/components/ProductCard.vue'

const props = defineProps({
  products: { type: Array, default: () => [] }
})

const sortType = ref('time')
const sourceFilter = ref('all')

const sortOptions = [
  { label: '按时间排序', value: 'time' },
  { label: '按热度排序', value: 'heat' }
]

// 与后端 products.source_platform 对齐：bilibili/douyin
const sourceOptions = [
  { label: '全部来源', value: 'all' },
  { label: '抖音', value: 'douyin' },
  { label: 'B站', value: 'bilibili' }
]

const filteredAndSortedProducts = computed(() => {
  let filtered = props.products
  
  // Filter by source
  if (sourceFilter.value !== 'all') {
    filtered = filtered.filter(product => {
      const sp = product.source_platform || product.source
      if (!sp) return false
      // 后端标准值直接等于；旧mock文本用includes兼容
      return typeof sp === 'string' 
        ? (sp === sourceFilter.value || sp.includes(sourceFilter.value))
        : false
    })
  }
  
  // Sort
  if (sortType.value === 'heat') {
    const getHeat = (p) => Number(p.hot_score ?? p.heat ?? 0)
    return [...filtered].sort((a, b) => getHeat(b) - getHeat(a))
  }
  // 默认按时间，后端字段 created_at；兼容 mock 的 createdAt
  const getTime = (p) => new Date(p.created_at ?? p.createdAt ?? 0).getTime()
  return [...filtered].sort((a, b) => getTime(b) - getTime(a))
})
</script>

<template>
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
    
    <div v-if="filteredAndSortedProducts.length > 0" class="products-grid">
      <div v-for="(product, index) in filteredAndSortedProducts.slice(0, 8)" :key="product.id" class="product-item">
        <ProductCard :product="product" :show-source="true" :show-recommendation="true" />
      </div>
    </div>
    <div v-else class="products-grid empty-grid">
      <el-empty description="暂无AI热点商品" style="grid-column: 1 / -1;">
        <span style="color:#909399;font-size:12px;">稍后再试或更换来源平台/排序方式</span>
      </el-empty>
    </div>
    
    <div class="section-footer">
      <span class="more-link" @click="$router.push('/hot-products')">[更多]</span>
    </div>
  </div>
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

.section-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.empty-wrapper {
  padding: 24px 0;
}

.empty-grid {
  min-height: 120px;
}

/* 让空态在网格容器中也占满整行宽度，保持与有数据时的宽度一致 */
:deep(.empty-grid .el-empty) {
  width: 100%;
  display: flex;
  justify-content: center;
}

.more-link {
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
}

.more-link:hover {
  text-decoration: underline;
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

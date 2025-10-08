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

const sourceOptions = [
  { label: '全部来源', value: 'all' },
  { label: '小红书', value: '小红书' },
  { label: '抖音', value: '抖音' },
  { label: 'B站', value: 'B站' }
]

const filteredAndSortedProducts = computed(() => {
  let filtered = props.products
  
  // Filter by source
  if (sourceFilter.value !== 'all') {
    filtered = filtered.filter(product => 
      product.source && product.source.includes(sourceFilter.value)
    )
  }
  
  // Sort
  if (sortType.value === 'heat') {
    return [...filtered].sort((a, b) => b.heat - a.heat)
  }
  
  return filtered
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
    
    <div class="products-grid">
      <div v-for="(product, index) in filteredAndSortedProducts.slice(0, 8)" :key="product.id" class="product-item">
        <ProductCard :product="product" :show-source="true" :show-recommendation="true" />
      </div>
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
}

.section-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
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
  .products-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); }
  .section-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .filters { flex-direction: column; gap: 12px; }
}
</style>

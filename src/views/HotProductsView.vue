<script setup>
import NavBar from '@/components/NavBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { ref, computed, onMounted } from 'vue'
import { productAPI } from '@/services/api'

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
  <el-container direction="vertical" class="am-hot">
    <NavBar />
    <el-main class="page-container am-hot__main">
      <section class="am-hot__panel">
        <div class="am-hot__panel-head">
          <div>
            <div class="am-hot__kicker">Ranked Goods</div>
            <h2>本期推荐</h2>
          </div>

          <div class="am-hot__tag">每次刷新都能更快看到当前更值得逛的商品</div>
        </div>

        <div class="am-hot__filters">
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

        <div v-if="filteredAndSorted.length > 0" class="am-hot__grid">
          <div v-for="item in pageData" :key="item.id" class="product-item">
            <ProductCard :product="item" :show-source="true" :show-recommendation="true" />
          </div>
        </div>
        <div v-else class="am-hot__empty">
          <el-empty description="暂无AI热点商品" style="grid-column: 1 / -1;" />
        </div>

        <div class="am-hot__footer">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="filteredAndSorted.length"
            :page-size="pageSize"
            v-model:current-page="currentPage"
          />
        </div>
      </section>
    </el-main>
    <SiteFooter />
  </el-container>
</template>

<style>
.am-hot {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(244, 186, 92, 0.14), transparent 22%),
    #f7f3ea;
}

.am-hot__main {
  padding-top: 26px;
  padding-bottom: 36px;
}

.am-hot__panel {
  border-radius: 30px;
  background: rgba(255,255,255,0.86);
  border: 1px solid rgba(19,35,55,0.08);
  box-shadow: 0 20px 48px rgba(24,39,62,0.08);
  backdrop-filter: blur(16px);
}

.am-hot__panel {
  padding: 24px;
}

.am-hot__kicker {
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

.am-hot__panel-head h2 {
  margin: 12px 0 0;
  font-size: 34px;
  line-height: 1.08;
  color: #132337;
}

.am-hot__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.am-hot__tag {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(248,250,252,0.88);
  color: #607183;
  font-size: 13px;
  font-weight: 700;
}

.am-hot__filters {
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

.am-hot__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.am-hot__empty {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  background: rgba(248,250,252,0.84);
}

.am-hot__footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 1200px) {
  .am-hot__grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .am-hot__grid { grid-template-columns: repeat(2, 1fr); }
  .am-hot__panel-head { flex-direction: column; align-items: flex-start; }
  .am-hot__filters { flex-direction: column; gap: 12px; }
}
</style>



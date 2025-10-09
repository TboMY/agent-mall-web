<script setup>
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ProductCard from '@/components/ProductCard.vue'
import { ref, computed } from 'vue'
import { products } from '@/mock/data'

// Build top-level categories from existing mock products used on Home
const categoryDefs = [
  { key: 'phone', name: '手机' },
  { key: 'wearable', name: '穿戴' },
  { key: 'tablet', name: '平板' },
  { key: 'laptop', name: '笔记本' },
  { key: 'tv', name: '智慧屏' },
  { key: 'appliance', name: '家电' }
]

// Fake mapping by simple index sharding to keep consistent with HomeView demo
function itemsForCategory(index) {
  const chunkSize = 6
  const start = (index * 2) % Math.max(products.length - chunkSize, 1)
  return products.slice(start, start + chunkSize)
}

const categories = categoryDefs.map((c, i) => ({ ...c, items: itemsForCategory(i) }))

const activeKey = ref(categoryDefs[0].key)
const searchKeyword = ref('')
const sortType = ref('heat')

const activeItems = computed(() => {
  const idx = categoryDefs.findIndex(c => c.key === activeKey.value)
  let list = itemsForCategory(idx)
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase()
    list = list.filter(p => String(p.name).toLowerCase().includes(kw))
  }
  if (sortType.value === 'heat') return [...list].sort((a, b) => b.heat - a.heat)
  return [...list].sort((a, b) => b.createdAt - a.createdAt)
})
</script>

<template>
  <el-container direction="vertical">
    <NavBar />
    <el-main class="page-container">
      <div class="categories">
        <aside class="sidebar">
          <div class="sidebar-title">商品分类</div>
          <ul class="cat-list">
            <li v-for="c in categories" :key="c.key" :class="['cat-item', { active: activeKey === c.key }]" @click="activeKey = c.key">
              {{ c.name }}
            </li>
          </ul>
        </aside>

        <section class="content">
          <div class="content-header">
            <h2 class="title">{{ categories.find(c => c.key === activeKey)?.name }}</h2>
            <div class="tools">
              <el-input v-model="searchKeyword" size="small" placeholder="搜索当前分类" clearable style="width: 220px;" />
              <el-select v-model="sortType" size="small" style="width: 140px;">
                <el-option label="按热度排序" value="heat" />
                <el-option label="按时间排序" value="time" />
              </el-select>
            </div>
          </div>

          <div class="grid">
            <div v-for="p in activeItems" :key="p.id" class="grid-item">
              <ProductCard :product="p" :show-source="true" :show-recommendation="true" />
            </div>
          </div>
        </section>
      </div>
    </el-main>
    <SiteFooter />
  </el-container>
</template>

<style scoped>
.categories { display: grid; grid-template-columns: 220px 1fr; gap: 16px; }

.sidebar {
  background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}
.sidebar-title { font-weight: 700; margin-bottom: 12px; }
.cat-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.cat-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; color: #303133; }
.cat-item:hover { background: rgba(0,0,0,0.04); }
.cat-item.active { background: #f0f9ff; color: #409eff; font-weight: 600; }

.content { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
.content-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.title { font-size: 18px; font-weight: 700; color: #e1251b; margin: 0; }
.tools { display: flex; gap: 12px; align-items: center; }

.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
@media (max-width: 1200px) { .grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) {
  .categories { grid-template-columns: 1fr; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}
</style>



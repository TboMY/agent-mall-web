<script setup>
import { computed, onMounted, ref } from 'vue'
import NavBar from '@/components/NavBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { categoryAPI, productAPI } from '@/services/api'

const categoryTree = ref([])
const activeCategoryId = ref(null)
const activeParentId = ref(null)
const products = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const sortType = ref('latest')

const flatCategories = computed(() => categoryTree.value.flatMap((parent) => [parent, ...(parent.children || [])]))

const activeCategory = computed(() => flatCategories.value.find((item) => Number(item.id) === Number(activeCategoryId.value)) || null)
const activeParent = computed(() => flatCategories.value.find((item) => Number(item.id) === Number(activeParentId.value)) || null)

const categoryHeading = computed(() => {
  if (activeParent.value && activeCategory.value && Number(activeParent.value.id) !== Number(activeCategory.value.id)) {
    return `${activeParent.value.name} / ${activeCategory.value.name}`
  }
  return activeCategory.value?.name || '商品分类'
})

const categoryDescription = computed(() => {
  return activeCategory.value?.description
    || activeParent.value?.description
    || '按分类浏览商品，快速找到更适合当前需求的款式。'
})

const filteredProducts = computed(() => {
  let list = [...products.value]

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    list = list.filter((item) => String(item.name || '').toLowerCase().includes(keyword))
  }

  if (sortType.value === 'hot') {
    return list.sort((a, b) => Number(b.heat_score || 0) - Number(a.heat_score || 0))
  }
  if (sortType.value === 'price') {
    return list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
  }
  return list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
})

function getInitialCategory(tree) {
  for (const parent of tree) {
    if (parent.children?.length) {
      return {
        parentId: parent.id,
        categoryId: parent.children[0].id
      }
    }
    return {
      parentId: parent.id,
      categoryId: parent.id
    }
  }
  return null
}

async function loadCategories() {
  const response = await categoryAPI.getCategoryTree()
  if (response.success) {
    categoryTree.value = response.data || []
    if (!activeCategoryId.value) {
      const initial = getInitialCategory(categoryTree.value)
      if (initial) {
        activeParentId.value = initial.parentId
        activeCategoryId.value = initial.categoryId
      }
    }
  }
}

async function loadProducts() {
  if (!activeCategoryId.value) return
  loading.value = true
  try {
    const response = await productAPI.getProducts({
      page: 1,
      limit: 40,
      category_id: activeCategoryId.value,
      sort_by: 'created_at',
      sort_order: 'DESC'
    })
    products.value = response.success ? (response.data || []) : []
  } catch (error) {
    console.error('分类商品加载失败:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

async function switchCategory(parent, category) {
  activeParentId.value = parent.id
  activeCategoryId.value = category.id
  await loadProducts()
}

onMounted(async () => {
  await loadCategories()
  await loadProducts()
})
</script>

<template>
  <el-container direction="vertical" class="am-categories">
    <NavBar />

    <el-main class="page-container am-categories__main">
      <section class="am-categories__hero">
        <div>
          <div class="am-categories__kicker">Category Library</div>
          <h1>按分类找到你想逛的商品</h1>
          <p>不同分类分区展示，浏览和筛选都会更清晰。</p>
        </div>
      </section>

      <section class="am-categories__layout">
        <aside class="am-categories__sidebar">
          <div class="am-categories__sidebar-title">全部分类</div>

          <div class="am-categories__groups">
            <section v-for="parent in categoryTree" :key="parent.id" class="am-categories__group">
              <div class="am-categories__group-head">
                <strong>{{ parent.name }}</strong>
                <small>{{ parent.description || '当前分类分区' }}</small>
              </div>

              <div v-if="parent.children?.length" class="am-categories__children">
                <button
                  v-for="child in parent.children"
                  :key="child.id"
                  type="button"
                  :class="['am-categories__child-item', { 'is-active': activeCategoryId === child.id }]"
                  @click="switchCategory(parent, child)"
                >
                  <span>{{ child.name }}</span>
                </button>
              </div>

              <button
                v-else
                type="button"
                :class="['am-categories__child-item am-categories__child-item--single', { 'is-active': activeCategoryId === parent.id }]"
                @click="switchCategory(parent, parent)"
              >
                <span>{{ parent.name }}</span>
              </button>
            </section>
          </div>
        </aside>

        <section class="am-categories__content">
          <div class="am-categories__content-head">
            <div>
              <div class="am-categories__kicker">Category Focus</div>
              <h2>{{ categoryHeading }}</h2>
              <p>{{ categoryDescription }}</p>
            </div>

            <div class="am-categories__toolbar">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索当前分类商品"
                clearable
                class="am-categories__search"
              />
              <el-select v-model="sortType" class="am-categories__select">
                <el-option label="最新上架" value="latest" />
                <el-option label="热度优先" value="hot" />
                <el-option label="价格升序" value="price" />
              </el-select>
            </div>
          </div>

          <div v-if="filteredProducts.length" class="am-categories__grid" v-loading="loading">
            <ProductCard
              v-for="item in filteredProducts"
              :key="item.id"
              :product="item"
              :show-source="true"
              :show-recommendation="true"
            />
          </div>
          <div v-else class="am-categories__empty" v-loading="loading">
            当前分类暂无商品
          </div>
        </section>
      </section>
    </el-main>

    <SiteFooter />
  </el-container>
</template>

<style>
.am-categories {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(244, 186, 92, 0.14), transparent 24%),
    #f7f3ea;
}

.am-categories__main {
  padding-top: 26px;
  padding-bottom: 36px;
}

.am-categories__hero {
  padding: 28px 30px;
  border-radius: 30px;
  background: linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(242,248,252,0.82) 100%);
  border: 1px solid rgba(19,35,55,0.08);
  box-shadow: 0 20px 48px rgba(24,39,62,0.08);
}

.am-categories__kicker {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(21, 43, 69, 0.08);
  color: #4d6277;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.am-categories__hero h1,
.am-categories__content-head h2 {
  margin: 12px 0 0;
  font-size: 34px;
  line-height: 1.08;
  color: #132337;
}

.am-categories__hero p,
.am-categories__content-head p {
  margin: 12px 0 0;
  color: #627385;
  line-height: 1.8;
}

.am-categories__layout {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
}

.am-categories__sidebar,
.am-categories__content {
  border-radius: 30px;
  background: rgba(255,255,255,0.84);
  border: 1px solid rgba(19,35,55,0.08);
  box-shadow: 0 20px 48px rgba(24,39,62,0.08);
  backdrop-filter: blur(16px);
}

.am-categories__sidebar {
  padding: 22px;
}

.am-categories__sidebar-title {
  font-size: 15px;
  font-weight: 800;
  color: #132337;
  margin-bottom: 12px;
}

.am-categories__groups {
  display: grid;
  gap: 14px;
}

.am-categories__group {
  padding: 16px;
  border-radius: 22px;
  background: rgba(248,250,252,0.9);
}

.am-categories__group-head strong {
  display: block;
  font-size: 16px;
  color: #173049;
}

.am-categories__group-head small {
  display: block;
  margin-top: 6px;
  color: #748597;
  line-height: 1.6;
}

.am-categories__children {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}

.am-categories__child-item {
  width: 100%;
  border: none;
  background: rgba(255,255,255,0.96);
  border-radius: 16px;
  padding: 12px 14px 12px 18px;
  text-align: left;
  color: #425569;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.am-categories__child-item::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #c4d0dc;
  transform: translateY(-50%);
}

.am-categories__child-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(19,35,55,0.06);
}

.am-categories__child-item.is-active {
  background: linear-gradient(135deg, #18304f 0%, #2f5a84 100%);
  color: #fff;
}

.am-categories__child-item.is-active::before {
  background: rgba(255,255,255,0.84);
}

.am-categories__child-item--single {
  margin-top: 12px;
}

.am-categories__content {
  padding: 24px;
}

.am-categories__content-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 18px;
  margin-bottom: 18px;
}

.am-categories__toolbar {
  display: flex;
  gap: 12px;
}

.am-categories__search {
  width: 240px;
}

.am-categories__select {
  width: 160px;
}

.am-categories__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.am-categories__empty {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  background: rgba(248, 250, 252, 0.8);
  color: #7c8d9f;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .am-categories__layout {
    grid-template-columns: 1fr;
  }

  .am-categories__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .am-categories__content-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .am-categories__toolbar {
    width: 100%;
    flex-direction: column;
  }

  .am-categories__search,
  .am-categories__select {
    width: 100%;
  }

  .am-categories__grid {
    grid-template-columns: 1fr;
  }
}
</style>

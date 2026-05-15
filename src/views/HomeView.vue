<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { categoryAPI, productAPI } from '@/services/api'

const router = useRouter()

const loading = ref(false)
const aiProducts = ref([])
const latestProducts = ref([])
const hotProducts = ref([])
const categoryBlocks = ref([])
const hotKeywords = ref([])
const stats = ref({
  productCount: 0,
  aiCount: 0,
  categoryCount: 0,
  latestKeyword: '夏日防晒'
})

const moodTags = computed(() => {
  const tags = new Set()
  ;[...aiProducts.value, ...latestProducts.value].forEach((item) => {
    const raw = item.tags
    if (Array.isArray(raw)) {
      raw.forEach((tag) => tags.add(tag))
    } else if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) parsed.forEach((tag) => tags.add(tag))
      } catch {
        raw.split(',').map((tag) => tag.trim()).filter(Boolean).forEach((tag) => tags.add(tag))
      }
    }
  })
  return Array.from(tags).slice(0, 6)
})

function formatCount(value) {
  const number = Number(value || 0)
  if (number >= 10000) return `${(number / 10000).toFixed(1)}w`
  return String(number)
}

async function loadHomeData() {
  loading.value = true
  try {
    const [latestResp, hotResp, aiResp, categoryResp, homepageResp, keywordResp] = await Promise.all([
      productAPI.getProducts({ page: 1, limit: 12, sort_by: 'created_at', sort_order: 'DESC' }),
      productAPI.getHotProducts(8),
      productAPI.getAIRecommended(8),
      categoryAPI.getCategoryTree(),
      productAPI.getHomepageDisplay(),
      productAPI.getHomepageKeywords(8)
    ])

    const latest = latestResp.success ? (latestResp.data || []) : []
    const homepageData = homepageResp.success ? (homepageResp.data || {}) : {}
    hotKeywords.value = keywordResp.success ? (keywordResp.data || []) : []

    latestProducts.value = (homepageData.latestProducts?.length ? homepageData.latestProducts : latest).slice(0, 8)
    hotProducts.value = (homepageData.hotProducts?.length ? homepageData.hotProducts : (hotResp.success ? (hotResp.data || []) : [])).slice(0, 4)
    aiProducts.value = (homepageData.aiProducts?.length ? homepageData.aiProducts : (aiResp.success ? (aiResp.data || []) : [])).slice(0, 8)

    const categories = categoryResp.success ? (categoryResp.data || []) : []
    stats.value.categoryCount = categories.length
    stats.value.productCount = latestResp.pagination?.total || latest.length
    stats.value.aiCount = aiProducts.value.length

    if (categories.length > 0) {
      const selectedCategoryIds = Array.isArray(homepageData.categoryIds) ? homepageData.categoryIds.map((id) => Number(id)) : []
      const topCategories = selectedCategoryIds.length
        ? categories.filter((category) => selectedCategoryIds.includes(Number(category.id))).slice(0, 3)
        : categories.slice(0, 3)
      categoryBlocks.value = await Promise.all(
        topCategories.map(async (category) => {
          const resp = await productAPI.getProducts({
            page: 1,
            limit: 4,
            category_id: category.id,
            sort_by: 'created_at',
            sort_order: 'DESC'
          })

          return {
            id: category.id,
            name: category.name,
            description: category.description || '围绕近期热视频与消费趋势整理的商品组合。',
            products: resp.success ? (resp.data || []).slice(0, 4) : []
          }
        })
      )
    }

    if (hotKeywords.value[0]?.keyword) {
      stats.value.latestKeyword = hotKeywords.value[0].keyword
    } else if (moodTags.value[0]) {
      stats.value.latestKeyword = moodTags.value[0]
    }
  } catch (error) {
    console.error('首页数据加载失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadHomeData)
</script>

<template>
  <el-container direction="vertical" class="am-home">
    <NavBar />

    <el-main class="am-home__main" v-loading="loading">
      <section class="am-home__hero">
        <div class="page-container am-home__hero-grid">
          <div class="am-home__copy">
            <div class="am-home__eyebrow">本周热门精选</div>
            <h1 class="am-home__title">
              为下一件
              <span>心动好物留点位置</span>
            </h1>
            <p class="am-home__text">
              从热门数码到日常好物，我们把近期值得买、值得逛、值得收藏的商品整理成更轻松的浏览体验，
              让你打开首页就能快速找到想看的内容。
            </p>

            <div class="am-home__actions">
              <button type="button" class="am-home__primary" @click="router.push('/hot-products')">立即逛热门</button>
              <button type="button" class="am-home__secondary" @click="router.push('/categories')">按分类选购</button>
            </div>

            <div class="am-home__stats">
              <div class="am-home__stat-card">
                <strong>{{ formatCount(stats.productCount) }}</strong>
                <span>在售商品</span>
              </div>
              <div class="am-home__stat-card">
                <strong>{{ formatCount(stats.aiCount) }}</strong>
                <span>热门推荐</span>
              </div>
              <div class="am-home__stat-card">
                <strong>{{ formatCount(stats.categoryCount) }}</strong>
                <span>精选分类</span>
              </div>
            </div>
          </div>

          <div class="am-home__showcase">
            <div class="am-home__panel">
              <div class="am-home__panel-head">
                <span>AI热点商品</span>
                <button type="button" class="am-home__showcase-link" @click="router.push('/hot-products')">查看全部</button>
              </div>

              <div v-if="aiProducts.length" class="am-home__spotlight">
                <article
                  v-for="item in aiProducts.slice(0, 3)"
                  :key="item.id"
                  class="am-home__spotlight-card"
                  @click="router.push(`/product/${item.id}`)"
                >
                  <img :src="item.image" :alt="item.name" />
                  <div class="am-home__spotlight-copy">
                    <small>{{ item.category_name || 'AI热点' }}</small>
                    <strong>{{ item.name }}</strong>
                    <span>￥{{ Number(item.price || 0).toFixed(2) }}</span>
                  </div>
                </article>
              </div>
              <div v-else class="am-home__empty-panel">暂无AI热点商品</div>
            </div>

            <button type="button" class="am-home__panel am-home__panel--entry" @click="router.push('/hot-products')">
              <div class="am-home__panel-head">
                <span>近期热点词</span>
                <strong>去看更多值得逛的商品</strong>
              </div>

              <div class="am-home__keyword-cloud">
                <span v-for="item in hotKeywords" :key="item.id || item.keyword">{{ item.keyword }}</span>
                <span v-if="!hotKeywords.length">暂无热点词</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section class="page-container am-home__section">
        <div class="am-home__section-head">
          <div>
            <div class="am-home__kicker">Hot Board</div>
            <h2>热门推荐</h2>
          </div>
        </div>

        <div v-if="aiProducts.length" class="am-home__product-grid am-home__product-grid--four">
          <ProductCard
            v-for="item in aiProducts.slice(0, 4)"
            :key="item.id"
            :product="item"
            :show-source="true"
            :show-recommendation="true"
          />
        </div>
        <div v-else class="am-home__empty-panel">暂无AI热点商品</div>
      </section>

      <section class="page-container am-home__split">
        <div>
          <div class="am-home__section-head am-home__section-head--compact">
            <div>
            <div class="am-home__kicker">Popular Now</div>
            <h2>人气单品</h2>
          </div>
          </div>

          <div v-if="hotProducts.length" class="am-home__product-grid am-home__product-grid--two">
            <ProductCard
              v-for="item in hotProducts"
              :key="item.id"
              :product="item"
              :show-source="true"
            />
          </div>
          <div v-else class="am-home__empty-panel">暂无热门商品</div>
        </div>

        <aside class="am-home__editorial">
          <div class="am-home__kicker">Editor’s Choice</div>
          <h3>这一季更值得多看一眼的好物</h3>
          <p>
            我们把近期更受欢迎的商品整理成专题推荐，不论你是想找一件新的数码单品，
            还是补充日常使用频率更高的生活好物，都能更快缩小选择范围。
          </p>
          <ul>
            <li>优先展示更受关注的商品</li>
            <li>保留清晰的类目与风格标签</li>
            <li>从热门会场快速进入详情页</li>
          </ul>
        </aside>
      </section>

      <section class="page-container am-home__section">
        <div class="am-home__section-head">
          <div>
            <div class="am-home__kicker">Category Mall</div>
            <h2>分类会场</h2>
          </div>
        </div>

        <div class="am-home__category-grid">
          <article v-for="block in categoryBlocks" :key="block.id" class="am-home__category-panel">
            <div class="am-home__category-head">
              <div>
                <h3>{{ block.name }}</h3>
                <p>{{ block.description }}</p>
              </div>
              <button type="button" class="am-home__text-link" @click="router.push('/categories')">查看更多</button>
            </div>

            <div v-if="block.products.length" class="am-home__mini-products">
              <article
                v-for="item in block.products"
                :key="item.id"
                class="am-home__mini-product"
                @click="router.push(`/product/${item.id}`)"
              >
                <img :src="item.image" :alt="item.name" />
                <div>
                  <strong>{{ item.name }}</strong>
                  <span>￥{{ Number(item.price || 0).toFixed(2) }}</span>
                </div>
              </article>
            </div>
            <div v-else class="am-home__empty-panel am-home__empty-panel--small">该分类暂无商品</div>
          </article>
        </div>
      </section>

      <section class="page-container am-home__section">
        <div class="am-home__section-head">
          <div>
            <div class="am-home__kicker">New In</div>
            <h2>新品上架</h2>
          </div>
        </div>

        <div v-if="latestProducts.length" class="am-home__product-grid am-home__product-grid--four">
          <ProductCard
            v-for="item in latestProducts.slice(0, 8)"
            :key="item.id"
            :product="item"
            :show-source="true"
          />
        </div>
        <div v-else class="am-home__empty-panel">暂无最新商品</div>
      </section>
    </el-main>

    <SiteFooter />
    <el-backtop :right="32" :bottom="32" />
  </el-container>
</template>

<style>
.am-home {
  background:
    radial-gradient(circle at top left, rgba(244, 186, 92, 0.16), transparent 22%),
    radial-gradient(circle at top right, rgba(56, 94, 130, 0.12), transparent 24%),
    #f7f3ea;
  min-height: 100vh;
  color: #132337;
}

.am-home__main {
  padding: 0 0 40px;
}

.am-home__hero {
  padding: 28px 0 18px;
}

.am-home__hero-grid {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 28px;
}

.am-home__copy,
.am-home__panel,
.am-home__editorial,
.am-home__category-panel,
.am-home__insight-card {
  backdrop-filter: blur(16px);
}

.am-home__copy {
  padding: 34px;
  border-radius: 34px;
  background: linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,246,233,0.82) 100%);
  border: 1px solid rgba(19,35,55,0.08);
  box-shadow: 0 24px 54px rgba(24,39,62,0.08);
}

.am-home__eyebrow,
.am-home__kicker {
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

.am-home__title {
  margin: 18px 0 0;
  font-size: clamp(42px, 5vw, 68px);
  line-height: 0.96;
  letter-spacing: -0.04em;
}

.am-home__title span {
  display: block;
  margin-top: 12px;
  color: #d96a42;
}

.am-home__text {
  margin: 20px 0 0;
  max-width: 620px;
  color: #5f7082;
  font-size: 16px;
  line-height: 1.85;
}

.am-home__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 28px;
}

.am-home__primary,
.am-home__secondary,
.am-home__text-link {
  appearance: none;
  -webkit-appearance: none;
  border: none;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

.am-home__primary {
  min-width: 154px;
  height: 52px;
  padding: 0 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ef6c40 0%, #f2b458 100%);
  color: #fff;
  box-shadow: 0 20px 34px rgba(239, 108, 64, 0.28);
}

.am-home__secondary {
  min-width: 154px;
  height: 52px;
  padding: 0 22px;
  border-radius: 999px;
  background: rgba(19, 35, 55, 0.06);
  color: #132337;
}

.am-home__stats {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.am-home__stat-card {
  padding: 18px;
  border-radius: 22px;
  background: rgba(255,255,255,0.74);
  border: 1px solid rgba(19,35,55,0.06);
}

.am-home__stat-card strong {
  display: block;
  font-size: 30px;
  line-height: 1;
}

.am-home__stat-card span {
  display: block;
  margin-top: 8px;
  color: #738497;
  font-size: 13px;
}

.am-home__showcase {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 18px;
}

.am-home__panel,
.am-home__editorial,
.am-home__category-panel {
  border-radius: 30px;
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(19,35,55,0.08);
  box-shadow: 0 22px 52px rgba(24,39,62,0.08);
}

.am-home__panel {
  padding: 22px;
}

.am-home__panel--entry {
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
}

.am-home__panel--entry:hover {
  transform: translateY(-4px);
  box-shadow: 0 26px 54px rgba(24,39,62,0.1);
  border-color: rgba(240, 124, 70, 0.24);
}

.am-home__panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.am-home__panel-head span {
  color: #768699;
  font-size: 13px;
}

.am-home__panel-head strong {
  font-size: 22px;
}

.am-home__showcase-link {
  appearance: none;
  -webkit-appearance: none;
  border: none;
  background: transparent;
  color: #2b527a;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.am-home__spotlight {
  display: grid;
  gap: 14px;
}

.am-home__spotlight-card {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border-radius: 22px;
  background: #fff;
  cursor: pointer;
}

.am-home__spotlight-card img {
  width: 92px;
  height: 92px;
  object-fit: cover;
  border-radius: 18px;
}

.am-home__spotlight-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.am-home__spotlight-copy small,
.am-home__mini-product span,
.am-home__category-head p {
  color: #728396;
}

.am-home__spotlight-copy strong {
  font-size: 16px;
  line-height: 1.35;
}

.am-home__spotlight-copy span {
  color: #ef6c40;
  font-size: 18px;
  font-weight: 800;
}

.am-home__tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.am-home__tag-cloud span {
  min-height: 38px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #fef6e8 0%, #eef4f9 100%);
  color: #30455d;
  font-weight: 700;
}

.am-home__keyword-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.am-home__keyword-cloud span {
  min-height: 38px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #fef6e8 0%, #eef4f9 100%);
  color: #30455d;
  font-weight: 700;
}

.am-home__section,
.am-home__split {
  margin-top: 28px;
}

.am-home__section-head {
  margin-bottom: 18px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
}

.am-home__section-head h2 {
  margin: 10px 0 0;
  font-size: 32px;
  line-height: 1.05;
}

.am-home__text-link {
  background: transparent;
  color: #2b527a;
}

.am-home__product-grid {
  display: grid;
  gap: 18px;
}

.am-home__product-grid--four {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.am-home__product-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.am-home__split {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 22px;
}

.am-home__editorial {
  padding: 28px;
  background: linear-gradient(160deg, rgba(255,248,236,0.95) 0%, rgba(241,247,252,0.88) 100%);
}

.am-home__editorial h3 {
  margin: 16px 0 0;
  font-size: 28px;
  line-height: 1.15;
}

.am-home__editorial p,
.am-home__editorial li {
  color: #5f7082;
  line-height: 1.8;
}

.am-home__editorial ul {
  margin: 18px 0 0;
  padding-left: 18px;
}

.am-home__category-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.am-home__category-panel {
  padding: 24px;
}

.am-home__category-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.am-home__category-head h3 {
  margin: 0;
  font-size: 22px;
}

.am-home__category-head p {
  margin: 10px 0 0;
  line-height: 1.7;
  font-size: 14px;
}

.am-home__mini-products {
  margin-top: 18px;
  display: grid;
  gap: 12px;
}

.am-home__mini-product {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  padding: 10px;
  border-radius: 18px;
  background: rgba(255,255,255,0.88);
  cursor: pointer;
}

.am-home__mini-product img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 14px;
}

.am-home__mini-product div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.am-home__mini-product strong {
  font-size: 14px;
  line-height: 1.45;
}

.am-home__empty-panel {
  min-height: 140px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.76);
  color: #7a8a9b;
  font-weight: 700;
}

.am-home__empty-panel--small {
  min-height: 84px;
}

@media (max-width: 1200px) {
  .am-home__hero-grid,
  .am-home__split,
  .am-home__category-grid,
  .am-home__product-grid--four {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .am-home__hero-grid,
  .am-home__split,
  .am-home__category-grid,
  .am-home__product-grid--four,
  .am-home__product-grid--two {
    grid-template-columns: 1fr;
  }

  .am-home__stats {
    grid-template-columns: 1fr;
  }

  .am-home__section-head {
    align-items: flex-start;
    flex-direction: column;
  }

}
</style>

<script setup>
import NavBar from '@/components/NavBar.vue'
import MainCarousel from '@/components/MainCarousel.vue'
import CategoryMegaMenu from '@/components/CategoryMegaMenu.vue'
import AIHotProducts from '@/components/AIHotProducts.vue'
import QuickCategoryGrid from '@/components/QuickCategoryGrid.vue'
import ProductCard from '@/components/ProductCard.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { bannerImages } from '@/mock/data'
import { ref, onMounted } from 'vue'
import { productAPI, categoryAPI, aiCandidateAPI } from '@/services/api'

const aiProducts = ref([])
const recommended = ref([])
const heroHeight = '420px'
const categories = ref([])
const quickItems = [
  '华为手机', '运动健康', '影音娱乐', '智慧美家', '鸿蒙智车', '以旧换新',
  '鸿蒙智造', '配件', '企业商用', '优选甄选', '极智驾舱', '办公显示'
].map(n => ({ name: n, image: 'https://res.vmallres.com/uomcdn/CN/cms/202509/e0da42cd75ee44b18599bd514caaf538.jpg' }))

// 加载后端数据：AI推荐商品、分类、推荐区
onMounted(async () => {
  try {
    // AI 热门商品（使用后端热门/AI接口）
    const aiResp = await productAPI.getAIRecommended(12)
    if (aiResp.success) aiProducts.value = aiResp.data || []
    // Fallback：若没有正式商品，取已上架的AI候选（status=1）并做字段映射
    if (!aiProducts.value || aiProducts.value.length === 0) {
      const cand = await aiCandidateAPI.getCandidates({ page: 1, limit: 12, status: 1, sort_by: 'hot_score', sort_order: 'DESC' })
      if (cand.success) {
        aiProducts.value = (cand.data || []).map(c => ({
          id: c.linked_product_id || c.id,
          name: c.product_name,
          price: null,
          image: c.cover_url,
          hot_score: Number(c.hot_score || 0),
          source_platform: 'douyin',
          created_at: c.created_at,
          source_url: c.source_url
        }))
      }
    }
  } catch (e) { console.error('加载AI推荐失败:', e) }

  try {
    const catResp = await categoryAPI.getCategories()
    if (catResp.success) {
      const list = (catResp.data || []).slice(0, 6)
      // 预置分类，并并行拉取每个分类的商品
      categories.value = list.map((c) => ({ id: c.id, name: c.name, items: [] }))
      await Promise.all(categories.value.map(async (cat) => {
        try {
          const resp = await productAPI.getProducts({ page: 1, limit: 6, category_id: cat.id, sort_by: 'created_at', sort_order: 'DESC' })
          if (resp.success) cat.items = resp.data || []
        } catch (err) { console.warn('加载分类商品失败:', cat.name, err) }
      }))
    }
  } catch (e) { console.error('加载分类失败:', e) }

  try {
    // 底部推荐（使用普通产品接口按时间排序取前8个）
    const prodResp = await productAPI.getProducts({ page: 1, limit: 8, sort_by: 'created_at', sort_order: 'DESC' })
    if (prodResp.success) {
      const data = prodResp.data || []
      // 过滤掉AI推荐商品
      recommended.value = data.filter(p => Number(p.is_ai_recommended || 0) !== 1)
    }
    // Fallback1：若无数据，用热门商品作为猜你喜欢
    if (!recommended.value || recommended.value.length === 0) {
      const hotResp = await productAPI.getHotProducts(8)
      if (hotResp.success) {
        const data = hotResp.data || []
        recommended.value = data.filter(p => Number(p.is_ai_recommended || 0) !== 1)
      }
    }
  } catch (e) { console.error('加载推荐商品失败:', e) }
})
</script>

<template>
  <el-container direction="vertical">
    <NavBar/>
    <el-main class="page-container">
      <div class="hero">
        <div class="hero-inner">
          <MainCarousel :images="bannerImages" :height="heroHeight"/>
          <CategoryMegaMenu :height="heroHeight" :categories="categories"/>
        </div>
      </div>

      <AIHotProducts :products="aiProducts"/>

      <div style="margin: 24px 0 12px 0;">
        <QuickCategoryGrid :items="quickItems"/>
      </div>

      <div style="margin-top: 32px; display: flex; align-items: center; justify-content: space-between;">
        <h2>猜你喜欢</h2>
        <el-button link type="primary" @click="$router.push('/hot-products')">更多</el-button>
      </div>

      <el-row :gutter="16" style="margin-top: 16px;">
        <el-col v-for="item in recommended" :key="item.id" :xs="12" :sm="8" :md="6" :lg="6"
                style="margin-bottom: 16px;">
          <ProductCard :product="item" :show-recommendation="true"/>
        </el-col>
      </el-row>
    </el-main>

    <!-- 回到顶部按钮 -->
    <el-backtop :right="40" :bottom="40"/>
  </el-container>
</template>

<style scoped>
.hero {
  /* width: 100vw; */
  width: calc(100vw - 15px);
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  background: #f7f8fa;
}

.hero-inner {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 12px;
  --mega-width: 180px;
}

.hero :deep(.el-carousel__container) {
  border-radius: 12px;
  overflow: hidden;
}

.hero :deep(.el-carousel) {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

/* make the carousel full-bleed across the viewport */
.hero :deep(.hero-carousel) {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

/* fix the mega menu to top-left like Huawei Mall */
.hero-inner :deep(.mega) {
  top: 12px;
  left: 0;
  transform: none;
  width: var(--mega-width);
}
</style>



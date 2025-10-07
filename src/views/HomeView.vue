<script setup>
import NavBar from '@/components/NavBar.vue'
import MainCarousel from '@/components/MainCarousel.vue'
import CategoryMegaMenu from '@/components/CategoryMegaMenu.vue'
import QuickCategoryGrid from '@/components/QuickCategoryGrid.vue'
import ProductCard from '@/components/ProductCard.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { bannerImages, products } from '@/mock/data'

const recommended = products.slice(0, 8)
const heroHeight = '420px'
const categories = [
  { name: '手机', items: products.slice(0, 6) },
  { name: '穿戴', items: products.slice(6, 12) },
  { name: '平板', items: products.slice(12, 18) },
  { name: '笔记本', items: products.slice(2, 8) },
  { name: '智慧屏', items: products.slice(10, 16) },
  { name: '家电', items: products.slice(4, 10) }
]
const quickItems = [
  '华为手机','运动健康','影音娱乐','智慧美家','鸿蒙智车','以旧换新',
  '鸿蒙智造','配件','企业商用','优选甄选','极智驾舱','办公显示'
].map(n => ({ name: n, image: 'https://res.vmallres.com/uomcdn/CN/cms/202509/e0da42cd75ee44b18599bd514caaf538.jpg' }))
</script>

<template>
  <el-container direction="vertical">
      <NavBar />
    <el-main class="page-container">
      <div class="hero">
        <div class="hero-inner">
          <MainCarousel :images="bannerImages" :height="heroHeight"/>
          <CategoryMegaMenu :height="heroHeight" :categories="categories" />
        </div>
      </div>

      <div style="margin: 24px 0 12px 0;">
        <QuickCategoryGrid :items="quickItems" />
      </div>
      <div style="margin-top: 8px; display: flex; align-items: center; justify-content: space-between;">
        <h2>今日爆款推荐</h2>
        <el-button link type="primary" @click="$router.push('/hot-products')">更多</el-button>
      </div>
      <el-row :gutter="16">
        <el-col v-for="item in recommended" :key="item.id" :xs="12" :sm="8" :md="6" :lg="6">
          <ProductCard :product="item" />
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<style scoped>
.hero { width: 100vw; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; background: #f7f8fa; }
.hero-inner { position: relative; max-width: 1200px; margin: 0 auto; padding-top: 12px; --mega-width: 180px; }
.hero :deep(.el-carousel__container) { border-radius: 12px; overflow: hidden; }
.hero :deep(.el-carousel) { box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
/* make the carousel full-bleed across the viewport */
.hero :deep(.hero-carousel) { width: 100vw; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; }
/* fix the mega menu to top-left like Huawei Mall */
.hero-inner :deep(.mega) { top: 12px; left: 0; transform: none; width: var(--mega-width); }
</style>



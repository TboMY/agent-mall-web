<script setup>
import NavBar from '@/components/NavBar.vue'
import MainCarousel from '@/components/MainCarousel.vue'
import ProductCard from '@/components/ProductCard.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { bannerImages, products } from '@/mock/data'

const recommended = products.slice(0, 8)
</script>

<template>
  <el-container direction="vertical">
      <NavBar />
    <el-main class="page-container">
      <MainCarousel :images="bannerImages" />

      <div style="margin-top: 24px; display: flex; align-items: center; justify-content: space-between;">
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



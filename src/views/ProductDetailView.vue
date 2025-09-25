<script setup>
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useRoute } from 'vue-router'
import { getProductById, products } from '@/mock/data'

const route = useRoute()
const product = getProductById(route.params.id)
const guess = products.filter(p => p.id !== product?.id).slice(0, 3)

function addToCart() {
  ElMessage.success('已加入购物车（示例）')
}
</script>

<template>
  <el-container direction="vertical">
    <NavBar />
    <el-main class="page-container">
      <el-row :gutter="24">
        <el-col :xs="24" :md="12">
          <el-image :src="product?.image" fit="cover" style="width:100%; height: 360px;" />
        </el-col>
        <el-col :xs="24" :md="12">
          <h2>{{ product?.name }}</h2>
          <div style="color:#F56C6C; font-size: 20px; margin: 8px 0;">￥{{ product?.price.toFixed(2) }}</div>
          <el-button type="primary" size="large" @click="addToCart">加入购物车</el-button>
          <div style="margin-top: 16px; color:#909399;">
            本品由AI根据抖音爆款视频《办公室神器》自动选品上架
          </div>
        </el-col>
      </el-row>

      <h3 style="margin-top: 24px;">猜你喜欢</h3>
      <el-row :gutter="16">
        <el-col v-for="item in guess" :key="item.id" :xs="12" :sm="8" :md="6" :lg="6">
          <ProductCard :product="item" />
        </el-col>
      </el-row>
    </el-main>
    <SiteFooter />
  </el-container>
  
</template>



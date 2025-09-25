<script setup>
import NavBar from '@/components/NavBar.vue'
import ProductCard from '@/components/ProductCard.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { ref, computed } from 'vue'
import { products } from '@/mock/data'

const sortKey = ref('heat')
const currentPage = ref(1)
const pageSize = 8

const sorted = computed(() => {
  const list = [...products]
  if (sortKey.value === 'heat') return list.sort((a, b) => b.heat - a.heat)
  if (sortKey.value === 'time') return list.sort((a, b) => b.createdAt - a.createdAt)
  return list
})

const pageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sorted.value.slice(start, start + pageSize)
})
</script>

<template>
  <el-container direction="vertical">
    <NavBar />
    <el-main class="page-container">
      <h2>AI 实时追热点 · 爆款抢先上</h2>
      <div style="margin: 12px 0; display:flex; gap: 12px; align-items:center;">
        <span>排序：</span>
        <el-select v-model="sortKey" style="width: 200px;">
          <el-option label="按热度排序" value="heat" />
          <el-option label="按上架时间排序" value="time" />
        </el-select>
      </div>
      <el-row :gutter="16">
        <el-col v-for="item in pageData" :key="item.id" :xs="12" :sm="8" :md="6" :lg="6">
          <ProductCard :product="item" :showSource="true" />
        </el-col>
      </el-row>
      <div style="display:flex; justify-content:center; margin-top: 16px;">
        <el-pagination background layout="prev, pager, next" :total="sorted.length" :page-size="pageSize" v-model:current-page="currentPage" />
      </div>
    </el-main>
    <SiteFooter />
  </el-container>
</template>



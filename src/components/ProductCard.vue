<script setup>
import { useRouter } from 'vue-router'
const props = defineProps({
  product: { type: Object, required: true },
  showSource: { type: Boolean, default: false },
  showRecommendation: { type: Boolean, default: false }
})
const router = useRouter()
function goDetail() { router.push(`/product/${props.product.id}`) }
</script>

<template>
  <el-card class="card" shadow="hover" @click="goDetail">
    <img :src="product.image" class="image" :alt="product.name" />
    <div class="content">
      <div class="name">{{ product.name }}</div>
      <div class="price">￥{{ product.price.toFixed(2) }}</div>
      <div v-if="showRecommendation && product.recommendation" class="recommendation">
        {{ product.recommendation }}
      </div>
      <div class="meta">
        <el-tag v-if="product.tag" type="danger" effect="dark" size="small">{{ product.tag }}</el-tag>
        <el-tag v-if="showSource" size="small" style="margin-left: 8px;">{{ product.source }}</el-tag>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.card { cursor: pointer; }
.image { width: 100%; height: 180px; object-fit: cover; }
.content { padding-top: 8px; }
.name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.price { color: #F56C6C; margin-top: 4px; }
.recommendation { 
  font-size: 12px; 
  color: #666; 
  margin-top: 4px; 
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.meta { margin-top: 6px; }
</style>



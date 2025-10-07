<script setup>
const props = defineProps({
  images: { type: Array, default: () => [] },
  height: { type: String, default: '400px' }
})
</script>

<template>
  <el-carousel :height="props.height" indicator-position="outside" arrow="always" class="hero-carousel" >
    <el-carousel-item v-for="(img, idx) in images" :key="idx">
      <img :src="img" alt="banner" :style="{ width: '100%', height: props.height, objectFit: 'cover' }" />
    </el-carousel-item>
  </el-carousel>
</template>


<style scoped>
.hero-carousel :deep(.el-carousel__arrow--right) { right: 16px; }
/* put arrows above mega menu */
.hero-carousel :deep(.el-carousel__arrow) { z-index: 30; width: 52px; height: 52px; font-size: 22px; }
</style>


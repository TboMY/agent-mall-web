<script setup>
defineProps({ images: { type: Array, default: () => [] } })
</script>

<template>
  <el-carousel height="360px" indicator-position="outside">
    <el-carousel-item v-for="(img, idx) in images" :key="idx">
      <img :src="img" alt="banner" style="width: 100%; height: 360px; object-fit: cover;" />
    </el-carousel-item>
  </el-carousel>
</template>



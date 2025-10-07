<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] }
})
</script>

<template>
  <div class="quick-grid">
    <div v-for="(it, i) in items" :key="i" class="q-item">
      <div class="icon-wrap">
        <img :src="it.image" alt="" />
      </div>
      <div class="label">{{ it.name }}</div>
    </div>
  </div>
</template>

<style scoped>
.quick-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 24px 16px;
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.06);
}
.q-item {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; transition: transform .2s ease, box-shadow .2s ease;
}
.q-item:hover { transform: translateY(-2px); }
.icon-wrap { width: 48px; height: 48px; border-radius: 10px; overflow: hidden; background: #f5f7fa; display: flex; align-items: center; justify-content: center; }
.icon-wrap img { width: 100%; height: 100%; object-fit: cover; }
.label { font-size: 14px; color: #303133; font-weight: 500; text-align: center; white-space: nowrap; }

@media (max-width: 992px) {
  .quick-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 640px) {
  .quick-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>



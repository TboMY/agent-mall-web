<script setup>
import { ref } from 'vue'

const props = defineProps({
  height: { type: String, default: '400px' },
  categories: { type: Array, default: () => [] }
})

const activeIndex = ref(-1)

function onEnter(idx) { activeIndex.value = idx }
function onLeave() { activeIndex.value = -1 }
</script>

<template>
  <div class="mega" :style="{ height: props.height }">
    <ul class="cats">
      <li v-for="(cat, idx) in categories" :key="cat.name" class="cat"
          @mouseenter="onEnter(idx)" @mouseleave="onLeave">
        <div class="cat-name">{{ cat.name }}</div>
        <div class="panel" v-if="activeIndex === idx" :style="{ height: props.height }">
          <div class="panel-inner">
            <div class="panel-title">{{ cat.name }}</div>
            <div class="items">
              <div class="item" v-for="(item, i) in cat.items" :key="i">
                <img :src="item.image" alt="" />
                <div class="meta">
                  <div class="name">{{ item.name }}</div>
                  <div class="price">￥{{ item.price }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
  
</template>

<style scoped>
.mega {
  position: absolute;
  top: 0;
  left: 0;
  width: 180px;
  background: rgba(255,255,255,0.96);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border-radius: 8px;
  overflow: visible;
  z-index: 20;
}
.cats { list-style: none; padding: 8px 0; margin: 0; }
.cat { padding: 12px 16px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: #333; }
.cat + .cat { border-top: 1px solid rgba(0,0,0,0.06); }
.cat:hover { background: rgba(0,0,0,0.04); }
.cat-name { font-weight: 500; }
.cat::after { content: '›'; color: rgba(0,0,0,0.35); }

.panel {
  position: absolute;
  top: 0;
  left: 180px;
  width: 640px;
  background: #fff;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  border-radius: 8px;
  padding: 16px;
}
.panel-inner { height: 100%; display: flex; flex-direction: column; }
.panel-title { font-weight: 700; margin-bottom: 8px; font-size: 16px; }
.items { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; overflow: auto; }
.item { display: flex; gap: 8px; padding: 8px; border-radius: 6px; border: 1px solid #f0f0f0; }
.item img { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; }
.meta { display: flex; flex-direction: column; justify-content: center; }
.name { font-size: 14px; line-height: 1.3; color: #222; }
.price { color: #e1251b; font-weight: 700; margin-top: 2px; }

@media (max-width: 1200px) {
  .panel { width: 520px; }
}
</style>



<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits([ 'update:modelValue' ])

const visible = ref(props.modelValue)
let previousBodyOverflow = ''
watch(() => props.modelValue, v => visible.value = v)
watch(visible, v => {
  emit('update:modelValue', v)
  if (typeof document !== 'undefined') {
    if (v) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = previousBodyOverflow
    }
  }
})

function close () { visible.value = false }

function onEsc ( e ) {
  if (e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onEsc))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEsc)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow
  }
})

const keyword = ref('')
const recent = ref([ '华为手环 10', 'WATCH GT 6' ])

function clearRecent () { recent.value = [] }

</script>

<template>
  <transition name="mask-fade">
    <div v-if="visible" class="overlay">
      <transition name="slide-in">
        <div class="panel">
          <div class="search-bar">
            <div class="input-wrap">
              <svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="#909399">
                <path
                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input v-model="keyword" class="input" placeholder="搜索商品"/>
            </div>
            <button class="close-btn" @click="close" aria-label="关闭">×</button>
          </div>
          <div class="content">
            <div class="section">
              <div class="section-title">最近搜索</div>
              <div class="chips">
                <el-tag v-for="(k,i) in recent" :key="i" effect="plain" size="small" style="margin-right:8px;">{{
                    k
                  }}
                </el-tag>
                <el-button v-if="recent.length" link type="danger" @click="clearRecent">清空</el-button>
              </div>
            </div>
            <div class="section">
              <div class="section-title">搜索推荐</div>
              <ul class="suggest">
                <li v-for="s in ['WATCH 5','华为路由 AX3','Sound X4','FreeArc']" :key="s">{{ s }}</li>
              </ul>
            </div>
          </div>
        </div>
      </transition>
      <div class="backdrop" @click="close"></div>
    </div>
  </transition>

</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  --mask-top: 56px;
  pointer-events: auto;
}

/* white area aligned with navbar height, visually overlaying it */
.panel {
  position: absolute;
  z-index: 1;
  left: 50%;
  transform: translateX(-50%);
  top: var(--mask-top);
  width: min(980px, 92vw);
  background: #fff;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  margin-top: 0;
}

.search-bar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  height: var(--mask-top);
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.input-wrap {
  position: relative;
  flex: 1;
}

.input {
  width: 100%;
  height: 36px;
  border: 1px solid #e4e7ed;
  border-radius: 18px;
  padding: 0 12px 0 34px;
  outline: none;
}

.input:focus {
  border-color: #c0c4cc;
}

.icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: #909399;
  padding: 4px 8px;
}

.content {
  padding: 12px;
  max-height: calc(70vh - var(--mask-top));
  overflow: auto;
}

.section {
  margin-top: 8px;
}

.section-title {
  font-weight: 700;
  margin-bottom: 8px;
}

.chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.suggest {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 24px;
}

.suggest li {
  color: #303133;
  cursor: pointer;
}

/* transitions */
.mask-fade-enter-active, .mask-fade-leave-active {
  transition: opacity .2s ease;
}

.mask-fade-enter-from, .mask-fade-leave-to {
  opacity: 0;
}

.slide-in-enter-active, .slide-in-leave-active {
  transition: transform .25s ease, opacity .25s ease;
}

.slide-in-enter-from, .slide-in-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* separate backdrop that starts under the white header */
.backdrop {
  position: absolute;
  left: 0;
  right: 0;
  top: var(--mask-top);
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}
</style>



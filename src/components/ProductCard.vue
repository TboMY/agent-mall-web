<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  product: { type: Object, required: true },
  showSource: { type: Boolean, default: false },
  showRecommendation: { type: Boolean, default: false }
})

const router = useRouter()

const tags = computed(() => {
  const raw = props.product.tags
  if (!raw) return []
  if (Array.isArray(raw)) return raw.slice(0, 2)
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.slice(0, 2) : []
    } catch {
      return raw.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 2)
    }
  }
  return []
})

function goDetail() {
  router.push(`/product/${props.product.id}`)
}

function formatPrice(value) {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : '0.00'
}

function formatSource(source) {
  if (!source) return ''
  if (source === 'douyin') return '抖音'
  if (source === 'bilibili') return 'B站'
  return source
}
</script>

<template>
  <article class="am-product-card" @click="goDetail">
    <div class="am-product-card__media">
      <img :src="product.image" :alt="product.name" class="am-product-card__image" />
      <div class="am-product-card__overlay" />
      <div class="am-product-card__badges">
        <span v-if="product.is_ai_recommended" class="am-product-card__badge am-product-card__badge--hot">
          AI精选
        </span>
        <span
          v-if="showSource && (product.source_platform || product.source)"
          class="am-product-card__badge am-product-card__badge--soft"
        >
          {{ formatSource(product.source_platform || product.source) }}
        </span>
      </div>
    </div>

    <div class="am-product-card__body">
      <div class="am-product-card__tagline">
        <span v-for="tag in tags" :key="tag" class="am-product-card__tag">{{ tag }}</span>
      </div>

      <h3 class="am-product-card__name">{{ product.name }}</h3>

      <p
        v-if="showRecommendation && (product.ai_recommendation || product.recommendation)"
        class="am-product-card__reason"
      >
        {{ product.ai_recommendation || product.recommendation }}
      </p>

      <div class="am-product-card__bottom">
        <div>
          <div class="am-product-card__price-label">到手参考价</div>
          <div class="am-product-card__price-row">
            <span class="am-product-card__price-symbol">￥</span>
            <span class="am-product-card__price-value">{{ formatPrice(product.price) }}</span>
          </div>
        </div>
        <button type="button" class="am-product-card__button">查看详情</button>
      </div>
    </div>
  </article>
</template>

<style>
.am-product-card {
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(16, 40, 67, 0.08);
  box-shadow: 0 18px 42px rgba(18, 37, 62, 0.08);
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
}

.am-product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 26px 54px rgba(18, 37, 62, 0.14);
  border-color: rgba(240, 124, 70, 0.24);
}

.am-product-card__media {
  position: relative;
  aspect-ratio: 1 / 1;
  background: linear-gradient(180deg, #eff4f8 0%, #dbe5ef 100%);
}

.am-product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.am-product-card__overlay {
  position: absolute;
  inset: auto 0 0;
  height: 44%;
  background: linear-gradient(180deg, rgba(17, 31, 48, 0) 0%, rgba(17, 31, 48, 0.54) 100%);
}

.am-product-card__badges {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.am-product-card__badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.am-product-card__badge--hot {
  color: #fff;
  background: linear-gradient(135deg, #ef6c40 0%, #f6bb59 100%);
}

.am-product-card__badge--soft {
  color: #173049;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
}

.am-product-card__body {
  padding: 18px 18px 20px;
}

.am-product-card__tagline {
  min-height: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.am-product-card__tag {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: #f3f6f9;
  color: #617386;
  font-size: 11px;
  font-weight: 700;
}

.am-product-card__name {
  margin: 10px 0 0;
  font-size: 17px;
  line-height: 1.4;
  color: #14253a;
  min-height: 48px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.am-product-card__reason {
  margin: 10px 0 0;
  color: #607183;
  font-size: 13px;
  line-height: 1.55;
  min-height: 42px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.am-product-card__bottom {
  margin-top: 16px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
}

.am-product-card__price-label {
  color: #8b98a8;
  font-size: 12px;
}

.am-product-card__price-row {
  margin-top: 3px;
  color: #ef6c40;
  display: flex;
  align-items: baseline;
}

.am-product-card__price-symbol {
  font-size: 14px;
  font-weight: 700;
}

.am-product-card__price-value {
  margin-left: 2px;
  font-size: 27px;
  line-height: 1;
  font-weight: 800;
}

.am-product-card__button {
  border: none;
  min-width: 96px;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #182f4d 0%, #2e5882 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
</style>

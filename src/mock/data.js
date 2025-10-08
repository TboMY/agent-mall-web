export const bannerImages = [
  // 'https://res.vmallres.com/uomcdn/CN/cms/202509/e0da42cd75ee44b18599bd514caaf538.jpg',
  'https://res1.vmallres.com/pimages/FssCdnProxy/vmall_product_uom/pmsSalesFile/800_800_1F2CD1669167D4A642BFFEC3A00CAD10.jpg',
  'https://res.vmallres.com/uomcdn/CN/cms/202509/e0da42cd75ee44b18599bd514caaf538.jpg',
  'https://res.vmallres.com/uomcdn/CN/cms/202509/e0da42cd75ee44b18599bd514caaf538.jpg'
]

const recommendations = [
  'AI发现这款产品在多个平台热度飙升，推荐指数⭐⭐⭐⭐⭐',
  '根据用户行为分析，此商品匹配度高达95%，值得入手',
  'AI算法预测：未来7天销量将增长300%，建议提前下单',
  '智能推荐：同类产品中性价比最高，用户好评率98%',
  'AI实时监控显示：该商品正在成为新晋网红爆款',
  '基于大数据分析，此产品符合当前消费趋势，强烈推荐',
  'AI发现：该商品在年轻用户群体中热度持续上升',
  '智能推荐：根据你的浏览历史，这款产品非常适合你',
  'AI算法分析：该商品具有爆款潜力，建议关注',
  '基于用户画像匹配，此产品推荐度高达92%',
  'AI实时追踪：该商品在社交媒体讨论度激增',
  '智能推荐：同类产品中用户满意度最高，值得信赖',
  'AI发现：该商品正在成为办公室新宠，推荐指数高',
  '基于消费趋势分析，此产品符合当下流行元素',
  'AI算法预测：该商品将成为下一个爆款，建议收藏',
  '智能推荐：根据热销数据，此产品性价比突出',
  'AI实时监控：该商品搜索量暴增，热度持续攀升',
  '基于用户反馈分析，此产品质量可靠，推荐购买',
  'AI发现：该商品在多个平台同时走红，值得关注',
  '智能推荐：该产品符合当前消费升级趋势，强烈推荐'
]

const normalRecommendations = [
  '精选好物，品质保证',
  '热销商品，用户好评如潮',
  '性价比之选，值得信赖',
  '品质生活，从这里开始',
  '精选推荐，品质保证',
  '热销爆款，限时优惠',
  '品质之选，值得拥有',
  '精选商品，品质生活'
]

export const products = Array.from({ length: 20 }).map((_, i) => ({
  id: String(i + 1),
  name: `AI 热点商品 ${i + 1}`,
  price: Number((Math.random() * 200 + 20).toFixed(2)),
  image: 'https://res.vmallres.com/uomcdn/CN/cms/202509/e0da42cd75ee44b18599bd514caaf538.jpg',
  heat: Math.floor(Math.random() * 10000),
  source: ['🔥源自B站热门视频', '🔥源自抖音热榜', '🔥源自小红书爆文'][i % 3],
  createdAt: Date.now() - i * 86400000,
  tag: i % 2 === 0 ? '🔥新晋爆款' : 'AI推荐',
  recommendation: recommendations[i]
}))

// 普通商品数据（用于底部推荐）
export const normalProducts = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i + 21),
  name: `精选商品 ${i + 1}`,
  price: Number((Math.random() * 300 + 50).toFixed(2)),
  image: 'https://res.vmallres.com/uomcdn/CN/cms/202509/e0da42cd75ee44b18599bd514caaf538.jpg',
  heat: Math.floor(Math.random() * 5000),
  source: '精选推荐',
  createdAt: Date.now() - i * 86400000,
  tag: i % 3 === 0 ? '🔥热销' : i % 3 === 1 ? '⭐精选' : '💎品质',
  recommendation: normalRecommendations[i]
}))

export function getProductById(id) {
  return products.find(p => p.id === id)
}

export const agentLogs = Array.from({ length: 5 }).map((_, i) => ({
  time: new Date(Date.now() - i * 3600_000).toLocaleString(),
  added: (i % 3) + 1,
  source: ['B站', '抖音', '小红书'][i % 3]
}))



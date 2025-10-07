export const bannerImages = [
  'https://res.vmallres.com/uomcdn/CN/cms/202509/e0da42cd75ee44b18599bd514caaf538.jpg',
  'https://res.vmallres.com/uomcdn/CN/cms/202509/e0da42cd75ee44b18599bd514caaf538.jpg',
  'https://res.vmallres.com/uomcdn/CN/cms/202509/e0da42cd75ee44b18599bd514caaf538.jpg'
]

export const products = Array.from({ length: 20 }).map((_, i) => ({
  id: String(i + 1),
  name: `AI 热点商品 ${i + 1}`,
  price: Number((Math.random() * 200 + 20).toFixed(2)),
  image: 'https://res.vmallres.com/uomcdn/CN/cms/202509/e0da42cd75ee44b18599bd514caaf538.jpg',
  heat: Math.floor(Math.random() * 10000),
  source: ['🔥源自B站热门视频', '🔥源自抖音热榜', '🔥源自小红书爆文'][i % 3],
  createdAt: Date.now() - i * 86400000,
  tag: i % 2 === 0 ? '🔥新晋爆款' : 'AI推荐'
}))

export function getProductById(id) {
  return products.find(p => p.id === id)
}

export const agentLogs = Array.from({ length: 5 }).map((_, i) => ({
  time: new Date(Date.now() - i * 3600_000).toLocaleString(),
  added: (i % 3) + 1,
  source: ['B站', '抖音', '小红书'][i % 3]
}))



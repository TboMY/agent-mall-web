import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 商品相关API
export const productAPI = {
  // 获取商品列表
  getProducts(params = {}) {
    return api.get('/products', { params })
  },
  
  // 获取商品详情
  getProduct(id) {
    return api.get(`/products/${id}`)
  },
  
  // 创建商品
  createProduct(data) {
    return api.post('/products', data)
  },
  
  // 更新商品
  updateProduct(id, data) {
    return api.put(`/products/${id}`, data)
  },
  
  // 删除商品
  deleteProduct(id) {
    return api.delete(`/products/${id}`)
  },
  
  // 批量删除商品
  batchDeleteProducts(ids) {
    return api.delete('/products', { data: { ids } })
  },
  
  // 更新商品状态
  updateProductStatus(id, status) {
    return api.patch(`/products/${id}/status`, { status })
  },
  
  // 更新商品库存
  updateProductStock(id, stock) {
    return api.patch(`/products/${id}/stock`, { stock })
  },
  
  // 获取AI推荐商品
  getAIRecommended(limit = 10) {
    return api.get('/products/ai/recommended', { params: { limit } })
  },
  
  // 获取热门商品
  getHotProducts(limit = 10) {
    return api.get('/products/hot', { params: { limit } })
  }
}

// 分类相关API
export const categoryAPI = {
  // 获取所有分类
  getCategories() {
    return api.get('/categories')
  },
  
  // 获取分类树
  getCategoryTree() {
    return api.get('/categories/tree')
  },
  
  // 获取分类详情
  getCategory(id) {
    return api.get(`/categories/${id}`)
  },
  
  // 创建分类
  createCategory(data) {
    return api.post('/categories', data)
  },
  
  // 更新分类
  updateCategory(id, data) {
    return api.put(`/categories/${id}`, data)
  },
  
  // 删除分类
  deleteCategory(id) {
    return api.delete(`/categories/${id}`)
  }
}

// 品牌相关API
export const brandAPI = {
  // 获取所有品牌
  getBrands() {
    return api.get('/brands')
  },
  
  // 获取品牌详情
  getBrand(id) {
    return api.get(`/brands/${id}`)
  },
  
  // 创建品牌
  createBrand(data) {
    return api.post('/brands', data)
  },
  
  // 更新品牌
  updateBrand(id, data) {
    return api.put(`/brands/${id}`, data)
  },
  
  // 删除品牌
  deleteBrand(id) {
    return api.delete(`/brands/${id}`)
  }
}

// 商品类型相关API
export const productTypeAPI = {
  // 获取商品类型列表
  getList(params = {}) {
    return api.get('/product-types', { params })
  },
  
  // 获取启用的商品类型列表
  getActiveList() {
    return api.get('/product-types/active')
  },
  
  // 获取商品类型详情
  getDetail(id) {
    return api.get(`/product-types/${id}`)
  },
  
  // 创建商品类型
  create(data) {
    return api.post('/product-types', data)
  },
  
  // 更新商品类型
  update(id, data) {
    return api.put(`/product-types/${id}`, data)
  },
  
  // 删除商品类型
  delete(id) {
    return api.delete(`/product-types/${id}`)
  },
  
  // 获取商品类型的属性列表
  getAttributes(id) {
    return api.get(`/product-types/${id}/attributes`)
  }
}

// 商品属性相关API
export const productAttributeAPI = {
  // 获取属性列表
  getList(params = {}) {
    return api.get('/product-attributes', { params })
  },
  
  // 获取属性详情
  getDetail(id) {
    return api.get(`/product-attributes/${id}`)
  },
  
  // 创建属性
  create(data) {
    return api.post('/product-attributes', data)
  },
  
  // 更新属性
  update(id, data) {
    return api.put(`/product-attributes/${id}`, data)
  },
  
  // 删除属性
  delete(id) {
    return api.delete(`/product-attributes/${id}`)
  },
  
  // 获取属性值列表
  getValues(attributeId) {
    return api.get(`/product-attributes/${attributeId}/values`)
  },
  
  // 创建属性值
  createValue(attributeId, data) {
    return api.post(`/product-attributes/${attributeId}/values`, data)
  },
  
  // 更新属性值
  updateValue(valueId, data) {
    return api.put(`/product-attributes/values/${valueId}`, data)
  },
  
  // 删除属性值
  deleteValue(valueId) {
    return api.delete(`/product-attributes/values/${valueId}`)
  },
  
  // 根据商品类型获取属性
  getByProductType(productTypeId) {
    return api.get(`/product-attributes/type/${productTypeId}`)
  }
}

export default api

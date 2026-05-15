import axios from 'axios'

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const ADMIN_TOKEN_KEY = 'adm_token'
const CUSTOMER_TOKEN_KEY = 'mall_token'

// 公开接口实例
const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000, // 普通接口10秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 后台接口实例
const adminApi = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 前台登录态接口实例
const customerApi = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 创建专门用于AI分析的axios实例（超时时间更长）
const aiApi = axios.create({
  baseURL: apiBaseURL,
  timeout: 300000, // 5分钟超时，适合大模型调用
  headers: {
    'Content-Type': 'application/json'
  }
})

function attachAdminAuthHeader(config) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

function attachCustomerAuthHeader(config) {
  const token = localStorage.getItem(CUSTOMER_TOKEN_KEY)
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

adminApi.interceptors.request.use(attachAdminAuthHeader, error => Promise.reject(error))
aiApi.interceptors.request.use(attachAdminAuthHeader, error => Promise.reject(error))
customerApi.interceptors.request.use(attachCustomerAuthHeader, error => Promise.reject(error))

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

adminApi.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem(ADMIN_TOKEN_KEY)
      if (window.location.pathname !== '/admin/login') {
        window.location.href = `/admin/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
      }
    }
    console.error('后台API请求错误:', error)
    return Promise.reject(error)
  }
)

customerApi.interceptors.response.use(
  response => response.data,
  error => {
    console.error('前台用户API请求错误:', error)
    return Promise.reject(error)
  }
)

// AI分析接口的响应拦截器
aiApi.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem(ADMIN_TOKEN_KEY)
      if (window.location.pathname !== '/admin/login') {
        window.location.href = `/admin/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
      }
    }
    console.error('AI分析请求错误:', error)
    // 对于超时错误，提供更友好的提示
    if (error.code === 'ECONNABORTED') {
      error.message = 'AI分析超时，请稍后刷新页面查看结果'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login(data) {
    return adminApi.post('/users/login', data)
  },

  getMe() {
    return adminApi.get('/users/me')
  },

  getRoles() {
    return adminApi.get('/users/roles')
  },

  changeMyPassword(data) {
    return adminApi.patch('/users/me/password', data)
  }
}

export const mallUserAPI = {
  getUsers(params = {}) {
    return adminApi.get('/mall-users', { params })
  }
}

export const orderAPI = {
  getOrders(params = {}) {
    return adminApi.get('/orders', { params })
  },

  getOrderDetail(id) {
    return adminApi.get(`/orders/${id}`)
  },

  updateOrderStatus(id, action) {
    return adminApi.patch(`/orders/${id}/status`, { action })
  }
}

export const returnRequestAPI = {
  getList(params = {}) {
    return adminApi.get('/return-requests', { params })
  },

  updateStatus(id, action, adminRemark = '') {
    return adminApi.patch(`/return-requests/${id}/status`, {
      action,
      admin_remark: adminRemark
    })
  }
}

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

  getProductSkus(id) {
    return api.get(`/products/${id}/skus`)
  },

  updateProductSkus(id, skus) {
    return api.put(`/products/${id}/skus`, { skus })
  },
  
  // 创建商品
  createProduct(data) {
    return adminApi.post('/products', data)
  },
  
  // 更新商品
  updateProduct(id, data) {
    return adminApi.put(`/products/${id}`, data)
  },
  
  // 删除商品
  deleteProduct(id) {
    return adminApi.delete(`/products/${id}`)
  },
  
  // 批量删除商品
  batchDeleteProducts(ids) {
    return adminApi.delete('/products', { data: { ids } })
  },
  
  // 更新商品状态
  updateProductStatus(id, status) {
    return adminApi.patch(`/products/${id}/status`, { status })
  },
  
  // 更新商品库存
  updateProductStock(id, stock) {
    return adminApi.patch(`/products/${id}/stock`, { stock })
  },
  
  // 获取AI推荐商品
  getAIRecommended(limit = 10) {
    return api.get('/products/ai/recommended', { params: { limit } })
  },
  
  // 获取热门商品
  getHotProducts(limit = 10) {
    return api.get('/products/hot', { params: { limit } })
  },

  getHomepageDisplay() {
    return api.get('/products/homepage-display')
  },

  getHomepageKeywords(limit = 8) {
    return api.get('/products/homepage-keywords', { params: { limit } })
  },
  
  // 批量更新商品状态
  batchUpdateProducts(ids, data) {
    return adminApi.patch('/products/batch/status', { ids, ...data })
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
    return adminApi.post('/categories', data)
  },
  
  // 更新分类
  updateCategory(id, data) {
    return adminApi.put(`/categories/${id}`, data)
  },

  // 同级分类排序
  reorderCategories(data) {
    return adminApi.patch('/categories/reorder', data)
  },
  
  // 删除分类
  deleteCategory(id) {
    return adminApi.delete(`/categories/${id}`)
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
    return adminApi.post('/brands', data)
  },
  
  // 更新品牌
  updateBrand(id, data) {
    return adminApi.put(`/brands/${id}`, data)
  },
  
  // 删除品牌
  deleteBrand(id) {
    return adminApi.delete(`/brands/${id}`)
  }
}

// 商品类型相关API
export const productTypeAPI = {
  // 获取商品类型列表
  getList(params = {}) {
    return api.get('/product-types', { params })
  },
  
  // 获取启用的商品类型列表
  getActiveList(params = {}) {
    return api.get('/product-types/active', { params })
  },
  
  // 获取商品类型详情
  getDetail(id) {
    return api.get(`/product-types/${id}`)
  },
  
  // 创建商品类型
  create(data) {
    return adminApi.post('/product-types', data)
  },
  
  // 更新商品类型
  update(id, data) {
    return adminApi.put(`/product-types/${id}`, data)
  },
  
  // 删除商品类型
  delete(id) {
    return adminApi.delete(`/product-types/${id}`)
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
    return adminApi.post('/product-attributes', data)
  },
  
  // 更新属性
  update(id, data) {
    return adminApi.put(`/product-attributes/${id}`, data)
  },
  
  // 删除属性
  delete(id) {
    return adminApi.delete(`/product-attributes/${id}`)
  },
  
  // 获取属性值列表
  getValues(attributeId) {
    return api.get(`/product-attributes/${attributeId}/values`)
  },
  
  // 创建属性值
  createValue(attributeId, data) {
    return adminApi.post(`/product-attributes/${attributeId}/values`, data)
  },
  
  // 更新属性值
  updateValue(valueId, data) {
    return adminApi.put(`/product-attributes/values/${valueId}`, data)
  },
  
  // 删除属性值
  deleteValue(valueId) {
    return adminApi.delete(`/product-attributes/values/${valueId}`)
  },
  
  // 根据商品类型获取属性
  getByProductType(productTypeId) {
    return api.get(`/product-attributes/type/${productTypeId}`)
  }
}

// AI候选商品相关API
export const aiCandidateAPI = {
  // 获取AI候选商品列表
  getCandidates(params = {}) {
    return adminApi.get('/ai-candidates', { params })
  },
  
  // 获取候选商品详情
  getCandidate(id) {
    return adminApi.get(`/ai-candidates/${id}`)
  },
  
  // 更新候选商品状态
  updateStatus(id, status) {
    return adminApi.patch(`/ai-candidates/${id}/status`, { status })
  },
  
  // 批量更新候选商品状态
  batchUpdateStatus(ids, status) {
    return adminApi.patch('/ai-candidates/batch/status', { ids, status })
  },
  
  // 将候选商品转换为正式商品
  convertToProduct(id, data) {
    return adminApi.post(`/ai-candidates/${id}/convert`, data)
  },
  
  // 获取统计信息
  getStats() {
    return adminApi.get('/ai-candidates/stats/overview')
  },
  
  // 删除候选商品
  deleteCandidate(id) {
    return adminApi.delete(`/ai-candidates/${id}`)
  }
}

// 系统配置相关API
export const systemConfigAPI = {
  // 获取所有配置
  getAllConfigs() {
    return adminApi.get('/system-configs')
  },
  
  // 根据分组获取配置
  getConfigsByGroup(groupName) {
    return adminApi.get(`/system-configs/group/${groupName}`)
  },
  
  // 获取AI工作台配置
  getAIWorkbenchConfig() {
    return adminApi.get('/system-configs/ai-workbench')
  },

  getHomepageDisplayConfig() {
    return adminApi.get('/system-configs/homepage-display')
  },

  saveHomepageDisplayConfig(config) {
    return adminApi.post('/system-configs/homepage-display', config)
  },
  
  // 保存AI工作台配置
  saveAIWorkbenchConfig(config) {
    return adminApi.post('/system-configs/ai-workbench', config)
  },
  
  // 获取单个配置
  getConfig(key) {
    return adminApi.get(`/system-configs/${key}`)
  },
  
  // 设置配置
  setConfig(key, value, type = 'string', description = '', group = 'general') {
    return adminApi.post(`/system-configs/${key}`, {
      value,
      type,
      description,
      group
    })
  },
  
  // 删除配置
  deleteConfig(key) {
    return adminApi.delete(`/system-configs/${key}`)
  }
}

// 抖音作品/AI分析相关API
export const awemeAPI = {
  // 手动触发AI选品分析（使用后端系统配置，无需请求体）
  analyze() {
    return aiApi.post('/aweme/analyze')
  }
}

export const keywordTrendAPI = {
  syncHotlist(data) {
    return aiApi.post('/keyword-trends/trending/sync-hotlist', data)
  },

  analyzeTrending(data) {
    return aiApi.post('/keyword-trends/trending/analyze', data)
  },

  runPipeline(data = {}) {
    return aiApi.post('/keyword-trends/pipeline/run', data)
  },

  getCommercialKeywords(params = {}) {
    return adminApi.get('/keyword-trends/commercial', { params })
  },

  getCollectionRuns(params = {}) {
    return adminApi.get('/keyword-trends/collection-runs', { params })
  }
}

export const adminUserAPI = {
  getUsers(params = {}) {
    return adminApi.get('/users', { params })
  },

  createUser(data) {
    return adminApi.post('/users', data)
  },

  updateUser(id, data) {
    return adminApi.put(`/users/${id}`, data)
  },

  updateUserStatus(id, status) {
    return adminApi.patch(`/users/${id}/status`, { status })
  },

  resetPassword(id, password) {
    return adminApi.patch(`/users/${id}/password`, { password })
  },

  deleteUser(id) {
    return adminApi.delete(`/users/${id}`)
  }
}

export const roleAPI = {
  getRoles(params = {}) {
    return adminApi.get('/roles', { params })
  },

  getRoleOptions() {
    return adminApi.get('/users/roles')
  },

  getPermissionCatalog() {
    return adminApi.get('/roles/permission-catalog')
  },

  createRole(data) {
    return adminApi.post('/roles', data)
  },

  updateRole(id, data) {
    return adminApi.put(`/roles/${id}`, data)
  },

  deleteRole(id) {
    return adminApi.delete(`/roles/${id}`)
  }
}

export const customerAuthAPI = {
  register(data) {
    return customerApi.post('/customer-auth/register', data)
  },

  login(data) {
    return customerApi.post('/customer-auth/login', data)
  },

  getMe() {
    return customerApi.get('/customer-auth/me')
  },

  updateProfile(data) {
    return customerApi.patch('/customer-auth/me/profile', data)
  },

  updatePhone(data) {
    return customerApi.patch('/customer-auth/me/phone', data)
  },

  updatePassword(data) {
    return customerApi.patch('/customer-auth/me/password', data)
  }
}

export const customerAddressAPI = {
  getAddresses() {
    return customerApi.get('/customer-addresses')
  },

  createAddress(data) {
    return customerApi.post('/customer-addresses', data)
  },

  updateAddress(id, data) {
    return customerApi.put(`/customer-addresses/${id}`, data)
  },

  setDefault(id) {
    return customerApi.post(`/customer-addresses/${id}/default`)
  },

  deleteAddress(id) {
    return customerApi.delete(`/customer-addresses/${id}`)
  }
}

export const cartAPI = {
  getCart() {
    return customerApi.get('/cart')
  },

  addItem(data) {
    return customerApi.post('/cart/items', data)
  },

  updateItem(id, data) {
    return customerApi.patch(`/cart/items/${id}`, data)
  },

  deleteItem(id) {
    return customerApi.delete(`/cart/items/${id}`)
  },

  batchDelete(itemIds) {
    return customerApi.delete('/cart/items', { data: { item_ids: itemIds } })
  }
}

export const customerOrderAPI = {
  getOrders(params = {}) {
    return customerApi.get('/customer-orders', { params })
  },

  getOrderDetail(id) {
    return customerApi.get(`/customer-orders/${id}`)
  },

  getOrderByOrderNo(orderNo) {
    return customerApi.get(`/customer-orders/by-order-no/${orderNo}`)
  },

  reconcileOrderPayment(orderNo) {
    return customerApi.post(`/customer-orders/by-order-no/${orderNo}/reconcile-payment`)
  },

  checkout(data) {
    return customerApi.post('/customer-orders/checkout', data)
  },

  directBuy(data) {
    return customerApi.post('/customer-orders/direct', data)
  },

  payAlipay(id) {
    return customerApi.post(`/customer-orders/${id}/pay-alipay`)
  },

  cancelOrder(id) {
    return customerApi.post(`/customer-orders/${id}/cancel`)
  },

  confirmReceipt(id) {
    return customerApi.post(`/customer-orders/${id}/confirm-receipt`)
  },

  createReturnRequest(id, data) {
    return customerApi.post(`/customer-orders/${id}/return-request`, data)
  }
}

export default api

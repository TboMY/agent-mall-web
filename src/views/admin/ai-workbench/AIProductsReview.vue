<template>
  <div class="ai-products-review">
    <!-- 筛选和操作栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <!-- 时间过滤 -->
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
          @change="filterProducts"
          :shortcuts="dateShortcuts"
          style="width: 300px; margin-right: 10px;"
        />
        
        <!-- 来源平台过滤 -->
        <el-select v-model="sourceFilter" placeholder="选择来源平台" @change="filterProducts" style="width: 150px; margin-right: 10px;">
          <el-option label="全部" value="" />
          <el-option label="B站" value="bilibili" />
          <el-option label="抖音" value="douyin" />
          <el-option label="小红书" value="xiaohongshu" />
        </el-select>
        
        <!-- 状态过滤 -->
        <el-select v-model="statusFilter" placeholder="选择状态" @change="filterProducts" style="width: 120px; margin-right: 10px;">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已上架" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
        
        <!-- 排序 -->
        <el-select v-model="sortField" placeholder="排序方式" @change="handleSortChange" style="width: 150px; margin-right: 10px;">
          <el-option label="推荐时间" value="created_at" />
          <el-option label="热度评分" value="heat_score" />
          <el-option label="销量" value="sales_count" />
          <el-option label="价格" value="price" />
        </el-select>
        
        <el-select v-model="sortOrder" placeholder="排序顺序" @change="handleSortChange" style="width: 100px; margin-right: 10px;">
          <el-option label="降序" value="desc" />
          <el-option label="升序" value="asc" />
        </el-select>
        
        <el-button @click="refreshProducts">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      
      <div class="filter-right">
        <el-button type="success" @click="batchApprove" :disabled="selectedProducts.length === 0">
          <el-icon><Check /></el-icon>
          批量上架 ({{ selectedProducts.length }})
        </el-button>
        <el-button type="danger" @click="batchReject" :disabled="selectedProducts.length === 0">
          <el-icon><Close /></el-icon>
          批量拒绝
        </el-button>
      </div>
    </div>

    <!-- AI推荐商品列表 -->
    <div class="products-grid" v-loading="productsLoading">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
        :class="{ 'selected': selectedProducts.includes(product.id) }"
        @click="toggleSelect(product.id)"
      >
        <!-- 选择框 -->
        <div class="product-checkbox">
          <el-checkbox 
            :model-value="selectedProducts.includes(product.id)"
            @change="toggleSelect(product.id)"
            @click.stop
          />
        </div>

        <!-- 商品图片 -->
        <div class="product-image">
          <el-image
            :src="product.image"
            :alt="product.name"
            fit="cover"
            :preview-src-list="[product.image]"
          />
          <div class="product-badges">
            <el-tag v-if="product.is_ai_recommended" type="danger" size="small">AI推荐</el-tag>
            <el-tag v-if="product.source_platform" size="small">{{ product.source_platform }}</el-tag>
            <el-tag :type="getStatusColor(product.status)" size="small">{{ getStatusName(product.status) }}</el-tag>
          </div>
        </div>
        
        <!-- 商品信息 -->
        <div class="product-info">
          <h4 class="product-name">{{ product.name }}</h4>
          <div class="product-price">¥{{ product.price }}</div>
          <div class="product-meta">
            <span>热度: {{ product.heat_score }}</span>
            <span>销量: {{ product.sales_count }}</span>
          </div>
          
          <!-- AI推荐理由 -->
          <div v-if="product.ai_recommendation" class="ai-recommendation">
            <strong>AI推荐理由：</strong>{{ product.ai_recommendation }}
          </div>
          
          <!-- 商品详情 -->
          <div class="product-details">
            <p><strong>分类：</strong>{{ product.category_name }}</p>
            <p><strong>品牌：</strong>{{ product.brand_name }}</p>
            <p><strong>来源时间：</strong>{{ formatDate(product.created_at) }}</p>
          </div>
          
          <!-- 操作按钮 -->
          <div class="product-actions">
            <el-button type="primary" size="small" @click.stop="viewProduct(product)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            <el-button type="success" size="small" @click.stop="approveProduct(product)" v-if="product.status === 'pending'">
              <el-icon><Check /></el-icon>
              上架
            </el-button>
            <el-button type="danger" size="small" @click.stop="rejectProduct(product)" v-if="product.status === 'pending'">
              <el-icon><Close /></el-icon>
              拒绝
            </el-button>
            <el-button type="warning" size="small" @click.stop="editProduct(product)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="filteredProducts.length === 0" class="empty-state">
      <el-empty description="暂无AI推荐商品" />
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="filteredProducts.length > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalProducts"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productAPI } from '@/services/api'

const router = useRouter()

// 响应式数据
const productsLoading = ref(false)
const aiProducts = ref([])
const selectedProducts = ref([])
const dateRange = ref([])
const sourceFilter = ref('')
const statusFilter = ref('')
const sortField = ref('created_at')
const sortOrder = ref('desc')
const currentPage = ref(1)
const pageSize = ref(20)
const totalProducts = ref(0)

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      return [start, end]
    }
  },
  {
    text: '昨天',
    value: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
      const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
      return [start, end]
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 过滤后的商品
const filteredProducts = computed(() => {
  let filtered = aiProducts.value
  
  // 时间过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startTime, endTime] = dateRange.value
    filtered = filtered.filter(product => {
      const productTime = new Date(product.created_at)
      return productTime >= new Date(startTime) && productTime <= new Date(endTime)
    })
  }
  
  // 来源平台过滤
  if (sourceFilter.value) {
    filtered = filtered.filter(product => 
      product.source_platform === sourceFilter.value
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(product => 
      product.status === statusFilter.value
    )
  }
  
  // 排序
  if (sortField.value) {
    filtered.sort((a, b) => {
      let aVal = a[sortField.value]
      let bVal = b[sortField.value]
      
      // 处理日期排序
      if (sortField.value === 'created_at') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }
      
      // 处理数字排序
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder.value === 'desc' ? bVal - aVal : aVal - bVal
      }
      
      // 处理字符串排序
      if (sortOrder.value === 'desc') {
        return bVal > aVal ? 1 : -1
      } else {
        return aVal > bVal ? 1 : -1
      }
    })
  }
  
  return filtered
})

// 获取AI推荐商品
async function getAIProducts() {
  productsLoading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      source_platform: sourceFilter.value,
      status: statusFilter.value,
      sort_field: sortField.value,
      sort_order: sortOrder.value
    }
    
    // 添加时间范围参数
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_time = dateRange.value[0]
      params.end_time = dateRange.value[1]
    }
    
    const response = await productAPI.getAIRecommended(params)
    aiProducts.value = response.data
    totalProducts.value = response.pagination.total
  } catch (error) {
    ElMessage.error('获取AI推荐商品失败')
    console.error(error)
  } finally {
    productsLoading.value = false
  }
}

// 刷新商品
async function refreshProducts() {
  await getAIProducts()
  ElMessage.success('商品列表已刷新')
}

// 过滤商品
function filterProducts() {
  currentPage.value = 1
  getAIProducts()
}

// 处理排序变化
function handleSortChange() {
  currentPage.value = 1
  getAIProducts()
}

// 切换选择
function toggleSelect(productId) {
  const index = selectedProducts.value.indexOf(productId)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  } else {
    selectedProducts.value.push(productId)
  }
}

// 批量上架
async function batchApprove() {
  if (selectedProducts.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要上架选中的 ${selectedProducts.value.length} 个商品吗？`,
      '批量上架确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await productAPI.batchUpdateProducts(selectedProducts.value, { status: 'approved' })
    ElMessage.success(`成功上架 ${selectedProducts.value.length} 个商品`)
    selectedProducts.value = []
    await getAIProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量上架失败')
      console.error(error)
    }
  }
}

// 批量拒绝
async function batchReject() {
  if (selectedProducts.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要拒绝选中的 ${selectedProducts.value.length} 个商品吗？`,
      '批量拒绝确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await productAPI.batchUpdateProducts(selectedProducts.value, { status: 'rejected' })
    ElMessage.success(`成功拒绝 ${selectedProducts.value.length} 个商品`)
    selectedProducts.value = []
    await getAIProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量拒绝失败')
      console.error(error)
    }
  }
}

// 查看商品详情
function viewProduct(product) {
  router.push(`/product/${product.id}`)
}

// 编辑商品
function editProduct(product) {
  router.push(`/admin/products/edit/${product.id}`)
}

// 上架商品
async function approveProduct(product) {
  try {
    await productAPI.updateProduct(product.id, { status: 'approved' })
    ElMessage.success('商品已上架')
    await getAIProducts()
  } catch (error) {
    ElMessage.error('上架失败')
    console.error(error)
  }
}

// 拒绝商品
async function rejectProduct(product) {
  try {
    await ElMessageBox.confirm(
      '确定要拒绝这个商品吗？',
      '拒绝确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await productAPI.updateProduct(product.id, { status: 'rejected' })
    ElMessage.success('商品已拒绝')
    await getAIProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('拒绝失败')
      console.error(error)
    }
  }
}

// 获取状态名称
function getStatusName(status) {
  const statusMap = {
    'pending': '待审核',
    'approved': '已上架',
    'rejected': '已拒绝'
  }
  return statusMap[status] || status
}

// 获取状态颜色
function getStatusColor(status) {
  const colorMap = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return colorMap[status] || 'info'
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 分页处理
function handleSizeChange(val) {
  pageSize.value = val
  currentPage.value = 1
  getAIProducts()
}

function handleCurrentChange(val) {
  currentPage.value = val
  getAIProducts()
}

// 页面加载时获取数据
onMounted(() => {
  getAIProducts()
})
</script>

<style scoped>
.ai-products-review {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 10px;
}

.filter-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border: 2px solid transparent;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-card.selected {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.product-checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 4px;
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image .el-image {
  width: 100%;
  height: 100%;
}

.product-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.product-info {
  padding: 16px;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: #e1251b;
  margin-bottom: 8px;
}

.product-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.ai-recommendation {
  font-size: 12px;
  color: #666;
  background: #f0f9ff;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-details {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.product-details p {
  margin: 4px 0;
}

.product-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>

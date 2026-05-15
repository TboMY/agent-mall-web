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
        
        <!-- 商品名称搜索 -->
        <el-input v-model="productNameFilter" placeholder="搜索商品名称" @change="filterProducts" style="width: 150px; margin-right: 10px;" />
        
        <!-- 状态过滤 -->
        <el-select v-model="statusFilter" placeholder="选择状态" @change="filterProducts" style="width: 120px; margin-right: 10px;">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="0" />
          <el-option label="已上架" value="1" />
        </el-select>
        
        <!-- 排序 -->
        <el-select v-model="sortField" placeholder="排序方式" @change="handleSortChange" style="width: 150px; margin-right: 10px;">
          <el-option label="推荐时间" value="created_at" />
          <el-option label="热度评分" value="hot_score" />
        </el-select>
        
        <el-select v-model="sortOrder" placeholder="排序顺序" @change="handleSortChange" style="width: 100px; margin-right: 10px;">
          <el-option label="降序" value="desc" />
          <el-option label="升序" value="asc" />
        </el-select>
        
        <!-- <el-button @click="refreshProducts">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button> -->
      </div>
      
      <div class="filter-right">
        <el-button type="danger" @click="batchDelete" :disabled="selectedProducts.length === 0">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
    </div>

    <!-- AI推荐商品表格 -->
    <div class="table-container">
      <el-table
        :data="filteredProducts"
        v-loading="productsLoading"
        @selection-change="handleSelectionChange"
        stripe
        border
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <!-- 选择列 -->
        <el-table-column type="selection" width="55" align="center" />
        
        <!-- 视频封面 -->
        <el-table-column label="视频封面" width="120" align="center">
          <template #default="{ row }">
            <el-image
              :src="row.cover_url"
              :alt="row.product_name"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 4px; cursor: pointer;"
              @click="viewSourceVideo(row)"
            />
          </template>
        </el-table-column>
        
        <!-- 商品名称 -->
        <el-table-column label="商品名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="product-name-cell">
              <div class="name">{{ row.product_name }}</div>
              <div class="tags">
                <el-tag type="danger" size="small">AI推荐</el-tag>
                <el-tag v-if="row.source_keyword" size="small">{{ row.source_keyword }}</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <!-- 分类 -->
        <el-table-column label="分类" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ getCategoryName(row.product_category) }}</el-tag>
          </template>
        </el-table-column>
        
        <!-- 热度评分 -->
        <el-table-column label="热度评分" width="120" align="center" sortable="custom" prop="hot_score">
          <template #default="{ row }">
<!--            <el-rate-->
<!--              :model-value="row.hot_score / 20"-->
<!--              disabled-->
<!--              show-score-->
<!--              :max="5"-->
<!--              text-color="#ff9900"-->
<!--            />-->
            <div class="score-text">{{ row.hot_score }}</div>
          </template>
        </el-table-column>
        
        <!-- 状态 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- AI推荐理由 -->
        <el-table-column label="AI推荐理由" min-width="400">
          <template #default="{ row }">
            <div class="ai-reason-cell">
              {{ row.ai_reason }}
            </div>
          </template>
        </el-table-column>
        
        <!-- 推荐时间 -->
        <el-table-column label="推荐时间" width="160" align="center" sortable="custom" prop="created_at">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <!-- 操作 -->
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <!-- 待审核状态：显示编辑和删除按钮 -->
              <template v-if="row.status === 0">
                <el-button type="primary" size="small" @click="editProduct(row)">
                  <el-icon><Edit /></el-icon>
                  进入编辑
                </el-button>
                <el-button type="danger" size="small" @click="deleteCandidate(row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
              
              <!-- 已上架状态：显示查看商品详情按钮 -->
              <template v-else-if="row.status === 1">
                <el-button type="primary" size="small" @click="viewProduct(row)">
                  <el-icon><View /></el-icon>
                  查看商品
                </el-button>
              </template>
              

              
              <!-- 所有状态都显示跳转源视频按钮 -->
              <el-button type="primary" size="small" plain @click="viewSourceVideo(row)">
                <el-icon><VideoPlay /></el-icon>
                源视频
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 空状态 -->
    <div v-if="filteredProducts.length === 0 && !productsLoading" class="empty-state">
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
import { ref, reactive, computed, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { aiCandidateAPI, categoryAPI } from '@/services/api'

const router = useRouter()

// 注入父组件的刷新触发器
const refreshTrigger = inject('refreshTrigger')

// 响应式数据
const productsLoading = ref(false)
const aiProducts = ref([])
const selectedProducts = ref([])
const dateRange = ref([])
const productNameFilter = ref('')
const statusFilter = ref('')
const sortField = ref('created_at')
const sortOrder = ref('desc')
const currentPage = ref(1)
const pageSize = ref(20)
const totalProducts = ref(0)

// 分类数据
const categories = ref([])
const categoryMap = ref({})

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
  
  // 商品名称过滤
  if (productNameFilter.value) {
    filtered = filtered.filter(product => 
      product.product_name && product.product_name.includes(productNameFilter.value)
    )
  }
  
  // 状态过滤
  if (statusFilter.value !== '') {
    filtered = filtered.filter(product => 
      product.status === parseInt(statusFilter.value)
    )
  }
  
  // 排序
  if (sortField.value) {
    filtered.sort((a, b) => {
      let aVal = a[sortField.value]
      let bVal = b[sortField.value]
      
      // 处理日期排序
      if (sortField.value === 'created_at' || sortField.value === 'aweme_create_time') {
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

// 获取分类列表
async function getCategories() {
  try {
    const response = await categoryAPI.getCategories()
    if (response.success) {
      categories.value = response.data
      // 创建ID到名称的映射
      categoryMap.value = {}
      response.data.forEach(category => {
        categoryMap.value[category.id] = category.name
      })
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 根据ID获取分类名称
function getCategoryName(categoryId) {
  return categoryMap.value[categoryId] || `分类ID: ${categoryId}`
}

// 获取AI推荐商品
async function getAIProducts() {
  productsLoading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort_by: sortField.value,
      sort_order: sortOrder.value
    }
    if (productNameFilter.value) params.product_name = productNameFilter.value
    if (statusFilter.value !== '') params.status = statusFilter.value
    
    // 添加时间范围参数
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_time = dateRange.value[0]
      params.end_time = dateRange.value[1]
    }
    
    const response = await aiCandidateAPI.getCandidates(params)
    if (response.success) {
      aiProducts.value = response.data
      totalProducts.value = response.pagination.total

      // 如果当前页超过总页数，自动回退到最后一页并重新拉取，避免列表为空
      const totalPages = response.pagination.pages
      if (totalPages > 0 && currentPage.value > totalPages) {
        currentPage.value = totalPages
        const retryParams = { ...params, page: currentPage.value }
        const retryResp = await aiCandidateAPI.getCandidates(retryParams)
        if (retryResp.success) {
          aiProducts.value = retryResp.data
          totalProducts.value = retryResp.pagination.total
        }
      }
    } else {
      throw new Error(response.message || '获取数据失败')
    }
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

// 处理表格选择变化
function handleSelectionChange(selection) {
  selectedProducts.value = selection.map(item => item.id)
}

// 获取行类名
function getRowClassName({ row }) {
  if (row.status === 0) {
    return 'pending-row'
  } else if (row.status === 1) {
    return 'approved-row'
  } else if (row.status === 2) {
    return 'rejected-row'
  }
  return ''
}


// 批量拒绝
async function batchDelete() {
  if (selectedProducts.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedProducts.value.length} 条候选记录吗？`,
      '批量删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await Promise.all(selectedProducts.value.map(id => aiCandidateAPI.deleteCandidate(id)))
    ElMessage.success(`成功删除 ${selectedProducts.value.length} 条`) 
    selectedProducts.value = []
    await getAIProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error(error)
    }
  }
}

// 编辑商品（从AI推荐进入编辑）
function editProduct(product) {
  // 将AI推荐的数据作为查询参数传递到编辑页面
  const editData = {
    // AI推荐的基础数据
    ai_candidate_id: product.id,
    name: product.product_name,
    category: product.product_category,
    description: product.ai_reason,
    image: product.cover_url,
    heat_score: product.hot_score,
    source_platform: product.source_platform || 'douyin',
    source_url: product.source_url,
    download_url: product.download_url,
    source_keyword: product.source_keyword,
    // 标记这是从AI推荐进入的编辑
    from_ai_recommendation: true
  }
  
  // 将数据编码为URL参数
  const params = new URLSearchParams()
  Object.keys(editData).forEach(key => {
    if (editData[key] !== null && editData[key] !== undefined) {
      params.append(key, editData[key])
    }
  })
  
  // 跳转到商品编辑页面，传递AI推荐的数据
  router.push(`/admin/products/add?${params.toString()}`)
}

// 查看源视频
function viewSourceVideo(product) {
  if (product && product.source_url) {
    window.open(product.source_url, '_blank')
  } else {
    ElMessage.warning('源视频链接不存在')
  }
}

// 查看商品详情（仅已上架的商品）
function viewProduct(product) {
  if (product.status === 1 && product.linked_product_id) {
    router.push(`/product/${product.linked_product_id}`)
  } else {
    ElMessage.warning('该商品尚未上架，无法查看详情')
  }
}

// 重新审核商品
async function reApproveProduct(product) {
  try {
    await ElMessageBox.confirm(
      '确定要重新审核这个商品吗？',
      '重新审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await aiCandidateAPI.updateStatus(product.id, 0)
    if (response.success) {
      ElMessage.success(response.message || '商品已重新提交审核')
      await getAIProducts()
    } else {
      throw new Error(response.message || '重新审核失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重新审核失败')
      console.error(error)
    }
  }
}

// 上架商品
async function approveProduct(product) {
  try {
    const response = await aiCandidateAPI.updateStatus(product.id, 1)
    if (response.success) {
      ElMessage.success(response.message || '商品已上架')
      await getAIProducts()
    } else {
      throw new Error(response.message || '上架失败')
    }
  } catch (error) {
    ElMessage.error('上架失败')
    console.error(error)
  }
}

// 拒绝商品
async function deleteCandidate(product) {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个候选记录吗？',
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const response = await aiCandidateAPI.deleteCandidate(product.id)
    if (response.success) {
      ElMessage.success('删除成功')
      await getAIProducts()
    } else {
      throw new Error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 获取状态名称
function getStatusName(status) {
  const statusMap = {
    0: '待审核',
    1: '已上架',
    2: '已拒绝'
  }
  return statusMap[status] || status
}

// 获取状态颜色
function getStatusColor(status) {
  const colorMap = {
    0: 'warning',
    1: 'success',
    2: 'danger'
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

// 监听父组件的刷新触发器
watch(refreshTrigger, () => {
  if (refreshTrigger.value > 0) {
    getAIProducts()
  }
})

// 页面加载时获取数据
onMounted(async () => {
  await getCategories()
  await getAIProducts()
})
</script>

<style scoped>
.ai-products-review {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 20px;
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

.table-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

/* 表格行样式 */
:deep(.el-table .pending-row) {
  background-color: #fef7e6;
}

:deep(.el-table .approved-row) {
  background-color: #f0f9ff;
}

:deep(.el-table .rejected-row) {
  background-color: #fef0f0;
}

/* 商品名称单元格 */
.product-name-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name-cell .name {
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
}

.product-name-cell .tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* AI推荐理由单元格 */
.ai-reason-cell {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 热度评分 */
.score-text {
  font-size: 12px;
  color: #ff9900;
  font-weight: 500;
  margin-top: 4px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-buttons .el-button {
  margin: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-products-review {
    padding: 10px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-left {
    justify-content: center;
  }
  
  .filter-right {
    justify-content: center;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}

/* 表格滚动条样式 */
:deep(.el-table__body-wrapper) {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 3px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 3px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb:hover) {
  background: #a8a8a8;
}
</style>

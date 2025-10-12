<template>
  <div class="product-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>商品管理</h2>
      <el-button type="primary" @click="goToAdd">
        <el-icon><Plus /></el-icon>
        添加商品
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.search"
            placeholder="请输入商品名称或描述"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="分类">
          <el-select
            v-model="searchForm.category_id"
            placeholder="选择分类"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="品牌">
          <el-select
            v-model="searchForm.brand_id"
            placeholder="选择品牌"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="brand in brands"
              :key="brand.id"
              :label="brand.name"
              :value="brand.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="AI推荐">
          <el-select
            v-model="searchForm.is_ai_recommended"
            placeholder="AI推荐"
            clearable
            style="width: 120px"
          >
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商品列表 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="table-title">
          <span>商品列表</span>
          <el-tag v-if="selectedProducts.length > 0" type="info">
            已选择 {{ selectedProducts.length }} 项
          </el-tag>
        </div>
        
        <div class="table-actions" v-if="selectedProducts.length > 0">
          <el-button type="danger" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
          <el-button @click="handleBatchStatus(1)">
            <el-icon><Check /></el-icon>
            批量上架
          </el-button>
          <el-button @click="handleBatchStatus(0)">
            <el-icon><Close /></el-icon>
            批量下架
          </el-button>
        </div>
      </div>

      <el-table
        :data="products"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        row-key="id"
        stripe
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="product-info">
              <el-image
                :src="row.image"
                :alt="row.name"
                class="product-image"
                fit="cover"
                :preview-src-list="[row.image]"
              />
              <div class="product-details">
                <div class="product-name">{{ row.name }}</div>
                <div class="product-meta">
                  <el-tag v-if="row.is_ai_recommended" type="danger" size="small">AI推荐</el-tag>
                  <el-tag v-if="row.source_platform" size="small">{{ row.source_platform }}</el-tag>
                  <el-tag v-if="row.tags" v-for="tag in JSON.parse(row.tags || '[]')" :key="tag" size="small">{{ tag }}</el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="价格" width="120" align="center">
          <template #default="{ row }">
            <div class="price-info">
              <div class="current-price">¥{{ row.price }}</div>
              <div v-if="row.original_price" class="original-price">¥{{ row.original_price }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="库存" width="100" align="center">
          <template #default="{ row }">
            <div class="stock-input-wrapper">
              <el-input-number
                v-model="row.stock"
                :min="0"
                size="small"
                @change="handleStockChange(row)"
              />
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="销量" width="80" prop="sales_count" align="center" />
        
        <el-table-column label="热度" width="80" prop="heat_score" align="center" />
        
        <el-table-column label="分类" width="100" align="center">
          <template #default="{ row }">
            {{ row.category_name || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="品牌" width="100" align="center">
          <template #default="{ row }">
            {{ row.brand_name || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <div class="status-wrapper">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(row)"
              />
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" width="160" align="center">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goToEdit(row.id)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productAPI, categoryAPI, brandAPI } from '@/services/api'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const products = ref([])
const categories = ref([])
const brands = ref([])
const selectedProducts = ref([])

// 搜索表单
const searchForm = reactive({
  search: '',
  category_id: null,
  brand_id: null,
  status: null,
  is_ai_recommended: null
})

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 获取商品列表
async function getProducts() {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }
    
    const response = await productAPI.getProducts(params)
    products.value = response.data
    pagination.total = response.pagination.total
  } catch (error) {
    ElMessage.error('获取商品列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 获取分类列表
async function getCategories() {
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 获取品牌列表
async function getBrands() {
  try {
    const response = await brandAPI.getBrands()
    brands.value = response.data
  } catch (error) {
    console.error('获取品牌列表失败:', error)
  }
}

// 搜索
function handleSearch() {
  pagination.page = 1
  getProducts()
}

// 重置搜索
function handleReset() {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = key === 'search' ? '' : null
  })
  pagination.page = 1
  getProducts()
}

// 选择变化
function handleSelectionChange(selection) {
  selectedProducts.value = selection
}

// 批量删除
async function handleBatchDelete() {
  if (selectedProducts.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedProducts.value.length} 个商品吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedProducts.value.map(item => item.id)
    await productAPI.batchDeleteProducts(ids)
    ElMessage.success('删除成功')
    getProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量更新状态
async function handleBatchStatus(status) {
  if (selectedProducts.value.length === 0) return
  
  try {
    const promises = selectedProducts.value.map(item => 
      productAPI.updateProductStatus(item.id, status)
    )
    await Promise.all(promises)
    ElMessage.success('状态更新成功')
    getProducts()
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

// 更新库存
async function handleStockChange(row) {
  try {
    await productAPI.updateProductStock(row.id, row.stock)
    ElMessage.success('库存更新成功')
  } catch (error) {
    ElMessage.error('库存更新失败')
    getProducts() // 重新获取数据
  }
}

// 更新状态
async function handleStatusChange(row) {
  try {
    await productAPI.updateProductStatus(row.id, row.status)
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    getProducts() // 重新获取数据
  }
}

// 删除商品
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${row.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await productAPI.deleteProduct(row.id)
    ElMessage.success('删除成功')
    getProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 跳转到添加页面
function goToAdd() {
  router.push('/admin/products/add')
}

// 跳转到编辑页面
function goToEdit(id) {
  router.push(`/admin/products/edit/${id}`)
}

// 分页变化
function handleSizeChange(size) {
  pagination.limit = size
  pagination.page = 1
  getProducts()
}

function handleCurrentChange(page) {
  pagination.page = page
  getProducts()
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 页面加载时获取数据
onMounted(() => {
  getProducts()
  getCategories()
  getBrands()
})
</script>

<style scoped>
.product-list {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1.4;
}

.product-meta {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.price-info {
  text-align: center;
}

.current-price {
  font-size: 16px;
  font-weight: 600;
  color: #e1251b;
}

.original-price {
  font-size: 12px;
  color: #909399;
  text-decoration: line-through;
}

.stock-input-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-table .cell) {
  padding: 8px 0;
}

:deep(.el-input-number) {
  width: 80px;
}

:deep(.el-table .el-table__cell) {
  text-align: center;
}

:deep(.el-table .el-table__header .el-table__cell) {
  text-align: center;
}
</style>

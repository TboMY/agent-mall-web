<template>
  <div class="product-type-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品类型管理</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加类型
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchForm.search"
          placeholder="搜索类型名称或描述"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="searchForm.status"
          placeholder="状态"
          style="width: 120px; margin-left: 10px"
          clearable
        >
          <el-option label="全部" :value="null" />
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        row-key="id"
      >
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="类型名称" min-width="150" />
        <el-table-column prop="attribute_count" label="属性数量" width="100" align="center" />
        <el-table-column prop="parameter_count" label="参数数量" width="100" align="center">
          <template #default="{ row }">
            {{ row.attribute_count || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="设置" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewAttributes(row)">
              属性列表
            </el-button>
            <el-button type="info" size="small" @click="handleViewParameters(row)">
              参数列表
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除这个商品类型吗？"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingItem ? '编辑商品类型' : '添加商品类型'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入类型描述"
          />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标（如：📱）" />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 属性管理对话框 -->
    <el-dialog
      v-model="showAttributesDialog"
      title="属性管理"
      width="80%"
      top="5vh"
    >
      <ProductAttributeManager
        v-if="showAttributesDialog"
        :product-type-id="currentProductTypeId"
        @close="showAttributesDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import ProductAttributeManager from './ProductAttributeManager.vue'
import { productTypeAPI } from '@/services/api'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const showAddDialog = ref(false)
const showAttributesDialog = ref(false)
const editingItem = ref(null)
const currentProductTypeId = ref(null)
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  search: '',
  status: null
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 表单数据
const form = reactive({
  name: '',
  description: '',
  icon: '',
  sort_order: 0,
  status: 1
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ]
}

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchForm.search,
      status: searchForm.status
    }
    const response = await productTypeAPI.getList(params)
    tableData.value = response.data
    pagination.total = response.pagination?.total || response.data.length
  } catch (error) {
    ElMessage.error('获取数据失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  searchForm.search = ''
  searchForm.status = null
  pagination.page = 1
  fetchData()
}

// 分页变化
const handleSizeChange = (val) => {
  pagination.limit = val
  pagination.page = 1
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  fetchData()
}

// 编辑
const handleEdit = (row) => {
  editingItem.value = row
  Object.assign(form, {
    name: row.name,
    description: row.description || '',
    icon: row.icon || '',
    sort_order: row.sort_order || 0,
    status: row.status
  })
  showAddDialog.value = true
}

// 查看属性
const handleViewAttributes = (row) => {
  currentProductTypeId.value = row.id
  showAttributesDialog.value = true
}

// 查看参数
const handleViewParameters = (row) => {
  // 参数列表与属性列表相同，这里可以复用
  currentProductTypeId.value = row.id
  showAttributesDialog.value = true
}

// 删除
const handleDelete = async (id) => {
  try {
    await productTypeAPI.delete(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    ElMessage.error('删除失败：' + error.message)
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    if (editingItem.value) {
      await productTypeAPI.update(editingItem.value.id, form)
      ElMessage.success('更新成功')
    } else {
      await productTypeAPI.create(form)
      ElMessage.success('创建成功')
    }
    
    showAddDialog.value = false
    resetForm()
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败：' + error.message)
  }
}

// 重置表单
const resetForm = () => {
  editingItem.value = null
  Object.assign(form, {
    name: '',
    description: '',
    icon: '',
    sort_order: 0,
    status: 1
  })
  formRef.value?.resetFields()
}

// 监听对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 组件挂载
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.product-type-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.type-icon {
  font-size: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>

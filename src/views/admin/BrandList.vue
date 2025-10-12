<template>
  <div class="brand-management">
    <div class="page-header">
      <h1>品牌管理</h1>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        新增品牌
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索品牌名称"
        style="width: 300px"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 品牌列表 -->
    <div class="table-container">
      <el-table
        :data="filteredBrands"
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无品牌数据"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="品牌Logo" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.logo"
              :src="row.logo"
              style="width: 50px; height: 50px"
              fit="cover"
              :preview-src-list="[row.logo]"
            />
            <span v-else class="no-logo">无Logo</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="品牌名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="官网" width="200">
          <template #default="{ row }">
            <el-link
              v-if="row.website"
              :href="row.website"
              target="_blank"
              type="primary"
            >
              {{ row.website }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editBrand(row)">编辑</el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteBrand(row)"
              :disabled="row.product_count > 0"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑品牌对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑品牌' : '新增品牌'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="品牌Logo" prop="logo">
          <el-input v-model="form.logo" placeholder="请输入Logo URL" />
        </el-form-item>
        <el-form-item label="品牌描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入品牌描述"
          />
        </el-form-item>
        <el-form-item label="官网地址" prop="website">
          <el-input v-model="form.website" placeholder="请输入官网地址" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { brandAPI } from '@/services/api'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const searchKeyword = ref('')
const brands = ref([])
const formRef = ref()

// 表单数据
const form = reactive({
  id: null,
  name: '',
  logo: '',
  description: '',
  website: '',
  status: 1
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入品牌名称', trigger: 'blur' },
    { min: 1, max: 100, message: '品牌名称长度在1到100个字符', trigger: 'blur' }
  ],
  logo: [
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ],
  website: [
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ]
}

// 计算属性
const filteredBrands = computed(() => {
  if (!searchKeyword.value) return brands.value
  return brands.value.filter(brand => 
    brand.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 方法
const loadBrands = async () => {
  loading.value = true
  try {
    const response = await brandAPI.getBrands()
    if (response.success) {
      brands.value = response.data
    } else {
      ElMessage.error(response.message || '获取品牌列表失败')
    }
  } catch (error) {
    console.error('获取品牌列表失败:', error)
    ElMessage.error('获取品牌列表失败')
  } finally {
    loading.value = false
  }
}

const showCreateDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

const editBrand = (brand) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(form, brand)
}

const deleteBrand = async (brand) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除品牌"${brand.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await brandAPI.deleteBrand(brand.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadBrands()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除品牌失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true

    const formData = { ...form }
    delete formData.id // 移除ID字段

    let response
    if (isEdit.value) {
      response = await brandAPI.updateBrand(form.id, formData)
    } else {
      response = await brandAPI.createBrand(formData)
    }

    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadBrands()
    } else {
      ElMessage.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交表单失败:', error)
      ElMessage.error(error.response?.data?.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    id: null,
    name: '',
    logo: '',
    description: '',
    website: '',
    status: 1
  })
}

const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

// 生命周期
onMounted(() => {
  loadBrands()
})
</script>

<style scoped>
.brand-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: #303133;
}

.search-bar {
  margin-bottom: 20px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.no-logo {
  color: #909399;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

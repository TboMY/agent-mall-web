<template>
  <div class="category-management">
    <div class="page-header">
      <h1>分类管理</h1>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索分类名称"
        style="width: 300px"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 分类列表 -->
    <div class="table-container">
      <el-table
        :data="filteredCategories"
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无分类数据"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="分类名称" width="200">
          <template #default="{ row }">
            <div class="category-name">
              <el-image
                v-if="row.icon"
                :src="row.icon"
                style="width: 20px; height: 20px; margin-right: 8px"
                fit="cover"
              />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="层级" width="80">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
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
            <el-button size="small" @click="editCategory(row)">编辑</el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteCategory(row)"
              :disabled="row.children && row.children.length > 0"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类" prop="parent_id">
          <el-select v-model="form.parent_id" placeholder="请选择父分类" style="width: 100%">
            <el-option label="顶级分类" :value="0" />
            <el-option
              v-for="category in parentCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类层级" prop="level">
          <el-input-number
            v-model="form.level"
            :min="1"
            :max="3"
            :disabled="form.parent_id > 0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number
            v-model="form.sort_order"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标URL" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { categoryAPI } from '@/services/api'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const searchKeyword = ref('')
const categories = ref([])
const formRef = ref()

// 表单数据
const form = reactive({
  id: null,
  name: '',
  parent_id: 0,
  level: 1,
  sort_order: 0,
  icon: '',
  description: '',
  status: 1
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 100, message: '分类名称长度在1到100个字符', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择分类层级', trigger: 'blur' }
  ],
  icon: [
    { type: 'url', message: '请输入有效的URL', trigger: 'blur' }
  ]
}

// 计算属性
const filteredCategories = computed(() => {
  if (!searchKeyword.value) return categories.value
  return filterCategoriesByKeyword(categories.value, searchKeyword.value)
})

const parentCategories = computed(() => {
  return categories.value.filter(cat => cat.level < 3)
})

// 方法
const loadCategories = async () => {
  loading.value = true
  try {
    const response = await categoryAPI.getCategoryTree()
    if (response.success) {
      categories.value = response.data
    } else {
      ElMessage.error(response.message || '获取分类列表失败')
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const filterCategoriesByKeyword = (categories, keyword) => {
  const result = []
  for (const category of categories) {
    if (category.name.toLowerCase().includes(keyword.toLowerCase())) {
      result.push(category)
    }
    if (category.children && category.children.length > 0) {
      const filteredChildren = filterCategoriesByKeyword(category.children, keyword)
      if (filteredChildren.length > 0) {
        result.push(...filteredChildren)
      }
    }
  }
  return result
}

const showCreateDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

const editCategory = (category) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(form, category)
}

const deleteCategory = async (category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${category.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await categoryAPI.deleteCategory(category.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadCategories()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
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

    // 如果选择了父分类，自动计算层级
    if (formData.parent_id > 0) {
      const parentCategory = categories.value.find(cat => cat.id === formData.parent_id)
      if (parentCategory) {
        formData.level = parentCategory.level + 1
      }
    }

    let response
    if (isEdit.value) {
      response = await categoryAPI.updateCategory(form.id, formData)
    } else {
      response = await categoryAPI.createCategory(formData)
    }

    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadCategories()
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
    parent_id: 0,
    level: 1,
    sort_order: 0,
    icon: '',
    description: '',
    status: 1
  })
}

const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const getLevelTagType = (level) => {
  const types = { 1: 'primary', 2: 'success', 3: 'warning' }
  return types[level] || 'info'
}

const getLevelText = (level) => {
  const texts = { 1: '一级', 2: '二级', 3: '三级' }
  return texts[level] || '未知'
}

// 监听父分类变化，自动计算层级
watch(() => form.parent_id, (newParentId) => {
  if (newParentId === 0) {
    form.level = 1
  } else {
    const parentCategory = categories.value.find(cat => cat.id === newParentId)
    if (parentCategory) {
      form.level = parentCategory.level + 1
    }
  }
})

// 生命周期
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-management {
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

.category-name {
  display: flex;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

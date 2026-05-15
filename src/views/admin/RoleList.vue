<template>
  <div class="role-management">
    <div class="page-header">
      <h2>角色列表</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新增角色
      </el-button>
    </div>

    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.search"
            placeholder="角色编码 / 名称 / 描述"
            clearable
            style="width: 260px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable placeholder="全部状态" style="width: 140px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="roles" v-loading="loading" stripe>
        <el-table-column prop="code" label="角色编码" width="160" />
        <el-table-column prop="name" label="角色名称" width="160" />
        <el-table-column prop="description" label="描述" min-width="220">
          <template #default="{ row }">{{ row.description || '-' }}</template>
        </el-table-column>
        <el-table-column label="权限数" width="100" align="center">
          <template #default="{ row }">{{ row.permissions?.length || 0 }}</template>
        </el-table-column>
        <el-table-column label="系统内置" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_system ? 'warning' : 'info'">{{ row.is_system ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="权限标签" min-width="260">
          <template #default="{ row }">
            <div class="permission-tags">
              <el-tag v-for="item in row.permission_labels" :key="item.code" size="small">{{ item.label }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" :disabled="row.is_system" @click="deleteRole(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="loadRoles"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="760px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" :disabled="isEdit" placeholder="如 order_manager" />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-checkbox-group v-model="form.permissions" class="permission-grid">
            <el-checkbox v-for="permission in permissionCatalog" :key="permission.code" :label="permission.code">
              {{ permission.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { roleAPI } from '@/services/api'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const roles = ref([])
const permissionCatalog = ref([])

const searchForm = reactive({
  search: '',
  status: null
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const form = reactive({
  id: null,
  code: '',
  name: '',
  description: '',
  status: 1,
  permissions: []
})

const rules = {
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '角色编码只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  permissions: [
    { type: 'array', required: true, min: 1, message: '请至少选择一个权限', trigger: 'change' }
  ]
}

async function loadCatalog() {
  const response = await roleAPI.getPermissionCatalog()
  permissionCatalog.value = response.data || []
}

async function loadRoles() {
  loading.value = true
  try {
    const response = await roleAPI.getRoles({
      page: pagination.page,
      limit: pagination.limit,
      search: searchForm.search || undefined,
      status: searchForm.status
    })
    roles.value = response.data
    pagination.total = response.pagination.total
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取角色列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadRoles()
}

function handleReset() {
  searchForm.search = ''
  searchForm.status = null
  pagination.page = 1
  loadRoles()
}

function handlePageSizeChange(size) {
  pagination.limit = size
  pagination.page = 1
  loadRoles()
}

function openCreateDialog() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description || '',
    status: row.status,
    permissions: [...(row.permissions || [])]
  })
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitting.value = true
    const payload = {
      code: form.code,
      name: form.name,
      description: form.description || null,
      status: form.status,
      permissions: form.permissions
    }

    if (isEdit.value) {
      await roleAPI.updateRole(form.id, {
        name: payload.name,
        description: payload.description,
        status: payload.status,
        permissions: payload.permissions
      })
      ElMessage.success('角色更新成功')
    } else {
      await roleAPI.createRole(payload)
      ElMessage.success('角色创建成功')
    }

    dialogVisible.value = false
    loadRoles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || (isEdit.value ? '更新角色失败' : '创建角色失败'))
    }
  } finally {
    submitting.value = false
  }
}

async function deleteRole(row) {
  try {
    await ElMessageBox.confirm(`确定删除角色“${row.name}”吗？`, '确认删除', {
      type: 'warning'
    })
    await roleAPI.deleteRole(row.id)
    ElMessage.success('删除成功')
    loadRoles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除角色失败')
    }
  }
}

function resetForm() {
  formRef.value?.clearValidate()
  Object.assign(form, {
    id: null,
    code: '',
    name: '',
    description: '',
    status: 1,
    permissions: []
  })
}

onMounted(async () => {
  await loadCatalog()
  await loadRoles()
})
</script>

<style scoped>
.role-management {
  background-color: #f5f7fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>

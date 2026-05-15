<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新增账号
      </el-button>
    </div>

    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.search"
            placeholder="用户名 / 邮箱 / 手机号"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="全部角色" clearable style="width: 160px">
            <el-option
              v-for="role in roles"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 140px">
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
      <el-table :data="users" v-loading="loading" row-key="id" stripe>
        <el-table-column prop="username" label="用户名" min-width="160" />
        <el-table-column prop="role_label" label="角色" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="200">
          <template #default="{ row }">{{ row.email || '-' }}</template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="150">
          <template #default="{ row }">{{ row.phone || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status"
              :active-value="1"
              :inactive-value="0"
              :disabled="row.id === auth.user?.id"
              @change="updateStatus(row, $event)"
            />
          </template>
        </el-table-column>
        <el-table-column label="最后登录" width="180">
          <template #default="{ row }">{{ formatDate(row.last_login_at) }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="openPasswordDialog(row)">重置密码</el-button>
            <el-button
              size="small"
              type="danger"
              :disabled="row.id === auth.user?.id"
              @click="deleteUser(row)"
            >
              删除
            </el-button>
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
          @current-change="loadUsers"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑管理员' : '新增管理员'"
      width="560px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="初始密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="至少6位" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="可选" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="可选" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option
              v-for="role in roles"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="passwordDialogVisible"
      title="重置密码"
      width="420px"
      @close="resetPasswordForm"
    >
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="90px">
        <el-form-item label="用户名">
          <el-input :model-value="passwordTarget?.username || ''" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="passwordForm.password" type="password" show-password placeholder="至少6位" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordSubmitting" @click="submitPasswordReset">
          确认重置
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminUserAPI, authAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const passwordSubmitting = ref(false)
const dialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const passwordFormRef = ref()
const users = ref([])
const roles = ref([])
const passwordTarget = ref(null)

const searchForm = reactive({
  search: '',
  role: '',
  status: null
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const form = reactive({
  id: null,
  username: '',
  password: '',
  email: '',
  phone: '',
  role: 'operator',
  status: 1
})

const passwordForm = reactive({
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度需在 3 到 50 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度需在 6 到 50 个字符之间', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const passwordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度需在 6 到 50 个字符之间', trigger: 'blur' }
  ]
}

async function loadRoles() {
  const response = await authAPI.getRoles()
  roles.value = response.data
}

async function loadUsers() {
  loading.value = true
  try {
    const response = await adminUserAPI.getUsers({
      page: pagination.page,
      limit: pagination.limit,
      search: searchForm.search || undefined,
      role: searchForm.role || undefined,
      status: searchForm.status
    })
    users.value = response.data
    pagination.total = response.pagination.total
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取管理员列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadUsers()
}

function handleReset() {
  searchForm.search = ''
  searchForm.role = ''
  searchForm.status = null
  pagination.page = 1
  loadUsers()
}

function handlePageSizeChange(size) {
  pagination.limit = size
  pagination.page = 1
  loadUsers()
}

function openCreateDialog() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  resetForm()
  Object.assign(form, {
    id: row.id,
    username: row.username,
    password: '',
    email: row.email || '',
    phone: row.phone || '',
    role: row.role,
    status: row.status
  })
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true
    const payload = {
      username: form.username,
      email: form.email || null,
      phone: form.phone || null,
      role: form.role,
      status: form.status
    }

    if (isEdit.value) {
      await adminUserAPI.updateUser(form.id, payload)
      ElMessage.success('管理员更新成功')
    } else {
      await adminUserAPI.createUser({ ...payload, password: form.password })
      ElMessage.success('管理员创建成功')
    }

    dialogVisible.value = false
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } finally {
    submitting.value = false
  }
}

async function updateStatus(row, status) {
  try {
    await adminUserAPI.updateUserStatus(row.id, status)
    row.status = status
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error(error.response?.data?.message || '状态更新失败')
    loadUsers()
  }
}

function openPasswordDialog(row) {
  passwordTarget.value = row
  resetPasswordForm()
  passwordDialogVisible.value = true
}

async function submitPasswordReset() {
  if (!passwordFormRef.value || !passwordTarget.value) return

  try {
    await passwordFormRef.value.validate()
    passwordSubmitting.value = true
    await adminUserAPI.resetPassword(passwordTarget.value.id, passwordForm.password)
    ElMessage.success('密码重置成功')
    passwordDialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '密码重置失败')
  } finally {
    passwordSubmitting.value = false
  }
}

async function deleteUser(row) {
  try {
    await ElMessageBox.confirm(`确定要删除管理员“${row.username}”吗？`, '确认删除', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await adminUserAPI.deleteUser(row.id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

function resetForm() {
  formRef.value?.clearValidate()
  Object.assign(form, {
    id: null,
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'operator',
    status: 1
  })
}

function resetPasswordForm() {
  passwordFormRef.value?.clearValidate()
  passwordForm.password = ''
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN')
}

onMounted(async () => {
  await loadRoles()
  await loadUsers()
})
</script>

<style scoped>
.user-management {
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

.search-card {
  margin-bottom: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>

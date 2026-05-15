<template>
  <div class="system-settings">
    <div class="page-header">
      <div>
        <h2>系统设置</h2>
        <p>这里管理的是整个后台的配置中心，不等于 AI 工作台设置。</p>
      </div>
      <div class="header-actions">
        <el-button @click="loadConfigs">刷新</el-button>
        <el-button type="primary" @click="openCreateDialog">新增配置</el-button>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="8">
        <el-card class="overview-card">
          <template #header>系统总览</template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="后台账号模型">`admin_users`</el-descriptions-item>
            <el-descriptions-item label="商城用户模型">`users`</el-descriptions-item>
            <el-descriptions-item label="订单模型">`orders / order_items`</el-descriptions-item>
            <el-descriptions-item label="AI 工作台设置位置">“AI 选品工作台 / 设置”</el-descriptions-item>
            <el-descriptions-item label="系统配置表">`system_configs`</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card class="overview-card">
          <template #header>角色说明</template>
          <el-alert type="info" :closable="false" show-icon>
            系统设置页负责全局配置中心、权限说明与配置维护；AI 工作台设置只负责热词、爬取、分析和定时任务。
          </el-alert>
          <div class="role-list">
            <el-tag>super_admin：全量后台权限</el-tag>
            <el-tag type="success">admin：商城与工作台管理</el-tag>
            <el-tag type="warning">operator：审核、查看、执行任务</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>配置中心</span>
          <el-tag type="info">{{ groupedConfigs.length }} 个配置分组</el-tag>
        </div>
      </template>

      <el-empty v-if="groupedConfigs.length === 0" description="暂无系统配置" />

      <el-collapse v-else>
        <el-collapse-item
          v-for="group in groupedConfigs"
          :key="group.groupName"
          :name="group.groupName"
          :title="`${group.groupName}（${group.items.length}）`"
        >
          <el-table :data="group.items" stripe>
            <el-table-column prop="config_key" label="配置键" min-width="220" />
            <el-table-column prop="config_type" label="类型" width="100" />
            <el-table-column prop="description" label="描述" min-width="180">
              <template #default="{ row }">{{ row.description || '-' }}</template>
            </el-table-column>
            <el-table-column label="当前值" min-width="240">
              <template #default="{ row }">
                <div class="config-value">{{ row.config_value }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteConfig(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑配置' : '新增配置'" width="600px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="配置键" prop="key">
          <el-input v-model="form.key" :disabled="isEdit" placeholder="如 hotlist_refresh_cooldown_sec" />
        </el-form-item>
        <el-form-item label="配置值" prop="value">
          <el-input v-model="form.value" type="textarea" :rows="4" placeholder="请输入配置值" />
        </el-form-item>
        <el-form-item label="配置类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="布尔值" value="boolean" />
            <el-option label="JSON" value="json" />
          </el-select>
        </el-form-item>
        <el-form-item label="分组" prop="group">
          <el-input v-model="form.group" placeholder="如 general / ai_workbench / security" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入配置说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">{{ isEdit ? '保存' : '创建' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { systemConfigAPI } from '@/services/api'

const loading = ref(false)
const configs = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = reactive({
  key: '',
  value: '',
  type: 'string',
  group: 'general',
  description: ''
})

const rules = {
  key: [{ required: true, message: '请输入配置键', trigger: 'blur' }],
  value: [{ required: true, message: '请输入配置值', trigger: 'blur' }],
  type: [{ required: true, message: '请选择配置类型', trigger: 'change' }],
  group: [{ required: true, message: '请输入配置分组', trigger: 'blur' }]
}

const groupedConfigs = computed(() => {
  const groups = new Map()
  for (const item of configs.value) {
    const groupName = item.group_name || 'general'
    if (!groups.has(groupName)) {
      groups.set(groupName, [])
    }
    groups.get(groupName).push(item)
  }
  return Array.from(groups.entries()).map(([groupName, items]) => ({ groupName, items }))
})

async function loadConfigs() {
  loading.value = true
  try {
    const response = await systemConfigAPI.getAllConfigs()
    configs.value = response.data || []
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取系统配置失败')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  Object.assign(form, {
    key: row.config_key,
    value: row.config_value,
    type: row.config_type,
    group: row.group_name,
    description: row.description || ''
  })
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitting.value = true
    await systemConfigAPI.setConfig(form.key, form.value, form.type, form.description, form.group)
    ElMessage.success(isEdit.value ? '配置更新成功' : '配置创建成功')
    dialogVisible.value = false
    loadConfigs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '保存配置失败')
    }
  } finally {
    submitting.value = false
  }
}

async function deleteConfig(row) {
  try {
    await ElMessageBox.confirm(`确定删除配置“${row.config_key}”吗？`, '确认删除', {
      type: 'warning'
    })
    await systemConfigAPI.deleteConfig(row.config_key)
    ElMessage.success('删除成功')
    loadConfigs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除配置失败')
    }
  }
}

function resetForm() {
  formRef.value?.clearValidate()
  Object.assign(form, {
    key: '',
    value: '',
    type: 'string',
    group: 'general',
    description: ''
  })
}

onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.system-settings {
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
  margin: 0 0 6px;
}

.page-header p {
  margin: 0;
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.overview-card,
.role-list {
  margin-top: 0;
}

.role-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-value {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

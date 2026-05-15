<template>
  <div class="ai-workbench-settings">
    <!-- 触发与AI模型设置（合并） -->
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>触发与AI模型设置</span>
          <el-tag type="info">配置AI选品触发方式与AI模型参数</el-tag>
        </div>
      </template>
      
      <el-form :model="settingsForm" label-width="150px" class="settings-form">
        <!-- 定时任务设置 -->
        <el-divider content-position="left">定时任务设置</el-divider>
        
        <el-form-item label="启用定时任务">
          <el-switch 
            v-model="settingsForm.scheduledTask.enabled"
            @change="handleScheduledTaskChange"
          />
          <span class="form-tip">如每天24点自动触发AI选品</span>
        </el-form-item>
        
        <el-form-item label="推送商品数量" v-if="settingsForm.scheduledTask.enabled">
          <el-input-number 
            v-model="settingsForm.scheduledTask.productCount"
            :min="1"
            :max="200"
            :step="5"
            controls-position="right"
          />
          <span class="form-tip">定时任务每次推送的商品数量（建议10-20个）</span>
        </el-form-item>
        
        <el-form-item label="执行时间" v-if="settingsForm.scheduledTask.enabled">
          <el-time-picker
            v-model="settingsForm.scheduledTask.executionTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择执行时间"
          />
          <span class="form-tip">定时任务的执行时间</span>
        </el-form-item>
        
        <el-form-item label="数据爬取范围" v-if="settingsForm.scheduledTask.enabled">
          <el-checkbox-group v-model="settingsForm.scheduledTask.platforms">
            <el-checkbox label="bilibili">B站</el-checkbox>
            <el-checkbox label="douyin">抖音</el-checkbox>
          </el-checkbox-group>
          <span class="form-tip">定时任务爬取数据的平台范围</span>
        </el-form-item>
        
        <!-- 手动触发设置 -->
        <el-divider content-position="left">手动触发设置</el-divider>
        
        <el-form-item label="推送商品数量">
          <el-input-number 
            v-model="settingsForm.manualTrigger.productCount"
            :min="1"
            :max="50"
            :step="1"
            controls-position="right"
          />
          <span class="form-tip">手动触发每次推送的商品数量（建议5-10个）</span>
        </el-form-item>
        
        <el-form-item label="数据来源">
          <el-checkbox-group v-model="settingsForm.manualTrigger.platforms">
            <el-checkbox label="bilibili">B站</el-checkbox>
            <el-checkbox label="douyin">抖音</el-checkbox>
          </el-checkbox-group>
          <span class="form-tip">手动触发时的数据来源平台</span>
        </el-form-item>

        <!-- AI模型设置（合并到同一表单） -->
        <el-divider content-position="left">AI模型设置</el-divider>

        <el-form-item label="推荐阈值">
          <el-slider
            v-model="settingsForm.aiModel.recommendationThreshold"
            :min="30"
            :max="100"
            :step="5"
            show-input
            :format-tooltip="(val) => `${val}%`"
          />
          <span class="form-tip">AI推荐的最低置信度阈值（不低于30%）</span>
        </el-form-item>
        
        <el-form-item label="推荐策略">
          <el-select v-model="settingsForm.aiModel.recommendationStrategy" placeholder="选择推荐策略" style="width: 100%;">
            <el-option label="🔥 爆款优先：高点赞、高转发" value="viral_priority" />
            <el-option label="💬 深度互动优先：高评论、高收藏" value="engagement_priority" />
            <el-option label="⏱️ 新鲜度优先：新发布优先" value="freshness_priority" />
          </el-select>
          <span class="form-tip">选择AI推荐的策略模式</span>
        </el-form-item>
        
        <!-- 保存按钮 -->
        <el-form-item>
          <el-button type="primary" @click="saveSettings" :loading="saving">
            <el-icon><Check /></el-icon>
            保存设置
          </el-button>
        </el-form-item>
        
      </el-form>
    </el-card>



    <!-- 执行日志 -->
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>执行日志</span>
          <el-button size="small" @click="refreshLogs">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table :data="executionLogs" v-loading="logsLoading" stripe>
        <el-table-column label="执行时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="平台" width="100">
          <template #default="{ row }">
            <el-tag :type="getPlatformTagType(row.platform)">
              {{ getPlatformName(row.platform) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="关键词" min-width="220">
          <template #default="{ row }">
            <div class="keywords-cell">{{ row.keywords || '-' }}</div>
          </template>
        </el-table-column>
        
        <el-table-column label="采集结果" width="120">
          <template #default="{ row }">
            {{ row.collected_count }}/{{ row.limit_count }}
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="耗时" width="120">
          <template #default="{ row }">
            {{ getExecutionDuration(row) }}
          </template>
        </el-table-column>

        <el-table-column label="备注" min-width="220">
          <template #default="{ row }">
            {{ row.error_message || '执行完成' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { systemConfigAPI, keywordTrendAPI } from '@/services/api'

const saving = ref(false)
const logsLoading = ref(false)
const executionLogs = ref([])
const refreshTrigger = inject('refreshTrigger', ref(0))

// 设置表单
const settingsForm = reactive({
  scheduledTask: {
    enabled: true,
    productCount: 15,
    executionTime: '00:00',
    platforms: ['bilibili', 'douyin']
  },
  manualTrigger: {
    productCount: 7,
    platforms: ['bilibili', 'douyin']
  },
  aiModel: {
    recommendationThreshold: 70,
    recommendationStrategy: 'viral_priority'
  }
})

// 处理定时任务开关变化
function handleScheduledTaskChange(enabled) {
  if (enabled) {
    ElMessage.success('定时任务已启用，将在每天24点自动执行')
  } else {
    ElMessage.warning('定时任务已禁用')
  }
}

// 保存设置
async function saveSettings() {
  saving.value = true
  try {
    await systemConfigAPI.saveAIWorkbenchConfig(settingsForm)
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('设置保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}



// 获取执行日志
async function refreshLogs() {
  logsLoading.value = true
  try {
    const response = await keywordTrendAPI.getCollectionRuns({ page: 1, limit: 20 })
    if (response.success) {
      executionLogs.value = response.data.items || []
    } else {
      throw new Error(response.message || '获取日志失败')
    }
  } catch (error) {
    ElMessage.error('获取执行日志失败')
    console.error(error)
  } finally {
    logsLoading.value = false
  }
}

function getPlatformName(platform) {
  const platformMap = {
    douyin: '抖音',
    bilibili: 'B站'
  }
  return platformMap[platform] || platform || '-'
}

function getPlatformTagType(type) {
  const colorMap = {
    douyin: 'danger',
    bilibili: 'primary'
  }
  return colorMap[type] || 'info'
}

// 获取状态名称
function getStatusName(status) {
  const statusMap = {
    'success': '成功',
    'failed': '失败',
    'running': '执行中'
  }
  return statusMap[status] || status
}

// 获取状态颜色
function getStatusColor(status) {
  const colorMap = {
    'success': 'success',
    'failed': 'danger',
    'running': 'warning'
  }
  return colorMap[status] || 'info'
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

function getExecutionDuration(row) {
  if (!row?.finished_at || !row?.created_at) return '-'
  const durationMs = new Date(row.finished_at).getTime() - new Date(row.created_at).getTime()
  if (!Number.isFinite(durationMs) || durationMs < 0) return '-'
  return `${(durationMs / 1000).toFixed(1)}s`
}

// 加载配置数据
async function loadConfig() {
  try {
    const response = await systemConfigAPI.getAIWorkbenchConfig()
    if (response.success) {
      // 更新表单数据
      Object.assign(settingsForm, response.data)
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadConfig()
  refreshLogs()
})

watch(refreshTrigger, () => {
  if (refreshTrigger.value > 0) {
    refreshLogs()
  }
})
</script>

<style scoped>
.ai-workbench-settings {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-form {
  max-width: 800px;
}

.form-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.keywords-cell {
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}


:deep(.el-card__header) {
  background: #fafafa;
  border-bottom: 1px solid #e6e6e6;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #303133;
}

</style>

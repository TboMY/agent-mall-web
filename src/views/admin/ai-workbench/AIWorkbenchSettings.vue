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
            <el-checkbox label="xiaohongshu">小红书</el-checkbox>
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
            <el-checkbox label="xiaohongshu">小红书</el-checkbox>
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
        
        <el-table-column label="任务类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTaskTypeColor(row.task_type)">
              {{ getTaskTypeName(row.task_type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="推送数量" width="100" prop="product_count" />
        
        <el-table-column label="执行时间" width="100">
          <template #default="{ row }">
            {{ row.execution_time }}s
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="备注" min-width="200" prop="remark" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { systemConfigAPI } from '@/services/api'

const saving = ref(false)
const logsLoading = ref(false)
const executionLogs = ref([])

// 设置表单
const settingsForm = reactive({
  scheduledTask: {
    enabled: true,
    productCount: 15,
    executionTime: '00:00',
    platforms: ['bilibili', 'douyin', 'xiaohongshu']
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
    // 模拟获取日志数据
    executionLogs.value = [
      {
        id: 1,
        created_at: new Date().toISOString(),
        task_type: 'scheduled',
        product_count: 50,
        execution_time: 45,
        status: 'success',
        remark: '定时任务执行成功'
      },
      {
        id: 2,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        task_type: 'manual',
        product_count: 10,
        execution_time: 12,
        status: 'success',
        remark: '手动触发测试'
      }
    ]
  } catch (error) {
    ElMessage.error('获取执行日志失败')
    console.error(error)
  } finally {
    logsLoading.value = false
  }
}

// 获取任务类型名称
function getTaskTypeName(type) {
  const typeMap = {
    'scheduled': '定时任务',
    'manual': '手动触发'
  }
  return typeMap[type] || type
}

// 获取任务类型颜色
function getTaskTypeColor(type) {
  const colorMap = {
    'scheduled': 'primary',
    'manual': 'success'
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


:deep(.el-card__header) {
  background: #fafafa;
  border-bottom: 1px solid #e6e6e6;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #303133;
}

</style>

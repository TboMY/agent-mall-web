<template>
  <div class="ai-workbench-settings">
    <!-- 触发方式设置 -->
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>触发方式设置</span>
          <el-tag type="info">配置AI选品的触发方式和推送数量</el-tag>
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
          <span class="form-tip">每天24点自动触发AI选品</span>
        </el-form-item>
        
        <el-form-item label="推送商品数量" v-if="settingsForm.scheduledTask.enabled">
          <el-input-number 
            v-model="settingsForm.scheduledTask.productCount"
            :min="1"
            :max="200"
            :step="5"
            controls-position="right"
          />
          <span class="form-tip">定时任务每次推送的商品数量（建议50-100个）</span>
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
            <el-checkbox label="weibo">微博</el-checkbox>
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
          <span class="form-tip">手动触发每次推送的商品数量（建议10-20个）</span>
        </el-form-item>
        
        <el-form-item label="数据来源">
          <el-checkbox-group v-model="settingsForm.manualTrigger.platforms">
            <el-checkbox label="bilibili">B站</el-checkbox>
            <el-checkbox label="douyin">抖音</el-checkbox>
            <el-checkbox label="xiaohongshu">小红书</el-checkbox>
            <el-checkbox label="weibo">微博</el-checkbox>
          </el-checkbox-group>
          <span class="form-tip">手动触发时的数据来源平台</span>
        </el-form-item>
        
        <el-form-item label="推荐算法">
          <el-select v-model="settingsForm.manualTrigger.algorithm" placeholder="选择推荐算法">
            <el-option label="热度优先" value="heat_priority" />
            <el-option label="销量优先" value="sales_priority" />
            <el-option label="综合评分" value="comprehensive" />
            <el-option label="趋势分析" value="trend_analysis" />
          </el-select>
          <span class="form-tip">手动触发使用的推荐算法</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- AI模型设置 -->
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>AI模型设置</span>
          <el-tag type="warning">配置AI推荐模型参数</el-tag>
        </div>
      </template>
      
      <el-form :model="settingsForm" label-width="150px" class="settings-form">
        <el-form-item label="推荐阈值">
          <el-slider
            v-model="settingsForm.aiModel.recommendationThreshold"
            :min="0"
            :max="100"
            :step="5"
            show-input
            :format-tooltip="(val) => `${val}%`"
          />
          <span class="form-tip">AI推荐的最低置信度阈值</span>
        </el-form-item>
        
        <el-form-item label="热度权重">
          <el-slider
            v-model="settingsForm.aiModel.heatWeight"
            :min="0"
            :max="100"
            :step="5"
            show-input
            :format-tooltip="(val) => `${val}%`"
          />
          <span class="form-tip">热度在推荐算法中的权重</span>
        </el-form-item>
        
        <el-form-item label="销量权重">
          <el-slider
            v-model="settingsForm.aiModel.salesWeight"
            :min="0"
            :max="100"
            :step="5"
            show-input
            :format-tooltip="(val) => `${val}%`"
          />
          <span class="form-tip">销量在推荐算法中的权重</span>
        </el-form-item>
        
        <el-form-item label="趋势权重">
          <el-slider
            v-model="settingsForm.aiModel.trendWeight"
            :min="0"
            :max="100"
            :step="5"
            show-input
            :format-tooltip="(val) => `${val}%`"
          />
          <span class="form-tip">趋势分析在推荐算法中的权重</span>
        </el-form-item>
        
        <el-form-item label="模型版本">
          <el-select v-model="settingsForm.aiModel.version" placeholder="选择模型版本">
            <el-option label="v1.0 - 基础推荐" value="v1.0" />
            <el-option label="v1.1 - 增强推荐" value="v1.1" />
            <el-option label="v2.0 - 智能推荐" value="v2.0" />
          </el-select>
          <span class="form-tip">当前使用的AI模型版本</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 通知设置 -->
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>通知设置</span>
          <el-tag type="success">配置任务执行通知</el-tag>
        </div>
      </template>
      
      <el-form :model="settingsForm" label-width="150px" class="settings-form">
        <el-form-item label="任务完成通知">
          <el-switch v-model="settingsForm.notification.taskCompleted" />
          <span class="form-tip">任务执行完成后发送通知</span>
        </el-form-item>
        
        <el-form-item label="错误通知">
          <el-switch v-model="settingsForm.notification.taskError" />
          <span class="form-tip">任务执行失败时发送通知</span>
        </el-form-item>
        
        <el-form-item label="通知方式">
          <el-checkbox-group v-model="settingsForm.notification.methods">
            <el-checkbox label="email">邮件</el-checkbox>
            <el-checkbox label="sms">短信</el-checkbox>
            <el-checkbox label="webhook">Webhook</el-checkbox>
          </el-checkbox-group>
          <span class="form-tip">选择通知的发送方式</span>
        </el-form-item>
        
        <el-form-item label="通知邮箱" v-if="settingsForm.notification.methods.includes('email')">
          <el-input v-model="settingsForm.notification.email" placeholder="输入通知邮箱" />
        </el-form-item>
        
        <el-form-item label="Webhook地址" v-if="settingsForm.notification.methods.includes('webhook')">
          <el-input v-model="settingsForm.notification.webhookUrl" placeholder="输入Webhook地址" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="saveSettings" :loading="saving">
        <el-icon><Check /></el-icon>
        保存设置
      </el-button>
      <el-button @click="resetSettings">
        <el-icon><Refresh /></el-icon>
        重置设置
      </el-button>
      <el-button type="success" @click="testSettings">
        <el-icon><Magic /></el-icon>
        测试配置
      </el-button>
    </div>

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

const saving = ref(false)
const logsLoading = ref(false)
const executionLogs = ref([])

// 设置表单
const settingsForm = reactive({
  scheduledTask: {
    enabled: true,
    productCount: 50,
    executionTime: '00:00',
    platforms: ['bilibili', 'douyin', 'xiaohongshu']
  },
  manualTrigger: {
    productCount: 10,
    platforms: ['bilibili', 'douyin'],
    algorithm: 'comprehensive'
  },
  aiModel: {
    recommendationThreshold: 70,
    heatWeight: 40,
    salesWeight: 30,
    trendWeight: 30,
    version: 'v2.0'
  },
  notification: {
    taskCompleted: true,
    taskError: true,
    methods: ['email'],
    email: '',
    webhookUrl: ''
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
    // 这里应该调用API保存设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('设置保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

// 重置设置
function resetSettings() {
  ElMessageBox.confirm(
    '确定要重置所有设置为默认值吗？',
    '重置确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 重置为默认值
    Object.assign(settingsForm.scheduledTask, {
      enabled: true,
      productCount: 50,
      executionTime: '00:00',
      platforms: ['bilibili', 'douyin', 'xiaohongshu']
    })
    
    Object.assign(settingsForm.manualTrigger, {
      productCount: 10,
      platforms: ['bilibili', 'douyin'],
      algorithm: 'comprehensive'
    })
    
    Object.assign(settingsForm.aiModel, {
      recommendationThreshold: 70,
      heatWeight: 40,
      salesWeight: 30,
      trendWeight: 30,
      version: 'v2.0'
    })
    
    Object.assign(settingsForm.notification, {
      taskCompleted: true,
      taskError: true,
      methods: ['email'],
      email: '',
      webhookUrl: ''
    })
    
    ElMessage.success('设置已重置')
  }).catch(() => {
    // 用户取消
  })
}

// 测试配置
async function testSettings() {
  try {
    await ElMessageBox.confirm(
      '确定要测试当前配置吗？这将使用手动触发设置执行一次AI选品。',
      '测试确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    // 模拟测试执行
    ElMessage.info('正在测试配置...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('配置测试完成，推送了10个推荐商品')
    await refreshLogs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('配置测试失败')
      console.error(error)
    }
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

// 页面加载时获取数据
onMounted(() => {
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

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

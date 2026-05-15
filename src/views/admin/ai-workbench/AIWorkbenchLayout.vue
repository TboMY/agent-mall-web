<template>
  <div class="ai-workbench-layout">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>AI 选品工作台</h2>
      <div class="header-actions">
        <el-button type="success" class="ai-trigger-btn" @click="triggerManualAI" :loading="aiLoading">
          <!-- <el-icon><Magic /></el-icon> -->
          手动触发AI选品
        </el-button>
        <el-button @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 工作台导航 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="workbench-tabs">
      <el-tab-pane label="AI推荐商品" name="products">
        <router-view />
      </el-tab-pane>
      <el-tab-pane label="工作台设置" name="settings">
        <router-view />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { keywordTrendAPI } from '@/services/api'

const router = useRouter()
const route = useRoute()

const activeTab = ref('products')
const aiLoading = ref(false)

// 创建刷新触发器，供子组件使用
const refreshTrigger = ref(0)
const triggerRefresh = () => {
  refreshTrigger.value++
}

// 提供给子组件的刷新方法
provide('refreshTrigger', refreshTrigger)
provide('triggerRefresh', triggerRefresh)

// 根据当前路由设置激活的标签页
onMounted(() => {
  if (route.path.includes('/settings')) {
    activeTab.value = 'settings'
  } else {
    activeTab.value = 'products'
  }
})

// 处理标签页切换
function handleTabChange(tabName) {
  if (tabName === 'products') {
    router.push('/admin/ai-workbench/products')
  } else if (tabName === 'settings') {
    router.push('/admin/ai-workbench/settings')
  }
}

function buildPipelineSummary(payload) {
  const summary = payload?.summary || {}
  return `热词导入 ${summary.hotlist_imported_count || 0} 条，AI筛词 ${summary.hotlist_analyzed_count || 0} 条，采集内容 ${summary.crawled_count || 0} 条，分析内容 ${summary.analyzed_content_count || 0} 条，生成候选 ${summary.created_candidates_count || 0} 条`
}

// 手动触发AI选品
async function triggerManualAI() {
  try {
    await ElMessageBox.confirm(
      '确定要手动触发AI选品吗？系统会按“工作台设置”中的平台配置执行完整流程：同步热榜、AI筛词、采集内容、生成候选商品。\n\n注意：整套流程可能需要几分钟时间，请耐心等待。',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    aiLoading.value = true
    
    // 显示进度提示
    ElMessage.info('AI选品流水线执行中，请耐心等待...')
    
    const resp = await keywordTrendAPI.runPipeline({ mode: 'manual' })
    if (resp && resp.success) {
      ElMessage.success(`AI选品完成：${buildPipelineSummary(resp.data)}`)
    } else {
      ElMessage.warning('AI选品已执行，但返回格式异常')
    }
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      // 检查是否是超时错误
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        ElMessage.warning('AI选品流程超时，但后台可能仍在处理中。请稍后刷新页面查看结果。')
      } else {
        ElMessage.error(error?.response?.data?.message || error?.response?.data?.error || error.message || 'AI选品失败')
      }
      console.error('AI选品错误:', error)
    }
  } finally {
    aiLoading.value = false
  }
}

// 刷新数据
async function refreshData() {
  // 触发子组件刷新
  triggerRefresh()
  ElMessage.success('数据已刷新')
}
</script>

<style scoped>
.ai-workbench-layout {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 手动触发按钮文案与图标居中对齐 */
.ai-trigger-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

/* 调整图标与文字间距并垂直居中 */
::deep(.ai-trigger-btn .el-icon) {
  margin-right: 6px;
  display: inline-flex;
  align-items: center;
}

.workbench-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-tabs__header) {
  margin: 0;
  padding: 0 20px;
  background: #fafafa;
  border-bottom: 1px solid #e6e6e6;
}

:deep(.el-tabs__content) {
  padding: 20px;
}
</style>

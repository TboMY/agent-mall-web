<template>
  <div class="ai-workbench-layout">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>AI 选品工作台</h2>
      <div class="header-actions">
        <el-button type="success" @click="triggerManualAI" :loading="aiLoading">
          <el-icon><Magic /></el-icon>
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()

const activeTab = ref('products')
const aiLoading = ref(false)

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

// 手动触发AI选品
async function triggerManualAI() {
  try {
    await ElMessageBox.confirm(
      '确定要手动触发AI选品吗？这将根据当前设置推送少量商品供您查看。',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    aiLoading.value = true
    
    // 模拟AI选品过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('AI选品完成，已推送10个推荐商品')
    
    // 刷新数据
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('AI选品失败')
      console.error(error)
    }
  } finally {
    aiLoading.value = false
  }
}

// 刷新数据
async function refreshData() {
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

<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <div>
        <h2>仪表盘</h2>
        <p>查看商城运营概览、AI 选品进度和订单处理情况。</p>
      </div>
      <el-button type="primary" @click="refreshDashboard" :loading="loading">
        刷新数据
      </el-button>
    </div>

    <div class="summary-grid">
      <el-card
        v-for="card in summaryCards"
        :key="card.key"
        class="summary-card"
        shadow="hover"
      >
        <div class="summary-card__top">
          <span class="summary-card__label">{{ card.label }}</span>
          <el-tag :type="card.tagType" effect="light">{{ card.tag }}</el-tag>
        </div>
        <div class="summary-card__value">{{ card.value }}</div>
        <div class="summary-card__desc">{{ card.description }}</div>
      </el-card>
    </div>

    <div class="focus-grid">
      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <span>待处理事项</span>
            <el-tag type="warning" effect="light">优先关注</el-tag>
          </div>
        </template>
        <div class="focus-list">
          <button
            v-for="item in focusItems"
            :key="item.key"
            class="focus-item"
            type="button"
            @click="goTo(item.path)"
          >
            <div>
              <div class="focus-item__label">{{ item.label }}</div>
              <div class="focus-item__hint">{{ item.hint }}</div>
            </div>
            <div class="focus-item__count">{{ item.count }}</div>
          </button>
        </div>
      </el-card>

      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <span>AI 工作台概览</span>
            <el-tag :type="aiWorkbenchTagType" effect="light">{{ aiWorkbenchTagText }}</el-tag>
          </div>
        </template>
        <div class="workbench-overview">
          <div class="workbench-stat">
            <span class="workbench-stat__label">手动触发商品数</span>
            <strong>{{ aiWorkbench.manualTrigger.productCount }}</strong>
          </div>
          <div class="workbench-stat">
            <span class="workbench-stat__label">手动平台</span>
            <strong>{{ formatPlatforms(aiWorkbench.manualTrigger.platforms) }}</strong>
          </div>
          <div class="workbench-stat">
            <span class="workbench-stat__label">定时任务</span>
            <strong>{{ aiWorkbench.scheduledTask.enabled ? '已启用' : '未启用' }}</strong>
          </div>
          <div class="workbench-stat">
            <span class="workbench-stat__label">执行时间</span>
            <strong>{{ aiWorkbench.scheduledTask.executionTime || '-' }}</strong>
          </div>
          <div class="workbench-stat">
            <span class="workbench-stat__label">推荐阈值</span>
            <strong>{{ aiWorkbench.aiModel.recommendationThreshold }}%</strong>
          </div>
          <div class="workbench-stat">
            <span class="workbench-stat__label">推荐策略</span>
            <strong>{{ recommendationStrategyText }}</strong>
          </div>
        </div>
      </el-card>
    </div>

    <div class="content-grid">
      <el-card class="panel-card" shadow="never">
        <template #header>
          <div class="panel-header">
            <span>最近订单</span>
            <el-button type="primary" link @click="goTo('/admin/orders/list')">查看全部</el-button>
          </div>
        </template>

        <el-table :data="recentOrders" v-loading="loading" size="small" stripe>
          <el-table-column prop="order_no" label="订单号" min-width="180" />
          <el-table-column label="用户" width="120">
            <template #default="{ row }">
              {{ row.nickname || row.username || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="订单状态" width="110">
            <template #default="{ row }">
              <el-tag :type="getOrderStatusType(row.status)" size="small">
                {{ getOrderStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="支付状态" width="110">
            <template #default="{ row }">
              <el-tag :type="getPaymentStatusType(row.payment_status)" size="small">
                {{ getPaymentStatusText(row.payment_status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="金额" width="110">
            <template #default="{ row }">¥{{ row.payable_amount }}</template>
          </el-table-column>
          <el-table-column label="创建时间" width="160">
            <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
          </el-table-column>
        </el-table>
      </el-card>

      <div class="side-panels">
        <el-card class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <span>最近采集任务</span>
              <el-button type="primary" link @click="goTo('/admin/ai-workbench/settings')">查看日志</el-button>
            </div>
          </template>
          <div class="run-list" v-if="recentRuns.length">
            <div v-for="run in recentRuns" :key="run.id" class="run-item">
              <div class="run-item__title">
                <span>{{ getPlatformName(run.platform) }}</span>
                <el-tag :type="getRunStatusType(run.status)" size="small">
                  {{ getRunStatusText(run.status) }}
                </el-tag>
              </div>
              <div class="run-item__meta">{{ run.keywords || '-' }}</div>
              <div class="run-item__sub">
                <span>{{ run.collected_count }}/{{ run.limit_count }} 条</span>
                <span>{{ formatDate(run.created_at) }}</span>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无采集记录" :image-size="88" />
        </el-card>

        <el-card class="panel-card" shadow="never">
          <template #header>
            <div class="panel-header">
              <span>快捷入口</span>
              <el-tag type="info" effect="light">常用操作</el-tag>
            </div>
          </template>
          <div class="quick-actions">
            <el-button
              v-for="action in quickActions"
              :key="action.path"
              class="quick-action"
              @click="goTo(action.path)"
            >
              <span class="quick-action__title">{{ action.title }}</span>
              <span class="quick-action__desc">{{ action.description }}</span>
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  aiCandidateAPI,
  keywordTrendAPI,
  mallUserAPI,
  orderAPI,
  productAPI,
  returnRequestAPI,
  systemConfigAPI
} from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const recentOrders = ref([])
const recentRuns = ref([])

const stats = reactive({
  productTotal: 0,
  productOnlineTotal: 0,
  mallUserTotal: 0,
  orderTotal: 0,
  pendingOrderTotal: 0,
  pendingCandidateTotal: 0,
  pendingReturnTotal: 0
})

const aiWorkbench = reactive({
  scheduledTask: {
    enabled: false,
    productCount: 0,
    executionTime: '',
    platforms: []
  },
  manualTrigger: {
    productCount: 0,
    platforms: []
  },
  aiModel: {
    recommendationThreshold: 0,
    recommendationStrategy: 'viral_priority'
  }
})

const summaryCards = computed(() => ([
  {
    key: 'products',
    label: '商品总数',
    value: stats.productTotal,
    description: `当前上架 ${stats.productOnlineTotal} 件商品`,
    tag: '商城运营',
    tagType: 'primary'
  },
  {
    key: 'users',
    label: '商城用户',
    value: stats.mallUserTotal,
    description: '可用于观察前台会员增长情况',
    tag: '用户',
    tagType: 'success'
  },
  {
    key: 'orders',
    label: '订单总数',
    value: stats.orderTotal,
    description: `其中待付款 ${stats.pendingOrderTotal} 笔`,
    tag: '交易',
    tagType: 'warning'
  },
  {
    key: 'candidates',
    label: '待审核候选',
    value: stats.pendingCandidateTotal,
    description: `退货待处理 ${stats.pendingReturnTotal} 条`,
    tag: 'AI 选品',
    tagType: 'danger'
  }
]))

const focusItems = computed(() => ([
  {
    key: 'candidate',
    label: '待审核候选商品',
    hint: 'AI 推荐后等待人工确认上架',
    count: `${stats.pendingCandidateTotal} 条`,
    path: '/admin/ai-workbench/products'
  },
  {
    key: 'returns',
    label: '退货申请待处理',
    hint: '需要尽快处理的售后申请',
    count: `${stats.pendingReturnTotal} 条`,
    path: '/admin/orders/returns'
  },
  {
    key: 'unpaid',
    label: '待付款订单',
    hint: '可观察近期支付转化情况',
    count: `${stats.pendingOrderTotal} 笔`,
    path: '/admin/orders/list'
  }
]))

const aiWorkbenchTagType = computed(() => (
  aiWorkbench.scheduledTask.enabled ? 'success' : 'info'
))

const aiWorkbenchTagText = computed(() => (
  aiWorkbench.scheduledTask.enabled ? '定时任务已开启' : '仅支持手动触发'
))

const recommendationStrategyText = computed(() => {
  const strategyMap = {
    viral_priority: '爆款优先',
    engagement_priority: '互动优先',
    freshness_priority: '新鲜度优先'
  }
  return strategyMap[aiWorkbench.aiModel.recommendationStrategy] || '爆款优先'
})

const quickActions = computed(() => {
  const actions = []

  if (auth.hasPermission('products.manage')) {
    actions.push({
      title: '添加商品',
      description: '快速创建新商品并维护 SKU',
      path: '/admin/products/add'
    })
  }
  if (auth.hasPermission('systemConfigs.manage')) {
    actions.push({
      title: '首页展示',
      description: '调整首页商品与分类会场展示',
      path: '/admin/homepage-display'
    })
  }
  if (auth.hasPermission('aiWorkbench.view')) {
    actions.push({
      title: '候选商品审核',
      description: '处理 AI 推荐结果并上架商品',
      path: '/admin/ai-workbench/products'
    })
  }
  if (auth.hasPermission('orders.view')) {
    actions.push({
      title: '订单列表',
      description: '查看订单状态与支付情况',
      path: '/admin/orders/list'
    })
  }

  return actions
})

async function refreshDashboard() {
  loading.value = true
  try {
    const [
      productsResp,
      onlineProductsResp,
      mallUsersResp,
      ordersResp,
      pendingOrdersResp,
      pendingCandidatesResp,
      pendingReturnsResp,
      recentOrdersResp,
      collectionRunsResp,
      aiWorkbenchResp
    ] = await Promise.all([
      productAPI.getProducts({ page: 1, limit: 1 }),
      productAPI.getProducts({ page: 1, limit: 1, status: 1 }),
      mallUserAPI.getUsers({ page: 1, limit: 1 }),
      orderAPI.getOrders({ page: 1, limit: 1 }),
      orderAPI.getOrders({ page: 1, limit: 1, status: 'pending_payment', payment_status: 'unpaid' }),
      aiCandidateAPI.getCandidates({ page: 1, limit: 1, status: 0 }),
      returnRequestAPI.getList({ page: 1, limit: 1, status: 'pending' }),
      orderAPI.getOrders({ page: 1, limit: 5 }),
      keywordTrendAPI.getCollectionRuns({ page: 1, limit: 5 }),
      systemConfigAPI.getAIWorkbenchConfig()
    ])

    stats.productTotal = productsResp.pagination?.total || 0
    stats.productOnlineTotal = onlineProductsResp.pagination?.total || 0
    stats.mallUserTotal = mallUsersResp.pagination?.total || 0
    stats.orderTotal = ordersResp.pagination?.total || 0
    stats.pendingOrderTotal = pendingOrdersResp.pagination?.total || 0
    stats.pendingCandidateTotal = pendingCandidatesResp.pagination?.total || 0
    stats.pendingReturnTotal = pendingReturnsResp.pagination?.total || 0

    recentOrders.value = recentOrdersResp.data || []
    recentRuns.value = collectionRunsResp.data?.items || []

    if (aiWorkbenchResp.success && aiWorkbenchResp.data) {
      Object.assign(aiWorkbench, aiWorkbenchResp.data)
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '加载仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

function goTo(path) {
  router.push(path)
}

function formatPlatforms(platforms = []) {
  if (!Array.isArray(platforms) || !platforms.length) return '-'
  return platforms.map(getPlatformName).join(' / ')
}

function getPlatformName(platform) {
  const map = {
    douyin: '抖音',
    bilibili: 'B站'
  }
  return map[platform] || platform || '-'
}

function getRunStatusText(status) {
  return {
    success: '成功',
    failed: '失败',
    running: '执行中'
  }[status] || status
}

function getRunStatusType(status) {
  return {
    success: 'success',
    failed: 'danger',
    running: 'warning'
  }[status] || 'info'
}

function getOrderStatusText(status) {
  return {
    pending_payment: '待支付',
    paid: '已支付',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    refunding: '退款中',
    refunded: '已退款'
  }[status] || status
}

function getOrderStatusType(status) {
  return {
    pending_payment: 'warning',
    paid: 'success',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'info',
    refunding: 'warning',
    refunded: 'danger'
  }[status] || 'info'
}

function getPaymentStatusText(status) {
  return {
    unpaid: '未支付',
    paid: '已支付',
    refunded: '已退款'
  }[status] || status
}

function getPaymentStatusType(status) {
  return {
    unpaid: 'warning',
    paid: 'success',
    refunded: 'danger'
  }[status] || 'info'
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN')
}

onMounted(() => {
  refreshDashboard()
})
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.dashboard-header h2 {
  margin: 0;
  color: #1f2a44;
  font-size: 28px;
}

.dashboard-header p {
  margin: 8px 0 0;
  color: #7b8794;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  border: none;
  border-radius: 18px;
}

.summary-card :deep(.el-card__body) {
  padding: 22px;
}

.summary-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-card__label {
  color: #8a94a6;
  font-size: 13px;
}

.summary-card__value {
  margin-top: 18px;
  font-size: 34px;
  line-height: 1;
  font-weight: 700;
  color: #1f2a44;
}

.summary-card__desc {
  margin-top: 12px;
  color: #7b8794;
  font-size: 13px;
}

.focus-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
}

.panel-card {
  border: none;
  border-radius: 18px;
}

.panel-card :deep(.el-card__body) {
  padding: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
  color: #1f2a44;
}

.focus-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.focus-item {
  border: 1px solid #edf1f7;
  border-radius: 16px;
  padding: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  cursor: pointer;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.focus-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(31, 42, 68, 0.08);
}

.focus-item__label {
  font-weight: 600;
  color: #1f2a44;
}

.focus-item__hint {
  margin-top: 8px;
  color: #8a94a6;
  font-size: 12px;
  line-height: 1.5;
}

.focus-item__count {
  white-space: nowrap;
  color: #ff7a45;
  font-weight: 700;
  font-size: 18px;
}

.workbench-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.workbench-stat {
  padding: 16px;
  border-radius: 16px;
  background: #f7f9fc;
}

.workbench-stat__label {
  display: block;
  margin-bottom: 10px;
  color: #8a94a6;
  font-size: 12px;
}

.workbench-stat strong {
  color: #1f2a44;
  font-size: 16px;
}

.side-panels {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.run-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.run-item {
  padding: 14px 16px;
  border-radius: 14px;
  background: #f7f9fc;
}

.run-item__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #1f2a44;
  font-weight: 600;
}

.run-item__meta {
  margin-top: 8px;
  color: #596579;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.run-item__sub {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  color: #8a94a6;
  font-size: 12px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.quick-action {
  height: auto;
  margin: 0;
  padding: 16px;
  justify-content: flex-start;
  text-align: left;
  border-radius: 14px;
}

.quick-action :deep(span) {
  display: block;
}

.quick-action__title {
  color: #1f2a44;
  font-weight: 600;
}

.quick-action__desc {
  margin-top: 8px;
  font-size: 12px;
  color: #7b8794;
  line-height: 1.5;
}

@media (max-width: 1440px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .focus-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .summary-grid,
  .workbench-overview,
  .quick-actions,
  .focus-list {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

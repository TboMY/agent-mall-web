<template>
  <div class="order-list">
    <div class="page-header">
      <h2>订单管理</h2>
    </div>

    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.search"
            placeholder="订单号 / 用户名 / 收货人"
            clearable
            style="width: 260px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" clearable placeholder="全部状态" style="width: 160px">
            <el-option label="待支付" value="pending_payment" />
            <el-option label="已支付" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="退款中" value="refunding" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="searchForm.payment_status" clearable placeholder="全部状态" style="width: 160px">
            <el-option label="未支付" value="unpaid" />
            <el-option label="已支付" value="paid" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="orders" v-loading="loading" stripe>
        <el-table-column prop="order_no" label="订单号" min-width="180" />
        <el-table-column label="用户" width="140">
          <template #default="{ row }">{{ row.nickname || row.username || '-' }}</template>
        </el-table-column>
        <el-table-column label="收货人" width="140">
          <template #default="{ row }">{{ row.consignee_name }}</template>
        </el-table-column>
        <el-table-column label="订单金额" width="120">
          <template #default="{ row }">¥{{ row.total_amount }}</template>
        </el-table-column>
        <el-table-column label="应付金额" width="120">
          <template #default="{ row }">¥{{ row.payable_amount }}</template>
        </el-table-column>
        <el-table-column label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.status)">{{ getOrderStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getPaymentStatusType(row.payment_status)">{{ getPaymentStatusText(row.payment_status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="showDetail(row.id)">详情</el-button>
            <el-dropdown v-if="canManageOrder(row)" trigger="click" @command="(command) => handleOrderAction(row, command)">
              <el-button size="small" type="primary" link>更多</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="row.status === 'paid' && row.payment_status === 'paid'" command="ship">
                    发货
                  </el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'shipped' && row.payment_status === 'paid'" command="complete">
                    完成
                  </el-dropdown-item>
                  <el-dropdown-item v-if="row.status === 'pending_payment' && row.payment_status === 'unpaid'" command="cancel">
                    取消订单
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
          @current-change="loadOrders"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="订单详情" width="900px">
      <template v-if="orderDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ orderDetail.order_no }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ orderDetail.nickname || orderDetail.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">{{ getOrderStatusText(orderDetail.status) }}</el-descriptions-item>
          <el-descriptions-item label="支付状态">{{ getPaymentStatusText(orderDetail.payment_status) }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ orderDetail.consignee_name }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ orderDetail.consignee_phone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ orderDetail.shipping_address }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ orderDetail.remark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>订单商品</el-divider>
        <el-table :data="orderDetail.items || []" stripe>
          <el-table-column prop="product_name" label="商品名称" min-width="220" />
          <el-table-column label="单价" width="120">
            <template #default="{ row }">¥{{ row.unit_price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column label="小计" width="120">
            <template #default="{ row }">¥{{ row.line_total }}</template>
          </el-table-column>
          <el-table-column prop="source_platform" label="来源平台" width="120">
            <template #default="{ row }">{{ row.source_platform || '-' }}</template>
          </el-table-column>
        </el-table>

        <div v-if="canManageOrder(orderDetail)" class="detail-action-bar">
          <el-button
            v-if="orderDetail.status === 'paid' && orderDetail.payment_status === 'paid'"
            type="primary"
            @click="handleOrderAction(orderDetail, 'ship')"
          >
            发货
          </el-button>
          <el-button
            v-if="orderDetail.status === 'shipped' && orderDetail.payment_status === 'paid'"
            type="success"
            @click="handleOrderAction(orderDetail, 'complete')"
          >
            完成订单
          </el-button>
          <el-button
            v-if="orderDetail.status === 'pending_payment' && orderDetail.payment_status === 'unpaid'"
            type="danger"
            plain
            @click="handleOrderAction(orderDetail, 'cancel')"
          >
            取消订单
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderAPI } from '@/services/api'

const loading = ref(false)
const orders = ref([])
const detailVisible = ref(false)
const orderDetail = ref(null)

const searchForm = reactive({
  search: '',
  status: '',
  payment_status: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

async function loadOrders() {
  loading.value = true
  try {
    const response = await orderAPI.getOrders({
      page: pagination.page,
      limit: pagination.limit,
      search: searchForm.search || undefined,
      status: searchForm.status || undefined,
      payment_status: searchForm.payment_status || undefined
    })
    orders.value = response.data
    pagination.total = response.pagination.total
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取订单列表失败')
  } finally {
    loading.value = false
  }
}

async function showDetail(id) {
  try {
    const response = await orderAPI.getOrderDetail(id)
    orderDetail.value = response.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取订单详情失败')
  }
}

function canManageOrder(row) {
  return (
    (row.status === 'paid' && row.payment_status === 'paid')
    || (row.status === 'shipped' && row.payment_status === 'paid')
    || (row.status === 'pending_payment' && row.payment_status === 'unpaid')
  )
}

function getActionLabel(action) {
  return {
    ship: '发货',
    complete: '完成',
    cancel: '取消订单'
  }[action] || '更新状态'
}

async function handleOrderAction(row, action) {
  try {
    await ElMessageBox.confirm(
      `确认要对订单 ${row.order_no} 执行“${getActionLabel(action)}”吗？`,
      '订单状态变更',
      {
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )

    const response = await orderAPI.updateOrderStatus(row.id, action)
    const nextOrder = response.data
    const index = orders.value.findIndex(item => item.id === nextOrder.id)
    if (index !== -1) {
      orders.value[index] = nextOrder
    }
    if (orderDetail.value?.id === nextOrder.id) {
      orderDetail.value = nextOrder
    }
    ElMessage.success(response.message || '订单状态已更新')
  } catch (error) {
    if (error === 'cancel') return
    ElMessage.error(error.response?.data?.message || '更新订单状态失败')
  }
}

function handleSearch() {
  pagination.page = 1
  loadOrders()
}

function handleReset() {
  searchForm.search = ''
  searchForm.status = ''
  searchForm.payment_status = ''
  pagination.page = 1
  loadOrders()
}

function handlePageSizeChange(size) {
  pagination.limit = size
  pagination.page = 1
  loadOrders()
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN')
}

function getOrderStatusText(status) {
  const map = {
    pending_payment: '待支付',
    paid: '已支付',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    refunding: '退款中',
    refunded: '已退款'
  }
  return map[status] || status
}

function getOrderStatusType(status) {
  const map = {
    pending_payment: 'warning',
    paid: 'success',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'info',
    refunding: 'warning',
    refunded: 'danger'
  }
  return map[status] || 'info'
}

function getPaymentStatusText(status) {
  const map = {
    unpaid: '未支付',
    paid: '已支付',
    refunded: '已退款'
  }
  return map[status] || status
}

function getPaymentStatusType(status) {
  const map = {
    unpaid: 'warning',
    paid: 'success',
    refunded: 'danger'
  }
  return map[status] || 'info'
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-list {
  background-color: #f5f7fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.detail-action-bar {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

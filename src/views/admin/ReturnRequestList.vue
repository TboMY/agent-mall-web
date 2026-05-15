<template>
  <div class="return-request-list">
    <div class="page-header">
      <h2>退货申请处理</h2>
    </div>

    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.search"
            placeholder="订单号 / 用户名 / 退货原因"
            clearable
            style="width: 260px"
            @keyup.enter="loadRequests"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable placeholder="全部状态" style="width: 160px">
            <el-option label="待处理" value="pending" />
            <el-option label="已同意" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="requests" v-loading="loading" stripe>
        <el-table-column prop="order_no" label="订单号" min-width="180" />
        <el-table-column label="用户" width="140">
          <template #default="{ row }">{{ row.nickname || row.username || '-' }}</template>
        </el-table-column>
        <el-table-column prop="reason" label="退货原因" min-width="180" />
        <el-table-column label="申请说明" min-width="220">
          <template #default="{ row }">{{ row.description || '-' }}</template>
        </el-table-column>
        <el-table-column label="订单金额" width="120">
          <template #default="{ row }">¥{{ formatAmount(row.payable_amount) }}</template>
        </el-table-column>
        <el-table-column label="申请状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button size="small" type="success" @click="openHandleDialog(row, 'approve')">同意退款</el-button>
              <el-button size="small" type="danger" plain @click="openHandleDialog(row, 'reject')">驳回</el-button>
            </template>
            <span v-else>-</span>
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
          @current-change="loadRequests"
        />
      </div>
    </el-card>

    <el-dialog v-model="handleDialog.visible" :title="handleDialog.action === 'approve' ? '同意退款' : '驳回申请'" width="520px">
      <el-form label-position="top">
        <el-form-item label="订单号">
          <el-input :model-value="handleDialog.request?.order_no || '-'" disabled />
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input
            v-model="handleDialog.remark"
            type="textarea"
            :rows="4"
            :placeholder="handleDialog.action === 'approve' ? '可填写退款说明' : '请填写驳回原因'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleDialog.visible = false">取消</el-button>
        <el-button
          :type="handleDialog.action === 'approve' ? 'success' : 'danger'"
          :loading="handleDialog.submitting"
          @click="submitHandle"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { returnRequestAPI } from '@/services/api'

const loading = ref(false)
const requests = ref([])

const searchForm = reactive({
  search: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const handleDialog = reactive({
  visible: false,
  action: 'approve',
  request: null,
  remark: '',
  submitting: false
})

async function loadRequests() {
  loading.value = true
  try {
    const response = await returnRequestAPI.getList({
      page: pagination.page,
      limit: pagination.limit,
      search: searchForm.search || undefined,
      status: searchForm.status || undefined
    })
    requests.value = response.data
    pagination.total = response.pagination.total
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取退货申请列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadRequests()
}

function handleReset() {
  searchForm.search = ''
  searchForm.status = ''
  pagination.page = 1
  loadRequests()
}

function handlePageSizeChange(size) {
  pagination.limit = size
  pagination.page = 1
  loadRequests()
}

function formatAmount(value) {
  return Number(value || 0).toFixed(2)
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN')
}

function getStatusText(status) {
  return {
    pending: '待处理',
    approved: '已同意',
    rejected: '已驳回'
  }[status] || status
}

function getStatusType(status) {
  return {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }[status] || 'info'
}

function openHandleDialog(request, action) {
  handleDialog.visible = true
  handleDialog.action = action
  handleDialog.request = request
  handleDialog.remark = ''
}

async function submitHandle() {
  if (!handleDialog.request) return
  handleDialog.submitting = true
  try {
    await returnRequestAPI.updateStatus(handleDialog.request.id, handleDialog.action, handleDialog.remark)
    ElMessage.success(handleDialog.action === 'approve' ? '已同意退款' : '已驳回申请')
    handleDialog.visible = false
    await loadRequests()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '处理退货申请失败')
  } finally {
    handleDialog.submitting = false
  }
}

onMounted(() => {
  loadRequests()
})
</script>

<style scoped>
.return-request-list {
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
</style>

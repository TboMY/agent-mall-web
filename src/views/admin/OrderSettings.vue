<template>
  <div class="order-settings">
    <div class="page-header">
      <h2>订单设置</h2>
    </div>

    <el-card>
      <p>这里预留给订单状态流转、自动取消、发货策略等配置。</p>
    </el-card>
  </div>
</template>

<style scoped>
.order-settings {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

p {
  margin: 0;
  color: #606266;
  line-height: 1.7;
}
</style>

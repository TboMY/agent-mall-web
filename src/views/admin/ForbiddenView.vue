<template>
  <el-card class="forbidden-card">
    <h2>无权限访问</h2>
    <p>当前账号没有访问这个页面的权限。如果这是预期外的情况，请使用更高权限账号登录。</p>
    <el-button type="primary" @click="$router.push('/admin/dashboard')">返回仪表盘</el-button>
  </el-card>
</template>

<style scoped>
.forbidden-card {
  max-width: 520px;
  margin: 80px auto;
  text-align: center;
}

.forbidden-card h2 {
  margin-bottom: 12px;
}

.forbidden-card p {
  color: #606266;
  margin-bottom: 20px;
}
</style>

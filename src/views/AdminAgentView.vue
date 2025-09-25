<script setup>
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { ref } from 'vue'
import { agentLogs, products } from '@/mock/data'

const loading = ref(false)
const logs = ref(agentLogs)
const todayPreview = products.slice(0, 4)

function triggerAgent() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    logs.value = [
      { time: new Date().toLocaleString(), added: 3, source: '抖音' },
      ...logs.value.slice(0, 4)
    ]
    ElMessage.success('成功上架3个商品')
  }, 3000)
}
</script>

<template>
  <el-container direction="vertical">
    <NavBar />
    <el-main class="page-container">
      <h2>AI Agent 选品控制台</h2>
      <el-button type="success" :loading="loading" @click="triggerAgent">▶ 手动触发AI选品</el-button>

      <h3 style="margin-top: 16px;">最近5次Agent执行日志</h3>
      <el-table :data="logs" style="width: 100%">
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="added" label="上架商品数" />
        <el-table-column prop="source" label="来源平台" />
      </el-table>

      <h3 style="margin-top: 16px;">今日AI推荐商品（预览）</h3>
      <el-row :gutter="16">
        <el-col v-for="item in todayPreview" :key="item.id" :xs="12" :sm="8" :md="6" :lg="6">
          <el-card shadow="never">
            <img :src="item.image" style="width:100%; height:120px; object-fit:cover;" />
            <div style="margin-top:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ item.name }}</div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
    <SiteFooter />
  </el-container>
</template>



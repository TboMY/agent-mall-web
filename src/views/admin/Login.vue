<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const form = ref({ username: '', password: '' })
const loading = ref(false)

function onSubmit() {
  loading.value = true
  setTimeout(() => {
    const ok = auth.login(form.value.username, form.value.password)
    loading.value = false
    if (ok) router.replace('/admin/dashboard')
    else ElMessage.error('账号或密码错误（示例）')
  }, 800)
}
</script>

<template>
  <div style="display:flex; align-items:center; justify-content:center; min-height:100vh;">
    <el-card style="width: 360px;">
      <h3 style="text-align:center; margin-bottom: 16px;">管理员登录</h3>
      <el-form @submit.prevent="onSubmit">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" />
        </el-form-item>
        <el-button type="primary" :loading="loading" style="width:100%;" @click="onSubmit">登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>



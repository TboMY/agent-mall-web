<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCustomerAuthStore } from '@/stores/customerAuth'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const customerAuth = useCustomerAuthStore()
const cart = useCartStore()

const saving = ref(false)
const loginFormRef = ref()
const registerFormRef = ref()

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  gender: 0
})

const isRegister = computed(() => route.path === '/register')
const pageTitle = computed(() => isRegister.value ? '创建你的商城账号' : '登录后继续购物')

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度为2-50个字符', trigger: 'blur' }
  ],
  nickname: [
    { max: 50, message: '昵称不能超过50个字符', trigger: 'blur' }
  ],
  phone: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        if (!/^1\d{10}$/.test(value)) {
          callback(new Error('请输入正确的11位手机号'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度为6-50个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
}

function getRedirectPath() {
  return typeof route.query.redirect === 'string' && route.query.redirect
    ? route.query.redirect
    : '/account'
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.errors?.[0]?.message
    || error?.response?.data?.message
    || fallback
}

async function submitLogin() {
  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    await customerAuth.login(loginForm)
    await cart.fetchCart()
    ElMessage.success('登录成功')
    router.replace(getRedirectPath())
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '登录失败'))
  } finally {
    saving.value = false
  }
}

async function submitRegister() {
  const valid = await registerFormRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    await customerAuth.register(registerForm)
    await cart.fetchCart()
    ElMessage.success('注册成功')
    router.replace(getRedirectPath())
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '注册失败'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="am-auth-page">
    <div class="am-auth-page__backdrop"></div>
    <div class="page-container am-auth-page__main">
      <section class="am-auth-page__shell">
        <button type="button" class="am-auth-page__brand-panel" @click="router.push('/')">
          <div class="am-auth-page__brand-letter">A</div>
          <div class="am-auth-page__brand-name">Agent Mall</div>
        </button>

        <div class="am-auth-page__form-panel">
          <div class="am-auth-page__tabs">
            <button
              type="button"
              :class="['am-auth-page__tab', { 'is-active': !isRegister }]"
              @click="router.replace({ path: '/login', query: route.query })"
            >
              登录
            </button>
            <button
              type="button"
              :class="['am-auth-page__tab', { 'is-active': isRegister }]"
              @click="router.replace({ path: '/register', query: route.query })"
            >
              注册
            </button>
          </div>

          <div class="am-auth-page__head">
            <h1>{{ pageTitle }}</h1>
          </div>

          <el-form
            v-if="!isRegister"
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
            class="am-auth-page__form"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="loginForm.password" type="password" show-password placeholder="请输入密码" />
            </el-form-item>

            <div class="am-auth-page__helper-row">
              <span></span>
              <button type="button" class="am-auth-page__helper">忘记密码</button>
            </div>

            <button type="button" class="am-auth-page__primary" :disabled="saving" @click="submitLogin">
              {{ saving ? '登录中...' : '立即登录' }}
            </button>
          </el-form>

          <el-form
            v-else
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-position="top"
            class="am-auth-page__form"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="registerForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="registerForm.nickname" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="registerForm.password" type="password" show-password placeholder="请输入密码" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" show-password placeholder="请再次输入密码" />
            </el-form-item>

            <button type="button" class="am-auth-page__primary" :disabled="saving" @click="submitRegister">
              {{ saving ? '注册中...' : '创建账号' }}
            </button>
          </el-form>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
.am-auth-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(244, 186, 92, 0.22), transparent 22%),
    radial-gradient(circle at bottom right, rgba(45, 89, 132, 0.18), transparent 28%),
    #f7f3ea;
}

.am-auth-page__backdrop {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 42%),
    radial-gradient(circle at 20% 18%, rgba(255,255,255,0.42), transparent 18%);
  pointer-events: none;
}

.am-auth-page__main {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 40px;
  padding-bottom: 40px;
}

.am-auth-page__shell {
  width: min(100%, 860px);
  display: grid;
  grid-template-columns: 220px 1fr;
  border-radius: 32px;
  overflow: hidden;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(19,35,55,0.08);
  box-shadow: 0 22px 54px rgba(24,39,62,0.1);
  backdrop-filter: blur(18px);
}

.am-auth-page__brand-panel,
.am-auth-page__tab,
.am-auth-page__primary,
.am-auth-page__helper {
  appearance: none;
  -webkit-appearance: none;
  border: none;
  font: inherit;
}

.am-auth-page__brand-panel {
  background: linear-gradient(180deg, #173b62 0%, #11304e 100%);
  color: #d8ba7a;
  cursor: pointer;
}

.am-auth-page__brand-panel:hover {
  filter: brightness(1.02);
}

.am-auth-page__brand-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}

.am-auth-page__brand-letter {
  font-size: 104px;
  line-height: 1;
  font-family: Georgia, "Times New Roman", serif;
}

.am-auth-page__brand-name {
  margin-top: 12px;
  font-size: 21px;
  font-weight: 800;
}

.am-auth-page__brand-panel {
  flex-direction: column;
  text-align: center;
}

.am-auth-page__form-panel {
  padding: 34px 30px 30px;
}

.am-auth-page__tabs {
  display: flex;
  gap: 26px;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(19,35,55,0.12);
}

.am-auth-page__tab {
  min-height: 36px;
  padding: 0;
  background: transparent;
  color: #627385;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  position: relative;
}

.am-auth-page__tab.is-active {
  color: #18304f;
}

.am-auth-page__tab.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -15px;
  height: 3px;
  border-radius: 999px;
  background: #18304f;
}

.am-auth-page__head h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.08;
  color: #132337;
}

.am-auth-page__form {
  margin-top: 22px;
}

.am-auth-page__helper-row {
  margin-top: -4px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.am-auth-page__helper {
  padding: 0;
  background: transparent;
  color: #5f7082;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.am-auth-page__primary {
  width: 100%;
  min-height: 50px;
  border-radius: 999px;
  background: linear-gradient(135deg, #18304f 0%, #23476d 100%);
  color: #e3c98f;
  font-weight: 800;
  cursor: pointer;
  box-shadow: inset 0 0 0 2px rgba(227, 201, 143, 0.24);
}

:deep(.am-auth-page__form .el-form-item) {
  margin-bottom: 18px;
}

:deep(.am-auth-page__form .el-form-item__label) {
  color: #24384d;
  font-weight: 700;
}

:deep(.am-auth-page__form .el-input__wrapper) {
  min-height: 44px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px rgba(185, 150, 83, 0.26) inset;
}

@media (max-width: 780px) {
  .am-auth-page__shell {
    grid-template-columns: 1fr;
  }

  .am-auth-page__brand-panel {
    padding: 28px 24px;
  }

  .am-auth-page__brand-letter {
    font-size: 74px;
  }

  .am-auth-page__form-panel {
    padding: 24px;
  }

  .am-auth-page__head h1 {
    font-size: 28px;
  }
}
</style>

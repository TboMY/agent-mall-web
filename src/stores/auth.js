import { defineStore } from 'pinia'
import { authAPI } from '@/services/api'

const TOKEN_KEY = 'adm_token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: null,
    permissions: [],
    initialized: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    hasPermission: (state) => (permission) => state.permissions.includes(permission),
    displayName: (state) => state.user?.username || '管理员',
    roleLabel: (state) => state.user?.role_label || ''
  },
  actions: {
    setSession(payload) {
      this.token = payload?.token || this.token
      this.user = payload?.user || null
      this.permissions = payload?.permissions || []
      this.initialized = true

      if (this.token) {
        localStorage.setItem(TOKEN_KEY, this.token)
      }
    },

    clearSession() {
      this.token = ''
      this.user = null
      this.permissions = []
      this.initialized = true
      localStorage.removeItem(TOKEN_KEY)
    },

    async login(username, password) {
      const response = await authAPI.login({ username, password })
      this.setSession(response.data)
      return true
    },

    async fetchMe(force = false) {
      if (!this.token) {
        this.clearSession()
        return null
      }

      if (this.initialized && this.user && !force) {
        return this.user
      }

      try {
        const response = await authAPI.getMe()
        this.user = response.data.user
        this.permissions = response.data.permissions || []
        this.initialized = true
        return this.user
      } catch (error) {
        this.clearSession()
        throw error
      }
    },

    async bootstrap() {
      if (!this.token) {
        this.initialized = true
        return null
      }

      return this.fetchMe()
    },

    logout() {
      this.clearSession()
    }
  }
})


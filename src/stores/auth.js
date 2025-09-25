import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('adm_token') || ''
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    login(username, password) {
      // mock auth
      if (username && password) {
        this.token = 'mock-token'
        localStorage.setItem('adm_token', this.token)
        return true
      }
      return false
    },
    logout() {
      this.token = ''
      localStorage.removeItem('adm_token')
    }
  }
})



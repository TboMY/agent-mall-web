import { defineStore } from 'pinia'
import { customerAuthAPI, customerAddressAPI, customerOrderAPI } from '@/services/api'

const TOKEN_KEY = 'mall_token'

export const useCustomerAuthStore = defineStore('customerAuth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: null,
    addresses: [],
    orders: [],
    initialized: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    displayName: (state) => state.user?.nickname || state.user?.username || '用户',
    defaultAddress: (state) => state.addresses.find((item) => Number(item.is_default) === 1) || state.addresses[0] || null
  },
  actions: {
    setSession(payload) {
      this.token = payload?.token || this.token
      this.user = payload?.user || null
      this.initialized = true
      if (this.token) {
        localStorage.setItem(TOKEN_KEY, this.token)
      }
    },

    clearSession() {
      this.token = ''
      this.user = null
      this.addresses = []
      this.orders = []
      this.initialized = true
      localStorage.removeItem(TOKEN_KEY)
    },

    async login(form) {
      const response = await customerAuthAPI.login(form)
      this.setSession(response.data)
      await Promise.all([this.fetchAddresses(), this.fetchOrders()])
      return response
    },

    async register(form) {
      const response = await customerAuthAPI.register(form)
      this.setSession(response.data)
      await Promise.all([this.fetchAddresses(), this.fetchOrders()])
      return response
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
        const response = await customerAuthAPI.getMe()
        this.user = response.data.user
        this.initialized = true
        return this.user
      } catch (error) {
        this.clearSession()
        throw error
      }
    },

    async updateProfile(payload) {
      const response = await customerAuthAPI.updateProfile(payload)
      this.user = response.data.user
      return this.user
    },

    async updatePhone(payload) {
      const response = await customerAuthAPI.updatePhone(payload)
      this.user = response.data.user
      return this.user
    },

    async updatePassword(payload) {
      const response = await customerAuthAPI.updatePassword(payload)
      return response
    },

    async bootstrap() {
      if (!this.token) {
        this.initialized = true
        return null
      }
      await this.fetchMe()
      await Promise.allSettled([this.fetchAddresses(), this.fetchOrders()])
      return this.user
    },

    async fetchAddresses() {
      if (!this.token) return []
      const response = await customerAddressAPI.getAddresses()
      this.addresses = response.data || []
      return this.addresses
    },

    async saveAddress(payload) {
      const response = payload.id
        ? await customerAddressAPI.updateAddress(payload.id, payload)
        : await customerAddressAPI.createAddress(payload)
      this.addresses = response.data?.items || response.data || []
      return this.addresses
    },

    async setDefaultAddress(id) {
      const response = await customerAddressAPI.setDefault(id)
      this.addresses = response.data || []
      return this.addresses
    },

    async deleteAddress(id) {
      const response = await customerAddressAPI.deleteAddress(id)
      this.addresses = response.data || []
      return this.addresses
    },

    async fetchOrders() {
      if (!this.token) return []
      const response = await customerOrderAPI.getOrders({ page: 1, limit: 20 })
      this.orders = response.data || []
      return this.orders
    },

    async createAlipayPayment(orderId) {
      const response = await customerOrderAPI.payAlipay(orderId)
      return response.data
    },

    async cancelOrder(orderId) {
      const response = await customerOrderAPI.cancelOrder(orderId)
      await this.fetchOrders()
      return response.data
    },

    async confirmOrderReceipt(orderId) {
      const response = await customerOrderAPI.confirmReceipt(orderId)
      await this.fetchOrders()
      return response.data
    },

    async createReturnRequest(orderId, payload) {
      const response = await customerOrderAPI.createReturnRequest(orderId, payload)
      await this.fetchOrders()
      return response.data
    },

    logout() {
      this.clearSession()
    }
  }
})

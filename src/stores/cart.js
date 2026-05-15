import { defineStore } from 'pinia'
import { cartAPI, customerOrderAPI } from '@/services/api'
import { useCustomerAuthStore } from '@/stores/customerAuth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false
  }),
  getters: {
    count: (state) => state.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    selectedItems: (state) => state.items.filter((item) => Number(item.selected) === 1),
    selectedTotal: (state) => state.items
      .filter((item) => Number(item.selected) === 1)
      .reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)
  },
  actions: {
    clear() {
      this.items = []
      this.loading = false
    },

    async fetchCart() {
      const customer = useCustomerAuthStore()
      if (!customer.isAuthenticated) {
        this.clear()
        return []
      }
      this.loading = true
      try {
        const response = await cartAPI.getCart()
        this.items = response.data || []
        return this.items
      } finally {
        this.loading = false
      }
    },

    async addItem(skuId, quantity = 1) {
      const response = await cartAPI.addItem({
        sku_id: skuId,
        quantity
      })
      this.items = response.data || []
      return this.items
    },

    async updateItem(id, payload) {
      const response = await cartAPI.updateItem(id, payload)
      this.items = response.data || []
      return this.items
    },

    async removeItem(id) {
      const response = await cartAPI.deleteItem(id)
      this.items = response.data || []
      return this.items
    },

    async toggleSelected(id, selected) {
      return await this.updateItem(id, { selected: selected ? 1 : 0 })
    },

    async toggleAll(selected) {
      const snapshot = [...this.items]
      for (const item of snapshot) {
        await this.updateItem(item.id, { selected: selected ? 1 : 0, quantity: item.quantity })
      }
      return this.items
    },

    async checkout(addressId, remark = '') {
      const selectedIds = this.selectedItems.map((item) => item.id)
      const response = await customerOrderAPI.checkout({
        item_ids: selectedIds,
        address_id: addressId || undefined,
        remark
      })
      this.items = this.items.filter((item) => !selectedIds.includes(item.id))
      return response.data
    }
  }
})

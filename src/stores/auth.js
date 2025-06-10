import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: ''
  }),
  actions: {
    setAccessToken(token) {
      this.accessToken = token
    },
    clearAccessToken() {
      this.accessToken = ''
    }
  }
})
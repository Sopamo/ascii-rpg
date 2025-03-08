import { defineStore } from 'pinia'
import { acceptHMRUpdate } from 'pinia'

export type ToastType = 'info' | 'error' | 'warning' | 'success'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
  timestamp: number
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
    counter: 0
  }),
  actions: {
    addToast(message: string, type: ToastType = 'info', duration: number = 5000) {
      const id = this.counter++
      const toast: Toast = {
        id,
        message,
        type,
        duration,
        timestamp: Date.now()
      }
      this.toasts.push(toast)
      
      // Auto-remove toast after duration
      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id)
        }, duration)
      }
      
      return id
    },
    
    removeToast(id: number) {
      const index = this.toasts.findIndex(toast => toast.id === id)
      if (index !== -1) {
        this.toasts.splice(index, 1)
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useToastStore, import.meta.hot))
}

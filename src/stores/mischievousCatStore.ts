import { defineStore } from 'pinia'

type MessageHistoryEntry = {
  role: 'user' | 'system'
  content: any
}

export const useMischievousCatStore = defineStore('mischievousCat', {
  state() {
    return {
      messageHistory: [] as MessageHistoryEntry[],
      memory: [] as string[],
    }
  },
})

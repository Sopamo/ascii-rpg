import { defineStore } from 'pinia'
import { acceptHMRUpdate } from "pinia"

type MessageHistoryEntry = {
  role: 'user' | 'system'
  content: any
}

export const useOldLadyStore = defineStore('oldLady', {
  state() {
    return {
      messageHistory: [] as MessageHistoryEntry[],
      memory: [] as string[],
    }
  },
})


if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(acceptHMRUpdate(useOldLadyStore, import.meta.hot))
}

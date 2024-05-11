import { defineStore } from 'pinia'
import { sendDungeonMasterMessage, sendOldLadyMessage } from '@/aiMessage'
import { usePromptStore } from '@/stores/promptStore'

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

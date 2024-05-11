import { defineStore } from 'pinia'
import { sendDungeonMasterMessage, sendMischievousCatMessage, sendOldLadyMessage } from '@/aiMessage'

type MessageHistoryEntry = {
  role: 'user' | 'system'
  content: any
}

export const usePromptStore = defineStore('prompt', {
  state() {
    return {
      prompt: '',
      isLoading: false,
      messageHistory: [] as MessageHistoryEntry[],
      isFocused: false,
      currentMessage: null as string | null,
      memory: [] as string[],
      talkingTo: null as null | 'oldLady' | 'mischievousCat'
    }
  },
  actions: {
    updateMemoryFromResponse(responseJSON: any, talkingTo: null|string = null) {
      if (responseJSON.memorize) {
        let memo = responseJSON.memorize
        if(talkingTo) {
          memo += ` (talking to: ${talkingTo})`
        }
        this.memory.push(memo)
      }
    },
    async submitPrompt() {
      this.isLoading = true
      let responseJSON = {}
      try {
        this.messageHistory.push({ role: 'user', content: this.prompt })
        switch(this.talkingTo) {
          case "oldLady":
            responseJSON = await sendOldLadyMessage(usePromptStore().prompt)
            this.updateMemoryFromResponse(responseJSON, 'oldLady')
            break
          case "mischievousCat":
            responseJSON = await sendMischievousCatMessage(usePromptStore().prompt)
            this.updateMemoryFromResponse(responseJSON, 'mischievousCat')
            break
          default:
            responseJSON = await sendDungeonMasterMessage(usePromptStore().prompt)
            this.messageHistory.push({ role: 'system', content: responseJSON })
            this.updateMemoryFromResponse(responseJSON)
        }
        this.messageHistory.push({ role: 'system', content: responseJSON })
        this.prompt = ''
      } catch (e) {
        alert('Whoops, the AI gods dont seem to like you today. Please try again.')
        console.error(e)
      }
      this.isLoading = false
      return responseJSON
    }
  }
})

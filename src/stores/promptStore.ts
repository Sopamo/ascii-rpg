import { defineStore } from 'pinia'
import { sendDungeonMasterMessage } from '@/aiMessage'
import { events } from '@/events'
import { acceptHMRUpdate } from "pinia"
import { getCurrentEnvironment } from '@/environments/Environment'
import { useToastStore } from './toastStore'

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
      talkingTo: null as null | string
    }
  },
  actions: {
    updateMemoryFromResponse(responseJSON: any, talkingTo: null|string = null) {
      if (responseJSON?.memorize) {
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
        events.emit("playerSpoke", {
          message: this.prompt
        })
        this.isLoading = false
        switch(this.talkingTo) {
          default:
            const actor = getCurrentEnvironment().actors.find(actor => actor.id === this.talkingTo)
            if(actor && actor.handlePlayerMessage) {
              responseJSON = await actor.handlePlayerMessage(this.prompt)
              this.updateMemoryFromResponse(responseJSON)
            } else {
              responseJSON = await sendDungeonMasterMessage(usePromptStore().prompt)
              this.updateMemoryFromResponse(responseJSON)
              events.emit('dungeonMasterSpoke', {
                message: responseJSON.response
              })
            }
        }
        console.log('DONE', responseJSON)
        if(responseJSON.response) {
          this.messageHistory.push({ role: 'system', content: responseJSON })
        }
        this.prompt = ''
      } catch (e) {
        console.error(e)
        
        // Handle rate limit errors
        if (e.name === 'RateLimitError' || (e.message && e.message.includes('429 Rate limit'))) {
          const toastStore = useToastStore()
          
          // Extract wait time from error message if available
          let waitTime = ''
          const waitTimeMatch = e.message.match(/try again in ([\d\.]+)s/i)
          if (waitTimeMatch && waitTimeMatch[1]) {
            waitTime = waitTimeMatch[1]
          }
          
          const message = waitTime 
            ? `Rate limit exceeded. Please wait ${waitTime} seconds before trying again.` 
            : 'Rate limit exceeded. Please wait a moment before trying again.'
          
          toastStore.addToast(message, 'error', 8000)
        } else {
          // For other errors, show a generic message
          const toastStore = useToastStore()
          toastStore.addToast('The whole world froze for a second. Nothing happened. Please try again.', 'warning', 5000)
        }
      }
      this.isLoading = false
      return responseJSON
    }
  }
})

if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(acceptHMRUpdate(usePromptStore, import.meta.hot))
}

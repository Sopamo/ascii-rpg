import { defineStore } from 'pinia'
import { sendDungeonMasterMessage, sendGroqMessage } from '@/aiMessage'
import { events } from '@/events'
import { acceptHMRUpdate } from "pinia"
import { getCurrentEnvironment } from '@/environments/Environment'
import { useToastStore } from './toastStore'
import { usePlayerStore } from './playerStore'

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
    async checkForAbilityCheck(userMessage: string) {
      // Get the player's ability scores
      const playerStore = usePlayerStore()
      const abilities = Object.keys(playerStore.abilityScores)
      
      // Create a system prompt to determine if an ability check is needed
      const systemPrompt = `You are an AI assistant for a text-based RPG game. Your task is to analyze the player's message and determine if it requires an ability check.
      
      The player has the following abilities: ${abilities.join(', ')}.
      
      Analyze the following player message and determine:
      1. If the action requires an ability check
      2. If yes, which ability should be checked
      
      Respond ONLY with a valid JSON object in this format:
      {
        "reasoning": string (brief explanation of why this ability is needed)
        "requiresAbilityCheck": boolean,
        "ability": string (must be one of: ${abilities.join(', ')}),
      }
      
      If no ability check is required, set "requiresAbilityCheck" to false and leave "ability" as null.
      If an ability check is required, set "requiresAbilityCheck" to true and "ability" to the most appropriate ability from the list.
      `
      
      try {
        // Send the request to determine if an ability check is needed
        const result = await sendGroqMessage(systemPrompt, userMessage, "llama-3.3-70b-specdec")
        console.log('Ability check result:', result.json)
        return result.json
      } catch (error) {
        console.error('Error checking for ability check:', error)
        // Return a default response if there's an error
        return { requiresAbilityCheck: false, ability: null, reasoning: null }
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
        
        // Step 3: Check if the message requires an ability check
        const abilityCheckResult = await this.checkForAbilityCheck(this.prompt)
        
        // If an ability check is required, store it for later use
        const playerStore = usePlayerStore()
        if (abilityCheckResult.requiresAbilityCheck && abilityCheckResult.ability) {
          // Store the ability check information in the player store
          playerStore.setPendingAbilityCheck(abilityCheckResult.ability, abilityCheckResult.reasoning)
          console.log(`Ability check required: ${abilityCheckResult.ability} - ${abilityCheckResult.reasoning}`)
          // You might want to trigger a dice roll here or notify the user about the ability check
        } else {
          // Clear any pending ability check if none is required
          playerStore.clearPendingAbilityCheck()
        }
        
        this.isLoading = false
        switch(this.talkingTo) {
          default: {
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
        }
        console.log('DONE', responseJSON)
        if(responseJSON.response) {
          this.messageHistory.push({ role: 'system', content: responseJSON })
        }
        this.prompt = ''
      } catch (e: unknown) {
        console.error(e)
        
        // Handle rate limit errors
        if (e instanceof Error && (e.name === 'RateLimitError' || (e.message && e.message.includes('429 Rate limit')))) {
          const toastStore = useToastStore()
          
          // Extract wait time from error message if available
          let waitTime = ''
          const waitTimeMatch = e instanceof Error ? e.message.match(/try again in ([\d.]+)s/i) : null
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

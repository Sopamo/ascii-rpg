import { defineStore } from 'pinia'
import { acceptHMRUpdate } from "pinia"

export const useDiceStore = defineStore('dice', {
  state() {
    return {
      diceValue: 0,
      abilityCheckResult: null as null | {
        ability: string,
        abilityScore: number,
        diceValue: number,
        totalScore: number,
        isSuccess: boolean,
        reasoning: string
      }
    }
  },
  actions: {
    
    // Record the result of an ability check
    recordAbilityCheck(ability: string, abilityScore: number, diceValue: number, reasoning: string) {
      // Calculate total score as dice roll + ability score
      const totalScore = diceValue + abilityScore
      
      // Store the dice value for later use
      this.diceValue = diceValue
      
      // We no longer determine success here - that's now done by comparing to difficulty in the AI response
      this.abilityCheckResult = {
        ability,
        abilityScore,
        diceValue,
        totalScore,
        isSuccess: false, // This will be determined later by comparing to difficulty
        reasoning
      }
      
      return totalScore
    },
    
    // Clear the ability check result
    clearAbilityCheckResult() {
      this.abilityCheckResult = null
    }
  }
})

if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(acceptHMRUpdate(useDiceStore, import.meta.hot))
}

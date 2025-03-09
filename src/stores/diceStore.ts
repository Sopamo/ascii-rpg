import { defineStore } from 'pinia'
import { acceptHMRUpdate } from "pinia"

export const useDiceStore = defineStore('dice', {
  state() {
    return {
      successProbability: 0,
      diceValue: 0
    }
  },
  actions: {
    setSuccessProbability(probability: number) {
      this.successProbability = probability
      // Convert to a dice value (1-6)
      this.diceValue = Math.ceil(probability * 6)
    }
  }
})

if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(acceptHMRUpdate(useDiceStore, import.meta.hot))
}

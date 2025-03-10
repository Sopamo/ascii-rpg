import { defineStore } from 'pinia'
import type { StatusEffect } from '@/actors/StatusEffects'
import { acceptHMRUpdate } from "pinia"

export const usePlayerStore = defineStore('player', {
  state() {
    return {
      inventory: [] as string[],
      playerPosition: [10, 10] as [number, number],
      characterSheet: "",
      statusEffects: [] as StatusEffect[],
      characterId: "",
      currentTime: Math.round(Date.now() / 1000),
      hp: 10,
      maxHp: 10,
      abilityScores: {} as Record<string, number>,
      pendingAbilityCheck: null as null | {
        ability: string,
        reasoning: string
      },
    }
  },
  getters: {
    inventoryString(): string {
      if (!this.inventory.length) {
        return 'Inventory is empty. Just a bit of dust and a few tiny breadcrumbs.'
      }
      return this.inventory.join('\n')
    }
  },
  actions: {
    setPendingAbilityCheck(ability: string | null, reasoning: string | null) {
      if (ability && reasoning) {
        this.pendingAbilityCheck = { ability, reasoning }
      } else {
        this.pendingAbilityCheck = null
      }
    },
    clearPendingAbilityCheck() {
      this.pendingAbilityCheck = null
    }
  }
})


if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(acceptHMRUpdate(usePlayerStore, import.meta.hot))
}

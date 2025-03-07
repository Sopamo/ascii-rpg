import { defineStore } from 'pinia'
import type { StatusEffect } from '@/actors/StatusEffects'
import { acceptHMRUpdate } from "pinia"

export const usePlayerStore = defineStore('player', {
  state() {
    return {
      inventory: [] as string[],
      playerPosition: [42, 2] as [number, number],
      characterSheet: "",
      statusEffects: [] as StatusEffect[],
      characterId: "",
      currentTime: Math.round(Date.now() / 1000),
      hp: 10,
      maxHp: 10,
    }
  },
  getters: {
    inventoryString(): string {
      if (!this.inventory.length) {
        return 'Inventory is empty. Just a bit of dust and a few tiny breadcrumbs.'
      }
      return this.inventory.join('\n')
    }
  }
})


if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(acceptHMRUpdate(usePlayerStore, import.meta.hot))
}

import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state() {
    return {
      inventory: [] as string[],
      playerPosition: [13, 13] as [number, number],
      characterSheet: "",
      characterId: "",
      currentTime: Math.round(Date.now() / 1000),
      hp: 10,
      maxHp: 10,
    }
  },
  actions: {
    updateInventoryFromResponse(responseJSON: any) {
      if (responseJSON?.inventoryActions?.add) {
        responseJSON.inventoryActions.add.forEach((item: string) => this.inventory.push(item))
      }

      if (responseJSON?.inventoryActions?.remove) {
        this.inventory = this.inventory.filter(inventoryItem => !responseJSON.inventoryActions.remove.includes(inventoryItem))
      }
    },
    updateTimeFromResponse(response: any) {
      if (!response.minutesPassed) {
        return
      }
      this.currentTime += parseInt(response.minutesPassed, 10) * 60
    },
    updateHPFromResponse(response: any) {
      if (!response.hpChange) {
        return
      }
      this.hp = Math.max(0, Math.min(this.maxHp, this.hp + parseInt(response.hpChange, 10)))
      if (this.hp <= 0) {
        this.router.replace('/you-died')
      }
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

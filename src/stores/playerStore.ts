import { computed, type Ref, ref } from 'vue'
import { defineStore } from 'pinia'

function addItems(responseJSON: any, inventory: Ref<string[]>) {
  if(!responseJSON?.inventoryActions?.add) {
    return
  }
  responseJSON.inventoryActions.add.forEach((item: string) => inventory.value.push(item))
}
function removeItems(responseJSON: any, inventory: Ref<string[]>) {
  if(!responseJSON?.inventoryActions?.remove) {
    return
  }
  inventory.value = inventory.value.filter(inventoryItem => !responseJSON.inventoryActions.remove.includes(inventoryItem))
}

export const usePlayerStore = defineStore('player', () => {
  const inventory = ref<string[]>([])
  const playerPosition = ref<[number,number]>([13,13])
  const currentTime = ref<number>(Math.round(Date.now() / 1000))

  function updateInventoryFromResponse(response: any) {
    addItems(response, inventory)
    removeItems(response, inventory)
  }
  function updateTimeFromResponse(response: any) {
    if(!response.minutesPassed) {
      return
    }
    currentTime.value += parseInt(response.minutesPassed, 10) * 60
  }

  const inventoryString = computed(() => {
    if(!inventory.value.length) {
      return 'Inventory is empty. Just a bit of dust and a few tiny breadcrumbs.'
    }
    return inventory.value.join("\n")
  })

  return { inventory, inventoryString, playerPosition, currentTime, updateInventoryFromResponse, updateTimeFromResponse }
})

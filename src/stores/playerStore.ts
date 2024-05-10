import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
function getItemNamesToAdd(str: string) {
  const regex = /<give-item>(.*?)<\/give-item>/g;
  const matches = str.match(regex);
  const itemNames: string[] = [];

  if (matches) {
    for (const match of matches) {
      const itemName = match.replace(/<give-item>(.*?)<\/give-item>/, '$1');
      itemNames.push(itemName);
    }
  }

  return itemNames;
}
function getItemNamesToRemove(str: string) {
  const regex = /<remove-item>(.*?)<\/remove-item>/g;
  const matches = str.match(regex);
  const itemNames: string[] = [];

  if (matches) {
    for (const match of matches) {
      const itemName = match.replace(/<remove-item>(.*?)<\/remove-item>/, '$1');
      itemNames.push(itemName);
    }
  }

  return itemNames;
}


export const usePlayerStore = defineStore('player', () => {
  const inventory = ref<string[]>([])
  const playerPosition = ref<[number,number]>([13,13])

  function updateInventoryFromResponse(response: string) {
    const itemsToAdd = getItemNamesToAdd(response)
    itemsToAdd.forEach(item => inventory.value.push(item))
    const itemsToRemove = getItemNamesToRemove(response)
    inventory.value = inventory.value.filter(inventoryItem => !itemsToRemove.includes(inventoryItem))
  }

  const inventoryString = computed(() => {
    if(!inventory.value.length) {
      return 'Inventory is empty'
    }
    return inventory.value.join("\n")
  })

  return { inventory, inventoryString, playerPosition, updateInventoryFromResponse }
})

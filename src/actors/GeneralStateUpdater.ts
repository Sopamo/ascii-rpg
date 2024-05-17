import { Actor } from '@/actors/Actor'
import { events } from '@/events'
import {
  getCurrentStatusEffects,
  getCurrentTime,
  getInventoryString,
  sendMessage
} from '@/aiMessage'
import { usePlayerStore } from '@/stores/playerStore'
import { ref } from 'vue'

type ResponseJSON = {
  inventoryActions?:
    {
      add: string[]
      remove: string[]
    }
  minutesPassed?: number
  hpChange?: number
}

export class GeneralStateUpdater extends Actor {
  id = 'generalStateUpdater'
  eventHandlerSetup = false
  currentUpdates = ref<ResponseJSON>({})

  constructor() {
    super()
    if (!this.eventHandlerSetup) {
      this.eventHandlerSetup = true
      events.on('dungeonMasterSpoke', ({ message }) => this.runStep(message))
      events.on('npcSpoke', ({ message }) => this.runStep(message))
    }
  }

  async runStep(message: string) {
    const changes = await this.calculateChanges(message)
    this.currentUpdates.value = changes
    this.updateInventoryFromResponse(changes)
    this.updateTimeFromResponse(changes)
    this.updateHPFromResponse(changes)
  }

  updateInventoryFromResponse(responseJSON: ResponseJSON) {
    if (responseJSON?.inventoryActions?.add) {
      responseJSON.inventoryActions.add.forEach((item: string) => usePlayerStore().inventory.push(item))
    }

    if (responseJSON?.inventoryActions?.remove) {
      usePlayerStore().inventory = usePlayerStore().inventory.filter(inventoryItem => !responseJSON.inventoryActions.remove.includes(inventoryItem))
    }
  }

  updateTimeFromResponse(response: ResponseJSON) {
    if (!response.minutesPassed) {
      return
    }
    usePlayerStore().currentTime += parseInt(`${response.minutesPassed}`, 10) * 60
  }

  updateHPFromResponse(response: ResponseJSON) {
    if (!response.hpChange) {
      return
    }
    usePlayerStore().hp = Math.max(0, Math.min(usePlayerStore().maxHp, usePlayerStore().hp + parseInt(`${response.hpChange}`, 10)))
    if (usePlayerStore().hp <= 0) {
      usePlayerStore().router.replace('/you-died')
    }
  }

  async calculateChanges(message: string): Promise<ResponseJSON> {

    const prompt = `You are an observer of a turn based rpg game and get passed the current message from the dungeon master.
It's your job to determine different state updates.
You respond with json, which contains HP changes, player inventory changes and how much time has passed.
Estimate how much time has passed by doing what the Dungeon Master said and output that in the JSON in the "minutesPassed" key.
If fitting the action, you can (rarely) add or subtract hp, by giving a number between -10 and 10 in the "hpChange" key in the JSON.
If a trade was successful, use inventoryActions.add to add the item they received to the players inventory and inventoryActions.remove to remove the item the player gave away for trading.
You respond only with valid json of this structure:
{"inventoryActions":{"add": ["itemName"], "remove": ["itemName"]},"minutesPassed": 30, "hpChange": 0}`

    const currentStatus = `Player character sheet:
${usePlayerStore().characterSheet}
Player inventory:
${getInventoryString()}
Player HP:
${usePlayerStore().hp}/${usePlayerStore().maxHp}
Player status effects:
${getCurrentStatusEffects()}
Current time:
${getCurrentTime()}
Dungeon Master Message:
${message}
Only respond with json.`

    return await sendMessage(prompt, currentStatus, 'llama3-70b-8192')
  }
}

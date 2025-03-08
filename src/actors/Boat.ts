import { Actor } from '@/actors/Actor'
import { events } from '@/events'
import { reactive } from 'vue'
import { usePromptStore } from '@/stores/promptStore'
import { getCommonMetaInfo, getInventoryPrompt, getLastDungeonMasterMessage, sendMessage } from '@/aiMessage'

export class Boat extends Actor {
  id = 'boat'
  label: string = 'Wooden boat'
  mapImage: undefined|string = undefined
  eventHandlerSetup = false
  position = reactive({ x: 7, y: 11 }) // Position from the map where '2' is located
  canPass = false
  canTalkTo = true
  canUse = true

  async handlePlayerMessage(message: string) {
    const responseJSON = await this.respond(message)
    usePromptStore().updateMemoryFromResponse(responseJSON, 'boat')
    if (responseJSON.response) {
      events.emit('npcSpoke', {
        actor: 'boat',
        message: responseJSON.response
      })
    }
    if (responseJSON.hasOars === true) {
      this.canPass = true
      this.mapImage = "boatWithOars.webp" // You can adjust this image name as needed
    }
    return responseJSON
  }

  async respond(message: string) {
    const prompt = `You are a dungeon master describing a boat.
    You respond with json, that contains a short & funny narrator-like sentence (try to limit yourself to one sentence) that describes what happens in the field "response". You should use words that would be used in a high level fantasy novel. If you want, you can address the player with "you ...".
    Assume the player doesn't have access to any items, apart from the ones in their inventory. They can't just find / pick up / use things that are not in their inventory!
    Never assume / say that the player has moved somewhere, they will move themselves in this game.
    If they used an item in a way that would consume it, or makes it not available to them anymore, remove it from their inventory, via the inventory action in the json.
    If something noteworthy happened, provide an extremely short summary (a few words) that we should commit to memory for the long term game. Put it into the "memorize" key in the json.
    If the player tries to find, pick up, or use in any way an item that is not mentioned and not in their inventory, make them aware of the fact that they don't have that item. You never assume or imply that the player has any items that are not in the inventory or that they just created.
    ${getInventoryPrompt()}
    ${getCommonMetaInfo()}
    ${getLastDungeonMasterMessage()}
    If the player tries to be clever and trick you (the dungeon master), just make a funny remark and disallow them from doing that.
    If on the other hand, the player does something that is possible, you don't decide for them that they don't want to do it, but just let them do it. 
    The player is looking at a tiny wooden boat without a sail and without oars, sitting at the lake's edge. The boat cannot be effectively used without some way to propel it.
    The player can get in the boat, but cannot effectively use it for travel without finding oars or some other means of propulsion. Don't tell them this directly, but hint that they need something to move the boat forward.
    You respond only with valid json of this structure:
    {"response":"","memorize":"",hasOars: false,"inventoryActions":{"add": ["itemName"], "remove": ["itemName"]}}
    `
    const playerMessage = `Player message:
${message}
Only respond with json.`

    return await sendMessage(prompt, playerMessage, 'llama-3.1-70b-versatile')
  }
}

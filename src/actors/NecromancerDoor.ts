import { Actor } from '@/actors/Actor'
import { events } from '@/events'
import { reactive } from 'vue'
import { usePromptStore } from '@/stores/promptStore'
import { getCommonMetaInfo, getInventoryPrompt, getLastDungeonMasterMessage, sendMessage } from '@/aiMessage'

export class NecromancerDoor extends Actor {
  id = 'necromancerDoor'
  label: string = 'Closed and locked door'
  mapImage: undefined|string = undefined
  eventHandlerSetup = false
  position = reactive({ x: 42, y: 5 })
  canPass = false
  canTalkTo = true

  async handlePlayerMessage(message: string) {
    const responseJSON = await this.respond(message)
    usePromptStore().updateMemoryFromResponse(responseJSON, 'necromancerDoor')
    if (responseJSON.response) {
      events.emit('npcSpoke', {
        actor: 'necromancerDoor',
        message: responseJSON.response
      })
    }
    if (responseJSON.hasAddedBlood === true) {
      this.canPass = true
      this.mapImage = "necromancerDoorOpenMap.webp"
    }
    return responseJSON
  }

  async respond(message: string) {
    const prompt = `You are a dungeon master.
    You respond with json, that contains a short & funny narrator like sentence (try to limit yourself to once sentence) that describes what happens in the field "response". You should use words that would be used in a high level fantasy novel. If you want, you can address the player with "you ...".
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
    The player stands in front of a large closed and locked door of a mysterious tower. There is a small bowl splattered with blood protruding out of the door.
    The player cannot open the door. The only way to open it, is if the player somehow puts some kind of blood into the bowl. You are not to tell them this directly though, but only hint at the blood splatters in and around the bowl.
    You respond only with valid json of this structure:
    {"response":"","memorize":"",hasAddedBlood: false,"inventoryActions":{"add": ["itemName"], "remove": ["itemName"]}}
    `
    const playerMessage = `Player message:
${message}
Only respond with json.`

    return await sendMessage(prompt, playerMessage, 'llama3-70b-8192')
  }
}

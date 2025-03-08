import { Actor } from '@/actors/Actor'
import { events } from '@/events'
import { reactive } from 'vue'
import { usePromptStore } from '@/stores/promptStore'
import { usePlayerStore } from '@/stores/playerStore'
import { getCommonMetaInfo, getInventoryPrompt, getLastDungeonMasterMessage, sendMessage } from '@/aiMessage'

export class SeaMonster extends Actor {
  id = 'seaMonster'
  label: string = 'Sea Monster'
  mapImage: undefined|string = undefined
  eventHandlerSetup = false
  position = reactive({ x: 5, y: 3 }) // Position where '3' is located on the map
  canPass = false
  canTalkTo = false
  canUse = true
  isDefeated = false

  async handlePlayerMessage(message: string) {
    const responseJSON = await this.respond(message)
    usePromptStore().updateMemoryFromResponse(responseJSON, 'seaMonster')
    
    // Apply damage to player if they attack without the rusty sword
    if (responseJSON.damagePlayer === true) {
      const playerStore = usePlayerStore()
      playerStore.hp = Math.max(1, playerStore.hp - 5) // Reduce HP but don't kill the player
    }
    
    // Sea monster is defeated
    if (responseJSON.monsterDefeated === true) {
      this.isDefeated = true
      this.mapImage = "defeatedSeaMonster.webp" // You can adjust this image name as needed
    }
    
    if (responseJSON.response) {
      events.emit('npcSpoke', {
        actor: 'seaMonster',
        message: responseJSON.response
      })
    }
    return responseJSON
  }

  async respond(message: string) {
    const prompt = `You are a dungeon master describing a sea monster.
    You respond with json, that contains a short & dramatic narrator-like sentence (try to limit yourself to one sentence) that describes what happens in the field "response". You should use words that would be used in a high level fantasy novel. If you want, you can address the player with "you ...".
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
    The player is looking at a mighty sea monster in the lake. The sea monster is vulnerable against rust. If the player attacks it without a proper weapon it responds by explicitly injuring them. Hitting it with a rusty sword is super effective. Hitting it once or twice with a rusty sword would kill it. If the player manages to kill it, they get plentiful treasure (100 coins).
    You respond only with valid json of this structure:
    {"response":"","memorize":"", "damagePlayer": false, "monsterDefeated": false, "inventoryActions":{"add": ["itemName"], "remove": ["itemName"]}}
    
    If the player attacks the monster with anything other than a rusty sword, set damagePlayer to true and describe how the monster injures the player.
    If the player attacks the monster with a rusty sword, set monsterDefeated to true, add "100 coins" to their inventory via inventoryActions.add, and describe how the monster is defeated.
    `
    const playerMessage = `Player message:
${message}
Only respond with json.`

    return await sendMessage(prompt, playerMessage, 'llama-3.1-70b-versatile')
  }
}

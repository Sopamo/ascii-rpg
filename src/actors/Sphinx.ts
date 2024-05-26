import { Actor } from '@/actors/Actor'
import { events } from '@/events'
import { playAudio } from '@/helpers'
import { reactive } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { getCurrentStatusEffects, getCurrentTime, getInventoryString, sendMessage } from '@/aiMessage'
import { usePromptStore } from '@/stores/promptStore'

export class Sphinx extends Actor {
  id = 'sphinx'
  label: string = 'Sphinx'
  eventHandlerSetup = false
  position = reactive({ x: 45, y: 33 })
  canTalkTo = true
  hasAnsweredCorrectly = true

  async handlePlayerMessage(message: string) {
      const responseJSON = await this.respond(message)
      usePromptStore().updateMemoryFromResponse(responseJSON, 'sphinx')
      if(responseJSON.response) {
        events.emit('npcSpoke', {
          actor: 'sphinx',
          message: responseJSON.response
        })
      }
      if(responseJSON.correct === true) {
        this.position.x++
        this.hasAnsweredCorrectly = true
      }
      return responseJSON
  }

  async respond(message: string) {
    const attacks = ['splitting open their leg', 'hitting them hard', 'breaking their shoulder', 'slashing across their face']
    const attack = attacks[Math.floor(Math.random() * attacks.length)]
    const intro = `You are a mighty sphinx, that guards the path through the forest and gets presented something the player says to you, or an interaction that the player does.
You respond with as the sphinx, using a formal, enigmatic tone and with json, that contains the answer or the action that the sphinx takes in the field "response". If you want, you can address the player with "Intruder".
Respond as the sphinx, using a formal, enigmatic tone.`
    let prompt = `${intro}
If the player first approaches you, tell them the riddle and await their response.
If the player correctly answers "sapling", congratulate them and move out of the way. Indicate that by setting "correct" to true in the response json. Never say the word "sapling" yourself.
If the player answers incorrectly, you immediately explicitly attack them physically by ${attack}. You communicate that in your response. Inform them that they may try again though. Indicate by setting "correct" to false in the response json.
They can also choose to retreat
In a very short way, tell them about the rules.
The riddle is:

Flowing from trees, sweet and sticky, a treat so fine,
What essence could this be, in a vessel, a hidden sign?

Found in the midst of 'bleak' and 'black', it stands upright and true,
in a silent land with stormy lament, it offers you a clue.

The sound of movement, continuous and flowing,
It’s the tail end of verbs where life is showing.

Now string them together and answer this thing,
What is sprouting, ready for spring?

Keep the line breaks in the riddle.
You are not to help the player in any way.
If the player somehow tries to pass you without answering the riddle, immediately kill them on the spot and communicate that. 
If something noteworthy happened, provide an extremely short summary (a few words) that we should commit to memory for the long term game. Put it into the "memorize" key in the json.
You respond only with valid json of this structure:
{"response": string, "memorize": string, "correct": bool}`
  if(this.hasAnsweredCorrectly) {
    prompt = `The player has previously correctly answered your riddle, and you've let them pass. You do not want to talk to the player more, but only let them know they should pass while they can or in general behave as the mighty creature you are.
If something noteworthy happened, provide an extremely short summary (a few words) that we should commit to memory for the long term game. Put it into the "memorize" key in the json.
You respond only with valid json of this structure:
{"response": string, "memorize": string}
    `
  }
    const currentStatus = `Player message:
${message}
Only respond with json.`

    return await sendMessage(prompt, currentStatus, 'llama3-70b-8192')
  }
}

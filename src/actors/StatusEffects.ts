import { Actor } from '@/actors/Actor'
import { events } from '@/events'
import {
  getCommonMetaInfo, getCurrentStatusEffects, getCurrentTime,
  getInventoryString,
  getLastDungeonMasterMessage,
  getMapLegend,
  sendMessage
} from '@/aiMessage'
import { usePlayerStore } from '@/stores/playerStore'

export type StatusEffect = {
  label: string
  remainingTurns: number
  sinceTurns: number
}

const availableStatusEffects = [
  {
    label: 'freezing',
    handler() {
      // TODO: Built a global way to let the dungeon master say something via the llm
      // If the player moves, randomly say "you're so cold that you need to lie down for a second"
    },
  },
  {
    label: 'wet',
  },
  {
    label: 'drenched',
  },
  {
    label: 'warm',
  },
  {
    label: 'hot',
  },
  {
    label: 'burning',
    handler() {
      usePlayerStore().hp--
    },
  },
  {
    label: 'bleeding',
    handler() {
      usePlayerStore().hp--
    },
  },
  {
    label: 'broken bone',
  },
  {
    label: 'sad',
  },
  {
    label: 'happy',
  },
  {
    label: 'cold',
  },
  {
    label: 'poisoned',
    handler() {
      usePlayerStore().hp--
    },
  },
  {
    label: 'hungry',
  },
  {
    label: 'starving',
    handler() {
      usePlayerStore().hp--
    },
  },
  {
    label: 'sick',
  },
  {
    label: 'bloated',
  },
  {
    label: 'diarrhea',
  },
  {
    label: 'sleepy',
  },
  {
    label: 'petrified',
  },
  {
    label: 'cursed',
  },
  {
    label: 'well rested',
  },
  {
    label: 'well fed',
  },
]

export class StatusEffects extends Actor {
  id = 'statusEffects'
  eventHandlerSetup = false

  constructor() {
    super()
    if(!this.eventHandlerSetup) {
      this.eventHandlerSetup = true
      events.on('dungeonMasterSpoke', ({ message }) => this.runStep(message))
      events.on('npcSpoke', ({ message}) => this.runStep(message))
    }
  }

  async runStep(message: string) {
    await this.executeExistingStatusEffects()
    await this.updateStatusEffectDurations()
    await this.calculateNewStatusEffects(message)
  }

  async executeExistingStatusEffects() {
    usePlayerStore().statusEffects.forEach((statusEffect) => {
      const effectConfig = availableStatusEffects.find(e => e.label === statusEffect.label)
      effectConfig?.handler?.()
    })
  }

  async updateStatusEffectDurations() {
    usePlayerStore().statusEffects.forEach((statusEffect, index) => {
      usePlayerStore().statusEffects[index].sinceTurns++
      if(statusEffect.remainingTurns > 0) {
        usePlayerStore().statusEffects[index].remainingTurns--
      }
    })

    usePlayerStore().statusEffects = usePlayerStore().statusEffects.filter(e => e.remainingTurns !== 0)
  }

  async calculateNewStatusEffects(message: string) {
    console.log('calculate status effects')
    const changes = await this.determineStatusEffectChanges(message)

    // Remove status effects first, so that we don't remove effects that we just added
    if(changes.removeStatusEffects) {
      usePlayerStore().statusEffects = usePlayerStore().statusEffects.filter(e => !changes.removeStatusEffects!.includes(e.label))
    }
    if(changes.addStatusEffects) {
      changes.addStatusEffects.forEach(statusEffect => {
        const existingEffect = usePlayerStore().statusEffects.find(e => e.label === statusEffect.label)
        if(existingEffect) {
          if(existingEffect.remainingTurns !== -1) {
            existingEffect.remainingTurns = statusEffect.remainingTurns
          }
        } else {
          usePlayerStore().statusEffects.push({
            label: statusEffect.label,
            remainingTurns: statusEffect.remainingTurns,
            sinceTurns: 0,
          })
        }
      })
    }
  }

  async determineStatusEffectChanges(message: string): Promise<{addStatusEffects?:{label: string, remainingTurns: number}[],removeStatusEffects?:string[]}> {
    const statusEffectList = availableStatusEffects.map(e => e.label).join("\n")
    const prompt = `You are an observer of a turn based rpg game and get passed the current message from the dungeon master.
It's your job to determine if, based on the player's/environment's action, the player should have any status effects added or removed. 
You respond with json, which can contain a list of one or more status effects that should be added and one or more that should be removed.
If a status effect should be added that resolves itself after some time (being wet, happy, sad, etc), you indicate for how many turns it should remain.
If it's an indefinite effect that doesn't resolve itself (being hungry, sleepy, etc) set -1 as the number of remaining turns.
If, what the player does, would result in one of the status effects being removed, remove that status effect via "removeStatusEffects" in the response JSON
You can also decide to "escalate" a status effect. E.g. if the player is already wet, and stays in the water, you can remove the "wet" status effect and add the "drenched" status effect.
Only change the status effects, if that change is clearly indicated in the dungeon master's response. Otherwise, output an empty json "{}"
You respond only with valid json of this structure:
{"addStatusEffects":[{label: "wet","remainingTurns":5],"removeStatusEffects":["sick"]}`

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
Available status effect labels:
${statusEffectList}
Dungeon Master Message:
${message}
Only respond with json.`

    console.log('\n======== STATUS EFFECT CHECK REQUEST ========');
    console.log('Message being analyzed for status effects:', message);
    console.log('Current status effects:', getCurrentStatusEffects());
    console.log('======== END STATUS EFFECT CHECK REQUEST ========\n');

    const response = await sendMessage(prompt, currentStatus, "llama-3.1-70b-versatile");
    
    console.log('\n======== STATUS EFFECT CHECK RESULT ========');
    console.log('Status effect changes:', JSON.stringify(response, null, 2));
    console.log('======== END STATUS EFFECT CHECK RESULT ========\n');
    
    return response;
  }
}

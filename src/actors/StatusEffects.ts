import { Actor } from '@/actors/Actor'
import { events } from '@/events'
import { getCommonMetaInfo, getLastDungeonMasterMessage, sendMessage } from '@/aiMessage'
import { usePlayerStore } from '@/stores/playerStore'

export type StatusEffect = {
  label: string
  remainingTurns: number
  sinceTurns: number
}

const availableStatusEffects = [
  {
    label: 'freezing',
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
  statusEffects: StatusEffect[] = []
  eventHandlerSetup = false

  constructor() {
    super()
    this.statusEffects = []
    if(!this.eventHandlerSetup) {
      this.eventHandlerSetup = true
      events.on('dungeonMasterSpoke', () => this.applyStatusEffects())
      events.on('dungeonMasterSpoke', () => this.updateStatusEffects())
      events.on('dungeonMasterSpoke', () => this.calculateStatusEffects())
    }
  }

  async applyStatusEffects() {
    usePlayerStore().statusEffects.forEach((statusEffect, index) => {
      const effectConfig = availableStatusEffects.find(e => e.label === statusEffect.label)
      effectConfig?.handler?.()
    })
  }

  async updateStatusEffects() {
    usePlayerStore().statusEffects.forEach((statusEffect, index) => {
      usePlayerStore().statusEffects[index].sinceTurns++
      if(statusEffect.remainingTurns > 0) {
        usePlayerStore().statusEffects[index].remainingTurns--
      }
    })

    usePlayerStore().statusEffects = usePlayerStore().statusEffects.filter(e => e.remainingTurns !== 0)
  }

  async calculateStatusEffects() {
    console.log('calculate status effects')
    const changes = await this.determineStatusEffectChanges()
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
    if(changes.removeStatusEffects) {
      usePlayerStore().statusEffects = usePlayerStore().statusEffects.filter(e => !changes.removeStatusEffects!.includes(e.label))
    }
  }

  async determineStatusEffectChanges(): Promise<{addStatusEffects?:{label: string, remainingTurns: number}[],removeStatusEffects?:string[]}> {
    const statusEffectList = availableStatusEffects.map(e => e.label).join("\n")
    const prompt = `You are an observer of a turn based rpg game and get passed the current game stats (including an ascii map of the player's current location).
It's your job to determine if the player should have any status effects added or removed. 
You respond with json, that can contain a list of one or more status effects that should be added and one or more that should be removed.
If a status effect should be added that resolves itself after some time (being wet, happy, sad, etc), you indicate for how many turns it should remain.
If it's an indefinite effect that doesn't resolve itself (being hungry, sleepy, etc) set -1 as the number of remaining turns. 
If the current state doesn't imply a change in status effects, output an empty json "{}"
These are available status effect labels:
${statusEffectList}
You respond only with valid json of this structure:
{"addStatusEffects":[{label: "wet","remainingTurns":5],"removeStatusEffects":["sick"]}`

    const currentStatus = `${getCommonMetaInfo()}
${getLastDungeonMasterMessage()}
Only respond with json.`

    return await sendMessage(prompt, currentStatus)
  }
}

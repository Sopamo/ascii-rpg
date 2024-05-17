import type { Actor } from '@/actors/Actor'
import { events } from '@/events'
import type { GeneralStateUpdater } from '@/actors/GeneralStateUpdater'
import type { StatusEffects } from '@/actors/StatusEffects'

let currentEvironment: Environment = null as unknown as Environment
export function setCurrentEnvironment(environment: Environment) {
  currentEvironment = environment
}
export function getCurrentEnvironment() {
  return currentEvironment
}

interface PhysicalActor extends InstanceType<typeof Actor> {
  position: {x: number; y: number}
}

export class Environment {
  id: string = ''
  actors: Actor[] = []
  constructor() {
  }

  spawn() {}

  despawn() {
    ([...events.all.keys()]).forEach(key => {
      if(key === '*') {
        return
      }
      events.off(key)
    })

    this.actors.forEach(actor => actor.despawn())
  }

  getGeneralStateUpdater(): GeneralStateUpdater|undefined {
    return this.actors.find(actor => actor.id === "generalStateUpdater") as GeneralStateUpdater|undefined
  }

  getPhysicalActors(): PhysicalActor[] {
    return this.actors.filter(actor => actor.position !== undefined)
  }

  getStatusEffects(): StatusEffects|undefined {
    return this.actors.find(actor => actor.id === "statusEffects") as StatusEffects|undefined
  }

}

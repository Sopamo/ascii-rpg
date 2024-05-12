import type { Actor } from '@/actors/Actor'
import { events } from '@/events'

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
}

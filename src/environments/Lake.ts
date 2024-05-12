import { Environment } from '@/environments/Environment'
import { StatusEffects } from '@/actors/StatusEffects'

export class Lake extends Environment {
  id = 'lake'
  constructor() {
    super()
    window.environment = this
  }

  spawn(): void {
    this.actors.push(new StatusEffects())
  }
}

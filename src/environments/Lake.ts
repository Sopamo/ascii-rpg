import { Environment } from '@/environments/Environment'
import { StatusEffects } from '@/actors/StatusEffects'
import { GeneralStateUpdater } from '@/actors/GeneralStateUpdater'

export class Lake extends Environment {
  id = 'lake'
  constructor() {
    super()
    window.environment = this
  }

  spawn(): void {
    this.actors.push(new StatusEffects())
    this.actors.push(new GeneralStateUpdater())
  }
}

import { Environment } from '@/environments/Environment'
import { StatusEffects } from '@/actors/StatusEffects'
import { GeneralStateUpdater } from '@/actors/GeneralStateUpdater'
import { Marla } from '@/actors/Marla'

export class Town extends Environment {
  id = 'town'
  constructor() {
    super()
    window.environment = this
  }

  spawn(): void {
    this.actors.push(new StatusEffects())
    this.actors.push(new GeneralStateUpdater())
    this.actors.push(new Marla())
    // More town actors can be added here as they are implemented
  }
}

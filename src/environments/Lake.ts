import { Environment } from '@/environments/Environment'
import { StatusEffects } from '@/actors/StatusEffects'
import { GeneralStateUpdater } from '@/actors/GeneralStateUpdater'
import { GandalfStone } from '@/actors/GandalfStone'
import { Sphinx } from '@/actors/Sphinx'
import { NecromancerDoor } from '@/actors/NecromancerDoor'

export class Lake extends Environment {
  id = 'lake'
  constructor() {
    super()
    window.environment = this
  }

  spawn(): void {
    this.actors.push(new StatusEffects())
    this.actors.push(new GeneralStateUpdater())
    this.actors.push(new GandalfStone())
    this.actors.push(new Sphinx())
    this.actors.push(new NecromancerDoor())
  }
}

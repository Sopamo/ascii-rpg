import { Environment } from '@/environments/Environment'
import { StatusEffects } from '@/actors/StatusEffects'
import { GeneralStateUpdater } from '@/actors/GeneralStateUpdater'
import { GandalfStone } from '@/actors/GandalfStone'
import { Sphinx } from '@/actors/Sphinx'
import { NecromancerDoor } from '@/actors/NecromancerDoor'
import { Necromancer } from '@/actors/Necromancer'
import { MischievousCat } from '@/actors/MischievousCat'
import { OldLady } from '@/actors/OldLady'

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
    this.actors.push(new Necromancer())
    this.actors.push(new MischievousCat())
    this.actors.push(new OldLady())
  }
}

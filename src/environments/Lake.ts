import { Environment } from '@/environments/Environment'
import { StatusEffects } from '@/actors/StatusEffects'
import { GeneralStateUpdater } from '@/actors/GeneralStateUpdater'
import { GandalfStone } from '@/actors/GandalfStone'
import { Sphinx } from '@/actors/Sphinx'
import { NecromancerDoor } from '@/actors/NecromancerDoor'
import { Necromancer } from '@/actors/Necromancer'
import { MischievousCat } from '@/actors/MischievousCat'
import { OldLady } from '@/actors/OldLady'
import { Boat } from '@/actors/Boat'
import { SeaMonster } from '@/actors/SeaMonster'
import { Lorin } from '@/actors/Lorin'
import { Marla } from '@/actors/Marla'
import { Bram } from '@/actors/Bram'

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
    this.actors.push(new Boat())
    this.actors.push(new SeaMonster())
    this.actors.push(new Lorin())
    this.actors.push(new Marla())
    this.actors.push(new Bram())
  }
}

import { Actor } from '@/actors/Actor'
import { events } from '@/events'
import { playAudio } from '@/helpers'
import { reactive } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'

export class NecromancerDoor extends Actor {
  id = 'necromancerDoor'
  label: string = "The closed and locked door of a mysterious tower"
  eventHandlerSetup = false
  position = reactive({x: 42, y: 5})

  constructor() {
    super()
  }

  async runStep(message: string) {

  }
}

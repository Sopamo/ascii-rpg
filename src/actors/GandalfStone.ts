import { Actor } from '@/actors/Actor'
import { events } from '@/events'
import { playAudio } from '@/helpers'
import { reactive } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'

export class GandalfStone extends Actor {
  id = 'gandalfStone'
  label: string = "Big stone, blocking the way"
  eventHandlerSetup = false
  position = reactive({x: 23, y: 17})

  constructor() {
    super()
    if (!this.eventHandlerSetup) {
      this.eventHandlerSetup = true
      events.on('playerSpoke', ({ message }) => this.runStep(message))
    }
  }

  async runStep(message: string) {
    if(message.toLowerCase().includes("friend") && this.isWithinRadius({x: usePlayerStore().playerPosition[0], y: usePlayerStore().playerPosition[1]}, 2)) {
      this.position.y--
      playAudio("/sounds/gandalf-stone-open.mp3")
    }
  }
}

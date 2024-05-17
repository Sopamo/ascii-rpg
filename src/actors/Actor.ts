export class Actor {
  id: string = ''
  eventHandlers = []
  position: undefined | { x: number, y: number } = undefined

  constructor() {

  }

  /**
   * Is called once per second
   */
  tick(): void {

  }

  despawn() {

  }
}

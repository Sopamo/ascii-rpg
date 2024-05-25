export class Actor {
  id: string = ''
  eventHandlers = []
  position: undefined | { x: number, y: number } = undefined
  canTalkTo: boolean = false

  constructor() {

  }

  /**
   * Is called once per second
   */
  tick(): void {

  }

  despawn() {

  }

  isWithinRadius(point2: { x: number, y: number }, radius: number): boolean {
    if(!this.position) {
      return false;
    }
    const dx = point2.x - this.position.x;
    const dy = point2.y - this.position.y;
    const distance = Math.ceil(Math.sqrt(dx * dx + dy * dy));
    return distance <= radius;
  }
}

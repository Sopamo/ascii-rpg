import mitt from 'mitt'

type Events = {
  dungeonMasterSpoke: {
    message: string
  }
  npcSpoke: {
    actor: string
    message: string
  }
  playerSpoke: {
    message: string
  }
};

export const events = mitt<Events>()

events.on('*', (e) => {
  console.log(e)
})
window.events = events

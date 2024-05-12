import mitt from 'mitt'

type Events = {
  dungeonMasterSpoke: undefined;
  npcSpoke: undefined;
};

export const events = mitt<Events>()

events.on('*', (e) => {
  console.log(e)
})
window.events = events

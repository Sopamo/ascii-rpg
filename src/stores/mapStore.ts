import { acceptHMRUpdate, defineStore } from 'pinia'
import mapRows from '../assets/map.json'
import { usePlayerStore } from '@/stores/playerStore'

export const specialThings = {
  '1': {
    id: 'oldLady',
    canTalkTo: true,
    label: 'old lady',
    summary: 'Is an old grumpy woman, sitting on a bench. She is willing to give the player a rusty old sword, but only if they bring her a fish, caught from the lake. She doesnt really want to talk about all of that though, because the sword belongs to her missing husband. If she is physically attacked, she viciously hits back.'
  },
  '2': {
    id: 'boat',
    canTalkTo: false,
    label: 'boat',
    summary: 'Is a tiny wooden boat without a sail and without oars. You don\'t want to get in, before you have a way to propel yourself forward in the boat.'
  },
  '3': {
    id: 'seaMonster',
    canTalkTo: false,
    label: 'sea monster',
    summary: 'Is a mighty sea monster, vulnerable against rust. If the player attacks it without a proper weapon it responds by explicitly and seriously injuring them. Hitting it with a rusty sword is super effective though. Hitting it once or twice would kill it. If you do manage to kill it, you get plentyful treasure (+100 coins).'
  },
  '4': {
    id: 'mischievousCat',
    canTalkTo: true,
    label: 'cat',
    summary: 'Is a cat, sitting next to some tables and looking for some food. Really likes to be pet.'
  }
}

function getSpecialThings(mapData: string[]): string[] {
  // TODO: Return relevant actors as well
  const mapString = mapData.join('')
  const relevantThings: string[] = []
  Object.entries(specialThings).forEach(([key, thing]) => {
    if (mapString.includes(key)) {
      relevantThings.push(`${key} ${thing.summary} <- Usually the player will refer to this, so make sure to mention it in your response if applicable.`)
    }
  })
  return relevantThings
}

function getSurroundingCells(map: string[], x: number, y: number, radius: number = 2) {
  const surroundingCells = []
  const start = -1 * radius
  const end = radius
  for (let i = start; i <= end; i++) {
    let row = ''
    for (let j = start; j <= end; j++) {
      const newX = x + j
      const newY = y + i
      if (newX >= 0 && newX < map[0].length && newY >= 0 && newY < map.length) {
        row += map[newY][newX]
      } else {
        row += '#'
      }
    }
    surroundingCells.push(row)
  }
  return surroundingCells
}

export const useMapStore = defineStore('map', {
  state() {
    return {
      mapRows,
      currentMapCenter: {
        x: 12,
        y: 12,
        // x: 42,
        // y: 12,
      },
      mapSize: 24,
    }
  },
  getters: {
    visibleMap(): string[] {
      return getSurroundingCells(mapRows, this.currentMapCenter.x, this.currentMapCenter.y, 12)
    },
    playerActiveArea() {
      const playerStore = usePlayerStore()
      const activeAreaRadius = 2
      const map = getSurroundingCells(mapRows, playerStore.playerPosition[0], playerStore.playerPosition[1], activeAreaRadius)
      // Set the x to the center so the llm knows where the player is
      const playerRow = map[activeAreaRadius].split("")
      playerRow[activeAreaRadius] = 'x'
      map[activeAreaRadius] = playerRow.join("")
      return {
        mapString: map.join('\n'),
        specialThings: getSpecialThings(map)
      }
    },
    globalTopLeftMapPosition(state) {
      return {
        x: state.currentMapCenter.x - state.mapSize / 2,
        y: state.currentMapCenter.y - state.mapSize / 2,
      }
    }
  },
  actions: {
    toGlobal(viewportPosition: {x: number, y: number}) {
      return {
        x: viewportPosition.x + this.globalTopLeftMapPosition.x,
        y: viewportPosition.y + this.globalTopLeftMapPosition.y,
      }
    },
    toViewport(globalPosition: {x: number, y: number}) {
      return {
        x: globalPosition.x - this.globalTopLeftMapPosition.x,
        y: globalPosition.y - this.globalTopLeftMapPosition.y,
      }
    }
  }
})


if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(acceptHMRUpdate(useMapStore, import.meta.hot))
}

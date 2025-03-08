import { acceptHMRUpdate, defineStore } from 'pinia'
import mapRows from '../assets/map.json'
import { usePlayerStore } from '@/stores/playerStore'

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
        mapString: map.join('\n')
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

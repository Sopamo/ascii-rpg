import { defineStore } from 'pinia'
import mapRows from '../assets/map.json'
import { usePlayerStore } from '@/stores/playerStore'
import { acceptHMRUpdate } from "pinia"

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
    summary: 'Is a sea monster, vulnerable against rust. You don\'t stand a chance against it without any weapons, it would just kill you. Hitting it with a rusty sword is super effective though. Hitting it once or twice would kill it. If you do manage to kill it, you get plentyful treasure (+100 coins).'
  },
  '4': {
    id: 'mischievousCat',
    canTalkTo: true,
    label: 'cat',
    summary: 'Is a cat, sitting next to some tables and looking for some food. Really likes to be pet.'
  },
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

function getSurroundingCells(map: string[], x: number, y: number) {
  const surroundingCells = []
  for (let i = -2; i <= 2; i++) {
    let row = ''
    for (let j = -2; j <= 2; j++) {
      const newX = x + j
      const newY = y + i
      if (newY === y && newX === x) {
        row += 'x' // This is the player
      } else if (newX >= 0 && newX < map[0].length && newY >= 0 && newY < map.length) {
        row += map[newY][newX]
      } else {
        row += '#'
      }
    }
    surroundingCells.push(row)
  }
  return surroundingCells
}

export const useMapStore = defineStore('map', () => {
  const getCurrentMapData = () => {
    const playerStore = usePlayerStore()
    const map = getSurroundingCells(mapRows, playerStore.playerPosition[0], playerStore.playerPosition[1])
    return {
      mapString: map.join('\n'),
      specialThings: getSpecialThings(map)
    }
  }

  return { mapRows, getCurrentMapData }
})


if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(acceptHMRUpdate(useMapStore, import.meta.hot))
}

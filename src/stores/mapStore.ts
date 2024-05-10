import { defineStore } from 'pinia'
import mapRows from '../assets/map.json'
import { usePlayerStore } from '@/stores/playerStore'
function setCharAt(str: string,index: number,char: string) {
  if(index > str.length-1) return str;
  return str.substring(0,index) + char + str.substring(index+1);
}
export const specialThings = {
  '1': 'Is an old grumpy woman, sitting on a bench. She is willing to give the player a rusty old sword, but only if they bring her a fish, caught from the lake. She doesnt really want to talk about all of that though, because the sword belongs to her missing husband.'
}
function getSpecialThings(mapData: string[]): string[] {

  const mapString = mapData.join("")
  const relevantThings: string[] = []
  Object.entries(specialThings).forEach(([key, thing]) => {
    if(mapString.includes(key)) {
      relevantThings.push(`${key} ${thing}`)
    }
  })
  return relevantThings
}
function getSurroundingCells(map: string[], x: number, y: number) {
  const surroundingCells = [];
  for (let i = -2; i <= 2; i++) {
    let row = '';
    for (let j = -2; j <= 2; j++) {
      const newX = x + j;
      const newY = y + i;
      if (newY === y && newX === x) {
        row += 'x' // This is the player
      } else if (newX >= 0 && newX < map[0].length && newY >= 0 && newY < map.length) {
        row += map[newY][newX];
      } else {
        row += '#';
      }
    }
    surroundingCells.push(row);
  }
  return surroundingCells;
}
export const useMapStore = defineStore('map', () => {
  const getCurrentMapData = () => {
    const playerStore = usePlayerStore()
    const map = getSurroundingCells(mapRows, playerStore.playerPosition[0], playerStore.playerPosition[1])
    return {
      mapString: map.join("\n"),
      specialThings: getSpecialThings(map)
    }
  }

  return { mapRows, getCurrentMapData }
})

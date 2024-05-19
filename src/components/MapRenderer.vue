<template>
  <div class="s-map__wrapper">
    <div class="s-meta">{{ format(new Date(playerStore.currentTime * 1000), 'HH:mm') }} | {{ playerStore.hp }}/{{ playerStore.maxHp }} HP | {{playerStore.characterId}}</div>
    <div class="s-map" @mouseleave="setActiveCell(null)">
      <div v-for="row in mapRows" class="s-row">
        <div :class="getClass(cell.char)" @mouseover="setActiveCell(cell.char)" v-for="cell in row" class="s-cell">
          <template v-if="cell.isPlayerPosition">
            x
          </template>
          <template v-else-if="cell.specialThing">
            <img :src="`/img/${cell.specialThing.id}Map.webp`" />
          </template>
          <template v-else>
            {{ cell.char }}
          </template>
        </div>
      </div>
    </div>
    <div class="s-activeCell">
      <template v-if="activeCell">{{ cellTypes[activeCell]?.label || '?' }}</template>
    </div>
    <div class="s-sidebar">
      <Inventory />
      <StatusEffects />
    </div>
  </div>
</template>

<script setup lang="ts">

import { onKeyStroke } from '@vueuse/core'
import { usePromptStore } from '@/stores/promptStore'
import { usePlayerStore } from '@/stores/playerStore'
import { specialThings, useMapStore } from '@/stores/mapStore'
import Inventory from '@/components/Inventory.vue'
import { computed, ref, watch } from 'vue'
import { format } from 'date-fns'
import StatusEffects from '@/components/StatusEffects.vue'
import { getCurrentEnvironment } from '@/environments/Environment'

const mapStore = useMapStore()
const promptStore = usePromptStore()
const playerStore = usePlayerStore()
const activeCell = ref<string|null>(null)

window.playerStore = playerStore

const cellTypes: Record<string, {class: string, label: string, isPassable:boolean}> = {
  '.': { class: 's-floor', label: 'floor', isPassable: true },
  ':': { class: 's-floor', label: 'impassable terrain', isPassable: false },
  '#': { class: 's-wall', label: 'wall', isPassable: false },
  '~': { class: 's-water', label: 'water', isPassable: true },
  '|': { class: 's-wall', label: 'vertical structure', isPassable: false },
  '^': { class: 's-forest', label: 'tree', isPassable: false },
  '"': { class: 's-foliage', label: 'foliage', isPassable: true },
  '+': { class: 's-wall', label: 'closed door', isPassable: false },
  '=': { class: 's-wall', label: 'table', isPassable: true },
}

const mapRows = computed(() => {
  return mapStore.visibleMap.map((row, rowIndex) => {
    return row.split("").map((char, columnIndex) => {
      return {
        char: char,
        class: getClass(char),
        isPlayerPosition: isPlayerPosition(columnIndex, rowIndex),
        specialThing: getSpecialThing(char, columnIndex, rowIndex),
      }
    })
  })
})

watch(() => playerStore.playerPosition, () => {
  const movementArea = 6
  const [x, y] = playerStore.playerPosition
  const {x: mapX, y: mapY} = mapStore.currentMapCenter
  if(x > mapX + movementArea) {
    mapStore.currentMapCenter.x = Math.min(mapStore.mapRows[0].length, mapStore.currentMapCenter.x + 1)
  }
  if(x < mapX - movementArea) {
    mapStore.currentMapCenter.x = Math.max(mapStore.mapSize / 2, mapStore.currentMapCenter.x - 1)
  }
  if(y > mapY + movementArea) {
    mapStore.currentMapCenter.y = Math.min(mapStore.mapRows.length, mapStore.currentMapCenter.y + 1)
  }
  if(y < mapY - movementArea) {
    mapStore.currentMapCenter.y = Math.max(mapStore.mapSize / 2, mapStore.currentMapCenter.y - 1)
  }
}, {
  deep: true,
  immediate: true,
})

function isPlayerPosition(viewportX: number, viewportY: number) {
  const globalPosition = mapStore.toGlobal({x: viewportX, y: viewportY})
  return globalPosition.x === playerStore.playerPosition[0] && globalPosition.y === playerStore.playerPosition[1]
}

function getClass(type: string) {
  if (!cellTypes[type]) {
    return ''
  }
  return cellTypes[type].class
}

function setActiveCell(cellType: string) {
  activeCell.value = cellType
}

function getActorAt(globalX: number, globalY: number) {
  return getCurrentEnvironment().getPhysicalActors().find(actor => actor.position.x === globalX && actor.position.y === globalY)
}

function getSpecialThing(char: string, x: number, y: number) {
  if(Object.keys(specialThings).includes(char)) {
    return specialThings[char]
  }
  const globalPosition = mapStore.toGlobal({x, y})
  const actor = getActorAt(globalPosition.x, globalPosition.y)
  if(actor) {
    return actor
  }
  return null
}

function handleMapKeyInput(e, callback) {
  if (promptStore.isFocused) {
    return
  }
  e.preventDefault()
  callback()
}

function getCellTypeAt(x: number, y: number) {
  return cellTypes[mapStore.mapRows[y][x]] ?? null
}

function surroundingSpecialThingAction(callback) {
  ([-1,0,1]).forEach(columnOffset => {
    ([-1,0,1]).forEach(rowOffset => {
      const x = playerStore.playerPosition[0] + columnOffset
      const y = playerStore.playerPosition[1] + rowOffset
      const currentChar = mapStore.mapRows[y]?.[x]
      const specialThing = getSpecialThing(currentChar, x, y)
      if(specialThing) {
        callback(specialThing)
      }
    })
  })
}

onKeyStroke(['e'], (e) => handleMapKeyInput(e, () => {
  surroundingSpecialThingAction((specialThing) => {
    promptStore.currentMessage = {
      response: specialThing.label
    }
  })
}))

function onAfterMove() {
  let foundThingToTalkTo = false
  surroundingSpecialThingAction((specialThing) => {
    if(specialThing.canTalkTo) {
      foundThingToTalkTo = true
      promptStore.talkingTo = specialThing.id
    }
  })
  if(!foundThingToTalkTo) {
    promptStore.talkingTo = null
  }
}

onKeyStroke(['s', 'S', 'ArrowDown'], (e) => handleMapKeyInput(e, () => {
  const newX = playerStore.playerPosition[0]
  const newY = playerStore.playerPosition[1]+1
  const cellType = getCellTypeAt(newX, newY)
  if(!cellType || !cellType.isPassable) {
    return
  }
  const actor = getActorAt(newX, newY)
  if(actor) {
    return
  }
  playerStore.playerPosition[1]++
  onAfterMove()
}))
onKeyStroke(['w', 'W', 'ArrowUp'], (e) => handleMapKeyInput(e, () => {
  const newX = playerStore.playerPosition[0]
  const newY = playerStore.playerPosition[1]-1

  const cellType = getCellTypeAt(newX, newY)
  if(!cellType || !cellType.isPassable) {
    return
  }
  const actor = getActorAt(newX, newY)
  if(actor) {
    return
  }
  playerStore.playerPosition[1]--
  onAfterMove()
}))
onKeyStroke(['a', 'A', 'ArrowLeft'], (e) => handleMapKeyInput(e, () => {
  const newX = playerStore.playerPosition[0] - 1
  const newY = playerStore.playerPosition[1]

  const cellType = getCellTypeAt(newX, newY)
  if(!cellType || !cellType.isPassable) {
    return
  }
  const actor = getActorAt(newX, newY)
  if(actor) {
    return
  }
  playerStore.playerPosition[0]--
  onAfterMove()
}))
onKeyStroke(['d', 'D', 'ArrowRight'], (e) => handleMapKeyInput(e, () => {
  const newX = playerStore.playerPosition[0] + 1
  const newY = playerStore.playerPosition[1]

  const cellType = getCellTypeAt(newX, newY)
  if(!cellType || !cellType.isPassable) {
    return
  }
  const actor = getActorAt(newX, newY)
  if(actor) {
    return
  }
  playerStore.playerPosition[0]++
  onAfterMove()
}))
</script>

<style lang="scss" scoped>
.s-map__wrapper {
  position: relative;
}

.s-map {
  width: 800px;
  height: 800px;
  background: black;
  border-radius: 3px;
  border: 1px solid #dedede;
  overflow: hidden;
}

.s-row {
  display: flex;
  flex-direction: row;
  font-family: asciifont, sans-serif;
  font-size: 32px;
  line-height: 1;
  cursor: crosshair;
  user-select: none;
}

.s-meta {
  position: absolute;
  top: 1px;
  right: 1px;
  padding: 0 4px;
  background: black;
}

.s-water {
  background: #CCC9E7;
  color: white;
}

.s-floor {
  background: #212738;
}

.s-forest {
  background: #248232;
  color: #152614;
}

.s-wall {
  background: #161B26;
  color: #11141D;
}

.s-foliage {
  background: #328b3f;
  color: #264324;
}
.s-cell {
  width: 32px;
  height: 32px;
}
.s-cell img {
  width: 32px;
  height: 32px;
  object-fit: cover;
}

.s-sidebar {
  position: absolute;
  top: 0;
  right: -8px;
  transform: translateX(100%);
  max-height: 800px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.s-activeCell {
  height: 16px;
  text-align: right;
  font-size: 12px;
}
</style>

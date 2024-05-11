<template>
  <div class="s-map__wrapper">
    <div class="s-meta">{{ format(new Date(playerStore.currentTime * 1000), 'HH:mm') }} | {{ playerStore.hp }}/{{ playerStore.maxHp }} HP</div>
    <div class="s-map" @mouseleave="setActiveCell(null)">
      <div v-for="(row, rowIndex) in mapStore.mapRows" :key="rowIndex" class="s-row">
        <div :class="getClass(cell)" @mouseover="setActiveCell(cell)" v-for="(cell, columnIndex) in row" class="s-cell"
             :key="columnIndex">
          <template v-if="columnIndex === playerStore.playerPosition[0] && rowIndex === playerStore.playerPosition[1]">
            x
          </template>
          <template v-else>{{ isSpecialThing(cell) ? '?' : cell }}</template>
        </div>
      </div>
    </div>
    <div class="s-activeCell">
      <template v-if="activeCell">{{ cellTypes[activeCell]?.label || '?' }}</template>
    </div>
    <Inventory />
  </div>
</template>

<script setup lang="ts">

import { onKeyStroke } from '@vueuse/core'
import { usePromptStore } from '@/stores/promptStore'
import { usePlayerStore } from '@/stores/playerStore'
import { specialThings, useMapStore } from '@/stores/mapStore'
import Inventory from '@/components/Inventory.vue'
import { ref } from 'vue'
import { format } from 'date-fns'

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

function getClass(type: string) {
  if (!cellTypes[type]) {
    return ''
  }
  return cellTypes[type].class
}

function setActiveCell(cellType: string) {
  activeCell.value = cellType
}

function isSpecialThing(char: string) {
  return Object.keys(specialThings).includes(char)
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

function sourroundingSpecialThingAction(callback) {
  ([-1,0,1]).forEach(columnOffset => {
    ([-1,0,1]).forEach(rowOffset => {
      const currentChar = mapStore.mapRows[playerStore.playerPosition[1] + rowOffset]?.[playerStore.playerPosition[0] + columnOffset]
      if(isSpecialThing(currentChar)) {
        const specialThing = specialThings[currentChar]
        callback(specialThing)
      }
    })
  })
}

onKeyStroke(['e'], (e) => handleMapKeyInput(e, () => {
  sourroundingSpecialThingAction((specialThing) => {
    promptStore.currentMessage = {
      response: specialThing.interact
    }
  })
}))

function onAfterMove() {
  let foundThingToTalkTo = false
  sourroundingSpecialThingAction((specialThing) => {
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
  const cellType = getCellTypeAt(playerStore.playerPosition[0], playerStore.playerPosition[1]+1)
  if(!cellType || !cellType.isPassable) {
    return
  }
  playerStore.playerPosition[1]++
  onAfterMove()
}))
onKeyStroke(['w', 'W', 'ArrowUp'], (e) => handleMapKeyInput(e, () => {
  const cellType = getCellTypeAt(playerStore.playerPosition[0], playerStore.playerPosition[1]-1)
  if(!cellType || !cellType.isPassable) {
    return
  }
  playerStore.playerPosition[1]--
  onAfterMove()
}))
onKeyStroke(['a', 'A', 'ArrowLeft'], (e) => handleMapKeyInput(e, () => {
  const cellType = getCellTypeAt(playerStore.playerPosition[0] - 1, playerStore.playerPosition[1])
  if(!cellType || !cellType.isPassable) {
    return
  }
  playerStore.playerPosition[0]--
  onAfterMove()
}))
onKeyStroke(['d', 'D', 'ArrowRight'], (e) => handleMapKeyInput(e, () => {
  const cellType = getCellTypeAt(playerStore.playerPosition[0] + 1, playerStore.playerPosition[1])
  if(!cellType || !cellType.isPassable) {
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

.s-inventory {
  position: absolute;
  top: 0;
  right: -8px;
  transform: translateX(100%);
}
.s-activeCell {
  height: 16px;
  text-align: right;
  font-size: 12px;
}
</style>

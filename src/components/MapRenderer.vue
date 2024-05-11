<template>
  <div class="s-map__wrapper">
    <div class="s-time">{{ format(new Date(playerStore.currentTime * 1000), 'HH:mm') }}</div>
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

const cellTypes: Record<string, {class: string, label: string}> = {
  '.': { class: 's-floor', label: 'floor' },
  ':': { class: 's-floor', label: 'impassable terrain' },
  '#': { class: 's-wall', label: 'wall' },
  '~': { class: 's-water', label: 'water' },
  '|': { class: 's-wall', label: 'vertical structure' },
  '^': { class: 's-forest', label: 'tree' },
  '"': { class: 's-foliage', label: 'foliage' },
  '+': { class: 's-wall', label: 'closed door' },
  '=': { class: 's-wall', label: 'table' },
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

onKeyStroke(['s', 'S', 'ArrowDown'], (e) => handleMapKeyInput(e, () => {
  playerStore.playerPosition[1]++
}))
onKeyStroke(['w', 'W', 'ArrowUp'], (e) => handleMapKeyInput(e, () => {
  playerStore.playerPosition[1]--
}))
onKeyStroke(['a', 'A', 'ArrowLeft'], (e) => handleMapKeyInput(e, () => {
  playerStore.playerPosition[0]--
}))
onKeyStroke(['d', 'D', 'ArrowRight'], (e) => handleMapKeyInput(e, () => {
  playerStore.playerPosition[0]++
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

.s-time {
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

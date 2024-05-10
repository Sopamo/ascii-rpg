<template>
<div class="s-map">
  <div v-for="(row, rowIndex) in mapStore.mapRows" :key="rowIndex" class="s-row">
    <div :class="getClass(cell)" v-for="(cell, columnIndex) in row" class="s-cell" :key="columnIndex">
      <template v-if="columnIndex === playerStore.playerPosition[0] && rowIndex === playerStore.playerPosition[1]">x</template>
      <template v-else>{{ cell }}</template>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">

import { onKeyStroke } from '@vueuse/core'
import { usePromptStore } from '@/stores/promptStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useMapStore } from '@/stores/mapStore'

const mapStore = useMapStore()
const promptStore = usePromptStore()
const playerStore = usePlayerStore()

function getClass(type: string) {
  const typeMap: Record<string, string> = {
    '~': 's-water',
    '.': 's-floor',
    '^': 's-forest',
    '#': 's-wall',
    '"': 's-foliage',
  }
  if(!typeMap[type]) {
    return ''
  }
  return typeMap[type]
}

function handleMapKeyInput(e, callback) {
  if(promptStore.isFocused) {
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
.s-map {
  width: 800px;
  height: 800px;
  background: black;
  border-radius: 3px;
  border: 1px solid #dedede;
  font-family: asciifont, sans-serif;
  font-size: 32px;
  line-height: 1;
  overflow: hidden;
}

.s-row {
  display: flex;
  flex-direction: row;
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

</style>

<template>
  <main class="s-game">
    <GameMessage />
    <MapRenderer />
    <Prompt />
  </main>
</template>

<script setup lang="ts">
import MapRenderer from '@/components/MapRenderer.vue'
import Prompt from '@/components/Prompt.vue'

import GameMessage from '@/components/GameMessage.vue'
</script>


<style lang="scss" scoped>
.s-game {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}
</style>

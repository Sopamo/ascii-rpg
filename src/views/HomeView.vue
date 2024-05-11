<template>
  <main class="s-game">
    <GameMessage />
    <router-view>
    </router-view>
  </main>
</template>

<script setup lang="ts">
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

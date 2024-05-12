<template>
  <div class="s-statusEffects">
    <div class="s-statusEffects__title">Status</div>
    <template v-if="playerStore.statusEffects.length">
      <div v-for="statusEffect in playerStore.statusEffects" :key="statusEffect.label">{{ statusEffect.label }} <template v-if="statusEffect.remainingTurns !== -1">({{ statusEffect.remainingTurns}} turn<template v-if="statusEffect.remainingTurns !== 1">s</template>)</template></div>
    </template>
    <div v-else class="s-statusEffects__empty">For now you are feeling somewhat okay.</div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/stores/playerStore'

const playerStore = usePlayerStore()
</script>

<style lang="scss" scoped>
.s-statusEffects {
  display: flex;
  flex-direction: column;
  max-width: 300px;
}
.s-statusEffects__title {
  font-weight: bold;
  margin-bottom: 4px;
}
.s-statusEffects__empty {
  color: grey;
  font-style: italic;
  font-size: 14px;
}
</style>

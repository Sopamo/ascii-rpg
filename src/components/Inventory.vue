<template>
  <div class="s-inventory">
    <div class="s-inventory__title">Inventory</div>
    <template v-if="playerStore.inventory.length">
      <div v-for="inventoryItem in playerStore.inventory">{{ inventoryItem }}</div>
    </template>
    <div v-else class="s-inventory__empty">Just a bit of dust and a few tiny breadcrumbs.</div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/stores/playerStore'

const playerStore = usePlayerStore()
</script>

<style lang="scss" scoped>
.s-inventory {
  display: flex;
  flex-direction: column;
  max-width: 300px;
}
.s-inventory__title {
  font-weight: bold;
  margin-bottom: 4px;
}
.s-inventory__empty {
  color: grey;
  font-style: italic;
  font-size: 14px;
}
</style>

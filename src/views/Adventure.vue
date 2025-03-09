<template>
  <div class="adventure-container">
    <MapRenderer />
    <div class="dice-overlay" v-if="showDiceRoller">
      <DiceRoller ref="diceRollerRef" @diceRolled="onDiceRolled" />
    </div>
    <button class="dice-toggle-btn" @click="toggleDiceRoller">Roll Dice</button>
    <Prompt />
  </div>
</template>
<script setup lang="ts">
import MapRenderer from '@/components/MapRenderer.vue'
import Prompt from '@/components/Prompt.vue'
import DiceRoller from '@/components/DiceRoller.vue'
import { Lake } from '@/environments/Lake'
import { onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import { setCurrentEnvironment } from '@/environments/Environment'

const playerStore = usePlayerStore()
const router = useRouter()

if(!playerStore.characterId) {
  router.replace('/characters')
}

const environment = new Lake()
environment.spawn()
setCurrentEnvironment(environment)
onBeforeRouteLeave(() => {
  environment.despawn()
})
onUnmounted(() => {
  environment.despawn()
})

// Dice roller functionality
const showDiceRoller = ref(false)
const diceRollerRef = ref(null)

function toggleDiceRoller() {
  showDiceRoller.value = !showDiceRoller.value
}

function onDiceRolled(value: number) {
  console.log('Dice rolled:', value)
  // You can use the dice value here for game mechanics
  // For example: playerStore.rollResult = value
}
</script>

<style lang="scss" scoped>
.adventure-container {
  position: relative;
}

.dice-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 800px;
  height: 800px;
  z-index: 10;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}



.dice-toggle-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  z-index: 20;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.5);
  }
}
</style>

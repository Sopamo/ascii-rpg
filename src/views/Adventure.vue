<template>
  <div class="adventure-container">
    <MapRenderer />
    <div class="dice-overlay" v-if="showDiceRoller">
      <DiceRoller ref="diceRollerRef" @diceRolled="onDiceRolled" />
    </div>
    <Prompt />
  </div>
</template>
<script setup lang="ts">
import MapRenderer from '@/components/MapRenderer.vue'
import Prompt from '@/components/Prompt.vue'
import DiceRoller from '@/components/DiceRoller.vue'
import { Lake } from '@/environments/Lake'
import { onUnmounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import { setCurrentEnvironment } from '@/environments/Environment'
import { useDiceStore } from '@/stores/diceStore'

const playerStore = usePlayerStore()
const diceStore = useDiceStore()
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
const diceRollerRef = ref<{
  rollDice: () => void;
  getDiceValue: () => number;
} | null>(null)

// Watch for changes to pendingAbilityCheck in playerStore
watch(() => playerStore.pendingAbilityCheck, (newValue) => {
  if (newValue) {
    // Show the dice roller
    showDiceRoller.value = true
    console.log(`Rolling dice for ${newValue.ability} check: ${newValue.reasoning}`)
    
    // Trigger the dice roll after a short delay to ensure the component is visible
    setTimeout(() => {
      if (diceRollerRef.value) {
        diceRollerRef.value.rollDice()
      }
    }, 100)
  }
}, { immediate: true })

function onDiceRolled(value: number) {
  console.log('Dice rolled:', value)
  diceStore.diceValue = value
  
  // If this was for an ability check, process the result
  if (playerStore.pendingAbilityCheck) {
    const ability = playerStore.pendingAbilityCheck.ability
    const reasoning = playerStore.pendingAbilityCheck.reasoning
    const abilityScore = playerStore.abilityScores[ability] || 0
    
    // Record the ability check result in the dice store and get the total score
    const totalScore = diceStore.recordAbilityCheck(ability, abilityScore, value, reasoning)
    
    console.log(`Ability check processed: Dice value: ${value}, ${ability} score: ${abilityScore}, Total score: ${totalScore}`)
    
    // Clear the pending ability check after processing
    setTimeout(() => {
      playerStore.clearPendingAbilityCheck()
      // Hide the dice roller immediately after processing the result
      showDiceRoller.value = false
      // Clear the ability check result from the dice store
      diceStore.clearAbilityCheckResult()
    }, 500)
  }
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
</style>

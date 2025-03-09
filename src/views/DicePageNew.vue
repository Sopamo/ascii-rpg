<template>
  <div class="dice-container">
    <div class="dice-info">
      <button @click="rollDice" class="roll-button">Roll Dice</button>
      <div v-if="lastRolledValue" class="dice-value">You rolled: {{ lastRolledValue }}</div>
    </div>
    <DiceRoller ref="diceRoller" @diceRolled="onDiceRolled" class="dice-roller" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DiceRoller from '@/components/DiceRoller.vue'

// References
const diceRoller = ref<InstanceType<typeof DiceRoller> | null>(null)
const lastRolledValue = ref<number | null>(null)

// Handle dice roll
function rollDice() {
  if (diceRoller.value) {
    diceRoller.value.rollDice()
  }
}

// Handle dice roll result
function onDiceRolled(value: number) {
  lastRolledValue.value = value
  console.log(`Dice rolled: ${value}`)
}
</script>

<style lang="scss" scoped>
.dice-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.dice-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.dice-value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
}

.roll-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:active {
    background-color: #3e8e41;
  }
}

.dice-roller {
  width: 800px;
  height: 800px;
  border-radius: 8px;
  overflow: hidden;
}
</style>

<template>
  <div class="ability-score-editor">
    <div class="ability-score-row">
      <div class="ability-name">{{ abilityName }}</div>
      <div class="ability-value">{{ score }}</div>
      <div class="ability-controls">
        <button 
          class="control-btn decrease" 
          @click="decrease"
          :disabled="!canDecrease"
        >-</button>
        <button 
          class="control-btn increase" 
          @click="increase"
          :disabled="!canIncrease"
        >+</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  abilityName: string;
  score: number;
  originalScore: number;
  remainingPoints: number;
}>();

const emit = defineEmits<{
  (e: 'update:score', value: number): void;
}>();

const canIncrease = computed(() => {
  return props.remainingPoints > 0;
});

const canDecrease = computed(() => {
  return props.score > props.originalScore;
});

function increase() {
  if (canIncrease.value) {
    emit('update:score', props.score + 1);
  }
}

function decrease() {
  if (canDecrease.value) {
    emit('update:score', props.score - 1);
  }
}
</script>

<style scoped lang="scss">
.ability-score-editor {
  margin-bottom: 8px;
}

.ability-score-row {
  display: flex;
  align-items: center;
}

.ability-name {
  width: 120px;
  font-weight: normal;
}

.ability-value {
  width: 40px;
  text-align: center;
  font-weight: bold;
}

.ability-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #dedede;
  color: white;
  cursor: pointer;
  border-radius: 2px;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>

<template>
  <div class="character-details">
    <div class="detail-section">
      <strong>Name:</strong>
      <div>{{ character.name }}</div>
    </div>
    
    <div class="detail-section">
      <strong>Ability Scores:</strong>
      <div class="ability-points-info">
        Remaining points to distribute: {{ remainingPoints }}
      </div>
      <div class="ability-scores-container">
        <AbilityScoreEditor
          v-for="(score, ability) in abilityScores"
          :key="ability"
          :ability-name="ability"
          :score="score"
          :original-score="character.defaultAbilityScores[ability]"
          :remaining-points="remainingPoints"
          @update:score="updateScore(ability, $event)"
        />
      </div>
    </div>
    
    <div class="detail-section">
      <strong>Race:</strong>
      <div>{{ character.race }}</div>
    </div>
    
    <div class="detail-section">
      <strong>Gender:</strong>
      <div>{{ character.gender }}</div>
    </div>
    
    <div class="detail-section">
      <strong>Class:</strong>
      <div>{{ character.class }}</div>
    </div>
    
    <div class="detail-section">
      <strong>Traits:</strong>
      <div v-for="(trait, index) in character.traits" :key="index" class="trait-item">
        {{ trait }}
      </div>
    </div>
    
    <div class="detail-section">
      <strong>Goals:</strong>
      <div v-for="(goal, index) in character.goals" :key="index" class="goal-item">
        {{ goal }}
      </div>
    </div>
    
    <div class="detail-section">
      <strong>Personality:</strong>
      <div>{{ character.personality }}</div>
    </div>
    
    <div class="detail-section">
      <strong>Appearance:</strong>
      <div>{{ character.appearance }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { Character } from '@/views/characterSelect/characters';
import AbilityScoreEditor from './AbilityScoreEditor.vue';

const props = defineProps<{
  character: Character;
}>();

const emit = defineEmits<{
  (e: 'update:ability-scores', value: Record<string, number>): void;
}>();

const MAX_ADDITIONAL_POINTS = 5;
const abilityScores = ref<Record<string, number>>({ ...props.character.defaultAbilityScores });

const usedAdditionalPoints = computed(() => {
  let total = 0;
  for (const [ability, score] of Object.entries(abilityScores.value)) {
    const originalScore = props.character.defaultAbilityScores[ability];
    total += Math.max(0, score - originalScore);
  }
  return total;
});

const remainingPoints = computed(() => {
  return MAX_ADDITIONAL_POINTS - usedAdditionalPoints.value;
});

function updateScore(ability: string, newScore: number) {
  const originalScore = props.character.defaultAbilityScores[ability];
  const currentScore = abilityScores.value[ability];
  const currentAdditional = Math.max(0, currentScore - originalScore);
  const newAdditional = Math.max(0, newScore - originalScore);
  
  // Check if we have enough points to make this change
  if (usedAdditionalPoints.value - currentAdditional + newAdditional <= MAX_ADDITIONAL_POINTS) {
    abilityScores.value = {
      ...abilityScores.value,
      [ability]: newScore
    };
    
    emit('update:ability-scores', abilityScores.value);
  }
}
</script>

<style scoped lang="scss">
.character-details {
  text-align: left;
}

.detail-section {
  margin-bottom: 24px;
  
  strong {
    display: block;
    margin-bottom: 8px;
    font-size: 1.1em;
  }
}

.ability-points-info {
  margin-bottom: 12px;
  font-style: italic;
  color: #ffd700;
}

.trait-item, .goal-item {
  margin-bottom: 8px;
}

.ability-scores-container {
  margin-top: 12px;
}
</style>

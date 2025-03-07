<template>
  <div class="s-screen">
    <div class="s-characters">
      <div class="s-character -disabled">
        <div class="s-coming-soon">Coming Soon</div>
        <img class="s-character__image" src="/img/lumberjack.webp">
        <div class="s-character__name">Kori</div>
      </div>
      <div class="s-character -disabled">
        <div class="s-coming-soon">Coming Soon</div>
        <img class="s-character__image" src="/img/herbalist.webp">
        <div class="s-character__name">Elara</div>
      </div>
      <div @click="choose('undead')" class="s-character" :class="{'-selected': chosenCharacter === 'undead'}">
        <img class="s-character__image" src="/img/undead.webp">
        <div class="s-character__name">Echo</div>
      </div>
    </div>
    <button v-if="chosenCharacter" @click="start" class="s-start">Start your adventure</button>
    <div class="s-hint" v-if="chosenCharacter==='undead'">Playing <i>Echo</i> is only recommended for advanced players.</div>
    <div v-if="chosenCharacter==='undead'" class="s-content-warning">
      <div class="s-warning-icon">⚠️</div>
      <div class="s-warning-content">
        <div class="s-warning-title">Content Warning</div>
        <div class="s-warning-text">Echo's story contains themes of death, sacrifice, and self-harm that some players may find distressing.</div>
      </div>
    </div>
    <div v-if="chosenCharacter" class="s-description" v-html="nl2br(characters[chosenCharacter])">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePlayerStore } from '@/stores/playerStore'
import { useRouter } from 'vue-router'
import { characters } from './characterSelect/characters'
import { ref } from 'vue'
import { nl2br } from '@/helpers'

const playerStore = usePlayerStore()
const router = useRouter()
const chosenCharacter = ref<string|null>(null)
function choose(character: string) {
  // Only Echo is available for now
  if (character === 'undead') {
    chosenCharacter.value = character
  }
}
function start() {
  playerStore.characterId = chosenCharacter.value
  playerStore.characterSheet = characters[chosenCharacter.value]
  router.replace('/adventure')
}
</script>

<style scoped lang="scss">
.s-screen {
  min-height: 60vh;
  width: 100%;
  gap: 24px;
  flex-direction: column;
  display: flex;
  flex-wrap: wrap;
}

.s-characters {
  display: flex;
  width: 800px;
  flex-direction: row;
  gap: 32px;
  height: 350px;
}

.s-character {
  height: 310px;
  flex: 1;
  background: linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(17,18,27,1) 21%);
  border-radius: 2px;
  outline: 1px solid #dedede;
  padding-bottom: 16px;
  cursor: pointer;
  position: relative;

  box-shadow: 0 10px 40px 2px rgba(0,0,0,0.4);
  transform-origin: center center 0px;
  transition: all 0.4s ease-out;

  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  transform: perspective(1000px) rotateX(35deg) rotateY(0deg) rotateZ(0deg) scale(0.9);
  z-index: 1;

  &:hover, &.-selected {
    animation-name: animate;
    margin-top: 0;
    transform: perspective(1000px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);
    z-index: 2;
  }
  
  &.-disabled {
    cursor: not-allowed;
    filter: grayscale(70%);
    opacity: 0.8;
    
    &:hover {
      animation-name: none;
      transform: perspective(1000px) rotateX(35deg) rotateY(0deg) rotateZ(0deg) scale(0.9);
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(128, 128, 128, 0.2);
      z-index: 4;
    }
  }
}

.s-start {
  border: 2px solid #dedede;
  border-radius: 2px;
  color: white;
  padding: 8px 16px;
  background: transparent;
  cursor: pointer;

  &:hover {
    background: rgba(17,18,27,1);
  }
}

@keyframes animate {
  0% {
    margin-top: 0;
  }
  50% {
    margin-top: 10px;
  }
  100% {
    margin-top: 0;
  }
}

.s-character__name {
  font-family: upheaval, sans-serif;
  font-size: 28px;
  line-height: 1;
  text-align: center;
}

.s-character__image {
  max-width: 100%;
}

.s-hint {
  text-align: center;
  font-style: italic;
  font-size: 14px;
  margin-top: -24px;
  height: 0;
}

.s-coming-soon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  padding: 8px 16px;
  font-size: 24px;
  font-weight: bold;
  z-index: 5;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
  pointer-events: none;
}

.s-content-warning {
  display: flex;
  align-items: center;
  background-color: rgba(255, 200, 0, 0.1);
  border: 1px solid rgba(255, 200, 0, 0.3);
  border-radius: 4px;
  padding: 12px 16px;
  margin-top: 24px;
  margin-bottom: 16px;
  width: 100%;
  text-align: left;
}

.s-warning-icon {
  font-size: 24px;
  margin-right: 16px;
  flex-shrink: 0;
}

.s-warning-content {
  flex-grow: 1;
}

.s-warning-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #f0c040;
}

.s-warning-text {
  font-size: 14px;
  line-height: 1.4;
}
</style>

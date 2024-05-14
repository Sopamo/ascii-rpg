<template>
  <div class="s-screen">
    <div class="s-characters">
      <div @click="choose('lumberjack')" class="s-character" :class="{'-selected': chosenCharacter === 'lumberjack'}">
        <img class="s-character__image" src="/img/lumberjack.webp">
        <div class="s-character__name">Kori</div>
      </div>
      <div @click="choose('herbalist')" class="s-character" :class="{'-selected': chosenCharacter === 'herbalist'}">
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
  chosenCharacter.value = character
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
</style>

<template>
  <div class="s-screen">
    <div>
    <div class="s-message">You died.</div>
    <div class="s-hint">Having mastered some arcane arts, you can rise again, keeping your inventory.</div>
    </div>
    <button @click="restart" class="s-restart">Rise again</button>
  </div>
</template>

<script lang="ts" setup>
import { usePlayerStore } from '@/stores/playerStore'
import { usePromptStore } from '@/stores/promptStore'
import { useRouter } from 'vue-router'

const playerStore = usePlayerStore()
const promptStore = usePromptStore()
const router = useRouter()
function restart() {
  const inventory = JSON.parse(JSON.stringify(playerStore.inventory))
  playerStore.$reset()

  promptStore.messageHistory = []
  promptStore.prompt = ''
  promptStore.memory = []
  promptStore.currentMessage = null
  playerStore.inventory = inventory
  playerStore.playerPosition = [13,13]
  router.replace('/')
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
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .s-hint {
    color: gray;
    font-style: italic;
    font-size: 14px;
  }
  .s-message {
    color: red;
    font-weight: bold;
    font-size: 36px;
  }
  .s-restart {
    border: 2px solid red;
    color: white;
    padding: 8px 16px;
    background: transparent;
    cursor: pointer;
  }
</style>

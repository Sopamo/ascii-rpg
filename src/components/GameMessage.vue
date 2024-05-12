<template>
  <div v-if="promptStore.currentMessage" class="system-message">
    <img class="s-avatar" :src="promptStore.talkingTo ? `/img/${promptStore.talkingTo}.webp` : '/img/lake.webp'" />
    <div class="message">
      <div>{{ promptStore.currentMessage.response }}</div>
      <div v-if="promptStore.currentMessage.inventoryActions?.add" class="s-itemsAdded">
        <div v-for="item in promptStore.currentMessage.inventoryActions.add" :key="item" class="s-itemsAdded__item">
          + {{ item }}
        </div>
      </div>
      <div v-if="promptStore.currentMessage.inventoryActions?.remove" class="s-itemsRemoved">
        <div v-for="item in promptStore.currentMessage.inventoryActions.remove" :key="item"
             class="s-itemsRemoved__item">
          - {{ item }}
        </div>
      </div>
      <div v-if="promptStore.currentMessage.hpChange" class="s-hpChange"
           :class="{'-positive': promptStore.currentMessage.hpChange > 0}">
        <template v-if="promptStore.currentMessage.hpChange > 0">+</template>
        {{ promptStore.currentMessage.hpChange }} HP
      </div>
    </div>
    <img v-if="usePlayerStore().characterId" class="s-avatar" :src="`/img/${usePlayerStore().characterId}.webp`" />
  </div>
</template>

<script setup lang="ts">
import { usePromptStore } from '@/stores/promptStore'
import { watch } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'

const promptStore = usePromptStore()

watch(() => promptStore.messageHistory, () => {
  const relevantEntries = promptStore.messageHistory.filter(entry => entry.role === 'system')
  if (relevantEntries.length === 0) {
    return
  }
  promptStore.currentMessage = relevantEntries[relevantEntries.length - 1].content
}, {
  deep: true
})
</script>

<style>
.system-message {
  position: relative;
  min-height: 45px;
  display: flex;
  flex-direction: row;
  gap: 4px;
}

.s-avatar {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid #dedede;
}

.message {
  flex: 1;
  background-color: #000;
  border-radius: 3px;
  color: #fff;
  padding: 10px;
  border: 1px solid #dedede;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.s-itemsAdded, .s-itemsRemoved {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.s-itemsAdded__item {
  font-weight: bold;
  color: green;
}

.s-itemsRemoved__item {
  font-weight: bold;
  color: red;
}

.s-hpChange {
  font-weight: bold;
  color: red;

  &.-positive {
    color: green;
  }
}
</style>

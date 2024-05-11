<template>
  <div class="system-message">
    <transition name="slide-in">
      <div v-if="systemMessage" class="message">
        <div>{{ systemMessage.narratorResponse }}</div>
        <div v-if="systemMessage.inventoryActions?.add" class="s-itemsAdded">
          <div v-for="item in systemMessage.inventoryActions.add" :key="item" class="s-itemsAdded__item">
            + {{ item }}
          </div>
        </div>
        <div v-if="systemMessage.inventoryActions?.remove" class="s-itemsRemoved">
          <div v-for="item in systemMessage.inventoryActions.remove" :key="item" class="s-itemsRemoved__item">
            - {{ item }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { usePromptStore } from '@/stores/promptStore'
import { ref, watch } from 'vue'

const promptStore = usePromptStore()

const systemMessage = ref<null|any>(null)
watch(() => promptStore.messageHistory, () => {
  const relevantEntries = promptStore.messageHistory.filter(entry => entry.role === "system")
  if(relevantEntries.length === 0) {
    return
  }
  systemMessage.value = relevantEntries[relevantEntries.length-1].content
}, {
  deep: true,
})
</script>

<style>
.system-message {
  position: relative;
  min-height: 45px;
}

.message {
  background-color: #000;
  border-radius: 3px;
  color: #fff;
  padding: 10px;
  border: 1px solid #dedede;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.slide-in-enter-active {
  transition: all 0.5s ease-out;
}

.slide-in-leave-active {
  transition: all 0.5s ease-in;
}

.slide-in-enter, .slide-in-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-in-enter-to, .slide-in-leave {
  transform: translateY(0);
  opacity: 1;
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
</style>

<template>
  <div class="system-message">
    <transition name="slide-in">
      <div v-if="systemMessage" class="message">{{ systemMessage }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { usePromptStore } from '@/stores/promptStore'
import { ref, watch } from 'vue'

const promptStore = usePromptStore()

const systemMessage = ref<null|string>("")
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
</style>

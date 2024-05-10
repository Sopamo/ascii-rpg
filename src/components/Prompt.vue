<template>
  <div class="s-promptInput" :class="{'-loading': promptStore.isLoading}">
    <form @submit.prevent="submit">
      <input @focus="promptStore.isFocused = true" @blur="promptStore.isFocused = false" ref="inputRef" :disabled="promptStore.isLoading" type="text" placeholder="What do you want to do?" v-model="promptStore.prompt" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { usePromptStore } from '@/stores/promptStore'
import { ref } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { usePlayerStore } from '@/stores/playerStore'

const playerStore = usePlayerStore()
const promptStore = usePromptStore()
const inputRef = ref<null|HTMLInputElement>(null)

onKeyStroke(['Escape'], (e) => {
  e.preventDefault()
  inputRef.value?.blur()
})

onKeyStroke(['Enter'], () => {
  inputRef.value?.focus()
})

async function submit() {
  if(!promptStore.prompt) {
    return
  }
  const response = await promptStore.submitPrompt()
  playerStore.updateInventoryFromResponse(response)
  inputRef.value?.focus()
}

</script>

<style lang="scss" scoped>
.s-promptInput {
  padding: 4px 8px;
  border-radius: 3px;
  background: black;
  border: 1px solid #dedede;

  &.-loading {
    background: #1c1c1c;

  }

  input {
    width: 100%;
    height: 40px;
    outline: none;
    font-size: 18px;
    border: none;
    background: transparent;
    color: #dedede;
  }
}
</style>

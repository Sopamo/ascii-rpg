<template>
  <div class="s-promptInput__wrapper">
    <div class="s-promptInput" :class="{'-loading': promptStore.isLoading}">
      <form @submit.prevent="submit">
        <input @focus="promptStore.isFocused = true" @blur="promptStore.isFocused = false" ref="inputRef"
               :disabled="promptStore.isLoading" type="text" placeholder="What do you want to do?"
               v-model="promptStore.prompt" />
      </form>
    </div>
    <div class="s-blurMessage">
      <template v-if="promptStore.isFocused">
        Press [esc] to be able to move
      </template>
      <template v-else>
        Press [enter] to write
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePromptStore } from '@/stores/promptStore'
import { ref } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { usePlayerStore } from '@/stores/playerStore'
import { speak } from '@/playAudio'

const playerStore = usePlayerStore()
const promptStore = usePromptStore()
const inputRef = ref<null | HTMLInputElement>(null)

onKeyStroke(['Escape'], (e) => {
  e.preventDefault()
  inputRef.value?.blur()
})
let justFocusedPrompt = false
onKeyStroke(['Enter'], async (e) => {
  if(promptStore.isFocused) {
    return
  }
  // Make sure to not submit the form, immediately after focusing the input
  justFocusedPrompt = true
  inputRef.value?.focus()
})

async function submit() {
  if (!promptStore.prompt || justFocusedPrompt) {
    justFocusedPrompt = false
    return
  }
  const response = await promptStore.submitPrompt()
  speak(response.narratorResponse)
  playerStore.updateInventoryFromResponse(response)
  playerStore.updateTimeFromResponse(response)
  playerStore.updateHPFromResponse(response)
  inputRef.value?.focus()
}

</script>

<style lang="scss" scoped>
.s-promptInput__wrapper {
  display: flex;
  flex-direction: column;
}
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

.s-blurMessage {
  font-style: italic;
  font-size: 14px;
  color: gray;
}
</style>

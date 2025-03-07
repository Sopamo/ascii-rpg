<template>
  <div class="s-promptInput__wrapper">
    <div class="s-promptInput" :class="{'-loading': promptStore.isLoading}">
      <div v-if="talkingToLabel">To: {{ talkingToLabel }}</div>
      <form @submit.prevent="submit"
            style="flex: 1">
        <input @focus="promptStore.isFocused = true" @blur="promptStore.isFocused = false" ref="inputRef"
               :disabled="promptStore.isLoading" type="text" :placeholder="talkingToLabel ? 'What do you want to say / do?' : 'What do you want to do?'"
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
import { computed, ref } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { usePlayerStore } from '@/stores/playerStore'
import { speak, speakGoogle } from '@/playAudio'
import { specialThings } from '@/stores/mapStore'
import { getCurrentEnvironment } from '@/environments/Environment'
import { useSettingsStore } from '@/stores/settingsStore'

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
  if(response.response) {
    speakGoogle(response.response)
  }
  inputRef.value?.focus()
}

const talkingToLabel = computed(() => {
  if(!promptStore.talkingTo) {
    return null
  }
  const specialThing = Object.values(specialThings).find(thing => thing.id === promptStore.talkingTo)
  if(specialThing) {
    return specialThing.label
  }
  const specialThingActor = getCurrentEnvironment().actors.find(actor => actor.id === promptStore.talkingTo)
  if(specialThingActor) {
    return specialThingActor.label
  }
  return null
})

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
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;

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

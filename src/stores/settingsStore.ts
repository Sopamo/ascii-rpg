import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { acceptHMRUpdate } from "pinia"

export const useSettingsStore = defineStore('settings', () => {
  const groqApiKey = useStorage('groq-api-key', '')

  function getGroqApiKey() {
    if(!groqApiKey.value) {
      groqApiKey.value = prompt('Please enter your groq api key')
    }
    return groqApiKey.value
  }

  const deepgramApiKey = useStorage('deepgram-api-key', '')

  function getDeepgramApiKey() {
    if(!deepgramApiKey.value) {
      deepgramApiKey.value = prompt('Please enter your deepgram api key')
    }
    return deepgramApiKey.value
  }

  return { getGroqApiKey, getDeepgramApiKey }
})

if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}

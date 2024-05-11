import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
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

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

  return { getGroqApiKey }
})

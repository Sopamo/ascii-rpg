import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
export const useSettingsStore = defineStore('settings', () => {
  const groqApiKey = useStorage('groq-api-key', '')

  function getGroqApiKey() {
    const apiKey = groqApiKey.value
    if(!apiKey) {
      groqApiKey.value = prompt('Please enter your groq api key')
    }
    return apiKey
  }

  return { getGroqApiKey }
})

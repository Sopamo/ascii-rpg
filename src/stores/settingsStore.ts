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

  const openAIApiKey = useStorage('openai-api-key', '')

  function getOpenAIApiKey() {
    if(!openAIApiKey.value) {
      openAIApiKey.value = prompt('Please enter your open ai api key')
    }
    return openAIApiKey.value
  }


  const googleCloudApiKey = useStorage('google-cloud-api-key', '')

  function getGoogleCloudApiKey() {
    if(!googleCloudApiKey.value) {
      googleCloudApiKey.value = prompt('Please enter your google cloud api key')
    }
    return googleCloudApiKey.value
  }

  const deepgramApiKey = useStorage('deepgram-api-key', '')

  function getDeepgramApiKey() {
    if(!deepgramApiKey.value) {
      deepgramApiKey.value = prompt('Please enter your deepgram api key')
    }
    return deepgramApiKey.value
  }

  // Audio output settings
  const enableAudioOutput = useStorage('enable-audio-output', true)
  const audioOutputType = useStorage('audio-output-type', 'local')

  return { 
    getGroqApiKey, 
    getDeepgramApiKey, 
    getOpenAIApiKey, 
    getGoogleCloudApiKey,
    // Direct access to the reactive values for the settings page
    groqApiKey,
    openAIApiKey,
    googleCloudApiKey,
    deepgramApiKey,
    enableAudioOutput,
    audioOutputType
  }
})

if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}

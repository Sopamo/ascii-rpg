<template>
  <MapRenderer />
  <Prompt />
</template>
<script setup lang="ts">
import MapRenderer from '@/components/MapRenderer.vue'
import Prompt from '@/components/Prompt.vue'
import { Lake } from '@/environments/Lake'
import { onUnmounted } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/playerStore'
import { setCurrentEnvironment } from '@/environments/Environment'

const playerStore = usePlayerStore()
const router = useRouter()

if(!playerStore.characterId) {
  router.replace('/characters')
}

const environment = new Lake()
environment.spawn()
setCurrentEnvironment(environment)
onBeforeRouteLeave(() => {
  environment.despawn()
})
onUnmounted(() => {
  environment.despawn()
})
</script>

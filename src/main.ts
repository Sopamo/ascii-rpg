import './assets/main.css'

import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

pinia.use(({ store }) => {
  // important! dont add a $router here
  store.router = markRaw(router)
})
app.mount('#app')

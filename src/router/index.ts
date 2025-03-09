import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      redirect: '/characters',
      children: [
        {
          path: '/characters',
          name: 'characters',
          component: () => import('../views/Characters.vue')
        },
        {
          path: '/adventure',
          name: 'adventure',
          component: () => import('../views/Adventure.vue')
        },
        {
          path: '/you-died',
          name: 'dead',
          component: () => import('../views/YouDied.vue')
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('../views/Settings.vue')
        },
        {
          path: '/messages',
          name: 'messages',
          component: () => import('../views/Messages.vue')
        }
      ]
    },
  ]
})

export default router

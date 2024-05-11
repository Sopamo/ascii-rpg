import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      redirect: '/adventure',
      children: [
        {
          path: '/adventure',
          name: 'adventure',
          component: () => import('../views/Adventure.vue')
        },
        {
          path: '/you-died',
          name: 'dead',
          component: () => import('../views/YouDied.vue')
        }
      ]
    },
  ]
})

export default router

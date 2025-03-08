<template>
  <div class="s-app">
    <header>
      <div class="wrapper">
        Ascii RPG
      </div>
    </header>

    <RouterView class="s-page" />
    
    <div class="s-settings-link">
      <router-link to="/settings">⚙️ Settings</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
  margin-bottom: 20px;
}

.s-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
}

.s-page {
  flex: 1;
  width: 800px;
}

.s-settings-link {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

.s-settings-link a {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(17,18,27,0.8) 100%);
  border-radius: 4px;
  color: white;
  text-decoration: none;
  border: 1px solid #dedede;
  transition: all 0.2s ease;
}

.s-settings-link a:hover {
  background: linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(17,18,27,1) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>

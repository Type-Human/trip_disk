<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const hideHeader = computed(() => {
  return route.path === '/login' || route.path === '/register'
})

</script>

<template>
  <div id="app">
    <AppHeader v-if="!hideHeader"/>
    <main>
      <router-view />
    </main>
  </div>
</template>

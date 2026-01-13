<script setup lang="ts">
import TripList from '../components/trips/TripList.vue'
</script>

<template>
  <div class="home container--small">
    <div class="home__header">
      <div class="home__header--title">
        <h1>Путешествия</h1>
      </div>
      <div class="home__header--optons" />
      <div>
        <TripList />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .home {
  margin-top: $spacing-xl;
}
</style>

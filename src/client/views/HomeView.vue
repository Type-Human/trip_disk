<script setup lang="ts">
import TripList from '../components/trips/TripList.vue'
</script>

<template>
  <div class="home container">
    <div class="home__content">
      <div class="home__nav" />

      <div class="home__trips">
        <TripList />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home {
  margin-top: $spacing-xl;
  &__content {
    display: flex;
    width: 100%;
    gap: var(--spacing-lg);
    gap: $spacing-sm;
  }
}

.home__nav {
  width: 20%;
  min-width: 200px;
  max-width: 220px;
  border-radius: $spacing-sm;
  height: 400px;
  border: 1px solid black;
  padding: var(--spacing-md);
}

.home__trips {
  flex: 1;
  min-width: 0;

  .trips-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    h1 {
      font-size: 2rem;
      margin: 0;
      color: var(--color-text);
    }
  }
}
</style>

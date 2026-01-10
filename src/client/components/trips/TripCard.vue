<script setup lang="ts">
import type { Trip } from '../../types/trip'
import Button from '../ui/Button.vue'

defineProps<{
  trip: Trip
}>()
</script>

<template>
  <div class="trip-card">
    <h3>{{ trip.title }}</h3>
    <p>{{ trip.description }}</p>
    <Button>Подробнее</Button>
  </div>
</template>

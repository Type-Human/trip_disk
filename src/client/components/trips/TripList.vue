<script setup lang="ts">
import type { Trip } from '../../types/trip'
import { useTripStore } from '../../stores/tripStore'
import TripCard from './TripCard.vue'

const tripStore = useTripStore()
const trips = tripStore.trips
</script>

<template>
  <div class="trip-list container">
    <TripCard v-for="trip in trips" :key="trip.id" :trip="trip" />
  </div>
</template>

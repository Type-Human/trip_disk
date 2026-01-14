<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTripStore } from '../../stores/tripStore'
import TripCard from './TripCard.vue'

const tripStore = useTripStore()
const trips = computed(() => tripStore.trips)

onMounted(() => {
  tripStore.fetchTrips()
})
</script>

<template>
  <TripCard v-for="trip in trips" :key="trip.id" :trip="trip" />
</template>

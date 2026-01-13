import type { Trip } from '../types/trip'
import { defineStore } from 'pinia'
import { tripApi } from '../api/trip'

export const useTripStore = defineStore('trip', {
  state: () => ({
    trips: [] as Trip[],
    selectedTrip: null as Trip | null,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {

    async fetchTrips() {
      this.isLoading = true
      this.error = null

      try {
        this.trips = await tripApi.getAll()
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Ошибка загрузки поездок'
        console.error('Failed to fetch trips:', error)
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchTripById(id: string) {
      this.isLoading = true
      this.error = null

      try {
        this.selectedTrip = await tripApi.getById(id)
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'Ошибка загрузки поездки'
        console.error(`Failed to fetch trip ${id}:`, error)
      }
      finally {
        this.isLoading = false
      }
    },

    clearSelectedTrip() {
      this.selectedTrip = null
    },
  },

  getters: {

    tripsCount: state => state.trips.length,

    hasTrips: state => state.trips.length > 0,

    getTripById: (state) => {
      return (id: string) => state.trips.find(trip => trip.id === id)
    },
  },
})

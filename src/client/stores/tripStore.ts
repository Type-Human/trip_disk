import type { Trip } from '../types/trip'
import { defineStore } from 'pinia'

export const useTripStore = defineStore('trip', {
  state: () => ({
    trips: [] as Trip[],
    selectedTrip: null as Trip | null,
  }),
  actions: {

  },
  getters: {

  },
})

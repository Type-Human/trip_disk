import type { Trip, TripMedia } from '../types/trip'
import { $fetch } from 'ofetch'

export const tripApi = {

  getAll: () => $fetch<Trip[]>('/data/trips/all-trips.json'),

  getById: (id: string) =>
    $fetch<Trip>(`/data/trips/${id}/data.json`)
      .catch((error) => {
        console.warn(`Поездка ${id} не найдена:`, error)
        throw new Error(`Поездка с ID ${id} не найдена`)
      }),

  getMedia: (tripId: string) =>
    $fetch<TripMedia>(`/data/trips/${tripId}/media.json`)
      .catch((error) => {
        console.warn(`Медиа для поездки ${tripId} не найдены:`, error)
        return {
          tripId,
          photos: [],
          videos: [],
          total: 0,
        } as TripMedia
      }),

  getByIdWithMedia: async (id: string) => {
    const [trip, media] = await Promise.all([
      tripApi.getById(id),
      tripApi.getMedia(id),
    ])

    return {
      ...trip,
      media,
    }
  },

  search: (query: string) =>
    tripApi.getAll().then(trips =>
      trips.filter(trip =>
        trip.title.toLowerCase().includes(query.toLowerCase())
        || trip.description.toLowerCase().includes(query.toLowerCase())
        || trip.location.toLowerCase().includes(query.toLowerCase()),
      ),
    ),
}

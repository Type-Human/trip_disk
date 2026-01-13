import type { Trip } from '../types/trip'
import { $fetch } from 'ofetch'

export const tripApi = {

  getAll: () => $fetch<Trip[]>('/data/trips.json'),

  getById: (id: string) =>
    $fetch<Trip[]>('/data/trips.json')
      .then((trips) => {
        const trip = trips.find(t => t.id === id)
        if (!trip)
          throw new Error(`Поездка с ID ${id} не найдена`)
        return trip
      }),
}

import type { CreateTripDto, Trip } from '../../client/types/trip'
import { tripsStorage } from '../storage'

export class TripService {
  private trips: Trip[] = []

  async initialize(): Promise<void> {
    this.trips = await tripsStorage.load()
  }

  async getAll(): Promise<Trip[]> {
    return this.trips
  }

  async getById(id: string): Promise<Trip | null> {
    return this.trips.find(t => t.id === id) || null
  }

  async create(tripData: CreateTripDto, coverImageUrl?: string): Promise<Trip> {
    const trip: Trip = {
      id: Date.now().toString(),
      title: tripData.title,
      description: tripData.description || '',
      date: tripData.date,
      location: tripData.location || '',
      coverImage: coverImageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.trips.push(trip)
    await this.save()
    return trip
  }

  async delete(id: string): Promise<boolean> {
    const index = this.trips.findIndex(t => t.id === id)
    if (index === -1) {
      return false
    }

    this.trips.splice(index, 1)
    await this.save()
    return true
  }

  private async save(): Promise<void> {
    await tripsStorage.save(this.trips)
  }
}

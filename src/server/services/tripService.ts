import type { CreateTripDto, Trip } from '../../client/types/trip'
import { getDatabase } from '../database'

export class TripService {
  async initialize(): Promise<void> {
  }

  async getAll(): Promise<Trip[]> {
    const db = getDatabase().getDatabase()
    const trips = db.prepare('SELECT * FROM trips ORDER BY createdAt DESC').all() as Trip[]
    return trips
  }

  async getById(id: string): Promise<Trip | null> {
    const db = getDatabase().getDatabase()
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id) as Trip | undefined
    return trip || null
  }

  async create(tripData: CreateTripDto, coverImageUrl?: string): Promise<Trip> {
    const db = getDatabase().getDatabase()
    const id = Date.now().toString()
    const now = new Date().toISOString()

    const trip: Trip = {
      id,
      title: tripData.title,
      description: tripData.description || '',
      date: tripData.date,
      location: tripData.location || '',
      coverImage: coverImageUrl,
      createdAt: now,
      updatedAt: now,
    }

    db.prepare(`
      INSERT INTO trips (id, title, description, date, location, coverImage, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      trip.id,
      trip.title,
      trip.description,
      trip.date,
      trip.location,
      trip.coverImage || null,
      trip.createdAt,
      trip.updatedAt,
    )

    return trip
  }

  async delete(id: string): Promise<boolean> {
    const db = getDatabase().getDatabase()
    const result = db.prepare('DELETE FROM trips WHERE id = ?').run(id)
    return result.changes > 0
  }

  async update(id: string, data: Partial<Trip>): Promise<Trip | null> {
    const db = getDatabase().getDatabase()
    const existing = await this.getById(id)
    if (!existing) {
      return null
    }

    const updated: Trip = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    db.prepare(`
      UPDATE trips 
      SET title = ?, description = ?, date = ?, location = ?, coverImage = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      updated.title,
      updated.description,
      updated.date,
      updated.location,
      updated.coverImage || null,
      updated.updatedAt,
      id,
    )

    return updated
  }
}

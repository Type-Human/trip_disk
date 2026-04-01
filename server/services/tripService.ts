import type { CreateTripDto, Trip } from '../types/trip'
import { getDatabase } from '../database'
import { existsSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

export class TripService {
  async initialize(): Promise<void> {
  }

  async getAllPublic(): Promise<Trip[]> {
    const db = getDatabase().getDatabase()
    const trips = db.prepare(`
      SELECT * FROM trips 
      WHERE isPublic = 1 
      ORDER BY createdAt DESC
    `).all() as Trip[]
    return trips
  }

  async getUserTrips(userId: number): Promise<Trip[]> {
    const db = getDatabase().getDatabase()
    const trips = db.prepare(`
      SELECT * FROM trips 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `).all(userId) as Trip[]
    return trips
  }

  async getById(id: string, userId?: number): Promise<Trip | null> {
    const db = getDatabase().getDatabase()
    let trip: Trip | undefined
    
    if (userId) {
      trip = db.prepare(`
        SELECT * FROM trips 
        WHERE id = ? AND userId = ?
      `).get(id, userId) as Trip | undefined
    } else {
      trip = db.prepare(`
        SELECT * FROM trips 
        WHERE id = ?
      `).get(id) as Trip | undefined
    }
    
    return trip || null
  }

  async create(tripData: CreateTripDto, userId: number, coverImageUrl?: string): Promise<Trip> {
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
      INSERT INTO trips (id, title, description, date, location, coverImage, userId, isPublic, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(
      trip.id,
      trip.title,
      trip.description,
      trip.date,
      trip.location,
      trip.coverImage || null,
      userId,
      trip.createdAt,
      trip.updatedAt,
    )

    return trip
  }

  async setPublic(id: string, userId: number, isPublic: boolean): Promise<boolean> {
    const db = getDatabase().getDatabase()
    const result = db.prepare(`
      UPDATE trips 
      SET isPublic = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(isPublic ? 1 : 0, new Date().toISOString(), id, userId)
    return result.changes > 0
  }

  async delete(id: string, userId: number): Promise<boolean> {
    const db = getDatabase().getDatabase()
    
    const trip = db.prepare(`
      SELECT * FROM trips WHERE id = ? AND userId = ?
    `).get(id, userId) as Trip | undefined
    
    if (!trip) {
      return false
    }
    
    if (trip.coverImage) {
      try {
        const filename = trip.coverImage.replace('/uploads/', '')
        const filepath = join('/app/uploads', filename)
        if (existsSync(filepath)) {
          await unlink(filepath)
        }
      } catch (error) {
        console.error('Ошибка удаления обложки:', error)
      }
    }
    
    const photos = db.prepare('SELECT * FROM photos WHERE tripId = ?').all(id) as any[]
    for (const photo of photos) {
      try {
        const filename = photo.url.replace('/uploads/', '')
        const filepath = join('/app/uploads', filename)
        if (existsSync(filepath)) {
          await unlink(filepath)
        }
      } catch (error) {
        console.error('Ошибка удаления фото:', error)
      }
    }
    
    db.prepare('DELETE FROM folders WHERE tripId = ?').run(id)
    db.prepare('DELETE FROM photos WHERE tripId = ?').run(id)
    const result = db.prepare('DELETE FROM trips WHERE id = ? AND userId = ?').run(id, userId)
    
    return result.changes > 0
  }
}
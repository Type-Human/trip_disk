import type { CreateTripDto, Trip } from '../types/trip'
import { getDatabase } from '../database'
import { existsSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

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
    console.log('УДАЛЕНИЕ ПОЕЗДКИ ID:', id)
    
    const db = getDatabase().getDatabase()
    
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id) as Trip | undefined
    
    if (!trip) {
      console.log('Поездка не найдена')
      return false
    }
    
    console.log('Поездка:', trip.title)
    
    if (trip.coverImage) {
      try {
        const filename = trip.coverImage.replace('/uploads/', '')
        const filepath = join('/app/uploads', filename)
        
        console.log('Файл обложки:', filepath)
        
        if (existsSync(filepath)) {
          await unlink(filepath)
          console.log('Обложка удалена')
        } else {
          console.log('Файл обложки не найден')
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
          console.log('Фото удалено:', photo.filename)
        }
      } catch (error) {
        console.error('Ошибка удаления фото:', error)
      }
    }
    
    const foldersResult = db.prepare('DELETE FROM folders WHERE tripId = ?').run(id)
    console.log('Папок удалено:', foldersResult.changes)
    
    const photosResult = db.prepare('DELETE FROM photos WHERE tripId = ?').run(id)
    console.log('Фото удалено из БД:', photosResult.changes)
    
    const result = db.prepare('DELETE FROM trips WHERE id = ?').run(id)
    console.log('Поездка удалена из БД:', result.changes > 0)
    
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

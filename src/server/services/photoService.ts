import type { Photo } from '../../client/types/trip'
import { existsSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { getDatabase } from '../database'
import { fileStorage } from '../storage'

export class PhotoService {
  async initialize(): Promise<void> {
  }

  async getByTripId(tripId: string): Promise<Photo[]> {
    const db = getDatabase().getDatabase()
    const photos = db.prepare('SELECT * FROM photos WHERE tripId = ? ORDER BY uploadedAt DESC').all(tripId) as Photo[]
    return photos
  }

  async getByFolderId(folderId: string): Promise<Photo[]> {
    const db = getDatabase().getDatabase()
    const photos = db.prepare('SELECT * FROM photos WHERE folderId = ? ORDER BY uploadedAt DESC').all(folderId) as Photo[]
    return photos
  }

  async upload(
    tripId: string,
    files: File[],
    folderId?: string,
  ): Promise<Photo[]> {
    const db = getDatabase().getDatabase()
    const uploadedPhotos: Photo[] = []

    for (const file of files) {
      const filename = await fileStorage.saveFile(file)

      const photo: Photo = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tripId,
        url: `/uploads/${filename}`,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        folderId,
      }

      db.prepare(`
        INSERT INTO photos (id, tripId, folderId, url, filename, size, uploadedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        photo.id,
        photo.tripId,
        photo.folderId || null,
        photo.url,
        photo.filename,
        photo.size,
        photo.uploadedAt,
      )

      uploadedPhotos.push(photo)
    }

    return uploadedPhotos
  }

  async delete(id: string): Promise<boolean> {
    const db = getDatabase().getDatabase()
    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(id) as Photo | undefined

    if (!photo) {
      return false
    }

    try {
      const filename = photo.url.replace('/uploads/', '')
      const filepath = join(process.cwd(), 'public', 'uploads', filename)

      if (existsSync(filepath)) {
        await unlink(filepath)
      }
    }
    catch (error) {
      console.error('Ошибка удаления файла:', error)
    }

    const result = db.prepare('DELETE FROM photos WHERE id = ?').run(id)
    return result.changes > 0
  }

  async deleteByTripId(tripId: string): Promise<number> {
    const db = getDatabase().getDatabase()
    const photos = db.prepare('SELECT * FROM photos WHERE tripId = ?').all(tripId) as Photo[]

    for (const photo of photos) {
      try {
        const filename = photo.url.replace('/uploads/', '')
        const filepath = join(process.cwd(), 'public', 'uploads', filename)

        if (existsSync(filepath)) {
          await unlink(filepath)
        }
      }
      catch (error) {
        console.error('Ошибка удаления файла:', error)
      }
    }

    const result = db.prepare('DELETE FROM photos WHERE tripId = ?').run(tripId)
    return result.changes
  }

  async deleteByFolderId(folderId: string): Promise<number> {
    const db = getDatabase().getDatabase()
    const photos = db.prepare('SELECT * FROM photos WHERE folderId = ?').all(folderId) as Photo[]

    for (const photo of photos) {
      try {
        const filename = photo.url.replace('/uploads/', '')
        const filepath = join(process.cwd(), 'public', 'uploads', filename)

        if (existsSync(filepath)) {
          await unlink(filepath)
        }
      }
      catch (error) {
        console.error('Ошибка удаления файла:', error)
      }
    }

    const result = db.prepare('DELETE FROM photos WHERE folderId = ?').run(folderId)
    return result.changes
  }
}

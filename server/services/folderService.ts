import type { CreateFolderDto, Folder } from '../types/trip'
import type { PhotoService } from './photoService'
import { getDatabase } from '../database'

export class FolderService {
  private photoService?: PhotoService

  setPhotoService(photoService: PhotoService): void {
    this.photoService = photoService
  }

  async initialize(): Promise<void> {
  }

  async getByTripId(tripId: string): Promise<Folder[]> {
    const db = getDatabase().getDatabase()
    const folders = db.prepare('SELECT * FROM folders WHERE tripId = ? ORDER BY createdAt DESC').all(tripId) as Folder[]
    return folders
  }

  async getById(id: string): Promise<Folder | null> {
    const db = getDatabase().getDatabase()
    const folder = db.prepare('SELECT * FROM folders WHERE id = ?').get(id) as Folder | undefined
    return folder || null
  }

  async create(folderData: CreateFolderDto): Promise<Folder> {
    const db = getDatabase().getDatabase()
    const folder: Folder = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tripId: folderData.tripId,
      name: folderData.name,
      createdAt: new Date().toISOString(),
    }

    db.prepare(`
      INSERT INTO folders (id, tripId, name, createdAt)
      VALUES (?, ?, ?, ?)
    `).run(
      folder.id,
      folder.tripId,
      folder.name,
      folder.createdAt,
    )

    return folder
  }

  async delete(id: string): Promise<boolean> {
    const db = getDatabase().getDatabase()
    if (this.photoService) {
      const photos = await this.photoService.getByFolderId(id)
      for (const photo of photos) {
        await this.photoService.delete(photo.id)
      }
    }

    const result = db.prepare('DELETE FROM folders WHERE id = ?').run(id)
    return result.changes > 0
  }

  async update(id: string, name: string): Promise<Folder | null> {
    const db = getDatabase().getDatabase()
    const existing = await this.getById(id)
    if (!existing) {
      return null
    }

    db.prepare('UPDATE folders SET name = ? WHERE id = ?').run(name, id)

    return {
      ...existing,
      name,
    }
  }
}

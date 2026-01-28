import type { Photo } from '../../client/types/trip'
import { existsSync, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { fileStorage, photosStorage } from '../storage'

export class PhotoService {
  private photos: Photo[] = []

  async initialize(): Promise<void> {
    this.photos = await photosStorage.load()
  }

  async getByTripId(tripId: string): Promise<Photo[]> {
    return this.photos.filter(p => p.tripId === tripId)
  }

  async upload(
    tripId: string,
    files: File[],
    folderId?: string,
  ): Promise<Photo[]> {
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

      this.photos.push(photo)
      uploadedPhotos.push(photo)
    }

    await this.save()
    return uploadedPhotos
  }

  async delete(id: string): Promise<boolean> {
    const photoIndex = this.photos.findIndex(p => p.id === id)
    if (photoIndex === -1) {
      return false
    }

    const photo = this.photos[photoIndex]

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

    this.photos.splice(photoIndex, 1)
    await this.save()
    return true
  }

  async deleteByTripId(tripId: string): Promise<number> {
    const photosToDelete = this.photos.filter(p => p.tripId === tripId)
    const deletedCount = photosToDelete.length

    this.photos = this.photos.filter(p => p.tripId !== tripId)

    for (const photo of photosToDelete) {
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

    if (deletedCount > 0) {
      await this.save()
    }

    return deletedCount
  }

  private async save(): Promise<void> {
    await photosStorage.save(this.photos)
  }
}

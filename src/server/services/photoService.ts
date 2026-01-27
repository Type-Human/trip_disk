import type { Photo } from '../../client/types/trip'
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

  private async save(): Promise<void> {
    await photosStorage.save(this.photos)
  }
}

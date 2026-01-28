import type { CreateFolderDto, Folder } from '../../client/types/trip'
import { foldersStorage } from '../storage'

export class FolderService {
  private folders: Folder[] = []

  async initialize(): Promise<void> {
    this.folders = await foldersStorage.load()
  }

  async getByTripId(tripId: string): Promise<Folder[]> {
    return this.folders.filter(f => f.tripId === tripId)
  }

  async create(folderData: CreateFolderDto): Promise<Folder> {
    const folder: Folder = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tripId: folderData.tripId,
      name: folderData.name,
      createdAt: new Date().toISOString(),
    }

    this.folders.push(folder)
    await this.save()
    return folder
  }

  async delete(id: string): Promise<boolean> {
    const index = this.folders.findIndex(f => f.id === id)
    if (index === -1) {
      return false
    }

    this.folders.splice(index, 1)
    await this.save()
    return true
  }

  private async save(): Promise<void> {
    await foldersStorage.save(this.folders)
  }
}

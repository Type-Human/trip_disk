import type { CreateTripDto, Folder, Photo, Trip } from '../types/trip'

let mockTrips: Trip[] = []
let mockPhotos: Photo[] = []
let mockFolders: Folder[] = []

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const mockApi = {

  async getTrips(): Promise<Trip[]> {
    return [...mockTrips]
  },

  async getTripById(id: string): Promise<Trip> {
    const trip = mockTrips.find(t => t.id === id)
    if (!trip) {
      throw new Error('Поездка не найдена')
    }
    return { ...trip }
  },

  async createTrip(data: CreateTripDto): Promise<Trip> {
    let coverImageUrl: string | undefined

    if (data.coverImage) {
      coverImageUrl = URL.createObjectURL(data.coverImage)
    }

    const trip: Trip = {
      id: generateId(),
      title: data.title,
      description: data.description,
      date: data.date,
      location: data.location,
      coverImage: coverImageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockTrips.push(trip)
    return { ...trip }
  },

  async getPhotosByTripId(tripId: string): Promise<Photo[]> {
    return mockPhotos.filter(p => p.tripId === tripId)
  },

  async uploadPhotos(
    tripId: string,
    files: File[],
    folderId?: string,
  ): Promise<Photo[]> {
    const uploadedPhotos: Photo[] = []

    for (const file of files) {
      const url = URL.createObjectURL(file)

      const photo: Photo = {
        id: generateId(),
        tripId,
        url,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        folderId: folderId || undefined,
      }

      mockPhotos.push(photo)
      uploadedPhotos.push(photo)
    }

    return uploadedPhotos
  },

  async getFoldersByTripId(tripId: string): Promise<Folder[]> {
    return mockFolders.filter(f => f.tripId === tripId)
  },

  async createFolder(tripId: string, name: string): Promise<Folder> {
    const folder: Folder = {
      id: generateId(),
      tripId,
      name,
      createdAt: new Date().toISOString(),
    }
    mockFolders.push(folder)
    return { ...folder }
  },
}

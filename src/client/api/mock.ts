import type { CreateTripDto, Folder, Photo, Trip } from '../types/trip'

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

let trips: Trip[] = []
let photos: Photo[] = []
let folders: Folder[] = []

function delay<T>(data: T, ms: number = 300): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), ms))
}

export const mockApi = {

  getTrips: (): Promise<Trip[]> => delay([...trips]),

  getTripById: (id: string): Promise<Trip> => {
    const trip = trips.find(t => t.id === id)
    if (!trip)
      throw new Error('Поездка не найдена')
    return delay(trip)
  },

  createTrip: (data: CreateTripDto & { coverImage?: File }): Promise<Trip> => {
    const trip: Trip = {
      id: generateId(),
      title: data.title,
      description: data.description || '',
      date: data.date,
      location: data.location || '',
      coverImage: data.coverImage ? URL.createObjectURL(data.coverImage) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    trips.push(trip)
    return delay(trip)
  },

  deleteTrip: async (id: string): Promise<void> => {
    photos = photos.filter(p => p.tripId !== id)
    folders = folders.filter(f => f.tripId !== id)
    trips = trips.filter(t => t.id !== id)
    return delay(undefined)
  },

  updateTrip: (id: string, data: Partial<Trip>): Promise<Trip> => {
    const index = trips.findIndex(t => t.id === id)
    if (index === -1)
      throw new Error('Поездка не найдена')

    trips[index] = {
      ...trips[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return delay(trips[index])
  },

  getPhotosByTripId: (tripId: string): Promise<Photo[]> =>
    delay(photos.filter(p => p.tripId === tripId)),

  uploadPhotos: (tripId: string, files: File[], folderId?: string): Promise<Photo[]> => {
    const uploaded: Photo[] = []

    files.forEach((file) => {
      const photo: Photo = {
        id: generateId(),
        tripId,
        url: URL.createObjectURL(file),
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        folderId,
      }
      photos.push(photo)
      uploaded.push(photo)
    })

    return delay(uploaded)
  },

  deletePhoto: (id: string): Promise<void> => {
    photos = photos.filter(p => p.id !== id)

    return delay(undefined)
  },

  updatePhoto: (id: string, data: Partial<Photo>): Promise<Photo> => {
    const index = photos.findIndex(p => p.id === id)
    if (index === -1)
      throw new Error('Фото не найдено')

    photos[index] = { ...photos[index], ...data }
    return delay(photos[index])
  },

  getFoldersByTripId: (tripId: string): Promise<Folder[]> =>
    delay(folders.filter(f => f.tripId === tripId)),

  createFolder: (tripId: string, name: string): Promise<Folder> => {
    const folder: Folder = {
      id: generateId(),
      tripId,
      name,
      createdAt: new Date().toISOString(),
    }
    folders.push(folder)
    return delay(folder)
  },

  deleteFolder: (id: string): Promise<void> => {
    photos = photos.filter(p => p.folderId !== id)
    folders = folders.filter(f => f.id !== id)
    return delay(undefined)
  },

  updateFolder: (id: string, name: string): Promise<Folder> => {
    const index = folders.findIndex(f => f.id === id)
    if (index === -1)
      throw new Error('Папка не найдена')

    folders[index] = { ...folders[index], name }
    return delay(folders[index])
  },
}

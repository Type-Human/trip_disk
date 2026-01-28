import type { CreateTripDto, Folder, Photo, Trip } from '../types/trip'

// Генерация случайного ID
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Инициализация мок-данных
let trips: Trip[] = []
let photos: Photo[] = []
let folders: Folder[] = []

// Загрузка из localStorage при инициализации
if (typeof window !== 'undefined') {
  try {
    trips = JSON.parse(localStorage.getItem('mock_trips') || '[]')
    photos = JSON.parse(localStorage.getItem('mock_photos') || '[]')
    folders = JSON.parse(localStorage.getItem('mock_folders') || '[]')
  }
  catch (e) {
    console.error('Error loading mock data:', e)
  }
}

// Сохранение в localStorage
function saveData() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_trips', JSON.stringify(trips))
    localStorage.setItem('mock_photos', JSON.stringify(photos))
    localStorage.setItem('mock_folders', JSON.stringify(folders))
  }
}

// Задержка для имитации сети
function delay<T>(data: T, ms: number = 300): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), ms))
}

export const mockApi = {
  // Trip methods
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
    saveData()
    return delay(trip)
  },

  deleteTrip: async (id: string): Promise<void> => {
    // Удаляем все фото этой поездки
    photos = photos.filter(p => p.tripId !== id)
    // Удаляем все папки этой поездки
    folders = folders.filter(f => f.tripId !== id)
    // Удаляем поездку
    trips = trips.filter(t => t.id !== id)
    saveData()
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
    saveData()
    return delay(trips[index])
  },

  // Photo methods
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

    saveData()
    return delay(uploaded)
  },

  deletePhoto: (id: string): Promise<void> => {
    photos = photos.filter(p => p.id !== id)
    saveData()
    return delay(undefined)
  },

  updatePhoto: (id: string, data: Partial<Photo>): Promise<Photo> => {
    const index = photos.findIndex(p => p.id === id)
    if (index === -1)
      throw new Error('Фото не найдено')

    photos[index] = { ...photos[index], ...data }
    saveData()
    return delay(photos[index])
  },

  // Folder methods
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
    saveData()
    return delay(folder)
  },

  deleteFolder: (id: string): Promise<void> => {
    // При удалении папки удаляем все фото в ней
    photos = photos.filter(p => p.folderId !== id)
    folders = folders.filter(f => f.id !== id)
    saveData()
    return delay(undefined)
  },

  updateFolder: (id: string, name: string): Promise<Folder> => {
    const index = folders.findIndex(f => f.id === id)
    if (index === -1)
      throw new Error('Папка не найдена')

    folders[index] = { ...folders[index], name }
    saveData()
    return delay(folders[index])
  },
}

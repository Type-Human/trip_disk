import type { CreateTripDto, Folder, Photo, Trip } from '../types/trip'
import { api as realApi } from './client'
import { mockApi } from './mock'

const USE_MOCK = (import.meta as any).VITE_USE_MOCK !== 'false'

export const tripApi = {
  // Получить все поездки
  async getAll(): Promise<Trip[]> {
    if (USE_MOCK) {
      return mockApi.getTrips()
    }
    return realApi.get<Trip[]>('/trips')
  },

  // Получить поездку по ID
  async getById(id: string): Promise<Trip> {
    if (USE_MOCK) {
      return mockApi.getTripById(id)
    }
    return realApi.get<Trip>(`/trips/${id}`)
  },

  // Создать поездку
  async create(data: CreateTripDto & { coverImage?: File }): Promise<Trip> {
    if (USE_MOCK) {
      return mockApi.createTrip(data)
    }

    if (data.coverImage) {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description || '')
      formData.append('date', data.date)
      formData.append('location', data.location || '')
      formData.append('coverImage', data.coverImage)
      return realApi.upload<Trip>('/trips', formData)
    }

    return realApi.post<Trip>('/trips', {
      title: data.title,
      description: data.description,
      date: data.date,
      location: data.location,
    })
  },

  // Удалить поездку
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      return mockApi.deleteTrip(id)
    }
    return realApi.delete<void>(`/trips/${id}`)
  },

  // Получить фото поездки
  async getPhotosByTripId(tripId: string): Promise<Photo[]> {
    if (USE_MOCK) {
      return mockApi.getPhotosByTripId(tripId)
    }
    return realApi.get<Photo[]>(`/trips/${tripId}/photos`)
  },

  // Загрузить фото
  async uploadPhotos(
    tripId: string,
    files: File[],
    folderId?: string,
  ): Promise<Photo[]> {
    if (USE_MOCK) {
      return mockApi.uploadPhotos(tripId, files, folderId)
    }

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('tripId', tripId)
    if (folderId) {
      formData.append('folderId', folderId)
    }

    return realApi.upload<Photo[]>('/photos/upload', formData)
  },

  // Удалить фото
  async deletePhoto(id: string): Promise<void> {
    if (USE_MOCK) {
      return mockApi.deletePhoto(id)
    }
    return realApi.delete<void>(`/photos/${id}`)
  },

  // Получить папки поездки
  async getFoldersByTripId(tripId: string): Promise<Folder[]> {
    if (USE_MOCK) {
      return mockApi.getFoldersByTripId(tripId)
    }
    return realApi.get<Folder[]>(`/trips/${tripId}/folders`).catch(() => [])
  },

  // Получить все папки (с фильтром по tripId)
  async getFolders(tripId?: string): Promise<Folder[]> {
    if (USE_MOCK) {
      return mockApi.getFoldersByTripId(tripId || '')
    }

    const url = tripId ? `/folders?tripId=${tripId}` : '/folders'
    return realApi.get<Folder[]>(url).catch(() => [])
  },

  // Создать папку
  async createFolder(tripId: string, name: string): Promise<Folder> {
    if (USE_MOCK) {
      return mockApi.createFolder(tripId, name)
    }
    return realApi.post<Folder>('/folders', { tripId, name })
  },

  // Удалить папку
  async deleteFolder(id: string): Promise<void> {
    if (USE_MOCK) {
      return mockApi.deleteFolder(id)
    }
    return realApi.delete<void>(`/folders/${id}`)
  },

  // Обновить поездку (опционально)
  async update(id: string, data: Partial<Trip>): Promise<Trip> {
    if (USE_MOCK) {
      return mockApi.updateTrip(id, data)
    }
    return realApi.put<Trip>(`/trips/${id}`, data)
  },

  // Обновить папку (опционально)
  async updateFolder(id: string, name: string): Promise<Folder> {
    if (USE_MOCK) {
      return mockApi.updateFolder(id, name)
    }
    return realApi.put<Folder>(`/folders/${id}`, { name })
  },

  // Обновить фото (опционально)
  async updatePhoto(id: string, data: Partial<Photo>): Promise<Photo> {
    if (USE_MOCK) {
      return mockApi.updatePhoto(id, data)
    }
    return realApi.put<Photo>(`/photos/${id}`, data)
  },
}

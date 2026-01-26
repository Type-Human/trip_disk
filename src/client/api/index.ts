import type { CreateTripDto, Folder, Photo, Trip } from '../types/trip'
import { api as realApi } from './client'
import { mockApi } from './mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const tripApi = {

  async getAll(): Promise<Trip[]> {
    if (USE_MOCK) {
      return mockApi.getTrips()
    }
    return realApi.get<Trip[]>('/trips')
  },

  async getById(id: string): Promise<Trip> {
    if (USE_MOCK) {
      return mockApi.getTripById(id)
    }
    return realApi.get<Trip>(`/trips/${id}`)
  },

  async create(data: CreateTripDto): Promise<Trip> {
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
      return realApi.post<Trip>('/trips', formData)
    }

    return realApi.post<Trip>('/trips', {
      title: data.title,
      description: data.description,
      date: data.date,
      location: data.location,
    })
  },

  async getPhotosByTripId(tripId: string): Promise<Photo[]> {
    if (USE_MOCK) {
      return mockApi.getPhotosByTripId(tripId)
    }
    return realApi.get<Photo[]>(`/trips/${tripId}/photos`)
  },

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

    return realApi.post<Photo[]>('/photos/upload', formData)
  },

  async getFoldersByTripId(tripId: string): Promise<Folder[]> {
    if (USE_MOCK) {
      return mockApi.getFoldersByTripId(tripId)
    }
    return realApi.get<Folder[]>(`/trips/${tripId}/folders`).catch(() => [])
  },

  async createFolder(tripId: string, name: string): Promise<Folder> {
    if (USE_MOCK) {
      return mockApi.createFolder(tripId, name)
    }
    return realApi.post<Folder>('/folders', { tripId, name })
  },
}

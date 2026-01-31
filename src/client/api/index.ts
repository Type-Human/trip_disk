import type { CreateTripDto, Folder, Photo, Trip } from '../types/trip'
import { api as realApi } from './client'

export const tripApi = {

  async getAll(): Promise<Trip[]> {
    return realApi.get<Trip[]>('/trips')
  },

  async getById(id: string): Promise<Trip> {
    return realApi.get<Trip>(`/trips/${id}`)
  },

  async create(data: CreateTripDto & { coverImage?: File }): Promise<Trip> {
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

  async delete(id: string): Promise<void> {
    return realApi.delete<void>(`/trips/${id}`)
  },

  async getPhotosByTripId(tripId: string): Promise<Photo[]> {
    return realApi.get<Photo[]>(`/trips/${tripId}/photos`)
  },

  async uploadPhotos(
    tripId: string,
    files: File[],
    folderId?: string,
  ): Promise<Photo[]> {
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

  async deletePhoto(id: string): Promise<void> {
    return realApi.delete<void>(`/photos/${id}`)
  },

  async deletePhotos(ids: string[]): Promise<{ deleted: number }> {
    return realApi.post<{ deleted: number }>('/photos/delete-batch', { ids })
  },

  async getFoldersByTripId(tripId: string): Promise<Folder[]> {
    return realApi.get<Folder[]>(`/trips/${tripId}/folders`).catch(() => [])
  },

  async getFolders(tripId?: string): Promise<Folder[]> {
    const url = tripId ? `/folders?tripId=${tripId}` : '/folders'
    return realApi.get<Folder[]>(url).catch(() => [])
  },

  async createFolder(tripId: string, name: string): Promise<Folder> {
    return realApi.post<Folder>('/folders', { tripId, name })
  },

  async deleteFolder(id: string): Promise<void> {
    return realApi.delete<void>(`/folders/${id}`)
  },

  async update(id: string, data: Partial<Trip>): Promise<Trip> {
    return realApi.put<Trip>(`/trips/${id}`, data)
  },

  async updateFolder(id: string, name: string): Promise<Folder> {
    return realApi.put<Folder>(`/folders/${id}`, { name })
  },

  async updatePhoto(id: string, data: Partial<Photo>): Promise<Photo> {
    return realApi.put<Photo>(`/photos/${id}`, data)
  },
}

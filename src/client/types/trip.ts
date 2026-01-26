export interface Trip {
  id: string
  title: string
  description: string
  date: string
  location: string
  coverImage?: string
  image?: string // Старое поле для обратной совместимости
  createdAt: string
  updatedAt: string
  userId?: string
}

export interface Photo {
  id: string
  tripId: string
  url: string
  filename: string
  size: number
  uploadedAt: string
  folderId?: string
}

export interface Folder {
  id: string
  tripId: string
  name: string
  color?: string
  createdAt: string
}

export interface CreateTripDto {
  title: string
  description: string
  date: string
  location: string
  coverImage?: File | null
}

export interface UploadPhotoDto {
  tripId: string
  folderId?: string
}

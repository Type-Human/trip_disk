export interface Trip {
  id: string
  title: string
  description: string
  date: string
  location: string
  coverImage?: string
  createdAt: string
  updatedAt: string
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
  createdAt: string
}

export interface CreateTripDto {
  title: string
  description: string
  date: string
  location: string
}

export interface CreateFolderDto {
  tripId: string
  name: string
}

export interface UploadPhotoDto {
  tripId: string
  folderId?: string
  files: File[]
}

export interface Trip {
  id: string
  title: string
  description: string
  date: string
  location: string
  image: string
}

export interface TripMedia {
  tripId: string
  photos: string[]
  videos: Array<{
    url: string
    thumbnail: string
    duration?: number
  }>
  total: number
}

export interface Folder {
  id: string
  name: string
}

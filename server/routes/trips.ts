import type { CreateTripDto } from '../types/trip'
import type { FolderService } from '../services/folderService'
import type { PhotoService } from '../services/photoService'
import type { TripService } from '../services/tripService'
import { Hono } from 'hono'
import { fileStorage } from '../storage'

export function createTripRoutes(
  tripService: TripService,
  photoService: PhotoService,
  folderService: FolderService,
) {
  const app = new Hono()

  app.get('/', async (c) => {
    const trips = await tripService.getAll()
    return c.json(trips)
  })

  app.get('/:id', async (c) => {
    const id = c.req.param('id')
    const trip = await tripService.getById(id)
    if (!trip) {
      return c.json({ error: 'Поездка не найдена' }, 404)
    }
    return c.json(trip)
  })

  app.post('/', async (c) => {
    try {
      let tripData: CreateTripDto
      let coverImageUrl: string | undefined

      const contentType = c.req.header('content-type') || ''
      if (contentType.includes('multipart/form-data')) {
        const formData = await c.req.formData()
        const coverImage = formData.get('coverImage') as File | null

        if (coverImage) {
          const filename = await fileStorage.saveFile(coverImage)
          coverImageUrl = `/uploads/${filename}`
        }

        tripData = {
          title: formData.get('title') as string,
          description: (formData.get('description') as string) || '',
          date: formData.get('date') as string,
          location: (formData.get('location') as string) || '',
        }
      }
      else {
        tripData = await c.req.json<CreateTripDto>()
      }

      const trip = await tripService.create(tripData, coverImageUrl)
      return c.json(trip, 201)
    }
    catch (error) {
      console.error('Ошибка создания поездки:', error)
      return c.json({ error: 'Ошибка создания поездки' }, 500)
    }
  })

  app.delete('/:id', async (c) => {
    try {
      const id = c.req.param('id')

      const trip = await tripService.getById(id)
      if (!trip) {
        return c.json({ error: 'Поездка не найдена' }, 404)
      }

      await photoService.deleteByTripId(id)

      const deleted = await tripService.delete(id)

      if (deleted) {
        return c.json({ message: 'Поездка удалена' }, 200)
      }
      else {
        return c.json({ error: 'Ошибка удаления поездки' }, 500)
      }
    }
    catch (error) {
      console.error('Ошибка удаления поездки:', error)
      return c.json({ error: 'Ошибка удаления поездки' }, 500)
    }
  })

  app.get('/:id/photos', async (c) => {
    const tripId = c.req.param('id')
    const photos = await photoService.getByTripId(tripId)
    return c.json(photos)
  })

  app.get('/:id/folders', async (c) => {
    const tripId = c.req.param('id')
    const folders = await folderService.getByTripId(tripId)
    return c.json(folders)
  })

  return app
}

import type { CreateTripDto } from '../types/trip'
import type { FolderService } from '../services/folderService'
import type { PhotoService } from '../services/photoService'
import type { TripService } from '../services/tripService'
import { Hono } from 'hono'
import { fileStorage } from '../storage'
import { authMiddleware } from '../middleware/authMiddleware'

export function createTripRoutes(
  tripService: TripService,
  photoService: PhotoService,
  folderService: FolderService,
) {
  const app = new Hono()

  app.get('/', async (c) => {
    const trips = await tripService.getAllPublic()
    return c.json(trips)
  })

  app.get('/user', authMiddleware, async (c) => {
    const user = c.get('user')
    const trips = await tripService.getUserTrips(user.id)
    return c.json(trips)
  })

  app.get('/:id/photos', async (c) => {
    const id = c.req.param('id')
    const photos = await photoService.getByTripId(id)
    return c.json(photos)
  })

  app.get('/:id', async (c) => {
    const id = c.req.param('id')
    const trip = await tripService.getById(id)
    if (!trip) {
      return c.json({ error: 'Поездка не найдена' }, 404)
    }
    return c.json(trip)
  })

  app.get('/:id/folders', async (c) => {
    const id = c.req.param('id')
    const folders = await folderService.getByTripId(id)
    return c.json(folders)
  })

  app.post('/', authMiddleware, async (c) => {
    try {
      const user = c.get('user')
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

      const trip = await tripService.create(tripData, user.id, coverImageUrl)
      return c.json(trip, 201)
    }
    catch (error) {
      console.error('Ошибка создания поездки:', error)
      return c.json({ error: 'Ошибка создания поездки' }, 500)
    }
  })

  app.patch('/:id/public', authMiddleware, async (c) => {
    try {
      const user = c.get('user')
      const id = c.req.param('id')
      const { isPublic } = await c.req.json()
      
      const updated = await tripService.setPublic(id, user.id, isPublic)
      
      if (!updated) {
        return c.json({ error: 'Поездка не найдена' }, 404)
      }
      
      return c.json({ success: true, isPublic })
    } catch (error) {
      console.error('Ошибка изменения видимости:', error)
      return c.json({ error: 'Ошибка изменения видимости' }, 500)
    }
  })

  app.delete('/:id', authMiddleware, async (c) => {
    try {
      const user = c.get('user')
      const id = c.req.param('id')

      const deleted = await tripService.delete(id, user.id)

      if (deleted) {
        return c.json({ message: 'Поездка удалена' }, 200)
      }
      else {
        return c.json({ error: 'Поездка не найдена' }, 404)
      }
    }
    catch (error) {
      console.error('Ошибка удаления поездки:', error)
      return c.json({ error: 'Ошибка удаления поездки' }, 500)
    }
  })

  return app
}
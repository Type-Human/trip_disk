import type { PhotoService } from '../services/photoService'
import { Hono } from 'hono'

export function createPhotoRoutes(photoService: PhotoService) {
  const app = new Hono()

  app.post('/upload', async (c) => {
    try {
      const formData = await c.req.formData()
      const tripId = formData.get('tripId') as string
      const folderId = formData.get('folderId') as string | null

      const files: File[] = []
      for (const [key, value] of formData.entries()) {
        if (key === 'files' && value instanceof File) {
          files.push(value)
        }
      }

      if (!tripId || !files.length) {
        return c.json({ error: 'Не указан tripId или файлы' }, 400)
      }

      const uploadedPhotos = await photoService.upload(
        tripId,
        files,
        folderId || undefined,
      )

      return c.json(uploadedPhotos, 201)
    }
    catch (error) {
      console.error('Ошибка загрузки фото:', error)
      return c.json({ error: 'Ошибка загрузки фото' }, 500)
    }
  })

  app.delete('/:id', async (c) => {
    try {
      const id = c.req.param('id')
      const deleted = await photoService.delete(id)

      if (deleted) {
        return c.json({ message: 'Фото удалено' }, 200)
      }
      else {
        return c.json({ error: 'Фото не найдено' }, 404)
      }
    }
    catch (error) {
      console.error('Ошибка удаления фото:', error)
      return c.json({ error: 'Ошибка удаления фото' }, 500)
    }
  })

  return app
}

import type { CreateFolderDto } from '../types/trip'
import type { FolderService } from '../services/folderService'
import { Hono } from 'hono'

export function createFolderRoutes(folderService: FolderService) {
  const app = new Hono()

  app.post('/', async (c) => {
    try {
      const body = await c.req.json<CreateFolderDto>()
      if (!body.tripId || !body.name) {
        return c.json({ error: 'Не указаны обязательные поля' }, 400)
      }

      const folder = await folderService.create(body)
      return c.json(folder, 201)
    }
    catch (error) {
      console.error('Ошибка создания папки:', error)
      return c.json({ error: 'Ошибка создания папки' }, 500)
    }
  })

  app.get('/', async (c) => {
    const tripId = c.req.query('tripId')
    if (!tripId) {
      return c.json({ error: 'Не указан tripId' }, 400)
    }

    const folders = await folderService.getByTripId(tripId)
    return c.json(folders)
  })

  app.delete('/:id', async (c) => {
    try {
      const id = c.req.param('id')
      const deleted = await folderService.delete(id)

      if (deleted) {
        return c.json({ message: 'Папка удалена' }, 200)
      }
      else {
        return c.json({ error: 'Папка не найдена' }, 404)
      }
    }
    catch (error) {
      console.error('Ошибка удаления папки:', error)
      return c.json({ error: 'Ошибка удаления папки' }, 500)
    }
  })

  return app
}

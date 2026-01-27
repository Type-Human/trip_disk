import type { CreateFolderDto } from '../../client/types/trip'
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

  return app
}

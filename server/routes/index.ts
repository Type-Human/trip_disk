import type { FolderService } from '../services/folderService'
import type { PhotoService } from '../services/photoService'
import type { TripService } from '../services/tripService'
import { createReadStream, existsSync } from 'node:fs'
import { join } from 'node:path'
import { Hono } from 'hono'
import { fileStorage } from '../storage'
import { createFolderRoutes } from './folders'
import { createPhotoRoutes } from './photos'
import { createTripRoutes } from './trips'

export function createRoutes(
  tripService: TripService,
  photoService: PhotoService,
  folderService: FolderService,
): Hono {
  const app = new Hono()

  app.route('/trips', createTripRoutes(tripService, photoService, folderService))
  app.route('/photos', createPhotoRoutes(photoService))
  app.route('/folders', createFolderRoutes(folderService))

  app.get('/uploads/*', async (c) => {
    const path = c.req.path.replace('/uploads/', '')
    const filepath = join(fileStorage.uploadsDirectory, path)
    
    console.log('DEBUG: Request for uploads:', path)
    console.log('DEBUG: Filepath:', filepath)
    console.log('DEBUG: File exists:', existsSync(filepath))

    if (!existsSync(filepath)) {
      return c.json({ error: 'Файл не найден' }, 404)
    }
    
    try {
      const contentType = fileStorage.getMimeType(path)
      const stream = createReadStream(filepath)

      return new Response(stream as any, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      })
    } catch (error) {
      console.error('Error serving file:', error)
      return c.json({ error: 'Ошибка при чтении файла' }, 500)
    }
  })

  app.get('/health', c => c.text('OK'))

  return app
}

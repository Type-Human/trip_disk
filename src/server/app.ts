import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getDatabase } from './database'
import { createRoutes } from './routes'
import { FolderService } from './services/folderService'
import { PhotoService } from './services/photoService'
import { TripService } from './services/tripService'
import { initializeStorage } from './storage'

export async function createApp(): Promise<Hono> {
  const app = new Hono()

  app.use('/uploads/*', serveStatic({ root: './public' }))

  app.use('/*', cors({
    origin: (origin) => {
      const allowedOrigins = ['http://155.212.171.181', 'http://localhost:5174', 'http://localhost:3000']
      if (origin && allowedOrigins.includes(origin)) {
        return origin
      }
      return allowedOrigins[0]
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }))

  getDatabase()

  await initializeStorage()

  const tripService = new TripService()
  const photoService = new PhotoService()
  const folderService = new FolderService()

  folderService.setPhotoService(photoService)

  await Promise.all([
    tripService.initialize(),
    photoService.initialize(),
    folderService.initialize(),
  ])

  const apiRoutes = createRoutes(tripService, photoService, folderService)
  app.route('/api', apiRoutes)

  app.notFound((c) => {
    return c.json({ error: 'Not Found' }, 404)
  })

  app.onError((err, c) => {
    console.error('Server error:', err)
    return c.json({ error: 'Internal Server Error' }, 500)
  })

  return app
}

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createRoutes } from './routes'
import { FolderService } from './services/folderService'
import { PhotoService } from './services/photoService'
import { TripService } from './services/tripService'
import { initializeStorage } from './storage'

export async function createApp(): Promise<Hono> {
  const app = new Hono()

  app.use('/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }))

  await initializeStorage()

  const tripService = new TripService()
  const photoService = new PhotoService()
  const folderService = new FolderService()

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

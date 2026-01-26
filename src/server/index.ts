import type { CreateTripDto, Folder, Photo, Trip } from '../client/types/trip'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

const DATA_DIR = join(process.cwd(), 'public', 'data', 'trips')
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads')

async function ensureDirectories() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true })
  }
}

let trips: Trip[] = []
let photos: Photo[] = []
let folders: Folder[] = []

async function loadData() {
  try {
    const allTripsPath = join(DATA_DIR, 'all-trips.json')
    if (existsSync(allTripsPath)) {
      const data = await readFile(allTripsPath, 'utf-8')
      trips = JSON.parse(data)
    }
  }
  catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
}

async function saveTrips() {
  try {
    const allTripsPath = join(DATA_DIR, 'all-trips.json')
    await writeFile(allTripsPath, JSON.stringify(trips, null, 2), 'utf-8')
  }
  catch (error) {
    console.error('Ошибка сохранения поездок:', error)
  }
}

app.get('/api/trips', async (c) => {
  return c.json(trips)
})

app.get('/api/trips/:id', async (c) => {
  const id = c.req.param('id')
  const trip = trips.find(t => t.id === id)
  if (!trip) {
    return c.json({ error: 'Поездка не найдена' }, 404)
  }
  return c.json(trip)
})

app.post('/api/trips', async (c) => {
  try {
    let tripData: CreateTripDto
    let coverImageUrl: string | undefined

    const contentType = c.req.header('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData()
      const coverImage = formData.get('coverImage') as File | null

      if (coverImage) {
        const buffer = Buffer.from(await coverImage.arrayBuffer())
        const filename = `${Date.now()}-${coverImage.name}`
        const filepath = join(UPLOADS_DIR, filename)
        await writeFile(filepath, buffer)
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
      tripData = await c.req.json() as CreateTripDto
    }

    const trip: Trip = {
      id: Date.now().toString(),
      title: tripData.title,
      description: tripData.description || '',
      date: tripData.date,
      location: tripData.location || '',
      coverImage: coverImageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    trips.push(trip)
    await saveTrips()
    return c.json(trip, 201)
  }
  catch (error) {
    console.error('Ошибка создания поездки:', error)
    return c.json({ error: 'Ошибка создания поездки' }, 500)
  }
})

app.get('/api/trips/:id/photos', async (c) => {
  const tripId = c.req.param('id')
  const tripPhotos = photos.filter(p => p.tripId === tripId)
  return c.json(tripPhotos)
})

app.post('/api/photos/upload', async (c) => {
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

    const uploadedPhotos: Photo[] = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 9)
      const filename = `${timestamp}-${random}-${file.name.replace(/[^a-z0-9.-]/gi, '_')}`
      const filepath = join(UPLOADS_DIR, filename)

      await writeFile(filepath, buffer)

      const photo: Photo = {
        id: `${timestamp}-${random}`,
        tripId,
        url: `/uploads/${filename}`,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        folderId: folderId || undefined,
      }

      photos.push(photo)
      uploadedPhotos.push(photo)
    }

    return c.json(uploadedPhotos, 201)
  }
  catch (error) {
    console.error('Ошибка загрузки фото:', error)
    return c.json({ error: 'Ошибка загрузки фото' }, 500)
  }
})

app.get('/api/trips/:id/folders', async (c) => {
  const tripId = c.req.param('id')
  const tripFolders = folders.filter(f => f.tripId === tripId)
  return c.json(tripFolders)
})

app.post('/api/folders', async (c) => {
  try {
    const body = await c.req.json() as { tripId: string, name: string }
    const folder: Folder = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tripId: body.tripId,
      name: body.name,
      createdAt: new Date().toISOString(),
    }
    folders.push(folder)
    return c.json(folder, 201)
  }
  catch (error) {
    return c.json({ error: 'Ошибка создания папки' }, 500)
  }
})

app.get('/uploads/*', async (c) => {
  const path = c.req.path.replace('/uploads/', '')
  const filepath = join(UPLOADS_DIR, path)
  if (!existsSync(filepath)) {
    return c.json({ error: 'Файл не найден' }, 404)
  }
  const file = await readFile(filepath)
  const ext = path.split('.').pop()?.toLowerCase()
  const contentType = ext === 'jpg' || ext === 'jpeg'
    ? 'image/jpeg'
    : ext === 'png'
      ? 'image/png'
      : ext === 'gif'
        ? 'image/gif'
        : 'application/octet-stream'
  return c.body(file, 200, { 'Content-Type': contentType })
})

const port = 3000

async function start() {
  await ensureDirectories()
  await loadData()
  serve({
    fetch: app.fetch,
    port,
  })
}

start().catch(console.error)

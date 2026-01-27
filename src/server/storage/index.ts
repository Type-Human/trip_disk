import type { Folder, Photo, Trip } from '../../client/types/trip'
import { join } from 'node:path'
import { FileStorage } from './fileStorage'
import { JsonStorage } from './jsonStorage'

const DATA_DIR = join(process.cwd(), 'public', 'data', 'trips')
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads')

export const tripsStorage = new JsonStorage<Trip>(join(DATA_DIR, 'all-trips.json'))
export const photosStorage = new JsonStorage<Photo>(join(DATA_DIR, 'photos.json'))
export const foldersStorage = new JsonStorage<Folder>(join(DATA_DIR, 'folders.json'))
export const fileStorage = new FileStorage(UPLOADS_DIR, DATA_DIR)

export async function initializeStorage() {
  await fileStorage.ensureDirectories()
}

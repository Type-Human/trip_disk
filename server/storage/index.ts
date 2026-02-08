import { join } from 'node:path'
import { FileStorage } from './fileStorage'

// Абсолютные пути ВНУТРИ контейнера
const UPLOADS_DIR = join('/app', 'uploads')
const DATA_DIR = join('/app', 'data')

export const fileStorage = new FileStorage(UPLOADS_DIR, DATA_DIR)

export async function initializeStorage() {
  await fileStorage.ensureDirectories()
}

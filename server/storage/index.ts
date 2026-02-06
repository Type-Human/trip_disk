import { join } from 'node:path'
import { FileStorage } from './fileStorage'

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads')

export const fileStorage = new FileStorage(UPLOADS_DIR, join(process.cwd(), 'data'))

export async function initializeStorage() {
  await fileStorage.ensureDirectories()
}

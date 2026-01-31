import { DatabaseService } from './database'

let dbService: DatabaseService | null = null

export function getDatabase(): DatabaseService {
  if (!dbService) {
    const dbPath = process.env.DB_PATH
    dbService = new DatabaseService(dbPath)
  }
  return dbService
}

export function closeDatabase(): void {
  if (dbService) {
    dbService.close()
    dbService = null
  }
}

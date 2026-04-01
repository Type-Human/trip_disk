import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const { Database } = require('bun:sqlite')

export class DatabaseService {
  private db: any

  constructor(dbPath?: string) {
    const defaultPath = join(process.cwd(), 'data', 'trip_disk.db')
    const path = dbPath || defaultPath

    const dir = dirname(path)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    this.db = new Database(path)

    this.db.run('PRAGMA journal_mode = WAL')
    this.db.run('PRAGMA synchronous = NORMAL')
    this.db.run('PRAGMA foreign_keys = ON')

    this.initializeTables()
  }

  private initializeTables(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        location TEXT,
        coverImage TEXT,x
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        tripId TEXT NOT NULL,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        tripId TEXT NOT NULL,
        folderId TEXT,
        url TEXT NOT NULL,
        filename TEXT NOT NULL,
        size INTEGER NOT NULL,
        uploadedAt TEXT NOT NULL,
        FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (folderId) REFERENCES folders(id) ON DELETE CASCADE
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)


    this.db.run(`CREATE INDEX IF NOT EXISTS idx_photos_tripId ON photos(tripId)`)
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_photos_folderId ON photos(folderId)`)
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_folders_tripId ON folders(tripId)`)
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`)
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`)
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`)
  }

  getDatabase(): any {
    return this.db
  }

  close(): void {
    this.db.close()
  }
}

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
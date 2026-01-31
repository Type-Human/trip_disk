import { join } from 'node:path'
import { Database } from 'bun:sqlite'

export class DatabaseService {
  private db: Database

  constructor(dbPath?: string) {
    const path = dbPath || join(process.cwd(), 'data', 'trip_disk.db')
    this.db = new Database(path)
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
        coverImage TEXT,
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
      CREATE INDEX IF NOT EXISTS idx_photos_tripId ON photos(tripId);
    `)
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_photos_folderId ON photos(folderId);
    `)
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_folders_tripId ON folders(tripId);
    `)
  }

  getDatabase(): Database {
    return this.db
  }

  close(): void {
    this.db.close()
  }
}

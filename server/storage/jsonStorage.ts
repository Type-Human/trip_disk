import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export class JsonStorage<T> {
  constructor(private filePath: string) {}

  async ensureDirectory(): Promise<void> {
    const dir = dirname(this.filePath)
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
  }

  async load(): Promise<T[]> {
    try {
      if (!existsSync(this.filePath)) {
        await this.ensureDirectory()
        return []
      }
      const data = await readFile(this.filePath, 'utf-8')
      return JSON.parse(data) as T[]
    }
    catch (error) {
      console.error(`Error loading from ${this.filePath}:`, error)
      return []
    }
  }

  async save(data: T[]): Promise<void> {
    try {
      await this.ensureDirectory()
      await writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8')
    }
    catch (error) {
      console.error(`Error saving to ${this.filePath}:`, error)
      throw error
    }
  }
}

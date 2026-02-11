import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

export class FileStorage {
  constructor(
    private uploadsDir: string,
    private dataDir: string,
  ) {}

  get uploadsDirectory(): string {
    return this.uploadsDir;
  }

  async ensureDirectories(): Promise<void> {
    if (!existsSync(this.uploadsDir)) {
      await mkdir(this.uploadsDir, { recursive: true })
    }
    if (!existsSync(this.dataDir)) {
      await mkdir(this.dataDir, { recursive: true })
    }
  }

  async saveFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer())
    const timestamp = Date.now()
    const random = randomBytes(4).toString('hex')
    const safeName = file.name.replace(/[^a-z0-9.-]/gi, '_')
    const filename = `${timestamp}-${random}-${safeName}`
    const filepath = join(this.uploadsDir, filename)

    await writeFile(filepath, buffer)
    return filename
  }

  async saveThumbnail(buffer: Buffer): Promise<string> {
    const timestamp = Date.now()
    const random = randomBytes(4).toString('hex')
    const filename = `thumb-${timestamp}-${random}.webp`
    const filepath = join(this.uploadsDir, filename)

    await writeFile(filepath, buffer)
    return filename
  }

  async saveBuffer(buffer: Buffer, filename: string): Promise<string> {
    const filepath = join(this.uploadsDir, filename)
    await writeFile(filepath, buffer)
    return filename
  }

  async readFile(filename: string): Promise<Buffer> {
    const filepath = join(this.uploadsDir, filename)
    if (!existsSync(filepath)) {
      throw new Error('File not found')
    }
    return readFile(filepath)
  }

  getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg'
      case 'png':
        return 'image/png'
      case 'gif':
        return 'image/gif'
      case 'webp':
        return 'image/webp'
      default:
        return 'application/octet-stream'
    }
  }
}
import { serve } from '@hono/node-server'
import { createApp } from './app'

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000

async function main() {
  try {
    const app = await createApp()

    app.get('/health', async (c) => {
      const { getDatabase } = await import('./database')
      const db = getDatabase().getDatabase()
      const tables = db.prepare('SELECT name FROM sqlite_master WHERE type=\'table\'').all()
      return c.json({
        status: 'ok',
        tables: tables.map((t: any) => t.name),
        timestamp: new Date().toISOString(),
      })
    })

    serve({
      fetch: app.fetch,
      port: PORT,
    })
  }
  catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

main()

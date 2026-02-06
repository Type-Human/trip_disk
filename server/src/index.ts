import { serve } from '@hono/node-server'
import { createApp } from './app'

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3001

async function main() {
  try {
    const app = await createApp()

    app.get('/api/health', async (c) => {
      const { getDatabase } = await import('../database')
      const db = getDatabase().getDatabase()
      const tables = db.prepare('SELECT name FROM sqlite_master WHERE type=\'table\'').all()
      return c.json({
        status: 'ok',
        tables: tables.map((t: any) => t.name),
        timestamp: new Date().toISOString(),
      })
    })

    const server = serve({
      fetch: app.fetch,
      port: PORT,
      ...(process.env.NODE_ENV === 'development' && {
      }),
    })

    if (server && (server as any).server) {
      const httpServer = (server as any).server
      httpServer.setTimeout(30000)
      httpServer.keepAliveTimeout = 30000

      httpServer.maxHeadersCount = 2000
      ;(httpServer as any)._maxHeaderSize = 16384 * 10
    }
  }
  catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

main()
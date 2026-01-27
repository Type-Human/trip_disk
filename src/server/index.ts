import { serve } from '@hono/node-server'
import { createApp } from './app'

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000

async function main() {
  try {
    const app = await createApp()

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

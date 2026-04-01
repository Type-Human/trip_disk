import { createMiddleware } from 'hono/factory'
import { AuthService, User } from 'services/authService'

const authService = new AuthService()

declare module 'hono' {
  interface ContextVariableMap {
    user: User
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) {
    return c.json({ error: 'Не авторизован' }, 401)
  }
  const user = await authService.verifySession(token)
  if (!user) {
    return c.json({ error: 'Недействительная сессия' }, 401)
  }
  c.set('user', user)
  await next()
})
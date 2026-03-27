import { Hono } from 'hono'
import { AuthService } from '../services/authService'

const auth = new Hono()
const authService = new AuthService()

auth.post('/register', async (c) => {
  try {
    const { username, email, password } = await c.req.json()
    const user = await authService.register(username, email, password)
    return c.json({ success: true, user })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400)
  }
})

auth.post('/login', async (c) => {
  try {
    const { login, password } = await c.req.json()
    const result = await authService.login(login, password)
    return c.json({ success: true, ...result })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 401)
  }
})

auth.post('/logout', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (token) {
      await authService.logout(token)
    }
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

auth.get('/me', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ success: false, error: 'Не авторизован' }, 401)
    }
    const user = await authService.verifySession(token)
    if (!user) {
      return c.json({ success: false, error: 'Недействительная сессия' }, 401)
    }
    return c.json({ success: true, user })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default auth
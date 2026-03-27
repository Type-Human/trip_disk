import { randomBytes, pbkdf2Sync } from 'node:crypto'
import { getDatabase } from '../database'

export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

export interface Session {
  id: number
  user_id: number
  token: string
  expires_at: string
  created_at: string
}

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
}

function generateSalt(): string {
  return randomBytes(32).toString('hex')
}

function generateSessionToken(): string {
  return randomBytes(48).toString('hex')
}

export class AuthService {
  private db = getDatabase()
  
  async register(username: string, email: string, password: string): Promise<{ id: number; username: string; email: string }> {
    if (!username || !email || !password) {
      throw new Error('Все поля обязательны')
    }
    if (username.length < 3) {
      throw new Error('Имя пользователя должно быть не менее 3 символов')
    }
    if (password.length < 6) {
      throw new Error('Пароль должен быть не менее 6 символов')
    }
    if (!email.includes('@') || !email.includes('.')) {
      throw new Error('Некорректный email')
    }
    
    const existing = this.db.getDatabase().query(
      'SELECT id FROM users WHERE username = ? OR email = ?'
    ).get(username, email)
    
    if (existing) {
      throw new Error('Пользователь с таким именем или email уже существует')
    }
    
    const salt = generateSalt()
    const passwordHash = hashPassword(password, salt)
    
    const result = this.db.getDatabase().query(`
      INSERT INTO users (username, email, password_hash, salt)
      VALUES (?, ?, ?, ?)
    `).run(username, email, passwordHash, salt)
    
    return {
      id: Number(result.lastInsertRowid),
      username,
      email
    }
  }
  
  async login(login: string, password: string): Promise<{ token: string; user: User }> {
    if (!login || !password) {
      throw new Error('Введите логин и пароль')
    }
    
    const user = this.db.getDatabase().query(`
      SELECT id, username, email, password_hash, salt, created_at
      FROM users
      WHERE email = ? OR username = ?
    `).get(login, login) as any
    
    if (!user) {
      throw new Error('Неверные учетные данные')
    }
    
    const hash = hashPassword(password, user.salt)
    if (hash !== user.password_hash) {
      throw new Error('Неверные учетные данные')
    }
    
    const token = generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    this.db.getDatabase().query(`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, token, expiresAt.toISOString())
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    }
  }
  
  async verifySession(token: string): Promise<User | null> {
    if (!token) return null
    
    const session = this.db.getDatabase().query(`
      SELECT user_id, expires_at
      FROM sessions
      WHERE token = ? AND expires_at > ?
    `).get(token, new Date().toISOString()) as any
    
    if (!session) return null
    
    const user = this.db.getDatabase().query(`
      SELECT id, username, email, created_at
      FROM users
      WHERE id = ?
    `).get(session.user_id) as any
    
    if (!user) return null
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    }
  }
  
  async logout(token: string): Promise<void> {
    if (!token) return
    this.db.getDatabase().query(`
      DELETE FROM sessions WHERE token = ?
    `).run(token)
  }
  
  async getUserById(id: number): Promise<User | null> {
    const user = this.db.getDatabase().query(`
      SELECT id, username, email, created_at
      FROM users
      WHERE id = ?
    `).get(id) as any
    
    if (!user) return null
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    }
  }
}
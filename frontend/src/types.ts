export type UserRole = 'STUDENT' | 'TEACHER'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  token: string
  id: number
  name: string
  email: string
  role: UserRole
  error?: string
}

export interface GeneratedQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type AppView = 'home' | 'login' | 'register' | 'generator'

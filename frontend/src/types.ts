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

export type QuestionType = 'SINGLE' | 'MULTIPLE'

export interface QuestionOptionDTO {
  id?: number
  optionText: string
  correct: boolean
  orderIndex?: number
}

export interface ExamQuestionDTO {
  id?: number
  question: string
  questionType: QuestionType
  explanation?: string
  options: QuestionOptionDTO[]
}

export interface ExamDTO {
  id?: number
  title: string
  description?: string
  teacherId?: number
  teacherName?: string
  createdAt?: string
  questions: ExamQuestionDTO[]
}

export type AppView = 'home' | 'login' | 'register' | 'generator' | 'teacher_dashboard'

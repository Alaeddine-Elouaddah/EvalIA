export type UserRole = 'STUDENT' | 'TEACHER'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  profilePhoto?: string | null
  programId?: string
}

export interface AuthResponse {
  token: string
  id: number
  name: string
  email: string
  role: UserRole
  profilePhoto?: string | null
  error?: string
}

export interface UserProfile {
  name: string
  email: string
  profilePhoto: string | null
}

export interface UpdateUserProfile {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  profilePhoto: string | null
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

export interface ExamSummary {
  id: number
  title: string
  description?: string
  teacherName?: string
  createdAt?: string
  questionCount: number
}

export interface ExamAttemptDTO {
  id: number
  examId: number
  examTitle: string
  studentName: string
  studentEmail: string
  correctCount: number
  totalQuestions: number
  score: number
  submittedAt: string
}

export interface TeacherStudentDTO {
  id: number
  name: string
  email: string
  attemptCount: number
  examsTaken: number
  averageScore: number
}

export type AppView =
  | 'home'
  | 'login'
  | 'register'
  | 'generator'
  | 'student_exams'
  | 'teacher_dashboard'
  | 'teacher_students'
  | 'teacher_grades'
  | 'profile'
  | 'student_join_exam'

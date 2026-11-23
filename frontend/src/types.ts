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
  points?: number
  options: QuestionOptionDTO[]
}

export interface ExamDTO {
  id?: number
  title: string
  description?: string
  teacherId?: number
  teacherName?: string
  createdAt?: string
  // Métadonnées produit (Lot 1 backend). Toutes optionnelles et nullables :
  // le backend renvoie null pour un champ non renseigné.
  subject?: string | null
  status?: 'draft' | 'published' | 'finished' | null
  accessCode?: string | null
  accessEnabled?: boolean | null
  durationMinutes?: number | null
  opensAt?: string | null
  language?: 'fr' | 'en' | null
  mode?: 'manual' | 'ai' | null
  targets?: string[] | null
  revealResults?: boolean | null
  randomizeQuestions?: boolean | null
  accessMode?: 'code' | 'direct' | null
  participants?: number
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
  startedAt?: string
  integrityScore?: number
  violationCount?: number
  violationLog?: string
}

export interface ExamAttemptPayload {
  answers: number[][]
  startedAtTimestamp?: number
  violationCount?: number
  violations?: string[]
}

export interface TeacherStudentDTO {
  id: number
  name: string
  email: string
  attemptCount: number
  examsTaken: number
  averageScore: number
}

export interface TeacherViolationDTO {
  id: number
  examId: number
  examTitle: string
  studentId: number
  studentName: string
  studentEmail: string
  reason: string
  detectedAt: string
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

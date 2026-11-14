export type ExamStatus = 'draft' | 'published' | 'finished'
export type ExamMode = 'manual' | 'ai'
export type TeacherQuestionType = 'single' | 'multiple'

export interface TeacherOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface TeacherQuestion {
  id: string
  text: string
  type: TeacherQuestionType
  options: TeacherOption[]
  explanation?: string
  points?: number
}

export type ExamLanguage = 'fr' | 'en'

export interface TeacherExam {
  id: string
  title: string
  subject: string
  durationMinutes: number
  date: string
  openTime?: string
  status: ExamStatus
  participants: number
  mode: ExamMode
  targets?: string[]
  language?: ExamLanguage
  accessCode?: string
  accessEnabled?: boolean
  questions: TeacherQuestion[]
  revealResults?: boolean
  randomizeQuestions?: boolean
}

export interface MockStudent {
  id: string
  name: string
  email: string
  group: string
  programId?: string
}

export type ResultStatus = 'graded' | 'in-progress' | 'missing'

export interface MockResult {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  examId: string
  examTitle: string
  score: number | null
  status: ResultStatus
  submittedAt: string | null
}

export interface BankQuestion extends TeacherQuestion {
  subject: string
  level: string
  updatedAt: string
}

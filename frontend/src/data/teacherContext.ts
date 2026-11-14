import { createContext } from 'react'
import type { BankQuestion, MockResult, MockStudent, TeacherExam, TeacherQuestion } from '../types/teacher'

export interface TeacherDataContextValue {
  exams: TeacherExam[]
  students: MockStudent[]
  results: MockResult[]
  questionBank: BankQuestion[]
  pendingQuestions: TeacherQuestion[]
  saveExam: (exam: Omit<TeacherExam, 'id' | 'participants'> & { id?: string; participants?: number }) => TeacherExam
  publishExam: (exam: Omit<TeacherExam, 'id' | 'participants' | 'status' | 'accessCode' | 'accessEnabled'> & { id?: string; participants?: number }) => Promise<TeacherExam>
  deleteExam: (id: string) => void
  duplicateExam: (id: string) => void
  regenerateExamCode: (id: string) => Promise<string>
  setAccessEnabled: (id: string, enabled: boolean) => void
  addResults: (results: MockResult[]) => void
  setPendingQuestions: (questions: TeacherQuestion[]) => void
}

export const TeacherDataContext = createContext<TeacherDataContextValue | null>(null)

import { createContext } from 'react'
import type { BankQuestion, MockResult, MockStudent, TeacherExam, TeacherQuestion } from '../types/teacher'
import type { TeacherExamDraft, TeacherExamInput } from './examAdapter'

export interface TeacherDataContextValue {
  exams: TeacherExam[]
  students: MockStudent[]
  results: MockResult[]
  questionBank: BankQuestion[]
  pendingQuestions: TeacherQuestion[]
  saveExam: (exam: TeacherExamInput) => Promise<TeacherExam>
  publishExam: (exam: TeacherExamDraft) => Promise<TeacherExam>
  deleteExam: (id: string) => Promise<void>
  duplicateExam: (id: string) => Promise<void>
  regenerateExamCode: (id: string) => Promise<string>
  setAccessEnabled: (id: string, enabled: boolean) => Promise<void>
  addResults: (results: MockResult[]) => void
  setPendingQuestions: (questions: TeacherQuestion[]) => void
}

export const TeacherDataContext = createContext<TeacherDataContextValue | null>(null)

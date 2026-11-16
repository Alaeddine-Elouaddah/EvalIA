import React, { useMemo, useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { clearAuthSession } from '../api/auth'
import { Button } from '../components/ui/Button'
import type { UserRole } from '../types'
import type { BankQuestion, MockResult, MockStudent, TeacherExam, TeacherQuestion } from '../types/teacher'
import { TeacherDataContext } from './teacherContext'
import type { TeacherDataContextValue } from './teacherContext'
import { mockExams, mockQuestionBank, mockResults, mockStudents } from './mock.js'
import { useTeacherExamStore } from './useTeacherExamStore'

/**
 * Clé historique du mode démonstration.
 *
 * Elle n'est plus écrite par l'espace enseignant (les examens sont désormais
 * persistés en PostgreSQL). Elle reste lue uniquement pour que `JoinExam`,
 * encore branché sur les données de démonstration jusqu'au Lot 7, conserve
 * exactement les examens qu'il affichait auparavant.
 */
const EXAMS_STORAGE_KEY = 'evalia_demo_teacher_exams'

function getInitialMockExams(): TeacherExam[] {
  const saved = localStorage.getItem(EXAMS_STORAGE_KEY)
  if (!saved) return structuredClone(mockExams)
  try {
    const parsed: unknown = JSON.parse(saved)
    if (Array.isArray(parsed)) return parsed as TeacherExam[]
    console.error('Les examens de démonstration enregistrés sont invalides.')
  } catch (error) {
    console.error('Impossible de lire les examens de démonstration enregistrés.', error)
  }
  return structuredClone(mockExams)
}

function teacherOnly(): never {
  throw new Error('Cette action est réservée aux enseignants connectés.')
}

interface TeacherDataProviderProps {
  role?: UserRole | null
  children: React.ReactNode
}

export function TeacherDataProvider({ role = null, children }: TeacherDataProviderProps) {
  const isTeacher = role === 'TEACHER'
  const examStore = useTeacherExamStore(isTeacher)
  const [mockTeacherExams] = useState<TeacherExam[]>(() => getInitialMockExams())
  const [students] = useState<MockStudent[]>(() => structuredClone(mockStudents))
  const [results, setResults] = useState<MockResult[]>(() => structuredClone(mockResults))
  const [questionBank] = useState<BankQuestion[]>(() => structuredClone(mockQuestionBank))
  const [pendingQuestions, setPendingQuestions] = useState<TeacherQuestion[]>([])

  const {
    exams: teacherExams,
    loading,
    error,
    reload,
    saveExam,
    publishExam,
    deleteExam,
    duplicateExam,
    regenerateExamCode,
    setAccessEnabled,
  } = examStore

  const value = useMemo<TeacherDataContextValue>(() => ({
    exams: isTeacher ? teacherExams : mockTeacherExams,
    students,
    results,
    questionBank,
    pendingQuestions,
    saveExam: isTeacher ? saveExam : teacherOnly,
    publishExam: isTeacher ? publishExam : teacherOnly,
    deleteExam: isTeacher ? deleteExam : teacherOnly,
    duplicateExam: isTeacher ? duplicateExam : teacherOnly,
    regenerateExamCode: isTeacher ? regenerateExamCode : teacherOnly,
    setAccessEnabled: isTeacher ? setAccessEnabled : teacherOnly,
    addResults(newResults) {
      setResults((current) => [...newResults, ...current])
    },
    setPendingQuestions,
  }), [
    isTeacher,
    teacherExams,
    mockTeacherExams,
    students,
    results,
    questionBank,
    pendingQuestions,
    saveExam,
    publishExam,
    deleteExam,
    duplicateExam,
    regenerateExamCode,
    setAccessEnabled,
  ])

  if (isTeacher && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4">
        <div className="flex flex-col items-center gap-3 text-center" role="status" aria-live="polite">
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm font-medium text-muted">Chargement de vos examens…</p>
        </div>
      </div>
    )
  }

  if (isTeacher && error && teacherExams.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 text-center shadow-panel">
          <ShieldAlert className="mx-auto h-8 w-8 text-danger" aria-hidden="true" />
          <h1 className="mt-3 text-base font-bold text-ink">Impossible de charger vos examens</h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={reload}>Réessayer</Button>
            <Button
              variant="secondary"
              onClick={() => {
                clearAuthSession()
                window.location.assign('/')
              }}
            >
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <TeacherDataContext.Provider value={value}>{children}</TeacherDataContext.Provider>
}

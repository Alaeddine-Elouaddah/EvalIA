import React, { useEffect, useMemo, useState } from 'react'
import { mockExams, mockQuestionBank, mockResults, mockStudents } from './mock.js'
import type { BankQuestion, MockResult, MockStudent, TeacherExam, TeacherQuestion } from '../types/teacher'
import { TeacherDataContext } from './teacherContext'
import type { TeacherDataContextValue } from './teacherContext'
import { publishExamMock, regenerateExamCodeMock } from './mockApi'

const EXAMS_STORAGE_KEY = 'evalia_demo_teacher_exams'

function getInitialExams() {
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

export function TeacherDataProvider({ children }: { children: React.ReactNode }) {
  const [exams, setExams] = useState<TeacherExam[]>(getInitialExams)
  const [students] = useState<MockStudent[]>(() => structuredClone(mockStudents))
  const [results, setResults] = useState<MockResult[]>(() => structuredClone(mockResults))
  const [questionBank] = useState<BankQuestion[]>(() => structuredClone(mockQuestionBank))
  const [pendingQuestions, setPendingQuestions] = useState<TeacherQuestion[]>([])

  useEffect(() => {
    localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams))
  }, [exams])

  const value = useMemo<TeacherDataContextValue>(() => ({
    exams,
    students,
    results,
    questionBank,
    pendingQuestions,
    saveExam(exam) {
      const saved: TeacherExam = {
        ...exam,
        id: exam.id ?? `EX-${Date.now()}`,
        participants: exam.participants ?? 0,
      }
      setExams((current) => exam.id
        ? current.map((item) => item.id === exam.id ? saved : item)
        : [saved, ...current])
      return saved
    },
    async publishExam(exam) {
      const published = await publishExamMock(exam, exams.flatMap((item) => item.accessCode ? [item.accessCode] : []))
      setExams((current) => exam.id
        ? current.map((item) => item.id === exam.id ? published : item)
        : [published, ...current])
      return published
    },
    deleteExam(id) {
      setExams((current) => current.filter((exam) => exam.id !== id))
    },
    duplicateExam(id) {
      setExams((current) => {
        const source = current.find((exam) => exam.id === id)
        if (!source) return current
        return [{
          ...structuredClone(source),
          id: `EX-${Date.now()}`,
          title: `${source.title} — copie`,
          status: 'draft',
          accessCode: undefined,
          accessEnabled: false,
          participants: 0,
        }, ...current]
      })
    },
    async regenerateExamCode(id) {
      const usedCodes = exams.flatMap((exam) => exam.accessCode ? [exam.accessCode] : [])
      const code = await regenerateExamCodeMock(usedCodes)
      setExams((current) => current.map((exam) => exam.id === id
        ? { ...exam, accessCode: code, accessEnabled: true }
        : exam))
      return code
    },
    setAccessEnabled(id, enabled) {
      setExams((current) => current.map((exam) => exam.id === id ? { ...exam, accessEnabled: enabled } : exam))
    },
    addResults(newResults) {
      setResults((current) => [...newResults, ...current])
    },
    setPendingQuestions,
  }), [exams, students, results, questionBank, pendingQuestions])

  return <TeacherDataContext.Provider value={value}>{children}</TeacherDataContext.Provider>
}

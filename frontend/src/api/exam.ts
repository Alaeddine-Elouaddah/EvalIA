import type { ExamDTO } from '../types'
import { getStoredToken } from './auth'

export async function fetchMyExams(): Promise<ExamDTO[]> {
  const token = getStoredToken()
  const res = await fetch('/evalia/api/exams/my', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Erreur lors du chargement des examens')
  }
  return res.json()
}

export async function createExam(exam: ExamDTO): Promise<ExamDTO> {
  const token = getStoredToken()
  const res = await fetch('/evalia/api/exams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(exam),
  })
  const text = await res.text()
  let data: any = null
  try {
    data = JSON.parse(text)
  } catch {}

  if (!res.ok) {
    throw new Error(data?.error || text || "Erreur lors de la création de l'examen")
  }
  return data
}

export async function deleteExam(examId: number): Promise<void> {
  const token = getStoredToken()
  const res = await fetch(`/evalia/api/exams/${examId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Erreur lors de la suppression de l'examen")
  }
}

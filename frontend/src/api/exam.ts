import type { ExamAttemptDTO, ExamDTO, ExamSummary, TeacherStudentDTO } from '../types'
import { getStoredToken } from './auth'

async function requestJson<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getStoredToken()}`,
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    // Keep the server response text for the error message below.
  }
  if (!res.ok) {
    throw new Error(data?.error || text || 'Erreur de communication avec le serveur')
  }
  if (!data) throw new Error('Réponse vide du serveur')
  return data as T
}

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

export function fetchAvailableExams(): Promise<ExamSummary[]> {
  return requestJson('/evalia/api/exams/available')
}

export function fetchStudentExam(examId: number): Promise<ExamDTO> {
  return requestJson(`/evalia/api/exams/${examId}/student`)
}

export function submitExamAttempt(examId: number, answers: number[][]): Promise<ExamAttemptDTO> {
  return requestJson(`/evalia/api/exams/${examId}/attempts`, 'POST', { answers })
}

export function fetchMyAttempts(): Promise<ExamAttemptDTO[]> {
  return requestJson('/evalia/api/exams/attempts/my')
}

export function fetchTeacherStudents(): Promise<TeacherStudentDTO[]> {
  return requestJson('/evalia/api/exams/students')
}

export function fetchTeacherGrades(): Promise<ExamAttemptDTO[]> {
  return requestJson('/evalia/api/exams/grades')
}

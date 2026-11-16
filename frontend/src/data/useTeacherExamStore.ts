import { useCallback, useEffect, useRef, useState } from 'react'
import type { TeacherExamDraft, TeacherExamInput, TeacherExamWithDescription } from './examAdapter'
import {
  duplicateTeacherExam,
  listTeacherExams,
  loadTeacherExam,
  persistTeacherExam,
  publishTeacherExam,
  regenerateTeacherExamCode,
  removeTeacherExam,
  updateTeacherExamAccess,
} from './examApiStore'

export interface TeacherExamStore {
  exams: TeacherExamWithDescription[]
  loading: boolean
  error: string | null
  reload: () => void
  saveExam: (exam: TeacherExamInput) => Promise<TeacherExamWithDescription>
  publishExam: (exam: TeacherExamDraft) => Promise<TeacherExamWithDescription>
  deleteExam: (id: string) => Promise<void>
  duplicateExam: (id: string) => Promise<void>
  regenerateExamCode: (id: string) => Promise<string>
  setAccessEnabled: (id: string, enabled: boolean) => Promise<void>
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

/**
 * État des examens de l'enseignant, alimenté exclusivement par le backend.
 *
 * - chargement initial bloquant pour l'espace enseignant (`loading` / `error`) ;
 * - une seule requête par action grâce à `runOnce` (protection double-clic) ;
 * - relecture canonique après chaque écriture ;
 * - aucune persistance locale : `evalia_demo_teacher_exams` n'est plus utilisé ici.
 */
export function useTeacherExamStore(enabled: boolean): TeacherExamStore {
  const [exams, setExams] = useState<TeacherExamWithDescription[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const inFlight = useRef(new Map<string, Promise<unknown>>())

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    listTeacherExams()
      .then((list) => {
        if (!cancelled) setExams(list)
      })
      .catch((loadError) => {
        if (!cancelled) setError(messageOf(loadError, 'Impossible de charger vos examens.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [enabled, reloadToken])

  const reload = useCallback(() => {
    setError(null)
    setLoading(true)
    setReloadToken((current) => current + 1)
  }, [])

  /** Réutilise la promesse en cours pour une même clé, puis la libère. */
  const runOnce = useCallback(<T,>(key: string, operation: () => Promise<T>): Promise<T> => {
    const existing = inFlight.current.get(key)
    if (existing) return existing as Promise<T>
    const promise = operation().finally(() => {
      inFlight.current.delete(key)
    })
    inFlight.current.set(key, promise)
    return promise
  }, [])

  const upsert = useCallback((exam: TeacherExamWithDescription) => {
    setExams((current) => {
      const index = current.findIndex((item) => item.id === exam.id)
      if (index === -1) return [exam, ...current]
      const next = [...current]
      next[index] = exam
      return next
    })
  }, [])

  const saveExam = useCallback((exam: TeacherExamInput) => {
    return runOnce(`save:${exam.id ?? 'new'}`, async () => {
      const saved = await persistTeacherExam(exam)
      upsert(saved)
      return saved
    })
  }, [runOnce, upsert])

  const publishExam = useCallback((exam: TeacherExamDraft) => {
    return runOnce(`publish:${exam.id ?? 'new'}`, async () => {
      const published = await publishTeacherExam(exam)
      upsert(published)
      return published
    })
  }, [runOnce, upsert])

  const deleteExam = useCallback((id: string) => {
    return runOnce(`delete:${id}`, async () => {
      await removeTeacherExam(id)
      setExams((current) => current.filter((exam) => exam.id !== id))
    })
  }, [runOnce])

  const duplicateExam = useCallback((id: string) => {
    return runOnce(`duplicate:${id}`, async () => {
      const source = exams.find((exam) => exam.id === id)
      if (!source) throw new Error('Examen introuvable.')
      const copy = await duplicateTeacherExam(source)
      upsert(copy)
    })
  }, [exams, runOnce, upsert])

  const regenerateExamCode = useCallback((id: string) => {
    return runOnce(`code:${id}`, async () => {
      const code = await regenerateTeacherExamCode(id)
      try {
        const canonical = await loadTeacherExam(id)
        upsert(canonical)
      } catch {
        setExams((current) => current.map((exam) => (
          exam.id === id ? { ...exam, accessCode: code, accessEnabled: true } : exam
        )))
      }
      return code
    })
  }, [runOnce, upsert])

  const setAccessEnabled = useCallback((id: string, accessEnabled: boolean) => {
    return runOnce(`access:${id}`, async () => {
      await updateTeacherExamAccess(id, accessEnabled)
      try {
        const canonical = await loadTeacherExam(id)
        upsert(canonical)
      } catch {
        setExams((current) => current.map((exam) => (
          exam.id === id ? { ...exam, accessEnabled } : exam
        )))
      }
    })
  }, [runOnce, upsert])

  return {
    exams,
    loading,
    error,
    reload,
    saveExam,
    publishExam,
    deleteExam,
    duplicateExam,
    regenerateExamCode,
    setAccessEnabled,
  }
}

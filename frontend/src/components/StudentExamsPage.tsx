import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  Loader2,
  Send,
  Trophy,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import {
  fetchAvailableExams,
  fetchMyAttempts,
  fetchStudentExam,
  reportExamViolation,
  submitExamAttempt,
} from '../api/exam'
import type { ExamAttemptDTO, ExamDTO, ExamQuestionDTO, ExamSummary, QuestionOptionDTO } from '../types'
import { useAntiCheat } from '../hooks/useAntiCheat'
import { AntiCheatBanner, AntiCheatModal } from './AntiCheatBanner'

function formatDate(value: string) {
  const date = new Date(value.replace(' ', 'T').replace(/(\.\d{3})\d+$/, '$1'))
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// Mélange déterministe ou pseudo-aléatoire
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface ShuffledQuestion {
  originalIndex: number
  question: ExamQuestionDTO
  shuffledOptions: { originalIndex: number; option: QuestionOptionDTO }[]
}

export const StudentExamsPage: React.FC = () => {
  const [exams, setExams] = useState<ExamSummary[]>([])
  const [attempts, setAttempts] = useState<ExamAttemptDTO[]>([])
  const [activeExam, setActiveExam] = useState<ExamDTO | null>(null)
  const [result, setResult] = useState<ExamAttemptDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingExam, setLoadingExam] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Anti-Triche et déroulement Question par Question
  const [startedAtTimestamp, setStartedAtTimestamp] = useState<number | null>(null)
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [studentAnswers, setStudentAnswers] = useState<Record<number, number[]>>({}) // key: originalQuestionIndex -> array of originalOptionIndex
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null)

  // Réf pour accès dans le callback de fin automatique
  const finishExamRef = useRef<() => void>(() => {})

  const antiCheat = useAntiCheat({
    enabled: Boolean(activeExam && !result),
    maxViolations: 3,
    onAutoSubmit: () => {
      if (finishExamRef.current) finishExamRef.current()
    },
    onViolation: (reason) => {
      if (activeExam?.id) {
        void reportExamViolation(activeExam.id, reason).catch(() => {})
      }
    },
  })

  useEffect(() => {
    let active = true
    Promise.all([fetchAvailableExams(), fetchMyAttempts()])
      .then(([availableExams, previousAttempts]) => {
        if (!active) return
        setExams(availableExams)
        setAttempts(previousAttempts)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Erreur lors du chargement des examens')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Timer global d'examen (décompte)
  useEffect(() => {
    if (!activeExam || timeLeftSeconds === null || timeLeftSeconds <= 0 || result) return

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          // Temps écoulé -> soumission automatique
          if (finishExamRef.current) finishExamRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [activeExam, timeLeftSeconds, result])

  async function startExam(examId: number) {
    setError(null)
    setLoadingExam(true)
    try {
      const exam = await fetchStudentExam(examId)
      const now = Date.now()
      setStartedAtTimestamp(now)

      // Algorithme anti-triche : Mélange aléatoire (questions et options)
      const shouldRandomize = exam.randomizeQuestions ?? true
      let questionsWithOriginalIndices = exam.questions.map((q, idx) => ({
        originalIndex: idx,
        question: q,
        shuffledOptions: q.options.map((opt, optIdx) => ({
          originalIndex: optIdx,
          option: opt,
        })),
      }))

      if (shouldRandomize) {
        questionsWithOriginalIndices = shuffleArray(questionsWithOriginalIndices).map((item) => ({
          ...item,
          shuffledOptions: shuffleArray(item.shuffledOptions),
        }))
      }

      setShuffledQuestions(questionsWithOriginalIndices)
      setCurrentQuestionIndex(0)
      setStudentAnswers({})

      if (exam.durationMinutes && exam.durationMinutes > 0) {
        setTimeLeftSeconds(exam.durationMinutes * 60)
      } else {
        setTimeLeftSeconds(null)
      }

      setActiveExam(exam)
      setResult(null)

      // Demander le mode plein écran à l'ouverture
      void antiCheat.requestFullscreen()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'ouvrir l'examen")
    } finally {
      setLoadingExam(false)
    }
  }

  function handleSelectOption(originalQIdx: number, originalOptIdx: number, isMultiple: boolean) {
    setStudentAnswers((prev) => {
      const currentSelected = prev[originalQIdx] || []
      let updated: number[]
      if (isMultiple) {
        updated = currentSelected.includes(originalOptIdx)
          ? currentSelected.filter((idx) => idx !== originalOptIdx)
          : [...currentSelected, originalOptIdx]
      } else {
        updated = [originalOptIdx]
      }
      return { ...prev, [originalQIdx]: updated }
    })
  }

  const finishExam = useCallback(async () => {
    if (!activeExam?.id || submitting) return
    setError(null)
    setSubmitting(true)

    // Reconstituer le tableau ordonné par l'index originel du backend
    const answersArray: number[][] = []
    for (let i = 0; i < activeExam.questions.length; i++) {
      answersArray.push(studentAnswers[i] || [])
    }

    const latest = antiCheat.getLatestViolations()

    try {
      const attempt = await submitExamAttempt(activeExam.id, answersArray, {
        startedAtTimestamp: startedAtTimestamp ?? Date.now(),
        violationCount: latest.count,
        violations: latest.violations,
      })
      setResult(attempt)
      setAttempts((current) => [attempt, ...current])
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer votre résultat")
    } finally {
      setSubmitting(false)
    }
  }, [activeExam, studentAnswers, submitting, startedAtTimestamp, antiCheat])

  useEffect(() => {
    finishExamRef.current = finishExam
  }, [finishExam])

  function backToExams() {
    setActiveExam(null)
    setResult(null)
    setShuffledQuestions([])
    setStudentAnswers({})
    setCurrentQuestionIndex(0)
    setError(null)
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // --- ECRAN RESULTATS ---
  if (activeExam && result) {
    return (
      <section className="mx-auto max-w-3xl py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Trophy className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Résultat enregistré</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{activeExam.title}</h1>
          <p className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900">
            {result.score.toLocaleString('fr-FR')}%
          </p>
          <p className="mt-2 text-slate-600">
            {result.correctCount} bonne(s) réponse(s) sur {result.totalQuestions}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Score d'intégrité anti-triche : {result.integrityScore ?? 100}%
            ({result.violationCount ?? 0} infraction(s))
          </div>

          {(result.violationCount ?? 0) > 0 && (
            <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Infractions enregistrées</p>
              <div className="mt-2 space-y-2">
                {(result.violationLog?.split(' | ').filter(Boolean) ?? []).map((entry, index) => (
                  <p key={index} className="rounded-lg bg-white px-3 py-2 text-xs text-slate-700">
                    {entry}
                  </p>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-sm text-slate-500">Votre note et cette tentative sont conservées avec le rapport de surveillance.</p>
          <button
            type="button"
            onClick={backToExams}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Revenir aux examens
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    )
  }

  // --- ECRAN PASSAGE EXAMEN (QUESTION PAR QUESTION & ANTI-TRICHE) ---
  if (activeExam && shuffledQuestions.length > 0) {
    const currentQData = shuffledQuestions[currentQuestionIndex]
    const isMultiple = currentQData.question.questionType === 'MULTIPLE'
    const selectedForCurrent = studentAnswers[currentQData.originalIndex] || []
    const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1

    return (
      <section className="mx-auto max-w-3xl space-y-5 py-6 select-none">
        {/* Bannière de surveillance active */}
        <AntiCheatBanner
          violationCount={antiCheat.violationCount}
          maxViolations={3}
          isFullscreen={antiCheat.isFullscreen}
          onRequestFullscreen={antiCheat.requestFullscreen}
        />

        {/* Modal d'infraction */}
        <AntiCheatModal
          isOpen={antiCheat.warningModalOpen}
          message={antiCheat.lastWarningMessage}
          violationCount={antiCheat.violationCount}
          maxViolations={3}
          onClose={antiCheat.dismissWarning}
          onRequestFullscreen={antiCheat.requestFullscreen}
        />

        {/* En-tête de l'examen */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Examen Sécurisé</p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">{activeExam.title}</h1>
            </div>

            {timeLeftSeconds !== null && (
              <div className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-bold ${
                timeLeftSeconds < 120 ? 'border-rose-300 bg-rose-50 text-rose-700 animate-pulse' : 'border-slate-200 bg-slate-50 text-slate-800'
              }`}>
                <Clock className="h-4 w-4" />
                <span>Temps restant : {formatTime(timeLeftSeconds)}</span>
              </div>
            )}
          </div>

          {/* Barre de progression */}
          <div className="mt-4">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
              <span>Question {currentQuestionIndex + 1} sur {shuffledQuestions.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / shuffledQuestions.length) * 100)}% complété</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Question actuelle (Question par Question) */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Question {currentQuestionIndex + 1}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {isMultiple ? 'Plusieurs réponses possibles' : 'Réponse unique'}
            </span>
          </div>

          <h2 className="text-lg font-semibold leading-7 text-slate-900">
            {currentQData.question.question}
          </h2>

          <div className="mt-6 space-y-3">
            {currentQData.shuffledOptions.map((optItem, optVisualIndex) => {
              const selected = selectedForCurrent.includes(optItem.originalIndex)
              return (
                <button
                  type="button"
                  key={optItem.option.id ?? optVisualIndex}
                  aria-pressed={selected}
                  onClick={() => handleSelectOption(currentQData.originalIndex, optItem.originalIndex, isMultiple)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left text-sm font-medium transition ${
                    selected
                      ? 'border-indigo-500 bg-indigo-50/80 text-indigo-950 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-300 text-xs font-bold text-slate-500 bg-slate-50">
                      {String.fromCharCode(65 + optVisualIndex)}
                    </span>
                    <span>{optItem.option.optionText}</span>
                  </div>
                  {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600" />}
                </button>
              )
            })}
          </div>
        </article>

        {/* Navigation : Suivant ou Terminer */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Mode séquentiel : répondez à chaque question avant de poursuivre.
          </p>

          {!isLastQuestion ? (
            <button
              type="button"
              disabled={selectedForCurrent.length === 0}
              onClick={() => setCurrentQuestionIndex((idx) => idx + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Question suivante
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={finishExam}
              disabled={submitting || selectedForCurrent.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? 'Validation...' : 'Valider et terminer'}
            </button>
          )}
        </div>
      </section>
    )
  }

  // --- ECRAN D'ACCUEIL DES EXAMENS ---
  return (
    <section className="space-y-8 py-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Espace étudiant</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Examens disponibles</h1>
        <p className="mt-2 text-sm text-slate-600">Passez vos examens sous environnement sécurisé anti-triche.</p>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Chargement des examens…
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-3 font-semibold text-slate-900">Aucun examen pour le moment</h2>
          <p className="mt-1 text-sm text-slate-500">Les examens créés par les enseignants apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => {
            const examAttempts = attempts.filter((attempt) => attempt.examId === exam.id)
            const latestAttempt = examAttempts[0]
            return (
              <article key={exam.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BookOpenCheck className="h-5 w-5" />
                  </div>
                  {latestAttempt && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Dernière note : {latestAttempt.score.toLocaleString('fr-FR')}%
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900">{exam.title}</h2>
                {exam.description && <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{exam.description}</p>}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{exam.questionCount} question(s)</span>
                  <span>Enseignant : {exam.teacherName || 'Non précisé'}</span>
                </div>
                {examAttempts.length > 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    {examAttempts.length} tentative(s) enregistrée(s)
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => startExam(exam.id)}
                  disabled={loadingExam}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loadingExam ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {examAttempts.length ? 'Recommencer' : 'Commencer'}
                  {!loadingExam && <ArrowRight className="h-4 w-4" />}
                </button>
              </article>
            )
          })}
        </div>
      )}

      {/* Historique des tentatives et intégrité */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900">Mes notes & intégrité</h2>
        </div>
        {attempts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Vos résultats apparaîtront après votre premier examen.</p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{attempt.examTitle}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {attempt.correctCount}/{attempt.totalQuestions} réponses correctes · {formatDate(attempt.submittedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    (attempt.integrityScore ?? 100) >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Intégrité : {attempt.integrityScore ?? 100}%
                  </span>
                  <span className="text-lg font-bold text-indigo-700">{attempt.score.toLocaleString('fr-FR')}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

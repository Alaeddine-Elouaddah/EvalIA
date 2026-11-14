import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  Loader2,
  Send,
  Trophy,
} from 'lucide-react'
import {
  fetchAvailableExams,
  fetchMyAttempts,
  fetchStudentExam,
  submitExamAttempt,
} from '../api/exam'
import type { ExamAttemptDTO, ExamDTO, ExamSummary } from '../types'

function formatDate(value: string) {
  const date = new Date(value.replace(' ', 'T').replace(/(\.\d{3})\d+$/, '$1'))
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export const StudentExamsPage: React.FC = () => {
  const [exams, setExams] = useState<ExamSummary[]>([])
  const [attempts, setAttempts] = useState<ExamAttemptDTO[]>([])
  const [activeExam, setActiveExam] = useState<ExamDTO | null>(null)
  const [answers, setAnswers] = useState<number[][]>([])
  const [result, setResult] = useState<ExamAttemptDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingExam, setLoadingExam] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function startExam(examId: number) {
    setError(null)
    setLoadingExam(true)
    try {
      const exam = await fetchStudentExam(examId)
      setActiveExam(exam)
      setAnswers(exam.questions.map(() => []))
      setResult(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'ouvrir l'examen")
    } finally {
      setLoadingExam(false)
    }
  }

  function chooseAnswer(questionIndex: number, optionIndex: number, multiple: boolean) {
    setAnswers((current) => current.map((selected, index) => {
      if (index !== questionIndex) return selected
      if (!multiple) return [optionIndex]
      return selected.includes(optionIndex)
        ? selected.filter((item) => item !== optionIndex)
        : [...selected, optionIndex]
    }))
  }

  async function finishExam() {
    if (!activeExam?.id) return
    if (answers.some((selected) => selected.length === 0)) {
      setError('Répondez à toutes les questions avant de terminer.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const attempt = await submitExamAttempt(activeExam.id, answers)
      setResult(attempt)
      setAttempts((current) => [attempt, ...current])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer votre résultat")
    } finally {
      setSubmitting(false)
    }
  }

  function backToExams() {
    setActiveExam(null)
    setResult(null)
    setAnswers([])
    setError(null)
  }

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
          <p className="mt-2 text-sm text-slate-500">Votre note et cette tentative sont conservées.</p>
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

  if (activeExam) {
    return (
      <section className="mx-auto max-w-4xl space-y-5 py-8">
        <button
          type="button"
          onClick={backToExams}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quitter l’examen
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Examen</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{activeExam.title}</h1>
          {activeExam.description && <p className="mt-2 text-sm leading-6 text-slate-600">{activeExam.description}</p>}
          <p className="mt-3 text-xs text-slate-500">
            {activeExam.questions.length} question(s) · Toutes les questions sont obligatoires.
          </p>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {activeExam.questions.map((question, questionIndex) => {
          const isMultiple = question.questionType === 'MULTIPLE'
          return (
            <article key={question.id ?? questionIndex} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Question {questionIndex + 1} sur {activeExam.questions.length}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {isMultiple ? 'Plusieurs réponses' : 'Une réponse'}
                </span>
              </div>
              <h2 className="font-semibold leading-7 text-slate-900">{question.question}</h2>
              <div className="mt-4 space-y-2.5">
                {question.options.map((option, optionIndex) => {
                  const selected = answers[questionIndex]?.includes(optionIndex) ?? false
                  return (
                    <button
                      type="button"
                      key={option.id ?? optionIndex}
                      aria-pressed={selected}
                      onClick={() => chooseAnswer(questionIndex, optionIndex, isMultiple)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left text-sm transition ${
                        selected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{option.optionText}</span>
                      {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600" />}
                    </button>
                  )
                })}
              </div>
            </article>
          )
        })}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={finishExam}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? 'Envoi des réponses…' : 'Terminer et voir ma note'}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-8 py-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Espace étudiant</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Examens disponibles</h1>
        <p className="mt-2 text-sm text-slate-600">Passez un examen et retrouvez toutes vos tentatives et notes ici.</p>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900">Mes notes et tentatives</h2>
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
                <span className="text-lg font-bold text-indigo-700">{attempt.score.toLocaleString('fr-FR')}%</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

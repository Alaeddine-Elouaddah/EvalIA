import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  KeyRound,
  Loader2,
  RotateCcw,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import type { User, ExamDTO, ExamQuestionDTO, QuestionOptionDTO } from '../../types'
import { fetchExamByCode, reportExamViolation, submitExamAttempt } from '../../api/exam'
import { getProgram } from '../../data/programs.js'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { CodeInput } from '../../components/ui/CodeInput'
import { useAntiCheat } from '../../hooks/useAntiCheat'
import { AntiCheatBanner, AntiCheatModal } from '../../components/AntiCheatBanner'

interface JoinExamProps {
  user: User
}

function formatOpeningTime(opensAt?: string | null) {
  if (!opensAt) return 'Date non renseignée'
  const date = new Date(opensAt)
  if (Number.isNaN(date.getTime())) return 'Date non renseignée'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

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

export function JoinExam({ user: _user }: JoinExamProps) {
  const initialCode = new URLSearchParams(window.location.search).get('code')?.toUpperCase().slice(0, 6) ?? ''
  const [code, setCode] = useState(initialCode)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)
  const [exam, setExam] = useState<ExamDTO | null>(null)
  const [started, setStarted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [score, setScore] = useState<{
    correct: number
    total: number
    scoreValue: number
    integrityScore?: number
    violationCount?: number
    violationLog?: string
  } | null>(null)

  // Anti-Triche & Question par Question
  const [startedAtTimestamp, setStartedAtTimestamp] = useState<number | null>(null)
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number[]>>({}) // originalIndex -> array of originalOptionIndex
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null)

  const submitExamRef = useRef<() => void>(() => {})

  const antiCheat = useAntiCheat({
    enabled: started && !submitted,
    maxViolations: 3,
    onAutoSubmit: () => {
      if (submitExamRef.current) submitExamRef.current()
    },
    onViolation: (reason) => {
      if (exam?.id) {
        void reportExamViolation(exam.id, reason).catch(() => {})
      }
    },
  })

  // Timer décompte
  useEffect(() => {
    if (!started || !exam || timeLeftSeconds === null || timeLeftSeconds <= 0 || submitted) return

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          if (submitExamRef.current) submitExamRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [started, exam, timeLeftSeconds, submitted])

  async function joinExam() {
    setError('')
    setExam(null)
    if (code.length !== 6) {
      setError('Saisis les 6 caractères du code pour continuer.')
      return
    }
    setJoining(true)
    try {
      const found = await fetchExamByCode(code)
      if (found.status === 'finished') {
        setError("Cet examen est terminé et n'accepte plus de participants.")
        return
      }
      if (found.opensAt) {
        const opensAt = new Date(found.opensAt)
        if (!Number.isNaN(opensAt.getTime()) && Date.now() < opensAt.getTime()) {
          setError(`Cet examen n'est pas encore ouvert. Ouverture : ${formatOpeningTime(found.opensAt)}.`)
          return
        }
      }
      setExam(found)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (
        msg.toLowerCase().includes('desactive') ||
        msg.toLowerCase().includes('forbidden') ||
        msg.toLowerCase().includes('desactivé')
      ) {
        setError("L'accès à cet examen a été désactivé par le professeur.")
      } else {
        setError('Ce code est invalide. Vérifie les caractères et réessaie.')
      }
    } finally {
      setJoining(false)
    }
  }

  function handleStartExam() {
    if (!exam) return
    const now = Date.now()
    setStartedAtTimestamp(now)

    // Shuffling des questions et options
    const shouldRandomize = exam.randomizeQuestions ?? true
    let qList = exam.questions.map((q, idx) => ({
      originalIndex: idx,
      question: q,
      shuffledOptions: q.options.map((opt, optIdx) => ({
        originalIndex: optIdx,
        option: opt,
      })),
    }))

    if (shouldRandomize) {
      qList = shuffleArray(qList).map((item) => ({
        ...item,
        shuffledOptions: shuffleArray(item.shuffledOptions),
      }))
    }

    setShuffledQuestions(qList)
    setCurrentQuestionIndex(0)
    setAnswers({})

    if (exam.durationMinutes && exam.durationMinutes > 0) {
      setTimeLeftSeconds(exam.durationMinutes * 60)
    } else {
      setTimeLeftSeconds(null)
    }

    setStarted(true)
    void antiCheat.requestFullscreen()
  }

  function setAnswer(originalQuestionIndex: number, originalOptionIndex: number, multiple: boolean) {
    setAnswers((current) => {
      const current_ = current[originalQuestionIndex] ?? []
      const next = multiple
        ? current_.includes(originalOptionIndex)
          ? current_.filter((id) => id !== originalOptionIndex)
          : [...current_, originalOptionIndex]
        : [originalOptionIndex]
      return { ...current, [originalQuestionIndex]: next }
    })
  }

  const submitExam = useCallback(async () => {
    if (!exam?.id || submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      // Reconstitution ordonnée des réponses
      const answersArray: number[][] = []
      for (let i = 0; i < exam.questions.length; i++) {
        answersArray.push(answers[i] ?? [])
      }

      const latest = antiCheat.getLatestViolations()

      const result = await submitExamAttempt(exam.id, answersArray, {
        startedAtTimestamp: startedAtTimestamp ?? Date.now(),
        violationCount: latest.count,
        violations: latest.violations,
      })

      setScore({
        correct: result.correctCount,
        total: result.totalQuestions,
        scoreValue: result.score,
        integrityScore: result.integrityScore,
        violationCount: result.violationCount,
        violationLog: result.violationLog,
      })
      setSubmitted(true)
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {})
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la soumission.')
    } finally {
      setSubmitting(false)
    }
  }, [exam, submitting, answers, startedAtTimestamp, antiCheat])

  useEffect(() => {
    submitExamRef.current = submitExam
  }, [submitExam])

  function reset() {
    setExam(null)
    setStarted(false)
    setSubmitted(false)
    setAnswers({})
    setShuffledQuestions([])
    setCurrentQuestionIndex(0)
    setError('')
    setSubmitError('')
    setScore(null)
    setCode('')
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // --- RESULTAT ---
  if (submitted && exam && score) {
    return (
      <section className="mx-auto max-w-2xl py-10">
        <Card className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 text-2xl font-bold text-ink">Examen terminé</h1>
          <p className="mt-2 text-sm text-muted">{exam.title}</p>
          <p className="mt-6 text-4xl font-extrabold text-primary">{score.scoreValue.toFixed(1)} %</p>
          <p className="mt-1 text-sm text-muted">
            {score.correct} / {score.total} bonnes réponses
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Score d'intégrité : {score.integrityScore ?? 100}% ({score.violationCount ?? 0} infraction(s))
          </div>

          {(score.violationCount ?? 0) > 0 && (
            <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Infractions enregistrées</p>
              <div className="mt-2 space-y-2">
                {(score.violationLog?.split(' | ').filter(Boolean) ?? []).map((entry, index) => (
                  <p key={index} className="rounded-lg bg-white px-3 py-2 text-xs text-slate-700">
                    {entry}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={reset}>
              Revenir à l'accueil
            </Button>
          </div>
        </Card>
      </section>
    )
  }

  // --- EXAMEN EN COURS (QUESTION PAR QUESTION & ANTI-TRICHE) ---
  if (started && exam && shuffledQuestions.length > 0) {
    const currentQData = shuffledQuestions[currentQuestionIndex]
    const isMultiple = currentQData.question.questionType === 'MULTIPLE'
    const selectedForCurrent = answers[currentQData.originalIndex] ?? []
    const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1

    return (
      <section className="mx-auto max-w-3xl space-y-4 py-6 select-none">
        {/* Anti-Triche Banner & Modal */}
        <AntiCheatBanner
          violationCount={antiCheat.violationCount}
          maxViolations={3}
          isFullscreen={antiCheat.isFullscreen}
          onRequestFullscreen={antiCheat.requestFullscreen}
        />

        <AntiCheatModal
          isOpen={antiCheat.warningModalOpen}
          message={antiCheat.lastWarningMessage}
          violationCount={antiCheat.violationCount}
          maxViolations={3}
          onClose={antiCheat.dismissWarning}
          onRequestFullscreen={antiCheat.requestFullscreen}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Examen Sécurisé</p>
            <h1 className="mt-1 text-xl font-bold text-ink">{exam.title}</h1>
          </div>
          {timeLeftSeconds !== null && (
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-bold ${
                timeLeftSeconds < 120
                  ? 'border-rose-300 bg-rose-50 text-rose-700 animate-pulse'
                  : 'border-line bg-surface text-ink'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          )}
        </div>

        {/* Barre de progression */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted">
              Question {currentQuestionIndex + 1} sur {shuffledQuestions.length}
            </p>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {isMultiple ? 'Plusieurs choix' : 'Choix unique'}
            </span>
          </div>

          <h2 className="mt-3 text-base font-semibold leading-6 text-ink">{currentQData.question.question}</h2>

          <div className="mt-5 space-y-2.5">
            {currentQData.shuffledOptions.map((optItem, optIdx) => {
              const isChecked = selectedForCurrent.includes(optItem.originalIndex)
              return (
                <label
                  key={optItem.option.id ?? optIdx}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                    isChecked
                      ? 'border-primary bg-primary-50/40 text-primary-950 ring-1 ring-primary'
                      : 'border-line hover:border-primary-300 hover:bg-primary-50/20'
                  }`}
                >
                  <input
                    type={isMultiple ? 'checkbox' : 'radio'}
                    name={`q_${currentQData.originalIndex}`}
                    checked={isChecked}
                    onChange={() =>
                      setAnswer(currentQData.originalIndex, optItem.originalIndex, isMultiple)
                    }
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span className="text-sm font-medium text-ink">{optItem.option.optionText}</span>
                </label>
              )
            })}
          </div>
        </Card>

        {submitError && (
          <p role="alert" className="rounded-lg border border-danger-line bg-danger-soft p-3 text-sm text-danger">
            {submitError}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted">Répondez à la question pour débloquer l'étape suivante.</p>

          {!isLastQuestion ? (
            <Button
              disabled={selectedForCurrent.length === 0}
              onClick={() => setCurrentQuestionIndex((idx) => idx + 1)}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Suivante
            </Button>
          ) : (
            <Button
              loading={submitting}
              disabled={submitting || selectedForCurrent.length === 0}
              onClick={() => void submitExam()}
            >
              Terminer l'examen
            </Button>
          )}
        </div>
      </section>
    )
  }

  // --- APERÇU AVANT DE DÉMARRER ---
  if (exam) {
    const programLabel = exam.targets?.length === 1 ? getProgram(exam.targets[0])?.label : undefined
    return (
      <section className="mx-auto max-w-xl py-10">
        <Card className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success-soft text-success">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-success">Code vérifié</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">{exam.title}</h1>
          <p className="mt-1 text-sm text-muted">{exam.subject}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-canvas p-4 text-left">
            <div>
              <dt className="text-xs text-muted">Durée</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{exam.durationMinutes} min</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Questions</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{exam.questions.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Langue</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{exam.language === 'en' ? 'English' : 'Français'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Public</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{programLabel ?? 'Toutes filières'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Sécurité</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">Anti-triche actif</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-900">
            <strong>Consignes de sécurité :</strong>
            <ul className="mt-1.5 list-disc pl-4 space-y-1">
              <li>L'examen doit être passé en <strong>Plein Écran</strong>.</li>
              <li>Changer d'onglet ou minimiser la fenêtre est <strong>strictement interdit</strong>.</li>
              <li>3 avertissements entraîneront la <strong>soumission automatique immédiate</strong>.</li>
            </ul>
          </div>

          <Button className="mt-6 w-full" icon={<ArrowRight className="h-4 w-4" />} onClick={handleStartExam}>
            Commencer l'examen sécurisé
          </Button>
          <button type="button" onClick={reset} className="mt-3 text-xs font-medium text-muted hover:text-primary">
            Utiliser un autre code
          </button>
        </Card>
      </section>
    )
  }

  // --- SAISIE DU CODE ---
  return (
    <section className="mx-auto max-w-lg py-10 sm:py-16">
      <Card className="p-6 sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary">
          <KeyRound className="h-6 w-6" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">Espace étudiant</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Rejoindre un examen</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Saisis le code à 6 caractères communiqué par ton professeur.</p>
        <div className="mt-6">
          <CodeInput
            value={code}
            onChange={(value) => {
              setCode(value)
              setError('')
            }}
            error={error}
          />
        </div>
        <Button
          className="mt-6 w-full"
          loading={joining}
          disabled={code.length !== 6 || joining}
          icon={joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpenCheck className="h-4 w-4" />}
          onClick={() => void joinExam()}
        >
          Rejoindre
        </Button>
        <p className="mt-4 text-center text-xs text-muted">Le code ne contient pas les caractères 0, O, 1, I ou L.</p>
      </Card>
    </section>
  )
}

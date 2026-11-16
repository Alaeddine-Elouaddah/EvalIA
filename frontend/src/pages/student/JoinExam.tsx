import { useState } from 'react'
import { ArrowRight, BookOpenCheck, CheckCircle2, KeyRound, Loader2, RotateCcw } from 'lucide-react'
import type { User } from '../../types'
import { fetchExamByCode, submitExamAttempt } from '../../api/exam'
import type { ExamDTO } from '../../types'
import { getProgram } from '../../data/programs.js'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { CodeInput } from '../../components/ui/CodeInput'

interface JoinExamProps {
  user: User
}

function formatOpeningTime(opensAt?: string | null) {
  if (!opensAt) return 'Date non renseignee'
  const date = new Date(opensAt)
  if (Number.isNaN(date.getTime())) return 'Date non renseignee'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function JoinExam({ user: _user }: JoinExamProps) {
  const initialCode = new URLSearchParams(window.location.search).get('code')?.toUpperCase().slice(0, 6) ?? ''
  const [code, setCode] = useState(initialCode)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)
  const [exam, setExam] = useState<ExamDTO | null>(null)
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [score, setScore] = useState<{ correct: number; total: number; scoreValue: number } | null>(null)

  async function joinExam() {
    setError('')
    setExam(null)
    if (code.length !== 6) {
      setError('Saisis les 6 caracteres du code pour continuer.')
      return
    }
    setJoining(true)
    try {
      const found = await fetchExamByCode(code)
      if (found.status === 'finished') {
        setError('Cet examen est termine et n\'accepte plus de participants.')
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
      if (msg.toLowerCase().includes('desactive') || msg.toLowerCase().includes('forbidden') || msg.toLowerCase().includes('desactivé')) {
        setError("L'acces a cet examen a ete desactive par le professeur.")
      } else {
        setError('Ce code est invalide. Verifie les caracteres et reessaie.')
      }
    } finally {
      setJoining(false)
    }
  }

  function setAnswer(questionId: number, optionId: number, multiple: boolean) {
    setAnswers((current) => {
      const current_ = current[questionId] ?? []
      const next = multiple
        ? current_.includes(optionId) ? current_.filter((id) => id !== optionId) : [...current_, optionId]
        : [optionId]
      return { ...current, [questionId]: next }
    })
  }

  async function submitExam() {
    if (!exam?.id) return
    setSubmitting(true)
    setSubmitError('')
    try {
      // Le backend attend des index de position (0, 1, 2…) par question,
      // pas des IDs d'options. On reconstitue les index à partir de la position
      // dans le tableau options de chaque question.
      const answersArray = exam.questions.map((q) => {
        if (q.id === undefined) return []
        const selectedIds = answers[q.id] ?? []
        return q.options
          .map((opt, idx) => (opt.id !== undefined && selectedIds.includes(opt.id) ? idx : -1))
          .filter((idx) => idx >= 0)
      })
      const result = await submitExamAttempt(exam.id, answersArray)
      setScore({ correct: result.correctCount, total: result.totalQuestions, scoreValue: result.score })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la soumission.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setExam(null)
    setStarted(false)
    setSubmitted(false)
    setAnswers({})
    setError('')
    setSubmitError('')
    setScore(null)
    setCode('')
  }

  if (submitted && exam && score) {
    return (
      <section className="mx-auto max-w-2xl py-10">
        <Card className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 text-2xl font-bold text-ink">Examen termine</h1>
          <p className="mt-2 text-sm text-muted">{exam.title}</p>
          <p className="mt-6 text-4xl font-extrabold text-primary">{score.scoreValue.toFixed(1)} %</p>
          <p className="mt-1 text-sm text-muted">{score.correct} / {score.total} bonnes reponses</p>
          <Button className="mt-6" variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={reset}>Revenir a l'accueil</Button>
        </Card>
      </section>
    )
  }

  if (started && exam) {
    const allAnswered = exam.questions.every((q) => q.id !== undefined && (answers[q.id] ?? []).length > 0)
    return (
      <section className="mx-auto max-w-3xl space-y-4 py-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Examen en cours</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{exam.title}</h1>
          <p className="mt-1 text-sm text-muted">{exam.durationMinutes} min · {exam.questions.length} questions</p>
        </div>
        {exam.questions.map((question, index) => (
          <Card key={question.id ?? index}>
            <p className="text-xs font-semibold text-muted">Question {index + 1} sur {exam.questions.length}</p>
            <h2 className="mt-2 text-base font-semibold leading-6 text-ink">{question.question}</h2>
            <div className="mt-4 space-y-2">
              {question.options.map((option) => (
                <label key={option.id ?? option.optionText} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 transition hover:border-primary-300 hover:bg-primary-50/40">
                  <input
                    type={question.questionType === 'MULTIPLE' ? 'checkbox' : 'radio'}
                    name={String(question.id ?? index)}
                    checked={question.id !== undefined && option.id !== undefined ? (answers[question.id] ?? []).includes(option.id) : false}
                    onChange={() => {
                      if (question.id !== undefined && option.id !== undefined) {
                        setAnswer(question.id, option.id, question.questionType === 'MULTIPLE')
                      }
                    }}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-ink">{option.optionText}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}
        {submitError && <p role="alert" className="rounded-lg border border-danger-line bg-danger-soft p-3 text-sm text-danger">{submitError}</p>}
        <div className="sticky bottom-3 flex justify-end rounded-xl border border-line bg-surface/95 p-3 shadow-panel">
          <Button loading={submitting} disabled={!allAnswered || submitting} onClick={() => void submitExam()}>Terminer l'examen</Button>
        </div>
      </section>
    )
  }

  if (exam) {
    const programLabel = exam.targets?.length === 1 ? getProgram(exam.targets[0])?.label : undefined
    return (
      <section className="mx-auto max-w-xl py-10">
        <Card className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success-soft text-success"><CheckCircle2 className="h-6 w-6" /></span>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-success">Code verifie</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">{exam.title}</h1>
          <p className="mt-1 text-sm text-muted">{exam.subject}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-canvas p-4 text-left">
            <div><dt className="text-xs text-muted">Duree</dt><dd className="mt-1 text-sm font-semibold text-ink">{exam.durationMinutes} min</dd></div>
            <div><dt className="text-xs text-muted">Questions</dt><dd className="mt-1 text-sm font-semibold text-ink">{exam.questions.length}</dd></div>
            <div><dt className="text-xs text-muted">Langue</dt><dd className="mt-1 text-sm font-semibold text-ink">{exam.language === 'en' ? 'English' : 'Francais'}</dd></div>
            <div><dt className="text-xs text-muted">Public</dt><dd className="mt-1 text-sm font-semibold text-ink">{programLabel ?? 'Toutes filieres'}</dd></div>
          </dl>
          <Button className="mt-6 w-full" icon={<ArrowRight className="h-4 w-4" />} onClick={() => setStarted(true)}>Commencer l'examen</Button>
          <button type="button" onClick={reset} className="mt-3 text-xs font-medium text-muted hover:text-primary">Utiliser un autre code</button>
        </Card>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-lg py-10 sm:py-16">
      <Card className="p-6 sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary"><KeyRound className="h-6 w-6" /></span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">Espace etudiant</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Rejoindre un examen</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Saisis le code a 6 caracteres communique par ton professeur.</p>
        <div className="mt-6">
          <CodeInput value={code} onChange={(value) => { setCode(value); setError('') }} error={error} />
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
        <p className="mt-4 text-center text-xs text-muted">Le code ne contient pas les caracteres 0, O, 1, I ou L.</p>
      </Card>
    </section>
  )
}

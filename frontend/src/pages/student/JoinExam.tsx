import { useState } from 'react'
import { ArrowRight, BookOpenCheck, CheckCircle2, KeyRound, RotateCcw } from 'lucide-react'
import type { User } from '../../types'
import { useTeacherData } from '../../data/useTeacherData'
import { getProgram } from '../../data/programs.js'
import type { TeacherExam } from '../../types/teacher'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { CodeInput } from '../../components/ui/CodeInput'

interface JoinExamProps {
  user: User
}

function formatOpeningTime(exam: TeacherExam) {
  if (!exam.date) return 'Date non renseignée'
  const date = new Date(`${exam.date}T${exam.openTime || '00:00'}`)
  if (Number.isNaN(date.getTime())) return 'Date non renseignée'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function JoinExam({ user }: JoinExamProps) {
  const { exams, students } = useTeacherData()
  const initialCode = new URLSearchParams(window.location.search).get('code')?.toUpperCase().slice(0, 6) ?? ''
  const [code, setCode] = useState(initialCode)
  const [error, setError] = useState('')
  const [exam, setExam] = useState<TeacherExam | null>(null)
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [submitted, setSubmitted] = useState(false)

  const studentProgramId = user.programId
    ?? students.find((student) => student.email.toLocaleLowerCase() === user.email.toLocaleLowerCase())?.programId
    ?? 'prep-year-2'

  function joinExam() {
    setError('')
    setExam(null)
    if (code.length !== 6) {
      setError('Saisis les 6 caractères du code pour continuer.')
      return
    }

    const found = exams.find((item) => item.accessCode === code)
    if (!found || found.status === 'draft') {
      setError('Ce code est invalide. Vérifie les caractères et réessaie.')
      return
    }
    if (found.status === 'finished') {
      setError('Cet examen est terminé et n’accepte plus de participants.')
      return
    }
    if (!found.accessEnabled) {
      setError('L’accès à cet examen a été désactivé par le professeur.')
      return
    }
    const opensAt = new Date(`${found.date}T${found.openTime || '00:00'}`)
    if (!Number.isNaN(opensAt.getTime()) && Date.now() < opensAt.getTime()) {
      setError(`Cet examen n’est pas encore ouvert. Ouverture : ${formatOpeningTime(found)}.`)
      return
    }
    if (found.targets?.length && !found.targets.includes(studentProgramId)) {
      setError('Cet examen n’est pas destiné à ta filière.')
      return
    }

    setExam(found)
  }

  function setAnswer(questionId: string, optionId: string, multiple: boolean) {
    setAnswers((current) => {
      const currentAnswers = current[questionId] ?? []
      const next = multiple
        ? currentAnswers.includes(optionId) ? currentAnswers.filter((id) => id !== optionId) : [...currentAnswers, optionId]
        : [optionId]
      return { ...current, [questionId]: next }
    })
  }

  function reset() {
    setExam(null)
    setStarted(false)
    setSubmitted(false)
    setAnswers({})
    setError('')
    setCode('')
  }

  if (submitted && exam) {
    const score = exam.questions.reduce((total, question) => {
      const selected = answers[question.id] ?? []
      const correct = question.options.filter((option) => option.isCorrect).map((option) => option.id)
      const isCorrect = selected.length === correct.length && selected.every((optionId) => correct.includes(optionId))
      return total + (isCorrect ? question.points ?? 1 : 0)
    }, 0)
    return (
      <section className="mx-auto max-w-2xl py-10">
        <Card className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 text-2xl font-bold text-ink">Examen terminé</h1>
          <p className="mt-2 text-sm text-muted">{exam.title}</p>
          <p className="mt-6 text-4xl font-extrabold text-primary">{score} / {exam.questions.reduce((total, question) => total + (question.points ?? 1), 0)}</p>
          <p className="mt-2 text-xs text-muted">Résultat de démonstration — aucune note n’est envoyée au serveur.</p>
          <Button className="mt-6" variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={reset}>Revenir à l’accueil</Button>
        </Card>
      </section>
    )
  }

  if (started && exam) {
    const allAnswered = exam.questions.every((question) => (answers[question.id] ?? []).length > 0)
    return (
      <section className="mx-auto max-w-3xl space-y-4 py-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Examen en cours</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{exam.title}</h1>
          <p className="mt-1 text-sm text-muted">{exam.durationMinutes} min · {exam.questions.length} questions</p>
        </div>
        {exam.questions.map((question, index) => (
          <Card key={question.id}>
            <p className="text-xs font-semibold text-muted">Question {index + 1} sur {exam.questions.length}</p>
            <h2 className="mt-2 text-base font-semibold leading-6 text-ink">{question.text}</h2>
            <div className="mt-4 space-y-2">
              {question.options.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 transition hover:border-primary-300 hover:bg-primary-50/40">
                  <input
                    type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                    name={question.id}
                    checked={(answers[question.id] ?? []).includes(option.id)}
                    onChange={() => setAnswer(question.id, option.id, question.type === 'multiple')}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-ink">{option.text}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}
        <div className="sticky bottom-3 flex justify-end rounded-xl border border-line bg-surface/95 p-3 shadow-panel">
          <Button disabled={!allAnswered} onClick={() => setSubmitted(true)}>Terminer l’examen</Button>
        </div>
      </section>
    )
  }

  if (exam) {
    const program = getProgram(studentProgramId)
    return (
      <section className="mx-auto max-w-xl py-10">
        <Card className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success-soft text-success"><CheckCircle2 className="h-6 w-6" /></span>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-success">Code vérifié</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">{exam.title}</h1>
          <p className="mt-1 text-sm text-muted">{exam.subject}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-canvas p-4 text-left">
            <div><dt className="text-xs text-muted">Durée</dt><dd className="mt-1 text-sm font-semibold text-ink">{exam.durationMinutes} min</dd></div>
            <div><dt className="text-xs text-muted">Questions</dt><dd className="mt-1 text-sm font-semibold text-ink">{exam.questions.length}</dd></div>
            <div><dt className="text-xs text-muted">Langue</dt><dd className="mt-1 text-sm font-semibold text-ink">{exam.language === 'en' ? 'English' : 'Français'}</dd></div>
            <div><dt className="text-xs text-muted">Public</dt><dd className="mt-1 text-sm font-semibold text-ink">{program?.label ?? 'Filière enregistrée'}</dd></div>
          </dl>
          <Button className="mt-6 w-full" icon={<ArrowRight className="h-4 w-4" />} onClick={() => setStarted(true)}>Commencer l’examen</Button>
          <button type="button" onClick={reset} className="mt-3 text-xs font-medium text-muted hover:text-primary">Utiliser un autre code</button>
        </Card>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-lg py-10 sm:py-16">
      <Card className="p-6 sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary"><KeyRound className="h-6 w-6" /></span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">Espace étudiant</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Rejoindre un examen</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Saisis le code à 6 caractères communiqué par ton professeur.</p>
        <div className="mt-6">
          <CodeInput value={code} onChange={(value) => { setCode(value); setError('') }} error={error} />
        </div>
        <Button className="mt-6 w-full" disabled={code.length !== 6} icon={<BookOpenCheck className="h-4 w-4" />} onClick={joinExam}>Rejoindre</Button>
        <p className="mt-4 text-center text-xs text-muted">Le code ne contient pas les caractères 0, O, 1, I ou L.</p>
      </Card>
    </section>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  Clipboard,
  Clock3,
  Copy,
  FileText,
  GripVertical,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useTeacherData } from '../../data/useTeacherData'
import { ENGLISH_PROGRAM_ID, programGroups } from '../../data/programs.js'
import type { ExamLanguage, TeacherExam, TeacherQuestion, TeacherQuestionType } from '../../types/teacher'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Stepper } from '../../components/ui/Stepper'
import { PageHeader, SelectField } from './shared'
import { formatDate } from './utils'

const DRAFT_STORAGE_KEY = 'evalia_teacher_exam_draft'
const STEPS = ['Informations', 'Mode', 'Questions', 'Récapitulatif']
const letters = 'ABCDEF'

interface ExamDraft {
  title: string
  subject: string
  durationMinutes: number
  date: string
  openTime: string
  targets: string[]
  language: ExamLanguage
  mode: 'manual' | 'ai'
  questions: TeacherQuestion[]
  revealResults: boolean
  randomizeQuestions: boolean
  step: number
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createQuestion(index = 1): TeacherQuestion {
  return {
    id: makeId(`Q${index}`),
    text: '',
    type: 'single',
    points: 1,
    options: [
      { id: makeId('O'), text: '', isCorrect: true },
      { id: makeId('O'), text: '', isCorrect: false },
    ],
    explanation: '',
  }
}

function readDraft(): ExamDraft | null {
  const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
  if (!raw) return null
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value === 'object' && value !== null && 'questions' in value && Array.isArray(value.questions)) {
      return value as ExamDraft
    }
    console.error('Le brouillon enregistré est invalide.')
  } catch (error) {
    console.error('Impossible de lire le brouillon enregistré.', error)
  }
  return null
}

function readSelectedTargets(raw: string | null) {
  if (!raw) return []
  const knownIds = new Set(programGroups.flatMap((group) => group.programs.map((program) => program.id)))
  return raw.split(',').filter((id) => knownIds.has(id))
}

export function CreateExam() {
  const { exams, saveExam, publishExam, pendingQuestions, setPendingQuestions } = useTeacherData()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(window.location.search)
  const examId = searchParams.get('id')
  const existing = examId ? exams.find((exam) => exam.id === examId) : undefined
  const fromAi = searchParams.get('from') === 'ai'
  const requestedTargets = readSelectedTargets(searchParams.get('targets'))
  const requestedSubject = searchParams.get('subject') ?? ''
  const requestedLanguage = searchParams.get('language') === 'en' ? 'en' : 'fr'
  const [restoredDraft] = useState<ExamDraft | null>(() => existing ? null : readDraft())
  const initialTargets = existing?.targets ?? restoredDraft?.targets ?? requestedTargets
  const initialHasDeis = initialTargets.includes(ENGLISH_PROGRAM_ID)
  const [step, setStep] = useState(existing ? 0 : pendingQuestions.length ? 2 : restoredDraft?.step ?? 0)
  const [title, setTitle] = useState(existing?.title ?? restoredDraft?.title ?? '')
  const [subject, setSubject] = useState(existing?.subject ?? restoredDraft?.subject ?? requestedSubject)
  const [duration, setDuration] = useState(String(existing?.durationMinutes ?? restoredDraft?.durationMinutes ?? 30))
  const [date, setDate] = useState(existing?.date ?? restoredDraft?.date ?? '')
  const [openTime, setOpenTime] = useState(existing?.openTime ?? restoredDraft?.openTime ?? '09:00')
  const [targets, setTargets] = useState<string[]>(initialTargets)
  const [language, setLanguage] = useState<ExamLanguage>(
    initialHasDeis ? 'en' : existing?.language ?? restoredDraft?.language ?? requestedLanguage
  )
  const [mode, setMode] = useState<'manual' | 'ai'>(existing?.mode ?? restoredDraft?.mode ?? (fromAi ? 'ai' : 'manual'))
  const [questions, setQuestions] = useState<TeacherQuestion[]>(() =>
    existing?.questions ?? (pendingQuestions.length
      ? pendingQuestions.map((question) => structuredClone(question))
      : restoredDraft?.questions ?? [])
  )
  const [revealResults, setRevealResults] = useState(existing?.revealResults ?? restoredDraft?.revealResults ?? true)
  const [randomizeQuestions, setRandomizeQuestions] = useState(existing?.randomizeQuestions ?? restoredDraft?.randomizeQuestions ?? false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null)
  const [publishedExam, setPublishedExam] = useState<TeacherExam | null>(null)
  const [copyMessage, setCopyMessage] = useState('')

  const hasDeis = targets.includes(ENGLISH_PROGRAM_ID)
  const otherTargets = targets.filter((id) => id !== ENGLISH_PROGRAM_ID)
  const mixedLanguageTarget = hasDeis && otherTargets.length > 0
  const totalPoints = useMemo(() => questions.reduce((total, question) => total + (question.points ?? 1), 0), [questions])

  const makeDraft = useCallback((overrides: Partial<ExamDraft> = {}): ExamDraft => {
    return {
      title,
      subject,
      durationMinutes: Number(duration) || 30,
      date,
      openTime,
      targets,
      language: hasDeis ? 'en' : language,
      mode,
      questions,
      revealResults,
      randomizeQuestions,
      step,
      ...overrides,
    }
  }, [title, subject, duration, date, openTime, targets, hasDeis, language, mode, questions, revealResults, randomizeQuestions, step])

  useEffect(() => {
    if (publishedExam) return
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(makeDraft()))
        setSaved(true)
      } catch (storageError) {
        console.error('Impossible de sauvegarder automatiquement le brouillon.', storageError)
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [makeDraft, publishedExam])

  function persistDraft(overrides: Partial<ExamDraft> = {}) {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(makeDraft(overrides)))
    } catch (storageError) {
      console.error('Impossible de sauvegarder automatiquement le brouillon.', storageError)
      setError('Le brouillon ne peut pas être sauvegardé dans ce navigateur.')
    }
  }

  function updateTargets(nextTargets: string[]) {
    setTargets(nextTargets)
    setLanguage(nextTargets.includes(ENGLISH_PROGRAM_ID) ? 'en' : 'fr')
    setError('')
  }

  function toggleTarget(id: string) {
    updateTargets(targets.includes(id) ? targets.filter((item) => item !== id) : [...targets, id])
  }

  function toggleGroup(groupId: string) {
    const group = programGroups.find((item) => item.id === groupId)
    if (!group) return
    const ids = group.programs.map((program) => program.id)
    const allSelected = ids.every((id) => targets.includes(id))
    updateTargets(allSelected ? targets.filter((id) => !ids.includes(id)) : [...new Set([...targets, ...ids])])
  }

  function updateQuestion(id: string, update: (question: TeacherQuestion) => TeacherQuestion) {
    setQuestions((current) => current.map((question) => question.id === id ? update(question) : question))
  }

  function updateCorrectOption(question: TeacherQuestion, optionId: string, checked: boolean) {
    return {
      ...question,
      options: question.options.map((option) => {
        if (option.id === optionId) return { ...option, isCorrect: checked }
        return question.type === 'single' && checked ? { ...option, isCorrect: false } : option
      }),
    }
  }

  function moveQuestion(fromId: string, toId: string | undefined) {
    if (!toId) return
    setQuestions((current) => {
      const fromIndex = current.findIndex((question) => question.id === fromId)
      const toIndex = current.findIndex((question) => question.id === toId)
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return current
      const next = [...current]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  function duplicateQuestion(question: TeacherQuestion) {
    const copy = structuredClone(question)
    copy.id = makeId('Q')
    copy.options = copy.options.map((option) => ({ ...option, id: makeId('O') }))
    setQuestions((current) => {
      const index = current.findIndex((item) => item.id === question.id)
      const next = [...current]
      next.splice(index + 1, 0, copy)
      return next
    })
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (!title.trim() || !subject.trim() || !date || !openTime || !Number(duration) || Number(duration) < 1 || Number(duration) > 300) {
        setError('Complète le titre, la matière, la durée et la date/heure d’ouverture.')
        return false
      }
      if (!targets.length) {
        setError('Sélectionne au moins un niveau ou une filière pour cet examen.')
        return false
      }
    }
    if (step === 2) {
      if (!questions.length) {
        setError('Ajoute au moins une question avant de continuer.')
        return false
      }
      const invalid = questions.some((question) =>
        !question.text.trim() ||
        question.options.length < 2 ||
        question.options.length > 6 ||
        question.options.some((option) => !option.text.trim()) ||
        !question.options.some((option) => option.isCorrect) ||
        (question.type === 'single' && question.options.filter((option) => option.isCorrect).length !== 1)
      )
      if (invalid) {
        setError('Vérifie chaque question : 2 à 6 options renseignées et au moins une bonne réponse.')
        return false
      }
    }
    setError('')
    return true
  }

  function nextStep() {
    if (!validateStep()) return
    setStep((current) => Math.min(current + 1, STEPS.length - 1))
  }

  function openAiGenerator() {
    const nextDraft = makeDraft({ mode: 'ai', step: 2 })
    persistDraft(nextDraft)
    const query = new URLSearchParams({
      subject,
      language: hasDeis ? 'en' : language,
      targets: targets.join(','),
    })
    navigate(`/teacher/ai-generator?${query}`)
  }

  async function handlePublish() {
    if (step !== 3) return
    if (!title.trim() || !subject.trim() || !date || !openTime || !Number(duration) || Number(duration) < 1 || Number(duration) > 300 || !targets.length) {
      setError('Reviens à l’étape Informations et complète tous les champs obligatoires.')
      setStep(0)
      return
    }
    const invalidQuestions = !questions.length || questions.some((question) =>
      !question.text.trim() ||
      question.options.length < 2 ||
      question.options.length > 6 ||
      question.options.some((option) => !option.text.trim()) ||
      !question.options.some((option) => option.isCorrect) ||
      (question.type === 'single' && question.options.filter((option) => option.isCorrect).length !== 1)
    )
    if (invalidQuestions) {
      setError('Vérifie les questions : il faut au moins une question valide avec 2 à 6 options et une bonne réponse.')
      setStep(2)
      return
    }
    setSaving(true)
    setError('')
    try {
      const draft = {
        ...(existing ? { id: existing.id, participants: existing.participants } : {}),
        title: title.trim(),
        subject: subject.trim(),
        durationMinutes: Number(duration),
        date,
        openTime,
        targets,
        language: hasDeis ? 'en' as const : language,
        mode,
        questions,
        revealResults,
        randomizeQuestions,
      }
      const result = existing?.accessCode
        ? saveExam({ ...draft, status: 'published', accessCode: existing.accessCode, accessEnabled: existing.accessEnabled })
        : await publishExam(draft)
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      setPendingQuestions([])
      setPublishedExam(result)
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'La publication a échoué. Réessaie.')
    } finally {
      setSaving(false)
    }
  }

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopyMessage(`${label} copié.`)
    } catch {
      setCopyMessage(`Impossible de copier ${label.toLowerCase()} automatiquement.`)
    }
  }

  function createAnother() {
    setPublishedExam(null)
    setStep(0)
    setTitle('')
    setSubject('')
    setDuration('30')
    setDate('')
    setOpenTime('09:00')
    setTargets([])
    setLanguage('fr')
    setMode('manual')
    setQuestions([])
    setError('')
    setCopyMessage('')
    setPendingQuestions([])
    navigate('/teacher/exams/create', { replace: true })
  }

  if (publishedExam) {
    const examLink = `${window.location.origin}/student/join?code=${publishedExam.accessCode}`
    return (
      <section className="mx-auto max-w-2xl py-8">
        <PageHeader eyebrow="Publication terminée" title="Examen publié !" description="Partage ce code avec les étudiants concernés pour qu’ils rejoignent l’examen." />
        <Card className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft text-success"><CheckCircle2 className="h-7 w-7" /></span>
          <p className="mt-4 text-sm font-semibold text-ink">Code d’accès</p>
          <p className="mt-2 font-mono text-4xl font-extrabold tracking-[0.3em] text-primary sm:text-5xl" aria-label={`Code ${publishedExam.accessCode?.split('').join(' ')}`}>
            {publishedExam.accessCode}
          </p>
          <p className="mt-3 text-sm text-muted">Le code a été généré de façon unique. Communique-le uniquement aux étudiants concernés.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button icon={<Copy className="h-4 w-4" />} onClick={() => copyText(publishedExam.accessCode ?? '', 'Le code')}>Copier le code</Button>
            <Button variant="secondary" icon={<Clipboard className="h-4 w-4" />} onClick={() => copyText(examLink, 'Le lien')}>Copier le lien</Button>
          </div>
          {copyMessage && <p role="status" className="mt-3 text-xs font-medium text-muted">{copyMessage}</p>}
          <div className="mt-7 border-t border-line pt-5 text-left">
            <h2 className="text-sm font-bold text-ink">Résumé de l’examen</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-muted">Titre</dt><dd className="mt-1 font-semibold text-ink">{publishedExam.title}</dd></div>
              <div><dt className="text-xs text-muted">Matière</dt><dd className="mt-1 font-semibold text-ink">{publishedExam.subject}</dd></div>
              <div><dt className="text-xs text-muted">Publics</dt><dd className="mt-1 flex flex-wrap gap-1">{programGroups.flatMap((group) => group.programs.filter((program) => publishedExam.targets?.includes(program.id))).map((program) => <Badge key={program.id} status={program.id === ENGLISH_PROGRAM_ID ? 'info' : 'success'}>{program.label}</Badge>)}</dd></div>
              <div><dt className="text-xs text-muted">Durée et questions</dt><dd className="mt-1 font-semibold text-ink">{publishedExam.durationMinutes} min · {publishedExam.questions.length} questions</dd></div>
              <div><dt className="text-xs text-muted">Ouverture</dt><dd className="mt-1 font-semibold text-ink">{formatDate(publishedExam.date)} à {publishedExam.openTime}</dd></div>
              <div><dt className="text-xs text-muted">Langue</dt><dd className="mt-1 font-semibold text-ink">{publishedExam.language === 'en' ? 'English' : 'Français'}</dd></div>
            </dl>
          </div>
          <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">
            <Button variant="secondary" onClick={createAnother}>Créer un autre examen</Button>
            <Button onClick={() => navigate('/teacher/exams')}>Voir mes examens</Button>
          </div>
        </Card>
      </section>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow={existing ? 'Modifier une évaluation' : 'Nouvelle évaluation'}
        title={existing ? 'Modifier un examen' : 'Créer un examen'}
        description="Avance étape par étape. Ton brouillon est sauvegardé automatiquement dans ce navigateur."
      />

      <Stepper steps={STEPS} currentStep={step} onStepSelect={(index) => { if (index < step) { setError(''); setStep(index) } }} />

      {error && <div role="alert" className="mt-5 rounded-lg border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>}
      {saved && <p className="mt-3 text-right text-xs text-muted" role="status">Brouillon sauvegardé automatiquement</p>}

      <Card className="mx-auto mt-5 max-w-4xl">
        {step === 0 && (
          <section aria-labelledby="exam-info-title">
            <h2 id="exam-info-title" className="text-lg font-bold text-ink">1. Informations de l’examen</h2>
            <p className="mt-1 text-sm text-muted">Commence par les détails pratiques et choisis les étudiants concernés.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Input label="Titre de l’examen" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex. Algorithmique et complexité" maxLength={120} required /></div>
              <Input label="Matière" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Ex. Algorithmique" required />
              <Input label="Durée (en minutes)" type="number" min={1} max={300} value={duration} onChange={(event) => setDuration(event.target.value)} leadingIcon={<Clock3 className="h-4 w-4" />} required />
              <Input label="Date d’ouverture" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
              <Input label="Heure d’ouverture" type="time" value={openTime} onChange={(event) => setOpenTime(event.target.value)} required />
            </div>

            <div className="mt-7">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-ink">Public concerné <span className="text-danger">*</span></h3>
                  <p className="mt-1 text-xs text-muted">Tu peux sélectionner plusieurs niveaux et filières.</p>
                </div>
                <span className="text-xs font-semibold text-primary">{targets.length} sélectionné(s)</span>
              </div>
              <div className="space-y-4">
                {programGroups.map((group) => {
                  const groupIds = group.programs.map((program) => program.id)
                  const allSelected = groupIds.every((id) => targets.includes(id))
                  return (
                    <fieldset key={group.id} className="rounded-xl border border-line p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <legend className="text-sm font-bold text-ink">{group.cycle}</legend>
                        <button type="button" onClick={() => toggleGroup(group.id)} className="text-xs font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                          {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {group.programs.map((program) => {
                          const checked = targets.includes(program.id)
                          return (
                            <label key={program.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition focus-within:ring-2 focus-within:ring-primary/20 ${checked ? 'border-primary bg-primary-50/50' : 'border-line hover:border-primary-200 hover:bg-canvas'}`}>
                              <input type="checkbox" checked={checked} onChange={() => toggleTarget(program.id)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
                              <span className="text-xs font-medium leading-5 text-ink">{program.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </fieldset>
                  )
                })}
              </div>
              {mixedLanguageTarget && (
                <div className="mt-3 rounded-xl border border-accent/30 bg-accent-soft p-4">
                  <p className="text-sm font-semibold text-accent-strong">DEIS et d’autres filières sont sélectionnées.</p>
                  <p className="mt-1 text-xs leading-5 text-accent-strong">DEIS suit ses examens en anglais. Pour éviter un examen dans la mauvaise langue, crée deux examens séparés :</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => updateTargets([ENGLISH_PROGRAM_ID])}>Préparer l’examen anglais (DEIS)</Button>
                    <Button size="sm" variant="secondary" onClick={() => updateTargets(otherTargets)}>Préparer l’examen français (autres filières)</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 max-w-sm">
              <SelectField
                id="exam-language"
                label="Langue de l’examen"
                value={hasDeis ? 'en' : language}
                disabled={hasDeis}
                onChange={(value) => setLanguage(value as ExamLanguage)}
                options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]}
              />
              {hasDeis && <p className="mt-2 text-xs font-medium text-info">DEIS is taught in English: this exam must be written in English.</p>}
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="exam-mode-title">
            <h2 id="exam-mode-title" className="text-lg font-bold text-ink">2. Choisis comment créer les questions</h2>
            <p className="mt-1 text-sm text-muted">Tu pourras relire et modifier toutes les questions avant publication.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode('manual')}
                aria-pressed={mode === 'manual'}
                className={`rounded-xl border p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${mode === 'manual' ? 'border-primary bg-primary-50/60 ring-2 ring-primary/15' : 'border-line hover:border-primary-200 hover:bg-canvas'}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary"><FileText className="h-5 w-5" /></span>
                <span className="mt-4 block text-base font-bold text-ink">Créer manuellement</span>
                <span className="mt-1 block text-sm leading-5 text-muted">Rédige les questions et indique les bonnes réponses.</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('ai')}
                aria-pressed={mode === 'ai'}
                className={`rounded-xl border p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${mode === 'ai' ? 'border-primary bg-primary-50/60 ring-2 ring-primary/15' : 'border-line hover:border-primary-200 hover:bg-canvas'}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent-strong"><Sparkles className="h-5 w-5" /></span>
                <span className="mt-4 block text-base font-bold text-ink">Générer avec l’IA</span>
                <span className="mt-1 block text-sm leading-5 text-muted">Ajoute un support PDF et laisse Gemini proposer des questions.</span>
              </button>
            </div>
            {mode === 'ai' && (
              <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl bg-canvas p-4 sm:flex-row sm:items-center">
                <p className="text-xs leading-5 text-muted">Le brouillon est sauvegardé avant d’ouvrir le générateur. La langue choisie sera transmise.</p>
                <button type="button" onClick={openAiGenerator} className="text-xs font-semibold text-primary hover:underline">Configurer les paramètres IA</button>
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="exam-questions-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="exam-questions-title" className="text-lg font-bold text-ink">3. Questions de l’examen</h2>
                <p className="mt-1 text-sm text-muted">Choisis le type de réponse et coche la ou les bonnes réponses.</p>
              </div>
              <Button variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setQuestions((current) => [...current, createQuestion(current.length + 1)])}>Ajouter une question</Button>
            </div>

            {questions.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-line p-8 text-center">
                <p className="text-sm font-semibold text-ink">Aucune question pour le moment</p>
                <p className="mt-1 text-xs text-muted">Commence par ajouter une question ou utilise le générateur IA.</p>
                <Button className="mt-4" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setQuestions([createQuestion()])}>Ajouter une question</Button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {questions.map((question, questionIndex) => (
                  <article
                    key={question.id}
                    draggable
                    onDragStart={() => setDraggedQuestion(question.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (draggedQuestion) moveQuestion(draggedQuestion, question.id)
                      setDraggedQuestion(null)
                    }}
                    onDragEnd={() => setDraggedQuestion(null)}
                    className={`rounded-xl border border-line p-4 sm:p-5 ${draggedQuestion === question.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <button type="button" title="Déplacer la question" aria-label={`Déplacer la question ${questionIndex + 1}`} className="mt-1 cursor-grab rounded p-1 text-muted active:cursor-grabbing"><GripVertical className="h-4 w-4" /></button>
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-xs font-bold text-primary">{questionIndex + 1}</span>
                      <div className="min-w-0 flex-1 space-y-4">
                        <Input
                          label={`Question ${questionIndex + 1}`}
                          value={question.text}
                          onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, text: event.target.value }))}
                          placeholder="Saisis l’énoncé de ta question…"
                        />
                        <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
                          <SelectField
                            id={`question-type-${question.id}`}
                            label="Type de réponse"
                            value={question.type}
                            onChange={(value) => updateQuestion(question.id, (current) => ({
                              ...current,
                              type: value as TeacherQuestionType,
                              options: value === 'single' ? current.options.map((option, index) => ({ ...option, isCorrect: index === 0 })) : current.options,
                            }))}
                            options={[{ value: 'single', label: 'Choix unique' }, { value: 'multiple', label: 'Choix multiple' }]}
                          />
                          <Input
                            label="Points"
                            type="number"
                            min={0.5}
                            step={0.5}
                            value={question.points ?? 1}
                            onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, points: Math.max(0.5, Number(event.target.value) || 0.5) }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-ink">Réponses <span className="text-xs font-normal text-muted">— coche les bonnes réponses</span></p>
                          {question.options.map((option, optionIndex) => (
                            <div key={option.id} className="flex items-center gap-2">
                              <label className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-xs font-semibold ${option.isCorrect ? 'border-success-line bg-success-soft text-success' : 'border-line bg-canvas text-muted'}`} title="Marquer comme bonne réponse">
                                <input
                                  type={question.type === 'single' ? 'radio' : 'checkbox'}
                                  name={`correct-${question.id}`}
                                  checked={option.isCorrect}
                                  onChange={(event) => updateQuestion(question.id, (current) => updateCorrectOption(current, option.id, event.target.checked))}
                                  className="sr-only"
                                  aria-label={`Option ${letters[optionIndex]} bonne réponse`}
                                />
                                {option.isCorrect ? <Check className="h-4 w-4" /> : letters[optionIndex]}
                              </label>
                              <input
                                aria-label={`Texte de l’option ${letters[optionIndex]}`}
                                value={option.text}
                                onChange={(event) => updateQuestion(question.id, (current) => ({
                                  ...current,
                                  options: current.options.map((item) => item.id === option.id ? { ...item, text: event.target.value } : item),
                                }))}
                                placeholder={`Option ${letters[optionIndex]}`}
                                className="min-h-9 min-w-0 flex-1 rounded-lg border border-line px-3 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  aria-label={`Supprimer l’option ${letters[optionIndex]}`}
                                  onClick={() => updateQuestion(question.id, (current) => {
                                    const options = current.options.filter((item) => item.id !== option.id)
                                    if (!options.some((item) => item.isCorrect)) options[0].isCorrect = true
                                    return { ...current, options }
                                  })}
                                  className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-danger"
                                ><Trash2 className="h-4 w-4" /></button>
                              )}
                            </div>
                          ))}
                          {question.options.length < 6 && (
                            <button type="button" onClick={() => updateQuestion(question.id, (current) => ({ ...current, options: [...current.options, { id: makeId('O'), text: '', isCorrect: false }] }))} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><Plus className="h-3.5 w-3.5" /> Ajouter une option</button>
                          )}
                        </div>
                        <Input
                          label="Explication (facultative)"
                          value={question.explanation ?? ''}
                          onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, explanation: event.target.value }))}
                          placeholder="Pourquoi cette réponse est-elle correcte ?"
                        />
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button type="button" disabled={questionIndex === 0} aria-label={`Monter la question ${questionIndex + 1}`} onClick={() => moveQuestion(question.id, questions[questionIndex - 1]?.id)} className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                        <button type="button" disabled={questionIndex === questions.length - 1} aria-label={`Descendre la question ${questionIndex + 1}`} onClick={() => moveQuestion(question.id, questions[questionIndex + 1]?.id)} className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                        <button type="button" aria-label={`Dupliquer la question ${questionIndex + 1}`} onClick={() => duplicateQuestion(question)} className="rounded-lg p-2 text-muted hover:bg-primary-50 hover:text-primary"><Copy className="h-4 w-4" /></button>
                        <button type="button" aria-label={`Supprimer la question ${questionIndex + 1}`} onClick={() => setQuestions((current) => current.filter((item) => item.id !== question.id))} className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="sticky bottom-3 z-10 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/95 p-3 shadow-panel backdrop-blur">
              <p className="text-sm font-semibold text-ink">{questions.length} question(s) <span className="mx-1 text-line">·</span> Barème total : {totalPoints} point(s)</p>
              <Button size="sm" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setQuestions((current) => [...current, createQuestion(current.length + 1)])}>Ajouter</Button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="exam-summary-title">
            <h2 id="exam-summary-title" className="text-lg font-bold text-ink">4. Récapitulatif et publication</h2>
            <p className="mt-1 text-sm text-muted">Vérifie les informations. Un code d’accès unique sera créé uniquement à la publication.</p>
            <div className="mt-5 rounded-xl bg-canvas p-4">
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-muted">Titre</dt><dd className="mt-1 font-semibold text-ink">{title || 'À compléter'}</dd></div>
                <div><dt className="text-xs text-muted">Matière</dt><dd className="mt-1 font-semibold text-ink">{subject || 'À compléter'}</dd></div>
                <div><dt className="text-xs text-muted">Ouverture</dt><dd className="mt-1 font-semibold text-ink">{date ? `${formatDate(date)} à ${openTime}` : 'À compléter'}</dd></div>
                <div><dt className="text-xs text-muted">Durée</dt><dd className="mt-1 font-semibold text-ink">{duration} min</dd></div>
                <div><dt className="text-xs text-muted">Langue</dt><dd className="mt-1 font-semibold text-ink">{language === 'en' ? 'English' : 'Français'}</dd></div>
                <div><dt className="text-xs text-muted">Questions et barème</dt><dd className="mt-1 font-semibold text-ink">{questions.length} question(s) · {totalPoints} point(s)</dd></div>
              </dl>
              <div className="mt-4 border-t border-line pt-4">
                <p className="text-xs font-semibold text-muted">Public concerné</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {programGroups.flatMap((group) => group.programs.filter((program) => targets.includes(program.id))).map((program) => (
                    <Badge key={program.id} status={program.id === ENGLISH_PROGRAM_ID ? 'info' : 'success'}>{program.label}</Badge>
                  ))}
                  {!targets.length && <span className="text-sm text-danger">Aucun public sélectionné</span>}
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3">
                <input type="checkbox" checked={revealResults} onChange={(event) => setRevealResults(event.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
                <span><span className="block text-sm font-medium text-ink">Afficher les résultats après soumission</span><span className="mt-0.5 block text-xs text-muted">Les étudiants verront leur résultat après avoir terminé.</span></span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3">
                <input type="checkbox" checked={randomizeQuestions} onChange={(event) => setRandomizeQuestions(event.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
                <span><span className="block text-sm font-medium text-ink">Mélanger l’ordre des questions</span><span className="mt-0.5 block text-xs text-muted">Les questions s’afficheront dans un ordre aléatoire.</span></span>
              </label>
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-line pt-5 sm:flex-row">
          <Button variant="secondary" disabled={step === 0 || saving} icon={<ArrowLeft className="h-4 w-4" />} onClick={() => { setError(''); setStep((current) => Math.max(current - 1, 0)) }}>Précédent</Button>
          {step < STEPS.length - 1 ? (
            step === 1 && mode === 'ai'
              ? <Button icon={<Sparkles className="h-4 w-4" />} onClick={openAiGenerator}>Générer avec l’IA</Button>
              : <Button icon={<ArrowRight className="h-4 w-4" />} onClick={nextStep}>Continuer</Button>
          ) : (
            <Button disabled={saving} icon={saving ? <Clock3 className="h-4 w-4 animate-pulse" /> : <CheckCircle2 className="h-4 w-4" />} onClick={handlePublish}>
              {saving ? 'Publication…' : 'Publier l’examen'}
            </Button>
          )}
        </div>
      </Card>
    </>
  )
}

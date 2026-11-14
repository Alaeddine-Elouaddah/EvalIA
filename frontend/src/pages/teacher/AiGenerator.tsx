import { useState } from 'react'
import { m } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, FileUp, LoaderCircle, Plus, RefreshCw, Sparkles, Trash2 } from 'lucide-react'
import { generateQcm } from '../../api/qcm'
import { useTeacherData } from '../../data/useTeacherData'
import { ENGLISH_PROGRAM_ID, programGroups } from '../../data/programs.js'
import type { GeneratedQuestion } from '../../types'
import type { ExamLanguage, TeacherQuestion, TeacherQuestionType } from '../../types/teacher'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { PageHeader, SelectField } from './shared'

const MAX_FILE_SIZE = 20 * 1024 * 1024
const levels = programGroups.flatMap((group) => group.programs.map((program) => program.label))

function toTeacherQuestion(
  generated: GeneratedQuestion,
  index: number,
  type: TeacherQuestionType,
): TeacherQuestion {
  if (
    !generated.question?.trim() ||
    !Array.isArray(generated.options) ||
    generated.options.length < 2 ||
    !Number.isInteger(generated.correctIndex) ||
    generated.correctIndex < 0 ||
    generated.correctIndex >= generated.options.length
  ) {
    throw new Error(`La question générée n°${index + 1} est incomplète ou invalide.`)
  }

  const questionId = `AI-${Date.now()}-${index}`
  return {
    id: questionId,
    text: generated.question,
    type,
    options: generated.options.map((text, optionIndex) => ({
      id: `${questionId}-${optionIndex}`,
      text,
      isCorrect: optionIndex === generated.correctIndex,
    })),
    explanation: generated.explanation ?? '',
  }
}

function getGenerationError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Erreur inconnue pendant la génération.'
  if (message.includes('503') || message.includes('UNAVAILABLE')) {
    return 'Le service IA est momentanément indisponible. Réessayez dans quelques instants.'
  }
  if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    return 'Le quota du service IA est atteint. Réessayez un peu plus tard.'
  }
  return message
}

export function AiGenerator() {
  const navigate = useNavigate()
  const { setPendingQuestions } = useTeacherData()
  const searchParams = new URLSearchParams(window.location.search)
  const targetIds = searchParams.get('targets')?.split(',').filter(Boolean) ?? []
  const deisSelected = targetIds.includes(ENGLISH_PROGRAM_ID)
  const [file, setFile] = useState<File | null>(null)
  const [subject, setSubject] = useState(searchParams.get('subject') ?? '')
  const [level, setLevel] = useState(levels[0])
  const [count, setCount] = useState('5')
  const [difficulty, setDifficulty] = useState('medium')
  const [responseType, setResponseType] = useState<TeacherQuestionType>('single')
  const [language, setLanguage] = useState<ExamLanguage>(deisSelected || searchParams.get('language') === 'en' ? 'en' : 'fr')
  const [questions, setQuestions] = useState<TeacherQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  function chooseFile(nextFile: File | null) {
    setError('')
    if (!nextFile) {
      setFile(null)
      return
    }
    if (nextFile.type !== 'application/pdf' && !nextFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Choisissez un document PDF.')
      setFile(null)
      return
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setError('Le fichier PDF ne doit pas dépasser 20 Mo.')
      setFile(null)
      return
    }
    setFile(nextFile)
  }

  async function generate() {
    if (!file) {
      setError('Ajoutez un fichier PDF avant de lancer la génération.')
      return
    }

    const numberOfQuestions = Number(count)
    if (!Number.isInteger(numberOfQuestions) || numberOfQuestions < 1 || numberOfQuestions > 10) {
      setError('Choisissez un nombre de questions entre 1 et 10.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const generated = await generateQcm(file, numberOfQuestions, { language, level, difficulty, responseType })
      if (!generated.length) throw new Error("L’IA n’a renvoyé aucune question.")
      setQuestions(generated.map((question, index) => toTeacherQuestion(question, index, responseType)))
    } catch (generationError) {
      setError(getGenerationError(generationError))
    } finally {
      setLoading(false)
    }
  }

  async function regenerate(id: string) {
    if (!file) {
      setError('Le fichier source n’est plus disponible. Sélectionnez-le à nouveau pour régénérer une question.')
      return
    }
    const questionIndex = questions.findIndex((question) => question.id === id)
    if (questionIndex < 0) return

    setRegeneratingId(id)
    setError('')
    try {
      const generated = await generateQcm(file, 1, { language, level, difficulty, responseType })
      if (!generated.length) throw new Error("L’IA n’a renvoyé aucune question.")
      const replacement = toTeacherQuestion(generated[0], questionIndex, questions[questionIndex].type)
      setQuestions((current) => current.map((question) => question.id === id ? replacement : question))
    } catch (generationError) {
      setError(getGenerationError(generationError))
    } finally {
      setRegeneratingId(null)
    }
  }

  function addToExam() {
    setPendingQuestions(questions.map((question) => structuredClone(question)))
    const query = new URLSearchParams({
      from: 'ai',
      subject,
      language: deisSelected ? 'en' : language,
      targets: targetIds.join(','),
    })
    navigate(`/teacher/exams/create?${query}`)
  }

  function updateQuestion(id: string, update: (question: TeacherQuestion) => TeacherQuestion) {
    setQuestions((current) => current.map((question) => question.id === id ? update(question) : question))
  }

  return (
    <>
      <PageHeader
        eyebrow="Création assistée"
        title="Générateur IA"
        description="Importez votre support de cours. L’API Gemini génère des questions à relire avant leur ajout à un examen."
      />

      <div className="grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent-strong"><Sparkles className="h-5 w-5" /></span>
            <div><h2 className="text-base font-bold text-ink">Support de cours</h2><p className="text-xs text-muted">Un fichier PDF pour démarrer.</p></div>
          </div>
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="ai-pdf" className="block text-sm font-medium text-ink">Document de cours (PDF)</label>
              <div className="relative flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-canvas px-4 py-5 text-center transition hover:border-primary-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <FileUp className="h-6 w-6 text-primary" aria-hidden="true" />
                <span className="mt-2 max-w-full truncate text-sm font-semibold text-ink">{file?.name ?? 'Choisir un fichier PDF'}</span>
                <span className="mt-1 text-xs text-muted">Maximum 20 Mo</span>
                <input
                  id="ai-pdf"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Choisir le fichier PDF du cours"
                />
              </div>
            </div>
            <Input label="Sujet ou matière" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Ex. Algorithmique" />
            <SelectField id="ai-level" label="Niveau" value={level} onChange={setLevel} options={levels.map((value) => ({ value, label: value }))} />
            <Input label="Nombre de questions" type="number" min={1} max={10} value={count} onChange={(event) => setCount(event.target.value)} />
            <SelectField id="ai-difficulty" label="Difficulté" value={difficulty} onChange={setDifficulty} options={[{ value: 'easy', label: 'Facile' }, { value: 'medium', label: 'Intermédiaire' }, { value: 'hard', label: 'Avancée' }]} />
            <SelectField
              id="ai-type"
              label="Type de réponse"
              value={responseType}
              onChange={(value) => setResponseType(value as TeacherQuestionType)}
              options={[{ value: 'single', label: 'Choix unique' }, { value: 'multiple', label: 'Choix multiple' }]}
            />
            <SelectField
              id="ai-language"
              label="Langue des questions"
              value={deisSelected ? 'en' : language}
              disabled={deisSelected}
              onChange={(value) => setLanguage(value as ExamLanguage)}
              options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]}
            />
            {deisSelected && <p className="text-xs font-medium text-info">DEIS is taught in English: this exam must be written in English.</p>}
            {error && <p role="alert" className="rounded-lg border border-danger-line bg-danger-soft p-3 text-xs leading-5 text-danger">{error}</p>}
            <Button className="w-full" disabled={loading} icon={loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} onClick={generate}>
              {loading ? 'Génération par Gemini…' : 'Générer le QCM'}
            </Button>
            {loading && <p className="text-center text-xs text-muted">L’analyse du PDF peut prendre quelques instants.</p>}
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Aperçu des questions</h2>
              <p className="mt-1 text-sm text-muted">{questions.length ? `${questions.length} question${questions.length > 1 ? 's' : ''} générée${questions.length > 1 ? 's' : ''} depuis ${file?.name ?? 'le PDF'}` : 'Les questions générées depuis le PDF apparaîtront ici.'}</p>
            </div>
            {questions.length > 0 && <Button variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={addToExam}>Ajouter à l’examen <ArrowRight className="h-4 w-4" /></Button>}
          </div>
          {loading && questions.length === 0 && (
            <div className="space-y-3" aria-label="Chargement des questions générées" aria-busy="true">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          )}
          {questions.length === 0 ? (
            loading ? null : <EmptyState icon={FileUp} title="Importez un PDF pour commencer" description="Gemini analysera le document et proposera des questions que vous pourrez corriger avant de créer l’examen." />
          ) : questions.map((question, index) => (
            <m.div key={question.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.04 }}>
            <Card padding="md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-xs font-bold text-primary">{index + 1}</span>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge status={question.type === 'single' ? 'info' : 'warning'}>{question.type === 'single' ? 'Choix unique' : 'Choix multiple'}</Badge>
                    <span className="text-xs text-muted">{subject}</span>
                  </div>
                  <textarea
                    aria-label={`Énoncé de la question ${index + 1}`}
                    value={question.text}
                    onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, text: event.target.value }))}
                    rows={2}
                    className="w-full resize-y rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                  <SelectField
                    id={`ai-question-type-${question.id}`}
                    label="Type de réponse"
                    value={question.type}
                    onChange={(value) => updateQuestion(question.id, (current) => ({
                      ...current,
                      type: value as TeacherQuestionType,
                      options: value === 'single' ? current.options.map((option, optionIndex) => ({ ...option, isCorrect: optionIndex === 0 })) : current.options,
                    }))}
                    options={[{ value: 'single', label: 'Choix unique' }, { value: 'multiple', label: 'Choix multiple' }]}
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={option.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${option.isCorrect ? 'border-success-line bg-success-soft' : 'border-line bg-surface'}`}>
                        <input
                          type={question.type === 'single' ? 'radio' : 'checkbox'}
                          checked={option.isCorrect}
                          onChange={(event) => updateQuestion(question.id, (current) => ({
                            ...current,
                            options: current.options.map((item) => item.id === option.id
                              ? { ...item, isCorrect: event.target.checked }
                              : current.type === 'single' && event.target.checked ? { ...item, isCorrect: false } : item),
                          }))}
                          name={`ai-correct-${question.id}`}
                          aria-label={`Option ${optionIndex + 1} bonne réponse`}
                          className="h-4 w-4 accent-primary"
                        />
                        <input
                          aria-label={`Texte de l’option ${optionIndex + 1}`}
                          value={option.text}
                          onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, options: current.options.map((item) => item.id === option.id ? { ...item, text: event.target.value } : item) }))}
                          className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none"
                        />
                      </label>
                    ))}
                  </div>
                  <Input
                    label="Explication"
                    value={question.explanation ?? ''}
                    onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, explanation: event.target.value }))}
                    placeholder="Ajouter une explication facultative"
                  />
                </div>
                <div className="flex shrink-0 gap-1 sm:flex-col">
                  <button type="button" disabled={Boolean(regeneratingId)} onClick={() => regenerate(question.id)} aria-label={`Régénérer la question ${index + 1}`} title="Régénérer" className="rounded-lg p-2 text-muted hover:bg-primary-50 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50">
                    {regeneratingId === question.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => setQuestions((current) => current.filter((item) => item.id !== question.id))} aria-label={`Supprimer la question ${index + 1}`} title="Supprimer" className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-danger"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </Card>
            </m.div>
          ))}
        </div>
      </div>
    </>
  )
}

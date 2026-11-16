import {
  createExam,
  deleteExam as deleteExamRequest,
  fetchExamById,
  fetchMyExams,
  regenerateExamCode as regenerateExamCodeRequest,
  setExamAccess,
  updateExam as updateExamRequest,
} from '../api/exam'
import type { ExamDTO } from '../types'
import type { TeacherQuestion } from '../types/teacher'
import {
  parseTeacherExamId,
  toExamPayload,
  toTeacherExam,
  type TeacherExamDraft,
  type TeacherExamInput,
  type TeacherExamWithDescription,
} from './examAdapter'

/**
 * Couche d'accès aux examens de l'enseignant.
 *
 * Ce module est volontairement sans React : il ne contient ni état, ni hook.
 * Il orchestre uniquement les appels API et les conversions via `examAdapter`.
 *
 * Règle : après chaque écriture, l'état canonique est relu côté serveur
 * (`GET /exams/{id}`), car le backend régénère les identifiants de questions
 * et décide lui-même du code d'accès.
 */

function requireExamId(id: string, action: string): number {
  const numericId = parseTeacherExamId(id)
  if (numericId === undefined) {
    throw new Error(`Impossible de ${action} : identifiant d'examen invalide.`)
  }
  return numericId
}

/** Charge la liste complète des examens de l'enseignant connecté. */
export async function listTeacherExams(): Promise<TeacherExamWithDescription[]> {
  const dtos = await fetchMyExams()
  return dtos.map(toTeacherExam)
}

/** Relit un examen précis depuis le serveur (état canonique). */
export async function loadTeacherExam(id: string): Promise<TeacherExamWithDescription> {
  const numericId = requireExamId(id, 'charger cet examen')
  const dto = await fetchExamById(numericId)
  return toTeacherExam(dto)
}

/**
 * Relit l'examen après écriture. Si la relecture échoue alors que l'écriture
 * a réussi, on retombe sur la réponse du serveur afin de ne pas signaler un
 * échec trompeur à l'utilisateur.
 */
async function refetchOrFallback(numericId: number, dto: ExamDTO): Promise<TeacherExamWithDescription> {
  try {
    return await loadTeacherExam(String(numericId))
  } catch {
    return toTeacherExam(dto)
  }
}

/**
 * Crée ou met à jour un examen.
 * - identifiant numérique absent  -> `POST /exams`
 * - identifiant numérique présent -> `PUT /exams/{id}`
 */
export async function persistTeacherExam(exam: TeacherExamInput): Promise<TeacherExamWithDescription> {
  const numericId = parseTeacherExamId(exam.id)
  const payload = toExamPayload(exam)

  if (numericId === undefined) {
    const created = await createExam(payload)
    if (created.id === undefined || created.id === null) {
      throw new Error("Le serveur n'a pas renvoyé l'identifiant de l'examen créé.")
    }
    return refetchOrFallback(created.id, created)
  }

  const updated = await updateExamRequest(numericId, payload)
  return refetchOrFallback(numericId, updated)
}

/** Publie un examen (le statut `published` et le code sont décidés côté serveur). */
export async function publishTeacherExam(exam: TeacherExamDraft): Promise<TeacherExamWithDescription> {
  return persistTeacherExam({ ...exam, status: 'published' })
}

/** Supprime un examen possédé par l'enseignant connecté. */
export async function removeTeacherExam(id: string): Promise<void> {
  await deleteExamRequest(requireExamId(id, 'supprimer cet examen'))
}

/** Retire les identifiants serveur pour que la copie soit insérée comme un nouvel examen. */
function cloneQuestionsForDuplicate(questions: TeacherQuestion[]): TeacherQuestion[] {
  return questions.map((question) => ({
    ...question,
    id: '',
    options: question.options.map((option) => ({ ...option, id: '' })),
  }))
}

/** Duplique un examen en brouillon sans code d'accès, comme l'ancien comportement. */
export async function duplicateTeacherExam(source: TeacherExamWithDescription): Promise<TeacherExamWithDescription> {
  return persistTeacherExam({
    title: `${source.title} — copie`,
    description: source.description ?? undefined,
    subject: source.subject,
    durationMinutes: source.durationMinutes,
    date: source.date,
    openTime: source.openTime,
    targets: source.targets,
    language: source.language,
    mode: source.mode,
    questions: cloneQuestionsForDuplicate(source.questions),
    revealResults: source.revealResults,
    randomizeQuestions: source.randomizeQuestions,
    status: 'draft',
    accessCode: undefined,
    accessEnabled: false,
  })
}

/** Régénère le code d'accès côté serveur et renvoie le nouveau code. */
export async function regenerateTeacherExamCode(id: string): Promise<string> {
  const numericId = requireExamId(id, 'régénérer le code')
  const result = await regenerateExamCodeRequest(numericId)
  return result.accessCode
}

/** Active ou désactive l'accès à un examen. */
export async function updateTeacherExamAccess(id: string, enabled: boolean): Promise<void> {
  await setExamAccess(requireExamId(id, "modifier l'accès"), enabled)
}

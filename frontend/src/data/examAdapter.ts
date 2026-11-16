import type { ExamDTO, ExamQuestionDTO, QuestionOptionDTO } from '../types'
import type { ExamStatus, TeacherExam, TeacherOption, TeacherQuestion } from '../types/teacher'

/**
 * Adaptateur centralisé entre le modèle produit de l'UI enseignant
 * (`TeacherExam`) et le contrat API (`ExamDTO`).
 *
 * Ce fichier est volontairement pur :
 * - aucune dépendance React, aucun hook, aucun état ;
 * - aucune requête réseau ;
 * - uniquement des conversions explicites et testables.
 *
 * Règles de conversion (voir Lot 1 backend) :
 * - `id` string <-> number : seul un id numérique est renvoyé au serveur ;
 * - `date` + `openTime` <-> `opensAt` ("yyyy-MM-ddTHH:mm") ;
 * - `questionType` MAJUSCULES <-> `type` minuscules ;
 * - `optionText` / `correct` <-> `text` / `isCorrect` ;
 * - les champs nullables renvoyés par le backend retombent sur des valeurs sûres.
 */

/** Examen tel que manipulé par l'UI enseignant, enrichi de la description backend. */
export type TeacherExamWithDescription = TeacherExam & {
  description?: string | null
}

/**
 * Examen en cours de rédaction (mêmes règles que `publishExam` du contexte) :
 * le statut, le code et l'activation sont décidés par le serveur à la publication.
 */
export type TeacherExamDraft = Omit<
  TeacherExam,
  'id' | 'participants' | 'status' | 'accessCode' | 'accessEnabled'
> & {
  id?: string
  participants?: number
}

/** Examen éditable : brouillon ou examen existant (statut/code/activation facultatifs). */
export type TeacherExamInput = TeacherExamDraft & {
  status?: ExamStatus
  accessCode?: string
  accessEnabled?: boolean
  description?: string | null
}

const OPEN_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const OPEN_TIME_PATTERN = /^\d{2}:\d{2}$/
const OPEN_DATETIME_PATTERN = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}))?/
const NUMERIC_ID_PATTERN = /^\d+$/

/**
 * Convertit un identifiant de l'UI (`"42"`, `"EX-2048"`) en identifiant serveur.
 * Retourne `undefined` pour tout identifiant non numérique (= examen jamais persisté).
 */
export function parseTeacherExamId(id?: string | null): number | undefined {
  if (!id) return undefined
  const trimmed = id.trim()
  if (!NUMERIC_ID_PATTERN.test(trimmed)) return undefined
  const value = Number(trimmed)
  return Number.isSafeInteger(value) && value > 0 ? value : undefined
}

/** Éclate `opensAt` ("2026-11-18T09:00") en `date` ("2026-11-18") + `openTime` ("09:00"). */
export function splitOpensAt(opensAt?: string | null): { date: string; openTime?: string } {
  if (!opensAt) return { date: '' }
  const match = OPEN_DATETIME_PATTERN.exec(opensAt.trim())
  if (!match) return { date: '' }
  return match[2] ? { date: match[1], openTime: match[2] } : { date: match[1] }
}

/**
 * Recombine `date` + `openTime` en `opensAt`.
 * Une date absente ou invalide donne `null` (champ non envoyé / effacé).
 * Une heure absente ou invalide conserve la date seule (le backend la place à 00:00).
 */
export function mergeOpensAt(date?: string | null, openTime?: string | null): string | null {
  const cleanDate = date?.trim() ?? ''
  if (!OPEN_DATE_PATTERN.test(cleanDate)) return null
  const cleanTime = openTime?.trim() ?? ''
  if (OPEN_TIME_PATTERN.test(cleanTime)) return `${cleanDate}T${cleanTime}`
  return cleanDate
}

function normalizeOptionalText(value?: string | null): string | null {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/** `ExamDTO` -> `TeacherExam` (lecture : API vers UI). */
export function toTeacherExam(dto: ExamDTO): TeacherExamWithDescription {
  const { date, openTime } = splitOpensAt(dto.opensAt)
  return {
    id: dto.id !== undefined && dto.id !== null ? String(dto.id) : '',
    title: dto.title,
    description: dto.description ?? null,
    subject: dto.subject ?? '',
    durationMinutes: dto.durationMinutes ?? 0,
    date,
    openTime,
    status: dto.status ?? 'draft',
    participants: dto.participants ?? 0,
    mode: dto.mode ?? 'manual',
    targets: dto.targets ?? undefined,
    language: dto.language ?? 'fr',
    accessCode: dto.accessCode ?? undefined,
    accessEnabled: dto.accessEnabled ?? true,
    questions: dto.questions.map(toTeacherQuestion),
    revealResults: dto.revealResults ?? true,
    randomizeQuestions: dto.randomizeQuestions ?? false,
  }
}

/** `ExamDTO[]` -> `TeacherExam[]`. */
export function toTeacherExams(dtos: ExamDTO[]): TeacherExamWithDescription[] {
  return dtos.map(toTeacherExam)
}

/** `ExamDTO` (question) -> `TeacherQuestion` (lecture). */
export function toTeacherQuestion(dto: ExamQuestionDTO): TeacherQuestion {
  return {
    id: dto.id !== undefined && dto.id !== null ? String(dto.id) : '',
    text: dto.question,
    type: dto.questionType === 'MULTIPLE' ? 'multiple' : 'single',
    options: dto.options.map(toTeacherOption),
    explanation: dto.explanation ?? undefined,
    points: dto.points ?? 1,
  }
}

/** `QuestionOptionDTO` -> `TeacherOption` (lecture). */
export function toTeacherOption(dto: QuestionOptionDTO): TeacherOption {
  return {
    id: dto.id !== undefined && dto.id !== null ? String(dto.id) : '',
    text: dto.optionText,
    isCorrect: dto.correct === true,
  }
}

/** `TeacherExam` -> `ExamDTO` (écriture : UI vers API). */
export function toExamPayload(exam: TeacherExamInput): ExamDTO {
  const numericId = parseTeacherExamId(exam.id)
  return {
    ...(numericId !== undefined ? { id: numericId } : {}),
    title: exam.title.trim(),
    description: normalizeOptionalText(exam.description) ?? undefined,
    subject: normalizeOptionalText(exam.subject),
    status: exam.status ?? 'draft',
    accessCode: normalizeOptionalText(exam.accessCode)?.toUpperCase() ?? null,
    accessEnabled: exam.accessEnabled ?? true,
    durationMinutes: Number.isFinite(exam.durationMinutes) ? exam.durationMinutes : null,
    opensAt: mergeOpensAt(exam.date, exam.openTime),
    language: exam.language ?? 'fr',
    mode: exam.mode ?? 'manual',
    targets: exam.targets && exam.targets.length > 0 ? [...exam.targets] : null,
    revealResults: exam.revealResults ?? true,
    randomizeQuestions: exam.randomizeQuestions ?? false,
    questions: exam.questions.map(toQuestionPayload),
  }
}

/** `TeacherQuestion` -> `ExamQuestionDTO` (écriture). */
export function toQuestionPayload(question: TeacherQuestion): ExamQuestionDTO {
  const numericId = parseTeacherExamId(question.id)
  return {
    ...(numericId !== undefined ? { id: numericId } : {}),
    question: question.text.trim(),
    questionType: question.type === 'multiple' ? 'MULTIPLE' : 'SINGLE',
    explanation: normalizeOptionalText(question.explanation) ?? undefined,
    points: typeof question.points === 'number' && question.points > 0 ? question.points : 1,
    options: question.options.map((option, index) => toOptionPayload(option, index)),
  }
}

/** `TeacherOption` -> `QuestionOptionDTO` (écriture). */
export function toOptionPayload(option: TeacherOption, index: number): QuestionOptionDTO {
  const numericId = parseTeacherExamId(option.id)
  return {
    ...(numericId !== undefined ? { id: numericId } : {}),
    optionText: option.text.trim(),
    correct: option.isCorrect === true,
    orderIndex: index,
  }
}

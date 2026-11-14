import type { TeacherExam } from '../types/teacher'
import { generateExamCode } from '../utils/examCode.js'

export async function publishExamMock(
  exam: Omit<TeacherExam, 'id' | 'participants' | 'status' | 'accessCode' | 'accessEnabled'> & {
    id?: string
    participants?: number
  },
  usedCodes: string[],
): Promise<TeacherExam> {
  await Promise.resolve()
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const accessCode = generateExamCode()
    if (!usedCodes.includes(accessCode)) {
      return {
        ...exam,
        id: exam.id ?? `EX-${Date.now()}`,
        participants: exam.participants ?? 0,
        status: 'published',
        accessCode,
        accessEnabled: true,
      }
    }
  }
  throw new Error('Impossible de générer un code unique. Réessayez la publication.')
}

export async function regenerateExamCodeMock(usedCodes: string[]): Promise<string> {
  await Promise.resolve()
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const accessCode = generateExamCode()
    if (!usedCodes.includes(accessCode)) return accessCode
  }
  throw new Error('Impossible de générer un code unique. Réessayez.')
}

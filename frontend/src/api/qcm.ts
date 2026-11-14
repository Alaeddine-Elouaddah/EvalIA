import type { GeneratedQuestion } from '../types'

export interface QcmGenerationOptions {
  language?: 'fr' | 'en'
  level?: string
  difficulty?: string
  responseType?: 'single' | 'multiple'
}

export async function generateQcm(
  file: File,
  nb: number,
  options: QcmGenerationOptions = {},
): Promise<GeneratedQuestion[]> {
  const body = new FormData()
  body.append('file', file)

  const query = new URLSearchParams({
    nb: String(nb),
    language: options.language ?? 'fr',
    ...(options.level ? { level: options.level } : {}),
    ...(options.difficulty ? { difficulty: options.difficulty } : {}),
    ...(options.responseType ? { responseType: options.responseType } : {}),
  })
  const res = await fetch(`/evalia/api/ai/generate?${query}`, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    throw new Error(await res.text())
  }

  return res.json() as Promise<GeneratedQuestion[]>
}

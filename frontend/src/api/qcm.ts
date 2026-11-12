import type { GeneratedQuestion } from '../types'

export async function generateQcm(
  file: File,
  nb: number,
): Promise<GeneratedQuestion[]> {
  const body = new FormData()
  body.append('file', file)

  const res = await fetch(`/evalia/api/ai/generate?nb=${nb}`, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    throw new Error(await res.text())
  }

  return res.json() as Promise<GeneratedQuestion[]>
}

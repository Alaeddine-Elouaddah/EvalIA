export type GeneratedQuestion = {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type Step = 'upload' | 'quiz' | 'result'

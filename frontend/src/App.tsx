import { useState, type FormEvent } from 'react'
import { generateQcm } from './api/qcm'
import type { GeneratedQuestion, Step } from './types'
import './App.css'

function App() {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [nb, setNb] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [picked, setPicked] = useState<number | null>(null)

  async function onGenerate(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Choisis un fichier PDF.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const qcms = await generateQcm(file, nb)
      if (qcms.length === 0) {
        throw new Error("L'IA n'a renvoyé aucune question.")
      }
      setQuestions(qcms)
      setIndex(0)
      setAnswers([])
      setPicked(null)
      setStep('quiz')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      if (msg.includes('503') || msg.includes('UNAVAILABLE')) {
        setError("Le service d'IA subit une forte demande momentanée. Veuillez patienter quelques secondes et cliquer à nouveau sur Générer.")
      } else if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        setError("Le quota de requêtes vers l'IA a été atteint. Veuillez réessayer un peu plus tard.")
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  function choose(optionIndex: number) {
    if (picked !== null) return
    setPicked(optionIndex)
  }

  function next() {
    if (picked === null) return
    const nextAnswers = [...answers, picked]
    setAnswers(nextAnswers)
    setPicked(null)
    if (index + 1 < questions.length) {
      setIndex(index + 1)
    } else {
      setStep('result')
    }
  }

  function reset() {
    setStep('upload')
    setQuestions([])
    setAnswers([])
    setIndex(0)
    setPicked(null)
    setError(null)
  }

  const current = questions[index]
  const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length

  return (
    <div className="page">
      <header>
        <p className="brand">EvalIA</p>
        <h1>Générer un QCM depuis un PDF</h1>
      </header>

      {step === 'upload' && (
        <form className="card" onSubmit={onGenerate}>
          <label>
            Fichier PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label>
            Nombre de questions
            <input
              type="number"
              min={1}
              max={10}
              value={nb}
              onChange={(e) => setNb(Number(e.target.value))}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Génération en cours…' : 'Générer'}
          </button>
          {loading && (
            <p className="hint">Gemini peut mettre 10 à 40 secondes, parfois plus.</p>
          )}
        </form>
      )}

      {step === 'quiz' && current && (
        <section className="card">
          <p className="meta">
            Question {index + 1} / {questions.length}
          </p>
          <h2>{current.question}</h2>
          <ul className="options">
            {current.options.map((opt, i) => {
              const correct = i === current.correctIndex
              const selected = picked === i
              let cls = ''
              if (picked !== null) {
                if (correct) cls = 'ok'
                else if (selected) cls = 'ko'
              }
              return (
                <li key={opt}>
                  <button
                    type="button"
                    className={cls}
                    disabled={picked !== null}
                    onClick={() => choose(i)}
                  >
                    {opt}
                  </button>
                </li>
              )
            })}
          </ul>
          {picked !== null && (
            <>
              <p className="explain">{current.explanation}</p>
              <button type="button" onClick={next}>
                {index + 1 < questions.length ? 'Question suivante' : 'Voir le score'}
              </button>
            </>
          )}
        </section>
      )}

      {step === 'result' && (
        <section className="card">
          <h2>
            Score : {score} / {questions.length}
          </h2>
          <ol className="recap">
            {questions.map((q, i) => (
              <li key={q.question}>
                <strong>{q.question}</strong>
                <p>
                  Ta réponse : {q.options[answers[i] ?? 0]}
                  {answers[i] === q.correctIndex ? ' ✓' : ' ✗'}
                </p>
                <p className="explain">{q.explanation}</p>
              </li>
            ))}
          </ol>
          <button type="button" onClick={reset}>
            Nouveau PDF
          </button>
        </section>
      )}
    </div>
  )
}

export default App

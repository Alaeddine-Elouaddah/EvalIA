import React, { useState, type FormEvent } from 'react'
import { generateQcm } from '../api/qcm'
import type { GeneratedQuestion, User } from '../types'
import { UploadCloud, CheckCircle2, XCircle, RotateCcw, ArrowRight, Loader2, Sparkles, BookOpen } from 'lucide-react'

interface QcmWorkspaceProps {
  user: User
}

export const QcmWorkspace: React.FC<QcmWorkspaceProps> = ({ user }) => {
  const [step, setStep] = useState<'upload' | 'quiz' | 'result'>('upload')
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
      setError('Veuillez sélectionner un fichier PDF.')
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Role Context Header */}
      <div className="mb-6 flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {user.role === 'TEACHER' ? 'Générateur d’évaluation QCM' : 'Auto-évaluation interactive'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {user.role === 'TEACHER'
              ? 'Créez et prévisualisez des QCM complets à partir de vos supports de cours'
              : 'Testez votre compréhension du document avec feedback pédagogique'}
          </p>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            user.role === 'TEACHER' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {user.role === 'TEACHER' ? 'Mode Enseignant' : 'Mode Étudiant'}
        </span>
      </div>

      {step === 'upload' && (
        <form onSubmit={onGenerate} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Document de cours (PDF)
            </label>
            <div className="relative border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 text-center transition bg-slate-50/50">
              <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">
                {file ? file.name : 'Cliquez pour choisir un fichier PDF ou glissez-déposez ici'}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF jusqu'à 20 Mo</p>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Nombre de questions souhaitées
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={nb}
              onChange={(e) => setNb(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Génération du QCM par l'IA en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Générer le QCM</span>
              </>
            )}
          </button>

          {loading && (
            <p className="text-xs text-center text-slate-500">
              L'analyse du PDF et la formulation des questions peuvent prendre entre 10 et 40 secondes.
            </p>
          )}
        </form>
      )}

      {step === 'quiz' && current && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="uppercase tracking-wider">Question {index + 1} sur {questions.length}</span>
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((index + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900">{current.question}</h3>

          <div className="space-y-3">
            {current.options.map((opt, i) => {
              const correct = i === current.correctIndex
              const selected = picked === i
              let btnStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
              if (picked !== null) {
                if (correct) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium'
                } else if (selected) {
                  btnStyle = 'border-rose-500 bg-rose-50 text-rose-900'
                } else {
                  btnStyle = 'border-slate-100 opacity-60 text-slate-500'
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => choose(i)}
                  className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {picked !== null && correct && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {picked !== null && selected && !correct && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </button>
              )
            })}
          </div>

          {picked !== null && (
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
                <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Explication pédagogique :</span>
                </p>
                <p>{current.explanation}</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={next}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition cursor-pointer"
                >
                  <span>{index + 1 < questions.length ? 'Question suivante' : 'Voir les résultats'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {step === 'result' && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="text-center py-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Résultat final</span>
            <h3 className="text-4xl font-extrabold text-slate-900 mt-1">
              {score} / {questions.length}
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              {score === questions.length
                ? 'Excellent travail ! Vous maîtrisez parfaitement ce contenu.'
                : score >= questions.length / 2
                ? 'Bon score ! Revoyez les explications pour consolider vos acquis.'
                : 'Continuez vos révisions en vous appuyant sur les explications ci-dessous.'}
            </p>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">Récapitulatif des questions</h4>
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correctIndex
              return (
                <div key={q.question} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900 text-sm">{i + 1}. {q.question}</p>
                    {isCorrect ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 shrink-0">Correct</span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-700 shrink-0">Erreur</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong>Votre choix :</strong> {q.options[answers[i] ?? 0]}
                  </p>
                  {!isCorrect && (
                    <p className="text-xs text-emerald-700 font-medium">
                      <strong>Bonne réponse :</strong> {q.options[q.correctIndex]}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 italic mt-1 border-t border-slate-200/60 pt-1">
                    {q.explanation}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Générer un autre QCM</span>
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

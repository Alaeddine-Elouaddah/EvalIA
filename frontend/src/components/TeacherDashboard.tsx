import React, { useState, useEffect } from 'react'
import type { ExamDTO, ExamQuestionDTO, QuestionType } from '../types'
import { fetchMyExams, createExam, deleteExam } from '../api/exam'
import {
  Plus,
  Trash2,
  CheckSquare,
  Dot,
  FileQuestion,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  ListOrdered,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export const TeacherDashboard: React.FC = () => {
  const [exams, setExams] = useState<ExamDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedExamId, setExpandedExamId] = useState<number | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<ExamQuestionDTO[]>([
    {
      question: '',
      questionType: 'SINGLE',
      explanation: '',
      options: [
        { optionText: '', correct: true },
        { optionText: '', correct: false },
        { optionText: '', correct: false },
        { optionText: '', correct: false },
      ],
    },
  ])

  useEffect(() => {
    loadExams()
  }, [])

  const loadExams = async () => {
    setLoading(true)
    try {
      const data = await fetchMyExams()
      setExams(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  // Question manipulation
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        questionType: 'SINGLE',
        explanation: '',
        options: [
          { optionText: '', correct: true },
          { optionText: '', correct: false },
        ],
      },
    ])
  }

  const removeQuestion = (qIndex: number) => {
    if (questions.length <= 1) return
    setQuestions(questions.filter((_, idx) => idx !== qIndex))
  }

  const updateQuestionText = (qIndex: number, text: string) => {
    const updated = [...questions]
    updated[qIndex].question = text
    setQuestions(updated)
  }

  const updateQuestionExplanation = (qIndex: number, explanation: string) => {
    const updated = [...questions]
    updated[qIndex].explanation = explanation
    setQuestions(updated)
  }

  const setQuestionType = (qIndex: number, type: QuestionType) => {
    const updated = [...questions]
    updated[qIndex].questionType = type
    // If switched to SINGLE and multiple were checked, keep only the first checked one
    if (type === 'SINGLE') {
      let alreadyFoundCorrect = false
      updated[qIndex].options = updated[qIndex].options.map((opt) => {
        if (opt.correct) {
          if (!alreadyFoundCorrect) {
            alreadyFoundCorrect = true
            return opt
          }
          return { ...opt, correct: false }
        }
        return opt
      })
      // If none was checked, check the first
      if (!alreadyFoundCorrect && updated[qIndex].options.length > 0) {
        updated[qIndex].options[0].correct = true
      }
    }
    setQuestions(updated)
  }

  // Options manipulation
  const addOption = (qIndex: number) => {
    const updated = [...questions]
    updated[qIndex].options.push({ optionText: '', correct: false })
    setQuestions(updated)
  }

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions]
    if (updated[qIndex].options.length <= 2) return
    updated[qIndex].options = updated[qIndex].options.filter((_, idx) => idx !== oIndex)
    // Ensure at least one correct exists
    if (!updated[qIndex].options.some((o) => o.correct)) {
      updated[qIndex].options[0].correct = true
    }
    setQuestions(updated)
  }

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions]
    updated[qIndex].options[oIndex].optionText = text
    setQuestions(updated)
  }

  const toggleOptionCorrect = (qIndex: number, oIndex: number) => {
    const updated = [...questions]
    const q = updated[qIndex]

    if (q.questionType === 'SINGLE') {
      // Choix unique : un seul vrai à la fois
      q.options = q.options.map((opt, idx) => ({
        ...opt,
        correct: idx === oIndex,
      }))
    } else {
      // Choix multiple : bascule booléenne libre
      q.options[oIndex].correct = !q.options[oIndex].correct
    }
    setQuestions(updated)
  }

  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!title.trim()) {
      setError("Veuillez renseigner le titre de l'examen.")
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        setError(`Veuillez renseigner le libellé de la question #${i + 1}`)
        return
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].optionText.trim()) {
          setError(`L'option ${j + 1} de la question #${i + 1} ne peut pas être vide`)
          return
        }
      }
      const correctCount = q.options.filter((o) => o.correct).length
      if (correctCount === 0) {
        setError(`La question #${i + 1} doit comporter au moins une réponse valide.`)
        return
      }
      if (q.questionType === 'SINGLE' && correctCount > 1) {
        setError(`La question #${i + 1} est configurée en Choix Unique mais possède plusieurs réponses valides.`)
        return
      }
    }

    try {
      await createExam({
        title,
        description,
        questions,
      })
      setSuccessMsg("L'examen QCM a été créé avec succès !")
      setShowCreateModal(false)
      // Reset form
      setTitle('')
      setDescription('')
      setQuestions([
        {
          question: '',
          questionType: 'SINGLE',
          explanation: '',
          options: [
            { optionText: '', correct: true },
            { optionText: '', correct: false },
            { optionText: '', correct: false },
            { optionText: '', correct: false },
          ],
        },
      ])
      loadExams()
      setTimeout(() => setSuccessMsg(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création de l'examen")
    }
  }

  const handleDelete = async (examId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) return
    try {
      await deleteExam(examId)
      setExams(exams.filter((e) => e.id !== examId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur de suppression')
    }
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
              Espace Enseignant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Gestion des Examens & QCM
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Créez des évaluations personnalisées, définissez le type de validation (choix unique ou multiple) et organisez vos épreuves.
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateModal(true)
            setError(null)
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-200 hover:shadow-purple-300 transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvel Examen QCM</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Modal / Formulaire d'ajout d'examen */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Créer un nouvel Examen QCM</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configurez le titre, les questions et choisissez le mode de validation (une seule réponse correcte ou plusieurs).
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitExam} className="space-y-6">
              {/* Infos générales */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Titre de l'examen *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Contrôle Continu - Algorithmique & Structures de Données"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description ou Consignes (Optionnel)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Durée 30 minutes, calculatrice non autorisée..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-900 text-sm"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-6 border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ListOrdered className="w-5 h-5 text-purple-600" />
                    <span>Questions du QCM ({questions.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter une question</span>
                  </button>
                </div>

                {questions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="p-6 rounded-2xl border-2 border-slate-200 bg-slate-50/50 space-y-4 relative"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                          {qIndex + 1}
                        </span>
                        <span>Question #{qIndex + 1}</span>
                      </span>

                      {/* Type selector: Single vs Multiple */}
                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setQuestionType(qIndex, 'SINGLE')}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            q.questionType === 'SINGLE'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Dot className="w-4 h-4" />
                          <span>Choix Unique (1 réponse)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuestionType(qIndex, 'MULTIPLE')}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            q.questionType === 'MULTIPLE'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Choix Multiple (Plusieurs réponses)</span>
                        </button>
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer self-end sm:self-auto"
                          title="Supprimer la question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        value={q.question}
                        onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                        placeholder="Énoncez la question ici..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-900 text-sm font-medium"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5 pl-2 sm:pl-4 border-l-2 border-purple-200">
                      <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                        <span>
                          Options ({q.questionType === 'SINGLE' ? 'Sélectionnez la seule bonne réponse' : 'Cochez toutes les réponses correctes'}) :
                        </span>
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="text-purple-600 hover:text-purple-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ajouter une option</span>
                        </button>
                      </div>

                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleOptionCorrect(qIndex, oIndex)}
                            className={`p-2 rounded-lg border transition cursor-pointer shrink-0 flex items-center justify-center ${
                              opt.correct
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                : 'bg-white border-slate-300 text-slate-400 hover:border-slate-400'
                            }`}
                            title={opt.correct ? 'Réponse valide' : 'Marquer comme valide'}
                          >
                            {opt.correct ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300" />
                            )}
                          </button>

                          <input
                            type="text"
                            required
                            value={opt.optionText}
                            onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            className={`flex-1 px-3 py-2 rounded-xl border text-sm transition ${
                              opt.correct
                                ? 'border-emerald-400 bg-emerald-50/40 text-emerald-950 font-medium'
                                : 'border-slate-300 bg-white text-slate-800'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                          />

                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="text-slate-400 hover:text-rose-500 p-1.5 rounded transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explication */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Explication pédagogique de la réponse (Optionnel)</span>
                      </label>
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => updateQuestionExplanation(qIndex, e.target.value)}
                        placeholder="Explication affichée à l'étudiant lors de la correction..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md shadow-purple-200 transition cursor-pointer"
                >
                  Enregistrer l'examen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des examens existants */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          <span>Mes Examens Enregistrés ({exams.length})</span>
        </h2>

        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            Chargement de vos examens...
          </div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
            <FileQuestion className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-medium">Vous n'avez pas encore créé d'examen.</p>
            <p className="text-xs text-slate-400">
              Cliquez sur "Nouvel Examen QCM" ci-dessus pour concevoir votre première évaluation.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => {
              const isExpanded = expandedExamId === exam.id
              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow transition p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                          {exam.questions.length} Question{exam.questions.length > 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-slate-400">
                          Créé le {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : 'Récemment'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">{exam.title}</h3>
                      {exam.description && (
                        <p className="text-sm text-slate-500 mt-0.5">{exam.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setExpandedExamId(isExpanded ? null : (exam.id ?? null))}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                      >
                        <span>{isExpanded ? 'Masquer questions' : 'Voir questions'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => exam.id && handleDelete(exam.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Supprimer l'examen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Accordion view of questions */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      {exam.questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">
                              {idx + 1}. {q.question}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                q.questionType === 'MULTIPLE'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {q.questionType === 'MULTIPLE' ? 'Choix Multiple' : 'Choix Unique'}
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                                  opt.correct
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                    : 'bg-white border-slate-200 text-slate-600'
                                }`}
                              >
                                <span>{opt.optionText}</span>
                                {opt.correct && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                              </div>
                            ))}
                          </div>

                          {q.explanation && (
                            <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-200/50">
                              Explication : {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

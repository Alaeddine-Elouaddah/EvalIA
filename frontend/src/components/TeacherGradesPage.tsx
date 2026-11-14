import React, { useEffect, useState } from 'react'
import { Loader2, Search, Trophy } from 'lucide-react'
import { fetchTeacherGrades } from '../api/exam'
import type { ExamAttemptDTO } from '../types'

function formatDate(value: string) {
  const date = new Date(value.replace(' ', 'T').replace(/(\.\d{3})\d+$/, '$1'))
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export const TeacherGradesPage: React.FC = () => {
  const [grades, setGrades] = useState<ExamAttemptDTO[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchTeacherGrades()
      .then((data) => {
        if (active) setGrades(data)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Erreur lors du chargement des notes')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const visibleGrades = grades.filter((grade) =>
    `${grade.studentName} ${grade.studentEmail} ${grade.examTitle}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  )
  const average = grades.length
    ? grades.reduce((total, grade) => total + grade.score, 0) / grades.length
    : 0

  return (
    <section className="space-y-6 py-2">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Espace enseignant</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Notes des étudiants</h1>
        <p className="mt-2 text-sm text-slate-600">Chaque tentative est enregistrée pour les examens que vous avez créés.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tentatives enregistrées</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{grades.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Moyenne des notes</p>
          <p className="mt-2 text-3xl font-bold text-indigo-700">
            {grades.length ? `${average.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}%` : '—'}
          </p>
        </div>
      </div>

      <label className="relative block w-full sm:max-w-sm">
        <span className="sr-only">Rechercher une note</span>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Étudiant ou examen"
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </label>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Chargement des notes…
          </div>
        ) : visibleGrades.length === 0 ? (
          <div className="p-10 text-center">
            <Trophy className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              {grades.length ? 'Aucun résultat ne correspond à la recherche.' : 'Aucune tentative enregistrée pour vos examens.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Étudiant</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Examen</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Résultat</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Note</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{grade.studentName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{grade.studentEmail}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{grade.examTitle}</td>
                    <td className="px-5 py-4 text-slate-600">{grade.correctCount}/{grade.totalQuestions}</td>
                    <td className="px-5 py-4 font-bold text-indigo-700">
                      {grade.score.toLocaleString('fr-FR')}%
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{formatDate(grade.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

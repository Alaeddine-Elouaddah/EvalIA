import React, { useEffect, useState } from 'react'
import { Loader2, Search, UsersRound } from 'lucide-react'
import { fetchTeacherStudents } from '../api/exam'
import type { TeacherStudentDTO } from '../types'

export const TeacherStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<TeacherStudentDTO[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchTeacherStudents()
      .then((data) => {
        if (active) setStudents(data)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Erreur lors du chargement des étudiants')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const visibleStudents = students.filter((student) =>
    `${student.name} ${student.email}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  )

  return (
    <section className="space-y-6 py-2">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-600">Espace enseignant</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Gérer les étudiants</h1>
        <p className="mt-2 text-sm text-slate-600">Consultez les étudiants inscrits et leur participation à vos examens.</p>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <UsersRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{students.length} étudiant(s)</p>
            <p className="text-xs text-slate-500">Comptes étudiants de la plateforme</p>
          </div>
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Rechercher un étudiant</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nom ou e-mail"
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </label>
      </div>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Chargement des étudiants…
          </div>
        ) : visibleStudents.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">
            {students.length ? 'Aucun étudiant ne correspond à la recherche.' : 'Aucun compte étudiant trouvé.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Étudiant</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Examens passés</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Tentatives</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Moyenne</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{student.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{student.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{student.examsTaken}</td>
                    <td className="px-5 py-4 text-slate-600">{student.attemptCount}</td>
                    <td className="px-5 py-4 font-semibold text-indigo-700">
                      {student.attemptCount ? `${student.averageScore.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}%` : '—'}
                    </td>
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

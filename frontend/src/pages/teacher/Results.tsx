import { useEffect, useMemo, useState } from 'react'
import { m } from 'framer-motion'
import {
  BarChart3,
  Search,
  ShieldAlert,
  Eye,
  Loader2,
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { useTeacherData } from '../../data/useTeacherData'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { PageHeader, SelectField } from './shared'
import { fetchTeacherGrades, fetchTeacherViolations } from '../../api/exam'
import type { ExamAttemptDTO, TeacherViolationDTO } from '../../types'
import { CheatingReportModal } from '../../components/CheatingReportModal'

const bins = [
  { label: '0–5', min: 0, max: 5 },
  { label: '5–10', min: 5, max: 10 },
  { label: '10–15', min: 10, max: 15 },
  { label: '15–20', min: 15, max: 20.01 },
]

function formatViolationDate(value: string) {
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function Results() {
  const { exams } = useTeacherData()
  const [grades, setGrades] = useState<ExamAttemptDTO[]>([])
  const [violations, setViolations] = useState<TeacherViolationDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [examId, setExamId] = useState('all')
  const [search, setSearch] = useState('')
  const [sortDescending, setSortDescending] = useState(true)
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttemptDTO | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([fetchTeacherGrades(), fetchTeacherViolations()])
      .then(([gradeData, violationData]) => {
        if (!active) return
        setGrades(gradeData)
        setViolations(violationData)
      })
      .catch((err) => {
        console.error('Erreur chargement notes:', err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const relevantGrades = useMemo(() => {
    return grades.filter((g) => examId === 'all' || String(g.examId) === examId)
  }, [grades, examId])

  const visibleResults = useMemo(() => {
    return relevantGrades
      .filter((g) =>
        `${g.studentName} ${g.studentEmail} ${g.examTitle}`
          .toLocaleLowerCase('fr')
          .includes(search.toLocaleLowerCase('fr'))
      )
      .sort((a, b) => {
        return sortDescending ? b.score - a.score : a.score - b.score
      })
  }, [relevantGrades, search, sortDescending])

  // Conversion score % -> sur 20
  const distribution = bins.map((bin) => ({
    ...bin,
    count: relevantGrades.filter((g) => {
      const note20 = (g.score / 100) * 20
      return note20 >= bin.min && note20 < bin.max
    }).length,
  }))
  const maxCount = Math.max(1, ...distribution.map((item) => item.count))
  const averagePct = relevantGrades.length
    ? relevantGrades.reduce((sum, g) => sum + g.score, 0) / relevantGrades.length
    : null
  const average20 = averagePct !== null ? (averagePct / 100) * 20 : null

  // Compter le nombre de cas suspects de triche
  const suspiciousStudents = useMemo(() => {
    const filtered = violations.filter((violation) =>
      examId === 'all' || String(violation.examId) === examId
    ).filter((violation) =>
      `${violation.studentName} ${violation.studentEmail} ${violation.examTitle}`
        .toLocaleLowerCase('fr')
        .includes(search.toLocaleLowerCase('fr'))
    )

    const grouped = new Map<string, {
      key: string
      studentName: string
      studentEmail: string
      examId: number
      examTitle: string
      violations: TeacherViolationDTO[]
    }>()

    filtered.forEach((violation) => {
      const key = `${violation.studentId}-${violation.examId}`
      const existing = grouped.get(key)
      if (existing) {
        existing.violations.push(violation)
      } else {
        grouped.set(key, {
          key,
          studentName: violation.studentName,
          studentEmail: violation.studentEmail,
          examId: violation.examId,
          examTitle: violation.examTitle,
          violations: [violation],
        })
      }
    })

    return Array.from(grouped.values())
  }, [violations, examId, search])

  return (
    <>
      <PageHeader
        eyebrow="Évaluation des acquis & Sécurité"
        title="Résultats & Surveillance Anti-Triche"
        description="Analysez les notes et consultez les rapports d'intégrité et infractions des étudiants."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card padding="lg" className="hover:translate-y-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted">Copies soumises</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{relevantGrades.length}</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-primary">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">Étudiants ayant terminé leur examen</p>
        </Card>

        <Card padding="lg" className="hover:translate-y-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted">Moyenne des notes</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-ink">
                {average20 === null ? '—' : `${average20.toFixed(1)}/20`}
              </p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">
            {averagePct !== null ? `${averagePct.toFixed(1)}% de réussite moyenne` : 'Aucune note disponible'}
          </p>
        </Card>

        <Card padding="lg" className="border-rose-200/80 bg-rose-50/30 hover:translate-y-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-700">Étudiants suspects</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-rose-600">
                {suspiciousStudents.length}
              </p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-rose-700/80">
            {relevantGrades.length > 0
              ? `${Math.round((suspiciousStudents.length / relevantGrades.length) * 100)}% des copies soumises`
              : 'Aucune copie soumise'}
          </p>
        </Card>
      </div>

      {suspiciousStudents.length > 0 && (
        <Card padding="lg" className="mb-6 border-rose-200 bg-gradient-to-br from-white to-rose-50/40 hover:translate-y-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-ink">
                  Étudiants suspects
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {suspiciousStudents.length} étudiant(s) avec au moins une infraction
                </p>
              </div>
            </div>
            <span className="w-fit rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-bold text-rose-700">
              Surveillance requise
            </span>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {suspiciousStudents.map((student) => (
              <div
                key={student.key}
                className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">{student.studentName}</p>
                    <p className="mt-0.5 text-xs text-muted">{student.studentEmail}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <p className="text-xs font-semibold text-ink">{student.examTitle}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700">
                    {student.violations.length} inf.
                  </span>
                </div>
                <div className="mt-4 space-y-2 border-t border-rose-100 pt-3">
                  {student.violations.map((violation) => (
                    <div key={violation.id} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                      <div>
                        <p className="text-xs leading-5 text-slate-700">{violation.reason}</p>
                        <p className="mt-0.5 text-[10px] text-muted">
                          {formatViolationDate(violation.detectedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card padding="lg" className="mb-6 hover:translate-y-0">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-ink">Distribution des notes</h2>
            <p className="mt-1 text-xs text-muted">Nombre de copies par tranche de notes, sur 20.</p>
          </div>
          <span className="mt-2 w-fit rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-primary sm:mt-0">
            {relevantGrades.length} copie(s)
          </span>
        </div>
        {relevantGrades.length === 0 ? (
          <p className="mt-5 rounded-lg bg-canvas p-4 text-sm text-muted">
            {loading ? 'Chargement des résultats...' : 'Aucune note disponible pour cet examen.'}
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-4 gap-3 sm:gap-6" role="img" aria-label="Distribution des notes">
            {distribution.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-ink">{item.count}</span>
                <div className="flex h-32 w-full items-end rounded-t-lg bg-canvas px-2">
                  <m.div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary to-sky"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, (item.count / maxCount) * 100)}%` }}
                    transition={{ duration: 0.55, delay: 0.08 }}
                  />
                </div>
                <span className="text-[11px] font-medium text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card padding="lg" className="hover:translate-y-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-ink">Résultats détaillés</h2>
            <p className="mt-1 text-xs text-muted">Filtrer et consulter chaque copie soumise.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(240px,0.8fr)]">
          <Input
            label="Rechercher"
            placeholder="Nom d’étudiant ou examen…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            leadingIcon={<Search className="h-4 w-4" />}
          />
          <SelectField
            id="result-exam"
            label="Examen"
            value={examId}
            onChange={setExamId}
            options={[
              { value: 'all', label: 'Tous les examens' },
              ...exams.map((exam) => ({ value: exam.id, label: exam.title })),
            ]}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          <span>
            {visibleResults.length} résultat{visibleResults.length > 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={() => setSortDescending((value) => !value)}
            className="font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            Trier la note {sortDescending ? 'décroissante' : 'croissante'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Chargement des résultats...
          </div>
        ) : visibleResults.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={BarChart3}
              title="Aucun résultat disponible"
              description="Les résultats et rapports anti-triche apparaîtront dès qu'un étudiant aura terminé un examen."
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-y border-line text-[11px] font-bold uppercase tracking-wide text-muted">
                  <th scope="col" className="py-3 pr-4">Étudiant</th>
                  <th scope="col" className="px-3 py-3">Examen</th>
                  <th scope="col" className="px-3 py-3">Note</th>
                  <th scope="col" className="px-3 py-3">Surveillance & Intégrité</th>
                  <th scope="col" className="px-3 py-3">Date</th>
                  <th scope="col" className="px-3 py-3 text-right">Rapport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visibleResults.map((result, index) => {
                  const integrityScore = result.integrityScore ?? 100
                  const isClean = integrityScore >= 85
                  const isSuspicious = integrityScore < 85 && integrityScore >= 50

                  return (
                    <m.tr
                      key={result.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: index * 0.035 }}
                      className="transition-colors hover:bg-sky-50/60"
                    >
                      <td className="py-4 pr-4">
                        <span className="block text-sm font-semibold text-ink">{result.studentName}</span>
                        <span className="text-xs text-muted">{result.studentEmail}</span>
                      </td>
                      <td className="max-w-[220px] truncate px-3 py-4 text-sm text-muted">
                        {result.examTitle}
                      </td>
                      <td className="px-3 py-4 text-sm font-bold text-ink">
                        {((result.score / 100) * 20).toFixed(1)}/20
                        <span className="block text-xs font-normal text-muted">({result.score.toFixed(1)}%)</span>
                      </td>
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedAttempt(result)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition hover:scale-105 ${
                            isClean
                              ? 'bg-emerald-50 text-emerald-700'
                              : isSuspicious
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800 font-bold'
                          }`}
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          {integrityScore}%
                          {(result.violationCount ?? 0) > 0 && ` (${result.violationCount} inf.)`}
                        </button>
                      </td>
                      <td className="px-3 py-4 text-xs text-muted">
                        {result.submittedAt
                          ? new Intl.DateTimeFormat('fr-FR', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(new Date(result.submittedAt.replace(' ', 'T')))
                          : '—'}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAttempt(result)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition hover:border-primary hover:text-primary shadow-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Détails triche
                        </button>
                      </td>
                    </m.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal détaillé avec le type d'infraction et logs */}
      <CheatingReportModal
        attempt={selectedAttempt}
        onClose={() => setSelectedAttempt(null)}
      />
    </>
  )
}

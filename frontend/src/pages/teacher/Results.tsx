import { useMemo, useState } from 'react'
import { m } from 'framer-motion'
import { BarChart3, Search } from 'lucide-react'
import { useTeacherData } from '../../data/useTeacherData'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { PageHeader, SelectField } from './shared'

const bins = [
  { label: '0–5', min: 0, max: 5 },
  { label: '5–10', min: 5, max: 10 },
  { label: '10–15', min: 10, max: 15 },
  { label: '15–20', min: 15, max: 20.01 },
]

export function Results() {
  const { exams, results } = useTeacherData()
  const [examId, setExamId] = useState('all')
  const [search, setSearch] = useState('')
  const [sortDescending, setSortDescending] = useState(true)
  const relevantResults = useMemo(() => results.filter((result) => examId === 'all' || result.examId === examId), [results, examId])
  const visibleResults = useMemo(() => relevantResults
    .filter((result) => `${result.studentName} ${result.examTitle}`.toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr')))
    .sort((a, b) => {
      if (a.score === null) return 1
      if (b.score === null) return -1
      return sortDescending ? b.score - a.score : a.score - b.score
    }), [relevantResults, search, sortDescending])
  const graded = relevantResults.filter((result) => result.score !== null)
  const distribution = bins.map((bin) => ({
    ...bin,
    count: graded.filter((result) => (result.score ?? 0) >= bin.min && (result.score ?? 0) < bin.max).length,
  }))
  const maxCount = Math.max(1, ...distribution.map((item) => item.count))
  const average = graded.length ? graded.reduce((sum, result) => sum + (result.score ?? 0), 0) / graded.length : null

  return (
    <>
      <PageHeader
        eyebrow="Évaluation des acquis"
        title="Résultats & notes"
        description="Analysez les notes et l’état des tentatives par examen."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><p className="text-xs font-medium text-muted">Copies corrigées</p><p className="mt-2 text-2xl font-bold text-ink">{graded.length}</p></Card>
        <Card><p className="text-xs font-medium text-muted">Moyenne des notes</p><p className="mt-2 text-2xl font-bold text-ink">{average === null ? '—' : `${average.toFixed(1)}/20`}</p></Card>
        <Card><p className="text-xs font-medium text-muted">Tentatives non corrigées</p><p className="mt-2 text-2xl font-bold text-ink">{relevantResults.filter((result) => result.status === 'in-progress').length}</p></Card>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold text-ink">Distribution des notes</h2>
          <p className="text-xs text-muted">Nombre de copies corrigées par tranche, sur 20.</p>
        </div>
        {graded.length === 0 ? (
          <p className="mt-5 rounded-lg bg-canvas p-4 text-sm text-muted">Aucune note disponible pour l’examen sélectionné.</p>
        ) : (
          <div className="mt-6 grid grid-cols-4 gap-3 sm:gap-6" role="img" aria-label="Distribution des notes par tranche">
            {distribution.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-ink">{item.count}</span>
                <div className="flex h-32 w-full items-end rounded-t-lg bg-canvas px-2">
                  <m.div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary to-sky"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, item.count / maxCount * 100)}%` }}
                    transition={{ duration: 0.55, delay: 0.08 }}
                  />
                </div>
                <span className="text-[11px] font-medium text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(240px,0.8fr)]">
          <Input label="Rechercher" placeholder="Nom d’étudiant ou examen…" value={search} onChange={(event) => setSearch(event.target.value)} leadingIcon={<Search className="h-4 w-4" />} />
          <SelectField id="result-exam" label="Examen" value={examId} onChange={setExamId} options={[{ value: 'all', label: 'Tous les examens' }, ...exams.map((exam) => ({ value: exam.id, label: exam.title }))]} />
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted"><span>{visibleResults.length} résultat{visibleResults.length > 1 ? 's' : ''}</span><button type="button" onClick={() => setSortDescending((value) => !value)} className="font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">Trier la note {sortDescending ? 'décroissante' : 'croissante'}</button></div>
        {visibleResults.length === 0 ? (
          <div className="mt-4"><EmptyState icon={BarChart3} title="Aucun résultat disponible" description="Les résultats apparaîtront ici lorsque des étudiants auront passé un examen." /></div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead><tr className="border-y border-line text-[11px] font-bold uppercase tracking-wide text-muted"><th scope="col" className="py-3 pr-4">Étudiant</th><th scope="col" className="px-3 py-3">Examen</th><th scope="col" className="px-3 py-3">Note</th><th scope="col" className="px-3 py-3">Statut</th><th scope="col" className="px-3 py-3">Soumis le</th></tr></thead>
              <tbody className="divide-y divide-line">
                {visibleResults.map((result, index) => (
                  <m.tr
                    key={result.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: index * 0.035 }}
                    className="transition-colors hover:bg-sky-50/60"
                  >
                    <td className="py-4 pr-4"><span className="block text-sm font-semibold text-ink">{result.studentName}</span><span className="text-xs text-muted">{result.studentEmail}</span></td>
                    <td className="max-w-[240px] truncate px-3 py-4 text-sm text-muted">{result.examTitle}</td>
                    <td className="px-3 py-4 text-sm font-bold text-ink">{result.score === null ? '—' : `${result.score}/20`}</td>
                    <td className="px-3 py-4"><Badge status={result.status} /></td>
                    <td className="px-3 py-4 text-xs text-muted">{result.submittedAt ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(result.submittedAt)) : '—'}</td>
                  </m.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}

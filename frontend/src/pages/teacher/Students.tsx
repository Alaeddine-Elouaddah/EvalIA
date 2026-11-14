import { useMemo, useState } from 'react'
import { m } from 'framer-motion'
import { Search, UsersRound } from 'lucide-react'
import { useTeacherData } from '../../data/useTeacherData'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { PageHeader } from './shared'

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function Students() {
  const { students, results } = useTeacherData()
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('all')
  const groups = [...new Set(students.map((student) => student.group))]
  const studentRows = useMemo(() => students.map((student) => {
    const graded = results.filter((result) => result.studentId === student.id && result.score !== null)
    const allAttempts = results.filter((result) => result.studentId === student.id)
    const average = graded.length ? graded.reduce((sum, result) => sum + (result.score ?? 0), 0) / graded.length : null
    return { ...student, attempts: allAttempts.length, average }
  }).filter((student) => {
    const matchesText = `${student.name} ${student.email}`.toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr'))
    return matchesText && (group === 'all' || student.group === group)
  }).sort((a, b) => a.name.localeCompare(b.name, 'fr')), [students, results, search, group])

  return (
    <>
      <PageHeader
        eyebrow="Suivi pédagogique"
        title="Étudiants"
        description="Consultez les étudiants associés aux évaluations et leur activité."
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_240px]">
          <Input label="Rechercher un étudiant" placeholder="Nom ou adresse e-mail…" value={search} onChange={(event) => setSearch(event.target.value)} leadingIcon={<Search className="h-4 w-4" />} />
          <div className="space-y-1.5">
            <label htmlFor="student-group" className="block text-sm font-medium text-ink">Groupe</label>
            <select id="student-group" value={group} onChange={(event) => setGroup(event.target.value)} className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
              <option value="all">Tous les groupes</option>
              {groups.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted" aria-live="polite">{studentRows.length} étudiant{studentRows.length > 1 ? 's' : ''}</p>
        {studentRows.length === 0 ? (
          <div className="mt-4"><EmptyState icon={UsersRound} title="Aucun étudiant trouvé" description="Modifiez votre recherche ou le groupe sélectionné." /></div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead><tr className="border-y border-line text-[11px] font-bold uppercase tracking-wide text-muted">
                <th scope="col" className="py-3 pr-4">Étudiant</th><th scope="col" className="px-3 py-3">Groupe</th><th scope="col" className="px-3 py-3">Tentatives</th><th scope="col" className="px-3 py-3">Moyenne</th><th scope="col" className="px-3 py-3">Activité</th>
              </tr></thead>
              <tbody className="divide-y divide-line">
                {studentRows.map((student, index) => (
                  <m.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: index * 0.035 }}
                    className="transition-colors hover:bg-sky-50/60"
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary">{initials(student.name)}</span>
                        <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink">{student.name}</span><span className="block truncate text-xs text-muted">{student.email}</span></span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-muted">{student.group}</td>
                    <td className="px-3 py-4 text-sm text-ink">{student.attempts}</td>
                    <td className="px-3 py-4 text-sm font-semibold text-ink">{student.average === null ? '—' : `${student.average.toFixed(1)}/20`}</td>
                    <td className="px-3 py-4"><Badge status={student.attempts ? 'success' : 'warning'}>{student.attempts ? 'A participé' : 'Aucune tentative'}</Badge></td>
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

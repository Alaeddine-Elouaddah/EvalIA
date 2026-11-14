import { useMemo, useState } from 'react'
import { ArrowDownUp, Clock3, Copy, Eye, KeyRound, Pencil, Plus, Search, ShieldOff, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTeacherData } from '../../data/useTeacherData'
import { programGroups } from '../../data/programs.js'
import type { ExamStatus, TeacherExam } from '../../types/teacher'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { PageHeader, SelectField } from './shared'
import { formatDate } from './utils'

type Filter = 'all' | ExamStatus

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'finished', label: 'Terminé' },
]

function getTargetLabels(exam: TeacherExam) {
  return programGroups.flatMap((group) => group.programs)
    .filter((program) => exam.targets?.includes(program.id))
    .map((program) => program.label)
}

export function Exams() {
  const { exams, deleteExam, duplicateExam, regenerateExamCode, setAccessEnabled } = useTeacherData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [programFilter, setProgramFilter] = useState('all')
  const [selected, setSelected] = useState<TeacherExam | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TeacherExam | null>(null)
  const [codeTarget, setCodeTarget] = useState<TeacherExam | null>(null)
  const [accessTarget, setAccessTarget] = useState<TeacherExam | null>(null)
  const [actionError, setActionError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const allPrograms = programGroups.flatMap((group) => group.programs.map((program) => ({ value: program.id, label: program.label })))
  const filtered = useMemo(() => exams.filter((exam) => {
    const targetLabels = getTargetLabels(exam).join(' ')
    const matchesSearch = `${exam.title} ${exam.subject} ${targetLabels}`.toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr'))
    const matchesProgram = programFilter === 'all' || exam.targets?.includes(programFilter)
    return matchesSearch && matchesProgram && (filter === 'all' || exam.status === filter)
  }), [exams, filter, programFilter, search])

  function editExam(exam: TeacherExam) {
    navigate(`/teacher/exams/create?id=${encodeURIComponent(exam.id)}`)
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopyStatus('Code copié.')
    } catch {
      setCopyStatus('Impossible de copier le code automatiquement.')
    }
  }

  async function confirmRegenerateCode() {
    if (!codeTarget) return
    try {
      await regenerateExamCode(codeTarget.id)
      setCodeTarget(null)
      setActionError('')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Impossible de régénérer le code.')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Évaluations"
        title="Mes examens"
        description="Retrouve tes examens, leurs codes d’accès et les publics concernés."
        action={<Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/teacher/exams/create')}>Créer un examen</Button>}
      />

      <Card>
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(190px,0.65fr)]">
          <Input label="Rechercher un examen" placeholder="Titre, matière ou filière…" value={search} onChange={(event) => setSearch(event.target.value)} leadingIcon={<Search className="h-4 w-4" />} />
          <SelectField id="exam-program-filter" label="Filtrer par filière" value={programFilter} onChange={setProgramFilter} options={[{ value: 'all', label: 'Toutes les filières' }, ...allPrograms]} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 rounded-lg bg-canvas p-1" role="group" aria-label="Filtrer par statut">
            {filters.map((item) => (
              <button
                type="button"
                key={item.value}
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
                className={`min-h-9 rounded-md px-3 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${filter === item.value ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-ink'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted" aria-live="polite">{filtered.length} examen{filtered.length > 1 ? 's' : ''}</p>
        </div>

        {actionError && <p role="alert" className="mt-3 rounded-lg border border-danger-line bg-danger-soft p-3 text-sm text-danger">{actionError}</p>}
        {copyStatus && <p role="status" className="mt-3 text-xs text-muted">{copyStatus}</p>}

        {filtered.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Search}
              title={exams.length ? 'Aucun résultat' : 'Aucun examen pour le moment'}
              description={exams.length ? 'Modifie la recherche ou le filtre sélectionné.' : 'Crée un examen pour le retrouver ici.'}
              actionLabel={exams.length ? undefined : 'Créer un examen'}
              onAction={exams.length ? undefined : () => navigate('/teacher/exams/create')}
            />
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="border-y border-line text-[11px] font-bold uppercase tracking-wide text-muted">
                  <th scope="col" className="py-3 pr-4">Examen</th>
                  <th scope="col" className="px-3 py-3">Public</th>
                  <th scope="col" className="px-3 py-3">Questions</th>
                  <th scope="col" className="px-3 py-3">Durée</th>
                  <th scope="col" className="px-3 py-3"><span className="inline-flex items-center gap-1"><ArrowDownUp className="h-3 w-3" /> Ouverture</span></th>
                  <th scope="col" className="px-3 py-3">Statut</th>
                  <th scope="col" className="px-3 py-3">Code</th>
                  <th scope="col" className="px-3 py-3">Participants</th>
                  <th scope="col" className="py-3 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((exam) => (
                  <tr key={exam.id} className="group transition hover:bg-canvas/70">
                    <td className="py-4 pr-4">
                      <p className="max-w-[220px] truncate text-sm font-semibold text-ink">{exam.title}</p>
                      <p className="mt-1 text-xs text-muted">{exam.subject} · {exam.mode === 'ai' ? 'Généré avec IA' : 'Création manuelle'}</p>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex max-w-[190px] flex-wrap gap-1">
                        {getTargetLabels(exam).slice(0, 2).map((label) => <Badge key={label} status="info">{label}</Badge>)}
                        {(exam.targets?.length ?? 0) > 2 && <Badge status="info">+{(exam.targets?.length ?? 0) - 2}</Badge>}
                        {!exam.targets?.length && <span className="text-xs text-muted">Non défini</span>}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-ink">{exam.questions.length}</td>
                    <td className="px-3 py-4 text-sm text-ink"><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-muted" />{exam.durationMinutes} min</span></td>
                    <td className="px-3 py-4 text-sm text-muted">{formatDate(exam.date)}{exam.openTime ? <span className="block text-xs">à {exam.openTime}</span> : null}</td>
                    <td className="px-3 py-4"><Badge status={exam.status} /></td>
                    <td className="px-3 py-4">
                      {exam.accessCode ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono text-xs font-bold tracking-wider ${exam.accessEnabled ? 'text-ink' : 'text-muted line-through'}`}>{exam.accessCode}</span>
                          <button type="button" onClick={() => copyCode(exam.accessCode!)} aria-label={`Copier le code ${exam.accessCode}`} title="Copier le code" className="rounded p-1 text-muted hover:bg-primary-50 hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
                          {!exam.accessEnabled && <span className="text-[10px] text-danger">Désactivé</span>}
                        </div>
                      ) : <span className="text-xs text-muted">À la publication</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-muted">{exam.participants}</td>
                    <td className="py-4 pl-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setSelected(exam)} aria-label={`Voir ${exam.title}`} title="Voir" className="rounded-lg p-2 text-muted transition hover:bg-primary-50 hover:text-primary"><Eye className="h-4 w-4" /></button>
                        <button type="button" onClick={() => editExam(exam)} aria-label={`Modifier ${exam.title}`} title="Modifier" className="rounded-lg p-2 text-muted transition hover:bg-primary-50 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                        <button type="button" onClick={() => duplicateExam(exam.id)} aria-label={`Dupliquer ${exam.title}`} title="Dupliquer" className="rounded-lg p-2 text-muted transition hover:bg-primary-50 hover:text-primary"><Copy className="h-4 w-4" /></button>
                        {exam.accessCode && exam.status === 'published' && (
                          <>
                            <button type="button" onClick={() => { setCodeTarget(exam); setActionError('') }} aria-label={`Régénérer le code de ${exam.title}`} title="Régénérer le code" className="rounded-lg p-2 text-muted transition hover:bg-accent-soft hover:text-accent-strong"><KeyRound className="h-4 w-4" /></button>
                            <button type="button" onClick={() => exam.accessEnabled ? setAccessTarget(exam) : setAccessEnabled(exam.id, true)} aria-label={exam.accessEnabled ? `Désactiver l’accès à ${exam.title}` : `Réactiver l’accès à ${exam.title}`} title={exam.accessEnabled ? 'Désactiver l’accès' : 'Réactiver l’accès'} className="rounded-lg p-2 text-muted transition hover:bg-danger-soft hover:text-danger"><ShieldOff className="h-4 w-4" /></button>
                          </>
                        )}
                        <button type="button" onClick={() => setDeleteTarget(exam)} aria-label={`Supprimer ${exam.title}`} title="Supprimer" className="rounded-lg p-2 text-muted transition hover:bg-danger-soft hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? 'Détails de l’examen'} description={selected ? `${selected.subject} · ${formatDate(selected.date)} à ${selected.openTime ?? '09:00'}` : undefined} footer={<Button variant="secondary" onClick={() => setSelected(null)}>Fermer</Button>}>
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3"><Badge status={selected.status} /><span className="text-sm text-muted">{selected.durationMinutes} min · {selected.participants} participants · {selected.language === 'en' ? 'English' : 'Français'}</span></div>
            <div className="flex flex-wrap gap-1">{getTargetLabels(selected).map((label) => <Badge key={label} status="info">{label}</Badge>)}</div>
            <h3 className="text-sm font-bold text-ink">Questions ({selected.questions.length})</h3>
            <ol className="list-decimal space-y-3 pl-5 text-sm text-muted">{selected.questions.map((question) => <li key={question.id} className="pl-1 leading-6">{question.text}</li>)}</ol>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(codeTarget)} onClose={() => setCodeTarget(null)} title="Régénérer le code d’accès ?" description="L’ancien code cessera immédiatement de fonctionner." footer={<><Button variant="secondary" onClick={() => setCodeTarget(null)}>Annuler</Button><Button onClick={confirmRegenerateCode}>Régénérer le code</Button></>}>
        <p className="text-sm text-muted">Un nouveau code unique sera créé pour « {codeTarget?.title} ».</p>
      </Modal>

      <Modal open={Boolean(accessTarget)} onClose={() => setAccessTarget(null)} title="Désactiver l’accès ?" description="Les étudiants ne pourront plus rejoindre cet examen avec son code." footer={<><Button variant="secondary" onClick={() => setAccessTarget(null)}>Annuler</Button><Button variant="danger" onClick={() => { if (accessTarget) setAccessEnabled(accessTarget.id, false); setAccessTarget(null) }}>Désactiver l’accès</Button></>}>
        <p className="text-sm text-muted">Tu pourras réactiver l’accès plus tard.</p>
      </Modal>

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Supprimer cet examen ?" description="Cette action supprimera l’examen des données de démonstration." footer={<><Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button><Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => { if (deleteTarget) deleteExam(deleteTarget.id); setDeleteTarget(null) }}>Supprimer</Button></>}>
        <p className="text-sm text-muted">{deleteTarget?.title}</p>
      </Modal>
    </>
  )
}

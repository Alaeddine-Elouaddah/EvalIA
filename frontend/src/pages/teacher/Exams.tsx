import { useMemo, useState } from 'react'
import { m } from 'framer-motion'
import { ArrowDownUp, Clock3, Copy, Download, Eye, KeyRound, Pencil, Plus, Search, ShieldOff, Trash2 } from 'lucide-react'
import { jsPDF } from 'jspdf'
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
import { Toast } from '../../components/ui/Toast'
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
  const [pendingAction, setPendingAction] = useState<string | null>(null)
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

  function errorMessage(error: unknown, fallback: string) {
    return error instanceof Error && error.message ? error.message : fallback
  }

  async function runAction(key: string, action: () => Promise<void>, fallback: string): Promise<boolean> {
    setPendingAction(key)
    setActionError('')
    try {
      await action()
      return true
    } catch (error) {
      setActionError(errorMessage(error, fallback))
      return false
    } finally {
      setPendingAction(null)
    }
  }

  async function confirmRegenerateCode() {
    if (!codeTarget) return
    const target = codeTarget
    const success = await runAction('code', () => regenerateExamCode(target.id).then(() => undefined), 'Impossible de régénérer le code.')
    if (success) setCodeTarget(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    const success = await runAction('delete', () => deleteExam(target.id), "Impossible de supprimer l'examen.")
    if (success) setDeleteTarget(null)
  }

  async function updateAccess(target: TeacherExam, enabled: boolean) {
    const success = await runAction('access', () => setAccessEnabled(target.id, enabled), "Impossible de modifier l'accès à l'examen.")
    if (success) setAccessTarget(null)
  }

  async function duplicate(exam: TeacherExam) {
    await runAction('duplicate', () => duplicateExam(exam.id), "Impossible de dupliquer l'examen.")
  }

  function exportExamPdf(exam: TeacherExam) {
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 42
    const contentWidth = pageWidth - margin * 2
    let y = 42

    const ensureSpace = (height: number) => {
      if (y + height > pageHeight - 42) {
        pdf.addPage()
        y = 42
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)
        pdf.setTextColor(100)
        pdf.text('Suite de l’examen', margin, y)
        y += 24
        pdf.setTextColor(30)
      }
    }

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(19)
    pdf.setTextColor(25, 42, 82)
    pdf.text('EVALIA - ENSIASD', margin, y)
    y += 26

    pdf.setFontSize(15)
    pdf.text(exam.title, margin, y)
    y += 22

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(70)
    pdf.text(`Matière : ${exam.subject || 'Non renseignée'}`, margin, y)
    pdf.text(`Durée : ${exam.durationMinutes} minutes`, margin + contentWidth - 130, y)
    y += 17
    pdf.text(`Date : ${formatDate(exam.date)}${exam.openTime ? ` à ${exam.openTime}` : ''}`, margin, y)
    pdf.text(`Code : ${exam.accessCode ?? 'Sans code'}`, margin + contentWidth - 130, y)
    y += 19

    pdf.setDrawColor(190, 198, 210)
    pdf.line(margin, y, pageWidth - margin, y)
    y += 18

    pdf.setTextColor(30)
    pdf.setFontSize(10)
    pdf.text('Nom : ______________________________________', margin, y)
    pdf.text('Prénom : ___________________________________', margin + contentWidth / 2, y)
    y += 22
    pdf.text('Filière / Groupe : __________________________', margin, y)
    pdf.text('Code étudiant : _____________________________', margin + contentWidth / 2, y)
    y += 28

    exam.questions.forEach((question, questionIndex) => {
      ensureSpace(100)

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(11)
      pdf.setTextColor(30)
      const questionLines = pdf.splitTextToSize(
        `${questionIndex + 1}. ${question.text}`,
        contentWidth,
      )
      pdf.text(questionLines, margin, y)
      y += questionLines.length * 14 + 8

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      question.options.forEach((option, optionIndex) => {
        ensureSpace(32)
        const checkboxX = margin + 2
        const checkboxY = y - 8
        pdf.setDrawColor(80)
        pdf.rect(checkboxX, checkboxY, 10, 10)

        const optionLetter = String.fromCharCode(65 + optionIndex)
        const optionLines = pdf.splitTextToSize(
          `${optionLetter}. ${option.text}`,
          contentWidth - 28,
        )
        pdf.text(optionLines, margin + 20, y)
        y += Math.max(17, optionLines.length * 13 + 4)
      })
      y += 10
    })

    ensureSpace(60)
    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(9)
    pdf.setTextColor(100)
    pdf.text('Fin de l’examen', margin, y)

    const safeTitle = exam.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
    pdf.save(`evalia-${safeTitle || 'examen'}-imprimable.pdf`)
  }

  const isBusy = pendingAction !== null

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
        {copyStatus && <div className="fixed bottom-5 right-5 z-[90] w-[min(24rem,calc(100vw-2.5rem))]"><Toast message={copyStatus} onClose={() => setCopyStatus('')} /></div>}

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
                  <th scope="col" className="w-[210px] px-3 py-3">Public</th>
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
                {filtered.map((exam, index) => (
                  <m.tr
                    key={exam.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: index * 0.035 }}
                    className="group transition-colors duration-150 hover:bg-sky-50/60"
                  >
                    <td className="py-4 pr-4">
                      <p className="max-w-[220px] truncate text-sm font-semibold text-ink">{exam.title}</p>
                      <p className="mt-1 text-xs text-muted">{exam.subject} · {exam.mode === 'ai' ? 'Généré avec IA' : 'Création manuelle'}</p>
                    </td>
                    <td className="w-[210px] px-3 py-4">
                      <div className="flex max-w-[190px] flex-wrap gap-1">
                        {getTargetLabels(exam).slice(0, 2).map((label) => <Badge key={label} status="info" title={label} className="max-w-full truncate whitespace-nowrap">{label}</Badge>)}
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
                          <button type="button" onClick={() => copyCode(exam.accessCode!)} aria-label={`Copier le code ${exam.accessCode}`} title="Copier le code" className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted transition hover:bg-primary-50 hover:text-primary"><Copy className="h-4 w-4" /></button>
                          {!exam.accessEnabled && <span className="text-[10px] text-danger">Désactivé</span>}
                        </div>
                      ) : <span className="text-xs text-muted">À la publication</span>}
                    </td>
                    <td className="px-3 py-4 text-sm text-muted">{exam.participants}</td>
                    <td className="py-4 pl-3">
                      <div className="flex justify-end gap-1 transition-opacity sm:opacity-55 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        <button type="button" onClick={() => setSelected(exam)} aria-label={`Voir ${exam.title}`} title="Voir" className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted transition hover:bg-primary-50 hover:text-primary"><Eye className="h-4 w-4" /></button>
                        <button type="button" onClick={() => editExam(exam)} aria-label={`Modifier ${exam.title}`} title="Modifier" className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted transition hover:bg-primary-50 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                        <button
                          type="button"
                          onClick={() => exportExamPdf(exam)}
                          aria-label={`Exporter ${exam.title} en PDF imprimable`}
                          title="Exporter PDF imprimable"
                          disabled={exam.questions.length === 0}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted transition hover:bg-primary-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button type="button" disabled={isBusy} onClick={() => void duplicate(exam)} aria-label={`Dupliquer ${exam.title}`} title="Dupliquer" className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted transition hover:bg-primary-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"><Copy className="h-4 w-4" /></button>
                        {exam.accessCode && exam.status === 'published' && (
                          <>
                            <button type="button" disabled={isBusy} onClick={() => { setCodeTarget(exam); setActionError('') }} aria-label={`Régénérer le code de ${exam.title}`} title="Régénérer le code" className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted transition hover:bg-accent-soft hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-40"><KeyRound className="h-4 w-4" /></button>
                            <button type="button" disabled={isBusy} onClick={() => { if (exam.accessEnabled) { setAccessTarget(exam); setActionError('') } else { void updateAccess(exam, true) } }} aria-label={exam.accessEnabled ? `Désactiver l’accès à ${exam.title}` : `Réactiver l’accès à ${exam.title}`} title={exam.accessEnabled ? 'Désactiver l’accès' : 'Réactiver l’accès'} className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted transition hover:bg-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"><ShieldOff className="h-4 w-4" /></button>
                          </>
                        )}
                        <button type="button" disabled={isBusy} onClick={() => { setDeleteTarget(exam); setActionError('') }} aria-label={`Supprimer ${exam.title}`} title="Supprimer" className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted transition hover:bg-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </m.tr>
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

      <Modal open={Boolean(codeTarget)} onClose={() => setCodeTarget(null)} title="Régénérer le code d’accès ?" description="L’ancien code cessera immédiatement de fonctionner." footer={<><Button variant="secondary" disabled={isBusy} onClick={() => setCodeTarget(null)}>Annuler</Button><Button loading={pendingAction === 'code'} disabled={isBusy} onClick={() => void confirmRegenerateCode()}>Régénérer le code</Button></>}>
        <p className="text-sm text-muted">Un nouveau code unique sera créé pour « {codeTarget?.title} ».</p>
      </Modal>

      <Modal open={Boolean(accessTarget)} onClose={() => setAccessTarget(null)} title="Désactiver l’accès ?" description="Les étudiants ne pourront plus rejoindre cet examen avec son code." footer={<><Button variant="secondary" disabled={isBusy} onClick={() => setAccessTarget(null)}>Annuler</Button><Button variant="danger" loading={pendingAction === 'access'} disabled={isBusy} onClick={() => { if (accessTarget) void updateAccess(accessTarget, false) }}>Désactiver l’accès</Button></>}>
        <p className="text-sm text-muted">Tu pourras réactiver l’accès plus tard.</p>
      </Modal>

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Supprimer cet examen ?" description="Cette action supprimera définitivement cet examen, ses questions et les tentatives associées." footer={<><Button variant="secondary" disabled={isBusy} onClick={() => setDeleteTarget(null)}>Annuler</Button><Button variant="danger" icon={<Trash2 className="h-4 w-4" />} loading={pendingAction === 'delete'} disabled={isBusy} onClick={() => void confirmDelete()}>Supprimer</Button></>}>
        <p className="text-sm text-muted">{deleteTarget?.title}</p>
      </Modal>
    </>
  )
}

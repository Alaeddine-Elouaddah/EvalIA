import { Activity, ArrowRight, BookOpenCheck, CalendarDays, ClipboardList, GraduationCap, Plus, Sparkles, UsersRound } from 'lucide-react'
import { m } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTeacherData } from '../../data/useTeacherData'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatCard } from '../../components/ui/StatCard'
import { PageHeader, SectionTitle } from './shared'
import { formatDate } from './utils'

export function Dashboard() {
  const navigate = useNavigate()
  const { exams, students, results } = useTeacherData()
  const graded = results.filter((result) => result.score !== null)
  const average = graded.length
    ? (graded.reduce((total, result) => total + (result.score ?? 0), 0) / graded.length).toFixed(1)
    : '—'
  const recentExams = [...exams].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)
  const activeExams = exams.filter((exam) => exam.status === 'published').length

  return (
    <>
      <PageHeader
        eyebrow="Vue d’ensemble"
        title="Tableau de bord"
        description="Retrouvez les indicateurs clés et les activités récentes de votre espace enseignant."
      />

      <section aria-label="Indicateurs clés" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Examens créés" value={exams.length} detail="Dans votre espace" icon={ClipboardList} />
        <StatCard label="Étudiants" value={students.length} detail="Inscrits aux évaluations" icon={UsersRound} tone="info" />
        <StatCard label="Moyenne générale" value={average === '—' ? average : `${average}/20`} detail="Sur les copies corrigées" icon={Activity} tone="success" />
        <StatCard label="Examens en cours" value={activeExams} detail="Publiés et accessibles" icon={CalendarDays} tone="accent" />
      </section>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
        <Card>
          <SectionTitle
            title="Examens récents"
            description="Suivez l’état de vos dernières évaluations."
            icon={BookOpenCheck}
            action={<Link to="/teacher/exams" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Tout voir <ArrowRight className="h-3.5 w-3.5" /></Link>}
          />
          {recentExams.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Aucun examen pour le moment" description="Créez votre premier examen pour commencer à suivre les résultats." actionLabel="Créer un examen" onAction={() => navigate('/teacher/exams/create')} />
          ) : (
            <div>
              {recentExams.map((exam, index) => (
                <m.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: index * 0.04 }}
                  className="flex flex-col gap-3 border-b border-slate-100 py-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{exam.title}</p>
                    <p className="mt-1 text-xs text-muted">{exam.subject} <span aria-hidden="true">·</span> {exam.questions.length} questions <span aria-hidden="true">·</span> {formatDate(exam.date)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted">{exam.participants} participants</span>
                    <Badge status={exam.status} />
                  </div>
                </m.div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle title="Créer un examen" description="Choisissez votre méthode de création." icon={GraduationCap} />
          <div className="mt-5 space-y-3">
            <Link to="/teacher/exams/create" className="group flex items-center gap-3 rounded-xl border border-line p-4 transition hover:border-primary-200 hover:bg-primary-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary"><Plus className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink">Créer manuellement</span>
                <span className="mt-0.5 block text-xs text-muted">Rédigez chaque question vous-même.</span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
            <Link to="/teacher/ai-generator" className="group flex items-center gap-3 rounded-xl border border-line p-4 transition hover:border-accent/50 hover:bg-accent-soft/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent-strong"><Sparkles className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink">Avec l’IA</span>
                <span className="mt-0.5 block text-xs text-muted">Générez une première série à réviser.</span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          </div>
          <div className="mt-5 rounded-lg bg-canvas p-3 text-xs leading-5 text-muted">
            <div className="flex items-center gap-2 font-semibold text-ink"><Sparkles className="h-4 w-4 text-accent-strong" /> Espace de démonstration</div>
            Les chiffres affichés utilisent des données de démonstration.
          </div>
        </Card>
      </div>
    </>
  )
}

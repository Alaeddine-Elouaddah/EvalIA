import React from 'react'
import type { AppView, User } from '../types'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

interface HomePageProps {
  user: User | null
  onNavigate: (view: AppView) => void
}

const benefits = [
  {
    icon: FileText,
    title: 'À partir de vos cours',
    description: 'Transformez un support pédagogique en questions QCM prêtes à relire.',
    tone: 'bg-primary-50 text-primary',
  },
  {
    icon: ClipboardCheck,
    title: 'Des examens structurés',
    description: 'Organisez les évaluations par matière, niveau et filière ENSIASD.',
    tone: 'bg-sky-50 text-sky-700',
  },
  {
    icon: BookOpenCheck,
    title: 'Un parcours étudiant clair',
    description: 'Rejoignez une évaluation avec un code et consultez vos résultats.',
    tone: 'bg-success-soft text-success',
  },
]

export const HomePage: React.FC<HomePageProps> = ({ user, onNavigate }) => {
  return (
    <div className="space-y-20 pb-16">
      <section className="relative isolate overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br from-white via-sky-50 to-primary-50 px-6 py-10 shadow-panel sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="app-grid-pattern absolute inset-0" />
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl" />
          <div className="absolute -bottom-48 left-1/4 h-96 w-96 rounded-full bg-primary-200/30 blur-3xl" />
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="mb-6 inline-flex min-h-9 items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-primary shadow-sm">
              <GraduationCap className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Plateforme dédiée à l’ENSIASD
            </div>

            <h1 className="max-w-3xl text-[36px] font-bold leading-[1.08] tracking-[-0.05em] text-ink sm:text-5xl lg:text-[56px]">
              Les QCM de l’ENSIASD,
              <span className="mt-1 block bg-gradient-to-r from-primary-600 to-sky bg-clip-text text-transparent">
                plus simples pour tous.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted sm:text-base">
              EvalIA accompagne les professeurs dans la création de QCM et les étudiants dans leurs évaluations, au sein d’un espace conçu pour notre école.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <Button size="lg" icon={<ArrowRight className="h-4 w-4" />} onClick={() => onNavigate('generator')}>
                  Accéder à mon espace
                </Button>
              ) : (
                <>
                  <Button size="lg" className="whitespace-nowrap" icon={<ArrowRight className="h-4 w-4" />} onClick={() => onNavigate('register')}>
                    Créer un compte étudiant
                  </Button>
                  <Button size="lg" variant="secondary" className="whitespace-nowrap" onClick={() => onNavigate('login')}>
                    Se connecter
                  </Button>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[13px] font-medium text-muted">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                Professeurs et étudiants ENSIASD
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                Création assistée depuis un cours
              </span>
            </div>
          </div>

          <div aria-label="Aperçu d’une évaluation EvalIA" className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-sky-200/50 to-primary-100/60 blur-2xl" aria-hidden="true" />
            <Card className="relative p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                    <Brain className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">Évaluation interactive</p>
                    <p className="mt-0.5 text-xs text-subtle">Espace étudiant · ENSIASD</p>
                  </div>
                </div>
                <Badge status="success">En cours</Badge>
              </div>

              <div className="pt-5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-subtle">
                  <span>QUESTION 02</span>
                  <span>02 / 05</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sky-100">
                  <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-primary to-sky" />
                </div>
                <p className="mt-5 text-lg font-bold leading-7 tracking-tight text-ink">
                  Quel est l’objectif principal de cette notion ?
                </p>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center gap-3 rounded-xl border border-success-line bg-success-soft px-3.5 py-3 text-sm font-medium text-ink">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    <span>Organiser et relier les concepts clés</span>
                  </div>
                  <div className="rounded-xl border border-slate-200/70 bg-white/70 px-3.5 py-3 text-sm text-muted">
                    Mémoriser chaque détail sans contexte
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-info-line bg-info-soft/70 p-3.5">
                  <p className="text-xs font-bold text-primary">À retenir</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Une explication accompagne les réponses pour faciliter la compréhension.
                  </p>
                </div>
              </div>
            </Card>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-card backdrop-blur sm:flex">
              <Sparkles className="h-4 w-4 text-sky" strokeWidth={1.75} aria-hidden="true" />
              <span className="text-xs font-semibold text-muted">Pensée pour l’ENSIASD</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-1 sm:px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-primary">Une plateforme pour notre école</p>
          <h2 className="mt-3 text-[28px] font-bold tracking-[-0.04em] text-ink sm:text-4xl">
            De la préparation à l’évaluation
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            EvalIA réunit les outils essentiels aux professeurs et aux étudiants de l’ENSIASD.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description, tone }) => (
            <Card key={title} className="p-6 sm:p-7">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl overflow-hidden rounded-[24px] border border-primary-100 bg-white/75 shadow-card backdrop-blur-xl">
        <div className="grid items-center gap-7 p-6 sm:p-9 md:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Espace académique ENSIASD
            </div>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Une expérience d’évaluation adaptée à notre communauté.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Professeurs et étudiants retrouvent dans EvalIA un parcours dédié à la préparation, au passage et au suivi des QCM de l’école.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Badge status="info"><GraduationCap className="h-3.5 w-3.5" aria-hidden="true" /> ENSIASD</Badge>
            <Badge status="success"><UsersRound className="h-3.5 w-3.5" aria-hidden="true" /> Professeurs & étudiants</Badge>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 sm:px-9">
          <span className="text-xs font-medium text-subtle">EvalIA · Plateforme d’évaluation académique de l’ENSIASD</span>
          <button type="button" onClick={() => onNavigate(user ? 'generator' : 'login')} className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-primary transition hover:text-primary-700">
            {user ? 'Ouvrir mon espace' : 'Connexion'}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  )
}
